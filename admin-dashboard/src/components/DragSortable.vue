<template>
  <div class="drag-sortable-container">
    <TransitionGroup
      name="drag-list"
      tag="div"
      class="drag-list"
      :class="{ 'is-dragging': isDragging }"
    >
      <div
        v-for="(item, index) in localItems"
        :key="getItemKey(item)"
        :class="[
          'drag-item',
          {
            'is-dragging': dragState.dragIndex === index,
            'is-drop-target': dragState.dropIndex === index,
            'is-disabled': isItemDisabled(item)
          }
        ]"
        :draggable="!isItemDisabled(item)"
        @dragstart="handleDragStart($event, index)"
        @dragend="handleDragEnd"
        @dragover="handleDragOver($event, index)"
        @dragenter="handleDragEnter($event, index)"
        @dragleave="handleDragLeave"
        @drop="handleDrop($event, index)"
      >
        <!-- 拖拽手柄 -->
        <div 
          v-if="showHandle && !isItemDisabled(item)"
          class="drag-handle"
          @mousedown="handleMouseDown"
        >
          <el-icon><Rank /></el-icon>
        </div>

        <!-- 内容插槽 -->
        <div class="drag-content">
          <slot 
            :item="item" 
            :index="index" 
            :is-dragging="dragState.dragIndex === index"
            :is-drop-target="dragState.dropIndex === index"
          />
        </div>

        <!-- 拖拽指示器 -->
        <div 
          v-if="dragState.dropIndex === index && isDragging"
          class="drop-indicator"
          :class="dragState.dropPosition"
        />
      </div>
    </TransitionGroup>

    <!-- 空状态 -->
    <div v-if="localItems.length === 0" class="empty-state">
      <slot name="empty">
        <div class="empty-content">
          <el-icon class="empty-icon"><Box /></el-icon>
          <p class="empty-text">暂无数据</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ref, computed, watch, nextTick } from 'vue'
import { Rank, Box } from '@element-plus/icons-vue'
import { usePerformanceMonitor } from '@/utils/performance-monitor'

interface Props<T> {
  items: T[]
  itemKey?: string | ((item: T) => string | number)
  disabled?: boolean
  showHandle?: boolean
  animation?: number
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  disabledItems?: (item: T) => boolean
}

interface Emits<T> {
  (e: 'update:items', items: T[]): void
  (e: 'change', evt: { oldIndex: number; newIndex: number; item: T }): void
  (e: 'start', evt: { oldIndex: number; item: T }): void
  (e: 'end', evt: { oldIndex: number; newIndex: number; item: T }): void
}

const props = withDefaults(defineProps<Props<T>>(), {
  itemKey: 'id',
  disabled: false,
  showHandle: true,
  animation: 300,
  ghostClass: 'drag-ghost',
  chosenClass: 'drag-chosen',
  dragClass: 'drag-drag',
  disabledItems: () => false
})

const emit = defineEmits<Emits<T>>()

const { recordInteraction, monitorComponentRender } = usePerformanceMonitor()

// 本地状态
const localItems = ref<T[]>([...props.items])
const isDragging = ref(false)

// 拖拽状态
const dragState = ref({
  dragIndex: -1,
  dropIndex: -1,
  dropPosition: 'before' as 'before' | 'after',
  dragItem: null as T | null,
  startY: 0,
  currentY: 0
})

// 计算属性
const getItemKey = (item: T): string | number => {
  if (typeof props.itemKey === 'function') {
    return props.itemKey(item)
  }
  return item[props.itemKey] || item.id || Math.random()
}

const isItemDisabled = (item: T): boolean => {
  return props.disabled || props.disabledItems(item)
}

// 监听外部数据变化
watch(
  () => props.items,
  (newItems) => {
    localItems.value = [...newItems]
  },
  { deep: true }
)

// 拖拽事件处理
const handleDragStart = (event: DragEvent, index: number) => {
  if (isItemDisabled(localItems.value[index])) {
    event.preventDefault()
    return
  }

  monitorComponentRender('drag-start', () => {
    isDragging.value = true
    dragState.value.dragIndex = index
    dragState.value.dragItem = localItems.value[index]
    dragState.value.startY = event.clientY

    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(index))
    }

    // 添加拖拽样式
    const target = event.target as HTMLElement
    target.classList.add(props.chosenClass)

    recordInteraction('drag-start', 'sortable-list')
    
    emit('start', { 
      oldIndex: index, 
      item: localItems.value[index] 
    })
  })
}

const handleDragEnd = (event: DragEvent) => {
  monitorComponentRender('drag-end', () => {
    const target = event.target as HTMLElement
    target.classList.remove(props.chosenClass, props.dragClass)

    // 如果有实际的位置变化，执行移动
    if (dragState.value.dragIndex !== -1 && 
        dragState.value.dropIndex !== -1 && 
        dragState.value.dragIndex !== dragState.value.dropIndex) {
      
      const newItems = [...localItems.value]
      const dragItem = newItems.splice(dragState.value.dragIndex, 1)[0]
      
      let insertIndex = dragState.value.dropIndex
      if (dragState.value.dropPosition === 'after') {
        insertIndex += 1
      }
      if (dragState.value.dragIndex < insertIndex) {
        insertIndex -= 1
      }
      
      newItems.splice(insertIndex, 0, dragItem)
      
      localItems.value = newItems
      emit('update:items', newItems)
      emit('change', {
        oldIndex: dragState.value.dragIndex,
        newIndex: insertIndex,
        item: dragItem
      })
      
      recordInteraction('drag-reorder', 'sortable-list')
    }

    emit('end', {
      oldIndex: dragState.value.dragIndex,
      newIndex: dragState.value.dropIndex,
      item: dragState.value.dragItem!
    })

    // 重置状态
    resetDragState()
  })
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  
  if (dragState.value.dragIndex === index) return

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const midY = rect.top + rect.height / 2
  const position = event.clientY < midY ? 'before' : 'after'

  dragState.value.dropIndex = index
  dragState.value.dropPosition = position
  dragState.value.currentY = event.clientY
}

