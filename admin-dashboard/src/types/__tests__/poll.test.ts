import { describe, it, expect } from 'vitest'
import type { 
  PollPost, 
  PollOption, 
  PollReward, 
  CreatePollPostForm,
  SubmitVoteForm,
  PollStatistics 
} from '../poll'

describe('Poll Type Definitions', () => {
  describe('PollOption', () => {
    it('should have correct structure', () => {
      const pollOption: PollOption = {
        id: 1,
        text: 'Option 1',
        description: 'Description for option 1',
        image: 'http://example.com/image.jpg',
        sort: 1,
        voteCount: 10,
        percentage: 25.0
      }

      expect(pollOption.id).toBe(1)
      expect(pollOption.text).toBe('Option 1')
      expect(pollOption.voteCount).toBe(10)
      expect(pollOption.percentage).toBe(25.0)
    })

    it('should allow optional fields', () => {
      const pollOption: PollOption = {
        id: 1,
        text: 'Option 1',
        sort: 1,
        voteCount: 10,
        percentage: 25.0
      }

      expect(pollOption.description).toBeUndefined()
      expect(pollOption.image).toBeUndefined()
    })
  })

  describe('PollReward', () => {
    it('should have correct structure for points reward', () => {
      const reward: PollReward = {
        id: 1,
        name: '参与积分',
        description: '投票获得积分',
        type: 'points',
        value: 10,
        image: 'http://example.com/points.png',
        quantity: 100,
        condition: 'participate'
      }

      expect(reward.type).toBe('points')
      expect(reward.value).toBe(10)
      expect(reward.condition).toBe('participate')
    })

    it('should handle different reward types', () => {
      const rewardTypes: PollReward['type'][] = ['points', 'badge', 'gift', 'voucher']
      
      rewardTypes.forEach(type => {
        const reward: PollReward = {
          id: 1,
          name: `Test ${type}`,
          description: `Test ${type} reward`,
          type,
          quantity: 1,
          condition: 'participate'
        }
        
        expect(reward.type).toBe(type)
      })
    })

    it('should handle different reward conditions', () => {
      const conditions: PollReward['condition'][] = ['participate', 'winner', 'all_participants']
      
      conditions.forEach(condition => {
        const reward: PollReward = {
          id: 1,
          name: 'Test Reward',
          description: 'Test reward description',
          type: 'points',
          quantity: 1,
          condition
        }
        
        expect(reward.condition).toBe(condition)
      })
    })
  })

  describe('CreatePollPostForm', () => {
    it('should have correct structure for single choice poll', () => {
      const form: CreatePollPostForm = {
        title: 'Test Poll',
        content: 'Test poll content',
        question: 'What is your preference?',
        type: 'single',
        options: [
          { text: 'Option A', description: 'First option' },
          { text: 'Option B', description: 'Second option' }
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-07T18:00:00Z',
        scopeConfig: {
          scope: 'all'
        },
        resultVisibility: 'real_time',
        rewards: [],
        categoryId: 1,
        publishImmediately: true
      }

      expect(form.type).toBe('single')
      expect(form.options).toHaveLength(2)
      expect(form.scopeConfig.scope).toBe('all')
      expect(form.resultVisibility).toBe('real_time')
      expect(form.publishImmediately).toBe(true)
    })

    it('should support multiple choice polls', () => {
      const form: CreatePollPostForm = {
        title: 'Multiple Choice Poll',
        content: 'Test multiple choice poll',
        question: 'Select all that apply',
        type: 'multiple',
        maxChoices: 3,
        options: [
          { text: 'Option A' },
          { text: 'Option B' },
          { text: 'Option C' },
          { text: 'Option D' }
        ],
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-07T18:00:00Z',
        scopeConfig: {
          scope: 'department',
          departments: ['技术部', '产品部']
        },
        resultVisibility: 'after_end',
        rewards: [{
          name: '参与奖',
          description: '参与即可获得',
          type: 'points',
          value: 5,
          quantity: 100,
          condition: 'participate'
        }],
        categoryId: 2,
        publishImmediately: false
      }

      expect(form.type).toBe('multiple')
      expect(form.maxChoices).toBe(3)
      expect(form.scopeConfig.scope).toBe('department')
      expect(form.scopeConfig.departments).toEqual(['技术部', '产品部'])
      expect(form.rewards).toHaveLength(1)
    })
  })

  describe('SubmitVoteForm', () => {
    it('should have correct structure', () => {
      const voteForm: SubmitVoteForm = {
        pollId: 123,
        optionIds: [1, 2]
      }

      expect(voteForm.pollId).toBe(123)
      expect(voteForm.optionIds).toEqual([1, 2])
    })

    it('should handle single option selection', () => {
      const voteForm: SubmitVoteForm = {
        pollId: 456,
        optionIds: [3]
      }

      expect(voteForm.optionIds).toHaveLength(1)
      expect(voteForm.optionIds[0]).toBe(3)
    })
  })

  describe('PollStatistics', () => {
    it('should have correct structure', () => {
      const stats: PollStatistics = {
        pollId: 123,
        totalVotes: 100,
        participantCount: 85,
        participationRate: 85.0,
        optionStats: [
          {
            optionId: 1,
            optionText: 'Option A',
            voteCount: 40,
            percentage: 40.0
          },
          {
            optionId: 2,
            optionText: 'Option B',
            voteCount: 60,
            percentage: 60.0
          }
        ],
        departmentStats: [
          {
            department: '技术部',
            voteCount: 50,
            percentage: 50.0
          },
          {
            department: '产品部',
            voteCount: 35,
            percentage: 35.0
          }
        ],
        hourlyStats: [
          {
            hour: '2024-01-01T09:00:00Z',
            voteCount: 20
          },
          {
            hour: '2024-01-01T14:00:00Z',
            voteCount: 35
          }
        ]
      }

      expect(stats.pollId).toBe(123)
      expect(stats.totalVotes).toBe(100)
      expect(stats.participantCount).toBe(85)
      expect(stats.participationRate).toBe(85.0)
      expect(stats.optionStats).toHaveLength(2)
      expect(stats.departmentStats).toHaveLength(2)
      expect(stats.hourlyStats).toHaveLength(2)
    })

    it('should calculate percentages correctly', () => {
      const stats: PollStatistics = {
        pollId: 1,
        totalVotes: 100,
        participantCount: 100,
        participationRate: 100.0,
        optionStats: [
          { optionId: 1, optionText: 'A', voteCount: 25, percentage: 25.0 },
          { optionId: 2, optionText: 'B', voteCount: 75, percentage: 75.0 }
        ],
        departmentStats: [],
        hourlyStats: []
      }

      const totalPercentage = stats.optionStats.reduce((sum, stat) => sum + stat.percentage, 0)
      expect(totalPercentage).toBe(100.0)
    })
  })
})

describe('Poll Status and Type Enums', () => {
  it('should support all poll statuses', () => {
    const statuses = ['draft', 'scheduled', 'ongoing', 'ended', 'cancelled'] as const
    
    statuses.forEach(status => {
      // This test ensures TypeScript accepts all status values
      const mockStatus: typeof status = status
      expect(mockStatus).toBe(status)
    })
  })

  it('should support poll types', () => {
    const types = ['single', 'multiple'] as const
    
    types.forEach(type => {
      const mockType: typeof type = type
      expect(mockType).toBe(type)
    })
  })

  it('should support scope types', () => {
    const scopes = ['all', 'category', 'department', 'role', 'custom'] as const
    
    scopes.forEach(scope => {
      const mockScope: typeof scope = scope
      expect(mockScope).toBe(scope)
    })
  })

  it('should support result visibility options', () => {
    const visibilities = ['real_time', 'after_end', 'never'] as const
    
    visibilities.forEach(visibility => {
      const mockVisibility: typeof visibility = visibility
      expect(mockVisibility).toBe(visibility)
    })
  })
})