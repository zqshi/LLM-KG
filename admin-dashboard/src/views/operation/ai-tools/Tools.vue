<template>
  <div class="ai-tools-page">
    <UnifiedPageHeader 
      title="工具管理" 
      description="管理工具信息，支持工具的创建、编辑和状态管理"
    >
      <template #actions>
        <el-button @click="handleGoToTags">
          <el-icon><Collection /></el-icon>
          标签管理
        </el-button>
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新增工具
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 筛选区域 -->
    <el-card class="search-card">
      <div class="search-controls">
        <div class="search-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入工具名称"
            :prefix-icon="Search"
            clearable
            style="width: 260px"
            @clear="handleSearch"
          />
        </div>
        <div class="filter-group">
          <el-select
            v-model="queryParams.tagId"
            placeholder="请选择标签"
            clearable
            style="width: 160px"
            @clear="handleSearch"
          >
            <el-option
              v-for="tag in allTags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
            />
          </el-select>
          
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
            @clear="handleSearch"
          >
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
          
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 工具列表 -->
    <el-card class="table-card">
      <el-table 
        v-loading="toolsLoading"
        :data="tools" 
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="logo" label="Logo" width="80" align="center">
          <template #default="{ row }">
            <el-avatar
              :src="row.logo"
              :size="40"
              shape="square"
              :alt="row.name"
            >
              <el-icon><Picture /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="工具名称" min-width="150">
          <template #default="{ row }">
            <div class="tool-name">
              <span class="name">{{ row.name }}</span>
              <el-link 
                :href="row.url" 
                target="_blank" 
                type="primary" 
                :underline="false"
                class="tool-link"
              >
                <el-icon><Link /></el-icon>
              </el-link>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="tag" label="工具标签" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.tag" size="small" effect="light">
              {{ row.tag.name }}
            </el-tag>
            <span v-else class="text-gray">未分类</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="tool-description">{{ row.description }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'enabled'"
              :loading="statusChanging[row.id]"
              @change="(val) => handleStatusChange(row, val as boolean)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="caseCount" label="关联案例" width="100" align="center">
          <template #default="{ row }">
            <span class="case-count">{{ row.caseCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="creator" label="创建人" width="100" align="center">
          <template #default="{ row }">
            {{ row.creator || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="150" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              size="small" 
              :type="row.status === 'enabled' ? 'warning' : 'success'" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
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
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="toolsTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 工具表单弹窗 -->
    <ToolForm 
      v-model:visible="formVisible"
      :form-data="currentTool"
      :is-edit="isEdit"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Plus, Search, Refresh, Picture, Link, Collection } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useAIToolsStore } from '@/stores/aiTools'
import ToolForm from './components/ToolForm.vue'
import type { AITool, AIToolQueryParams } from '@/types/aiTools'

const aiToolsStore = useAIToolsStore()
const router = useRouter()

// 响应式数据
const formVisible = ref(false)
const isEdit = ref(false)
const currentTool = ref<Partial<AITool>>({})
const statusChanging = ref<Record<number, boolean>>({})

// 查询参数
const queryParams = reactive<AIToolQueryParams>({
  page: 1,
  pageSize: 20,
  keyword: '',
  tagId: undefined,
  status: undefined
})

// 计算属性 - 从 store 获取数据
const { tools, toolsTotal, toolsLoading, allTags } = storeToRefs(aiToolsStore)

// 格式化时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleDateString('zh-CN')
}

// 获取工具列表
const fetchToolList = async () => {
  // 过滤空值
  const filteredParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, value]) => value !== '' && value !== undefined)
  )
  
  // 确保基本的分页参数存在
  const params: AIToolQueryParams = {
    page: queryParams.page,
    pageSize: queryParams.pageSize,
    ...filteredParams
  } as AIToolQueryParams
  
  await aiToolsStore.fetchToolList(params)
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchToolList()
}

// 重置
const handleReset = () => {
  Object.assign(queryParams, {
    page: 1,
    pageSize: 20,
    keyword: '',
    tagId: undefined,
    status: undefined
  })
  fetchToolList()
}

// 分页处理
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.page = 1
  fetchToolList()
}

const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchToolList()
}

// 跳转到标签管理
const handleGoToTags = () => {
  router.push('/dashboard/operation/ai-tools/tags')
}

// 新增工具
const handleCreate = () => {
  currentTool.value = { status: 'enabled' }
  isEdit.value = false
  formVisible.value = true
}

// 编辑工具
const handleEdit = (row: AITool) => {
  currentTool.value = { ...row }
  isEdit.value = true
  formVisible.value = true
}

// 状态切换
const handleStatusChange = async (row: AITool, enabled: boolean) => {
  const newStatus = enabled ? 'enabled' : 'disabled'
  await handleToggleStatusInternal(row, newStatus)
}

const handleToggleStatus = async (row: AITool) => {
  const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  await handleToggleStatusInternal(row, newStatus)
}

const handleToggleStatusInternal = async (row: AITool, newStatus: 'enabled' | 'disabled') => {
  try {
    statusChanging.value[row.id] = true
    await aiToolsStore.changeToolStatus(row.id, newStatus)
    fetchToolList() // 刷新列表
  } catch (error) {
    console.error('切换状态失败:', error)
  } finally {
    statusChanging.value[row.id] = false
  }
}

// 删除工具
const handleDelete = async (row: AITool) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除工具"${row.name}"吗？删除后将解除所有关联案例的关系。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await aiToolsStore.removeTool(row.id)
    fetchToolList() // 刷新列表
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除工具失败:', error)
    }
  }
}

// 表单提交成功回调
const handleFormSuccess = () => {
  formVisible.value = false
  fetchToolList() // 刷新列表
}

// 页面初始化
onMounted(async () => {
  await aiToolsStore.fetchAllTags() // 获取标签选项
  fetchToolList() // 获取工具列表
})
</script>

<script lang="ts">
export default {
  name: 'AITools'
}
</script>

<style scoped lang="scss">
.ai-tools-page {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;

  .search-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-group {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.table-card {
  .tool-name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-name .name {
    font-weight: 500;
  }

  .tool-link {
    font-size: 14px;
  }

  .tool-description {
    color: var(--el-text-color-secondary);
    line-height: 1.4;
  }

  .case-count {
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  .text-gray {
    color: var(--el-text-color-placeholder);
  }

  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}

.el-avatar {
  border: 1px solid var(--el-border-color-light);
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch !important;
  }

  .filter-group {
    flex-wrap: wrap;
  }
}
</style>