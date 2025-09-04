import { AuditNode, type AuditNodeConfig, type AuditCheckResult, type AuditCallbackData } from '../auditNode'
import { request } from '../request'

/**
 * 内容管理审核节点
 * 处理论坛帖子、文章等内容的审核流程
 */
export class ContentAuditNode extends AuditNode {
  constructor(config?: Partial<AuditNodeConfig>) {
    const defaultConfig: AuditNodeConfig = {
      bizType: 'forum_post',
      nodeId: 'content_audit_node',
      nodeName: '内容审核节点',
      endpoint: '/api/content/audit-callback',
      enabled: true,
      retryCount: 3,
      timeout: 30000,
      ...config
    }
    super(defaultConfig)
  }

  /**
   * 自定义审核检查逻辑
   */
  protected async customAuditCheck(content: any): Promise<AuditCheckResult> {
    try {
      // 检查内容长度
      if (content.content && content.content.length < 10) {
        return {
          needAudit: false,
          priority: 'low',
          skipReason: 'content_too_short'
        }
      }

      // 检查是否为重复内容
      if (await this.isDuplicateContent(content)) {
        return {
          needAudit: true,
          priority: 'high' // 重复内容提高优先级
        }
      }

      // 检查用户历史记录
      const userRiskLevel = await this.getUserRiskLevel(content.authorId)
      if (userRiskLevel === 'high') {
        return {
          needAudit: true,
          priority: 'high'
        }
      }

      // 检查内容复杂度
      const complexity = this.analyzeContentComplexity(content)
      if (complexity.hasImages || complexity.hasLinks || complexity.isLong) {
        return {
          needAudit: true,
          priority: complexity.hasLinks ? 'high' : 'normal'
        }
      }

      return {
        needAudit: true,
        priority: 'normal'
      }
    } catch (error) {
      console.error('内容审核检查失败:', error)
      // 出错时默认需要审核
      return {
        needAudit: true,
        priority: 'normal'
      }
    }
  }

  /**
   * 处理审核结果
   */
  protected async processAuditResult(callbackData: AuditCallbackData): Promise<void> {
    try {
      const { taskId, status, reason, detail } = callbackData

      // 获取原始业务数据
      const taskInfo = await this.getTaskInfo(taskId)
      if (!taskInfo) {
        throw new Error('任务信息不存在')
      }

      // 根据审核结果更新内容状态
      switch (status) {
        case 'approved':
        case 'auto_approved':
          await this.approveContent(taskInfo.bizId, callbackData)
          break
        
        case 'rejected':
        case 'auto_rejected':
          await this.rejectContent(taskInfo.bizId, reason, detail)
          break
        
        default:
          console.warn('未知的审核状态:', status)
      }

      // 通知内容作者
      await this.notifyAuthor(taskInfo, status, reason)

    } catch (error) {
      console.error('处理内容审核结果失败:', error)
      throw error
    }
  }

  /**
   * 更新本地状态
   */
  protected async updateLocalStatus(callbackData: AuditCallbackData): Promise<void> {
    try {
      const { taskId, status } = callbackData
      
      // 更新本地缓存状态
      await this.updateContentCache(taskId, status)
      
      // 记录审核历史
      await this.recordAuditHistory(callbackData)
      
      // 更新统计数据
      await this.updateAuditStats(status)
      
    } catch (error) {
      console.error('更新内容审核状态失败:', error)
      throw error
    }
  }

  // 私有辅助方法

  /**
   * 检查是否为重复内容
   */
  private async isDuplicateContent(content: any): Promise<boolean> {
    try {
      const response = await request.post('/api/content/check-duplicate', {
        title: content.title,
        content: content.content,
        authorId: content.authorId
      })
      return response.data.isDuplicate
    } catch (error) {
      console.error('重复内容检查失败:', error)
      return false
    }
  }

