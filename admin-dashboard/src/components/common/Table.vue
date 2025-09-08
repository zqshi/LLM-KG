<template>
  <div class="unified-table-container" :class="{ 'table-loading': loading }">
    <!-- 表格头部操作区 -->
    <div class="table-header" v-if="showHeader">
      <div class="table-header-left">
        <div class="table-title" v-if="title">
          <h3>{{ title }}</h3>
          <span class="table-subtitle" v-if="subtitle">{{ subtitle }}</span>
        </div>
        <div class="table-summary" v-if="showSummary">
          <span class="summary-text">
            共 <strong>{{ total }}</strong> 条记录
            <span v-if="selectedRows.length > 0">
              ，已选择 <strong>{{ selectedRows.length }}</strong> 条
            </span>
          </span>
        </div>
      </div>
      
      <div class="table-header-right">
        <slot name="toolbar">
          <div class="table-toolbar">
            <!-- 刷新按钮 -->
            <el-button 
              v-if="showRefresh"
              :icon="Refresh" 
              circle 
              @click="handleRefresh"
              :loading="loading"
              title="刷新数据"
            />
            
            <!-- 列配置按钮 -->
            <el-button 
              v-if="showColumnConfig"
              :icon="Setting" 
              circle 
              @click="showColumnDialog = true"
              title="列配置"
            />
            
            <!-- 导出按钮 -->
            <el-button 
              v-if="showExport"
              :icon="Download" 
              @click="handleExport"
              title="导出数据"
            >
              导出
            </el-button>
          </div>
        </slot>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div class="table-batch-actions" v-if="selectedRows.length > 0 && batchActions.length > 0">
      <div class="batch-info">
        <el-icon><Select /></el-icon>
        <span>已选择 {{ selectedRows.length }} 项</span>
        <el-button type="text" @click="clearSelection">取消选择</el-button>
      </div>
      
      <div class="batch-buttons">
        <el-button 
          v-for="action in batchActions"
          :key="action.key"
          :type="action.type"
          :icon="action.icon"
          @click="handleBatchAction(action)"
          :loading="action.loading"
        >
          {{ action.label }}
        </el-button>
      </div>
    </div>

    <!-- 主表格 -->
    <div class="table-wrapper">
      <el-table
        ref="tableRef"
        :data="tableData"
        v-bind="$attrs"
        :loading="loading"
        :row-key="rowKey"
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        @row-click="handleRowClick"
        @row-dblclick="handleRowDoubleClick"
        class="unified-table"
      >
        <!-- 选择列 -->
        <el-table-column
          v-if="showSelection"
          type="selection"
          width="50"
          align="center"
          fixed="left"
          :selectable="selectableFunction"
        />
        
        <!-- 序号列 -->
        <el-table-column
          v-if="showIndex"
          type="index"
          label="序号"
          width="60"
          align="center"
          fixed="left"
          :index="getIndexMethod"
        />

        <!-- 动态列 -->
        <template v-for="column in visibleColumns" :key="column.prop">
          <el-table-column
            :prop="column.prop"
            :label="column.label"
            :width="column.width"
            :min-width="column.minWidth"
            :fixed="column.fixed"
            :sortable="column.sortable"
            :align="column.align || 'left'"
            :show-overflow-tooltip="column.showTooltip !== false"
            :class-name="column.className"
          >
            <template #default="{ row, column: col, $index }">
              <slot 
                :name="column.prop" 
                :row="row" 
                :column="col" 
                :index="$index"
                :value="getNestedProperty(row, column.prop)"
              >
                <TableCell
                  :type="column.type"
                  :value="getNestedProperty(row, column.prop)"
                  :options="column.options"
                  :row="row"
                  :column="column"
                  @action="handleCellAction"
                />
              </slot>
            </template>
            
            <template #header="{ column: col }" v-if="column.headerSlot">
              <slot :name="`${column.prop}-header`" :column="col">
                {{ column.label }}
              </slot>
            </template>
          </el-table-column>
        </template>

        <!-- 操作列 -->
        <el-table-column
          v-if="actions.length > 0"
          label="操作"
          :width="actionsWidth"
          :min-width="actionsMinWidth"
          fixed="right"
          align="center"
          class-name="table-actions-column"
        >
          <template #default="{ row, $index }">
            <div class="table-actions">
              <template v-for="(action, actionIndex) in getRowActions(row, $index)" :key="action.key">
                <el-button
                  :type="action.type || 'text'"
                  :size="action.size || 'small'"
                  :icon="action.icon"
                  :loading="action.loading"
                  :disabled="action.disabled"
                  @click="handleAction(action, row, $index)"
                  :class="action.className"
                >
                  {{ action.label }}
                </el-button>
                
                <el-divider 
                  v-if="actionIndex < getRowActions(row, $index).length - 1 && !action.hideDivider"
                  direction="vertical" 
                />
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="table-pagination" v-if="showPagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        :background="true"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <!-- 列配置对话框 -->
    <el-dialog
      v-model="showColumnDialog"
      title="列配置"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="column-config">
        <el-checkbox
          v-model="checkAll"
          :indeterminate="isIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
        
        <el-divider />
        
        <el-checkbox-group v-model="checkedColumns" @change="handleCheckedColumnsChange">
          <draggable v-model="columnConfig" item-key="prop" class="column-list">
            <template #item="{ element }">
              <div class="column-item">
                <el-icon class="drag-handle"><Rank /></el-icon>
                <el-checkbox :value="element.prop">{{ element.label }}</el-checkbox>
              </div>
            </template>
          </draggable>
        </el-checkbox-group>
      </div>
      
      <template #footer>
        <el-button @click="resetColumns">重置</el-button>
        <el-button type="primary" @click="saveColumnConfig">保存</el-button>
      </template>
    </el-dialog>

    <!-- 空状态 -->
    <div class="table-empty" v-if="!loading && tableData.length === 0">
      <el-empty 
        :description="emptyText"
        :image-size="120"
      >
        <template #image>
          <el-icon size="60" color="var(--color-text-tertiary)">
            <Box />
          </el-icon>
        </template>
        
        <el-button v-if="showEmptyAction" type="primary" @click="handleEmptyAction">
          {{ emptyActionText }}
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { ElTable, ElMessage } from 'element-plus'
import { 
  Refresh, Setting, Download, Select, Rank, Box 
} from '@element-plus/icons-vue'
import draggable from 'vuedraggable'
import TableCell from './TableCell.vue'

