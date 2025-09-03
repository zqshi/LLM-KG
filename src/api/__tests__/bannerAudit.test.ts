import { describe, it, expect, beforeEach, vi } from 'vitest'
import { bannerApi, bannerStatusUtils } from '../banner'
import { auditNodeUtils } from '../auditNodeFactory'

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

// Mock审核节点工具
vi.mock('../auditNodeFactory', () => ({
  auditNodeUtils: {
    submitForAudit: vi.fn(),
    getTaskStatus: vi.fn(),
    checkAuditRequired: vi.fn()
  }
}))

describe('Banner审核功能测试', () => {
  const mockBanner = {
    id: 1,
    title: '测试Banner',
    imageUrl: 'https://example.com/test.jpg',
    linkUrl: 'https://example.com',
    startTime: '2024-03-01 00:00:00',
    endTime: '2024-03-31 23:59:59',
    status: 'draft',
    creator: '测试用户',
    createTime: '2024-02-28 10:00:00',
    updateTime: '2024-02-28 10:00:00',
    description: '测试Banner描述'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Banner状态管理', () => {
    it('应该正确判断是否可以提交审核', () => {
      expect(bannerStatusUtils.canSubmitAudit('draft')).toBe(true)
      expect(bannerStatusUtils.canSubmitAudit('rejected')).toBe(true)
      expect(bannerStatusUtils.canSubmitAudit('pending')).toBe(false)
      expect(bannerStatusUtils.canSubmitAudit('approved')).toBe(false)
      expect(bannerStatusUtils.canSubmitAudit('published')).toBe(false)
    })

    it('应该正确判断是否可以发布', () => {
      expect(bannerStatusUtils.canPublish('approved')).toBe(true)
      expect(bannerStatusUtils.canPublish('draft')).toBe(false)
      expect(bannerStatusUtils.canPublish('pending')).toBe(false)
      expect(bannerStatusUtils.canPublish('rejected')).toBe(false)
    })

    it('应该正确判断是否可以下线', () => {
      expect(bannerStatusUtils.canOffline('published')).toBe(true)
      expect(bannerStatusUtils.canOffline('approved')).toBe(false)
      expect(bannerStatusUtils.canOffline('draft')).toBe(false)
    })

    it('应该正确判断是否可以编辑', () => {
      expect(bannerStatusUtils.canEdit('draft')).toBe(true)
      expect(bannerStatusUtils.canEdit('rejected')).toBe(true)
      expect(bannerStatusUtils.canEdit('pending')).toBe(false)
      expect(bannerStatusUtils.canEdit('published')).toBe(false)
    })

    it('应该正确判断是否可以删除', () => {
      expect(bannerStatusUtils.canDelete('draft')).toBe(true)
      expect(bannerStatusUtils.canDelete('rejected')).toBe(true)
      expect(bannerStatusUtils.canDelete('offline')).toBe(true)
      expect(bannerStatusUtils.canDelete('published')).toBe(false)
      expect(bannerStatusUtils.canDelete('pending')).toBe(false)
    })
  })

  describe('Banner审核流程', () => {
    it('应该能够成功提交审核', async () => {
      const { request } = await import('../request')
      
      // Mock获取Banner详情
      request.get.mockResolvedValueOnce({
        data: { data: mockBanner }
      })

      // Mock审核节点工具
      auditNodeUtils.submitForAudit.mockResolvedValueOnce('audit-123456')

      // Mock更新Banner状态
      request.patch.mockResolvedValueOnce({
        data: { code: 200, message: '状态更新成功' }
      })

      const result = await bannerApi.submitForAudit(1, 1001, '测试用户')

      expect(auditNodeUtils.submitForAudit).toHaveBeenCalledWith('banner', {
        bizId: '1',
        content: {
          title: mockBanner.title,
          description: mockBanner.description,
          imageUrl: mockBanner.imageUrl,
          linkUrl: mockBanner.linkUrl,
          startTime: mockBanner.startTime,
          endTime: mockBanner.endTime
        },
        submitterId: 1001,
        submitterName: '测试用户',
        metadata: {
          bannerType: 'general',
          createdAt: mockBanner.createTime
        }
      })

      expect(request.patch).toHaveBeenCalledWith('/api/banner/1/status', {
        status: 'pending',
        auditTaskId: 'audit-123456'
      })

      expect(result).toEqual({
        taskId: 'audit-123456',
        status: 'pending'
      })
    })

    it('应该能够获取审核状态', async () => {
      const { request } = await import('../request')
      
      const bannerWithTask = {
        ...mockBanner,
        auditTaskId: 'audit-123456'
      }

      // Mock获取Banner详情
      request.get.mockResolvedValueOnce({
        data: { data: bannerWithTask }
      })

      // Mock审核状态查询
      auditNodeUtils.getTaskStatus.mockResolvedValueOnce({
        status: 'pending',
        processTime: 0
      })

      const result = await bannerApi.getAuditStatus(1)

      expect(auditNodeUtils.getTaskStatus).toHaveBeenCalledWith('banner', 'audit-123456')
      expect(result).toEqual({
        status: 'pending',
        processTime: 0
      })
    })

    it('当Banner没有审核任务时应该返回null', async () => {
      const { request } = await import('../request')
      
      // Mock获取Banner详情（没有auditTaskId）
      request.get.mockResolvedValueOnce({
        data: { data: { ...mockBanner, auditTaskId: null } }
      })

      const result = await bannerApi.getAuditStatus(1)

      expect(result).toBeNull()
      expect(auditNodeUtils.getTaskStatus).not.toHaveBeenCalled()
    })
  })

  describe('Banner CRUD操作', () => {
    it('应该能够创建Banner', async () => {
      const { request } = await import('../request')
      
      const newBannerData = {
        title: '新Banner',
        imageUrl: 'https://example.com/new.jpg',
        linkUrl: 'https://example.com/new',
        startTime: '2024-04-01 00:00:00',
        endTime: '2024-04-30 23:59:59',
        description: '新Banner描述'
      }

      const expectedBanner = {
        ...newBannerData,
        id: 2,
        status: 'draft',
        creator: '测试用户',
        createTime: '2024-03-01 10:00:00'
      }

      request.post.mockResolvedValueOnce({
        data: { data: expectedBanner }
      })

      const result = await bannerApi.createBanner(newBannerData, 1001, '测试用户')

      expect(request.post).toHaveBeenCalledWith('/api/banner', {
        ...newBannerData,
        status: 'draft'
      })
      
      expect(result).toEqual(expectedBanner)
    })

    it('应该能够更新Banner', async () => {
      const { request } = await import('../request')
      
      const updateData = {
        title: '更新的Banner',
        imageUrl: 'https://example.com/updated.jpg',
        linkUrl: 'https://example.com/updated',
        startTime: '2024-04-01 00:00:00',
        endTime: '2024-04-30 23:59:59',
        description: '更新的描述'
      }

      const updatedBanner = {
        ...mockBanner,
        ...updateData,
        updateTime: '2024-03-01 11:00:00'
      }

      request.put.mockResolvedValueOnce({
        data: { data: updatedBanner }
      })

      const result = await bannerApi.updateBanner(1, updateData)

      expect(request.put).toHaveBeenCalledWith('/api/banner/1', updateData)
      expect(result.data.data).toEqual(updatedBanner)
    })

    it('应该能够删除Banner', async () => {
      const { request } = await import('../request')
      
      request.delete.mockResolvedValueOnce({
        data: { code: 200, message: 'Banner删除成功' }
      })

      await bannerApi.deleteBanner(1)

      expect(request.delete).toHaveBeenCalledWith('/api/banner/1')
    })

    it('应该能够发布Banner', async () => {
      const { request } = await import('../request')
      
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: 'Banner发布成功' }
      })

      await bannerApi.publishBanner(1)

      expect(request.post).toHaveBeenCalledWith('/api/banner/1/publish')
    })

    it('应该能够下线Banner', async () => {
      const { request } = await import('../request')
      
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: 'Banner下线成功' }
      })

      await bannerApi.offlineBanner(1)

      expect(request.post).toHaveBeenCalledWith('/api/banner/1/offline')
    })
  })

  describe('先审后发流程测试', () => {
    it('应该实现完整的先审后发流程', async () => {
      const { request } = await import('../request')

      // 1. 创建Banner（草稿状态）
      const newBannerData = {
        title: '测试流程Banner',
        imageUrl: 'https://example.com/flow.jpg',
        linkUrl: 'https://example.com/flow',
        startTime: '2024-04-01 00:00:00',
        endTime: '2024-04-30 23:59:59',
        description: '测试先审后发流程'
      }

      request.post.mockResolvedValueOnce({
        data: { 
          data: { 
            ...newBannerData, 
            id: 1, 
            status: 'draft' 
          } 
        }
      })

      const createdBanner = await bannerApi.createBanner(newBannerData, 1001, '测试用户')
      expect(createdBanner.status).toBe('draft')

      // 2. 提交审核
      request.get.mockResolvedValueOnce({
        data: { data: createdBanner }
      })
      auditNodeUtils.submitForAudit.mockResolvedValueOnce('audit-flow-123')
      request.patch.mockResolvedValueOnce({
        data: { code: 200, message: '状态更新成功' }
      })

      const auditResult = await bannerApi.submitForAudit(1, 1001, '测试用户')
      expect(auditResult.status).toBe('pending')

      // 3. 审核通过后才能发布
      const approvedBanner = { ...createdBanner, status: 'approved' }
      request.get.mockResolvedValueOnce({
        data: { data: approvedBanner }
      })

      expect(bannerStatusUtils.canPublish(approvedBanner.status)).toBe(true)
      expect(bannerStatusUtils.canPublish('draft')).toBe(false)
      expect(bannerStatusUtils.canPublish('pending')).toBe(false)
      expect(bannerStatusUtils.canPublish('rejected')).toBe(false)

      // 4. 发布Banner
      request.post.mockResolvedValueOnce({
        data: { code: 200, message: 'Banner发布成功' }
      })

      await bannerApi.publishBanner(1)
      expect(request.post).toHaveBeenCalledWith('/api/banner/1/publish')
    })

    it('应该阻止未审核通过的Banner发布', () => {
      // 草稿状态不能发布
      expect(bannerStatusUtils.canPublish('draft')).toBe(false)
      
      // 待审核状态不能发布
      expect(bannerStatusUtils.canPublish('pending')).toBe(false)
      
      // 审核中状态不能发布
      expect(bannerStatusUtils.canPublish('reviewing')).toBe(false)
      
      // 已拒绝状态不能发布
      expect(bannerStatusUtils.canPublish('rejected')).toBe(false)
      
      // 只有审核通过才能发布
      expect(bannerStatusUtils.canPublish('approved')).toBe(true)
    })

    it('应该允许被拒绝的Banner重新编辑和提交', () => {
      // 被拒绝的Banner可以编辑
      expect(bannerStatusUtils.canEdit('rejected')).toBe(true)
      
      // 被拒绝的Banner可以重新提交审核
      expect(bannerStatusUtils.canSubmitAudit('rejected')).toBe(true)
      
      // 被拒绝的Banner可以删除
      expect(bannerStatusUtils.canDelete('rejected')).toBe(true)
    })
  })
})