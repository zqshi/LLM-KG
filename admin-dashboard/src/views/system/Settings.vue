<template>
  <div class="system-settings-page">
    <UnifiedPageHeader 
      title="系统配置" 
      description="管理系统配置参数和功能设置"
      :icon="Setting"
    >
      <template #extra>
        <div class="header-actions">
          <el-button type="primary" @click="handleSave" :loading="saving" :icon="Check">
            保存配置
          </el-button>
        </div>
      </template>
    </UnifiedPageHeader>

    <el-row :gutter="20">
      <!-- 左侧导航 -->
      <el-col :span="6">
        <el-card class="settings-nav">
          <div class="nav-header">
            <h3>配置分类</h3>
          </div>
          <el-menu
            :default-active="activeTab"
            class="settings-menu"
            @select="handleTabChange"
          >
            <el-menu-item index="audit">
              <el-icon><Document /></el-icon>
              <span>审计日志配置</span>
            </el-menu-item>
            <el-menu-item index="monitor">
              <el-icon><Monitor /></el-icon>
              <span>系统监控配置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知配置</span>
            </el-menu-item>
            <el-menu-item index="performance">
              <el-icon><DataAnalysis /></el-icon>
              <span>性能优化</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :span="18">
        <el-card class="settings-content">
          <div class="tab-content">
            <!-- 审计日志配置 -->
            <div v-show="activeTab === 'audit'" class="config-section">
              <h3 class="section-title">审计日志配置</h3>
              
              <el-form :model="auditConfig" label-width="150px" label-position="left">
                <el-form-item label="启用模块">
                  <el-checkbox-group v-model="auditConfig.enabledModules">
                    <el-checkbox label="RBAC">权限管理</el-checkbox>
                    <el-checkbox label="CONTENT">内容管理</el-checkbox>
                    <el-checkbox label="SYSTEM">系统管理</el-checkbox>
                    <el-checkbox label="AUDIT">审核中心</el-checkbox>
                    <el-checkbox label="NEWS">资讯聚合</el-checkbox>
                    <el-checkbox label="BANNER">Banner管理</el-checkbox>
                    <el-checkbox label="FLEA_MARKET">跳蚤市场</el-checkbox>
                    <el-checkbox label="QUOTATION">名言管理</el-checkbox>
                    <el-checkbox label="OPERATION">运营管理</el-checkbox>
                    <el-checkbox label="PORTAL">门户配置</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item label="日志保留天数">
                  <el-input-number 
                    v-model="auditConfig.retentionDays" 
                    :min="1" 
                    :max="365" 
                    controls-position="right"
                  />
                  <span class="unit">天</span>
                </el-form-item>
                
                <el-form-item label="实时告警">
                  <el-switch v-model="auditConfig.enableRealTimeAlert" />
                </el-form-item>
                
                <el-form-item label="告警规则">
                  <el-table :data="auditConfig.alertRules" style="width: 100%">
                    <el-table-column prop="name" label="规则名称" width="200" />
                    <el-table-column prop="condition" label="触发条件" />
                    <el-table-column label="状态" width="100">
                      <template #default="{ row }">
                        <el-switch v-model="row.enabled" />
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="150">
                      <template #default="{ row, $index }">
                        <el-button link type="primary" @click="editAlertRule(row, $index)">编辑</el-button>
                        <el-button link type="danger" @click="removeAlertRule($index)">删除</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="table-actions">
                    <el-button type="primary" @click="addAlertRule" :icon="Plus">新增规则</el-button>
                  </div>
                </el-form-item>
              </el-form>
            </div>

            <!-- 系统监控配置 -->
            <div v-show="activeTab === 'monitor'" class="config-section">
              <h3 class="section-title">系统监控配置</h3>
              
              <el-form :model="monitorConfig" label-width="150px" label-position="left">
                <el-form-item label="性能监控">
                  <el-switch v-model="monitorConfig.enablePerformanceMonitor" />
                </el-form-item>
                
                <el-form-item label="安全监控">
                  <el-switch v-model="monitorConfig.enableSecurityMonitor" />
                </el-form-item>
                
                <el-divider>告警阈值</el-divider>
                
                <el-form-item label="CPU使用率">
                  <el-slider 
                    v-model="monitorConfig.alertThresholds.cpuUsage" 
                    :max="100" 
                    :show-input="true"
                    :show-input-controls="false"
                  />
                  <span class="unit">%</span>
                </el-form-item>
                
                <el-form-item label="内存使用率">
                  <el-slider 
                    v-model="monitorConfig.alertThresholds.memoryUsage" 
                    :max="100" 
                    :show-input="true"
                    :show-input-controls="false"
                  />
                  <span class="unit">%</span>
                </el-form-item>
                
                <el-form-item label="磁盘使用率">
                  <el-slider 
                    v-model="monitorConfig.alertThresholds.diskUsage" 
                    :max="100" 
                    :show-input="true"
                    :show-input-controls="false"
                  />
                  <span class="unit">%</span>
                </el-form-item>
                
                <el-form-item label="错误率">
                  <el-slider 
                    v-model="monitorConfig.alertThresholds.errorRate" 
                    :max="100" 
                    :show-input="true"
                    :show-input-controls="false"
                  />
                  <span class="unit">%</span>
                </el-form-item>
              </el-form>
            </div>

            <!-- 通知配置 -->
            <div v-show="activeTab === 'notification'" class="config-section">
              <h3 class="section-title">通知配置</h3>
              
              <el-alert
                title="通知配置说明"
                type="info"
                description="配置系统通知的发送方式和接收人，包括邮件、短信、企业微信等渠道"
                show-icon
                closable
                class="config-info"
              />
              
              <el-form :model="notificationConfig" label-width="150px" label-position="left">
                <el-form-item label="邮件通知">
                  <el-switch v-model="notificationConfig.email" />
                </el-form-item>
                
                <el-form-item label="短信通知">
                  <el-switch v-model="notificationConfig.sms" />
                </el-form-item>
                
                <el-form-item label="企业微信">
                  <el-switch v-model="notificationConfig.wechat" />
                </el-form-item>
                
                <el-form-item label="钉钉通知">
                  <el-switch v-model="notificationConfig.dingtalk" />
                </el-form-item>
                
                <el-form-item label="通知接收人">
                  <el-select v-model="notificationConfig.recipients" multiple placeholder="请选择通知接收人" style="width: 100%">
                    <el-option label="系统管理员" value="admin" />
                    <el-option label="安全管理员" value="security" />
                    <el-option label="运维人员" value="ops" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>

            <!-- 性能优化 -->
            <div v-show="activeTab === 'performance'" class="config-section">
              <h3 class="section-title">性能优化</h3>
              
              <el-alert
                title="性能优化说明"
                type="warning"
                description="调整系统性能参数可能影响系统稳定性，请谨慎操作"
                show-icon
                closable
                class="config-info"
              />
              
              <el-form :model="performanceConfig" label-width="150px" label-position="left">
                <el-form-item label="缓存策略">
                  <el-radio-group v-model="performanceConfig.cacheStrategy">
                    <el-radio label="memory">内存缓存</el-radio>
                    <el-radio label="redis">Redis缓存</el-radio>
                    <el-radio label="hybrid">混合缓存</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="缓存过期时间">
                  <el-input-number v-model="performanceConfig.cacheExpiry" :min="1" :max="86400" controls-position="right" />
                  <span class="unit">秒</span>
                </el-form-item>
                
                <el-form-item label="并发连接数">
                  <el-slider v-model="performanceConfig.concurrentConnections" :min="10" :max="1000" :show-input="true" :show-input-controls="false" />
                </el-form-item>
                
                <el-form-item label="请求队列长度">
                  <el-slider v-model="performanceConfig.requestQueueLength" :min="10" :max="10000" :show-input="true" :show-input-controls="false" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 安全设置 -->
            <div v-show="activeTab === 'security'" class="config-section">
              <h3 class="section-title">安全设置</h3>
              
              <el-alert
                title="安全设置说明"
                type="error"
                description="安全设置关系到系统整体安全性，请确保配置正确"
                show-icon
                closable
                class="config-info"
              />
              
              <el-form :model="securityConfig" label-width="150px" label-position="left">
                <el-form-item label="密码策略">
                  <el-select v-model="securityConfig.passwordPolicy" placeholder="请选择密码策略">
                    <el-option label="简单（6位以上）" value="simple" />
                    <el-option label="中等（8位以上，包含数字和字母）" value="medium" />
                    <el-option label="复杂（10位以上，包含数字、字母和特殊字符）" value="complex" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="登录失败锁定">
                  <el-switch v-model="securityConfig.loginLockout" />
                </el-form-item>
                
                <el-form-item label="最大失败次数">
                  <el-input-number v-model="securityConfig.maxLoginAttempts" :min="1" :max="10" controls-position="right" />
                </el-form-item>
                
                <el-form-item label="锁定时长">
                  <el-input-number v-model="securityConfig.lockoutDuration" :min="1" :max="1440" controls-position="right" />
                  <span class="unit">分钟</span>
                </el-form-item>
                
                <el-form-item label="会话超时">
                  <el-input-number v-model="securityConfig.sessionTimeout" :min="1" :max="1440" controls-position="right" />
                  <span class="unit">分钟</span>
                </el-form-item>
                
                <el-form-item label="双因素认证">
                  <el-switch v-model="securityConfig.twoFactorAuth" />
                </el-form-item>
              </el-form>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 告警规则对话框 -->
    <el-dialog v-model="alertRuleDialog.visible" :title="alertRuleDialog.title" width="600px">
      <el-form :model="alertRuleDialog.form" label-width="100px">
        <el-form-item label="规则名称" required>
          <el-input v-model="alertRuleDialog.form.name" />
        </el-form-item>
        <el-form-item label="触发条件" required>
          <el-input v-model="alertRuleDialog.form.condition" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="alertRuleDialog.form.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="alertRuleDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="saveAlertRule">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting, Check, Document, Monitor, Bell, 
  DataAnalysis, Lock, Plus
} from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { systemConfigApi } from '@/api/system'
import type { 
  AuditModule,
  ApiResponse
} from '@/types'

