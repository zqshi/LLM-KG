<template>
  <div class="recommendations-page">
    <UnifiedPageHeader 
      title="推荐管理" 
      description="管理推荐内容，设置推荐位和优先级"
    >
      <template #actions>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加推荐
        </el-button>
      </template>
    </UnifiedPageHeader>

    <div class="page-content">
      <el-table :data="recommendationList" style="width: 100%">
        <el-table-column prop="title" label="推荐内容" min-width="200" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="position" label="推荐位" width="120" />
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityColor(row.priority)" size="small">
              {{ getPriorityName(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="validTime" label="有效期" width="180">
          <template #default="{ row }">
            {{ row.startTime }} ~ {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

const recommendationList = ref([
  {
    id: 1,
    title: '如何提高团队协作效率',
    type: 'article',
    position: '首页推荐',
    priority: 'high',
    startTime: '2024-01-01',
    endTime: '2024-02-01',
    status: 'active'
  }
])

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    article: '文章',
    post: '帖子'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    article: 'primary',
    post: 'success'
  }
  return colorMap[type] || 'info'
}

const getPriorityName = (priority: string) => {
  const priorityMap: Record<string, string> = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return priorityMap[priority] || priority
}

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  }
  return colorMap[priority] || 'info'
}

const handleAdd = () => {
  ElMessage.info('添加推荐功能开发中...')
}

const handleEdit = (row: any) => {
  ElMessage.info('编辑推荐功能开发中...')
}

const handleDelete = (row: any) => {
  ElMessage.info('删除推荐功能开发中...')
}
</script>

<style scoped lang="scss">
@import '@/styles/operation-styles.scss';

.recommendations-page {
  padding: var(--spacing-xl);
}

.page-content {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
  padding: var(--spacing-xl);
  transition: all var(--transition-medium);

  &:hover {
    box-shadow: var(--shadow-card-hover);
  }
}

// 表格样式优化
::v-deep(.el-table) {
  border-radius: var(--radius-lg);
  overflow: hidden;

  .el-table__header-wrapper {
    th {
      background-color: var(--color-bg-elevated);
      color: var(--color-text-primary);
      font-weight: var(--font-weight-medium);
      border-bottom: 1px solid var(--color-border-light);
    }
  }

  .el-table__body-wrapper {
    tr:hover {
      > td {
        background-color: var(--color-bg-section) !important;
      }
    }

    td {
      border-bottom: 1px solid var(--color-border-lighter);
    }
  }
}

// 按钮样式优化
::v-deep(.el-button) {
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  &:active {
    transform: translateY(0);
  }
}

// 标签样式优化
::v-deep(.el-tag) {
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);

  &.el-tag--primary {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary-dark);
  }

  &.el-tag--success {
    background-color: var(--color-success-light);
    border-color: var(--color-success);
    color: var(--color-success-dark);
  }

  &.el-tag--warning {
    background-color: var(--color-warning-light);
    border-color: var(--color-warning);
    color: var(--color-warning-dark);
  }

  &.el-tag--danger {
    background-color: var(--color-danger-light);
    border-color: var(--color-danger);
    color: var(--color-danger-dark);
  }

  &.el-tag--info {
    background-color: var(--color-info-light);
    border-color: var(--color-info);
    color: var(--color-info-dark);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .recommendations-page {
    padding: var(--spacing-md);
  }

  .page-content {
    padding: var(--spacing-lg);
  }

  ::v-deep(.el-table) {
    font-size: var(--text-xs);

    .el-table__cell {
      padding: var(--spacing-xs) var(--spacing-sm);
    }
  }
}
</style>