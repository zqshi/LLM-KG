const express = require('express')
const cors = require('cors')
const app = express()
const port = 3007

app.use(cors())
app.use(express.json())

// 资讯聚合管理 Mock数据
const mockNewsData = {
  // 资讯源
  sources: [
    {
      id: 1,
      name: '科技资讯RSS',
      type: 'rss',
      url: 'https://www.example.com/tech/rss.xml',
      frequency: '1hour',
      status: 'active',
      category: ['科技', '行业动态'],
      lastFetchTime: '2024-03-01 14:30:00',
      successRate: 95,
      todayFetchCount: 48,
      healthScore: 95,
      autoDedup: true,
      autoCategory: true,
      description: '主流科技媒体RSS订阅'
    },
    {
      id: 2,
      name: '财经API接口',
      type: 'api',
      url: 'https://api.finance.com/news',
      frequency: '30min',
      status: 'active',
      category: ['财经', '政策'],
      lastFetchTime: '2024-03-01 14:00:00',
      successRate: 88,
      todayFetchCount: 72,
      healthScore: 88,
      method: 'GET',
      headers: '{"Authorization": "Bearer xxx"}',
      autoDedup: true,
      autoCategory: false,
      description: '财经资讯API数据源'
    },
    {
      id: 3,
      name: '企业新闻爬虫',
      type: 'crawler',
      url: 'https://www.enterprise-news.com/latest',
      frequency: '2hour',
      status: 'error',
      category: ['企业新闻'],
      lastFetchTime: '2024-03-01 10:00:00',
      successRate: 65,
      todayFetchCount: 0,
      healthScore: 45,
      contentSelector: '.news-list .item',
      titleSelector: '.title a',
      linkSelector: '.title a',
      delay: 3,
      autoDedup: true,
      autoCategory: true,
      description: '企业新闻网站爬虫'
    }
  ],

  // 任务监控
  tasks: [
    {
      id: 'task-001',
      sourceId: 1,
      sourceName: '科技资讯RSS',
      sourceType: 'rss',
      status: 'success',
      startTime: '2024-03-01 14:30:00',
      endTime: '2024-03-01 14:31:15',
      duration: 75000,
      fetchCount: 12,
      errorCount: 0,
      lastError: null,
      progress: 100
    },
    {
      id: 'task-002',
      sourceId: 2,
      sourceName: '财经API接口',
      sourceType: 'api',
      status: 'running',
      startTime: '2024-03-01 14:35:00',
      endTime: null,
      duration: 0,
      fetchCount: 8,
      errorCount: 0,
      lastError: null,
      progress: 60
    },
    {
      id: 'task-003',
      sourceId: 3,
      sourceName: '企业新闻爬虫',
      sourceType: 'crawler',
      status: 'failed',
      startTime: '2024-03-01 13:00:00',
      endTime: '2024-03-01 13:05:00',
      duration: 300000,
      fetchCount: 0,
      errorCount: 1,
      lastError: '连接超时',
      progress: 0
    }
  ],

  // 文章内容池
  articles: [
    {
      id: 1,
      title: '人工智能技术在金融行业的最新应用',
      content: '近年来，人工智能技术在金融行业的应用越来越广泛，从风险控制到客户服务...',
      summary: '探讨AI在金融领域的创新应用和未来发展趋势',
      sourceId: 1,
      sourceName: '科技资讯RSS',
      category: '科技',
      tags: ['人工智能', '金融科技', '行业应用'],
      publishTime: '2024-03-01 12:30:00',
      crawlTime: '2024-03-01 12:35:00',
      status: 'pending',
      priority: 'high',
      qualityScore: 85,
      readCount: 0,
      isDuplicate: false,
      duplicateInfo: null,
      images: ['https://example.com/image1.jpg'],
      originalUrl: 'https://example.com/article1',
      wordCount: 1200,
      sentiment: 'positive',
      reviewer: null,
      reviewTime: null,
      publishedTime: null
    },
    {
      id: 2,
      title: '区块链技术在供应链管理中的创新实践',
      content: '区块链技术以其去中心化、不可篡改的特性，为供应链管理带来了革命性变化...',
      summary: '分析区块链在供应链透明度和效率提升方面的作用',
      sourceId: 2,
      sourceName: '财经API接口',
      category: '科技',
      tags: ['区块链', '供应链', '创新技术'],
      publishTime: '2024-03-01 11:45:00',
      crawlTime: '2024-03-01 11:50:00',
      status: 'approved',
      priority: 'medium',
      qualityScore: 78,
      readCount: 245,
      isDuplicate: true,
      duplicateInfo: {
        duplicateId: 156,
        similarity: 85,
        duplicateTitle: '区块链供应链管理解决方案分析'
      },
      images: [],
      originalUrl: 'https://api.finance.com/article/2',
      wordCount: 950,
      sentiment: 'neutral',
      reviewer: '张编辑',
      reviewTime: '2024-03-01 13:15:00',
      publishedTime: '2024-03-01 13:30:00'
    }
  ],

  // 发布管理
  publishedArticles: [
    {
      id: 1,
      articleId: 2,
      title: '区块链技术在供应链管理中的创新实践',
      status: 'published',
      publishTime: '2024-03-01 13:30:00',
      scheduledTime: '2024-03-01 13:30:00',
      channels: ['官网', '微信公众号', '今日头条'],
      viewCount: 1245,
      likeCount: 89,
      shareCount: 23,
      commentCount: 15,
      publisher: '张编辑',
      publishNote: '热点内容，重点推荐'
    },
    {
      id: 2,
      articleId: 4,
      title: '5G技术推动工业互联网发展新机遇',
      status: 'scheduled',
      publishTime: null,
      scheduledTime: '2024-03-01 16:00:00',
      channels: ['官网', '微博'],
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      commentCount: 0,
      publisher: '王编辑',
      publishNote: '定时发布，关注工业互联网发展'
    }
  ]
}

