export type Language = 'zh' | 'en' | 'fr' | 'ja' | 'de' | 'ar';

export interface Translations {
  title: string;
  subtitle: string;
  urlLabel: string;
  urlPlaceholder: string;
  submitButton: string;
  submittingButton: string;
  successMessage: string;
  errorMessage: string;
  emptyUrlMessage: string;
  infoTitle: string;
  infoItems: string[];
}

export const translations: Record<Language, Translations> = {
  zh: {
    title: '自动推广工具',
    subtitle: '输入网址，我们将帮助您推广到互联网上的所有用户访问。',
    urlLabel: '网址：',
    urlPlaceholder: '请输入完整的网址，例如：https://example.com',
    submitButton: '开始推广',
    submittingButton: '推广中...',
    successMessage: '推广成功！您的网址已被推送到互联网上。',
    errorMessage: '推广失败，请稍后重试。',
    emptyUrlMessage: '请输入网址',
    infoTitle: '推广原理',
    infoItems: [
      '自动提交到各大搜索引擎',
      '分享到社交媒体平台',
      '生成推广链接',
      '监控推广效果',
    ],
  },
  en: {
    title: 'Auto Promotion Tool',
    subtitle: 'Enter your URL and we will help you promote it to all users on the internet.',
    urlLabel: 'URL:',
    urlPlaceholder: 'Enter full URL, e.g.: https://example.com',
    submitButton: 'Start Promotion',
    submittingButton: 'Promoting...',
    successMessage: 'Promotion successful! Your URL has been pushed to the internet.',
    errorMessage: 'Promotion failed, please try again later.',
    emptyUrlMessage: 'Please enter a URL',
    infoTitle: 'How It Works',
    infoItems: [
      'Auto-submit to major search engines',
      'Share to social media platforms',
      'Generate promotion links',
      'Monitor promotion effectiveness',
    ],
  },
  ja: {
    title: '自動プロモーションツール',
    subtitle: 'URLを入力すると、インターネット上のすべてのユーザーにプロモーションします。',
    urlLabel: 'URL：',
    urlPlaceholder: '完全なURLを入力してください。例：https://example.com',
    submitButton: 'プロモーション開始',
    submittingButton: 'プロモーション中...',
    successMessage: 'プロモーション成功！URLがインターネットに公開されました。',
    errorMessage: 'プロモーションに失敗しました。後でもう一度お試しください。',
    emptyUrlMessage: 'URLを入力してください',
    infoTitle: 'プロモーションの仕組み',
    infoItems: [
      '主要な検索エンジンに自動送信',
      'ソーシャルメディアプラットフォームで共有',
      'プロモーションリンクの生成',
      'プロモーション効果の監視',
    ],
  },
  de: {
    title: 'Automatisches Promotion-Tool',
    subtitle: 'Geben Sie Ihre URL ein und wir helfen Ihnen, sie allen Benutzern im Internet zu bewerben.',
    urlLabel: 'URL:',
    urlPlaceholder: 'Vollständige URL eingeben, z.B.: https://example.com',
    submitButton: 'Promotion starten',
    submittingButton: 'Wird beworben...',
    successMessage: 'Promotion erfolgreich! Ihre URL wurde ins Internet veröffentlicht.',
    errorMessage: 'Promotion fehlgeschlagen, bitte versuchen Sie es später erneut.',
    emptyUrlMessage: 'Bitte geben Sie eine URL ein',
    infoTitle: 'Wie es funktioniert',
    infoItems: [
      'Automatische Einreichung bei großen Suchmaschinen',
      'Auf Social-Media-Plattformen teilen',
      'Werbelinks generieren',
      'Werbeeffektivität überwachen',
    ],
  },
  ar: {
    title: 'أداة الترويج التلقائي',
    subtitle: 'أدخل عنوان URL الخاص بك وسنساعدك في الترويج له لجميع المستخدمين على الإنترنت.',
    urlLabel: 'عنوان URL:',
    urlPlaceholder: 'أدخل عنوان URL الكامل، مثال: https://example.com',
    submitButton: 'بدء الترويج',
    submittingButton: 'جاري الترويج...',
    successMessage: 'تم الترويج بنجاح! تم نشر عنوان URL الخاص بك على الإنترنت.',
    errorMessage: 'فشل الترويج، يرجى المحاولة مرة أخرى لاحقًا.',
    emptyUrlMessage: 'يرجى إدخال عنوان URL',
    infoTitle: 'كيفية العمل',
    infoItems: [
      'الإرسال التلقائي إلى محركات البحث الرئيسية',
      'المشاركة على منصات التواصل الاجتماعي',
      'إنشاء روابط ترويجية',
      'مراقبة فعالية الترويج',
    ],
  },
  fr: {
    title: 'Outil de promotion automatique',
    subtitle: "Entrez votre URL et nous vous aiderons à la promouvoir à tous les utilisateurs sur Internet.",
    urlLabel: 'URL:',
    urlPlaceholder: "Entrez l'URL complète, par exemple : https://example.com",
    submitButton: 'Démarrer la promotion',
    submittingButton: 'Promotion en cours...',
    successMessage: 'Promotion réussie ! Votre URL a été mise en ligne sur Internet.',
    errorMessage: 'Échec de la promotion, veuillez réessayer plus tard.',
    emptyUrlMessage: 'Veuillez entrer une URL',
    infoTitle: 'Comment ça fonctionne',
    infoItems: [
      'Soumission automatique aux principaux moteurs de recherche',
      'Partage sur les plateformes de réseaux sociaux',
      'Génération de liens de promotion',
      "Surveillance de l'efficacité de la promotion",
    ],
  },
};

/**
 * 国家代码 → 语言映射
 * 未列出的国家默认返回英语
 */
export const countryToLanguage: Record<string, Language> = {
  // 中文地区
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  // 日语
  JP: 'ja',
  // 德语
  DE: 'de', AT: 'de', CH: 'de',
  // 法语
  FR: 'fr', BE: 'fr', LU: 'fr',
  // 阿拉伯语
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar',
  KW: 'ar', LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar',
  QA: 'ar', SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar',
  DZ: 'ar', SD: 'ar', PS: 'ar',
  // 英语
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
  NZ: 'en', IE: 'en', ZA: 'en', IN: 'en',
};

export const getLanguageByCountry = (countryCode: string): Language => {
  return countryToLanguage[countryCode.toUpperCase()] ?? 'en';
};

/**
 * 检测用户语言（优先使用浏览器语言，无需外部 API）
 * 保持 async 签名以保持与调用方的兼容性
 */
export const detectLanguage = async (): Promise<Language> => {
  try {
    const browserLang = navigator.language.split('-')[0];
    if (['zh', 'en', 'fr', 'ja', 'de', 'ar'].includes(browserLang)) {
      return browserLang as Language;
    }
    return 'en';
  } catch {
    return 'en';
  }
};
