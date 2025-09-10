const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3001

// 启用CORS
app.use(cors())
// 避免iconv-lite编码问题，只处理JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 跳蚤市场API路由
console.log('Registering flea market API routes...')
// 获取举报列表
app.get('/api/flea-market/reports', (req, res) => {
  console.log('🚨 Flea market reports requested', req.query)
  const { page = 1, pageSize = 20, status = '', priority = '', reason = '', keyword = '' } = req.query
  
  let filteredReports = [...mockData.fleaMarket.reports]
  
  // 状态过滤
  if (status) {
    filteredReports = filteredReports.filter(report => report.status === status)
  }
  
  // 优先级过滤
  if (priority) {
    filteredReports = filteredReports.filter(report => report.priority === priority)
  }
  
  // 举报原因过滤
  if (reason) {
    filteredReports = filteredReports.filter(report => report.reason === reason)
  }
  
  // 关键词搜索（商品名称、举报人、卖家）
  if (keyword) {
    filteredReports = filteredReports.filter(report => 
      report.goodsName.includes(keyword) ||
      report.sellerName.includes(keyword) ||
      report.reportUserName.includes(keyword) ||
      report.description.includes(keyword)
    )
  }
  
  // 按创建时间降序排序
  filteredReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  const total = filteredReports.length
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const paginatedReports = filteredReports.slice(startIndex, endIndex)
  
  // 统计数据
  const statistics = {
    totalReports: mockData.fleaMarket.reports.length,
    pendingReports: mockData.fleaMarket.reports.filter(r => r.status === 'pending').length,
    processingReports: mockData.fleaMarket.reports.filter(r => r.status === 'processing').length,
    resolvedReports: mockData.fleaMarket.reports.filter(r => r.status === 'resolved').length,
    rejectedReports: mockData.fleaMarket.reports.filter(r => r.status === 'rejected').length,
    highPriorityReports: mockData.fleaMarket.reports.filter(r => r.priority === 'high').length
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: paginatedReports,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      statistics
    }
  })
})

// 获取举报详情
app.get('/api/flea-market/reports/:id', (req, res) => {
  const reportId = parseInt(req.params.id)
  console.log(`🚨 Flea market report detail requested for ID: ${reportId}`)
  
  const report = mockData.fleaMarket.reports.find(r => r.id === reportId)
  if (!report) {
    return res.status(404).json({
      code: 404,
      message: 'Report not found',
      data: null
    })
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: report
  })
})

// 处理举报（更新状态）
app.patch('/api/flea-market/reports/:id/status', (req, res) => {
  const reportId = parseInt(req.params.id)
  const { status, resolution } = req.body
  console.log(`🚨 Update report status for ID: ${reportId}`, req.body)
  
  const reportIndex = mockData.fleaMarket.reports.findIndex(r => r.id === reportId)
  if (reportIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Report not found',
      data: null
    })
  }
  
  mockData.fleaMarket.reports[reportIndex] = {
    ...mockData.fleaMarket.reports[reportIndex],
    status,
    resolution: resolution || mockData.fleaMarket.reports[reportIndex].resolution,
    updatedAt: new Date().toISOString()
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: mockData.fleaMarket.reports[reportIndex]
  })
})

// 批量处理举报
app.patch('/api/flea-market/reports/batch', (req, res) => {
  const { reportIds, status, resolution } = req.body
  console.log('🚨 Batch update reports', req.body)
  
  const updatedReports = []
  
  reportIds.forEach(reportId => {
    const reportIndex = mockData.fleaMarket.reports.findIndex(r => r.id === reportId)
    if (reportIndex !== -1) {
      mockData.fleaMarket.reports[reportIndex] = {
        ...mockData.fleaMarket.reports[reportIndex],
        status,
        resolution: resolution || mockData.fleaMarket.reports[reportIndex].resolution,
        updatedAt: new Date().toISOString()
      }
      updatedReports.push(mockData.fleaMarket.reports[reportIndex])
    }
  })
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      updatedCount: updatedReports.length,
      reports: updatedReports
    }
  })
})

// 获取分类列表
app.get('/api/flea-market/categories', (req, res) => {
  const categories = mockData.fleaMarket.categories
  res.json({
    code: 200,
    message: 'success',
    data: categories
  })
})

// 获取商品列表
app.get('/api/flea-market/goods', (req, res) => {
  const goods = mockData.fleaMarket.goods
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: goods,
      total: goods.length
    }
  })
})

