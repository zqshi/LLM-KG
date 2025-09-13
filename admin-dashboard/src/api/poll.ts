/**
 * 投票帖功能API接口
 * 
 * 提供完整的投票帖CRUD操作、投票功能、统计分析等
 */

import { apiAdapter } from './adapter'
import { polls } from '@/services/staticData'
import type {
  PollPost,
  PollPostListItem,
  CreatePollPostForm,
  UpdatePollPostForm,
  SubmitVoteForm,
  UserPollVote,
  PollStatistics,
  PollQueryParams,
  VoteRecordQueryParams,
  PollBatchOperation,
  PollResultExport,
  PollNotificationConfig,
  PollApiResponse,
  PaginatedPollResponse
} from '@/types/poll'

// HTTP请求工具
import { request } from './request'

/**
 * 管理端API - 投票帖管理
 */
class PollAdminAPI {
  
  /**
   * 获取投票帖列表
   */
  static async getPollPosts(params: PollQueryParams): Promise<PaginatedPollResponse<PollPostListItem>> {
    return apiAdapter.get(
      () => request.get('/admin/polls', { params }),
      async () => {
        const allPolls = await polls()
        return { list: allPolls, total: allPolls.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  }
  
  /**
   * 获取投票帖详情
   */
  static async getPollPost(id: number): Promise<PollApiResponse<PollPost>> {
    return apiAdapter.get(
      () => request.get(`/admin/polls/${id}`),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return poll
      }
    )
  }
  
  /**
   * 创建投票帖
   */
  static async createPollPost(data: CreatePollPostForm): Promise<PollApiResponse<PollPost>> {
    return apiAdapter.post(
      () => request.post('/admin/polls', data),
      async () => ({
        id: Date.now(),
        title: data.title,
        content: data.content,
        options: data.options,
        type: data.type || 'single',
        anonymous: data.anonymous || false,
        allowChangeVote: data.allowChangeVote || false,
        showResultsBeforeEnd: data.showResultsBeforeEnd || false,
        startTime: data.startTime || new Date().toISOString(),
        endTime: data.endTime,
        status: 'draft',
        categoryId: data.categoryId,
        categoryName: '默认分类',
        author: {
          id: 1,
          username: 'admin',
          name: '管理员',
          avatar: ''
        },
        totalVotes: 0,
        participantCount: 0,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      })
    )
  }
  
  /**
   * 更新投票帖
   */
  static async updatePollPost(data: UpdatePollPostForm): Promise<PollApiResponse<PollPost>> {
    return apiAdapter.put(
      () => request.put(`/admin/polls/${data.id}`, data),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === data.id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return {
          ...poll,
          ...data,
          updateTime: new Date().toISOString()
        }
      }
    )
  }
  
  /**
   * 删除投票帖
   */
  static async deletePollPost(id: number): Promise<PollApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete(`/admin/polls/${id}`),
      async () => undefined
    )
  }
  
  /**
   * 发布投票帖
   */
  static async publishPollPost(id: number): Promise<PollApiResponse<PollPost>> {
    return apiAdapter.post(
      () => request.post(`/admin/polls/${id}/publish`),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return {
          ...poll,
          status: 'ongoing',
          updateTime: new Date().toISOString()
        }
      }
    )
  }
  
  /**
   * 结束投票帖
   */
  static async endPollPost(id: number, reason?: string): Promise<PollApiResponse<PollPost>> {
    return apiAdapter.post(
      () => request.post(`/admin/polls/${id}/end`, { reason }),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return {
          ...poll,
          status: 'ended',
          endReason: reason,
          updateTime: new Date().toISOString()
        }
      }
    )
  }
  
  /**
   * 取消投票帖
   */
  static async cancelPollPost(id: number, reason: string): Promise<PollApiResponse<PollPost>> {
    return apiAdapter.post(
      () => request.post(`/admin/polls/${id}/cancel`, { reason }),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return {
          ...poll,
          status: 'cancelled',
          cancelReason: reason,
          updateTime: new Date().toISOString()
        }
      }
    )
  }
  
  /**
   * 批量操作投票帖
   */
  static async batchOperation(data: PollBatchOperation): Promise<PollApiResponse<void>> {
    return apiAdapter.post(
      () => request.post('/admin/polls/batch', data),
      async () => undefined
    )
  }
  
  /**
   * 获取投票统计数据
   */
  static async getPollStatistics(pollId: number): Promise<PollApiResponse<PollStatistics>> {
    return apiAdapter.get(
      () => request.get(`/admin/polls/${pollId}/statistics`),
      async () => ({
        totalVotes: 256,
        participantCount: 189,
        participationRate: 73.8,
        optionStats: [
          { optionId: 1, optionText: '选项A', voteCount: 128, percentage: 50.0 },
          { optionId: 2, optionText: '选项B', voteCount: 78, percentage: 30.5 },
          { optionId: 3, optionText: '选项C', voteCount: 50, percentage: 19.5 }
        ],
        demographics: {
          byDepartment: [
            { department: '技术部', count: 89, percentage: 47.1 },
            { department: '产品部', count: 56, percentage: 29.6 },
            { department: '运营部', count: 44, percentage: 23.3 }
          ]
        },
        timeline: [
          { date: '2024-01-15', votes: 45 },
          { date: '2024-01-16', votes: 89 },
          { date: '2024-01-17', votes: 122 }
        ]
      })
    )
  }
  
  /**
   * 获取投票记录列表
   */
  static async getVoteRecords(params: VoteRecordQueryParams): Promise<PaginatedPollResponse<UserPollVote>> {
    return apiAdapter.get(
      () => request.get('/admin/polls/votes', { params }),
      async () => ({
        list: [
          {
            id: 1,
            pollId: 1,
            userId: 1,
            userName: '张三',
            selectedOptions: [1],
            voteTime: new Date().toISOString(),
            ipAddress: '192.168.1.100'
          },
          {
            id: 2,
            pollId: 1,
            userId: 2,
            userName: '李四',
            selectedOptions: [2],
            voteTime: new Date().toISOString(),
            ipAddress: '192.168.1.101'
          }
        ],
        total: 2
      }),
      { mockPagination: true, paginationParams: params }
    )
  }
  
  /**
   * 导出投票结果
   */
  static async exportPollResult(data: PollResultExport): Promise<Blob> {
    return apiAdapter.post(
      () => request.post(`/admin/polls/${data.pollId}/export`, data, {
        responseType: 'blob'
      }),
      async () => new Blob(['投票结果导出数据'], { type: 'text/plain' })
    ).then(response => response.data)
  }
  
  /**
   * 获取投票帖通知配置
   */
  static async getNotificationConfig(pollId: number): Promise<PollApiResponse<PollNotificationConfig>> {
    return apiAdapter.get(
      () => request.get(`/admin/polls/${pollId}/notification-config`),
      async () => ({
        pollId,
        enableNotification: true,
        notifyOnStart: true,
        notifyOnEnd: true,
        reminderBeforeEnd: 24,
        customMessage: ''
      })
    )
  }
  
  /**
   * 更新投票帖通知配置
   */
  static async updateNotificationConfig(config: PollNotificationConfig): Promise<PollApiResponse<void>> {
    return apiAdapter.put(
      () => request.put(`/admin/polls/${config.pollId}/notification-config`, config),
      async () => undefined
    )
  }
  
  /**
   * 手动发送投票提醒
   */
  static async sendVoteReminder(pollId: number, message?: string): Promise<PollApiResponse<void>> {
    return apiAdapter.post(
      () => request.post(`/admin/polls/${pollId}/send-reminder`, { message }),
      async () => undefined
    )
  }
  
  /**
   * 获取投票帖概览统计
   */
  static async getOverviewStats(): Promise<PollApiResponse<{
    totalPolls: number
    ongoingPolls: number
    endedPolls: number
    totalVotes: number
    avgParticipationRate: number
    todayPolls: number
    todayVotes: number
  }>> {
    return apiAdapter.get(
      () => request.get('/admin/polls/overview-stats'),
      async () => ({
        totalPolls: 45,
        ongoingPolls: 12,
        endedPolls: 28,
        totalVotes: 3456,
        avgParticipationRate: 68.5,
        todayPolls: 3,
        todayVotes: 89
      })
    )
  }
}

