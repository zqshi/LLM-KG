import { request } from './request'
import { apiAdapter } from './adapter'
import { 
  globalAuditLogs,
  globalAuditStatistics,
  operatorList,
  riskOperationConfig,
  moduleStats,
  auditConfig,
  systemMonitorConfig,
  systemHealth,
  systemAlerts
} from '@/services/staticData/system'
import type {
  GlobalAuditLog,
  GlobalAuditLogQueryParams,
  GlobalAuditLogStatistics,
  AuditModule,
  GlobalOperationType,
  PaginationParams,
  ApiResponse
} from '@/types'

// 全局审计日志API（完整版 - 整合三个审计日志模块）
export const globalAuditApi = {
  /**
   * 获取全局审计日志列表
   * 支持多模块、多条件筛选
   */
  getGlobalAuditLogs(params: GlobalAuditLogQueryParams): Promise<ApiResponse<{
    list: GlobalAuditLog[];
    total: number;
  }>> {
    return apiAdapter.get(
      () => request.get<{
        list: GlobalAuditLog[];
        total: number;
      }>('/audit/global/logs', { params }),
      async () => {
        const allLogs = await globalAuditLogs()
        return { list: allLogs, total: allLogs.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  /**
   * 获取全局审计日志统计数据
   * 包括总数、趋势、模块统计、操作员排行等
   */
  getGlobalAuditStatistics(): Promise<ApiResponse<GlobalAuditLogStatistics>> {
    return apiAdapter.get(
      () => request.get<GlobalAuditLogStatistics>('/audit/global/statistics'),
      async () => await globalAuditStatistics()
    )
  },

  /**
   * 导出全局审计日志报告
   * 支持PDF、Excel、CSV格式
   */
  exportGlobalAuditReport(params: {
    queryConditions: GlobalAuditLogQueryParams
    format: 'pdf' | 'excel' | 'csv'
    includeCharts?: boolean
    reportConfig?: {
      title?: string
      companyLogo?: boolean
      generateTime?: boolean
      summary?: boolean
    }
  }): Promise<ApiResponse<{
    downloadUrl: string
    fileName: string
    reportId: string
  }>> {
    return apiAdapter.post(
      () => request.post<{
        downloadUrl: string
        fileName: string
        reportId: string
      }>('/audit/global/export', params),
      async () => ({
        downloadUrl: '/mock/audit-report.pdf',
        fileName: `audit-report-${Date.now()}.${params.format}`,
        reportId: 'report_' + Date.now()
      })
    )
  },

  /**
   * 生成审计报告
   * 支持按模块、按时间范围生成不同类型的报告
   */
  generateAuditReport(params: {
    type: 'comprehensive' | 'module_specific' | 'risk_analysis' | 'performance_analysis'
    dateRange?: [string, string]
    modules?: string[]
    module?: string
    includeStatistics?: boolean
    format: 'pdf' | 'excel' | 'csv'
    title?: string
  }): Promise<ApiResponse<{
    reportId: string
    downloadUrl: string
    fileName: string
    status: 'generating' | 'completed' | 'failed'
  }>> {
    return apiAdapter.post(
      () => request.post<{
        reportId: string
        downloadUrl: string
        fileName: string
        status: 'generating' | 'completed' | 'failed'
      }>('/audit/global/reports/generate', params),
      async () => {
        const reportId = 'audit_report_' + Date.now()
        return {
          reportId,
          downloadUrl: `/mock/reports/${reportId}.${params.format}`,
          fileName: `${params.title || params.type}_report.${params.format}`,
          status: 'completed' as const
        }
      }
    )
  },

  /**
   * 获取审计报告生成状态
   */
  getReportStatus(reportId: string): Promise<ApiResponse<{
    reportId: string
    status: 'generating' | 'completed' | 'failed'
    progress: number
    downloadUrl?: string
    error?: string
  }>> {
    return apiAdapter.get(
      () => request.get<{
        reportId: string
        status: 'generating' | 'completed' | 'failed'
        progress: number
        downloadUrl?: string
        error?: string
      }>(`/audit/global/reports/${reportId}/status`),
      async () => ({
        reportId,
        status: 'completed' as const,
        progress: 100,
        downloadUrl: `/mock/reports/${reportId}.pdf`
      })
    )
  },

  /**
   * 获取用户操作轨迹
   * 跨模块追踪用户的操作序列
   */
  getUserOperationTrace(params: {
    operatorId: number
    startTime: string
    endTime: string
    modules?: string[]
  }): Promise<ApiResponse<{
    trace: GlobalAuditLog[]
    summary: {
      totalOperations: number
      riskOperations: number
      modulesInvolved: string[]
      timeSpan: string
    }
  }>> {
    return apiAdapter.get(
      () => request.get<{
        trace: GlobalAuditLog[]
        summary: {
          totalOperations: number
          riskOperations: number
          modulesInvolved: string[]
          timeSpan: string
        }
      }>('/audit/global/trace', { params }),
      async () => {
        const allLogs = await globalAuditLogs()
        const trace = allLogs.filter(log => log.operatorId === params.operatorId)
        return {
          trace,
          summary: {
            totalOperations: trace.length,
            riskOperations: trace.filter(log => log.riskLevel === 'high' || log.riskLevel === 'medium').length,
            modulesInvolved: [...new Set(trace.map(log => log.module))],
            timeSpan: `${params.startTime} - ${params.endTime}`
          }
        }
      }
    )
  },

  /**
   * 获取审计日志详情
   * 包括完整的业务扩展数据
   */
  getAuditLogDetail(logId: number): Promise<ApiResponse<GlobalAuditLog & {
    relatedLogs?: GlobalAuditLog[]
    context?: {
      previousOperation?: GlobalAuditLog
      nextOperation?: GlobalAuditLog
    }
  }>> {
    return apiAdapter.get(
      () => request.get<GlobalAuditLog & {
        relatedLogs?: GlobalAuditLog[]
        context?: {
          previousOperation?: GlobalAuditLog
          nextOperation?: GlobalAuditLog
        }
      }>(`/audit/global/logs/${logId}`),
      async () => {
        const allLogs = await globalAuditLogs()
        const log = allLogs.find(l => l.id === logId)
        if (!log) {
          throw new Error('审计日志不存在')
        }
        const relatedLogs = allLogs.filter(l => l.targetId === log.targetId && l.id !== logId)
        return {
          ...log,
          relatedLogs,
          context: {
            previousOperation: allLogs.find(l => l.id === logId - 1),
            nextOperation: allLogs.find(l => l.id === logId + 1)
          }
        }
      }
    )
  },

  /**
   * 获取操作员列表
   * 用于筛选条件
   */
  getOperatorList(): Promise<ApiResponse<{
    id: number
    name: string
    module: string[]
    operationCount: number
    lastOperationTime: string
  }[]>> {
    return apiAdapter.get(
      () => request.get<{
        id: number
        name: string
        module: string[]
        operationCount: number
        lastOperationTime: string
      }[]>('/audit/global/operators'),
      async () => await operatorList()
    )
  },

  /**
   * 获取风险操作配置
   */
  getRiskOperationConfig(): Promise<ApiResponse<{
    highRiskOperations: string[]
    mediumRiskOperations: string[]
    riskThresholds: {
      responseTime: number
      frequency: number
    }
  }>> {
    return apiAdapter.get(
      () => request.get<{
        highRiskOperations: string[]
        mediumRiskOperations: string[]
        riskThresholds: {
          responseTime: number
          frequency: number
        }
      }>('/audit/global/risk-config'),
      async () => await riskOperationConfig()
    )
  },

  /**
   * 更新风险操作配置
   */
  updateRiskOperationConfig(config: {
    highRiskOperations: string[]
    mediumRiskOperations: string[]
    riskThresholds: {
      responseTime: number
      frequency: number
    }
  }): Promise<ApiResponse<{ updated: boolean }>> {
    return apiAdapter.put(
      () => request.put<{ updated: boolean }>('/audit/global/risk-config', config),
      async () => ({ updated: true })
    )
  },

  /**
   * 获取模块列表和统计
   */
  getModuleStats(): Promise<ApiResponse<{
    module: string
    displayName: string
    totalLogs: number
    riskLogs: number
    avgResponseTime: number
    isActive: boolean
  }[]>> {
    return apiAdapter.get(
      () => request.get<{
        module: string
        displayName: string
        totalLogs: number
        riskLogs: number
        avgResponseTime: number
        isActive: boolean
      }[]>('/audit/global/modules'),
      async () => await moduleStats()
    )
  },

  /**
   * 批量删除审计日志（限管理员）
   */
  batchDeleteAuditLogs(params: {
    logIds?: number[]
    conditions?: {
      beforeDate: string
      modules?: string[]
      riskLevel?: string
    }
    keepBackup: boolean
  }): Promise<ApiResponse<{
    deletedCount: number
    backupFile?: string
  }>> {
    return apiAdapter.delete(
      () => request.delete<{
        deletedCount: number
        backupFile?: string
      }>('/audit/global/logs/batch', { data: params }),
      async () => ({
        deletedCount: params.logIds?.length || 10,
        backupFile: params.keepBackup ? `/backup/audit-logs-${Date.now()}.json` : undefined
      })
    )
  },

  /**
   * 创建审计日志记录（供各业务模块调用）
   */
  createAuditLog(data: Omit<GlobalAuditLog, 'id' | 'createTime'>): Promise<ApiResponse<GlobalAuditLog>> {
    return apiAdapter.post(
      () => request.post<GlobalAuditLog>('/audit/global/logs', data),
      async () => ({
        ...data,
        id: Date.now(),
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      })
    )
  },

  /**
   * 批量创建审计日志记录
   */
  batchCreateAuditLogs(data: Array<Omit<GlobalAuditLog, 'id' | 'createTime'>>): Promise<ApiResponse<GlobalAuditLog[]>> {
    return apiAdapter.post(
      () => request.post<GlobalAuditLog[]>('/audit/global/logs/batch', { logs: data }),
      async () => data.map((log, index) => ({
        ...log,
        id: Date.now() + index,
        createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }))
    )
  },

  /**
   * 实时日志推送配置
   */
  createRealtimeConnection() {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${wsProtocol}//${window.location.host}/audit/global/realtime`
    
    const ws = new WebSocket(wsUrl)
    
    return {
      socket: ws,
      subscribe: (callback: (log: GlobalAuditLog) => void) => {
        ws.onmessage = (event) => {
          try {
            const log = JSON.parse(event.data) as GlobalAuditLog
            callback(log)
          } catch (error) {
            console.error('Failed to parse realtime log:', error)
          }
        }
      },
      close: () => {
        ws.close()
      }
    }
  }
}

// 系统配置API
export const systemConfigApi = {
  // 获取审计日志配置
  getAuditConfig(): Promise<ApiResponse<{
    enabledModules: AuditModule[];
    retentionDays: number;
    enableRealTimeAlert: boolean;
    alertRules: Array<{
      id: string;
      name: string;
      condition: string;
      enabled: boolean;
    }>;
  }>> {
    return apiAdapter.get(
      () => request.get<{
        enabledModules: AuditModule[];
        retentionDays: number;
        enableRealTimeAlert: boolean;
        alertRules: Array<{
          id: string;
          name: string;
          condition: string;
          enabled: boolean;
        }>;
      }>('/system/config/audit'),
      async () => await auditConfig()
    )
  },

  // 更新审计日志配置
  updateAuditConfig(config: {
    enabledModules?: AuditModule[];
    retentionDays?: number;
    enableRealTimeAlert?: boolean;
    alertRules?: Array<{
      id: string;
      name: string;
      condition: string;
      enabled: boolean;
    }>;
  }): Promise<ApiResponse<any>> {
    return apiAdapter.put(
      () => request.put('/system/config/audit', config),
      async () => ({ updated: true })
    )
  },

  // 获取系统监控配置
  getSystemMonitorConfig(): Promise<ApiResponse<{
    enablePerformanceMonitor: boolean;
    enableSecurityMonitor: boolean;
    alertThresholds: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      errorRate: number;
    };
  }>> {
    return apiAdapter.get(
      () => request.get<{
        enablePerformanceMonitor: boolean;
        enableSecurityMonitor: boolean;
        alertThresholds: {
          cpuUsage: number;
          memoryUsage: number;
          diskUsage: number;
          errorRate: number;
        };
      }>('/system/config/monitor'),
      async () => await systemMonitorConfig()
    )
  },

  // 更新系统监控配置
  updateSystemMonitorConfig(config: any): Promise<ApiResponse<any>> {
    return apiAdapter.put(
      () => request.put('/system/config/monitor', config),
      async () => ({ updated: true })
    )
  }
}

// 系统健康检查API
export const systemHealthApi = {
  // 获取系统健康状态
  getSystemHealth(): Promise<ApiResponse<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      responseTime?: number;
      lastCheck: string;
    }>;
    metrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      activeUsers: number;
      totalRequests: number;
      errorCount: number;
    };
  }>> {
    return apiAdapter.get(
      () => request.get<{
        status: 'healthy' | 'warning' | 'critical';
        services: Array<{
          name: string;
          status: 'up' | 'down' | 'degraded';
          responseTime?: number;
          lastCheck: string;
        }>;
        metrics: {
          cpuUsage: number;
          memoryUsage: number;
          diskUsage: number;
          activeUsers: number;
          totalRequests: number;
          errorCount: number;
        };
      }>('/system/health'),
      async () => await systemHealth()
    )
  },

  // 获取系统告警
  getSystemAlerts(params?: PaginationParams): Promise<ApiResponse<{
    list: Array<{
      id: number;
      type: 'security' | 'performance' | 'error';
      level: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      message: string;
      source: string;
      resolved: boolean;
      createdAt: string;
      resolvedAt?: string;
    }>;
    total: number;
  }>> {
    return apiAdapter.get(
      () => request.get<{
        list: Array<{
          id: number;
          type: 'security' | 'performance' | 'error';
          level: 'low' | 'medium' | 'high' | 'critical';
          title: string;
          message: string;
          source: string;
          resolved: boolean;
          createdAt: string;
          resolvedAt?: string;
        }>;
        total: number;
      }>('/system/alerts', params),
      async () => {
        const alerts = await systemAlerts()
        return { list: alerts, total: alerts.length }
      },
      { mockPagination: true, paginationParams: params }
    )
  },

  // 处理系统告警
  resolveAlert(alertId: number, resolution?: string): Promise<ApiResponse<any>> {
    return apiAdapter.patch(
      () => request.patch(`/system/alerts/${alertId}/resolve`, { resolution }),
      async () => ({ resolved: true, alertId, resolution })
    )
  }
}

