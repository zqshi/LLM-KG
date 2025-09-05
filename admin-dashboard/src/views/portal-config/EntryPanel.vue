<template>
  <div class="entry-panel-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2 class="page-title">入口面板管理</h2>
          <p class="page-description">管理前台门户首页的快捷入口面板，支持拖拽排序和实时预览</p>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-space>
            <el-button type="success" @click="handlePreview" :icon="View" plain>
              预览效果
            </el-button>
            <el-button type="primary" @click="handleCreatePanel" :icon="Plus">
              新建面板
            </el-button>
            <el-button type="warning" @click="handleCreateSnapshot" :icon="DocumentCopy" plain>
              创建快照
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索面板或入口项..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterStatus"
            placeholder="状态筛选"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="sortBy"
            placeholder="排序方式"
            @change="handleSort"
          >
            <el-option label="按创建时间" value="create_time" />
            <el-option label="按更新时间" value="update_time" />
            <el-option label="按面板名称" value="title" />
            <el-option label="按入口数量" value="item_count" />
          </el-select>
        </el-col>
        <el-col :span="4" class="text-right">
          <el-tooltip content="刷新数据" placement="top">
            <el-button :icon="Refresh" circle @click="fetchPanelData" />
          </el-tooltip>
        </el-col>
      </el-row>
    </div>

    <!-- 面板列表 -->
    <div class="panel-grid" v-loading="loading">
      <draggable
        v-model="filteredPanels"
        group="panels"
        :animation="200"
        ghost-class="ghost-panel"
        chosen-class="chosen-panel"
        drag-class="drag-panel"
        @end="handlePanelSort"
      >
        <template #item="{ element: panel }">
          <div class="panel-card">
            <!-- 面板头部 -->
            <div class="panel-header">
              <div class="panel-title-section">
                <el-icon class="drag-handle" size="16"><Rank /></el-icon>
                <h3 class="panel-title">{{ panel.title }}</h3>
                <el-tag 
                  :type="panel.is_enabled ? 'success' : 'info'" 
                  size="small"
                  class="status-tag"
                >
                  {{ panel.is_enabled ? '启用' : '禁用' }}
                </el-tag>
              </div>
              <div class="panel-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  :icon="Plus"
                  @click="handleCreateItem(panel)"
                  plain
                >
                  添加入口
                </el-button>
                <el-dropdown trigger="click" @command="handlePanelCommand">
                  <el-button size="small" :icon="More" circle />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'edit', panel }">
                        <el-icon><Edit /></el-icon> 编辑面板
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'copy', panel }">
                        <el-icon><DocumentCopy /></el-icon> 复制面板
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'toggle', panel }">
                        <el-icon><Switch /></el-icon> 
                        {{ panel.is_enabled ? '禁用' : '启用' }}面板
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'delete', panel }" divided>
                        <el-icon><Delete /></el-icon> 删除面板
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>

            <!-- 面板描述 -->
            <div v-if="panel.description" class="panel-description">
              {{ panel.description }}
            </div>

            <!-- 入口项网格 -->
            <div class="entry-items-grid">
              <draggable
                v-model="panel.items"
                group="items"
                :animation="200"
                ghost-class="ghost-item"
                chosen-class="chosen-item"
                drag-class="drag-item"
                @end="(evt) => handleItemSort(panel, evt)"
                class="items-container"
              >
                <template #item="{ element: item }">
                  <div 
                    class="entry-item"
                    :class="{ disabled: !item.is_enabled }"
                    @click="handleEditItem(item)"
                  >
                    <!-- 入口项图标 -->
                    <div 
                      class="item-icon" 
                      :style="{ 
                        backgroundColor: item.bg_color, 
                        color: item.text_color 
                      }"
                    >
                      <img 
                        v-if="item.icon.startsWith('http')" 
                        :src="item.icon" 
                        :alt="item.name"
                      />
                      <el-icon v-else :size="24">
                        <component :is="item.icon" />
                      </el-icon>
                    </div>
                    
                    <!-- 入口项信息 -->
                    <div class="item-info">
                      <div class="item-name">{{ item.name }}</div>
                      <div v-if="item.description" class="item-description">
                        {{ item.description }}
                      </div>
                      <div class="item-meta">
                        <el-tag 
                          size="small" 
                          :type="item.type === 'route' ? 'primary' : 'success'"
                          effect="plain"
                        >
                          {{ item.type === 'route' ? '内部' : '外部' }}
                        </el-tag>
                        <span class="click-count">{{ item.click_count || 0 }}次点击</span>
                      </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="item-actions">
                      <el-button 
                        size="small" 
                        type="primary" 
                        :icon="Edit"
                        @click.stop="handleEditItem(item)"
                        circle
                      />
                      <el-button 
                        size="small" 
                        type="danger" 
                        :icon="Delete"
                        @click.stop="handleDeleteItem(item)"
                        circle
                      />
                    </div>
                  </div>
                </template>
              </draggable>

              <!-- 添加入口项按钮 -->
              <div 
                class="add-item-button"
                @click="handleCreateItem(panel)"
              >
                <el-icon :size="32"><Plus /></el-icon>
                <span>添加入口项</span>
              </div>
            </div>

            <!-- 面板统计 -->
            <div class="panel-stats">
              <el-row>
                <el-col :span="8">
                  <div class="stat-item">
                    <span class="stat-label">入口数量</span>
                    <span class="stat-value">{{ panel.items?.length || 0 }}</span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <span class="stat-label">启用数量</span>
                    <span class="stat-value success">
                      {{ panel.items?.filter(item => item.is_enabled).length || 0 }}
                    </span>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <span class="stat-label">总点击</span>
                    <span class="stat-value primary">
                      {{ panel.items?.reduce((sum, item) => sum + (item.click_count || 0), 0) || 0 }}
                    </span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </template>
      </draggable>

      <!-- 空状态 -->
      <div v-if="filteredPanels.length === 0" class="empty-state">
        <el-empty description="暂无入口面板">
          <el-button type="primary" @click="handleCreatePanel">创建第一个面板</el-button>
        </el-empty>
      </div>
    </div>

    <!-- 面板编辑对话框 -->
    <PanelEditDialog
      v-model:visible="panelDialogVisible"
      :panel-data="currentPanel"
      :is-edit="isPanelEditMode"
      @success="handlePanelEditSuccess"
    />

    <!-- 入口项编辑对话框 -->
    <EntryItemEditDialog
      v-model:visible="itemDialogVisible"
      :item-data="currentItem"
      :is-edit="isItemEditMode"
      @success="handleItemEditSuccess"
    />

    <!-- 快照创建对话框 -->
    <SnapshotDialog
      v-model:visible="snapshotDialogVisible"
      config-type="entry_panel"
      @success="handleSnapshotSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Edit, Delete, Search, View, DocumentCopy, More, Rank,
  Refresh, Switch
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'

