import { AuditNode, type AuditNodeConfig, type AuditCheckResult, type AuditCallbackData } from '../auditNode'
import { request } from '../request'

/**
 * 跳蚤市场审核节点
 * 处理跳蚤市场商品的审核流程
 */
export class FleaMarketAuditNode extends AuditNode {
  constructor(config?: Partial<AuditNodeConfig>) {
    const defaultConfig: AuditNodeConfig = {
      bizType: 'flea_goods',
      nodeId: 'flea_market_audit_node',
      nodeName: '跳蚤市场审核节点',
      endpoint: '/flea-market/audit-callback',
      enabled: true,
      retryCount: 3,
      timeout: 30000,
      ruleConfig: {
        maxPrice: 100000, // 最高价格限制
        requiredFields: ['title', 'price', 'description'],
        imageRequired: true,
        fraudDetection: true
      },
      ...config
    }
    super(defaultConfig)
  }

  /**
   * 自定义审核检查逻辑
   */
  protected async customAuditCheck(content: any): Promise<AuditCheckResult> {
    try {
      // 检查必填字段
      const missingFields = this.checkRequiredFields(content)
      if (missingFields.length > 0) {
        return {
          needAudit: false,
          priority: 'low',
          skipReason: `missing_fields:${missingFields.join(',')}`
        }
      }

      // 检查价格合理性
      const priceCheck = await this.checkPriceReasonableness(content)
      if (!priceCheck.reasonable) {
        return {
          needAudit: true,
          priority: 'high' // 价格异常提高优先级
        }
      }

      // 检查商品图片
      if (!content.images || content.images.length === 0) {
        return {
          needAudit: true,
          priority: 'high' // 无图片的商品需要人工审核
        }
      }

      // 检查卖家信誉
      const sellerReputation = await this.getSellerReputation(content.sellerId)
      if (sellerReputation.level === 'low') {
        return {
          needAudit: true,
          priority: 'high'
        }
      }

      // 检查是否可能是诈骗商品
      if (await this.detectFraud(content)) {
        return {
          needAudit: true,
          priority: 'high'
        }
      }

      // 检查商品分类合规性
      if (!await this.validateCategory(content)) {
        return {
          needAudit: true,
          priority: 'normal'
        }
      }

      return {
        needAudit: true,
        priority: sellerReputation.level === 'high' ? 'low' : 'normal'
      }
    } catch (error) {
      console.error('跳蚤市场审核检查失败:', error)
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

      // 获取商品信息
      const taskInfo = await this.getTaskInfo(taskId)
      if (!taskInfo) {
        throw new Error('商品任务信息不存在')
      }

      // 根据审核结果更新商品状态
      switch (status) {
        case 'approved':
        case 'auto_approved':
          await this.publishGoods(taskInfo.bizId, callbackData)
          break
        
        case 'rejected':
        case 'auto_rejected':
          await this.rejectGoods(taskInfo.bizId, reason, detail)
          break
        
        default:
          console.warn('未知的审核状态:', status)
      }

      // 通知卖家
      await this.notifySeller(taskInfo, status, reason)

    } catch (error) {
      console.error('处理跳蚤市场审核结果失败:', error)
      throw error
    }
  }

  /**
   * 更新本地状态
   */
  protected async updateLocalStatus(callbackData: AuditCallbackData): Promise<void> {
    try {
      const { taskId, status } = callbackData
      
      // 更新商品状态缓存
      await this.updateGoodsCache(taskId, status)
      
      // 记录审核历史
      await this.recordAuditHistory(callbackData)
      
      // 更新卖家信誉
      await this.updateSellerReputation(callbackData)
      
      // 更新统计数据
      await this.updateMarketStats(status)
      
    } catch (error) {
      console.error('更新跳蚤市场审核状态失败:', error)
      throw error
    }
  }

  // 私有辅助方法

  /**
   * 检查必填字段
   */
  private checkRequiredFields(content: any): string[] {
    const requiredFields = this.config.ruleConfig?.requiredFields || []
    const missingFields: string[] = []

    requiredFields.forEach(field => {
      if (!content[field] || (typeof content[field] === 'string' && !content[field].trim())) {
        missingFields.push(field)
      }
    })

    return missingFields
  }

  /**
   * 检查价格合理性
   */
  private async checkPriceReasonableness(content: any): Promise<{ reasonable: boolean, reason?: string }> {
    try {
      const price = parseFloat(content.price)
      const maxPrice = this.config.ruleConfig?.maxPrice || 100000

      if (price <= 0) {
        return { reasonable: false, reason: 'price_invalid' }
      }

      if (price > maxPrice) {
        return { reasonable: false, reason: 'price_too_high' }
      }

      // 检查同类商品价格范围
      const priceRange = await this.getCategoryPriceRange(content.categoryId)
      if (priceRange && (price > priceRange.max * 2 || price < priceRange.min * 0.1)) {
        return { reasonable: false, reason: 'price_abnormal' }
      }

      return { reasonable: true }
    } catch (error) {
      console.error('价格合理性检查失败:', error)
      return { reasonable: true } // 出错时默认合理
    }
  }

  /**
   * 获取卖家信誉
   */
  private async getSellerReputation(sellerId: number): Promise<{ level: 'low' | 'normal' | 'high', score: number }> {
    try {
      const response = await request.get(`/flea-market/sellers/${sellerId}/reputation`)
      return response.data
    } catch (error) {
      console.error('获取卖家信誉失败:', error)
      return { level: 'normal', score: 50 }
    }
  }

