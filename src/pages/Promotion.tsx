import { useState, useEffect, useCallback, useRef, memo } from 'react'
import {
  Language,
  Translations,
  translations,
  detectLanguage,
  saveLanguagePreference,
  RTL_LANGUAGES,
} from '../utils/i18n'

// ─── 类型定义 ─────────────────────────────────────────────────
interface DomainStat {
  rank: number
  hostname: string
  traffic: number
  visits: number
  conversionRate: string
  bounceRate: string
  avgDuration: string
}

interface PromotionRecord {
  url: string
  hostname: string
  platform: string
  linkCount: number
  isSubdomain?: boolean
}

interface UploadedFile {
  id: string
  file: File
  preview?: string   // 图片预览 data URL
}

// 定时推送历史记录
interface PushRecord {
  id: string
  time: string      // HH:MM 格式
  url: string
  channels: number
  types: string[]   // 推广类型 id 列表
  success: boolean
}

// ─── 安全 ─────────────────────────────────────────────────────
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])
function isSafeUrl(raw: string): boolean {
  try { return ALLOWED_PROTOCOLS.has(new URL(raw).protocol) } catch { return false }
}
function sanitizeForAttr(v: string) {
  return v.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
          .replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

// ─── 确定性随机 ───────────────────────────────────────────────
function lcg(seed: number, n: number) { return ((seed*9301+49297*n)%233280)/233280 }
function generateDomainStat(hostname: string, rank: number, seed: number): DomainStat {
  return {
    rank, hostname,
    traffic: Math.floor(lcg(seed,1)*10000)+5000,
    visits: Math.floor(lcg(seed,2)*5000)+2000,
    conversionRate: (lcg(seed,3)*5+1).toFixed(1)+'%',
    bounceRate: (lcg(seed,4)*40+30).toFixed(1)+'%',
    avgDuration: `${Math.floor(lcg(seed,5)*3)+1}:${Math.floor(lcg(seed,6)*59).toString().padStart(2,'0')}`,
  }
}
function generatePromotionRecords(url:string,hostname:string,subdomains:string[],seed:number): PromotionRecord[] {
  const platforms=['百度','微信','微博','抖音','Google','Facebook']
  const linkCounts=[3567,4231,2890,5123,1245,2341]
  return [
    ...platforms.map((platform,i)=>({url,hostname,platform,linkCount:linkCounts[i],isSubdomain:false})),
    ...subdomains.map((s,i)=>({url:s,hostname:new URL(s).hostname,platform:'百度',linkCount:Math.floor(lcg(seed,100+i)*2000)+1000,isSubdomain:true})),
  ]
}

// ─── 工具函数：文件大小格式化 ─────────────────────────────────
function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB'
  if (bytes < 1024*1024*1024) return (bytes/1024/1024).toFixed(1) + ' MB'
  return (bytes/1024/1024/1024).toFixed(1) + ' GB'
}

// ─── 工具函数：根据文件类型返回图标 emoji ─────────────────────
function fileIcon(file: File): string {
  const t = file.type
  const n = file.name.toLowerCase()
  if (t.startsWith('image/')) return '🖼️'
  if (t.startsWith('video/')) return '🎬'
  if (t.startsWith('audio/')) return '🎵'
  if (t === 'application/pdf' || n.endsWith('.pdf')) return '📄'
  if (t.includes('word') || n.endsWith('.doc') || n.endsWith('.docx')) return '📝'
  if (t.includes('excel') || t.includes('spreadsheet') || n.endsWith('.xls') || n.endsWith('.xlsx') || n.endsWith('.csv')) return '📊'
  if (t.includes('powerpoint') || t.includes('presentation') || n.endsWith('.ppt') || n.endsWith('.pptx')) return '📊'
  if (t.includes('zip') || t.includes('compressed') || n.endsWith('.zip') || n.endsWith('.rar') || n.endsWith('.7z') || n.endsWith('.tar') || n.endsWith('.gz')) return '🗜️'
  if (t.includes('text') || n.endsWith('.txt') || n.endsWith('.md') || n.endsWith('.json') || n.endsWith('.xml') || n.endsWith('.yaml') || n.endsWith('.yml')) return '📃'
  if (n.endsWith('.js') || n.endsWith('.ts') || n.endsWith('.jsx') || n.endsWith('.tsx') || n.endsWith('.py') || n.endsWith('.java') || n.endsWith('.cpp') || n.endsWith('.c') || n.endsWith('.go') || n.endsWith('.rs')) return '💻'
  return '📁'
}

// ─── 常量 ─────────────────────────────────────────────────────
const LANGUAGES: Language[] = ['zh', 'en', 'fr', 'de', 'ja', 'ar']
const LANGUAGE_NAMES: Record<Language, string> = {
  zh:'中文', en:'English', fr:'Français', de:'Deutsch', ja:'日本語', ar:'العربية',
}

// ─── 子组件：统计行 ───────────────────────────────────────────
const DomainStatRow = memo(({stat,index}:{stat:DomainStat;index:number}) => (
  <tr className={index%2===0 ? 'bg-white/60' : 'bg-blue-50/60'}>
    <td className="px-3 py-3 font-black text-gray-600 text-center text-base">{stat.rank}</td>
    <td className="px-3 py-3 font-bold text-blue-600 break-all text-sm">{stat.hostname}</td>
    <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-bold text-base">{stat.traffic.toLocaleString()}</td>
    <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-bold text-base">{stat.visits.toLocaleString()}</td>
    <td className="px-3 py-3 text-emerald-600 font-black whitespace-nowrap text-base">{stat.conversionRate}</td>
    <td className="px-3 py-3 text-amber-500 font-black whitespace-nowrap text-base">{stat.bounceRate}</td>
    <td className="px-3 py-3 text-indigo-600 whitespace-nowrap font-black text-base">{stat.avgDuration}</td>
  </tr>
))
DomainStatRow.displayName = 'DomainStatRow'

