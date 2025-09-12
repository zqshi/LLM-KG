<template>
  <div class="case-selector">
    <!-- 关联案例按钮 -->
    <div class="case-header">
      <el-button type="primary" @click="showSelector = true">
        <el-icon><Link /></el-icon>
        关联案例
      </el-button>
    </div>

    <!-- 已关联案例列表 -->
    <div v-if="currentToolCases.length > 0" class="case-list">
      <h4 class="case-list-title">已关联案例</h4>
      <el-table :data="currentToolCases" style="width: 100%">
        <el-table-column prop="postId" label="帖子ID" width="100" align="center" />
        
        <el-table-column prop="postTitle" label="帖子标题" min-width="200">
          <template #default="{ row }">
            <el-link 
              type="primary" 
              :underline="false"
              @click="previewPost(row)"
            >
              {{ row.postTitle }}
            </el-link>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="danger" 
              @click="handleRemoveCase(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-else class="no-cases">
      <el-empty 
        description="暂无关联案例"
        :image-size="80"
      />
    </div>

    <!-- 案例选择弹窗 -->
    <el-dialog
      v-model="showSelector"
      title="关联热门案例"
      width="800px"
      :close-on-click-modal="false"
    >
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchParams" :inline="true">
          <el-form-item label="选择版块">
            <el-select
              v-model="searchParams.categoryId"
              placeholder="请选择版块"
              clearable
              style="width: 200px"
              @change="handleCategoryChange"
            >
              <el-option
                v-for="category in forumCategories"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="搜索帖子">
            <el-input
              v-model="searchParams.keyword"
              placeholder="输入帖子标题或ID"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button 
              type="primary" 
              :loading="forumPostsLoading"
              @click="handleSearch"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 搜索结果 -->
      <div class="search-results">
        <el-table 
          v-loading="forumPostsLoading"
          :data="forumPosts" 
          style="width: 100%"
          max-height="400"
        >
          <el-table-column prop="id" label="帖子ID" width="100" align="center" />
          
          <el-table-column prop="title" label="帖子标题" min-width="200" show-overflow-tooltip />
          
          <el-table-column prop="author" label="发布人" width="120" align="center" />
          
          <el-table-column prop="createTime" label="发布时间" width="150" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="viewCount" label="浏览量" width="100" align="center">
            <template #default="{ row }">
              {{ row.viewCount || '-' }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="100" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="primary"
                :disabled="isAlreadyAssociated(row.id)"
                @click="handleAssociateCase(row)"
              >
                {{ isAlreadyAssociated(row.id) ? '已关联' : '选择' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div v-if="forumPostsTotal > 0" class="pagination-container">
          <el-pagination
            v-model:current-page="searchParams.page"
            v-model:page-size="searchParams.pageSize"
            :total="forumPostsTotal"
            :page-sizes="[10, 20, 50]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>

        <!-- 无数据提示 -->
        <div v-if="!forumPostsLoading && forumPosts.length === 0 && searchParams.categoryId" class="no-results">
          <el-empty 
            description="未找到相关帖子，请尝试其他搜索条件"
            :image-size="60"
          />
        </div>
      </div>

      <template #footer>
        <el-button @click="showSelector = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Link, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAIToolsStore } from '@/stores/aiTools'
import type { ForumPost, ForumPostQueryParams } from '@/types/aiTools'

interface Props {
  toolId: number
}

const props = defineProps<Props>()

const aiToolsStore = useAIToolsStore()
const showSelector = ref(false)

// 搜索参数
const searchParams = reactive<ForumPostQueryParams>({
  page: 1,
  pageSize: 20,
  keyword: '',
  categoryId: undefined
})

// 计算属性 - 从 store 获取数据
const { 
  forumPosts, 
  forumPostsTotal, 
  forumPostsLoading, 
  forumCategories,
  currentToolCases
} = storeToRefs(aiToolsStore)

// 已关联案例的帖子ID集合
const associatedPostIds = computed(() => 
  new Set(currentToolCases.value.map(item => item.postId))
)

// 格式化时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleDateString('zh-CN')
}

// 检查是否已经关联
const isAlreadyAssociated = (postId: number) => {
  return associatedPostIds.value.has(postId)
}

// 版块变化处理
const handleCategoryChange = () => {
  searchParams.page = 1
  if (searchParams.categoryId) {
    handleSearch()
  } else {
    aiToolsStore.resetForumPosts()
  }
}

// 搜索
const handleSearch = () => {
  if (!searchParams.categoryId) {
    ElMessage.warning('请先选择版块')
    return
  }
  
  searchParams.page = 1
  aiToolsStore.searchPosts(searchParams)
}

// 分页处理
const handleSizeChange = (size: number) => {
  searchParams.pageSize = size
  searchParams.page = 1
  handleSearch()
}

const handleCurrentChange = (page: number) => {
  searchParams.page = page
  handleSearch()
}

// 关联案例
const handleAssociateCase = async (post: ForumPost) => {
  try {
    await aiToolsStore.associateToolCase({
      toolId: props.toolId,
      postId: post.id,
      postTitle: post.title
    })
    
    // 刷新当前工具的案例列表
    await aiToolsStore.fetchToolCases(props.toolId)
    
  } catch (error) {
    console.error('关联案例失败:', error)
  }
}

// 移除案例
const handleRemoveCase = async (caseItem: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除案例"${caseItem.postTitle}"吗？`,
      '移除确认',
      {
        confirmButtonText: '确定移除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await aiToolsStore.removeToolCase(props.toolId, caseItem.postId)
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除案例失败:', error)
    }
  }
}

// 预览帖子（可扩展）
const previewPost = (caseItem: any) => {
  ElMessage.info(`预览帖子: ${caseItem.postTitle}`)
  // 这里可以实现帖子预览功能
}

// 组件初始化
onMounted(async () => {
  // 获取论坛版块
  await aiToolsStore.fetchForumCategories()
  
  // 获取工具的关联案例
  if (props.toolId) {
    await aiToolsStore.fetchToolCases(props.toolId)
  }
})
</script>

<script lang="ts">
export default {
  name: 'CaseSelector'
}
</script>

<style scoped>
.case-selector {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.case-header {
  margin-bottom: 16px;
}

.case-list-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #1f2937;
}

.case-list {
  margin-top: 20px;
}

.no-cases {
  text-align: center;
  padding: 40px 0;
}

.search-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.search-results {
  min-height: 200px;
}

.no-results {
  text-align: center;
  padding: 40px 0;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.el-table :deep(.el-table__header-wrapper) {
  th {
    font-weight: 600;
  }
}
</style>