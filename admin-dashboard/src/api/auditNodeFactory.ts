import { auditNodeManager, type AuditNodeConfig } from './auditNode'
import { ContentAuditNode } from './nodes/contentAuditNode'
import { FleaMarketAuditNode } from './nodes/fleaMarketAuditNode'
import { request } from './request'
import type { BizType } from '@/types'
import type { AuditCallbackData } from './auditNode'

/**
 * Banner审核节点配置
 */
class BannerAuditNode extends ContentAuditNode {
  constructor() {
    super({
      bizType: 'banner',
      nodeId: 'banner_audit_node',
      nodeName: 'Banner审核节点',
      endpoint: '/api/banner/audit-callback',
      ruleConfig: {
        imageRequired: true,
        dimensionCheck: true,
        brandCheck: true,
        legalCompliance: true
      }
    })
  }

  /**
   * 重写处理审核结果方法，使用banner专用的API路径
   */
  protected async processAuditResult(callbackData: AuditCallbackData): Promise<void> {
    try {
      const { taskId, status, reason, detail } = callbackData

      // 获取原始业务数据
      const taskInfo = await this.getTaskInfo(taskId)
      if (!taskInfo) {
        throw new Error('任务信息不存在')
      }

      // 根据审核结果更新Banner状态
      switch (status) {
        case 'approved':
        case 'auto_approved':
          await this.approveBanner(taskInfo.bizId, callbackData)
          break
        
        case 'rejected':
        case 'auto_rejected':
          await this.rejectBanner(taskInfo.bizId, reason, detail)
          break
        
        default:
          console.warn('未知的审核状态:', status)
      }

      // 通知Banner创建者
      await this.notifyAuthor(taskInfo, status, reason)

    } catch (error) {
      console.error('处理Banner审核结果失败:', error)
      throw error
    }
  }

  /**
   * 通过Banner审核，更新状态为已审核
   */
  private async approveBanner(bizId: string, callbackData: AuditCallbackData): Promise<void> {
    try {
      await request.post(`/api/banner/${bizId}/approve`, {
        auditTime: new Date().toISOString(),
        auditorId: callbackData.auditorId,
        processTime: callbackData.processTime
      })
    } catch (error) {
      console.error('Banner审核通过处理失败:', error)
      throw error
    }
  }

