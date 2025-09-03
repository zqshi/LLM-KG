import { http } from './request'
import type { ApiResponse, User } from '@/types'

// 仪表盘专用数据类型定义
export interface DashboardMetrics {
  todayActiveUsers: number
  todayNewContent: number 
  pendingAuditCount: number
  systemHealthStatus: 'good' | 'warning' | 'error'
  todayActiveUsersTrend: number
  todayNewContentTrend: number
  systemCpuUsage: number
  systemMemoryUsage: number
  systemDiskUsage: number
  lastUpdateTime: string
}

export interface PendingTask {
  id: number
  type: 'content_audit' | 'user_report' | 'banner_approval' | 'quotation_audit'
  title: string
  priority: 'high' | 'medium' | 'low'
  createdAt: string
  author?: User
  category?: string
  count: number
}

export interface QuickAction {
  id: string
  name: string
  path: string
  icon: string
  type: 'primary' | 'success' | 'info' | 'warning' | 'danger'
  permission: string
  visible: boolean
}

export interface ActivityData {
  date: string
  activeUsers: number
  newContent: number
  auditedContent: number
}

export interface ContentDistribution {
  type: string
  name: string
  count: number
  percentage: number
  color: string
}

export interface DepartmentContribution {
  departmentId: number
  departmentName: string
  contentCount: number
  userCount: number
  trend: number
}

export interface SystemResource {
  name: string
  type: 'cpu' | 'memory' | 'disk' | 'network'
  usage: number
  status: 'normal' | 'warning' | 'danger'
  unit: '%' | 'MB' | 'GB'
}

export interface SystemAnnouncement {
  id: number
  title: string
  content: string
  type: 'info' | 'warning' | 'maintenance' | 'urgent'
  publisher: string
  publishedAt: string
}

export interface DashboardData {
  metrics: DashboardMetrics
  pendingTasks: PendingTask[]
  quickActions: QuickAction[]
  activityTrend: ActivityData[]
  contentDistribution: ContentDistribution[]
  departmentContributions: DepartmentContribution[]
  systemResources: SystemResource[]
  systemAnnouncement: SystemAnnouncement | null
  recentFeedback: any[]
}

// Dashboard API服务
export const dashboardApi = {
  /**
   * 获取仪表盘概览数据
   * 根据用户角色返回个性化数据
   */
  async getOverview(): Promise<ApiResponse<DashboardData>> {
    return http.get('/dashboard/overview')
  },

  /**
   * 获取实时指标数据
   * 支持WebSocket实时更新
   */
  async getMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return http.get('/dashboard/metrics')
  },

  /**
   * 获取待办任务列表
   * 根据用户权限和部门筛选
   */
  async getPendingTasks(): Promise<ApiResponse<PendingTask[]>> {
    return http.get('/dashboard/pending-tasks')
  },

  /**
   * 获取快捷操作列表
   * 根据用户权限动态生成
   */
  async getQuickActions(): Promise<ApiResponse<QuickAction[]>> {
    return http.get('/dashboard/quick-actions')
  },

  /**
   * 获取用户活跃度趋势
   * @param timeRange - 时间范围: 7d, 30d, 90d
   * @param category - 板块筛选: all, knowledge, forum, news, marketplace
   */
  async getActivityTrend(timeRange: string = '30d', category: string = 'all'): Promise<ApiResponse<ActivityData[]>> {
    return http.get('/dashboard/activity-trend', { params: { range: timeRange, category } })
  },

  /**
   * 获取内容类型分布
   * @param timeRange - 时间范围
   */
  async getContentDistribution(timeRange: string = '30d'): Promise<ApiResponse<ContentDistribution[]>> {
    return http.get('/dashboard/content-distribution', { params: { range: timeRange } })
  },

  /**
   * 获取部门贡献度排行
   */
  async getDepartmentContributions(): Promise<ApiResponse<DepartmentContribution[]>> {
    return http.get('/dashboard/department-contributions')
  },

  /**
   * 获取系统资源使用情况
   */
  async getSystemResources(): Promise<ApiResponse<SystemResource[]>> {
    return http.get('/dashboard/system-resources')
  },

  /**
   * 获取最新用户反馈
   * @param limit - 数量限制
   */
  async getRecentFeedback(limit: number = 10): Promise<ApiResponse<any[]>> {
    return http.get('/dashboard/recent-feedback', { params: { limit } })
  },

  /**
   * 标记待办任务为已处理
   * @param taskId - 任务ID
   */
  async markTaskCompleted(taskId: number): Promise<ApiResponse<void>> {
    return http.post(`/dashboard/tasks/${taskId}/complete`)
  },

  /**
   * 获取系统健康状态详情
   */
  async getSystemHealth(): Promise<ApiResponse<{
    status: 'good' | 'warning' | 'error'
    services: Array<{
      name: string
      status: 'online' | 'offline' | 'degraded'
      responseTime: number
    }>
    alerts: Array<{
      level: 'info' | 'warning' | 'error'
      message: string
      timestamp: string
    }>
  }>> {
    return http.get('/dashboard/system-health')
  },

  /**
   * 获取最新系统公告
   */
  async getLatestAnnouncement(): Promise<ApiResponse<SystemAnnouncement | null>> {
    return http.get('/dashboard/latest-announcement')
  }
}

