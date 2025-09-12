export interface User {
  id: number
  username: string
  password?: string
  name: string
  nickname?: string // 增加昵称字段
  email: string
  phone?: string
  avatar?: string
  groupId: number
  group?: UserGroup
  department?: string // 增加部门字段
  position?: string
  bio?: string
  status: 1 | 0
  roles: Role[]
  createTime: string
  updateTime: string
  lastLoginTime?: string
}

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  permissions: Permission[]
  dataScope: DataScopeType
  status: 1 | 0
  createTime: string
  updateTime: string
}

export interface Permission {
  id: number
  permKey: string
  name: string
  module?: string
  type: PermissionType
  parentId?: number
  path?: string
  icon?: string
  sort?: number
  children?: Permission[]
  createTime: string
}

export interface Content {
  id: number
  title: string
  type: 'article' | 'post' | 'comment' | 'news' | 'goods' | 'quote'
  module: 'knowledge' | 'forum' | 'news' | 'flea-market' | 'operation'
  category: string
  author: User
  status: 1 | 2 | 3 | 4 // 1:待审核, 2:已发布, 3:审核拒绝, 4:已删除
  content: string
  contentHtml?: string
  tags: string[]
  viewCount: number
  likeCount: number
  commentCount: number
  isTop: boolean
  topExpiry?: string
  isElite: boolean
  isLocked: boolean
  auditReason?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  deletedAt?: string
}

export interface AuditRecord {
  id: number
  contentId: number
  content: Content
  auditorId: number
  auditor: User
  action: 'approve' | 'reject' | 'revise'
  reason?: string
  createdAt: string
}

