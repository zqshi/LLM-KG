import { request } from '@/api/request'

/**
 * 帖子标签管理相关接口
 */

// 标签基础信息
export interface Tag {
  id: number
  name: string
  code: string
  description?: string
  color: string
  isActive: boolean
  sortOrder: number
  postCount: number
  createdAt: string
  updatedAt: string
}

// 创建标签表单
export interface CreateTagForm {
  name: string
  code: string
  description?: string
  color: string
  isActive: boolean
  sortOrder: number
}

// 更新标签表单
export interface UpdateTagForm extends Partial<CreateTagForm> {
  id: number
}

// 标签查询参数
export interface TagQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  isActive?: boolean
  sortBy?: 'name' | 'sortOrder' | 'postCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// 标签列表响应
export interface TagListResponse {
  list: Tag[]
  total: number
  page: number
  pageSize: number
}

// 标签统计信息
export interface TagStats {
  total: number
  active: number
  inactive: number
  totalPosts: number
}

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export const tagsApi = {
  // 获取标签列表
  async getList(params: TagQueryParams = {}): Promise<ApiResponse<TagListResponse>> {
    return request.get('/api/tags', { params })
  },

  // 获取标签详情
  async getDetail(id: number): Promise<ApiResponse<Tag>> {
    return request.get(`/api/tags/${id}`)
  },

  // 创建标签
  async create(data: CreateTagForm): Promise<ApiResponse<Tag>> {
    return request.post('/api/tags', data)
  },

  // 更新标签
  async update(data: UpdateTagForm): Promise<ApiResponse<Tag>> {
    return request.put(`/api/tags/${data.id}`, data)
  },

  // 删除标签
  async delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/api/tags/${id}`)
  },

  // 批量删除标签
  async batchDelete(ids: number[]): Promise<ApiResponse<void>> {
    return request.delete('/api/tags/batch', { data: { ids } })
  },

  // 更新标签状态
  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<void>> {
    return request.patch(`/api/tags/${id}/status`, { isActive })
  },

  // 批量更新状态
  async batchUpdateStatus(ids: number[], isActive: boolean): Promise<ApiResponse<void>> {
    return request.post('/api/tags/batch-status', { ids, isActive })
  },

  // 获取标签统计
  async getStats(): Promise<ApiResponse<TagStats>> {
    return request.get('/api/tags/stats')
  },

  // 检查标签代码是否可用
  async checkCodeAvailable(code: string, excludeId?: number): Promise<ApiResponse<boolean>> {
    return request.get('/api/tags/check-code', {
      params: { code, excludeId }
    })
  },

  // 获取标签使用情况
  async getTagUsage(id: number): Promise<ApiResponse<{
    postCount: number
    recentPosts: Array<{ id: number; title: string; createdAt: string }>
  }>> {
    return request.get(`/api/tags/${id}/usage`)
  }
}

export default tagsApi