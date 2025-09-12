import { http } from './request'
import type { 
  ApiResponse,
  NewsSource,
  NewsArticle,
  NewsStats,
  NewsSourceStats,
  NewsTask,
  NewsTaskStats,
  NewsLogEntry,
  NewsSourceForm,
  NewsArticleForm,
  NewsQueryParams,
  NewsSourceQueryParams,
  NewsTaskQueryParams,
  BatchNewsOperation,
  NewsLogFilter,
  OrganizationNode
} from '@/types'

export const newsApi = {
  // ================== 资讯源管理 ==================
  
  // 获取资讯源统计数据
  getSourceStats(): Promise<ApiResponse<NewsSourceStats>> {
    return http.get('/news/sources/stats')
  },

  // 获取资讯源列表
  getSourceList(params: NewsSourceQueryParams): Promise<ApiResponse<{ list: NewsSource[], total: number }>> {
    return http.get('/news/sources', { params })
  },

  // 获取资讯源详情
  getSourceDetail(id: number): Promise<ApiResponse<NewsSource>> {
    return http.get(`/news/sources/${id}`)
  },

  // 创建资讯源
  createSource(data: NewsSourceForm): Promise<ApiResponse<NewsSource>> {
    return http.post('/news/sources', data)
  },

  // 更新资讯源
  updateSource(id: number, data: Partial<NewsSourceForm>): Promise<ApiResponse<NewsSource>> {
    return http.put(`/news/sources/${id}`, data)
  },

  // 删除资讯源
  deleteSource(id: number): Promise<ApiResponse<void>> {
    return http.delete(`/news/sources/${id}`)
  },

  // 测试资讯源连接
  testSource(id: number): Promise<ApiResponse<{ status: 'success' | 'failed', message: string, testData?: any }>> {
    return http.post(`/news/sources/${id}/test`)
  },

  // 测试资讯源配置（创建时）
  testSourceConfig(data: NewsSourceForm): Promise<ApiResponse<{ status: 'success' | 'failed', message: string, testData?: any }>> {
    return http.post('/news/sources/test-config', data)
  },

  // 启用/禁用资讯源
  toggleSourceStatus(id: number, status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    return http.post(`/news/sources/${id}/toggle`, { status })
  },

  // 立即抓取资讯源
  fetchSourceNow(id: number): Promise<ApiResponse<{ taskId: number }>> {
    return http.post(`/news/sources/${id}/fetch`)
  },

  // 批量操作资讯源
  batchSourceOperation(data: BatchNewsOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/news/sources/batch', data)
  },

  // 复制资讯源
  duplicateSource(id: number): Promise<ApiResponse<NewsSource>> {
    return http.post(`/news/sources/${id}/duplicate`)
  },

  // 导出资讯源配置
  exportSources(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return http.post('/news/sources/export')
  },

  // 导入资讯源配置
  importSources(file: File): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/news/sources/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // ================== 资讯内容管理 ==================

  // 获取资讯统计数据
  getNewsStats(): Promise<ApiResponse<NewsStats>> {
    return http.get('/news/articles/stats')
  },

  // 获取资讯列表
  getNewsList(params: NewsQueryParams): Promise<ApiResponse<{ list: NewsArticle[], total: number }>> {
    return http.get('/news/articles', { params })
  },

  // 获取资讯详情
  getNewsDetail(id: number): Promise<ApiResponse<NewsArticle>> {
    return http.get(`/news/articles/${id}`)
  },

  // 手动创建资讯
  createNews(data: NewsArticleForm): Promise<ApiResponse<NewsArticle>> {
    return http.post('/news/articles', data)
  },

  // 更新资讯
  updateNews(id: number, data: Partial<NewsArticleForm>): Promise<ApiResponse<NewsArticle>> {
    return http.put(`/news/articles/${id}`, data)
  },

  // 删除资讯
  deleteNews(id: number, reason?: string): Promise<ApiResponse<void>> {
    return http.delete(`/news/articles/${id}`, { data: { reason } })
  },

  // 批量删除资讯
  batchDeleteNews(ids: number[], reason?: string): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/news/articles/batch-delete', { ids, reason })
  },

  // 审核资讯
  auditNews(id: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>> {
    return http.post(`/news/articles/${id}/audit`, { action, reason })
  },

  // 批量审核资讯
  batchAuditNews(ids: number[], action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/news/articles/batch-audit', { ids, action, reason })
  },

  // 发布资讯
  publishNews(id: number): Promise<ApiResponse<void>> {
    return http.post(`/news/articles/${id}/publish`)
  },

  // 批量发布资讯
  batchPublishNews(ids: number[]): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/news/articles/batch-publish', { ids })
  },

  // 更新资讯分类
  updateNewsCategory(id: number, category: string): Promise<ApiResponse<void>> {
    return http.post(`/news/articles/${id}/category`, { category })
  },

  // 更新资讯质量评分
  updateNewsQualityScore(id: number, score: number): Promise<ApiResponse<void>> {
    return http.post(`/news/articles/${id}/quality-score`, { score })
  },

  // 获取重复资讯
  getDuplicateNews(id: number): Promise<ApiResponse<NewsArticle[]>> {
    return http.get(`/news/articles/${id}/duplicates`)
  },

  // 合并重复资讯
  mergeDuplicateNews(originalId: number, duplicateIds: number[]): Promise<ApiResponse<void>> {
    return http.post('/news/articles/merge-duplicates', { originalId, duplicateIds })
  },

  // ================== 任务监控 ==================

  // 获取任务统计数据
  getTaskStats(): Promise<ApiResponse<NewsTaskStats>> {
    return http.get('/news/tasks/stats')
  },

  // 获取任务列表
  getTaskList(params: NewsTaskQueryParams): Promise<ApiResponse<{ list: NewsTask[], total: number }>> {
    return http.get('/news/tasks', { params })
  },

  // 获取任务详情
  getTaskDetail(id: number): Promise<ApiResponse<NewsTask>> {
    return http.get(`/news/tasks/${id}`)
  },

  // 启动任务
  startTask(sourceId: number): Promise<ApiResponse<{ taskId: number }>> {
    return http.post(`/news/tasks/start`, { sourceId })
  },

  // 停止任务
  stopTask(taskId: number): Promise<ApiResponse<void>> {
    return http.post(`/news/tasks/${taskId}/stop`)
  },

  // 重试任务
  retryTask(taskId: number): Promise<ApiResponse<{ taskId: number }>> {
    return http.post(`/news/tasks/${taskId}/retry`)
  },

  // 批量启动任务
  batchStartTasks(sourceIds: number[]): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return http.post('/news/tasks/batch-start', { sourceIds })
  },

  // 获取任务执行趋势数据（图表用）
  getTaskTrend(days: number = 7): Promise<ApiResponse<{ date: string, success: number, failed: number }[]>> {
    return http.get('/news/tasks/trend', { params: { days } })
  },

  // 获取任务状态分布数据（图表用）
  getTaskStatusDistribution(): Promise<ApiResponse<{ name: string, value: number }[]>> {
    return http.get('/news/tasks/status-distribution')
  },

  // ================== 日志管理 ==================

  // 获取资讯源日志
  getSourceLogs(sourceId: number, filter?: NewsLogFilter): Promise<ApiResponse<NewsLogEntry[]>> {
    return http.get(`/news/sources/${sourceId}/logs`, { params: filter })
  },

  // 获取所有日志
  getAllLogs(filter?: NewsLogFilter & { page?: number, size?: number }): Promise<ApiResponse<{ list: NewsLogEntry[], total: number }>> {
    return http.get('/news/logs', { params: filter })
  },

  // 清理日志
  clearLogs(beforeDate: string): Promise<ApiResponse<{ deletedCount: number }>> {
    return http.post('/news/logs/clear', { beforeDate })
  },

  // ================== 通用功能 ==================

  // 获取组织架构（用于可见范围选择）
  getOrganizations(): Promise<ApiResponse<OrganizationNode[]>> {
    return http.get('/news/organizations')
  },

  // 获取资讯分类列表
  getNewsCategories(): Promise<ApiResponse<{ code: string, name: string, color?: string }[]>> {
    return http.get('/news/categories')
  },

  // 获取资讯标签列表
  getNewsTags(keyword?: string): Promise<ApiResponse<string[]>> {
    return http.get('/news/tags', { params: { keyword } })
  },

  // 搜索资讯
  searchNews(keyword: string, filters?: Partial<NewsQueryParams>): Promise<ApiResponse<NewsArticle[]>> {
    return http.get('/news/search', { params: { keyword, ...filters } })
  },

  // 获取资讯预览
  previewNews(id: number): Promise<ApiResponse<{ title: string, content: string, metadata: any }>> {
    return http.get(`/news/articles/${id}/preview`)
  },

  // 导出资讯数据
  exportNews(params: NewsQueryParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    return http.post('/news/articles/export', params)
  },

  // 获取系统配置
  getSystemConfig(): Promise<ApiResponse<{ 
    maxDailyFetch: number,
    duplicateThreshold: number,
    autoPublishDelay: number,
    [key: string]: any 
  }>> {
    return http.get('/news/config')
  },

  // 更新系统配置
  updateSystemConfig(config: Record<string, any>): Promise<ApiResponse<void>> {
    return http.post('/news/config', config)
  }
}

export default newsApi