import { request } from '@/api/request'

/**
 * 版块管理相关接口
 */

// 版块基础信息
export interface Category {
  id: number
  name: string
  code: string
  description: string
  icon: string
  sortOrder: number
  isPublic: boolean
  isActive: boolean
  auditMode: 'none' | 'pre' | 'post' | 'sample'
  postPermissions: string[]
  postCount: number
  todayPosts: number
  moderators: any[]
  createdAt: string
  updatedAt: string
  visibleDepartments: string[] // 私有版块可见部门
  sampleRate: number // 抽样审核比例（1-100）
}

// 创建版块表单
export interface CreateCategoryForm {
  name: string
  code: string
  description?: string
  icon: string
  sortOrder: number
  isPublic: boolean
  isActive: boolean
  auditMode: 'none' | 'pre' | 'post' | 'sample'
  postPermissions: string[]
  visibleDepartments: string[] // 私有版块可见部门
  sampleRate: number // 抽样审核比例（1-100）
}

// 更新版块表单
export interface UpdateCategoryForm extends Partial<CreateCategoryForm> {
  id: number
}

// 版块查询参数
export interface CategoryQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
  sortBy?: 'name' | 'sortOrder' | 'postCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// 版块列表响应
export interface CategoryListResponse {
  categories: Category[]
  stats: CategoryStats
}

// 版块统计信息
export interface CategoryStats {
  total: number
  active: number
  inactive: number
  totalPosts: number
  todayPosts: number
  moderators: number
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export const categoriesApi = {
  // 获取版块列表
  async getList(params: CategoryQueryParams = {}): Promise<ApiResponse<CategoryListResponse>> {
    return request.get('/content/categories', { params })
  },

  // 获取版块详情
  async getDetail(id: number): Promise<ApiResponse<Category>> {
    return request.get(`/content/categories/${id}`)
  },

  // 创建版块
  async create(data: CreateCategoryForm): Promise<ApiResponse<Category>> {
    return request.post('/content/categories', data)
  },

  // 更新版块
  async update(data: UpdateCategoryForm): Promise<ApiResponse<Category>> {
    return request.put(`/content/categories/${data.id}`, data)
  },

  // 删除版块
  async delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/content/categories/${id}`)
  },

  // 批量删除版块
  async batchDelete(ids: number[]): Promise<ApiResponse<void>> {
    return request.delete('/content/categories/batch', { data: { ids } })
  },

  // 更新版块状态
  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<void>> {
    return request.patch(`/content/categories/${id}/status`, { isActive })
  },

  // 批量更新状态
  async batchUpdateStatus(ids: number[], isActive: boolean): Promise<ApiResponse<void>> {
    return request.post('/content/categories/batch-status', { ids, isActive })
  },

  // 获取版块统计
  async getStats(): Promise<ApiResponse<CategoryStats>> {
    return request.get('/content/categories/stats')
  },

  // 检查版块代码是否可用
  async checkCodeAvailable(code: string, excludeId?: number): Promise<ApiResponse<boolean>> {
    return request.get('/content/categories/check-code', {
      params: { code, excludeId }
    })
  },

  // 重新排序版块
  async reorderCategories(orders: { id: number; sortOrder: number }[]): Promise<ApiResponse<void>> {
    return request.patch('/content/categories/reorder', { orders })
  },

  // 获取版块最新帖子
  async getLatestPosts(categoryId: number, limit = 5): Promise<ApiResponse<any[]>> {
    return request.get(`/content/categories/${categoryId}/latest-posts`, {
      params: { limit }
    })
  },

  // 获取版主列表
  async getModerators(categoryId: number): Promise<ApiResponse<any[]>> {
    return request.get(`/content/categories/${categoryId}/moderators`)
  },

  // 设置版主
  async setModerators(categoryId: number, userIds: number[]): Promise<ApiResponse<void>> {
    return request.post(`/content/categories/${categoryId}/moderators`, { userIds })
  },

  // 移除版主
  async removeModerator(categoryId: number, userId: number): Promise<ApiResponse<void>> {
    return request.delete(`/content/categories/${categoryId}/moderators/${userId}`)
  },

  // 获取组织架构树（用于部门选择）
  async getDepartmentTree(): Promise<ApiResponse<any[]>> {
    return request.get('/departments/tree')
  },

  // 搜索用户（用于添加版主）
  async searchUsers(params: { keyword: string; excludeIds?: number[] }): Promise<ApiResponse<any[]>> {
    return request.get('/users/search', { params })
  },

  // 添加版主
  async addModerator(categoryId: number, userId: number): Promise<ApiResponse<void>> {
    return request.post(`/content/categories/${categoryId}/moderators/${userId}`)
  }
}

export default categoriesApi