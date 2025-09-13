import { request } from './request'
import { auditNodeUtils } from './auditNodeFactory'
import { apiAdapter } from './adapter'
import { banners as staticBanners } from '@/services/staticData/other'
import type { ApiResponse } from '@/types'

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

// 转换静态数据为Banner类型
const convertStaticBannerToBanner = (staticBanner: any): Banner => {
  return {
    id: staticBanner.id,
    title: staticBanner.title,
    imageUrl: staticBanner.image,
    linkUrl: staticBanner.link,
    startTime: staticBanner.startTime,
    endTime: staticBanner.endTime,
    status: 'published', // 静态数据中没有status字段，使用默认值
    creator: '系统管理员', // 静态数据中没有creator字段，使用默认值
    createTime: staticBanner.createTime,
    description: ''
  }
}

/**
 * Banner API
 */
export const bannerApi = {
  /**
   * 获取Banner列表
   */
  getBanners: (params?: BannerQueryParams): Promise<ApiResponse<BannerListResponse>> =>
    apiAdapter.get<BannerListResponse>(
      async () => {
        try {
          const response = await request.get('/banner', { params })
          return response
        } catch (error) {
          // 如果API调用失败，返回错误响应，让apiAdapter处理静态数据
          throw error
        }
      },
      async () => {
        const allBanners = staticBanners.map(convertStaticBannerToBanner)
        return { list: allBanners, total: allBanners.length }
      },
      { mockPagination: true, paginationParams: params }
    ),

  /**
   * 获取Banner详情
   */
  getBanner: (id: number): Promise<ApiResponse<Banner>> =>
    apiAdapter.get<Banner>(
      () => request.get(`/banner/${id}`),
      async () => {
        const allBanners = staticBanners
        const banner = allBanners.find((b: any) => b.id === id)
        if (!banner) {
          throw new Error('Banner不存在')
        }
        // 转换数据结构以匹配Banner接口
        return convertStaticBannerToBanner(banner)
      }
    ),

  /**
   * 创建Banner（包含审核逻辑）
   */
  createBanner: async (data: BannerForm, submitterId: number, submitterName: string): Promise<ApiResponse<Banner>> => {
    return apiAdapter.post<Banner>(
      () => request.post('/banner', {
        ...data,
        status: 'draft'
      }),
      undefined // 不提供mockData，让apiAdapter使用默认处理
    )
  },

  /**
   * 更新Banner
   */
  updateBanner: (id: number, data: BannerForm): Promise<ApiResponse<Banner>> =>
    apiAdapter.put<Banner>(
      () => request.put(`/banner/${id}`, data),
      id,
      undefined // 不提供mockData，让apiAdapter使用默认处理
    ),

  /**
   * 删除Banner
   */
  deleteBanner: (id: number): Promise<ApiResponse<void>> =>
    apiAdapter.action<void>(
      () => request.delete(`/banner/${id}`),
      undefined
    ),

  /**
   * 提交Banner审核
   */
  submitForAudit: async (bannerId: number, submitterId: number, submitterName: string, auditOptions?: any): Promise<ApiResponse<{ taskId: string, status: string }>> => {
    return apiAdapter.post<{ taskId: string, status: string }>(
      async () => {
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

          return {
            code: 200,
            message: '提交成功',
            data: { taskId, status: 'pending' },
            timestamp: Date.now()
          }
        } catch (error) {
          console.error('提交Banner审核失败:', error)
          throw error
        }
      },
      undefined // 不提供mockData，让apiAdapter使用默认处理
    )
  },

  /**
   * 手动通过Banner审核（管理员操作）
   */
  approveBanner: (id: number, remark?: string): Promise<ApiResponse<void>> =>
    apiAdapter.action<void>(
      () => request.post(`/banner/${id}/approve`, { remark }),
      undefined
    ),

  /**
   * 手动拒绝Banner审核（管理员操作）
   */
  rejectBanner: (id: number, reason: string, detail?: string): Promise<ApiResponse<void>> =>
    apiAdapter.action<void>(
      () => request.post(`/banner/${id}/reject`, { reason, detail }),
      undefined
    ),

  /**
   * 发布Banner
   */
  publishBanner: (id: number): Promise<ApiResponse<void>> =>
    apiAdapter.action<void>(
      () => request.post(`/banner/${id}/publish`),
      undefined
    ),

  /**
   * 下线Banner
   */
  offlineBanner: (id: number): Promise<ApiResponse<void>> =>
    apiAdapter.action<void>(
      () => request.post(`/banner/${id}/offline`),
      undefined
    ),

  /**
   * 获取Banner审核记录
   */
  getAuditRecords: (bannerId: number): Promise<ApiResponse<any[]>> =>
    apiAdapter.get<any[]>(
      () => request.get(`/banner/${bannerId}/audit-records`),
      async () => [
        {
          id: 1,
          action: 'submit',
          operator: '系统管理员',
          remark: '提交审核',
          createTime: new Date().toISOString()
        }
      ]
    ),

  /**
   * 获取Banner审核状态
   */
  getAuditStatus: async (bannerId: number): Promise<ApiResponse<any>> => {
    return apiAdapter.get<any>(
      async () => {
        const bannerResponse = await bannerApi.getBanner(bannerId)
        if (bannerResponse.data.auditTaskId) {
          const status = await auditNodeUtils.getTaskStatus('banner', bannerResponse.data.auditTaskId)
          return {
            code: 200,
            message: '获取成功',
            data: status,
            timestamp: Date.now()
          }
        }
        return {
          code: 200,
          message: '获取成功',
          data: null,
          timestamp: Date.now()
        }
      },
      async () => ({ status: 'pending', progress: 50 })
    )
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
  }): Promise<ApiResponse<{ successCount: number, failCount: number }>> =>
    apiAdapter.post<{ successCount: number, failCount: number }>(
      () => request.post('/banner/batch', data),
      undefined // 不提供mockData，让apiAdapter使用默认处理
    ),

  /**
   * 上传Banner图片
   */
  uploadImage: (file: File): Promise<ApiResponse<{ url: string }>> =>
    apiAdapter.post<{ url: string }>(
      () => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'banner')
        
        return request.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      },
      undefined // 不提供mockData，让apiAdapter使用默认处理
    ),

  /**
   * 获取审核节点配置信息
   */
  getAuditNodeInfo: (): Promise<ApiResponse<{
    enabled: boolean
    rules: string[]
    priority: 'high' | 'normal' | 'low'
    estimatedTime: string
    description: string
  }>> =>
    apiAdapter.get<{
    enabled: boolean
    rules: string[]
    priority: 'high' | 'normal' | 'low'
    estimatedTime: string
    description: string
  }>(
      () => request.get('/banner/audit-node-info'),
      async () => ({
        enabled: true,
        rules: ['内容审核', '链接安全检查', '图片质量检查'],
        priority: 'normal',
        estimatedTime: '2-4小时',
        description: 'Banner内容审核流程'
      })
    ),

  /**
   * 获取智能审批推荐
   */
  getApprovalRecommendation: (bannerData: {
    title?: string
    imageUrl?: string
    linkUrl?: string
    description?: string
  }): Promise<ApiResponse<ApprovalRecommendation>> =>
    apiAdapter.post<ApprovalRecommendation>(
      () => request.post('/banner/approval-recommendation', bannerData),
      undefined // 不提供mockData，让apiAdapter使用默认处理
    ),

  /**
   * 获取审批模板列表
   */
  getApprovalTemplates: (keyword?: string): Promise<ApiResponse<ApprovalTemplate[]>> =>
    apiAdapter.get<ApprovalTemplate[]>(
      () => request.get('/banner/approval-templates', {
        params: { keyword }
      }),
      async () => [
        {
          id: 1,
          name: '标准审批流程',
          description: '适用于常规Banner审批',
          recommended: true,
          avgProcessTime: '3小时',
          stepCount: 2,
          successRate: 95,
          steps: [
            { name: '内容审核', approver: '内容审核员', timeLimit: '2小时' },
            { name: '最终审批', approver: '主管', timeLimit: '1小时' }
          ]
        }
      ]
    ),

  /**
   * 获取审批人员列表
   */
  getApprovers: (department?: string): Promise<ApiResponse<Array<{
    id: number
    name: string
    department: string
    role?: string
  }>>> =>
    apiAdapter.get<Array<{
    id: number
    name: string
    department: string
    role?: string
  }>>(
      () => request.get('/banner/approvers', {
        params: { department }
      }),
      async () => [
        { id: 1, name: '张三', department: '内容部', role: '审核员' },
        { id: 2, name: '李四', department: '运营部', role: '主管' }
      ]
    ),

  /**
   * 验证审批配置
   */
  validateApprovalConfig: (config: ApprovalConfig): Promise<ApiResponse<{
    valid: boolean
    errors?: string[]
    warnings?: string[]
    estimatedTime?: string
  }>> =>
    apiAdapter.post<{
    valid: boolean
    errors?: string[]
    warnings?: string[]
    estimatedTime?: string
  }>(
      () => request.post('/banner/validate-approval-config', config),
      undefined // 不提供mockData，让apiAdapter使用默认处理
    )
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