export type Language = 'zh' | 'en' | 'fr' | 'de' | 'ja' | 'ar'

export const RTL_LANGUAGES = new Set<Language>(['ar'])

export interface Translations {
  title: string
  subtitle: string
  urlLabel: string
  urlPlaceholder: string
  submitButton: string
  submittingButton: string
  successMessage: string
  errorMessage: string
  emptyUrlMessage: string
  invalidUrlMessage: string
  infoTitle: string
  infoItems: string[]
  langLabel: string
  // 上传
  uploadTitle: string
  uploadHint: string
  uploadDrag: string
  uploadSupport: string
  uploadBrowse: string
  uploadFiles: string
  uploadTotalSize: string
  uploadClear: string
  uploadRemove: string
  // 统计表格
  tableStats: {
    title: string; rank: string; domain: string; traffic: string
    visits: string; conversion: string; bounce: string; duration: string
  }
  // 推广详情表格
  tablePromotion: {
    title: string; address: string; domain: string; platform: string
    linkCount: string; status: string; subdomainLabel: string
  }
  // 智能客服
  chatTitle: string
  chatSubtitle: string
  chatWelcome: string
  chatTyping: string
  chatOnline: string
  chatMinimize: string
  chatClose: string
  chatNewSession: string
  chatPowered: string
  chatFaqs: string[]
  chatPlaceholder: string
  chatSend: string
  // 实时监控面板
  monitorTitle: string
  monitorOnlineNow: string
  monitorTodayVisits: string
  monitorTotalPromotions: string
  monitorStatus: string
  monitorStatusRunning: string
  monitorLastUpdate: string
  monitorPlatformsCovered: string
  // AI 多模态推广类型
  multimodalTitle: string
  multimodalTypes: { id: string; label: string; icon: string; desc: string }[]
  // 全球推广渠道
  channelsTitle: string
  // 定时自动推送
  scheduleTitle: string
  scheduleDefaultUrl: string
  scheduleNextPush: string
  scheduleLastPush: string
  scheduleStatus: string
  scheduleStatusActive: string
  scheduleHistoryTitle: string
  scheduleHistoryEmpty: string
  scheduleInterval: string
  scheduleChannelCount: string
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
    invalidUrlMessage: '请输入有效的 http 或 https 网址',
    infoTitle: '推广原理',
    infoItems: ['自动提交到各大搜索引擎', '分享到社交媒体平台', '生成推广链接', '监控推广效果'],
    langLabel: '语言',
    uploadTitle: '上传推广素材',
    uploadHint: '点击或拖拽文件到此处上传',
    uploadDrag: '松开即可上传',
    uploadSupport: '支持图片、视频、音频、文档、压缩包等所有格式',
    uploadBrowse: '浏览文件',
    uploadFiles: '已上传文件',
    uploadTotalSize: '总大小',
    uploadClear: '清空',
    uploadRemove: '删除',
    tableStats: {
      title: '访客统计数据',
      rank: '排名', domain: '域名', traffic: '总访客数',
      visits: '独立访客', conversion: '转化率', bounce: '跳出率', duration: '平均停留时间',
    },
    tablePromotion: {
      title: '推广效果详情',
      address: '推广地址', domain: '域名', platform: '平台/引擎',
      linkCount: '链接次数', status: '状态', subdomainLabel: 'yndxw.com 子域名推广结果',
    },
    chatTitle: 'AI 智能客服',
    chatSubtitle: '全天候在线',
    chatWelcome: '👋 您好！欢迎使用自动推广工具。\n\n我可以帮您解答推广相关的任何问题，请随时提问！',
    chatTyping: 'AI 正在输入...',
    chatOnline: '在线',
    chatMinimize: '最小化',
    chatClose: '关闭',
    chatNewSession: '新会话',
    chatPowered: 'Powered by AI · 全天候智能客服',
    chatFaqs: ['如何开始推广？', '支持哪些平台？', '推广效果如何？', '如何上传文件？'],
    chatPlaceholder: '输入您的问题...',
    chatSend: '发送',
    monitorTitle: '实时推广监控',
    monitorOnlineNow: '当前在线',
    monitorTodayVisits: '今日访问',
    monitorTotalPromotions: '累计推广',
    monitorStatus: '系统状态',
    monitorStatusRunning: '运行中',
    monitorLastUpdate: '最后更新',
    monitorPlatformsCovered: '覆盖平台',
    multimodalTitle: 'AI 多模态推广类型',
    multimodalTypes: [
      { id: 'text',    icon: '📝', label: '文本',  desc: '文章、博客、社媒帖子' },
      { id: 'voice',   icon: '🎙️', label: '语音',  desc: '播客、语音广告、音频内容' },
      { id: 'video',   icon: '🎬', label: '视频',  desc: '短视频、直播、教程' },
      { id: 'file',    icon: '📁', label: '文件',  desc: 'PDF、文档、报告' },
      { id: 'program', icon: '💻', label: '程序',  desc: 'App、工具、插件' },
      { id: 'email',   icon: '📧', label: '邮件',  desc: 'EDM、通讯、新闻信' },
    ],
    channelsTitle: '全球推广渠道',
    scheduleTitle: '整点定时自动推送',
    scheduleDefaultUrl: '默认推送地址',
    scheduleNextPush: '下次推送',
    scheduleLastPush: '上次推送',
    scheduleStatus: '任务状态',
    scheduleStatusActive: '运行中',
    scheduleHistoryTitle: '推送历史',
    scheduleHistoryEmpty: '暂无推送记录',
    scheduleInterval: '每整点自动推送',
    scheduleChannelCount: '个渠道',
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
    invalidUrlMessage: 'Please enter a valid http or https URL',
    infoTitle: 'How It Works',
    infoItems: ['Auto-submit to major search engines', 'Share to social media platforms', 'Generate promotion links', 'Monitor promotion effectiveness'],
    langLabel: 'Language',
    uploadTitle: 'Upload Promotion Materials',
    uploadHint: 'Click or drag files here to upload',
    uploadDrag: 'Release to upload',
    uploadSupport: 'Supports images, videos, audio, documents, archives and more',
    uploadBrowse: 'Browse Files',
    uploadFiles: 'Uploaded Files',
    uploadTotalSize: 'Total size',
    uploadClear: 'Clear',
    uploadRemove: 'Remove',
    tableStats: {
      title: 'Visitor Statistics',
      rank: 'Rank', domain: 'Domain', traffic: 'Total Visitors',
      visits: 'Unique Visitors', conversion: 'Conv. Rate', bounce: 'Bounce Rate', duration: 'Avg Duration',
    },
    tablePromotion: {
      title: 'Promotion Results',
      address: 'Address', domain: 'Domain', platform: 'Platform',
      linkCount: 'Links', status: 'Status', subdomainLabel: 'yndxw.com Subdomain Results',
    },
    chatTitle: 'AI Support',
    chatSubtitle: '24/7 Online',
    chatWelcome: '👋 Hello! Welcome to the Auto Promotion Tool.\n\nI can help you with any questions about promotion. Feel free to ask!',
    chatTyping: 'AI is typing...',
    chatOnline: 'Online',
    chatMinimize: 'Minimize',
    chatClose: 'Close',
    chatNewSession: 'New Session',
    chatPowered: 'Powered by AI · 24/7 Smart Support',
    chatFaqs: ['How to start promotion?', 'Which platforms are supported?', 'How effective is promotion?', 'How to upload files?'],
    chatPlaceholder: 'Type your question...',
    chatSend: 'Send',
    monitorTitle: 'Live Promotion Monitor',
    monitorOnlineNow: 'Online Now',
    monitorTodayVisits: "Today's Visits",
    monitorTotalPromotions: 'Total Promotions',
    monitorStatus: 'System Status',
    monitorStatusRunning: 'Running',
    monitorLastUpdate: 'Last Update',
    monitorPlatformsCovered: 'Platforms',
    multimodalTitle: 'AI Multimodal Promotion Types',
    multimodalTypes: [
      { id: 'text',    icon: '📝', label: 'Text',    desc: 'Articles, blogs, social posts' },
      { id: 'voice',   icon: '🎙️', label: 'Voice',   desc: 'Podcasts, audio ads, voice content' },
      { id: 'video',   icon: '🎬', label: 'Video',   desc: 'Short videos, live streams, tutorials' },
      { id: 'file',    icon: '📁', label: 'File',    desc: 'PDFs, documents, reports' },
      { id: 'program', icon: '💻', label: 'Program', desc: 'Apps, tools, plugins' },
      { id: 'email',   icon: '📧', label: 'Email',   desc: 'EDM, newsletters, mailings' },
    ],
    channelsTitle: 'Global Promotion Channels',
    scheduleTitle: 'Hourly Auto Push',
    scheduleDefaultUrl: 'Default Push URL',
    scheduleNextPush: 'Next Push',
    scheduleLastPush: 'Last Push',
    scheduleStatus: 'Task Status',
    scheduleStatusActive: 'Active',
    scheduleHistoryTitle: 'Push History',
    scheduleHistoryEmpty: 'No push records yet',
    scheduleInterval: 'Auto push every hour',
    scheduleChannelCount: 'channels',
  },

  fr: {
    title: 'Outil de promotion automatique',
    subtitle: "Entrez votre URL et nous vous aiderons à la promouvoir à tous les utilisateurs sur Internet.",
    urlLabel: 'URL :',
    urlPlaceholder: "Entrez l'URL complète, par exemple : https://example.com",
    submitButton: 'Démarrer la promotion',
    submittingButton: 'Promotion en cours...',
    successMessage: 'Promotion réussie ! Votre URL a été mise en ligne sur Internet.',
    errorMessage: 'Échec de la promotion, veuillez réessayer plus tard.',
    emptyUrlMessage: 'Veuillez entrer une URL',
    invalidUrlMessage: 'Veuillez entrer une URL http ou https valide',
    infoTitle: 'Comment ça fonctionne',
    infoItems: ['Soumission automatique aux moteurs de recherche', 'Partage sur les réseaux sociaux', 'Génération de liens de promotion', "Surveillance de l'efficacité"],
    langLabel: 'Langue',
    uploadTitle: 'Télécharger des supports',
    uploadHint: 'Cliquez ou déposez des fichiers ici',
    uploadDrag: 'Relâchez pour télécharger',
    uploadSupport: 'Supporte images, vidéos, audio, documents et plus',
    uploadBrowse: 'Parcourir',
    uploadFiles: 'Fichiers téléchargés',
    uploadTotalSize: 'Taille totale',
    uploadClear: 'Effacer',
    uploadRemove: 'Supprimer',
    tableStats: {
      title: 'Statistiques visiteurs',
      rank: 'Rang', domain: 'Domaine', traffic: 'Total visiteurs',
      visits: 'Visiteurs uniques', conversion: 'Taux conv.', bounce: 'Taux de rebond', duration: 'Durée moy.',
    },
    tablePromotion: {
      title: 'Résultats de promotion',
      address: 'Adresse', domain: 'Domaine', platform: 'Plateforme',
      linkCount: 'Liens', status: 'Statut', subdomainLabel: 'Résultats sous-domaines yndxw.com',
    },
    chatTitle: 'Support IA',
    chatSubtitle: 'En ligne 24h/24',
    chatWelcome: "👋 Bonjour ! Bienvenue sur l'outil de promotion automatique.\n\nJe peux répondre à toutes vos questions sur la promotion.",
    chatTyping: "L'IA est en train d'écrire...",
    chatOnline: 'En ligne',
    chatMinimize: 'Réduire',
    chatClose: 'Fermer',
    chatNewSession: 'Nouvelle session',
    chatPowered: 'Propulsé par IA · Support intelligent 24/7',
    chatFaqs: ['Comment démarrer la promotion ?', 'Quelles plateformes sont supportées ?', "Quelle est l'efficacité ?", 'Comment télécharger des fichiers ?'],
    chatPlaceholder: 'Posez votre question...',
    chatSend: 'Envoyer',
    monitorTitle: 'Surveillance en direct',
    monitorOnlineNow: 'En ligne maintenant',
    monitorTodayVisits: "Visites aujourd'hui",
    monitorTotalPromotions: 'Promotions totales',
    monitorStatus: 'État du système',
    monitorStatusRunning: 'En cours',
    monitorLastUpdate: 'Dernière mise à jour',
    monitorPlatformsCovered: 'Plateformes',
    multimodalTitle: 'Types de promotion multimodale IA',
    multimodalTypes: [
      { id: 'text',    icon: '📝', label: 'Texte',       desc: 'Articles, blogs, posts sociaux' },
      { id: 'voice',   icon: '🎙️', label: 'Voix',        desc: 'Podcasts, publicités audio' },
      { id: 'video',   icon: '🎬', label: 'Vidéo',       desc: 'Courtes vidéos, tutoriels' },
      { id: 'file',    icon: '📁', label: 'Fichier',     desc: 'PDF, documents, rapports' },
      { id: 'program', icon: '💻', label: 'Programme',   desc: 'Apps, outils, plugins' },
      { id: 'email',   icon: '📧', label: 'Email',       desc: 'EDM, newsletters' },
    ],
    channelsTitle: 'Canaux de promotion mondiaux',
    scheduleTitle: 'Envoi automatique horaire',
    scheduleDefaultUrl: 'URL de push par défaut',
    scheduleNextPush: 'Prochain push',
    scheduleLastPush: 'Dernier push',
    scheduleStatus: 'État de la tâche',
    scheduleStatusActive: 'Actif',
    scheduleHistoryTitle: 'Historique des pushs',
    scheduleHistoryEmpty: 'Aucun enregistrement pour le moment',
    scheduleInterval: 'Push automatique chaque heure',
    scheduleChannelCount: 'canaux',
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
    invalidUrlMessage: 'Bitte geben Sie eine gültige http- oder https-URL ein',
    infoTitle: 'Wie es funktioniert',
    infoItems: ['Automatische Einreichung bei Suchmaschinen', 'Auf Social-Media-Plattformen teilen', 'Werbelinks generieren', 'Werbeeffektivität überwachen'],
    langLabel: 'Sprache',
    uploadTitle: 'Werbematerial hochladen',
    uploadHint: 'Klicken oder Dateien hierher ziehen',
    uploadDrag: 'Loslassen zum Hochladen',
    uploadSupport: 'Unterstützt Bilder, Videos, Audio, Dokumente und mehr',
    uploadBrowse: 'Dateien durchsuchen',
    uploadFiles: 'Hochgeladene Dateien',
    uploadTotalSize: 'Gesamtgröße',
    uploadClear: 'Leeren',
    uploadRemove: 'Entfernen',
    tableStats: {
      title: 'Besucherstatistiken',
      rank: 'Rang', domain: 'Domain', traffic: 'Gesamtbesucher',
      visits: 'Unique Besucher', conversion: 'Konvversionsrate', bounce: 'Absprungrate', duration: 'Ø Verweildauer',
    },
    tablePromotion: {
      title: 'Werbeergebnisse',
      address: 'Adresse', domain: 'Domain', platform: 'Plattform',
      linkCount: 'Links', status: 'Status', subdomainLabel: 'yndxw.com Subdomain-Ergebnisse',
    },
    chatTitle: 'KI-Support',
    chatSubtitle: '24/7 Online',
    chatWelcome: '👋 Hallo! Willkommen beim automatischen Promotion-Tool.\n\nIch beantworte gerne alle Ihre Fragen zur Promotion.',
    chatTyping: 'KI schreibt...',
    chatOnline: 'Online',
    chatMinimize: 'Minimieren',
    chatClose: 'Schließen',
    chatNewSession: 'Neue Sitzung',
    chatPowered: 'Powered by KI · 24/7 Intelligenter Support',
    chatFaqs: ['Wie startet man die Promotion?', 'Welche Plattformen werden unterstützt?', 'Wie effektiv ist die Promotion?', 'Wie lädt man Dateien hoch?'],
    chatPlaceholder: 'Frage eingeben...',
    chatSend: 'Senden',
    monitorTitle: 'Live-Promotion-Monitor',
    monitorOnlineNow: 'Jetzt online',
    monitorTodayVisits: 'Besuche heute',
    monitorTotalPromotions: 'Promotionen gesamt',
    monitorStatus: 'Systemstatus',
    monitorStatusRunning: 'Läuft',
    monitorLastUpdate: 'Letzte Aktualisierung',
    monitorPlatformsCovered: 'Plattformen',
    multimodalTitle: 'KI-Multimodale Promotionstypen',
    multimodalTypes: [
      { id: 'text',    icon: '📝', label: 'Text',      desc: 'Artikel, Blogs, Social Posts' },
      { id: 'voice',   icon: '🎙️', label: 'Sprache',   desc: 'Podcasts, Audio-Werbung' },
      { id: 'video',   icon: '🎬', label: 'Video',     desc: 'Kurzvideos, Tutorials' },
      { id: 'file',    icon: '📁', label: 'Datei',     desc: 'PDFs, Dokumente, Berichte' },
      { id: 'program', icon: '💻', label: 'Programm',  desc: 'Apps, Tools, Plugins' },
      { id: 'email',   icon: '📧', label: 'E-Mail',    desc: 'EDM, Newsletter' },
    ],
    channelsTitle: 'Globale Promotionskanäle',
    scheduleTitle: 'Stündlicher Auto-Push',
    scheduleDefaultUrl: 'Standard-Push-URL',
    scheduleNextPush: 'Nächster Push',
    scheduleLastPush: 'Letzter Push',
    scheduleStatus: 'Aufgabenstatus',
    scheduleStatusActive: 'Aktiv',
    scheduleHistoryTitle: 'Push-Verlauf',
    scheduleHistoryEmpty: 'Noch keine Push-Einträge',
    scheduleInterval: 'Automatischer Push jede Stunde',
    scheduleChannelCount: 'Kanäle',
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
    invalidUrlMessage: '有効なhttpまたはhttpsのURLを入力してください',
    infoTitle: 'プロモーションの仕組み',
    infoItems: ['主要な検索エンジンに自動送信', 'ソーシャルメディアプラットフォームで共有', 'プロモーションリンクの生成', 'プロモーション効果の監視'],
    langLabel: '言語',
    uploadTitle: 'プロモーション素材をアップロード',
    uploadHint: 'クリックまたはここにドラッグ＆ドロップ',
    uploadDrag: '離してアップロード',
    uploadSupport: '画像、動画、音声、ドキュメントなど対応',
    uploadBrowse: 'ファイルを選択',
    uploadFiles: 'アップロードされたファイル',
    uploadTotalSize: '合計サイズ',
    uploadClear: 'クリア',
    uploadRemove: '削除',
    tableStats: {
      title: '訪問者統計',
      rank: '順位', domain: 'ドメイン', traffic: '総訪問者数',
      visits: 'ユニーク訪問者', conversion: 'コンバージョン率', bounce: '直帰率', duration: '平均滞在時間',
    },
    tablePromotion: {
      title: 'プロモーション結果',
      address: 'アドレス', domain: 'ドメイン', platform: 'プラットフォーム',
      linkCount: 'リンク数', status: 'ステータス', subdomainLabel: 'yndxw.com サブドメイン結果',
    },
    chatTitle: 'AIサポート',
    chatSubtitle: '24時間対応',
    chatWelcome: '👋 こんにちは！自動プロモーションツールへようこそ。\n\nプロモーションに関するご質問はお気軽にどうぞ！',
    chatTyping: 'AIが入力中...',
    chatOnline: 'オンライン',
    chatMinimize: '最小化',
    chatClose: '閉じる',
    chatNewSession: '新しいセッション',
    chatPowered: 'Powered by AI · 24時間スマートサポート',
    chatFaqs: ['プロモーションの開始方法は？', 'どのプラットフォームがサポートされていますか？', 'プロモーション効果は？', 'ファイルのアップロード方法は？'],
    chatPlaceholder: '質問を入力...',
    chatSend: '送信',
    monitorTitle: 'リアルタイム監視',
    monitorOnlineNow: '現在オンライン',
    monitorTodayVisits: '本日の訪問',
    monitorTotalPromotions: '累計プロモーション',
    monitorStatus: 'システム状態',
    monitorStatusRunning: '稼働中',
    monitorLastUpdate: '最終更新',
    monitorPlatformsCovered: 'プラットフォーム',
    multimodalTitle: 'AIマルチモーダルプロモーション',
    multimodalTypes: [
      { id: 'text',    icon: '📝', label: 'テキスト',   desc: '記事、ブログ、SNS投稿' },
      { id: 'voice',   icon: '🎙️', label: '音声',       desc: 'ポッドキャスト、音声広告' },
      { id: 'video',   icon: '🎬', label: '動画',       desc: 'ショート動画、チュートリアル' },
      { id: 'file',    icon: '📁', label: 'ファイル',   desc: 'PDF、ドキュメント、レポート' },
      { id: 'program', icon: '💻', label: 'プログラム', desc: 'アプリ、ツール、プラグイン' },
      { id: 'email',   icon: '📧', label: 'メール',     desc: 'EDM、ニュースレター' },
    ],
    channelsTitle: 'グローバルプロモーションチャンネル',
    scheduleTitle: '毎時自動プッシュ',
    scheduleDefaultUrl: 'デフォルトプッシュURL',
    scheduleNextPush: '次回プッシュ',
    scheduleLastPush: '前回プッシュ',
    scheduleStatus: 'タスク状態',
    scheduleStatusActive: '稼働中',
    scheduleHistoryTitle: 'プッシュ履歴',
    scheduleHistoryEmpty: '履歴はありません',
    scheduleInterval: '毎時自動プッシュ',
    scheduleChannelCount: 'チャネル',
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
    invalidUrlMessage: 'يرجى إدخال عنوان URL صحيح يبدأ بـ http أو https',
    infoTitle: 'كيفية العمل',
    infoItems: ['الإرسال التلقائي إلى محركات البحث', 'المشاركة على منصات التواصل الاجتماعي', 'إنشاء روابط ترويجية', 'مراقبة فعالية الترويج'],
    langLabel: 'اللغة',
    uploadTitle: 'رفع مواد الترويج',
    uploadHint: 'انقر أو اسحب الملفات هنا للرفع',
    uploadDrag: 'أفلت للرفع',
    uploadSupport: 'يدعم الصور والفيديو والصوت والمستندات والمزيد',
    uploadBrowse: 'تصفح الملفات',
    uploadFiles: 'الملفات المرفوعة',
    uploadTotalSize: 'الحجم الإجمالي',
    uploadClear: 'مسح الكل',
    uploadRemove: 'حذف',
    tableStats: {
      title: 'إحصائيات الزوار',
      rank: 'الترتيب', domain: 'النطاق', traffic: 'إجمالي الزوار',
      visits: 'زوار فريدون', conversion: 'معدل التحويل', bounce: 'معدل الارتداد', duration: 'متوسط المدة',
    },
    tablePromotion: {
      title: 'نتائج الترويج',
      address: 'العنوان', domain: 'النطاق', platform: 'المنصة',
      linkCount: 'الروابط', status: 'الحالة', subdomainLabel: 'نتائج النطاقات الفرعية لـ yndxw.com',
    },
    chatTitle: 'دعم الذكاء الاصطناعي',
    chatSubtitle: 'متاح على مدار الساعة',
    chatWelcome: '👋 مرحباً! أهلاً بك في أداة الترويج التلقائي.\n\nيمكنني الإجابة على أي أسئلة حول الترويج.',
    chatTyping: 'الذكاء الاصطناعي يكتب...',
    chatOnline: 'متصل',
    chatMinimize: 'تصغير',
    chatClose: 'إغلاق',
    chatNewSession: 'جلسة جديدة',
    chatPowered: 'مدعوم بالذكاء الاصطناعي · دعم ذكي على مدار الساعة',
    chatFaqs: ['كيف تبدأ الترويج؟', 'ما المنصات المدعومة؟', 'ما مدى فعالية الترويج؟', 'كيف ترفع الملفات؟'],
    chatPlaceholder: 'اكتب سؤالك...',
    chatSend: 'إرسال',
    monitorTitle: 'مراقبة الترويج المباشر',
    monitorOnlineNow: 'متصل الآن',
    monitorTodayVisits: 'زيارات اليوم',
    monitorTotalPromotions: 'إجمالي الترويج',
    monitorStatus: 'حالة النظام',
    monitorStatusRunning: 'يعمل',
    monitorLastUpdate: 'آخر تحديث',
    monitorPlatformsCovered: 'المنصات',
    multimodalTitle: 'أنواع الترويج متعدد الوسائط بالذكاء الاصطناعي',
    multimodalTypes: [
      { id: 'text',    icon: '📝', label: 'نص',      desc: 'مقالات، مدونات، منشورات' },
      { id: 'voice',   icon: '🎙️', label: 'صوت',     desc: 'بودكاست، إعلانات صوتية' },
      { id: 'video',   icon: '🎬', label: 'فيديو',   desc: 'فيديوهات قصيرة، دروس' },
      { id: 'file',    icon: '📁', label: 'ملف',     desc: 'PDF، مستندات، تقارير' },
      { id: 'program', icon: '💻', label: 'برنامج',  desc: 'تطبيقات، أدوات، إضافات' },
      { id: 'email',   icon: '📧', label: 'بريد',    desc: 'EDM، النشرات الإخبارية' },
    ],
    channelsTitle: 'قنوات الترويج العالمية',
    scheduleTitle: 'إرسال تلقائي كل ساعة',
    scheduleDefaultUrl: 'عنوان URL الافتراضي',
    scheduleNextPush: 'الإرسال التالي',
    scheduleLastPush: 'آخر إرسال',
    scheduleStatus: 'حالة المهمة',
    scheduleStatusActive: 'نشط',
    scheduleHistoryTitle: 'سجل الإرسال',
    scheduleHistoryEmpty: 'لا توجد سجلات بعد',
    scheduleInterval: 'إرسال تلقائي كل ساعة',
    scheduleChannelCount: 'قناة',
  },
}

