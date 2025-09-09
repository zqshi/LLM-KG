import { request } from './request'
import type { BizType, AuditPolicy } from '@/types'

/**
 * 审核节点配置接口
 */
export interface AuditNodeConfig {
  bizType: BizType
  nodeId: string
  nodeName: string
  endpoint: string
  enabled: boolean
  retryCount?: number
  timeout?: number
  ruleConfig?: Record<string, any>
}

/**
 * 审核任务提交数据
 */
export interface AuditTaskSubmission {
  bizType: BizType
  bizId: string
  content: any
  submitterId: number
  submitterName: string
  metadata?: Record<string, any>
}

/**
 * 审核结果回调数据
 */
export interface AuditCallbackData {
  taskId: string
  status: 'approved' | 'rejected' | 'auto_approved' | 'auto_rejected'
  reason?: string
  detail?: string
  auditorId?: number
  processTime: number
}

/**
 * 审核节点检查结果
 */
export interface AuditCheckResult {
  needAudit: boolean
  policy?: AuditPolicy
  priority: 'high' | 'normal' | 'low'
  skipReason?: string
}

/**
 * 审核节点基类
 * 提供业务模块接入审核中心的标准接口
 */
export abstract class AuditNode {
  protected config: AuditNodeConfig
  protected policy: AuditPolicy | null = null

  constructor(config: AuditNodeConfig) {
    this.config = config
  }

  /**
   * 初始化节点，加载审核策略
   */
  async initialize(): Promise<void> {
    try {
      this.policy = await this.loadAuditPolicy()
    } catch (error) {
      console.error(`审核节点${this.config.nodeId}初始化失败:`, error)
      throw error
    }
  }

  /**
   * 检查内容是否需要审核
   */
  async checkAuditRequired(content: any): Promise<AuditCheckResult> {
    if (!this.config.enabled) {
      return {
        needAudit: false,
        skipReason: 'audit_disabled'
      } as AuditCheckResult
    }

    if (!this.policy || !this.policy.isActive) {
      return {
        needAudit: false,
        skipReason: 'no_active_policy'
      } as AuditCheckResult
    }

    // 抽审模式检查
    if (this.policy.mode === 'sample' && this.policy.sampleRate) {
      const shouldSample = Math.random() * 100 < this.policy.sampleRate
      if (!shouldSample) {
        return {
          needAudit: false,
          priority: this.policy.priority,
          skipReason: 'sample_skip'
        }
      }
    }

    // 自定义业务逻辑检查
    const customCheck = await this.customAuditCheck(content)
    if (!customCheck.needAudit) {
      return customCheck
    }

    return {
      needAudit: true,
      policy: this.policy,
      priority: this.policy.priority
    }
  }

  /**
   * 提交审核任务
   */
  async submitAuditTask(submission: AuditTaskSubmission): Promise<string> {
    try {
      // 检查是否需要审核
      const checkResult = await this.checkAuditRequired(submission.content)
      
      if (!checkResult.needAudit) {
        // 不需要审核，直接返回auto_approved状态
        await this.handleAutoApproval(submission, checkResult.skipReason || '')
        return 'auto_approved'
      }

      // 预处理内容（敏感词检查等）
      const processedContent = await this.preprocessContent(submission.content)

      // 创建审核任务
      const taskData = {
        ...submission,
        content: processedContent,
        priority: checkResult.priority,
        policyId: checkResult.policy?.id
      }

      const response = await request.post<{ taskId: string }>('/audit/tasks/submit', taskData)
      
      // 记录任务提交日志
      await this.logTaskSubmission(response.data.taskId, submission)
      
      return response.data.taskId
    } catch (error) {
      console.error('提交审核任务失败:', error)
      throw error
    }
  }

  /**
   * 注册审核结果回调
   */
  async registerCallback(taskId: string, callbackUrl?: string): Promise<void> {
    const url = callbackUrl || this.config.endpoint
    
    try {
      await request.post('/audit/tasks/register-callback', {
        taskId,
        callbackUrl: url,
        nodeId: this.config.nodeId
      })
    } catch (error) {
      console.error('注册回调失败:', error)
      throw error
    }
  }

  /**
   * 处理审核结果回调
   */
  async handleAuditResult(callbackData: AuditCallbackData): Promise<void> {
    try {
      // 验证回调数据
      if (!this.validateCallbackData(callbackData)) {
        throw new Error('无效的回调数据')
      }

      // 业务特定的结果处理
      await this.processAuditResult(callbackData)

      // 更新本地状态
      await this.updateLocalStatus(callbackData)

    } catch (error) {
      console.error('处理审核结果失败:', error)
      throw error
    }
  }

