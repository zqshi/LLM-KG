import { request } from '@/api/request'
import type { 
  PostTag, 
  CreateTagForm, 
  UpdateTagForm, 
  TagQueryParams, 
  TagListResponse, 
  TagStats,
  BatchOperationParams,
  ApiResponse 
} from '@/types/postTags'

/**
 * 帖子标签管理 API
 */
export const postTagsApi = {
  // 获取标签列表
  async getList(params: TagQueryParams = {}): Promise<ApiResponse<TagListResponse>> {
    return request.get('/api/post-tags', { params })
  },

  // 获取标签详情
  async getDetail(id: number): Promise<ApiResponse<PostTag>> {
    return request.get(`/api/post-tags/${id}`)
  },

  // 创建标签
  async create(data: CreateTagForm): Promise<ApiResponse<PostTag>> {
    return request.post('/api/post-tags', data)
  },

  // 更新标签
  async update(data: UpdateTagForm): Promise<ApiResponse<PostTag>> {
    return request.put(`/api/post-tags/${data.id}`, data)
  },

  // 删除标签
  async delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/api/post-tags/${id}`)
  },

  // 批量删除标签
  async batchDelete(ids: number[]): Promise<ApiResponse<void>> {
    return request.delete('/api/post-tags/batch', { data: { ids } })
  },

  // 更新标签状态
  async updateStatus(id: number, isActive: boolean): Promise<ApiResponse<void>> {
    return request.patch(`/api/post-tags/${id}/status`, { isActive })
  },

  // 批量更新状态
  async batchUpdateStatus(ids: number[], isActive: boolean): Promise<ApiResponse<void>> {
    return request.patch('/api/post-tags/batch/status', { ids, isActive })
  },

  // 获取标签统计
  async getStats(): Promise<ApiResponse<TagStats>> {
    return request.get('/api/post-tags/stats')
  },

  // 检查标签代码是否可用
  async checkCodeAvailable(code: string, excludeId?: number): Promise<ApiResponse<boolean>> {
    return request.get('/api/post-tags/check-code', { 
      params: { code, excludeId } 
    })
  },

  // 获取热门标签
  async getPopularTags(limit: number = 10): Promise<ApiResponse<PostTag[]>> {
    return request.get('/api/post-tags/popular', { params: { limit } })
  },

  // 搜索标签（用于下拉选择等）
  async searchTags(keyword: string, limit: number = 20): Promise<ApiResponse<PostTag[]>> {
    return request.get('/api/post-tags/search', { 
      params: { keyword, limit } 
    })
  },

  // 批量操作
  async batchOperation(params: BatchOperationParams): Promise<ApiResponse<void>> {
    return request.post('/api/post-tags/batch-operation', params)
  },

  // 导出标签数据
  async exportTags(params: TagQueryParams = {}): Promise<Blob> {
    const response = await request.get('/api/post-tags/export', { 
      params,
      responseType: 'blob'
    })
    return response.data
  },

  // 导入标签数据
  async importTags(file: File): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/api/post-tags/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 重新排序标签
  async reorderTags(orders: { id: number; sortOrder: number }[]): Promise<ApiResponse<void>> {
    return request.patch('/api/post-tags/reorder', { orders })
  },

  // 合并标签
  async mergeTags(sourceIds: number[], targetId: number): Promise<ApiResponse<void>> {
    return request.post('/api/post-tags/merge', { sourceIds, targetId })
  },

  // 获取标签使用情况
  async getTagUsage(id: number): Promise<ApiResponse<{
    postCount: number
    recentPosts: Array<{ id: number; title: string; createdAt: string }>
    categories: Array<{ id: number; name: string; count: number }>
  }>> {
    return request.get(`/api/post-tags/${id}/usage`)
  }
}

export default postTagsApi