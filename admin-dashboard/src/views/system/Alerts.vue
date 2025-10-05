<template>
  <div class="system-alerts-page">
    <UnifiedPageHeader 
      title="系统告警" 
      description="监控系统运行状态，及时发现和处理异常情况"
      :icon="Warning"
    >
      <template #extra>
        <div class="header-actions">
          <el-button @click="refreshAlerts" :loading="loading" :icon="Refresh">
            刷新
          </el-button>
        </div>
      </template>
    </UnifiedPageHeader>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <StatsCard
          :value="alertStats.total"
          label="告警总数"
          :icon="Warning"
          type="danger"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          :value="alertStats.unresolved"
          label="未处理告警"
          :icon="WarningFilled"
          type="warning"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          :value="alertStats.critical"
          label="严重告警"
          :icon="CircleClose"
          type="danger"
        />
      </el-col>
      <el-col :span="6">
        <StatsCard
          :value="alertStats.today"
          label="今日新增"
          :icon="Bell"
          type="info"
        />
      </el-col>
    </el-row>

    <el-card class="alerts-card">
      <template #header>
        <div class="card-header">
          <span>告警列表</span>
          <div class="header-actions">
            <el-radio-group v-model="filterType" @change="handleFilterChange">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="unresolved">未处理</el-radio-button>
              <el-radio-button label="resolved">已处理</el-radio-button>
              <el-radio-button label="critical">严重</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="告警类型">
            <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
              <el-option label="安全告警" value="security" />
              <el-option label="性能告警" value="performance" />
              <el-option label="错误告警" value="error" />
            </el-select>
          </el-form-item>
          <el-form-item label="告警级别">
            <el-select v-model="searchForm.level" placeholder="请选择级别" clearable>
              <el-option label="低" value="low" />
              <el-option label="中" value="medium" />
              <el-option label="高" value="high" />
              <el-option label="严重" value="critical" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 告警表格 -->
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        stripe 
        style="width: 100%"
        :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <el-table-column prop="type" label="告警类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getAlertTypeTag(row.type) as any" size="small">
              {{ getAlertTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="告警级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getAlertLevelTag(row.level) as any" size="small">
              {{ getAlertLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="告警标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="message" label="告警内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="source" label="来源" width="120" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="告警时间" width="160" sortable />
        <el-table-column prop="resolved" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.resolved ? 'success' : 'danger'" size="small">
              {{ row.resolved ? '已处理' : '未处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button 
              v-if="!row.resolved" 
              link 
              type="primary" 
              size="small" 
              @click="handleResolve(row)"
            >
              处理
            </el-button>
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination 
          v-model:current-page="pagination.page" 
          v-model:page-size="pagination.pageSize"
          :total="pagination.total" 
          :page-sizes="[10, 20, 50, 100]" 
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
        />
      </div>
    </el-card>

    <!-- 告警详情对话框 -->
    <BaseModal v-model="detailDialog.visible" :title="detailDialog.title" width="700px">
      <div v-if="detailDialog.alert" class="alert-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="告警类型">
            <el-tag :type="getAlertTypeTag(detailDialog.alert.type) as any" size="small">
              {{ getAlertTypeText(detailDialog.alert.type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警级别">
            <el-tag :type="getAlertLevelTag(detailDialog.alert.level) as any" size="small">
              {{ getAlertLevelText(detailDialog.alert.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="告警标题" :span="2">
            {{ detailDialog.alert.title }}
          </el-descriptions-item>
          <el-descriptions-item label="告警内容" :span="2">
            <div class="alert-message">
              {{ detailDialog.alert.message }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="来源">
            {{ detailDialog.alert.source }}
          </el-descriptions-item>
          <el-descriptions-item label="告警时间">
            {{ detailDialog.alert.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="处理状态" :span="detailDialog.alert.resolved ? 1 : 2">
            <el-tag :type="detailDialog.alert.resolved ? 'success' : 'danger'" size="small">
              {{ detailDialog.alert.resolved ? '已处理' : '未处理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="detailDialog.alert.resolved" label="处理时间">
            {{ detailDialog.alert.resolvedAt }}
          </el-descriptions-item>
          <el-descriptions-item v-if="detailDialog.alert.resolved" label="处理说明" :span="2">
            <div class="resolution-note">
              {{ detailDialog.alert.resolution || '无处理说明' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialog.visible = false">关闭</el-button>
          <el-button 
            v-if="detailDialog.alert && !detailDialog.alert.resolved" 
            type="primary" 
            @click="handleResolve(detailDialog.alert)"
          >
            标记为已处理
          </el-button>
        </span>
      </template>
    </BaseModal>

    <!-- 处理告警对话框 -->
    <BaseModal v-model="resolveDialog.visible" title="处理告警" width="500px">
      <el-form :model="resolveForm" label-width="80px">
        <el-form-item label="处理说明">
          <el-input 
            v-model="resolveForm.resolution" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入处理说明..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="resolveDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmResolve">确定</el-button>
        </span>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import BaseModal from '@/components/modal/BaseModal.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Warning, Refresh, Search, Bell, 
  WarningFilled, CircleClose
} from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import { systemHealthApi } from '@/api/system'
import type { ApiResponse } from '@/types'

// 响应式数据
const loading = ref(false)
const filterType = ref('all')
const dateRange = ref<[string, string] | null>(null)

// 搜索表单
const searchForm = reactive({
  type: '',
  level: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 统计数据
const alertStats = ref({
  total: 24,
  unresolved: 8,
  critical: 3,
  today: 5
})

// 模拟数据
type AlertItem = {
  id: number
  type: 'security' | 'performance' | 'error'
  level: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  source: string
  resolved: boolean
  createdAt: string
  resolvedAt?: string
  resolution?: string
}

const mockAlerts = ref<AlertItem[]>([
  {
    id: 1,
    type: 'security',
    level: 'high',
    title: '异常登录尝试',
    message: '检测到来自异常IP的多次登录失败尝试',
    source: '安全监控系统',
    resolved: false,
    createdAt: '2024-01-15 14:30:00'
  },
  {
    id: 2,
    type: 'performance',
    level: 'critical',
    title: 'CPU使用率过高',
    message: '系统CPU使用率持续超过90%，建议检查应用程序性能',
    source: '性能监控系统',
    resolved: false,
    createdAt: '2024-01-15 13:45:00'
  },
  {
    id: 3,
    type: 'error',
    level: 'medium',
    title: '接口响应超时',
    message: '用户管理接口响应时间超过预设阈值',
    source: 'API监控',
    resolved: true,
    resolvedAt: '2024-01-15 12:30:00',
    resolution: '已优化数据库查询',
    createdAt: '2024-01-15 12:15:00'
  },
  {
    id: 4,
    type: 'security',
    level: 'medium',
    title: '敏感操作',
    message: '用户执行了敏感操作：批量删除用户',
    source: '审计系统',
    resolved: false,
    createdAt: '2024-01-15 11:20:00'
  },
  {
    id: 5,
    type: 'performance',
    level: 'low',
    title: '内存使用率较高',
    message: '系统内存使用率达到75%，请关注',
    source: '性能监控系统',
    resolved: true,
    resolvedAt: '2024-01-15 10:30:00',
    resolution: '已清理缓存',
    createdAt: '2024-01-15 09:15:00'
  }
])

// 详情对话框
const detailDialog = reactive({
  visible: false,
  title: '告警详情',
  alert: null as AlertItem | null
})

// 处理对话框
const resolveDialog = reactive({
  visible: false,
  alertId: 0
})

// 处理表单
const resolveForm = reactive({
  resolution: ''
})

// 计算属性
const tableData = computed(() => {
  let filtered = [...mockAlerts.value]
  
  // 根据筛选类型过滤
  if (filterType.value === 'unresolved') {
    filtered = filtered.filter(alert => !alert.resolved)
  } else if (filterType.value === 'resolved') {
    filtered = filtered.filter(alert => alert.resolved)
  } else if (filterType.value === 'critical') {
    filtered = filtered.filter(alert => alert.level === 'critical')
  }
  
  // 根据搜索条件过滤
  if (searchForm.type) {
    filtered = filtered.filter(alert => alert.type === searchForm.type)
  }
  if (searchForm.level) {
    filtered = filtered.filter(alert => alert.level === searchForm.level)
  }
  if (dateRange.value) {
    const [startTime, endTime] = dateRange.value
    filtered = filtered.filter(alert => {
      const alertTime = new Date(alert.createdAt).getTime()
      return alertTime >= new Date(startTime).getTime() && alertTime <= new Date(endTime).getTime()
    })
  }
  
  // 分页处理
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filtered.slice(start, end)
})

// 告警类型映射
const getAlertTypeText = (type: string) => {
  const map: Record<string, string> = {
    security: '安全告警',
    performance: '性能告警',
    error: '错误告警'
  }
  return map[type] || type
}

const getAlertTypeTag = (type: string) => {
  const map: Record<string, string> = {
    security: 'danger',
    performance: 'warning',
    error: 'info'
  }
  return map[type] || 'info'
}

// 告警级别映射
const getAlertLevelText = (level: string) => {
  const map: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return map[level] || level
}

const getAlertLevelTag = (level: string) => {
  const map: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return map[level] || 'info'
}

// 刷新告警
const refreshAlerts = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 实际应该调用:
    // const result = await systemHealthApi.getSystemAlerts({
    //   page: pagination.page,
    //   pageSize: pagination.pageSize
    // })
    // mockAlerts.value = result.data.list
    // pagination.total = result.data.total
    
    ElMessage.success('刷新成功')
  } catch (error) {
    ElMessage.error('刷新失败')
  } finally {
    loading.value = false
  }
}

// 处理筛选变化
const handleFilterChange = () => {
  pagination.page = 1
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
}

// 重置搜索
const handleReset = () => {
  searchForm.type = ''
  searchForm.level = ''
  dateRange.value = null
  pagination.page = 1
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
}

// 查看详情
const handleViewDetail = (alert: AlertItem) => {
  detailDialog.alert = alert
  detailDialog.visible = true
}

// 处理告警
const handleResolve = (alert: AlertItem) => {
  resolveDialog.alertId = alert.id
  resolveForm.resolution = ''
  resolveDialog.visible = true
}

// 确认处理
const confirmResolve = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 实际应该调用:
    // await systemHealthApi.resolveAlert(resolveDialog.alertId, resolveForm.resolution)
    
    // 更新本地数据
    const alert = mockAlerts.value.find(a => a.id === resolveDialog.alertId)
    if (alert) {
      alert.resolved = true
      alert.resolvedAt = new Date().toLocaleString()
      alert.resolution = resolveForm.resolution
    }
    
    resolveDialog.visible = false
    ElMessage.success('处理成功')
    refreshAlerts()
  } catch (error) {
    ElMessage.error('处理失败')
  }
}

// 生成模拟数据
const generateMockData = () => {
  const types: ('security' | 'performance' | 'error')[] = ['security', 'performance', 'error']
  const levels: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical']
  
  const data: AlertItem[] = []
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const level = levels[Math.floor(Math.random() * levels.length)]
    const resolved = Math.random() > 0.6
    
    data.push({
      id: i + 1,
      type,
      level,
      title: `${getAlertTypeText(type)}告警${i + 1}`,
      message: `这是一条${getAlertLevelText(level)}级别的${getAlertTypeText(type)}告警信息`,
      source: '监控系统',
      resolved,
      resolvedAt: resolved ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toLocaleString() : undefined,
      resolution: resolved ? '已处理' : undefined,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString()
    })
  }
  
  mockAlerts.value = data
  pagination.total = data.length
}

// 生命周期
onMounted(() => {
  generateMockData()
})
</script>

<style scoped>
.system-alerts-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: var(--spacing-3xl);
}

.alerts-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  background: var(--color-bg-card);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--text-lg);
}

.search-bar {
  padding: var(--spacing-xl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--color-border-light);
}

.search-form {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-light);
}

.alert-message {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.resolution-note {
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
}

@media (max-width: 992px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: var(--spacing-md);
  }
  
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .search-form .el-form-item {
    display: block;
    margin-right: 0;
    margin-bottom: var(--spacing-md);
  }
  
  .search-form .el-form-item__content {
    margin-left: 0 !important;
    margin-top: var(--spacing-sm);
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
  
  .system-alerts-page {
    padding: var(--spacing-lg);
  }
  
  .search-bar {
    padding: var(--spacing-lg);
  }
}
</style>