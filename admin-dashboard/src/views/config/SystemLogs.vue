<template>
  <div class="system-logs-page">
    <UnifiedPageHeader 
      title="系统日志" 
      description="查看和管理系统运行日志，支持导出和清理功能"
    >
      <template #actions>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出日志
        </el-button>
        <el-button @click="handleCleanup">
          <el-icon><Delete /></el-icon>
          清理日志
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 日志统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><DocumentChecked /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ logStats.total }}</div>
              <div class="stats-label">总日志数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon today">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ logStats.today }}</div>
              <div class="stats-label">今日日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon error">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ logStats.errors }}</div>
              <div class="stats-label">错误日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon users">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ logStats.activeUsers }}</div>
              <div class="stats-label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索筛选 -->
    <div class="search-form">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="操作用户">
          <el-select
            v-model="searchForm.userId"
            placeholder="全部用户"
            clearable
            filterable
            style="width: 150px"
          >
            <el-option
              v-for="user in userList"
              :key="user.id"
              :label="user.nickname"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作模块">
          <el-select
            v-model="searchForm.module"
            placeholder="全部模块"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="module in modules"
              :key="module"
              :label="module"
              :value="module"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="操作类型">
          <el-select
            v-model="searchForm.action"
            placeholder="全部操作"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="action in actions"
              :key="action"
              :label="action"
              :value="action"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="日志级别">
          <el-select
            v-model="searchForm.level"
            placeholder="全部级别"
            clearable
            style="width: 100px"
          >
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warn" />
            <el-option label="错误" value="error" />
            <el-option label="调试" value="debug" />
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
            style="width: 350px"
          />
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索描述或IP"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleRealtime" :type="isRealtime ? 'success' : 'info'">
            {{ isRealtime ? '停止' : '实时' }}监控
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 日志列表 -->
    <div class="table-container">
      <div class="table-operations">
        <div class="table-operations-left">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table">表格视图</el-radio-button>
            <el-radio-button value="detail">详细视图</el-radio-button>
            <el-radio-button value="timeline">时间线</el-radio-button>
          </el-radio-group>
        </div>
        
        <div class="table-operations-right">
          <el-button-group size="small">
            <el-button @click="handleRefresh" :loading="refreshLoading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button @click="handleAutoRefresh">
              <el-icon><Timer /></el-icon>
              {{ autoRefresh ? '停止自动刷新' : '自动刷新' }}
            </el-button>
          </el-button-group>
          <span style="margin-left: 16px">共 {{ pagination.total }} 条记录</span>
        </div>
      </div>

      <!-- 表格视图 -->
      <el-table
        v-if="viewMode === 'table'"
        :data="logList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="user" label="操作用户" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.user?.avatar">
                {{ row.user?.nickname?.charAt(0) }}
              </el-avatar>
              <span class="user-name">{{ row.user?.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag :color="getModuleColor(row.module)" size="small">
              {{ row.module }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">
              {{ row.action }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="操作描述" min-width="200">
          <template #default="{ row }">
            <div class="log-description">
              <span class="desc-text">{{ row.description }}</span>
              <el-tag v-if="row.level" :type="getLevelType(row.level)" size="small">
                {{ getLevelName(row.level) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="ip" label="IP地址" width="130">
          <template #default="{ row }">
            <code class="ip-address">{{ row.ip }}</code>
          </template>
        </el-table-column>
        
        <el-table-column prop="userAgent" label="用户代理" width="150">
          <template #default="{ row }">
            <el-tooltip :content="row.userAgent" placement="top">
              <span class="user-agent">{{ getBrowserInfo(row.userAgent) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">
            <div class="log-time">
              <div class="time-main">{{ formatDate(row.createdAt) }}</div>
              <div class="time-sub">{{ formatTime(row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 详细视图 -->
      <div v-if="viewMode === 'detail'" class="detail-view">
        <div
          v-for="log in logList"
          :key="log.id"
          class="log-card"
        >
          <div class="log-header">
            <div class="log-user">
              <el-avatar :size="32" :src="log.user?.avatar">
                {{ log.user?.nickname?.charAt(0) }}
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ log.user?.nickname }}</div>
                <div class="user-meta">{{ log.user?.department }}</div>
              </div>
            </div>
            
            <div class="log-meta">
              <el-tag :color="getModuleColor(log.module)" size="small">
                {{ log.module }}
              </el-tag>
              <el-tag :type="getActionType(log.action)" size="small">
                {{ log.action }}
              </el-tag>
              <el-tag v-if="log.level" :type="getLevelType(log.level)" size="small">
                {{ getLevelName(log.level) }}
              </el-tag>
            </div>
            
            <div class="log-time-detail">
              <div class="time-text">{{ formatDateTime(log.createdAt) }}</div>
            </div>
          </div>
          
          <div class="log-content">
            <div class="log-description-detail">
              {{ log.description }}
            </div>
            
            <div class="log-tech-info">
              <div class="tech-item">
                <span class="tech-label">IP地址:</span>
                <code>{{ log.ip }}</code>
              </div>
              <div class="tech-item">
                <span class="tech-label">浏览器:</span>
                <span>{{ getBrowserInfo(log.userAgent) }}</span>
              </div>
              <div class="tech-item">
                <span class="tech-label">操作ID:</span>
                <code>#{{ log.id }}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时间线视图 -->
      <div v-if="viewMode === 'timeline'" class="timeline-view">
        <el-timeline>
          <el-timeline-item
            v-for="log in logList"
            :key="log.id"
            :timestamp="formatDateTime(log.createdAt)"
            :type="log.level ? getTimelineType(log.level) : 'info'"
          >
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-user">{{ log.user?.nickname }}</span>
                <span class="timeline-action">{{ log.action }}</span>
                <span class="timeline-module">{{ log.module }}</span>
              </div>
              <div class="timeline-desc">{{ log.description }}</div>
              <div class="timeline-meta">
                <span class="meta-ip">{{ log.ip }}</span>
                <span class="meta-agent">{{ getBrowserInfo(log.userAgent) }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="日志详情" width="700px">
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="操作ID">
            <code>#{{ currentLog.id }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatDateTime(currentLog.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="操作用户">
            <div class="user-detail">
              <el-avatar :size="24" :src="currentLog.user?.avatar">
                {{ currentLog.user?.nickname?.charAt(0) }}
              </el-avatar>
              <span>{{ currentLog.user?.nickname }} ({{ currentLog.user?.department }})</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ currentLog.user.id }}
          </el-descriptions-item>
          <el-descriptions-item label="操作模块">
            <el-tag :color="getModuleColor(currentLog.module)" size="small">
              {{ currentLog.module }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getActionType(currentLog.action)" size="small">
              {{ currentLog.action }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="日志级别" v-if="currentLog.level">
            <el-tag :type="getLevelType(currentLog.level)" size="small">
              {{ getLevelName(currentLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            <code>{{ currentLog.ip }}</code>
          </el-descriptions-item>
          <el-descriptions-item label="操作描述" :span="2">
            <div class="description-content">
              {{ currentLog.description }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">
            <div class="user-agent-content">
              {{ currentLog.userAgent }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 日志清理对话框 -->
    <el-dialog v-model="cleanupDialogVisible" title="清理日志" width="500px">
      <el-form :model="cleanupForm" label-width="100px">
        <el-form-item label="清理策略">
          <el-radio-group v-model="cleanupForm.strategy">
            <el-radio value="time">按时间清理</el-radio>
            <el-radio value="count">按数量清理</el-radio>
            <el-radio value="size">按大小清理</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="cleanupForm.strategy === 'time'" label="保留时间">
          <el-input-number
            v-model="cleanupForm.keepDays"
            :min="1"
            :max="365"
            style="width: 120px"
          />
          <span style="margin-left: 8px">天</span>
        </el-form-item>
        
        <el-form-item v-if="cleanupForm.strategy === 'count'" label="保留数量">
          <el-input-number
            v-model="cleanupForm.keepCount"
            :min="1000"
            :max="1000000"
            :step="1000"
            style="width: 150px"
          />
          <span style="margin-left: 8px">条</span>
        </el-form-item>
        
        <el-form-item v-if="cleanupForm.strategy === 'size'" label="保留大小">
          <el-input-number
            v-model="cleanupForm.keepSize"
            :min="10"
            :max="1000"
            style="width: 120px"
          />
          <span style="margin-left: 8px">MB</span>
        </el-form-item>
        
        <el-form-item label="清理级别">
          <el-checkbox-group v-model="cleanupForm.levels">
            <el-checkbox value="debug">调试日志</el-checkbox>
            <el-checkbox value="info">信息日志</el-checkbox>
            <el-checkbox value="warn">警告日志</el-checkbox>
            <el-checkbox value="error" disabled>错误日志（不可清理）</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        
        <el-form-item label="备份">
          <el-checkbox v-model="cleanupForm.backup">
            清理前创建备份
          </el-checkbox>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="cleanupDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmCleanup" :loading="cleanupLoading">
          确认清理
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import type { SystemLog, User, PaginationParams } from '@/types'
import {
  Download, Delete, DocumentChecked, Calendar,
  WarningFilled, User as UserIcon, Refresh, Timer
} from '@element-plus/icons-vue'

const searchForm = reactive({
  userId: null as number | null,
  module: '',
  action: '',
  level: '',
  keyword: ''
})

const cleanupForm = reactive({
  strategy: 'time' as 'time' | 'count' | 'size',
  keepDays: 30,
  keepCount: 10000,
  keepSize: 100,
  levels: ['debug', 'info'],
  backup: true
})

const dateRange = ref<[string, string] | null>(null)
const viewMode = ref<'table' | 'detail' | 'timeline'>('table')
const detailDialogVisible = ref(false)
const cleanupDialogVisible = ref(false)
const isRealtime = ref(false)
const autoRefresh = ref(false)
const refreshLoading = ref(false)
const cleanupLoading = ref(false)
const currentLog = ref<SystemLog | null>(null)

const pagination = reactive<PaginationParams>({
  page: 1,
  pageSize: 20,
  total: 0
})

const logList = ref<SystemLog[]>([])
const userList = ref<User[]>([])
const modules = ref(['用户管理', '角色管理', '内容管理', '审核中心', '系统配置'])
const actions = ref(['登录', '登出', '创建', '编辑', '删除', '审核', '导出'])

const logStats = ref({
  total: 15420,
  today: 89,
  errors: 12,
  activeUsers: 45
})

let realtimeTimer: number | null = null
let autoRefreshTimer: number | null = null

const mockLogData = (): SystemLog[] => [
  {
    id: 1,
    userId: 1,
    user: {
      id: 1,
      username: 'admin',
      name: '系统管理员',
      nickname: '系统管理员',
      email: 'admin@company.com',
      department: '技术部',
      status: 1,
      groupId: 1,
      roles: [],
      createTime: '',
      updateTime: ''
    },
    action: '登录',
    module: '用户管理',
    description: '管理员登录系统',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-01-15T14:30:25Z'
  },
  {
    id: 2,
    userId: 2,
    user: {
      id: 2,
      username: 'editor',
      name: '编辑员',
      nickname: '编辑员',
      email: 'editor@company.com',
      department: '运营部',
      status: 1,
      groupId: 2,
      roles: [],
      createTime: '',
      updateTime: ''
    },
    action: '审核',
    module: '审核中心',
    description: '审核通过文章《如何提高工作效率》',
    ip: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    createdAt: '2024-01-15T14:25:10Z'
  }
]

const mockUserData = (): User[] => [
  { id: 1, username: 'admin', name: '系统管理员', nickname: '系统管理员', email: '', department: '技术部', status: 1, groupId: 1, roles: [], createTime: '', updateTime: '' },
  { id: 2, username: 'editor', name: '编辑员', nickname: '编辑员', email: '', department: '运营部', status: 1, groupId: 2, roles: [], createTime: '', updateTime: '' }
]

const getModuleColor = (module: string) => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
  const index = modules.value.indexOf(module)
  return colors[index] || '#909399'
}

const getActionType = (action: string) => {
  const typeMap: Record<string, 'success' | 'info' | 'primary' | 'warning' | 'danger'> = {
    '登录': 'success',
    '登出': 'info',
    '创建': 'primary',
    '编辑': 'warning',
    '删除': 'danger',
    '审核': 'success'
  }
  return typeMap[action] || 'info'
}

const getLevelName = (level: string) => {
  const levelMap: Record<string, string> = {
    debug: '调试',
    info: '信息',
    warn: '警告',
    error: '错误'
  }
  return levelMap[level] || level
}

const getLevelType = (level: string) => {
  const typeMap: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
    debug: 'info',
    info: 'success',
    warn: 'warning',
    error: 'danger'
  }
  return typeMap[level] || 'info'
}

const getTimelineType = (level?: string) => {
  const typeMap: Record<string, 'info' | 'primary' | 'warning' | 'danger'> = {
    debug: 'info',
    info: 'primary',
    warn: 'warning',
    error: 'danger'
  }
  return typeMap[level || 'info'] || 'primary'
}

const getBrowserInfo = (userAgent: string) => {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  return '未知浏览器'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('zh-CN')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadLogs = () => {
  const mockData = mockLogData()
  logList.value = mockData
  pagination.total = mockData.length
}

const loadUsers = () => {
  userList.value = mockUserData()
}

const handleSearch = () => {
  pagination.page = 1
  loadLogs()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (key === 'userId') {
      searchForm[key] = null
    } else {
      ;(searchForm as any)[key] = ''
    }
  })
  dateRange.value = null
  handleSearch()
}

const handleRealtime = () => {
  isRealtime.value = !isRealtime.value
  
  if (isRealtime.value) {
    realtimeTimer = window.setInterval(() => {
      // 模拟实时日志更新
      console.log('实时更新日志')
    }, 3000)
    ElMessage.success('已开启实时监控')
  } else {
    if (realtimeTimer) {
      clearInterval(realtimeTimer)
      realtimeTimer = null
    }
    ElMessage.info('已停止实时监控')
  }
}

const handleRefresh = () => {
  refreshLoading.value = true
  setTimeout(() => {
    refreshLoading.value = false
    loadLogs()
    ElMessage.success('刷新成功')
  }, 1000)
}

const handleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value
  
  if (autoRefresh.value) {
    autoRefreshTimer = window.setInterval(() => {
      loadLogs()
    }, 30000) // 30秒自动刷新
    ElMessage.success('已开启自动刷新')
  } else {
    if (autoRefreshTimer) {
      clearInterval(autoRefreshTimer)
      autoRefreshTimer = null
    }
    ElMessage.info('已停止自动刷新')
  }
}

const handleViewDetail = (log: SystemLog) => {
  currentLog.value = log
  detailDialogVisible.value = true
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleCleanup = () => {
  cleanupDialogVisible.value = true
}

const confirmCleanup = () => {
  cleanupLoading.value = true
  setTimeout(() => {
    cleanupLoading.value = false
    cleanupDialogVisible.value = false
    ElMessage.success('日志清理完成')
    loadLogs()
  }, 2000)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadLogs()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadLogs()
}

onMounted(() => {
  loadLogs()
  loadUsers()
})

onUnmounted(() => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
  }
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
})
</script>

<style scoped>
.system-logs-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 80px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
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

.stats-icon.error {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stats-icon.users {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-size: 13px;
}

.log-description {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.desc-text {
  flex: 1;
  margin-right: 8px;
}

.ip-address {
  font-family: 'Courier New', monospace;
  background-color: #f1f2f3;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.user-agent {
  font-size: 12px;
  color: #909399;
}

.log-time {
  text-align: center;
}

.time-main {
  font-size: 13px;
  color: #303133;
}

.time-sub {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.detail-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background-color: #fff;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-meta {
  font-size: 12px;
  color: #909399;
}

.log-meta {
  display: flex;
  gap: 8px;
}

.log-time-detail {
  font-size: 13px;
  color: #606266;
}

.log-content {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.log-description-detail {
  font-size: 14px;
  color: #303133;
  margin-bottom: 12px;
  line-height: 1.6;
}

.log-tech-info {
  display: flex;
  gap: 24px;
  font-size: 12px;
}

.tech-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tech-label {
  color: #909399;
}

.timeline-view {
  padding: 20px;
}

.timeline-content {
  padding: 8px 0;
}

.timeline-header {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.timeline-user {
  font-weight: 500;
  color: #303133;
}

.timeline-action {
  color: #409eff;
}

.timeline-module {
  color: #909399;
}

.timeline-desc {
  color: #606266;
  margin-bottom: 6px;
  line-height: 1.4;
}

.timeline-meta {
  font-size: 11px;
  color: #c0c4cc;
  display: flex;
  gap: 16px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.log-detail .user-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.description-content {
  line-height: 1.6;
  color: #606266;
}

.user-agent-content {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #909399;
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  word-break: break-all;
}
</style>