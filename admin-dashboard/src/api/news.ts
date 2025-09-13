import { request } from './request'
import { apiAdapter } from './adapter'
import {
  newsSources,
  newsArticles,
  newsTasks,
  newsLogs,
  newsSourceStats,
  newsStats,
  newsTaskStats,
  organizations,
  newsCategories,
  newsTags,
  systemConfig
} from '@/services/staticData/news'
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
    return apiAdapter.get(
      () => request.get<NewsSourceStats>('/news/sources/stats'),
      async () => await newsSourceStats()
    )
  },

  // 获取资讯源列表
  getSourceList(params: NewsSourceQueryParams): Promise<ApiResponse<{ list: NewsSource[], total: number }>> {
    return apiAdapter.get(
      () => request.get<{ list: NewsSource[], total: number }>('/news/sources', { params }),
      async () => {
        const allSources = await newsSources()
        return { list: allSources, total: allSources.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取资讯源详情
  getSourceDetail(id: number): Promise<ApiResponse<NewsSource>> {
    return apiAdapter.get(
      () => request.get<NewsSource>(`/news/sources/${id}`),
      async () => {
        const allSources = await newsSources()
        const source = allSources.find(s => s.id === id)
        if (!source) {
          throw new Error('资讯源不存在')
        }
        return source
      }
    )
  },

  // 创建资讯源
  createSource(data: NewsSourceForm): Promise<ApiResponse<NewsSource>> {
    return apiAdapter.post(
      () => request.post<NewsSource>('/news/sources', data),
      async () => ({
        id: Date.now(),
        ...data,
        status: 'inactive',
        totalFetched: 0,
        todayFetched: 0,
        successRate: 0,
        creator: '系统管理员',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lastFetch: null,
        nextFetch: null
      })
    )
  },

  // 更新资讯源
  updateSource(id: number, data: Partial<NewsSourceForm>): Promise<ApiResponse<NewsSource>> {
    return apiAdapter.put(
      () => request.put<NewsSource>(`/news/sources/${id}`, data),
      async () => {
        const allSources = await newsSources()
        const source = allSources.find(s => s.id === id)
        if (!source) {
          throw new Error('资讯源不存在')
        }
        return {
          ...source,
          ...data,
          updateTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
    )
  },

  // 删除资讯源
  deleteSource(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete(`/news/sources/${id}`),
      async () => undefined
    )
  },

  // 测试资讯源连接
  testSource(id: number): Promise<ApiResponse<{ status: 'success' | 'failed', message: string, testData?: any }>> {
    return apiAdapter.post(
      () => request.post<{ status: 'success' | 'failed', message: string, testData?: any }>(`/news/sources/${id}/test`),
      async () => ({
        status: 'success' as const,
        message: '连接测试成功，可以正常获取数据',
        testData: { fetchedCount: 5, responseTime: 1200 }
      })
    )
  },

  // 测试资讯源配置（创建时）
  testSourceConfig(data: NewsSourceForm): Promise<ApiResponse<{ status: 'success' | 'failed', message: string, testData?: any }>> {
    return apiAdapter.post(
      () => request.post<{ status: 'success' | 'failed', message: string, testData?: any }>('/news/sources/test-config', data),
      async () => ({
        status: 'success' as const,
        message: '配置测试成功，可以创建资讯源',
        testData: { isValid: true, estimatedFetchCount: 10 }
      })
    )
  },

  // 启用/禁用资讯源
  toggleSourceStatus(id: number, status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/news/sources/${id}/toggle`, { status }),
      async () => undefined
    )
  },

  // 立即抓取资讯源
  fetchSourceNow(id: number): Promise<ApiResponse<{ taskId: number }>> {
    return apiAdapter.post(
      () => request.post<{ taskId: number }>(`/news/sources/${id}/fetch`),
      async () => ({ taskId: Date.now() })
    )
  },

  // 批量操作资讯源
  batchSourceOperation(data: BatchNewsOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => request.post<{ successCount: number, failCount: number }>('/news/sources/batch', data),
      async () => ({
        successCount: data.ids.length,
        failCount: 0
      })
    )
  },

  // 复制资讯源
  duplicateSource(id: number): Promise<ApiResponse<NewsSource>> {
    return apiAdapter.post(
      () => request.post<NewsSource>(`/news/sources/${id}/duplicate`),
      async () => {
        const allSources = await newsSources()
        const source = allSources.find(s => s.id === id)
        if (!source) {
          throw new Error('资讯源不存在')
        }
        return {
          ...source,
          id: Date.now(),
          name: source.name + ' (复制)',
          status: 'inactive',
          createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
        }
      }
    )
  },

  // 导出资讯源配置
  exportSources(): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiAdapter.post(
      () => request.post<{ downloadUrl: string }>('/news/sources/export'),
      async () => ({ downloadUrl: '/mock/news-sources-export.json' })
    )
  },

  // 导入资讯源配置
  importSources(file: File): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => {
        const formData = new FormData()
        formData.append('file', file)
        return request.post<{ successCount: number, failCount: number }>('/news/sources/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      },
      async () => ({ successCount: 5, failCount: 0 })
    )
  },

  // ================== 资讯内容管理 ==================

  // 获取资讯统计数据
  getNewsStats(): Promise<ApiResponse<NewsStats>> {
    return apiAdapter.get(
      () => request.get<NewsStats>('/news/articles/stats'),
      async () => await newsStats()
    )
  },

  // 获取资讯列表
  getNewsList(params: NewsQueryParams): Promise<ApiResponse<{ list: NewsArticle[], total: number }>> {
    return apiAdapter.get(
      () => request.get<{ list: NewsArticle[], total: number }>('/news/articles', { params }),
      async () => {
        const allArticles = await newsArticles()
        return { list: allArticles, total: allArticles.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取资讯详情
  getNewsDetail(id: number): Promise<ApiResponse<NewsArticle>> {
    return apiAdapter.get(
      () => request.get<NewsArticle>(`/news/articles/${id}`),
      async () => {
        const allArticles = await newsArticles()
        const article = allArticles.find(a => a.id === id)
        if (!article) {
          throw new Error('资讯不存在')
        }
        return article
      }
    )
  },

  // 手动创建资讯
  createNews(data: NewsArticleForm): Promise<ApiResponse<NewsArticle>> {
    return apiAdapter.post(
      () => request.post<NewsArticle>('/news/articles', data),
      async () => ({
        id: Date.now(),
        ...data,
        status: 'pending',
        qualityScore: 70,
        viewCount: 0,
        shareCount: 0,
        auditStatus: 'pending',
        auditor: null,
        auditTime: null,
        duplicateCount: 0,
        isTop: false,
        isRecommend: false,
        fetchTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
    )
  },

  // 更新资讯
  updateNews(id: number, data: Partial<NewsArticleForm>): Promise<ApiResponse<NewsArticle>> {
    return apiAdapter.put(
      () => request.put<NewsArticle>(`/news/articles/${id}`, data),
      async () => {
        const allArticles = await newsArticles()
        const article = allArticles.find(a => a.id === id)
        if (!article) {
          throw new Error('资讯不存在')
        }
        return { ...article, ...data }
      }
    )
  },

  // 删除资讯
  deleteNews(id: number, reason?: string): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete(`/news/articles/${id}`, { data: { reason } }),
      async () => undefined
    )
  },

  // 批量删除资讯
  batchDeleteNews(ids: number[], reason?: string): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => request.post<{ successCount: number, failCount: number }>('/news/articles/batch-delete', { ids, reason }),
      async () => ({ successCount: ids.length, failCount: 0 })
    )
  },

  // 审核资讯
  auditNews(id: number, action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/news/articles/${id}/audit`, { action, reason }),
      async () => undefined
    )
  },

  // 批量审核资讯
  batchAuditNews(ids: number[], action: 'approve' | 'reject', reason?: string): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => request.post<{ successCount: number, failCount: number }>('/news/articles/batch-audit', { ids, action, reason }),
      async () => ({ successCount: ids.length, failCount: 0 })
    )
  },

  // 发布资讯
  publishNews(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/news/articles/${id}/publish`),
      async () => undefined
    )
  },

  // 批量发布资讯
  batchPublishNews(ids: number[]): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => request.post<{ successCount: number, failCount: number }>('/news/articles/batch-publish', { ids }),
      async () => ({ successCount: ids.length, failCount: 0 })
    )
  },

  // 更新资讯分类
  updateNewsCategory(id: number, category: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/news/articles/${id}/category`, { category }),
      async () => undefined
    )
  },

  // 更新资讯质量评分
  updateNewsQualityScore(id: number, score: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/news/articles/${id}/quality-score`, { score }),
      async () => undefined
    )
  },

  // 获取重复资讯
  getDuplicateNews(id: number): Promise<ApiResponse<NewsArticle[]>> {
    return apiAdapter.get(
      () => request.get<NewsArticle[]>(`/news/articles/${id}/duplicates`),
      async () => {
        const allArticles = await newsArticles()
        return allArticles.filter(a => a.id !== id && a.duplicateCount > 0).slice(0, 3)
      }
    )
  },

  // 合并重复资讯
  mergeDuplicateNews(originalId: number, duplicateIds: number[]): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post('/news/articles/merge-duplicates', { originalId, duplicateIds }),
      async () => undefined
    )
  },

  // ================== 任务监控 ==================

  // 获取任务统计数据
  getTaskStats(): Promise<ApiResponse<NewsTaskStats>> {
    return apiAdapter.get(
      () => request.get<NewsTaskStats>('/news/tasks/stats'),
      async () => await newsTaskStats()
    )
  },

  // 获取任务列表
  getTaskList(params: NewsTaskQueryParams): Promise<ApiResponse<{ list: NewsTask[], total: number }>> {
    return apiAdapter.get(
      () => request.get<{ list: NewsTask[], total: number }>('/news/tasks', { params }),
      async () => {
        const allTasks = await newsTasks()
        return { list: allTasks, total: allTasks.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取任务详情
  getTaskDetail(id: number): Promise<ApiResponse<NewsTask>> {
    return apiAdapter.get(
      () => request.get<NewsTask>(`/news/tasks/${id}`),
      async () => {
        const allTasks = await newsTasks()
        const task = allTasks.find(t => t.id === id)
        if (!task) {
          throw new Error('任务不存在')
        }
        return task
      }
    )
  },

  // 启动任务
  startTask(sourceId: number): Promise<ApiResponse<{ taskId: number }>> {
    return apiAdapter.post(
      () => request.post<{ taskId: number }>(`/news/tasks/start`, { sourceId }),
      async () => ({ taskId: Date.now() })
    )
  },

  // 停止任务
  stopTask(taskId: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/news/tasks/${taskId}/stop`),
      async () => undefined
    )
  },

  // 重试任务
  retryTask(taskId: number): Promise<ApiResponse<{ taskId: number }>> {
    return apiAdapter.post(
      () => request.post<{ taskId: number }>(`/news/tasks/${taskId}/retry`),
      async () => ({ taskId: Date.now() })
    )
  },

  // 批量启动任务
  batchStartTasks(sourceIds: number[]): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => request.post<{ successCount: number, failCount: number }>('/news/tasks/batch-start', { sourceIds }),
      async () => ({ successCount: sourceIds.length, failCount: 0 })
    )
  },

  // 获取任务执行趋势数据（图表用）
  getTaskTrend(days: number = 7): Promise<ApiResponse<{ date: string, success: number, failed: number }[]>> {
    return apiAdapter.get(
      () => request.get<{ date: string, success: number, failed: number }[]>('/news/tasks/trend', { params: { days } }),
      async () => Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        success: Math.floor(Math.random() * 50) + 20,
        failed: Math.floor(Math.random() * 10) + 2
      })).reverse()
    )
  },

  // 获取任务状态分布数据（图表用）
  getTaskStatusDistribution(): Promise<ApiResponse<{ name: string, value: number }[]>> {
    return apiAdapter.get(
      () => request.get<{ name: string, value: number }[]>('/news/tasks/status-distribution'),
      async () => [
        { name: '已完成', value: 398 },
        { name: '运行中', value: 3 },
        { name: '失败', value: 55 }
      ]
    )
  },

  // ================== 日志管理 ==================

  // 获取资讯源日志
  getSourceLogs(sourceId: number, filter?: NewsLogFilter): Promise<ApiResponse<NewsLogEntry[]>> {
    return apiAdapter.get(
      () => request.get<NewsLogEntry[]>(`/news/sources/${sourceId}/logs`, { params: filter }),
      async () => {
        const allLogs = await newsLogs()
        return allLogs.filter(log => log.sourceId === sourceId)
      }
    )
  },

  // 获取所有日志
  getAllLogs(filter?: NewsLogFilter & { page?: number, size?: number }): Promise<ApiResponse<{ list: NewsLogEntry[], total: number }>> {
    return apiAdapter.get(
      () => request.get<{ list: NewsLogEntry[], total: number }>('/news/logs', { params: filter }),
      async () => {
        const allLogs = await newsLogs()
        return { list: allLogs, total: allLogs.length }
      },
      { mockPagination: true, paginationParams: filter }
    )
  },

  // 清理日志
  clearLogs(beforeDate: string): Promise<ApiResponse<{ deletedCount: number }>> {
    return apiAdapter.post(
      () => request.post<{ deletedCount: number }>('/news/logs/clear', { beforeDate }),
      async () => ({ deletedCount: Math.floor(Math.random() * 100) + 50 })
    )
  },

  // ================== 通用功能 ==================

  // 获取组织架构（用于可见范围选择）
  getOrganizations(): Promise<ApiResponse<OrganizationNode[]>> {
    return apiAdapter.get(
      () => request.get<OrganizationNode[]>('/news/organizations'),
      async () => await organizations()
    )
  },

  // 获取资讯分类列表
  getNewsCategories(): Promise<ApiResponse<{ code: string, name: string, color?: string }[]>> {
    return apiAdapter.get(
      () => request.get<{ code: string, name: string, color?: string }[]>('/news/categories'),
      async () => await newsCategories()
    )
  },

  // 获取资讯标签列表
  getNewsTags(keyword?: string): Promise<ApiResponse<string[]>> {
    return apiAdapter.get(
      () => request.get<string[]>('/news/tags', { params: { keyword } }),
      async () => await newsTags(keyword)
    )
  },

  // 搜索资讯
  searchNews(keyword: string, filters?: Partial<NewsQueryParams>): Promise<ApiResponse<NewsArticle[]>> {
    return apiAdapter.get(
      () => request.get<NewsArticle[]>('/news/search', { params: { keyword, ...filters } }),
      async () => {
        const allArticles = await newsArticles()
        return allArticles.filter(article => 
          article.title.includes(keyword) || 
          article.content.includes(keyword) ||
          article.tags.some(tag => tag.includes(keyword))
        )
      }
    )
  },

  // 获取资讯预览
  previewNews(id: number): Promise<ApiResponse<{ title: string, content: string, metadata: any }>> {
    return apiAdapter.get(
      () => request.get<{ title: string, content: string, metadata: any }>(`/news/articles/${id}/preview`),
      async () => {
        const allArticles = await newsArticles()
        const article = allArticles.find(a => a.id === id)
        if (!article) {
          throw new Error('资讯不存在')
        }
        return {
          title: article.title,
          content: article.content,
          metadata: {
            author: article.author,
            publishTime: article.publishTime,
            source: article.source,
            tags: article.tags
          }
        }
      }
    )
  },

  // 导出资讯数据
  exportNews(params: NewsQueryParams): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiAdapter.post(
      () => request.post<{ downloadUrl: string }>('/news/articles/export', params),
      async () => ({ downloadUrl: '/mock/news-export.xlsx' })
    )
  },

  // 获取系统配置
  getSystemConfig(): Promise<ApiResponse<{ 
    maxDailyFetch: number,
    duplicateThreshold: number,
    autoPublishDelay: number,
    [key: string]: any 
  }>> {
    return apiAdapter.get(
      () => request.get<{ 
        maxDailyFetch: number,
        duplicateThreshold: number,
        autoPublishDelay: number,
        [key: string]: any 
      }>('/news/config'),
      async () => await systemConfig()
    )
  },

  // 更新系统配置
  updateSystemConfig(config: Record<string, any>): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => request.post('/news/config', config),
      async () => undefined
    )
  }
}

export default newsApi