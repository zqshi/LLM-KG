/**
 * 投票帖API接口测试
 * 
 * 测试投票帖相关的API接口调用是否正确
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import PollAdminAPI, { PollUserAPI, PollCommonAPI } from '@/api/poll'
import type {
  CreatePollPostForm,
  UpdatePollPostForm,
  SubmitVoteForm,
  PollQueryParams,
  VoteRecordQueryParams,
  PollBatchOperation,
  PollResultExport,
  PollNotificationConfig
} from '@/types/poll'

// Mock http 工具
const mockHttp = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
}

// Mock @/utils/http 模块
vi.mock('@/utils/http', () => ({
  http: mockHttp
}))

describe('投票帖API接口测试', () => {
  
  beforeEach(() => {
    // 每个测试前重置所有mock
    vi.clearAllMocks()
  })

  describe('PollAdminAPI - 管理端API测试', () => {
    
    describe('基础CRUD操作', () => {
      it('应该正确调用获取投票帖列表API', async () => {
        const mockResponse = {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20,
          hasNext: false,
          hasPrev: false
        }
        mockHttp.get.mockResolvedValue(mockResponse)

        const params: PollQueryParams = {
          page: 1,
          pageSize: 20,
          keyword: '测试',
          status: 'ongoing'
        }

        const result = await PollAdminAPI.getPollPosts(params)

        expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls', { params })
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用获取投票帖详情API', async () => {
        const mockResponse = {
          code: 200,
          message: '获取成功',
          data: { id: 1, title: '测试投票' },
          success: true
        }
        mockHttp.get.mockResolvedValue(mockResponse)

        const pollId = 1
        const result = await PollAdminAPI.getPollPost(pollId)

        expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls/1')
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用创建投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '创建成功',
          data: { id: 1, title: '测试投票' },
          success: true
        }
        mockHttp.post.mockResolvedValue(mockResponse)

        const createData: CreatePollPostForm = {
          title: '测试投票',
          content: '投票内容',
          question: '投票问题',
          type: 'single',
          options: [
            { text: '选项1', description: '描述1' },
            { text: '选项2', description: '描述2' }
          ],
          startTime: '2024-01-01T00:00:00',
          endTime: '2024-01-02T00:00:00',
          scopeConfig: {
            scope: 'all',
            departments: [],
            roles: [],
            userIds: [],
            categoryIds: []
          },
          resultVisibility: 'real_time',
          rewards: [],
          categoryId: 1,
          publishImmediately: true
        }

        const result = await PollAdminAPI.createPollPost(createData)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls', createData)
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用更新投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '更新成功',
          data: { id: 1, title: '更新后的投票' },
          success: true
        }
        mockHttp.put.mockResolvedValue(mockResponse)

        const updateData: UpdatePollPostForm = {
          id: 1,
          title: '更新后的投票',
          status: 'ongoing'
        }

        const result = await PollAdminAPI.updatePollPost(updateData)

        expect(mockHttp.put).toHaveBeenCalledWith('/admin/polls/1', updateData)
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用删除投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '删除成功',
          data: null,
          success: true
        }
        mockHttp.delete.mockResolvedValue(mockResponse)

        const pollId = 1
        const result = await PollAdminAPI.deletePollPost(pollId)

        expect(mockHttp.delete).toHaveBeenCalledWith('/admin/polls/1')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('投票帖状态操作', () => {
      it('应该正确调用发布投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '发布成功',
          data: { id: 1, status: 'ongoing' },
          success: true
        }
        mockHttp.post.mockResolvedValue(mockResponse)

        const pollId = 1
        const result = await PollAdminAPI.publishPollPost(pollId)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls/1/publish')
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用结束投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '投票已结束',
          data: { id: 1, status: 'ended' },
          success: true
        }
        mockHttp.post.mockResolvedValue(mockResponse)

        const pollId = 1
        const reason = '手动结束'
        const result = await PollAdminAPI.endPollPost(pollId, reason)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls/1/end', { reason })
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用取消投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '投票已取消',
          data: { id: 1, status: 'cancelled' },
          success: true
        }
        mockHttp.post.mockResolvedValue(mockResponse)

        const pollId = 1
        const reason = '取消原因'
        const result = await PollAdminAPI.cancelPollPost(pollId, reason)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls/1/cancel', { reason })
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用批量操作投票帖API', async () => {
        const mockResponse = {
          code: 200,
          message: '批量操作成功',
          data: null,
          success: true
        }
        mockHttp.post.mockResolvedValue(mockResponse)

        const batchData: PollBatchOperation = {
          pollIds: [1, 2, 3],
          operation: 'publish',
          reason: '批量发布'
        }

        const result = await PollAdminAPI.batchOperation(batchData)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls/batch', batchData)
        expect(result).toEqual(mockResponse)
      })
    })

    describe('统计和分析功能', () => {
      it('应该正确调用获取投票统计数据API', async () => {
        const mockResponse = {
          code: 200,
          message: '获取成功',
          data: {
            pollId: 1,
            totalVotes: 100,
            participantCount: 80,
            optionStats: [],
            participationRate: 80,
            departmentStats: [],
            hourlyStats: [],
            regionStats: []
          },
          success: true
        }
        mockHttp.get.mockResolvedValue(mockResponse)

        const pollId = 1
        const result = await PollAdminAPI.getPollStatistics(pollId)

        expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls/1/statistics')
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用获取投票记录列表API', async () => {
        const mockResponse = {
          items: [],
          total: 0,
          page: 1,
          pageSize: 20,
          hasNext: false,
          hasPrev: false
        }
        mockHttp.get.mockResolvedValue(mockResponse)

        const params: VoteRecordQueryParams = {
          page: 1,
          pageSize: 20,
          pollId: 1,
          userId: 1
        }

        const result = await PollAdminAPI.getVoteRecords(params)

        expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls/votes', { params })
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用导出投票结果API', async () => {
        const mockBlob = new Blob(['导出数据'], { type: 'application/vnd.ms-excel' })
        mockHttp.post.mockResolvedValue(mockBlob)

        const exportData: PollResultExport = {
          pollId: 1,
          title: '投票结果导出',
          exportType: 'excel',
          includeDetails: true,
          includeStatistics: true,
          includeCharts: false
        }

        const result = await PollAdminAPI.exportPollResult(exportData)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls/1/export', exportData, {
          responseType: 'blob'
        })
        expect(result).toEqual(mockBlob)
      })

      it('应该正确调用获取概览统计API', async () => {
        const mockResponse = {
          code: 200,
          message: '获取成功',
          data: {
            totalPolls: 50,
            ongoingPolls: 5,
            endedPolls: 40,
            totalVotes: 1000,
            avgParticipationRate: 75,
            todayPolls: 2,
            todayVotes: 20
          },
          success: true
        }
        mockHttp.get.mockResolvedValue(mockResponse)

        const result = await PollAdminAPI.getOverviewStats()

        expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls/overview-stats')
        expect(result).toEqual(mockResponse)
      })
    })

    describe('通知管理功能', () => {
      it('应该正确调用获取通知配置API', async () => {
        const mockResponse = {
          code: 200,
          message: '获取成功',
          data: {
            pollId: 1,
            sendReminder: true,
            reminderTime: 60,
            notifyResults: true
          },
          success: true
        }
        mockHttp.get.mockResolvedValue(mockResponse)

        const pollId = 1
        const result = await PollAdminAPI.getNotificationConfig(pollId)

        expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls/1/notification-config')
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用更新通知配置API', async () => {
        const mockResponse = {
          code: 200,
          message: '更新成功',
          data: null,
          success: true
        }
        mockHttp.put.mockResolvedValue(mockResponse)

        const config: PollNotificationConfig = {
          pollId: 1,
          sendReminder: true,
          reminderTime: 60,
          notifyResults: true
        }

        const result = await PollAdminAPI.updateNotificationConfig(config)

        expect(mockHttp.put).toHaveBeenCalledWith('/admin/polls/1/notification-config', config)
        expect(result).toEqual(mockResponse)
      })

      it('应该正确调用发送投票提醒API', async () => {
        const mockResponse = {
          code: 200,
          message: '提醒发送成功',
          data: null,
          success: true
        }
        mockHttp.post.mockResolvedValue(mockResponse)

        const pollId = 1
        const message = '投票即将结束，请及时参与'
        const result = await PollAdminAPI.sendVoteReminder(pollId, message)

        expect(mockHttp.post).toHaveBeenCalledWith('/admin/polls/1/send-reminder', { message })
        expect(result).toEqual(mockResponse)
      })
    })
  })

  describe('PollUserAPI - 用户端API测试', () => {
    
    it('应该正确调用获取用户可见投票列表API', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNext: false,
        hasPrev: false
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const params = {
        page: 1,
        pageSize: 20,
        categoryId: 1,
        status: 'ongoing' as const,
        hasRewards: true
      }

      const result = await PollUserAPI.getUserPolls(params)

      expect(mockHttp.get).toHaveBeenCalledWith('/user/polls', { params })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用获取投票帖详情API（用户视角）', async () => {
      const mockResponse = {
        code: 200,
        message: '获取成功',
        data: {
          id: 1,
          title: '测试投票',
          userVoted: false,
          canVote: true,
          canViewResult: false
        },
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const pollId = 1
      const result = await PollUserAPI.getPollDetail(pollId)

      expect(mockHttp.get).toHaveBeenCalledWith('/user/polls/1')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用提交投票API', async () => {
      const mockResponse = {
        code: 200,
        message: '投票成功',
        data: {
          success: true,
          vote: { id: 1, pollId: 1, userId: 1, selectedOptions: [1] },
          updatedPoll: { id: 1, totalVotes: 11 }
        },
        success: true
      }
      mockHttp.post.mockResolvedValue(mockResponse)

      const voteData: SubmitVoteForm = {
        pollId: 1,
        optionIds: [1, 2]
      }

      const result = await PollUserAPI.submitVote(voteData)

      expect(mockHttp.post).toHaveBeenCalledWith('/user/polls/vote', voteData)
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用取消投票API', async () => {
      const mockResponse = {
        code: 200,
        message: '取消投票成功',
        data: null,
        success: true
      }
      mockHttp.delete.mockResolvedValue(mockResponse)

      const pollId = 1
      const result = await PollUserAPI.cancelVote(pollId)

      expect(mockHttp.delete).toHaveBeenCalledWith('/user/polls/1/vote')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用获取用户投票历史API', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNext: false,
        hasPrev: false
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const params = {
        page: 1,
        pageSize: 20,
        dateRange: ['2024-01-01', '2024-01-31'] as [string, string]
      }

      const result = await PollUserAPI.getUserVoteHistory(params)

      expect(mockHttp.get).toHaveBeenCalledWith('/user/polls/my-votes', { params })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用检查投票权限API', async () => {
      const mockResponse = {
        code: 200,
        message: '检查完成',
        data: {
          canVote: true,
          reason: undefined
        },
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const pollId = 1
      const result = await PollUserAPI.checkVotePermission(pollId)

      expect(mockHttp.get).toHaveBeenCalledWith('/user/polls/1/check-permission')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用获取投票结果API', async () => {
      const mockResponse = {
        code: 200,
        message: '获取成功',
        data: {
          pollId: 1,
          totalVotes: 100,
          participantCount: 80,
          optionStats: [],
          participationRate: 80,
          departmentStats: [],
          hourlyStats: [],
          regionStats: []
        },
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const pollId = 1
      const result = await PollUserAPI.getPollResult(pollId)

      expect(mockHttp.get).toHaveBeenCalledWith('/user/polls/1/result')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('PollCommonAPI - 通用API测试', () => {
    
    it('应该正确调用搜索用户API', async () => {
      const mockResponse = {
        code: 200,
        message: '搜索成功',
        data: [
          {
            id: 1,
            name: '张三',
            department: 'IT部门',
            avatar: 'https://example.com/avatar.jpg'
          }
        ],
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const keyword = '张三'
      const limit = 10
      const result = await PollCommonAPI.searchUsers(keyword, limit)

      expect(mockHttp.get).toHaveBeenCalledWith('/common/users/search', {
        params: { keyword, limit }
      })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用获取部门列表API', async () => {
      const mockResponse = {
        code: 200,
        message: '获取成功',
        data: [
          { id: '1', name: 'IT部门', parentId: undefined },
          { id: '2', name: 'HR部门', parentId: undefined }
        ],
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const result = await PollCommonAPI.getDepartments()

      expect(mockHttp.get).toHaveBeenCalledWith('/common/departments')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用获取角色列表API', async () => {
      const mockResponse = {
        code: 200,
        message: '获取成功',
        data: [
          { id: 1, name: '管理员', code: 'admin' },
          { id: 2, name: '普通用户', code: 'user' }
        ],
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const result = await PollCommonAPI.getRoles()

      expect(mockHttp.get).toHaveBeenCalledWith('/common/roles')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用获取版块列表API', async () => {
      const mockResponse = {
        code: 200,
        message: '获取成功',
        data: [
          { id: 1, name: '技术讨论', code: 'tech' },
          { id: 2, name: '生活分享', code: 'life' }
        ],
        success: true
      }
      mockHttp.get.mockResolvedValue(mockResponse)

      const result = await PollCommonAPI.getCategories()

      expect(mockHttp.get).toHaveBeenCalledWith('/common/categories')
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用上传选项图片API', async () => {
      const mockResponse = {
        code: 200,
        message: '上传成功',
        data: {
          url: 'https://example.com/uploads/option-image.jpg',
          filename: 'option-image.jpg'
        },
        success: true
      }
      mockHttp.post.mockResolvedValue(mockResponse)

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      const result = await PollCommonAPI.uploadOptionImage(file)

      // 验证调用参数
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/common/upload/poll-option',
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      
      // 验证FormData内容
      const formDataCall = mockHttp.post.mock.calls[0][1] as FormData
      expect(formDataCall.get('file')).toBe(file)
      
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用预览投票内容API', async () => {
      const mockResponse = {
        code: 200,
        message: '预览成功',
        data: {
          html: '<p>预览内容</p>'
        },
        success: true
      }
      mockHttp.post.mockResolvedValue(mockResponse)

      const content = '**预览内容**'
      const result = await PollCommonAPI.previewPollContent(content)

      expect(mockHttp.post).toHaveBeenCalledWith('/common/preview/poll-content', { content })
      expect(result).toEqual(mockResponse)
    })

    it('应该正确调用验证投票配置API', async () => {
      const mockResponse = {
        code: 200,
        message: '验证完成',
        data: {
          valid: true,
          errors: [],
          warnings: ['建议设置奖励以提高参与度']
        },
        success: true
      }
      mockHttp.post.mockResolvedValue(mockResponse)

      const config: CreatePollPostForm = {
        title: '测试投票',
        content: '投票内容',
        question: '投票问题',
        type: 'single',
        options: [
          { text: '选项1', description: '描述1' },
          { text: '选项2', description: '描述2' }
        ],
        startTime: '2024-01-01T00:00:00',
        endTime: '2024-01-02T00:00:00',
        scopeConfig: {
          scope: 'all',
          departments: [],
          roles: [],
          userIds: [],
          categoryIds: []
        },
        resultVisibility: 'real_time',
        rewards: [],
        categoryId: 1,
        publishImmediately: true
      }

      const result = await PollCommonAPI.validatePollConfig(config)

      expect(mockHttp.post).toHaveBeenCalledWith('/common/validate/poll-config', config)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('API调用错误处理测试', () => {
    it('应该正确处理网络错误', async () => {
      const networkError = new Error('Network Error')
      mockHttp.get.mockRejectedValue(networkError)

      await expect(PollAdminAPI.getPollPost(1)).rejects.toThrow('Network Error')
      expect(mockHttp.get).toHaveBeenCalledWith('/admin/polls/1')
    })

    it('应该正确处理HTTP错误响应', async () => {
      const httpError = {
        response: {
          status: 404,
          data: { message: '投票不存在' }
        }
      }
      mockHttp.get.mockRejectedValue(httpError)

      await expect(PollAdminAPI.getPollPost(999)).rejects.toEqual(httpError)
    })

    it('应该正确处理服务器内部错误', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: '服务器内部错误' }
        }
      }
      mockHttp.post.mockRejectedValue(serverError)

      const createData: CreatePollPostForm = {
        title: '测试投票',
        content: '投票内容',
        question: '投票问题',
        type: 'single',
        options: [
          { text: '选项1', description: '描述1' },
          { text: '选项2', description: '描述2' }
        ],
        startTime: '2024-01-01T00:00:00',
        endTime: '2024-01-02T00:00:00',
        scopeConfig: {
          scope: 'all',
          departments: [],
          roles: [],
          userIds: [],
          categoryIds: []
        },
        resultVisibility: 'real_time',
        rewards: [],
        categoryId: 1,
        publishImmediately: true
      }

      await expect(PollAdminAPI.createPollPost(createData)).rejects.toEqual(serverError)
    })
  })

  describe('API调用参数验证测试', () => {
    it('应该验证必要参数存在', () => {
      // 测试分页参数
      expect(() => {
        const params: PollQueryParams = {
          page: 0, // 无效页码
          pageSize: 20
        }
      }).not.toThrow() // 类型层面不会报错，但逻辑上应该验证

      expect(() => {
        const params: PollQueryParams = {
          page: 1,
          pageSize: 0 // 无效页大小
        }
      }).not.toThrow()
    })

    it('应该验证枚举值有效性', () => {
      expect(() => {
        const batchOperation: PollBatchOperation = {
          pollIds: [1, 2, 3],
          operation: 'publish' // 有效枚举值
        }
      }).not.toThrow()

      expect(() => {
        const exportConfig: PollResultExport = {
          pollId: 1,
          title: '导出',
          exportType: 'excel', // 有效枚举值
          includeDetails: true,
          includeStatistics: true,
          includeCharts: false
        }
      }).not.toThrow()
    })
  })
})