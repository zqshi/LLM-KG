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
      category: 'technology',
      status: 'active',
      fetchInterval: 30,
      lastFetch: '2024-01-15 10:30:00',
      nextFetch: '2024-01-15 11:00:00',
      totalFetched: 1245,
      todayFetched: 25,
      successRate: 98.5,
      creator: '系统管理员',
      createTime: '2024-01-10 09:00:00',
      config: {
        titleSelector: 'title',
        contentSelector: 'description',
        dateSelector: 'pubDate',
        authorSelector: 'author'
      }
    },
    {
      id: 2,
      name: '新浪财经API',
      type: 'api',
      url: 'https://finance.sina.com.cn/api/news',
      category: 'finance',
      status: 'active',
      fetchInterval: 15,
      lastFetch: '2024-01-15 10:45:00',
      nextFetch: '2024-01-15 11:00:00',
      totalFetched: 2156,
      todayFetched: 42,
      successRate: 95.2,
      creator: '内容管理员',
      createTime: '2024-01-08 14:30:00',
      config: {
        apiKey: 'hidden',
        format: 'json',
        limit: 50
      }
    },
    {
      id: 3,
      name: '网易新闻爬虫',
      type: 'crawler',
      url: 'https://news.163.com',
      category: 'general',
      status: 'inactive',
      fetchInterval: 60,
      lastFetch: '2024-01-14 20:15:00',
      nextFetch: null,
      totalFetched: 856,
      todayFetched: 0,
      successRate: 89.7,
      creator: '技术管理员',
      createTime: '2024-01-05 11:20:00',
      config: {
        listSelector: '.news-list li',
        titleSelector: '.title a',
        linkSelector: '.title a',
        dateSelector: '.time'
      }
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
      content: '近日，国内外多家科技公司在人工智能领域取得重大进展...',
      summary: '人工智能技术在多个领域实现突破性发展',
      author: '李科技',
      source: '科技日报',
      sourceId: 1,
      sourceUrl: 'https://www.kjrb.com/news/123456',
      category: 'technology',
      tags: ['人工智能', '科技', '突破'],
      publishTime: '2024-01-15 09:30:00',
      fetchTime: '2024-01-15 10:30:00',
      status: 'published',
      qualityScore: 85,
      viewCount: 1256,
      shareCount: 45,
      auditStatus: 'approved',
      auditor: '内容审核员',
      auditTime: '2024-01-15 09:45:00',
      duplicateCount: 0,
      isTop: false,
      isRecommend: true,
      visibility: ['public']
    },
    {
      id: 2,
      title: '股市今日大涨，科技股表现亮眼',
      content: '今日A股市场表现强劲，特别是科技板块领涨...',
      summary: 'A股科技板块今日表现强劲',
      author: '张财经',
      source: '新浪财经',
      sourceId: 2,
      sourceUrl: 'https://finance.sina.com.cn/news/789012',
      category: 'finance',
      tags: ['股市', '科技股', '大涨'],
      publishTime: '2024-01-15 11:15:00',
      fetchTime: '2024-01-15 11:45:00',
      status: 'published',
      qualityScore: 78,
      viewCount: 892,
      shareCount: 23,
      auditStatus: 'approved',
      auditor: '财经编辑',
      auditTime: '2024-01-15 11:30:00',
      duplicateCount: 1,
      isTop: true,
      isRecommend: true,
      visibility: ['public']
    },
    {
      id: 3,
      title: '新能源汽车销量再创新高',
      content: '据最新统计数据显示，本月新能源汽车销量突破历史记录...',
      summary: '新能源汽车市场持续增长',
      author: '王汽车',
      source: '汽车之家',
      sourceId: 1,
      sourceUrl: 'https://www.autohome.com.cn/news/345678',
      category: 'automobile',
      tags: ['新能源', '汽车', '销量'],
      publishTime: '2024-01-15 14:20:00',
      fetchTime: '2024-01-15 14:50:00',
      status: 'pending',
      qualityScore: 82,
      viewCount: 456,
      shareCount: 12,
      auditStatus: 'pending',
      auditor: null,
      auditTime: null,
      duplicateCount: 0,
      isTop: false,
      isRecommend: false,
      visibility: ['public']
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
      type: 'fetch',
      status: 'completed',
      startTime: '2024-01-15 10:30:00',
      endTime: '2024-01-15 10:32:15',
      duration: 135,
      fetchedCount: 12,
      processedCount: 10,
      successCount: 9,
      failedCount: 1,
      duplicateCount: 2,
      errorMessage: null,
      creator: '系统定时任务',
      progress: 100
    },
    {
      id: 2,
      sourceId: 2,
      sourceName: '新浪财经API',
      type: 'fetch',
      status: 'running',
      startTime: '2024-01-15 11:00:00',
      endTime: null,
      duration: null,
      fetchedCount: 25,
      processedCount: 20,
      successCount: 18,
      failedCount: 2,
      duplicateCount: 5,
      errorMessage: null,
      creator: '系统定时任务',
      progress: 65
    },
    {
      id: 3,
      sourceId: 3,
      sourceName: '网易新闻爬虫',
      type: 'test',
      status: 'failed',
      startTime: '2024-01-15 09:15:00',
      endTime: '2024-01-15 09:16:30',
      duration: 75,
      fetchedCount: 0,
      processedCount: 0,
      successCount: 0,
      failedCount: 1,
      duplicateCount: 0,
      errorMessage: '连接超时，无法访问目标网站',
      creator: '管理员',
      progress: 0
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
      taskId: 1,
      level: 'info',
      message: '成功获取12篇新闻',
      details: { fetchedCount: 12, processedCount: 10, successCount: 9 },
      timestamp: '2024-01-15 10:32:15'
    },
    {
      id: 2,
      sourceId: 2,
      sourceName: '新浪财经API',
      taskId: 2,
      level: 'warning',
      message: 'API响应时间较慢',
      details: { responseTime: 3500, threshold: 2000 },
      timestamp: '2024-01-15 11:05:30'
    },
    {
      id: 3,
      sourceId: 3,
      sourceName: '网易新闻爬虫',
      taskId: 3,
      level: 'error',
      message: '连接超时，无法访问目标网站',
      details: { error: 'Connection timeout', url: 'https://news.163.com' },
      timestamp: '2024-01-15 09:16:30'
    }
  ]
}

