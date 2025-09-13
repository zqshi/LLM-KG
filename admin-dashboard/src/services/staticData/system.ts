import type {
  GlobalAuditLog,
  GlobalAuditLogStatistics,
  GlobalOperationType,
  AuditModule
} from '@/types'

/**
 * 全局审计日志静态数据
 */
export const globalAuditLogs = async (): Promise<GlobalAuditLog[]> => {
  return [
    {
      id: 1,
      module: 'RBAC',
      operatorId: 1,
      operatorName: '系统管理员',
      operationType: 'CREATE_USER',
      targetType: 'USER',
      targetId: '123',
      targetName: '张三',
      detail: '创建用户：张三，角色：普通用户',
      clientIp: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createTime: '2024-01-15 10:30:00',
      riskLevel: 'low',
      responseTime: 120,
      success: true
    },
    {
      id: 2,
      module: 'CONTENT',
      operatorId: 2,
      operatorName: '内容编辑',
      operationType: 'CREATE_CONTENT',
      targetType: 'CONTENT',
      targetId: '456',
      targetName: 'Vue 3教程文章',
      detail: '创建技术文章：Vue 3组件开发指南',
      clientIp: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      createTime: '2024-01-15 11:15:00',
      riskLevel: 'low',
      responseTime: 95,
      success: true
    },
    {
      id: 3,
      module: 'SYSTEM',
      operatorId: 1,
      operatorName: '系统管理员',
      operationType: 'UPDATE_SYSTEM_CONFIG',
      targetType: 'SYSTEM_CONFIG',
      targetId: 'audit-config',
      targetName: '审计配置',
      detail: '更新审计日志保留天数为90天',
      clientIp: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createTime: '2024-01-15 14:20:00',
      riskLevel: 'medium',
      responseTime: 200,
      success: true
    },
    {
      id: 4,
      module: 'RBAC',
      operatorId: 3,
      operatorName: '人事主管',
      operationType: 'ASSIGN_ROLE',
      targetType: 'USER',
      targetId: '123',
      targetName: '张三',
      detail: '为用户张三分配编辑者角色',
      clientIp: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createTime: '2024-01-15 15:45:00',
      riskLevel: 'medium',
      responseTime: 150,
      success: true
    },
    {
      id: 5,
      module: 'CONTENT',
      operatorId: 4,
      operatorName: '内容审核员',
      operationType: 'AUDIT_CONTENT',
      targetType: 'CONTENT',
      targetId: '456',
      targetName: 'Vue 3教程文章',
      detail: '审核通过技术文章：Vue 3组件开发指南',
      clientIp: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      createTime: '2024-01-15 16:30:00',
      riskLevel: 'low',
      responseTime: 300,
      success: true
    }
  ]
}

/**
 * 全局审计日志统计数据
 */
export const globalAuditStatistics = async (): Promise<GlobalAuditLogStatistics> => {
  return {
    totalLogs: 1250,
    todayLogs: 45,
    successRate: 98.5,
    avgResponseTime: 185,
    trendData: [
      { date: '2024-01-10', count: 28, avgResponseTime: 160 },
      { date: '2024-01-11', count: 32, avgResponseTime: 175 },
      { date: '2024-01-12', count: 41, avgResponseTime: 190 },
      { date: '2024-01-13', count: 38, avgResponseTime: 180 },
      { date: '2024-01-14', count: 45, avgResponseTime: 195 },
      { date: '2024-01-15', count: 52, avgResponseTime: 185 },
      { date: '2024-01-16', count: 48, avgResponseTime: 170 }
    ],
    moduleStats: [
      { module: 'RBAC', count: 425, percentage: 34 },
      { module: 'CONTENT', count: 380, percentage: 30.4 },
      { module: 'SYSTEM', count: 245, percentage: 19.6 },
      { module: 'AUDIT', count: 200, percentage: 16 }
    ],
    operationStats: [
      { operation: 'CREATE_USER', count: 125 },
      { operation: 'CREATE_CONTENT', count: 115 },
      { operation: 'UPDATE_CONTENT', count: 98 },
      { operation: 'ASSIGN_ROLE', count: 87 },
      { operation: 'AUDIT_CONTENT', count: 76 }
    ],
    operatorRanking: [
      { operatorId: 1, operatorName: '系统管理员', operationCount: 185 },
      { operatorId: 2, operatorName: '内容编辑', operationCount: 156 },
      { operatorId: 4, operatorName: '内容审核员', operationCount: 143 },
      { operatorId: 3, operatorName: '人事主管', operationCount: 98 }
    ],
    riskStats: {
      high: 15,
      medium: 89,
      low: 1146
    },
    hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: Math.floor(Math.random() * 20) + 5
    }))
  }
}

/**
 * 操作员列表
 */