// 用户认证
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  
  if (username === 'admin' && password === '123456') {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 1,
          username: 'admin',
          name: '系统管理员',
          email: 'admin@company.com',
          groupId: 1,
          group: {
            id: 1,
            name: '信息技术部',
            level: '1',
            sort: 1,
            createTime: '2025-08-30T00:00:00'
          },
          status: 1,
          roles: [{
            id: 1,
            name: '系统管理员',
            code: 'system_admin',
            description: '拥有系统所有权限',
            permissions: [],
            dataScope: 1,
            status: 1,
            createTime: '2025-08-30T00:00:00',
            updateTime: '2025-08-30T00:00:00'
          }],
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        },
        permissions: [
          'dashboard:view',
          'rbac:org:view', 'rbac:org:create', 'rbac:user:view', 'rbac:user:create', 'rbac:role:view', 'rbac:permission:view',
          'content:view', 'content:category:view', 'content:category:create', 'content:category:edit', 'content:category:delete',
          'content:create', 'content:edit', 'content:delete',
          'news:view', 'news:create', 'news:edit', 'banner:view',
          'flea-market:view', 'quotation:view', 'operation:view', 
          'system:view', 'system:logs:view', 'system:alerts:view', 'system:settings:view'
        ],
        // 根据用户需求，admin超级管理员只显示全局仪表盘菜单
        // 但保持完整的权限配置，用户可通过URL直接访问其他页面
        menus: [
          {
            id: 0,
            name: '全局仪表盘',
            path: '/dashboard',
            icon: 'Monitor'
          }
        ]
      }
    })
  } else {
    res.status(401).json({
      code: 401,
      message: '用户名或密码错误'
    })
  }
})

// 获取资讯源列表
app.get('/api/news/sources', (req, res) => {
  res.json({
    code: 200,
    data: mockNewsData.sources,
    total: mockNewsData.sources.length
  })
})

// 获取任务监控数据
app.get('/api/news/tasks', (req, res) => {
  res.json({
    code: 200,
    data: mockNewsData.tasks
  })
})

// 获取任务统计数据
app.get('/api/news/tasks/stats', (req, res) => {
  res.json({
    code: 200,
    data: {
      totalTasks: 156,
      runningTasks: 3,
      successRate: 92.5,
      avgDuration: 125000,
      todayFetched: 1248,
      errorTasks: 12,
      chartData: {
        hourly: [45, 52, 38, 41, 47, 58, 62, 48, 55, 59, 41, 46],
        success: [92, 94, 88, 90, 95, 89, 91, 93, 87, 92, 94, 96],
        sources: [
          { name: 'RSS订阅', value: 680 },
          { name: 'API接口', value: 420 },
          { name: '网页爬虫', value: 148 }
        ]
      }
    }
  })
})

// 获取内容池文章列表
app.get('/api/news/articles', (req, res) => {
  res.json({
    code: 200,
    data: mockNewsData.articles,
    total: mockNewsData.articles.length
  })
})

// 获取发布管理数据
app.get('/api/news/publish', (req, res) => {
  res.json({
    code: 200,
    data: mockNewsData.publishedArticles,
    total: mockNewsData.publishedArticles.length
  })
})

// 获取发布统计数据
app.get('/api/news/publish/stats', (req, res) => {
  res.json({
    code: 200,
    data: {
      todayPublished: 12,
      totalViews: 15642,
      avgEngagement: 4.2,
      topChannels: [
        { name: '官网', count: 45, engagement: 4.5 },
        { name: '微信公众号', count: 32, engagement: 4.8 },
        { name: '今日头条', count: 28, engagement: 3.9 },
        { name: '微博', count: 18, engagement: 3.2 }
      ],
      dailyStats: [
        { date: '03-01', published: 12, views: 2456, engagement: 4.2 },
        { date: '02-29', published: 15, views: 3012, engagement: 4.5 },
        { date: '02-28', published: 8, views: 1824, engagement: 3.8 },
        { date: '02-27', published: 18, views: 3568, engagement: 4.7 },
        { date: '02-26', published: 11, views: 2234, engagement: 4.1 },
        { date: '02-25', published: 14, views: 2891, engagement: 4.3 },
        { date: '02-24', published: 9, views: 1697, engagement: 3.9 }
      ]
    }
  })
})

// 批量操作接口
app.post('/api/news/articles/batch', (req, res) => {
  const { ids, action } = req.body
  console.log('批量操作:', action, '文章ID:', ids)
  
  res.json({
    code: 200,
    message: `批量${action}操作成功`,
    data: { successCount: ids.length, failedCount: 0 }
  })
})


// 立即发布接口
app.post('/api/news/articles/:id/publish', (req, res) => {
  const { id } = req.params
  const { channels, enablePush, note } = req.body
  
  console.log(`文章${id}发布:`, { channels, enablePush, note })
  
  res.json({
    code: 200,
    message: '文章发布成功'
  })
})

// 定时发布接口
app.post('/api/news/articles/:id/schedule', (req, res) => {
  const { id } = req.params
  const { publishTime, channels, enablePush, note } = req.body
  
  console.log(`文章${id}定时发布:`, { publishTime, channels, enablePush, note })
  
  res.json({
    code: 200,
    message: '定时发布设置成功'
  })
})

