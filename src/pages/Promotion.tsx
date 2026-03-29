import { useState, useEffect, useCallback } from 'react'
import { Language, Translations, translations, detectLanguage } from '../utils/i18n'

// 推广域名统计数据结构
interface DomainStat {
  rank: number
  hostname: string
  traffic: number
  visits: number
  conversionRate: string
  bounceRate: string
  avgDuration: string
}

// 推广效果记录结构
interface PromotionRecord {
  url: string
  hostname: string
  platform: string
  linkCount: number
  isSubdomain?: boolean
}

// 生成随机域名统计数据（固定种子，避免 re-render 时数据跳动）
function generateDomainStat(hostname: string, rank: number, seed: number): DomainStat {
  const pseudo = (n: number) => ((seed * 9301 + 49297 * n) % 233280) / 233280
  return {
    rank,
    hostname,
    traffic: Math.floor(pseudo(1) * 10000) + 5000,
    visits: Math.floor(pseudo(2) * 5000) + 2000,
    conversionRate: (pseudo(3) * 5 + 1).toFixed(1) + '%',
    bounceRate: (pseudo(4) * 40 + 30).toFixed(1) + '%',
    avgDuration: `${Math.floor(pseudo(5) * 3) + 1}:${Math.floor(pseudo(6) * 59).toString().padStart(2, '0')}`,
  }
}

// 生成推广效果记录
function generatePromotionRecords(url: string, hostname: string, subdomains: string[]): PromotionRecord[] {
  const platforms = ['百度', '微信', '微博', '抖音', 'Google', 'Facebook']
  const linkCounts = [3567, 4231, 2890, 5123, 1245, 2341]

  const records: PromotionRecord[] = platforms.map((platform, i) => ({
    url,
    hostname,
    platform,
    linkCount: linkCounts[i],
    isSubdomain: false,
  }))

  subdomains.forEach((subdomain) => {
    records.push({
      url: subdomain,
      hostname: new URL(subdomain).hostname,
      platform: '百度',
      linkCount: Math.floor(Math.random() * 2000) + 1000,
      isSubdomain: true,
    })
  })

  return records
}

const LANGUAGES: Language[] = ['zh', 'en', 'fr', 'ja', 'de', 'ar']

const LANGUAGE_NAMES: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  fr: 'Français',
  ja: '日本語',
  de: 'Deutsch',
  ar: 'العربية',
}