// 审计日志工具函数
export const auditLogUtils = {
  // 记录RBAC操作
  logRbacOperation(data: {
    operatorId: number;
    operatorName: string;
    operationType: Extract<GlobalOperationType, 
      'ASSIGN_ROLE' | 'REMOVE_ROLE' | 'CREATE_USER' | 'UPDATE_USER' | 'DELETE_USER' |
      'CREATE_ROLE' | 'UPDATE_ROLE' | 'DELETE_ROLE' | 'SYNC_USERS'
    >;
    targetType: 'USER' | 'ROLE' | 'PERMISSION' | 'GROUP';
    targetId: string;
    targetName: string;
    detail?: string;
    clientIp: string;
  }) {
    return globalAuditApi.createAuditLog({
      ...data,
      module: 'RBAC'
    })
  },

  // 记录内容管理操作
  logContentOperation(data: {
    operatorId: number;
    operatorName: string;
    operationType: Extract<GlobalOperationType,
      'CREATE_CONTENT' | 'UPDATE_CONTENT' | 'DELETE_CONTENT' | 'AUDIT_CONTENT' |
      'PUBLISH_CONTENT' | 'UNPUBLISH_CONTENT' | 'TOP_CONTENT' | 'ELITE_CONTENT'
    >;
    targetType: 'CONTENT' | 'CATEGORY' | 'COMMENT';
    targetId: string;
    targetName: string;
    detail?: string;
    clientIp: string;
  }) {
    return globalAuditApi.createAuditLog({
      ...data,
      module: 'CONTENT'
    })
  },

  // 记录系统操作
  logSystemOperation(data: {
    operatorId: number;
    operatorName: string;
    operationType: Extract<GlobalOperationType,
      'UPDATE_SYSTEM_CONFIG' | 'BACKUP_DATA' | 'RESTORE_DATA' | 'CLEAR_CACHE' |
      'UPDATE_ALERT_CONFIG' | 'HANDLE_ALERT'
    >;
    targetType: 'SYSTEM_CONFIG';
    targetId: string;
    targetName: string;
    detail?: string;
    clientIp: string;
  }) {
    return globalAuditApi.createAuditLog({
      ...data,
      module: 'SYSTEM'
    })
  }
}