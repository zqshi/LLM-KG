import type {
  NewsSource,
  NewsArticle,
  NewsStats,
  NewsSourceStats,
  NewsTask,
  NewsTaskStats,
  NewsLogEntry,
  OrganizationNode
} from '@/types'

/**
 * 新闻源静态数据
 */
export const newsSources = async (): Promise<NewsSource[]> => {
  return [
    {
      id: 1,
      name: '科技日报RSS',
      type: 'rss',
      url: 'https://www.kjrb.com/rss/news.xml',
      category: ['technology'],
      status: 'active',
      lastFetchTime: '2024-01-15 10:30:00',
      requiresReview: true,
      autoDedup: true,
      autoCategory: false,
      healthScore: 98,
      successRate: 98.5,
      todayFetchCount: 25,
      createTime: '2024-01-10 09:00:00',
      selectorTitle: 'title',
      selectorContent: 'description'
    },
    {
      id: 2,
      name: '新浪财经API',
      type: 'api',
      url: 'https://finance.sina.com.cn/api/news',
      category: ['finance'],
      status: 'active',
      lastFetchTime: '2024-01-15 10:45:00',
      requiresReview: true,
      autoDedup: true,
      autoCategory: false,
      healthScore: 95,
      successRate: 95.2,
      todayFetchCount: 42,
      createTime: '2024-01-08 14:30:00',
      method: 'GET'
    },
    {
      id: 3,
      name: '网易新闻爬虫',
      type: 'crawler',
      url: 'https://news.163.com',
      category: ['general'],
      status: 'inactive',
      lastFetchTime: '2024-01-14 20:15:00',
      requiresReview: true,
      autoDedup: true,
      autoCategory: false,
      healthScore: 90,
      successRate: 89.7,
      todayFetchCount: 0,
      createTime: '2024-01-05 11:20:00',
      contentSelector: '.news-list li',
      titleSelector: '.title a',
      linkSelector: '.title a'
    }
  ]
}

/**
 * 新闻文章静态数据
 */
