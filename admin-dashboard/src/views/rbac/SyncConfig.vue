<template>
  <div class="sync-config-page">
    <UnifiedPageHeader 
      title="数据同步配置" 
      description="配置与企业微信、LDAP、钉钉等外部系统的用户数据同步"
    >
      <template #actions>
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleCreate"
          v-if="hasPermission('rbac:sync:config')"
        >
          新建配置
        </el-button>
        <el-button 
          :icon="Refresh" 
          @click="refreshData"
          :loading="loading"
        >
          刷新
        </el-button>
      </template>
    </UnifiedPageHeader>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>同步配置列表</span>
        </div>
      </template>

      <!-- 同步配置表格 -->
      <el-table
        :data="syncConfigList"
        v-loading="loading"
        stripe
        border
      >
        <el-table-column prop="name" label="配置名称" min-width="150" />
        <el-table-column prop="type" label="同步类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getSyncTypeColor(row.type)" size="small">
              <el-icon class="sync-icon">
                <OfficeBuilding v-if="row.type === 'wework'" />
                <Connection v-else-if="row.type === 'ldap'" />
                <DataBoard v-else-if="row.type === 'ad'" />
                <Bell v-else-if="row.type === 'dingtalk'" />
                <Setting v-else />
              </el-icon>
              {{ getSyncTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastSyncTime" label="最后同步时间" width="160">
          <template #default="{ row }">
            {{ row.lastSyncTime || '未同步' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
              v-if="hasPermission('rbac:sync:config')"
            >
              编辑
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleTestConnection(row)"
              v-if="hasPermission('rbac:sync:config')"
            >
              测试连接
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click="handleExecuteSync(row)"
              :disabled="row.status === 0"
              v-if="hasPermission('rbac:sync:config')"
            >
              立即同步
            </el-button>
            <el-button
              link
              type="info"
              size="small"
              @click="handleViewHistory(row)"
            >
              同步历史
            </el-button>
            <el-button
              link
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
              v-if="hasPermission('rbac:sync:config')"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-if="hasPermission('rbac:sync:config')"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建/编辑配置对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="配置名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入配置名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="同步类型" prop="type">
          <el-select 
            v-model="form.type" 
            placeholder="选择同步类型"
            @change="handleTypeChange"
            :disabled="!!form.id"
          >
            <el-option 
              v-for="type in supportedSyncTypes"
              :key="type.type"
              :label="type.name"
              :value="type.type"
            >
              <div class="sync-type-option">
                <span>{{ type.name }}</span>
                <span class="description">{{ type.description }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-divider content-position="left">连接配置</el-divider>

        <!-- 企业微信配置 -->
        <div v-if="form.type === 'wework'">
          <el-form-item label="Corp ID" prop="config.corpId">
            <el-input 
              v-model="form.config.corpId" 
              placeholder="企业微信 Corp ID"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="Corp Secret" prop="config.corpSecret">
            <el-input 
              v-model="form.config.corpSecret" 
              type="password"
              placeholder="企业微信 Corp Secret"
              show-password
              maxlength="200"
            />
          </el-form-item>
          <el-form-item label="Agent ID" prop="config.agentId">
            <el-input 
              v-model="form.config.agentId" 
              placeholder="应用 Agent ID"
              maxlength="50"
            />
          </el-form-item>
          <el-form-item label="同步部门ID">
            <el-input 
              v-model="form.config.departmentId" 
              placeholder="要同步的部门ID，留空同步全部"
              maxlength="50"
            />
          </el-form-item>
        </div>

        <!-- LDAP配置 -->
        <div v-if="form.type === 'ldap'">
          <el-form-item label="LDAP服务器" prop="config.server">
            <el-input 
              v-model="form.config.server" 
              placeholder="ldap://192.168.1.100:389"
              maxlength="200"
            />
          </el-form-item>
          <el-form-item label="Base DN" prop="config.baseDN">
            <el-input 
              v-model="form.config.baseDN" 
              placeholder="dc=company,dc=com"
              maxlength="200"
            />
          </el-form-item>
          <el-form-item label="管理员DN" prop="config.adminDN">
            <el-input 
              v-model="form.config.adminDN" 
              placeholder="cn=admin,dc=company,dc=com"
              maxlength="200"
            />
          </el-form-item>
          <el-form-item label="管理员密码" prop="config.adminPassword">
            <el-input 
              v-model="form.config.adminPassword" 
              type="password"
              placeholder="LDAP管理员密码"
              show-password
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="用户过滤器">
            <el-input 
              v-model="form.config.userFilter" 
              placeholder="(objectClass=person)"
              maxlength="200"
            />
          </el-form-item>
        </div>

        <!-- AD配置 -->
        <div v-if="form.type === 'ad'">
          <el-form-item label="AD服务器" prop="config.server">
            <el-input 
              v-model="form.config.server" 
              placeholder="192.168.1.100:389"
              maxlength="200"
            />
          </el-form-item>
          <el-form-item label="域名" prop="config.domain">
            <el-input 
              v-model="form.config.domain" 
              placeholder="company.com"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="管理员用户" prop="config.adminUser">
            <el-input 
              v-model="form.config.adminUser" 
              placeholder="administrator"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="管理员密码" prop="config.adminPassword">
            <el-input 
              v-model="form.config.adminPassword" 
              type="password"
              placeholder="AD管理员密码"
              show-password
              maxlength="100"
            />
          </el-form-item>
        </div>

        <!-- 钉钉配置 -->
        <div v-if="form.type === 'dingtalk'">
          <el-form-item label="App Key" prop="config.appKey">
            <el-input 
              v-model="form.config.appKey" 
              placeholder="钉钉应用 App Key"
              maxlength="100"
            />
          </el-form-item>
          <el-form-item label="App Secret" prop="config.appSecret">
            <el-input 
              v-model="form.config.appSecret" 
              type="password"
              placeholder="钉钉应用 App Secret"
              show-password
              maxlength="200"
            />
          </el-form-item>
          <el-form-item label="同步部门ID">
            <el-input 
              v-model="form.config.departmentId" 
              placeholder="要同步的部门ID，留空同步全部"
              maxlength="50"
            />
          </el-form-item>
        </div>

        <el-divider content-position="left">同步设置</el-divider>

        <el-form-item label="同步周期">
          <el-input 
            v-model="form.config.syncSchedule" 
            placeholder="Cron表达式，如: 0 2 * * * (每天2点)"
            maxlength="50"
          />
          <div class="form-tip">
            留空表示仅手动同步。常用表达式：
            <code>0 2 * * *</code> 每天2点，
            <code>0 */6 * * *</code> 每6小时
          </div>
        </el-form-item>

        <el-form-item label="同步选项">
          <el-checkbox-group v-model="form.config.syncOptions">
            <el-checkbox label="syncUsers">同步用户信息</el-checkbox>
            <el-checkbox label="syncDepartments">同步部门结构</el-checkbox>
            <el-checkbox label="disableInactiveUsers">禁用已离职用户</el-checkbox>
            <el-checkbox label="updateExistingUsers">更新现有用户信息</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="submitLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 同步历史对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="同步历史"
      width="800px"
    >
      <el-table
        :data="syncHistory"
        v-loading="historyLoading"
        border
      >
        <el-table-column prop="syncTime" label="同步时间" width="160" />
        <el-table-column prop="success" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.success ? 'success' : 'danger'" size="small">
              {{ row.success ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalUsers" label="总用户数" width="100" />
        <el-table-column prop="addedUsers" label="新增" width="80" />
        <el-table-column prop="updatedUsers" label="更新" width="80" />
        <el-table-column prop="disabledUsers" label="禁用" width="80" />
        <el-table-column label="详情" min-width="200">
          <template #default="{ row }">
            <div v-if="row.errors && row.errors.length > 0" class="error-details">
              <el-alert
                v-for="(error, index) in row.errors"
                :key="index"
                :title="error"
                type="error"
                :closable="false"
                size="small"
              />
            </div>
            <span v-else class="success-text">同步成功</span>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="historyDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Refresh, OfficeBuilding, Connection, DataBoard, Bell, Setting } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRbacStore } from '@/stores/rbac'
import { useAuthStore } from '@/stores/auth'
import type { SyncConfig, SyncType, SyncResult } from '@/types'

// Store
const rbacStore = useRbacStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const historyDialogVisible = ref(false)
const submitLoading = ref(false)
const historyLoading = ref(false)
const formRef = ref<FormInstance>()
const syncHistory = ref<SyncResult[]>([])
const currentConfig = ref<SyncConfig>()

// 支持的同步类型
const supportedSyncTypes = ref([
  { type: 'wework', name: '企业微信', description: '同步企业微信通讯录' },
  { type: 'ldap', name: 'LDAP', description: '同步LDAP目录服务' },
  { type: 'ad', name: 'Active Directory', description: '同步Windows AD域' },
  { type: 'dingtalk', name: '钉钉', description: '同步钉钉通讯录' }
])

// 表单数据
const form = reactive<Partial<SyncConfig>>({
  name: '',
  type: 'wework' as SyncType,
  status: 1,
  config: {
    syncOptions: ['syncUsers', 'syncDepartments']
  }
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 50, message: '配置名称长度在2-50个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择同步类型', trigger: 'change' }
  ]
}

// 计算属性
const syncConfigList = computed(() => rbacStore.syncConfigs)
const dialogTitle = computed(() => form.id ? '编辑同步配置' : '新建同步配置')

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.checkPermission(permission)
}

// 同步类型映射
const getSyncTypeText = (type: SyncType) => {
  const typeMap = {
    wework: '企业微信',
    ldap: 'LDAP',
    ad: 'Active Directory',
    dingtalk: '钉钉'
  }
  return typeMap[type] || type
}

const getSyncTypeColor = (type: SyncType) => {
  const colorMap = {
    wework: 'success',
    ldap: 'primary',
    ad: 'warning',
    dingtalk: 'info'
  }
  return colorMap[type] || 'default'
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await rbacStore.fetchSyncConfigs()
  } catch (error) {
    ElMessage.error('加载同步配置失败')
  } finally {
    loading.value = false
  }
}

// 创建配置
const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑配置
const handleEdit = (config: SyncConfig) => {
  resetForm()
  Object.assign(form, config)
  dialogVisible.value = true
}

// 删除配置
const handleDelete = async (config: SyncConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定删除同步配置"${config.name}"吗？`,
      '删除确认',
      { type: 'warning' }
    )
    
    await rbacStore.deleteSyncConfig(config.id)
    ElMessage.success('删除成功')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 切换状态
const handleToggleStatus = async (config: SyncConfig) => {
  try {
    const newStatus = config.status === 1 ? 0 : 1
    const action = newStatus === 1 ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定${action}同步配置"${config.name}"吗？`,
      `${action}确认`,
      { type: 'warning' }
    )
    
    await rbacStore.toggleSyncConfig(config.id, newStatus)
    ElMessage.success(`${action}成功`)
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 测试连接
const handleTestConnection = async (config: SyncConfig) => {
  try {
    const loading = ElMessage({
      message: '正在测试连接...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    const result = await rbacStore.testSyncConnection(config)
    loading.close()
    
    if (result.success) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.error(`连接测试失败：${result.message}`)
    }
  } catch (error) {
    ElMessage.error('连接测试失败')
  }
}

// 执行同步
const handleExecuteSync = async (config: SyncConfig) => {
  try {
    await ElMessageBox.confirm(
      `确定立即执行同步"${config.name}"吗？此操作可能需要较长时间。`,
      '同步确认',
      { type: 'warning' }
    )
    
    const loading = ElMessage({
      message: '正在执行同步，请稍候...',
      type: 'info',
      duration: 0,
      showClose: false
    })
    
    const result = await rbacStore.executeSync(config.id)
    loading.close()
    
    if (result.success) {
      ElMessage.success(
        `同步完成！新增 ${result.addedUsers} 人，更新 ${result.updatedUsers} 人，禁用 ${result.disabledUsers} 人`
      )
    } else {
      ElMessage.error('同步失败，请查看同步历史了解详情')
    }
    
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('同步执行失败')
    }
  }
}

// 查看历史
const handleViewHistory = async (config: SyncConfig) => {
  currentConfig.value = config
  historyLoading.value = true
  historyDialogVisible.value = true
  
  try {
    const result = await rbacStore.getSyncHistory(config.id)
    syncHistory.value = result.list
  } catch (error) {
    ElMessage.error('加载同步历史失败')
    syncHistory.value = []
  } finally {
    historyLoading.value = false
  }
}

// 类型变更
const handleTypeChange = () => {
  // 重置配置对象
  form.config = {
    syncOptions: ['syncUsers', 'syncDepartments']
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (form.id) {
      await rbacStore.updateSyncConfig(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await rbacStore.createSyncConfig(form)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    await refreshData()
  } catch (error) {
    if (typeof error === 'string') {
      ElMessage.error(error)
    }
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  Object.assign(form, {
    id: undefined,
    name: '',
    type: 'wework' as SyncType,
    status: 1,
    config: {
      syncOptions: ['syncUsers', 'syncDepartments']
    }
  })
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.sync-config-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.main-card {
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.sync-icon {
  margin-right: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.sync-type-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.description {
  font-size: 12px;
  color: #909399;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.form-tip code {
  background: #f0f2f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.error-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.success-text {
  color: #67c23a;
  font-weight: 500;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-form-item__content) {
  flex-wrap: wrap;
}
</style>