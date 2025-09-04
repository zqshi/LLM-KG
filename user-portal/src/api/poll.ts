/**
 * 用户端投票帖API接口
 * 
 * 提供用户参与投票、查看结果等功能
 */

import type {
  PollPost,
  PollData,
  SubmitVoteForm,
  PollVote,
  PollStatistics,
  ApiResponse,
  PaginatedResponse
} from '@/types'

// HTTP请求工具（假设存在）
import { http } from '@/utils/http'

/**
 * 用户端投票API
 */
export class PollAPI {
  
  /**
   * 获取投票帖列表
   */
  static async getPollPosts(params: {
    page: number
    pageSize: number
    categoryId?: string
    status?: 'ongoing' | 'ended'
    hasRewards?: boolean
  }): Promise<ApiResponse<PaginatedResponse<PollPost>>> {
    return http.get('/user/polls', { params })
  }
  
  /**
   * 获取投票帖详情
   */
  static async getPollPost(id: string): Promise<ApiResponse<PollPost & {
    userVoted: boolean
    userVote?: PollVote
    canVote: boolean
    canViewResult: boolean
  }>> {
    return http.get(`/user/polls/${id}`)
  }
  
  /**
   * 提交投票
   */
  static async submitVote(data: SubmitVoteForm): Promise<ApiResponse<{
    success: boolean
    vote: PollVote
    updatedPoll: PollData
    rewardEarned?: {
      name: string
      type: string
      value?: number
    }
  }>> {
    return http.post('/user/polls/vote', data)
  }
  
  /**
   * 取消投票（如果允许修改）
   */
  static async cancelVote(pollId: string): Promise<ApiResponse<void>> {
    return http.delete(`/user/polls/${pollId}/vote`)
  }
  
  /**
   * 获取投票结果
   */
  static async getPollResult(pollId: string): Promise<ApiResponse<PollStatistics>> {
    return http.get(`/user/polls/${pollId}/result`)
  }
  
  /**
   * 检查投票权限
   */
  static async checkVotePermission(pollId: string): Promise<ApiResponse<{
    canVote: boolean
    reason?: string
    requiresAuth?: boolean
  }>> {
    return http.get(`/user/polls/${pollId}/check-permission`)
  }
  
  /**
   * 获取用户投票历史
   */
  static async getMyVoteHistory(params: {
    page: number
    pageSize: number
    dateRange?: [string, string]
  }): Promise<ApiResponse<PaginatedResponse<PollVote & {
    pollTitle: string
    pollStatus: string
    rewardReceived?: string[]
  }>>> {
    return http.get('/user/polls/my-votes', { params })
  }
  
  /**
   * 获取用户获得的投票奖励
   */
  static async getMyRewards(params: {
    page: number
    pageSize: number
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string
    pollId: string
    pollTitle: string
    rewardName: string
    rewardType: string
    rewardValue?: number
    earnedAt: string
    status: 'pending' | 'granted' | 'expired'
  }>>> {
    return http.get('/user/polls/my-rewards', { params })
  }
  
  /**
   * 举报投票帖
   */
  static async reportPoll(pollId: string, reason: string): Promise<ApiResponse<void>> {
    return http.post(`/user/polls/${pollId}/report`, { reason })
  }
  
  /**
   * 分享投票帖
   */
  static async sharePoll(pollId: string, platform: 'wechat' | 'weibo' | 'link'): Promise<ApiResponse<{
    shareUrl: string
    shareText?: string
  }>> {
    return http.post(`/user/polls/${pollId}/share`, { platform })
  }
}

/**
 * 投票帖内容相关API
 */
export class PollContentAPI {
  
  /**
   * 点赞投票帖
   */
  static async likePollPost(pollId: string): Promise<ApiResponse<{
    liked: boolean
    likeCount: number
  }>> {
    return http.post(`/user/polls/${pollId}/like`)
  }
  
  /**
   * 收藏投票帖
   */
  static async favoritePollPost(pollId: string): Promise<ApiResponse<{
    favorited: boolean
    favoriteCount: number
  }>> {
    return http.post(`/user/polls/${pollId}/favorite`)
  }
  
  /**
   * 获取投票帖评论
   */
  static async getPollComments(pollId: string, params: {
    page: number
    pageSize: number
  }): Promise<ApiResponse<PaginatedResponse<{
    id: string
    content: string
    author: {
      id: string
      name: string
      avatar: string
      department: string
    }
    createTime: string
    likeCount: number
    isLiked: boolean
  }>>> {
    return http.get(`/user/polls/${pollId}/comments`, { params })
  }
  
  /**
   * 评论投票帖
   */
  static async commentPollPost(pollId: string, content: string): Promise<ApiResponse<{
    id: string
    content: string
    createTime: string
  }>> {
    return http.post(`/user/polls/${pollId}/comments`, { content })
  }
  
  /**
   * 获取热门投票帖
   */
  static async getHotPolls(limit: number = 10): Promise<ApiResponse<PollPost[]>> {
    return http.get('/user/polls/hot', { params: { limit } })
  }
  
  /**
   * 获取推荐投票帖
   */
  static async getRecommendedPolls(limit: number = 10): Promise<ApiResponse<PollPost[]>> {
    return http.get('/user/polls/recommended', { params: { limit } })
  }
  
  /**
   * 搜索投票帖
   */
  static async searchPolls(params: {
    keyword: string
    page: number
    pageSize: number
    category?: string
    status?: 'ongoing' | 'ended'
    hasRewards?: boolean
  }): Promise<ApiResponse<PaginatedResponse<PollPost>>> {
    return http.get('/user/polls/search', { params })
  }
}

// 导出主要API
export default PollAPI