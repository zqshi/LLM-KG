/**
 * 投票帖功能相关类型定义
 * 
 * 支持功能：
 * - 管理员创建投票帖
 * - 配置投票时间、参与范围、奖励信息
 * - 用户端投票和结果展示
 * - 投票结果统计分析
 */

import type { User } from './index'

// 投票帖状态枚举
export type PollPostStatus = 
  | 'draft'        // 草稿
  | 'scheduled'    // 已安排
  | 'ongoing'      // 进行中
  | 'ended'        // 已结束
  | 'cancelled'    // 已取消

// 投票类型枚举
export type PollType = 
  | 'single'       // 单选
  | 'multiple'     // 多选

// 投票权限范围
export type PollScope = 
  | 'all'          // 全员可参与
  | 'category'     // 版块内用户
  | 'department'   // 指定部门
  | 'role'         // 指定角色
  | 'custom'       // 自定义用户列表

// 结果可见性
export type ResultVisibility = 
  | 'real_time'    // 实时可见
  | 'after_end'    // 结束后可见
  | 'never'        // 不可见（仅管理员）

// 投票选项
export interface PollOption {
  id: number
  text: string
  description?: string
  image?: string
  sort: number
  voteCount: number
  percentage: number
}

// 奖励信息
export interface PollReward {
  id: number
  name: string
  description: string
  type: 'points' | 'badge' | 'gift' | 'voucher'
  value?: number
  image?: string
  quantity: number
  condition: 'participate' | 'winner' | 'all_participants'
}

// 投票参与范围配置
export interface PollScopeConfig {
  scope: PollScope
  departments?: string[]
  roles?: string[]
  userIds?: number[]
  categoryIds?: number[]
}

// 投票帖主体
export interface PollPost {
  id: number
  title: string
  content: string
  question: string
  
  // 投票配置
  type: PollType
  maxChoices?: number  // 多选时的最大选择数量
  options: PollOption[]
  
  // 时间配置
  startTime: string
  endTime: string
  duration: number     // 持续时间（分钟）
  
  // 权限配置
  scopeConfig: PollScopeConfig
  resultVisibility: ResultVisibility
  
  // 奖励配置
  rewards: PollReward[]
  hasRewards: boolean
  
  // 状态信息
  status: PollPostStatus
  
  // 统计数据
  totalVotes: number
  participantCount: number
  viewCount: number
  
  // 创建信息
  creatorId: number
  creator: User
  categoryId: number
  categoryName: string
  
  createdAt: string
  updatedAt: string
  publishedAt?: string
  endedAt?: string
}

// 用户投票记录
export interface UserPollVote {
  id: number
  pollId: number
  userId: number
  user: User
  selectedOptions: number[]
  votedAt: string
  ipAddress: string
  userAgent: string
}

// 投票统计数据
export interface PollStatistics {
  pollId: number
  totalVotes: number
  participantCount: number
  
  // 选项统计
  optionStats: {
    optionId: number
    optionText: string
    voteCount: number
    percentage: number
  }[]
  
  // 参与度统计
  participationRate: number
  
  // 部门统计
  departmentStats: {
    department: string
    voteCount: number
    percentage: number
  }[]
  
  // 时间统计（按小时）
  hourlyStats: {
    hour: string
    voteCount: number
  }[]
  
  // 地域统计
  regionStats: {
    region: string
    voteCount: number
  }[]
}

// 投票帖创建表单
export interface CreatePollPostForm {
  title: string
  content: string
  question: string
  
  // 投票类型
  type: PollType
  maxChoices?: number
  
  // 选项
  options: {
    text: string
    description?: string
    image?: string
  }[]
  
  // 时间设置
  startTime: string
  endTime: string
  
  // 权限设置
  scopeConfig: PollScopeConfig
  resultVisibility: ResultVisibility
  
  // 奖励设置
  rewards: Omit<PollReward, 'id'>[]
  
  // 发布设置
  categoryId: number
  publishImmediately: boolean
}

// 投票帖更新表单
export interface UpdatePollPostForm {
  id: number
  title?: string
  content?: string
  question?: string
  startTime?: string
  endTime?: string
  scopeConfig?: PollScopeConfig
  resultVisibility?: ResultVisibility
  rewards?: PollReward[]
  status?: PollPostStatus
}

// 用户投票提交
export interface SubmitVoteForm {
  pollId: number
  optionIds: number[]
}

// 投票查询参数
export interface PollQueryParams {
  page: number
  pageSize: number
  keyword?: string
  status?: PollPostStatus
  categoryId?: number
  creatorId?: number
  dateRange?: [string, string]
  hasRewards?: boolean
}

// 投票参与记录查询
export interface VoteRecordQueryParams {
  page: number
  pageSize: number
  pollId?: number
  userId?: number
  department?: string
  dateRange?: [string, string]
}

// 批量操作
export interface PollBatchOperation {
  pollIds: number[]
  operation: 'publish' | 'end' | 'cancel' | 'delete'
  reason?: string
}

// API响应类型
export interface PollApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页响应
export interface PaginatedPollResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

// 投票帖列表项
export interface PollPostListItem {
  id: number
  title: string
  question: string
  status: PollPostStatus
  type: PollType
  startTime: string
  endTime: string
  totalVotes: number
  participantCount: number
  hasRewards: boolean
  creator: User
  categoryName: string
  createdAt: string
}

// 投票结果导出
export interface PollResultExport {
  pollId: number
  title: string
  exportType: 'excel' | 'csv' | 'pdf'
  includeDetails: boolean
  includeStatistics: boolean
  includeCharts: boolean
}

// 投票提醒设置
export interface PollNotificationConfig {
  pollId: number
  sendReminder: boolean
  reminderTime: number  // 结束前多少分钟提醒
  reminderMessage?: string
  notifyResults: boolean
}