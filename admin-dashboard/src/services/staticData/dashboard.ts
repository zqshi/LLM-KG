/**
 * 仪表盘静态数据
 */

// 概览统计数据
export const overviewStats = async () => ({
  todayActiveUsers: 567,
  todayNewContent: 89,
  pendingAuditCount: 23,
  systemHealthStatus: 'good' as const,
  todayActiveUsersTrend: 12.5,
  todayNewContentTrend: 8.3,
  systemCpuUsage: 45.6,
  systemMemoryUsage: 67.8,
  systemDiskUsage: 34.2,
  lastUpdateTime: new Date().toISOString()
})

// 趋势图表数据 - 活跃度趋势数据（近30天）
export const trendData = async () => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
  })
  
  return dates.map((date, index) => ({
    date,
    activeUsers: 450 + Math.floor(Math.random() * 200) + Math.sin(index / 7) * 50,
    newContent: 25 + Math.floor(Math.random() * 30) + Math.cos(index / 5) * 10,
    auditedContent: 20 + Math.floor(Math.random() * 15)
  }))
}

// 内容分布数据
export const contentDistribution = async () => [
  { type: 'knowledge', name: '知识库', count: 156, percentage: 25.4, color: '#409eff' },
  { type: 'forum', name: '论坛讨论', count: 234, percentage: 38.1, color: '#e6a23c' },
  { type: 'news', name: '新闻资讯', count: 67, percentage: 10.9, color: '#f56c6c' },
  { type: 'poll', name: '投票活动', count: 89, percentage: 14.5, color: '#67c23a' },
  { type: 'other', name: '其他内容', count: 68, percentage: 11.1, color: '#909399' }
]

// 用户活跃度分析（如果需要的话）
export const userActivity = async () => ({
  // 用户活跃度分布
  activityDistribution: [
    { range: '今日', count: 234, percentage: 18.8 },
    { range: '3天内', count: 456, percentage: 36.6 },
    { range: '一周内', count: 589, percentage: 47.3 },
    { range: '一月内', count: 123, percentage: 9.9 },
    { range: '更早', count: 43, percentage: 3.5 }
  ],
  
  // 部门活跃度
  departmentActivity: [
    { name: '技术部', users: 45, posts: 89, comments: 234 },
    { name: '产品部', users: 23, posts: 56, comments: 123 },
    { name: '运营部', users: 18, posts: 34, comments: 89 },
    { name: '人事部', users: 12, posts: 23, comments: 67 },
    { name: '财务部', users: 8, posts: 12, comments: 34 }
  ]
})

// 系统健康状态
export const systemHealth = async () => [
  { name: 'CPU使用率', type: 'cpu' as const, usage: 45.6 + Math.random() * 10 - 5, status: 'normal' as const, unit: '%' as const },
  { name: '内存使用率', type: 'memory' as const, usage: 67.8 + Math.random() * 10 - 5, status: 'warning' as const, unit: '%' as const },
  { name: '磁盘使用率', type: 'disk' as const, usage: 34.2 + Math.random() * 5 - 2, status: 'normal' as const, unit: '%' as const },
  { name: '网络使用率', type: 'network' as const, usage: 23.1 + Math.random() * 10 - 5, status: 'normal' as const, unit: '%' as const }
]

// 待办事项
export const pendingTasks = async () => [
  {
    id: 1,
    type: 'content_audit' as const,
    title: '内容审核',
    priority: 'high' as const,
    createdAt: '2024-12-14 09:30:00',
    count: 12
  },
  {
    id: 2,
    type: 'user_report' as const,
    title: '用户举报处理',
    priority: 'medium' as const,
    createdAt: '2024-12-14 10:15:00',
    count: 23
  },
  {
    id: 3,
    type: 'banner_approval' as const,
    title: '横幅审批',
    priority: 'low' as const,
    createdAt: '2024-12-14 08:00:00',
    count: 1
  },
  {
    id: 4,
    type: 'quotation_audit' as const,
    title: '报价审核',
    priority: 'medium' as const,
    createdAt: '2024-12-14 11:20:00',
    count: 5
  }
]

// 最近活动 - 反馈数据
export const recentActivities = async () => [
  {
    id: 1,
    user: { 
      id: 1,
      nickname: '张三', 
      avatar: '/avatars/zhangsan.jpg' 
    },
    content: 'Vue 3 Composition API 最佳实践分享这篇文章写得非常好，学到了很多新知识',
    type: 'suggestion',
    rating: 5,
    tags: ['技术分享', 'Vue'],
    isRead: false,
    createdAt: '2024-12-14 16:30:00'
  },
  {
    id: 2,
    user: { 
      id: 2,
      nickname: '李四', 
      avatar: '/avatars/lisi.jpg' 
    },
    content: '技术分享主题征集这个投票活动很有意义，希望能多举办类似的活动',
    type: 'praise',
    rating: 4,
    tags: ['活动建议', '投票'],
    isRead: true,
    createdAt: '2024-12-14 15:45:00'
  },
  {
    id: 3,
    user: { 
      id: 3,
      nickname: '王五', 
      avatar: '/avatars/wangwu.jpg' 
    },
    content: '关于员工食堂菜品改进的建议中提到的问题确实存在，希望尽快改善',
    type: 'complaint',
    rating: 3,
    tags: ['员工福利', '食堂'],
    isRead: false,
    createdAt: '2024-12-14 14:20:00'
  }
]

// 热门内容
export const hotContent = [
  {
    id: 1,
    title: '2024年度员工大会通知',
    category: '公司事务',
    views: 2345,
    likes: 156,
    comments: 45,
    author: '赵六',
    time: '2024-12-08 09:00:00'
  },
  {
    id: 2,
    title: '年终奖发放时间确认',
    category: '员工福利',
    views: 1890,
    likes: 234,
    comments: 67,
    author: '孙七',
    time: '2024-12-07 11:20:00'
  },
  {
    id: 3,
    title: 'Vue 3 Composition API 最佳实践分享',
    category: '技术讨论',
    views: 1245,
    likes: 89,
    comments: 23,
    author: '张三',
    time: '2024-12-10 14:30:00'
  },
  {
    id: 4,
    title: '关于员工食堂菜品改进的建议',
    category: '产品建议',
    views: 567,
    likes: 34,
    comments: 12,
    author: '王五',
    time: '2024-12-09 10:15:00'
  }
]

// 公告通知
export const announcements = async () => [
  {
    id: 1,
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行维护升级，期间可能影响正常使用',
    type: 'maintenance' as const,
    publisher: '系统管理员',
    publishedAt: '2024-12-14 08:00:00'
  },
  {
    id: 2,
    title: '年终总结报告提交提醒',
    content: '请各部门在12月20日前提交年终总结报告',
    type: 'info' as const,
    publisher: '人事部',
    publishedAt: '2024-12-14 09:00:00'
  },
  {
    id: 3,
    title: '新功能上线通知',
    content: '新的投票功能已上线，欢迎体验使用',
    type: 'info' as const,
    publisher: '产品部',
    publishedAt: '2024-12-13 10:00:00'
  }
]