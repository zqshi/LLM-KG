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
      id: 'task_001',
      bizType: 'banner',
      bizId: '123',
      title: 'Banner内容审核',
      content: {
        title: 'AI技术发展新动态',
        description: '最新的人工智能技术发展趋势分析',
        imageUrl: '/images/banner1.jpg',
        linkUrl: 'https://example.com/ai-news'
      },
      status: 'pending',
      priority: 'normal',
      submitterId: 1,
      submitterName: '内容编辑',
      assigneeId: 2,
      assigneeName: '内容审核员',
      createTime: '2024-01-15 10:30:00',
      assignTime: '2024-01-15 10:31:00',
      deadline: '2024-01-15 18:00:00',
      completedTime: null,
      auditResult: null,
      remark: null,
      estimatedTime: 120,
      actualTime: null
    },
    {
      id: 'task_002',
      bizType: 'content',
      bizId: '456',
      title: '文章内容审核',
      content: {
        title: 'Vue 3开发指南',
        content: '详细介绍Vue 3的新特性和开发技巧...',
        category: 'technology',
        tags: ['vue', '前端', '开发']
      },
      status: 'approved',
      priority: 'high',
      submitterId: 3,
      submitterName: '技术编辑',
      assigneeId: 4,
      assigneeName: '技术审核员',
      createTime: '2024-01-15 09:15:00',
      assignTime: '2024-01-15 09:16:00',
      deadline: '2024-01-15 12:00:00',
      completedTime: '2024-01-15 10:45:00',
      auditResult: 'approved',
      remark: '内容质量良好，可以发布',
      estimatedTime: 90,
      actualTime: 89
    },
    {
      id: 'task_003',
      bizType: 'user',
      bizId: '789',
      title: '用户注册信息审核',
      content: {
        username: 'newuser123',
        email: 'newuser@example.com',
        profile: {
          avatar: '/avatars/user789.jpg',
          bio: '热爱技术的开发者'
        }
      },
      status: 'rejected',
      priority: 'low',
      submitterId: 5,
      submitterName: '系统自动',
      assigneeId: 2,
      assigneeName: '内容审核员',
      createTime: '2024-01-15 11:20:00',
      assignTime: '2024-01-15 11:21:00',
      deadline: '2024-01-16 11:20:00',
      completedTime: '2024-01-15 14:30:00',
      auditResult: 'rejected',
      remark: '头像内容不当，需要重新上传',
      estimatedTime: 60,
      actualTime: 65
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
      description: '用于Banner广告内容的审核规则',
      rules: [
        { field: 'title', operator: 'contains', value: ['违禁词'], action: 'reject' },
        { field: 'imageUrl', operator: 'required', value: true, action: 'reject' },
        { field: 'linkUrl', operator: 'format', value: 'url', action: 'reject' }
      ],
      isActive: true,
      priority: 1,
      autoAssign: true,
      assigneeId: 2,
      timeLimit: 120,
      creator: '系统管理员',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-12 14:30:00'
    },
    {
      id: 2,
      name: '文章内容审核策略',
      bizType: 'content',
      description: '用于文章内容的质量和合规性审核',
      rules: [
        { field: 'content', operator: 'minLength', value: 100, action: 'reject' },
        { field: 'title', operator: 'maxLength', value: 100, action: 'reject' },
        { field: 'tags', operator: 'required', value: true, action: 'warn' }
      ],
      isActive: true,
      priority: 2,
      autoAssign: true,
      assigneeId: 4,
      timeLimit: 90,
      creator: '内容主管',
      createTime: '2024-01-08 16:45:00',
      updateTime: '2024-01-14 10:15:00'
    },
    {
      id: 3,
      name: '用户信息审核策略',
      bizType: 'user',
      description: '用于新用户注册信息的审核',
      rules: [
        { field: 'username', operator: 'pattern', value: '^[a-zA-Z0-9_]{3,20}$', action: 'reject' },
        { field: 'email', operator: 'format', value: 'email', action: 'reject' },
        { field: 'avatar', operator: 'imageCheck', value: true, action: 'manual' }
      ],
      isActive: true,
      priority: 3,
      autoAssign: false,
      assigneeId: null,
      timeLimit: 60,
      creator: '安全管理员',
      createTime: '2024-01-05 11:20:00',
      updateTime: null
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
      action: 'block',
      category: '政治敏感',
      replaceWith: '***',
      isActive: true,
      hitCount: 15,
      creator: '安全管理员',
      createTime: '2024-01-10 09:00:00',
      updateTime: '2024-01-12 14:30:00'
    },
    {
      id: 2,
      word: '违禁词示例2',
      action: 'warn',
      category: '商业广告',
      replaceWith: '[广告]',
      isActive: true,
      hitCount: 8,
      creator: '内容管理员',
      createTime: '2024-01-08 16:45:00',
      updateTime: null
    },
    {
      id: 3,
      word: '违禁词示例3',
      action: 'review',
      category: '暴力内容',
      replaceWith: '',
      isActive: false,
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
      userId: 2,
      username: 'auditor001',
      name: '内容审核员',
      email: 'auditor001@example.com',
      role: 'content_auditor',
      department: '内容部',
      bizTypes: ['banner', 'content'],
      status: 'active',
      maxDailyTasks: 50,
      currentTasks: 12,
      todayCompleted: 8,
      totalCompleted: 1245,
      avgProcessTime: 85,
      successRate: 98.5,
      lastActiveTime: '2024-01-15 14:30:00',
      createTime: '2024-01-01 09:00:00'
    },
    {
      id: 2,
      userId: 4,
      username: 'auditor002',
      name: '技术审核员',
      email: 'auditor002@example.com',
      role: 'tech_auditor',
      department: '技术部',
      bizTypes: ['content', 'user'],
      status: 'active',
      maxDailyTasks: 30,
      currentTasks: 5,
      todayCompleted: 15,
      totalCompleted: 856,
      avgProcessTime: 65,
      successRate: 99.2,
      lastActiveTime: '2024-01-15 15:45:00',
      createTime: '2024-01-03 14:20:00'
    },
    {
      id: 3,
      userId: 6,
      username: 'auditor003',
      name: '安全审核员',
      email: 'auditor003@example.com',
      role: 'security_auditor',
      department: '安全部',
      bizTypes: ['user', 'security'],
      status: 'inactive',
      maxDailyTasks: 40,
      currentTasks: 0,
      todayCompleted: 0,
      totalCompleted: 342,
      avgProcessTime: 120,
      successRate: 97.8,
      lastActiveTime: '2024-01-14 18:00:00',
      createTime: '2024-01-05 10:30:00'
    }
  ]
}

