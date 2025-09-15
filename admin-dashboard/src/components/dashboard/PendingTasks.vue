<template>
  <el-card class="pending-tasks-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <h3 class="card-title">
            我的待办
            <el-badge 
              :value="totalTaskCount" 
              :type="getBadgeType(totalTaskCount)"
              :hidden="totalTaskCount === 0"
            />
          </h3>
          <el-text size="small" type="info" class="card-subtitle">
            需要处理的任务事项，点击直接跳转处理
          </el-text>
        </div>
        <div class="header-actions">
          <el-tooltip content="刷新待办" placement="top">
            <el-button 
              size="small" 
              :icon="Refresh" 
              circle
              @click="handleRefresh"
              :loading="loading"
            />
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="tasks-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="tasks-loading">
        <el-skeleton animated :rows="4" />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="tasks-error">
        <el-alert
          title="数据加载失败"
          :description="error"
          type="error"
          :closable="false"
          show-icon
        >
          <template #default>
            <el-button size="small" @click="handleRefresh">
              重新加载
            </el-button>
          </template>
        </el-alert>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!pendingTasks || pendingTasks.length === 0" class="tasks-empty">
        <el-empty description="暂无待办事项">
          <template #image>
            <el-icon size="80" color="#c0c4cc">
              <CircleCheck />
            </el-icon>
          </template>
          <template #description>
            <span>🎉 太棒了！当前没有待办事项</span>
          </template>
        </el-empty>
      </div>

      <!-- 任务列表 -->
      <div v-else class="tasks-list">
        <div
          v-for="task in pendingTasks"
          :key="task.id"
          class="task-item"
          :class="getPriorityClass(task.priority)"
          @click="handleTaskClick(task)"
        >
          <div class="task-icon">
            <el-icon :size="20">
              <component :is="getTaskIcon(task.type)" />
            </el-icon>
          </div>
          
          <div class="task-content">
            <div class="task-header">
              <span class="task-title">{{ task.title }}</span>
              <el-tag 
                :type="getTaskTagType(task.type)"
                size="small"
                class="task-type-tag"
              >
                {{ getTaskTypeName(task.type) }}
              </el-tag>
            </div>
            
            <div class="task-meta">
              <div class="task-count">
                <el-icon size="14"><Tickets /></el-icon>
                <span>{{ task.count }}项待处理</span>
              </div>
              
              <div class="task-priority" :class="`priority-${task.priority}`">
                <el-icon size="14">
                  <component :is="getPriorityIcon(task.priority)" />
                </el-icon>
                <span>{{ getPriorityText(task.priority) }}</span>
              </div>
              
              <div class="task-time">
                <el-icon size="14"><Clock /></el-icon>
                <span>{{ formatTime(task.createdAt) }}</span>
              </div>
            </div>
          </div>

          <div class="task-actions">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                size="small"
                :icon="View"
                circle
                @click.stop="handleTaskDetail(task)"
              />
            </el-tooltip>
            
            <el-dropdown 
              @command="(command: string) => handleTaskAction(task, command)"
              placement="bottom-end"
            >
              <el-button
                size="small"
                :icon="MoreFilled"
                circle
                @click.stop
              />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="process">
                    <el-icon><EditPen /></el-icon>
                    处理任务
                  </el-dropdown-item>
                  <el-dropdown-item command="assign" :disabled="!canAssign(task)">
                    <el-icon><Share /></el-icon>
                    分配给他人
                  </el-dropdown-item>
                  <el-dropdown-item command="defer">
                    <el-icon><Timer /></el-icon>
                    延期处理
                  </el-dropdown-item>
                  <el-dropdown-item command="mark-read" divided>
                    <el-icon><Check /></el-icon>
                    标记已读
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <!-- 查看更多 -->
      <div v-if="pendingTasks && pendingTasks.length > 0" class="tasks-footer">
        <el-button 
          text 
          type="primary"
          @click="handleViewAll"
          class="view-all-btn"
        >
          查看所有待办事项
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 任务处理对话框 -->
    <el-dialog
      v-model="taskDialogVisible"
      :title="`处理任务: ${selectedTask?.title}`"
      width="600px"
      :before-close="handleTaskDialogClose"
    >
      <div v-if="selectedTask" class="task-dialog-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务类型">
            {{ getTaskTypeName(selectedTask.type) }}
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getTaskTagType(selectedTask.type)" size="small">
              {{ getPriorityText(selectedTask.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="待处理数量">
            {{ selectedTask.count }}项
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDetailTime(selectedTask.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="taskDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleTaskProcess">
            前往处理
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { PendingTask } from '@/api/dashboard'
import {
  Refresh, CircleCheck, Tickets, Clock, View, MoreFilled,
  EditPen, Share, Timer, Check, ArrowRight, Document,
  User, Picture, ChatDotRound, WarningFilled, InfoFilled,
  SuccessFilled
} from '@element-plus/icons-vue'

// Props 定义
interface Props {
  pendingTasks?: PendingTask[]
  loading?: boolean
  error?: string | null
  maxDisplayCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  pendingTasks: () => [],
  loading: false,
  error: null,
  maxDisplayCount: 5
})

// Emits 定义
interface Emits {
  (e: 'refresh'): void
  (e: 'task-click', task: PendingTask): void
  (e: 'task-action', task: PendingTask, action: string): void
  (e: 'view-all'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()

// 响应式数据
const taskDialogVisible = ref(false)
const selectedTask = ref<PendingTask | null>(null)

// 计算属性
const totalTaskCount = computed(() => {
  if (!props.pendingTasks || props.pendingTasks.length === 0) return 0
  return props.pendingTasks.reduce((total, task) => total + task.count, 0)
})

// 任务类型映射
const taskTypeMap = {
  'content_audit': {
    name: '内容审核',
    icon: Document,
    route: '/dashboard/audit/center',
    tagType: 'warning'
  },
  'user_report': {
    name: '用户举报',
    icon: User,
    route: '/dashboard/system/alerts',
    tagType: 'danger'
  },
  'banner_approval': {
    name: 'Banner审批',
    icon: Picture,
    route: '/dashboard/banner/my-todo',
    tagType: 'primary'
  },
  'quotation_audit': {
    name: '名言审核',
    icon: ChatDotRound,
    route: '/dashboard/quotation/list',
    tagType: 'info'
  }
} as const

// 优先级映射
const priorityMap = {
  'high': {
    text: '高优先级',
    icon: WarningFilled,
    class: 'priority-high'
  },
  'medium': {
    text: '中优先级',
    icon: InfoFilled,
    class: 'priority-medium'
  },
  'low': {
    text: '低优先级',
    icon: SuccessFilled,
    class: 'priority-low'
  }
} as const

// 方法
const getBadgeType = (count: number) => {
  if (count === 0) return 'info'
  if (count < 5) return 'success'
  if (count < 10) return 'warning'
  return 'danger'
}

const getTaskIcon = (type: PendingTask['type']) => {
  return taskTypeMap[type]?.icon || Document
}

const getTaskTypeName = (type: PendingTask['type']) => {
  return taskTypeMap[type]?.name || '未知任务'
}

const getTaskTagType = (type: PendingTask['type']) => {
  return taskTypeMap[type]?.tagType || 'info'
}

const getPriorityClass = (priority: PendingTask['priority']) => {
  return `task-priority-${priority}`
}

const getPriorityIcon = (priority: PendingTask['priority']) => {
  return priorityMap[priority]?.icon || InfoFilled
}

const getPriorityText = (priority: PendingTask['priority']) => {
  return priorityMap[priority]?.text || '中优先级'
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

const formatDetailTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const canAssign = (task: PendingTask) => {
  // 根据任务类型和用户权限决定是否可以分配
  return task.type === 'content_audit' || task.type === 'user_report'
}

// 事件处理
const handleRefresh = () => {
  emit('refresh')
}

const handleTaskClick = (task: PendingTask) => {
  emit('task-click', task)
  
  // 跳转到对应的处理页面
  const route = taskTypeMap[task.type]?.route
  if (route) {
    router.push({
      path: route,
      query: { status: 'pending', type: task.type }
    })
  }
}

const handleTaskDetail = (task: PendingTask) => {
  selectedTask.value = task
  taskDialogVisible.value = true
}

const handleTaskAction = (task: PendingTask, action: string) => {
  emit('task-action', task, action)
  
  switch (action) {
    case 'process':
      handleTaskClick(task)
      break
    case 'assign':
      // TODO: 打开分配对话框
      break
    case 'defer':
      // TODO: 打开延期对话框
      break
    case 'mark-read':
      // TODO: 标记已读
      break
  }
}

const handleViewAll = () => {
  emit('view-all')
  router.push('/dashboard/audit/center')
}

const handleTaskDialogClose = () => {
  taskDialogVisible.value = false
  selectedTask.value = null
}

const handleTaskProcess = () => {
  if (selectedTask.value) {
    handleTaskClick(selectedTask.value)
    taskDialogVisible.value = false
  }
}
</script>

<style scoped>
.pending-tasks-card {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.pending-tasks-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-subtitle {
  display: block;
  line-height: 1.4;
}

.header-actions {
  flex-shrink: 0;
}

.tasks-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.tasks-loading, .tasks-error, .tasks-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tasks-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-xs) 0;
  max-height: 400px;
}

.task-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-medium);
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-card);
}

.task-item:hover {
  background: var(--color-bg-light);
  border-color: var(--color-primary);
  transform: translateX(4px);
  box-shadow: var(--shadow-card);
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-priority-high {
  border-left: 4px solid var(--color-danger);
}

.task-priority-medium {
  border-left: 4px solid var(--color-warning);
}

.task-priority-low {
  border-left: 4px solid var(--color-success);
}

.task-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  margin-right: var(--spacing-md);
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-type-tag {
  flex-shrink: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.task-meta > div {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.task-count {
  font-weight: 500;
}

.task-priority.priority-high {
  color: var(--color-danger);
}

.task-priority.priority-medium {
  color: var(--color-warning);
}

.task-priority.priority-low {
  color: var(--color-success);
}

.task-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.task-item:hover .task-actions {
  opacity: 1;
}

.tasks-footer {
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  justify-content: center;
}

.view-all-btn {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.task-dialog-content {
  margin-bottom: var(--spacing-lg);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-item {
    padding: var(--spacing-sm);
  }
  
  .task-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .task-actions {
    opacity: 1; /* 移动端始终显示操作按钮 */
  }
}

/* 滚动条样式 */
.tasks-list::-webkit-scrollbar {
  width: 4px;
}

.tasks-list::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 2px;
}

.tasks-list::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-dark);
}
</style>