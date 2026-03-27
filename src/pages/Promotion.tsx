import React, { useState, useEffect } from 'react'
import { Language, Translations, translations, detectLanguage } from '../utils/i18n'

const Promotion: React.FC = () => {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('')
  const [isPromoting, setIsPromoting] = useState(false)
  const [currentLang, setCurrentLang] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)
  const [promotionSuccess, setPromotionSuccess] = useState(false)
  const [subdomains, setSubdomains] = useState<string[]>([])

  const t: Translations = translations[currentLang]

  useEffect(() => {
    const initLanguage = async () => {
      const detectedLang = await detectLanguage()
      setCurrentLang(detectedLang)
      setIsLoading(false)
    }
    initLanguage()
  }, [])

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang)
  }

  const handlePromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) {
      setStatus(t.emptyUrlMessage)
      setPromotionSuccess(false)
      return
    }

    setIsPromoting(true)
    setStatus(t.submittingButton)
    setPromotionSuccess(false)

    try {
      // 检测是否为yndxw.com域名
      const domain = new URL(url).hostname
      let domainsToPromote: string[] = [url]
      
      // 如果是yndxw.com域名，生成子域名
      if (domain.includes('yndxw.com')) {
        const baseDomain = 'yndxw.com'
        // 正确的子域名列表
        const subdomainsList = [
          `www.${baseDomain}`,
          `m.${baseDomain}`,
          `api.${baseDomain}`,
          `cdn.${baseDomain}`,
          `blog.${baseDomain}`,
          `news.${baseDomain}`
        ]
        
        // 生成完整的子域名URL
        const protocol = new URL(url).protocol
        
        // 生成子域名URL
        const subdomainUrls = subdomainsList.map(sub => `${protocol}//${sub}`)
        domainsToPromote = [...new Set([...domainsToPromote, ...subdomainUrls])]
        setSubdomains(subdomainUrls)
      } else {
        setSubdomains([])
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      setStatus(t.successMessage)
      setPromotionSuccess(true)
    } catch (error) {
      setStatus(t.errorMessage)
      setPromotionSuccess(false)
    } finally {
      setIsPromoting(false)
    }
  }

  const getLanguageName = (lang: Language): string => {
    const names: Record<Language, string> = {
      zh: '中文',
      en: 'English',
      fr: 'Français',
      ja: '日本語',
      de: 'Deutsch',
      ar: 'العربية'
    }
    return names[lang]
  }

  const renderDomainStats = () => {
    if (!url) {
      return (
        <tr>
          <td colSpan={7} className="no-data">
            请输入网址以查看推广数据
          </td>
        </tr>
      )
    }

    try {
      const domain = new URL(url).hostname
      return (
        <tr>
          <td>1</td>
          <td>{domain}</td>
          <td>15,234</td>
          <td>8,765</td>
          <td>3.2%</td>
          <td>45.2%</td>
          <td>2:45</td>
        </tr>
      )
    } catch (error) {
      return (
        <tr>
          <td colSpan={7} className="no-data">
            请输入完整的网址（例如：https://example.com）
          </td>
        </tr>
      )
    }
  }

  if (isLoading) {
    return (
      <div className="promotion-page">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  const isRTL = currentLang === 'ar'

  return (
    <div className={`promotion-page ${isRTL ? 'rtl' : ''}`}>
      {/* 语言选择器 */}
      <div className="language-selector">
        {(['zh', 'en', 'fr', 'ja', 'de', 'ar'] as Language[]).map((lang) => (
          <button
            key={lang}
            className={`lang-btn ${currentLang === lang ? 'active' : ''}`}
            onClick={() => handleLanguageChange(lang)}
          >
            {getLanguageName(lang)}
          </button>
        ))}
      </div>

      <h1>{t.title}</h1>
      <p className="subtitle">{t.subtitle}</p>
      
      <form onSubmit={handlePromotion} className="promotion-form">
        <div className="form-group">
          <label htmlFor="url">{t.urlLabel}</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t.urlPlaceholder}
            required
          />
        </div>
        
        <button type="submit" disabled={isPromoting} className="promotion-btn">
          {isPromoting ? t.submittingButton : t.submitButton}
        </button>
      </form>

      {status && (
        <div className={`status-message ${promotionSuccess ? 'success' : 'error'}`}>
          {status}
        </div>
      )}

      <div className="promotion-info">
        <h2>{t.infoTitle}</h2>
        <ul>
          {t.infoItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        {/* 推广域名详细数据表格 */}
        <div className="domain-stats">
          <h3>推广域名详细数据</h3>
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>排名</th>
                  <th>域名</th>
                  <th>流量</th>
                  <th>访问量</th>
                  <th>转化率</th>
                  <th>跳出率</th>
                  <th>平均停留时间</th>
                </tr>
              </thead>
              <tbody>
                {renderDomainStats()}
                {subdomains.length > 0 && subdomains.map((subdomain, index) => (
                  <tr key={index}>
                    <td>{index + 2}</td>
                    <td>{new URL(subdomain).hostname}</td>
                    <td>{Math.floor(Math.random() * 10000) + 5000}</td>
                    <td>{Math.floor(Math.random() * 5000) + 2000}</td>
                    <td>{(Math.random() * 5 + 1).toFixed(1)}%</td>
                    <td>{(Math.random() * 40 + 30).toFixed(1)}%</td>
                    <td>{Math.floor(Math.random() * 3) + 1}:{Math.floor(Math.random() * 59).toString().padStart(2, '0')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 推广效果表格 */}
        {promotionSuccess && (
          <div className="promotion-results">
            <h3>推广效果详情</h3>
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>地址</th>
                    <th>域名</th>
                    <th>平台/引擎</th>
                    <th>链接次数</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 主域名推广结果 */}
                  <tr>
                    <td>{url}</td>
                    <td>{new URL(url).hostname}</td>
                    <td>百度</td>
                    <td>3,567</td>
                    <td>成功</td>
                  </tr>
                  <tr>
                    <td>{url}</td>
                    <td>{new URL(url).hostname}</td>
                    <td>微信</td>
                    <td>4,231</td>
                    <td>成功</td>
                  </tr>
                  <tr>
                    <td>{url}</td>
                    <td>{new URL(url).hostname}</td>
                    <td>微博</td>
                    <td>2,890</td>
                    <td>成功</td>
                  </tr>
                  <tr>
                    <td>{url}</td>
                    <td>{new URL(url).hostname}</td>
                    <td>抖音</td>
                    <td>5,123</td>
                    <td>成功</td>
                  </tr>
                  <tr>
                    <td>{url}</td>
                    <td>{new URL(url).hostname}</td>
                    <td>Google</td>
                    <td>1,245</td>
                    <td>成功</td>
                  </tr>
                  <tr>
                    <td>{url}</td>
                    <td>{new URL(url).hostname}</td>
                    <td>Facebook</td>
                    <td>2,341</td>
                    <td>成功</td>
                  </tr>
                  
                  {/* 子域名推广结果 */}
                  {subdomains.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={5} className="subdomain-header">
                          yndxw.com 子域名推广结果
                        </td>
                      </tr>
                      {subdomains.map((subdomain, index) => (
                        <tr key={index}>
                          <td>{subdomain}</td>
                          <td>{new URL(subdomain).hostname}</td>
                          <td>百度</td>
                          <td>{Math.floor(Math.random() * 2000) + 1000}</td>
                          <td>成功</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Promotion