export interface SystemLog {
  id: number
  userId: number
  user: User
  action: string
  module: string
  description: string
  ip: string
  userAgent: string
  createdAt: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

export interface SearchParams {
  keyword?: string
  status?: string
  category?: string
  startTime?: string
  endTime?: string
}

export interface DashboardStats {
  todayActiveUsers: number
  todayNewContent: number
  pendingAudit: number
  systemHealth: 'good' | 'warning' | 'error'
  totalUsers: number
  totalContent: number
  monthlyActiveUsers: number
  contentGrowthRate: number
}

// RBAC相关新增类型定义
export interface UserGroup {
  id: number
  name: string
  parentId?: number
  level: string
  sort: number
  children?: UserGroup[]
  roles?: Role[]
  userCount?: number
  createTime: string
  updateTime?: string
}

export type DataScopeType = 1 | 2 | 3 | 4
// 1: 全部数据, 2: 本部门数据, 3: 本部门及子部门数据, 4: 本人数据

export type PermissionType = 1 | 2 | 3
// 1: 菜单权限, 2: 按钮权限, 3: API权限

// 全局操作类型定义
export type GlobalOperationType = 
  // RBAC操作
  | 'ASSIGN_ROLE' | 'REMOVE_ROLE' | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER'
  | 'CREATE_ROLE' | 'UPDATE_ROLE' | 'DELETE_ROLE' | 'SYNC_USERS'
  | 'CREATE_GROUP' | 'UPDATE_GROUP' | 'DELETE_GROUP'
  | 'CREATE_PERMISSION' | 'UPDATE_PERMISSION' | 'DELETE_PERMISSION'
  // 内容管理操作
  | 'CREATE_CONTENT' | 'UPDATE_CONTENT' | 'DELETE_CONTENT' | 'AUDIT_CONTENT'
  | 'PUBLISH_CONTENT' | 'UNPUBLISH_CONTENT' | 'TOP_CONTENT' | 'ELITE_CONTENT'
  | 'LOCK_CONTENT' | 'UNLOCK_CONTENT' | 'MOVE_CONTENT'
  | 'CREATE_CATEGORY' | 'UPDATE_CATEGORY' | 'DELETE_CATEGORY'
  // 资讯管理操作
  | 'CREATE_NEWS_SOURCE' | 'UPDATE_NEWS_SOURCE' | 'DELETE_NEWS_SOURCE'
  | 'CRAWL_NEWS' | 'AUDIT_NEWS' | 'PUBLISH_NEWS'
  // Banner管理操作
  | 'CREATE_BANNER' | 'UPDATE_BANNER' | 'DELETE_BANNER' | 'AUDIT_BANNER'
  | 'APPROVE_BANNER' | 'REJECT_BANNER' | 'PUBLISH_BANNER'
  // 审核中心操作
  | 'UPDATE_AUDIT_POLICY' | 'CREATE_SENSITIVE_WORD' | 'UPDATE_SENSITIVE_WORD'
  | 'DELETE_SENSITIVE_WORD' | 'BATCH_AUDIT'
  // 跳蚤市场操作
  | 'CREATE_GOODS' | 'UPDATE_GOODS' | 'DELETE_GOODS' | 'AUDIT_GOODS'
  | 'HANDLE_REPORT' | 'CREATE_FLEA_CATEGORY' | 'UPDATE_FLEA_CATEGORY'
  // 名言管理操作
  | 'CREATE_QUOTATION' | 'UPDATE_QUOTATION' | 'DELETE_QUOTATION' | 'AUDIT_QUOTATION'
  // 运营管理操作
  | 'UPDATE_HOMEPAGE_CONFIG' | 'CREATE_RECOMMENDATION' | 'UPDATE_RECOMMENDATION'
  | 'DELETE_RECOMMENDATION' | 'UPDATE_RANKING'
  // 系统配置操作
  | 'UPDATE_SYSTEM_CONFIG' | 'BACKUP_DATA' | 'RESTORE_DATA' | 'CLEAR_CACHE'
  | 'UPDATE_ALERT_CONFIG' | 'HANDLE_ALERT'
  // 门户配置操作
  | 'PERFORMANCE_MONITOR' | 'UPDATE_NAVIGATION' | 'VERSION_CONTROL' | 'PORTAL_PREVIEW'

// 兼容现有RBAC模块的操作类型
export type OperationType = Extract<GlobalOperationType, 
  | 'ASSIGN_ROLE' | 'REMOVE_ROLE' | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER'
  | 'CREATE_ROLE' | 'UPDATE_ROLE' | 'DELETE_ROLE' | 'SYNC_USERS'
>

// 全局审计模块枚举
export type AuditModule = 
  | 'RBAC' | 'CONTENT' | 'NEWS' | 'BANNER' | 'AUDIT' 
  | 'FLEA_MARKET' | 'QUOTATION' | 'OPERATION' | 'SYSTEM' | 'PORTAL'

// 全局审计目标类型
export type GlobalTargetType = 
  | 'USER' | 'ROLE' | 'PERMISSION' | 'GROUP'
  | 'CONTENT' | 'CATEGORY' | 'COMMENT' 
  | 'NEWS_SOURCE' | 'NEWS' | 'BANNER' | 'GOODS'
  | 'QUOTATION' | 'RECOMMENDATION' | 'RANKING'
  | 'AUDIT_POLICY' | 'SENSITIVE_WORD' | 'SYSTEM_CONFIG'
  | 'NAVIGATION' | 'PERFORMANCE'

// 风险等级枚举
export type RiskLevel = 'low' | 'medium' | 'high'

// 审计日志状态枚举（用于审核流程）
export type AuditStatus = 'pending' | 'approved' | 'rejected' | 'assigned' | 'transferred'

// 业务扩展数据接口
export interface BusinessData {
  // RBAC审计专用字段
  targetType?: 'USER' | 'ROLE' | 'PERMISSION' | 'GROUP'
  
  // 内容审核专用字段
  taskId?: string
  beforeStatus?: string
  afterStatus?: string
  bizType?: 'forum_post' | 'news' | 'ranking' | 'flea_goods' | 'quote' | 'banner'
  reason?: string
  tags?: string[]
  
  // 系统日志专用字段
  level?: 'debug' | 'info' | 'warn' | 'error'
  userAgent?: string
  
  // 通用扩展字段
  metadata?: Record<string, any>
}

// 全局审计日志接口（增强版）
export interface GlobalAuditLog {
  id: number
  operatorId: number
  operatorName: string
  operationType: GlobalOperationType
  module: AuditModule
  targetType: GlobalTargetType
  targetId: string
  targetName: string
  detail?: string
  clientIp: string
  createTime: string
  
  // 新增增强字段
  userAgent?: string
  responseTime?: number  // 响应时间（毫秒）
  riskLevel?: RiskLevel   // 风险等级
  businessData?: BusinessData  // 业务扩展数据
  
