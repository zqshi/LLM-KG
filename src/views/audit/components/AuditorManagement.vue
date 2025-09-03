<template>
  <div class="auditor-management">
    <div class="settings-header">
      <h3>审核员管理</h3>
      <p>管理审核员信息、权限分配和工作量统计</p>
    </div>

    <!-- 操作工具栏 -->
    <el-card class="toolbar-card">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="showAddAuditor">
            <el-icon>
              <Plus />
            </el-icon>
            新增审核员
          </el-button>
          <el-button @click="showBatchAssign">
            <el-icon>
              <UserFilled />
            </el-icon>
            批量分配
          </el-button>
        </div>
        <div class="toolbar-right">
          <el-select v-model="filterRole" placeholder="角色筛选" clearable @change="loadAuditors">
            <el-option label="全部" value="" />
            <el-option label="内容审核员" value="content_auditor" />
            <el-option label="高级审核员" value="senior_auditor" />
            <el-option label="审核主管" value="audit_manager" />
          </el-select>
          <el-input v-model="searchKeyword" placeholder="搜索审核员" style="width: 200px; margin-left: 8px" clearable
            @input="handleSearch">
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </el-card>

    <!-- 审核员列表 -->
    <el-card class="auditors-list">
      <template #header>
        <div class="card-header">
          <span>审核员列表 ({{ pagination.total }})</span>
          <div class="header-actions">
            <el-button @click="exportAuditors">
              <el-icon>
                <Download />
              </el-icon>
              导出列表
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="auditorsList" v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTag(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="电话" width="120" />
        <el-table-column label="工作量统计" width="200">
          <template #default="{ row }">
            <div class="workload-stats">
              <div class="stat-item">
                <span class="stat-label">待处理:</span>
                <span class="stat-value pending">{{ row.pendingCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">今日处理:</span>
                <span class="stat-value processed">{{ row.todayProcessed || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">通过率:</span>
                <span class="stat-value rate">{{ row.approvalRate || 0 }}%</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-switch v-model="row.status" @change="handleToggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="editAuditor(row)">
              编辑
            </el-button>
            <el-button type="info" size="small" @click="viewStats(row)">
              统计
            </el-button>
            <el-button type="danger" size="small" @click="deleteAuditor(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.current" v-model:page-size="pagination.size"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadAuditors" @current-change="loadAuditors" />
      </div>
    </el-card>

    <!-- 新增/编辑审核员弹窗 -->
    <el-dialog v-model="auditorDialogVisible" :title="isEdit ? '编辑审核员' : '新增审核员'" width="600px">
      <el-form :model="auditorForm" :rules="auditorRules" ref="auditorFormRef" label-width="100px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="auditorForm.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="auditorForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="auditorForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="auditorForm.role" placeholder="请选择角色">
            <el-option label="内容审核员" value="content_auditor" />
            <el-option label="高级审核员" value="senior_auditor" />
            <el-option label="审核主管" value="audit_manager" />
          </el-select>
        </el-form-item>

        <el-form-item label="部门" prop="department">
          <el-input v-model="auditorForm.department" placeholder="请输入部门" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="auditorForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="电话" prop="phone">
          <el-input v-model="auditorForm.phone" placeholder="请输入电话" />
        </el-form-item>

        <el-form-item label="审核权限">
          <el-checkbox-group v-model="auditorForm.permissions">
            <el-checkbox label="forum_post">论坛帖子</el-checkbox>
            <el-checkbox label="flea_goods">跳蚤市场</el-checkbox>
            <el-checkbox label="news">资讯文章</el-checkbox>
            <el-checkbox label="banner">Banner广告</el-checkbox>
            <el-checkbox label="quotation">名言警句</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="auditorForm.status" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="auditorForm.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="auditorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveAuditor">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量分配弹窗 -->
    <el-dialog v-model="assignDialogVisible" title="批量分配任务" width="500px">
      <el-form :model="assignForm" label-width="100px">
        <el-form-item label="选择审核员">
          <el-select v-model="assignForm.auditorId" placeholder="请选择审核员">
            <el-option v-for="auditor in availableAuditors" :key="auditor.id" :label="auditor.name"
              :value="auditor.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="任务数量">
          <el-input-number v-model="assignForm.taskCount" :min="1" :max="100" :precision="0" />
        </el-form-item>

        <el-form-item label="业务类型">
          <el-checkbox-group v-model="assignForm.bizTypes">
            <el-checkbox label="forum_post">论坛帖子</el-checkbox>
            <el-checkbox label="flea_goods">跳蚤市场</el-checkbox>
            <el-checkbox label="news">资讯文章</el-checkbox>
            <el-checkbox label="banner">Banner广告</el-checkbox>
            <el-checkbox label="quotation">名言警句</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="优先级">
          <el-radio-group v-model="assignForm.priority">
            <el-radio label="high">高优先级</el-radio>
            <el-radio label="normal">普通优先级</el-radio>
            <el-radio label="low">低优先级</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="assignDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <!-- 统计详情弹窗 -->
    <el-dialog v-model="statsDialogVisible" title="审核员统计详情" width="800px">
      <div v-if="selectedAuditor" class="auditor-stats">
        <div class="stats-header">
          <h4>{{ selectedAuditor.name }} - 审核统计</h4>
          <el-date-picker v-model="statsDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" @change="loadAuditorStats" />
        </div>

        <el-row :gutter="16" class="stats-cards">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon pending">
                  <el-icon>
                    <Clock />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ auditorStats.totalProcessed }}</div>
                  <div class="stat-label">总处理量</div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon approved">
                  <el-icon>
                    <Check />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ auditorStats.approvalRate }}%</div>
                  <div class="stat-label">通过率</div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon efficiency">
                  <el-icon>
                    <TrendCharts />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ auditorStats.avgProcessTime }}分钟</div>
                  <div class="stat-label">平均处理时长</div>
                </div>
              </div>
            </el-card>
          </el-col>

          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon quality">
                  <el-icon>
                    <Star />
                  </el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ auditorStats.qualityScore }}</div>
                  <div class="stat-label">质量评分</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="chart-card">
          <template #header>
            <span>处理趋势</span>
          </template>
          <div class="chart-placeholder">
            <!-- TODO: 集成图表组件 -->
            <p>图表区域 - 显示审核员处理趋势</p>
          </div>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, UserFilled, Search, Download, Clock, Check, TrendCharts, Star } from '@element-plus/icons-vue'