// 响应式数据
const activeTab = ref('audit')
const saving = ref(false)

// 审计配置
const auditConfig = reactive({
  enabledModules: ['RBAC', 'CONTENT', 'SYSTEM'] as AuditModule[],
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
    }
  ]
})

// 监控配置
const monitorConfig = reactive({
  enablePerformanceMonitor: true,
  enableSecurityMonitor: true,
  alertThresholds: {
    cpuUsage: 80,
    memoryUsage: 85,
    diskUsage: 90,
    errorRate: 5
  }
})

// 通知配置
const notificationConfig = reactive({
  email: true,
  sms: false,
  wechat: true,
  dingtalk: false,
  recipients: ['admin', 'security']
})

// 性能配置
const performanceConfig = reactive({
  cacheStrategy: 'memory',
  cacheExpiry: 3600,
  concurrentConnections: 100,
  requestQueueLength: 1000
})

// 安全配置
const securityConfig = reactive({
  passwordPolicy: 'medium',
  loginLockout: true,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  sessionTimeout: 30,
  twoFactorAuth: false
})

// 告警规则对话框
const alertRuleDialog = reactive({
  visible: false,
  title: '',
  isEdit: false,
  editIndex: -1,
  form: {
    id: '',
    name: '',
    condition: '',
    enabled: true
  }
})