  // 用于兼容现有数据结构的别名字段
  reason?: string         // 兼容审核日志的 reason
  beforeStatus?: string   // 兼容审核日志的状态变化
  afterStatus?: string    // 兼容审核日志的状态变化
  taskId?: string         // 兼容审核日志的 taskId
  level?: string          // 兼容系统日志的级别
  action?: string         // 兼容通用 action 字段
}

// 兼容现有RBAC模块的审计日志接口
export interface AuditLog {
  id: number
  operatorId: number
  operatorName: string
  operationType: OperationType
  targetType: 'USER' | 'ROLE' | 'PERMISSION' | 'GROUP'
  targetId: number
  targetName: string
  detail?: string
  clientIp: string
  createTime: string
}

export interface SyncConfig {
  id: number
  type: SyncType
  name: string
  status: 1 | 0
  config: Record<string, any>
  lastSyncTime?: string
  createTime: string
  updateTime: string
}

export type SyncType = 'wework' | 'ldap' | 'ad' | 'dingtalk'

export interface SyncResult {
  success: boolean
  syncTime: string
  totalUsers: number
  addedUsers: number
  updatedUsers: number
  disabledUsers: number
  errors: string[]
}

// 表格查询参数
export interface UserQueryParams extends PaginationParams {
  keyword?: string
  groupId?: number
  status?: 1 | 0
  startTime?: string
  endTime?: string
}

export interface RoleQueryParams extends PaginationParams {
  keyword?: string
  status?: 1 | 0
}

// 全局审计日志查询参数（增强版）
export interface GlobalAuditLogQueryParams extends PaginationParams {
  // 基础筛选
  operatorId?: number
  operationType?: GlobalOperationType
  module?: AuditModule
  targetType?: GlobalTargetType
  startTime?: string
  endTime?: string
  keyword?: string
  
  // 增强筛选
  riskLevel?: RiskLevel
  level?: 'debug' | 'info' | 'warn' | 'error'  // 系统日志级别
  action?: string          // 通用操作类型筛选
  taskId?: string          // 审核任务ID筛选
  bizType?: string         // 业务类型筛选
  beforeStatus?: string    // 变更前状态筛选
  afterStatus?: string     // 变更后状态筛选
  
  // 性能筛选
  minResponseTime?: number // 最小响应时间
  maxResponseTime?: number // 最大响应时间
  
  // IP地址筛选
  clientIp?: string
}

// 全局审计日志统计数据
export interface GlobalAuditLogStatistics {
  // 基础统计
  totalLogs: number
  todayLogs: number
  todayIncrease: number
  
  // 操作人员统计
  activeOperators: number
  totalOperations: number
  
  // 风险统计
  riskOperations: number
  riskChange: number
  
  // 性能统计
  avgResponseTime: number
  performanceChange: number
  
  // 按模块统计
  moduleStats: {
    module: AuditModule
    count: number
    riskCount: number
  }[]
  
  // 按操作类型统计
  operationStats: {
    operation: string
    count: number
    trend: number
  }[]
  
  // 按时间统计（最近7天）
  dailyStats: {
    date: string
    count: number
    riskCount: number
    avgResponseTime: number
  }[]
  