const handleDragEnter = (event: DragEvent, index: number) => {
  event.preventDefault()
  
  if (dragState.value.dragIndex !== index) {
    const target = event.currentTarget as HTMLElement
    target.classList.add('drag-over')
  }
}

const handleDragLeave = (event: DragEvent) => {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')
}

const handleDrop = (event: DragEvent, index: number) => {
  event.preventDefault()
  
  const target = event.currentTarget as HTMLElement
  target.classList.remove('drag-over')
}

const handleMouseDown = (event: MouseEvent) => {
  // 为拖拽手柄添加视觉反馈
  const handle = event.currentTarget as HTMLElement
  handle.style.cursor = 'grabbing'
  
  const handleMouseUp = () => {
    handle.style.cursor = 'grab'
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mouseup', handleMouseUp)
}

const resetDragState = () => {
  isDragging.value = false
  dragState.value = {
    dragIndex: -1,
    dropIndex: -1,
    dropPosition: 'before',
    dragItem: null,
    startY: 0,
    currentY: 0
  }
}

// 公共方法
const moveItem = (fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex) return
  
  const newItems = [...localItems.value]
  const item = newItems.splice(fromIndex, 1)[0]
  newItems.splice(toIndex, 0, item)
  
  localItems.value = newItems
  emit('update:items', newItems)
  emit('change', { oldIndex: fromIndex, newIndex: toIndex, item })
  
  recordInteraction('programmatic-move', 'sortable-list')
}

const insertItem = (item: T, index?: number) => {
  const newItems = [...localItems.value]
  const insertIndex = index ?? newItems.length
  newItems.splice(insertIndex, 0, item)
  
  localItems.value = newItems
  emit('update:items', newItems)
  
  recordInteraction('item-inserted', 'sortable-list')
}

const removeItem = (index: number) => {
  const newItems = [...localItems.value]
  const removedItem = newItems.splice(index, 1)[0]
  
  localItems.value = newItems
  emit('update:items', newItems)
  
  recordInteraction('item-removed', 'sortable-list')
  return removedItem
}

// 暴露方法给父组件
defineExpose({
  moveItem,
  insertItem,
  removeItem,
  resetDragState
})
</script>

<style scoped lang="scss">
.drag-sortable-container {
  position: relative;
}

.drag-list {
  min-height: 50px;
  
  &.is-dragging {
    .drag-item:not(.is-dragging) {
      transition: transform 0.3s ease;
    }
  }
}

.drag-item {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
  cursor: default;
  
  &:hover:not(.is-disabled) {
    border-color: #c0c4cc;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.is-dragging {
    opacity: 0.5;
    transform: rotate(2deg);
    z-index: 1000;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  
  &.is-drop-target {
    border-color: #409eff;
    background: #f0f9ff;
  }
  
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
    
    .drag-handle {
      display: none;
    }
  }
  
  &.drag-over {
    border-color: #409eff;
    background: #f0f9ff;
  }
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 100%;
  color: #c0c4cc;
  cursor: grab;
  transition: color 0.2s ease;
  
  &:hover {
    color: #409eff;
  }
  
  &:active {
    cursor: grabbing;
  }
}

.drag-content {
  flex: 1;
  min-height: 50px;
  display: flex;
  align-items: center;
}

.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
  z-index: 10;
  
  &.before {
    top: -1px;
  }
  
  &.after {
    bottom: -1px;
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -4px;
    top: -2px;
    width: 6px;
    height: 6px;
    background: #409eff;
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    right: -4px;
    top: -2px;
    width: 6px;
    height: 6px;
    background: #409eff;
    border-radius: 50%;
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #909399;
  
  .empty-content {
    text-align: center;
    
    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-text {
      margin: 0;
      font-size: 14px;
    }
  }
}

// 动画效果
.drag-list-move,
.drag-list-enter-active,
.drag-list-leave-active {
  transition: all 0.3s ease;
}

.drag-list-enter-from,
.drag-list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.drag-list-leave-active {
  position: absolute;
  right: 0;
  left: 0;
}

// 拖拽样式类
:global(.drag-ghost) {
  opacity: 0.5;
  background: #f0f9ff;
  border: 2px dashed #409eff;
}

:global(.drag-chosen) {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:global(.drag-drag) {
  transform: rotate(2deg);
  z-index: 1000;
}

// 响应式设计
@media (max-width: 768px) {
  .drag-handle {
    width: 32px;
  }
  
  .drag-item {
    margin-bottom: 6px;
  }
}
</style>