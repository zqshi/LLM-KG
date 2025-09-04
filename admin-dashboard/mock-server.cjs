const express = require('express')
const cors = require('cors')
const app = express()
const port = 3001

// 启用CORS
app.use(cors())
// 避免iconv-lite编码问题，只处理JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 模拟数据
const mockData = {
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
  }
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
          rules: []
        }
      ]
    }
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
})