  /**
   * 获取审核任务状态
   */
  async getTaskStatus(taskId: string): Promise<any> {
    try {
      const response = await request.get(`/audit/tasks/${taskId}/status`)
      return response.data
    } catch (error) {
      console.error('获取任务状态失败:', error)
      throw error
    }
  }

  // 抽象方法，由具体业务节点实现

  /**
   * 自定义审核检查逻辑
   */
  protected abstract customAuditCheck(content: any): Promise<AuditCheckResult>

  /**
   * 处理审核结果的业务逻辑
   */
  protected abstract processAuditResult(callbackData: AuditCallbackData): Promise<void>

  /**
   * 更新本地业务状态
   */
  protected abstract updateLocalStatus(callbackData: AuditCallbackData): Promise<void>

  // 私有辅助方法

  private async loadAuditPolicy(): Promise<AuditPolicy | null> {
      try {
        // 移除URL中的/api前缀，因为request库的baseURL已经包含了/api
        const url = `/audit/policies/by-biztype/${this.config.bizType}`
        console.log(`🔍 请求审核策略URL: ${url}`)
        console.log(`🔍 完整请求URL: ${request.defaults.baseURL}${url}`)
        const response = await request.get(url)
        console.log(`✅ 审核策略请求成功，响应数据:`, response.data)
        // 从响应中正确提取审核策略数据
        return response.data?.policies?.[0] || null
      } catch (error) {
        console.error('加载审核策略失败:', error)
        console.error('❌ 错误详情:', error.response || error.message)
        return null
      }
    }

  private async preprocessContent(content: any): Promise<any> {
    if (!this.policy || !this.policy.ruleConfig?.sensitiveWordCheck) {
      return content
    }

    try {
      // 检查敏感词
      const response = await request.post('/audit/sensitive-words/check', { content: JSON.stringify(content) })
      const { hits } = response.data

      if (hits && hits.length > 0) {
        // 根据敏感词策略处理内容
        return this.processSensitiveWords(content, hits)
      }

      return content
    } catch (error) {
      console.error('敏感词检查失败:', error)
      return content
    }
  }

  private processSensitiveWords(content: any, hits: any[]): any {
    let processedContent = { ...content }
    
    hits.forEach(hit => {
      if (hit.action === 'replace' && hit.replaceWith) {
        const contentStr = JSON.stringify(processedContent)
        const replacedStr = contentStr.replace(new RegExp(hit.word, 'g'), hit.replaceWith)
        processedContent = JSON.parse(replacedStr)
      }
    })

    return {
      ...processedContent,
      _sensitiveWords: hits
    }
  }

  private async handleAutoApproval(submission: AuditTaskSubmission, reason: string): Promise<void> {
    // 记录自动通过日志
    await this.logAutoApproval(submission, reason)
  }

  private async logTaskSubmission(taskId: string, submission: AuditTaskSubmission): Promise<void> {
    try {
      await request.post('/audit/logs/task-submission', {
        taskId,
        nodeId: this.config.nodeId,
        bizType: submission.bizType,
        bizId: submission.bizId,
        submitterId: submission.submitterId
      })
    } catch (error) {
      console.error('记录任务提交日志失败:', error)
    }
  }

  private async logAutoApproval(submission: AuditTaskSubmission, reason: string): Promise<void> {
    try {
      await request.post('/audit/logs/auto-approval', {
        nodeId: this.config.nodeId,
        bizType: submission.bizType,
        bizId: submission.bizId,
        reason
      })
    } catch (error) {
      console.error('记录自动通过日志失败:', error)
    }
  }

  private validateCallbackData(data: AuditCallbackData): boolean {
    return !!(data.taskId && data.status && data.processTime !== undefined)
  }
}

/**
 * 审核节点管理器
 */
export class AuditNodeManager {
  private nodes: Map<string, AuditNode> = new Map()

  /**
   * 注册审核节点
   */
  registerNode(node: AuditNode): void {
    this.nodes.set(node['config'].nodeId, node)
  }

  /**
   * 获取审核节点
   */
  getNode(nodeId: string): AuditNode | undefined {
    return this.nodes.get(nodeId)
  }

  /**
   * 初始化所有节点
   */
  async initializeAll(): Promise<void> {
    const promises = Array.from(this.nodes.values()).map(node => node.initialize())
    await Promise.all(promises)
  }

  /**
   * 根据业务类型获取节点
   */
  getNodeByBizType(bizType: BizType): AuditNode | undefined {
    for (const node of this.nodes.values()) {
      if (node['config'].bizType === bizType) {
        return node
      }
    }
    return undefined
  }
}

// 全局审核节点管理器实例
export const auditNodeManager = new AuditNodeManager()