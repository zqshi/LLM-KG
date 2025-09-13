/**
 * 反馈管理静态数据
 */

import type { 
  FeedbackItem, 
  FeedbackDetail, 
  FeedbackStatistics,
  ProcessRecord,
  InternalComment,
  UserReply,
  FeedbackType,
  FeedbackStatus,
  FeedbackPriority
} from '@/types/feedbackManagement'

// 反馈类型标签
const feedbackTypes: Record<FeedbackType, string> = {
  problem: '问题反馈',
  suggestion: '产品建议'
}

// 反馈状态标签
const feedbackStatuses: Record<FeedbackStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
  rejected: '已拒绝'
}

// 反馈优先级标签
const feedbackPriorities: Record<FeedbackPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
}

// 模拟用户数据
const users = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', department: '技术部' },
  { id: 2, name: '李四', email: 'lisi@example.com', department: '产品部' },
  { id: 3, name: '王五', email: 'wangwu@example.com', department: '运营部' },
  { id: 4, name: '赵六', email: 'zhaoliu@example.com', department: '设计部' },
  { id: 5, name: '系统管理员', email: 'admin@example.com', department: 'IT部' }
]

// 模拟反馈数据
export const feedbackItems: FeedbackItem[] = [
  {
    id: 1,
    title: '页面加载速度过慢',
    content: '在使用过程中发现页面加载速度很慢，特别是在网络环境较差的情况下，用户体验不佳。',
    type: 'problem',
    status: 'processing',
    priority: 'high',
    submitterId: 1,
    submitterName: '张三',
    submitterEmail: 'zhangsan@example.com',
    relatedModule: '用户中心',
    attachments: [
      {
        id: 1,
        name: '页面加载截图.png',
        url: '/images/feedback/screenshot1.png',
        size: 102400,
        type: 'image/png',
        uploadTime: '2024-01-15 10:30:00'
      }
    ],
    processerId: 5,
    processerName: '系统管理员',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-16 14:20:00',
    processTime: '2024-01-15 11:00:00'
  },
  {
    id: 2,
    title: '增加夜间模式功能',
    content: '建议增加夜间模式功能，保护用户视力，特别是在夜间使用时更加舒适。',
    type: 'suggestion',
    status: 'pending',
    priority: 'medium',
    submitterId: 2,
    submitterName: '李四',
    submitterEmail: 'lisi@example.com',
    relatedModule: '全局设置',
    attachments: [],
    createTime: '2024-01-14 09:15:00',
    updateTime: '2024-01-14 09:15:00'
  },
  {
    id: 3,
    title: '搜索功能无法正常使用',
    content: '搜索功能在输入关键词后没有返回任何结果，无论搜索什么内容都是空白。',
    type: 'problem',
    status: 'resolved',
    priority: 'high',
    submitterId: 3,
    submitterName: '王五',
    submitterEmail: 'wangwu@example.com',
    relatedModule: '搜索模块',
    attachments: [],
    processerId: 5,
    processerName: '系统管理员',
    createTime: '2024-01-13 16:45:00',
    updateTime: '2024-01-14 11:30:00',
    processTime: '2024-01-14 11:30:00'
  },
  {
    id: 4,
    title: '优化移动端适配',
    content: '在手机端浏览时页面布局混乱，部分元素显示不完整，影响使用体验。',
    type: 'suggestion',
    status: 'closed',
    priority: 'medium',
    submitterId: 4,
    submitterName: '赵六',
    submitterEmail: 'zhaoliu@example.com',
    relatedModule: '移动端',
    attachments: [
      {
        id: 2,
        name: '移动端问题截图1.png',
        url: '/images/feedback/mobile1.png',
        size: 85600,
        type: 'image/png',
        uploadTime: '2024-01-12 14:20:00'
      },
      {
        id: 3,
        name: '移动端问题截图2.png',
        url: '/images/feedback/mobile2.png',
        size: 92400,
        type: 'image/png',
        uploadTime: '2024-01-12 14:21:00'
      }
    ],
    processerId: 2,
    processerName: '李四',
    createTime: '2024-01-12 14:20:00',
    updateTime: '2024-01-15 17:45:00',
    processTime: '2024-01-15 17:45:00'
  },
  {
    id: 5,
    title: '数据导出功能异常',
    content: '在尝试导出数据时系统报错，无法完成导出操作，影响工作效率。',
    type: 'problem',
    status: 'rejected',
    priority: 'urgent',
    submitterId: 1,
    submitterName: '张三',
    submitterEmail: 'zhangsan@example.com',
    relatedModule: '数据管理',
    attachments: [],
    createTime: '2024-01-11 11:10:00',
    updateTime: '2024-01-12 09:30:00',
    processTime: '2024-01-12 09:30:00'
  }
]

