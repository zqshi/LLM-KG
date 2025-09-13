import { request } from '@/api/request'
import { apiAdapter } from './adapter'
import {
  categories,
  categoryStats,
  departmentTree,
  searchUsers,
  latestPosts
} from '@/services/staticData/categories'

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
    return apiAdapter.get(
      () => request.get<CategoryListResponse>('/content/categories', { params }),
      async () => {
        const allCategories = await categories()
        const stats = await categoryStats()
        return { categories: allCategories, stats }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取版块详情
  async getDetail(id: number): Promise<ApiResponse<Category>> {
    return apiAdapter.get(
      () => request.get<Category>(`/content/categories/${id}`),
      async () => {
        const allCategories = await categories()
        const category = allCategories.find(c => c.id === id)
        if (!category) {
          throw new Error('版块不存在')
        }
        return category
      }
    )
  },

  // 创建版块
  async create(data: CreateCategoryForm): Promise<ApiResponse<Category>> {
    return apiAdapter.post(
      () => request.post<Category>('/content/categories', data),
      async () => ({
        id: Date.now(),
        ...data,
        postCount: 0,
        todayPosts: 0,
        moderators: [],
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
    )
  },

  // 更新版块
  async update(data: UpdateCategoryForm): Promise<ApiResponse<Category>> {
    return apiAdapter.put(
      () => request.put<Category>(`/content/categories/${data.id}`, data),
      async () => {
        const allCategories = await categories()
        const category = allCategories.find(c => c.id === data.id)
        if (!category) {
          throw new Error('版块不存在')
        }
        return {
          ...category,
          ...data,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
    )
  },

  // 删除版块
  async delete(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete(`/content/categories/${id}`),
      async () => undefined
    )
  },

  // 批量删除版块
  async batchDelete(ids: number[]): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete('/content/categories/batch', { data: { ids } }),
      async () => undefined
    )
  },

  // 更新版块状态
  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<void>> {
    return apiAdapter.patch(
      () => request.patch(`/content/categories/${id}/status`, { isActive }),
      async () => undefined
    )
  },

  // 批量更新状态
  async batchUpdateStatus(ids: number[], isActive: boolean): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post('/content/categories/batch-status', { ids, isActive }),
      async () => undefined
    )
  },

  // 获取版块统计
  async getStats(): Promise<ApiResponse<CategoryStats>> {
    return apiAdapter.get(
      () => request.get<CategoryStats>('/content/categories/stats'),
      async () => await categoryStats()
    )
  },

  // 检查版块代码是否可用
  async checkCodeAvailable(code: string, excludeId?: number): Promise<ApiResponse<boolean>> {
    return apiAdapter.get(
      () => request.get<boolean>('/content/categories/check-code', {
        params: { code, excludeId }
      }),
      async () => {
        const allCategories = await categories()
        return !allCategories.some(c => c.code === code && c.id !== excludeId)
      }
    )
  },

  // 重新排序版块
  async reorderCategories(orders: { id: number; sortOrder: number }[]): Promise<ApiResponse<void>> {
    return apiAdapter.patch(
      () => request.patch('/content/categories/reorder', { orders }),
      async () => undefined
    )
  },

  // 获取版块最新帖子
  async getLatestPosts(categoryId: number, limit = 5): Promise<ApiResponse<any[]>> {
    return apiAdapter.get(
      () => request.get<any[]>(`/content/categories/${categoryId}/latest-posts`, {
        params: { limit }
      }),
      async () => {
        const posts = await latestPosts(categoryId)
        return posts.slice(0, limit)
      }
    )
  },

  // 获取版主列表
  async getModerators(categoryId: number): Promise<ApiResponse<any[]>> {
    return apiAdapter.get(
      () => request.get<any[]>(`/content/categories/${categoryId}/moderators`),
      async () => {
        const allCategories = await categories()
        const category = allCategories.find(c => c.id === categoryId)
        return category?.moderators || []
      }
    )
  },

  // 设置版主
  async setModerators(categoryId: number, userIds: number[]): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/content/categories/${categoryId}/moderators`, { userIds }),
      async () => undefined
    )
  },

  // 移除版主
  async removeModerator(categoryId: number, userId: number): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete(`/content/categories/${categoryId}/moderators/${userId}`),
      async () => undefined
    )
  },

  // 获取组织架构树（用于部门选择）
  async getDepartmentTree(): Promise<ApiResponse<any[]>> {
    return apiAdapter.get(
      () => request.get<any[]>('/departments/tree'),
      async () => await departmentTree()
    )
  },

  // 搜索用户（用于添加版主）
  async searchUsers(params: { keyword: string; excludeIds?: number[] }): Promise<ApiResponse<any[]>> {
    return apiAdapter.get(
      () => request.get<any[]>('/users/search', { params }),
      async () => {
        let users = await searchUsers(params.keyword)
        if (params.excludeIds?.length) {
          users = users.filter(user => !params.excludeIds!.includes(user.id))
        }
        return users
      }
    )
  },

  // 添加版主
  async addModerator(categoryId: number, userId: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/content/categories/${categoryId}/moderators/${userId}`),
      async () => undefined
    )
  }
}

export default categoriesApi