// 模拟数据
const mockData = {
  // 跳蚤市场相关数据
  fleaMarket: {
    reports: [
      { id: 1, goodsId: 1, goodsName: '二手笔记本电脑', sellerId: 1, sellerName: '张三', reportUserId: 3, reportUserName: '李四', reason: '虚假商品', description: '商品描述与实物不符，配置有夸大成分', status: 'pending', priority: 'high', evidence: ['https://picsum.photos/300/200?random=10'], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 2, goodsId: 2, goodsName: '人体工学办公椅', sellerId: 2, sellerName: '王五', reportUserId: 4, reportUserName: '赵六', reason: '价格欺诈', description: '标价过高，市场价格远低于此价', status: 'processing', priority: 'medium', evidence: ['https://picsum.photos/300/200?random=11'], createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      { id: 3, goodsId: 3, goodsName: '智能手机iPhone 12', sellerId: 3, sellerName: '刘七', reportUserId: 1, reportUserName: '张三', reason: '商品质量问题', description: '收到商品后发现有严重划痕，与描述不符', status: 'resolved', priority: 'high', evidence: ['https://picsum.photos/300/200?random=12', 'https://picsum.photos/300/200?random=13'], resolution: '经核实属实，已对卖家进行警告处理，买家获得退款', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 4, goodsId: 4, goodsName: '设计类图书套装', sellerId: 4, sellerName: '陈八', reportUserId: 2, reportUserName: '王五', reason: '虚假描述', description: '书籍严重破损，有缺页现象，与"九成新"描述严重不符', status: 'pending', priority: 'medium', evidence: ['https://picsum.photos/300/200?random=14'], createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 5, goodsId: 1, goodsName: '二手笔记本电脑', sellerId: 1, sellerName: '张三', reportUserId: 5, reportUserName: '周九', reason: '联系方式虚假', description: '提供的联系方式无法接通，疑似虚假信息', status: 'rejected', priority: 'low', evidence: [], resolution: '经核实，联系方式有效，可能是网络问题导致，举报不成立', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    categories: [
      { id: 1, name: '电子产品', code: 'electronics', description: '各类电子设备和配件', icon: 'Monitor', parentId: null, sort: 1, status: 'active', createdAt: new Date().toISOString() },
      { id: 2, name: '家居用品', code: 'home', description: '各类家居生活物品', icon: 'Home', parentId: null, sort: 2, status: 'active', createdAt: new Date().toISOString() },
      { id: 3, name: '办公用品', code: 'office', description: '办公所需的各类物品', icon: 'Briefcase', parentId: null, sort: 3, status: 'active', createdAt: new Date().toISOString() },
      { id: 4, name: '图书文具', code: 'books-stationery', description: '各类图书和文具用品', icon: 'Book', parentId: null, sort: 4, status: 'active', createdAt: new Date().toISOString() },
      { id: 5, name: '服装鞋包', code: 'clothing-shoes', description: '服装、鞋子和包包', icon: 'Shirt', parentId: null, sort: 5, status: 'active', createdAt: new Date().toISOString() }
    ],
    goods: [
      { id: 1, name: '二手笔记本电脑', categoryId: 1, price: 3500, originalPrice: 5000, description: 'ThinkPad X1 Carbon，使用一年，性能良好，配置i7处理器16GB内存', images: ['https://picsum.photos/200/200?random=1'], status: 'on_sale', userId: 1, location: '北京海淀区', contactPhone: '138****5678', createdAt: new Date().toISOString() },
      { id: 2, name: '人体工学办公椅', categoryId: 3, price: 800, originalPrice: 1200, description: 'Herman Miller Aeron椅，九成新，支持腰部支撑，透气舒适', images: ['https://picsum.photos/200/200?random=2'], status: 'on_sale', userId: 2, location: '上海浦东区', contactPhone: '139****1234', createdAt: new Date().toISOString() },
      { id: 3, name: '智能手机iPhone 12', categoryId: 1, price: 2800, originalPrice: 4000, description: '128GB储存，9成新，无磕碰，原装配件齐全', images: ['https://picsum.photos/200/200?random=3'], status: 'on_sale', userId: 3, location: '广州天河区', contactPhone: '136****9876', createdAt: new Date().toISOString() },
      { id: 4, name: '设计类图书套装', categoryId: 4, price: 150, originalPrice: 280, description: '包含《设计心理学》《用户体验要素》等经典设计书籍，7本套装', images: ['https://picsum.photos/200/200?random=4'], status: 'on_sale', userId: 4, location: '深圳南山区', contactPhone: '135****4567', createdAt: new Date().toISOString() },
      { id: 5, name: '品牌运动鞋', categoryId: 5, price: 450, originalPrice: 699, description: 'Nike Air Max 270，42码，仅试穿未下地，鞋盒标签完整', images: ['https://picsum.photos/200/200?random=5'], status: 'sold', userId: 5, location: '杭州西湖区', contactPhone: '137****7890', createdAt: new Date().toISOString() }
    ]
  },

  // 仪表盘概览数据
  dashboardOverview: {
    code: 200,
    message: 'success',
    data: {
      metrics: {
        todayActiveUsers: 1248,
        todayNewContent: 36,
        pendingAuditCount: 8,
        systemHealthStatus: 'good',
        todayActiveUsersTrend: 12.5,
        todayNewContentTrend: 8.3,
        systemCpuUsage: 45,
        systemMemoryUsage: 62,
        systemDiskUsage: 28,
        lastUpdateTime: new Date().toISOString()
      },
      pendingTasks: [
        {
          id: 1,
          type: 'content_audit',
          title: '待审核内容',
          priority: 'high',
          count: 8,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          type: 'user_report',
          title: '用户举报处理',
          priority: 'medium',
          count: 3,
          createdAt: new Date().toISOString()
        }
      ],
      quickActions: [
        {
          id: 'content_audit',
          name: '内容审核',
          path: '/audit/center',
          icon: 'View',
          type: 'primary',
          permission: 'content:audit',
          visible: true
        },
        {
          id: 'user_management',
          name: '用户管理',
          path: '/rbac/users',
          icon: 'User',
          type: 'success',
          permission: 'rbac:user:view',
          visible: true
        }
      ],
      activityTrend: generateActivityTrendData(),
      contentDistribution: [
        { type: 'article', name: '技术文章', count: 1286, percentage: 42.5, color: '#667eea' },
        { type: 'post', name: '论坛帖子', count: 932, percentage: 30.8, color: '#52c41a' },
        { type: 'product', name: '商品信息', count: 456, percentage: 15.0, color: '#faad14' }
      ],
      departmentContributions: [
        {
          departmentId: 1,
          departmentName: '技术部',
          contentCount: 320,
          userCount: 45,
          trend: 15.2
        },
        { departmentId: 2, departmentName: '产品部', contentCount: 280, userCount: 38, trend: 8.5 }
      ],
      systemResources: [
        { name: 'CPU使用率', type: 'cpu', usage: 45, status: 'normal', unit: '%' },
        { name: '内存使用率', type: 'memory', usage: 62, status: 'warning', unit: '%' }
      ],
      systemAnnouncement: {
        id: 1,
        title: '系统维护通知',
        content: '定于本周日凌晨2:00-4:00进行系统例行维护',
        type: 'maintenance',
        publisher: '系统管理员',
        publishedAt: new Date().toISOString()
      },
      recentFeedback: [
        {
          id: 1,
          user: { id: 4, nickname: '王五', username: 'wangwu' },
          content: '希望能增加移动端的支持',
          createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
        }
      ]
    }
  },

  // 投票管理相关数据
  pollData: {
    roles: [
      { id: 1, name: '管理员', code: 'admin' },
      { id: 2, name: '内容编辑', code: 'content_editor' },
      { id: 3, name: '审核员', code: 'auditor' },
      { id: 4, name: '普通用户', code: 'user' }
    ],
    departments: [
      { id: '1', name: '技术部', parentId: null },
      { id: '2', name: '产品部', parentId: null },
      { id: '3', name: '运营部', parentId: null },
      { id: '4', name: '前端组', parentId: '1' },
      { id: '5', name: '后端组', parentId: '1' }
    ],
    categories: [
      { id: 1, name: '技术讨论', code: 'tech_discussion' },
      { id: 2, name: '产品建议', code: 'product_suggestion' },
      { id: 3, name: '公司事务', code: 'company_affairs' },
      { id: 4, name: '员工福利', code: 'employee_benefits' }
    ],
    overviewStats: {
      totalPolls: 5,
      ongoingPolls: 4,
      endedPolls: 1,
      totalVotes: 869,
      avgParticipationRate: 82.3,
      todayPolls: 2,
      todayVotes: 167
    },
    polls: [
      {
        id: 1,
        title: '团建活动地点投票',
        description: '请大家投票选择下次团建活动的地点',
        question: '您希望下次团建活动在哪里举办？',
        status: 'ongoing',
        type: 'single',
        creatorId: 1,
        creatorName: '管理员',
        categoryId: 4,
        categoryName: '员工福利',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 89,
        participantCount: 89,
        hasRewards: true,
        isAnonymous: false,
        allowMultiple: false,
        options: [
          { id: 1, text: '海边度假村', votes: 45, percentage: 50.6 },
          { id: 2, text: '山区温泉', votes: 32, percentage: 36.0 },
          { id: 3, text: '城市公园', votes: 12, percentage: 13.4 }
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        title: '新办公楼食堂菜品调研',
        description: '为了提升员工用餐体验，征集大家对食堂菜品的意见',
        question: '您最希望食堂增加哪些菜系？（可多选）',
        status: 'ongoing',
        type: 'multiple',
        creatorId: 3,
        creatorName: '行政主管',
        categoryId: 4,
        categoryName: '员工福利',
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 234,
        participantCount: 128,
        hasRewards: false,
        isAnonymous: true,
        allowMultiple: true,
        options: [
          { id: 1, text: '川菜', votes: 89, percentage: 38.0 },
          { id: 2, text: '粤菜', votes: 67, percentage: 28.6 },
          { id: 3, text: '湘菜', votes: 45, percentage: 19.2 },
          { id: 4, text: '西式简餐', votes: 33, percentage: 14.1 }
        ],
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        title: '办公时间调整建议',
        description: '公司考虑实行弹性工作制，请大家表达意见',
        question: '您是否支持弹性工作制度？',
        status: 'ongoing',
        type: 'single',
        creatorId: 2,
        creatorName: '人事经理',
        categoryId: 3,
        categoryName: '公司事务',
        startTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 156,
        participantCount: 156,
        hasRewards: false,
        isAnonymous: false,
        allowMultiple: false,
        options: [
          { id: 1, text: '完全支持', votes: 89, percentage: 57.1 },
          { id: 2, text: '部分支持', votes: 45, percentage: 28.8 },
          { id: 3, text: '不支持', votes: 22, percentage: 14.1 }
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        title: '技术分享主题征集',
        description: '下月技术分享会主题征集，欢迎大家提出感兴趣的技术话题',
        question: '您最希望听到哪个技术主题的分享？',
        status: 'ongoing',
        type: 'single',
        creatorId: 4,
        creatorName: '技术总监',
        categoryId: 1,
        categoryName: '技术讨论',
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 78,
        participantCount: 78,
        hasRewards: true,
        isAnonymous: false,
        allowMultiple: false,
        options: [
          { id: 1, text: 'Vue3 + TypeScript实战', votes: 34, percentage: 43.6 },
          { id: 2, text: 'Docker容器化部署', votes: 28, percentage: 35.9 },
          { id: 3, text: '微服务架构设计', votes: 16, percentage: 20.5 }
        ],
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        title: '年会节目类型投票',
        description: '2024年年会节目类型征集，让我们一起打造精彩的年会',
        question: '您希望年会有哪些类型的节目？（可多选）',
        status: 'ended',
        type: 'multiple',
        creatorId: 5,
        creatorName: '文娱委员',
        categoryId: 4,
        categoryName: '员工福利',
        startTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        totalVotes: 312,
        participantCount: 167,
        hasRewards: true,
        isAnonymous: true,
        allowMultiple: true,
        options: [
          { id: 1, text: '歌舞表演', votes: 98, percentage: 31.4 },
          { id: 2, text: '小品相声', votes: 87, percentage: 27.9 },
          { id: 3, text: '互动游戏', votes: 76, percentage: 24.4 },
          { id: 4, text: '抽奖环节', votes: 51, percentage: 16.3 }
        ],
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },

  // 用户信息
  userInfo: {
    code: 200,
    message: 'success',
    data: {
      id: 1,
      username: 'admin',
      name: '管理员',
      email: 'admin@example.com',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      roles: ['admin'],
      permissions: [
        'dashboard:view',
        'content:view',
        'content:audit',
        'rbac:user:view',
        'system:config'
      ]
    }
  },

  // Banner数据
  banners: [
    {
      id: 1,
      title: 'Spring Festival',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPnNwcmluZyBGZXN0aXZhbDwvdGV4dD4KPC9zdmc+',
      linkUrl: 'https://example.com/spring-festival',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      description: '春节活动横幅',
      creator: '管理员',
      createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: 'Product Launch',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNEVDREMwIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPlByb2R1Y3QgTGF1bmNoPC90ZXh0Pgo8L3N2Zz4=',
      linkUrl: 'https://example.com/product-launch',
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'published',
      description: '新产品发布横幅',
      creator: '产品经理',
      createTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      title: 'Training',
      imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNDVCN0QxIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPlRyYWluaW5nPC90ZXh0Pgo8L3N2Zz4=',
      linkUrl: 'https://example.com/training',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved',
      description: '培训活动横幅',
      creator: '人力资源',
      createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],

  // 名言管理相关数据
  quotations: {
    list: [
      {
        id: 1,
        content: '成功不是终点，失败不是末日，勇气才是最重要的。',
        author: '温斯顿·丘吉尔',
        source: '演讲',
        category: '成功励志',
        tags: ['成功', '勇气', '坚持'],
        status: 'published',
        showCount: 1250,
        viewCount: 1250,
        likeCount: 89,
        occasion: '企业年会',
        leader: { id: 1, name: '张明' },
        createTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        content: '教育的目的在于培养性格。',
        author: '斯宾塞',
        source: '教育论',
        category: '教育哲学',
        tags: ['教育', '性格', '哲学'],
        status: 'published',
        showCount: 980,
        viewCount: 980,
        likeCount: 76,
        occasion: '教育论坛',
        leader: { id: 2, name: '李华' },
        createTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        content: '学而时习之，不亦说乎？',
        author: '孔子',
        source: '论语·学而',
        category: '学习成长',
        tags: ['学习', '经典', '国学'],
        status: 'published',
        showCount: 1580,
        viewCount: 1580,
        likeCount: 142,
        occasion: '学习分享会',
        leader: { id: 3, name: '王强' },
        createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        content: '团队合作是成功的基石。',
        author: '亨利·福特',
        source: '企业管理',
        category: '团队管理',
        tags: ['团队', '合作', '成功'],
        status: 'published',
        showCount: 820,
        viewCount: 820,
        likeCount: 65,
        occasion: '团队建设会议',
        leader: { id: 4, name: '赵敏' },
        createTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 5,
        content: '创新是企业发展的不竭动力。',
        author: '史蒂夫·乔布斯',
        source: '苹果发布会',
        category: '创新创业',
        tags: ['创新', '发展', '企业'],
        status: 'draft',
        showCount: 0,
        viewCount: 0,
        likeCount: 0,
        occasion: '产品发布会',
        leader: { id: 5, name: '刘伟' },
        createTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    tags: [
      { id: 1, name: '成功', count: 45, color: '#1890ff' },
      { id: 2, name: '勇气', count: 32, color: '#52c41a' },
      { id: 3, name: '坚持', count: 28, color: '#722ed1' },
      { id: 4, name: '教育', count: 36, color: '#fa8c16' },
      { id: 5, name: '性格', count: 19, color: '#eb2f96' },
      { id: 6, name: '哲学', count: 24, color: '#13c2c2' },
      { id: 7, name: '学习', count: 58, color: '#faad14' },
      { id: 8, name: '经典', count: 41, color: '#f5222d' },
      { id: 9, name: '国学', count: 33, color: '#a0d911' }
    ],
    statistics: {
      totalCount: 5,
      publishedCount: 4,
      pendingCount: 0,
      archivedCount: 0,
      todayPublished: 1,
      weeklyPublished: 3,
      monthlyPublished: 5,
      totalQuotations: 5,
      publishedQuotations: 4,
      draftQuotations: 1,
      totalViews: 4630,
      totalLikes: 372,
      avgViewsPerQuote: 926,
      popularCategories: [
        { name: '成功励志', count: 1, percentage: 25.0 },
        { name: '学习成长', count: 1, percentage: 25.0 },
        { name: '教育哲学', count: 1, percentage: 25.0 },
        { name: '团队管理', count: 1, percentage: 25.0 },
        { name: '创新创业', count: 1, percentage: 25.0 }
      ],
      topLeaders: [
        { id: 1, name: '张明', quotationCount: 1 },
        { id: 2, name: '李华', quotationCount: 1 },
        { id: 3, name: '王强', quotationCount: 1 },
        { id: 4, name: '赵敏', quotationCount: 1 },
        { id: 5, name: '刘伟', quotationCount: 1 }
      ],
      popularQuotations: [],
      monthlyTrend: generateQuotationTrend()
    },
    playlists: [
      {
        id: 1,
        name: '每日励志',
        description: '精选励志名言，每日一句正能量',
        quotationCount: 30,
        playCount: 1240,
        isActive: true,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2, 
        name: '古典智慧',
        description: '传统文化经典名句集锦',
        quotationCount: 45,
        playCount: 890,
        isActive: true,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: '学习感悟',
        description: '关于学习和成长的深度思考',
        quotationCount: 28,
        playCount: 567,
        isActive: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    dailyQuoteConfig: {
      enabled: true,
      updateTime: '06:00',
      categories: ['成功励志', '学习成长', '人生哲理'],
      displayDuration: 24,
      autoRotate: true,
      showAuthor: true,
      showSource: true
    }
  },

  // 用户数据（用于领导列表展示）
  users: [
    {
      id: 1,
      name: '张明',
      username: 'zhangming',
      email: 'zhangming@company.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      position: '董事长',
      department: '董事会',
      level: 'executive',
      status: 'active',
      createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: '李华',
      username: 'lihua',
      email: 'lihua@company.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612345b?w=100&h=100&fit=crop&crop=face',
      position: '总经理',
      department: '总经办',
      level: 'executive',
      status: 'active',
      createdAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: '王强',
      username: 'wangqiang',
      email: 'wangqiang@company.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      position: '技术总监',
      department: '技术部',
      level: 'director',
      status: 'active',
      createdAt: new Date(Date.now() - 250 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 4,
      name: '赵敏',
      username: 'zhaomin',
      email: 'zhaomin@company.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      position: '人事经理',
      department: '人力资源部',
      level: 'manager',
      status: 'active',
      createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      name: '刘伟',
      username: 'liuwei',
      email: 'liuwei@company.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      position: '产品经理',
      department: '产品部',
      level: 'manager',
      status: 'active',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
}

// 生成名言趋势数据
function generateQuotationTrend() {
  const data = []
  const today = new Date()

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today)
    date.setMonth(date.getMonth() - i)
    
    data.push({
      month: date.toISOString().split('T')[0].slice(0, 7),
      newQuotations: 8 + Math.floor(Math.random() * 12),
      views: 1800 + Math.floor(Math.random() * 800),
      likes: 120 + Math.floor(Math.random() * 60)
    })
  }

  return data
}

// 生成活跃度趋势数据
function generateActivityTrendData() {
  const data = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split('T')[0],
      activeUsers: 1200 + Math.floor(Math.random() * 200),
      newContent: 30 + Math.floor(Math.random() * 20),
      auditedContent: 25 + Math.floor(Math.random() * 15)
    })
  }

  return data
}

// API路由
app.get('/api/dashboard/overview', (req, res) => {
  console.log('📊 Dashboard overview requested')
  res.json(mockData.dashboardOverview)
})

app.get('/api/dashboard/metrics', (req, res) => {
  console.log('📈 Dashboard metrics requested')
  const metrics = {
    ...mockData.dashboardOverview.data.metrics,
    todayActiveUsers:
      mockData.dashboardOverview.data.metrics.todayActiveUsers +
      Math.floor(Math.random() * 20 - 10),
    lastUpdateTime: new Date().toISOString()
  }
  res.json({
    code: 200,
    message: 'success',
    data: metrics
  })
})

app.get('/api/dashboard/activity-trend', (req, res) => {
  console.log('📈 Activity trend requested')
  res.json({
    code: 200,
    message: 'success',
    data: generateActivityTrendData()
  })
})

app.get('/api/dashboard/content-distribution', (req, res) => {
  console.log('📊 Content distribution requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.dashboardOverview.data.contentDistribution
  })
})

app.get('/api/dashboard/department-contributions', (req, res) => {
  console.log('🏢 Department contributions requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.dashboardOverview.data.departmentContributions
  })
})

app.get('/api/dashboard/system-resources', (req, res) => {
  console.log('💻 System resources requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.dashboardOverview.data.systemResources
  })
})

app.get('/api/dashboard/recent-feedback', (req, res) => {
  console.log('💬 Recent feedback requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.dashboardOverview.data.recentFeedback
  })
})

// 用户认证相关
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login requested:', req.body)
  res.json({
    code: 200,
    message: 'success',
    data: {
      token: 'mock-jwt-token-' + Date.now(),
      user: mockData.userInfo.data
    }
  })
})

app.get('/api/auth/user', (req, res) => {
  console.log('👤 User info requested')
  res.json(mockData.userInfo)
})

app.post('/api/auth/logout', (req, res) => {
  console.log('🚪 Logout requested')
  res.json({
    code: 200,
    message: 'success',
    data: null
  })
})

// ===== 投票管理API =====

// 获取角色列表
app.get('/api/common/roles', (req, res) => {
  console.log('👥 Roles requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.pollData.roles
  })
})

// 获取部门列表
app.get('/api/common/departments', (req, res) => {
  console.log('🏢 Departments requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.pollData.departments
  })
})

// 获取版块列表
app.get('/api/common/categories', (req, res) => {
  console.log('📂 Categories requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.pollData.categories
  })
})

// 获取投票概览统计
app.get('/api/admin/polls/overview-stats', (req, res) => {
  console.log('📊 Poll overview stats requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.pollData.overviewStats
  })
})

