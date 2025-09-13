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
  PaginatedPollResponse,
  PollType
} from '@/types/poll'
import type { User } from '@/types'

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
    console.log('PollAdminAPI.getPollPosts called with params:', params)
    const response = await apiAdapter.get(
      () => request.get('/admin/polls', { params }).then(res => res.data),
      async () => {
        console.log('Loading static polls data...')
        const allPolls = await polls
        console.log('Loaded polls data:', allPolls)
        
        // 转换静态数据结构以匹配 PollPostListItem 接口
        const pollListItems: PollPostListItem[] = allPolls.map(poll => ({
          id: poll.id,
          title: poll.title,
          question: poll.description || '',
          status: poll.status === 1 ? 'ongoing' : 'ended',
          type: poll.type as PollType,
          startTime: poll.startTime,
          endTime: poll.endTime,
          totalVotes: poll.totalVotes,
          participantCount: poll.totalVotes, // 简单处理，实际应该有独立的参与人数统计
          hasRewards: false, // 静态数据中没有奖励信息
          creator: {
            id: poll.author.id,
            name: poll.author.name,
            username: poll.author.name,
            email: '',
            groupId: 1,
            status: 1,
            avatar: poll.author.avatar,
            roles: [],
            createTime: poll.createTime,
            updateTime: poll.updateTime || poll.createTime
          } as User,
          categoryName: poll.category?.name || '',
          createdAt: poll.createTime
        }))
        
        // 确保返回正确的分页格式
        return { 
          items: pollListItems,
          total: pollListItems.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          hasNext: false,
          hasPrev: false
        }
      },
      { mockPagination: true, paginationParams: params }
    )
    return response as unknown as PaginatedPollResponse<PollPostListItem>
  }
  
  /**
   * 获取投票帖详情
   */
  static async getPollPost(id: number): Promise<PollApiResponse<PollPost>> {
    const response = await apiAdapter.get(
      () => request.get(`/admin/polls/${id}`).then(res => res.data),
      async () => {
        const allPolls = await polls
        const poll = allPolls.find(p => p.id === id)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        return poll
      }
    )
    return response as unknown as PollApiResponse<PollPost>
  }
  
  /**
   * 创建投票帖
   */
  static async createPollPost(data: CreatePollPostForm): Promise<PollApiResponse<PollPost>> {
    const response = await apiAdapter.post(
      () => request.post('/admin/polls', data).then(res => res.data),
      async () => ({
        id: Date.now(),
        title: data.title,
        content: data.content,
        question: data.question,
        options: data.options,
        type: data.type || 'single',
        maxChoices: data.maxChoices,
        startTime: data.startTime || new Date().toISOString(),
        endTime: data.endTime,
        duration: 0,
        scopeConfig: data.scopeConfig,
        resultVisibility: data.resultVisibility,
        rewards: data.rewards,
        hasRewards: data.rewards && data.rewards.length > 0,
        status: 'draft',
        totalVotes: 0,
        participantCount: 0,
        viewCount: 0,
        creatorId: 1,
        creator: {
          id: 1,
          username: 'admin',
          name: '管理员',
          avatar: '',
          email: '',
          groupId: 1,
          status: 1,
          roles: [],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        },
        categoryId: data.categoryId,
        categoryName: '默认分类',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    )
    return response as unknown as PollApiResponse<PollPost>
  }
  
  /**
   * 更新投票帖
   */
  static async updatePollPost(data: UpdatePollPostForm): Promise<PollApiResponse<PollPost>> {
    const response = await apiAdapter.put(
      () => request.put(`/admin/polls/${data.id}`, data).then(res => res.data),
      data.id,
      async () => {
        const allPolls = await polls
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
    return response as unknown as PollApiResponse<PollPost>
  }
  
  /**
   * 删除投票帖
   */
  static async deletePollPost(id: number): Promise<PollApiResponse<void>> {
    const response = await apiAdapter.delete(
      () => request.delete(`/admin/polls/${id}`).then(res => res.data)
    )
    return response as unknown as PollApiResponse<void>
  }
  
  /**
   * 发布投票帖
   */
  static async publishPollPost(id: number): Promise<PollApiResponse<PollPost>> {
    const response = await apiAdapter.post(
      () => request.post(`/admin/polls/${id}/publish`).then(res => res.data),
      async () => {
        const allPolls = await polls
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
    return response as unknown as PollApiResponse<PollPost>
  }
  
  /**
   * 结束投票帖
   */
  static async endPollPost(id: number, reason?: string): Promise<PollApiResponse<PollPost>> {
    const response = await apiAdapter.post(
      () => request.post(`/admin/polls/${id}/end`, { reason }).then(res => res.data),
      async () => {
        const allPolls = await polls
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
    return response as unknown as PollApiResponse<PollPost>
  }
  
  /**
   * 取消投票帖
   */
  static async cancelPollPost(id: number, reason: string): Promise<PollApiResponse<PollPost>> {
    const response = await apiAdapter.post(
      () => request.post(`/admin/polls/${id}/cancel`, { reason }).then(res => res.data),
      async () => {
        const allPolls = await polls
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
    return response as unknown as PollApiResponse<PollPost>
  }
  
  /**
   * 批量操作投票帖
   */
  static async batchOperation(data: PollBatchOperation): Promise<PollApiResponse<void>> {
    const response = await apiAdapter.post(
      () => request.post('/admin/polls/batch', data).then(res => res.data),
      async () => undefined
    )
    return response as unknown as PollApiResponse<void>
  }
  
  /**
   * 获取投票统计数据
   */
  static async getPollStatistics(pollId: number): Promise<PollApiResponse<PollStatistics>> {
    const response = await apiAdapter.get(
      () => request.get(`/admin/polls/${pollId}/statistics`).then(res => res.data),
      async () => ({
        pollId,
        totalVotes: 256,
        participantCount: 189,
        participationRate: 73.8,
        optionStats: [
          { optionId: 1, optionText: '选项A', voteCount: 128, percentage: 50.0 },
          { optionId: 2, optionText: '选项B', voteCount: 78, percentage: 30.5 },
          { optionId: 3, optionText: '选项C', voteCount: 50, percentage: 19.5 }
        ],
        departmentStats: [
          { department: '技术部', voteCount: 89, percentage: 47.1 },
          { department: '产品部', voteCount: 56, percentage: 29.6 },
          { department: '运营部', voteCount: 44, percentage: 23.3 }
        ],
        hourlyStats: [
          { hour: '09:00', voteCount: 45 },
          { hour: '10:00', voteCount: 89 },
          { hour: '11:00', voteCount: 122 }
        ],
        regionStats: [
          { region: '北京', voteCount: 156 },
          { region: '上海', voteCount: 98 },
          { region: '广州', voteCount: 67 }
        ]
      })
    )
    return response as unknown as PollApiResponse<PollStatistics>
  }
  
  /**
   * 获取投票记录列表
   */
  static async getVoteRecords(params: VoteRecordQueryParams): Promise<PaginatedPollResponse<UserPollVote>> {
    const response = await apiAdapter.get(
      () => request.get('/admin/polls/votes', { params }).then(res => res.data),
      async () => ({
        items: [
          {
            id: 1,
            pollId: 1,
            userId: 1,
            user: {
              id: 1,
              username: 'zhangsan',
              name: '张三',
              email: 'zhangsan@example.com',
              phone: '13800138000',
              avatar: '',
              groupId: 1,
              status: 1,
              roles: [],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            },
            selectedOptions: [1],
            votedAt: new Date().toISOString(),
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0'
          },
          {
            id: 2,
            pollId: 1,
            userId: 2,
            user: {
              id: 2,
              username: 'lisi',
              name: '李四',
              email: 'lisi@example.com',
              phone: '13800138001',
              avatar: '',
              groupId: 1,
              status: 1,
              roles: [],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            },
            selectedOptions: [2],
            votedAt: new Date().toISOString(),
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0'
          }
        ],
        total: 2,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        hasNext: false,
        hasPrev: false
      }),
      { mockPagination: true, paginationParams: params }
    )
    return response as unknown as PaginatedPollResponse<UserPollVote>
  }
  
  /**
   * 导出投票结果
   */
  static async exportPollResult(data: PollResultExport): Promise<Blob> {
    const response = await apiAdapter.post(
      () => request.post(`/admin/polls/${data.pollId}/export`, data, {
        responseType: 'blob'
      }).then(res => res.data),
      async () => new Blob(['投票结果导出数据'], { type: 'text/plain' })
    )
    return response as unknown as Blob
  }
  
  /**
   * 获取投票帖通知配置
   */
  static async getNotificationConfig(pollId: number): Promise<PollApiResponse<PollNotificationConfig>> {
    const response = await apiAdapter.get(
      () => request.get(`/admin/polls/${pollId}/notification-config`).then(res => res.data),
      async () => ({
        pollId,
        sendReminder: true,
        reminderTime: 24,
        enableNotification: true,
        notifyOnStart: true,
        notifyOnEnd: true,
        notifyResults: true,
        customMessage: ''
      })
    )
    return response as unknown as PollApiResponse<PollNotificationConfig>
  }
  
  /**
   * 更新投票帖通知配置
   */
  static async updateNotificationConfig(config: PollNotificationConfig): Promise<PollApiResponse<void>> {
    const response = await apiAdapter.put(
      () => request.put(`/admin/polls/${config.pollId}/notification-config`, config).then(res => res.data),
      config.pollId,
      async () => undefined
    )
    return response as unknown as PollApiResponse<void>
  }
  
  /**
   * 手动发送投票提醒
   */
  static async sendVoteReminder(pollId: number, message?: string): Promise<PollApiResponse<void>> {
    const response = await apiAdapter.post(
      () => request.post(`/admin/polls/${pollId}/send-reminder`, { message }).then(res => res.data),
      async () => undefined
    )
    return response as unknown as PollApiResponse<void>
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
    const response = await apiAdapter.get(
      () => request.get('/admin/polls/overview-stats').then(res => res.data),
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
    return response as unknown as PollApiResponse<{
      totalPolls: number
      ongoingPolls: number
      endedPolls: number
      totalVotes: number
      avgParticipationRate: number
      todayPolls: number
      todayVotes: number
    }>
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
    const response = await apiAdapter.get(
      () => request.get('/user/polls', { params }).then(res => res.data),
      async () => {
        const allPolls = await polls
        const filtered = allPolls.filter(poll => {
          // 修复状态比较问题
          if (params.status && poll.status !== (params.status === 'ongoing' ? 1 : 2)) return false
          if (params.categoryId && poll.categoryId !== params.categoryId) return false
          return true
        })
        return { 
          items: filtered.map(poll => ({
            id: poll.id,
            title: poll.title,
            question: poll.description || '',
            status: poll.status === 1 ? 'ongoing' : 'ended',
            type: poll.type as PollType,
            startTime: poll.startTime,
            endTime: poll.endTime,
            totalVotes: poll.totalVotes,
            participantCount: poll.totalVotes,
            hasRewards: false,
            creator: {
              id: poll.author.id,
              name: poll.author.name,
              username: poll.author.name,
              email: '',
              groupId: 1,
              status: 1,
              avatar: poll.author.avatar,
              roles: [],
              createTime: poll.createTime,
              updateTime: poll.updateTime || poll.createTime
            } as User,
            categoryName: poll.category?.name || '',
            createdAt: poll.createTime
          })), 
          total: filtered.length,
          page: params.page || 1,
          pageSize: params.pageSize || 10,
          hasNext: false,
          hasPrev: false
        }
      },
      { mockPagination: true, paginationParams: params }
    )
    return response as unknown as PaginatedPollResponse<PollPostListItem>
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
    const response = await apiAdapter.get(
      () => request.get(`/user/polls/${id}`).then(res => res.data),
      async () => {
        const allPolls = await polls
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
    return response as unknown as PollApiResponse<PollPost & {
      userVoted: boolean
      userVote?: UserPollVote
      canVote: boolean
      canViewResult: boolean
    }>
  }
  
  /**
   * 提交投票
   */
  static async submitVote(data: SubmitVoteForm): Promise<PollApiResponse<{
    success: boolean
    vote: UserPollVote
    updatedPoll: PollPost
  }>> {
    const response = await apiAdapter.post(
      () => request.post('/user/polls/vote', data).then(res => res.data),
      async () => {
        const allPolls = await polls
        const poll = allPolls.find(p => p.id === data.pollId)
        if (!poll) {
          throw new Error('投票帖不存在')
        }
        const vote: UserPollVote = {
          id: Date.now(),
          pollId: data.pollId,
          userId: 1,
          user: {
            id: 1,
            username: 'current_user',
            name: '当前用户',
            email: 'user@example.com',
            phone: '13800138000',
            avatar: '',
            groupId: 1,
            status: 1,
            roles: [],
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          },
          selectedOptions: data.optionIds,
          votedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0'
        }
        const updatedPoll = {
          ...poll,
          totalVotes: poll.totalVotes + 1,
          participantCount: (poll as any).participantCount ? (poll as any).participantCount + 1 : poll.totalVotes + 1
        }
        return {
          success: true,
          vote,
          updatedPoll
        }
      }
    )
    return response as unknown as PollApiResponse<{
      success: boolean
      vote: UserPollVote
      updatedPoll: PollPost
    }>
  }
  
  /**
   * 取消投票（如果允许）
   */
  static async cancelVote(pollId: number): Promise<PollApiResponse<void>> {
    const response = await apiAdapter.delete(
      () => request.delete(`/user/polls/${pollId}/vote`).then(res => res.data)
    )
    return response as unknown as PollApiResponse<void>
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
    const response = await apiAdapter.get(
      () => request.get('/user/polls/my-votes', { params }).then(res => res.data),
      async () => ({
        items: [
          {
            id: 1,
            pollId: 1,
            userId: 1,
            user: {
              id: 1,
              username: 'current_user',
              name: '当前用户',
              email: 'user@example.com',
              phone: '13800138000',
              avatar: '',
              groupId: 1,
              status: 1,
              roles: [],
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            },
            selectedOptions: [1],
            votedAt: new Date().toISOString(),
            ipAddress: '127.0.0.1',
            userAgent: 'Mozilla/5.0',
            pollTitle: '团队建设活动投票',
            pollStatus: 'ongoing'
          }
        ],
        total: 1,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
        hasNext: false,
        hasPrev: false
      }),
      { mockPagination: true, paginationParams: params }
    )
    return response as unknown as PaginatedPollResponse<UserPollVote & {
      pollTitle: string
      pollStatus: string
    }>
  }
  
  /**
   * 检查用户投票权限
   */
  static async checkVotePermission(pollId: number): Promise<PollApiResponse<{
    canVote: boolean
    reason?: string
  }>> {
    const response = await apiAdapter.get(
      () => request.get(`/user/polls/${pollId}/check-permission`).then(res => res.data),
      async () => ({
        canVote: true
      })
    )
    return response as unknown as PollApiResponse<{
      canVote: boolean
      reason?: string
    }>
  }
  
  /**
   * 获取投票结果（如果有权限）
   */
  static async getPollResult(pollId: number): Promise<PollApiResponse<PollStatistics>> {
    const response = await apiAdapter.get(
      () => request.get(`/user/polls/${pollId}/result`).then(res => res.data),
      async () => ({
        pollId,
        totalVotes: 256,
        participantCount: 189,
        participationRate: 73.8,
        optionStats: [
          { optionId: 1, optionText: '选项A', voteCount: 128, percentage: 50.0 },
          { optionId: 2, optionText: '选项B', voteCount: 78, percentage: 30.5 },
          { optionId: 3, optionText: '选项C', voteCount: 50, percentage: 19.5 }
        ],
        departmentStats: [
          { department: '技术部', voteCount: 89, percentage: 47.1 },
          { department: '产品部', voteCount: 56, percentage: 29.6 },
          { department: '运营部', voteCount: 44, percentage: 23.3 }
        ],
        hourlyStats: [
          { hour: '09:00', voteCount: 45 },
          { hour: '10:00', voteCount: 89 },
          { hour: '11:00', voteCount: 122 }
        ],
        regionStats: [
          { region: '北京', voteCount: 156 },
          { region: '上海', voteCount: 98 },
          { region: '广州', voteCount: 67 }
        ]
      })
    )
    return response as unknown as PollApiResponse<PollStatistics>
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
    const response = await apiAdapter.get(
      () => request.get('/common/users/search', {
        params: { keyword, limit }
      }).then(res => res.data),
      async () => [
        { id: 1, name: '张三', department: '技术部', avatar: '' },
        { id: 2, name: '李四', department: '产品部', avatar: '' },
        { id: 3, name: '王五', department: '运营部', avatar: '' }
      ].filter(user => user.name.includes(keyword)).slice(0, limit)
    )
    return response as unknown as PollApiResponse<{
      id: number
      name: string
      department: string
      avatar?: string
    }[]>
  }
  
  /**
   * 获取部门列表
   */
  static async getDepartments(): Promise<PollApiResponse<{
    id: string
    name: string
    parentId?: string
  }[]>> {
    const response = await apiAdapter.get(
      () => request.get('/common/departments').then(res => res.data),
      async () => [
        { id: '1', name: '技术部' },
        { id: '2', name: '产品部' },
        { id: '3', name: '运营部' },
        { id: '4', name: '市场部' }
      ]
    )
    return response as unknown as PollApiResponse<{
      id: string
      name: string
      parentId?: string
    }[]>
  }
  
  /**
   * 获取角色列表
   */
  static async getRoles(): Promise<PollApiResponse<{
    id: number
    name: string
    code: string
  }[]>> {
    const response = await apiAdapter.get(
      () => request.get('/common/roles').then(res => res.data),
      async () => [
        { id: 1, name: '管理员', code: 'admin' },
        { id: 2, name: '普通用户', code: 'user' },
        { id: 3, name: '审核员', code: 'moderator' }
      ]
    )
    return response as unknown as PollApiResponse<{
      id: number
      name: string
      code: string
    }[]>
  }
  
  /**
   * 获取版块列表
   */
  static async getCategories(): Promise<PollApiResponse<{
    id: number
    name: string
    code: string
  }[]>> {
    const response = await apiAdapter.get(
      () => request.get('/common/categories').then(res => res.data),
      async () => [
        { id: 1, name: '技术讨论', code: 'tech' },
        { id: 2, name: '产品交流', code: 'product' },
        { id: 3, name: '团队建设', code: 'team' }
      ]
    )
    return response as unknown as PollApiResponse<{
      id: number
      name: string
      code: string
    }[]>
  }
  
  /**
   * 上传投票选项图片
   */
  static async uploadOptionImage(file: File): Promise<PollApiResponse<{
    url: string
    filename: string
  }>> {
    const response = await apiAdapter.post(
      () => {
        const formData = new FormData()
        formData.append('file', file)
        return request.post('/common/upload/poll-option', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data)
      },
      async () => ({
        url: '/mock/poll-options/' + file.name,
        filename: file.name
      })
    )
    return response as unknown as PollApiResponse<{
      url: string
      filename: string
    }>
  }
  
  /**
   * 预览投票帖内容
   */
  static async previewPollContent(content: string): Promise<PollApiResponse<{
    html: string
  }>> {
    const response = await apiAdapter.post(
      () => request.post('/common/preview/poll-content', { content }).then(res => res.data),
      async () => ({
        html: `<p>${content}</p>`
      })
    )
    return response as unknown as PollApiResponse<{
      html: string
    }>
  }
  
  /**
   * 验证投票帖配置
   */
  static async validatePollConfig(config: CreatePollPostForm): Promise<PollApiResponse<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }>> {
    const response = await apiAdapter.post(
      () => request.post('/common/validate/poll-config', config).then(res => res.data),
      async () => ({
        valid: true,
        errors: [] as string[],
        warnings: [] as string[]
      })
    )
    return response as unknown as PollApiResponse<{
      valid: boolean
      errors: string[]
      warnings: string[]
    }>
  }
}

// 导出所有API类
export { PollAdminAPI, PollUserAPI, PollCommonAPI }

// 默认导出管理端API（主要使用）
export default PollAdminAPI