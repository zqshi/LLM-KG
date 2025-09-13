import { http } from './request'
import { apiAdapter } from './adapter'
import { staticData } from '@/services/staticData'
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

// 获取静态数据的辅助函数
const getMockFeatureRequests = async (): Promise<ForumFeatureRequest[]> => {
  const data = await staticData.featureRequests()
  // 确保数据格式正确
  return data.map((item: any) => ({
    ...item,
    // 确保时间字段正确
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }))
}

// 获取静态统计数据
const getMockFeatureRequestStats = async (): Promise<FeatureRequestStats> => {
  const requests = await getMockFeatureRequests()
  
  const totalRequests = requests.length
  const pendingRequests = requests.filter(r => r.status === 'pending').length
  const approvedRequests = requests.filter(r => r.status === 'approved').length
  const rejectedRequests = requests.filter(r => r.status === 'rejected').length
  const todayRequests = requests.filter(r => {
    const today = new Date().toISOString().split('T')[0]
    return r.createdAt.startsWith(today)
  }).length
  const thisWeekRequests = requests.filter(r => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return new Date(r.createdAt) > oneWeekAgo
  }).length
  const topRequests = requests.filter(r => r.requestType === 'top').length
  const eliteRequests = requests.filter(r => r.requestType === 'elite').length
  const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 10000) / 100 : 0
  
  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    todayRequests,
    thisWeekRequests,
    topRequests,
    eliteRequests,
    approvalRate
  }
}

