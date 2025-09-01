import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { ElButton, ElTable, ElTag, ElDialog, ElForm } from 'element-plus'
import Reports from '../Reports.vue'

// Mock API
vi.mock('@/api/fleaMarket', () => ({
  fleaMarketApi: {
    getReports: vi.fn(),
    handleReport: vi.fn()
  }
}))

describe('跳蚤市场举报处理', () => {
  let wrapper: any
  let pinia: any

  const mockReportsData = [
    {
      id: 1,
      reporterId: 4,
      reporter: { id: 4, name: '举报人A', email: 'reporter1@example.com' },
      targetType: 'goods',
      targetId: 1,
      targetGoods: {
        id: 1,
        title: 'iPhone 14 Pro 深空黑色 256GB',
        seller: { name: '张三' }
      },
      reason: '价格明显高于市场价，疑似欺诈',
      status: 'pending',
      createTime: '2024-03-16 15:30:00'
    },
    {
      id: 2,
      reporterId: 5,
      reporter: { id: 5, name: '举报人B', email: 'reporter2@example.com' },
      targetType: 'goods',
      targetId: 2,
      targetGoods: {
        id: 2,
        title: 'MacBook Air M2 13英寸',
        seller: { name: '李四' }
      },
      reason: '商品描述与图片不符',
      status: 'processed',
      handler: { id: 1, name: '管理员' },
      handleRemark: '经核实，商品描述准确，驳回举报',
      handleTime: '2024-03-16 16:00:00',
      createTime: '2024-03-16 14:00:00'
    }
  ]

  beforeEach(() => {
    pinia = createPinia()
    wrapper = mount(Reports, {
      global: {
        plugins: [pinia],
        components: {
          ElButton,
          ElTable,
          ElTag,
          ElDialog,
          ElForm
        }
      }
    })
  })

  describe('页面结构测试', () => {
    it('应该渲染正确的页面标题', () => {
      expect(wrapper.find('h2').text()).toBe('举报处理')
    })

    it('应该包含举报列表表格', async () => {
      expect(wrapper.find('[data-testid="reports-table"]').exists()).toBe(true)
    })

    it('应该包含筛选器组件', () => {
      expect(wrapper.find('[data-testid="reports-filter"]').exists()).toBe(true)
    })

    it('应该包含刷新按钮', () => {
      expect(wrapper.find('[data-testid="refresh-btn"]').exists()).toBe(true)
    })
  })

  describe('数据加载测试', () => {
    it('应该在组件挂载时加载举报数据', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      expect(fleaMarketApi.getReports).toHaveBeenCalled()
    })

    it('应该正确显示加载状态', async () => {
      wrapper.vm.loading = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
    })

    it('应该正确处理空数据状态', async () => {
      wrapper.vm.reportsList = []
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    })
  })

  describe('举报状态显示测试', () => {
    beforeEach(() => {
      wrapper.vm.reportsList = mockReportsData
    })

    it('应该正确显示待处理状态', async () => {
      await wrapper.vm.$nextTick()
      const pendingTag = wrapper.find('[data-testid="status-pending"]')
      expect(pendingTag.exists()).toBe(true)
      expect(pendingTag.text()).toBe('待处理')
    })

    it('应该正确显示已处理状态', async () => {
      await wrapper.vm.$nextTick()
      const processedTag = wrapper.find('[data-testid="status-processed"]')
      expect(processedTag.exists()).toBe(true)
      expect(processedTag.text()).toBe('已处理')
    })

    it('应该为不同状态显示不同颜色', async () => {
      await wrapper.vm.$nextTick()
      const pendingTag = wrapper.find('[data-testid="status-pending"]')
      const processedTag = wrapper.find('[data-testid="status-processed"]')
      
      expect(pendingTag.classes()).toContain('el-tag--warning')
      expect(processedTag.classes()).toContain('el-tag--success')
    })
  })

  describe('筛选功能测试', () => {
    it('应该支持按状态筛选', async () => {
      const statusFilter = wrapper.find('[data-testid="status-filter"]')
      await statusFilter.setValue('pending')
      
      expect(wrapper.vm.filters.status).toBe('pending')
    })

    it('应该支持按举报类型筛选', async () => {
      const typeFilter = wrapper.find('[data-testid="type-filter"]')
      await typeFilter.setValue('goods')
      
      expect(wrapper.vm.filters.targetType).toBe('goods')
    })

    it('应该支持按日期范围筛选', async () => {
      const dateFilter = wrapper.find('[data-testid="date-filter"]')
      const dateRange = ['2024-03-16', '2024-03-17']
      await dateFilter.setValue(dateRange)
      
      expect(wrapper.vm.filters.dateRange).toEqual(dateRange)
    })
  })

  describe('举报处理测试', () => {
    beforeEach(() => {
      wrapper.vm.reportsList = mockReportsData
    })

    it('应该能够打开处理对话框', async () => {
      const handleBtn = wrapper.find('[data-testid="handle-btn"]')
      await handleBtn.trigger('click')
      
      expect(wrapper.vm.showHandleDialog).toBe(true)
    })

    it('应该在处理对话框中显示举报详情', async () => {
      wrapper.vm.showHandleDialog = true
      wrapper.vm.currentReport = mockReportsData[0]
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="report-detail"]').text()).toContain('iPhone 14 Pro')
    })

    it('应该支持添加处理备注', async () => {
      wrapper.vm.showHandleDialog = true
      await wrapper.vm.$nextTick()
      
      const remarkInput = wrapper.find('[data-testid="handle-remark"]')
      await remarkInput.setValue('测试处理备注')
      
      expect(wrapper.vm.handleForm.remark).toBe('测试处理备注')
    })

    it('应该能够提交处理结果', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      vi.mocked(fleaMarketApi.handleReport).mockResolvedValue({ code: 200, message: '处理成功' })
      
      wrapper.vm.currentReport = mockReportsData[0]
      wrapper.vm.handleForm = { remark: '测试处理', action: 'accept' }
      
      await wrapper.vm.handleSubmit()
      
      expect(fleaMarketApi.handleReport).toHaveBeenCalledWith(1, {
        handleRemark: '测试处理',
        action: 'accept'
      })
    })

    it('应该在处理成功后刷新列表', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      vi.mocked(fleaMarketApi.handleReport).mockResolvedValue({ code: 200, message: '处理成功' })
      vi.mocked(fleaMarketApi.getReports).mockResolvedValue({ 
        code: 200, 
        data: { list: mockReportsData, total: 2 } 
      })
      
      await wrapper.vm.handleSubmit()
      
      expect(fleaMarketApi.getReports).toHaveBeenCalled()
      expect(wrapper.vm.showHandleDialog).toBe(false)
    })
  })

  describe('批量操作测试', () => {
    beforeEach(() => {
      wrapper.vm.reportsList = mockReportsData
    })

    it('应该支持多选举报', async () => {
      const checkboxes = wrapper.findAll('[data-testid="report-checkbox"]')
      await checkboxes[0].setChecked(true)
      await checkboxes[1].setChecked(true)
      
      expect(wrapper.vm.selectedReports).toHaveLength(2)
    })

    it('应该在选择举报时启用批量操作按钮', async () => {
      wrapper.vm.selectedReports = [mockReportsData[0]]
      await wrapper.vm.$nextTick()
      
      const batchBtn = wrapper.find('[data-testid="batch-handle-btn"]')
      expect(batchBtn.attributes('disabled')).toBeUndefined()
    })

    it('应该支持批量标记为已处理', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      vi.mocked(fleaMarketApi.handleReport).mockResolvedValue({ code: 200, message: '处理成功' })
      
      wrapper.vm.selectedReports = mockReportsData
      
      await wrapper.vm.batchHandle('processed', '批量处理')
      
      expect(fleaMarketApi.handleReport).toHaveBeenCalledTimes(2)
    })
  })

  describe('分页功能测试', () => {
    it('应该正确处理分页参数', async () => {
      const pagination = wrapper.find('[data-testid="pagination"]')
      await pagination.trigger('current-change', 2)
      
      expect(wrapper.vm.currentPage).toBe(2)
    })

    it('应该在页码改变时重新加载数据', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      
      await wrapper.vm.handleCurrentChange(2)
      
      expect(fleaMarketApi.getReports).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 })
      )
    })
  })

  describe('错误处理测试', () => {
    it('应该正确显示API错误信息', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      vi.mocked(fleaMarketApi.getReports).mockRejectedValue(new Error('网络错误'))
      
      await wrapper.vm.loadReports()
      
      expect(wrapper.vm.error).toBe('加载举报数据失败')
    })

    it('应该在处理失败时显示错误提示', async () => {
      const { fleaMarketApi } = await import('@/api/fleaMarket')
      vi.mocked(fleaMarketApi.handleReport).mockRejectedValue(new Error('处理失败'))
      
      await wrapper.vm.handleSubmit()
      
      expect(wrapper.vm.error).toContain('处理失败')
    })
  })
})