<template>
  <el-card class="pending-audit-panel">
    <template #header>
      <div class="card-header">
        <span>待审核任务</span>
        <el-badge :value="tasks.length" class="badge" />
      </div>
    </template>

    <div class="filter-bar">
      <el-select v-model="selectedType" placeholder="业务类型" clearable size="small">
        <el-option label="全部" value="" />
        <el-option label="论坛内容" value="forum" />
        <el-option label="资讯内容" value="news" />
        <el-option label="商品信息" value="goods" />
        <el-option label="名言名句" value="quote" />
      </el-select>
      
      <el-select v-model="selectedPriority" placeholder="优先级" clearable size="small">
        <el-option label="高优先级" value="high" />
        <el-option label="中优先级" value="medium" />
        <el-option label="低优先级" value="low" />
      </el-select>
    </div>

    <div class="task-list">
      <div 
        v-for="task in filteredTasks" 
        :key="task.id" 
        class="task-item"
        :class="getPriorityClass(task.priority)"
      >
        <div class="task-info">
          <div class="task-title">{{ task.title }}</div>
          <div class="task-meta">
            <el-tag :type="getTypeColor(task.type)" size="small">{{ getTypeName(task.type) }}</el-tag>
            <el-tag :type="getPriorityColor(task.priority)" size="small">{{ getPriorityName(task.priority) }}</el-tag>
            <span class="task-time">{{ formatTime(task.createTime) }}</span>
          </div>
          <div class="task-description">{{ task.description || '无描述' }}</div>
        </div>
        
        <div class="task-actions">
          <el-button size="small" @click="$emit('view-detail', task)">详情</el-button>
          <el-button size="small" type="success" @click="handleApprove(task)">通过</el-button>
          <el-button size="small" type="danger" @click="handleReject(task)">拒绝</el-button>
          <el-button size="small" @click="$emit('assign', task)">分配</el-button>
        </div>
      </div>
    </div>

    <div v-if="filteredTasks.length === 0" class="empty-state">
      <el-empty description="暂无待审核任务" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface AuditTask {
  id: string
  title: string
  type: string
  priority: string
  createTime: string
  description?: string
  submitter: string
  content: any
}

const props = defineProps<{
  tasks: AuditTask[]
}>()

const emit = defineEmits<{
  audit: [taskId: string, action: 'approve' | 'reject', reason?: string]
  assign: [task: AuditTask]
  'view-detail': [task: AuditTask]
}>()

const selectedType = ref('')
const selectedPriority = ref('')

const filteredTasks = computed(() => {
  let result = props.tasks
  
  if (selectedType.value) {
    result = result.filter(task => task.type === selectedType.value)
  }
  
  if (selectedPriority.value) {
    result = result.filter(task => task.priority === selectedPriority.value)
  }
  
  return result
})

const handleApprove = async (task: AuditTask) => {
  try {
    await ElMessageBox.confirm('确认通过此审核任务吗？', '确认操作', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    emit('audit', task.id, 'approve')
  } catch {
    // 用户取消
  }
}

const handleReject = async (task: AuditTask) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝审核', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因...'
    })
    
    emit('audit', task.id, 'reject', reason)
  } catch {
    // 用户取消
  }
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    forum: 'primary',
    news: 'success',
    goods: 'warning',
    quote: 'info'
  }
  return colorMap[type] || 'info'
}

const getTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    forum: '论坛内容',
    news: '资讯内容', 
    goods: '商品信息',
    quote: '名言名句'
  }
  return nameMap[type] || type
}

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return colorMap[priority] || 'info'
}

const getPriorityName = (priority: string) => {
  const nameMap: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级'
  }
  return nameMap[priority] || priority
}

const getPriorityClass = (priority: string) => {
  return `priority-${priority}`
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.pending-audit-panel {
  height: 500px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.task-list {
  max-height: 350px;
  overflow-y: auto;
}

.task-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.task-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.task-item.priority-high {
  border-left: 4px solid #f56c6c;
}

.task-item.priority-medium {
  border-left: 4px solid #e6a23c;
}

.task-item.priority-low {
  border-left: 4px solid #909399;
}

.task-info {
  margin-bottom: 8px;
}

.task-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.task-time {
  color: #909399;
  font-size: 12px;
}

.task-description {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.task-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>