/**
 * 国家代码 → 语言映射
 */
export const countryToLanguage: Record<string, Language> = {
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  JP: 'ja',
  DE: 'de', AT: 'de', CH: 'de',
  FR: 'fr', BE: 'fr', LU: 'fr',
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', JO: 'ar',
  KW: 'ar', LB: 'ar', LY: 'ar', MA: 'ar', OM: 'ar',
  QA: 'ar', SY: 'ar', TN: 'ar', YE: 'ar', BH: 'ar',
  DZ: 'ar', SD: 'ar', PS: 'ar',
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
  NZ: 'en', IE: 'en', ZA: 'en', IN: 'en',
}

export const getLanguageByCountry = (countryCode: string): Language =>
  countryToLanguage[countryCode.toUpperCase()] ?? 'en'

/**
 * 语言偏好持久化（localStorage）
 */
export function saveLanguagePreference(lang: Language): void {
  try { localStorage.setItem('promotion-lang', lang) } catch { /* ignore */ }
}

export function getLanguagePreference(): Language | null {
  try {
    const v = localStorage.getItem('promotion-lang')
    return (['zh','en','fr','de','ja','ar'] as Language[]).includes(v as Language)
      ? (v as Language) : null
  } catch { return null }
}

/**
 * 检测用户语言：URL参数 > localStorage > 浏览器语言
 */
export const detectLanguage = async (): Promise<Language> => {
  try {
    // 1. URL 参数
    const urlLang = new URLSearchParams(window.location.search).get('lang')
    if (urlLang && (['zh','en','fr','de','ja','ar'] as string[]).includes(urlLang)) {
      return urlLang as Language
    }
    // 2. localStorage
    const stored = getLanguagePreference()
    if (stored) return stored
    // 3. 浏览器语言
    const browserLang = navigator.language.split('-')[0]
    if ((['zh','en','fr','de','ja','ar'] as string[]).includes(browserLang)) {
      return browserLang as Language
    }
    return 'en'
  } catch {
    return 'en'
  }
}
