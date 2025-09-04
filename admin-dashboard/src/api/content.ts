import { http } from './request'
import type { 
  ApiResponse, 
  Content, 
  ContentStats, 
  ContentQueryParams, 
  ContentForm,
  BatchContentOperation,
  ContentCategory,
  HotContent,
  ContentPreview,
  PaginationParams
} from '@/types'

export const contentApi = {
  // 获取内容统计数据
  getStats(): Promise<ApiResponse<ContentStats>> {
    return http.get('/content/stats')
  },

  // 获取内容列表
  getList(params: ContentQueryParams): Promise<ApiResponse<{ list: Content[], total: number }>> {
    return http.get('/content/list', { params })
  },

  // 获取内容详情
  getDetail(id: number): Promise<ApiResponse<Content>> {
    return http.get(`/content/${id}`)
  },

  // 创建内容
  create(data: ContentForm): Promise<ApiResponse<Content>> {
    return http.post('/content', data)
  },

  // 更新内容
  update(id: number, data: Partial<ContentForm>): Promise<ApiResponse<Content>> {
    return http.put(`/content/${id}`, data)
  },

  // 删除内容
  delete(id: number, reason?: string): Promise<ApiResponse<void>> {
    return http.delete(`/content/${id}`, { data: { reason } })
  },

  // 批量操作
  batchOperation(data: BatchContentOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/content/batch', data)
  },

  // 审核内容
  audit(id: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/audit`, { action, reason })
  },

  // 置顶内容
  setTop(id: number, isTop: boolean, expiry?: string): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/top`, { isTop, expiry })
  },

  // 设置精华
  setElite(id: number, isElite: boolean): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/elite`, { isElite })
  },

  // 锁定/解锁内容
  setLock(id: number, isLocked: boolean): Promise<ApiResponse<void>> {
    return http.post(`/content/${id}/lock`, { isLocked })
  },

  // 移动版块
  moveCategory(contentIds: number[], categoryId: string): Promise<ApiResponse<void>> {
    return http.post('/content/move-category', { contentIds, categoryId })
  },

  // 获取内容预览
  getPreview(id: number): Promise<ApiResponse<ContentPreview>> {
    return http.get(`/content/${id}/preview`)
  },


  // 获取热门内容
  getHotContents(days: number = 7, limit: number = 10): Promise<ApiResponse<HotContent[]>> {
    return http.get('/content/hot', { params: { days, limit } })
  },

  // 获取版块列表
  getCategories(module?: string): Promise<ApiResponse<ContentCategory[]>> {
    return http.get('/content/categories', { params: { module } })
  },

  // 导出内容数据
  exportData(params: ContentQueryParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    return http.post('/content/export', params)
  },

  // 获取内容类型映射
  getTypeMapping(): Promise<ApiResponse<{ [key: string]: { name: string, color: string } }>> {
    return http.get('/content/type-mapping')
  },

  // 获取模块映射
  getModuleMapping(): Promise<ApiResponse<{ [key: string]: { name: string, icon: string } }>> {
    return http.get('/content/module-mapping')
  },

  // 获取状态映射
  getStatusMapping(): Promise<ApiResponse<{ [key: number]: { name: string, color: string } }>> {
    return http.get('/content/status-mapping')
  }
}

export default contentApi