// Types
export interface TableColumn {
  prop: string
  label: string
  type?: 'text' | 'number' | 'date' | 'status' | 'tag' | 'image' | 'link' | 'progress' | 'rating'
  width?: number
  minWidth?: number
  fixed?: boolean | 'left' | 'right'
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
  showTooltip?: boolean
  className?: string
  headerSlot?: boolean
  options?: any
  visible?: boolean
}

export interface TableAction {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
  size?: 'large' | 'default' | 'small'
  icon?: any
  loading?: boolean
  disabled?: boolean
  className?: string
  hideDivider?: boolean
  show?: (row: any, index: number) => boolean
}

export interface BatchAction {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger'
  icon?: any
  loading?: boolean
}

// Props
interface Props {
  data: any[]
  columns: TableColumn[]
  loading?: boolean
  title?: string
  subtitle?: string
  showHeader?: boolean
  showSelection?: boolean
  showIndex?: boolean
  showPagination?: boolean
  showRefresh?: boolean
  showColumnConfig?: boolean
  showExport?: boolean
  showSummary?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  pageSizes?: number[]
  paginationLayout?: string
  rowKey?: string | ((row: any) => string)
  actions?: TableAction[]
  batchActions?: BatchAction[]
  actionsWidth?: number
  actionsMinWidth?: number
  emptyText?: string
  showEmptyAction?: boolean
  emptyActionText?: string
  selectableFunction?: (row: any, index: number) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  loading: false,
  showHeader: true,
  showSelection: false,
  showIndex: false,
  showPagination: true,
  showRefresh: true,
  showColumnConfig: true,
  showExport: false,
  showSummary: true,
  currentPage: 1,
  pageSize: 20,
  total: 0,
  pageSizes: () => [10, 20, 50, 100],
  paginationLayout: 'total, sizes, prev, pager, next, jumper',
  rowKey: 'id',
  actions: () => [],
  batchActions: () => [],
  actionsWidth: 150,
  actionsMinWidth: 120,
  emptyText: '暂无数据',
  showEmptyAction: false,
  emptyActionText: '新建数据'
})

