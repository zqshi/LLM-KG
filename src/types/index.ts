export interface User {
  id: number
  username: string
  password?: string
  name: string
  email: string
  phone?: string
  avatar?: string
  groupId: number
  group?: UserGroup
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

// 兼容现有RBAC模块的操作类型
export type OperationType = Extract<GlobalOperationType, 
  | 'ASSIGN_ROLE' | 'REMOVE_ROLE' | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER'
  | 'CREATE_ROLE' | 'UPDATE_ROLE' | 'DELETE_ROLE' | 'SYNC_USERS'
>

// 全局审计模块枚举
export type AuditModule = 
  | 'RBAC' | 'CONTENT' | 'NEWS' | 'BANNER' | 'AUDIT' 
  | 'FLEA_MARKET' | 'QUOTATION' | 'OPERATION' | 'SYSTEM'

// 全局审计目标类型
export type GlobalTargetType = 
  | 'USER' | 'ROLE' | 'PERMISSION' | 'GROUP'
  | 'CONTENT' | 'CATEGORY' | 'COMMENT' 
  | 'NEWS_SOURCE' | 'NEWS' | 'BANNER' | 'GOODS'
  | 'QUOTATION' | 'RECOMMENDATION' | 'RANKING'
  | 'AUDIT_POLICY' | 'SENSITIVE_WORD' | 'SYSTEM_CONFIG'

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