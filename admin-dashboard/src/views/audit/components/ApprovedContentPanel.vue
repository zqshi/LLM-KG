<template>
  <el-card class="approved-content-panel">
    <template #header>
      <div class="card-header">
        <span>已通过内容</span>
        <el-badge :value="content.length" class="badge" type="success" />
      </div>
    </template>

    <div class="content-list">
      <div 
        v-for="item in content" 
        :key="item.id" 
        class="content-item"
      >
        <div class="content-info">
          <div class="content-title">{{ item.title }}</div>
          <div class="content-meta">
            <el-tag :type="getTypeColor(item.type)" size="small">{{ getTypeName(item.type) }}</el-tag>
            <span class="content-author">{{ item.author }}</span>
            <span class="content-time">{{ formatTime(item.approveTime) }}</span>
          </div>
          <div class="content-status">
            <el-tag 
              v-if="item.publishStatus === 'published'" 
              type="success" 
              size="small"
            >
              已发布
            </el-tag>
            <el-tag 
              v-else-if="item.publishStatus === 'scheduled'" 
              type="warning" 
              size="small"
            >
              定时发布
            </el-tag>
            <el-tag 
              v-else 
              type="info" 
              size="small"
            >
              待发布
            </el-tag>
          </div>
        </div>
        
        <div class="content-actions">
          <el-button 
            v-if="item.publishStatus === 'approved'"
            size="small" 
            type="primary" 
            @click="$emit('publish', item.id)"
          >
            立即发布
          </el-button>
          <el-button 
            v-if="item.publishStatus === 'approved'"
            size="small" 
            @click="$emit('schedule', item)"
          >
            定时发布
          </el-button>
          <el-button size="small" @click="handleViewContent(item)">预览</el-button>
        </div>
      </div>
    </div>

    <div v-if="content.length === 0" class="empty-state">
      <el-empty description="暂无已通过内容" />
    </div>
  </el-card>
</template>

<script setup lang="ts">
interface ApprovedContent {
  id: string
  title: string
  type: string
  author: string
  approveTime: string
  publishStatus: 'approved' | 'published' | 'scheduled'
  content: any
}

const props = defineProps<{
  content: ApprovedContent[]
}>()

const emit = defineEmits<{
  publish: [contentId: string]
  schedule: [content: ApprovedContent]
}>()

const handleViewContent = (item: ApprovedContent) => {
  // TODO: 预览内容
  console.log('预览内容:', item)
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

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.approved-content-panel {
  height: 500px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-list {
  max-height: 430px;
  overflow-y: auto;
}

.content-item {
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
  border-left: 4px solid #67c23a;
  transition: all 0.3s ease;
}

.content-item:hover {
  border-color: #67c23a;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.1);
}

.content-info {
  margin-bottom: 8px;
}

.content-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.content-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.content-author {
  color: #606266;
  font-size: 13px;
}

.content-time {
  color: #909399;
  font-size: 12px;
}

.content-status {
  margin-top: 4px;
}

.content-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}
</style>