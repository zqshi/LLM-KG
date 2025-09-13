import type {
  NavigationItem,
  NavigationForm,
  EntryPanel,
  EntryPanelForm,
  EntryItem,
  EntryItemForm,
  ConfigVersion,
  PortalAuditLog as AuditLog,
  ApiResponse
} from '@/types/navigation'
import { NavigationStatus, NavigationType } from '@/types/navigation'

// 检查是否为静态模式
const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
  import.meta.env.VITE_API_BASE_URL === '' || 
  !import.meta.env.VITE_API_BASE_URL

// 静态导航数据
const staticNavigationData: NavigationItem[] = [
  {
    id: 1,
    title: '首页',
    path: '/home',
    type: NavigationType.INTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 1,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    roles: []
  },
  {
    id: 2,
    title: 'AI工具箱',
    path: '/ai-tools',
    type: NavigationType.INTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 2,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    roles: []
  },
  {
    id: 3,
    title: '内容管理',
    path: '/content',
    type: NavigationType.INTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 3,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    roles: [],
    children: [
      {
        id: 31,
        title: '新闻资讯',
        path: '/content/news',
        type: NavigationType.INTERNAL,
        status: NavigationStatus.ACTIVE,
        sort_order: 1,
        parent_id: 3,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        roles: []
      },
      {
        id: 32,
        title: '跳蚤市场',
        path: '/content/flea-market',
        type: NavigationType.INTERNAL,
        status: NavigationStatus.ACTIVE,
        sort_order: 2,
        parent_id: 3,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        roles: []
      }
    ]
  },
  {
    id: 4,
    title: '领导名言',
    path: '/quotation',
    type: NavigationType.INTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 4,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    roles: []
  },
  {
    id: 5,
    title: '外部链接',
    path: 'https://example.com',
    type: NavigationType.EXTERNAL,
    status: NavigationStatus.ACTIVE,
    sort_order: 5,
    target: '_blank',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    roles: []
  }
]

// 基础API配置
const API_BASE_URL = '/api'

// 通用API请求封装
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // 如果是静态模式，直接返回成功响应
  if (isStaticMode) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 根据endpoint返回相应的静态数据
    if (endpoint.includes('/portal/navigations')) {
      return {
        success: true,
        data: staticNavigationData as unknown as T,
        message: 'success',
        code: 200
      }
    }
    
    // 默认返回空数据
    return {
      success: true,
      data: {} as T,
      message: 'success',
      code: 200
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.statusText}`)
  }

  return response.json()
}

// ================================
// 导航管理 API
// ================================
export const navigationApi = {
  // 获取所有导航
  async getNavigations(): Promise<ApiResponse<NavigationItem[]>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: staticNavigationData,
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/navigations')
  },

  // 根据ID获取导航
  async getNavigationById(id: number): Promise<ApiResponse<NavigationItem>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      const item = staticNavigationData.find(item => item.id === id)
      if (item) {
        return {
          success: true,
          data: item,
          message: 'success',
          code: 200
        }
      } else {
        throw new Error('导航项未找到')
      }
    }
    return apiRequest(`/portal/navigations/${id}`)
  },

  // 创建导航
  async createNavigation(data: NavigationForm): Promise<ApiResponse<NavigationItem>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      const newItem = {
        ...data,
        id: staticNavigationData.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as NavigationItem
      staticNavigationData.push(newItem)
      return {
        success: true,
        data: newItem,
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/navigations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新导航
  async updateNavigation(id: number, data: NavigationForm): Promise<ApiResponse<NavigationItem>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      const index = staticNavigationData.findIndex(item => item.id === id)
      if (index !== -1) {
        staticNavigationData[index] = {
          ...staticNavigationData[index],
          ...data,
          updated_at: new Date().toISOString()
        } as NavigationItem
        return {
          success: true,
          data: staticNavigationData[index],
          message: 'success',
          code: 200
        }
      } else {
        throw new Error('导航项未找到')
      }
    }
    return apiRequest(`/portal/navigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除导航
  async deleteNavigation(id: number): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      const index = staticNavigationData.findIndex(item => item.id === id)
      if (index !== -1) {
        staticNavigationData.splice(index, 1)
        return {
          success: true,
          data: undefined,
          message: 'success',
          code: 200
        }
      } else {
        throw new Error('导航项未找到')
      }
    }
    return apiRequest(`/portal/navigations/${id}`, {
      method: 'DELETE',
    })
  },

  // 批量更新导航排序
  async updateNavigationsOrder(navigations: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      navigations.forEach(nav => {
        const item = staticNavigationData.find(item => item.id === nav.id)
        if (item) {
          item.sort_order = nav.sort_order
        }
      })
      return {
        success: true,
        data: undefined,
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/navigations/reorder', {
      method: 'PUT',
      body: JSON.stringify({ navigations }),
    })
  },

  // 设置导航角色权限
  async setNavigationRoles(id: number, roles: string[]): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      const item = staticNavigationData.find(item => item.id === id)
      if (item) {
        item.roles = roles
        return {
          success: true,
          data: undefined,
          message: 'success',
          code: 200
        }
      } else {
        throw new Error('导航项未找到')
      }
    }
    return apiRequest(`/portal/navigations/${id}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roles }),
    })
  },

  // 获取导航树结构（兼容原有代码）
  async getNavigationTree(): Promise<ApiResponse<NavigationItem[]>> {
    return this.getNavigations()
  }
}

// ================================
// 入口面板管理 API
// ================================
export const entryPanelApi = {
  // 获取所有入口面板
  async getPanels(): Promise<ApiResponse<EntryPanel[]>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: [],
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/entry-panels')
  },

  // 根据ID获取入口面板
  async getPanelById(id: number): Promise<ApiResponse<EntryPanel>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('入口面板未找到')
    }
    return apiRequest(`/portal/entry-panels/${id}`)
  },

  // 创建入口面板
  async createPanel(data: EntryPanelForm): Promise<ApiResponse<EntryPanel>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持创建入口面板')
    }
    return apiRequest('/portal/entry-panels', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新入口面板
  async updatePanel(id: number, data: EntryPanelForm): Promise<ApiResponse<EntryPanel>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持更新入口面板')
    }
    return apiRequest(`/portal/entry-panels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除入口面板
  async deletePanel(id: number): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持删除入口面板')
    }
    return apiRequest(`/portal/entry-panels/${id}`, {
      method: 'DELETE',
    })
  },

  // 批量更新面板排序
  async updatePanelsOrder(panels: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持更新面板排序')
    }
    return apiRequest('/portal/entry-panels/reorder', {
      method: 'PUT',
      body: JSON.stringify({ panels }),
    })
  }
}

