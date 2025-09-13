import { http } from './request'
import { apiAdapter } from './adapter'
import type { ApiResponse } from '@/types'
import type {
  FeedbackItem,
  FeedbackDetail,
  FeedbackQueryParams,
  FeedbackListResponse,
  FeedbackStatistics,
  ProcessFormData,
  ReplyFormData,
  CommentFormData,
  AssignFormData,
  ProcessRecord,
  InternalComment,
  UserReply
} from '@/types/feedbackManagement'

// 静态数据导入
const staticData = {
  feedbackItems: () => import('@/services/staticData/feedback').then(m => m.feedbackItems),
  feedbackDetails: () => import('@/services/staticData/feedback').then(m => m.feedbackDetails),
  feedbackStatistics: () => import('@/services/staticData/feedback').then(m => m.feedbackStatistics),
  availableProcessors: () => import('@/services/staticData/feedback').then(m => m.availableProcessors)
}

export const feedbackApi = {
  getFeedbackList(params: FeedbackQueryParams): Promise<ApiResponse<FeedbackListResponse>> {
    return apiAdapter.get<FeedbackListResponse>(
      () => http.get('/feedback/list', { params }),
      async () => {
        const items = await staticData.feedbackItems()
        // 模拟筛选和分页
        let filteredItems = [...items]
        
        // 关键词筛选
        if (params.keyword) {
          const keyword = params.keyword.toLowerCase()
          filteredItems = filteredItems.filter(item => 
            item.title.toLowerCase().includes(keyword) || 
            item.content.toLowerCase().includes(keyword)
          )
        }
        
        // 类型筛选
        if (params.type) {
          filteredItems = filteredItems.filter(item => item.type === params.type)
        }
        
        // 状态筛选
        if (params.status && params.status.length > 0) {
          filteredItems = filteredItems.filter(item => params.status!.includes(item.status))
        }
        
        // 优先级筛选
        if (params.priority && params.priority.length > 0) {
          filteredItems = filteredItems.filter(item => params.priority!.includes(item.priority))
        }
        
        // 时间范围筛选
        if (params.startTime || params.endTime) {
          filteredItems = filteredItems.filter(item => {
            const itemTime = new Date(item.createTime).getTime()
            const startTime = params.startTime ? new Date(params.startTime).getTime() : 0
            const endTime = params.endTime ? new Date(params.endTime).getTime() : Infinity
            return itemTime >= startTime && itemTime <= endTime
          })
        }
        
        // 提交人筛选
        if (params.submitterName) {
          filteredItems = filteredItems.filter(item => 
            item.submitterName.includes(params.submitterName!)
          )
        }
        
        // 处理人筛选
        if (params.processerId) {
          filteredItems = filteredItems.filter(item => item.processerId === params.processerId)
        }
        
        // 分页
        const total = filteredItems.length
        const start = (params.page - 1) * params.pageSize
        const end = start + params.pageSize
        const list = filteredItems.slice(start, end)
        
        // 获取统计数据
        const statistics = await staticData.feedbackStatistics()
        
        return {
          list,
          total,
          statistics
        }
      },
      {
        mockPagination: false // 我们已经在静态数据中处理了分页
      }
    )
  },

  getFeedbackDetail(id: number): Promise<ApiResponse<FeedbackDetail>> {
    return apiAdapter.get<FeedbackDetail>(
      () => http.get(`/feedback/${id}`),
      async () => {
        const details = await staticData.feedbackDetails()
        const detail = details.find(item => item.id === id)
        if (!detail) {
          throw new Error('反馈详情不存在')
        }
        return detail
      }
    )
  },

  getFeedbackStatistics(): Promise<ApiResponse<FeedbackStatistics>> {
    return apiAdapter.get<FeedbackStatistics>(
      () => http.get('/feedback/statistics'),
      staticData.feedbackStatistics
    )
  },

  updateFeedbackStatus(id: number, data: ProcessFormData): Promise<ApiResponse<void>> {
    return apiAdapter.action<void>(
      () => http.put(`/feedback/${id}/status`, data),
      undefined,
      '状态更新成功'
    )
  },

  assignFeedback(id: number, data: AssignFormData): Promise<ApiResponse<void>> {
    return apiAdapter.action<void>(
      () => http.put(`/feedback/${id}/assign`, data),
      undefined,
      '分配成功'
    )
  },

  replyToUser(id: number, data: ReplyFormData): Promise<ApiResponse<UserReply>> {
    return apiAdapter.action<UserReply>(
      () => http.post(`/feedback/${id}/reply`, data),
      {
        id: Date.now(),
        feedbackId: id,
        content: data.content,
        senderId: 1,
        senderName: '系统管理员',
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
        notificationSent: data.sendNotification
      } as UserReply,
      '回复成功'
    )
  },

  addInternalComment(id: number, data: CommentFormData): Promise<ApiResponse<InternalComment>> {
    return apiAdapter.action<InternalComment>(
      () => http.post(`/feedback/${id}/comment`, data),
      {
        id: Date.now(),
        feedbackId: id,
        authorId: 1,
        authorName: '系统管理员',
        content: data.content,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      } as InternalComment,
      '评论添加成功'
    )
  },

  getProcessRecords(feedbackId: number): Promise<ApiResponse<ProcessRecord[]>> {
    return apiAdapter.get<ProcessRecord[]>(
      () => http.get(`/feedback/${feedbackId}/process-records`),
      async () => []
    )
  },

  getInternalComments(feedbackId: number): Promise<ApiResponse<InternalComment[]>> {
    return apiAdapter.get<InternalComment[]>(
      () => http.get(`/feedback/${feedbackId}/comments`),
      async () => []
    )
  },

  getUserReplies(feedbackId: number): Promise<ApiResponse<UserReply[]>> {
    return apiAdapter.get<UserReply[]>(
      () => http.get(`/feedback/${feedbackId}/replies`),
      async () => []
    )
  },

  getAvailableProcessors(): Promise<ApiResponse<{id: number, name: string, department?: string}[]>> {
    return apiAdapter.get<{id: number, name: string, department?: string}[]>(
      () => http.get('/feedback/processors'),
      staticData.availableProcessors
    )
  },

  updateFeedbackPriority(id: number, priority: string): Promise<ApiResponse<void>> {
    return apiAdapter.action<void>(
      () => http.put(`/feedback/${id}/priority`, { priority }),
      undefined,
      '优先级更新成功'
    )
  },

  batchAssignFeedback(feedbackIds: number[], processerId: number): Promise<ApiResponse<void>> {
    return apiAdapter.action<void>(
      () => http.post('/feedback/batch-assign', { feedbackIds, processerId }),
      undefined,
      '批量分配成功'
    )
  },

  batchUpdateStatus(feedbackIds: number[], status: string, reason?: string): Promise<ApiResponse<void>> {
    return apiAdapter.action<void>(
      () => http.post('/feedback/batch-status', { feedbackIds, status, reason }),
      undefined,
      '批量更新状态成功'
    )
  },

  downloadAttachment(attachmentId: number): Promise<Blob> {
    // 静态模式下返回模拟的Blob
    if (import.meta.env.VITE_STATIC_MODE === 'true') {
      return Promise.resolve(new Blob(['模拟附件内容'], { type: 'text/plain' }))
    }
    return http.get(`/feedback/attachment/${attachmentId}/download`, { 
      responseType: 'blob' 
    }) as unknown as Promise<Blob>
  }
}