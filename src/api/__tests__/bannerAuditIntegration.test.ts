import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuditNodeFactory, auditNodeUtils } from '../auditNodeFactory'

// Mock API请求
vi.mock('../request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Banner审核节点集成测试', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // 手动初始化审核节点
    try {
      await AuditNodeFactory.initializeAllNodes()
    } catch (error) {
      // 忽略初始化错误，因为是mock环境
    }
  })

  describe('Banner审核节点创建', () => {
    it('应该能够创建Banner审核节点', () => {
      const bannerNode = AuditNodeFactory.createNode('banner')
      
      expect(bannerNode).toBeDefined()
      expect(bannerNode['config'].bizType).toBe('banner')
      expect(bannerNode['config'].nodeId).toBe('banner_audit_node')
      expect(bannerNode['config'].nodeName).toBe('Banner审核节点')
    })

    it('应该能够获取Banner审核节点', () => {
      const bannerNode = AuditNodeFactory.getNode('banner')
      
      expect(bannerNode).toBeDefined()
      expect(bannerNode['config'].bizType).toBe('banner')
    })
  })

  describe('Banner审核策略检查', () => {
    it('应该能够检查Banner是否需要审核', async () => {
      const { request } = await import('../request')
      
      // Mock审核策略
      request.get.mockResolvedValueOnce({
        data: {
          id: 2,
          name: 'Banner内容审核策略',
          bizType: 'banner',
          mode: 'pre',
          priority: 'normal',
          isActive: true,
          ruleConfig: {
            sensitiveWordCheck: true,
            imageContentCheck: true,
            linkSafetyCheck: true,
            timeValidityCheck: true
          }
        }
      })

      // Mock敏感词检查
      request.post.mockResolvedValueOnce({
        data: { hits: [] }
      })

      const result = await auditNodeUtils.checkAuditRequired('banner', {
        title: '测试Banner',
        description: '测试描述',
        imageUrl: 'https://example.com/test.jpg',
        linkUrl: 'https://example.com/test',
        startTime: '2024-04-01 00:00:00',
        endTime: '2024-04-30 23:59:59'
      })

      expect(result).toBeDefined()
      expect(typeof result.needAudit).toBe('boolean')
    })
  })

  describe('Banner审核任务提交', () => {
    it('应该能够提交Banner审核任务', async () => {
      const { request } = await import('../request')
      
      const bannerData = {
        bizId: '1',
        content: {
          title: '测试Banner',
          description: '测试描述',
          imageUrl: 'https://example.com/test.jpg',
          linkUrl: 'https://example.com/test',
          startTime: '2024-04-01 00:00:00',
          endTime: '2024-04-30 23:59:59'
        },
        submitterId: 1001,
        submitterName: '测试用户',
        metadata: {
          bannerType: 'general',
          createdAt: new Date().toISOString()
        }
      }

      // Mock策略检查
      request.get.mockResolvedValueOnce({
        data: {
          id: 2,
          bizType: 'banner',
          mode: 'pre',
          priority: 'normal',
          isActive: true
        }
      })

      // Mock敏感词检查
      request.post.mockResolvedValueOnce({
        data: { hits: [] }
      })

      // Mock任务提交
      request.post.mockResolvedValueOnce({
        data: { taskId: 'audit-banner-123' }
      })

      // Mock回调注册
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: '回调注册成功' }
      })

      // Mock任务日志记录
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: '日志记录成功' }
      })

      const taskId = await auditNodeUtils.submitForAudit('banner', bannerData)

      expect(taskId).toBe('audit-banner-123')
      expect(request.post).toHaveBeenCalledWith(
        expect.stringContaining('/audit/tasks/submit'),
        expect.objectContaining({
          bizType: 'banner',
          bizId: '1',
          content: bannerData.content,
          submitterId: 1001,
          submitterName: '测试用户'
        })
      )
    })

    it('应该处理审核任务提交失败的情况', async () => {
      const { request } = await import('../request')
      
      const bannerData = {
        bizId: '1',
        content: {
          title: '测试Banner',
          imageUrl: 'https://example.com/test.jpg',
          linkUrl: 'https://example.com/test',
          startTime: '2024-04-01 00:00:00',
          endTime: '2024-04-30 23:59:59'
        },
        submitterId: 1001,
        submitterName: '测试用户'
      }

      // Mock策略获取失败
      request.get.mockRejectedValueOnce(new Error('网络错误'))

      await expect(auditNodeUtils.submitForAudit('banner', bannerData))
        .rejects.toThrow()
    })
  })

  describe('Banner审核结果回调处理', () => {
    it('应该能够处理审核通过的回调', async () => {
      const { request } = await import('../request')
      
      const callbackData = {
        taskId: 'audit-banner-123',
        status: 'approved',
        reason: null,
        detail: null,
        auditorId: 2001,
        processTime: 300
      }

      // Mock任务详情获取
      request.get.mockResolvedValueOnce({
        data: {
          taskId: 'audit-banner-123',
          bizType: 'banner',
          bizId: '1',
          submitterId: 1001
        }
      })

      // Mock Banner状态更新
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: 'Banner审核通过' }
      })

      // Mock通知发送
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: '通知发送成功' }
      })

      await expect(auditNodeUtils.handleAuditCallback('banner', callbackData))
        .resolves.not.toThrow()

      expect(request.post).toHaveBeenCalledWith(
        expect.stringContaining('/approve'),
        expect.any(Object)
      )
    })

    it('应该能够处理审核拒绝的回调', async () => {
      const { request } = await import('../request')
      
      const callbackData = {
        taskId: 'audit-banner-123',
        status: 'rejected',
        reason: '内容不合规',
        detail: '包含敏感信息',
        auditorId: 2001,
        processTime: 180
      }

      // Mock任务详情获取
      request.get.mockResolvedValueOnce({
        data: {
          taskId: 'audit-banner-123',
          bizType: 'banner',
          bizId: '1',
          submitterId: 1001
        }
      })

      // Mock Banner状态更新
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: 'Banner审核拒绝' }
      })

      // Mock通知发送
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: '通知发送成功' }
      })

      await expect(auditNodeUtils.handleAuditCallback('banner', callbackData))
        .resolves.not.toThrow()

      expect(request.post).toHaveBeenCalledWith(
        expect.stringContaining('/reject'),
        expect.objectContaining({
          reason: '内容不合规',
          detail: '包含敏感信息'
        })
      )
    })
  })

  describe('Banner审核任务状态查询', () => {
    it('应该能够查询审核任务状态', async () => {
      const { request } = await import('../request')
      
      const mockTaskStatus = {
        taskId: 'audit-banner-123',
        status: 'pending',
        createTime: '2024-03-01 10:00:00',
        processTime: 0
      }

      request.get.mockResolvedValueOnce({
        data: mockTaskStatus
      })

      const result = await auditNodeUtils.getTaskStatus('banner', 'audit-banner-123')

      expect(result).toEqual(mockTaskStatus)
      expect(request.get).toHaveBeenCalledWith(
        expect.stringContaining('/audit/tasks/audit-banner-123/status')
      )
    })

    it('应该处理任务不存在的情况', async () => {
      const { request } = await import('../request')
      
      request.get.mockRejectedValueOnce({
        response: { status: 404 }
      })

      await expect(auditNodeUtils.getTaskStatus('banner', 'non-existent-task'))
        .rejects.toThrow()
    })
  })

  describe('Banner审核性能测试', () => {
    it('应该能够批量提交审核任务', async () => {
      const { request } = await import('../request')
      
      const bannerSubmissions = [
        {
          bizType: 'banner' as const,
          bizId: '1',
          content: { title: 'Banner 1' },
          submitterId: 1001,
          submitterName: '用户1'
        },
        {
          bizType: 'banner' as const,
          bizId: '2',
          content: { title: 'Banner 2' },
          submitterId: 1002,
          submitterName: '用户2'
        }
      ]

      // Mock所有必要的API调用
      request.get.mockResolvedValue({
        data: {
          id: 2,
          bizType: 'banner',
          mode: 'pre',
          priority: 'normal',
          isActive: true
        }
      })

      request.post.mockResolvedValue({
        data: { taskId: 'audit-batch-123' }
      })

      const results = await auditNodeUtils.batchSubmitForAudit(bannerSubmissions)

      expect(results).toHaveLength(2)
      expect(results[0].bizType).toBe('banner')
      expect(results[0].taskId).toBeDefined()
      expect(results[1].bizType).toBe('banner')
      expect(results[1].taskId).toBeDefined()
    })

    it('应该能够处理批量提交中的部分失败', async () => {
      const { request } = await import('../request')
      
      const bannerSubmissions = [
        {
          bizType: 'banner' as const,
          bizId: '1',
          content: { title: 'Banner 1' },
          submitterId: 1001,
          submitterName: '用户1'
        },
        {
          bizType: 'banner' as const,
          bizId: '2',
          content: { title: 'Banner 2' },
          submitterId: 1002,
          submitterName: '用户2'
        }
      ]

      // 第一个成功，第二个失败
      request.get
        .mockResolvedValueOnce({ data: { isActive: true } })
        .mockRejectedValueOnce(new Error('网络错误'))

      request.post.mockResolvedValueOnce({
        data: { taskId: 'audit-success-123' }
      })

      const results = await auditNodeUtils.batchSubmitForAudit(bannerSubmissions)

      expect(results).toHaveLength(2)
      expect(results[0].taskId).toBe('audit-success-123')
      expect(results[1].taskId).toBe('error')
    })
  })
})