// Mock数据服务 - 开发阶段使用
export const mockDashboardApi = {
  async getOverview(): Promise<ApiResponse<DashboardData>> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
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
          },
          {
            id: 3,
            type: 'banner_approval',
            title: 'Banner审批',
            priority: 'low',
            count: 2,
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
          },
          {
            id: 'publish_content',
            name: '发布内容',
            path: '/content/create',
            icon: 'EditPen',
            type: 'info',
            permission: 'content:create',
            visible: true
          },
          {
            id: 'system_settings',
            name: '系统设置',
            path: '/system/settings',
            icon: 'Setting',
            type: 'warning',
            permission: 'system:config',
            visible: true
          }
        ],
        activityTrend: generateActivityTrendData('30d', 'all'),
        contentDistribution: [
          { type: 'article', name: '技术文章', count: 1286, percentage: 42.5, color: '#667eea' },
          { type: 'post', name: '论坛帖子', count: 932, percentage: 30.8, color: '#52c41a' },
          { type: 'product', name: '商品信息', count: 456, percentage: 15.0, color: '#faad14' },
          { type: 'quote', name: '知识问答', count: 268, percentage: 8.8, color: '#ff4d4f' },
          { type: 'news', name: '行业资讯', count: 87, percentage: 2.9, color: '#722ed1' }
        ],
        departmentContributions: [
          { departmentId: 1, departmentName: '技术部', contentCount: 320, userCount: 45, trend: 15.2 },
          { departmentId: 2, departmentName: '产品部', contentCount: 280, userCount: 38, trend: 8.5 },
          { departmentId: 3, departmentName: '运营部', contentCount: 256, userCount: 32, trend: -2.1 },
          { departmentId: 4, departmentName: '市场部', contentCount: 189, userCount: 28, trend: 12.3 },
          { departmentId: 5, departmentName: '人事部', contentCount: 156, userCount: 22, trend: 5.7 },
          { departmentId: 6, departmentName: '财务部', contentCount: 98, userCount: 15, trend: -1.2 }
        ],
        systemResources: [
          { name: 'CPU使用率', type: 'cpu', usage: 45, status: 'normal', unit: '%' },
          { name: '内存使用率', type: 'memory', usage: 62, status: 'warning', unit: '%' },
          { name: '磁盘使用率', type: 'disk', usage: 28, status: 'normal', unit: '%' },
          { name: '网络使用率', type: 'network', usage: 35, status: 'normal', unit: '%' }
        ],
        systemAnnouncement: {
          id: 1,
          title: '系统维护通知',
          content: '定于本周日凌晨2:00-4:00进行系统例行维护，期间可能会出现短暂的服务中断。维护内容包括数据库优化、缓存清理和安全补丁更新。',
          type: 'maintenance',
          publisher: '系统管理员',
          publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2小时前发布
        },
        recentFeedback: [
          {
            id: 1,
            user: { id: 4, nickname: '王五', username: 'wangwu' },
            content: '希望能增加移动端的支持',
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() // 20分钟前
          },
          {
            id: 2,
            user: { id: 5, nickname: '赵六', username: 'zhaoliu' },
            content: '系统运行很稳定，体验不错',
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // 45分钟前
          }
        ]
      }
    }
  },

  async getMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      code: 200,
      message: 'success',
      data: {
        todayActiveUsers: 1248 + Math.floor(Math.random() * 20 - 10), // 模拟实时变化
        todayNewContent: 36 + Math.floor(Math.random() * 5 - 2),
        pendingAuditCount: Math.max(0, 8 + Math.floor(Math.random() * 3 - 1)),
        systemHealthStatus: 'good',
        todayActiveUsersTrend: 12.5,
        todayNewContentTrend: 8.3,
        systemCpuUsage: 40 + Math.random() * 20,
        systemMemoryUsage: 55 + Math.random() * 20,
        systemDiskUsage: 25 + Math.random() * 10,
        lastUpdateTime: new Date().toISOString()
      }
    }
  },

  async getActivityTrend(timeRange: string = '30d', category: string = 'all'): Promise<ApiResponse<ActivityData[]>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      code: 200,
      message: 'success',
      data: generateActivityTrendData(timeRange, category)
    }
  },

  async getContentDistribution(timeRange: string = '30d'): Promise<ApiResponse<ContentDistribution[]>> {
    await new Promise(resolve => setTimeout(resolve, 150))
    return {
      code: 200,
      message: 'success',
      data: [
        { type: 'article', name: '技术文章', count: 1286, percentage: 42.5, color: '#667eea' },
        { type: 'post', name: '论坛帖子', count: 932, percentage: 30.8, color: '#52c41a' },
        { type: 'product', name: '商品信息', count: 456, percentage: 15.0, color: '#faad14' },
        { type: 'quote', name: '知识问答', count: 268, percentage: 8.8, color: '#ff4d4f' },
        { type: 'news', name: '行业资讯', count: 87, percentage: 2.9, color: '#722ed1' }
      ]
    }
  },

  async getDepartmentContributions(): Promise<ApiResponse<DepartmentContribution[]>> {
    await new Promise(resolve => setTimeout(resolve, 180))
    return {
      code: 200,
      message: 'success',
      data: [
        { departmentId: 1, departmentName: '技术部', contentCount: 320, userCount: 45, trend: 15.2 },
        { departmentId: 2, departmentName: '产品部', contentCount: 280, userCount: 38, trend: 8.5 },
        { departmentId: 3, departmentName: '运营部', contentCount: 256, userCount: 32, trend: -2.1 },
        { departmentId: 4, departmentName: '市场部', contentCount: 189, userCount: 28, trend: 12.3 },
        { departmentId: 5, departmentName: '人事部', contentCount: 156, userCount: 22, trend: 5.7 },
        { departmentId: 6, departmentName: '财务部', contentCount: 98, userCount: 15, trend: -1.2 }
      ]
    }
  },

  async getSystemResources(): Promise<ApiResponse<SystemResource[]>> {
    await new Promise(resolve => setTimeout(resolve, 120))
    return {
      code: 200,
      message: 'success',
      data: [
        { name: 'CPU使用率', type: 'cpu', usage: 45, status: 'normal', unit: '%' },
        { name: '内存使用率', type: 'memory', usage: 62, status: 'warning', unit: '%' },
        { name: '磁盘使用率', type: 'disk', usage: 28, status: 'normal', unit: '%' },
        { name: '网络使用率', type: 'network', usage: 35, status: 'normal', unit: '%' }
      ]
    }
  },

  async markTaskCompleted(taskId: number): Promise<ApiResponse<void>> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return {
      code: 200,
      message: 'success',
      data: undefined
    }
  }
}