// 资讯源测试接口
app.post('/api/news/sources/:id/test', (req, res) => {
  const { id } = req.params
  
  setTimeout(() => {
    res.json({
      code: 200,
      message: '资讯源连接测试成功',
      data: {
        responseTime: 1250,
        statusCode: 200,
        contentLength: 2048,
        lastModified: '2024-03-01 14:30:00'
      }
    })
  }, 2000)
})

// 手动抓取接口
app.post('/api/news/sources/:id/fetch', (req, res) => {
  const { id } = req.params
  
  setTimeout(() => {
    res.json({
      code: 200,
      message: '手动抓取完成',
      data: {
        fetchCount: Math.floor(Math.random() * 20) + 5,
        duration: Math.floor(Math.random() * 3000) + 1000
      }
    })
  }, 3000)
})

console.log(`Mock服务器运行在 http://localhost:${port}`)
console.log('可用的API接口:')
console.log('- POST /api/auth/login - 用户登录')
console.log('- GET /api/news/sources - 获取资讯源列表')
console.log('- GET /api/news/tasks - 获取任务监控数据')
console.log('- GET /api/news/tasks/stats - 获取任务统计')
console.log('- GET /api/news/articles - 获取文章列表')
console.log('- GET /api/news/publish - 获取发布管理数据')
console.log('- GET /api/news/publish/stats - 获取发布统计')
console.log('- POST /api/news/articles/batch - 批量操作')
console.log('- POST /api/news/articles/:id/review - 文章审核')
console.log('- POST /api/news/articles/:id/publish - 立即发布')
console.log('- POST /api/news/articles/:id/schedule - 定时发布')
console.log('- POST /api/news/sources/:id/test - 资讯源测试')
console.log('- POST /api/news/sources/:id/fetch - 手动抓取')

// 内容管理API接口
// 内容统计数据
app.get('/api/content/stats', (req, res) => {
  res.json({
    code: 200,
    data: {
      totalContent: 1247,
      published: 1186,
      rejected: 38,
      todayCreated: 45,
      categoryDistribution: [
        { name: '文章', value: 520, percentage: 41.7 },
        { name: '帖子', value: 328, percentage: 26.3 },
        { name: '评论', value: 245, percentage: 19.6 },
        { name: '资讯', value: 154, percentage: 12.4 }
      ],
      moduleDistribution: [
        { name: '知识库', value: 456, percentage: 36.6 },
        { name: '论坛', value: 387, percentage: 31.0 },
        { name: '资讯', value: 248, percentage: 19.9 },
        { name: '运营', value: 156, percentage: 12.5 }
      ]
    }
  })
})

// 内容列表
app.get('/api/content/list', (req, res) => {
  const mockContent = [
    {
      id: 1,
      title: '企业数字化转型的最佳实践',
      type: 'article',
      module: 'knowledge',
      status: 2,
      author: '张三',
      publishTime: '2024-03-01 10:30:00',
      viewCount: 245,
      isTop: true,
      isElite: false,
      isLocked: false
    },
    {
      id: 2,
      title: '关于新版本功能的讨论',
      type: 'post',
      module: 'forum',
      status: 1,
      author: '李四',
      publishTime: null,
      viewCount: 0,
      isTop: false,
      isElite: false,
      isLocked: false
    }
  ]
  
  res.json({
    code: 200,
    data: mockContent,
    total: mockContent.length
  })
})

console.log('- GET /api/content/stats - 获取内容统计')
console.log('- GET /api/content/list - 获取内容列表')

// ======================== 名言管理API ========================

// Mock名言数据
const mockQuotationData = {
  quotations: [
    {
      id: 1,
      content: "实践是检验真理的唯一标准。",
      author: "邓小平",
      source: "1978年讲话",
      category: "理论指导",
      tags: ["实践", "真理", "检验"],
      status: "published",
      createTime: "2024-03-01 09:00:00",
      updateTime: "2024-03-01 09:00:00",
      publishTime: "2024-03-01 10:00:00",
      creatorId: 1,
      creator: "管理员",
      reviewerId: 1,
      reviewer: "审核员",
      reviewTime: "2024-03-01 09:30:00",
      reviewComment: "内容优质，通过审核",
      showCount: 1245,
      likeCount: 89,
      shareCount: 23
    },
    {
      id: 2,
      content: "发展是硬道理，稳定是硬任务。",
      author: "习近平",
      source: "2023年重要讲话",
      category: "发展理念",
      tags: ["发展", "稳定", "任务"],
      status: "pending",
      createTime: "2024-03-01 11:00:00",
      updateTime: "2024-03-01 11:00:00",
      publishTime: null,
      creatorId: 2,
      creator: "编辑员",
      reviewerId: null,
      reviewer: null,
      reviewTime: null,
      reviewComment: null,
      showCount: 0,
      likeCount: 0,
      shareCount: 0
    },
    {
      id: 3,
      content: "绿水青山就是金山银山。",
      author: "习近平",
      source: "生态文明建设重要论述",
      category: "生态文明",
      tags: ["生态", "环境", "发展"],
      status: "published",
      createTime: "2024-02-28 14:00:00",
      updateTime: "2024-02-28 14:00:00",
      publishTime: "2024-02-28 15:00:00",
      creatorId: 1,
      creator: "管理员",
      reviewerId: 1,
      reviewer: "审核员",
      reviewTime: "2024-02-28 14:30:00",
      reviewComment: "重要理念，推荐发布",
      showCount: 2156,
      likeCount: 145,
      shareCount: 67
    },
    {
      id: 4,
      content: "人民对美好生活的向往，就是我们的奋斗目标。",
      author: "习近平",
      source: "党的十八大后首次记者见面会",
      category: "民生理念",
      tags: ["人民", "美好生活", "奋斗目标"],
      status: "rejected",
      createTime: "2024-03-01 16:00:00",
      updateTime: "2024-03-01 16:30:00",
      publishTime: null,
      creatorId: 3,
      creator: "投稿用户",
      reviewerId: 2,
      reviewer: "高级审核员",
      reviewTime: "2024-03-01 16:30:00",
      reviewComment: "内容重复，已有相似名言",
      showCount: 0,
      likeCount: 0,
      shareCount: 0
    }
  ],
  
  tags: [
    { tag: "实践", count: 15 },
    { tag: "真理", count: 8 },
    { tag: "发展", count: 25 },
    { tag: "稳定", count: 12 },
    { tag: "生态", count: 18 },
    { tag: "环境", count: 20 },
    { tag: "人民", count: 30 },
    { tag: "奋斗目标", count: 10 }
  ],
  
  displayConfigs: [
    {
      id: 1,
      name: "首页轮播配置",
      type: "carousel",
      enabled: true,
      quotationIds: [1, 3],
      displaySettings: {
        autoPlay: true,
        interval: 5000,
        showAuthor: true,
        showSource: false
      },
      createTime: "2024-02-25 10:00:00",
      updateTime: "2024-03-01 09:00:00"
    }
  ]
}

