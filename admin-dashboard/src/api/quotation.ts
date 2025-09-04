import { http } from './request'
import type {
  ApiResponse,
  Quotation,
  QuotationForm,
  QuotationQueryParams,
  QuotationBatchOperation,
  QuotationReviewLog,
  QuotationRevisionHistory,
  RevisionRequestForm,
  DisplayConfig,
  QuotationPlaylist,
  QuotationStatistics,
  DailyQuoteConfig,
  ReviewOperation,
  PaginationParams
} from '@/types'

export const quotationApi = {
  // ======================== 基础CRUD操作 ========================
  
  // 获取名言列表
  getList(params: QuotationQueryParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return http.get('/quotation', params)
  },

  // 获取名言详情
  getDetail(id: number): Promise<ApiResponse<Quotation>> {
    return http.get(`/quotation/${id}`)
  },

  // 创建名言
  create(data: QuotationForm): Promise<ApiResponse<Quotation>> {
    return http.post('/quotation', data)
  },

  // 更新名言
  update(id: number, data: Partial<QuotationForm>): Promise<ApiResponse<Quotation>> {
    return http.put(`/quotation/${id}`, data)
  },

  // 删除名言
  delete(id: number, reason?: string): Promise<ApiResponse<void>> {
    return http.delete(`/quotation/${id}`, { reason })
  },

  // 批量操作
  batchOperation(data: QuotationBatchOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/quotation/batch', data)
  },

  // ======================== 审核相关接口 ========================
  
  // 获取待审核名言列表
  getPendingList(params: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return http.get('/quotation/pending', params)
  },

  // 审核操作（通过/驳回）
  review(id: number, operation: ReviewOperation, comment?: string): Promise<ApiResponse<void>> {
    return http.post(`/quotation/${id}/review`, { operation, comment })
  },

  // 申请修正
  requestRevision(data: RevisionRequestForm): Promise<ApiResponse<void>> {
    return http.post('/quotation/revision/request', data)
  },

  // 获取审核记录
  getReviewLogs(quotationId: number, params?: PaginationParams): Promise<ApiResponse<{ list: QuotationReviewLog[], total: number }>> {
    return http.get(`/quotation/${quotationId}/reviews`, params)
  },

  // 获取修正历史
  getRevisionHistory(quotationId: number): Promise<ApiResponse<QuotationRevisionHistory[]>> {
    return http.get(`/quotation/${quotationId}/revisions`)
  },

  // ======================== 展示配置相关 ========================
  
  // 获取展示配置列表
  getDisplayConfigs(): Promise<ApiResponse<DisplayConfig[]>> {
    return http.get('/quotation/display/configs')
  },

  // 创建展示配置
  createDisplayConfig(data: Omit<DisplayConfig, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<DisplayConfig>> {
    return http.post('/quotation/display/configs', data)
  },

  // 更新展示配置
  updateDisplayConfig(id: number, data: Partial<DisplayConfig>): Promise<ApiResponse<DisplayConfig>> {
    return http.put(`/quotation/display/configs/${id}`, data)
  },

  // 删除展示配置
  deleteDisplayConfig(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/quotation/display/configs/${id}`)
  },

  // 获取精选集列表
  getPlaylists(params?: PaginationParams): Promise<ApiResponse<{ list: QuotationPlaylist[], total: number }>> {
    return http.get('/quotation/playlists', params)
  },

  // 创建精选集
  createPlaylist(data: Omit<QuotationPlaylist, 'id' | 'quotations' | 'createTime' | 'updateTime'>): Promise<ApiResponse<QuotationPlaylist>> {
    return http.post('/quotation/playlists', data)
  },

  // 更新精选集
  updatePlaylist(id: number, data: Partial<QuotationPlaylist>): Promise<ApiResponse<QuotationPlaylist>> {
    return http.put(`/quotation/playlists/${id}`, data)
  },

  // 删除精选集
  deletePlaylist(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/quotation/playlists/${id}`)
  },

  // 获取每日一语配置
  getDailyQuoteConfig(): Promise<ApiResponse<DailyQuoteConfig>> {
    return http.get('/quotation/daily-quote/config')
  },

  // 更新每日一语配置
  updateDailyQuoteConfig(data: Partial<DailyQuoteConfig>): Promise<ApiResponse<DailyQuoteConfig>> {
    return http.put('/quotation/daily-quote/config', data)
  },

  // ======================== 统计数据相关 ========================
  
  // 获取统计数据
  getStatistics(): Promise<ApiResponse<QuotationStatistics>> {
    return http.get('/quotation/statistics')
  },

  // 获取热门名言TOP10
  getPopularQuotations(limit: number = 10): Promise<ApiResponse<Quotation[]>> {
    return http.get('/quotation/popular', { limit })
  },

  // 增加展示次数
  incrementShowCount(id: number): Promise<ApiResponse<void>> {
    return http.post(`/quotation/${id}/show`)
  },

  // 点赞操作
  likeQuotation(id: number): Promise<ApiResponse<{ likeCount: number }>> {
    return http.post(`/quotation/${id}/like`)
  },

  // 取消点赞
  unlikeQuotation(id: number): Promise<ApiResponse<{ likeCount: number }>> {
    return http.delete(`/quotation/${id}/like`)
  },

  // ======================== 搜索和筛选相关 ========================
  
  // 获取所有标签
  getTags(): Promise<ApiResponse<{ tag: string, count: number }[]>> {
    return http.get('/quotation/tags')
  },

  // 按标签搜索名言
  searchByTag(tag: string, params?: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return http.get('/quotation/search/tag', { tag, ...params })
  },

  // 按领导搜索名言
  searchByLeader(leaderId: number, params?: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return http.get('/quotation/search/leader', { leaderId, ...params })
  },

  // 全文搜索
  fullTextSearch(keyword: string, params?: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return http.get('/quotation/search', { keyword, ...params })
  },

  // ======================== 导入导出相关 ========================
  
  // 批量导入名言
  importQuotations(file: File): Promise<ApiResponse<{ successCount: number, failCount: number, errors: string[] }>> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/quotation/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 导出名言
  exportQuotations(params: QuotationQueryParams): Promise<Blob> {
    return http.get('/quotation/export', params, {
      responseType: 'blob'
    }).then(response => response.data)
  },

  // ======================== 前台展示相关 ========================
  
  // 获取首页展示的名言
  getHomepageQuotation(): Promise<ApiResponse<Quotation>> {
    return http.get('/quotation/homepage')
  },

  // 获取随机名言
  getRandomQuotation(): Promise<ApiResponse<Quotation>> {
    return http.get('/quotation/random')
  },

  // 获取今日一语
  getTodayQuote(): Promise<ApiResponse<Quotation>> {
    return http.get('/quotation/today')
  }
}

export default quotationApi