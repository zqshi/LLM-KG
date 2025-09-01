import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuotationStore } from '../quotation'
import type { Quotation, QuotationForm, QuotationQueryParams } from '@/types'

// Mock API
const mockQuotationApi = {
  getList: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  batchDelete: vi.fn(),
  review: vi.fn(),
  requestRevision: vi.fn(),
  getStatistics: vi.fn(),
  getPendingList: vi.fn(),
  getReviewHistory: vi.fn(),
  getPlaylists: vi.fn(),
  createPlaylist: vi.fn(),
  updatePlaylist: vi.fn(),
  deletePlaylist: vi.fn(),
  getDailyQuoteConfig: vi.fn(),
  updateDailyQuoteConfig: vi.fn(),
  searchQuotations: vi.fn(),
  exportData: vi.fn(),
  importQuotations: vi.fn()
}

vi.mock('@/api', () => ({
  quotationApi: mockQuotationApi
}))

describe('QuotationStore', () => {
  let store: ReturnType<typeof useQuotationStore>

  const mockQuotation: Quotation = {
    id: 1,
    content: '测试名言内容',
    contentHtml: '<p>测试名言内容</p>',
    leaderId: 1,
    leader: {
      id: 1,
      name: '张三',
      title: '总经理'
    },
    occasion: '年度会议',
    occurrenceTime: '2024-01-15 10:30:00',
    background: '重要讲话',
    status: 'published',
    version: 1,
    creatorId: 1,
    creator: {
      id: 1,
      name: '李四',
      username: 'lisi'
    },
    showCount: 100,
    likeCount: 10,
    tags: ['企业文化'],
    createTime: '2024-01-15 15:30:00',
    updateTime: '2024-01-16 09:00:00'
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useQuotationStore()
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      expect(store.quotationList).toEqual([])
      expect(store.pendingList).toEqual([])
      expect(store.selectedIds).toEqual([])
      expect(store.loading).toBe(false)
      expect(store.submitLoading).toBe(false)
      expect(store.pagination.total).toBe(0)
      expect(store.pagination.page).toBe(1)
      expect(store.pagination.pageSize).toBe(20)
    })

    it('应该有正确的默认查询参数', () => {
      expect(store.queryParams).toEqual({
        page: 1,
        pageSize: 20,
        keyword: '',
        leaderId: undefined,
        tags: [],
        status: undefined,
        startTime: '',
        endTime: ''
      })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.quotationList = [mockQuotation]
      store.total = 1
      store.currentPage = 1
      store.pageSize = 20
    })

    it('hasMore 应该正确计算是否还有更多数据', () => {
      expect(store.hasMore).toBe(false)

      store.total = 25
      expect(store.hasMore).toBe(true)
    })

    it('isEmpty 应该正确判断列表是否为空', () => {
      expect(store.isEmpty).toBe(false)

      store.quotationList = []
      expect(store.isEmpty).toBe(true)
    })

    it('hasSelection 应该正确判断是否有选中项', () => {
      expect(store.hasSelection).toBe(false)

      store.selectedIds = [1, 2]
      expect(store.hasSelection).toBe(true)
    })

    it('publishedCount 应该正确计算已发布数量', () => {
      store.quotationList = [
        { ...mockQuotation, status: 'published' },
        { ...mockQuotation, id: 2, status: 'draft' },
        { ...mockQuotation, id: 3, status: 'published' }
      ]

      expect(store.publishedCount).toBe(2)
    })

    it('pendingCount 应该正确计算待审核数量', () => {
      store.quotationList = [
        { ...mockQuotation, status: 'pending_review' },
        { ...mockQuotation, id: 2, status: 'draft' },
        { ...mockQuotation, id: 3, status: 'pending_review' }
      ]

      expect(store.pendingCount).toBe(2)
    })
  })

  describe('加载名言列表', () => {
    it('应该成功加载名言列表', async () => {
      const mockResponse = {
        data: {
          list: [mockQuotation],
          total: 1
        }
      }
      mockQuotationApi.getList.mockResolvedValue(mockResponse)

      await store.loadQuotationList()

      expect(store.loading).toBe(false)
      expect(store.quotationList).toEqual([mockQuotation])
      expect(store.total).toBe(1)
      expect(mockQuotationApi.getList).toHaveBeenCalledWith(store.queryParams)
    })

    it('应该处理加载失败', async () => {
      const error = new Error('加载失败')
      mockQuotationApi.getList.mockRejectedValue(error)

      await expect(store.loadQuotationList()).rejects.toThrow('加载失败')
      expect(store.loading).toBe(false)
    })

    it('应该在加载期间设置loading状态', async () => {
      let resolvePromise: (value: any) => void
      const promise = new Promise(resolve => { resolvePromise = resolve })
      mockQuotationApi.getList.mockReturnValue(promise)

      const loadPromise = store.loadQuotationList()
      expect(store.loading).toBe(true)

      resolvePromise!({ data: { list: [], total: 0 } })
      await loadPromise

      expect(store.loading).toBe(false)
    })
  })

  describe('创建名言', () => {
    const mockFormData: QuotationForm = {
      content: '新名言内容',
      leaderId: 1,
      occasion: '新场合',
      status: 'draft',
      tags: ['新标签']
    }

    it('应该成功创建名言', async () => {
      const mockResponse = { data: mockQuotation }
      mockQuotationApi.create.mockResolvedValue(mockResponse)

      const result = await store.createQuotation(mockFormData)

      expect(result).toEqual(mockQuotation)
      expect(mockQuotationApi.create).toHaveBeenCalledWith(mockFormData)
      expect(store.quotationList).toContain(mockQuotation)
    })

    it('应该处理创建失败', async () => {
      const error = new Error('创建失败')
      mockQuotationApi.create.mockRejectedValue(error)

      await expect(store.createQuotation(mockFormData)).rejects.toThrow('创建失败')
    })
  })

  describe('更新名言', () => {
    beforeEach(() => {
      store.quotationList = [mockQuotation]
    })

    it('应该成功更新名言', async () => {
      const updatedQuotation = { ...mockQuotation, content: '更新的内容' }
      const mockResponse = { data: updatedQuotation }
      mockQuotationApi.update.mockResolvedValue(mockResponse)

      const formData: QuotationForm = {
        content: '更新的内容',
        leaderId: 1,
        occasion: '年度会议',
        status: 'draft',
        tags: []
      }

      const result = await store.updateQuotation(1, formData)

      expect(result).toEqual(updatedQuotation)
      expect(mockQuotationApi.update).toHaveBeenCalledWith(1, formData)
      expect(store.quotationList[0].content).toBe('更新的内容')
    })

    it('应该处理更新失败', async () => {
      const error = new Error('更新失败')
      mockQuotationApi.update.mockRejectedValue(error)

      const formData: QuotationForm = {
        content: '更新的内容',
        leaderId: 1,
        occasion: '年度会议',
        status: 'draft',
        tags: []
      }

      await expect(store.updateQuotation(1, formData)).rejects.toThrow('更新失败')
    })
  })

  describe('删除名言', () => {
    beforeEach(() => {
      store.quotationList = [mockQuotation]
      store.total = 1
    })

    it('应该成功删除单个名言', async () => {
      mockQuotationApi.delete.mockResolvedValue({ data: null })

      await store.deleteQuotation(1)

      expect(mockQuotationApi.delete).toHaveBeenCalledWith(1)
      expect(store.quotationList).toEqual([])
      expect(store.total).toBe(0)
    })

    it('应该成功批量删除名言', async () => {
      const quotations = [
        mockQuotation,
        { ...mockQuotation, id: 2 }
      ]
      store.quotationList = quotations
      store.total = 2
      store.selectedIds = [1, 2]

      mockQuotationApi.batchDelete.mockResolvedValue({ data: null })

      await store.batchDeleteQuotations()

      expect(mockQuotationApi.batchDelete).toHaveBeenCalledWith([1, 2])
      expect(store.quotationList).toEqual([])
      expect(store.selectedIds).toEqual([])
      expect(store.total).toBe(0)
    })
  })

  describe('审核操作', () => {
    beforeEach(() => {
      store.quotationList = [{ ...mockQuotation, status: 'pending_review' }]
      store.pendingList = [{ ...mockQuotation, status: 'pending_review' }]
    })

    it('应该成功审核通过', async () => {
      mockQuotationApi.review.mockResolvedValue({ data: null })

      await store.reviewQuotation(1, 'approve', '审核通过')

      expect(mockQuotationApi.review).toHaveBeenCalledWith(1, 'approve', '审核通过')
      expect(store.quotationList[0].status).toBe('published')
      expect(store.pendingList).toEqual([])
    })

    it('应该成功拒绝审核', async () => {
      mockQuotationApi.review.mockResolvedValue({ data: null })

      await store.reviewQuotation(1, 'reject', '内容不符合要求')

      expect(mockQuotationApi.review).toHaveBeenCalledWith(1, 'reject', '内容不符合要求')
      expect(store.quotationList[0].status).toBe('rejected')
      expect(store.pendingList).toEqual([])
    })

    it('应该成功要求修正', async () => {
      mockQuotationApi.review.mockResolvedValue({ data: null })

      await store.reviewQuotation(1, 'revision', '需要修改格式')

      expect(mockQuotationApi.review).toHaveBeenCalledWith(1, 'revision', '需要修改格式')
      expect(store.quotationList[0].status).toBe('draft')
      expect(store.pendingList).toEqual([])
    })
  })

  describe('统计数据', () => {
    it('应该成功加载统计数据', async () => {
      const mockStats = {
        totalCount: 100,
        publishedCount: 80,
        pendingCount: 15,
        rejectedCount: 5,
        todayCount: 10,
        weekCount: 50,
        monthCount: 90,
        totalShowCount: 5000,
        totalLikeCount: 500
      }
      mockQuotationApi.getStatistics.mockResolvedValue({ data: mockStats })

      await store.loadStatistics()

      expect(store.quotationStats).toEqual(mockStats)
      expect(mockQuotationApi.getStatistics).toHaveBeenCalled()
    })
  })

  describe('查询参数管理', () => {
    it('应该正确设置查询参数', () => {
      const newParams: Partial<QuotationQueryParams> = {
        keyword: '搜索关键词',
        status: 'published',
        leaderId: 1
      }

      store.setQueryParams(newParams)

      expect(store.queryParams.keyword).toBe('搜索关键词')
      expect(store.queryParams.status).toBe('published')
      expect(store.queryParams.leaderId).toBe(1)
    })

    it('应该正确重置查询参数', () => {
      store.queryParams.keyword = '搜索关键词'
      store.queryParams.status = 'published'
      store.queryParams.leaderId = 1

      store.resetQueryParams()

      expect(store.queryParams.keyword).toBe('')
      expect(store.queryParams.status).toBe('')
      expect(store.queryParams.leaderId).toBeUndefined()
    })

    it('应该正确设置分页', () => {
      store.setPagination(2, 30)

      expect(store.currentPage).toBe(2)
      expect(store.pageSize).toBe(30)
      expect(store.queryParams.page).toBe(2)
      expect(store.queryParams.pageSize).toBe(30)
    })
  })

  describe('选择管理', () => {
    beforeEach(() => {
      store.quotationList = [
        mockQuotation,
        { ...mockQuotation, id: 2 },
        { ...mockQuotation, id: 3 }
      ]
    })

    it('应该正确切换单个选择', () => {
      store.toggleSelection(1)
      expect(store.selectedIds).toContain(1)

      store.toggleSelection(1)
      expect(store.selectedIds).not.toContain(1)
    })

    it('应该正确全选', () => {
      store.selectAll()
      expect(store.selectedIds).toEqual([1, 2, 3])
    })

    it('应该正确清空选择', () => {
      store.selectedIds = [1, 2]
      store.clearSelection()
      expect(store.selectedIds).toEqual([])
    })

    it('应该正确反选', () => {
      store.selectedIds = [1]
      store.invertSelection()
      expect(store.selectedIds).toEqual([2, 3])
    })
  })

  describe('搜索功能', () => {
    it('应该成功执行搜索', async () => {
      const mockResults = [mockQuotation]
      mockQuotationApi.searchQuotations.mockResolvedValue({ data: mockResults })

      const results = await store.searchQuotations('搜索关键词')

      expect(results).toEqual(mockResults)
      expect(mockQuotationApi.searchQuotations).toHaveBeenCalledWith({
        keyword: '搜索关键词',
        leaderId: undefined,
        tags: [],
        status: '',
        limit: 10
      })
    })
  })

  describe('错误处理', () => {
    it('应该正确处理API错误', async () => {
      const error = new Error('网络错误')
      mockQuotationApi.getList.mockRejectedValue(error)

      await expect(store.loadQuotationList()).rejects.toThrow('网络错误')
      expect(store.loading).toBe(false)
    })

    it('应该在操作失败时保持数据一致性', async () => {
      const originalList = [mockQuotation]
      store.quotationList = [...originalList]

      mockQuotationApi.delete.mockRejectedValue(new Error('删除失败'))

      try {
        await store.deleteQuotation(1)
      } catch {
        // 错误应该被抛出
      }

      // 数据应该保持不变
      expect(store.quotationList).toEqual(originalList)
    })
  })

  describe('缓存管理', () => {
    it('应该正确清除缓存', () => {
      store.quotationList = [mockQuotation]
      store.selectedIds = [1]
      store.total = 1

      store.clearCache()

      expect(store.quotationList).toEqual([])
      expect(store.selectedIds).toEqual([])
      expect(store.total).toBe(0)
    })
  })
})