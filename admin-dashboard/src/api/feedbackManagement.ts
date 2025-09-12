import { request } from './request'
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

export const feedbackApi = {
  getFeedbackList(params: FeedbackQueryParams): Promise<ApiResponse<FeedbackListResponse>> {
    return request.get('/feedback/list', { params })
  },

  getFeedbackDetail(id: number): Promise<ApiResponse<FeedbackDetail>> {
    return request.get(`/feedback/${id}`)
  },

  getFeedbackStatistics(): Promise<ApiResponse<FeedbackStatistics>> {
    return request.get('/feedback/statistics')
  },

  updateFeedbackStatus(id: number, data: ProcessFormData): Promise<ApiResponse<void>> {
    return request.put(`/feedback/${id}/status`, data)
  },

  assignFeedback(id: number, data: AssignFormData): Promise<ApiResponse<void>> {
    return request.put(`/feedback/${id}/assign`, data)
  },

  replyToUser(id: number, data: ReplyFormData): Promise<ApiResponse<UserReply>> {
    return request.post(`/feedback/${id}/reply`, data)
  },

  addInternalComment(id: number, data: CommentFormData): Promise<ApiResponse<InternalComment>> {
    return request.post(`/feedback/${id}/comment`, data)
  },

  getProcessRecords(feedbackId: number): Promise<ApiResponse<ProcessRecord[]>> {
    return request.get(`/feedback/${feedbackId}/process-records`)
  },

  getInternalComments(feedbackId: number): Promise<ApiResponse<InternalComment[]>> {
    return request.get(`/feedback/${feedbackId}/comments`)
  },

  getUserReplies(feedbackId: number): Promise<ApiResponse<UserReply[]>> {
    return request.get(`/feedback/${feedbackId}/replies`)
  },

  getAvailableProcessors(): Promise<ApiResponse<{id: number, name: string, department?: string}[]>> {
    return request.get('/feedback/processors')
  },

  updateFeedbackPriority(id: number, priority: string): Promise<ApiResponse<void>> {
    return request.put(`/feedback/${id}/priority`, { priority })
  },

  batchAssignFeedback(feedbackIds: number[], processerId: number): Promise<ApiResponse<void>> {
    return request.post('/feedback/batch-assign', { feedbackIds, processerId })
  },

  batchUpdateStatus(feedbackIds: number[], status: string, reason?: string): Promise<ApiResponse<void>> {
    return request.post('/feedback/batch-status', { feedbackIds, status, reason })
  },

  downloadAttachment(attachmentId: number): Promise<Blob> {
    return request.get(`/feedback/attachment/${attachmentId}/download`, { 
      responseType: 'blob' 
    })
  }
}