// 获取投票列表
app.get('/api/admin/polls', (req, res) => {
  console.log('📝 Polls list requested', req.query)
  const { page = 1, pageSize = 20, keyword = '', status = '' } = req.query
  
  let filteredPolls = [...mockData.pollData.polls]
  
  // 关键词过滤
  if (keyword) {
    filteredPolls = filteredPolls.filter(poll => 
      poll.title.includes(keyword) || poll.description.includes(keyword)
    )
  }
  
  // 状态过滤
  if (status) {
    filteredPolls = filteredPolls.filter(poll => poll.status === status)
  }
  
  const total = filteredPolls.length
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const paginatedPolls = filteredPolls.slice(startIndex, endIndex)
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      items: paginatedPolls,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

// 获取投票统计详情
app.get('/api/admin/polls/:id/statistics', (req, res) => {
  const pollId = parseInt(req.params.id)
  console.log(`📈 Poll statistics requested for ID: ${pollId}`)
  
  const poll = mockData.pollData.polls.find(p => p.id === pollId)
  if (!poll) {
    return res.status(404).json({
      code: 404,
      message: 'Poll not found',
      data: null
    })
  }
  
  const statistics = {
    pollId: poll.id,
    title: poll.title,
    totalVotes: poll.totalVotes,
    participationRate: (poll.totalVotes / 200 * 100).toFixed(1), // 假设总员工200人
    options: poll.options.map(option => ({
      ...option,
      percentage: (option.votes / poll.totalVotes * 100).toFixed(1)
    })),
    demographics: {
      byDepartment: [
        { departmentName: '技术部', votes: Math.floor(poll.totalVotes * 0.4) },
        { departmentName: '产品部', votes: Math.floor(poll.totalVotes * 0.3) },
        { departmentName: '运营部', votes: Math.floor(poll.totalVotes * 0.3) }
      ],
      byRole: [
        { roleName: '普通员工', votes: Math.floor(poll.totalVotes * 0.7) },
        { roleName: '主管', votes: Math.floor(poll.totalVotes * 0.2) },
        { roleName: '经理', votes: Math.floor(poll.totalVotes * 0.1) }
      ]
    },
    timeline: generateVoteTimeline(poll.totalVotes)
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: statistics
  })
})

// 生成投票时间线数据
function generateVoteTimeline(totalVotes) {
  const timeline = []
  const hours = 24
  const votesPerHour = Math.floor(totalVotes / hours)
  
  for (let i = 0; i < hours; i++) {
    const time = new Date(Date.now() - (hours - i) * 60 * 60 * 1000)
    timeline.push({
      time: time.toISOString(),
      votes: votesPerHour + Math.floor(Math.random() * 10),
      cumulativeVotes: (i + 1) * votesPerHour
    })
  }
  
  return timeline
}

// ===== 审核相关API (处理audit相关404) =====
app.get('/api/audit/policies/by-biztype/:biztype', (req, res) => {
  console.log(`⚖️ Audit policies requested for biztype: ${req.params.biztype}`)
  console.log(`🔍 Full request URL: ${req.originalUrl}`)
  res.json({
    code: 200,
    message: 'success',
    data: {
      policies: [
        {
          id: 1,
          name: '默认审核策略',
          bizType: req.params.biztype,
          enabled: true,
          isActive: true,
          mode: 'all',
          priority: 'normal',
          rules: []
        }
      ]
    }
  })
})

// ===== 补充缺失的审核相关API =====
// 审核任务列表
app.get('/api/audit/tasks', (req, res) => {
  console.log('📋 Audit tasks requested', req.query)
  const { keyword = '', page = 1, size = 20 } = req.query
  
  const mockTasks = [
    {
      id: 1,
      title: '内容审核任务',
      type: 'content',
      status: 'pending',
      priority: 'high',
      assignee: { id: 1, name: '张三' },
      createTime: new Date().toISOString(),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: '名言审核任务',
      type: 'quotation',
      status: 'in_progress', 
      priority: 'medium',
      assignee: { id: 2, name: '李四' },
      createTime: new Date().toISOString(),
      deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: mockTasks,
      total: mockTasks.length
    }
  })
})

