<template>
  <div class="ai-tool-tags-page">
    <!-- 页面头部 -->
    <UnifiedPageHeader 
      title="工具标签管理"
      description="管理AI工具的分类标签，为工具提供标准化分类"
    >
      <template #actions>
        <el-button @click="handleGoToTools">
          <el-icon><Box /></el-icon>
          工具管理
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增标签
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 标签统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ tags.length }}</div>
              <div class="stats-label">总标签数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon active">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ tags.reduce((sum, tag) => sum + (tag.toolCount || 0), 0) }}</div>
              <div class="stats-label">关联工具数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon popular">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ Math.max(...tags.map(tag => tag.toolCount || 0), 0) }}</div>
              <div class="stats-label">最高使用量</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon recent">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ tags.filter(tag => isRecentlyCreated(tag.createTime)).length }}</div>
              <div class="stats-label">本周新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 主内容区域 -->
    <el-card class="table-card">
      <!-- 标签列表 -->
      <el-table 
        v-loading="tagsLoading"
        :data="tags" 
        style="width: 100%"
        :header-cell-style="{ background: '#fafafa' }"
      >
        <el-table-column prop="id" label="标签ID" width="100" align="center" />
        
        <el-table-column prop="name" label="标签名称" min-width="200">
          <template #default="{ row }">
            <el-tag size="large" effect="light">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="toolCount" label="使用量" width="120" align="center">
          <template #default="{ row }">
            <span class="tool-count">{{ row.toolCount || 0 }} 个工具</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="tagsTotal"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 标签表单弹窗 -->
    <TagForm 
      v-model:visible="formVisible"
      :form-data="currentTag"
      :is-edit="isEdit"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Plus, Box, Collection, TrendCharts, Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useAIToolsStore } from '@/stores/aiTools'
import TagForm from './components/TagForm.vue'
import type { AIToolTag, AIToolTagQueryParams } from '@/types/aiTools'

const aiToolsStore = useAIToolsStore()
const router = useRouter()

// 响应式数据
const formVisible = ref(false)
const isEdit = ref(false)
const currentTag = ref<Partial<AIToolTag>>({})

// 查询参数
const queryParams = reactive<AIToolTagQueryParams>({
  page: 1,
  pageSize: 20
})

// 计算属性 - 从 store 获取数据
const { tags, tagsTotal, tagsLoading } = storeToRefs(aiToolsStore)

// 格式化时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

// 获取标签列表
const fetchTagList = async () => {
  await aiToolsStore.fetchTagList(queryParams)
}

// 分页处理
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchTagList()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchTagList()
}

// 跳转到工具管理
const handleGoToTools = () => {
  router.push('/operation/ai-tools/tools')
}

// 新增标签
const handleCreate = () => {
  currentTag.value = {}
  isEdit.value = false
  formVisible.value = true
}

// 编辑标签
const handleEdit = (row: AIToolTag) => {
  currentTag.value = { ...row }
  isEdit.value = true
  formVisible.value = true
}

// 删除标签
const handleDelete = async (row: AIToolTag) => {
  try {
    // 先检查是否可以删除
    const checkResult = await aiToolsStore.checkTagDeletion(row.id)
    
    if (checkResult && !checkResult.canDelete) {
      ElMessageBox.alert(
        checkResult.message || '此标签已被工具使用，无法删除',
        '无法删除',
        {
          confirmButtonText: '确定',
          type: 'warning'
        }
      )
      return
    }
    
    // 确认删除
    await ElMessageBox.confirm(
      `确定要删除标签"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await aiToolsStore.removeTag(row.id)
    fetchTagList() // 刷新列表
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error)
    }
  }
}

// 表单提交成功回调
const handleFormSuccess = () => {
  formVisible.value = false
  fetchTagList() // 刷新列表
}

// 检查是否是最近创建的（7天内）
const isRecentlyCreated = (createTime: string) => {
  if (!createTime) return false
  const created = new Date(createTime)
  const now = new Date()
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

// 页面初始化
onMounted(() => {
  fetchTagList()
})
</script>

<script lang="ts">
export default {
  name: 'AIToolTags'
}
</script>

<style scoped>
.ai-tool-tags-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stats-content {
    display: flex;
    align-items: center;
    min-height: 80px;
    position: relative;
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
    font-size: 20px;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.active {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.popular {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.recent {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .stats-info {
    flex: 1;
    overflow: hidden;
  }

  .stats-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .stats-label {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 4px;
  }
}

.table-card {
  .pagination-container {
    margin-top: 20px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 16px;
  }

  .stats-content {
    gap: 12px;
  }

  .stats-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .stats-value {
    font-size: 20px;
  }

  .stats-label {
    font-size: 12px;
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 12px;
  }
}

.tool-count {
  color: #6b7280;
  font-size: 13px;
}

.el-table :deep(.el-table__header-wrapper) {
  th {
    font-weight: 600;
  }
}

.el-table :deep(.el-table__header-wrapper) {
  th {
    font-weight: 600;
  }
}
</style>