// 响应式数据
const loading = ref(false)
const auditorsList = ref([])
const selectedAuditors = ref([])
const searchKeyword = ref('')
const filterRole = ref('')
const auditorDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const statsDialogVisible = ref(false)
const isEdit = ref(false)
const auditorFormRef = ref()
const selectedAuditor = ref(null)
const statsDateRange = ref([])

// 表单数据
const auditorForm = reactive({
  id: null,
  name: '',
  username: '',
  password: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  permissions: [],
  status: true,
  remark: ''
})

const assignForm = reactive({
  auditorId: null,
  taskCount: 10,
  bizTypes: [],
  priority: 'normal'
})

const auditorStats = reactive({
  totalProcessed: 0,
  approvalRate: 0,
  avgProcessTime: 0,
  qualityScore: 0
})

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 计算属性
const availableAuditors = computed(() => {
  return auditorsList.value.filter(auditor => auditor.status)
})

// 表单验证规则
const auditorRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 方法
const loadAuditors = async () => {
  loading.value = true
  try {
    // TODO: 调用API获取审核员列表
    auditorsList.value = [
      {
        id: 1,
        name: '张三',
        username: 'zhangsan',
        role: 'content_auditor',
        department: '内容部',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        pendingCount: 5,
        todayProcessed: 12,
        approvalRate: 85,
        status: true,
        createTime: '2024-01-15 10:00:00'
      },
      {
        id: 2,
        name: '李四',
        username: 'lisi',
        role: 'senior_auditor',
        department: '内容部',
        email: 'lisi@example.com',
        phone: '13800138002',
        pendingCount: 3,
        todayProcessed: 18,
        approvalRate: 92,
        status: true,
        createTime: '2024-01-15 09:00:00'
      },
      {
        id: 3,
        name: '王五',
        username: 'wangwu',
        role: 'audit_manager',
        department: '运营部',
        email: 'wangwu@example.com',
        phone: '13800138003',
        pendingCount: 0,
        todayProcessed: 8,
        approvalRate: 88,
        status: false,
        createTime: '2024-01-15 08:00:00'
      }
    ]
    pagination.total = 25
  } catch (error) {
    ElMessage.error('加载审核员列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadAuditors()
}

const handleSelectionChange = (selection: any[]) => {
  selectedAuditors.value = selection
}

const showAddAuditor = () => {
  isEdit.value = false
  resetAuditorForm()
  auditorDialogVisible.value = true
}

const editAuditor = (auditor: any) => {
  isEdit.value = true
  Object.assign(auditorForm, auditor)
  auditorDialogVisible.value = true
}

const deleteAuditor = async (auditor: any) => {
  try {
    await ElMessageBox.confirm(
      `确认删除审核员"${auditor.name}"？`,
      '确认删除',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // TODO: 调用删除API
    ElMessage.success('删除成功')
    await loadAuditors()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleToggleStatus = async (auditor: any) => {
  try {
    // TODO: 调用更新状态API
    ElMessage.success(`${auditor.status ? '启用' : '禁用'}成功`)
  } catch (error) {
    auditor.status = !auditor.status // 恢复状态
    ElMessage.error('操作失败')
  }
}

const saveAuditor = async () => {
  try {
    await auditorFormRef.value.validate()

    // TODO: 调用保存API
    ElMessage.success(`${isEdit.value ? '更新' : '创建'}成功`)
    auditorDialogVisible.value = false
    await loadAuditors()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

const resetAuditorForm = () => {
  Object.assign(auditorForm, {
    id: null,
    name: '',
    username: '',
    password: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    permissions: [],
    status: true,
    remark: ''
  })
}

const showBatchAssign = () => {
  if (selectedAuditors.value.length === 0) {
    ElMessage.warning('请先选择要分配的审核员')
    return
  }
  assignForm.auditorId = null
  assignForm.taskCount = 10
  assignForm.bizTypes = []
  assignForm.priority = 'normal'
  assignDialogVisible.value = true
}

const confirmAssign = async () => {
  if (!assignForm.auditorId) {
    ElMessage.warning('请选择审核员')
    return
  }

  if (assignForm.bizTypes.length === 0) {
    ElMessage.warning('请选择业务类型')
    return
  }

  try {
    // TODO: 调用批量分配API
    ElMessage.success('批量分配成功')
    assignDialogVisible.value = false
  } catch (error) {
    ElMessage.error('分配失败')
  }
}

const viewStats = (auditor: any) => {
  selectedAuditor.value = auditor
  loadAuditorStats()
  statsDialogVisible.value = true
}

const loadAuditorStats = async () => {
  try {
    // TODO: 调用API获取审核员统计数据
    auditorStats.totalProcessed = 156
    auditorStats.approvalRate = 87
    auditorStats.avgProcessTime = 12
    auditorStats.qualityScore = 4.5
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const exportAuditors = async () => {
  try {
    // TODO: 调用导出API
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 工具方法
const getRoleLabel = (role: string) => {
  const labels = {
    content_auditor: '内容审核员',
    senior_auditor: '高级审核员',
    audit_manager: '审核主管'
  }
  return labels[role] || role
}

const getRoleTag = (role: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' | undefined => {
  const tags: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    content_auditor: 'primary',
    senior_auditor: 'warning',
    audit_manager: 'danger'
  }
  return tags[role] || undefined
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadAuditors()
})
</script>

<style scoped>
.auditor-management {
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

.toolbar-card {
  margin-bottom: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 8px;
}

.auditors-list {
  margin-bottom: 20px;
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

.workload-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.stat-label {
  color: #909399;
}

.stat-value {
  font-weight: 500;
}

.stat-value.pending {
  color: #e6a23c;
}

.stat-value.processed {
  color: #67c23a;
}

.stat-value.rate {
  color: #409eff;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.auditor-stats {
  padding: 20px 0;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
  font-size: 20px;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.efficiency {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.quality {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info .stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-info .stat-label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}

.chart-card {
  margin-top: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  border-radius: 8px;
  color: #909399;
}
</style>
