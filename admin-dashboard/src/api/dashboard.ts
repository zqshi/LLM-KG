import { http } from './request'
import { apiAdapter } from './adapter'
import { 
  overviewStats, 
  trendData, 
  contentDistribution, 
  userActivity, 
  systemHealth, 
  pendingTasks, 
  recentActivities, 
  hotContent, 
  announcements 
} from '@/services/staticData'
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

// Dashboard API服务 - 使用适配器模式支持静态和API模式切换
export const dashboardApi = {
  /**
   * 获取仪表盘概览数据
   * 根据用户角色返回个性化数据
   */
  async getOverview(): Promise<ApiResponse<DashboardData>> {
    return apiAdapter.get(
      () => http.get('/dashboard/overview'),
      async () => ({
        metrics: await overviewStats(),
        pendingTasks: await pendingTasks(),
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
        activityTrend: await trendData(),
        contentDistribution: await contentDistribution(),
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
        systemAnnouncement: (await announcements())[0] || null,
        recentFeedback: await recentActivities()
      })
    )
  },

  /**
   * 获取实时指标数据
   * 支持WebSocket实时更新
   */
  async getMetrics(): Promise<ApiResponse<DashboardMetrics>> {
    return apiAdapter.get(
      () => http.get('/dashboard/metrics'),
      async () => {
        const stats = await overviewStats()
        return {
          todayActiveUsers: stats.todayActiveUsers + Math.floor(Math.random() * 20 - 10),
          todayNewContent: stats.todayNewContent + Math.floor(Math.random() * 5 - 2),
          pendingAuditCount: Math.max(0, stats.pendingAuditCount + Math.floor(Math.random() * 3 - 1)),
          systemHealthStatus: stats.systemHealthStatus,
          todayActiveUsersTrend: stats.todayActiveUsersTrend,
          todayNewContentTrend: stats.todayNewContentTrend,
          systemCpuUsage: stats.systemCpuUsage + Math.random() * 10 - 5,
          systemMemoryUsage: stats.systemMemoryUsage + Math.random() * 10 - 5,
          systemDiskUsage: stats.systemDiskUsage + Math.random() * 5 - 2,
          lastUpdateTime: new Date().toISOString()
        }
      }
    )
  },

  /**
   * 获取待办任务列表
   * 根据用户权限和部门筛选
   */
  async getPendingTasks(): Promise<ApiResponse<PendingTask[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/pending-tasks'),
      () => pendingTasks()
    )
  },

  /**
   * 获取快捷操作列表
   * 根据用户权限动态生成
   */
  async getQuickActions(): Promise<ApiResponse<QuickAction[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/quick-actions'),
      async () => [
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
      ]
    )
  },

  /**
   * 获取用户活跃度趋势
   * @param timeRange - 时间范围: 7d, 30d, 90d
   * @param category - 板块筛选: all, knowledge, forum, news, marketplace
   */
  async getActivityTrend(timeRange: string = '30d', category: string = 'all'): Promise<ApiResponse<ActivityData[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/activity-trend', { params: { range: timeRange, category } }),
      () => trendData()
    )
  },

  /**
   * 获取内容类型分布
   * @param timeRange - 时间范围
   */
  async getContentDistribution(timeRange: string = '30d'): Promise<ApiResponse<ContentDistribution[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/content-distribution', { params: { range: timeRange } }),
      () => contentDistribution()
    )
  },

  /**
   * 获取部门贡献度排行
   */
  async getDepartmentContributions(): Promise<ApiResponse<DepartmentContribution[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/department-contributions'),
      async () => [
        { departmentId: 1, departmentName: '技术部', contentCount: 320, userCount: 45, trend: 15.2 },
        { departmentId: 2, departmentName: '产品部', contentCount: 280, userCount: 38, trend: 8.5 },
        { departmentId: 3, departmentName: '运营部', contentCount: 256, userCount: 32, trend: -2.1 },
        { departmentId: 4, departmentName: '市场部', contentCount: 189, userCount: 28, trend: 12.3 },
        { departmentId: 5, departmentName: '人事部', contentCount: 156, userCount: 22, trend: 5.7 },
        { departmentId: 6, departmentName: '财务部', contentCount: 98, userCount: 15, trend: -1.2 }
      ]
    )
  },

  /**
   * 获取系统资源使用情况
   */
  async getSystemResources(): Promise<ApiResponse<SystemResource[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/system-resources'),
      () => systemHealth()
    )
  },

  /**
   * 获取最新用户反馈
   * @param limit - 数量限制
   */
  async getRecentFeedback(limit: number = 10): Promise<ApiResponse<any[]>> {
    return apiAdapter.get(
      () => http.get('/dashboard/recent-feedback', { params: { limit } }),
      () => recentActivities()
    )
  },

  /**
   * 标记待办任务为已处理
   * @param taskId - 任务ID
   */
  async markTaskCompleted(taskId: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/dashboard/tasks/${taskId}/complete`),
      async () => undefined
    )
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
    return apiAdapter.get(
      () => http.get('/dashboard/system-health'),
      async () => ({
        status: 'good' as const,
        services: [
          { name: '数据库服务', status: 'online' as const, responseTime: 45 },
          { name: '缓存服务', status: 'online' as const, responseTime: 23 },
          { name: '文件存储', status: 'online' as const, responseTime: 67 },
          { name: '搜索服务', status: 'online' as const, responseTime: 89 }
        ],
        alerts: []
      })
    )
  },

  /**
   * 获取最新系统公告
   */
  async getLatestAnnouncement(): Promise<ApiResponse<SystemAnnouncement | null>> {
    return apiAdapter.get(
      () => http.get('/dashboard/latest-announcement'),
      async () => {
        const allAnnouncements = await announcements()
        return allAnnouncements[0] || null
      }
    )
  }
}

export default dashboardApi