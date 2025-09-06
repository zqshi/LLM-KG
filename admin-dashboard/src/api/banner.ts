import { request } from './request'
import { auditNodeUtils } from './auditNodeFactory'

/**
 * Banner状态枚举
 */
export type BannerStatus = 'draft' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'published' | 'offline'

/**
 * Banner接口定义
 */
export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  status: BannerStatus
  description?: string
  creator: string
  createTime: string
  updateTime?: string
  auditTaskId?: string
  rejectReason?: string
  rejectDetail?: string
}

/**
 * Banner表单接口
 */
export interface BannerForm {
  id?: number
  title: string
  imageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  description?: string
  auditOptions?: {
    submitForAuditImmediately?: boolean
    priority?: 'high' | 'normal' | 'low'
    metadata?: Record<string, any>
    approvalConfig?: ApprovalConfig
    approvalReady?: boolean
  }
}

/**
 * 审批配置接口
 */
export interface ApprovalConfig {
  mode: 'smart' | 'template' | 'custom'
  smart?: SmartApprovalConfig
  template?: TemplateApprovalConfig
  custom?: CustomApprovalConfig
  preview: ApprovalStep[]
}

/**
 * 智能审批配置
 */
export interface SmartApprovalConfig {
  priority: 'high' | 'normal' | 'low'
  expectedCompleteTime?: string
  autoReminder: boolean
  smartEscalation: boolean
  parallelProcessing: boolean
  recommendation?: ApprovalRecommendation
}

/**
 * 模板审批配置
 */
export interface TemplateApprovalConfig {
  templateId: number
  priority: 'high' | 'normal' | 'low'
  features: string[]
  selected?: ApprovalTemplate
}

/**
 * 自定义审批配置
 */
export interface CustomApprovalConfig {
  steps: CustomApprovalStep[]
  globalPriority: 'high' | 'normal' | 'low'
  parallelEnabled: boolean
  reminderEnabled: boolean
}

/**
 * 审批步骤接口
 */
export interface ApprovalStep {
  name: string
  approver?: string
  timeLimit?: string
  type?: 'manual' | 'auto' | 'conditional'
  description?: string
  estimatedTime?: string
}

/**
 * 自定义审批步骤
 */
export interface CustomApprovalStep {
  id: number
  name: string
  approverId?: number
  timeLimit: string
  type: 'manual' | 'auto' | 'conditional'
  required: boolean
  description?: string
}

/**
 * 审批推荐
 */
export interface ApprovalRecommendation {
  confidence: number
  reason: string
  steps: ApprovalStep[]
  estimatedTotalTime?: string
}

/**
 * 审批模板
 */
export interface ApprovalTemplate {
  id: number
  name: string
  description: string
  recommended: boolean
  avgProcessTime: string
  stepCount: number
  successRate: number
  steps: ApprovalStep[]
}

/**
 * Banner查询参数
 */
export interface BannerQueryParams {
  title?: string
  status?: BannerStatus
  creator?: string
  startTime?: string
  endTime?: string
  page?: number
  size?: number
}

/**
 * Banner列表响应
 */
export interface BannerListResponse {
  list: Banner[]
  total: number
}

/**
 * Banner API
 */