// 获取名言列表
app.get('/api/quotation', (req, res) => {
  const { status, tag, author, keyword, page = 1, limit = 10 } = req.query
  let filteredQuotations = [...mockQuotationData.quotations]
  
  // 按状态筛选
  if (status) {
    filteredQuotations = filteredQuotations.filter(q => q.status === status)
  }
  
  // 按标签筛选
  if (tag) {
    filteredQuotations = filteredQuotations.filter(q => q.tags.includes(tag))
  }
  
  // 按作者筛选
  if (author) {
    filteredQuotations = filteredQuotations.filter(q => q.author.includes(author))
  }
  
  // 关键词搜索
  if (keyword) {
    filteredQuotations = filteredQuotations.filter(q => 
      q.content.includes(keyword) || q.author.includes(keyword)
    )
  }
  
  const total = filteredQuotations.length
  const start = (page - 1) * limit
  const list = filteredQuotations.slice(start, start + parseInt(limit))
  
  res.json({
    code: 200,
    data: { list, total }
  })
})


// 获取标签列表 - 必须在 /:id 路由之前
app.get('/api/quotation/tags', (req, res) => {
  res.json({
    code: 200,
    data: mockQuotationData.tags
  })
})

// 获取统计数据 - 必须在 /:id 路由之前
app.get('/api/quotation/statistics', (req, res) => {
  const stats = {
    total: mockQuotationData.quotations.length,
    published: mockQuotationData.quotations.filter(q => q.status === 'published').length,
    pending: mockQuotationData.quotations.filter(q => q.status === 'pending').length,
    rejected: mockQuotationData.quotations.filter(q => q.status === 'rejected').length,
    todayCreated: 2,
    totalViews: mockQuotationData.quotations.reduce((sum, q) => sum + q.showCount, 0),
    totalLikes: mockQuotationData.quotations.reduce((sum, q) => sum + q.likeCount, 0)
  }
  
  res.json({
    code: 200,
    data: stats
  })
})

// 获取展示配置列表 - 必须在 /:id 路由之前
app.get('/api/quotation/display/configs', (req, res) => {
  res.json({
    code: 200,
    data: mockQuotationData.displayConfigs
  })
})

// 获取名言详情 - 这个路由必须放在最后，避免覆盖其他路由
app.get('/api/quotation/:id', (req, res) => {
  const { id } = req.params
  const quotation = mockQuotationData.quotations.find(q => q.id == id)
  
  if (quotation) {
    res.json({
      code: 200,
      data: quotation
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '名言不存在'
    })
  }
})

// 创建名言
app.post('/api/quotation', (req, res) => {
  const newQuotation = {
    id: mockQuotationData.quotations.length + 1,
    ...req.body,
    status: 'pending',
    createTime: new Date().toLocaleString('zh-CN'),
    updateTime: new Date().toLocaleString('zh-CN'),
    publishTime: null,
    creatorId: 1,
    creator: '当前用户',
    reviewerId: null,
    reviewer: null,
    reviewTime: null,
    reviewComment: null,
    showCount: 0,
    likeCount: 0,
    shareCount: 0
  }
  
  mockQuotationData.quotations.push(newQuotation)
  
  res.json({
    code: 200,
    message: '名言创建成功',
    data: newQuotation
  })
})



// 删除名言
app.delete('/api/quotation/:id', (req, res) => {
  const { id } = req.params
  const index = mockQuotationData.quotations.findIndex(q => q.id == id)
  
  if (index !== -1) {
    mockQuotationData.quotations.splice(index, 1)
    res.json({
      code: 200,
      message: '名言删除成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '名言不存在'
    })
  }
})

// 批量操作
app.post('/api/quotation/batch', (req, res) => {
  const { ids, operation } = req.body
  let successCount = 0
  
  ids.forEach(id => {
    const quotation = mockQuotationData.quotations.find(q => q.id == id)
    if (quotation) {
      if (operation === 'delete') {
        const index = mockQuotationData.quotations.findIndex(q => q.id == id)
        mockQuotationData.quotations.splice(index, 1)
      } else if (operation === 'approve') {
        quotation.status = 'published'
        quotation.publishTime = new Date().toLocaleString('zh-CN')
      }
      successCount++
    }
  })
  
  res.json({
    code: 200,
    message: `批量${operation}操作完成`,
    data: { successCount, failCount: ids.length - successCount }
  })
})