  /**
   * 诈骗检测
   */
  private async detectFraud(content: any): Promise<boolean> {
    try {
      // 检查价格异常低的高价值商品
      if (this.isSuspiciousLowPrice(content)) {
        return true
      }

      // 检查描述中的可疑关键词
      if (this.containsSuspiciousKeywords(content.description)) {
        return true
      }

      // 检查联系方式是否包含外部链接
      if (this.containsExternalContact(content)) {
        return true
      }

      return false
    } catch (error) {
      console.error('诈骗检测失败:', error)
      return false
    }
  }

  /**
   * 验证商品分类
   */
  private async validateCategory(content: any): Promise<boolean> {
    try {
      const response = await request.get(`/flea-market/categories/${content.categoryId}/validate`, {
        params: { title: content.title, description: content.description }
      })
      return response.data.valid
    } catch (error) {
      console.error('分类验证失败:', error)
      return true
    }
  }

  /**
   * 检查是否为可疑低价
   */
  private isSuspiciousLowPrice(content: any): boolean {
    const suspiciousCategories = ['electronics', 'luxury', 'brand_items']
    const price = parseFloat(content.price)
    
    return suspiciousCategories.includes(content.categoryName) && price < 100
  }

  /**
   * 检查可疑关键词
   */
  private containsSuspiciousKeywords(description: string): boolean {
    const suspiciousWords = ['代购', '海外直邮', '正品保证', '假一赔十', 'VX', '微信']
    return suspiciousWords.some(word => description.includes(word))
  }

  /**
   * 检查外部联系方式
   */
  private containsExternalContact(content: any): boolean {
    const text = `${content.title} ${content.description}`
    const patterns = [
      /QQ[:：]\s*\d{5,}/,
      /微信[:：]\s*[a-zA-Z0-9_-]{6,}/,
      /电话[:：]\s*1[3-9]\d{9}/
    ]
    
    return patterns.some(pattern => pattern.test(text))
  }

  /**
   * 获取分类价格区间
   */
  private async getCategoryPriceRange(categoryId: number): Promise<{ min: number, max: number } | null> {
    try {
      const response = await request.get(`/flea-market/categories/${categoryId}/price-range`)
      return response.data
    } catch (error) {
      return null
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
   * 发布商品
   */
  private async publishGoods(bizId: string, callbackData: AuditCallbackData): Promise<void> {
    try {
      await request.post(`/flea-market/goods/${bizId}/publish`, {
        auditTime: new Date().toISOString(),
        auditorId: callbackData.auditorId,
        processTime: callbackData.processTime
      })
    } catch (error) {
      console.error('商品发布失败:', error)
      throw error
    }
  }

  /**
   * 拒绝商品
   */
  private async rejectGoods(bizId: string, reason?: string, detail?: string): Promise<void> {
    try {
      await request.post(`/flea-market/goods/${bizId}/reject`, {
        reason,
        detail,
        rejectTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('商品拒绝处理失败:', error)
      throw error
    }
  }

  /**
   * 通知卖家
   */
  private async notifySeller(taskInfo: any, status: string, reason?: string): Promise<void> {
    try {
      const message = this.buildNotificationMessage(status, reason)
      
      await request.post('/api/notifications/send', {
        userId: taskInfo.submitterId,
        type: 'goods_audit_result',
        title: '商品审核结果通知',
        content: message,
        bizType: this.config.bizType,
        bizId: taskInfo.bizId
      })
    } catch (error) {
      console.error('通知卖家失败:', error)
    }
  }

  /**
   * 构建通知消息
   */
  private buildNotificationMessage(status: string, reason?: string): string {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return '您的商品已通过审核并成功上架！'
      case 'rejected':
      case 'auto_rejected':
        return `您的商品审核未通过。${reason ? `原因：${reason}` : '请修改后重新提交。'}`
      default:
        return '您的商品审核状态已更新。'
    }
  }

  /**
   * 更新商品缓存
   */
  private async updateGoodsCache(taskId: string, status: string): Promise<void> {
    try {
      await request.post('/api/cache/update-goods-status', {
        taskId,
        status,
        updateTime: new Date().toISOString()
      })
    } catch (error) {
      console.error('更新商品缓存失败:', error)
    }
  }

  /**
   * 记录审核历史
   */
  private async recordAuditHistory(callbackData: AuditCallbackData): Promise<void> {
    try {
      await request.post('/flea-market/audit-history', {
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
   * 更新卖家信誉
   */
  private async updateSellerReputation(callbackData: AuditCallbackData): Promise<void> {
    try {
      const taskInfo = await this.getTaskInfo(callbackData.taskId)
      if (taskInfo) {
        await request.post(`/flea-market/sellers/${taskInfo.submitterId}/update-reputation`, {
          auditResult: callbackData.status,
          reason: callbackData.reason
        })
      }
    } catch (error) {
      console.error('更新卖家信誉失败:', error)
    }
  }

  /**
   * 更新市场统计
   */
  private async updateMarketStats(status: string): Promise<void> {
    try {
      await request.post('/api/statistics/market-audit-result', {
        bizType: this.config.bizType,
        status,
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('更新市场统计失败:', error)
    }
  }
}