// 通用API响应类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  code?: number
}

// 基础实体类型
export interface BaseEntity {
  id: number
  created_at: string
  updated_at: string
}

// ================================
// 导航管理相关类型
// ================================

// 导航项目类型枚举
export enum NavigationType {
  INTERNAL = 'internal',  // 内部路由
  EXTERNAL = 'external',  // 外部链接
  DROPDOWN = 'dropdown'   // 下拉菜单
}

// 导航项目状态枚举
export enum NavigationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft'
}

// 导航项目接口
export interface NavigationItem extends BaseEntity {
  title: string                    // 导航标题
  path?: string                   // 路由路径或外部链接
  icon?: string                   // 图标类名
  type: NavigationType            // 导航类型
  status: NavigationStatus        // 状态
  sort_order: number             // 排序
  parent_id?: number             // 父级ID（用于下拉菜单）
  target?: '_self' | '_blank'    // 打开方式
  roles?: string[]               // 角色权限
  description?: string           // 描述
  children?: NavigationItem[]    // 子菜单项
  meta?: {
    requiresAuth?: boolean       // 是否需要认证
    permissions?: string[]       // 所需权限
    cache?: boolean             // 是否缓存
    hidden?: boolean            // 是否隐藏
    badge?: {
      text: string
      type: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    }
  }
}

// 导航表单类型
export interface NavigationForm {
  title: string
  path?: string
  icon?: string
  type: NavigationType
  status: NavigationStatus
  sort_order: number
  parent_id?: number
  target?: '_self' | '_blank'
  roles?: string[]
  description?: string
  meta?: NavigationItem['meta']
}

// ================================
// 入口面板相关类型
// ================================

// 面板显示模式枚举
export enum PanelDisplayMode {
  GRID = 'grid',    // 网格模式
  LIST = 'list',    // 列表模式
  CARD = 'card'     // 卡片模式
}

// 入口面板接口
export interface EntryPanel extends BaseEntity {
  name: string                    // 面板名称
  title: string                   // 显示标题
  description?: string            // 描述
  icon?: string                   // 图标
  display_mode: PanelDisplayMode  // 显示模式
  sort_order: number             // 排序
  status: 'active' | 'inactive'  // 状态
  roles?: string[]               // 角色权限
  config?: {
    columns?: number             // 网格列数
    showHeader?: boolean         // 是否显示头部
    showDescription?: boolean    // 是否显示描述
    itemSpacing?: number         // 项目间距
    maxItems?: number           // 最大项目数
  }
  items?: EntryItem[]            // 入口项目列表
  statistics?: {
    totalItems: number
    activeItems: number
    clickCount: number
  }
}

// 入口面板表单类型
export interface EntryPanelForm {
  name: string
  title: string
  description?: string
  icon?: string
  display_mode: PanelDisplayMode
  sort_order: number
  status: 'active' | 'inactive'
  roles?: string[]
  config?: EntryPanel['config']
}

// ================================
// 入口项目相关类型
// ================================

// 入口项目接口
export interface EntryItem extends BaseEntity {
  panel_id: number               // 所属面板ID
  title: string                  // 标题
  description?: string           // 描述
  icon?: string                  // 图标
  url: string                   // 链接地址
  target: '_self' | '_blank'    // 打开方式
  sort_order: number            // 排序
  status: 'active' | 'inactive' // 状态
  roles?: string[]              // 角色权限
  tags?: string[]               // 标签
  statistics?: {
    clickCount: number          // 点击次数
    lastAccessed?: string       // 最后访问时间
  }
  meta?: {
    category?: string           // 分类
    keywords?: string[]         // 关键词
    featured?: boolean          // 是否推荐
    requiresVPN?: boolean       // 是否需要VPN
  }
}

// 入口项目表单类型
export interface EntryItemForm {
  panel_id: number
  title: string
  description?: string
  icon?: string
  url: string
  target: '_self' | '_blank'
  sort_order: number
  status: 'active' | 'inactive'
  roles?: string[]
  tags?: string[]
  meta?: EntryItem['meta']
}

// ================================
// 配置版本相关类型
// ================================

