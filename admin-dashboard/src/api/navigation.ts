import type {
  NavigationItem,
  NavigationForm,
  EntryPanel,
  EntryPanelForm,
  EntryItem,
  EntryItemForm,
  ConfigVersion,
  AuditLog,
  ApiResponse
} from '@/types/navigation'

// 基础API配置
const API_BASE_URL = '/api'

// 通用API请求封装
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
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
    return apiRequest('/portal/navigations')
  },

  // 根据ID获取导航
  async getNavigationById(id: number): Promise<ApiResponse<NavigationItem>> {
    return apiRequest(`/portal/navigations/${id}`)
  },

  // 创建导航
  async createNavigation(data: NavigationForm): Promise<ApiResponse<NavigationItem>> {
    return apiRequest('/portal/navigations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新导航
  async updateNavigation(id: number, data: NavigationForm): Promise<ApiResponse<NavigationItem>> {
    return apiRequest(`/portal/navigations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除导航
  async deleteNavigation(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/portal/navigations/${id}`, {
      method: 'DELETE',
    })
  },

  // 批量更新导航排序
  async updateNavigationsOrder(navigations: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
    return apiRequest('/portal/navigations/reorder', {
      method: 'PUT',
      body: JSON.stringify({ navigations }),
    })
  },

  // 设置导航角色权限
  async setNavigationRoles(id: number, roles: string[]): Promise<ApiResponse<void>> {
    return apiRequest(`/portal/navigations/${id}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ roles }),
    })
  }
}

// ================================
// 入口面板管理 API
// ================================
export const entryPanelApi = {
  // 获取所有入口面板
  async getPanels(): Promise<ApiResponse<EntryPanel[]>> {
    return apiRequest('/portal/entry-panels')
  },

  // 根据ID获取入口面板
  async getPanelById(id: number): Promise<ApiResponse<EntryPanel>> {
    return apiRequest(`/portal/entry-panels/${id}`)
  },

  // 创建入口面板
  async createPanel(data: EntryPanelForm): Promise<ApiResponse<EntryPanel>> {
    return apiRequest('/portal/entry-panels', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新入口面板
  async updatePanel(id: number, data: EntryPanelForm): Promise<ApiResponse<EntryPanel>> {
    return apiRequest(`/portal/entry-panels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除入口面板
  async deletePanel(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/portal/entry-panels/${id}`, {
      method: 'DELETE',
    })
  },

  // 批量更新面板排序
  async updatePanelsOrder(panels: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
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
    return apiRequest(`/portal/entry-panels/${panelId}/items`)
  },

  // 根据ID获取入口项目
  async getItemById(id: number): Promise<ApiResponse<EntryItem>> {
    return apiRequest(`/portal/entry-items/${id}`)
  },

  // 创建入口项目
  async createItem(data: EntryItemForm): Promise<ApiResponse<EntryItem>> {
    return apiRequest('/portal/entry-items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 更新入口项目
  async updateItem(id: number, data: EntryItemForm): Promise<ApiResponse<EntryItem>> {
    return apiRequest(`/portal/entry-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 删除入口项目
  async deleteItem(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/portal/entry-items/${id}`, {
      method: 'DELETE',
    })
  },

  // 批量更新项目排序
  async updateItemsOrder(items: { id: number; sort_order: number }[]): Promise<ApiResponse<void>> {
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
    return apiRequest(`/portal/config-versions?page=${page}&limit=${limit}`)
  },

  // 根据ID获取配置版本
  async getVersionById(id: number): Promise<ApiResponse<ConfigVersion>> {
    return apiRequest(`/portal/config-versions/${id}`)
  },

  // 创建配置快照
  async createSnapshot(data: {
    name: string
    description: string
    type?: string
  }): Promise<ApiResponse<ConfigVersion>> {
    return apiRequest('/portal/config-versions/snapshot', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 回滚到指定版本
  async rollbackToVersion(id: number): Promise<ApiResponse<void>> {
    return apiRequest(`/portal/config-versions/${id}/rollback`, {
      method: 'POST',
    })
  },

  // 删除配置版本
  async deleteVersion(id: number): Promise<ApiResponse<void>> {
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
    return apiRequest(`/portal/audit-logs/${id}`)
  },

  // 导出审计日志
  async exportLogs(params: {
    startTime?: string
    endTime?: string
    format?: 'excel' | 'csv'
  } = {}): Promise<Blob> {
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
    return apiRequest('/portal/utils/icons')
  },

  // 获取可用角色列表
  async getAvailableRoles(): Promise<ApiResponse<Array<{
    id: string
    name: string
    description?: string
  }>>> {
    return apiRequest('/portal/utils/roles')
  },

  // 验证导航路径
  async validateNavigationPath(path: string, type: string): Promise<ApiResponse<{
    valid: boolean
    message?: string
    suggestions?: string[]
  }>> {
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