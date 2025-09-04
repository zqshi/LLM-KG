import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PollPost, SubmitVoteForm, PollStatistics, ApiResponse } from '@/types'
import PollAPI, { PollContentAPI } from '@/api/poll'

export const usePollStore = defineStore('poll', () => {
  // 状态数据
  const pollPosts = ref<PollPost[]>([])
  const currentPoll = ref<PollPost | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 用户投票历史
  const userVoteHistory = ref<any[]>([])
  const userRewards = ref<any[]>([])

  // 计算属性
  const ongoingPolls = computed(() => 
    pollPosts.value.filter(poll => poll.poll.status === 'ongoing')
  )

  const endedPolls = computed(() =>
    pollPosts.value.filter(poll => poll.poll.status === 'ended')
  )

  const rewardPolls = computed(() =>
    pollPosts.value.filter(poll => poll.poll.hasRewards)
  )

  const myParticipatedPolls = computed(() =>
    pollPosts.value.filter(poll => poll.poll.userVoted)
  )

  // Actions
  const fetchPollPosts = async (params: {
    page: number
    pageSize: number
    categoryId?: string
    status?: 'ongoing' | 'ended'
    hasRewards?: boolean
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await PollAPI.getPollPosts(params)
      
      if (params.page === 1) {
        pollPosts.value = response.data.items
      } else {
        pollPosts.value.push(...response.data.items)
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '获取投票帖列表失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchPollDetail = async (pollId: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await PollAPI.getPollPost(pollId)
      currentPoll.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || '获取投票帖详情失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const submitVote = async (voteForm: SubmitVoteForm) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await PollAPI.submitVote(voteForm)
      
      // 更新当前投票帖状态
      if (currentPoll.value && currentPoll.value.id === voteForm.pollId) {
        currentPoll.value.poll = response.data.updatedPoll
        currentPoll.value.poll.userVoted = true
        currentPoll.value.poll.userChoices = voteForm.optionIds
      }
      
      // 更新列表中的投票帖状态
      const pollIndex = pollPosts.value.findIndex(p => p.id === voteForm.pollId)
      if (pollIndex !== -1) {
        pollPosts.value[pollIndex].poll = response.data.updatedPoll
        pollPosts.value[pollIndex].poll.userVoted = true
        pollPosts.value[pollIndex].poll.userChoices = voteForm.optionIds
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '投票提交失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const likePoll = async (pollId: string) => {
    try {
      const response = await PollContentAPI.likePollPost(pollId)
      
      // 更新当前投票帖点赞状态
      if (currentPoll.value && currentPoll.value.id === pollId) {
        currentPoll.value.likeCount = response.data.likeCount
      }
      
      // 更新列表中的点赞状态
      const pollIndex = pollPosts.value.findIndex(p => p.id === pollId)
      if (pollIndex !== -1) {
        pollPosts.value[pollIndex].likeCount = response.data.likeCount
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '点赞操作失败'
      throw err
    }
  }

  const favoritePoll = async (pollId: string) => {
    try {
      const response = await PollContentAPI.favoritePollPost(pollId)
      return response.data
    } catch (err: any) {
      error.value = err.message || '收藏操作失败'
      throw err
    }
  }

  const reportPoll = async (pollId: string, reason: string) => {
    try {
      await PollAPI.reportPoll(pollId, reason)
      return true
    } catch (err: any) {
      error.value = err.message || '举报提交失败'
      throw err
    }
  }

  const sharePoll = async (pollId: string, platform: 'wechat' | 'weibo' | 'link') => {
    try {
      const response = await PollAPI.sharePoll(pollId, platform)
      return response.data
    } catch (err: any) {
      error.value = err.message || '分享失败'
      throw err
    }
  }

  const fetchUserVoteHistory = async (params: {
    page: number
    pageSize: number
    dateRange?: [string, string]
  }) => {
    try {
      const response = await PollAPI.getMyVoteHistory(params)
      
      if (params.page === 1) {
        userVoteHistory.value = response.data.items
      } else {
        userVoteHistory.value.push(...response.data.items)
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '获取投票历史失败'
      throw err
    }
  }

  const fetchUserRewards = async (params: {
    page: number
    pageSize: number
  }) => {
    try {
      const response = await PollAPI.getMyRewards(params)
      
      if (params.page === 1) {
        userRewards.value = response.data.items
      } else {
        userRewards.value.push(...response.data.items)
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '获取奖励记录失败'
      throw err
    }
  }

  const fetchHotPolls = async (limit: number = 10) => {
    try {
      const response = await PollContentAPI.getHotPolls(limit)
      return response.data
    } catch (err: any) {
      error.value = err.message || '获取热门投票失败'
      throw err
    }
  }

  const fetchRecommendedPolls = async (limit: number = 10) => {
    try {
      const response = await PollContentAPI.getRecommendedPolls(limit)
      return response.data
    } catch (err: any) {
      error.value = err.message || '获取推荐投票失败'
      throw err
    }
  }

  const searchPolls = async (params: {
    keyword: string
    page: number
    pageSize: number
    category?: string
    status?: 'ongoing' | 'ended'
    hasRewards?: boolean
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await PollContentAPI.searchPolls(params)
      
      if (params.page === 1) {
        pollPosts.value = response.data.items
      } else {
        pollPosts.value.push(...response.data.items)
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '搜索投票帖失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  const commentOnPoll = async (pollId: string, content: string) => {
    try {
      const response = await PollContentAPI.commentPollPost(pollId, content)
      
      // 更新评论数
      if (currentPoll.value && currentPoll.value.id === pollId) {
        currentPoll.value.replyCount++
      }
      
      const pollIndex = pollPosts.value.findIndex(p => p.id === pollId)
      if (pollIndex !== -1) {
        pollPosts.value[pollIndex].replyCount++
      }
      
      return response.data
    } catch (err: any) {
      error.value = err.message || '评论发布失败'
      throw err
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    pollPosts.value = []
    currentPoll.value = null
    userVoteHistory.value = []
    userRewards.value = []
    loading.value = false
    error.value = null
  }

  return {
    // 状态
    pollPosts,
    currentPoll,
    loading,
    error,
    userVoteHistory,
    userRewards,

    // 计算属性
    ongoingPolls,
    endedPolls,
    rewardPolls,
    myParticipatedPolls,

    // Actions
    fetchPollPosts,
    fetchPollDetail,
    submitVote,
    likePoll,
    favoritePoll,
    reportPoll,
    sharePoll,
    fetchUserVoteHistory,
    fetchUserRewards,
    fetchHotPolls,
    fetchRecommendedPolls,
    searchPolls,
    commentOnPoll,
    clearError,
    reset
  }
})