import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ElForm, ElFormItem, ElInput, ElSelect, ElButton } from 'element-plus'
import QuotationForm from '../QuotationForm.vue'
import type { QuotationForm as QuotationFormType } from '@/types'

// Mock API calls
vi.mock('@/api', () => ({
  rbacApi: {
    getUserList: vi.fn().mockResolvedValue({
      data: {
        list: [
          { id: 1, name: '张三', title: '总经理', avatar: 'avatar1.jpg' },
          { id: 2, name: '李四', title: '副总经理', avatar: 'avatar2.jpg' }
        ]
      }
    })
  }
}))

// Mock stores
vi.mock('@/stores/quotation', () => ({
  useQuotationStore: vi.fn(() => ({
    loading: false,
    submitting: false
  }))
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    token: 'mock-token'
  }))
}))

describe('QuotationForm', () => {
  const mockFormData: Partial<QuotationFormType> = {
    content: '测试名言内容',
    leaderId: 1,
    occasion: '年度会议',
    occurrenceTime: '2024-01-15 10:30:00',
    background: '重要讲话背景',
    tags: ['企业文化', '团队合作'],
    status: 'draft'
  }

  const createWrapper = (props = {}) => {
    return mount(QuotationForm, {
      props: {
        modelValue: mockFormData,
        ...props
      },
      global: {
        components: {
          ElForm,
          ElFormItem,
          ElInput,
          ElSelect,
          ElButton
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('表单渲染', () => {
    it('应该正确渲染所有表单字段', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.find('[data-testid="content-input"]').exists() || 
             wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('[data-testid="leader-select"]').exists() || 
             wrapper.find('.el-select').exists()).toBe(true)
      expect(wrapper.find('[data-testid="occasion-input"]').exists() || 
             wrapper.find('input[placeholder*="场合"]').exists()).toBe(true)
    })

    it('应该使用传入的初始值', () => {
      const wrapper = createWrapper()
      
      expect(wrapper.vm.formData.content).toBe(mockFormData.content)
      expect(wrapper.vm.formData.leaderId).toBe(mockFormData.leaderId)
      expect(wrapper.vm.formData.occasion).toBe(mockFormData.occasion)
    })

    it('应该在只读模式下禁用所有输入', () => {
      const wrapper = createWrapper({ readonly: true })
      
      expect(wrapper.find('.el-form').attributes('disabled')).toBeDefined()
    })
  })

  describe('富文本编辑器', () => {
    it('应该在富文本模式下显示编辑器', () => {
      const wrapper = createWrapper({ richEditor: true })
      
      expect(wrapper.find('.rich-editor-container').exists()).toBe(true)
      expect(wrapper.find('.rich-editor').exists()).toBe(true)
      expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
    })

    it('应该在普通模式下显示textarea', () => {
      const wrapper = createWrapper({ richEditor: false })
      
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('.rich-editor-container').exists()).toBe(false)
    })

    it('应该处理富文本内容变化', async () => {
      const wrapper = createWrapper({ richEditor: true })
      const editor = wrapper.find('.rich-editor')
      
      // 模拟输入事件
      editor.element.innerHTML = '<p>新的内容</p>'
      await editor.trigger('input')
      
      expect(wrapper.vm.formData.contentHtml).toBe('<p>新的内容</p>')
    })
  })

  describe('标签管理', () => {
    it('应该显示现有标签', () => {
      const wrapper = createWrapper()
      const tags = wrapper.findAll('.tag-item')
      
      expect(tags).toHaveLength(mockFormData.tags!.length)
    })

    it('应该能够删除标签', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.removeTag(0)
      
      expect(wrapper.vm.formData.tags).toHaveLength(mockFormData.tags!.length - 1)
      expect(wrapper.vm.formData.tags).not.toContain(mockFormData.tags![0])
    })

    it('应该能够添加新标签', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.inputValue = '新标签'
      wrapper.vm.handleInputConfirm()
      
      expect(wrapper.vm.formData.tags).toContain('新标签')
      expect(wrapper.vm.inputValue).toBe('')
      expect(wrapper.vm.inputVisible).toBe(false)
    })

    it('应该防止添加重复标签', async () => {
      const wrapper = createWrapper()
      const originalLength = wrapper.vm.formData.tags.length
      
      wrapper.vm.inputValue = mockFormData.tags![0] // 重复标签
      wrapper.vm.handleInputConfirm()
      
      expect(wrapper.vm.formData.tags).toHaveLength(originalLength)
    })
  })

  describe('表单验证', () => {
    it('应该验证必填字段', async () => {
      const wrapper = createWrapper({
        modelValue: { content: '', leaderId: 0 }
      })
      
      const isValid = await wrapper.vm.validate()
      
      expect(isValid).toBe(false)
    })

    it('应该验证内容长度', async () => {
      const shortContent = '短'
      const wrapper = createWrapper({
        modelValue: { ...mockFormData, content: shortContent }
      })
      
      const isValid = await wrapper.vm.validate()
      
      expect(isValid).toBe(false)
    })

    it('应该通过有效数据的验证', async () => {
      const wrapper = createWrapper()
      
      const isValid = await wrapper.vm.validate()
      
      expect(isValid).toBe(true)
    })
  })

  describe('表单提交', () => {
    it('应该在保存草稿时发射正确事件', async () => {
      const wrapper = createWrapper({ showActions: true })
      
      await wrapper.vm.handleSaveDraft()
      await flushPromises()
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      const emittedData = wrapper.emitted('submit')?.[0]
      expect(emittedData?.[1]).toBe('draft')
    })

    it('应该在提交审核时发射正确事件', async () => {
      const wrapper = createWrapper({ showActions: true, canSubmitReview: true })
      
      await wrapper.vm.handleSubmit()
      await flushPromises()
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      const emittedData = wrapper.emitted('submit')?.[0]
      expect(emittedData?.[1]).toBe('review')
    })

    it('应该在直接发布时发射正确事件', async () => {
      const wrapper = createWrapper({ showActions: true, canPublish: true })
      
      await wrapper.vm.handlePublish()
      await flushPromises()
      
      expect(wrapper.emitted('submit')).toBeTruthy()
      const emittedData = wrapper.emitted('submit')?.[0]
      expect(emittedData?.[1]).toBe('publish')
    })

    it('应该在验证失败时阻止提交', async () => {
      const wrapper = createWrapper({
        modelValue: { content: '', leaderId: 0 }, // 无效数据
        showActions: true
      })
      
      // Mock validate to return false
      wrapper.vm.formRef = {
        validate: vi.fn().mockRejectedValue(new Error('Validation failed'))
      }
      
      await wrapper.vm.handleSaveDraft()
      
      expect(wrapper.emitted('submit')).toBeFalsy()
    })
  })

  describe('领导人搜索', () => {
    it('应该能够搜索领导人', async () => {
      const wrapper = createWrapper()
      
      await wrapper.vm.searchLeaders('张')
      await flushPromises()
      
      expect(wrapper.vm.leaderOptions).toHaveLength(2)
    })

    it('应该显示加载状态', async () => {
      const wrapper = createWrapper()
      
      const searchPromise = wrapper.vm.searchLeaders('张')
      expect(wrapper.vm.leadersLoading).toBe(true)
      
      await searchPromise
      await flushPromises()
      
      expect(wrapper.vm.leadersLoading).toBe(false)
    })
  })

  describe('模式特定功能', () => {
    it('应该在修正模式下显示修正原因字段', () => {
      const wrapper = createWrapper({ mode: 'revision' })
      
      expect(wrapper.find('[data-testid="revision-reason"]').exists() ||
             wrapper.text()).toMatch(/修正说明/)
    })

    it('应该在创建模式下隐藏某些字段', () => {
      const wrapper = createWrapper({ mode: 'create' })
      
      // 创建模式下不应该有修正说明
      expect(wrapper.find('[data-testid="revision-reason"]').exists()).toBe(false)
    })
  })

  describe('双向绑定', () => {
    it('应该在数据变化时更新父组件', async () => {
      const wrapper = createWrapper()
      
      wrapper.vm.formData.content = '更新的内容'
      await wrapper.vm.$nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })

    it('应该响应外部数据变化', async () => {
      const wrapper = createWrapper()
      const newData = { ...mockFormData, content: '外部更新的内容' }
      
      await wrapper.setProps({ modelValue: newData })
      
      expect(wrapper.vm.formData.content).toBe('外部更新的内容')
    })
  })

  describe('权限控制', () => {
    it('应该根据权限显示相应按钮', () => {
      const wrapper = createWrapper({
        showActions: true,
        canSubmitReview: true,
        canPublish: true
      })
      
      expect(wrapper.vm.canSubmitReview).toBe(true)
      expect(wrapper.vm.canPublish).toBe(true)
    })

    it('应该在无权限时隐藏按钮', () => {
      const wrapper = createWrapper({
        showActions: true,
        canSubmitReview: false,
        canPublish: false
      })
      
      expect(wrapper.vm.canSubmitReview).toBe(false)
      expect(wrapper.vm.canPublish).toBe(false)
    })
  })

  describe('取消操作', () => {
    it('应该在取消时发射cancel事件', async () => {
      const wrapper = createWrapper({ showActions: true })
      
      wrapper.vm.handleCancel()
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('加载状态', () => {
    it('应该在提交时显示加载状态', async () => {
      const wrapper = createWrapper({ showActions: true })
      
      // 开始提交
      const submitPromise = wrapper.vm.handleSaveDraft()
      expect(wrapper.vm.saving).toBe(true)
      
      await submitPromise
      await flushPromises()
      
      expect(wrapper.vm.saving).toBe(false)
    })
  })

  describe('无障碍性', () => {
    it('应该有正确的标签关联', () => {
      const wrapper = createWrapper()
      
      // 检查表单项是否有正确的标签
      const formItems = wrapper.findAll('.el-form-item')
      formItems.forEach(item => {
        const label = item.find('.el-form-item__label')
        if (label.exists()) {
          expect(label.text()).toBeTruthy()
        }
      })
    })

    it('应该有适当的ARIA属性', () => {
      const wrapper = createWrapper({ mode: 'revision' })
      
      // 检查必填字段是否标记为required
      const requiredItems = wrapper.findAll('[required]')
      expect(requiredItems.length).toBeGreaterThan(0)
    })
  })
})