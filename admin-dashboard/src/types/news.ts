/**
 * 资讯聚合管理模块类型定义
 */

export interface NewsSource {
  id: number
  name: string
  type: 'rss' | 'api' | 'crawler' | 'manual'
  url?: string
  category: string[]
  cronExpression?: string
  selectorTitle?: string
  selectorContent?: string
  requiresReview: boolean  // 新增字段：是否需要审核
  status: 'active' | 'inactive' | 'error'
  lastFetchTime?: string
  createTime: string
  updateTime?: string
  // API特有属性
  method?: 'GET' | 'POST'
  headers?: string
  requestBody?: string
  // 爬虫特有属性
  contentSelector?: string
  titleSelector?: string
  linkSelector?: string
  delay?: number
  // 功能开关
  autoDedup: boolean
  autoCategory: boolean
  // 监控配置
  alertOnFailure?: boolean
  maxRetries?: number
  timeout?: number
  // 统计信息
  healthScore: number
  successRate: number
  todayFetchCount: number
  description?: string
}

export interface NewsArticle {
  id: number
  externalId?: string
  title: string
  description: string  // 新增字段：资讯描述/摘要
  rawContent?: string
  cleanContent: string
  sourceUrl?: string
  sourceId: number
  sourceName: string
  sourceType: 'rss' | 'api' | 'crawler' | 'manual'
  category?: string
  tags?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'published'
  effectiveTime?: string  // 新增字段：生效时间
  expireTime?: string     // 新增字段：失效时间
  visibilityScope?: string[] | 'ALL'  // 新增字段：可见范围
  publishTime?: string
  isDuplicate: boolean
  similarity?: number
  fetchTime: string
  createTime: string
  updateTime?: string
  // 审核相关
  reviewer?: string
  reviewTime?: string
  reviewReason?: string
  // 质量相关
  qualityScore?: number
  autoTags?: string[]
  // 统计信息
  viewCount?: number
  likeCount?: number
}

export interface NewsStats {
  pendingCount: number
  duplicateCount: number
  todayApproved: number
  avgProcessTime: number
  totalFetched: number
  activeSourceCount: number
  errorSourceCount: number
}

export interface NewsSourceStats {
  active: number
  warning: number
  error: number
  totalFetched: number
}

export interface NewsTask {
  id: number
  sourceId: number
  sourceName: string
  status: 'running' | 'success' | 'failed' | 'pending'
  startTime: string
  endTime?: string
  duration?: number
  fetchCount: number
  errorMessage?: string
  nextRunTime?: string
}

export interface NewsTaskStats {
  runningTasks: number
  todaySuccess: number
  todayFailed: number
  totalFetched: number
}

export interface NewsLogEntry {
  id: number
  sourceId: number
  sourceName: string
  time: string
  level: 'success' | 'warning' | 'error'
  message: string
  fetchCount?: number
  duration?: number
  details?: any
}

export interface NewsSourceForm {
  id?: number
  name: string
  type: 'rss' | 'api' | 'crawler'
  url: string
  category: string[]
  cronExpression?: string
  requiresReview: boolean  // 新增字段
  method?: 'GET' | 'POST'
  headers?: string
  requestBody?: string
  contentSelector?: string
  titleSelector?: string
  linkSelector?: string
  delay?: number
  autoDedup: boolean
  autoCategory: boolean
  alertOnFailure?: boolean
  maxRetries?: number
  timeout?: number
  description?: string
}

export interface NewsArticleForm {
  id?: number
  title: string
  description: string
  content: string
  effectiveTime: string
  expireTime?: string
  visibilityScope: string[] | 'ALL'
  category?: string
  tags?: string[]
}

export interface NewsQueryParams {
  page?: number
  size?: number
  keyword?: string
  sourceId?: number
  category?: string
  status?: string
  duplicateStatus?: string
  startTime?: string
  endTime?: string
  visibilityScope?: string
}

export interface NewsSourceQueryParams {
  page?: number
  size?: number
  name?: string
  type?: string
  status?: string
  requiresReview?: boolean
}

export interface NewsTaskQueryParams {
  page?: number
  size?: number
  sourceId?: number
  status?: string
  startTime?: string
  endTime?: string
}

export interface BatchNewsOperation {
  ids: number[]
  action: 'approve' | 'reject' | 'delete' | 'start_fetch'
  reason?: string
}

export interface NewsLogFilter {
  level?: string
  dateRange?: string[]
  sourceId?: number
}

// 组织架构相关（用于可见范围选择）
export interface OrganizationNode {
  id: string
  name: string
  parentId?: string
  type: 'company' | 'department' | 'team'
  children?: OrganizationNode[]
}

export interface VisibilityScope {
  type: 'ALL' | 'DEPARTMENTS'
  departmentIds?: string[]
}