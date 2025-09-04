import { EventEmitter } from '@/utils/EventEmitter'
import { request } from './request'
import type { BizType, AuditPolicy, PolicyForm } from '@/types'

/**
 * 动态配置事件类型
 */
export enum PolicyConfigEvent {
  POLICY_UPDATED = 'policy_updated',
  POLICY_ENABLED = 'policy_enabled',
  POLICY_DISABLED = 'policy_disabled',
  POLICY_CREATED = 'policy_created',
  POLICY_DELETED = 'policy_deleted',
  CONFIG_SYNCED = 'config_synced',
  ERROR_OCCURRED = 'error_occurred'
}

/**
 * 策略配置变更记录
 */
export interface PolicyChangeRecord {
  id: string
  policyId: number
  changeType: PolicyConfigEvent
  oldConfig?: Partial<AuditPolicy>
  newConfig?: Partial<AuditPolicy>
  operatorId: number
  operatorName: string
  reason?: string
  timestamp: string
  appliedAt?: string
  rollbackAt?: string
}

/**
 * 动态配置规则
 */
export interface DynamicConfigRule {
  id: string
  name: string
  description: string
  conditions: {
    timeRange?: {
      start: string
      end: string
      timezone?: string
    }
    triggerEvents?: string[]
    thresholds?: {
      taskCount?: number
      errorRate?: number
      avgProcessTime?: number
    }
    bizTypes?: BizType[]
  }
  actions: {
    modifyPolicy?: {
      policyId: number
      changes: Partial<PolicyForm>
    }
    enablePolicy?: number[]
    disablePolicy?: number[]
    adjustSampleRate?: {
      policyId: number
      rate: number
    }
    changePriority?: {
      policyId: number
      priority: 'high' | 'normal' | 'low'
    }
  }
  enabled: boolean
  priority: number
  createTime: string
  lastTrigger?: string
}

/**
 * 策略快照
 */
export interface PolicySnapshot {
  id: string
  name: string
  policies: AuditPolicy[]
  createTime: string
  creatorId: number
  creatorName: string
  description?: string
  isActive: boolean
}

/**
 * 审核策略动态配置管理器
 */
export class AuditPolicyDynamicManager extends EventEmitter {
  private policies: Map<number, AuditPolicy> = new Map()
  private configRules: Map<string, DynamicConfigRule> = new Map()
  private changeHistory: PolicyChangeRecord[] = []
  private snapshots: Map<string, PolicySnapshot> = new Map()
  private syncInterval: NodeJS.Timeout | null = null
  private isEnabled = true

  constructor() {
    super()
    this.initializeManager()
  }

  /**
   * 初始化动态配置管理器
   */
  private async initializeManager(): Promise<void> {
    try {
      await this.loadPolicies()
      await this.loadConfigRules()
      await this.loadChangeHistory()
      this.startPeriodicSync()
      this.setupEventListeners()
      
      console.log('审核策略动态配置管理器初始化完成')
    } catch (error) {
      console.error('动态配置管理器初始化失败:', error)
    }
  }

  /**
   * 动态更新策略
   */
  async updatePolicy(
    policyId: number,
    changes: Partial<PolicyForm>,
    options?: {
      operatorId?: number
      operatorName?: string
      reason?: string
      immediate?: boolean
    }
  ): Promise<void> {
    try {
      const currentPolicy = this.policies.get(policyId)
      if (!currentPolicy) {
        throw new Error(`策略 ${policyId} 不存在`)
      }

      // 记录变更前的配置
      const oldConfig = { ...currentPolicy }

      // 应用变更
      const updatedPolicy = { ...currentPolicy, ...changes }

      // 验证配置有效性
      await this.validatePolicyConfig(updatedPolicy)

      if (options?.immediate !== false) {
        // 立即应用
        await this.applyPolicyChanges(policyId, updatedPolicy)
      }

      // 更新本地缓存
      this.policies.set(policyId, updatedPolicy as AuditPolicy)

      // 记录变更历史
      await this.recordPolicyChange({
        policyId,
        changeType: PolicyConfigEvent.POLICY_UPDATED,
        oldConfig,
        newConfig: changes,
        operatorId: options?.operatorId || 0,
        operatorName: options?.operatorName || 'System',
        reason: options?.reason
      })

      // 发送事件通知
      this.emit(PolicyConfigEvent.POLICY_UPDATED, {
        policyId,
        oldConfig,
        newConfig: updatedPolicy,
        changes
      })

    } catch (error) {
      console.error('动态更新策略失败:', error)
      this.emit(PolicyConfigEvent.ERROR_OCCURRED, error)
      throw error
    }
  }

