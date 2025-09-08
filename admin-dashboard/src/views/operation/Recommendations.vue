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

<style scoped>
.recommendations-page {
  padding: 20px;
}

.page-content {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
</style>