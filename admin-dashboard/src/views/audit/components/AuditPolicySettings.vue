<template>
  <div class="audit-policy-settings">
    <div class="settings-header">
      <h3>审核策略配置</h3>
      <p>为不同业务类型配置审核流程与规则</p>
    </div>

    <!-- 策略列表 -->
    <el-card class="policy-list">
      <template #header>
        <div class="card-header">
          <span>审核策略列表</span>
          <el-button type="primary" @click="showAddPolicy">
            <el-icon>
              <Plus />
            </el-icon>
            新增策略
          </el-button>
        </div>
      </template>

      <el-table :data="policyList" v-loading="loading">
        <el-table-column prop="name" label="策略名称" width="150" />
        <el-table-column prop="bizType" label="业务类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getBizTypeTag(row.bizType)">
              {{ getBizTypeLabel(row.bizType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mode" label="审核模式" width="100">
          <template #default="{ row }">
            <el-tag :type="getModeTag(row.mode)">
              {{ getModeLabel(row.mode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sampleRate" label="抽审比例" width="100">
          <template #default="{ row }">
            <span v-if="row.mode === 'sample'">{{ row.sampleRate }}%</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :type="getPriorityTag(row.priority)" size="small">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sensitiveWordCheck" label="敏感词检查" width="100">
          <template #default="{ row }">
            <el-tag :type="row.sensitiveWordCheck ? 'success' : 'info'" size="small">
              {{ row.sensitiveWordCheck ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="isActive" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.isActive" @change="handleToggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editPolicy(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="deletePolicy(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑策略弹窗 -->
    <el-dialog v-model="policyDialogVisible" :title="isEdit ? '编辑策略' : '新增策略'" width="600px">
      <el-form :model="policyForm" :rules="policyRules" ref="policyFormRef" label-width="100px">
        <el-form-item label="策略名称" prop="name">
          <el-input v-model="policyForm.name" placeholder="请输入策略名称" />
        </el-form-item>

        <el-form-item label="业务类型" prop="bizType">
          <el-select v-model="policyForm.bizType" placeholder="请选择业务类型">
            <el-option label="论坛帖子" value="forum_post" />
            <el-option label="跳蚤市场" value="flea_goods" />
            <el-option label="资讯文章" value="news" />
            <el-option label="Banner广告" value="banner" />
            <el-option label="名言警句" value="quotation" />
          </el-select>
        </el-form-item>

        <el-form-item label="审核模式" prop="mode">
          <el-radio-group v-model="policyForm.mode">
            <el-radio label="pre">先审后发</el-radio>
            <el-radio label="post">先发后审</el-radio>
            <el-radio label="sample">抽审</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="抽审比例" prop="sampleRate" v-if="policyForm.mode === 'sample'">
          <el-input-number v-model="policyForm.sampleRate" :min="1" :max="100" :precision="0" />
          <span class="unit">%</span>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="policyForm.priority" placeholder="请选择优先级">
            <el-option label="高优先级" value="high" />
            <el-option label="普通优先级" value="normal" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-form-item>

        <el-form-item label="分配规则" prop="assignRule">
          <el-radio-group v-model="policyForm.assignRule">
            <el-radio label="auto">自动分配</el-radio>
            <el-radio label="manual">手动分配</el-radio>
            <el-radio label="role">按角色分配</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="指定审核员" v-if="policyForm.assignRule === 'manual'">
          <el-select v-model="policyForm.assigneeId" placeholder="请选择审核员">
            <el-option v-for="auditor in auditors" :key="auditor.id" :label="auditor.name" :value="auditor.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="指定角色" v-if="policyForm.assignRule === 'role'">
          <el-select v-model="policyForm.roleId" placeholder="请选择角色">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="敏感词检查">
          <el-switch v-model="policyForm.sensitiveWordCheck" />
          <el-text class="form-hint">开启后将自动检查内容中的敏感词</el-text>
        </el-form-item>

        <el-form-item label="规则配置">
          <div class="rule-config-section">
            <div class="rule-config-header">
              <span>JSON格式的规则配置</span>
              <el-button type="text" size="small" @click="applyTemplate">
                使用预设模板
              </el-button>
            </div>
            <el-input v-model="policyForm.ruleConfig" type="textarea" rows="6" placeholder="请输入JSON格式的规则配置" />
            <el-text class="form-hint">配置审核规则，如必填字段、自动拒绝条件、升级条件等</el-text>
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="policyForm.isActive" />
          <el-text class="form-hint">禁用后该策略将不会生效</el-text>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="policyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePolicy">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuditStore } from '@/stores/audit'

// 响应式数据
const loading = ref(false)
const policyList = ref([])
const auditors = ref([])
const roles = ref([])
const policyDialogVisible = ref(false)
const isEdit = ref(false)
const policyFormRef = ref()

// 表单数据
const policyForm = reactive({
  id: null,
  name: '',
  bizType: '',
  mode: 'pre',
  sampleRate: 10,
  priority: 'normal',
  assignRule: 'auto',
  assigneeId: null,
  roleId: null,
  sensitiveWordCheck: true,
  ruleConfig: '',
  isActive: true
})

// 表单验证规则
const policyRules = {
  name: [
    { required: true, message: '请输入策略名称', trigger: 'blur' }
  ],
  bizType: [
    { required: true, message: '请选择业务类型', trigger: 'change' }
  ],
  mode: [
    { required: true, message: '请选择审核模式', trigger: 'change' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  assignRule: [
    { required: true, message: '请选择分配规则', trigger: 'change' }
  ]
}

// 使用审核store
const auditStore = useAuditStore()

// 预设策略模板
const policyTemplates = {
  forum_post: {
    mode: 'pre',
    priority: 'normal',
    sampleRate: null,
    assignRule: 'auto',
    sensitiveWordCheck: true,
    ruleConfig: JSON.stringify({
      contentMinLength: 10,
      requiredFields: ['title', 'content'],
      autoReject: {
        enabled: true,
        conditions: ['spam_detected', 'multiple_sensitive_words']
      },
      escalation: {
        enabled: true,
        conditions: ['high_risk_content', 'repeat_offender']
      }
    }, null, 2)
  },
  news: {
    mode: 'sample',
    priority: 'high',
    sampleRate: 30,
    assignRule: 'role',
    sensitiveWordCheck: true,
    ruleConfig: JSON.stringify({
      titleRequired: true,
      sourceRequired: true,
      duplicateCheck: true,
      factCheck: {
        enabled: true,
        threshold: 0.8
      }
    }, null, 2)
  },
  banner: {
    mode: 'pre',
    priority: 'high',
    sampleRate: null,
    assignRule: 'manual',
    sensitiveWordCheck: false,
    ruleConfig: JSON.stringify({
      imageRequired: true,
      dimensionCheck: true,
      brandCheck: true,
      legalCompliance: true
    }, null, 2)
  },
  flea_goods: {
    mode: 'post',
    priority: 'low',
    sampleRate: 10,
    assignRule: 'auto',
    sensitiveWordCheck: true,
    ruleConfig: JSON.stringify({
      priceRequired: true,
      imageRequired: true,
      categoryRequired: true,
      fraudDetection: {
        enabled: true,
        priceThreshold: 10000
      }
    }, null, 2)
  },
  quotation: {
    mode: 'pre',
    priority: 'high',
    sampleRate: null,
    assignRule: 'role',
    sensitiveWordCheck: true,
    ruleConfig: JSON.stringify({
      leaderRequired: true,
      occasionRequired: true,
      authenticityCheck: true,
      politicalSensitivity: {
        enabled: true,
        level: 'high'
      }
    }, null, 2)
  }
}

// 方法
const loadPolicyList = async () => {
  loading.value = true
  try {
    await auditStore.loadPolicies()
    policyList.value = auditStore.policyList
  } catch (error) {
    ElMessage.error('加载策略列表失败')
  } finally {
    loading.value = false
  }
}

const loadAuditors = async () => {
  try {
    await auditStore.loadAuditors()
    auditors.value = auditStore.auditorsList
  } catch (error) {
    console.error('加载审核员列表失败:', error)
  }
}

const loadRoles = async () => {
  try {
    // 从RBAC模块获取角色列表
    roles.value = [
      { id: 1, name: '内容审核员', code: 'content_auditor' },
      { id: 2, name: '高级审核员', code: 'senior_auditor' },
      { id: 3, name: '审核主管', code: 'audit_manager' }
    ]
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const showAddPolicy = () => {
  isEdit.value = false
  resetPolicyForm()
  policyDialogVisible.value = true
}

const editPolicy = (policy: any) => {
  isEdit.value = true
  Object.assign(policyForm, policy)
  policyDialogVisible.value = true
}

const deletePolicy = async (policy: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除策略"${policy.name}"？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await auditStore.deletePolicy(policy.id)
    await loadPolicyList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleToggleStatus = async (policy: any) => {
  try {
    await auditStore.togglePolicy(policy.id, policy.isActive)
  } catch (error) {
    policy.isActive = !policy.isActive // 恢复状态
    ElMessage.error('操作失败')
  }
}

const savePolicy = async () => {
  try {
    await policyFormRef.value.validate()

    // 验证JSON格式
    if (policyForm.ruleConfig) {
      try {
        JSON.parse(policyForm.ruleConfig)
      } catch {
        ElMessage.error('规则配置必须是有效的JSON格式')
        return
      }
    }

    if (isEdit.value) {
      await auditStore.updatePolicy(policyForm.id, policyForm)
    } else {
      await auditStore.createPolicy(policyForm)
    }
    
    policyDialogVisible.value = false
    await loadPolicyList()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const applyTemplate = () => {
  if (!policyForm.bizType) {
    ElMessage.warning('请先选择业务类型')
    return
  }
  
  const template = policyTemplates[policyForm.bizType]
  if (template) {
    Object.assign(policyForm, template)
    ElMessage.success('已应用预设模板')
  }
}

const resetPolicyForm = () => {
  Object.assign(policyForm, {
    id: null,
    name: '',
    bizType: '',
    mode: 'pre',
    sampleRate: 10,
    priority: 'normal',
    assignRule: 'auto',
    assigneeId: null,
    roleId: null,
    sensitiveWordCheck: true,
    ruleConfig: '',
    isActive: true
  })
}

// 工具方法
const getBizTypeLabel = (bizType: string) => {
  const labels = {
    forum_post: '论坛帖子',
    flea_goods: '跳蚤市场',
    news: '资讯文章',
    banner: 'Banner广告',
    quotation: '名言警句'
  }
  return labels[bizType] || bizType
}

const getBizTypeTag = (bizType: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    forum_post: 'primary',
    flea_goods: 'success',
    news: 'warning',
    banner: 'info',
    quotation: 'danger'
  }
  return tags[bizType] || undefined
}

const getModeLabel = (mode: string) => {
  const labels = {
    pre: '先审后发',
    post: '先发后审',
    sample: '抽审'
  }
  return labels[mode] || mode
}

const getModeTag = (mode: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    pre: 'danger',
    post: 'warning',
    sample: 'info'
  }
  return tags[mode] || undefined
}

const getPriorityLabel = (priority: string) => {
  const labels = {
    high: '高',
    normal: '普通',
    low: '低'
  }
  return labels[priority] || priority
}

const getPriorityTag = (priority: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    high: 'danger',
    normal: 'warning',
    low: 'info'
  }
  return tags[priority] || undefined
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadPolicyList()
  loadAuditors()
  loadRoles()
})
</script>

<style scoped>
.audit-policy-settings {
  padding: 20px;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.settings-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.policy-list {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

.form-hint {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

.rule-config-section {
  width: 100%;
}

.rule-config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rule-config-header span {
  font-size: 14px;
  color: #606266;
}
</style>