export const operatorList = async () => {
  return [
    {
      id: 1,
      name: '系统管理员',
      module: ['RBAC', 'SYSTEM', 'AUDIT'],
      operationCount: 185,
      lastOperationTime: '2024-01-15 16:45:00'
    },
    {
      id: 2,
      name: '内容编辑',
      module: ['CONTENT'],
      operationCount: 156,
      lastOperationTime: '2024-01-15 16:30:00'
    },
    {
      id: 3,
      name: '人事主管',
      module: ['RBAC'],
      operationCount: 98,
      lastOperationTime: '2024-01-15 15:45:00'
    },
    {
      id: 4,
      name: '内容审核员',
      module: ['CONTENT', 'AUDIT'],
      operationCount: 143,
      lastOperationTime: '2024-01-15 16:30:00'
    }
  ]
}

/**
 * 风险操作配置
 */
export const riskOperationConfig = async () => {
  return {
    highRiskOperations: [
      'DELETE_USER',
      'DELETE_ROLE',
      'UPDATE_SYSTEM_CONFIG',
      'BACKUP_DATA',
      'RESTORE_DATA'
    ],
    mediumRiskOperations: [
      'ASSIGN_ROLE',
      'REMOVE_ROLE',
      'CREATE_ROLE',
      'UPDATE_ROLE',
      'AUDIT_CONTENT',
      'PUBLISH_CONTENT'
    ],
    riskThresholds: {
      responseTime: 1000,
      frequency: 50
    }
  }
}

/**
 * 模块统计数据
 */
export const moduleStats = async () => {
  return [
    {
      module: 'RBAC',
      displayName: '权限管理',
      totalLogs: 425,
      riskLogs: 45,
      avgResponseTime: 165,
      isActive: true
    },
    {
      module: 'CONTENT',
      displayName: '内容管理',
      totalLogs: 380,
      riskLogs: 28,
      avgResponseTime: 190,
      isActive: true
    },
    {
      module: 'SYSTEM',
      displayName: '系统管理',
      totalLogs: 245,
      riskLogs: 35,
      avgResponseTime: 220,
      isActive: true
    },
    {
      module: 'AUDIT',
      displayName: '审计管理',
      totalLogs: 200,
      riskLogs: 12,
      avgResponseTime: 145,
      isActive: true
    }
  ]
}

/**
 * 审计日志配置
 */
export const auditConfig = async () => {
  return {
    enabledModules: ['RBAC', 'CONTENT', 'SYSTEM', 'AUDIT'] as AuditModule[],
    retentionDays: 90,
    enableRealTimeAlert: true,
    alertRules: [
      {
        id: 'high-risk-ops',
        name: '高风险操作告警',
        condition: 'riskLevel = "high"',
        enabled: true
      },
      {
        id: 'failed-logins',
        name: '登录失败告警',
        condition: 'operationType = "LOGIN" AND success = false AND count > 5',
        enabled: true
      },
      {
        id: 'batch-operations',
        name: '批量操作告警',
        condition: 'operationType LIKE "%BATCH%" OR targetType = "BULK"',
        enabled: true
      }
    ]
  }
}

/**
 * 系统监控配置
 */
export const systemMonitorConfig = async () => {
  return {
    enablePerformanceMonitor: true,
    enableSecurityMonitor: true,
    alertThresholds: {
      cpuUsage: 80,
      memoryUsage: 85,
      diskUsage: 90,
      errorRate: 5
    }
  }
}

/**
 * 系统健康状态
 */
export const systemHealth = async () => {
  return {
    status: 'healthy' as const,
    services: [
      {
        name: 'Database',
        status: 'up' as const,
        responseTime: 25,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'Redis Cache',
        status: 'up' as const,
        responseTime: 15,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'File Storage',
        status: 'up' as const,
        responseTime: 45,
        lastCheck: new Date().toISOString()
      },
      {
        name: 'External API',
        status: 'degraded' as const,
        responseTime: 1200,
        lastCheck: new Date().toISOString()
      }
    ],
    metrics: {
      cpuUsage: 45.2,
      memoryUsage: 67.8,
      diskUsage: 23.5,
      activeUsers: 125,
      totalRequests: 15420,
      errorCount: 8
    }
  }
}

/**
 * 系统告警数据
 */
export const systemAlerts = async () => {
  return [
    {
      id: 1,
      type: 'performance' as const,
      level: 'medium' as const,
      title: 'CPU使用率较高',
      message: '系统CPU使用率持续超过70%，建议检查应用程序性能',
      source: 'System Monitor',
      resolved: false,
      createdAt: '2024-01-15 14:30:00'
    },
    {
      id: 2,
      type: 'security' as const,
      level: 'high' as const,
      title: '异常登录尝试',
      message: '检测到来自异常IP的多次登录失败尝试',
      source: 'Security Monitor',
      resolved: false,
      createdAt: '2024-01-15 13:45:00'
    },
    {
      id: 3,
      type: 'error' as const,
      level: 'low' as const,
      title: '接口响应异常',
      message: '第三方API响应时间超过预设阈值',
      source: 'API Monitor',
      resolved: true,
      createdAt: '2024-01-15 12:15:00',
      resolvedAt: '2024-01-15 12:30:00'
    }
  ]
}