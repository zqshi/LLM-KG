import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface FeedbackData {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  content: string
  rating?: number
  userAgent: string
  url: string
  timestamp: number
  userId?: string
  metadata?: Record<string, any>
}

export interface ABTestVariant {
  id: string
  name: string
  weight: number
  config: Record<string, any>
}

export interface ABTest {
  id: string
  name: string
  description: string
  isActive: boolean
  variants: ABTestVariant[]
  startDate: number
  endDate?: number
  targetUserPercentage: number
}

export const useFeedbackStore = defineStore('feedback', () => {
  // 反馈数据
  const feedbackList = ref<FeedbackData[]>([])
  const isCollectingFeedback = ref(true)
  
  // A/B测试数据
  const abTests = ref<ABTest[]>([])
  const userVariants = ref<Record<string, string>>({}) // testId -> variantId
  
  // 用户行为跟踪
  const userActions = ref<Array<{
    action: string
    timestamp: number
    data: any
  }>>([])

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 添加反馈
  const addFeedback = (feedback: Omit<FeedbackData, 'id' | 'timestamp' | 'userAgent' | 'url'>) => {
    const newFeedback: FeedbackData = {
      ...feedback,
      id: generateId(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    feedbackList.value.push(newFeedback)
    
    // 模拟发送到服务器
    console.log('发送反馈到服务器:', newFeedback)
    
    return newFeedback.id
  }

  // 记录用户行为
  const trackUserAction = (action: string, data: any = {}) => {
    if (!isCollectingFeedback.value) return
    
    userActions.value.push({
      action,
      timestamp: Date.now(),
      data
    })
    
    // 限制存储的行为数量
    if (userActions.value.length > 1000) {
      userActions.value = userActions.value.slice(-500)
    }
  }

  // 初始化A/B测试
  const initABTests = () => {
    // 模拟A/B测试配置
    abTests.value = [
      {
        id: 'dashboard-layout',
        name: '仪表盘布局测试',
        description: '测试不同的仪表盘布局对用户体验的影响',
        isActive: true,
        variants: [
          { id: 'control', name: '默认布局', weight: 50, config: { layout: 'default' } },
          { id: 'compact', name: '紧凑布局', weight: 50, config: { layout: 'compact' } }
        ],
        startDate: Date.now(),
        targetUserPercentage: 50
      },
      {
        id: 'button-color',
        name: '按钮颜色测试',
        description: '测试不同按钮颜色的点击率',
        isActive: true,
        variants: [
          { id: 'blue', name: '蓝色按钮', weight: 33, config: { primaryColor: '#1890ff' } },
          { id: 'green', name: '绿色按钮', weight: 33, config: { primaryColor: '#52c41a' } },
          { id: 'purple', name: '紫色按钮', weight: 34, config: { primaryColor: '#722ed1' } }
        ],
        startDate: Date.now(),
        targetUserPercentage: 30
      }
    ]
  }

  // 获取用户的A/B测试变体
  const getUserVariant = (testId: string): string | null => {
    const test = abTests.value.find(t => t.id === testId)
    if (!test || !test.isActive) return null
    
    // 如果用户已经分配了变体，直接返回
    if (userVariants.value[testId]) {
      return userVariants.value[testId]
    }
    
    // 检查用户是否应该参与这个测试
    const shouldParticipate = Math.random() * 100 < test.targetUserPercentage
    if (!shouldParticipate) return null
    
    // 根据权重分配变体
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0)
    let randomNum = Math.random() * totalWeight
    
    for (const variant of test.variants) {
      if (randomNum < variant.weight) {
        userVariants.value[testId] = variant.id
        // 保存到localStorage
        localStorage.setItem('ab-test-variants', JSON.stringify(userVariants.value))
        
        // 记录用户参与A/B测试
        trackUserAction('ab_test_assigned', {
          testId,
          variantId: variant.id
        })
        
        return variant.id
      }
      randomNum -= variant.weight
    }
    
    return null
  }

  // 获取A/B测试配置
  const getABTestConfig = (testId: string): Record<string, any> | null => {
    const variantId = getUserVariant(testId)
    if (!variantId) return null
    
    const test = abTests.value.find(t => t.id === testId)
    const variant = test?.variants.find(v => v.id === variantId)
    
    return variant?.config || null
  }

  // 记录A/B测试转化
  const trackABTestConversion = (testId: string, conversionType: string, value?: number) => {
    const variantId = userVariants.value[testId]
    if (!variantId) return
    
    trackUserAction('ab_test_conversion', {
      testId,
      variantId,
      conversionType,
      value
    })
  }

  // 从localStorage恢复A/B测试分配
  const restoreABTestVariants = () => {
    const saved = localStorage.getItem('ab-test-variants')
    if (saved) {
      try {
        userVariants.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to restore A/B test variants:', e)
      }
    }
  }

  // 获取反馈统计
  const feedbackStats = computed(() => {
    const total = feedbackList.value.length
    const byType = feedbackList.value.reduce((acc, feedback) => {
      acc[feedback.type] = (acc[feedback.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const avgRating = feedbackList.value
      .filter(f => f.rating)
      .reduce((sum, f, _, arr) => sum + (f.rating! / arr.length), 0)
    
    return { total, byType, avgRating }
  })

  // 清除旧数据
  const cleanupOldData = () => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    userActions.value = userActions.value.filter(action => action.timestamp > oneWeekAgo)
  }

  return {
    // 反馈相关
    feedbackList,
    isCollectingFeedback,
    feedbackStats,
    addFeedback,
    
    // A/B测试相关
    abTests,
    userVariants,
    initABTests,
    getUserVariant,
    getABTestConfig,
    trackABTestConversion,
    restoreABTestVariants,
    
    // 用户行为跟踪
    userActions,
    trackUserAction,
    cleanupOldData
  }
})