// 审核员列表
app.get('/api/audit/auditors', (req, res) => {
  console.log('👥 Audit auditors requested', req.query)
  
  const mockAuditors = [
    { id: 1, name: '张三', role: '高级审核员', status: 'active', workload: 15 },
    { id: 2, name: '李四', role: '审核员', status: 'active', workload: 8 },
    { id: 3, name: '王五', role: '审核员', status: 'busy', workload: 20 }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: mockAuditors,
      total: mockAuditors.length
    }
  })
})

// 审核统计数据
app.get('/api/audit/stats', (req, res) => {
  console.log('📊 Audit statistics requested')
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      totalTasks: 156,
      pendingTasks: 23,
      completedTasks: 133,
      todayCompleted: 12,
      averageProcessTime: 45 // minutes
    }
  })
})

// 审核策略列表
app.get('/api/audit/policies', (req, res) => {
  console.log('📜 Audit policies requested', req.query)
  
  const mockPolicies = [
    {
      id: 1,
      name: '内容审核策略',
      bizType: 'content',
      enabled: true,
      priority: 'high',
      createTime: new Date().toISOString()
    },
    {
      id: 2,
      name: '名言审核策略',
      bizType: 'quotation',
      enabled: true,
      priority: 'medium', 
      createTime: new Date().toISOString()
    }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: mockPolicies,
      total: mockPolicies.length
    }
  })
})