  /**
   * 批量更新策略
   */
  async batchUpdatePolicies(
    updates: Array<{
      policyId: number
      changes: Partial<PolicyForm>
      reason?: string
    }>,
    options?: {
      operatorId?: number
      operatorName?: string
      atomic?: boolean
    }
  ): Promise<void> {
    if (options?.atomic) {
      // 原子性更新，要么全部成功，要么全部失败
      const snapshot = await this.createSnapshot('batch_update_backup')
      
      try {
        for (const update of updates) {
          await this.updatePolicy(update.policyId, update.changes, {
            ...options,
            reason: update.reason,
            immediate: false
          })
        }

        // 统一应用所有变更
        await this.applyAllPendingChanges()
        
      } catch (error) {
        // 回滚到快照
        await this.restoreFromSnapshot(snapshot.id)
        throw error
      }
    } else {
      // 非原子性更新，独立处理每个策略
      const results = await Promise.allSettled(
        updates.map(update => 
          this.updatePolicy(update.policyId, update.changes, {
            ...options,
            reason: update.reason
          })
        )
      )

      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        console.warn(`批量更新中有 ${failures.length} 个策略更新失败`)
      }
    }
  }

  /**
   * 创建动态配置规则
   */
  async createConfigRule(rule: Omit<DynamicConfigRule, 'id' | 'createTime'>): Promise<string> {
    const configRule: DynamicConfigRule = {
      id: this.generateId(),
      createTime: new Date().toISOString(),
      ...rule
    }

    // 验证规则配置
    this.validateConfigRule(configRule)

    // 保存到数据库
    await request.post('/audit/config-rules', configRule)

    // 更新本地缓存
    this.configRules.set(configRule.id, configRule)

    // 如果启用，立即开始监听
    if (configRule.enabled) {
      this.activateConfigRule(configRule)
    }

    return configRule.id
  }

  /**
   * 创建策略快照
   */
  async createSnapshot(
    name: string,
    options?: {
      description?: string
      creatorId?: number
      creatorName?: string
      policies?: number[]
    }
  ): Promise<PolicySnapshot> {
    const snapshot: PolicySnapshot = {
      id: this.generateId(),
      name,
      policies: options?.policies 
        ? Array.from(this.policies.values()).filter(p => options.policies!.includes(p.id))
        : Array.from(this.policies.values()),
      createTime: new Date().toISOString(),
      creatorId: options?.creatorId || 0,
      creatorName: options?.creatorName || 'System',
      description: options?.description,
      isActive: false
    }

    // 保存快照
    await request.post('/audit/policy-snapshots', snapshot)
    this.snapshots.set(snapshot.id, snapshot)

    return snapshot
  }

  /**
   * 从快照恢复配置
   */
  async restoreFromSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) {
      throw new Error(`快照 ${snapshotId} 不存在`)
    }

    try {
      // 创建当前配置的备份快照
      await this.createSnapshot('auto_backup_before_restore', {
        description: `恢复快照 ${snapshot.name} 前的自动备份`
      })

      // 逐个恢复策略
      for (const policy of snapshot.policies) {
        await this.applyPolicyChanges(policy.id, policy)
        this.policies.set(policy.id, policy)
      }

      // 标记快照为活跃状态
      snapshot.isActive = true
      await request.put(`/audit/policy-snapshots/${snapshotId}`, snapshot)

      // 发送恢复完成事件
      this.emit(PolicyConfigEvent.CONFIG_SYNCED, {
        type: 'snapshot_restore',
        snapshotId,
        snapshotName: snapshot.name
      })

    } catch (error) {
      console.error('从快照恢复失败:', error)
      throw error
    }
  }

  /**
   * 根据时间或事件自动调整策略
   */
  async triggerAutomaticAdjustment(
    trigger: {
      type: 'time' | 'event' | 'threshold'
      data: any
    }
  ): Promise<void> {
    const applicableRules = Array.from(this.configRules.values())
      .filter(rule => rule.enabled && this.shouldTriggerRule(rule, trigger))
      .sort((a, b) => b.priority - a.priority)

    for (const rule of applicableRules) {
      try {
        await this.executeConfigRule(rule, trigger)
        
        // 更新最后触发时间
        rule.lastTrigger = new Date().toISOString()
        await request.put(`/audit/config-rules/${rule.id}`, rule)
        
      } catch (error) {
        console.error(`执行配置规则 ${rule.name} 失败:`, error)
      }
    }
  }

  /**
   * 获取策略变更历史
   */
  async getPolicyChangeHistory(
    filters?: {
      policyId?: number
      changeType?: PolicyConfigEvent
      operatorId?: number
      dateRange?: [string, string]
      limit?: number
    }
  ): Promise<PolicyChangeRecord[]> {
    try {
      const response = await request.get('/audit/policy-changes', { 
        params: filters 
      })
      return response.data
    } catch (error) {
      console.error('获取策略变更历史失败:', error)
      return this.changeHistory.filter(record => {
        if (filters?.policyId && record.policyId !== filters.policyId) return false
        if (filters?.changeType && record.changeType !== filters.changeType) return false
        if (filters?.operatorId && record.operatorId !== filters.operatorId) return false
        return true
      }).slice(0, filters?.limit || 50)
    }
  }

  /**
   * 回滚策略变更
   */
  async rollbackPolicyChange(changeId: string): Promise<void> {
    const changeRecord = this.changeHistory.find(r => r.id === changeId)
    if (!changeRecord) {
      throw new Error(`变更记录 ${changeId} 不存在`)
    }

    if (!changeRecord.oldConfig) {
      throw new Error('无法回滚：缺少原始配置数据')
    }

    try {
      await this.updatePolicy(
        changeRecord.policyId,
        changeRecord.oldConfig,
        {
          operatorId: 0,
          operatorName: 'System',
          reason: `回滚变更 ${changeId}`
        }
      )

      // 标记为已回滚
      changeRecord.rollbackAt = new Date().toISOString()
      await request.put(`/audit/policy-changes/${changeId}`, changeRecord)

    } catch (error) {
      console.error('回滚策略变更失败:', error)
      throw error
    }
  }

  // 私有方法

  private async loadPolicies(): Promise<void> {
    try {
      const response = await request.get('/audit/policies')
      const policies: AuditPolicy[] = response.data
      
      policies.forEach(policy => {
        this.policies.set(policy.id, policy)
      })
    } catch (error) {
      console.error('加载策略失败:', error)
    }
  }

  private async loadConfigRules(): Promise<void> {
    try {
      const response = await request.get('/audit/config-rules')
      const rules: DynamicConfigRule[] = response.data
      
      rules.forEach(rule => {
        this.configRules.set(rule.id, rule)
        if (rule.enabled) {
          this.activateConfigRule(rule)
        }
      })
    } catch (error) {
      console.error('加载配置规则失败:', error)
    }
  }

  private async loadChangeHistory(): Promise<void> {
    try {
      const response = await request.get('/audit/policy-changes', {
        params: { limit: 100 }
      })
      this.changeHistory = response.data
    } catch (error) {
      console.error('加载变更历史失败:', error)
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncWithRemote()
      } catch (error) {
        console.error('定期同步失败:', error)
      }
    }, 30000) // 每30秒同步一次
  }

  private setupEventListeners(): void {
    // 监听时间相关的触发器
    setInterval(() => {
      this.triggerAutomaticAdjustment({
        type: 'time',
        data: { timestamp: Date.now() }
      })
    }, 60000) // 每分钟检查一次时间触发器
  }

  private async validatePolicyConfig(policy: AuditPolicy): Promise<void> {
    // 验证策略配置的有效性
    if (policy.mode === 'sample' && (!policy.sampleRate || policy.sampleRate < 0 || policy.sampleRate > 100)) {
      throw new Error('抽审模式必须设置有效的抽样比例 (0-100)')
    }

    if (policy.assignRule === 'manual' && !policy.assigneeId) {
      throw new Error('手动分配模式必须指定审核员')
    }

    if (policy.assignRule === 'role' && !policy.roleId) {
      throw new Error('角色分配模式必须指定角色')
    }
  }

  private validateConfigRule(rule: DynamicConfigRule): void {
    if (!rule.conditions || Object.keys(rule.conditions).length === 0) {
      throw new Error('配置规则必须设置触发条件')
    }

    if (!rule.actions || Object.keys(rule.actions).length === 0) {
      throw new Error('配置规则必须设置执行动作')
    }
  }

  private shouldTriggerRule(rule: DynamicConfigRule, trigger: any): boolean {
    const { conditions } = rule

    // 检查时间范围条件
    if (conditions.timeRange && trigger.type === 'time') {
      const now = new Date()
      const startTime = new Date(conditions.timeRange.start)
      const endTime = new Date(conditions.timeRange.end)
      
      if (now < startTime || now > endTime) {
        return false
      }
    }

    // 检查事件触发条件
    if (conditions.triggerEvents && trigger.type === 'event') {
      if (!conditions.triggerEvents.includes(trigger.data.eventType)) {
        return false
      }
    }

    // 检查阈值条件
    if (conditions.thresholds && trigger.type === 'threshold') {
      const { thresholds } = conditions
      const { data } = trigger

      if (thresholds.taskCount && data.taskCount < thresholds.taskCount) return false
      if (thresholds.errorRate && data.errorRate < thresholds.errorRate) return false
      if (thresholds.avgProcessTime && data.avgProcessTime < thresholds.avgProcessTime) return false
    }

    return true
  }

  private async executeConfigRule(rule: DynamicConfigRule, trigger: any): Promise<void> {
    const { actions } = rule

    // 执行策略修改
    if (actions.modifyPolicy) {
      await this.updatePolicy(
        actions.modifyPolicy.policyId,
        actions.modifyPolicy.changes,
        {
          operatorName: 'AutoConfig',
          reason: `自动配置规则: ${rule.name}`
        }
      )
    }

    // 执行策略启用
    if (actions.enablePolicy) {
      for (const policyId of actions.enablePolicy) {
        await this.updatePolicy(policyId, { isActive: true }, {
          operatorName: 'AutoConfig',
          reason: `自动启用: ${rule.name}`
        })
      }
    }

    // 执行策略禁用
    if (actions.disablePolicy) {
      for (const policyId of actions.disablePolicy) {
        await this.updatePolicy(policyId, { isActive: false }, {
          operatorName: 'AutoConfig',
          reason: `自动禁用: ${rule.name}`
        })
      }
    }

    // 执行抽样率调整
    if (actions.adjustSampleRate) {
      await this.updatePolicy(
        actions.adjustSampleRate.policyId,
        { sampleRate: actions.adjustSampleRate.rate },
        {
          operatorName: 'AutoConfig',
          reason: `自动调整抽样率: ${rule.name}`
        }
      )
    }

    // 执行优先级调整
    if (actions.changePriority) {
      await this.updatePolicy(
        actions.changePriority.policyId,
        { priority: actions.changePriority.priority },
        {
          operatorName: 'AutoConfig',
          reason: `自动调整优先级: ${rule.name}`
        }
      )
    }
  }

  private async applyPolicyChanges(policyId: number, policy: AuditPolicy): Promise<void> {
    try {
      await request.put(`/audit/policies/${policyId}`, policy)
    } catch (error) {
      console.error('应用策略变更失败:', error)
      throw error
    }
  }

  private async applyAllPendingChanges(): Promise<void> {
    // 应用所有待处理的策略变更
    const promises = Array.from(this.policies.entries()).map(([id, policy]) =>
      this.applyPolicyChanges(id, policy)
    )
    await Promise.all(promises)
  }

  private async recordPolicyChange(
    record: Omit<PolicyChangeRecord, 'id' | 'timestamp'>
  ): Promise<void> {
    const changeRecord: PolicyChangeRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...record
    }

    try {
      await request.post('/audit/policy-changes', changeRecord)
      this.changeHistory.unshift(changeRecord)
      
      // 保持历史记录在合理范围内
      if (this.changeHistory.length > 1000) {
        this.changeHistory = this.changeHistory.slice(0, 1000)
      }
    } catch (error) {
      console.error('记录策略变更失败:', error)
    }
  }

  private async syncWithRemote(): Promise<void> {
    try {
      // 同步策略配置
      const remotePolicies = await request.get('/audit/policies/sync')
      
      // 检查并应用远程变更
      for (const remotePolicy of remotePolicies.data) {
        const localPolicy = this.policies.get(remotePolicy.id)
        if (!localPolicy || localPolicy.updateTime !== remotePolicy.updateTime) {
          this.policies.set(remotePolicy.id, remotePolicy)
          this.emit(PolicyConfigEvent.CONFIG_SYNCED, {
            type: 'remote_sync',
            policyId: remotePolicy.id
          })
        }
      }
    } catch (error) {
      console.error('远程同步失败:', error)
    }
  }

  private activateConfigRule(rule: DynamicConfigRule): void {
    // 激活配置规则的监听逻辑
    console.log(`激活配置规则: ${rule.name}`)
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
    this.removeAllListeners()
    this.isEnabled = false
  }
}

// 导出单例实例
export const auditPolicyDynamicManager = new AuditPolicyDynamicManager()