export const newsArticles = async (): Promise<NewsArticle[]> => {
  return [
    {
      id: 1,
      title: 'AI技术发展迎来新突破',
      description: '人工智能技术在多个领域实现突破性发展',
      cleanContent: '近日，国内外多家科技公司在人工智能领域取得重大进展...',
      sourceName: '科技日报',
      sourceId: 1,
      sourceUrl: 'https://www.kjrb.com/news/123456',
      sourceType: 'rss',
      category: 'technology',
      tags: ['人工智能', '科技', '突破'],
      publishTime: '2024-01-15 09:30:00',
      fetchTime: '2024-01-15 10:30:00',
      status: 'published',
      qualityScore: 85,
      viewCount: 1256,
      likeCount: 45,
      isDuplicate: false,
      createTime: '2024-01-15 09:30:00'
    },
    {
      id: 2,
      title: '股市今日大涨，科技股表现亮眼',
      description: 'A股科技板块今日表现强劲',
      cleanContent: '今日A股市场表现强劲，特别是科技板块领涨...',
      sourceName: '新浪财经',
      sourceId: 2,
      sourceUrl: 'https://finance.sina.com.cn/news/789012',
      sourceType: 'api',
      category: 'finance',
      tags: ['股市', '科技股', '大涨'],
      publishTime: '2024-01-15 11:15:00',
      fetchTime: '2024-01-15 11:45:00',
      status: 'published',
      qualityScore: 78,
      viewCount: 892,
      likeCount: 23,
      isDuplicate: true,
      similarity: 85,
      createTime: '2024-01-15 11:15:00'
    },
    {
      id: 3,
      title: '新能源汽车销量再创新高',
      description: '新能源汽车市场持续增长',
      cleanContent: '据最新统计数据显示，本月新能源汽车销量突破历史记录...',
      sourceName: '汽车之家',
      sourceId: 1,
      sourceUrl: 'https://www.autohome.com.cn/news/345678',
      sourceType: 'crawler',
      category: 'automobile',
      tags: ['新能源', '汽车', '销量'],
      publishTime: '2024-01-15 14:20:00',
      fetchTime: '2024-01-15 14:50:00',
      status: 'pending',
      qualityScore: 82,
      viewCount: 456,
      likeCount: 12,
      isDuplicate: false,
      createTime: '2024-01-15 14:20:00'
    },
    // 为内容池演示新增的5条数据
    {
      id: 4,
      title: '5G技术在智慧城市建设中的应用',
      description: '5G技术推动智慧城市发展',
      cleanContent: '随着5G技术的快速发展，其在智慧城市建设中的应用越来越广泛。从智能交通到环境监测，5G为城市管理提供了全新的解决方案...',
      sourceName: '通信产业报',
      sourceId: 1,
      sourceUrl: 'https://www.txcb.com/news/5g-smart-city',
      sourceType: 'rss',
      category: 'technology',
      tags: ['5G', '智慧城市', '通信'],
      publishTime: '2024-01-16 10:15:00',
      fetchTime: '2024-01-16 11:30:00',
      status: 'pending',
      qualityScore: 88,
      viewCount: 0,
      likeCount: 0,
      isDuplicate: false,
      createTime: '2024-01-16 10:15:00'
    },
    {
      id: 5,
      title: '数字货币发展现状与未来趋势',
      description: '数字货币改变金融格局',
      cleanContent: '数字货币作为金融科技的重要组成部分，正逐步改变着传统金融体系。本文分析了当前数字货币的发展现状，并展望了未来趋势...',
      sourceName: '金融时报',
      sourceId: 2,
      sourceUrl: 'https://www.jrsb.com/news/digital-currency',
      sourceType: 'api',
      category: 'finance',
      tags: ['数字货币', '金融科技', '区块链'],
      publishTime: '2024-01-16 14:30:00',
      fetchTime: '2024-01-16 15:45:00',
      status: 'pending',
      qualityScore: 92,
      viewCount: 0,
      likeCount: 0,
      isDuplicate: false,
      createTime: '2024-01-16 14:30:00'
    },
    {
      id: 6,
      title: '绿色能源转型加速，太阳能发电成本持续下降',
      description: '太阳能发电成本持续下降',
      cleanContent: '在全球碳中和目标推动下，绿色能源转型步伐不断加快。最新数据显示，太阳能发电成本已连续三年下降，有望成为最具竞争力的能源形式...',
      sourceName: '能源报',
      sourceId: 1,
      sourceUrl: 'https://www.nyb.com/news/solar-energy-cost',
      sourceType: 'rss',
      category: 'technology',
      tags: ['绿色能源', '太阳能', '碳中和'],
      publishTime: '2024-01-17 09:45:00',
      fetchTime: '2024-01-17 11:00:00',
      status: 'pending',
      qualityScore: 85,
      viewCount: 0,
      likeCount: 0,
      isDuplicate: false,
      createTime: '2024-01-17 09:45:00'
    },
    {
      id: 7,
      title: '人工智能在医疗诊断中的应用前景',
      description: 'AI助力医疗诊断精准化',
      cleanContent: '人工智能技术在医疗领域的应用正逐步深入，特别是在医学影像诊断方面展现出巨大潜力。专家预测，AI将在未来五年内显著提升诊断准确率...',
      sourceName: '医学前沿',
      sourceId: 1,
      sourceUrl: 'https://www.yxyq.com/news/ai-medical-diagnosis',
      sourceType: 'rss',
      category: 'technology',
      tags: ['人工智能', '医疗', '诊断'],
      publishTime: '2024-01-17 13:20:00',
      fetchTime: '2024-01-17 14:35:00',
      status: 'pending',
      qualityScore: 90,
      viewCount: 0,
      likeCount: 0,
      isDuplicate: false,
      createTime: '2024-01-17 13:20:00'
    },
    {
      id: 8,
      title: '跨境电商发展迎来新机遇',
      description: '跨境电商发展势头良好',
      cleanContent: '随着全球贸易数字化转型加速，跨境电商正迎来新的发展机遇。政策支持、物流完善和技术进步为行业发展提供了强劲动力...',
      sourceName: '国际贸易报',
      sourceId: 2,
      sourceUrl: 'https://www.gjmyb.com/news/cross-border-ecommerce',
      sourceType: 'api',
      category: 'finance',
      tags: ['跨境电商', '国际贸易', '数字化'],
      publishTime: '2024-01-18 11:00:00',
      fetchTime: '2024-01-18 12:15:00',
      status: 'pending',
      qualityScore: 78,
      viewCount: 0,
      likeCount: 0,
      isDuplicate: false,
      createTime: '2024-01-18 11:00:00'
    }
  ]
}

/**
 * 新闻任务静态数据
 */
