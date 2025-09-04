import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import PollPost from '../PollPost.vue'
import type { PollPost as PollPostType } from '@/types'

// Mock Element Plus
vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    ElMessage: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn()
    },
    ElMessageBox: {
      confirm: vi.fn(() => Promise.resolve())
    }
  }
})

// Mock API
vi.mock('@/api/poll', () => ({
  default: {
    getPollPost: vi.fn(),
    submitVote: vi.fn(),
    sharePoll: vi.fn(),
    reportPoll: vi.fn()
  },
  PollContentAPI: {
    likePollPost: vi.fn(),
    favoritePollPost: vi.fn(),
    commentPollPost: vi.fn()
  }
}))

const mockPollPost: PollPostType = {
  id: '1',
  title: '最期待的新功能投票',
  content: '我们计划在下个版本中添加新功能，请投票选择您最期待的功能。',
  author: {
    id: '1',
    name: '产品经理',
    avatar: '/avatar.jpg',
    department: '产品部',
    position: '产品经理',
    email: 'pm@company.com',
    phone: '13800000000',
    joinDate: '2023-01-01',
    points: 1000,
    level: '高级'
  },
  category: '产品讨论',
  tags: ['产品', '功能', '投票'],
  createTime: '2024-01-01T10:00:00Z',
  updateTime: '2024-01-01T10:00:00Z',
  viewCount: 100,
  likeCount: 25,
  replyCount: 5,
  isTop: false,
  isHighlight: false,
  replies: [],
  poll: {
    question: '您最期待哪个新功能？',
    isMultiChoice: false,
    maxChoices: 1,
    startTime: '2024-01-01T10:00:00Z',
    endTime: '2024-01-07T18:00:00Z',
    status: 'ongoing',
    userVoted: false,
    userChoices: [],
    resultVisible: 'real_time',
    totalVoters: 50,
    participantCount: 50,
    options: [
      {
        id: 1,
        text: '深色模式',
        description: '支持夜间主题',
        count: 20,
        percent: 40.0
      },
      {
        id: 2,
        text: '数据导出',
        description: '导出个人数据',
        count: 30,
        percent: 60.0
      }
    ],
    rewards: [
      {
        id: 1,
        name: '参与积分',
        description: '投票即可获得积分',
        type: 'points',
        value: 10,
        quantity: 100,
        condition: 'participate'
      }
    ],
    hasRewards: true,
    canVote: true,
    canViewResult: true
  },
  type: 'poll'
}