// 标签切换
const handleTabChange = (tab: string) => {
  console.log('Tab changed to:', tab) // 添加日志以便调试
  activeTab.value = tab
}

// 保存配置
const handleSave = async () => {
  saving.value = true
  try {
    // 这里应该调用实际的API保存配置
    // await systemConfigApi.updateAuditConfig(auditConfig)
    // await systemConfigApi.updateSystemMonitorConfig(monitorConfig)
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('配置保存成功')
  } catch (error) {
    ElMessage.error('配置保存失败')
  } finally {
    saving.value = false
  }
}

// 新增告警规则
const addAlertRule = () => {
  alertRuleDialog.title = '新增告警规则'
  alertRuleDialog.isEdit = false
  alertRuleDialog.editIndex = -1
  alertRuleDialog.form = {
    id: 'rule_' + Date.now(),
    name: '',
    condition: '',
    enabled: true
  }
  alertRuleDialog.visible = true
}

// 编辑告警规则
const editAlertRule = (rule: any, index: number) => {
  alertRuleDialog.title = '编辑告警规则'
  alertRuleDialog.isEdit = true
  alertRuleDialog.editIndex = index
  alertRuleDialog.form = { ...rule }
  alertRuleDialog.visible = true
}

// 保存告警规则
const saveAlertRule = () => {
  if (!alertRuleDialog.form.name || !alertRuleDialog.form.condition) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (alertRuleDialog.isEdit) {
    // 编辑模式
    auditConfig.alertRules[alertRuleDialog.editIndex] = { ...alertRuleDialog.form }
  } else {
    // 新增模式
    auditConfig.alertRules.push({ ...alertRuleDialog.form })
  }
  
  alertRuleDialog.visible = false
  ElMessage.success('操作成功')
}

// 删除告警规则
const removeAlertRule = (index: number) => {
  auditConfig.alertRules.splice(index, 1)
  ElMessage.success('删除成功')
}

// 加载配置数据
const loadConfigData = async () => {
  try {
    // 加载审计配置
    // const auditResult = await systemConfigApi.getAuditConfig()
    // Object.assign(auditConfig, auditResult.data)
    
    // 加载监控配置
    // const monitorResult = await systemConfigApi.getSystemMonitorConfig()
    // Object.assign(monitorConfig, monitorResult.data)
  } catch (error) {
    console.error('加载配置失败:', error)
    ElMessage.error('加载配置失败')
  }
}

// 生命周期
onMounted(() => {
  loadConfigData()
})
</script>

<style scoped>
.system-settings-page {
  padding: 20px;
}

.settings-nav {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  background: var(--color-bg-card);
}

.nav-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.nav-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.settings-menu {
  border: none;
}

.settings-content {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  background: var(--color-bg-card);
}

.section-title {
  margin: 0 0 var(--spacing-xl) 0;
  font-size: var(--text-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border-light);
}

.config-section {
  padding: var(--spacing-xl);
}

.config-info {
  margin-bottom: var(--spacing-xl);
}

.unit {
  margin-left: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.table-actions {
  margin-top: var(--spacing-md);
  text-align: right;
}

:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

:deep(.el-checkbox-group) {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 992px) {
  .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  
  :deep(.el-checkbox-group) {
    grid-template-columns: 1fr;
  }
}
</style>