// ================================
// 入口项目管理 API
// ================================
export const entryItemApi = {
  // 获取指定面板的所有入口项目
  async getItemsByPanelId(panelId: number): Promise<ApiResponse<EntryItem[]>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: [],
        message: 'success',
        code: 200
      }
    }
    return apiRequest(`/portal/entry-panels/${panelId}/items`)
  },

  // 根据ID获取入口项目
  async getItemById(id: number): Promise<ApiResponse<EntryItem>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('入口项目未找到')
    }
    return apiRequest(`/portal/entry-items/${id}`)
  },

  // 创建入口项目
  async createItem(data: EntryItemForm): Promise<ApiResponse<EntryItem>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持创建入口项目')
    }
    return apiRequest('/portal/entry-items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新入口项目
  async updateItem(id: number, data: EntryItemForm): Promise<ApiResponse<EntryItem>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持更新入口项目')
    }
    return apiRequest(`/portal/entry-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除入口项目
  async deleteItem(id: number): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持删除入口项目')
    }
    return apiRequest(`/portal/entry-items/${id}`, {
      method: 'DELETE',
    })
  },

  // 批量更新项目排序
  async updateItemsOrder(items: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持更新项目排序')
    }
    return apiRequest('/portal/entry-items/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    })
  }
}

// ================================
// 配置版本管理 API
// ================================
export const configVersionApi = {
  // 获取所有配置版本
  async getVersions(page = 1, limit = 20): Promise<ApiResponse<{
    versions: ConfigVersion[]
    total: number
    hasMore: boolean
  }>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: {
          versions: [],
          total: 0,
          hasMore: false
        },
        message: 'success',
        code: 200
      }
    }
    return apiRequest(`/portal/config-versions?page=${page}&limit=${limit}`)
  },

  // 根据ID获取配置版本
  async getVersionById(id: number): Promise<ApiResponse<ConfigVersion>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('配置版本未找到')
    }
    return apiRequest(`/portal/config-versions/${id}`)
  },

  // 创建配置快照
  async createSnapshot(data: {
    name: string
    description: string
    type?: string
  }): Promise<ApiResponse<ConfigVersion>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持创建配置快照')
    }
    return apiRequest('/portal/config-versions/snapshot', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 回滚到指定版本
  async rollbackToVersion(id: number): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持回滚配置版本')
    }
    return apiRequest(`/portal/config-versions/${id}/rollback`, {
      method: 'POST',
    })
  },

  // 删除配置版本
  async deleteVersion(id: number): Promise<ApiResponse<void>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持删除配置版本')
    }
    return apiRequest(`/portal/config-versions/${id}`, {
      method: 'DELETE',
    })
  },

  // 获取版本对比数据
  async compareVersions(sourceId: number, targetId: number): Promise<ApiResponse<{
    source: ConfigVersion
    target: ConfigVersion
    diff: any
  }>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持版本对比')
    }
    return apiRequest(`/portal/config-versions/compare?source=${sourceId}&target=${targetId}`)
  }
}

// ================================
// 配置审计日志 API
// ================================
export const configAuditApi = {
  // 获取审计日志列表
  async getLogs(params: {
    page?: number
    limit?: number
    startTime?: string
    endTime?: string
    action?: string
    userId?: number
    resourceType?: string
    status?: string
    keyword?: string
  } = {}): Promise<ApiResponse<{
    logs: AuditLog[]
    total: number
    statistics: {
      totalLogs: number
      todayLogs: number
      activeUsers: number
      errorLogs: number
    }
  }>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: {
          logs: [],
          total: 0,
          statistics: {
            totalLogs: 0,
            todayLogs: 0,
            activeUsers: 0,
            errorLogs: 0
          }
        },
        message: 'success',
        code: 200
      }
    }
    
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value))
      }
    })
    
    return apiRequest(`/portal/audit-logs?${queryParams.toString()}`)
  },

  // 根据ID获取审计日志详情
  async getLogById(id: number): Promise<ApiResponse<AuditLog>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('审计日志未找到')
    }
    return apiRequest(`/portal/audit-logs/${id}`)
  },

  // 导出审计日志
  async exportLogs(params: {
    startTime?: string
    endTime?: string
    format?: 'excel' | 'csv'
  } = {}): Promise<Blob> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      throw new Error('静态模式下不支持导出审计日志')
    }

    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value))
      }
    })

    const response = await fetch(`${API_BASE_URL}/portal/audit-logs/export?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`导出失败: ${response.statusText}`)
    }

    return response.blob()
  }
}