// 生成模拟活跃度趋势数据
function generateActivityTrendData(range: string, category: string = 'all'): ActivityData[] {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const data: ActivityData[] = []
  const today = new Date()

  // 根据板块调整基础数据
  const categoryMultipliers = {
    all: { users: 1, content: 1 },
    knowledge: { users: 0.6, content: 0.8 },
    forum: { users: 0.7, content: 0.9 },
    news: { users: 0.3, content: 0.4 },
    marketplace: { users: 0.2, content: 0.3 }
  } as const

  const multiplier = categoryMultipliers[category as keyof typeof categoryMultipliers] || categoryMultipliers.all

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 模拟工作日和周末的差异
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const weekendFactor = isWeekend ? 0.7 : 1.2
    
    // 生成带有增长趋势的模拟数据
    const baseActiveUsers = 1200 * multiplier.users
    const baseNewContent = 45 * multiplier.content
    
    // 添加长期增长趋势
    const growthTrend = ((days - i) / days) * 300
    // 添加周期性波动
    const cycleTrend = Math.sin((i / days) * Math.PI * 2) * 150
    // 随机波动
    const randomFactor = (Math.random() * 0.4 - 0.2) * weekendFactor
    
    const activeUsers = Math.max(100, Math.round(
      (baseActiveUsers + growthTrend + cycleTrend) * weekendFactor * (1 + randomFactor)
    ))
    
    const newContent = Math.max(5, Math.round(
      (baseNewContent + growthTrend * 0.15 + cycleTrend * 0.1) * weekendFactor * (1 + randomFactor)
    ))
    
    data.push({
      date: date.toISOString().split('T')[0],
      activeUsers,
      newContent,
      auditedContent: Math.max(3, Math.round(newContent * (0.75 + Math.random() * 0.2)))
    })
  }

  return data
}

// 开发环境使用mock数据，生产环境使用真实API
export const dashboardService = process.env.NODE_ENV === 'development' ? mockDashboardApi : dashboardApi