<template>
  <div class="content-detail">
    <UnifiedPageHeader 
      title="内容详情" 
      description="查看内容的详细信息和状态"
    >
      <template #actions>
        <el-button @click="$router.go(-1)">返回</el-button>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
        <el-button @click="handleDelete">删除</el-button>
      </template>
    </UnifiedPageHeader>

    <el-card class="detail-card" v-loading="loading">
      <div v-if="content">
        <h1 class="content-title">{{ content.title }}</h1>
        <div class="content-meta">
          <el-tag>{{ content.category }}</el-tag>
          <span class="meta-item">作者：{{ content.author }}</span>
          <span class="meta-item">发布时间：{{ content.publishTime }}</span>
        </div>
        <div class="content-body" v-html="content.body"></div>
      </div>
      <el-empty v-else description="内容不存在" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const content = ref<any>(null)

// 模拟数据
const mockContent = {
  id: route.params.id,
  title: '示例内容标题',
  category: '技术文章',
  author: '张三',
  publishTime: '2024-01-15 10:30:00',
  body: '<p>这是一个示例内容的正文内容...</p>'
}

onMounted(() => {
  loadContent()
})

const loadContent = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    content.value = mockContent
    loading.value = false
  }, 500)
}

const handleEdit = () => {
  ElMessage.info('编辑功能待实现')
}

const handleDelete = () => {
  ElMessage.info('删除功能待实现')
}
</script>

<style scoped>
.content-detail {
  padding: 20px;
}

.detail-card {
  margin-top: 20px;
}

.content-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.meta-item {
  font-size: 14px;
}

.content-body {
  line-height: 1.8;
  font-size: 16px;
}
</style>