describe('PollPost Component', () => {
  let pinia: any
  let router: any

  beforeEach(() => {
    pinia = createPinia()
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/forum/poll/:id', component: { template: '<div></div>' } },
        { path: '/forum', component: { template: '<div></div>' } }
      ]
    })
    vi.clearAllMocks()
  })

  it('should render poll post correctly', async () => {
    const PollAPI = await import('@/api/poll')
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: mockPollPost,
      code: 200,
      message: 'success',
      success: true
    })

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    // Wait for component to load data
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.poll-post-page').exists()).toBe(true)
  })

  it('should display poll question and options when not voted', async () => {
    const PollAPI = await import('@/api/poll')
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: mockPollPost,
      code: 200,
      message: 'success',
      success: true
    })

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Should show voting form for unvoted users
    expect(wrapper.vm.pollPost?.poll?.userVoted).toBe(false)
    expect(wrapper.vm.pollPost?.poll?.canVote).toBe(true)
  })

  it('should handle vote submission correctly', async () => {
    const PollAPI = await import('@/api/poll')
    
    // Mock initial poll data
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: mockPollPost,
      code: 200,
      message: 'success',
      success: true
    })

    // Mock vote submission
    vi.mocked(PollAPI.default.submitVote).mockResolvedValue({
      data: {
        success: true,
        vote: {
          id: '1',
          postId: '1',
          userId: '1',
          optionIds: [1],
          createTime: '2024-01-01T12:00:00Z'
        },
        updatedPoll: {
          ...mockPollPost.poll,
          userVoted: true,
          userChoices: [1]
        }
      },
      code: 200,
      message: 'success',
      success: true
    })

    // Set route params
    await router.push('/forum/poll/1')

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Simulate option selection
    wrapper.vm.selectedOptions = [1]

    // Simulate vote submission
    await wrapper.vm.submitVote()

    expect(PollAPI.default.submitVote).toHaveBeenCalledWith({
      pollId: '1',
      optionIds: [1]
    })
  })

  it('should handle multiple choice selection correctly', async () => {
    const multiChoicePoll = {
      ...mockPollPost,
      poll: {
        ...mockPollPost.poll,
        isMultiChoice: true,
        maxChoices: 2
      }
    }

    const PollAPI = await import('@/api/poll')
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: multiChoicePoll,
      code: 200,
      message: 'success',
      success: true
    })

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Test multiple selection
    wrapper.vm.toggleOption(1)
    wrapper.vm.toggleOption(2)

    expect(wrapper.vm.selectedOptionIds).toEqual([1, 2])

    // Test max choices limit
    wrapper.vm.toggleOption(3)
    
    // Should still only have 2 options selected (due to maxChoices limit)
    expect(wrapper.vm.selectedOptionIds.length).toBeLessThanOrEqual(2)
  })

  it('should calculate time remaining correctly', () => {
    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    // Test with future end time
    const futureTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    wrapper.vm.pollPost = {
      ...mockPollPost,
      poll: {
        ...mockPollPost.poll,
        endTime: futureTime
      }
    }

    const timeRemaining = wrapper.vm.getTimeRemaining()
    expect(timeRemaining).toMatch(/\d+天/)
  })

  it('should handle poll status correctly', async () => {
    const endedPoll = {
      ...mockPollPost,
      poll: {
        ...mockPollPost.poll,
        status: 'ended' as const,
        canVote: false
      }
    }

    const PollAPI = await import('@/api/poll')
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: endedPoll,
      code: 200,
      message: 'success',
      success: true
    })

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.vm.getStatusText('ended')).toBe('已结束')
    expect(wrapper.vm.getStatusType('ended')).toBe('info')
  })

  it('should handle like functionality', async () => {
    const PollAPI = await import('@/api/poll')
    
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: mockPollPost,
      code: 200,
      message: 'success',
      success: true
    })

    vi.mocked(PollAPI.PollContentAPI.likePollPost).mockResolvedValue({
      data: {
        liked: true,
        likeCount: 26
      },
      code: 200,
      message: 'success',
      success: true
    })

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    await wrapper.vm.toggleLike()

    expect(PollAPI.PollContentAPI.likePollPost).toHaveBeenCalledWith('1')
    expect(wrapper.vm.isLiked).toBe(true)
    expect(wrapper.vm.pollPost?.likeCount).toBe(26)
  })

  it('should validate vote selection correctly', async () => {
    const PollAPI = await import('@/api/poll')
    vi.mocked(PollAPI.default.getPollPost).mockResolvedValue({
      data: mockPollPost,
      code: 200,
      message: 'success',
      success: true
    })

    const wrapper = mount(PollPost, {
      global: {
        plugins: [pinia, router]
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Test single choice validation
    expect(wrapper.vm.hasValidSelection).toBe(false)

    wrapper.vm.selectedOptions = [1]
    expect(wrapper.vm.hasValidSelection).toBe(true)

    // Test multiple choice validation
    wrapper.vm.pollPost!.poll.isMultiChoice = true
    wrapper.vm.pollPost!.poll.maxChoices = 2
    wrapper.vm.selectedOptionIds = [1, 2]
    expect(wrapper.vm.hasValidSelection).toBe(true)

    // Test exceeding max choices
    wrapper.vm.selectedOptionIds = [1, 2, 3]
    expect(wrapper.vm.hasValidSelection).toBe(false)
  })
})

describe('PollPost Utility Functions', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PollPost, {
      global: {
        plugins: [createPinia(), createRouter({
          history: createWebHistory(),
          routes: []
        })]
      }
    })
  })

  it('should format datetime correctly', () => {
    const testDate = '2024-01-01T10:30:00Z'
    const formatted = wrapper.vm.formatDateTime(testDate)
    
    expect(formatted).toBeDefined()
    expect(typeof formatted).toBe('string')
  })

  it('should get correct reward condition text', () => {
    expect(wrapper.vm.getRewardConditionText('participate')).toBe('参与即可获得')
    expect(wrapper.vm.getRewardConditionText('winner')).toBe('选择获胜选项')
    expect(wrapper.vm.getRewardConditionText('all_participants')).toBe('所有参与者')
  })

  it('should get correct progress colors', () => {
    const color1 = wrapper.vm.getProgressColor(0)
    const color2 = wrapper.vm.getProgressColor(1)
    const color10 = wrapper.vm.getProgressColor(10)
    
    expect(color1).toBe('#409EFF')
    expect(color2).toBe('#67C23A')
    expect(color10).toBe('#409EFF') // Should cycle back to first color
  })
})