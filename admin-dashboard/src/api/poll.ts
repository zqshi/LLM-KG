/**
 * 投票帖功能API接口
 * 
 * 提供完整的投票帖CRUD操作、投票功能、统计分析等
 */

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
    return request.get('/admin/polls', { params })
  }
  
  /**
   * 获取投票帖详情
   */
  static async getPollPost(id: number): Promise<PollApiResponse<PollPost>> {
    return request.get(`/admin/polls/${id}`)
  }
  
  /**
   * 创建投票帖
   */
  static async createPollPost(data: CreatePollPostForm): Promise<PollApiResponse<PollPost>> {
    return request.post('/admin/polls', data)
  }
  
  /**
   * 更新投票帖
   */
  static async updatePollPost(data: UpdatePollPostForm): Promise<PollApiResponse<PollPost>> {
    return request.put(`/admin/polls/${data.id}`, data)
  }
  
  /**
   * 删除投票帖
   */
  static async deletePollPost(id: number): Promise<PollApiResponse<void>> {
    return request.delete(`/admin/polls/${id}`)
  }
  
  /**
   * 发布投票帖
   */
  static async publishPollPost(id: number): Promise<PollApiResponse<PollPost>> {
    return request.post(`/admin/polls/${id}/publish`)
  }
  
  /**
   * 结束投票帖
   */
  static async endPollPost(id: number, reason?: string): Promise<PollApiResponse<PollPost>> {
    return request.post(`/admin/polls/${id}/end`, { reason })
  }
  
  /**
   * 取消投票帖
   */
  static async cancelPollPost(id: number, reason: string): Promise<PollApiResponse<PollPost>> {
    return request.post(`/admin/polls/${id}/cancel`, { reason })
  }
  
  /**
   * 批量操作投票帖
   */
  static async batchOperation(data: PollBatchOperation): Promise<PollApiResponse<void>> {
    return request.post('/admin/polls/batch', data)
  }
  
  /**
   * 获取投票统计数据
   */
  static async getPollStatistics(pollId: number): Promise<PollApiResponse<PollStatistics>> {
    return request.get(`/admin/polls/${pollId}/statistics`)
  }
  
  /**
   * 获取投票记录列表
   */
  static async getVoteRecords(params: VoteRecordQueryParams): Promise<PaginatedPollResponse<UserPollVote>> {
    return request.get('/admin/polls/votes', { params })
  }
  
  /**
   * 导出投票结果
   */
  static async exportPollResult(data: PollResultExport): Promise<Blob> {
    return request.post(`/admin/polls/${data.pollId}/export`, data, {
      responseType: 'blob'
    })
  }
  
  /**
   * 获取投票帖通知配置
   */
  static async getNotificationConfig(pollId: number): Promise<PollApiResponse<PollNotificationConfig>> {
    return request.get(`/admin/polls/${pollId}/notification-config`)
  }
  
  /**
   * 更新投票帖通知配置
   */
  static async updateNotificationConfig(config: PollNotificationConfig): Promise<PollApiResponse<void>> {
    return request.put(`/admin/polls/${config.pollId}/notification-config`, config)
  }
  
  /**
   * 手动发送投票提醒
   */
  static async sendVoteReminder(pollId: number, message?: string): Promise<PollApiResponse<void>> {
    return request.post(`/admin/polls/${pollId}/send-reminder`, { message })
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
    return request.get('/admin/polls/overview-stats')
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
    return request.get('/user/polls', { params })
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
    return request.get(`/user/polls/${id}`)
  }
  
  /**
   * 提交投票
   */
  static async submitVote(data: SubmitVoteForm): Promise<PollApiResponse<{
    success: boolean
    vote: UserPollVote
    updatedPoll: PollPost
  }>> {
    return request.post('/user/polls/vote', data)
  }
  
  /**
   * 取消投票（如果允许）
   */
  static async cancelVote(pollId: number): Promise<PollApiResponse<void>> {
    return request.delete(`/user/polls/${pollId}/vote`)
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
    return request.get('/user/polls/my-votes', { params })
  }
  
  /**
   * 检查用户投票权限
   */
  static async checkVotePermission(pollId: number): Promise<PollApiResponse<{
    canVote: boolean
    reason?: string
  }>> {
    return request.get(`/user/polls/${pollId}/check-permission`)
  }
  
  /**
   * 获取投票结果（如果有权限）
   */
  static async getPollResult(pollId: number): Promise<PollApiResponse<PollStatistics>> {
    return request.get(`/user/polls/${pollId}/result`)
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
    return request.get('/common/users/search', {
      params: { keyword, limit }
    })
  }
  
  /**
   * 获取部门列表
   */
  static async getDepartments(): Promise<PollApiResponse<{
    id: string
    name: string
    parentId?: string
  }[]>> {
    return request.get('/common/departments')
  }
  
  /**
   * 获取角色列表
   */
  static async getRoles(): Promise<PollApiResponse<{
    id: number
    name: string
    code: string
  }[]>> {
    return request.get('/common/roles')
  }
  
  /**
   * 获取版块列表
   */
  static async getCategories(): Promise<PollApiResponse<{
    id: number
    name: string
    code: string
  }[]>> {
    return request.get('/common/categories')
  }
  
  /**
   * 上传投票选项图片
   */
  static async uploadOptionImage(file: File): Promise<PollApiResponse<{
    url: string
    filename: string
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/common/upload/poll-option', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  
  /**
   * 预览投票帖内容
   */
  static async previewPollContent(content: string): Promise<PollApiResponse<{
    html: string
  }>> {
    return request.post('/common/preview/poll-content', { content })
  }
  
  /**
   * 验证投票帖配置
   */
  static async validatePollConfig(config: CreatePollPostForm): Promise<PollApiResponse<{
    valid: boolean
    errors: string[]
    warnings: string[]
  }>> {
    return request.post('/common/validate/poll-config', config)
  }
}

// 导出所有API类
export { PollAdminAPI, PollUserAPI, PollCommonAPI }

// 默认导出管理端API（主要使用）
export default PollAdminAPI