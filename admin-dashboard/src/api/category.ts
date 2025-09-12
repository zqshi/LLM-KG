import { http } from './request'
import type { 
  ApiResponse,
  ForumCategory,
  ForumCategoryTree,
  ForumCategoryForm,
  CategoryStats,
  PaginationParams,
  User
} from '@/types'

export const categoryApi = {
  // 获取分类树（支持三级分类）
  getCategoryTree(): Promise<ApiResponse<ForumCategoryTree>> {
    return http.get('/forum/categories/tree')
  },

  // 获取分类列表（扁平化，支持分页）
  getCategoryList(params?: PaginationParams & { 
    keyword?: string
    level?: 1 | 2 | 3
    parentId?: number
    isActive?: boolean
  }): Promise<ApiResponse<{ list: ForumCategory[], total: number }>> {
    return http.get('/forum/categories', { params })
  },

  // 获取指定父级的子分类
  getSubCategories(parentId: number): Promise<ApiResponse<ForumCategory[]>> {
    return http.get(`/forum/categories/${parentId}/children`)
  },

  // 获取分类详情
  getCategoryDetail(id: number): Promise<ApiResponse<ForumCategory>> {
    return http.get(`/forum/categories/${id}`)
  },

  // 创建分类
  createCategory(data: ForumCategoryForm): Promise<ApiResponse<ForumCategory>> {
    return http.post('/forum/categories', data)
  },

  // 更新分类
  updateCategory(id: number, data: Partial<ForumCategoryForm>): Promise<ApiResponse<ForumCategory>> {
    return http.put(`/forum/categories/${id}`, data)
  },

  // 删除分类（会检查是否有子分类或帖子）
  deleteCategory(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/forum/categories/${id}`)
  },

  // 检查分类是否可删除
  checkDeletable(id: number): Promise<ApiResponse<{ 
    deletable: boolean
    reason?: string
    postCount?: number
    childCount?: number
  }>> {
    return http.get(`/forum/categories/${id}/check-deletable`)
  },

  // 批量排序分类
  sortCategories(data: { 
    categoryIds: number[]
    sortOrders: number[]
  }): Promise<ApiResponse<void>> {
    return http.post('/forum/categories/sort', data)
  },

  // 移动分类到新的父级
  moveCategory(id: number, newParentId: number): Promise<ApiResponse<void>> {
    return http.post(`/forum/categories/${id}/move`, { parentId: newParentId })
  },

  // 批量操作分类
  batchOperation(data: {
    categoryIds: number[]
    operation: 'activate' | 'deactivate' | 'delete'
  }): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/forum/categories/batch', data)
  },

  // 获取分类统计数据
  getCategoryStats(): Promise<ApiResponse<CategoryStats>> {
    return http.get('/forum/categories/stats')
  },

  // 获取可选择的父级分类（创建分类时使用）
  getParentOptions(level: 1 | 2 | 3): Promise<ApiResponse<{
    label: string
    value: number
    children?: Array<{ label: string; value: number }>
  }[]>> {
    return http.get('/forum/categories/parent-options', { params: { level } })
  },

  // 验证分类代码是否唯一
  validateCategoryCode(code: string, excludeId?: number): Promise<ApiResponse<{ 
    available: boolean
    suggestion?: string
  }>> {
    return http.get('/forum/categories/validate-code', { 
      params: { code, excludeId } 
    })
  },

  // 获取分类的版主列表
  getCategoryModerators(id: number): Promise<ApiResponse<User[]>> {
    return http.get(`/forum/categories/${id}/moderators`)
  },

  // 设置分类版主
  setCategoryModerators(id: number, moderatorIds: number[]): Promise<ApiResponse<void>> {
    return http.post(`/forum/categories/${id}/moderators`, { moderatorIds })
  },

  // 获取分类下的最新帖子
  getCategoryLatestPosts(
    id: number, 
    limit: number = 5
  ): Promise<ApiResponse<Array<{
    id: number
    title: string
    author: string
    createdAt: string
    viewCount: number
    commentCount: number
  }>>> {
    return http.get(`/forum/categories/${id}/latest-posts`, { params: { limit } })
  },

  // 导出分类数据
  exportCategories(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return http.post('/forum/categories/export')
  },

  // 导入分类数据
  importCategories(file: File): Promise<ApiResponse<{ 
    successCount: number
    failCount: number
    errors: string[]
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/forum/categories/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export default categoryApi