// 导入API和类型
import { portalConfigApi } from '@/api/navigation'
import type { EntryPanel, EntryItem } from '@/types/navigation'

// 导入子组件
import PanelEditDialog from './components/PanelEditDialog.vue'
import EntryItemEditDialog from './components/EntryItemEditDialog.vue'
import SnapshotDialog from './components/SnapshotDialog.vue'

// ================================
// 响应式数据
// ================================

const loading = ref(false)

// 面板数据
const panelList = ref<EntryPanel[]>([])

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref<boolean | ''>('')
const sortBy = ref('create_time')

// 对话框状态
const panelDialogVisible = ref(false)
const itemDialogVisible = ref(false)
const snapshotDialogVisible = ref(false)

// 当前编辑数据
const currentPanel = ref<EntryPanel | null>(null)
const currentItem = ref<EntryItem | null>(null)
const isPanelEditMode = ref(false)
const isItemEditMode = ref(false)

// ================================
// 计算属性
// ================================

/** 过滤后的面板数据 */
const filteredPanels = computed({
  get() {
    let result = [...panelList.value]

    // 关键字搜索
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(panel => 
        panel.title.toLowerCase().includes(keyword) ||
        panel.description?.toLowerCase().includes(keyword) ||
        panel.items?.some(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.description?.toLowerCase().includes(keyword)
        )
      )
    }

    // 状态筛选
    if (filterStatus.value !== '') {
      result = result.filter(panel => panel.is_enabled === filterStatus.value)
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy.value) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'item_count':
          return (b.items?.length || 0) - (a.items?.length || 0)
        case 'update_time':
          return new Date(b.update_time || 0).getTime() - new Date(a.update_time || 0).getTime()
        default:
          return new Date(b.create_time || 0).getTime() - new Date(a.create_time || 0).getTime()
      }
    })

    return result
  },
  set(value) {
    panelList.value = value
  }
})

