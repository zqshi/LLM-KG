import { http } from './request'
import type {
  GlobalAuditLog,
  GlobalAuditLogQueryParams,
  GlobalAuditLogStatistics,
  AuditModule,
  GlobalOperationType,
  PaginationParams
} from '@/types'

// 全局审计日志API（完整版 - 整合三个审计日志模块）
export const globalAuditApi = {
  /**
   * 获取全局审计日志列表
   * 支持多模块、多条件筛选
   */
  getGlobalAuditLogs(params: GlobalAuditLogQueryParams) {
    return http.get<{
      list: GlobalAuditLog[];
      total: number;
    }>('/audit/global/logs', { params })
  },

  /**
   * 获取全局审计日志统计数据
   * 包括总数、趋势、模块统计、操作员排行等
   */
  getGlobalAuditStatistics() {
    return http.get<GlobalAuditLogStatistics>('/audit/global/statistics')
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
  }) {
    return http.post<{
      downloadUrl: string
      fileName: string
      reportId: string
    }>('/audit/global/export', params)
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
  }) {
    return http.post<{
      reportId: string
      downloadUrl: string
      fileName: string
      status: 'generating' | 'completed' | 'failed'
    }>('/audit/global/reports/generate', params)
  },

  /**
   * 获取审计报告生成状态
   */
  getReportStatus(reportId: string) {
    return http.get<{
      reportId: string
      status: 'generating' | 'completed' | 'failed'
      progress: number
      downloadUrl?: string
      error?: string
    }>(`/audit/global/reports/${reportId}/status`)
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
  }) {
    return http.get<{
      trace: GlobalAuditLog[]
      summary: {
        totalOperations: number
        riskOperations: number
        modulesInvolved: string[]
        timeSpan: string
      }
    }>('/audit/global/trace', { params })
  },

  /**
   * 获取审计日志详情
   * 包括完整的业务扩展数据
   */
  getAuditLogDetail(logId: number) {
    return http.get<GlobalAuditLog & {
      relatedLogs?: GlobalAuditLog[]
      context?: {
        previousOperation?: GlobalAuditLog
        nextOperation?: GlobalAuditLog
      }
    }>(`/audit/global/logs/${logId}`)
  },

  /**
   * 获取操作员列表
   * 用于筛选条件
   */
  getOperatorList() {
    return http.get<{
      id: number
      name: string
      module: string[]
      operationCount: number
      lastOperationTime: string
    }[]>('/audit/global/operators')
  },

  /**
   * 获取风险操作配置
   */
  getRiskOperationConfig() {
    return http.get<{
      highRiskOperations: string[]
      mediumRiskOperations: string[]
      riskThresholds: {
        responseTime: number
        frequency: number
      }
    }>('/audit/global/risk-config')
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
  }) {
    return http.put<{ updated: boolean }>('/audit/global/risk-config', config)
  },

  /**
   * 获取模块列表和统计
   */
  getModuleStats() {
    return http.get<{
      module: string
      displayName: string
      totalLogs: number
      riskLogs: number
      avgResponseTime: number
      isActive: boolean
    }[]>('/audit/global/modules')
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
  }) {
    return http.delete<{
      deletedCount: number
      backupFile?: string
    }>('/audit/global/logs/batch', { data: params })
  },

  /**
   * 创建审计日志记录（供各业务模块调用）
   */
  createAuditLog(data: Omit<GlobalAuditLog, 'id' | 'createTime'>) {
    return http.post<GlobalAuditLog>('/audit/global/logs', data)
  },

  /**
   * 批量创建审计日志记录
   */
  batchCreateAuditLogs(data: Array<Omit<GlobalAuditLog, 'id' | 'createTime'>>) {
    return http.post<GlobalAuditLog[]>('/audit/global/logs/batch', { logs: data })
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
  getAuditConfig() {
    return http.get<{
      enabledModules: AuditModule[];
      retentionDays: number;
      enableRealTimeAlert: boolean;
      alertRules: Array<{
        id: string;
        name: string;
        condition: string;
        enabled: boolean;
      }>;
    }>('/system/config/audit')
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
  }) {
    return http.put('/system/config/audit', config)
  },

  // 获取系统监控配置
  getSystemMonitorConfig() {
    return http.get<{
      enablePerformanceMonitor: boolean;
      enableSecurityMonitor: boolean;
      alertThresholds: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        errorRate: number;
      };
    }>('/system/config/monitor')
  },

  // 更新系统监控配置
  updateSystemMonitorConfig(config: any) {
    return http.put('/system/config/monitor', config)
  }
}

// 系统健康检查API
export const systemHealthApi = {
  // 获取系统健康状态
  getSystemHealth() {
    return http.get<{
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
    }>('/system/health')
  },

  // 获取系统告警
  getSystemAlerts(params?: PaginationParams) {
    return http.get<{
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
    }>('/system/alerts', params)
  },

  // 处理系统告警
  resolveAlert(alertId: number, resolution?: string) {
    return http.patch(`/system/alerts/${alertId}/resolve`, { resolution })
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