// 配置版本类型枚举
export enum ConfigVersionType {
  AUTO = 'auto',        // 自动快照
  MANUAL = 'manual',    // 手动快照
  BACKUP = 'backup',    // 备份
  ROLLBACK = 'rollback' // 回滚
}

// 配置版本接口
export interface ConfigVersion extends BaseEntity {
  name: string                    // 版本名称
  description?: string            // 描述
  type: ConfigVersionType         // 版本类型
  version_number: string          // 版本号
  data: {
    navigations: NavigationItem[] // 导航数据快照
    entryPanels: EntryPanel[]    // 面板数据快照
    metadata: {
      totalNavigations: number
      totalPanels: number
      totalEntryItems: number
      configHash: string         // 配置哈希值
      environment?: string       // 环境标识
    }
  }
  status: 'active' | 'archived'  // 状态
  created_by: number             // 创建者ID
  is_current: boolean            // 是否为当前版本
  size_bytes?: number            // 数据大小（字节）
  tags?: string[]                // 标签
}

// ================================
// 配置审计日志相关类型
// ================================

// 审计操作枚举
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update', 
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  IMPORT = 'import',
  ROLLBACK = 'rollback',
  REORDER = 'reorder'
}

// 资源类型枚举
export enum ResourceType {
  NAVIGATION = 'navigation',
  ENTRY_PANEL = 'entry_panel',
  ENTRY_ITEM = 'entry_item',
  CONFIG_VERSION = 'config_version'
}

// 审计日志状态枚举
export enum AuditStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending'
}

// 审计日志接口
export interface AuditLog extends BaseEntity {
  user_id: number                // 用户ID
  user_name?: string            // 用户名称
  action: AuditAction           // 操作类型
  resource_type: ResourceType   // 资源类型
  resource_id?: number          // 资源ID
  resource_name?: string        // 资源名称
  status: AuditStatus          // 操作状态
  ip_address: string           // IP地址
  user_agent?: string          // 用户代理
  details?: {
    before?: any               // 操作前数据
    after?: any               // 操作后数据
    changes?: string[]        // 变更字段列表
    reason?: string           // 操作原因
    metadata?: Record<string, any> // 额外元数据
  }
  duration_ms?: number         // 操作耗时（毫秒）
  error_message?: string       // 错误信息（如果失败）
  session_id?: string          // 会话ID
  request_id?: string          // 请求ID
}

// ================================
// 工具和辅助类型
// ================================

// 图标信息接口
export interface IconInfo {
  name: string
  className: string
  unicode?: string
  category?: string
}

// 角色信息接口
export interface RoleInfo {
  id: string
  name: string
  description?: string
  permissions?: string[]
}

// 路径验证结果接口
export interface PathValidationResult {
  valid: boolean
  message?: string
  suggestions?: string[]
}

// 门户统计信息接口
export interface PortalStatistics {
  navigation: {
    total: number
    active: number
    inactive: number
    draft: number
  }
  entryPanel: {
    total: number
    totalItems: number
    activeItems: number
  }
  version: {
    total: number
    current: string
    lastBackup?: string
  }
  audit: {
    totalLogs: number
    todayLogs: number
    errorLogs: number
    activeUsers: number
  }
}

// ================================
// 查询和过滤类型
// ================================

// 分页参数接口
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 导航查询参数接口
export interface NavigationQueryParams extends PaginationParams {
  status?: NavigationStatus
  type?: NavigationType
  parentId?: number
  roles?: string[]
  keyword?: string
}

// 入口面板查询参数接口
export interface EntryPanelQueryParams extends PaginationParams {
  status?: 'active' | 'inactive'
  displayMode?: PanelDisplayMode
  roles?: string[]
  keyword?: string
}

// 审计日志查询参数接口
export interface AuditLogQueryParams extends PaginationParams {
  startTime?: string
  endTime?: string
  action?: AuditAction
  userId?: number
  resourceType?: ResourceType
  status?: AuditStatus
  keyword?: string
  ipAddress?: string
}

// ================================
// 响应数据类型
// ================================

// 分页响应接口
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// 统计响应接口
export interface StatisticsResponse {
  summary: PortalStatistics
  trends?: {
    navigationCreated: Array<{ date: string; count: number }>
    panelAccess: Array<{ date: string; count: number }>
    userActivity: Array<{ date: string; count: number }>
  }
}