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