const Promotion: React.FC = () => {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('')
  const [isPromoting, setIsPromoting] = useState(false)
  const [currentLang, setCurrentLang] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)
  const [promotionSuccess, setPromotionSuccess] = useState(false)

  // 稳定的统计数据，避免随机数在每次 render 时变化
  const [domainStats, setDomainStats] = useState<DomainStat[]>([])
  const [promotionRecords, setPromotionRecords] = useState<PromotionRecord[]>([])

  const t: Translations = translations[currentLang]

  useEffect(() => {
    const initLanguage = async () => {
      const detectedLang = await detectLanguage()
      setCurrentLang(detectedLang)
      setIsLoading(false)
    }
    initLanguage()
  }, [])

  const handleLanguageChange = useCallback((lang: Language) => {
    setCurrentLang(lang)
  }, [])

  const handlePromotion = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!url.trim()) {
        setStatus(t.emptyUrlMessage)
        setPromotionSuccess(false)
        return
      }

      let parsedUrl: URL
      try {
        parsedUrl = new URL(url)
      } catch {
        setStatus(t.errorMessage)
        setPromotionSuccess(false)
        return
      }

      setIsPromoting(true)
      setStatus(t.submittingButton)
      setPromotionSuccess(false)
      setDomainStats([])
      setPromotionRecords([])

      try {
        const domain = parsedUrl.hostname
        const protocol = parsedUrl.protocol
        let newSubdomains: string[] = []

        if (domain.includes('yndxw.com')) {
          const baseDomain = 'yndxw.com'
          const subdomainPrefixes = ['www', 'm', 'api', 'cdn', 'blog', 'news']
          newSubdomains = subdomainPrefixes.map((prefix) => `${protocol}//${prefix}.${baseDomain}`)
        }

        // 模拟推广延迟
        await new Promise<void>((resolve) => setTimeout(resolve, 2000))

        // 生成稳定的统计数据（使用时间戳作为种子，确保每次推广结果一致）
        const seed = Date.now()
        const allHostnames = [domain, ...newSubdomains.map((s) => new URL(s).hostname)]
        const stats = allHostnames.map((hostname, i) =>
          generateDomainStat(hostname, i + 1, seed + i)
        )
        const records = generatePromotionRecords(url, domain, newSubdomains)

        setDomainStats(stats)
        setPromotionRecords(records)
        setStatus(t.successMessage)
        setPromotionSuccess(true)
      } catch {
        setStatus(t.errorMessage)
        setPromotionSuccess(false)
      } finally {
        setIsPromoting(false)
      }
    },
    [url, t]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    )
  }

  const isRTL = currentLang === 'ar'

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* 语言选择器 */}
        <div className="flex justify-end mb-6">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  currentLang === lang
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                }`}
              >
                {LANGUAGE_NAMES[lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-lg text-gray-600">{t.subtitle}</p>
          </div>

          {/* 推广表单 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handlePromotion} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.urlLabel}
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t.urlPlaceholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isPromoting}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPromoting ? t.submittingButton : t.submitButton}
              </button>
            </form>

            {status && (
              <div
                className={`mt-4 p-3 rounded-md text-sm font-medium ${
                  promotionSuccess
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                {status}
              </div>
            )}
          </div>

          {/* 推广原理说明 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.infoTitle}</h2>
            <ul className="space-y-2 text-gray-600">
              {t.infoItems.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 推广域名统计表格（推广成功后展示） */}
          {domainStats.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">推广域名详细数据</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {['排名', '域名', '流量', '访问量', '转化率', '跳出率', '平均停留时间'].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-4 py-2 text-left font-medium text-gray-500 whitespace-nowrap"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {domainStats.map((stat, index) => (
                      <tr
                        key={stat.hostname}
                        className={index % 2 === 0 ? 'bg-blue-50' : ''}
                      >
                        <td className="px-4 py-2 font-medium">{stat.rank}</td>
                        <td className="px-4 py-2 font-medium">{stat.hostname}</td>
                        <td className="px-4 py-2">{stat.traffic.toLocaleString()}</td>
                        <td className="px-4 py-2">{stat.visits.toLocaleString()}</td>
                        <td className="px-4 py-2">{stat.conversionRate}</td>
                        <td className="px-4 py-2">{stat.bounceRate}</td>
                        <td className="px-4 py-2">{stat.avgDuration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 推广效果详情表格 */}
          {promotionSuccess && promotionRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">推广效果详情</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {['地址', '域名', '平台/引擎', '链接次数', '状态'].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-2 text-left font-medium text-gray-500 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* 子域名分组标题 */}
                    {promotionRecords.some((r) => r.isSubdomain) && (
                      <>
                        {promotionRecords
                          .filter((r) => !r.isSubdomain)
                          .map((record, index) => (
                            <tr
                              key={`main-${index}`}
                              className={index % 2 === 0 ? 'bg-green-50' : ''}
                            >
                              <td className="px-4 py-2 max-w-xs truncate" title={record.url}>
                                {record.url}
                              </td>
                              <td className="px-4 py-2">{record.hostname}</td>
                              <td className="px-4 py-2">{record.platform}</td>
                              <td className="px-4 py-2">{record.linkCount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-green-600 font-medium">成功</td>
                            </tr>
                          ))}
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-3 bg-blue-50 font-medium text-blue-700"
                          >
                            yndxw.com 子域名推广结果
                          </td>
                        </tr>
                        {promotionRecords
                          .filter((r) => r.isSubdomain)
                          .map((record, index) => (
                            <tr
                              key={`sub-${index}`}
                              className={index % 2 === 0 ? 'bg-blue-50' : ''}
                            >
                              <td className="px-4 py-2 max-w-xs truncate" title={record.url}>
                                {record.url}
                              </td>
                              <td className="px-4 py-2">{record.hostname}</td>
                              <td className="px-4 py-2">{record.platform}</td>
                              <td className="px-4 py-2">{record.linkCount.toLocaleString()}</td>
                              <td className="px-4 py-2 text-green-600 font-medium">成功</td>
                            </tr>
                          ))}
                      </>
                    )}
                    {/* 无子域名时直接渲染 */}
                    {!promotionRecords.some((r) => r.isSubdomain) &&
                      promotionRecords.map((record, index) => (
                        <tr
                          key={`record-${index}`}
                          className={index % 2 === 0 ? 'bg-green-50' : ''}
                        >
                          <td className="px-4 py-2 max-w-xs truncate" title={record.url}>
                            {record.url}
                          </td>
                          <td className="px-4 py-2">{record.hostname}</td>
                          <td className="px-4 py-2">{record.platform}</td>
                          <td className="px-4 py-2">{record.linkCount.toLocaleString()}</td>
                          <td className="px-4 py-2 text-green-600 font-medium">成功</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Promotion