/**
 * 用户端API - 投票参与
 */
class PollUserAPI {
  
  /**
   * 获取用户可见的投票帖列表
   */
  static async getUserPolls(params: {
    page: number
    pageSize: number
    categoryId?: number
    status?: 'ongoing' | 'ended'
    hasRewards?: boolean
  }): Promise<PaginatedPollResponse<PollPostListItem>> {
    return apiAdapter.get(
      () => request.get('/user/polls', { params }),
      async () => {
        const allPolls = await polls()
        const filtered = allPolls.filter(poll => {
          if (params.status && poll.status !== params.status) return false
          if (params.categoryId && poll.categoryId !== params.categoryId) return false
          return true
        })
        return { list: filtered, total: filtered.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  }
  
  /**
   * 获取投票帖详情（用户视角）
   */
  static async getPollDetail(id: number): Promise<PollApiResponse<PollPost & {
    userVoted: boolean
    userVote?: UserPollVote
    canVote: boolean
    canViewResult: boolean
  }>> {
    return apiAdapter.get(
      () => request.get(`/user/polls/${id}`),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return {
          ...poll,
          userVoted: false,
          canVote: true,
          canViewResult: true
        }
      }
    )
  }
  
  /**
   * 提交投票
   */
  static async submitVote(data: SubmitVoteForm): Promise<PollApiResponse<{
    success: boolean
    vote: UserPollVote
    updatedPoll: PollPost
  }>> {
    return apiAdapter.post(
      () => request.post('/user/polls/vote', data),
      async () => {
        const allPolls = await polls()
        const poll = allPolls.find(p => p.id === data.pollId)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        const vote: UserPollVote = {
          id: Date.now(),
          pollId: data.pollId,
          userId: 1,
          userName: '当前用户',
          selectedOptions: data.selectedOptions,
          voteTime: new Date().toISOString(),
          ipAddress: '127.0.0.1'
        }
        const updatedPoll = {
          ...poll,
          totalVotes: poll.totalVotes + 1,
          participantCount: poll.participantCount + 1
        }
        return {
          success: true,
          vote,
          updatedPoll
        }
      }
    )
  }
  
  /**
   * 取消投票（如果允许）
   */
  static async cancelVote(pollId: number): Promise<PollApiResponse<void>> {
    return apiAdapter.delete(
      () => request.delete(`/user/polls/${pollId}/vote`),
      async () => undefined
    )
  }
  
  /**
   * 获取用户投票历史
   */
  static async getUserVoteHistory(params: {
    page: number
    pageSize: number
    dateRange?: [string, string]
  }): Promise<PaginatedPollResponse<UserPollVote & {
    pollTitle: string
    pollStatus: string
  }>> {
    return apiAdapter.get(
      () => request.get('/user/polls/my-votes', { params }),
      async () => ({
        list: [
          {
            id: 1,
            pollId: 1,
            userId: 1,
            userName: '当前用户',
            selectedOptions: [1],
            voteTime: new Date().toISOString(),
            ipAddress: '127.0.0.1',
            pollTitle: '团队建设活动投票',
            pollStatus: 'ongoing'
          }
        ],
        total: 1
      }),
      { mockPagination: true, paginationParams: params }
    )
  }
  
  /**
   * 检查用户投票权限
   */
  static async checkVotePermission(pollId: number): Promise<PollApiResponse<{
    canVote: boolean
    reason?: string
  }>> {
    return apiAdapter.get(
      () => request.get(`/user/polls/${pollId}/check-permission`),
      async () => ({
        canVote: true
      })
    )
  }
  
  /**
   * 获取投票结果（如果有权限）
   */
  static async getPollResult(pollId: number): Promise<PollApiResponse<PollStatistics>> {
    return apiAdapter.get(
      () => request.get(`/user/polls/${pollId}/result`),
      async () => ({
        totalVotes: 256,
        participantCount: 189,
        participationRate: 73.8,
        optionStats: [
          { optionId: 1, optionText: '选项A', voteCount: 128, percentage: 50.0 },
          { optionId: 2, optionText: '选项B', voteCount: 78, percentage: 30.5 },
          { optionId: 3, optionText: '选项C', voteCount: 50, percentage: 19.5 }
        ],
        demographics: {
          byDepartment: [
            { department: '技术部', count: 89, percentage: 47.1 },
            { department: '产品部', count: 56, percentage: 29.6 },
            { department: '运营部', count: 44, percentage: 23.3 }
          ]
        },
        timeline: [
          { date: '2024-01-15', votes: 45 },
          { date: '2024-01-16', votes: 89 },
          { date: '2024-01-17', votes: 122 }
        ]
      })
    )
  }
}

/**
 * 通用API - 投票帖相关工具
 */
class PollCommonAPI {
  
  /**
   * 搜索用户（用于自定义权限范围）
   */
  static async searchUsers(keyword: string, limit: number = 20): Promise<PollApiResponse<{
    id: number
    name: string
    department: string
    avatar?: string
  }[]>> {
    return apiAdapter.get(
      () => request.get('/common/users/search', {
        params: { keyword, limit }
      }),
      async () => [
        { id: 1, name: '张三', department: '技术部', avatar: '' },
        { id: 2, name: '李四', department: '产品部', avatar: '' },
        { id: 3, name: '王五', department: '运营部', avatar: '' }
      ].filter(user => user.name.includes(keyword)).slice(0, limit)
    )
  }
  
  /**
   * 获取部门列表
   */
  static async getDepartments(): Promise<PollApiResponse<{
    id: string
    name: string
    parentId?: string
  }[]>> {
    return apiAdapter.get(
      () => request.get('/common/departments'),
      async () => [
        { id: '1', name: '技术部' },
        { id: '2', name: '产品部' },
        { id: '3', name: '运营部' },
        { id: '4', name: '市场部' }
      ]
    )
  }
  
  /**
   * 获取角色列表
   */
  static async getRoles(): Promise<PollApiResponse<{
    id: number
    name: string
    code: string
  }[]>> {
    return apiAdapter.get(
      () => request.get('/common/roles'),
      async () => [
        { id: 1, name: '管理员', code: 'admin' },
        { id: 2, name: '普通用户', code: 'user' },
        { id: 3, name: '审核员', code: 'moderator' }
      ]
    )
  }
  
  /**
   * 获取版块列表
   */
  static async getCategories(): Promise<PollApiResponse<{
    id: number
    name: string
    code: string
  }[]>> {
    return apiAdapter.get(
      () => request.get('/common/categories'),
      async () => [
        { id: 1, name: '技术讨论', code: 'tech' },
        { id: 2, name: '产品交流', code: 'product' },
        { id: 3, name: '团队建设', code: 'team' }
      ]
    )
  }
  
  /**
   * 上传投票选项图片
   */
  static async uploadOptionImage(file: File): Promise<PollApiResponse<{
    url: string
    filename: string
  }>> {
    return apiAdapter.post(
      () => {
        const formData = new FormData()
        formData.append('file', file)
        return request.post('/common/upload/poll-option', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      },
      async () => ({
        url: '/mock/poll-options/' + file.name,
        filename: file.name
      })
    )
  }
  
  /**
   * 预览投票帖内容
   */
  static async previewPollContent(content: string): Promise<PollApiResponse<{
    html: string
  }>> {
    return apiAdapter.post(
      () => request.post('/common/preview/poll-content', { content }),
      async () => ({
        html: `<p>${content}</p>`
      })
    )
  }
  
  /**
   * 验证投票帖配置
   */
  static async validatePollConfig(config: CreatePollPostForm): Promise<PollApiResponse<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }>> {
    return apiAdapter.post(
      () => request.post('/common/validate/poll-config', config),
      async () => ({
        valid: true,
        errors: [],
        warnings: []
      })
    )
  }
}

// 导出所有API类
export { PollAdminAPI, PollUserAPI, PollCommonAPI }

// 默认导出管理端API（主要使用）
export default PollAdminAPI