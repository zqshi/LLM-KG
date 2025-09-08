<template>
  <div class="table-cell" :class="`cell-${type}`">
    <!-- 文本类型 -->
    <span v-if="type === 'text'" class="cell-text">
      {{ displayValue }}
    </span>

    <!-- 数字类型 -->
    <span v-else-if="type === 'number'" class="cell-number">
      {{ formatNumber(value) }}
    </span>

    <!-- 日期类型 -->
    <span v-else-if="type === 'date'" class="cell-date">
      {{ formatDate(value) }}
    </span>

    <!-- 状态类型 -->
    <el-tag 
      v-else-if="type === 'status'" 
      :type="getStatusType(value)"
      :effect="options?.effect || 'light'"
      size="small"
    >
      {{ getStatusLabel(value) }}
    </el-tag>

    <!-- 标签类型 -->
    <div v-else-if="type === 'tag'" class="cell-tags">
      <el-tag
        v-for="(tag, index) in getTagList(value)"
        :key="index"
        :type="getTagType(tag)"
        size="small"
        :closable="options?.closable"
        @close="handleTagClose(tag)"
      >
        {{ tag }}
      </el-tag>
    </div>

    <!-- 图片类型 -->
    <div v-else-if="type === 'image'" class="cell-image">
      <el-avatar 
        :size="options?.size || 40"
        :shape="options?.shape || 'circle'"
        :src="value"
        :alt="options?.alt"
        @error="handleImageError"
      >
        <el-icon><Picture /></el-icon>
      </el-avatar>
    </div>

    <!-- 链接类型 -->
    <el-link 
      v-else-if="type === 'link'"
      :href="getLinkUrl(value)"
      :type="options?.linkType || 'primary'"
      :underline="options?.underline !== false"
      :disabled="options?.disabled"
      @click="handleLinkClick"
    >
      {{ getLinkText(value) }}
    </el-link>

    <!-- 进度条类型 -->
    <div v-else-if="type === 'progress'" class="cell-progress">
      <el-progress
        :percentage="Number(value)"
        :type="options?.type || 'line'"
        :stroke-width="options?.strokeWidth || 6"
        :show-text="options?.showText !== false"
        :status="getProgressStatus(value)"
      />
    </div>

    <!-- 评分类型 -->
    <el-rate
      v-else-if="type === 'rating'"
      :model-value="Number(value)"
      :disabled="true"
      :show-score="options?.showScore"
      :score-template="options?.scoreTemplate"
      :max="options?.max || 5"
      :colors="options?.colors"
      size="small"
    />

    <!-- 开关类型 -->
    <el-switch
      v-else-if="type === 'switch'"
      :model-value="Boolean(value)"
      :disabled="options?.disabled"
      @change="handleSwitchChange"
    />

    <!-- 操作按钮类型 -->
    <div v-else-if="type === 'actions'" class="cell-actions">
      <el-button
        v-for="action in options?.actions || []"
        :key="action.key"
        :type="action.type || 'text'"
        :size="action.size || 'small'"
        :icon="action.icon"
        :loading="action.loading"
        :disabled="action.disabled"
        @click="handleActionClick(action)"
      >
        {{ action.label }}
      </el-button>
    </div>

    <!-- 自定义HTML类型 -->
    <div v-else-if="type === 'html'" class="cell-html" v-html="value"></div>

    <!-- 默认文本 -->
    <span v-else class="cell-default">
      {{ displayValue }}
    </span>

    <!-- 复制按钮 -->
    <el-button
      v-if="options?.copyable"
      type="text"
      size="small"
      :icon="DocumentCopy"
      @click="handleCopy"
      class="cell-copy-btn"
      title="复制"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture, DocumentCopy } from '@element-plus/icons-vue'
import type { TableColumn } from './Table.vue'

// Props
interface Props {
  type?: string
  value: any
  options?: Record<string, any>
  row?: Record<string, any>
  column?: TableColumn
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  options: () => ({})
})

// Emits
interface Emits {
  (e: 'action', action: string): void
}

const emit = defineEmits<Emits>()

// Computed
const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) {
    return props.options?.placeholder || '--'
  }
  return String(props.value)
})

// 格式化方法
const formatNumber = (val: any): string => {
  if (val === null || val === undefined) return '--'
  
  const num = Number(val)
  if (isNaN(num)) return String(val)
  
  const options = props.options
  if (options?.currency) {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: options.currency
    }).format(num)
  }
  
  if (options?.percent) {
    return `${(num * 100).toFixed(options.decimals || 2)}%`
  }
  
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: options?.decimals || 0,
    maximumFractionDigits: options?.decimals || 2
  })
}