  /**
   * 拒绝Banner审核，设置拒绝状态和原因
   */
  private async rejectBanner(bizId: string, reason?: string, detail?: string): Promise<void> {
    try {
      await request.post(`/api/banner/${bizId}/reject`, {
        reason,
        detail,
        rejectTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('Banner审核拒绝处理失败:', error)
      throw error
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
   * 通知Banner创建者
   */
  private async notifyAuthor(taskInfo: any, status: string, reason?: string): Promise<void> {
    try {
      const message = this.buildNotificationMessage(status, reason)
      
      await request.post('/api/notifications/send', {
        userId: taskInfo.submitterId,
        type: 'audit_result',
        title: 'Banner审核结果通知',
        content: message,
        bizType: this.config.bizType,
        bizId: taskInfo.bizId
      })
    } catch (error) {
      console.error('通知Banner创建者失败:', error)
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
        return '您的Banner已通过审核，可以进行发布！'
      case 'rejected':
      case 'auto_rejected':
        return `您的Banner审核未通过。${reason ? `原因：${reason}` : '请修改后重新提交审核。'}`
      default:
        return '您的Banner审核状态已更新。'
    }
  }
}

/**
 * 资讯审核节点配置
 */
class NewsAuditNode extends ContentAuditNode {
  constructor() {
    super({
      bizType: 'news',
      nodeId: 'news_audit_node',
      nodeName: '资讯审核节点',
      endpoint: '/api/news/audit-callback',
      ruleConfig: {
        titleRequired: true,
        sourceRequired: true,
        duplicateCheck: true,
        factCheck: {
          enabled: true,
          threshold: 0.8
        }
      }
    })
  }
}

/**
 * 名言审核节点配置
 */
class QuotationAuditNode extends ContentAuditNode {
  constructor() {
    super({
      bizType: 'quotation',
      nodeId: 'quotation_audit_node',
      nodeName: '名言审核节点',
      endpoint: '/api/quotation/audit-callback',
      ruleConfig: {
        leaderRequired: true,
        occasionRequired: true,
        authenticityCheck: true,
        politicalSensitivity: {
          enabled: true,
          level: 'high'
        }
      }
    })
  }
}

/**
 * 审核节点工厂类
 * 统一管理所有审核节点的创建和配置
 */
export class AuditNodeFactory {
  
  /**
   * 创建审核节点
   */
  static createNode(bizType: BizType, config?: Partial<AuditNodeConfig>) {
    switch (bizType) {
      case 'forum_post':
        return new ContentAuditNode(config)
      
      case 'flea_goods':
        return new FleaMarketAuditNode(config)
      
      case 'banner':
        return new BannerAuditNode()
      
      case 'news':
        return new NewsAuditNode()
      
      case 'quotation':
        return new QuotationAuditNode()
      
      default:
        throw new Error(`不支持的业务类型: ${bizType}`)
    }
  }

  /**
   * 批量创建节点
   */
  static createNodes(configs: Array<{ bizType: BizType, config?: Partial<AuditNodeConfig> }>) {
    return configs.map(({ bizType, config }) => this.createNode(bizType, config))
  }

  /**
   * 初始化所有审核节点
   */
  static async initializeAllNodes(): Promise<void> {
    try {
      // 创建所有业务类型的审核节点
      const nodeConfigs = [
        { bizType: 'forum_post' as BizType },
        { bizType: 'flea_goods' as BizType },
        { bizType: 'banner' as BizType },
        { bizType: 'news' as BizType },
        { bizType: 'quotation' as BizType }
      ]

      const nodes = this.createNodes(nodeConfigs)
      
      // 注册所有节点到管理器
      nodes.forEach(node => {
        auditNodeManager.registerNode(node)
      })

      // 初始化所有节点
      await auditNodeManager.initializeAll()
      
      console.log('所有审核节点初始化完成')
    } catch (error) {
      console.error('审核节点初始化失败:', error)
      throw error
    }
  }

  /**
   * 获取节点实例
   */
  static getNode(bizType: BizType) {
    return auditNodeManager.getNodeByBizType(bizType)
  }

  /**
   * 获取所有已注册的节点
   */
  static getAllNodes() {
    return auditNodeManager
  }
}

/**
 * 审核节点工具类
 * 提供便捷的审核操作方法
 */
export class AuditNodeUtils {
  
  /**
   * 提交审核任务的便捷方法
   */
  static async submitForAudit(
    bizType: BizType,
    data: {
      bizId: string
      content: any
      submitterId: number
      submitterName: string
      metadata?: Record<string, any>
    }
  ): Promise<string> {
    const node = AuditNodeFactory.getNode(bizType)
    if (!node) {
      throw new Error(`未找到${bizType}类型的审核节点`)
    }

    return await node.submitAuditTask(data)
  }

  /**
   * 检查是否需要审核
   */
  static async checkAuditRequired(bizType: BizType, content: any) {
    const node = AuditNodeFactory.getNode(bizType)
    if (!node) {
      throw new Error(`未找到${bizType}类型的审核节点`)
    }

    return await node.checkAuditRequired(content)
  }

  /**
   * 处理审核结果回调
   */
  static async handleAuditCallback(bizType: BizType, callbackData: any) {
    const node = AuditNodeFactory.getNode(bizType)
    if (!node) {
      throw new Error(`未找到${bizType}类型的审核节点`)
    }

    return await node.handleAuditResult(callbackData)
  }

  /**
   * 获取任务状态
   */
  static async getTaskStatus(bizType: BizType, taskId: string) {
    const node = AuditNodeFactory.getNode(bizType)
    if (!node) {
      throw new Error(`未找到${bizType}类型的审核节点`)
    }

    return await node.getTaskStatus(taskId)
  }

  /**
   * 批量处理审核任务
   */
  static async batchSubmitForAudit(
    submissions: Array<{
      bizType: BizType
      bizId: string
      content: any
      submitterId: number
      submitterName: string
      metadata?: Record<string, any>
    }>
  ): Promise<Array<{ bizType: BizType, bizId: string, taskId: string }>> {
    const results = []
    
    for (const submission of submissions) {
      try {
        const taskId = await this.submitForAudit(submission.bizType, submission)
        results.push({
          bizType: submission.bizType,
          bizId: submission.bizId,
          taskId
        })
      } catch (error) {
        console.error(`批量提交审核失败 - ${submission.bizType}:${submission.bizId}`, error)
        results.push({
          bizType: submission.bizType,
          bizId: submission.bizId,
          taskId: 'error'
        })
      }
    }
    
    return results
  }
}

/**
 * 审核节点状态监控
 */
export class AuditNodeMonitor {
  
  /**
   * 检查所有节点健康状态
   */
  static async checkNodesHealth(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {}
    
    try {
      const manager = AuditNodeFactory.getAllNodes()
      
      // 这里应该实现具体的健康检查逻辑
      // 比如检查节点是否能正常响应API调用
      
      healthStatus.content_audit_node = true
      healthStatus.flea_market_audit_node = true
      healthStatus.banner_audit_node = true
      healthStatus.news_audit_node = true
      healthStatus.quotation_audit_node = true
      
    } catch (error) {
      console.error('节点健康检查失败:', error)
    }
    
    return healthStatus
  }

  /**
   * 获取节点性能统计
   */
  static async getNodesPerformance(): Promise<Record<string, any>> {
    try {
      // 这里应该实现获取各个节点性能数据的逻辑
      // 比如响应时间、成功率、处理量等
      
      return {
        content_audit_node: {
          avgResponseTime: 120,
          successRate: 99.5,
          dailyTasks: 1500
        },
        flea_market_audit_node: {
          avgResponseTime: 150,
          successRate: 98.8,
          dailyTasks: 800
        },
        banner_audit_node: {
          avgResponseTime: 200,
          successRate: 99.2,
          dailyTasks: 50
        },
        news_audit_node: {
          avgResponseTime: 180,
          successRate: 99.1,
          dailyTasks: 300
        },
        quotation_audit_node: {
          avgResponseTime: 160,
          successRate: 99.8,
          dailyTasks: 20
        }
      }
    } catch (error) {
      console.error('获取节点性能统计失败:', error)
      return {}
    }
  }
}

// 导出单例实例，方便使用
export const auditNodeFactory = AuditNodeFactory
export const auditNodeUtils = AuditNodeUtils
export const auditNodeMonitor = AuditNodeMonitor