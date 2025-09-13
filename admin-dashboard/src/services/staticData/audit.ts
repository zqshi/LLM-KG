import type {
  AuditTask,
  AuditPolicy,
  SensitiveWord,
  Auditor,
  AuditStats
} from '@/types'

/**
 * 审计任务静态数据
 */
export const auditTasks = async (): Promise<AuditTask[]> => {
  return [
    {
      id: 1,
      taskId: 'task_001',
      bizType: 'banner',
      bizId: '123',
      title: 'Banner内容审核',
      content: 'Banner标题: AI技术发展新动态\n描述: 最新的人工智能技术发展趋势分析\n链接: https://example.com/ai-news',
      contentSnapshot: {},
      submitterId: 1,
      submitterName: '内容编辑',
      status: 'pending',
      priority: 'normal',
      assigneeId: 2,
      assigneeName: '内容审核员',
      createTime: '2024-01-15 10:30:00'
    },
    {
      id: 2,
      taskId: 'task_002',
      bizType: 'forum_post',
      bizId: '456',
      title: '文章内容审核',
      content: '文章标题: Vue 3开发指南\n内容: 详细介绍Vue 3的新特性和开发技巧...\n分类: technology\n标签: vue, 前端, 开发',
      contentSnapshot: {},
      submitterId: 3,
      submitterName: '技术编辑',
      status: 'approved',
      priority: 'high',
      assigneeId: 4,
      assigneeName: '技术审核员',
      createTime: '2024-01-15 09:15:00',
      approveTime: '2024-01-15 10:45:00'
    },
    {
      id: 3,
      taskId: 'task_003',
      bizType: 'flea_goods',
      bizId: '789',
      title: '用户注册信息审核',
      content: '用户名: newuser123\n邮箱: newuser@example.com\n个人简介: 热爱技术的开发者',
      contentSnapshot: {},
      submitterId: 5,
      submitterName: '系统自动',
      status: 'rejected',
      priority: 'low',
      assigneeId: 2,
      assigneeName: '内容审核员',
      createTime: '2024-01-15 11:20:00',
      rejectTime: '2024-01-15 14:30:00',
      rejectReason: '头像内容不当，需要重新上传'
    }
  ]
}

/**
 * 审计策略静态数据
 */
export const auditPolicies = async (): Promise<AuditPolicy[]> => {
  return [
    {
      id: 1,
      name: 'Banner内容审核策略',
      bizType: 'banner',
      mode: 'pre',
      priority: 'high',
      assignRule: 'auto',
      assigneeId: 2,
      ruleConfig: {},
      isActive: true,
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-12 14:30:00'
    },
    {
      id: 2,
      name: '文章内容审核策略',
      bizType: 'forum_post',
      mode: 'pre',
      priority: 'normal',
      assignRule: 'auto',
      assigneeId: 4,
      ruleConfig: {},
      isActive: true,
      createTime: '2024-01-08 16:45:00',
      updateTime: '2024-01-14 10:15:00'
    },
    {
      id: 3,
      name: '用户信息审核策略',
      bizType: 'flea_goods',
      mode: 'pre',
      priority: 'low',
      assignRule: 'manual',
      assigneeId: undefined,
      ruleConfig: {},
      isActive: true,
      createTime: '2024-01-05 11:20:00'
    }
  ]
}

/**
 * 敏感词静态数据
 */
export const sensitiveWords = async (): Promise<SensitiveWord[]> => {
  return [
    {
      id: 1,
      word: '违禁词示例1',
      isRegex: false,
      action: 'forbidden',
      category: '政治敏感',
      replaceWith: '***',
      hitCount: 15,
      creator: '安全管理员',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-12 14:30:00'
    },
    {
      id: 2,
      word: '违禁词示例2',
      isRegex: false,
      action: 'review',
      category: '商业广告',
      replaceWith: '[广告]',
      hitCount: 8,
      creator: '内容管理员',
      createTime: '2024-01-08 16:45:00'
    },
    {
      id: 3,
      word: '违禁词示例3',
      isRegex: false,
      action: 'replace',
      category: '暴力内容',
      replaceWith: '',
      hitCount: 3,
      creator: '安全管理员',
      createTime: '2024-01-05 11:20:00',
      updateTime: '2024-01-14 10:15:00'
    }
  ]
}

/**
 * 审核员静态数据
 */
export const auditors = async (): Promise<Auditor[]> => {
  return [
    {
      id: 1,
      name: '内容审核员',
      username: 'auditor001',
      role: 'content_auditor',
      department: '内容部',
      email: 'auditor001@example.com',
      phone: '',
      permissions: ['banner', 'forum_post'],
      status: true,
      pendingCount: 12,
      todayProcessed: 8,
      approvalRate: 98.5,
      createTime: '2024-01-01 09:00:00'
    },
    {
      id: 2,
      name: '技术审核员',
      username: 'auditor002',
      role: 'senior_auditor',
      department: '技术部',
      email: 'auditor002@example.com',
      phone: '',
      permissions: ['forum_post', 'flea_goods'],
      status: true,
      pendingCount: 5,
      todayProcessed: 15,
      approvalRate: 99.2,
      createTime: '2024-01-03 14:20:00'
    },
    {
      id: 3,
      name: '安全审核员',
      username: 'auditor003',
      role: 'audit_manager',
      department: '安全部',
      email: 'auditor003@example.com',
      phone: '',
      permissions: ['flea_goods'],
      status: false,
      pendingCount: 0,
      todayProcessed: 0,
      approvalRate: 97.8,
      createTime: '2024-01-05 10:30:00'
    }
  ]
}

/**
 * 审计统计数据
 */
export const auditStats = async (): Promise<AuditStats> => {
  return {
    pendingTotal: 23,
    todayNew: 15,
    todayProcessed: 45,
    avgProcessTime: 78,
    approvalRate: 98.7,
    todayApproved: 42,
    todayRejected: 3,
    rejectionRate: 6.7
  }
}

/**
 * 审计日志静态数据
 */
export const auditLogs = async () => {
  return [
    {
      id: 1,
      taskId: 'task_001',
      auditorId: 2,
      auditorName: '内容审核员',
      action: 'assign',
      description: '任务已分配给内容审核员',
      oldValue: null,
      newValue: 'assigned',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createTime: '2024-01-15 10:31:00'
    },
    {
      id: 2,
      taskId: 'task_002',
      auditorId: 4,
      auditorName: '技术审核员',
      action: 'approve',
      description: '审核通过，内容质量良好',
      oldValue: 'pending',
      newValue: 'approved',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0...',
      createTime: '2024-01-15 10:45:00'
    },
    {
      id: 3,
      taskId: 'task_003',
      auditorId: 2,
      auditorName: '内容审核员',
      action: 'reject',
      description: '头像内容不当，需要重新上传',
      oldValue: 'pending',
      newValue: 'rejected',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      createTime: '2024-01-15 14:30:00'
    }
  ]
}