// ================================
// 门户配置工具 API
// ================================
export const portalUtilApi = {
  // 获取可用图标列表
  async getAvailableIcons(): Promise<ApiResponse<{
    categories: Array<{
      name: string
      icons: Array<{
        name: string
        className: string
        unicode?: string
      }>
    }>
  }>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: {
          categories: []
        },
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/utils/icons')
  },

  // 获取可用角色列表
  async getAvailableRoles(): Promise<ApiResponse<Array<{
    id: string
    name: string
    description?: string
  }>>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: [],
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/utils/roles')
  },

  // 验证导航路径
  async validateNavigationPath(path: string, type: string): Promise<ApiResponse<{
    valid: boolean
    message?: string
    suggestions?: string[]
  }>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: {
          valid: true
        },
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/utils/validate-path', {
      method: 'POST',
      body: JSON.stringify({ path, type }),
    })
  },

  // 获取门户配置统计信息
  async getPortalStatistics(): Promise<ApiResponse<{
    navigation: {
      total: number
      active: number
      inactive: number
    }
    entryPanel: {
      total: number
      totalItems: number
    }
    version: {
      total: number
      current: string
    }
    audit: {
      totalLogs: number
      todayLogs: number
    }
  }>> {
    if (isStaticMode) {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 100))
      return {
        success: true,
        data: {
          navigation: {
            total: staticNavigationData.length,
            active: staticNavigationData.filter(item => item.status === NavigationStatus.ACTIVE).length,
            inactive: staticNavigationData.filter(item => item.status === NavigationStatus.INACTIVE).length
          },
          entryPanel: {
            total: 0,
            totalItems: 0
          },
          version: {
            total: 0,
            current: 'v1.0.0'
          },
          audit: {
            totalLogs: 0,
            todayLogs: 0
          }
        },
        message: 'success',
        code: 200
      }
    }
    return apiRequest('/portal/utils/statistics')
  }
}

// 导出主要API对象
export const portalConfigApi = {
  navigation: navigationApi,
  entryPanel: entryPanelApi,
  entryItem: entryItemApi,
  version: configVersionApi,
  audit: configAuditApi,
  util: portalUtilApi
}

// 默认导出
export default portalConfigApi