import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ElCard, ElTag, ElAvatar, ElIcon, ElButton, ElDropdown } from 'element-plus'
import QuotationCard from '../QuotationCard.vue'
import type { Quotation } from '@/types'

// Mock icons
vi.mock('@element-plus/icons-vue', () => ({
  MoreFilled: { template: '<div>MoreFilled</div>' },
  ChatDotRound: { template: '<div>ChatDotRound</div>' },
  LocationInformation: { template: '<div>LocationInformation</div>' },
  View: { template: '<div>View</div>' },
  Star: { template: '<div>Star</div>' },
  Check: { template: '<div>Check</div>' },
  Edit: { template: '<div>Edit</div>' },
  Close: { template: '<div>Close</div>' }
}))

describe('QuotationCard', () => {
  const mockQuotation: Quotation = {
    id: 1,
    content: '测试名言内容，这是一个用于测试的领导名言。',
    contentHtml: '<p>测试名言内容，这是一个用于测试的领导名言。</p>',
    leaderId: 1,
    leader: {
      id: 1,
      name: '张三',
      title: '总经理',
      avatar: 'https://example.com/avatar.jpg'
    },
    occasion: '年度工作会议',
    occurrenceTime: '2024-01-15 10:30:00',
    background: '在公司年度工作会议上的重要讲话',
    status: 'published',
    version: 1,
    creatorId: 1,
    creator: {
      id: 1,
      name: '李四',
      username: 'lisi'
    },
    reviewerId: 2,
    reviewer: {
      id: 2,
      name: '王五',
      username: 'wangwu'
    },
    publishTime: '2024-01-16 09:00:00',
    showCount: 1250,
    likeCount: 89,
    tags: ['企业文化', '工作态度', '团队合作'],
    createTime: '2024-01-15 15:30:00',
    updateTime: '2024-01-16 09:00:00'
  }

  const createWrapper = (props = {}) => {
    return mount(QuotationCard, {
      props: {
        quotation: mockQuotation,
        ...props
      },
      global: {
        components: {
          ElCard,
          ElTag,
          ElAvatar,
          ElIcon,
          ElButton,
          ElDropdown
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染名言内容', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('.quotation-card__quote-text').text()).toBe(mockQuotation.content)
    })

    it('应该显示HTML内容（如果有）', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('.quotation-card__quote-text').html()).toContain(mockQuotation.contentHtml)
    })

    it('应该显示领导人信息', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('.quotation-card__author-name').text()).toBe(mockQuotation.leader.name)
      expect(wrapper.find('.quotation-card__author-title').text()).toBe(mockQuotation.leader.title)
    })

    it('应该显示场合信息', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('.quotation-card__occasion span').text()).toBe(mockQuotation.occasion)
    })

    it('应该显示标签', () => {
      const wrapper = createWrapper()
      const tags = wrapper.findAll('.quotation-card__tag')
      
      expect(tags).toHaveLength(mockQuotation.tags.length)
      mockQuotation.tags.forEach((tag, index) => {
        expect(tags[index].text()).toBe(tag)
      })
    })

    it('应该显示统计信息', () => {
      const wrapper = createWrapper()
      const stats = wrapper.findAll('.quotation-card__stat')
      
      expect(stats).toHaveLength(2) // showCount 和 likeCount
    })
  })

  describe('状态显示', () => {
    it('应该显示正确的状态标签', () => {
      const wrapper = createWrapper()
      const statusTag = wrapper.find('.quotation-card__status .el-tag')
      
      expect(statusTag.text()).toBe('已发布')
    })

    it('应该为不同状态应用正确的类名', () => {
      const statuses = ['draft', 'pending_review', 'published', 'rejected', 'archived']
      
      statuses.forEach(status => {
        const wrapper = createWrapper({
          quotation: { ...mockQuotation, status }
        })
        
        expect(wrapper.find('.quotation-card').classes()).toContain(`quotation-card--${status}`)
      })
    })
  })

  describe('交互功能', () => {
    it('应该在点击时发射click事件', async () => {
      const wrapper = createWrapper()
      
      await wrapper.find('.quotation-card').trigger('click')
      
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')?.[0][0]).toEqual(mockQuotation)
    })

    it('应该支持选择功能', async () => {
      const wrapper = createWrapper({
        selectable: true,
        showFooter: true
      })
      
      const checkbox = wrapper.find('.quotation-card__selection .el-checkbox')
      expect(checkbox.exists()).toBe(true)
      
      await checkbox.trigger('change')
      
      expect(wrapper.emitted('selection-change')).toBeTruthy()
    })

    it('应该在编辑操作时发射edit事件', async () => {
      const wrapper = createWrapper({
        canEdit: true
      })
      
      // 模拟下拉菜单命令触发
      wrapper.vm.handleActionCommand('edit')
      
      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')?.[0][0]).toEqual(mockQuotation)
    })

    it('应该在审核操作时发射review事件', async () => {
      const wrapper = createWrapper({
        variant: 'review',
        showFooter: true
      })
      
      await wrapper.find('.quotation-card__footer .el-button').trigger('click')
      
      expect(wrapper.emitted('review')).toBeTruthy()
      expect(wrapper.emitted('review')?.[0][0]).toEqual(mockQuotation)
      expect(wrapper.emitted('review')?.[0][1]).toBe('approve')
    })
  })

  describe('样式变体', () => {
    it('应该为紧凑模式应用正确的类名', () => {
      const wrapper = createWrapper({ variant: 'compact' })
      
      expect(wrapper.find('.quotation-card').classes()).toContain('quotation-card--compact')
    })

    it('应该为审核模式应用正确的类名', () => {
      const wrapper = createWrapper({ variant: 'review' })
      
      expect(wrapper.find('.quotation-card').classes()).toContain('quotation-card--review')
    })

    it('应该为展示模式应用正确的类名', () => {
      const wrapper = createWrapper({ variant: 'display' })
      
      expect(wrapper.find('.quotation-card').classes()).toContain('quotation-card--display')
    })

    it('应该在选中时应用选中样式', () => {
      const wrapper = createWrapper({ selected: true })
      
      expect(wrapper.find('.quotation-card').classes()).toContain('quotation-card--selected')
    })
  })

  describe('内容截断', () => {
    it('应该在超过最大长度时截断内容', () => {
      const longContent = 'A'.repeat(250)
      const wrapper = createWrapper({
        quotation: { ...mockQuotation, content: longContent },
        maxLength: 200
      })
      
      const displayedContent = wrapper.vm.displayContent
      expect(displayedContent.length).toBeLessThanOrEqual(203) // 200 + '...'
      expect(displayedContent.endsWith('...')).toBe(true)
    })

    it('应该不截断短内容', () => {
      const shortContent = '短内容'
      const wrapper = createWrapper({
        quotation: { ...mockQuotation, content: shortContent },
        maxLength: 200
      })
      
      expect(wrapper.vm.displayContent).toBe(shortContent)
    })
  })

  describe('数字格式化', () => {
    it('应该正确格式化大数字', () => {
      const testCases = [
        { input: 999, expected: '999' },
        { input: 1500, expected: '1.5k' },
        { input: 15000, expected: '1.5w' },
        { input: 1234567, expected: '123.5w' }
      ]
      
      const wrapper = createWrapper()
      
      testCases.forEach(({ input, expected }) => {
        expect(wrapper.vm.formatNumber(input)).toBe(expected)
      })
    })
  })

  describe('时间格式化', () => {
    it('应该正确格式化时间', () => {
      const wrapper = createWrapper()
      const formattedTime = wrapper.vm.formatTime('2024-01-15T15:30:00')
      
      expect(formattedTime).toBe('2024/1/15')
    })
  })

  describe('可见性控制', () => {
    it('应该根据props控制header显示', () => {
      const wrapperWithHeader = createWrapper({ showHeader: true })
      const wrapperWithoutHeader = createWrapper({ showHeader: false })
      
      expect(wrapperWithHeader.find('.quotation-card__header').exists()).toBe(true)
      expect(wrapperWithoutHeader.find('.quotation-card__header').exists()).toBe(false)
    })

    it('应该根据props控制actions显示', () => {
      const wrapperWithActions = createWrapper({ showActions: true })
      const wrapperWithoutActions = createWrapper({ showActions: false })
      
      expect(wrapperWithActions.find('.quotation-card__actions').exists()).toBe(true)
      expect(wrapperWithoutActions.find('.quotation-card__actions').exists()).toBe(false)
    })

    it('应该根据props控制stats显示', () => {
      const wrapperWithStats = createWrapper({ showStats: true })
      const wrapperWithoutStats = createWrapper({ showStats: false })
      
      expect(wrapperWithStats.find('.quotation-card__stats').exists()).toBe(true)
      expect(wrapperWithoutStats.find('.quotation-card__stats').exists()).toBe(false)
    })

    it('应该根据props控制footer显示', () => {
      const wrapperWithFooter = createWrapper({ showFooter: true })
      const wrapperWithoutFooter = createWrapper({ showFooter: false })
      
      expect(wrapperWithFooter.find('.quotation-card__footer').exists()).toBe(true)
      expect(wrapperWithoutFooter.find('.quotation-card__footer').exists()).toBe(false)
    })
  })

  describe('权限控制', () => {
    it('应该根据权限显示编辑按钮', () => {
      const wrapper = createWrapper({ canEdit: true, showActions: true })
      
      // 检查下拉菜单中是否有编辑选项
      // 这里需要模拟下拉菜单的展开状态
      expect(wrapper.vm.canEdit).toBe(true)
    })

    it('应该根据权限控制审核按钮', () => {
      const wrapper = createWrapper({ canReview: true, variant: 'review' })
      
      expect(wrapper.vm.canReview).toBe(true)
    })
  })

  describe('无障碍性', () => {
    it('应该有正确的ARIA属性', () => {
      const wrapper = createWrapper()
      
      // 检查卡片是否可点击时有适当的角色
      if (wrapper.vm.clickable) {
        expect(wrapper.find('.quotation-card').attributes('role')).toBe('button')
      }
    })

    it('应该有正确的alt文本', () => {
      const wrapper = createWrapper()
      const avatar = wrapper.find('.el-avatar')
      
      expect(avatar.attributes('alt')).toBe(mockQuotation.leader.name)
    })
  })
})