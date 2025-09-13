/**
 * 内容管理静态数据
 */

// 版块分类数据
export const categories = [
  {
    id: 1,
    name: '技术讨论',
    code: 'tech_discussion',
    description: '技术相关的讨论和分享',
    icon: 'Monitor',
    color: '#409eff',
    sort: 1,
    status: 1,
    postCount: 156,
    moderators: ['张三', '李四'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    name: '产品建议',
    code: 'product_suggestion',
    description: '产品功能建议和改进意见',
    icon: 'Lightbulb',
    color: '#67c23a',
    sort: 2,
    status: 1,
    postCount: 89,
    moderators: ['王五'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 3,
    name: '公司事务',
    code: 'company_affairs',
    description: '公司内部事务讨论',
    icon: 'OfficeBuilding',
    color: '#e6a23c',
    sort: 3,
    status: 1,
    postCount: 234,
    moderators: ['赵六', '孙七'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 4,
    name: '员工福利',
    code: 'employee_benefits',
    description: '员工福利相关信息',
    icon: 'Present',
    color: '#f56c6c',
    sort: 4,
    status: 1,
    postCount: 67,
    moderators: ['周八'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  },
  {
    id: 5,
    name: '闲聊杂谈',
    code: 'casual_talk',
    description: '日常闲聊和杂谈',
    icon: 'ChatDotRound',
    color: '#909399',
    sort: 5,
    status: 1,
    postCount: 123,
    moderators: ['吴九'],
    createTime: '2024-01-01 10:00:00',
    updateTime: '2024-01-01 10:00:00'
  }
]

// 帖子内容数据
export const posts = [
  {
    id: 1,
    title: 'Vue 3 Composition API 最佳实践分享',
    content: '今天想和大家分享一些在项目中使用 Vue 3 Composition API 的最佳实践经验...',
    categoryId: 1,
    category: categories[0],
    author: {
      id: 2,
      name: '张三',
      avatar: '/avatars/zhangsan.jpg'
    },
    status: 2, // 1:待审核 2:已发布 3:已拒绝 4:已删除
    isTop: true,
    isEssence: true,
    viewCount: 1245,
    likeCount: 89,
    commentCount: 23,
    tags: ['Vue3', 'JavaScript', '前端'],
    createTime: '2024-12-10 14:30:00',
    updateTime: '2024-12-10 14:30:00',
    publishTime: '2024-12-10 15:00:00'
  },
  {
    id: 2,
    title: '关于员工食堂菜品改进的建议',
    content: '最近收到很多同事反馈食堂菜品的问题，我整理了一些建议...',
    categoryId: 2,
    category: categories[1],
    author: {
      id: 4,
      name: '王五',
      avatar: '/avatars/wangwu.jpg'
    },
    status: 2,
    isTop: false,
    isEssence: false,
    viewCount: 567,
    likeCount: 34,
    commentCount: 12,
    tags: ['建议', '食堂', '员工福利'],
    createTime: '2024-12-09 10:15:00',
    updateTime: '2024-12-09 10:15:00',
    publishTime: '2024-12-09 10:30:00'
  },
  {
    id: 3,
    title: '2024年度员工大会通知',
    content: '各位同事，2024年度员工大会将于下周五举行...',
    categoryId: 3,
    category: categories[2],
    author: {
      id: 5,
      name: '赵六',
      avatar: '/avatars/zhaoliu.jpg'
    },
    status: 2,
    isTop: true,
    isEssence: false,
    viewCount: 2345,
    likeCount: 156,
    commentCount: 45,
    tags: ['通知', '年会', '公司事务'],
    createTime: '2024-12-08 09:00:00',
    updateTime: '2024-12-08 09:00:00',
    publishTime: '2024-12-08 09:15:00'
  },
  {
    id: 4,
    title: 'React Hooks 深度解析',
    content: '最近在项目中大量使用了 React Hooks，想分享一些使用心得...',
    categoryId: 1,
    category: categories[0],
    author: {
      id: 3,
      name: '李四',
      avatar: '/avatars/lisi.jpg'
    },
    status: 1,
    isTop: false,
    isEssence: false,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ['React', 'JavaScript', '前端'],
    createTime: '2024-12-14 16:30:00',
    updateTime: '2024-12-14 16:30:00',
    publishTime: null
  },
  {
    id: 5,
    title: '年终奖发放时间确认',
    content: '关于年终奖的发放时间，HR部门确认...',
    categoryId: 4,
    category: categories[3],
    author: {
      id: 6,
      name: '孙七',
      avatar: '/avatars/sunqi.jpg'
    },
    status: 2,
    isTop: false,
    isEssence: true,
    viewCount: 1890,
    likeCount: 234,
    commentCount: 67,
    tags: ['年终奖', '福利', 'HR'],
    createTime: '2024-12-07 11:20:00',
    updateTime: '2024-12-07 11:20:00',
    publishTime: '2024-12-07 11:30:00'
  },
  // 为内容池演示新增的5条数据
  {
    id: 6,
    title: '公司新政策解读：远程办公制度更新',
    content: '随着工作方式的不断演进，公司决定更新远程办公制度，以更好地平衡工作效率与员工福祉。新政策将从下月开始实施，主要变化包括：1）每周可申请2天远程办公；2）远程办公需提前一天申请；3）重要会议需到公司参加等。',
    categoryId: 3,
    category: categories[2],
    author: {
      id: 7,
      name: '人事部',
      avatar: '/avatars/hr.jpg'
    },
    status: 2,
    isTop: false,
    isEssence: false,
    viewCount: 1245,
    likeCount: 67,
    commentCount: 32,
    tags: ['政策', '远程办公', '人力资源'],
    createTime: '2024-12-15 09:00:00',
    updateTime: '2024-12-15 09:00:00',
    publishTime: '2024-12-15 09:30:00'
  },
  {
    id: 7,
    title: '技术分享：微服务架构在电商平台的实践',
    content: '本次分享将详细介绍我们团队在电商平台项目中实施微服务架构的经验和教训。内容包括服务拆分策略、数据一致性处理、分布式事务解决方案等关键技术点。',
    categoryId: 1,
    category: categories[0],
    author: {
      id: 8,
      name: '架构师小王',
      avatar: '/avatars/architect.jpg'
    },
    status: 2,
    isTop: true,
    isEssence: true,
    viewCount: 2156,
    likeCount: 189,
    commentCount: 45,
    tags: ['微服务', '架构', '电商'],
    createTime: '2024-12-14 14:30:00',
    updateTime: '2024-12-14 14:30:00',
    publishTime: '2024-12-14 15:00:00'
  },
  {
    id: 8,
    title: '员工健康计划：年度体检安排通知',
    content: '为了关爱员工健康，公司将于下月组织年度体检活动。体检时间从3月1日持续到3月15日，地点在市人民医院体检中心。请各位同事根据部门安排的时间前往体检。',
    categoryId: 4,
    category: categories[3],
    author: {
      id: 9,
      name: '行政部',
      avatar: '/avatars/admin.jpg'
    },
    status: 2,
    isTop: false,
    isEssence: false,
    viewCount: 876,
    likeCount: 42,
    commentCount: 18,
    tags: ['健康', '体检', '福利'],
    createTime: '2024-12-13 11:20:00',
    updateTime: '2024-12-13 11:20:00',
    publishTime: '2024-12-13 11:45:00'
  },
  {
    id: 9,
    title: '前端技术趋势：2024年值得关注的框架和工具',
    content: '随着2024年的到来，前端技术领域又有哪些新的发展趋势？本文将分析今年值得关注的前端框架、构建工具和开发实践，帮助开发者把握技术方向。',
    categoryId: 1,
    category: categories[0],
    author: {
      id: 10,
      name: '前端专家',
      avatar: '/avatars/frontend.jpg'
    },
    status: 1,
    isTop: false,
    isEssence: false,
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    tags: ['前端', '框架', '技术趋势'],
    createTime: '2024-12-16 10:30:00',
    updateTime: '2024-12-16 10:30:00',
    publishTime: null
  },
  {
    id: 10,
    title: '团队建设活动：春季户外拓展计划',
    content: '为了增强团队凝聚力，公司计划在本月底组织春季户外拓展活动。活动地点在郊外度假村，包含团队协作游戏、烧烤聚餐等丰富内容。欢迎大家踊跃报名参与。',
    categoryId: 5,
    category: categories[4],
    author: {
      id: 11,
      name: '工会',
      avatar: '/avatars/union.jpg'
    },
    status: 2,
    isTop: false,
    isEssence: false,
    viewCount: 567,
    likeCount: 38,
    commentCount: 25,
    tags: ['团建', '活动', '户外'],
    createTime: '2024-12-12 16:45:00',
    updateTime: '2024-12-12 16:45:00',
    publishTime: '2024-12-12 17:00:00'
  }
]

// 投票数据
export const polls = [
  {
    id: 1,
    title: '下午茶时间安排投票',
    description: '为了让大家有更好的工作体验，现征集下午茶时间的意见',
    type: 'single', // single: 单选, multiple: 多选
    categoryId: 4,
    category: categories[3],
    author: {
      id: 5,
      name: '赵六',
      avatar: '/avatars/zhaoliu.jpg'
    },
    status: 1, // 1:进行中 2:已结束
    isAnonymous: false,
    allowAddOption: false,
    startTime: '2024-12-10 09:00:00',
    endTime: '2024-12-17 18:00:00',
    totalVotes: 45,
    options: [
      { id: 1, text: '下午 3:00-3:30', votes: 18, voters: ['张三', '李四', '王五'] },
      { id: 2, text: '下午 3:30-4:00', votes: 15, voters: ['赵六', '孙七'] },
      { id: 3, text: '下午 4:00-4:30', votes: 12, voters: ['周八', '吴九'] }
    ],
    createTime: '2024-12-10 09:00:00',
    updateTime: '2024-12-14 16:00:00'
  },
  {
    id: 2,
    title: '技术分享主题征集',
    description: '下个月的技术分享会，大家希望听哪些主题？',
    type: 'multiple',
    categoryId: 1,
    category: categories[0],
    author: {
      id: 2,
      name: '张三',
      avatar: '/avatars/zhangsan.jpg'
    },
    status: 1,
    isAnonymous: true,
    allowAddOption: true,
    startTime: '2024-12-12 10:00:00',
    endTime: '2024-12-20 18:00:00',
    totalVotes: 32,
    options: [
      { id: 1, text: 'AI/机器学习', votes: 24, voters: [] },
      { id: 2, text: '微服务架构', votes: 19, voters: [] },
      { id: 3, text: '前端框架对比', votes: 16, voters: [] },
      { id: 4, text: '数据库优化', votes: 13, voters: [] },
      { id: 5, text: 'DevOps实践', votes: 11, voters: [] }
    ],
    createTime: '2024-12-12 10:00:00',
    updateTime: '2024-12-14 16:00:00'
  },
  // 为投票页面演示新增的5条数据
  {
    id: 3,
    title: '新办公室装修风格选择',
    description: '公司即将搬迁到新办公室，请大家投票选择喜欢的装修风格',
    type: 'single',
    categoryId: 3,
    category: categories[2],
    author: {
      id: 12,
      name: '行政部李经理',
      avatar: '/avatars/admin2.jpg'
    },
    status: 1,
    isAnonymous: false,
    allowAddOption: true,
    startTime: '2024-12-15 09:00:00',
    endTime: '2024-12-22 18:00:00',
    totalVotes: 78,
    options: [
      { id: 1, text: '现代简约风格', votes: 32, voters: [] },
      { id: 2, text: '工业风格', votes: 25, voters: [] },
      { id: 3, text: '北欧风格', votes: 21, voters: [] }
    ],
    createTime: '2024-12-15 09:00:00',
    updateTime: '2024-12-16 14:30:00'
  },
  {
    id: 4,
    title: '年度优秀员工评选',
    description: '请为心目中的年度优秀员工投票（可多选）',
    type: 'multiple',
    categoryId: 3,
    category: categories[2],
    author: {
      id: 13,
      name: '人事部王主管',
      avatar: '/avatars/hr2.jpg'
    },
    status: 1,
    isAnonymous: true,
    allowAddOption: false,
    startTime: '2024-12-10 00:00:00',
    endTime: '2024-12-25 23:59:59',
    totalVotes: 156,
    options: [
      { id: 1, text: '技术部张工', votes: 67, voters: [] },
      { id: 2, text: '市场部李经理', votes: 45, voters: [] },
      { id: 3, text: '设计部王设计师', votes: 52, voters: [] },
      { id: 4, text: '客服部赵专员', votes: 38, voters: [] }
    ],
    createTime: '2024-12-10 09:00:00',
    updateTime: '2024-12-16 16:45:00'
  },
  {
    id: 5,
    title: '团队旅游目的地选择',
    description: '公司计划组织年度团队旅游，请选择心仪的目的地',
    type: 'single',
    categoryId: 5,
    category: categories[4],
    author: {
      id: 14,
      name: '工会主席',
      avatar: '/avatars/union2.jpg'
    },
    status: 2,
    isAnonymous: false,
    allowAddOption: true,
    startTime: '2024-12-01 00:00:00',
    endTime: '2024-12-10 23:59:59',
    totalVotes: 134,
    options: [
      { id: 1, text: '三亚海滨', votes: 58, voters: [] },
      { id: 2, text: '桂林山水', votes: 32, voters: [] },
      { id: 3, text: '张家界', votes: 24, voters: [] },
      { id: 4, text: '西安古城', votes: 20, voters: [] }
    ],
    createTime: '2024-12-01 10:00:00',
    updateTime: '2024-12-10 18:30:00'
  },
  {
    id: 6,
    title: '新项目技术栈选择',
    description: '即将启动的新项目，需要确定使用的技术栈（可多选）',
    type: 'multiple',
    categoryId: 1,
    category: categories[0],
    author: {
      id: 15,
      name: '技术总监',
      avatar: '/avatars/cto.jpg'
    },
    status: 1,
    isAnonymous: false,
    allowAddOption: true,
    startTime: '2024-12-14 00:00:00',
    endTime: '2024-12-21 23:59:59',
    totalVotes: 42,
    options: [
      { id: 1, text: 'Vue 3 + TypeScript', votes: 38, voters: [] },
      { id: 2, text: 'React + TypeScript', votes: 35, voters: [] },
      { id: 3, text: 'Angular', votes: 12, voters: [] },
      { id: 4, text: 'Node.js后端', votes: 40, voters: [] },
      { id: 5, text: 'Python后端', votes: 28, voters: [] }
    ],
    createTime: '2024-12-14 09:30:00',
    updateTime: '2024-12-16 11:20:00'
  },
  {
    id: 7,
    title: '办公用品采购意见征集',
    description: '为了提升办公舒适度，请选择需要采购的办公用品',
    type: 'multiple',
    categoryId: 3,
    category: categories[2],
    author: {
      id: 16,
      name: '行政助理',
      avatar: '/avatars/admin3.jpg'
    },
    status: 1,
    isAnonymous: true,
    allowAddOption: true,
    startTime: '2024-12-13 00:00:00',
    endTime: '2024-12-20 23:59:59',
    totalVotes: 65,
    options: [
      { id: 1, text: '人体工学椅', votes: 45, voters: [] },
      { id: 2, text: '双屏显示器', votes: 38, voters: [] },
      { id: 3, text: '机械键盘', votes: 32, voters: [] },
      { id: 4, text: '降噪耳机', votes: 28, voters: [] },
      { id: 5, text: '站立办公桌', votes: 25, voters: [] }
    ],
    createTime: '2024-12-13 14:20:00',
    updateTime: '2024-12-16 09:15:00'
  }
]

// 置顶/加精申请数据
export const featureRequests = [
  {
    id: 1,
    postId: 1,
    post: posts[0],
    applicantId: 2,
    applicant: {
      id: 2,
      name: '张三',
      avatar: '/avatars/zhangsan.jpg'
    },
    reviewerId: 1,
    reviewer: {
      id: 1,
      name: '系统管理员',
      avatar: '/avatars/admin.jpg'
    },
    requestType: 'top', // top: 置顶, elite: 加精
    reason: '这篇文章包含了很多实用的 Vue 3 技巧，对团队很有价值',
    status: 'approved', // pending:待审核 approved:已通过 rejected:已拒绝
    rejectReason: '内容质量高，对团队有参考价值',
    createdAt: '2024-12-10 15:30:00',
    updatedAt: '2024-12-10 15:30:00',
    reviewedAt: '2024-12-10 16:00:00'
  },
  {
    id: 2,
    postId: 5,
    post: posts[4],
    applicantId: 6,
    applicant: {
      id: 6,
      name: '孙七',
      avatar: '/avatars/sunqi.jpg'
    },
    reviewerId: 1,
    reviewer: {
      id: 1,
      name: '系统管理员',
      avatar: '/avatars/admin.jpg'
    },
    requestType: 'elite',
    reason: '年终奖信息对所有员工都很重要，建议加精推荐',
    status: 'approved',
    rejectReason: '信息重要且准确，同意加精',
    createdAt: '2024-12-07 12:00:00',
    updatedAt: '2024-12-07 12:00:00',
    reviewedAt: '2024-12-07 13:00:00'
  },
  {
    id: 3,
    postId: 4,
    post: posts[3],
    applicantId: 3,
    applicant: {
      id: 3,
      name: '李四',
      avatar: '/avatars/lisi.jpg'
    },
    reviewerId: undefined,
    reviewer: undefined,
    requestType: 'top',
    reason: 'React Hooks 是当前前端开发的重要技术，值得置顶推广',
    status: 'pending',
    rejectReason: undefined,
    createdAt: '2024-12-14 17:00:00',
    updatedAt: '2024-12-14 17:00:00',
    reviewedAt: undefined
  }
]

// 标签数据
export const tags = [
  { id: 1, name: 'Vue3', color: '#4fc08d', count: 23 },
  { id: 2, name: 'React', color: '#61dafb', count: 18 },
  { id: 3, name: 'JavaScript', color: '#f7df1e', count: 45 },
  { id: 4, name: '前端', color: '#007acc', count: 67 },
  { id: 5, name: '后端', color: '#68217a', count: 34 },
  { id: 6, name: 'Node.js', color: '#339933', count: 21 },
  { id: 7, name: 'Python', color: '#3776ab', count: 28 },
  { id: 8, name: '数据库', color: '#336791', count: 19 },
  { id: 9, name: 'DevOps', color: '#326ce5', count: 15 },
  { id: 10, name: '建议', color: '#67c23a', count: 42 },
  { id: 11, name: '通知', color: '#e6a23c', count: 38 },
  { id: 12, name: '福利', color: '#f56c6c', count: 25 },
  { id: 13, name: 'HR', color: '#909399', count: 16 },
  { id: 14, name: '年会', color: '#b37feb', count: 8 },
  { id: 15, name: '培训', color: '#52c41a', count: 12 }
]

// 内容统计数据
export const contentStats = {
  totalPosts: 672,
  todayPosts: 8,
  totalViews: 125340,
  todayViews: 2341,
  totalComments: 3456,
  todayComments: 67,
  totalUsers: 245,
  activeUsers: 89,
  categoryStats: categories.map(cat => ({
    categoryId: cat.id,
    categoryName: cat.name,
    postCount: cat.postCount,
    viewCount: Math.floor(cat.postCount * 15.6),
    commentCount: Math.floor(cat.postCount * 2.3)
  })),
  tagStats: tags.slice(0, 10),
  recentPosts: posts.slice(0, 5),
  hotPosts: posts.filter(p => p.viewCount > 1000).slice(0, 5)
}