  /**
   * 获取用户风险等级
   */
  private async getUserRiskLevel(userId: number): Promise<'low' | 'normal' | 'high'> {
    try {
      const response = await request.get(`/api/users/${userId}/risk-level`)
      return response.data.riskLevel
    } catch (error) {
      console.error('获取用户风险等级失败:', error)
      return 'normal'
    }
  }

  /**
   * 分析内容复杂度
   */
  private analyzeContentComplexity(content: any): {
    hasImages: boolean
    hasLinks: boolean
    isLong: boolean
  } {
    const contentStr = content.content || ''
    
    return {
      hasImages: /\[img\]|\!\[.*?\]\(.*?\)|<img/i.test(contentStr),
      hasLinks: /https?:\/\/|www\.|\.com|\.cn/i.test(contentStr),
      isLong: contentStr.length > 1000
    }
  }

  /**
   * 获取任务信息
   */
  private async getTaskInfo(taskId: string): Promise<any> {
    try {
      const response = await request.get(`/audit/tasks/${taskId}`)
      return response.data
    } catch (error) {
      console.error('获取任务信息失败:', error)
      return null
    }
  }

  /**
   * 通过审核，发布内容
   */
  private async approveContent(bizId: string, callbackData: AuditCallbackData): Promise<void> {
    try {
      await request.post(`/api/content/${bizId}/approve`, {
        auditTime: new Date().toISOString(),
        auditorId: callbackData.auditorId,
        processTime: callbackData.processTime
      })
    } catch (error) {
      console.error('内容审核通过处理失败:', error)
      throw error
    }
  }

  /**
   * 拒绝审核，设置内容状态
   */
  private async rejectContent(bizId: string, reason?: string, detail?: string): Promise<void> {
    try {
      await request.post(`/api/content/${bizId}/reject`, {
        reason,
        detail,
        rejectTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('内容审核拒绝处理失败:', error)
      throw error
    }
  }

  /**
   * 通知内容作者
   */
  private async notifyAuthor(taskInfo: any, status: string, reason?: string): Promise<void> {
    try {
      const message = this.buildNotificationMessage(status, reason)
      
      await request.post('/api/notifications/send', {
        userId: taskInfo.submitterId,
        type: 'audit_result',
        title: '内容审核结果通知',
        content: message,
        bizType: this.config.bizType,
        bizId: taskInfo.bizId
      })
    } catch (error) {
      console.error('通知作者失败:', error)
      // 通知失败不影响主流程
    }
  }

  /**
   * 构建通知消息
   */
  private buildNotificationMessage(status: string, reason?: string): string {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return '您的内容已通过审核并成功发布！'
      case 'rejected':
      case 'auto_rejected':
        return `您的内容审核未通过。${reason ? `原因：${reason}` : '请重新编辑后再次提交。'}`
      default:
        return '您的内容审核状态已更新。'
    }
  }

  /**
   * 更新内容缓存
   */
  private async updateContentCache(taskId: string, status: string): Promise<void> {
    try {
      // 这里可以更新Redis缓存或其他缓存系统
      // 暂时用API调用代替
      await request.post('/api/cache/update-content-status', {
        taskId,
        status,
        updateTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('更新内容缓存失败:', error)
    }
  }

  /**
   * 记录审核历史
   */
  private async recordAuditHistory(callbackData: AuditCallbackData): Promise<void> {
    try {
      await request.post('/api/content/audit-history', {
        taskId: callbackData.taskId,
        status: callbackData.status,
        reason: callbackData.reason,
        detail: callbackData.detail,
        auditorId: callbackData.auditorId,
        processTime: callbackData.processTime,
        nodeId: this.config.nodeId,
        createTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('记录审核历史失败:', error)
    }
  }

  /**
   * 更新审核统计
   */
  private async updateAuditStats(status: string): Promise<void> {
    try {
      await request.post('/api/statistics/audit-result', {
        bizType: this.config.bizType,
        status,
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('更新审核统计失败:', error)
    }
  }
}