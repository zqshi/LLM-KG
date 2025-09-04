<template>
  <div class="content-list-page">
    <div class="page-header">
      <h1 class="page-title">统一内容列表</h1>
      <div class="page-actions">
        <el-button type="primary" @click="createContent">
          <el-icon><Plus /></el-icon>
          创建内容
        </el-button>
        <el-button @click="handleExport" :loading="exportLoading">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 高级筛选表单 -->
    <el-card class="filter-card" shadow="never">
      <div class="filter-header">
        <span class="filter-title">高级筛选</span>
        <el-button 
          type="text" 
          @click="toggleFilterCollapse"
          class="collapse-btn"
        >
          {{ filterCollapsed ? '展开筛选' : '收起筛选' }}
          <el-icon><component :is="filterCollapsed ? 'ArrowDown' : 'ArrowUp'" /></el-icon>
        </el-button>
      </div>
      
      <el-collapse-transition>
        <div v-show="!filterCollapsed" class="filter-content">
          <el-form :model="queryParams" :inline="true" @submit.prevent="handleSearch">
            <el-form-item label="关键词">
              <el-input
                v-model="queryParams.keyword"
                placeholder="搜索标题或正文"
                clearable
                style="width: 200px"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
            
            <el-form-item label="内容板块">
              <el-select
                v-model="queryParams.module"
                placeholder="请选择板块"
                clearable
                style="width: 150px"
                @change="handleModuleChange"
              >
                <el-option label="全部" value="" />
                <el-option label="知识库" value="knowledge" />
                <el-option label="论坛" value="forum" />
                <el-option label="资讯" value="news" />
                <el-option label="跳蚤市场" value="flea-market" />
                <el-option label="运营内容" value="operation" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="内容类型">
              <el-select
                v-model="queryParams.type"
                placeholder="请选择类型"
                clearable
                style="width: 120px"
              >
                <el-option label="全部" value="" />
                <el-option label="文章" value="article" />
                <el-option label="帖子" value="post" />
                <el-option label="评论" value="comment" />
                <el-option label="资讯" value="news" />
                <el-option label="商品" value="goods" />
                <el-option label="名言" value="quote" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="版块分类">
              <el-select
                v-model="queryParams.category"
                placeholder="请选择版块"
                clearable
                style="width: 150px"
              >
                <el-option
                  v-for="category in filteredCategories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.name"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="状态">
              <el-select
                v-model="queryParams.status"
                placeholder="请选择状态"
                clearable
                style="width: 120px"
              >

                <el-option label="待审核" :value="1" />
                <el-option label="已发布" :value="2" />
                <el-option label="已拒绝" :value="3" />
                <el-option label="已删除" :value="4" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="作者">
              <el-input
                v-model="queryParams.author"
                placeholder="请输入作者"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            
            <el-form-item label="发布时间">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 240px"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSearch" :loading="loading">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 当前筛选条件显示 -->
          <div v-if="hasActiveFilters" class="active-filters">
            <span class="filter-label">当前筛选条件：</span>
            <el-tag
              v-for="filter in activeFilters"
              :key="filter.key"
              closable
              @close="removeFilter(filter.key)"
              class="filter-tag"
            >
              {{ filter.label }}: {{ filter.value }}
            </el-tag>
            <el-tag v-if="fromCategory" type="info" class="filter-tag">来源：版块页面</el-tag>
          </div>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 数据统计行 -->
    <div class="stats-bar">
      <el-row :gutter="16">
        <el-col :span="4">
          <div class="stat-item">
            <div class="stat-number">{{ contentStats.total || 0 }}</div>
            <div class="stat-label">内容总数</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item pending" @click="quickFilter('status', 1)">
            <div class="stat-number">{{ contentStats.pending || 0 }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item" @click="quickFilter('status', 2)">
            <div class="stat-number">{{ contentStats.thisWeek || 0 }}</div>
            <div class="stat-label">本周发布</div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="stat-item" @click="quickFilter('isTop', true)">
            <div class="stat-number">{{ topContentCount }}</div>
            <div class="stat-label">置顶内容</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 内容表格 -->
    <el-card class="table-card" shadow="never">
      <div class="table-operations">
        <div class="table-operations-left">
          <el-checkbox
            v-model="selectAll"
            @change="handleSelectAll"
            :indeterminate="indeterminate"
          >
            全选
          </el-checkbox>
          <el-dropdown @command="handleBatchAction" :disabled="!hasSelected">
            <el-button :disabled="!hasSelected">
              批量操作<el-icon><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="publish">批量通过审核</el-dropdown-item>
                <el-dropdown-item command="reject">批量拒绝</el-dropdown-item>
                <el-dropdown-item command="top">批量置顶</el-dropdown-item>
                <el-dropdown-item command="elite">批量设精华</el-dropdown-item>
                <el-dropdown-item command="move">批量移动版块</el-dropdown-item>
                <el-dropdown-item command="lock" divided>批量锁定</el-dropdown-item>
                <el-dropdown-item command="delete">批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        
        <div class="table-operations-right">
          <el-input
            v-model="quickSearch"
            placeholder="快速搜索标题..."
            clearable
            style="width: 200px; margin-right: 10px"
            @input="handleQuickSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <span class="total-count">共 {{ pagination.total }} 条记录</span>
        </div>
      </div>

      <el-table
        :data="contentList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="title" label="标题/摘要" min-width="300">
          <template #default="{ row }">
            <div class="content-title">
              <div class="title-main">
                <el-link 
                  type="primary" 
                  @click="previewContent(row)"
                  class="title-link"
                >
                  {{ row.title }}
                </el-link>
                <div class="title-tags">
                  <el-tag v-if="row.isTop" type="danger" size="small">置顶</el-tag>
                  <el-tag v-if="row.isElite" type="warning" size="small">精华</el-tag>
                  <el-tag v-if="row.isLocked" type="info" size="small">锁定</el-tag>
                </div>
              </div>
              <div class="title-meta">
                <el-tag :type="getContentTypeColor(row.type)" size="small">
                  {{ getContentTypeName(row.type) }}
                </el-tag>
                <span class="meta-separator">|</span>
                <el-tag :type="getModuleColor(row.module)" size="small">
                  {{ getModuleName(row.module) }}
                </el-tag>
                <span class="meta-separator">|</span>
                <span class="category">{{ row.category }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="所属版块" width="180">
          <template #default="{ row }">
            <el-tag :type="getModuleColor(row.module)" size="small">
              {{ getModuleName(row.module) }}
            </el-tag>
            <span class="meta-separator">/</span>
            <span class="category">{{ row.category }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="author" label="作者" width="140">
          <template #default="{ row }">
            <div class="author-info">
              <el-avatar :size="28" :src="row.author.avatar">
                {{ row.author.name.charAt(0) }}
              </el-avatar>
              <div class="author-details">
                <div class="author-name">{{ row.author.name }}</div>
                <div class="author-dept">{{ row.author.group?.name || '未知部门' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusColor(row.status)" size="small">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="数据统计" width="120">
          <template #default="{ row }">
            <div class="content-stats">
              <div class="stat-row">
                <el-icon><View /></el-icon>
                <span>{{ row.viewCount }}</span>
              </div>
              <div class="stat-row">
                <el-icon><Star /></el-icon>
                <span>{{ row.likeCount }}</span>
              </div>
              <div class="stat-row">
                <el-icon><ChatDotRound /></el-icon>
                <span>{{ row.commentCount }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="publishedAt" label="发布时间" width="160">
          <template #default="{ row }">
            {{ row.publishedAt ? formatDateTime(row.publishedAt) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="table-actions">
              <el-button size="small" type="primary" @click="previewContent(row)">
                预览
              </el-button>
              <el-dropdown @command="(command) => handleRowAction(command, row)">
                <el-button size="small">
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit" v-if="canEdit(row)">编辑</el-dropdown-item>
                    <el-dropdown-item command="audit" v-if="canAudit(row)">审核</el-dropdown-item>
                    <el-dropdown-item command="top">
                      {{ row.isTop ? '取消置顶' : '置顶' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="elite">
                      {{ row.isElite ? '取消精华' : '设为精华' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="lock">
                      {{ row.isLocked ? '解锁' : '锁定' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="move">移动版块</el-dropdown-item>
                    <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 内容预览抽屉 -->
    <el-drawer
      v-model="previewDrawerVisible"
      title="内容预览"
      size="50%"
      :before-close="closePreview"
    >
      <div v-if="currentPreview" class="preview-container">
        <!-- 预览头部 -->
        <div class="preview-header">
          <h2 class="preview-title">{{ currentPreview.title }}</h2>
          <div class="preview-meta">
            <el-tag :type="getContentTypeColor(currentPreview.type)" size="small">
              {{ getContentTypeName(currentPreview.type) }}
            </el-tag>
            <el-tag :type="getModuleColor(currentPreview.module)" size="small">
              {{ getModuleName(currentPreview.module) }}
            </el-tag>
            <span class="preview-author">{{ currentPreview.author.name }}</span>
            <span class="preview-time">{{ formatDateTime(currentPreview.createdAt) }}</span>
          </div>
          <div class="preview-status">
            <el-tag :type="getStatusColor(currentPreview.status)" size="large">
              {{ getStatusName(currentPreview.status) }}
            </el-tag>
          </div>
        </div>

        <!-- 预览内容 -->
        <div class="preview-body">
          <div v-if="currentPreview.contentHtml" v-html="currentPreview.contentHtml"></div>
          <div v-else class="preview-text">{{ currentPreview.content }}</div>
        </div>

        <!-- 预览标签 -->
        <div class="preview-footer">
          <div class="preview-tags">
            <el-tag v-for="tag in currentPreview.tags" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 快速审核操作 -->
        <div v-if="canQuickAudit(currentPreview)" class="preview-actions">
          <div class="actions-title">快速审核</div>
          <el-button type="success" @click="quickApprove">
            <el-icon><Check /></el-icon>
            通过
          </el-button>
          <el-button type="danger" @click="showRejectDialog">
            <el-icon><Close /></el-icon>
            拒绝
          </el-button>
          <el-button @click="editContent(currentPreview.id)">
            <el-icon><Edit /></el-icon>
            编辑
          </el-button>
        </div>
      </div>
      <div v-else class="preview-loading">
        <el-skeleton :rows="8" animated />
      </div>
    </el-drawer>

    <!-- 批量移动版块对话框 -->
    <el-dialog v-model="moveCategoryDialogVisible" title="批量移动版块" width="400px">
      <el-form label-width="80px">
        <el-form-item label="目标版块">
          <el-select v-model="selectedCategory" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="moveCategoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmMoveCategory" :loading="moveLoading">
          确定移动
        </el-button>
      </template>
    </el-dialog>

    <!-- 审核拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="审核拒绝" width="400px">
      <el-form label-width="80px">
        <el-form-item label="拒绝理由" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝理由"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="rejectLoading">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>

    <!-- 置顶设置对话框 -->
    <el-dialog v-model="topDialogVisible" title="置顶设置" width="400px">
      <el-form label-width="100px">
        <el-form-item label="置顶有效期">
          <el-radio-group v-model="topExpiry">
            <el-radio label="1week">1周</el-radio>
            <el-radio label="1month">1个月</el-radio>
            <el-radio label="3month">3个月</el-radio>
            <el-radio label="permanent">永久</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="topDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTop" :loading="topLoading">
          确定置顶
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContentStore } from '@/stores/content'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import type { Content, ContentPreview, ContentQueryParams } from '@/types'
import {
  Plus, Download, Search, Refresh, ArrowDown, ArrowUp, View, Star, 
  ChatDotRound, Check, Close, Edit
} from '@element-plus/icons-vue'

const router = useRouter()
const contentStore = useContentStore()
const authStore = useAuthStore()

// 响应式数据
const filterCollapsed = ref(false)
const previewDrawerVisible = ref(false)
const currentPreview = ref<ContentPreview | null>(null)
const moveCategoryDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const topDialogVisible = ref(false)
const quickSearch = ref('')
const dateRange = ref<[string, string] | null>(null)
const selectedCategory = ref('')
const rejectReason = ref('')
const topExpiry = ref('1month')

// 加载状态
const exportLoading = ref(false)
const moveLoading = ref(false)
const rejectLoading = ref(false)
const topLoading = ref(false)

/** 计算属性（Pinia refs 解构，避免 Ref 的 Ref 导致的运行时错误） */
const { contentList, contentStats, categories, selectedContents, loading, pagination, queryParams } = storeToRefs(contentStore)

const hasSelected = computed(() => {
  const selected = Array.isArray(selectedContents.value) ? selectedContents.value : []
  return selected.length > 0
})
const topContentCount = computed(() => {
  const list = Array.isArray(contentList.value) ? contentList.value : []
  return list.filter(item => item.isTop).length
})

const filteredCategories = computed(() => {
  const all = Array.isArray(categories.value) ? categories.value : []
  if (!queryParams.value.module) return all
  return all.filter(cat => cat.module === queryParams.value.module)
})

const hasActiveFilters = computed(() => {
  const params = queryParams.value
  return !!(params.keyword || params.type || params.module || params.category || 
           params.status !== undefined || params.author || params.startTime || params.endTime)
})

const activeFilters = computed(() => {
  const filters = []
  const params = queryParams.value
  
  if (params.keyword) filters.push({ key: 'keyword', label: '关键词', value: params.keyword })
  if (params.type) filters.push({ key: 'type', label: '类型', value: getContentTypeName(params.type) })
  if (params.module) filters.push({ key: 'module', label: '板块', value: getModuleName(params.module) })
  if (params.category) filters.push({ key: 'category', label: '分类', value: params.category })
  if (params.status !== undefined) filters.push({ key: 'status', label: '状态', value: getStatusName(params.status) })
  if (params.author) filters.push({ key: 'author', label: '作者', value: params.author })
  if (params.startTime) filters.push({ key: 'time', label: '时间范围', value: `${params.startTime} ~ ${params.endTime}` })
  
  return filters
})

const fromCategory = computed(() => router.currentRoute.value.query.from === 'category')

const selectAll = computed({
  get: () => {
    const list = Array.isArray(contentList.value) ? contentList.value : []
    const selected = Array.isArray(selectedContents.value) ? selectedContents.value : []
    return selected.length === list.length && list.length > 0
  },
  set: (val: boolean) => {
    if (val) {
      contentStore.selectAll(Array.isArray(contentList.value) ? contentList.value : [])
    } else {
      contentStore.clearSelection()
    }
  }
})

const indeterminate = computed(() => {
  const list = Array.isArray(contentList.value) ? contentList.value : []
  const selected = Array.isArray(selectedContents.value) ? selectedContents.value : []
  return selected.length > 0 && selected.length < list.length
})

// 工具方法
const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const getContentTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    article: '文章',
    post: '帖子',
    comment: '评论', 
    news: '资讯',
    goods: '商品',
    quote: '名言'
  }
  return typeMap[type] || type
}

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

const getContentTypeColor = (type: string): TagType => {
  const colorMap: Record<string, TagType> = {
    article: 'primary',
    post: 'success',
    comment: 'info',
    news: 'warning',
    goods: 'danger',
    quote: 'info'
  }
  return colorMap[type] || 'info'
}

const getModuleName = (module: string) => {
  const moduleMap: Record<string, string> = {
    knowledge: '知识库',
    forum: '论坛',
    news: '资讯',
    'flea-market': '跳蚤市场',
    operation: '运营内容'
  }
  return moduleMap[module] || module
}

const getModuleColor = (module: string): TagType => {
  const colorMap: Record<string, TagType> = {
    knowledge: 'primary',
    forum: 'success', 
    news: 'warning',
    'flea-market': 'danger',
    operation: 'info'
  }
  return colorMap[module] || 'info'
}

const getStatusName = (status: number) => {
  const statusMap: Record<number, string> = {
    1: '待审核',
    2: '已发布',
    3: '已拒绝',
    4: '已删除'
  }
  return statusMap[status] || `状态${status}`
}

const getStatusColor = (status: number): TagType => {
  const colorMap: Record<number, TagType> = {
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'info'
  }
  return colorMap[status] || 'info'
}

const canEdit = (content: Content) => {
  // 权限检查：管理员或内容作者可以编辑
  return authStore.hasPermission('content:edit') || content.author.id === authStore.currentUser?.id
}

const canAudit = (content: Content) => {
  return authStore.hasPermission('content:audit') && content.status === 1
}

const canQuickAudit = (content: ContentPreview) => {
  return authStore.hasPermission('content:audit') && content.status === 1
}

// 事件处理方法
const toggleFilterCollapse = () => {
  filterCollapsed.value = !filterCollapsed.value
}

const handleModuleChange = () => {
  queryParams.value.category = '' // 清空分类选择
  contentStore.loadCategories(queryParams.value.module)
}

const handleSearch = () => {
  if (dateRange.value) {
    queryParams.value.startTime = dateRange.value[0]
    queryParams.value.endTime = dateRange.value[1]
  } else {
    queryParams.value.startTime = ''
    queryParams.value.endTime = ''
  }
  
  queryParams.value.page = 1
  contentStore.loadContentList()
}

const handleReset = () => {
  contentStore.resetQueryParams()
  dateRange.value = null
  contentStore.loadContentList()
}

const quickFilter = (key: string, value: any) => {
  ;(queryParams.value as any)[key] = value
  queryParams.value.page = 1
  contentStore.loadContentList()
}

const removeFilter = (key: string) => {
  if (key === 'time') {
    queryParams.value.startTime = ''
    queryParams.value.endTime = ''
    dateRange.value = null
  } else {
    ;(queryParams.value as any)[key] = key === 'status' ? undefined : ''
  }
  contentStore.loadContentList()
}

const handleSelectionChange = (selection: Content[]) => {
  contentStore.selectedContents = selection
}

const handleSelectAll = () => {
  // 由计算属性处理
}

const handleQuickSearch = () => {
  // 防抖处理
  clearTimeout((window as any).quickSearchTimeout)
  ;(window as any).quickSearchTimeout = setTimeout(() => {
    queryParams.value.keyword = quickSearch.value
    queryParams.value.page = 1
    contentStore.loadContentList()
  }, 500)
}

const handleSizeChange = (size: number) => {
  queryParams.value.pageSize = size
  contentStore.loadContentList()
}

const handleCurrentChange = (page: number) => {
  queryParams.value.page = page
  contentStore.loadContentList()
}

const previewContent = async (content: Content) => {
  previewDrawerVisible.value = true
  currentPreview.value = null
  const preview = await contentStore.getContentPreview(content.id)
  currentPreview.value = preview
}

const closePreview = () => {
  previewDrawerVisible.value = false
  currentPreview.value = null
}

const createContent = () => {
  router.push({ name: 'ContentCreate' })
}

const editContent = (id: number) => {
  router.push({ name: 'ContentEdit', params: { id } })
}

const handleExport = async () => {
  try {
    exportLoading.value = true
    const downloadUrl = await contentStore.exportData()
    if (downloadUrl) {
      // 打开下载链接
      window.open(downloadUrl, '_blank')
    }
  } finally {
    exportLoading.value = false
  }
}

// 批量操作处理
const handleBatchAction = (command: string) => {
  const selectedIds = selectedContents.value.map(item => item.id)
  
  switch (command) {
    case 'publish':
      batchApprove(selectedIds)
      break
    case 'reject':
      batchReject(selectedIds)
      break  
    case 'top':
      batchTop(selectedIds)
      break
    case 'elite':
      batchElite(selectedIds)
      break
    case 'move':
      showMoveDialog(selectedIds)
      break
    case 'lock':
      batchLock(selectedIds)
      break
    case 'delete':
      batchDelete(selectedIds)
      break
  }
}

const batchApprove = (contentIds: number[]) => {
  ElMessageBox.confirm(
    `确定要批量通过审核选中的 ${contentIds.length} 条内容吗？`,
    '批量审核',
    { type: 'warning' }
  ).then(async () => {
    const success = await contentStore.batchOperation({
      contentIds,
      operation: 'publish'
    })
    if (success) {
      contentStore.clearSelection()
      await contentStore.loadContentList()
    }
  })
}

const batchReject = (contentIds: number[]) => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
  // TODO: 实现批量拒绝逻辑
}

const batchTop = (contentIds: number[]) => {
  topExpiry.value = '1month'
  topDialogVisible.value = true
  // TODO: 实现批量置顶逻辑
}

const batchElite = (contentIds: number[]) => {
  ElMessageBox.confirm(
    `确定要批量设置精华选中的 ${contentIds.length} 条内容吗？`,
    '批量设精华',
    { type: 'warning' }
  ).then(async () => {
    const success = await contentStore.batchOperation({
      contentIds,
      operation: 'elite'
    })
    if (success) {
      contentStore.clearSelection()
      await contentStore.loadContentList()
    }
  })
}

const batchLock = (contentIds: number[]) => {
  ElMessageBox.confirm(
    `确定要批量锁定选中的 ${contentIds.length} 条内容吗？`,
    '批量锁定',
    { type: 'warning' }
  ).then(async () => {
    const success = await contentStore.batchOperation({
      contentIds,
      operation: 'lock'
    })
    if (success) {
      contentStore.clearSelection()
      await contentStore.loadContentList()
    }
  })
}

const batchDelete = (contentIds: number[]) => {
  ElMessageBox.confirm(
    `确定要批量删除选中的 ${contentIds.length} 条内容吗？此操作不可恢复！`,
    '批量删除',
    { type: 'warning' }
  ).then(async () => {
    const success = await contentStore.batchOperation({
      contentIds,
      operation: 'delete'
    })
    if (success) {
      contentStore.clearSelection()
      await contentStore.loadContentList()
    }
  })
}

const showMoveDialog = (contentIds: number[]) => {
  selectedCategory.value = ''
  moveCategoryDialogVisible.value = true
}

const confirmMoveCategory = async () => {
  if (!selectedCategory.value) {
    ElMessage.warning('请选择目标版块')
    return
  }
  
  try {
    moveLoading.value = true
    const selectedIds = selectedContents.value.map(item => item.id)
    const success = await contentStore.moveCategory(selectedIds, selectedCategory.value)
    
    if (success) {
      moveCategoryDialogVisible.value = false
      contentStore.clearSelection()
      await contentStore.loadContentList()
    }
  } finally {
    moveLoading.value = false
  }
}

// 行操作处理
const handleRowAction = (command: string, content: Content) => {
  switch (command) {
    case 'edit':
      editContent(content.id)
      break
    case 'audit':
      previewContent(content)
      break
    case 'top':
      toggleTop(content)
      break
    case 'elite':
      toggleElite(content)
      break
    case 'lock':
      toggleLock(content)
      break
    case 'move':
      contentStore.selectedContents = [content]
      showMoveDialog([content.id])
      break
    case 'delete':
      deleteContent(content)
      break
  }
}

const toggleTop = async (content: Content) => {
  if (!content.isTop) {
    // 显示置顶设置对话框
    topExpiry.value = '1month'
    topDialogVisible.value = true
    // TODO: 保存当前要置顶的内容ID
  } else {
    // 直接取消置顶
    await contentStore.setTop(content.id, false)
  }
}

const confirmTop = async () => {
  // TODO: 实现置顶确认逻辑
  topDialogVisible.value = false
}

const toggleElite = async (content: Content) => {
  await contentStore.setElite(content.id, !content.isElite)
}

const toggleLock = async (content: Content) => {
  await contentStore.setLock(content.id, !content.isLocked)
}

const deleteContent = (content: Content) => {
  ElMessageBox.confirm(
    `确定要删除内容"${content.title}"吗？此操作不可恢复！`,
    '删除内容',
    { type: 'warning' }
  ).then(async () => {
    await contentStore.deleteContent(content.id)
    await contentStore.loadContentList()
  })
}


// 快速审核操作
const quickApprove = async () => {
  if (!currentPreview.value) return
  
  const success = await contentStore.auditContent(currentPreview.value.id, 'approve')
  if (success) {
    closePreview()
    await contentStore.loadContentList()
  }
}

const showRejectDialog = () => {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入拒绝理由')
    return
  }
  
  if (!currentPreview.value) return
  
  try {
    rejectLoading.value = true
    const success = await contentStore.auditContent(
      currentPreview.value.id, 
      'reject', 
      rejectReason.value
    )
    
    if (success) {
      rejectDialogVisible.value = false
      closePreview()
      await contentStore.loadContentList()
    }
  } finally {
    rejectLoading.value = false
  }
}

// 生命周期
onMounted(async () => {
  // 从路由查询参数恢复筛选条件
  const query = router.currentRoute.value.query
  if (query.status) {
    queryParams.value.status = parseInt(query.status as string)
  }
  if (query.module) {
    queryParams.value.module = String(query.module)
  }
  if (query.category) {
    queryParams.value.category = String(query.category)
  }

  // 先按模块加载分类，再加载列表与统计
  await contentStore.loadCategories(queryParams.value.module)
  await Promise.all([
    contentStore.loadContentList(),
    contentStore.loadStats()
  ])
})

// 监听快速搜索
watch(quickSearch, (newVal) => {
  if (!newVal.trim() && queryParams.value.keyword) {
    queryParams.value.keyword = ''
    queryParams.value.page = 1
    contentStore.loadContentList()
  }
})
</script>

<style scoped>
.content-list-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  font-weight: 600;
  color: #303133;
}

.collapse-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.filter-content {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.filter-label {
  color: #606266;
  margin-right: 8px;
}

.filter-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.stats-bar {
  margin-bottom: 20px;
}

.stat-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.stat-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.stat-item.pending {
  background: linear-gradient(135deg, #fa709a20, #fee14020);
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  color: #606266;
  font-size: 14px;
  margin-top: 4px;
}

.table-card {
  margin-bottom: 20px;
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-operations-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-operations-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.total-count {
  color: #606266;
  font-size: 14px;
}

.content-title {
  max-width: 100%;
}

.title-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.title-link {
  font-weight: 500;
  flex: 1;
  min-width: 0;
}

.title-tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #909399;
}

.meta-separator {
  color: #e4e7ed;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-details {
  min-width: 0;
}

.author-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.author-dept {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.content-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.stat-row .el-icon {
  font-size: 12px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.preview-container {
  padding: 0 16px;
}

.preview-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.preview-status {
  text-align: center;
}

.preview-body {
  margin-bottom: 20px;
  line-height: 1.6;
}

.preview-text {
  color: #606266;
  white-space: pre-wrap;
}

.preview-footer {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.preview-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-actions {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
}

.actions-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.preview-actions .el-button {
  margin-right: 8px;
}

.preview-loading {
  padding: 0 16px;
}
</style>