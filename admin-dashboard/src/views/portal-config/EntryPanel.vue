<template>
  <div class="entry-panel-management">
    <!-- 统一页面头部 -->
    <PageHeader 
      title="快捷入口管理" 
      description="配置用户门户首页的快捷入口面板，支持自定义图标、名称和跳转地址"
    >
      <template #actions>
        <el-button type="success" @click="handlePreview" :icon="View" plain>
          预览效果
        </el-button>
        <el-button type="primary" @click="handleCreateEntry" :icon="Plus">
          新建快捷入口
        </el-button>
        <el-button type="warning" @click="handleCreateSnapshot" :icon="DocumentCopy" plain>
          创建快照
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计数据展示 -->
    <div class="stats-section">
      <el-row :gutter="16">
        <el-col :span="6">
          <StatsCard
            label="总入口数"
            :value="stats.totalEntries"
            icon="Grid"
            iconColor="#667eea"
            :trend="stats.entriesTrend"
            description="当前配置的快捷入口总数"
            clickable
            @click="handleStatsClick('total')"
          />
        </el-col>
        <el-col :span="6">
          <StatsCard
            label="启用入口"
            :value="stats.activeEntries"
            icon="Check"
            iconColor="#52c41a"
            :trend="stats.activeTrend"
            description="用户可见的启用入口数"
            clickable
            @click="handleStatsClick('active')"
          />
        </el-col>
        <el-col :span="6">
          <StatsCard
            label="总点击数"
            :value="stats.totalClicks"
            icon="Mouse"
            iconColor="#fa8c16"
            suffix="次"
            :trend="stats.clicksTrend"
            description="所有入口的累计点击数"
            clickable
            @click="handleStatsClick('clicks')"
          />
        </el-col>
        <el-col :span="6">
          <StatsCard
            label="热门入口"
            :value="stats.hotEntries"
            icon="Fire"
            iconColor="#f5222d"
            description="本周点击量最高的入口数"
            clickable
            @click="handleStatsClick('hot')"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 过滤和搜索栏 -->
    <div class="filter-section">
      <el-card shadow="never" class="filter-card">
        <el-row :gutter="16" align="middle">
          <el-col :span="8">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索入口名称或地址..."
              :prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="filters.status"
              placeholder="状态筛选"
              clearable
              @change="applyFilters"
            >
              <el-option label="全部状态" value="" />
              <el-option label="启用" value="enabled" />
              <el-option label="禁用" value="disabled" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="filters.type"
              placeholder="类型筛选"
              clearable
              @change="applyFilters"
            >
              <el-option label="全部类型" value="" />
              <el-option label="内部链接" value="internal" />
              <el-option label="外部链接" value="external" />
              <el-option label="应用跳转" value="app" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="filters.sortBy"
              placeholder="排序方式"
              @change="applyFilters"
            >
              <el-option label="按创建时间" value="createTime" />
              <el-option label="按点击量" value="clicks" />
              <el-option label="按名称" value="name" />
              <el-option label="按排序值" value="sortOrder" />
            </el-select>
          </el-col>
          <el-col :span="4" class="text-right">
            <el-button-group>
              <el-button 
                :type="viewMode === 'grid' ? 'primary' : ''" 
                :icon="Grid" 
                @click="setViewMode('grid')"
              />
              <el-button 
                :type="viewMode === 'list' ? 'primary' : ''" 
                :icon="List" 
                @click="setViewMode('list')"
              />
            </el-button-group>
            <el-button :icon="Refresh" circle @click="refreshData" class="ml-2" />
          </el-col>
        </el-row>
      </el-card>
    </div>

    <!-- 快捷入口列表/网格 -->
    <div class="entries-section" v-loading="loading">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="entries-grid">
        <draggable
          v-model="filteredEntries"
          group="entries"
          :animation="200"
          ghost-class="ghost-item"
          chosen-class="chosen-item"
          drag-class="drag-item"
          @end="handleSortEnd"
          class="grid-container"
        >
          <template #item="{ element: entry }">
            <div class="entry-card">
              <div class="entry-header">
                <div class="drag-handle">
                  <el-icon><Rank /></el-icon>
                </div>
                <el-dropdown @command="handleEntryAction" class="entry-actions">
                  <el-button size="small" :icon="More" circle />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'edit', entry }">
                        <el-icon><Edit /></el-icon> 编辑入口
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'copy', entry }">
                        <el-icon><DocumentCopy /></el-icon> 复制入口
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'toggle', entry }">
                        <el-icon><Switch /></el-icon> 
                        {{ entry.enabled ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'stats', entry }">
                        <el-icon><DataAnalysis /></el-icon> 查看统计
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'delete', entry }" divided>
                        <el-icon><Delete /></el-icon> 删除入口
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>

              <div class="entry-content" @click="handleEditEntry(entry)">
                <!-- 入口图标 -->
                <div class="entry-icon-container">
                  <div 
                    class="entry-icon" 
                    :style="{ 
                      backgroundColor: entry.iconBgColor || '#667eea',
                      color: entry.iconColor || '#ffffff'
                    }"
                  >
                    <img 
                      v-if="entry.iconType === 'image' && entry.iconUrl" 
                      :src="entry.iconUrl" 
                      :alt="entry.name"
                      class="icon-image"
                    />
                    <el-icon v-else-if="entry.iconName" :size="32">
                      <component :is="entry.iconName" />
                    </el-icon>
                    <el-icon v-else :size="32">
                      <Link />
                    </el-icon>
                  </div>
                </div>

                <!-- 入口信息 -->
                <div class="entry-info">
                  <h3 class="entry-name">{{ entry.name }}</h3>
                  <p class="entry-description" v-if="entry.description">
                    {{ entry.description }}
                  </p>
                  <div class="entry-meta">
                    <el-tag 
                      :type="getTypeTagType(entry.type)" 
                      size="small" 
                      effect="plain"
                    >
                      {{ getTypeLabel(entry.type) }}
                    </el-tag>
                    <span class="entry-url">{{ getDisplayUrl(entry.url) }}</span>
                  </div>
                </div>

                <!-- 状态指示器 -->
                <div class="entry-status">
                  <el-tag 
                    :type="entry.enabled ? 'success' : 'info'" 
                    size="small"
                    class="status-tag"
                  >
                    {{ entry.enabled ? '启用' : '禁用' }}
                  </el-tag>
                </div>
              </div>

              <!-- 入口统计 -->
              <div class="entry-stats">
                <div class="stat-item">
                  <span class="stat-label">点击量</span>
                  <span class="stat-value">{{ entry.clickCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">排序</span>
                  <span class="stat-value">{{ entry.sortOrder || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">更新</span>
                  <span class="stat-value">{{ formatDate(entry.updatedAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </draggable>

        <!-- 添加新入口卡片 -->
        <div class="add-entry-card" @click="handleCreateEntry">
          <div class="add-content">
            <el-icon :size="48" class="add-icon">
              <Plus />
            </el-icon>
            <span class="add-text">添加新的快捷入口</span>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="entries-list">
        <el-table 
          :data="filteredEntries" 
          row-key="id"
          @sort-change="handleTableSort"
          class="unified-table"
        >
          <el-table-column width="60" class="drag-column">
            <template #default>
              <el-icon class="drag-handle"><Rank /></el-icon>
            </template>
          </el-table-column>
          
          <el-table-column label="入口信息" min-width="300">
            <template #default="{ row }">
              <div class="table-entry-info">
                <div 
                  class="table-entry-icon"
                  :style="{ 
                    backgroundColor: row.iconBgColor || '#667eea',
                    color: row.iconColor || '#ffffff'
                  }"
                >
                  <img 
                    v-if="row.iconType === 'image' && row.iconUrl" 
                    :src="row.iconUrl" 
                    :alt="row.name"
                    class="table-icon-image"
                  />
                  <el-icon v-else-if="row.iconName" :size="20">
                    <component :is="row.iconName" />
                  </el-icon>
                  <el-icon v-else :size="20">
                    <Link />
                  </el-icon>
                </div>
                <div class="table-entry-content">
                  <div class="table-entry-name">{{ row.name }}</div>
                  <div class="table-entry-description" v-if="row.description">
                    {{ row.description }}
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="链接地址" min-width="250">
            <template #default="{ row }">
              <div class="table-url">
                <el-link :href="row.url" :underline="false" type="primary">
                  {{ getDisplayUrl(row.url) }}
                </el-link>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="类型" width="100" prop="type" sortable>
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small" effect="plain">
                {{ getTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="80" prop="enabled" sortable>
            <template #default="{ row }">
              <el-switch 
                v-model="row.enabled" 
                @change="handleToggleStatus(row)"
                :disabled="updating"
              />
            </template>
          </el-table-column>

          <el-table-column label="点击量" width="100" prop="clickCount" sortable>
            <template #default="{ row }">
              <span class="click-count">{{ row.clickCount || 0 }}</span>
            </template>
          </el-table-column>

          <el-table-column label="排序" width="80" prop="sortOrder" sortable>
            <template #default="{ row }">
              <span class="sort-order">{{ row.sortOrder || 0 }}</span>
            </template>
          </el-table-column>

          <el-table-column label="更新时间" width="160" prop="updatedAt" sortable>
            <template #default="{ row }">
              <span class="update-time">{{ formatDate(row.updatedAt) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button-group size="small">
                <el-button type="primary" :icon="Edit" @click="handleEditEntry(row)" />
                <el-button type="danger" :icon="Delete" @click="handleDeleteEntry(row)" />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && filteredEntries.length === 0"
        description="暂无快捷入口数据"
        :image-size="120"
      >
        <el-button type="primary" @click="handleCreateEntry">
          创建第一个快捷入口
        </el-button>
      </el-empty>
    </div>

    <!-- 入口编辑对话框 -->
    <EntryEditDialog
      v-model="editDialogVisible"
      :entry="currentEntry"
      :is-editing="isEditing"
      @save="handleSaveEntry"
    />

    <!-- 预览对话框 -->
    <EntryPreviewDialog
      v-model="previewDialogVisible"
      :entries="enabledEntries"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  View, Plus, DocumentCopy, Search, Grid, List, Refresh, More, Edit, Delete,
  Switch, DataAnalysis, Rank, Link, Fire, Check, Mouse
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

// 组件导入
import PageHeader from '@/components/PageHeader.vue'
import StatsCard from '@/components/StatsCard.vue'
import EntryEditDialog from './components/EntryEditDialog.vue'
import EntryPreviewDialog from './components/EntryPreviewDialog.vue'

// API导入
import { portalConfigApi } from '@/api/navigation'

// 类型定义
interface EntryItem {
  id: number
  name: string
  description: string
  url: string
  iconType: 'icon' | 'image'
  iconName?: string
  iconUrl?: string
  iconBgColor: string
  iconColor: string
  type: 'internal' | 'external' | 'app'
  enabled: boolean
  clickCount: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

// 响应式数据
const loading = ref(false)
const updating = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const entries = ref<EntryItem[]>([])
const editDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const currentEntry = ref<EntryItem | null>(null)
const isEditing = ref(false)

// 过滤条件
const filters = reactive({
  keyword: '',
  status: '',
  type: '',
  sortBy: 'createTime'
})

// 统计数据
const stats = computed(() => ({
  totalEntries: entries.value.length,
  activeEntries: entries.value.filter(e => e.enabled).length,
  totalClicks: entries.value.reduce((sum, e) => sum + (e.clickCount || 0), 0),
  hotEntries: entries.value.filter(e => (e.clickCount || 0) > 100).length,
  entriesTrend: Math.round((Math.random() - 0.5) * 20),
  activeTrend: Math.round((Math.random() - 0.5) * 15),
  clicksTrend: Math.round((Math.random() - 0.5) * 30)
}))

// 过滤后的入口列表
const filteredEntries = computed(() => {
  let result = [...entries.value]
  
  // 关键词过滤
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase()
    result = result.filter(entry => 
      entry.name.toLowerCase().includes(keyword) ||
      entry.url.toLowerCase().includes(keyword) ||
      (entry.description && entry.description.toLowerCase().includes(keyword))
    )
  }
  
  // 状态过滤
  if (filters.status) {
    result = result.filter(entry => {
      if (filters.status === 'enabled') return entry.enabled
      if (filters.status === 'disabled') return !entry.enabled
      return true
    })
  }
  
  // 类型过滤
  if (filters.type) {
    result = result.filter(entry => entry.type === filters.type)
  }
  
  // 排序
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'clicks':
        return (b.clickCount || 0) - (a.clickCount || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'sortOrder':
        return (a.sortOrder || 0) - (b.sortOrder || 0)
      default: // createTime
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })
  
  return result
})

// 启用的入口列表（用于预览）
const enabledEntries = computed(() => 
  entries.value.filter(e => e.enabled).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
)

// 生命周期
onMounted(() => {
  loadEntries()
})

// 方法定义
const loadEntries = async () => {
  try {
    loading.value = true
    const response = await portalConfigApi.entryPanel.getPanels()
    
    // 模拟数据转换
    entries.value = [
      {
        id: 1,
        name: '系统管理',
        description: '系统配置和用户管理',
        url: '/admin/system',
        iconType: 'icon',
        iconName: 'Setting',
        iconBgColor: '#667eea',
        iconColor: '#ffffff',
        type: 'internal',
        enabled: true,
        clickCount: 156,
        sortOrder: 1,
        createdAt: '2024-09-01T10:00:00Z',
        updatedAt: '2024-09-06T08:30:00Z'
      },
      {
        id: 2,
        name: '数据分析',
        description: '业务数据统计分析',
        url: '/admin/analytics',
        iconType: 'icon',
        iconName: 'DataAnalysis',
        iconBgColor: '#52c41a',
        iconColor: '#ffffff',
        type: 'internal',
        enabled: true,
        clickCount: 203,
        sortOrder: 2,
        createdAt: '2024-09-01T11:00:00Z',
        updatedAt: '2024-09-05T15:20:00Z'
      },
      {
        id: 3,
        name: '外部工具',
        description: '第三方工具链接',
        url: 'https://example.com/tools',
        iconType: 'icon',
        iconName: 'Link',
        iconBgColor: '#fa8c16',
        iconColor: '#ffffff',
        type: 'external',
        enabled: false,
        clickCount: 45,
        sortOrder: 3,
        createdAt: '2024-09-02T09:30:00Z',
        updatedAt: '2024-09-04T16:45:00Z'
      }
    ]
  } catch (error) {
    console.error('加载入口数据失败:', error)
    ElMessage.error('加载入口数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadEntries()
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const applyFilters = () => {
  // 过滤逻辑已在computed中处理
}

const setViewMode = (mode: 'grid' | 'list') => {
  viewMode.value = mode
}

const handleCreateEntry = () => {
  currentEntry.value = null
  isEditing.value = false
  editDialogVisible.value = true
}

const handleEditEntry = (entry: EntryItem) => {
  currentEntry.value = { ...entry }
  isEditing.value = true
  editDialogVisible.value = true
}

const handleSaveEntry = (entryData: Partial<EntryItem>) => {
  if (isEditing.value && currentEntry.value) {
    // 更新现有入口
    const index = entries.value.findIndex(e => e.id === currentEntry.value!.id)
    if (index !== -1) {
      entries.value[index] = { ...entries.value[index], ...entryData, updatedAt: new Date().toISOString() }
      ElMessage.success('入口更新成功')
    }
  } else {
    // 创建新入口
    const newEntry: EntryItem = {
      id: Date.now(), // 临时ID
      ...entryData as EntryItem,
      clickCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    entries.value.push(newEntry)
    ElMessage.success('入口创建成功')
  }
  
  editDialogVisible.value = false
}

const handleDeleteEntry = async (entry: EntryItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除入口"${entry.name}"吗？此操作不可撤销。`,
      '确认删除',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    entries.value = entries.value.filter(e => e.id !== entry.id)
    ElMessage.success('入口删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleToggleStatus = async (entry: EntryItem) => {
  try {
    updating.value = true
    // 这里应该调用API更新状态
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
    
    ElMessage.success(`入口已${entry.enabled ? '启用' : '禁用'}`)
  } catch (error) {
    // 恢复原状态
    entry.enabled = !entry.enabled
    ElMessage.error('状态更新失败')
  } finally {
    updating.value = false
  }
}

const handleEntryAction = ({ action, entry }: { action: string, entry: EntryItem }) => {
  switch (action) {
    case 'edit':
      handleEditEntry(entry)
      break
    case 'copy':
      handleCopyEntry(entry)
      break
    case 'toggle':
      entry.enabled = !entry.enabled
      handleToggleStatus(entry)
      break
    case 'stats':
      handleViewStats(entry)
      break
    case 'delete':
      handleDeleteEntry(entry)
      break
  }
}

const handleCopyEntry = (entry: EntryItem) => {
  const newEntry = {
    ...entry,
    id: Date.now(),
    name: `${entry.name} (副本)`,
    enabled: false,
    clickCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  entries.value.push(newEntry)
  ElMessage.success('入口复制成功')
}

const handleViewStats = (entry: EntryItem) => {
  ElMessage.info(`入口"${entry.name}"的详细统计功能开发中...`)
}

const handleSortEnd = (evt: any) => {
  // 处理拖拽排序
  console.log('拖拽排序:', evt)
}

const handleTableSort = ({ column, prop, order }: any) => {
  // 处理表格排序
  console.log('表格排序:', { column, prop, order })
}

const handleStatsClick = (type: string) => {
  ElMessage.info(`${type}统计详情功能开发中...`)
}

const handlePreview = () => {
  previewDialogVisible.value = true
}

const handleCreateSnapshot = () => {
  ElMessage.info('创建配置快照功能开发中...')
}

// 工具函数
const getTypeLabel = (type: string) => {
  const labels = {
    internal: '内部',
    external: '外部',
    app: '应用'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    internal: 'primary',
    external: 'success',
    app: 'warning'
  }
  return types[type as keyof typeof types] || 'info'
}

const getDisplayUrl = (url: string) => {
  if (url.length > 40) {
    return url.substring(0, 40) + '...'
  }
  return url
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.entry-panel-management {
  min-height: 100vh;
  background: $color-bg-page;
}

// 统计数据区域
.stats-section {
  margin-bottom: $spacing-lg;
}

// 过滤区域
.filter-section {
  margin-bottom: $spacing-lg;
  
  .filter-card {
    border-radius: $radius-lg;
    border: none;
    box-shadow: $shadow-card;
  }
}

// 入口网格视图
.entries-grid {
  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: $spacing-md;
    min-height: 200px;
  }
  
  .entry-card {
    @include card-style;
    padding: 0;
    cursor: pointer;
    transition: all $transition-medium;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-card-hover;
    }
    
    .entry-header {
      @include flex-between;
      padding: $spacing-md $spacing-md 0;
      
      .drag-handle {
        color: $color-text-tertiary;
        cursor: grab;
        
        &:active {
          cursor: grabbing;
        }
      }
    }
    
    .entry-content {
      padding: $spacing-md;
      
      .entry-icon-container {
        text-align: center;
        margin-bottom: $spacing-md;
        
        .entry-icon {
          width: 64px;
          height: 64px;
          border-radius: $radius-lg;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: $shadow-card;
          transition: transform $transition-medium;
          
          &:hover {
            transform: scale(1.05);
          }
          
          .icon-image {
            width: 32px;
            height: 32px;
            object-fit: contain;
          }
        }
      }
      
      .entry-info {
        text-align: center;
        
        .entry-name {
          font-size: 16px;
          font-weight: 600;
          color: $color-text-primary;
          margin-bottom: $spacing-xs;
          @include text-ellipsis;
        }
        
        .entry-description {
          font-size: 12px;
          color: $color-text-tertiary;
          margin-bottom: $spacing-sm;
          @include text-ellipsis-multiline(2);
          min-height: 32px;
        }
        
        .entry-meta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: $spacing-sm;
          flex-wrap: wrap;
          
          .entry-url {
            font-size: 11px;
            color: $color-text-tertiary;
            @include text-ellipsis;
            max-width: 150px;
          }
        }
      }
      
      .entry-status {
        text-align: center;
        margin-top: $spacing-sm;
        
        .status-tag {
          border-radius: $radius-md;
        }
      }
    }
    
    .entry-stats {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      border-top: 1px solid $color-border-light;
      
      .stat-item {
        padding: $spacing-sm;
        text-align: center;
        border-right: 1px solid $color-border-light;
        
        &:last-child {
          border-right: none;
        }
        
        .stat-label {
          display: block;
          font-size: 11px;
          color: $color-text-tertiary;
          margin-bottom: 2px;
        }
        
        .stat-value {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: $color-text-secondary;
        }
      }
    }
  }
  
  // 添加入口卡片
  .add-entry-card {
    @include card-style;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    cursor: pointer;
    border: 2px dashed $color-border-primary;
    background: $color-bg-section;
    transition: all $transition-medium;
    
    &:hover {
      border-color: $color-primary;
      background: lighten($color-primary, 45%);
      transform: translateY(-2px);
      
      .add-icon {
        color: $color-primary;
        transform: scale(1.1);
      }
    }
    
    .add-content {
      text-align: center;
      
      .add-icon {
        color: $color-text-tertiary;
        margin-bottom: $spacing-sm;
        transition: all $transition-medium;
      }
      
      .add-text {
        display: block;
        color: $color-text-secondary;
        font-size: 14px;
      }
    }
  }
}

// 列表视图
.entries-list {
  .unified-table {
    background: white;
    border-radius: $radius-lg;
    overflow: hidden;
    box-shadow: $shadow-card;
    
    :deep(.el-table__header th) {
      background: $color-bg-section;
      color: $color-text-primary;
      font-weight: 600;
      border-bottom: 1px solid $color-border-light;
    }
    
    :deep(.el-table__body tr:hover) {
      background: $color-bg-section;
    }
    
    .drag-column {
      .drag-handle {
        color: $color-text-tertiary;
        cursor: grab;
        
        &:active {
          cursor: grabbing;
        }
      }
    }
    
    .table-entry-info {
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      
      .table-entry-icon {
        width: 32px;
        height: 32px;
        border-radius: $radius-md;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        .table-icon-image {
          width: 20px;
          height: 20px;
          object-fit: contain;
        }
      }
      
      .table-entry-content {
        flex: 1;
        min-width: 0;
        
        .table-entry-name {
          font-weight: 500;
          color: $color-text-primary;
          @include text-ellipsis;
        }
        
        .table-entry-description {
          font-size: 12px;
          color: $color-text-tertiary;
          @include text-ellipsis;
          margin-top: 2px;
        }
      }
    }
    
    .table-url {
      @include text-ellipsis;
    }
    
    .click-count, .sort-order, .update-time {
      font-size: 13px;
      color: $color-text-secondary;
    }
  }
}

// 响应式设计
@include respond-below(md) {
  .entries-grid .grid-container {
    grid-template-columns: 1fr;
    gap: $spacing-sm;
  }
  
  .filter-section {
    :deep(.el-row) {
      flex-direction: column;
      gap: $spacing-sm;
    }
    
    :deep(.el-col) {
      width: 100% !important;
    }
  }
}

// 拖拽样式
.ghost-item {
  opacity: 0.5;
  transform: rotate(2deg);
}

.chosen-item {
  border: 2px solid $color-primary;
}

.drag-item {
  transform: rotate(5deg);
  z-index: 999;
}

// 工具类
.ml-2 {
  margin-left: 8px;
}

.text-right {
  text-align: right;
}
</style>