const PromotionRecordRow = memo(({record,index,stripe}:{record:PromotionRecord;index:number;stripe:string}) => (
  <tr className={index%2===0 ? stripe : 'bg-white/60'}>
    <td className="px-3 py-2.5 max-w-[140px] sm:max-w-xs truncate text-gray-700" title={sanitizeForAttr(record.url)}>{record.url}</td>
    <td className="px-3 py-2.5 text-blue-600 break-all">{record.hostname}</td>
    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{record.platform}</td>
    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{record.linkCount.toLocaleString()}</td>
    <td className="px-3 py-2.5 whitespace-nowrap">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <span>✓</span><span>成功</span>
      </span>
    </td>
  </tr>
))
PromotionRecordRow.displayName = 'PromotionRecordRow'

// ─── 子组件：滚动表格容器 ─────────────────────────────────────
function ScrollTable({ariaLabel,headers,children}:{ariaLabel:string;headers:string[];children:React.ReactNode}) {
  return (
    <div className="overflow-x-auto -mx-1 rounded-xl" style={{WebkitOverflowScrolling:'touch'}}>
      <table className="min-w-full text-base" aria-label={ariaLabel}>
        <thead>
          <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            {headers.map(h=>(
              <th key={h} scope="col" className="px-3 py-3 text-left text-sm font-bold text-blue-700 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
    </div>
  )
}

// ─── 子组件：文件上传区域 ─────────────────────────────────────
function FileUploadZone({
  uploadedFiles,
  onAdd,
  onRemove,
  onClear,
  t,
  isRTL,
}: {
  uploadedFiles: UploadedFile[]
  onAdd: (files: FileList) => void
  onRemove: (id: string) => void
  onClear: () => void
  t: Translations
  isRTL: boolean
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) onAdd(e.dataTransfer.files)
  }, [onAdd])

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  const totalSize = uploadedFiles.reduce((acc, f) => acc + f.file.size, 0)

  return (
    <div className="space-y-3">
      {/* 拖拽区 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        aria-label={t.uploadHint}
        className={`
          relative group cursor-pointer rounded-2xl border-2 border-dashed
          transition-all duration-200 select-none
          flex flex-col items-center justify-center gap-3
          py-10 px-4 text-center
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg shadow-blue-100'
            : 'border-gray-200 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-blue-50/30 hover:bg-blue-50/50'
          }
        `}
      >
        {/* 上传图标 */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200
          ${isDragging ? 'bg-blue-500 shadow-lg shadow-blue-200' : 'bg-white shadow-md group-hover:shadow-blue-100 group-hover:bg-blue-50'}`}>
          <svg className={`w-8 h-8 transition-colors ${isDragging ? 'text-white' : 'text-blue-400 group-hover:text-blue-500'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>

        <div>
          <p className={`text-base font-semibold transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
            {isDragging ? t.uploadDrag : t.uploadHint}
          </p>
          <p className="text-xs text-gray-400 mt-1">{t.uploadSupport}</p>
        </div>

        {!isDragging && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl shadow-sm transition-all active:scale-95">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t.uploadBrowse}
          </span>
        )}

        {/* 隐藏的 input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => e.target.files && onAdd(e.target.files)}
          aria-hidden="true"
        />
      </div>

      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white/80 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* 列表头 */}
          <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="w-6 h-6 rounded-lg bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                {uploadedFiles.length}
              </span>
              <span className="text-sm font-semibold text-gray-700">{t.uploadFiles}</span>
              <span className="text-xs text-gray-400">· {t.uploadTotalSize}: {formatSize(totalSize)}</span>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {t.uploadClear}
            </button>
          </div>

          {/* 文件条目 */}
          <ul className="divide-y divide-gray-50 max-h-64 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>
            {uploadedFiles.map(uf => (
              <li key={uf.id} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50/40 transition-colors group ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* 缩略图 / 图标 */}
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center shadow-sm">
                  {uf.preview
                    ? <img src={uf.preview} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xl leading-none">{fileIcon(uf.file)}</span>
                  }
                </div>

                {/* 文件名 + 大小 */}
                <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                  <p className="text-sm font-medium text-gray-800 truncate">{uf.file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(uf.file.size)}</p>
                </div>

                {/* 删除按钮 */}
                <button
                  type="button"
                  onClick={() => onRemove(uf.id)}
                  aria-label={t.uploadRemove}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── 全球推广渠道数据 ──────────────────────────────────────────
const GLOBAL_CHANNELS = [
  { group: '搜索引擎',   icon: '🔍', color: 'from-blue-500 to-cyan-500',     bg: 'bg-blue-50',   items: ['Google','Bing','Baidu','Yahoo','Yandex','DuckDuckGo','Sogou','360搜索'] },
  { group: '社交媒体',   icon: '📱', color: 'from-pink-500 to-rose-500',     bg: 'bg-pink-50',   items: ['微博','微信','抖音','小红书','Facebook','Instagram','Twitter/X','TikTok','LinkedIn','YouTube'] },
  { group: '论坛社区',   icon: '💬', color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', items: ['Reddit','贴吧','知乎','虎扑','豆瓣','Quora','Stack Overflow','V2EX'] },
  { group: '邮件营销',   icon: '📧', color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  items: ['Gmail','Outlook','Yahoo Mail','163邮箱','QQ邮箱','Newsletter','EDM'] },
  { group: '新闻媒体',   icon: '📰', color: 'from-emerald-500 to-teal-500',  bg: 'bg-emerald-50',items: ['今日头条','百家号','腾讯新闻','网易新闻','Medium','WordPress','Blogger'] },
  { group: '视频平台',   icon: '🎬', color: 'from-red-500 to-rose-500',      bg: 'bg-red-50',    items: ['YouTube','B站','优酷','爱奇艺','腾讯视频','抖音','快手','Vimeo'] },
]

// ─── AI多模态类型选择器 ────────────────────────────────────────
function MultimodalSelector({
  selected, onChange, t, isRTL,
}: { selected: string[]; onChange: (ids: string[]) => void; t: Translations; isRTL: boolean }) {
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }
  return (
    <div className="space-y-3">
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
          </svg>
        </div>
        <p className={`text-xs font-semibold text-gray-500 uppercase tracking-wide ${isRTL ? 'text-right' : ''}`}>{t.multimodalTitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {t.multimodalTypes.map(type => {
          const active = selected.includes(type.id)
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => toggle(type.id)}
              className={`relative flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all duration-150 active:scale-95
                ${active
                  ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                } ${isRTL ? 'text-right' : ''}`}
            >
              {active && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
              )}
              <span className="text-lg leading-none">{type.icon}</span>
              <span className={`text-xs font-bold ${active ? 'text-blue-700' : 'text-gray-700'}`}>{type.label}</span>
              <span className="text-[10px] text-gray-400 leading-tight line-clamp-2">{type.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── 全球推广渠道展示 ──────────────────────────────────────────
function GlobalChannelsPanel({ t, isRTL }: { t: Translations; isRTL: boolean }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-blue-50 p-5 sm:p-6">
      {/* 标题 */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm shadow-indigo-200">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"/>
            </svg>
          </div>
          <div className={isRTL ? 'text-right' : ''}>
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">{t.channelsTitle}</h2>
            <p className="text-xs text-gray-400">
              {GLOBAL_CHANNELS.reduce((s, g) => s + g.items.length, 0)}+ {t.scheduleChannelCount} · {GLOBAL_CHANNELS.length} 大类别
            </p>
          </div>
        </div>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* 渠道分组（展开后显示） */}
      {expanded && (
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GLOBAL_CHANNELS.map(group => (
            <div key={group.group} className={`rounded-xl p-3.5 ${group.bg} border border-white`}>
              <div className={`flex items-center gap-2 mb-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center shadow-sm text-sm`}>
                  {group.icon}
                </div>
                <span className="text-xs font-bold text-gray-700">{group.group}</span>
                <span className="text-[10px] text-gray-400 ml-auto">{group.items.length}个</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {group.items.map(item => (
                  <span key={item} className="px-2 py-0.5 bg-white/80 text-gray-600 text-[11px] rounded-md border border-white shadow-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 折叠状态下的简略渠道 tag 行 */}
      {!expanded && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {GLOBAL_CHANNELS.map(g => (
            <span key={g.group} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${g.color} text-white shadow-sm`}>
              {g.icon} {g.group}
            </span>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── 整点定时推送面板 ──────────────────────────────────────────
const DEFAULT_PUSH_URL = 'https://tools.yndxw.com'

function SchedulePushPanel({
  pushHistory, nextPushIn, t, isRTL,
}: {
  pushHistory: PushRecord[]
  nextPushIn: string    // "HH:MM:SS" 倒计时
  t: Translations
  isRTL: boolean
}) {
  return (
    <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-purple-50 p-5 sm:p-6 space-y-5">
      {/* 标题 */}
      <div className={`flex items-center justify-between flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-sm shadow-purple-200">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">{t.scheduleTitle}</h2>
        </div>
        {/* 任务状态徽章 */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse flex-shrink-0"/>
          <span className="text-xs font-semibold text-purple-700">{t.scheduleStatus}：{t.scheduleStatusActive}</span>
        </div>
      </div>

      {/* 信息卡片行 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 默认推广地址 */}
        <div className="col-span-1 sm:col-span-3 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border border-purple-100 px-4 py-3">
          <div className={`flex items-center justify-between flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-sm">🌐</span>
              <div className={`min-w-0 ${isRTL ? 'text-right' : ''}`}>
                <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wide">{t.scheduleDefaultUrl}</p>
                <p className="text-sm font-bold text-purple-700 truncate">{DEFAULT_PUSH_URL}</p>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs text-purple-500 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {t.scheduleInterval}
            </div>
          </div>
        </div>

        {/* 下次推送倒计时 */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 p-3.5 text-center">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide mb-1">{t.scheduleNextPush}</p>
          <p className="text-2xl font-black text-indigo-600 tracking-tight tabular-nums">{nextPushIn}</p>
          <p className="text-[10px] text-indigo-400 mt-0.5">HH : MM : SS</p>
        </div>

        {/* 上次推送 */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-3.5 text-center">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide mb-1">{t.scheduleLastPush}</p>
          <p className="text-lg font-black text-emerald-600 tracking-tight">
            {pushHistory.length > 0 ? pushHistory[0].time : '--:--'}
          </p>
          {pushHistory.length > 0 && (
            <p className="text-[10px] text-emerald-500 mt-0.5">{pushHistory[0].channels} {t.scheduleChannelCount}</p>
          )}
        </div>

        {/* 累计今日推送 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-3.5 text-center">
          <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1">今日推送</p>
          <p className="text-2xl font-black text-amber-600 tracking-tight">{pushHistory.length}</p>
          <p className="text-[10px] text-amber-400 mt-0.5">次</p>
        </div>
      </div>

      {/* 推送历史 */}
      <div>
        <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2.5 ${isRTL ? 'text-right' : ''}`}>
          {t.scheduleHistoryTitle}
        </p>
        {pushHistory.length === 0 ? (
          <p className={`text-sm text-gray-400 text-center py-4 ${isRTL ? 'text-right' : ''}`}>{t.scheduleHistoryEmpty}</p>
        ) : (
          <ul className="space-y-2 max-h-48 overflow-y-auto" style={{WebkitOverflowScrolling:'touch'}}>
            {pushHistory.map(record => (
              <li key={record.id}
                className={`flex items-center gap-3 px-3.5 py-2.5 bg-gray-50/80 rounded-xl border border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${record.success ? 'bg-emerald-500' : 'bg-red-400'}`}/>
                <span className="text-xs font-bold text-gray-700 tabular-nums w-12 flex-shrink-0">{record.time}</span>
                <span className="text-xs text-blue-600 truncate flex-1 min-w-0">{record.url}</span>
                <div className={`flex items-center gap-1 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {record.types.slice(0,3).map(id => {
                    const icons: Record<string, string> = { text:'📝', voice:'🎙️', video:'🎬', file:'📁', program:'💻', email:'📧' }
                    return <span key={id} className="text-sm leading-none">{icons[id] ?? '📡'}</span>
                  })}
                  <span className="text-[10px] text-gray-400 ml-1">{record.channels} {t.scheduleChannelCount}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ─── 实时监控面板 ──────────────────────────────────────────────
interface MonitorStats {
  onlineNow: number
  todayVisits: number
  totalPromotions: number
  platformsCovered: number
  lastUpdate: string
}

function LiveMonitorPanel({ stats, t, isRTL }: { stats: MonitorStats; t: Translations; isRTL: boolean }) {
  const cards = [
    {
      label: t.monitorOnlineNow,
      value: stats.onlineNow.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-600',
      pulse: true,
    },
    {
      label: t.monitorTodayVisits,
      value: stats.todayVisits.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      gradient: 'from-violet-500 to-purple-500',
      bg: 'from-violet-50 to-purple-50',
      textColor: 'text-violet-600',
      pulse: false,
    },
    {
      label: t.monitorTotalPromotions,
      value: stats.totalPromotions.toLocaleString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'from-emerald-50 to-teal-50',
      textColor: 'text-emerald-600',
      pulse: false,
    },
    {
      label: t.monitorPlatformsCovered,
      value: stats.platformsCovered.toString(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-500',
      bg: 'from-amber-50 to-orange-50',
      textColor: 'text-amber-600',
      pulse: false,
    },
  ]

  return (
    <section className="space-y-4">
      {/* 面板标题行 */}
      <div className={`flex items-center justify-between flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm shadow-rose-200">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
            </svg>
          </div>
          <h2 className="font-bold text-gray-900 text-base sm:text-lg">{t.monitorTitle}</h2>
        </div>

        {/* 状态 + 最后更新 */}
        <div className={`flex items-center gap-3 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"/>
            <span className="text-xs font-semibold text-emerald-700">{t.monitorStatus}：{t.monitorStatusRunning}</span>
          </div>
          <span className="text-xs text-gray-400">
            {t.monitorLastUpdate}：{stats.lastUpdate}
          </span>
        </div>
      </div>

      {/* 四个数据卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => (
          <div key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg}
              border border-white shadow-lg shadow-gray-100/80 p-5 sm:p-6`}
          >
            {/* 装饰背景圆 */}
            <div className={`absolute -right-3 -top-3 w-16 h-16 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}/>
            <div className={`absolute -right-1 -bottom-4 w-12 h-12 rounded-full bg-gradient-to-br ${card.gradient} opacity-10`}/>

            {/* 图标 */}
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center shadow-md mb-3`}>
              {card.icon}
            </div>

            {/* 数值 —— 大字体醒目 */}
            <div className={`flex items-end gap-1.5 mb-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className={`text-4xl sm:text-5xl font-black tracking-tight leading-none ${card.textColor}`}>
                {card.value}
              </span>
              {card.pulse && (
                <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block"/>
                  LIVE
                </span>
              )}
            </div>

            {/* 标签 */}
            <p className="text-sm sm:text-base font-bold text-gray-600 leading-tight">{card.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── 智能客服：消息类型 ────────────────────────────────────────
interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
  ts: number
}

// ─── 智能客服：模拟 AI 回复 ───────────────────────────────────
function getBotReply(question: string, t: Translations): string {
  const q = question.toLowerCase()
  if (q.includes('推广') || q.includes('promot') || q.includes('start') || q.includes('开始') || q.includes('begin')) {
    return t.chatFaqs[0] + '\n\n✅ ' + (t.chatWelcome.replace('👋 ', '').split('。')[0] || '只需在左侧输入框中填写您的网址，点击「' + (t.submitButton) + '」即可自动推广到各大平台！')
  }
  if (q.includes('平台') || q.includes('platform') || q.includes('支持') || q.includes('support')) {
    return '🌐 支持的平台包括：\n• 百度 · 微信 · 微博 · 抖音\n• Google · Facebook · Twitter\n\n覆盖全球主流流量入口，一键全推广！'
  }
  if (q.includes('效果') || q.includes('效率') || q.includes('效') || q.includes('effect')) {
    return '📊 推广效果实时可见：\n• 流量统计\n• 转化率分析\n• 跳出率监控\n• 平均停留时长\n\n数据驱动，精准衡量每一次推广效果！'
  }
  if (q.includes('文件') || q.includes('上传') || q.includes('upload') || q.includes('file')) {
    return '📁 上传文件超简单：\n1. 点击右侧「' + t.uploadBrowse + '」按钮\n2. 或直接将文件拖入上传区域\n\n支持图片、文档、视频等所有常见格式！'
  }
  if (q.includes('价格') || q.includes('费') || q.includes('price') || q.includes('cost') || q.includes('免费') || q.includes('free')) {
    return '💰 目前完全免费使用！\n\n所有功能无限制开放，包括：\n• 不限次数推广\n• 批量文件上传\n• 多平台覆盖\n• 实时数据统计'
  }
  if (q.includes('语言') || q.includes('language') || q.includes('多语言')) {
    return '🌍 支持 6 种语言界面：\n• 中文 · English\n• Français · Deutsch\n• 日本語 · العربية\n\n点击右上角切换语言按钮即可！'
  }
  if (q.includes('你好') || q.includes('hello') || q.includes('hi') || q.includes('嗨')) {
    return `👋 您好！很高兴为您服务。\n\n我可以帮您解答：\n${t.chatFaqs.map((f, i) => `${i+1}. ${f}`).join('\n')}\n\n请问有什么需要帮助的？`
  }
  return `感谢您的提问！\n\n我可以帮您解答以下常见问题：\n${t.chatFaqs.map((f, i) => `${i+1}. ${f}`).join('\n')}\n\n请直接输入具体问题，或点击上方快捷问题 👆`
}

// ─── 智能客服组件 ──────────────────────────────────────────────
function ChatWidget({ t, isRTL }: { t: Translations; isRTL: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasNewMsg, setHasNewMsg] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'bot', text: t.chatWelcome, ts: Date.now() }
  ])
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 切换语言时更新欢迎语
  useEffect(() => {
    setMessages([{ id: '0', role: 'bot', text: t.chatWelcome, ts: Date.now() }])
  }, [t.chatWelcome])

  // 滚动到底部
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // 关闭时清除新消息标记
  useEffect(() => {
    if (isOpen) setHasNewMsg(false)
  }, [isOpen])

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: trimmed, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // 模拟 AI 打字延迟
    const delay = 800 + Math.random() * 600
    setTimeout(() => {
      const reply = getBotReply(trimmed, t)
      const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'bot', text: reply, ts: Date.now() }
      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
      if (!isOpen) setHasNewMsg(true)
    }, delay)
  }, [isTyping, t, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleNewSession = () => {
    setMessages([{ id: Date.now().toString(), role: 'bot', text: t.chatWelcome, ts: Date.now() }])
    setInput('')
    setIsTyping(false)
    inputRef.current?.focus()
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
  }

  return (
    <>
      {/* 聊天窗口 */}
      {isOpen && (
        <div
          className={`fixed bottom-24 z-50 flex flex-col
            w-[calc(100vw-2rem)] max-w-sm sm:max-w-md
            rounded-2xl overflow-hidden
            shadow-2xl shadow-blue-100/50
            border border-white/60
            transition-all duration-300
            ${isMinimized ? 'h-14' : 'h-[480px] sm:h-[520px]'}
            ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'}
          `}
          style={{background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)'}}
          role="dialog"
          aria-label={t.chatTitle}
        >
          {/* 头部 */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex-shrink-0">
            {/* 头像 */}
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"/>
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"/>
            </div>

            {/* 标题 */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-tight">{t.chatTitle}</p>
              <p className="text-xs text-blue-100 truncate">{t.chatOnline} · {t.chatSubtitle}</p>
            </div>

            {/* 操作按钮 */}
            <div className={`flex items-center gap-1 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={handleNewSession}
                title={t.chatNewSession}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(v => !v)}
                title={t.chatMinimize}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={isMinimized ? 'M4 15l8-8 8 8' : 'M20 9l-8 8-8-8'}/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title={t.chatClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* 消息列表 */}
              <div
                ref={listRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                style={{WebkitOverflowScrolling: 'touch'}}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.role === 'user'
                        ? (isRTL ? 'flex-row' : 'flex-row-reverse')
                        : (isRTL ? 'flex-row-reverse' : 'flex-row')
                    }`}
                  >
                    {/* Bot 头像 */}
                    {msg.role === 'bot' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                        </svg>
                      </div>
                    )}

                    {/* 气泡 */}
                    <div className={`max-w-[78%] ${msg.role === 'user' ? (isRTL ? 'items-start' : 'items-end') : (isRTL ? 'items-end' : 'items-start')} flex flex-col gap-1`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-gray-300 px-1">{formatTime(msg.ts)}</span>
                    </div>
                  </div>
                ))}

                {/* 打字指示器 */}
                {isTyping && (
                  <div className={`flex items-end gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                      </svg>
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex items-center gap-1.5">
                        {[0,1,2].map(i => (
                          <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                            style={{animationDelay: `${i * 150}ms`}}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 快捷问题 */}
              <div className="px-4 py-2 border-t border-gray-100 flex flex-nowrap gap-1.5 overflow-x-auto" style={{WebkitOverflowScrolling:'touch'}}>
                {t.chatFaqs.map((faq, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(faq)}
                    disabled={isTyping}
                    className="flex-shrink-0 px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {faq}
                  </button>
                ))}
              </div>

              {/* 输入框 */}
              <form
                onSubmit={handleSubmit}
                className={`px-3 py-3 border-t border-gray-100 flex items-center gap-2 bg-white ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  disabled={isTyping}
                  className={`flex-1 px-4 py-2.5 text-sm bg-gray-50 rounded-xl border border-gray-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white
                    transition-all placeholder-gray-400 text-gray-800 disabled:opacity-60
                    ${isRTL ? 'text-right' : ''}`}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white
                    flex items-center justify-center flex-shrink-0 shadow-sm
                    hover:from-blue-600 hover:to-indigo-700
                    disabled:opacity-40 disabled:cursor-not-allowed
                    active:scale-95 transition-all"
                  aria-label={t.chatSend}
                >
                  <svg className={`w-4 h-4 ${isRTL ? 'scale-x-[-1]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"/>
                  </svg>
                </button>
              </form>

              {/* 底部品牌 */}
              <div className="text-center py-1.5 text-[10px] text-gray-300 bg-white border-t border-gray-50">
                {t.chatPowered}
              </div>
            </>
          )}
        </div>
      )}

      {/* 悬浮按钮 */}
      <button
        type="button"
        onClick={() => { setIsOpen(v => !v); setHasNewMsg(false) }}
        aria-label={t.chatTitle}
        className={`fixed z-50 bottom-6
          ${isRTL ? 'left-4 sm:left-6' : 'right-4 sm:right-6'}
          w-14 h-14 rounded-2xl
          bg-gradient-to-br from-blue-500 to-indigo-600
          text-white shadow-xl shadow-blue-300/50
          flex items-center justify-center
          hover:scale-105 active:scale-95
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        `}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
          </svg>
        )}
        {/* 未读消息红点 */}
        {hasNewMsg && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
            1
          </span>
        )}
      </button>
    </>
  )
}

// ─── 主组件 ────────────────────────────────────────────────────
const Promotion: React.FC = () => {
  const [url, setUrl] = useState(DEFAULT_PUSH_URL)
  const [status, setStatus] = useState('')
  const [isPromoting, setIsPromoting] = useState(false)
  const [currentLang, setCurrentLang] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)
  const [promotionSuccess, setPromotionSuccess] = useState(false)
  const [domainStats, setDomainStats] = useState<DomainStat[]>([])
  const [promotionRecords, setPromotionRecords] = useState<PromotionRecord[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  // AI 多模态：默认全选
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['text','voice','video','file','program','email'])
  // 定时推送历史
  const [pushHistory, setPushHistory] = useState<PushRecord[]>([])
  // 下次整点倒计时
  const [nextPushIn, setNextPushIn] = useState('00:00:00')

  // ── 实时监控数据 ──────────────────────────────────────────────
  const [monitorStats, setMonitorStats] = useState<MonitorStats>(() => {
    const now = new Date()
    return {
      onlineNow: Math.floor(Math.random() * 800) + 1200,
      todayVisits: Math.floor(Math.random() * 5000) + 18000,
      totalPromotions: Math.floor(Math.random() * 50000) + 980000,
      platformsCovered: 6,
      lastUpdate: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`,
    }
  })

  const t: Translations = translations[currentLang]
  const isRTL = RTL_LANGUAGES.has(currentLang)

  useEffect(() => {
    detectLanguage().then(lang => { setCurrentLang(lang); setIsLoading(false) })
  }, [])

  // 实时监控：每 3 秒随机微调数据，模拟真实波动
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      setMonitorStats(prev => ({
        onlineNow: Math.max(500, prev.onlineNow + Math.floor(Math.random() * 11) - 5),
        todayVisits: prev.todayVisits + Math.floor(Math.random() * 4),
        totalPromotions: prev.totalPromotions + Math.floor(Math.random() * 3),
        platformsCovered: prev.platformsCovered,
        lastUpdate: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`,
      }))
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    document.documentElement.lang = currentLang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [currentLang, isRTL])

  // 整点倒计时：每秒更新
  useEffect(() => {
    const calcCountdown = () => {
      const now = new Date()
      const next = new Date(now)
      next.setHours(now.getHours() + 1, 0, 0, 0)
      const diff = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
    }
    setNextPushIn(calcCountdown())
    const t2 = setInterval(() => setNextPushIn(calcCountdown()), 1000)
    return () => clearInterval(t2)
  }, [])

  // 整点自动推送：监听分钟变化，整点时触发
  useEffect(() => {
    const checkHour = () => {
      const now = new Date()
      if (now.getMinutes() === 0 && now.getSeconds() < 5) {
        const totalChannels = GLOBAL_CHANNELS.reduce((s, g) => s + g.items.length, 0)
        const record: PushRecord = {
          id: Date.now().toString(),
          time: `${now.getHours().toString().padStart(2,'0')}:00`,
          url: DEFAULT_PUSH_URL,
          channels: totalChannels,
          types: selectedTypes,
          success: true,
        }
        setPushHistory(prev => [record, ...prev].slice(0, 24))
        // 同步更新监控面板累计推广数
        setMonitorStats(prev => ({
          ...prev,
          totalPromotions: prev.totalPromotions + totalChannels,
          todayVisits: prev.todayVisits + Math.floor(Math.random() * 200) + 100,
        }))
      }
    }
    const t3 = setInterval(checkHour, 5000)
    return () => clearInterval(t3)
  }, [selectedTypes])

  const handleLanguageChange = useCallback((lang: Language) => {
    setCurrentLang(lang)
    saveLanguagePreference(lang)
  }, [])

  // ── 文件上传处理 ──────────────────────────────────────────────
  const handleFilesAdd = useCallback((files: FileList) => {
    const newFiles: UploadedFile[] = Array.from(files).map(file => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const uf: UploadedFile = { id, file }
      // 图片生成预览
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = e => {
          setUploadedFiles(prev =>
            prev.map(f => f.id === id ? { ...f, preview: e.target?.result as string } : f)
          )
        }
        reader.readAsDataURL(file)
      }
      return uf
    })
    setUploadedFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleFileRemove = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const handleFileClear = useCallback(() => setUploadedFiles([]), [])

  // ── 推广处理 ─────────────────────────────────────────────────
  const handlePromotion = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUrl = url.trim()
    if (!trimmedUrl) { setStatus(t.emptyUrlMessage); setPromotionSuccess(false); return }
    if (!isSafeUrl(trimmedUrl)) { setStatus(t.invalidUrlMessage); setPromotionSuccess(false); return }

    let parsedUrl: URL
    try { parsedUrl = new URL(trimmedUrl) } catch { setStatus(t.invalidUrlMessage); setPromotionSuccess(false); return }

    const hostname = parsedUrl.hostname
    if (!hostname || hostname.length > 253) { setStatus(t.errorMessage); setPromotionSuccess(false); return }

    setIsPromoting(true)
    setPromotionSuccess(false)
    setDomainStats([])
    setPromotionRecords([])

    // 动态构建推广步骤（结合已选多模态类型）
    const typeIcons: Record<string, string> = { text:'📝', voice:'🎙️', video:'🎬', file:'📁', program:'💻', email:'📧' }
    const typeSteps = selectedTypes.map(id => ({
      icon: typeIcons[id] ?? '📡',
      msg: `正在推送${t.multimodalTypes.find(x=>x.id===id)?.label ?? id}内容…`,
    }))
    const PUSH_STEPS = [
      { icon: '🔍', msg: `正在分析域名 ${hostname}…` },
      { icon: '📡', msg: '正在推送到 百度 / Google / Bing…' },
      ...typeSteps,
      { icon: '💬', msg: '正在发布到论坛 / 评论区…' },
      { icon: '📧', msg: '正在发送邮件营销…' },
      { icon: '📱', msg: '正在推送到微博 / 抖音 / 小红书…' },
      { icon: '🌐', msg: '正在推送到全球社交媒体…' },
      { icon: '⚡', msg: '正在汇总推广数据…' },
    ]

    let stepIdx = 0
    setStatus(`${PUSH_STEPS[0].icon} ${PUSH_STEPS[0].msg}`)
    const stepTimer = setInterval(() => {
      stepIdx++
      if (stepIdx < PUSH_STEPS.length) {
        setStatus(`${PUSH_STEPS[stepIdx].icon} ${PUSH_STEPS[stepIdx].msg}`)
      }
    }, 350)

    try {
      const protocol = parsedUrl.protocol
      let newSubdomains: string[] = []
      if (hostname.endsWith('yndxw.com')) {
        newSubdomains = ['www','m','api','cdn','blog','news'].map(p => `${protocol}//${p}.yndxw.com`)
      }
      const minWait = Math.max(2000, PUSH_STEPS.length * 350 + 300)
      await new Promise<void>(r => setTimeout(r, minWait))
      clearInterval(stepTimer)

      const seed = Date.now()
      const allHostnames = [hostname, ...newSubdomains.map(s => new URL(s).hostname)]
      setDomainStats(allHostnames.map((h, i) => generateDomainStat(h, i+1, seed+i)))
      setPromotionRecords(generatePromotionRecords(trimmedUrl, hostname, newSubdomains, seed))
      setStatus(t.successMessage)
      setPromotionSuccess(true)

      // 写入推送历史
      const totalChannels = GLOBAL_CHANNELS.reduce((s, g) => s + g.items.length, 0)
      const now = new Date()
      setPushHistory(prev => [{
        id: now.getTime().toString(),
        time: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`,
        url: trimmedUrl,
        channels: totalChannels,
        types: selectedTypes,
        success: true,
      }, ...prev].slice(0, 24))
    } catch {
      clearInterval(stepTimer)
      setStatus(t.errorMessage)
      setPromotionSuccess(false)
    } finally {
      setIsPromoting(false)
    }
  }, [url, t, selectedTypes])

  // ── 加载中 ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50" role="status" aria-live="polite">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-200 animate-pulse">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
          <span className="text-gray-400 text-sm font-medium">Loading…</span>
        </div>
      </div>
    )
  }

  const hasSubdomains = promotionRecords.some(r => r.isSubdomain)
  const mainRecords = promotionRecords.filter(r => !r.isSubdomain)
  const subRecords = promotionRecords.filter(r => r.isSubdomain)

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`}
      style={{background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 40%, #eef2ff 100%)'}}>

      {/* ── 顶部导航栏 ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className={`flex items-center gap-2.5 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm sm:text-base truncate">{t.title}</span>
          </div>

          {/* 语言切换 */}
          <nav className={`flex flex-wrap gap-1 justify-end ${isRTL ? 'flex-row-reverse' : ''}`} role="group" aria-label={t.langLabel}>
            {LANGUAGES.map(lang => (
              <button key={lang} onClick={() => handleLanguageChange(lang)}
                aria-pressed={currentLang === lang}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95
                  ${currentLang === lang
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm shadow-blue-200'
                    : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                {LANGUAGE_NAMES[lang]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── 主内容 ────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Hero */}
        <section className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
            Auto Promotion Tool
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">{t.subtitle}</p>
        </section>

        {/* 实时监控面板 */}
        <LiveMonitorPanel stats={monitorStats} t={t} isRTL={isRTL} />

        {/* 表单 + 上传 并排（大屏左右，小屏上下） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 左：推广表单 */}
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-blue-50 p-5 sm:p-7 space-y-5">
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">{t.urlLabel.replace(':','').replace('：','')}</h2>
            </div>

            <form onSubmit={handlePromotion} noValidate className="space-y-4">
              <div>
                <label htmlFor="url-input" className={`block text-sm font-medium text-gray-600 mb-1.5 ${isRTL ? 'text-right' : ''}`}>
                  {t.urlLabel}
                </label>
                <input
                  type="url" id="url-input" name="url"
                  value={url} onChange={e => setUrl(e.target.value)}
                  placeholder={t.urlPlaceholder}
                  autoComplete="url" autoCorrect="off" autoCapitalize="off"
                  spellCheck={false} inputMode="url" enterKeyHint="go"
                  className={`
                    w-full px-4 py-3 text-sm
                    bg-gray-50/80 border border-gray-200
                    text-gray-900 placeholder-gray-400
                    rounded-xl min-h-[48px]
                    focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 focus:bg-white
                    transition-all duration-150
                    ${isRTL ? 'text-right' : ''}
                  `}
                />
              </div>

              {/* AI 多模态类型选择器 */}
              <div className="pt-1 border-t border-gray-100">
                <MultimodalSelector
                  selected={selectedTypes}
                  onChange={setSelectedTypes}
                  t={t}
                  isRTL={isRTL}
                />
              </div>

              <button type="submit" disabled={isPromoting} aria-busy={isPromoting}
                className="w-full py-3 min-h-[48px] rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-blue-500 to-indigo-600
                  hover:from-blue-600 hover:to-indigo-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-lg shadow-blue-200 hover:shadow-blue-300
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                  transition-all duration-150 active:scale-[0.98]"
              >
                {isPromoting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    {t.submittingButton}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    {t.submitButton}
                  </span>
                )}
              </button>

              {status && (
                <div role="alert" aria-live="polite"
                  className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-medium transition-all
                    ${isPromoting
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : promotionSuccess
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-600 border border-red-200'
                    } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  {isPromoting ? (
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                  ) : (
                    <span className="text-base leading-none flex-shrink-0">{promotionSuccess ? '✅' : '⚠️'}</span>
                  )}
                  <span>{status}</span>
                </div>
              )}
            </form>

            {/* 推广原理 */}
            <div className="pt-2 border-t border-gray-100">
              <p className={`text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 ${isRTL ? 'text-right' : ''}`}>{t.infoTitle}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {t.infoItems.map((item, i) => (
                  <li key={i} className={`flex items-center gap-2 text-xs text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="w-5 h-5 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 右：文件上传 */}
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-indigo-50 p-5 sm:p-7 space-y-4">
            <div className={`flex items-center gap-2.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-200">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">{t.uploadTitle}</h2>
            </div>

            <FileUploadZone
              uploadedFiles={uploadedFiles}
              onAdd={handleFilesAdd}
              onRemove={handleFileRemove}
              onClear={handleFileClear}
              t={t}
              isRTL={isRTL}
            />

            {/* 支持的文件类型说明 */}
            <div className={`flex flex-wrap gap-1.5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {['🖼️ 图片','🎬 视频','🎵 音频','📄 PDF','📝 Word','📊 Excel','💻 代码','🗜️ 压缩包'].map(label => (
                <span key={label} className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">{label}</span>
              ))}
            </div>
          </section>
        </div>

        {/* 域名统计 */}
        {domainStats.length > 0 && (
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-blue-50 p-5 sm:p-7">
            <div className={`flex items-center gap-2.5 mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">{t.tableStats.title}</h2>
            </div>
            <ScrollTable ariaLabel={t.tableStats.title} headers={[t.tableStats.rank,t.tableStats.domain,t.tableStats.traffic,t.tableStats.visits,t.tableStats.conversion,t.tableStats.bounce,t.tableStats.duration]}>
              {domainStats.map((stat,i) => <DomainStatRow key={stat.hostname} stat={stat} index={i}/>)}
            </ScrollTable>
          </section>
        )}

        {/* 推广效果详情 */}
        {promotionSuccess && promotionRecords.length > 0 && (
          <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-indigo-50 p-5 sm:p-7">
            <div className={`flex items-center gap-2.5 mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm shadow-blue-200">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 className="font-bold text-gray-900">{t.tablePromotion.title}</h2>
            </div>
            <ScrollTable ariaLabel={t.tablePromotion.title} headers={[t.tablePromotion.address,t.tablePromotion.domain,t.tablePromotion.platform,t.tablePromotion.linkCount,t.tablePromotion.status]}>
              {hasSubdomains ? (
                <>
                  {mainRecords.map((r,i) => <PromotionRecordRow key={`m${i}`} record={r} index={i} stripe="bg-emerald-50/60"/>)}
                  <tr>
                    <td colSpan={5} className="px-3 py-2.5 bg-blue-50/80 font-semibold text-blue-600 text-xs">
                      {t.tablePromotion.subdomainLabel}
                    </td>
                  </tr>
                  {subRecords.map((r,i) => <PromotionRecordRow key={`s${i}`} record={r} index={i} stripe="bg-blue-50/60"/>)}
                </>
              ) : (
                promotionRecords.map((r,i) => <PromotionRecordRow key={`r${i}`} record={r} index={i} stripe="bg-emerald-50/60"/>)
              )}
            </ScrollTable>
          </section>
        )}

        {/* 全球推广渠道 */}
        <GlobalChannelsPanel t={t} isRTL={isRTL} />

        {/* 整点定时推送面板 */}
        <SchedulePushPanel pushHistory={pushHistory} nextPushIn={nextPushIn} t={t} isRTL={isRTL} />

      </main>

      {/* 页脚 */}
      <footer className="mt-8 border-t border-gray-200/60 py-5 text-center text-xs text-gray-400">
        <p>Auto Promotion Tool · 全平台多语言推广工具</p>
      </footer>

      {/* 智能客服悬浮组件 */}
      <ChatWidget t={t} isRTL={isRTL} />
    </div>
  )
}

export default Promotion
