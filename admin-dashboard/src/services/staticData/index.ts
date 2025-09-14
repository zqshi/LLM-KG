/**
 * 静态数据服务层主导出文件
 */

// 用户管理数据
export * from './users'

// 内容管理数据  
export * from './content'

// 仪表盘数据
export * from './dashboard'

// 其他模块数据
export * from './other'

// AI工具数据
export * from './aiTools'

// 反馈管理数据
export * from './feedback'

// 门户配置管理数据
export * from './portalConfig'

// 统一的静态数据集合
export const staticData = {
  // 用户管理
  users: () => import('./users').then(m => m.users),
  roles: () => import('./users').then(m => m.roles),
  permissions: () => import('./users').then(m => m.permissions),
  organizations: () => import('./users').then(m => m.organizations),
  syncConfigs: () => import('./users').then(m => m.syncConfigs),
  
  // 内容管理
  categories: () => import('./content').then(m => m.categories),
  posts: () => import('./content').then(m => m.posts),
  // 投票数据 - 使用内容管理模块中的数据
  polls: () => import('./content').then(m => m.polls),
  tags: () => import('./content').then(m => m.tags),
  contentStats: () => import('./content').then(m => m.contentStats),
  // 置顶/加精申请数据
  featureRequests: () => import('./content').then(m => m.featureRequests),
  
  // 仪表盘
  overviewStats: () => import('./dashboard').then(m => m.overviewStats),
  trendData: () => import('./dashboard').then(m => m.trendData),
  contentDistribution: () => import('./dashboard').then(m => m.contentDistribution),
  userActivity: () => import('./dashboard').then(m => m.userActivity),
  systemHealth: () => import('./dashboard').then(m => m.systemHealth),
  pendingTasks: () => import('./dashboard').then(m => m.pendingTasks),
  recentActivities: () => import('./dashboard').then(m => m.recentActivities),
  hotContent: () => import('./dashboard').then(m => m.hotContent),
  announcements: () => import('./dashboard').then(m => m.announcements),
  
  // 其他模块
  banners: () => import('./other').then(m => m.banners),
  fleaMarket: () => import('./other').then(m => m.fleaMarket),
  quotations: () => import('./other').then(m => m.quotations),
  news: () => import('./other').then(m => m.news),
  auditCenter: () => import('./other').then(m => m.auditCenter),
  operation: () => import('./other').then(m => m.operation),
  portalConfig: () => import('./other').then(m => m.portalConfig),
  systemConfig: () => import('./other').then(m => m.systemConfig),
  aiTools: () => import('./aiTools').then(m => m.aiTools),
  aiToolTags: () => import('./aiTools').then(m => m.aiToolTags),
  
  // 反馈管理
  feedbackItems: () => import('./feedback').then(m => m.feedbackItems),
  feedbackDetails: () => import('./feedback').then(m => m.feedbackDetails),
  feedbackStatistics: () => import('./feedback').then(m => m.feedbackStatistics),
  availableProcessors: () => import('./feedback').then(m => m.availableProcessors),
  
  // 门户配置管理
  navigationItems: () => import('./portalConfig').then(m => m.navigationItems),
  entryPanels: () => import('./portalConfig').then(m => m.entryPanels),
  entryItems: () => import('./portalConfig').then(m => m.entryItems),
  configVersions: () => import('./portalConfig').then(m => m.configVersions),
  auditLogs: () => import('./portalConfig').then(m => m.auditLogs),
  portalStatistics: () => import('./portalConfig').then(m => m.portalStatistics)
}

// 静态数据类型定义
export type StaticDataKey = keyof typeof staticData