// ================================
// 生命周期
// ================================

onMounted(() => {
  fetchPanelData()
})

// ================================
// 方法
// ================================

/** 获取面板数据 */
const fetchPanelData = async () => {
  try {
    loading.value = true
    const response = await portalConfigApi.entryPanel.getEntryPanelList()
    panelList.value = response.data?.items || []
  } catch (error) {
    console.error('获取面板数据失败:', error)
    ElMessage.error('获取面板数据失败')
  } finally {
    loading.value = false
  }
}

/** 搜索处理 */
const handleSearch = () => {
  // 实时搜索，无需额外处理
}

/** 筛选处理 */
const handleFilter = () => {
  // 筛选由computed自动处理
}

/** 排序处理 */
const handleSort = () => {
  // 排序由computed自动处理
}

/** 面板排序 */
const handlePanelSort = async (evt: any) => {
  const { oldIndex, newIndex } = evt
  if (oldIndex === newIndex) return

  try {
    const sortData = filteredPanels.value.map((panel, index) => ({
      id: panel.id!,
      sort_order: index + 1
    }))

    await portalConfigApi.entryPanel.updateEntryPanelSort(sortData)
    ElMessage.success('面板排序更新成功')
  } catch (error) {
    console.error('更新面板排序失败:', error)
    ElMessage.error('更新面板排序失败')
    await fetchPanelData()
  }
}

/** 入口项排序 */
const handleItemSort = async (panel: EntryPanel, evt: any) => {
  const { oldIndex, newIndex } = evt
  if (oldIndex === newIndex) return

  try {
    const sortData = (panel.items || []).map((item, index) => ({
      id: item.id!,
      sort_order: index + 1
    }))

    await portalConfigApi.entryItem.updateEntryItemSort(panel.id!, sortData)
    ElMessage.success('入口项排序更新成功')
  } catch (error) {
    console.error('更新入口项排序失败:', error)
    ElMessage.error('更新入口项排序失败')
    await fetchPanelData()
  }
}

/** 创建面板 */
const handleCreatePanel = () => {
  currentPanel.value = {
    title: '',
    description: '',
    sort_order: panelList.value.length + 1,
    is_enabled: true,
    max_items: 12,
    items: []
  }
  isPanelEditMode.value = false
  panelDialogVisible.value = true
}

/** 面板命令处理 */
const handlePanelCommand = ({ action, panel }: { action: string, panel: EntryPanel }) => {
  switch (action) {
    case 'edit':
      handleEditPanel(panel)
      break
    case 'copy':
      handleCopyPanel(panel)
      break
    case 'toggle':
      handleTogglePanelStatus(panel)
      break
    case 'delete':
      handleDeletePanel(panel)
      break
  }
}

/** 编辑面板 */
const handleEditPanel = (panel: EntryPanel) => {
  currentPanel.value = { ...panel }
  isPanelEditMode.value = true
  panelDialogVisible.value = true
}

/** 复制面板 */
const handleCopyPanel = (panel: EntryPanel) => {
  currentPanel.value = {
    ...panel,
    id: undefined,
    title: `${panel.title} - 副本`,
    sort_order: panelList.value.length + 1,
    items: panel.items?.map(item => ({ ...item, id: undefined }))
  }
  isPanelEditMode.value = false
  panelDialogVisible.value = true
}