// 全局审核日志API (处理缺失的POST端点)
app.post('/api/audit/global/logs', (req, res) => {
  console.log('📋 Global audit logs creation requested', req.body)
  
  const newLog = {
    id: Date.now(),
    action: req.body.action || 'UNKNOWN',
    resource_type: req.body.resource_type || 'unknown',
    resource_id: req.body.resource_id || '',
    user_id: req.body.user_id || 1,
    user_name: req.body.user_name || '系统用户',
    ip_address: req.body.ip_address || '127.0.0.1',
    user_agent: req.body.user_agent || 'Unknown',
    details: req.body.details || {},
    status: req.body.status || 'SUCCESS',
    created_at: new Date().toISOString()
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: newLog
  })
})

// 获取全局审核日志列表
app.get('/api/audit/global/logs', (req, res) => {
  console.log('📋 Global audit logs list requested', req.query)
  const { page = 1, pageSize = 20, action = '', resource_type = '', startTime = '', endTime = '' } = req.query
  
  const mockLogs = [
    {
      id: 1,
      action: 'CREATE',
      resource_type: 'quotation',
      resource_id: '123',
      user_id: 1,
      user_name: '张明',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { content: '创建了新的名言' },
      status: 'SUCCESS',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: 2,
      action: 'UPDATE', 
      resource_type: 'banner',
      resource_id: '456',
      user_id: 2,
      user_name: '李华',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: { content: '更新了横幅信息' },
      status: 'SUCCESS',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      id: 3,
      action: 'DELETE',
      resource_type: 'content',
      resource_id: '789',
      user_id: 3,
      user_name: '王强',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      details: { content: '删除了违规内容' },
      status: 'SUCCESS',
      created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    }
  ]
  
  let filteredLogs = [...mockLogs]
  
  // 操作类型过滤
  if (action) {
    filteredLogs = filteredLogs.filter(log => log.action === action)
  }
  
  // 资源类型过滤
  if (resource_type) {
    filteredLogs = filteredLogs.filter(log => log.resource_type === resource_type)
  }
  
  // 时间范围过滤
  if (startTime || endTime) {
    filteredLogs = filteredLogs.filter(log => {
      const logTime = new Date(log.created_at).getTime()
      const start = startTime ? new Date(startTime).getTime() : 0
      const end = endTime ? new Date(endTime).getTime() : Date.now()
      return logTime >= start && logTime <= end
    })
  }
  
  const total = filteredLogs.length
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex)
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: paginatedLogs,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      statistics: {
        totalLogs: total,
        todayLogs: mockLogs.filter(log => {
          const today = new Date().toDateString()
          return new Date(log.created_at).toDateString() === today
        }).length,
        successLogs: mockLogs.filter(log => log.status === 'SUCCESS').length,
        errorLogs: mockLogs.filter(log => log.status === 'ERROR').length
      }
    }
  })
})

