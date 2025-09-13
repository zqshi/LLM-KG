<template>
  <div class="content-list">
    <UnifiedPageHeader 
      title="内容管理" 
      description="管理所有内容，包括文章、帖子、资讯等"
    >
      <template #actions>
        <el-button @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新列表
        </el-button>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增内容
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 筛选区域 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" label-width="80px" inline>
        <el-form-item label="关键词">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="标题或内容关键词" 
            clearable 
            @keyup.enter="reload"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="queryParams.category" placeholder="请选择分类" clearable>
            <el-option label="全部分类" value="" />
            <el-option 
              v-for="category in categoryOptions" 
              :key="category.value" 
              :label="category.label" 
              :value="category.value" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="全部状态" :value="''" />
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="待审核" :value="2" />
            <el-option label="已拒绝" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="请选择类型" clearable>
            <el-option label="全部类型" value="" />
            <el-option label="文章" value="article" />
            <el-option label="帖子" value="post" />
            <el-option label="资讯" value="news" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="reload">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 内容列表 -->
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>内容列表</span>
          <div class="header-actions">
            <el-button 
              type="danger" 
              :disabled="!hasSelected" 
              @click="batchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <el-table 
        :data="contentList" 
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <el-tag 
                :type="getTypeTagType(row.type)" 
                size="small"
                class="type-tag"
              >
                {{ getTypeName(row.type) }}
              </el-tag>
              <span class="title-text" @click="previewDetail(row)">{{ row.title }}</span>
              <el-tag v-if="row.isTop" type="warning" size="small" effect="dark">置顶</el-tag>
              <el-tag v-if="row.isElite" type="success" size="small" effect="dark">精华</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="author.name" label="作者" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ getStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据统计" width="150">
          <template #default="{ row }">
            <div class="stats-cell">
              <span class="stat-item">
                <el-icon><View /></el-icon>
                {{ row.viewCount }}
              </span>
              <span class="stat-item">
                <el-icon><Star /></el-icon>
                {{ row.likeCount }}
              </span>
              <span class="stat-item">
                <el-icon><ChatDotRound /></el-icon>
                {{ row.commentCount }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              link 
              type="primary" 
              size="small" 
              @click="previewDetail(row)"
            >
              查看
            </el-button>
            <el-button 
              link 
              type="primary" 
              size="small" 
              @click="editContent(row)"
              v-if="canEdit(row)"
            >
              编辑
            </el-button>
            <el-dropdown @command="(cmd) => handleAction(cmd, row)">
              <el-button link type="primary" size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item 
                    command="top" 
                    :icon="row.isTop ? Close : Top"
                  >
                    {{ row.isTop ? '取消置顶' : '置顶' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="elite" 
                    :icon="row.isElite ? Close : Star"
                  >
                    {{ row.isElite ? '取消精华' : '设为精华' }}
                  </el-dropdown-item>
                  <el-dropdown-item 
                    command="delete" 
                    icon="Delete" 
                    divided
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="reload"
          @current-change="reload"
        />
      </div>
    </el-card>

    <!-- 创建内容对话框 -->
    <CreatePostDialog 
      v-model="showCreateDialog" 
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import CreatePostDialog from './CreatePostDialog.vue'
import { useContentStore } from '@/stores/content'
import { useAuthStore } from '@/stores/auth'
import type { Content } from '@/types'
import {
  Plus, Refresh, View, Star, ChatDotRound, 
  ArrowDown, Top, Close, Delete
} from '@element-plus/icons-vue'

const router = useRouter()
const contentStore = useContentStore()
const authStore = useAuthStore()
const { contentList, loading, pagination, queryParams } = storeToRefs(contentStore)

const showCreateDialog = ref(false)
const selectedContents = ref<Content[]>([])

// 分类选项 - 这里应该从API获取实际数据
const categoryOptions = computed(() => [
  { label: '技术分享', value: 'tech' },
  { label: '生活分享', value: 'life' },
  { label: '工作交流', value: 'work' }
])

// 计算属性
const hasSelected = computed(() => selectedContents.value.length > 0)

// 方法
const reload = async () => {
  await contentStore.loadContentList()
}

const refreshList = async () => {
  await reload()
  ElMessage.success('列表刷新成功')
}

const reset = () => {
  contentStore.resetQueryParams()
  reload()
}

const handleSelectionChange = (selection: Content[]) => {
  selectedContents.value = selection
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    'article': '文章',
    'post': '帖子',
    'news': '资讯',
    'poll': '投票'
  }
  return typeMap[type] || type
}

const getTypeTagType = (type: string) => {
  const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    'article': 'primary',
    'post': 'success',
    'news': 'warning',
    'poll': 'info'
  }
  return typeMap[type] || 'info'
}

const getStatusName = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '已发布',
    2: '待审核',
    3: '已拒绝'
  }
  return statusMap[status] || `状态${status}`
}

const getStatusTagType = (status: number) => {
  const statusMap: Record<number, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return statusMap[status] || 'info'
}

const canEdit = (row: Content) => {
  return authStore.hasPermission('content:edit') || 
         row.author?.id === authStore.currentUser?.id
}

const previewDetail = (row: Content) => {
  router.push({ name: 'ContentDetail', params: { id: row.id } })
}

const editContent = (row: Content) => {
  router.push({ name: 'ContentEdit', params: { id: row.id } })
}

const handleAction = async (cmd: string, row: Content) => {
  switch (cmd) {
    case 'top':
      await contentStore.setTop(row.id, !row.isTop)
      reload()
      break
    case 'elite':
      await contentStore.setElite(row.id, !row.isElite)
      reload()
      break
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除内容「${row.title}」吗？此操作不可恢复！`,
        '删除确认',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'error'
        }
      ).then(async () => {
        await contentStore.deleteContent(row.id)
        reload()
      }).catch(() => {
        ElMessage.info('已取消删除')
      })
      break
  }
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedContents.value.length} 个内容吗？此操作不可恢复！`,
    '批量删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(async () => {
    const ids = selectedContents.value.map(item => item.id)
    // 这里应该调用批量删除API
    ElMessage.success('批量删除成功')
    reload()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

const handleCreateSuccess = () => {
  showCreateDialog.value = false
  reload()
}

// 生命周期
onMounted(() => {
  reload()
})
</script>

<style scoped>
.content-list {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  cursor: pointer;
  color: var(--el-color-primary);
}

.title-text:hover {
  text-decoration: underline;
}

.type-tag {
  flex-shrink: 0;
}

.stats-cell {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-color-info);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>