// Emits
interface Emits {
  (e: 'refresh'): void
  (e: 'page-change', page: number): void
  (e: 'size-change', size: number): void
  (e: 'sort-change', prop: string, order: string): void
  (e: 'selection-change', selection: any[]): void
  (e: 'row-click', row: any, column: any, event: Event): void
  (e: 'row-dblclick', row: any, column: any, event: Event): void
  (e: 'action', action: string, row: any, index: number): void
  (e: 'batch-action', action: string, rows: any[]): void
  (e: 'cell-action', action: string, row: any, column: TableColumn): void
  (e: 'export'): void
  (e: 'empty-action'): void
}

const emit = defineEmits<Emits>()

// Refs
const tableRef = ref<InstanceType<typeof ElTable>>()
const selectedRows = ref<any[]>([])
const showColumnDialog = ref(false)
const columnConfig = ref<TableColumn[]>([])
const checkedColumns = ref<string[]>([])

// Computed
const tableData = computed(() => props.data)

const visibleColumns = computed(() => {
  return props.columns.filter(column => column.visible !== false)
})

const checkAll = computed(() => checkedColumns.value.length === props.columns.length)
const isIndeterminate = computed(() => {
  return checkedColumns.value.length > 0 && checkedColumns.value.length < props.columns.length
})

// Methods
const getNestedProperty = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => o && o[p], obj)
}

const getRowClassName = ({ row, rowIndex }: { row: any, rowIndex: number }) => {
  const classes = []
  if (row.disabled) classes.push('row-disabled')
  if (row.highlighted) classes.push('row-highlighted')
  if (rowIndex % 2 === 1) classes.push('row-odd')
  return classes.join(' ')
}

const getIndexMethod = (index: number) => {
  return (props.currentPage - 1) * props.pageSize + index + 1
}

const getRowActions = (row: any, index: number) => {
  return props.actions.filter(action => {
    if (typeof action.show === 'function') {
      return action.show(row, index)
    }
    return true
  })
}

// Event Handlers
const handleRefresh = () => {
  emit('refresh')
}

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleSortChange = ({ prop, order }: { prop: string, order: string }) => {
  emit('sort-change', prop, order)
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleRowDoubleClick = (row: any, column: any, event: Event) => {
  emit('row-dblclick', row, column, event)
}

const handleAction = (action: TableAction, row: any, index: number) => {
  emit('action', action.key, row, index)
}

const handleBatchAction = (action: BatchAction) => {
  emit('batch-action', action.key, selectedRows.value)
}

const handleCellAction = (action: string, row: any, column: TableColumn) => {
  emit('cell-action', action, row, column)
}

const handleExport = () => {
  emit('export')
}

const handleEmptyAction = () => {
  emit('empty-action')
}

const clearSelection = () => {
  tableRef.value?.clearSelection()
}

// Column Configuration
const initColumnConfig = () => {
  columnConfig.value = [...props.columns]
  checkedColumns.value = props.columns.map(col => col.prop)
}

const handleCheckAllChange = (val: boolean) => {
  checkedColumns.value = val ? props.columns.map(col => col.prop) : []
}

const handleCheckedColumnsChange = (value: string[]) => {
  checkedColumns.value = value
}

const resetColumns = () => {
  initColumnConfig()
  showColumnDialog.value = false
}

const saveColumnConfig = () => {
  // 这里可以保存列配置到本地存储
  ElMessage.success('列配置已保存')
  showColumnDialog.value = false
}

// Lifecycle
onMounted(() => {
  initColumnConfig()
})

// 暴露方法给父组件
defineExpose({
  refresh: handleRefresh,
  clearSelection,
  toggleSelection: (row: any) => tableRef.value?.toggleRowSelection(row),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
  setCurrentRow: (row: any) => tableRef.value?.setCurrentRow(row),
  clearSort: () => tableRef.value?.clearSort(),
  clearFilter: () => tableRef.value?.clearFilter(),
  doLayout: () => tableRef.value?.doLayout(),
  sort: (prop: string, order: string) => tableRef.value?.sort(prop, order)
})
</script>

<style scoped lang="scss">
@use '../../styles/core/mixins' as *;

.unified-table-container {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);

  &.table-loading {
    position: relative;
    pointer-events: none;
  }
}