/** 切换面板状态 */
const handleTogglePanelStatus = async (panel: EntryPanel) => {
  try {
    const newStatus = !panel.is_enabled
    await portalConfigApi.entryPanel.toggleEntryPanelStatus(panel.id!, newStatus)
    panel.is_enabled = newStatus
    ElMessage.success(`面板已${newStatus ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('切换面板状态失败:', error)
    ElMessage.error('切换面板状态失败')
  }
}

/** 删除面板 */
const handleDeletePanel = async (panel: EntryPanel) => {
  const itemCount = panel.items?.length || 0
  const message = itemCount > 0
    ? `确定要删除面板 "${panel.title}" 及其 ${itemCount} 个入口项吗？此操作不可恢复。`
    : `确定要删除面板 "${panel.title}" 吗？此操作不可恢复。`

  try {
    await ElMessageBox.confirm(message, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })

    await portalConfigApi.entryPanel.deleteEntryPanel(panel.id!)
    ElMessage.success('面板删除成功')
    await fetchPanelData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除面板失败:', error)
      ElMessage.error('删除面板失败')
    }
  }
}

/** 创建入口项 */
const handleCreateItem = (panel: EntryPanel) => {
  currentItem.value = {
    panel_id: panel.id!,
    name: '',
    icon: 'Document',
    description: '',
    bg_color: '#409EFF',
    text_color: '#FFFFFF',
    type: 'route',
    path: '',
    target: '_self',
    sort_order: (panel.items?.length || 0) + 1,
    is_enabled: true,
    roles: []
  }
  isItemEditMode.value = false
  itemDialogVisible.value = true
}

/** 编辑入口项 */
const handleEditItem = (item: EntryItem) => {
  currentItem.value = { ...item }
  isItemEditMode.value = true
  itemDialogVisible.value = true
}

/** 删除入口项 */
const handleDeleteItem = async (item: EntryItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除入口项 "${item.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await portalConfigApi.entryItem.deleteEntryItem(item.id!)
    ElMessage.success('入口项删除成功')
    await fetchPanelData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除入口项失败:', error)
      ElMessage.error('删除入口项失败')
    }
  }
}

/** 预览效果 */
const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

/** 创建快照 */
const handleCreateSnapshot = () => {
  snapshotDialogVisible.value = true
}

/** 面板编辑成功 */
const handlePanelEditSuccess = () => {
  panelDialogVisible.value = false
  fetchPanelData()
}

/** 入口项编辑成功 */
const handleItemEditSuccess = () => {
  itemDialogVisible.value = false
  fetchPanelData()
}

/** 快照创建成功 */
const handleSnapshotSuccess = () => {
  snapshotDialogVisible.value = false
  ElMessage.success('配置快照创建成功')
}
</script>

<style lang="scss" scoped>
// ================================
// CSS 变量定义
// ================================
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  --warning-gradient: linear-gradient(135deg, #fdc830 0%, #f37335 100%);
  --danger-gradient: linear-gradient(135deg, #fc466b 0%, #3f5efb 100%);
  
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-base: 0 4px 16px rgba(0, 0, 0, 0.12);
  --shadow-heavy: 0 8px 32px rgba(0, 0, 0, 0.16);
  
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// ================================
// 主容器
// ================================
.entry-panel-management {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 60px);

  .page-header {
    background: white;
    padding: 28px 32px;
    margin: -24px -24px 24px -24px;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: var(--shadow-light);
    
    .page-title {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 800;
      background: var(--primary-gradient);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      display: inline-block;
    }

    .page-description {
      margin: 0;
      color: #64748b;
      font-size: 16px;
      line-height: 1.6;
    }
  }

  .operation-bar {
    background: white;
    padding: 20px 24px;
    margin-bottom: 24px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    border: 1px solid rgba(255, 255, 255, 0.8);

    :deep(.el-input) {
      .el-input__wrapper {
        border-radius: 10px;
        transition: var(--transition);
        
        &:hover, &:focus-within {
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
        }
      }
    }

    :deep(.el-select) {
      .el-select__wrapper {
        border-radius: 10px;
        transition: var(--transition);
      }
    }

    :deep(.el-button.is-circle) {
      transition: var(--transition);
      
      &:hover {
        transform: scale(1.1) rotate(180deg);
        box-shadow: var(--shadow-light);
      }
    }
  }
}

// ================================
// 面板网格
// ================================
.panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 24px;
  
  .panel-card {
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-base);
    transition: var(--transition);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.8);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-heavy);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-bottom: 1px solid #e4e7ed;

      .panel-title-section {
        display: flex;
        align-items: center;
        gap: 12px;

        .drag-handle {
          cursor: grab;
          color: #94a3b8;
          padding: 4px;
          border-radius: 6px;
          transition: var(--transition);
          
          &:hover {
            color: #667eea;
            background: rgba(102, 126, 234, 0.1);
            transform: scale(1.1);
          }
          
          &:active {
            cursor: grabbing;
          }
        }

        .panel-title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
        }

        .status-tag {
          border-radius: 20px;
          font-weight: 600;
          font-size: 11px;
        }
      }

      .panel-actions {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.el-button) {
          border-radius: 8px;
          transition: var(--transition);
          
          &:hover {
            transform: translateY(-1px);
          }
        }
      }
    }

    .panel-description {
      padding: 16px 24px;
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
      background: #fafbfc;
      border-bottom: 1px solid #f1f5f9;
    }

    // 入口项网格
    .entry-items-grid {
      padding: 20px;

      .items-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 16px;
        margin-bottom: 16px;

        .entry-item {
          background: #f8fafc;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
            transition: left 0.5s ease;
          }

          &:hover {
            border-color: #667eea;
            background: white;
            transform: translateY(-2px);
            box-shadow: var(--shadow-base);
            
            &::before {
              left: 100%;
            }

            .item-actions {
              opacity: 1;
              transform: translateX(0);
            }
          }

          &.disabled {
            opacity: 0.6;
            filter: grayscale(0.5);
          }

          .item-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            transition: var(--transition);
            
            img {
              width: 28px;
              height: 28px;
              object-fit: cover;
              border-radius: 6px;
            }
          }

          .item-info {
            .item-name {
              font-size: 14px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 4px;
              line-height: 1.3;
            }

            .item-description {
              font-size: 12px;
              color: #64748b;
              margin-bottom: 8px;
              line-height: 1.4;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }

            .item-meta {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 11px;

              .click-count {
                color: #94a3b8;
                font-weight: 500;
              }
            }
          }

          .item-actions {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: 4px;
            opacity: 0;
            transform: translateX(10px);
            transition: var(--transition);

            :deep(.el-button) {
              width: 28px;
              height: 28px;
              min-height: 28px;
              padding: 0;
              
              &.el-button--primary {
                background: var(--primary-gradient);
                border: none;
              }
              
              &.el-button--danger {
                background: var(--danger-gradient);
                border: none;
              }
            }
          }
        }
      }

      .add-item-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        cursor: pointer;
        transition: var(--transition);
        color: #64748b;
        background: #f8fafc;

        &:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: translateY(-2px);
        }

        span {
          margin-top: 8px;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    // 面板统计
    .panel-stats {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;

      .stat-item {
        text-align: center;

        .stat-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;

          &.success {
            color: #059669;
          }

          &.primary {
            color: #667eea;
          }
        }
      }
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    display: flex;
    justify-content: center;
    padding: 60px 20px;
  }
}

// ================================
// 拖拽状态
// ================================
:global(.ghost-panel) {
  opacity: 0.5;
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
  transform: rotate(2deg);
}

:global(.chosen-panel) {
  transform: scale(1.02);
  box-shadow: var(--shadow-heavy);
  z-index: 1000;
}

:global(.drag-panel) {
  background: white;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  transform: rotate(-2deg);
}

:global(.ghost-item) {
  opacity: 0.5;
  background: rgba(102, 126, 234, 0.1);
  border: 2px dashed #667eea;
}

// ================================
// 响应式设计
// ================================
@media (max-width: 1200px) {
  .entry-panel-management {
    padding: 20px;
    
    .page-header {
      margin: -20px -20px 20px -20px;
      padding: 24px;
    }

    .panel-grid {
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
    }
  }
}

@media (max-width: 768px) {
  .entry-panel-management {
    padding: 16px;
    
    .page-header {
      margin: -16px -16px 16px -16px;
      padding: 20px;
      
      .page-title {
        font-size: 28px;
      }

      .el-row .el-col:last-child {
        margin-top: 16px;
        text-align: left;
      }
    }

    .operation-bar {
      padding: 16px 20px;
      
      .el-row .el-col {
        margin-bottom: 12px;
        
        &:last-child {
          text-align: left;
        }
      }
    }

    .panel-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      
      .panel-card {
        .entry-items-grid .items-container {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }
      }
    }
  }
}
</style>