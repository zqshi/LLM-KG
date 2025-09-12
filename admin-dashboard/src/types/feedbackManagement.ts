import type { PaginationParams } from './index'

export type FeedbackType = 'problem' | 'suggestion'

export type FeedbackStatus = 'pending' | 'processing' | 'resolved' | 'closed' | 'rejected'

export type FeedbackPriority = 'low' | 'medium' | 'high' | 'urgent'

export type ProcessAction = 'assign' | 'status_change' | 'reply' | 'comment'

export interface FeedbackAttachment {
  id: number
  name: string
  url: string
  size: number
  type: string
  uploadTime: string
}

export interface FeedbackItem {
  id: number
  title: string
  content: string
  type: FeedbackType
  status: FeedbackStatus
  priority: FeedbackPriority
  submitterId: number
  submitterName: string
  submitterEmail?: string
  submitterPhone?: string
  relatedModule?: string
  attachments: FeedbackAttachment[]
  processerId?: number
  processerName?: string
  createTime: string
  updateTime: string
  processTime?: string
}

export interface ProcessRecord {
  id: number
  feedbackId: number
  operatorId: number
  operatorName: string
  action: ProcessAction
  actionDescription: string
  detail?: string
  oldValue?: string
  newValue?: string
  createTime: string
}

export interface InternalComment {
  id: number
  feedbackId: number
  authorId: number
  authorName: string
  content: string
  createTime: string
}

export interface UserReply {
  id: number
  feedbackId: number
  content: string
  senderId: number
  senderName: string
  createTime: string
  notificationSent: boolean
}

export interface FeedbackQueryParams extends PaginationParams {
  keyword?: string
  type?: FeedbackType
  status?: FeedbackStatus[]
  priority?: FeedbackPriority[]
  startTime?: string
  endTime?: string
  submitterName?: string
  processerId?: number
}

export interface FeedbackStatistics {
  total: number
  pending: number
  processing: number
  resolved: number
  closed: number
  rejected: number
  todayNew: number
  weeklyNew: number
  monthlyNew: number
  avgProcessTime: number
  typeDistribution: {
    type: FeedbackType
    count: number
  }[]
  priorityDistribution: {
    priority: FeedbackPriority
    count: number
  }[]
}

export interface ProcessFormData {
  status?: FeedbackStatus
  processerId?: number
  priority?: FeedbackPriority
  processNote: string
}

export interface ReplyFormData {
  content: string
  sendNotification: boolean
}

export interface CommentFormData {
  content: string
}

export interface AssignFormData {
  processerId: number
  note?: string
}

export interface FeedbackDetail extends FeedbackItem {
  processRecords: ProcessRecord[]
  internalComments: InternalComment[]
  userReplies: UserReply[]
}

export interface FeedbackListResponse {
  list: FeedbackItem[]
  total: number
  statistics?: FeedbackStatistics
}