.table-header {
  @include flex-between;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-lg);

  .table-header-left {
    @include flex-column;
    gap: var(--spacing-sm);
    flex: 1;
    min-width: 0;
  }

  .table-title {
    h3 {
      font-size: var(--text-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      margin: 0;
    }

    .table-subtitle {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin-top: var(--spacing-xs);
    }
  }

  .table-summary {
    .summary-text {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);

      strong {
        color: var(--color-primary);
        font-weight: var(--font-weight-semibold);
      }
    }
  }

  .table-toolbar {
    @include flex-center;
    gap: var(--spacing-sm);
  }
}

.table-batch-actions {
  @include flex-between;
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  margin-bottom: var(--spacing-lg);

  .batch-info {
    @include flex-center;
    gap: var(--spacing-sm);
    color: var(--color-primary);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-medium);
  }

  .batch-buttons {
    @include flex-center;
    gap: var(--spacing-sm);
  }
}

.table-wrapper {
  margin-bottom: var(--spacing-lg);

  :deep(.unified-table) {
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--color-border-light);

    .el-table__header {
      background: var(--color-bg-section);

      th {
        background: transparent;
        border-bottom: 1px solid var(--color-border-light);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-semibold);
        font-size: var(--text-sm);
      }
    }

    .el-table__body {
      tr {
        &:hover {
          background: var(--color-bg-section);
        }

        &.row-disabled {
          opacity: 0.6;
          pointer-events: none;
        }

        &.row-highlighted {
          background: var(--color-primary-light);
        }

        td {
          border-bottom: 1px solid var(--color-border-lighter);
          padding: var(--spacing-md);
        }
      }
    }

    .table-actions-column {
      .table-actions {
        @include flex-center;
        gap: var(--spacing-xs);
        flex-wrap: wrap;
      }
    }
  }
}

.table-pagination {
  @include flex-center;
  justify-content: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);

  :deep(.el-pagination) {
    .el-pagination__total,
    .el-pagination__jump {
      color: var(--color-text-secondary);
    }

    .el-pagination__sizes .el-select .el-input .el-input__wrapper {
      border-radius: var(--radius-md);
    }

    .btn-prev, 
    .btn-next,
    .el-pager li {
      border-radius: var(--radius-sm);
    }
  }
}

.table-empty {
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;

  :deep(.el-empty) {
    .el-empty__description {
      color: var(--color-text-tertiary);
      font-size: var(--text-sm);
    }
  }
}

.column-config {
  .column-list {
    max-height: 300px;
    overflow-y: auto;

    .column-item {
      @include flex-center;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--color-border-lighter);

      &:last-child {
        border-bottom: none;
      }

      .drag-handle {
        cursor: grab;
        color: var(--color-text-tertiary);

        &:active {
          cursor: grabbing;
        }
      }
    }
  }
}

// 响应式适配
@include respond-below(md) {
  .unified-table-container {
    padding: var(--spacing-lg);
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);

    .table-header-right {
      width: 100%;

      .table-toolbar {
        justify-content: flex-start;
      }
    }
  }

  .table-batch-actions {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;

    .batch-buttons {
      justify-content: center;
      flex-wrap: wrap;
    }
  }

  .table-wrapper {
    :deep(.unified-table) {
      font-size: var(--text-sm);

      .table-actions {
        flex-direction: column;
        gap: var(--spacing-xs);

        .el-button {
          width: 100%;
          margin: 0;
        }

        .el-divider {
          display: none;
        }
      }
    }
  }
}
</style>