export const newsTasks = async (): Promise<NewsTask[]> => {
  return [
    {
      id: 1,
      sourceId: 1,
      sourceName: '科技日报RSS',
      status: 'success',
      startTime: '2024-01-15 10:30:00',
      endTime: '2024-01-15 10:32:15',
      duration: 135,
      fetchCount: 12,
      errorMessage: undefined
    },
    {
      id: 2,
      sourceId: 2,
      sourceName: '新浪财经API',
      status: 'running',
      startTime: '2024-01-15 11:00:00',
      endTime: undefined,
      duration: undefined,
      fetchCount: 25,
      errorMessage: undefined
    },
    {
      id: 3,
      sourceId: 3,
      sourceName: '网易新闻爬虫',
      status: 'failed',
      startTime: '2024-01-15 09:15:00',
      endTime: '2024-01-15 09:16:30',
      duration: 75,
      fetchCount: 0,
      errorMessage: '连接超时，无法访问目标网站'
    }
  ]
}

/**
 * 新闻日志静态数据
 */
export const newsLogs = async (): Promise<NewsLogEntry[]> => {
  return [
    {
      id: 1,
      sourceId: 1,
      sourceName: '科技日报RSS',
      time: '2024-01-15 10:32:15',
      level: 'success',
      message: '成功获取12篇新闻',
      fetchCount: 12,
      duration: 135
    },
    {
      id: 2,
      sourceId: 2,
      sourceName: '新浪财经API',
      time: '2024-01-15 11:05:30',
      level: 'warning',
      message: 'API响应时间较慢',
      fetchCount: 25,
      duration: 3500
    },
    {
      id: 3,
      sourceId: 3,
      sourceName: '网易新闻爬虫',
      time: '2024-01-15 09:16:30',
      level: 'error',
      message: '连接超时，无法访问目标网站',
      fetchCount: 0,
      duration: 75
    }
  ]
}

/**
 * 新闻源统计数据
 */
export const newsSourceStats = async (): Promise<NewsSourceStats> => {
  return {
    active: 12,
    warning: 2,
    error: 1,
    totalFetched: 12456
  }
}

/**
 * 新闻统计数据
 */
export const newsStats = async (): Promise<NewsStats> => {
  return {
    pendingCount: 12,
    duplicateCount: 5,
    todayApproved: 45,
    avgProcessTime: 12.5,
    totalFetched: 8756,
    activeSourceCount: 12,
    errorSourceCount: 3
  }
}

/**
 * 新闻任务统计数据
 */
export const newsTaskStats = async (): Promise<NewsTaskStats> => {
  return {
    runningTasks: 3,
    todaySuccess: 45,
    todayFailed: 5,
    totalFetched: 1245
  }
}

/**
 * 组织架构数据
 */
export const organizations = async (): Promise<OrganizationNode[]> => {
  return [
    {
      id: '1',
      name: '总部',
      type: 'department',
      parentId: undefined,
      children: [
        {
          id: '2',
          name: '技术部',
          type: 'department',
          parentId: '1',
          children: []
        },
        {
          id: '3',
          name: '内容部',
          type: 'department',
          parentId: '1',
          children: []
        }
      ]
    }
  ]
}

/**
 * 新闻分类数据
 */
export const newsCategories = async () => {
  return [
    { code: 'technology', name: '科技', color: '#1890ff' },
    { code: 'finance', name: '财经', color: '#52c41a' },
    { code: 'general', name: '综合', color: '#722ed1' },
    { code: 'sports', name: '体育', color: '#fa541c' },
    { code: 'entertainment', name: '娱乐', color: '#eb2f96' },
    { code: 'automobile', name: '汽车', color: '#13c2c2' }
  ]
}

/**
 * 新闻标签数据
 */
export const newsTags = async (keyword?: string): Promise<string[]> => {
  const allTags = [
    '人工智能', '机器学习', '区块链', '云计算', '大数据',
    '股市', '基金', '投资', '理财', '经济',
    '足球', '篮球', '网球', '游泳', '跑步',
    '电影', '音乐', '明星', '综艺', '电视剧',
    '新能源', '电动汽车', '自动驾驶', '汽车评测', '车展'
  ]
  
  if (keyword) {
    return allTags.filter(tag => tag.includes(keyword))
  }
  return allTags
}

/**
 * 系统配置数据
 */
export const systemConfig = async () => {
  return {
    maxDailyFetch: 1000,
    duplicateThreshold: 0.85,
    autoPublishDelay: 30,
    qualityScoreThreshold: 70,
    autoAuditEnabled: true,
    fetchRetryLimit: 3,
    logRetentionDays: 30
  }
}