import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bannerApi, type BannerForm } from '../banner'
import { auditNodeUtils } from '../auditNodeFactory'
import * as requestModule from '../request'

// Mock dependencies
vi.mock('../request', () => ({
  request: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  }
}))

vi.mock('../auditNodeFactory', () => ({
  auditNodeUtils: {
    submitForAudit: vi.fn()
  }
}))

describe('Banner 创建时审核节点配置', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('创建Banner时集成审核配置', () => {
    it('应该支持创建时不立即提交审核', async () => {
      const mockBannerData: BannerForm = {
        title: 'Test Banner',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        description: 'Test description',
        auditOptions: {
          submitForAuditImmediately: false,
          priority: 'normal',
          metadata: {}
        }
      }

      const mockCreateResponse = {
        data: {
          data: {
            id: 1,
            ...mockBannerData,
            status: 'draft'
          }
        }
      }

      // Mock HTTP request
      const requestMock = vi.mocked(requestModule.request)
      requestMock.post.mockResolvedValue(mockCreateResponse)

      const result = await bannerApi.createBanner(mockBannerData, 1, 'testuser')

      expect(requestMock.post).toHaveBeenCalledWith('/api/banner', {
        ...mockBannerData,
        status: 'draft'
      })
      
      expect(result.status).toBe('draft')
      expect(auditNodeUtils.submitForAudit).not.toHaveBeenCalled()
    })

    it('应该支持创建时立即提交审核', async () => {
      const mockBannerData: BannerForm = {
        title: 'Test Banner',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        description: 'Test description',
        auditOptions: {
          submitForAuditImmediately: true,
          priority: 'high',
          metadata: { category: 'promotion' }
        }
      }

      const mockCreateResponse = {
        data: {
          data: {
            id: 1,
            ...mockBannerData,
            status: 'draft',
            createTime: '2024-01-01 00:00:00'
          }
        }
      }

      const mockSubmitResponse = {
        data: { taskId: 'audit-task-123' }
      }

      // Mock HTTP requests
      const requestMock = vi.mocked(requestModule.request)
      requestMock.post.mockResolvedValue(mockCreateResponse)
      requestMock.get.mockResolvedValue(mockCreateResponse)
      requestMock.patch.mockResolvedValue({ data: { success: true } })
      
      // Mock audit submission
      const auditUtilsMock = vi.mocked(auditNodeUtils)
      auditUtilsMock.submitForAudit.mockResolvedValue('audit-task-123')

      const result = await bannerApi.createBanner(mockBannerData, 1, 'testuser')

      expect(requestMock.post).toHaveBeenCalledWith('/api/banner', {
        ...mockBannerData,
        status: 'draft'
      })
      
      expect(auditUtilsMock.submitForAudit).toHaveBeenCalledWith('banner', {
        bizId: '1',
        content: expect.any(Object),
        submitterId: 1,
        submitterName: 'testuser',
        metadata: {
          bannerType: 'general',
          createdAt: expect.any(String),
          priority: 'high',
          category: 'promotion'
        }
      })
    })

    it('应该在审核提交失败时仍然创建banner', async () => {
      const mockBannerData: BannerForm = {
        title: 'Test Banner',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        description: 'Test description',
        auditOptions: {
          submitForAuditImmediately: true,
          priority: 'normal',
          metadata: {}
        }
      }

      const mockCreateResponse = {
        data: {
          data: {
            id: 1,
            ...mockBannerData,
            status: 'draft'
          }
        }
      }

      // Mock HTTP request
      const requestMock = vi.mocked(requestModule.request)
      requestMock.post.mockResolvedValue(mockCreateResponse)
      requestMock.get.mockResolvedValue(mockCreateResponse)
      
      // Mock audit submission failure
      const auditUtilsMock = vi.mocked(auditNodeUtils)
      auditUtilsMock.submitForAudit.mockRejectedValue(new Error('审核服务不可用'))

      // 模拟console.warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = await bannerApi.createBanner(mockBannerData, 1, 'testuser')

      expect(result.status).toBe('draft')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '创建后立即提交审核失败，banner已创建为草稿状态:',
        expect.any(Error)
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('获取审核节点信息', () => {
    it('应该能够获取审核节点配置信息', async () => {
      const mockAuditInfo = {
        enabled: true,
        rules: ['图片内容审核', '文字内容审核', '链接安全性审核'],
        priority: 'normal' as const,
        estimatedTime: '2-24小时',
        description: 'Banner内容审核节点'
      }

      const requestMock = vi.mocked(requestModule.request)
      requestMock.get.mockResolvedValue({ data: mockAuditInfo })

      const result = await bannerApi.getAuditNodeInfo()

      expect(requestMock.get).toHaveBeenCalledWith('/api/banner/audit-node-info')
      expect(result.data).toEqual(mockAuditInfo)
    })
  })

  describe('提交审核时传递审核选项', () => {
    it('应该在提交审核时传递优先级和元数据', async () => {
      const mockBanner = {
        id: 1,
        title: 'Test Banner',
        imageUrl: 'https://example.com/image.jpg',
        linkUrl: 'https://example.com',
        startTime: '2024-01-01 00:00:00',
        endTime: '2024-01-31 23:59:59',
        description: 'Test description',
        createTime: '2024-01-01 00:00:00'
      }

      const auditOptions = {
        priority: 'high' as const,
        metadata: { category: 'urgent' }
      }

      const requestMock = vi.mocked(requestModule.request)
      requestMock.get.mockResolvedValue({ data: { data: mockBanner } })
      requestMock.patch.mockResolvedValue({ data: { success: true } })

      const auditUtilsMock = vi.mocked(auditNodeUtils)
      auditUtilsMock.submitForAudit.mockResolvedValue('audit-task-123')

      await bannerApi.submitForAudit(1, 1, 'testuser', auditOptions)

      expect(auditUtilsMock.submitForAudit).toHaveBeenCalledWith('banner', {
        bizId: '1',
        content: expect.any(Object),
        submitterId: 1,
        submitterName: 'testuser',
        metadata: {
          bannerType: 'general',
          createdAt: mockBanner.createTime,
          priority: 'high',
          category: 'urgent'
        }
      })
    })
  })
})