// ===== 占位图片API =====
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params
  const { bg = 'cccccc', color = '333333', text } = req.query
  
  console.log(`🖼️ Placeholder image requested: ${width}x${height}`)
  
  // 返回一个简单的SVG占位图
  const placeholderText = text || `${width} × ${height}`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#${bg}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#${color}" text-anchor="middle" dominant-baseline="middle">${placeholderText}</text>
  </svg>`
  
  res.setHeader('Content-Type', 'image/svg+xml')
  res.send(svg)
})

// ===== Banner管理API =====
app.get('/api/banner', (req, res) => {
  console.log('🏷️ Banner list requested', req.query)
  const { title = '', status = '', page = 1, size = 20 } = req.query
  
  let filteredBanners = [...mockData.banners]
  
  // 标题过滤
  if (title) {
    filteredBanners = filteredBanners.filter(banner => 
      banner.title.toLowerCase().includes(title.toLowerCase())
    )
  }
  
  // 状态过滤
  if (status) {
    filteredBanners = filteredBanners.filter(banner => banner.status === status)
  }
  
  const total = filteredBanners.length
  const startIndex = (parseInt(page) - 1) * parseInt(size)
  const endIndex = startIndex + parseInt(size)
  const paginatedBanners = filteredBanners.slice(startIndex, endIndex)
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: paginatedBanners,
      total
    }
  })
})

app.get('/api/banner/:id', (req, res) => {
  const bannerId = parseInt(req.params.id)
  console.log(`🏷️ Banner detail requested for ID: ${bannerId}`)
  
  const banner = mockData.banners.find(b => b.id === bannerId)
  if (!banner) {
    return res.status(404).json({
      code: 404,
      message: 'Banner not found',
      data: null
    })
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: banner
  })
})

app.post('/api/banner', (req, res) => {
  console.log('🏷️ Create banner requested', req.body)
  const newBanner = {
    id: mockData.banners.length + 1,
    ...req.body,
    creator: '管理员',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  mockData.banners.push(newBanner)
  
  res.json({
    code: 200,
    message: 'success',
    data: newBanner
  })
})

app.put('/api/banner/:id', (req, res) => {
  const bannerId = parseInt(req.params.id)
  console.log(`🏷️ Update banner requested for ID: ${bannerId}`, req.body)
  
  const bannerIndex = mockData.banners.findIndex(b => b.id === bannerId)
  if (bannerIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Banner not found',
      data: null
    })
  }
  
  mockData.banners[bannerIndex] = {
    ...mockData.banners[bannerIndex],
    ...req.body,
    updateTime: new Date().toISOString()
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: mockData.banners[bannerIndex]
  })
})

app.delete('/api/banner/:id', (req, res) => {
  const bannerId = parseInt(req.params.id)
  console.log(`🏷️ Delete banner requested for ID: ${bannerId}`)
  
  const bannerIndex = mockData.banners.findIndex(b => b.id === bannerId)
  if (bannerIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Banner not found',
      data: null
    })
  }
  
  mockData.banners.splice(bannerIndex, 1)
  
  res.json({
    code: 200,
    message: 'success',
    data: null
  })
})

app.patch('/api/banner/:id/status', (req, res) => {
  const bannerId = parseInt(req.params.id)
  console.log(`🏷️ Update banner status requested for ID: ${bannerId}`, req.body)
  
  const bannerIndex = mockData.banners.findIndex(b => b.id === bannerId)
  if (bannerIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Banner not found',
      data: null
    })
  }
  
  mockData.banners[bannerIndex] = {
    ...mockData.banners[bannerIndex],
    status: req.body.status,
    auditTaskId: req.body.auditTaskId,
    updateTime: new Date().toISOString()
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: mockData.banners[bannerIndex]
  })
})

app.post('/api/banner/:id/publish', (req, res) => {
  const bannerId = parseInt(req.params.id)
  console.log(`🏷️ Publish banner requested for ID: ${bannerId}`)
  
  const bannerIndex = mockData.banners.findIndex(b => b.id === bannerId)
  if (bannerIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Banner not found',
      data: null
    })
  }
  
  mockData.banners[bannerIndex].status = 'published'
  mockData.banners[bannerIndex].updateTime = new Date().toISOString()
  
  res.json({
    code: 200,
    message: 'success',
    data: mockData.banners[bannerIndex]
  })
})

app.post('/api/banner/:id/offline', (req, res) => {
  const bannerId = parseInt(req.params.id)
  console.log(`🏷️ Offline banner requested for ID: ${bannerId}`)
  
  const bannerIndex = mockData.banners.findIndex(b => b.id === bannerId)
  if (bannerIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Banner not found',
      data: null
    })
  }
  
  mockData.banners[bannerIndex].status = 'offline'
  mockData.banners[bannerIndex].updateTime = new Date().toISOString()
  
  res.json({
    code: 200,
    message: 'success',
    data: mockData.banners[bannerIndex]
  })
})

// ===== 内容管理API (处理content相关404) =====
app.get('/api/content/categories', (req, res) => {
  console.log('📂 Content categories requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.pollData.categories
  })
})

app.get('/api/content/list', (req, res) => {
  console.log('📄 Content list requested')
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: [],
      total: 0,
      page: 1,
      pageSize: 20
    }
  })
})

app.get('/api/content/stats', (req, res) => {
  console.log('📊 Content stats requested')
  res.json({
    code: 200,
    message: 'success',
    data: {
      totalContent: 1234,
      publishedContent: 1100,
      draftContent: 134,
      auditingContent: 45
    }
  })
})

app.get('/api/content/hot', (req, res) => {
  console.log('🔥 Hot content requested')
  res.json({
    code: 200,
    message: 'success',
    data: []
  })
})

// ===== 名言管理API =====

// 获取名言列表
app.get('/api/quotation', (req, res) => {
  console.log('📜 Quotation list requested', req.query)
  const { page = 1, pageSize = 20, keyword = '', category = '', status = '', startTime = '', endTime = '' } = req.query
  
  let filteredQuotations = [...mockData.quotations.list]
  
  // 关键词过滤（搜索内容、作者、来源）
  if (keyword) {
    filteredQuotations = filteredQuotations.filter(quotation => 
      quotation.content.includes(keyword) || 
      quotation.author.includes(keyword) ||
      quotation.source.includes(keyword)
    )
  }
  
  // 分类过滤
  if (category) {
    filteredQuotations = filteredQuotations.filter(quotation => quotation.category === category)
  }
  
  // 状态过滤
  if (status) {
    filteredQuotations = filteredQuotations.filter(quotation => quotation.status === status)
  }
  
  // 时间范围过滤
  if (startTime || endTime) {
    filteredQuotations = filteredQuotations.filter(quotation => {
      const createdTime = new Date(quotation.createdAt).getTime()
      const start = startTime ? new Date(startTime).getTime() : 0
      const end = endTime ? new Date(endTime).getTime() : Date.now()
      return createdTime >= start && createdTime <= end
    })
  }
  
  const total = filteredQuotations.length
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const paginatedQuotations = filteredQuotations.slice(startIndex, endIndex)
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: paginatedQuotations,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

// 获取名言标签
app.get('/api/quotation/tags', (req, res) => {
  console.log('🏷️ Quotation tags requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.quotations.tags
  })
})

// 获取名言统计
app.get('/api/quotation/statistics', (req, res) => {
  console.log('📊 Quotation statistics requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.quotations.statistics
  })
})

// 获取播放列表
app.get('/api/quotation/playlists', (req, res) => {
  console.log('🎵 Quotation playlists requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.quotations.playlists
  })
})

// 获取每日名言配置
app.get('/api/quotation/daily-quote/config', (req, res) => {
  console.log('🌅 Daily quote config requested')
  res.json({
    code: 200,
    message: 'success',
    data: mockData.quotations.dailyQuoteConfig
  })
})

// 获取热门名言
app.get('/api/quotation/popular', (req, res) => {
  console.log('🔥 Popular quotations requested')
  const { limit = 10 } = req.query
  
  // 按点击量和点赞量排序，取前N个
  const popularQuotations = mockData.quotations.list
    .filter(q => q.status === 'published')
    .sort((a, b) => (b.showCount + b.likeCount) - (a.showCount + a.likeCount))
    .slice(0, parseInt(limit))
  
  res.json({
    code: 200,
    message: 'success',
    data: popularQuotations
  })
})

// 创建名言
app.post('/api/quotation', (req, res) => {
  console.log('📜 Create quotation requested', req.body)
  const newQuotation = {
    id: mockData.quotations.list.length + 1,
    ...req.body,
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  mockData.quotations.list.push(newQuotation)
  
  res.json({
    code: 200,
    message: 'success',
    data: newQuotation
  })
})

// 更新名言
app.put('/api/quotation/:id', (req, res) => {
  const quotationId = parseInt(req.params.id)
  console.log(`📜 Update quotation requested for ID: ${quotationId}`, req.body)
  
  const quotationIndex = mockData.quotations.list.findIndex(q => q.id === quotationId)
  if (quotationIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Quotation not found',
      data: null
    })
  }
  
  mockData.quotations.list[quotationIndex] = {
    ...mockData.quotations.list[quotationIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: mockData.quotations.list[quotationIndex]
  })
})

// 删除名言
app.delete('/api/quotation/:id', (req, res) => {
  const quotationId = parseInt(req.params.id)
  console.log(`📜 Delete quotation requested for ID: ${quotationId}`)
  
  const quotationIndex = mockData.quotations.list.findIndex(q => q.id === quotationId)
  if (quotationIndex === -1) {
    return res.status(404).json({
      code: 404,
      message: 'Quotation not found',
      data: null
    })
  }
  
  mockData.quotations.list.splice(quotationIndex, 1)
  
  res.json({
    code: 200,
    message: 'success',
    data: null
  })
})

// ===== 用户管理API =====

// 获取用户列表（兼容两种方法名）
app.get('/api/rbac/users', (req, res) => {
  console.log('👥 Users list requested', req.query)
  const { page = 1, pageSize = 20, keyword = '', department = '', level = '' } = req.query
  
  let filteredUsers = [...mockData.users]
  
  // 关键词过滤（搜索姓名、用户名、邮箱）
  if (keyword) {
    filteredUsers = filteredUsers.filter(user => 
      user.name.includes(keyword) || 
      user.username.includes(keyword) ||
      user.email.includes(keyword)
    )
  }
  
  // 部门过滤
  if (department) {
    filteredUsers = filteredUsers.filter(user => user.department === department)
  }
  
  // 级别过滤
  if (level) {
    filteredUsers = filteredUsers.filter(user => user.level === level)
  }
  
  const total = filteredUsers.length
  const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
  const endIndex = startIndex + parseInt(pageSize)
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      list: paginatedUsers,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  })
})

// 获取用户详情
app.get('/api/rbac/users/:id', (req, res) => {
  const userId = parseInt(req.params.id)
  console.log(`👤 User detail requested for ID: ${userId}`)
  
  const user = mockData.users.find(u => u.id === userId)
  if (!user) {
    return res.status(404).json({
      code: 404,
      message: 'User not found',
      data: null
    })
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: user
  })
})

// ===== 门户配置相关API =====

// 导航管理API
app.get('/api/portal/navigations', (req, res) => {
  console.log('🧭 Portal navigations requested')
  
  const mockNavigations = [
    {
      id: 1,
      title: '首页',
      path: '/home',
      icon: 'House',
      sort_order: 1,
      is_active: true,
      parent_id: null,
      children: [],
      roles: ['admin', 'user'],
      created_at: new Date().toISOString()
    },
    {
      id: 2, 
      title: '新闻动态',
      path: '/news',
      icon: 'DocumentText',
      sort_order: 2,
      is_active: true,
      parent_id: null,
      children: [
        {
          id: 21,
          title: '公司新闻',
          path: '/news/company',
          icon: 'Briefcase',
          sort_order: 1,
          is_active: true,
          parent_id: 2,
          children: [],
          roles: ['admin', 'user'],
          created_at: new Date().toISOString()
        },
        {
          id: 22,
          title: '行业动态',
          path: '/news/industry',
          icon: 'TrendUp',
          sort_order: 2,
          is_active: true,
          parent_id: 2,
          children: [],
          roles: ['admin', 'user'],
          created_at: new Date().toISOString()
        }
      ],
      roles: ['admin', 'user'],
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: '跳蚤市场',
      path: '/flea-market',
      icon: 'ShoppingCart',
      sort_order: 3,
      is_active: true,
      parent_id: null,
      children: [],
      roles: ['admin', 'user'],
      created_at: new Date().toISOString()
    }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: mockNavigations
  })
})

// 入口面板API
app.get('/api/portal/entry-panels', (req, res) => {
  console.log('📱 Entry panels requested')
  
  const mockPanels = [
    {
      id: 1,
      title: '快捷入口',
      description: '常用功能快捷入口',
      sort_order: 1,
      is_active: true,
      layout: 'grid',
      items: [],
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: '热门推荐',
      description: '热门内容推荐',
      sort_order: 2,
      is_active: true,
      layout: 'card',
      items: [],
      created_at: new Date().toISOString()
    }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: mockPanels
  })
})

// 配置版本API
app.get('/api/portal/config-versions', (req, res) => {
  console.log('📋 Config versions requested')
  const { page = 1, limit = 20 } = req.query
  
  const mockVersions = [
    {
      id: 1,
      name: '初始版本',
      description: '系统初始配置版本',
      version: '1.0.0',
      type: 'manual',
      is_current: true,
      created_by: '系统管理员',
      created_at: new Date().toISOString(),
      config_data: {}
    }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      versions: mockVersions,
      total: mockVersions.length,
      hasMore: false
    }
  })
})

// 审计日志API
app.get('/api/portal/audit-logs', (req, res) => {
  console.log('📊 Audit logs requested')
  const mockLogs = [
    {
      id: 1,
      action: 'CREATE',
      resource_type: 'navigation',
      resource_id: '1',
      user_id: 1,
      user_name: '系统管理员',
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
      details: { title: '新增导航项目' },
      status: 'SUCCESS',
      created_at: new Date().toISOString()
    }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: {
      logs: mockLogs,
      total: mockLogs.length,
      statistics: {
        totalLogs: mockLogs.length,
        todayLogs: 1,
        activeUsers: 1,
        errorLogs: 0
      }
    }
  })
})

// 工具API
app.get('/api/portal/utils/roles', (req, res) => {
  console.log('👥 Available roles requested')
  
  const mockRoles = [
    { id: 'admin', name: '管理员', description: '系统管理员' },
    { id: 'user', name: '普通用户', description: '普通用户' },
    { id: 'content_manager', name: '内容管理员', description: '内容管理员' },
    { id: 'auditor', name: '审核员', description: '审核员' }
  ]
  
  res.json({
    code: 200,
    message: 'success',
    data: mockRoles
  })
})

app.get('/api/portal/utils/icons', (req, res) => {
  console.log('🎨 Available icons requested')
  
  const mockIcons = {
    categories: [
      {
        name: '基础图标',
        icons: [
          { name: '首页', className: 'House', unicode: '' },
          { name: '文档', className: 'DocumentText', unicode: '' },
          { name: '设置', className: 'Setting', unicode: '' },
          { name: '用户', className: 'User', unicode: '' }
        ]
      }
    ]
  }
  
  res.json({
    code: 200,
    message: 'success',
    data: mockIcons
  })
})

// favicon处理
app.get('/favicon.ico', (req, res) => {
  res.status(204).end()
})

// 根路径处理
app.get('/', (req, res) => {
  res.json({
    name: 'Admin Dashboard Mock Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'flea-market': [
        'GET /api/flea-market/categories',
        'GET /api/flea-market/goods', 
        'GET /api/flea-market/reports',
        'GET /api/flea-market/reports/:id',
        'PATCH /api/flea-market/reports/:id/status',
        'PATCH /api/flea-market/reports/batch'
      ]
    }
  })
})

// Chrome开发者工具相关请求处理
app.get('/.well-known/*', (req, res) => {
  res.status(204).end()
})

// 通用错误处理
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.path}`)
  res.status(404).json({
    code: 404,
    message: `API endpoint not found: ${req.method} ${req.path}`,
    data: null
  })
})