const formatDate = (val: any): string => {
  if (!val) return '--'
  
  const date = new Date(val)
  if (isNaN(date.getTime())) return String(val)
  
  const format = props.options?.format || 'YYYY-MM-DD HH:mm:ss'
  
  // 简单的日期格式化
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

const getStatusType = (val: any): string => {
  const statusMap = props.options?.statusMap || {
    active: 'success',
    inactive: 'info',
    pending: 'warning',
    error: 'danger',
    success: 'success',
    warning: 'warning',
    danger: 'danger'
  }
  
  return statusMap[val] || 'info'
}

const getStatusLabel = (val: any): string => {
  const labelMap = props.options?.labelMap || {
    active: '启用',
    inactive: '禁用',
    pending: '待处理',
    error: '错误',
    success: '成功',
    warning: '警告',
    danger: '危险'
  }
  
  return labelMap[val] || String(val)
}

const getTagList = (val: any): string[] => {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') return val.split(',').map(s => s.trim())
  return [String(val)]
}

const getTagType = (tag: string): string => {
  const typeMap = props.options?.tagTypeMap || {}
  return typeMap[tag] || ''
}

const getLinkUrl = (val: any): string => {
  if (typeof val === 'object' && val?.url) return val.url
  return String(val)
}

const getLinkText = (val: any): string => {
  if (typeof val === 'object' && val?.text) return val.text
  return String(val)
}

const getProgressStatus = (val: any): string => {
  const num = Number(val)
  if (num === 100) return 'success'
  if (num >= 80) return ''
  if (num >= 60) return 'warning'
  return 'exception'
}

// 事件处理
const handleImageError = () => {
  console.log('Image load error')
}

const handleLinkClick = (event: Event) => {
  if (props.options?.preventDefault) {
    event.preventDefault()
    emit('action', 'link-click')
  }
}

const handleSwitchChange = (value: boolean) => {
  emit('action', value ? 'switch-on' : 'switch-off')
}

const handleActionClick = (action: any) => {
  emit('action', action.key)
}

const handleTagClose = (tag: string) => {
  emit('action', `tag-close:${tag}`)
}

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(String(props.value))
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped lang="scss">
@use '../../styles/core/mixins' as *;

.table-cell {
  @include flex-center;
  justify-content: flex-start;
  gap: var(--spacing-xs);
  min-height: 24px;
  
  &.cell-text,
  &.cell-default {
    .cell-text,
    .cell-default {
      @include text-ellipsis;
      max-width: 200px;
    }
  }
  
  &.cell-number {
    .cell-number {
      font-family: var(--font-family-mono);
      font-weight: var(--font-weight-medium);
    }
  }
  
  &.cell-date {
    .cell-date {
      color: var(--color-text-secondary);
      font-size: var(--text-sm);
    }
  }
  
  &.cell-tags {
    .cell-tags {
      @include flex-center;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    }
  }
  
  &.cell-image {
    .cell-image {
      @include flex-center;
    }
  }
  
  &.cell-progress {
    .cell-progress {
      width: 100%;
      max-width: 120px;
    }
  }
  
  &.cell-actions {
    .cell-actions {
      @include flex-center;
      gap: var(--spacing-xs);
    }
  }

  .cell-copy-btn {
    opacity: 0;
    transition: opacity var(--transition-fast);
    padding: var(--spacing-xs);
    margin-left: var(--spacing-xs);
  }

  &:hover .cell-copy-btn {
    opacity: 1;
  }
}

// 状态标签样式
:deep(.el-tag) {
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

// 进度条样式
:deep(.el-progress) {
  .el-progress-bar__outer {
    border-radius: var(--radius-sm);
  }
  
  .el-progress-bar__inner {
    border-radius: var(--radius-sm);
  }
}

// 评分样式
:deep(.el-rate) {
  .el-rate__item {
    margin-right: 2px;
  }
}

// 开关样式
:deep(.el-switch) {
  .el-switch__core {
    border-radius: var(--radius-full);
  }
}

// 链接样式
:deep(.el-link) {
  font-size: inherit;
  
  &.el-link--primary {
    color: var(--color-primary);
    
    &:hover {
      color: var(--color-primary-hover);
    }
  }
}
</style>