// 模拟处理记录
const processRecords: Record<number, ProcessRecord[]> = {
  1: [
    {
      id: 1,
      feedbackId: 1,
      operatorId: 5,
      operatorName: '系统管理员',
      action: 'assign',
      actionDescription: '分配给处理人',
      detail: '分配给系统管理员处理',
      oldValue: '',
      newValue: '系统管理员',
      createTime: '2024-01-15 11:00:00'
    },
    {
      id: 2,
      feedbackId: 1,
      operatorId: 5,
      operatorName: '系统管理员',
      action: 'status_change',
      actionDescription: '更新处理状态',
      detail: '开始处理该问题',
      oldValue: 'pending',
      newValue: 'processing',
      createTime: '2024-01-15 11:05:00'
    }
  ],
  3: [
    {
      id: 3,
      feedbackId: 3,
      operatorId: 5,
      operatorName: '系统管理员',
      action: 'assign',
      actionDescription: '分配给处理人',
      detail: '分配给系统管理员处理',
      oldValue: '',
      newValue: '系统管理员',
      createTime: '2024-01-13 17:00:00'
    },
    {
      id: 4,
      feedbackId: 3,
      operatorId: 5,
      operatorName: '系统管理员',
      action: 'status_change',
      actionDescription: '更新处理状态',
      detail: '问题已修复',
      oldValue: 'processing',
      newValue: 'resolved',
      createTime: '2024-01-14 11:30:00'
    }
  ]
}

// 模拟内部评论
const internalComments: Record<number, InternalComment[]> = {
  1: [
    {
      id: 1,
      feedbackId: 1,
      authorId: 5,
      authorName: '系统管理员',
      content: '已定位问题，是由于网络请求超时导致的，正在优化。',
      createTime: '2024-01-15 14:30:00'
    }
  ]
}

// 模拟用户回复
const userReplies: Record<number, UserReply[]> = {
  1: [
    {
      id: 1,
      feedbackId: 1,
      content: '感谢处理，问题已解决。',
      senderId: 1,
      senderName: '张三',
      createTime: '2024-01-16 14:20:00',
      notificationSent: true
    }
  ]
}

// 反馈详情数据
export const feedbackDetails: FeedbackDetail[] = feedbackItems.map(item => ({
  ...item,
  processRecords: processRecords[item.id] || [],
  internalComments: internalComments[item.id] || [],
  userReplies: userReplies[item.id] || []
}))

// 反馈统计数据
export const feedbackStatistics: FeedbackStatistics = {
  total: feedbackItems.length,
  pending: feedbackItems.filter(item => item.status === 'pending').length,
  processing: feedbackItems.filter(item => item.status === 'processing').length,
  resolved: feedbackItems.filter(item => item.status === 'resolved').length,
  closed: feedbackItems.filter(item => item.status === 'closed').length,
  rejected: feedbackItems.filter(item => item.status === 'rejected').length,
  todayNew: 2,
  weeklyNew: 5,
  monthlyNew: feedbackItems.length,
  avgProcessTime: 2.5,
  typeDistribution: [
    { type: 'problem', count: feedbackItems.filter(item => item.type === 'problem').length },
    { type: 'suggestion', count: feedbackItems.filter(item => item.type === 'suggestion').length }
  ],
  priorityDistribution: [
    { priority: 'low', count: 0 },
    { priority: 'medium', count: feedbackItems.filter(item => item.priority === 'medium').length },
    { priority: 'high', count: feedbackItems.filter(item => item.priority === 'high').length },
    { priority: 'urgent', count: feedbackItems.filter(item => item.priority === 'urgent').length }
  ]
}

// 可用处理人
export const availableProcessors = users.map(user => ({
  id: user.id,
  name: user.name,
  department: user.department
}))