/**
 * 审计统计数据
 */
export const auditStats = async (): Promise<AuditStats> => {
  return {
    totalTasks: 1256,
    pendingTasks: 23,
    todayCompleted: 45,
    avgProcessTime: 78,
    successRate: 98.7,
    tasksByStatus: [
      { status: 'pending', count: 23 },
      { status: 'processing', count: 8 },
      { status: 'approved', count: 1156 },
      { status: 'rejected', count: 69 }
    ],
    tasksByBizType: [
      { bizType: 'banner', count: 456 },
      { bizType: 'content', count: 523 },
      { bizType: 'user', count: 277 }
    ],
    auditorStats: [
      { auditorId: 1, name: '内容审核员', completed: 8, avgTime: 85 },
      { auditorId: 2, name: '技术审核员', completed: 15, avgTime: 65 },
      { auditorId: 3, name: '安全审核员', completed: 0, avgTime: 120 }
    ],
    trendData: [
      { date: '2024-01-10', completed: 42, avgTime: 82 },
      { date: '2024-01-11', completed: 38, avgTime: 76 },
      { date: '2024-01-12', completed: 51, avgTime: 79 },
      { date: '2024-01-13', completed: 46, avgTime: 81 },
      { date: '2024-01-14', completed: 49, avgTime: 75 },
      { date: '2024-01-15', completed: 45, avgTime: 78 }
    ]
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