export const featureRequestApi = {
  // 获取申请列表
  getRequestList(params: FeatureRequestQueryParams): Promise<ApiResponse<{ 
    list: ForumFeatureRequest[]
    total: number 
  }>> {
    return apiAdapter.get(
      () => http.get('/forum/feature-requests', { params }),
      async () => {
        let data = await getMockFeatureRequests()
        
        // 应用过滤器
        if (params.requestType) {
          data = data.filter(item => item.requestType === params.requestType)
        }
        if (params.status) {
          data = data.filter(item => item.status === params.status)
        }
        if (params.applicantId) {
          data = data.filter(item => item.applicantId === params.applicantId)
        }
        if (params.startTime || params.endTime) {
          data = data.filter(item => {
            const itemDate = new Date(item.createdAt)
            if (params.startTime && itemDate < new Date(params.startTime)) return false
            if (params.endTime && itemDate > new Date(params.endTime)) return false
            return true
          })
        }
        
        // 应用分页
        const start = (params.page - 1) * params.pageSize
        const end = start + params.pageSize
        const list = data.slice(start, end)
        
        return {
          list,
          total: data.length
        }
      },
      { mockPagination: false } // 我们自己处理分页
    )
  },

  // 获取申请详情
  getRequestDetail(id: number): Promise<ApiResponse<ForumFeatureRequest>> {
    return apiAdapter.get(
      () => http.get(`/forum/feature-requests/${id}`),
      async () => {
        const data = await getMockFeatureRequests()
        const request = data.find(item => item.id === id)
        if (!request) {
          throw new Error('申请不存在')
        }
        return request
      }
    )
  },

  // 处理申请（批准/拒绝）
  processRequest(data: FeatureRequestProcessForm): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/forum/feature-requests/${data.requestId}/process`, {
        action: data.action,
        rejectReason: data.rejectReason
      }),
      undefined,
      '处理成功'
    )
  },

  // 批量处理申请
  batchProcessRequests(data: BatchFeatureRequestOperation): Promise<ApiResponse<{
    successCount: number
    failCount: number
    errors?: string[]
  }>> {
    return apiAdapter.post(
      () => http.post('/forum/feature-requests/batch-process', data),
      {
        successCount: data.requestIds.length,
        failCount: 0
      },
      '批量处理成功'
    )
  },

  // 获取申请统计数据
  getRequestStats(): Promise<ApiResponse<FeatureRequestStats>> {
    return apiAdapter.get(
      () => http.get('/forum/feature-requests/stats'),
      getMockFeatureRequestStats
    )
  },

  // 获取待处理申请数量
  getPendingCount(): Promise<ApiResponse<{ 
    total: number
    topRequests: number
    eliteRequests: number
  }>> {
    return apiAdapter.get(
      () => http.get('/forum/feature-requests/pending-count'),
      async () => {
        const requests = await getMockFeatureRequests()
        const pendingRequests = requests.filter(r => r.status === 'pending')
        const topRequests = pendingRequests.filter(r => r.requestType === 'top').length
        const eliteRequests = pendingRequests.filter(r => r.requestType === 'elite').length
        
        return {
          total: pendingRequests.length,
          topRequests,
          eliteRequests
        }
      }
    )
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
    return apiAdapter.get(
      () => http.get(`/forum/feature-requests/user/${userId}/history`, { params }),
      async () => {
        let requests = await getMockFeatureRequests()
        requests = requests.filter(r => r.applicantId === userId)
        
        if (params?.requestType) {
          requests = requests.filter(r => r.requestType === params.requestType)
        }
        if (params?.status) {
          requests = requests.filter(r => r.status === params.status)
        }
        
        if (params?.limit) {
          requests = requests.slice(0, params.limit)
        }
        
        return requests
      }
    )
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
    return apiAdapter.get(
      () => http.get(`/forum/feature-requests/check-eligibility`, {
        params: { postId, requestType }
      }),
      async () => {
        const requests = await getMockFeatureRequests()
        const existingRequest = requests.find(r => r.postId === postId && r.requestType === requestType)
        
        if (existingRequest) {
          // 如果已有申请且未被拒绝，就不允许再次申请
          if (existingRequest.status !== 'rejected') {
            return {
              eligible: false,
              reason: '已有相同类型的申请正在处理中',
              existingRequest: {
                id: existingRequest.id,
                status: existingRequest.status,
                createdAt: existingRequest.createdAt
              }
            }
          }
        }
        
        return {
          eligible: true
        }
      }
    )
  },

  // 提交新申请（前台用户使用）
  submitRequest(data: {
    postId: number
    requestType: FeatureRequestType
    reason: string
  }): Promise<ApiResponse<ForumFeatureRequest>> {
    return apiAdapter.post(
      () => http.post('/forum/feature-requests/submit', data),
      {
        id: Date.now(),
        postId: data.postId,
        requestType: data.requestType,
        reason: data.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any,
      '申请提交成功'
    )
  },

  // 撤销申请（仅待审核状态可撤销）
  cancelRequest(id: number): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/forum/feature-requests/${id}/cancel`),
      undefined,
      '申请已撤销'
    )
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
    return apiAdapter.get(
      () => http.get('/forum/feature-requests/popular', { params }),
      async () => {
        const requests = await getMockFeatureRequests()
        const grouped: Record<number, any[]> = {}
        
        // 按postId分组
        requests.forEach(request => {
          if (!grouped[request.postId]) {
            grouped[request.postId] = []
          }
          grouped[request.postId].push(request)
        })
        
        // 转换为热门申请格式
        const popularRequests = Object.entries(grouped).map(([postId, reqs]) => {
          const firstRequest = reqs.reduce((earliest, current) => 
            new Date(current.createdAt) < new Date(earliest.createdAt) ? current : earliest
          )
          const lastRequest = reqs.reduce((latest, current) => 
            new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
          )
          
          return {
            postId: parseInt(postId),
            postTitle: reqs[0].post?.title || '未知帖子',
            requestCount: reqs.length,
            latestReason: reqs[reqs.length - 1].reason,
            firstRequestTime: firstRequest.createdAt,
            lastRequestTime: lastRequest.createdAt
          }
        })
        
        // 按申请次数排序
        popularRequests.sort((a, b) => b.requestCount - a.requestCount)
        
        // 应用限制
        const limit = params?.limit || 10
        return popularRequests.slice(0, limit)
      }
    )
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
    return apiAdapter.get(
      () => http.get(`/forum/feature-requests/reviewer/${reviewerId}/history`, { params }),
      async () => {
        let requests = await getMockFeatureRequests()
        requests = requests.filter(r => r.reviewerId === reviewerId && r.status !== 'pending')
        
        if (params?.requestType) {
          requests = requests.filter(r => r.requestType === params.requestType)
        }
        
        const approvedCount = requests.filter(r => r.status === 'approved').length
        const rejectedCount = requests.filter(r => r.status === 'rejected').length
        const totalProcessed = requests.length
        const approvalRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 10000) / 100 : 0
        
        if (params?.limit) {
          requests = requests.slice(0, params.limit)
        }
        
        return {
          list: requests,
          stats: {
            totalProcessed,
            approvedCount,
            rejectedCount,
            approvalRate
          }
        }
      }
    )
  },

  // 转交申请给其他审核员
  transferRequest(id: number, data: {
    newReviewerId: number
    reason: string
  }): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/forum/feature-requests/${id}/transfer`, data),
      undefined,
      '申请已转交'
    )
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
    return apiAdapter.get(
      () => http.get('/forum/feature-requests/available-reviewers'),
      async () => [
        {
          id: 1,
          name: '张三',
          department: '技术部',
          pendingCount: 3,
          approvalRate: 95.5,
          avgProcessTime: 2.5
        },
        {
          id: 2,
          name: '李四',
          department: '产品部',
          pendingCount: 1,
          approvalRate: 92.0,
          avgProcessTime: 1.8
        },
        {
          id: 3,
          name: '王五',
          department: '运营部',
          pendingCount: 5,
          approvalRate: 88.2,
          avgProcessTime: 3.2
        }
      ]
    )
  },

  // 设置申请优先级（紧急处理）
  setPriority(id: number, priority: 'high' | 'normal' | 'low'): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/forum/feature-requests/${id}/priority`, { priority }),
      undefined,
      '优先级已设置'
    )
  },

  // 添加处理备注
  addProcessNote(id: number, note: string): Promise<ApiResponse<void>> {
    return apiAdapter.post(
      () => http.post(`/forum/feature-requests/${id}/notes`, { note }),
      undefined,
      '备注已添加'
    )
  },

  // 获取处理备注历史
  getProcessNotes(id: number): Promise<ApiResponse<Array<{
    id: number
    note: string
    createdBy: string
    createdAt: string
  }>>> {
    return apiAdapter.get(
      () => http.get(`/forum/feature-requests/${id}/notes`),
      async () => [
        {
          id: 1,
          note: '内容质量较高，建议通过',
          createdBy: '张三',
          createdAt: '2024-12-10 15:45:00'
        }
      ]
    )
  },

  // 导出申请数据
  exportRequests(params: FeatureRequestQueryParams): Promise<ApiResponse<{ 
    downloadUrl: string 
  }>> {
    return apiAdapter.post(
      () => http.post('/forum/feature-requests/export', params),
      {
        downloadUrl: '/mock/feature-requests-export.xlsx'
      },
      '导出任务已启动'
    )
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
    return apiAdapter.get(
      () => http.get('/forum/feature-requests/process-time-analysis', { params }),
      async () => ({
        avgProcessTime: 3.2,
        medianProcessTime: 2.8,
        timeDistribution: [
          { range: '0-1小时', count: 15, percentage: 25 },
          { range: '1-6小时', count: 25, percentage: 42 },
          { range: '6-24小时', count: 12, percentage: 20 },
          { range: '1-3天', count: 6, percentage: 10 },
          { range: '3天以上', count: 2, percentage: 3 }
        ],
        overdueCounts: {
          total: 8,
          over24Hours: 5,
          over3Days: 2,
          over7Days: 0
        }
      })
    )
  }
}

export default featureRequestApi