//======================== 跳蚤市场管理 Mock数据 ========================

const mockFleaMarketData = {
  // 商品分类
  categories: [
    { id: 1, name: '数码产品', parentId: null, sort: 1, createTime: '2024-03-01 10:00:00' },
    { id: 2, name: '家居用品', parentId: null, sort: 2, createTime: '2024-03-01 10:00:00' },
    { id: 3, name: '服饰配件', parentId: null, sort: 3, createTime: '2024-03-01 10:00:00' },
    { id: 4, name: '图书文具', parentId: null, sort: 4, createTime: '2024-03-01 10:00:00' },
    { id: 11, name: '手机', parentId: 1, sort: 1, createTime: '2024-03-01 10:00:00' },
    { id: 12, name: '电脑', parentId: 1, sort: 2, createTime: '2024-03-01 10:00:00' },
    { id: 13, name: '耳机音响', parentId: 1, sort: 3, createTime: '2024-03-01 10:00:00' }
  ],
  
  // 商品列表
  goods: [
    {
      id: 1,
      title: 'iPhone 14 Pro 深空黑色 256GB',
      description: '个人自用，95新，无磕碰，有原装充电器和数据线，支持当面验机',
      price: 6800,
      categoryId: 11,
      condition: 'almost_new',
      transactionMethod: 'meetup',
      status: 'published',
      sellerId: 1,
      seller: { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: null },
      viewCount: 156,
      likeCount: 23,
      images: [
        { id: 1, goodsId: 1, url: '/api/placeholder/400x300?text=iPhone+14+Pro', sort: 1 }
      ],
      createTime: '2024-03-15 14:30:00',
      updateTime: '2024-03-15 14:30:00'
    },
    {
      id: 2,
      title: 'MacBook Air M2 13英寸',
      description: '去年购买，因为换了新电脑，现出售。功能完好，外观9成新',
      price: 7200,
      categoryId: 12,
      condition: 'almost_new',
      transactionMethod: 'self_pickup',
      status: 'under_review',
      sellerId: 2,
      seller: { id: 2, name: '李四', email: 'lisi@example.com', avatar: null },
      viewCount: 89,
      likeCount: 15,
      images: [
        { id: 2, goodsId: 2, url: '/api/placeholder/400x300?text=MacBook+Air', sort: 1 }
      ],
      createTime: '2024-03-16 09:15:00',
      updateTime: '2024-03-16 09:15:00'
    },
    {
      id: 3,
      title: 'AirPods Pro 2代',
      description: '全新未拆封，多买了一个，原价出售',
      price: 1599,
      categoryId: 13,
      condition: 'new',
      transactionMethod: 'meetup',
      status: 'published',
      sellerId: 3,
      seller: { id: 3, name: '王五', email: 'wangwu@example.com', avatar: null },
      viewCount: 234,
      likeCount: 45,
      images: [
        { id: 3, goodsId: 3, url: '/api/placeholder/400x300?text=AirPods+Pro', sort: 1 }
      ],
      createTime: '2024-03-14 16:20:00',
      updateTime: '2024-03-14 16:20:00'
    },
    {
      id: 4,
      title: 'IKEA 办公椅',
      description: '宜家购买的人体工学办公椅，使用半年，因为搬家出售',
      price: 280,
      categoryId: 2,
      condition: 'old',
      transactionMethod: 'self_pickup',
      status: 'offline',
      sellerId: 1,
      seller: { id: 1, name: '张三', email: 'zhangsan@example.com', avatar: null },
      viewCount: 67,
      likeCount: 8,
      images: [],
      createTime: '2024-03-13 11:00:00',
      updateTime: '2024-03-13 11:00:00'
    }
  ],
  
  // 举报列表
  reports: [
    {
      id: 1,
      reporterId: 4,
      reporter: { id: 4, name: '举报人A', email: 'reporter1@example.com' },
      targetType: 'goods',
      targetId: 1,
      targetGoods: {
        id: 1,
        title: 'iPhone 14 Pro 深空黑色 256GB',
        seller: { name: '张三' }
      },
      reason: '价格明显高于市场价，疑似欺诈',
      status: 'pending',
      createTime: '2024-03-16 15:30:00'
    },
    {
      id: 2,
      reporterId: 5,
      reporter: { id: 5, name: '举报人B', email: 'reporter2@example.com' },
      targetType: 'goods',
      targetId: 2,
      targetGoods: {
        id: 2,
        title: 'MacBook Air M2 13英寸',
        seller: { name: '李四' }
      },
      reason: '商品描述与图片不符',
      status: 'processed',
      handler: { id: 1, name: '管理员' },
      handleRemark: '经核实，商品描述准确，驳回举报',
      handleTime: '2024-03-16 16:00:00',
      createTime: '2024-03-16 14:00:00'
    },
    {
      id: 3,
      reporterId: 6,
      reporter: { id: 6, name: '举报人C', email: 'reporter3@example.com' },
      targetType: 'goods',
      targetId: 3,
      targetGoods: {
        id: 3,
        title: '小米13 Ultra 黑色版 512GB',
        seller: { name: '王五' }
      },
      reason: '涉嫌销售假货',
      status: 'pending',
      createTime: '2024-03-16 16:45:00'
    },
    {
      id: 4,
      reporterId: 7,
      reporter: { id: 7, name: '举报人D', email: 'reporter4@example.com' },
      targetType: 'user',
      targetId: 10,
      reason: '恶意骚扰其他用户',
      status: 'pending',
      createTime: '2024-03-16 17:20:00'
    },
    {
      id: 5,
      reporterId: 8,
      reporter: { id: 8, name: '举报人E', email: 'reporter5@example.com' },
      targetType: 'goods',
      targetId: 4,
      targetGoods: {
        id: 4,
        title: 'iPad Pro 2023款 1TB',
        seller: { name: '赵六' }
      },
      reason: '价格虚高，疑似诈骗',
      status: 'rejected',
      handler: { id: 2, name: '高级管理员' },
      handleRemark: '价格合理，举报无效',
      handleTime: '2024-03-16 18:10:00',
      createTime: '2024-03-16 17:30:00'
    }
  ]
}

