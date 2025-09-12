import { http } from './request'
import type { 
  ApiResponse,
  ForumFeatureRequest,
  FeatureRequestQueryParams,
  FeatureRequestProcessForm,
  FeatureRequestStats,
  BatchFeatureRequestOperation,
  FeatureRequestType,
  FeatureRequestStatus
} from '@/types'

export const featureRequestApi = {
  // 获取申请列表
  getRequestList(params: FeatureRequestQueryParams): Promise<ApiResponse<{ 
    list: ForumFeatureRequest[]
    total: number 
  }>> {
    return http.get('/forum/feature-requests', { params })
  },

  // 获取申请详情
  getRequestDetail(id: number): Promise<ApiResponse<ForumFeatureRequest>> {
    return http.get(`/forum/feature-requests/${id}`)
  },

  // 处理申请（批准/拒绝）
  processRequest(data: FeatureRequestProcessForm): Promise<ApiResponse<void>> {
    return http.post(`/forum/feature-requests/${data.requestId}/process`, {
      action: data.action,
      rejectReason: data.rejectReason
    })
  },

  // 批量处理申请
  batchProcessRequests(data: BatchFeatureRequestOperation): Promise<ApiResponse<{
    successCount: number
    failCount: number
    errors?: string[]
  }>> {
    return http.post('/forum/feature-requests/batch-process', data)
  },

  // 获取申请统计数据
  getRequestStats(): Promise<ApiResponse<FeatureRequestStats>> {
    return http.get('/forum/feature-requests/stats')
  },

  // 获取待处理申请数量
  getPendingCount(): Promise<ApiResponse<{ 
    total: number
    topRequests: number
    eliteRequests: number
  }>> {
    return http.get('/forum/feature-requests/pending-count')
  },

  // 获取申请人的历史申请
  getUserRequestHistory(
    userId: number,
    params?: { 
      requestType?: FeatureRequestType
      status?: FeatureRequestStatus
      limit?: number
    }
  ): Promise<ApiResponse<ForumFeatureRequest[]>> {
    return http.get(`/forum/feature-requests/user/${userId}/history`, { params })
  },

  // 检查帖子是否可以申请置顶/加精
  checkRequestEligibility(
    postId: number, 
    requestType: FeatureRequestType
  ): Promise<ApiResponse<{
    eligible: boolean
    reason?: string
    existingRequest?: {
      id: number
      status: FeatureRequestStatus
      createdAt: string
    }
  }>> {
    return http.get(`/forum/feature-requests/check-eligibility`, {
      params: { postId, requestType }
    })
  },

  // 提交新申请（前台用户使用）
  submitRequest(data: {
    postId: number
    requestType: FeatureRequestType
    reason: string
  }): Promise<ApiResponse<ForumFeatureRequest>> {
    return http.post('/forum/feature-requests/submit', data)
  },

  // 撤销申请（仅待审核状态可撤销）
  cancelRequest(id: number): Promise<ApiResponse<void>> {
    return http.post(`/forum/feature-requests/${id}/cancel`)
  },

  // 获取热门申请（基于申请频率）
  getPopularRequests(params?: {
    requestType?: FeatureRequestType
    timeRange?: 'week' | 'month' | 'quarter'
    limit?: number
  }): Promise<ApiResponse<Array<{
    postId: number
    postTitle: string
    requestCount: number
    latestReason: string
    firstRequestTime: string
    lastRequestTime: string
  }>>> {
    return http.get('/forum/feature-requests/popular', { params })
  },

  // 获取审核员的处理记录
  getReviewerHistory(
    reviewerId: number,
    params?: {
      requestType?: FeatureRequestType
      action?: 'approve' | 'reject'
      startTime?: string
      endTime?: string
      limit?: number
    }
  ): Promise<ApiResponse<{
    list: ForumFeatureRequest[]
    stats: {
      totalProcessed: number
      approvedCount: number
      rejectedCount: number
      approvalRate: number
    }
  }>> {
    return http.get(`/forum/feature-requests/reviewer/${reviewerId}/history`, { params })
  },

  // 转交申请给其他审核员
  transferRequest(id: number, data: {
    newReviewerId: number
    reason: string
  }): Promise<ApiResponse<void>> {
    return http.post(`/forum/feature-requests/${id}/transfer`, data)
  },

  // 获取可处理申请的审核员列表
  getAvailableReviewers(): Promise<ApiResponse<Array<{
    id: number
    name: string
    department: string
    pendingCount: number
    approvalRate: number
    avgProcessTime: number // 小时
  }>>> {
    return http.get('/forum/feature-requests/available-reviewers')
  },

  // 设置申请优先级（紧急处理）
  setPriority(id: number, priority: 'high' | 'normal' | 'low'): Promise<ApiResponse<void>> {
    return http.post(`/forum/feature-requests/${id}/priority`, { priority })
  },

  // 添加处理备注
  addProcessNote(id: number, note: string): Promise<ApiResponse<void>> {
    return http.post(`/forum/feature-requests/${id}/notes`, { note })
  },

  // 获取处理备注历史
  getProcessNotes(id: number): Promise<ApiResponse<Array<{
    id: number
    note: string
    createdBy: string
    createdAt: string
  }>>> {
    return http.get(`/forum/feature-requests/${id}/notes`)
  },

  // 导出申请数据
  exportRequests(params: FeatureRequestQueryParams): Promise<ApiResponse<{ 
    downloadUrl: string 
  }>> {
    return http.post('/forum/feature-requests/export', params)
  },

  // 获取申请处理时效分析
  getProcessTimeAnalysis(params?: {
    requestType?: FeatureRequestType
    startTime?: string
    endTime?: string
  }): Promise<ApiResponse<{
    avgProcessTime: number  // 小时
    medianProcessTime: number
    timeDistribution: Array<{
      range: string  // "0-1小时", "1-6小时", "6-24小时", "1-3天", "3天以上"
      count: number
      percentage: number
    }>
    overdueCounts: {
      total: number
      over24Hours: number
      over3Days: number
      over7Days: number
    }
  }>> {
    return http.get('/forum/feature-requests/process-time-analysis', { params })
  }
}

export default featureRequestApi