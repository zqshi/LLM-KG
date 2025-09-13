import { http } from './request'
import { apiAdapter } from './adapter'
import { quotations } from '@/services/staticData'
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
  PaginationParams,
  QuotationStatus
} from '@/types'

export const quotationApi = {
  // ======================== 基础CRUD操作 ========================
  
  // 获取名言列表
  getList(params: QuotationQueryParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/quotation', params),
      async () => {
        const allQuotations = quotations
        const result = { list: allQuotations, total: allQuotations.length }
        return result
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 获取名言详情
  getDetail(id: number): Promise<ApiResponse<Quotation>> {
    return apiAdapter.get(
      () => http.get(`/quotation/${id}`),
      async () => {
        const allQuotations = quotations
        const quotation = allQuotations.find((q: Quotation) => q.id === id)
        if (!quotation) {
          throw new Error('名言不存在')
        }
        return quotation
      }
    )
  },

  // 创建名言
  create(data: QuotationForm): Promise<ApiResponse<Quotation>> {
    return apiAdapter.post(
      () => http.post('/quotation', data),
      async () => {
        const newQuotation: Quotation = {
          id: Date.now(),
          content: data.content,
          contentHtml: data.content,
          leaderId: 1,
          leader: {
            id: 1,
            name: '系统用户',
            username: 'system',
            email: 'system@company.com',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          occasion: '系统创建',
          status: 'pending' as QuotationStatus,
          version: 1,
          creatorId: 1,
          creator: {
            id: 1,
            name: '系统用户',
            username: 'system',
            email: 'system@company.com',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          reviewerId: 1,
          reviewer: {
            id: 1,
            name: '系统用户',
            username: 'system',
            email: 'system@company.com',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          showCount: 0,
          likeCount: 0,
          tags: data.tags || [],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return newQuotation
      }
    )
  },

  // 更新名言
  update(id: number, data: Partial<QuotationForm>): Promise<ApiResponse<Quotation>> {
    return apiAdapter.put(
      () => http.put(`/quotation/${id}`, data),
      async () => {
        const allQuotations = quotations
        const quotation = allQuotations.find((q: Quotation) => q.id === id)
        if (!quotation) {
          throw new Error('名言不存在')
        }
        const updatedQuotation: Quotation = {
          ...quotation,
          ...data,
          updateTime: new Date().toISOString()
        }
        return updatedQuotation
      }
    )
  },

  // 删除名言
  delete(id: number, reason?: string): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => http.delete(`/quotation/${id}`, { reason }),
      async () => { return Promise.resolve() }
    )
  },

  // 批量操作
  batchOperation(data: QuotationBatchOperation): Promise<ApiResponse<{ successCount: number, failCount: number }>> {
    return apiAdapter.post(
      () => http.post('/quotation/batch', data),
      async () => {
        return {
          successCount: data.quotationIds?.length || 0,
          failCount: 0
        }
      }
    )
  },

  // ======================== 审核相关接口 ========================
  
  // 获取待审核名言列表
  getPendingList(params: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/quotation/pending', params),
      async () => {
        const allQuotations = quotations
        const pendingQuotations = allQuotations.filter((q: Quotation) => q.status === 'pending_review')
        return { list: pendingQuotations, total: pendingQuotations.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 审核操作（通过/驳回）
  review(id: number, operation: ReviewOperation, comment?: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/quotation/${id}/review`, { operation, comment }),
      async () => { return Promise.resolve() }
    )
  },

  // 申请修正
  requestRevision(data: RevisionRequestForm): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post('/quotation/revision/request', data),
      async () => { return Promise.resolve() }
    )
  },

  // 获取审核记录
  getReviewLogs(quotationId: number, params?: PaginationParams): Promise<ApiResponse<{ list: QuotationReviewLog[], total: number }>> {
    return apiAdapter.get(
      () => http.get(`/quotation/${quotationId}/reviews`, params),
      async () => {
        const logs: QuotationReviewLog[] = [
          {
            id: 1,
            quotationId,
            quotation: quotations[0],
            reviewerId: 1,
            reviewer: {
              id: 1,
              name: '审核员A',
              username: 'auditor_a',
              email: 'auditor_a@company.com',
              avatar: '',
              groupId: 1,
              roles: [],
              status: 1,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            },
            operation: 'approve',
            comment: '内容质量良好，通过审核',
            createTime: new Date().toISOString()
          }
        ]
        return { list: logs, total: logs.length }
      }
    )
  },

  // 获取修正历史
  getRevisionHistory(quotationId: number): Promise<ApiResponse<QuotationRevisionHistory[]>> {
    return apiAdapter.get(
      () => http.get(`/quotation/${quotationId}/revisions`),
      async () => {
        const history: QuotationRevisionHistory[] = [
          {
            id: 1,
            quotationId,
            oldContent: '原始内容',
            newContent: '修正后内容',
            revisionReason: '内容不准确',
            reviewerId: 1,
            reviewer: {
              id: 1,
              name: '管理员',
              username: 'admin',
              email: 'admin@company.com',
              avatar: '',
              groupId: 1,
              roles: [],
              status: 1,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            },
            createTime: new Date().toISOString()
          }
        ]
        return history
      }
    )
  },

  // ======================== 展示配置相关 ========================
  
  // 获取展示配置列表
  getDisplayConfigs(): Promise<ApiResponse<DisplayConfig[]>> {
    return apiAdapter.get(
      () => http.get('/quotation/display/configs'),
      async () => {
        const configs: DisplayConfig[] = [
          {
            id: 1,
            name: '首页展示配置',
            mode: 'sequence',
            quotationIds: [1, 2, 3],
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
            isActive: true,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          }
        ]
        return configs
      }
    )
  },

  // 创建展示配置
  createDisplayConfig(data: Omit<DisplayConfig, 'id' | 'createTime' | 'updateTime'>): Promise<ApiResponse<DisplayConfig>> {
    return apiAdapter.post(
      () => http.post('/quotation/display/configs', data),
      async () => {
        const config: DisplayConfig = {
          id: Date.now(),
          ...data,
          quotationIds: data.quotationIds || [],
          isActive: true,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return config
      }
    )
  },

  // 更新展示配置
  updateDisplayConfig(id: number, data: Partial<DisplayConfig>): Promise<ApiResponse<DisplayConfig>> {
    return apiAdapter.put(
      () => http.put(`/quotation/display/configs/${id}`, data),
      async () => {
        const config: DisplayConfig = {
          id,
          name: '更新的配置',
          mode: 'sequence',
          quotationIds: [],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          ...data,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return config
      }
    )
  },

  // 删除展示配置
  deleteDisplayConfig(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => http.delete(`/quotation/display/configs/${id}`),
      async () => { return Promise.resolve() }
    )
  },

  // 获取精选集列表
  getPlaylists(params?: PaginationParams): Promise<ApiResponse<{ list: QuotationPlaylist[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/quotation/playlists', params),
      async () => {
        const playlists: QuotationPlaylist[] = [
          {
            id: 1,
            name: '励志名言精选',
            description: '激励人心的名言集合',
            quotationIds: [1, 2, 3],
            quotations: quotations.slice(0, 3),
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
            isActive: true,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          }
        ]
        return { list: playlists, total: playlists.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 创建精选集
  createPlaylist(data: Omit<QuotationPlaylist, 'id' | 'quotations' | 'createTime' | 'updateTime'>): Promise<ApiResponse<QuotationPlaylist>> {
    return apiAdapter.post(
      () => http.post('/quotation/playlists', data),
      async () => {
        const playlist: QuotationPlaylist = {
          id: Date.now(),
          ...data,
          quotations: [],
          isActive: true,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return playlist
      }
    )
  },

  // 更新精选集
  updatePlaylist(id: number, data: Partial<QuotationPlaylist>): Promise<ApiResponse<QuotationPlaylist>> {
    return apiAdapter.put(
      () => http.put(`/quotation/playlists/${id}`, data),
      async () => {
        const playlist: QuotationPlaylist = {
          id,
          name: '更新的精选集',
          description: '更新的描述',
          quotationIds: [],
          quotations: [],
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          ...data,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return playlist
      }
    )
  },

  // 删除精选集
  deletePlaylist(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.delete(
      () => http.delete(`/quotation/playlists/${id}`),
      async () => { return Promise.resolve() }
    )
  },

  // 获取每日一语配置
  getDailyQuoteConfig(): Promise<ApiResponse<DailyQuoteConfig>> {
    return apiAdapter.get(
      () => http.get('/quotation/daily-quote/config'),
      async () => {
        const config: DailyQuoteConfig = {
          id: 1,
          isEnabled: true,
          sendTime: '06:00',
          mode: 'random',
          targetQuotationIds: [1, 2, 3],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return config
      }
    )
  },

  // 更新每日一语配置
  updateDailyQuoteConfig(data: Partial<DailyQuoteConfig>): Promise<ApiResponse<DailyQuoteConfig>> {
    return apiAdapter.put(
      () => http.put('/quotation/daily-quote/config', data),
      async () => {
        const config: DailyQuoteConfig = {
          id: 1,
          isEnabled: true,
          sendTime: '06:00',
          mode: 'random',
          targetQuotationIds: [1, 2, 3],
          ...data,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        return config
      }
    )
  },

  // ======================== 统计数据相关 ========================
  
  // 获取统计数据
  getStatistics(): Promise<ApiResponse<QuotationStatistics>> {
    return apiAdapter.get(
      () => http.get('/quotation/statistics'),
      async () => {
        const stats: QuotationStatistics = {
          totalCount: 1286,
          publishedCount: 1124,
          pendingCount: 89,
          archivedCount: 73,
          todayPublished: 8,
          weeklyPublished: 45,
          monthlyPublished: 156,
          topLeaders: [
            { leaderId: 1, leaderName: 'CEO', count: 45 },
            { leaderId: 2, leaderName: 'CTO', count: 38 },
            { leaderId: 3, leaderName: 'CFO', count: 32 }
          ],
          popularQuotations: [
            { id: 1, content: '创新是企业发展的第一动力', showCount: 1234, likeCount: 89 },
            { id: 2, content: '团队合作是成功的基石', showCount: 987, likeCount: 67 },
            { id: 3, content: '持续学习，永远年轻', showCount: 765, likeCount: 45 }
          ]
        }
        return stats
      }
    )
  },

  // 获取热门名言TOP10
  getPopularQuotations(limit: number = 10): Promise<ApiResponse<Quotation[]>> {
    return apiAdapter.get(
      () => http.get('/quotation/popular', { limit }),
      async () => {
        const allQuotations = quotations
        return allQuotations
          .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
          .slice(0, limit)
      }
    )
  },

  // 增加展示次数
  incrementShowCount(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/quotation/${id}/show`),
      async () => { return Promise.resolve() }
    )
  },

  // 点赞操作
  likeQuotation(id: number): Promise<ApiResponse<{ likeCount: number }>> {
    return apiAdapter.post(
      () => http.post(`/quotation/${id}/like`),
      async () => ({ likeCount: 15 })
    )
  },

  // 取消点赞
  unlikeQuotation(id: number): Promise<ApiResponse<{ likeCount: number }>> {
    return apiAdapter.delete(
      () => http.delete(`/quotation/${id}/like`),
      async () => ({ likeCount: 14 })
    )
  },

  // ======================== 搜索和筛选相关 ========================
  
  // 获取所有标签
  getTags(): Promise<ApiResponse<{ tag: string, count: number }[]>> {
    return apiAdapter.get(
      () => http.get('/quotation/tags'),
      async () => [
        { tag: '励志', count: 256 },
        { tag: '人生', count: 189 },
        { tag: '成功', count: 145 },
        { tag: '智慧', count: 112 },
        { tag: '梦想', count: 89 }
      ]
    )
  },

  // 按标签搜索名言
  searchByTag(tag: string, params?: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/quotation/search/tag', { tag, ...params }),
      async () => {
        const allQuotations = quotations
        const filtered = allQuotations.filter(q => q.tags?.includes(tag))
        return { list: filtered, total: filtered.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 按领导搜索名言
  searchByLeader(leaderId: number, params?: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/quotation/search/leader', { leaderId, ...params }),
      async () => {
        const allQuotations = quotations
        const filtered = allQuotations.filter(q => q.leaderId === leaderId)
        return { list: filtered, total: filtered.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 全文搜索
  fullTextSearch(keyword: string, params?: PaginationParams): Promise<ApiResponse<{ list: Quotation[], total: number }>> {
    return apiAdapter.get(
      () => http.get('/quotation/search', { keyword, ...params }),
      async () => {
        const allQuotations = quotations
        const filtered = allQuotations.filter(q => 
          q.content.includes(keyword) || 
          q.leader.name.includes(keyword) ||
          q.occasion?.includes(keyword)
        )
        return { list: filtered, total: filtered.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // ======================== 导入导出相关 ========================
  
  // 批量导入名言
  importQuotations(file: File): Promise<ApiResponse<{ successCount: number, failCount: number, errors: string[] }>> {
    return apiAdapter.post(
      () => {
        const formData = new FormData()
        formData.append('file', file)
        return http.post('/quotation/import', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      },
      async () => ({
        successCount: 50,
        failCount: 2,
        errors: ['第3行：内容为空', '第15行：作者信息不完整']
      })
    )
  },

  // 导出名言
  exportQuotations(params: QuotationQueryParams): Promise<Blob> {
    return apiAdapter.get(
      () => http.get('/quotation/export', params, {
        responseType: 'blob'
      }).then(response => response.data),
      async () => new Blob(['静态模式导出文件'], { type: 'text/plain' })
    ).then(response => response.data)
  },

  // ======================== 前台展示相关 ========================
  
  // 获取首页展示的名言
  getHomepageQuotation(): Promise<ApiResponse<Quotation>> {
    return apiAdapter.get(
      () => http.get('/quotation/homepage'),
      async () => {
        const allQuotations = quotations
        return allQuotations[0] || {
          id: 1,
          content: '生命不息，奋斗不止',
          contentHtml: '<p>生命不息，奋斗不止</p>',
          leaderId: 1,
          leader: {
            id: 1,
            name: '未知',
            username: 'unknown',
            email: '',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          occasion: '',
          status: 'published' as QuotationStatus,
          version: 1,
          creatorId: 1,
          creator: {
            id: 1,
            name: '未知',
            username: 'unknown',
            email: '',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          reviewerId: 1,
          reviewer: {
            id: 1,
            name: '未知',
            username: 'unknown',
            email: '',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          showCount: 100,
          likeCount: 10,
          tags: ['励志'],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
      }
    )
  },

  // 获取随机名言
  getRandomQuotation(): Promise<ApiResponse<Quotation>> {
    return apiAdapter.get(
      () => http.get('/quotation/random'),
      async () => {
        const allQuotations = quotations
        const randomIndex = Math.floor(Math.random() * allQuotations.length)
        return allQuotations[randomIndex] || allQuotations[0]
      }
    )
  },

  // 获取今日一语
  getTodayQuote(): Promise<ApiResponse<Quotation>> {
    return apiAdapter.get(
      () => http.get('/quotation/today'),
      async () => {
        const allQuotations = quotations
        return allQuotations[0] || {
          id: 1,
          content: '今日的努力，是明日成功的基石',
          contentHtml: '<p>今日的努力，是明日成功的基石</p>',
          leaderId: 1,
          leader: {
            id: 1,
            name: '今日名言',
            username: 'today_quote',
            email: '',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          occasion: '',
          status: 'published' as QuotationStatus,
          version: 1,
          creatorId: 1,
          creator: {
            id: 1,
            name: '今日名言',
            username: 'today_quote',
            email: '',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          reviewerId: 1,
          reviewer: {
            id: 1,
            name: '今日名言',
            username: 'today_quote',
            email: '',
            avatar: '',
            groupId: 1,
            roles: [],
            status: 1,
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          showCount: 50,
          likeCount: 5,
          tags: ['每日一语'],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
      }
    )
  }
}

export default quotationApi