export const bannerApi = {
  /**
   * 获取Banner列表
   */
  getBanners: (params?: BannerQueryParams) =>
    request.get<BannerListResponse>('/banner', { params }),

  /**
   * 获取Banner详情
   */
  getBanner: (id: number) =>
    request.get<Banner>(`/banner/${id}`),

  /**
   * 创建Banner（包含审核逻辑）
   */
  createBanner: async (data: BannerForm, submitterId: number, submitterName: string) => {
    // 先保存Banner为草稿状态
    const createResponse = await request.post<Banner>('/banner', {
      ...data,
      status: 'draft'
    })

    const banner = createResponse.data
    
    // 如果配置了立即提交审核
    if (data.auditOptions?.submitForAuditImmediately) {
      try {
        await bannerApi.submitForAudit(banner.id, submitterId, submitterName, data.auditOptions)
      } catch (error) {
        console.warn('创建后立即提交审核失败，banner已创建为草稿状态:', error)
      }
    }
    
    return banner
  },

  /**
   * 更新Banner
   */
  updateBanner: (id: number, data: BannerForm) =>
    request.put<Banner>(`/banner/${id}`, data),

  /**
   * 删除Banner
   */
  deleteBanner: (id: number) =>
    request.delete(`/banner/${id}`),

  /**
   * 提交Banner审核
   */
  submitForAudit: async (bannerId: number, submitterId: number, submitterName: string, auditOptions?: any) => {
    try {
      // 获取Banner详情
      const bannerResponse = await request.get<Banner>(`/banner/${bannerId}`)
      const banner = bannerResponse.data

      // 使用工厂工具方法提交审核
      const taskId = await auditNodeUtils.submitForAudit('banner', {
        bizId: bannerId.toString(),
        content: {
          title: banner.title,
          description: banner.description,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl,
          startTime: banner.startTime,
          endTime: banner.endTime
        },
        submitterId,
        submitterName,
        metadata: {
          bannerType: 'general',
          createdAt: banner.createTime,
          priority: auditOptions?.priority || 'normal',
          ...(auditOptions?.metadata || {})
        }
      })

      // 更新Banner状态为待审核并保存任务ID
      await request.patch(`/banner/${bannerId}/status`, {
        status: 'pending',
        auditTaskId: taskId
      })

      return { taskId, status: 'pending' }
    } catch (error) {
      console.error('提交Banner审核失败:', error)
      throw error
    }
  },

  /**
   * 手动通过Banner审核（管理员操作）
   */
  approveBanner: (id: number, remark?: string) =>
    request.post(`/banner/${id}/approve`, { remark }),

  /**
   * 手动拒绝Banner审核（管理员操作）
   */
  rejectBanner: (id: number, reason: string, detail?: string) =>
    request.post(`/banner/${id}/reject`, { reason, detail }),

  /**
   * 发布Banner
   */
  publishBanner: (id: number) =>
    request.post(`/banner/${id}/publish`),

  /**
   * 下线Banner
   */
  offlineBanner: (id: number) =>
    request.post(`/banner/${id}/offline`),

  /**
   * 获取Banner审核记录
   */
  getAuditRecords: (bannerId: number) =>
    request.get(`/banner/${bannerId}/audit-records`),

  /**
   * 获取Banner审核状态
   */
  getAuditStatus: async (bannerId: number) => {
    const banner = await bannerApi.getBanner(bannerId)
    if (banner.data.auditTaskId) {
      return await auditNodeUtils.getTaskStatus('banner', banner.data.auditTaskId)
    }
    return null
  },

  /**
   * 批量操作Banner
   */
  batchOperation: (data: {
    bannerIds: number[]
    operation: 'approve' | 'reject' | 'publish' | 'offline' | 'delete'
    params?: {
      reason?: string
      detail?: string
    }
  }) =>
    request.post('/banner/batch', data),

  /**
   * 上传Banner图片
   */
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'banner')
    
    return request.post<{ url: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  /**
   * 获取审核节点配置信息
   */
  getAuditNodeInfo: () =>
    request.get<{
      enabled: boolean
      rules: string[]
      priority: 'high' | 'normal' | 'low'
      estimatedTime: string
      description: string
    }>('/banner/audit-node-info'),

  /**
   * 获取智能审批推荐
   */
  getApprovalRecommendation: (bannerData: {
    title?: string
    imageUrl?: string
    linkUrl?: string
    description?: string
  }) =>
    request.post<ApprovalRecommendation>('/banner/approval-recommendation', bannerData),

  /**
   * 获取审批模板列表
   */
  getApprovalTemplates: (keyword?: string) =>
    request.get<ApprovalTemplate[]>('/banner/approval-templates', {
      params: { keyword }
    }),

  /**
   * 获取审批人员列表
   */
  getApprovers: (department?: string) =>
    request.get<Array<{
      id: number
      name: string
      department: string
      role?: string
    }>>('/banner/approvers', {
      params: { department }
    }),

  /**
   * 验证审批配置
   */
  validateApprovalConfig: (config: ApprovalConfig) =>
    request.post<{
      valid: boolean
      errors?: string[]
      warnings?: string[]
      estimatedTime?: string
    }>('/banner/validate-approval-config', config)
}

/**
 * Banner状态工具函数
 */
export const bannerStatusUtils = {
  /**
   * 获取状态显示文本
   */
  getStatusText: (status: BannerStatus): string => {
    const statusMap: Record<BannerStatus, string> = {
      draft: '草稿',
      pending: '待审核',
      reviewing: '审核中',
      approved: '已通过',
      rejected: '已拒绝',
      published: '已发布',
      offline: '已下线'
    }
    return statusMap[status] || status
  },

  /**
   * 获取状态对应的Element Plus标签类型
   */
  getStatusType: (status: BannerStatus) => {
    const statusTypeMap: Record<BannerStatus, string> = {
      draft: '',
      pending: 'warning',
      reviewing: 'info',
      approved: 'success',
      rejected: 'danger',
      published: 'success',
      offline: 'info'
    }
    return statusTypeMap[status] || ''
  },

  /**
   * 判断是否可以提交审核
   */
  canSubmitAudit: (status: BannerStatus): boolean => {
    return ['draft', 'rejected'].includes(status)
  },

  /**
   * 判断是否可以发布
   */
  canPublish: (status: BannerStatus): boolean => {
    return status === 'approved'
  },

  /**
   * 判断是否可以下线
   */
  canOffline: (status: BannerStatus): boolean => {
    return status === 'published'
  },

  /**
   * 判断是否可以编辑
   */
  canEdit: (status: BannerStatus): boolean => {
    return ['draft', 'rejected'].includes(status)
  },

  /**
   * 判断是否可以删除
   */
  canDelete: (status: BannerStatus): boolean => {
    return ['draft', 'rejected', 'offline'].includes(status)
  }
}