// 跳蚤市场API接口

// 获取商品列表
app.get('/api/flea-market/goods', (req, res) => {
  const { 
    page = 1, 
    pageSize = 20, 
    keyword = '', 
    categoryId, 
    status, 
    condition,
    priceMin,
    priceMax
  } = req.query
  
  let filteredGoods = [...mockFleaMarketData.goods]
  
  // 关键词搜索
  if (keyword) {
    filteredGoods = filteredGoods.filter(goods => 
      goods.title.includes(keyword) || 
      (goods.description && goods.description.includes(keyword))
    )
  }
  
  // 分类筛选
  if (categoryId) {
    filteredGoods = filteredGoods.filter(goods => goods.categoryId == categoryId)
  }
  
  // 状态筛选
  if (status) {
    filteredGoods = filteredGoods.filter(goods => goods.status === status)
  }
  
  // 新旧程度筛选
  if (condition) {
    filteredGoods = filteredGoods.filter(goods => goods.condition === condition)
  }
  
  // 价格范围筛选
  if (priceMin !== undefined) {
    filteredGoods = filteredGoods.filter(goods => goods.price >= Number(priceMin))
  }
  if (priceMax !== undefined) {
    filteredGoods = filteredGoods.filter(goods => goods.price <= Number(priceMax))
  }
  
  // 分页
  const total = filteredGoods.length
  const start = (page - 1) * pageSize
  const end = start + parseInt(pageSize)
  const list = filteredGoods.slice(start, end)
  
  res.json({
    code: 200,
    message: '获取成功',
    data: { list, total }
  })
})

// 获取商品详情
app.get('/api/flea-market/goods/:id', (req, res) => {
  const { id } = req.params
  const goods = mockFleaMarketData.goods.find(g => g.id == id)
  
  if (goods) {
    res.json({
      code: 200,
      message: '获取成功',
      data: {
        ...goods,
        relatedGoods: mockFleaMarketData.goods.filter(g => g.id != id && g.categoryId === goods.categoryId).slice(0, 3),
        chatSessions: []
      }
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在'
    })
  }
})


// 上架商品
app.post('/api/flea-market/goods/:id/publish', (req, res) => {
  const { id } = req.params
  const goods = mockFleaMarketData.goods.find(g => g.id == id)
  
  if (goods) {
    goods.status = 'published'
    res.json({
      code: 200,
      message: '商品上架成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在'
    })
  }
})

// 下架商品
app.post('/api/flea-market/goods/:id/offline', (req, res) => {
  const { id } = req.params
  const goods = mockFleaMarketData.goods.find(g => g.id == id)
  
  if (goods) {
    goods.status = 'offline'
    res.json({
      code: 200,
      message: '商品下架成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在'
    })
  }
})

// 标记为已售出
app.post('/api/flea-market/goods/:id/sold', (req, res) => {
  const { id } = req.params
  const goods = mockFleaMarketData.goods.find(g => g.id == id)
  
  if (goods) {
    goods.status = 'sold'
    res.json({
      code: 200,
      message: '商品标记为已售出'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在'
    })
  }
})

// 删除商品
app.delete('/api/flea-market/goods/:id', (req, res) => {
  const { id } = req.params
  const index = mockFleaMarketData.goods.findIndex(g => g.id == id)
  
  if (index !== -1) {
    mockFleaMarketData.goods.splice(index, 1)
    res.json({
      code: 200,
      message: '商品删除成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '商品不存在'
    })
  }
})

// 批量操作商品
app.post('/api/flea-market/goods/batch', (req, res) => {
  const { goodsIds, operation } = req.body
  let successCount = 0
  
  goodsIds.forEach(id => {
    const goods = mockFleaMarketData.goods.find(g => g.id == id)
    if (goods) {
      switch (operation) {
        case 'approve':
          goods.status = 'published'
          break
        case 'reject':
        case 'offline':
          goods.status = 'offline'
          break
        case 'delete':
          const index = mockFleaMarketData.goods.findIndex(g => g.id == id)
          mockFleaMarketData.goods.splice(index, 1)
          break
      }
      successCount++
    }
  })
  
  res.json({
    code: 200,
    message: '批量操作成功',
    data: { successCount }
  })
})

// 获取分类列表
app.get('/api/flea-market/categories', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: mockFleaMarketData.categories
  })
})

// 创建分类
app.post('/api/flea-market/categories', (req, res) => {
  const { name, parentId = null, sort = 0 } = req.body
  const newCategory = {
    id: Math.max(...mockFleaMarketData.categories.map(c => c.id)) + 1,
    name,
    parentId,
    sort,
    createTime: new Date().toLocaleString('zh-CN')
  }
  
  mockFleaMarketData.categories.push(newCategory)
  
  res.json({
    code: 200,
    message: '分类创建成功',
    data: newCategory
  })
})

// 更新分类
app.put('/api/flea-market/categories/:id', (req, res) => {
  const { id } = req.params
  const { name, parentId, sort } = req.body
  const category = mockFleaMarketData.categories.find(c => c.id == id)
  
  if (category) {
    category.name = name
    category.parentId = parentId || null
    category.sort = sort
    
    res.json({
      code: 200,
      message: '分类更新成功',
      data: category
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '分类不存在'
    })
  }
})

