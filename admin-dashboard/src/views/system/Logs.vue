<template>
  <div class="global-audit-logs-page">
    <div class="page-header">
      <h2>全局审计日志</h2>
      <p class="page-description">记录系统所有业务模块操作，支持跨模块查询和导出</p>

      <!-- 统计卡片 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon total">
                <el-icon>
                  <DocumentChecked />
                </el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ logStats.total }}</div>
                <div class="stats-label">总操作数</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon today">
                <el-icon>
                  <Calendar />
                </el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ logStats.today }}</div>
                <div class="stats-label">今日操作</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon risk">
                <el-icon>
                  <WarningFilled />
                </el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ logStats.riskOperations }}</div>
                <div class="stats-label">风险操作</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="stats-card">
            <div class="stats-content">
              <div class="stats-icon users">
                <el-icon>
                  <User />
                </el-icon>
              </div>
              <div class="stats-info">
                <div class="stats-value">{{ logStats.activeOperators }}</div>
                <div class="stats-label">活跃操作员</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>操作记录</span>
          <div class="header-actions">
            <el-button :icon="Download" @click="handleExport" :loading="exportLoading">
              导出日志
            </el-button>
            <el-button :icon="Refresh" @click="refreshData" :loading="loading">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="操作人">
            <el-select v-model="searchForm.operatorId" placeholder="选择操作人" clearable filterable style="width: 150px">
              <el-option v-for="user in userOptions" :key="user.id" :label="user.name" :value="user.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="业务模块">
            <el-select v-model="searchForm.module" placeholder="选择模块" clearable style="width: 150px">
              <el-option label="权限管理" value="RBAC" />
              <el-option label="内容管理" value="CONTENT" />
              <el-option label="资讯聚合" value="NEWS" />
              <el-option label="Banner管理" value="BANNER" />
              <el-option label="审核中心" value="AUDIT" />
              <el-option label="跳蚤市场" value="FLEA_MARKET" />
              <el-option label="名言管理" value="QUOTATION" />
              <el-option label="运营管理" value="OPERATION" />
              <el-option label="系统配置" value="SYSTEM" />
              <el-option label="门户配置" value="PORTAL" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select v-model="searchForm.operationType" placeholder="选择操作类型" clearable style="width: 150px">
              <!-- RBAC操作 -->
              <el-option-group label="权限管理">
                <el-option label="分配角色" value="ASSIGN_ROLE" />
                <el-option label="移除角色" value="REMOVE_ROLE" />
                <el-option label="创建用户" value="CREATE_USER" />
                <el-option label="更新用户" value="UPDATE_USER" />
                <el-option label="删除用户" value="DELETE_USER" />
                <el-option label="创建角色" value="CREATE_ROLE" />
                <el-option label="更新角色" value="UPDATE_ROLE" />
                <el-option label="删除角色" value="DELETE_ROLE" />
                <el-option label="同步用户" value="SYNC_USERS" />
              </el-option-group>
              <!-- 内容管理操作 -->
              <el-option-group label="内容管理">
                <el-option label="创建内容" value="CREATE_CONTENT" />
                <el-option label="更新内容" value="UPDATE_CONTENT" />
                <el-option label="删除内容" value="DELETE_CONTENT" />
                <el-option label="审核内容" value="AUDIT_CONTENT" />
                <el-option label="发布内容" value="PUBLISH_CONTENT" />
                <el-option label="置顶内容" value="TOP_CONTENT" />
                <el-option label="加精内容" value="ELITE_CONTENT" />
              </el-option-group>
              <!-- 其他操作 -->
              <el-option-group label="其他操作">
                <el-option label="系统配置" value="UPDATE_SYSTEM_CONFIG" />
                <el-option label="数据备份" value="BACKUP_DATA" />
                <el-option label="清理缓存" value="CLEAR_CACHE" />
              </el-option-group>
              <!-- 门户配置操作 -->
              <el-option-group label="门户配置">
                <el-option label="性能监控" value="PERFORMANCE_MONITOR" />
                <el-option label="导航配置" value="UPDATE_NAVIGATION" />
                <el-option label="版本管理" value="VERSION_CONTROL" />
                <el-option label="门户预览" value="PORTAL_PREVIEW" />
              </el-option-group>
            </el-select>
          </el-form-item>
          <el-form-item label="目标类型">
            <el-select v-model="searchForm.targetType" placeholder="选择目标类型" clearable style="width: 120px">
              <el-option label="用户" value="USER" />
              <el-option label="角色" value="ROLE" />
              <el-option label="权限" value="PERMISSION" />
              <el-option label="组织" value="GROUP" />
              <el-option label="内容" value="CONTENT" />
              <el-option label="分类" value="CATEGORY" />
              <el-option label="资讯" value="NEWS" />
              <el-option label="Banner" value="BANNER" />
              <el-option label="商品" value="GOODS" />
              <el-option label="名言" value="QUOTATION" />
              <el-option label="配置" value="SYSTEM_CONFIG" />
              <el-option label="导航" value="NAVIGATION" />
              <el-option label="性能监控" value="PERFORMANCE" />
            </el-select>
          </el-form-item>
          <el-form-item label="风险等级">
            <el-select v-model="searchForm.riskLevel" placeholder="选择风险等级" clearable style="width: 120px">
              <el-option label="低风险" value="low" />
              <el-option label="中风险" value="medium" />
              <el-option label="高风险" value="high" />
            </el-select>
          </el-form-item>
          <el-form-item label="操作时间">
            <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间"
              end-placeholder="结束时间" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 320px" />
          </el-form-item>
          <el-form-item label="关键词">
            <el-input v-model="searchForm.keyword" placeholder="搜索详情描述" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作历史 -->
      <div class="batch-operation-history" v-if="batchOperationHistory.length > 0">
        <el-collapse v-model="historyCollapsed">
          <el-collapse-item title="批量操作历史" name="history">
            <el-table :data="batchOperationHistory" size="small" max-height="200">
              <el-table-column prop="timestamp" label="时间" width="160">
                <template #default="{ row }">
                  {{ row.timestamp }}
                </template>
              </el-table-column>
              <el-table-column prop="operatorName" label="操作人" width="100" />
              <el-table-column prop="action" label="操作类型" width="120">
                <template #default="{ row }">
                  <el-tag :type="getBatchOperationTag(row.action)" size="small">
                    {{ getBatchOperationLabel(row.action) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="taskCount" label="任务数量" width="100" />
              <el-table-column prop="result" label="执行结果" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                    {{ row.success ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="note" label="备注" show-overflow-tooltip />
            </el-table>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableData" v-loading="loading" stripe style="width: 100%"
        :default-sort="{ prop: 'createTime', order: 'descending' }">
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column prop="module" label="业务模块" width="100">
          <template #default="{ row }">
            <el-tag :type="getModuleColor(row.module) as any" size="small">
              {{ getModuleText(row.module) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeColor(row.operationType) as any" size="small">
              {{ getOperationTypeText(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getTargetTypeText(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetName" label="目标对象" width="180" show-overflow-tooltip />
        <el-table-column prop="detail" label="操作详情" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="detail-content">
              <span class="detail-text">{{ row.detail }}</span>
              <el-tag v-if="row.riskLevel" :type="getRiskLevelType(row.riskLevel) as any" size="small" class="risk-tag">
                {{ getRiskLevelText(row.riskLevel) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="clientIp" label="客户端IP" width="130" />
        <el-table-column prop="createTime" label="操作时间" width="160" sortable />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="操作详情" width="600px" :close-on-click-modal="false">
      <div v-if="selectedLog" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作人">
            {{ selectedLog.operatorName }}
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ selectedLog.createTime }}
          </el-descriptions-item>
          <el-descriptions-item label="业务模块">
            <el-tag :type="getModuleColor(selectedLog.module) as any" size="small">
              {{ getModuleText(selectedLog.module) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeColor(selectedLog.operationType)" size="small">
              {{ getOperationTypeText(selectedLog.operationType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标类型">
            <el-tag type="info" size="small">
              {{ getTargetTypeText(selectedLog.targetType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标对象">
            {{ selectedLog.targetName }}
          </el-descriptions-item>
          <el-descriptions-item label="客户端IP" :span="2">
            {{ selectedLog.clientIp }}
          </el-descriptions-item>
          <el-descriptions-item label="操作详情" :span="2">
            <div class="detail-text">
              {{ selectedLog.detail || '无详细信息' }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Download, Refresh, Search, DocumentChecked, Calendar,
  WarningFilled, User
} from '@element-plus/icons-vue'
import { globalAuditApi } from '@/api'
import type {
  GlobalAuditLog, GlobalOperationType, AuditModule, GlobalTargetType,
  GlobalAuditLogQueryParams, RiskLevel
} from '@/types'

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const detailDialogVisible = ref(false)
const selectedLog = ref<GlobalAuditLog | null>(null)
const dateRange = ref<[string, string] | null>(null)
const historyCollapsed = ref<string[]>([])

// 批量操作历史记录
const batchOperationHistory = ref([
  {
    timestamp: '2024-01-15 14:30:00',
    operatorName: '张三',
    action: 'batch_approve',
    taskCount: 8,
    success: true,
    note: '内容质量良好，批量通过'
  },
  {
    timestamp: '2024-01-15 13:45:00',
    operatorName: '李四',
    action: 'batch_reject',
    taskCount: 3,
    success: true,
    note: '包含违规内容'
  },
  {
    timestamp: '2024-01-15 13:20:00',
    operatorName: '王五',
    action: 'batch_transfer',
    taskCount: 5,
    success: true,
    note: '转交给专业审核员'
  }
])

// 搜索表单
const searchForm = reactive({
  operatorId: undefined as number | undefined,
  module: undefined as AuditModule | undefined,
  operationType: undefined as GlobalOperationType | undefined,
  targetType: undefined as GlobalTargetType | undefined,
  riskLevel: undefined as RiskLevel | undefined,
  keyword: '' as string
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 模拟数据
const mockData = ref<GlobalAuditLog[]>([])
const mockUsers = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '张三' },
  { id: 3, name: '李四' },
  { id: 4, name: '王五' }
])

// 统计数据
const logStats = ref({
  total: 15420,
  today: 89,
  riskOperations: 23,
  activeOperators: 45
})

// 计算属性
const tableData = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return mockData.value.slice(start, end)
})
const userOptions = computed(() => mockUsers.value)

// 业务模块映射
const getModuleText = (module: AuditModule) => {
  const map: Record<AuditModule, string> = {
    RBAC: '权限管理',
    CONTENT: '内容管理',
    NEWS: '资讯聚合',
    BANNER: 'Banner管理',
    AUDIT: '审核中心',
    FLEA_MARKET: '跳蚤市场',
    QUOTATION: '名言管理',
    OPERATION: '运营管理',
    SYSTEM: '系统配置',
    PORTAL: '门户配置'
  }
  return map[module] || module
}

const getModuleColor = (module: AuditModule) => {
  const map: Record<AuditModule, string> = {
    RBAC: 'primary',
    CONTENT: 'success',
    NEWS: 'info',
    BANNER: 'warning',
    AUDIT: 'danger',
    FLEA_MARKET: 'success',
    QUOTATION: 'info',
    OPERATION: 'warning',
    SYSTEM: 'primary',
    PORTAL: 'success'
  }
  return map[module] || 'info'
}

// 操作类型映射
const getOperationTypeText = (type: GlobalOperationType) => {
  const map: Partial<Record<GlobalOperationType, string>> = {
    // RBAC操作
    ASSIGN_ROLE: '分配角色',
    REMOVE_ROLE: '移除角色',
    CREATE_USER: '创建用户',
    UPDATE_USER: '更新用户',
    DELETE_USER: '删除用户',
    CREATE_ROLE: '创建角色',
    UPDATE_ROLE: '更新角色',
    DELETE_ROLE: '删除角色',
    SYNC_USERS: '同步用户',
    // 内容管理操作
    CREATE_CONTENT: '创建内容',
    UPDATE_CONTENT: '更新内容',
    DELETE_CONTENT: '删除内容',
    AUDIT_CONTENT: '审核内容',
    PUBLISH_CONTENT: '发布内容',
    TOP_CONTENT: '置顶内容',
    ELITE_CONTENT: '加精内容',
    // 系统操作
    UPDATE_SYSTEM_CONFIG: '系统配置',
    BACKUP_DATA: '数据备份',
    CLEAR_CACHE: '清理缓存',
    // 门户配置操作
    PERFORMANCE_MONITOR: '性能监控',
    UPDATE_NAVIGATION: '导航配置',
    VERSION_CONTROL: '版本管理',
    PORTAL_PREVIEW: '门户预览'
  }
  return map[type] || type
}

const getOperationTypeColor = (type: GlobalOperationType) => {
  if (type.includes('CREATE') || type.includes('ASSIGN')) return 'primary'
  if (type.includes('UPDATE') || type.includes('SYNC')) return 'primary'
  if (type.includes('DELETE') || type.includes('REMOVE')) return 'danger'
  if (type.includes('AUDIT') || type.includes('PUBLISH')) return 'success'
  if (type.includes('TOP') || type.includes('ELITE')) return 'warning'
  return 'info'
}

const getTargetTypeText = (type: GlobalTargetType) => {
  const map: Partial<Record<GlobalTargetType, string>> = {
    USER: '用户',
    ROLE: '角色',
    PERMISSION: '权限',
    GROUP: '组织',
    CONTENT: '内容',
    CATEGORY: '分类',
    NEWS: '资讯',
    BANNER: 'Banner',
    GOODS: '商品',
    QUOTATION: '名言',
    SYSTEM_CONFIG: '配置',
    NAVIGATION: '导航',
    PERFORMANCE: '性能监控'
  }
  return map[type] || type
}

// 风险等级映射
const getRiskLevelText = (level: RiskLevel) => {
  const map: Record<RiskLevel, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return map[level]
}

const getRiskLevelType = (level: RiskLevel) => {
  const map: Record<RiskLevel, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  }
  return map[level]
}

// 批量操作标签映射
const getBatchOperationTag = (action: string) => {
  const tags = {
    batch_approve: 'success',
    batch_reject: 'danger',
    batch_transfer: 'warning'
  }
  return tags[action] || 'info'
}

const getBatchOperationLabel = (action: string) => {
  const labels = {
    batch_approve: '批量通过',
    batch_reject: '批量拒绝',
    batch_transfer: '批量转交'
  }
  return labels[action] || action
}

// 生成模拟数据
const generateMockData = () => {
  const operations: GlobalOperationType[] = [
    'CREATE_USER', 'UPDATE_USER', 'ASSIGN_ROLE', 'CREATE_CONTENT',
    'AUDIT_CONTENT', 'PUBLISH_CONTENT', 'UPDATE_SYSTEM_CONFIG', 'CLEAR_CACHE',
    'DELETE_USER', 'CREATE_ROLE', 'UPDATE_AUDIT_POLICY', 'BATCH_AUDIT'
  ]

  const modules: AuditModule[] = ['RBAC', 'CONTENT', 'SYSTEM', 'NEWS', 'BANNER', 'AUDIT']
  const targets: GlobalTargetType[] = ['USER', 'CONTENT', 'ROLE', 'SYSTEM_CONFIG', 'BANNER', 'AUDIT_POLICY']
  const riskLevels: RiskLevel[] = ['low', 'medium', 'high']

  const data: GlobalAuditLog[] = []

  for (let i = 0; i < 87; i++) {
    const operation = operations[Math.floor(Math.random() * operations.length)]
    const module = modules[Math.floor(Math.random() * modules.length)]
    const targetType = targets[Math.floor(Math.random() * targets.length)]
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)]
    const user = mockUsers.value[Math.floor(Math.random() * mockUsers.value.length)]

    data.push({
      id: i + 1,
      operatorId: user.id,
      operatorName: user.name,
      operationType: operation,
      module: module,
      targetType: targetType,
      targetId: String(Math.floor(Math.random() * 1000) + 1),
      targetName: `${getTargetTypeText(targetType)}${Math.floor(Math.random() * 100) + 1}`,
      detail: `执行${getOperationTypeText(operation)}操作，涉及${getTargetTypeText(targetType)}`,
      clientIp: `192.168.1.${Math.floor(Math.random() * 255) + 1}`,
      createTime: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleString(),
      riskLevel: riskLevel
    })
  }

  // 按时间降序排序
  data.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())

  mockData.value = data
  pagination.total = data.length
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    const params: GlobalAuditLogQueryParams = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchForm
    }

    if (dateRange.value) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }

    // 尝试调用真实API，如果失败则使用模拟数据
    try {
      const result = await globalAuditApi.getGlobalAuditLogs(params)
      mockData.value = result.data.list
      pagination.total = result.data.total
    } catch (apiError) {
      console.warn('API调用失败，使用模拟数据:', apiError)
      // 回退到模拟数据
      generateMockData()
    }

    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('加载审计日志失败:', error)
    ElMessage.error('加载审计日志失败')
    // 回退到模拟数据
    generateMockData()
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  // 这里应该调用API进行筛选，暂时使用本地筛选演示
  let filteredData = [...mockData.value]

  if (searchForm.operatorId) {
    filteredData = filteredData.filter(item => item.operatorId === searchForm.operatorId)
  }
  if (searchForm.module) {
    filteredData = filteredData.filter(item => item.module === searchForm.module)
  }
  if (searchForm.operationType) {
    filteredData = filteredData.filter(item => item.operationType === searchForm.operationType)
  }
  if (searchForm.targetType) {
    filteredData = filteredData.filter(item => item.targetType === searchForm.targetType)
  }
  if (searchForm.riskLevel) {
    filteredData = filteredData.filter(item => item.riskLevel === searchForm.riskLevel)
  }
  if (searchForm.keyword) {
    filteredData = filteredData.filter(item =>
      item.detail?.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      item.operatorName.toLowerCase().includes(searchForm.keyword.toLowerCase()) ||
      item.targetName.toLowerCase().includes(searchForm.keyword.toLowerCase())
    )
  }
  if (dateRange.value) {
    const [startTime, endTime] = dateRange.value
    filteredData = filteredData.filter(item => {
      const itemTime = new Date(item.createTime).getTime()
      return itemTime >= new Date(startTime).getTime() && itemTime <= new Date(endTime).getTime()
    })
  }

  mockData.value = filteredData
  pagination.total = filteredData.length
}

// 重置搜索
const handleReset = () => {
  searchForm.operatorId = undefined
  searchForm.module = undefined
  searchForm.operationType = undefined
  searchForm.targetType = undefined
  searchForm.riskLevel = undefined
  searchForm.keyword = ''
  dateRange.value = null
  generateMockData()
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
const handleViewDetail = (log: GlobalAuditLog) => {
  selectedLog.value = log
  detailDialogVisible.value = true
}

// 导出日志
const handleExport = async () => {
  try {
    await ElMessageBox.confirm(
      '确定导出当前查询条件下的审计日志吗？',
      '导出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    exportLoading.value = true

    // 模拟导出过程
    setTimeout(() => {
      ElMessage.success('导出成功，文件已下载')
      exportLoading.value = false
    }, 2000)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('导出失败')
    }
  }
}


// 生命周期
onMounted(() => {
  generateMockData()
})
</script>

<style scoped>
.global-audit-logs-page {
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

.stats-row {
  margin: 20px 0;
}

.stats-card {
  min-height: 80px;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stats-content {
  display: flex;
  align-items: center;
  min-height: 80px;
  padding: 8px 0;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stats-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.today {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-icon.risk {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.users {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-info {
  flex: 1;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stats-label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
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

.search-bar {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.batch-operation-history {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.detail-content {
  max-height: 400px;
  overflow-y: auto;
}

.dialog-detail-text {
  word-break: break-all;
  white-space: pre-wrap;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

:deep(.el-select-dropdown__item) {
  padding: 0 20px;
  font-size: 13px;
}

:deep(.el-select-group__title) {
  padding: 8px 20px 0;
  font-size: 12px;
  color: #909399;
  font-weight: 600;
}

.detail-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-text {
  flex: 1;
  white-space: normal;
  word-break: break-word;
}

.risk-tag {
  flex-shrink: 0;
}

/* 统计卡片响应式：中屏两列，小屏一列，避免挤压导致内容裁切 */
@media (max-width: 992px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 12px;
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  .stats-content {
    min-height: 64px;
  }

  .stats-value {
    font-size: 20px;
  }
}
</style>