  // 活跃操作员
  topOperators: {
    operatorId: number
    operatorName: string
    count: number
    riskRate: number
  }[]
}

// 兼容现有RBAC模块的审计日志查询参数
export interface AuditLogQueryParams extends PaginationParams {
  operatorId?: number
  operationType?: OperationType
  targetType?: string
  startTime?: string
  endTime?: string
}

// 表单数据类型
export interface UserForm {
  id?: number
  username: string
  name: string
  password?: string
  email?: string
  phone?: string
  groupId: number
  status: 1 | 0
  roleIds?: number[]
}

export interface RoleForm {
  id?: number
  code: string
  name: string
  description?: string
  dataScope: DataScopeType
  status: 1 | 0
  permissionIds?: number[]
}

export interface GroupForm {
  id?: number
  name: string
  parentId?: number
  sort: number
}

// 登录相关
export interface LoginForm {
  username: string
  password: string
  remember?: boolean
  captcha?: string
}

export interface LoginResponse {
  token: string
  user: User
  permissions: string[]
  menus: MenuNode[]
}

export interface MenuNode {
  id: number
  name: string
  path?: string
  icon?: string
  meta?: {
    hideInMenu?: boolean
    [key: string]: any
  }
  children?: MenuNode[]
}

// 统一内容管理中心相关类型定义

export interface ContentStats {
  total: number
  articles: number
  posts: number
  comments: number
  news: number
  goods: number
  quotes: number
  pending: number
  today: number
  thisWeek: number
  thisMonth: number
}

export interface ContentQueryParams extends PaginationParams {
  keyword?: string
  type?: string
  module?: string
  category?: string
  status?: number
  author?: string
  authorId?: number
  startTime?: string
  endTime?: string
  isTop?: boolean
  isElite?: boolean
}

export interface ContentForm {
  id?: number
  title: string
  type: string
  module: string
  category: string
  content: string
  contentHtml?: string
  tags: string[]
  isTop?: boolean
  topExpiry?: string
  isElite?: boolean
  status?: number
}

export interface BatchContentOperation {
  contentIds: number[]
  operation: 'publish' | 'reject' | 'delete' | 'top' | 'elite' | 'move' | 'lock'
  params?: {
    reason?: string
    categoryId?: string
    topExpiry?: string
  }
}


export interface ContentCategory {
  id: number
  name: string
  module: string
  parentId?: number
  level: number
  sort: number
  status: 1 | 0
  children?: ContentCategory[]
  contentCount?: number
  createdAt: string
  updatedAt?: string
}

export interface HotContent {
  id: number
  title: string
  type: string
  module: string
  category: string
  author: User
  viewCount: number
  likeCount: number
  commentCount: number
  score: number // 热度评分
  createdAt: string
}

export interface ContentPreview {
  id: number
  title: string
  content: string
  contentHtml?: string
  type: string
  module: string
  category: string
  author: User
  status: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

// ======================== 领导名言管理模块类型定义 ========================

// 名言状态枚举
export type QuotationStatus = 'draft' | 'pending_review' | 'published' | 'archived'

// 审核操作枚举  
export type ReviewOperation = 'approve' | 'reject'

// 展示模式枚举
export type DisplayMode = 'sequence' | 'random'

// 领导名言接口
export interface Quotation {
  id: number
  content: string
  contentHtml?: string
  leaderId: number
  leader: User
  occasion: string
  occurrenceTime?: string
  background?: string
  status: QuotationStatus
  version: number
  creatorId: number
  creator: User
  reviewerId?: number
  reviewer?: User
  publishTime?: string
  showCount: number
  likeCount: number
  tags: string[]
  createTime: string
  updateTime: string
}

// 名言表单接口（用于创建和编辑）
export interface QuotationForm {
  id?: number
  content: string
  leaderId: number
  occasion: string
  occurrenceTime?: string
  background?: string
  tags: string[]
  status?: QuotationStatus
}

// 名言查询参数
export interface QuotationQueryParams extends PaginationParams {
  keyword?: string
  leaderId?: number
  tags?: string[]
  status?: QuotationStatus
  startTime?: string
  endTime?: string
}

// 审核记录接口
export interface QuotationReviewLog {
  id: number
  quotationId: number
  quotation: Quotation
  reviewerId: number
  reviewer: User
  operation: ReviewOperation
  comment?: string
  createTime: string
}

// 修正历史记录接口
export interface QuotationRevisionHistory {
  id: number
  quotationId: number
  oldContent: string
  newContent: string
  revisionReason: string
  reviewerId?: number
  reviewer?: User
  createTime: string
}

// 修正申请表单
export interface RevisionRequestForm {
  quotationId: number
  newContent: string
  revisionReason: string
}

// 批量操作接口
export interface QuotationBatchOperation {
  quotationIds: number[]
  operation: 'publish' | 'archive' | 'delete' | 'update_tags'
  params?: {
    tags?: string[]
    reason?: string
  }
}

// 展示配置接口
export interface DisplayConfig {
  id: number
  name: string
  mode: DisplayMode
  quotationIds?: number[]
  startTime?: string
  endTime?: string
  isActive: boolean
  createTime: string
  updateTime: string
}

// 精选集接口
export interface QuotationPlaylist {
  id: number
  name: string
  description?: string
  quotationIds: number[]
  quotations: Quotation[]
  startTime?: string
  endTime?: string
  isActive: boolean
  createTime: string
  updateTime: string
}

// 名言统计数据接口
export interface QuotationStatistics {
  totalCount: number
  publishedCount: number
  pendingCount: number
  archivedCount: number
  todayPublished: number
  weeklyPublished: number
  monthlyPublished: number
  topLeaders: {
    leaderId: number
    leaderName: string
    count: number
  }[]
  popularQuotations: {
    id: number
    content: string
    showCount: number
    likeCount: number
  }[]
}

// 每日一语配置接口
export interface DailyQuoteConfig {
  id: number
  isEnabled: boolean
  sendTime: string // 格式: "09:00"
  mode: DisplayMode
  targetQuotationIds?: number[]
  lastSentTime?: string
  createTime: string
  updateTime: string
}

// ======================== 跳蚤市场管理模块类型定义 ========================

// 商品状态枚举
export type FleaGoodsStatus = 'under_review' | 'published' | 'offline' | 'sold'

// 商品新旧程度
export type GoodsCondition = 'new' | 'almost_new' | 'old'

// 交易方式
export type TransactionMethod = 'self_pickup' | 'meetup'

// 举报类型
export type ReportTargetType = 'goods' | 'chat'

// 举报状态
export type ReportStatus = 'pending' | 'processed'

// 商品分类接口
export interface FleaCategory {
  id: number
  name: string
  parentId?: number
  sort: number
  createTime: string
}

// 商品接口
export interface FleaGoods {
  id: number
  title: string
  description?: string
  price: number
  categoryId: number
  category?: FleaCategory
  condition: GoodsCondition
  transactionMethod: TransactionMethod
  status: FleaGoodsStatus
  sellerId: number
  seller: User
  viewCount: number
  likeCount: number
  images: FleaGoodsImage[]
  createTime: string
  updateTime: string
}

// 商品图片接口
export interface FleaGoodsImage {
  id: number
  goodsId: number
  url: string
  sort: number
  createTime: string
}

// 聊天会话接口
export interface FleaChatSession {
  id: number
  goodsId: number
  goods: FleaGoods
  buyerId: number
  buyer: User
  sellerId: number
  seller: User
  createTime: string
}

// 聊天消息接口
export interface FleaChatMessage {
  id: number
  sessionId: number
  senderId: number
  sender: User
  content: string
  createTime: string
}

// 举报接口
export interface FleaReport {
  id: number
  reporterId: number
  reporter: User
  targetType: ReportTargetType
  targetId: number
  targetGoods?: FleaGoods
  reason: string
  status: ReportStatus
  handler?: User
  handlerId?: number
  handleRemark?: string
  handleTime?: string
  createTime: string
}

// 商品表单接口（用于创建和编辑）
export interface FleaGoodsForm {
  id?: number
  title: string
  description?: string
  price: number
  categoryId: number
  condition: GoodsCondition
  transactionMethod: TransactionMethod
  images: string[] // 图片URL数组
}

// 商品查询参数
export interface FleaGoodsQueryParams extends PaginationParams {
  keyword?: string
  categoryId?: number
  condition?: GoodsCondition
  priceMin?: number
  priceMax?: number
  status?: FleaGoodsStatus
  sellerId?: number
  startTime?: string
  endTime?: string
}

// 分类查询参数
export interface FleaCategoryQueryParams {
  parentId?: number
  name?: string
}

// 举报查询参数
export interface FleaReportQueryParams extends PaginationParams {
  reporterId?: number
  targetType?: ReportTargetType
  status?: ReportStatus
  startTime?: string
  endTime?: string
}

// 聊天会话查询参数
export interface FleaChatSessionQueryParams extends PaginationParams {
  goodsId?: number
  buyerId?: number
  sellerId?: number
}

// 批量操作接口
export interface FleaGoodsBatchOperation {
  goodsIds: number[]
  operation: 'publish' | 'offline' | 'delete' | 'approve' | 'reject'
  params?: {
    reason?: string
  }
}

// 跳蚤市场统计数据接口
export interface FleaMarketStatistics {
  totalGoods: number
  publishedGoods: number
  pendingGoods: number
  soldGoods: number
  offlineGoods: number
  todayNewGoods: number
  weeklyNewGoods: number
  monthlyNewGoods: number
  totalUsers: number
  activeUsers: number
  totalSales: number
  averagePrice: number
  popularCategories: {
    categoryId: number
    categoryName: string
    count: number
  }[]
  recentReports: number
  pendingReports: number
}

// 商品详情预览接口
export interface FleaGoodsDetail extends FleaGoods {
  relatedGoods?: FleaGoods[] // 相关商品推荐
  chatSessions?: FleaChatSession[] // 关联的聊天会话
}

// 用户商品统计
export interface UserGoodsStats {
  published: number
  sold: number
  offline: number
  underReview: number
  totalViews: number
  totalLikes: number
}

// ======================== 统一审核中心模块类型定义 ========================

// 审核任务状态枚举
export type AuditTaskStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved' | 'auto_rejected'

// 业务类型枚举
export type BizType = 'forum_post' | 'flea_goods' | 'news' | 'banner' | 'quotation'

// 优先级枚举
export type Priority = 'high' | 'normal' | 'low'

// 审核模式枚举
export type AuditMode = 'pre' | 'post' | 'sample'

// 分配规则枚举
export type AssignRule = 'auto' | 'manual' | 'role'

// 敏感词处理动作枚举
export type SensitiveWordAction = 'forbidden' | 'review' | 'replace'

// 审核员角色枚举
export type AuditorRole = 'content_auditor' | 'senior_auditor' | 'audit_manager'

// 审核任务接口
export interface AuditTask {
  id: number
  taskId: string
  bizType: BizType
  bizId: string
  title?: string
  content: string
  images?: string[]
  contentSnapshot: any
  submitterId: number
  submitterName: string
  status: AuditTaskStatus
  priority: Priority
  auditPolicyId?: number
  assigneeId?: number
  assigneeName?: string
  createTime: string
  updateTime?: string
  approveTime?: string
  rejectTime?: string
  rejectReason?: string
  rejectDetail?: string
}

// 审核策略接口
export interface AuditPolicy {
  id: number
  bizType: BizType
  name: string
  mode: AuditMode
  sampleRate?: number
  priority: Priority
  assignRule: AssignRule
  assigneeId?: number
  roleId?: number
  ruleConfig?: any
  isActive: boolean
  createTime: string
  updateTime?: string
}

// 敏感词接口
export interface SensitiveWord {
  id: number
  word: string
  isRegex: boolean
  action: SensitiveWordAction
  replaceWith?: string
  category: string
  hitCount: number
  remark?: string
  creator: string
  createTime: string
  updateTime?: string
}

// 审核员接口
export interface Auditor {
  id: number
  name: string
  username: string
  role: AuditorRole
  department: string
  email: string
  phone: string
  permissions: BizType[]
  status: boolean
  pendingCount: number
  todayProcessed: number
  approvalRate: number
  remark?: string
  createTime: string
  updateTime?: string
}

// 审核统计数据接口
export interface AuditStats {
  pendingTotal: number
  todayNew: number
  todayProcessed: number
  avgProcessTime: number
  approvalRate: number
  todayApproved: number
  todayRejected: number
  rejectionRate: number
}

// 任务筛选参数
export interface TaskFilters {
  bizType?: BizType
  priority?: Priority
  dateRange?: [string, string]
  keyword?: string
  page?: number
  size?: number
}

// 策略表单接口
export interface PolicyForm {
  id?: number
  name: string
  bizType: BizType
  mode: AuditMode
  sampleRate?: number
  priority: Priority
  assignRule: AssignRule
  assigneeId?: number
  roleId?: number
  ruleConfig?: string
  isActive: boolean
}

// 敏感词表单接口
export interface WordForm {
  id?: number
  word: string
  isRegex: boolean
  action: SensitiveWordAction
  replaceWith?: string
  category: string
  remark?: string
}

// 审核员表单接口
export interface AuditorForm {
  id?: number
  name: string
  username: string
  password?: string
  role: AuditorRole
  department: string
  email: string
  phone: string
  permissions: BizType[]
  status: boolean
  remark?: string
}

// 任务分配表单接口
export interface AssignForm {
  auditorId: number
  taskCount: number
  bizTypes: BizType[]
  priority: Priority
}

// 审核员统计数据接口
export interface AuditorStats {
  totalProcessed: number
  approvalRate: number
  avgProcessTime: number
  qualityScore: number
  dailyStats?: {
    date: string
    processed: number
    approved: number
    rejected: number
  }[]
}

// 批量审核操作接口
export interface BatchAuditOperation {
  taskIds: string[]
  action: 'approve' | 'reject'
  reason?: string
  detail?: string
}

// 任务转交接口
export interface TaskTransfer {
  taskId: string
  assigneeId: number
  reason: string
}

// 敏感词检查结果接口
export interface SensitiveWordCheckResult {
  hits: Array<{
    word: string
    action: SensitiveWordAction
    replaceWith?: string
    category: string
  }>
  processedContent?: string
}

// 审核日志接口
export interface AuditLog {
  id: number
  taskId: string
  auditorId: number
  auditorName: string
  action: 'approve' | 'reject' | 'transfer'
  reason?: string
  detail?: string
  createTime: string
}

// ======================== 审核节点相关类型定义 ========================

// 审核节点配置接口
export interface AuditNodeConfig {
  bizType: BizType
  nodeId: string
  nodeName: string
  endpoint: string
  enabled: boolean
  retryCount?: number
  timeout?: number
  ruleConfig?: Record<string, any>
}

// 审核任务提交数据
export interface AuditTaskSubmission {
  bizType: BizType
  bizId: string
  content: any
  submitterId: number
  submitterName: string
  metadata?: Record<string, any>
}

// 审核结果回调数据
export interface AuditCallbackData {
  taskId: string
  status: 'approved' | 'rejected' | 'auto_approved' | 'auto_rejected'
  reason?: string
  detail?: string
  auditorId?: number
  processTime: number
}

// 审核节点检查结果
export interface AuditCheckResult {
  needAudit: boolean
  policy?: AuditPolicy
  priority: 'high' | 'normal' | 'low'
  skipReason?: string
}

// 审核节点健康状态
export interface AuditNodeHealth {
  nodeId: string
  nodeName: string
  status: 'healthy' | 'warning' | 'error'
  lastCheckTime: string
  avgResponseTime?: number
  errorCount?: number
  uptime?: number
}

// 审核节点性能统计
export interface AuditNodePerformance {
  nodeId: string
  avgResponseTime: number
  successRate: number
  dailyTasks: number
  errorRate: number
  throughput: number
}

// ======================== Banner智能审批相关类型定义 ========================

// Banner状态枚举
export type BannerStatus = 'draft' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'published' | 'offline'

// Banner接口定义
export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  status: BannerStatus
  description?: string
  creator: string
  createTime: string
  updateTime?: string
  auditTaskId?: string
  rejectReason?: string
  rejectDetail?: string
}

// Banner表单接口
export interface BannerForm {
  id?: number
  title: string
  imageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  description?: string
  auditOptions?: {
    submitForAuditImmediately?: boolean
    priority?: 'high' | 'normal' | 'low'
    metadata?: Record<string, any>
    approvalConfig?: ApprovalConfig
    approvalReady?: boolean
  }
}

// 审批配置接口
export interface ApprovalConfig {
  mode: 'smart' | 'template' | 'custom'
  smart?: SmartApprovalConfig
  template?: TemplateApprovalConfig
  custom?: CustomApprovalConfig
  preview: ApprovalStep[]
}

// 智能审批配置
export interface SmartApprovalConfig {
  priority: 'high' | 'normal' | 'low'
  expectedCompleteTime?: string
  autoReminder: boolean
  smartEscalation: boolean
  parallelProcessing: boolean
  recommendation?: ApprovalRecommendation
}

// 模板审批配置
export interface TemplateApprovalConfig {
  templateId: number
  priority: 'high' | 'normal' | 'low'
  features: string[]
  selected?: ApprovalTemplate
}

// 自定义审批配置
export interface CustomApprovalConfig {
  steps: CustomApprovalStep[]
  globalPriority: 'high' | 'normal' | 'low'
  parallelEnabled: boolean
  reminderEnabled: boolean
}

// 审批步骤接口
export interface ApprovalStep {
  name: string
  approver?: string
  timeLimit?: string
  type?: 'manual' | 'auto' | 'conditional'
  description?: string
  estimatedTime?: string
}

// 自定义审批步骤
export interface CustomApprovalStep {
  id: number
  name: string
  approverId?: number
  timeLimit: string
  type: 'manual' | 'auto' | 'conditional'
  required: boolean
  description?: string
}

// 审批推荐
export interface ApprovalRecommendation {
  confidence: number
  reason: string
  steps: ApprovalStep[]
  estimatedTotalTime?: string
}

// 审批模板
export interface ApprovalTemplate {
  id: number
  name: string
  description: string
  recommended: boolean
  avgProcessTime: string
  stepCount: number
  successRate: number
  steps: ApprovalStep[]
}

// Banner查询参数
export interface BannerQueryParams {
  title?: string
  status?: BannerStatus
  creator?: string
  startTime?: string
  endTime?: string
  page?: number
  size?: number
}

// Banner列表响应
export interface BannerListResponse {
  list: Banner[]
  total: number
}

// 审批人员接口
export interface Approver {
  id: number
  name: string
  department: string
  role?: string
  email?: string
  avatar?: string
  workload?: number
  averageResponseTime?: string
}

// ======================== 企业论坛增强功能类型定义 ========================

// 三级分类系统接口（继承并增强现有ContentCategory）
export interface ForumCategory {
  id: number
  name: string
  code: string
  description?: string
  icon?: string
  parentId: number  // 0表示一级分类
  level: 1 | 2 | 3  // 层级：1, 2, 3
  sortOrder: number
  isActive: boolean
  isPublic: boolean
  auditMode: 'none' | 'pre' | 'post' | 'sample'  // 审核模式
  postPermissions: string[]  // 发帖权限
  children?: ForumCategory[]
  postCount?: number
  todayPosts?: number
  moderators?: User[]
  createdAt: string
  updatedAt?: string
}

// 论坛分类树接口
export interface ForumCategoryTree {
  categories: ForumCategory[]
  total: number
}

// 分类表单接口
export interface ForumCategoryForm {
  id?: number
  name: string
  code: string
  description?: string
  icon?: string
  parentId: number
  level: 1 | 2 | 3
  sortOrder: number
  isActive: boolean
  isPublic: boolean
  auditMode: 'none' | 'pre' | 'post' | 'sample'
  postPermissions: string[]
}

// 置顶/加精申请类型枚举
export type FeatureRequestType = 'top' | 'elite'

// 申请状态枚举  
export type FeatureRequestStatus = 'pending' | 'approved' | 'rejected'

// 置顶/加精申请接口
export interface ForumFeatureRequest {
  id: number
  postId: number
  post?: Content  // 关联的帖子
  applicantId: number
  applicant: User  // 申请人
  requestType: FeatureRequestType  // 申请类型：置顶或加精
  reason: string  // 申请理由
  status: FeatureRequestStatus  // 状态
  reviewerId?: number
  reviewer?: User  // 审核人
  rejectReason?: string  // 拒绝原因
  createdAt: string
  updatedAt?: string
  reviewedAt?: string
}

// 申请查询参数
export interface FeatureRequestQueryParams extends PaginationParams {
  requestType?: FeatureRequestType
  status?: FeatureRequestStatus
  applicantId?: number
  reviewerId?: number
  postId?: number
  startTime?: string
  endTime?: string
}

// 申请处理表单
export interface FeatureRequestProcessForm {
  requestId: number
  action: 'approve' | 'reject'
  rejectReason?: string  // 拒绝时必填
}

// 扩展Content接口，支持官方发布标识
export interface ForumPost extends Content {
  officialFlag: boolean  // 是否官方发布
  categoryId?: number    // 关联的三级分类ID
  visibleRange?: string[]  // 可见范围（部门/组织）
  attachments?: string[]   // 附件URLs
}

// 后台发帖表单接口
export interface AdminPostForm {
  title: string
  description?: string  // 内容摘要/导语
  categoryId: number   // 三级分类ID（级联选择）
  tags: string[]       // 标签
  content: string      // 正文内容（富文本）
  contentHtml?: string // 富文本HTML内容
  visibleRange: string[]  // 可见范围（组织架构）
  attachments?: string[]  // 附件
  officialFlag?: boolean  // 官方发布标识，默认true
}

// 级联分类选择器值类型
export type CascaderValue = (string | number)[]

// 组织架构树节点接口
export interface OrganizationNode {
  id: string
  label: string
  value: string
  children?: OrganizationNode[]
}

// 申请统计数据接口
export interface FeatureRequestStats {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  todayRequests: number
  thisWeekRequests: number
  topRequests: number
  eliteRequests: number
  approvalRate: number
}

// 分类统计数据接口
export interface CategoryStats {
  total: number
  active: number
  inactive: number
  totalPosts: number
  todayPosts: number
  moderators: number
}

// 批量申请操作接口
export interface BatchFeatureRequestOperation {
  requestIds: number[]
  action: 'approve' | 'reject'
  rejectReason?: string
}

// 导出投票帖相关类型
export * from './poll'

// 导出帖子标签管理相关类型
export * from './postTags'

// 导出资讯聚合管理相关类型
export * from './news'