// 删除分类
app.delete('/api/flea-market/categories/:id', (req, res) => {
  const { id } = req.params
  const index = mockFleaMarketData.categories.findIndex(c => c.id == id)
  
  if (index !== -1) {
    mockFleaMarketData.categories.splice(index, 1)
    res.json({
      code: 200,
      message: '分类删除成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '分类不存在'
    })
  }
})

// 获取举报列表
app.get('/api/flea-market/reports', (req, res) => {
  const { page = 1, pageSize = 20, status } = req.query
  
  let filteredReports = [...mockFleaMarketData.reports]
  
  if (status) {
    filteredReports = filteredReports.filter(r => r.status === status)
  }
  
  const total = filteredReports.length
  const start = (page - 1) * pageSize
  const end = start + parseInt(pageSize)
  const list = filteredReports.slice(start, end)
  
  res.json({
    code: 200,
    message: '获取成功',
    data: { list, total }
  })
})

// 处理举报
app.post('/api/flea-market/reports/:id/handle', (req, res) => {
  const { id } = req.params
  const { handleRemark, action } = req.body
  const report = mockFleaMarketData.reports.find(r => r.id == id)
  
  if (report) {
    report.status = 'processed'
    report.handleRemark = handleRemark
    report.handleTime = new Date().toLocaleString('zh-CN')
    report.handler = { id: 1, name: '管理员' }
    
    res.json({
      code: 200,
      message: '举报处理成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '举报不存在'
    })
  }
})

// 获取统计数据
app.get('/api/flea-market/statistics', (req, res) => {
  const stats = {
    totalGoods: mockFleaMarketData.goods.length,
    publishedGoods: mockFleaMarketData.goods.filter(g => g.status === 'published').length,
    pendingGoods: mockFleaMarketData.goods.filter(g => g.status === 'under_review').length,
    soldGoods: mockFleaMarketData.goods.filter(g => g.status === 'sold').length,
    offlineGoods: mockFleaMarketData.goods.filter(g => g.status === 'offline').length,
    todayNewGoods: 2,
    weeklyNewGoods: 8,
    monthlyNewGoods: 25,
    totalUsers: 150,
    activeUsers: 45,
    totalSales: 15600,
    averagePrice: 2800,
    popularCategories: [
      { categoryId: 1, categoryName: '数码产品', count: 15 },
      { categoryId: 2, categoryName: '家居用品', count: 8 },
      { categoryId: 3, categoryName: '服饰配件', count: 12 }
    ],
    recentReports: mockFleaMarketData.reports.length,
    pendingReports: mockFleaMarketData.reports.filter(r => r.status === 'pending').length
  }
  
  res.json({
    code: 200,
    message: '获取成功',
    data: stats
  })
})

// === 仪表盘数据API接口 ===

// 仪表盘Mock数据
const mockDashboardData = {
  metrics: {
    totalUsers: 1250,
    activeUsers: 892,
    totalContent: 5680,
    pendingReview: 23,
    todayViews: 15420,
    systemHealth: 98.5,
    todayRegistrations: 12,
    weeklyGrowth: 8.5,
    contentGrowth: 15.2,
    systemUptime: 99.9
  },
  activityTrend: [
    { date: '2024-03-10', users: 120, content: 45, interactions: 380 },
    { date: '2024-03-11', users: 135, content: 52, interactions: 420 },
    { date: '2024-03-12', users: 148, content: 38, interactions: 395 },
    { date: '2024-03-13', users: 162, content: 63, interactions: 445 },
    { date: '2024-03-14', users: 139, content: 41, interactions: 368 },
    { date: '2024-03-15', users: 178, content: 58, interactions: 492 },
    { date: '2024-03-16', users: 195, content: 72, interactions: 518 }
  ],
  contentDistribution: [
    { name: '新闻资讯', value: 2340, percentage: 41.2 },
    { name: '论坛帖子', value: 1890, percentage: 33.3 },
    { name: '商品信息', value: 980, percentage: 17.2 },
    { name: '名言名句', value: 470, percentage: 8.3 }
  ],
  pendingTasks: [
    {
      id: 3,
      title: '举报处理',
      type: 'report_handle',
      priority: 'high',
      count: 3,
      createTime: '2024-03-16 12:15:00'
    },
    {
      id: 4,
      title: '用户权限申请',
      type: 'permission_request',
      priority: 'low',
      count: 2,
      createTime: '2024-03-16 13:45:00'
    }
  ],
  systemResources: [
    { name: 'CPU使用率', value: 45, unit: '%', status: 'normal' },
    { name: '内存使用率', value: 67, unit: '%', status: 'normal' },
    { name: '磁盘使用率', value: 23, unit: '%', status: 'normal' },
    { name: '网络带宽', value: 156, unit: 'Mbps', status: 'normal' }
  ],
  recentFeedback: [
    {
      id: 1,
      user: { name: '用户A', avatar: '' },
      content: '系统响应速度很快，用户体验很好',
      rating: 5,
      createTime: '2024-03-16 14:30:00',
      status: 'unread'
    },
    {
      id: 2,
      user: { name: '用户B', avatar: '' },
      content: '希望能增加更多的主题模板',
      rating: 4,
      createTime: '2024-03-16 13:20:00',
      status: 'read'
    },
    {
      id: 3,
      user: { name: '用户C', avatar: '' },
      content: '移动端适配还需要优化',
      rating: 3,
      createTime: '2024-03-16 12:15:00',
      status: 'replied'
    }
  ],
  quickActions: [
    { id: 1, name: '内容审核', icon: 'el-icon-document-checked', route: '/audit/center', count: 23 },
    { id: 2, name: '用户管理', icon: 'el-icon-user', route: '/rbac/users', count: 5 },
    { id: 3, name: '系统监控', icon: 'el-icon-monitor', route: '/system/monitor', count: 0 },
    { id: 4, name: '数据分析', icon: 'el-icon-data-analysis', route: '/operation/analytics', count: 0 }
  ]
}

