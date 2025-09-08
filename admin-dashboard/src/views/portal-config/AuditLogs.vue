<template>
  <div class="audit-logs">
    <UnifiedPageHeader 
      title="审计日志" 
      description="记录门户配置的所有操作历史，确保系统安全性和可追溯性"
    >
      <template #actions>
        <el-button @click="exportLogs" class="action-btn">
          <i class="el-icon-download" class="btn-icon"></i>
          导出日志
        </el-button>
        <el-button @click="refreshLogs" class="action-btn">
          <i class="el-icon-refresh" class="btn-icon"></i>
          刷新
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 统计概览 -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="el-icon-folder-opened"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.totalLogs }}</div>
          <div class="stat-label">总日志数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon today">
          <i class="el-icon-calendar"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.todayLogs }}</div>
          <div class="stat-label">今日操作</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon users">
          <i class="el-icon-user"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.activeUsers }}</div>
          <div class="stat-label">活跃用户</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon errors">
          <i class="el-icon-warning"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.errorLogs }}</div>
          <div class="stat-label">异常操作</div>
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <el-card class="filter-card">
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">时间范围：</label>
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="date-picker"
            />
          </div>
          <div class="filter-group">
            <label class="filter-label">操作类型：</label>
            <el-select v-model="filterAction" placeholder="全部操作" class="filter-select">
              <el-option label="全部操作" value="" />
              <el-option label="创建" value="create" />
              <el-option label="更新" value="update" />
              <el-option label="删除" value="delete" />
              <el-option label="发布" value="publish" />
              <el-option label="回滚" value="rollback" />
            </el-select>
          </div>
          <div class="filter-group">
            <label class="filter-label">操作用户：</label>
            <el-select v-model="filterUser" placeholder="全部用户" class="filter-select">
              <el-option label="全部用户" value="" />
              <el-option
                v-for="user in userOptions"
                :key="user.id"
                :label="user.name"
                :value="user.id"
              />
            </el-select>
          </div>
        </div>
        <div class="filter-row">
          <div class="filter-group">
            <label class="filter-label">操作对象：</label>
            <el-select v-model="filterResource" placeholder="全部对象" class="filter-select">
              <el-option label="全部对象" value="" />
              <el-option label="导航菜单" value="navigation" />
              <el-option label="入口面板" value="panel" />
              <el-option label="入口项目" value="item" />
              <el-option label="系统配置" value="config" />
            </el-select>
          </div>
          <div class="filter-group">
            <label class="filter-label">操作结果：</label>
            <el-select v-model="filterStatus" placeholder="全部结果" class="filter-select">
              <el-option label="全部结果" value="" />
              <el-option label="成功" value="success" />
              <el-option label="失败" value="error" />
              <el-option label="警告" value="warning" />
            </el-select>
          </div>
          <div class="filter-group">
            <label class="filter-label">搜索关键词：</label>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索描述或IP地址..."
              class="search-input"
              clearable
            />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="applyFilters" class="apply-btn">
              <i class="el-icon-search" class="btn-icon"></i>
              查询
            </el-button>
            <el-button @click="resetFilters" class="reset-btn">
              <i class="el-icon-refresh-left" class="btn-icon"></i>
              重置
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 日志列表 -->
    <div class="logs-container">
      <el-card class="logs-card">
        <template #header>
          <div class="card-header">
            <h3 class="card-title">操作日志</h3>
            <div class="header-info">
              <span class="log-count">共 {{ filteredLogs.length }} 条记录</span>
              <el-switch
                v-model="realTimeMode"
                active-text="实时刷新"
                inactive-text="手动刷新"
                class="realtime-switch"
              />
            </div>
          </div>
        </template>

        <div class="logs-list">
          <div
            v-for="log in paginatedLogs"
            :key="log.id"
            :class="[
              'log-item',
              `status-${log.status}`,
              { 'expanded': expandedLogId === log.id }
            ]"
            @click="toggleLogExpansion(log.id)"
          >
            <div class="log-main">
              <div class="log-icon-wrapper">
                <div :class="['log-icon', `icon-${log.status}`]">
                  <i :class="getActionIcon(log.action)" class="action-icon"></i>
                </div>
                <div class="status-indicator" :class="`status-${log.status}`"></div>
              </div>
              
              <div class="log-content">
                <div class="log-header-row">
                  <div class="log-title">
                    <span class="action-text">{{ getActionText(log.action) }}</span>
                    <span class="resource-text">{{ getResourceText(log.resource_type) }}</span>
                    <span v-if="log.resource_name" class="resource-name">「{{ log.resource_name }}」</span>
                  </div>
                  <div class="log-meta">
                    <el-tag :type="getStatusTagType(log.status)" size="small" class="status-tag">
                      {{ getStatusText(log.status) }}
                    </el-tag>
                    <span class="log-time">{{ formatTime(log.created_at) }}</span>
                  </div>
                </div>
                
                <div class="log-description">
                  {{ log.description }}
                </div>
                
                <div class="log-details">
                  <div class="detail-item">
                    <i class="el-icon-user" class="detail-icon"></i>
                    <span>{{ log.user_name }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="el-icon-connection" class="detail-icon"></i>
                    <span>{{ log.ip_address }}</span>
                  </div>
                  <div class="detail-item">
                    <i class="el-icon-monitor" class="detail-icon"></i>
                    <span>{{ log.user_agent || '未知设备' }}</span>
                  </div>
                </div>
              </div>
              
              <div class="log-actions">
                <el-button
                  size="small"
                  text
                  @click.stop="viewLogDetails(log)"
                  class="action-link"
                >
                  <i class="el-icon-view" class="action-icon"></i>
                  详情
                </el-button>
                <el-button
                  v-if="log.changes"
                  size="small"
                  text
                  @click.stop="viewChanges(log)"
                  class="action-link"
                >
                  <i class="el-icon-document-copy" class="action-icon"></i>
                  变更
                </el-button>
              </div>
            </div>
            
            <!-- 展开的详细信息 -->
            <div v-if="expandedLogId === log.id" class="log-expanded">
              <div class="expanded-content">
                <div class="expanded-section">
                  <h5>操作详情</h5>
                  <div class="detail-grid">
                    <div class="detail-row">
                      <label>操作ID：</label>
                      <span>{{ log.id }}</span>
                    </div>
                    <div class="detail-row">
                      <label>会话ID：</label>
                      <span>{{ log.session_id || '无' }}</span>
                    </div>
                    <div class="detail-row">
                      <label>请求ID：</label>
                      <span>{{ log.request_id || '无' }}</span>
                    </div>
                    <div class="detail-row">
                      <label>耗时：</label>
                      <span>{{ log.duration || '0' }}ms</span>
                    </div>
                  </div>
                </div>
                
                <div class="expanded-section" v-if="log.changes">
                  <h5>变更内容</h5>
                  <pre class="changes-content">{{ formatChanges(log.changes) }}</pre>
                </div>
                
                <div class="expanded-section" v-if="log.error_message">
                  <h5>错误信息</h5>
                  <div class="error-message">{{ log.error_message }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100, 200]"
            :total="filteredLogs.length"
            layout="total, sizes, prev, pager, next, jumper"
            class="pagination"
          />
        </div>
      </el-card>
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="showLogDetail"
      title="日志详情"
      width="70%"
      class="log-detail-dialog"
    >
      <div v-if="selectedLog" class="log-detail-content">
        <div class="detail-sections">
          <div class="section">
            <h4>基本信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>操作类型：</label>
                <el-tag :type="getStatusTagType(selectedLog.status)">
                  {{ getActionText(selectedLog.action) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>操作对象：</label>
                <span>{{ getResourceText(selectedLog.resource_type) }}</span>
              </div>
              <div class="info-item">
                <label>对象名称：</label>
                <span>{{ selectedLog.resource_name || '无' }}</span>
              </div>
              <div class="info-item">
                <label>操作结果：</label>
                <el-tag :type="getStatusTagType(selectedLog.status)">
                  {{ getStatusText(selectedLog.status) }}
                </el-tag>
              </div>
              <div class="info-item">
                <label>操作时间：</label>
                <span>{{ formatTime(selectedLog.created_at, true) }}</span>
              </div>
              <div class="info-item">
                <label>操作用户：</label>
                <span>{{ selectedLog.user_name }}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h4>技术信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>IP地址：</label>
                <span>{{ selectedLog.ip_address }}</span>
              </div>
              <div class="info-item">
                <label>用户代理：</label>
                <span class="user-agent">{{ selectedLog.user_agent || '未知' }}</span>
              </div>
              <div class="info-item">
                <label>会话ID：</label>
                <span>{{ selectedLog.session_id || '无' }}</span>
              </div>
              <div class="info-item">
                <label>请求ID：</label>
                <span>{{ selectedLog.request_id || '无' }}</span>
              </div>
              <div class="info-item">
                <label>处理时长：</label>
                <span>{{ selectedLog.duration || '0' }}ms</span>
              </div>
            </div>
          </div>

          <div class="section" v-if="selectedLog.changes">
            <h4>变更内容</h4>
            <pre class="changes-json">{{ formatChanges(selectedLog.changes) }}</pre>
          </div>

          <div class="section" v-if="selectedLog.error_message">
            <h4>错误信息</h4>
            <div class="error-detail">{{ selectedLog.error_message }}</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { ElMessage } from 'element-plus'
import type { AuditLog } from '@/types/navigation'

const dateRange = ref<[string, string] | null>(null)
const filterAction = ref('')
const filterUser = ref('')
const filterResource = ref('')
const filterStatus = ref('')
const searchKeyword = ref('')
const realTimeMode = ref(false)
const showLogDetail = ref(false)
const selectedLog = ref<AuditLog | null>(null)
const expandedLogId = ref<number | null>(null)

const currentPage = ref(1)
const pageSize = ref(20)

let realTimeTimer: number | null = null

const statistics = reactive({
  totalLogs: 1247,
  todayLogs: 28,
  activeUsers: 12,
  errorLogs: 3
})

const userOptions = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
])

const logs = ref<AuditLog[]>([
  {
    id: 1,
    action: 'update',
    resource_type: 'navigation',
    resource_id: 5,
    resource_name: '主导航菜单',
    description: '更新了主导航菜单的图标和排序',
    changes: { icon: { old: 'menu', new: 'folder' }, sort_order: { old: 1, new: 2 } },
    status: 'success',
    user_id: 1,
    user_name: '张三',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    session_id: 'sess_123456',
    request_id: 'req_789012',
    duration: 156,
    created_at: '2024-01-15 14:30:25'
  },
  {
    id: 2,
    action: 'create',
    resource_type: 'panel',
    resource_id: 8,
    resource_name: '数据分析面板',
    description: '创建了新的数据分析入口面板',
    status: 'success',
    user_id: 2,
    user_name: '李四',
    ip_address: '192.168.1.101',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    session_id: 'sess_234567',
    request_id: 'req_890123',
    duration: 234,
    created_at: '2024-01-15 13:45:12'
  },
  {
    id: 3,
    action: 'delete',
    resource_type: 'item',
    resource_id: 15,
    resource_name: '过期链接',
    description: '删除了过期的快捷入口链接',
    status: 'success',
    user_id: 1,
    user_name: '张三',
    ip_address: '192.168.1.100',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    session_id: 'sess_345678',
    request_id: 'req_901234',
    duration: 89,
    created_at: '2024-01-15 11:20:08'
  },
  {
    id: 4,
    action: 'publish',
    resource_type: 'config',
    resource_id: 0,
    resource_name: '门户配置',
    description: '发布了门户配置到生产环境',
    status: 'error',
    error_message: '发布失败：权限验证错误',
    user_id: 3,
    user_name: '王五',
    ip_address: '192.168.1.102',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    session_id: 'sess_456789',
    request_id: 'req_012345',
    duration: 2340,
    created_at: '2024-01-15 10:15:33'
  }
])

const filteredLogs = computed(() => {
  let filtered = logs.value

  // 时间范围筛选
  if (dateRange.value) {
    const [start, end] = dateRange.value
    filtered = filtered.filter(log => {
      const logTime = new Date(log.created_at).getTime()
      const startTime = new Date(start).getTime()
      const endTime = new Date(end).getTime()
      return logTime >= startTime && logTime <= endTime
    })
  }

  // 操作类型筛选
  if (filterAction.value) {
    filtered = filtered.filter(log => log.action === filterAction.value)
  }

  // 用户筛选
  if (filterUser.value) {
    filtered = filtered.filter(log => log.user_id === filterUser.value)
  }

  // 资源类型筛选
  if (filterResource.value) {
    filtered = filtered.filter(log => log.resource_type === filterResource.value)
  }

  // 状态筛选
  if (filterStatus.value) {
    filtered = filtered.filter(log => log.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(log =>
      log.description.toLowerCase().includes(keyword) ||
      log.ip_address.includes(keyword) ||
      log.resource_name?.toLowerCase().includes(keyword)
    )
  }

  return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredLogs.value.slice(start, end)
})

const getActionIcon = (action: string) => {
  switch (action) {
    case 'create': return 'el-icon-plus'
    case 'update': return 'el-icon-edit'
    case 'delete': return 'el-icon-delete'
    case 'publish': return 'el-icon-upload'
    case 'rollback': return 'el-icon-refresh-left'
    default: return 'el-icon-document'
  }
}

const getActionText = (action: string) => {
  switch (action) {
    case 'create': return '创建'
    case 'update': return '更新'
    case 'delete': return '删除'
    case 'publish': return '发布'
    case 'rollback': return '回滚'
    default: return '操作'
  }
}

const getResourceText = (resourceType: string) => {
  switch (resourceType) {
    case 'navigation': return '导航菜单'
    case 'panel': return '入口面板'
    case 'item': return '入口项目'
    case 'config': return '系统配置'
    default: return '未知对象'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'success': return '成功'
    case 'error': return '失败'
    case 'warning': return '警告'
    default: return '未知'
  }
}

const getStatusTagType = (status: string) => {
  switch (status) {
    case 'success': return 'success'
    case 'error': return 'danger'
    case 'warning': return 'warning'
    default: return 'info'
  }
}

const formatTime = (timeStr: string, showSeconds = false) => {
  const date = new Date(timeStr)
  const format = showSeconds ? 'YYYY-MM-DD HH:mm:ss' : 'MM-DD HH:mm'
  
  if (showSeconds) {
    return date.toLocaleString('zh-CN')
  } else {
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
}

const formatChanges = (changes: any) => {
  return JSON.stringify(changes, null, 2)
}

const toggleLogExpansion = (logId: number) => {
  expandedLogId.value = expandedLogId.value === logId ? null : logId
}

const viewLogDetails = (log: AuditLog) => {
  selectedLog.value = log
  showLogDetail.value = true
}

const viewChanges = (log: AuditLog) => {
  console.log('查看变更:', log.changes)
  // 可以在这里打开专门的变更对比对话框
}

const applyFilters = () => {
  currentPage.value = 1
  // 触发计算属性重新计算
}

const resetFilters = () => {
  dateRange.value = null
  filterAction.value = ''
  filterUser.value = ''
  filterResource.value = ''
  filterStatus.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

const exportLogs = () => {
  // TODO: 实现日志导出功能
  ElMessage.info('导出功能开发中...')
}

const refreshLogs = () => {
  // TODO: 刷新日志数据
  ElMessage.success('日志已刷新')
}

// 实时刷新
watch(realTimeMode, (enabled) => {
  if (enabled) {
    realTimeTimer = setInterval(() => {
      // TODO: 获取最新日志
      console.log('实时刷新日志...')
    }, 5000)
    ElMessage.success('已开启实时刷新')
  } else {
    if (realTimeTimer) {
      clearInterval(realTimeTimer)
      realTimeTimer = null
    }
    ElMessage.info('已关闭实时刷新')
  }
})

onMounted(() => {
  // TODO: 加载日志数据
})

onUnmounted(() => {
  if (realTimeTimer) {
    clearInterval(realTimeTimer)
  }
})
</script>

<style scoped>
.audit-logs {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(250, 112, 154, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  opacity: 0.9;
}

.page-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.btn-icon {
  font-size: 16px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;

  &.total {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }

  &.today {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  &.users {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.errors {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  }
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  :deep(.el-card__body) {
    padding: 24px;
  }
}

.filter-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.date-picker,
.filter-select,
.search-input {
  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.apply-btn,
.reset-btn {
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.apply-btn {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  border: none;
  color: white;
  font-weight: 600;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(250, 112, 154, 0.4);
  }
}

.reset-btn {
  background: white;
  border: 2px solid #e4e7ed;
  color: #666;

  &:hover {
    border-color: #c0c4cc;
    background: #f5f7fa;
  }
}

.logs-container {
  margin-bottom: 24px;
}

.logs-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  :deep(.el-card__header) {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-bottom: 1px solid #e9ecef;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.log-count {
  color: #6c757d;
  font-size: 14px;
}

.realtime-switch {
  :deep(.el-switch__core) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  }
}

.logs-list {
  padding: 16px;
}

.log-item {
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
  background: white;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #fa709a;
    box-shadow: 0 4px 20px rgba(250, 112, 154, 0.1);
  }

  &.status-error {
    border-left: 4px solid #f56c6c;
  }

  &.status-warning {
    border-left: 4px solid #e6a23c;
  }

  &.status-success {
    border-left: 4px solid #67c23a;
  }

  &.expanded {
    border-color: #fa709a;
    box-shadow: 0 6px 30px rgba(250, 112, 154, 0.15);
  }
}

.log-main {
  padding: 20px 24px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.log-icon-wrapper {
  position: relative;
  flex-shrink: 0;
}

.log-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;

  &.icon-success {
    background: linear-gradient(135deg, #67c23a 0%, #a8e6cf 100%);
  }

  &.icon-error {
    background: linear-gradient(135deg, #f56c6c 0%, #ffa500 100%);
  }

  &.icon-warning {
    background: linear-gradient(135deg, #e6a23c 0%, #fee140 100%);
  }
}

.action-icon {
  font-size: 16px;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;

  &.status-success {
    background: #67c23a;
  }

  &.status-error {
    background: #f56c6c;
  }

  &.status-warning {
    background: #e6a23c;
  }
}

.log-content {
  flex: 1;
  min-width: 0;
}

.log-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.log-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.action-text {
  color: #fa709a;
}

.resource-text {
  color: #6c757d;
  margin: 0 4px;
}

.resource-name {
  color: #2c3e50;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.status-tag {
  font-size: 12px;
  font-weight: 500;
}

.log-time {
  color: #6c757d;
  font-size: 14px;
  white-space: nowrap;
}

.log-description {
  color: #495057;
  line-height: 1.6;
  margin-bottom: 12px;
}

.log-details {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-size: 12px;
}

.detail-icon {
  font-size: 12px;
  opacity: 0.7;
}

.log-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-self: flex-start;
}

.action-link {
  font-size: 12px;
  color: #fa709a;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }

  .action-icon {
    font-size: 12px;
  }
}

.log-expanded {
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.expanded-content {
  padding: 20px 24px;
}

.expanded-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.expanded-section h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row label {
  color: #6c757d;
  font-size: 12px;
  font-weight: 500;
  min-width: 80px;
}

.detail-row span {
  color: #495057;
  font-size: 12px;
}

.changes-content,
.changes-json {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 0;
}

.error-message,
.error-detail {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 6px;
  padding: 12px;
  color: #c53030;
  font-size: 14px;
  line-height: 1.5;
}

.pagination-container {
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.pagination {
  display: flex;
  justify-content: center;
}

.log-detail-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: white;
  }
}

.log-detail-content {
  padding: 16px;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item label {
  color: #6c757d;
  font-weight: 500;
  min-width: 80px;
  font-size: 14px;
}

.info-item span {
  color: #495057;
  font-size: 14px;
}

.user-agent {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  word-break: break-all;
}

@media (max-width: 768px) {
  .audit-logs {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    min-width: auto;
  }

  .filter-actions {
    margin-left: 0;
  }

  .log-main {
    flex-direction: column;
    gap: 12px;
  }

  .log-header-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .log-meta {
    justify-content: flex-start;
  }

  .log-details {
    flex-direction: column;
    gap: 8px;
  }

  .log-actions {
    align-self: stretch;
    justify-content: flex-start;
  }

  .detail-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>