app.listen(port, () => {
  console.log(`🚀 Mock server running at http://localhost:${port}`)
  console.log(`📋 Available endpoints:`)
  console.log(`   Dashboard APIs:`)
  console.log(`   GET  /api/dashboard/overview`)
  console.log(`   GET  /api/dashboard/metrics`)
  console.log(`   GET  /api/dashboard/activity-trend`)
  console.log(`   GET  /api/dashboard/content-distribution`)
  console.log(`   GET  /api/dashboard/department-contributions`)
  console.log(`   GET  /api/dashboard/system-resources`)
  console.log(`   GET  /api/dashboard/recent-feedback`)
  console.log(`   Auth APIs:`)
  console.log(`   POST /api/auth/login`)
  console.log(`   GET  /api/auth/user`)
  console.log(`   POST /api/auth/logout`)
  console.log(`   Poll Management APIs:`)
  console.log(`   GET  /api/common/roles`)
  console.log(`   GET  /api/common/departments`)
  console.log(`   GET  /api/common/categories`)
  console.log(`   GET  /api/admin/polls`)
  console.log(`   GET  /api/admin/polls/overview-stats`)
  console.log(`   GET  /api/admin/polls/:id/statistics`)
  console.log(`   Content & Audit APIs:`)
  console.log(`   GET  /api/content/categories`)
  console.log(`   GET  /api/content/list`)
  console.log(`   GET  /api/content/stats`)
  console.log(`   GET  /api/content/hot`)
  console.log(`   GET  /api/audit/policies/by-biztype/:biztype`)
  console.log(`   GET  /api/audit/tasks`)
  console.log(`   GET  /api/audit/auditors`)
  console.log(`   GET  /api/audit/stats`)
  console.log(`   GET  /api/audit/policies`)
  console.log(`   POST /api/audit/global/logs`)
  console.log(`   GET  /api/audit/global/logs`)
  console.log(`   Flea Market APIs:`)
  console.log(`   GET    /api/flea-market/categories`)
  console.log(`   GET    /api/flea-market/goods`)
  console.log(`   GET    /api/flea-market/reports`)
  console.log(`   GET    /api/flea-market/reports/:id`)
  console.log(`   PATCH  /api/flea-market/reports/:id/status`)
  console.log(`   PATCH  /api/flea-market/reports/batch`)
  console.log(`   Quotation Management APIs:`)
  console.log(`   GET  /api/quotation`)
  console.log(`   POST /api/quotation`)
  console.log(`   PUT  /api/quotation/:id`)
  console.log(`   DELETE /api/quotation/:id`)
  console.log(`   GET  /api/quotation/tags`)
  console.log(`   GET  /api/quotation/statistics`)
  console.log(`   GET  /api/quotation/playlists`)
  console.log(`   GET  /api/quotation/daily-quote/config`)
  console.log(`   User Management APIs:`)
  console.log(`   GET  /api/rbac/users`)
  console.log(`   GET  /api/rbac/users/:id`)
  console.log(`   Utility APIs:`)
  console.log(`   GET  /api/placeholder/:width/:height`)
})
