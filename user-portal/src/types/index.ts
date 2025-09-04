// 用户信息类型
export interface User {
  id: string
  name: string
  avatar: string
  department: string
  position: string
  email: string
  phone: string
  joinDate: string
  points: number
  level: string
}

// Banner信息类型
export interface Banner {
  id: string
  title: string
  image: string
  link: string
  description: string
  startTime: string
  endTime: string
  status: 'active' | 'inactive'
}

// 资讯类型
export interface News {
  id: string
  title: string
  content: string
  summary: string
  author: string
  category: string
  tags: string[]
  publishTime: string
  readCount: number
  likeCount: number
  commentCount: number
  coverImage?: string
  source: string
  isTop: boolean
}

// 知识文档类型
export interface Knowledge {
  id: string
  title: string
  content: string
  summary: string
  author: string
  department: string
  category: string
  tags: string[]
  createTime: string
  updateTime: string
  readCount: number
  likeCount: number
  downloadCount: number
  fileType: 'doc' | 'pdf' | 'video' | 'ppt' | 'other'
  fileUrl?: string
  status: 'published' | 'draft'
}

// 投票选项类型（增强版）
export interface PollOption {
  id: number
  text: string
  description?: string
  image?: string
  count: number
  percent: number
  isSelected?: boolean
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

// 投票数据类型（增强版）
export interface PollData {
  question: string
  isMultiChoice: boolean
  maxChoices?: number
  startTime: string
  endTime: string
  status: 'ongoing' | 'ended' | 'scheduled' | 'cancelled'
  userVoted: boolean
  userChoices: number[]
  resultVisible: 'after_end' | 'real_time' | 'never'
  totalVoters: number
  participantCount: number
  options: PollOption[]
  rewards: PollReward[]
  hasRewards: boolean
  canVote: boolean
  canViewResult: boolean
}

// 用户投票记录类型（增强版）
export interface PollVote {
  id: string
  postId: string
  userId: string
  optionIds: number[]
  createTime: string
  ipAddress?: string
  userAgent?: string
}

// 投票帖类型（独立类型，继承ForumPost特性）
export interface PollPost {
  id: string
  title: string
  content: string
  author: User
  category: string
  tags: string[]
  createTime: string
  updateTime: string
  viewCount: number
  likeCount: number
  replyCount: number
  isTop: boolean
  isHighlight: boolean
  poll: PollData // 投票数据，必填字段
  type: 'poll' // 标识为投票帖
}

// 论坛帖子类型（原有帖子）
export interface ForumPost {
  id: string
  title: string
  content: string
  author: User
  category: string
  tags: string[]
  createTime: string
  updateTime: string
  viewCount: number
  likeCount: number
  replyCount: number
  isTop: boolean
  isHighlight: boolean
  replies: ForumReply[]
  poll?: PollData // 投票数据，可选字段
  type?: 'normal' | 'poll' // 帖子类型，默认为normal
}

// 统一的帖子类型（包含普通帖和投票帖）
export type UnifiedPost = ForumPost | PollPost

// 论坛回复类型
export interface ForumReply {
  id: string
  postId: string
  content: string
  author: User
  createTime: string
  likeCount: number
  parentId?: string
}

// 跳蚤市场商品类型
export interface MarketItem {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  condition: 'new' | 'like-new' | 'good' | 'fair'
  category: string
  images: string[]
  seller: User
  createTime: string
  status: 'available' | 'sold' | 'reserved'
  location: string
  contactInfo: string
}

// 领导名言类型
export interface Quote {
  id: string
  content: string
  author: string
  position: string
  context?: string
  createTime: string
}

// 推荐内容类型
export interface Recommendation {
  id: string
  type: 'news' | 'knowledge' | 'forum' | 'market'
  title: string
  summary: string
  link: string
  score: number
  reason: string
}

// 通知消息类型
export interface Notification {
  id: string
  type: 'system' | 'reply' | 'like' | 'mention'
  title: string
  content: string
  createTime: string
  isRead: boolean
  link?: string
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页参数类型
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应类型
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrev: boolean
}

// 投票提交表单
export interface SubmitVoteForm {
  pollId: string
  optionIds: number[]
}

// 投票统计信息
export interface PollStatistics {
  pollId: string
  totalVotes: number
  participantCount: number
  participationRate: number
  optionStats: {
    optionId: number
    optionText: string
    voteCount: number
    percentage: number
  }[]
  departmentStats: {
    department: string
    voteCount: number
    percentage: number
  }[]
  hourlyStats: {
    hour: string
    voteCount: number
  }[]
}