// 获取仪表盘概览数据
app.get('/api/dashboard/overview', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      metrics: mockDashboardData.metrics,
      pendingTasks: mockDashboardData.pendingTasks,
      systemResources: mockDashboardData.systemResources,
      quickActions: mockDashboardData.quickActions
    }
  })
})

// 获取仪表盘指标数据
app.get('/api/dashboard/metrics', (req, res) => {
  res.json({
    code: 200,
    message: '获取成功',
    data: mockDashboardData.metrics
  })
})

// 获取活跃度趋势数据
app.get('/api/dashboard/activity-trend', (req, res) => {
  const { timeRange = '7days' } = req.query
  
  // 根据时间范围返回不同数据
  let data = mockDashboardData.activityTrend
  if (timeRange === '30days') {
    // 模拟30天数据
    data = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      users: Math.floor(Math.random() * 200) + 100,
      content: Math.floor(Math.random() * 80) + 30,
      interactions: Math.floor(Math.random() * 600) + 300
    }))
  }
  
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      trend: data,
      timeRange
    }
  })
})

// 获取内容分布数据
app.get('/api/dashboard/content-distribution', (req, res) => {
  const { category = 'all' } = req.query
  
  let data = mockDashboardData.contentDistribution
  if (category !== 'all') {
    data = data.filter(item => item.name.includes(category))
  }
  
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      distribution: data,
      category,
      lastUpdate: new Date().toLocaleString('zh-CN')
    }
  })
})

// 获取反馈列表
app.get('/api/dashboard/feedback', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const start = (page - 1) * pageSize
  const end = start + parseInt(pageSize)
  
  res.json({
    code: 200,
    message: '获取成功',
    data: {
      list: mockDashboardData.recentFeedback.slice(start, end),
      total: mockDashboardData.recentFeedback.length
    }
  })
})

// 标记任务完成
app.post('/api/dashboard/tasks/:id/complete', (req, res) => {
  const { id } = req.params
  const taskIndex = mockDashboardData.pendingTasks.findIndex(t => t.id == id)
  
  if (taskIndex !== -1) {
    mockDashboardData.pendingTasks.splice(taskIndex, 1)
    res.json({
      code: 200,
      message: '任务标记完成成功'
    })
  } else {
    res.status(404).json({
      code: 404,
      message: '任务不存在'
    })
  }
})

console.log('\n=== 仪表盘数据API接口 ===')
console.log('- GET /api/dashboard/overview - 获取仪表盘概览')
console.log('- GET /api/dashboard/metrics - 获取指标数据')
console.log('- GET /api/dashboard/activity-trend - 获取活跃度趋势')
console.log('- GET /api/dashboard/content-distribution - 获取内容分布')
console.log('- GET /api/dashboard/feedback - 获取反馈列表')
console.log('- POST /api/dashboard/tasks/:id/complete - 标记任务完成')

console.log('\n=== 名言管理API接口 ===')
console.log('- GET /api/quotation - 获取名言列表')
console.log('- GET /api/quotation/pending - 获取待审核名言')
console.log('- GET /api/quotation/:id - 获取名言详情')
console.log('- POST /api/quotation - 创建名言')
console.log('- POST /api/quotation/:id/review - 审核名言')
console.log('- GET /api/quotation/tags - 获取标签列表')
console.log('- GET /api/quotation/statistics - 获取统计数据')
console.log('- GET /api/quotation/display/configs - 获取展示配置')
console.log('- DELETE /api/quotation/:id - 删除名言')
console.log('- POST /api/quotation/batch - 批量操作')

console.log('\n=== 跳蚤市场管理API接口 ===')
console.log('- GET /api/flea-market/goods - 获取商品列表')
console.log('- GET /api/flea-market/goods/:id - 获取商品详情')
console.log('- POST /api/flea-market/goods/:id/approve - 审核商品（通过）')
console.log('- POST /api/flea-market/goods/:id/reject - 审核商品（拒绝）')
console.log('- POST /api/flea-market/goods/:id/publish - 上架商品')
console.log('- POST /api/flea-market/goods/:id/offline - 下架商品')
console.log('- POST /api/flea-market/goods/:id/sold - 标记为已售出')
console.log('- DELETE /api/flea-market/goods/:id - 删除商品')
console.log('- POST /api/flea-market/goods/batch - 批量操作商品')
console.log('- GET /api/flea-market/categories - 获取分类列表')
console.log('- POST /api/flea-market/categories - 创建分类')
console.log('- PUT /api/flea-market/categories/:id - 更新分类')
console.log('- DELETE /api/flea-market/categories/:id - 删除分类')
console.log('- GET /api/flea-market/reports - 获取举报列表')
console.log('- POST /api/flea-market/reports/:id/handle - 处理举报')
console.log('- GET /api/flea-market/statistics - 获取统计数据')

app.listen(port, () => {
  console.log(`\n🚀 Mock服务器启动成功！`)
  console.log(`📡 API地址: http://localhost:${port}`)
  console.log(`🔑 测试账号: admin / 123456`)
  console.log(`\n✅ 名言管理API已添加，解决404问题！`)
})