/**
 * 新闻源统计数据
 */
export const newsSourceStats = async (): Promise<NewsSourceStats> => {
  return {
    totalSources: 15,
    activeSources: 12,
    inactiveSources: 3,
    todayFetched: 156,
    totalFetched: 12456,
    avgSuccessRate: 94.2,
    sourcesByType: [
      { type: 'rss', count: 8 },
      { type: 'api', count: 4 },
      { type: 'crawler', count: 3 }
    ],
    sourcesByCategory: [
      { category: 'technology', count: 6 },
      { category: 'finance', count: 4 },
      { category: 'general', count: 3 },
      { category: 'sports', count: 2 }
    ]
  }
}

/**
 * 新闻统计数据
 */
export const newsStats = async (): Promise<NewsStats> => {
  return {
    totalNews: 8756,
    todayNews: 45,
    pendingNews: 12,
    publishedNews: 8532,
    rejectedNews: 212,
    avgQualityScore: 78.5,
    newsByCategory: [
      { category: 'technology', count: 2856, percentage: 32.6 },
      { category: 'finance', count: 2145, percentage: 24.5 },
      { category: 'general', count: 1876, percentage: 21.4 },
      { category: 'sports', count: 1879, percentage: 21.5 }
    ],
    qualityDistribution: [
      { range: '90-100', count: 1245 },
      { range: '80-90', count: 2856 },
      { range: '70-80', count: 3456 },
      { range: '60-70', count: 1199 }
    ],
    trendData: [
      { date: '2024-01-10', count: 42, avgScore: 76.5 },
      { date: '2024-01-11', count: 38, avgScore: 78.2 },
      { date: '2024-01-12', count: 51, avgScore: 79.1 },
      { date: '2024-01-13', count: 46, avgScore: 77.8 },
      { date: '2024-01-14', count: 49, avgScore: 78.9 },
      { date: '2024-01-15', count: 45, avgScore: 78.5 }
    ]
  }
}

/**
 * 新闻任务统计数据
 */
export const newsTaskStats = async (): Promise<NewsTaskStats> => {
  return {
    totalTasks: 456,
    runningTasks: 3,
    completedTasks: 398,
    failedTasks: 55,
    avgDuration: 125,
    successRate: 87.3,
    tasksByType: [
      { type: 'fetch', count: 380 },
      { type: 'test', count: 76 }
    ],
    statusDistribution: [
      { name: '已完成', value: 398 },
      { name: '运行中', value: 3 },
      { name: '失败', value: 55 }
    ]
  }
}

/**
 * 组织架构数据
 */
export const organizations = async (): Promise<OrganizationNode[]> => {
  return [
    {
      id: 1,
      name: '总部',
      type: 'department',
      parentId: null,
      children: [
        {
          id: 2,
          name: '技术部',
          type: 'department',
          parentId: 1,
          children: []
        },
        {
          id: 3,
          name: '内容部',
          type: 'department',
          parentId: 1,
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