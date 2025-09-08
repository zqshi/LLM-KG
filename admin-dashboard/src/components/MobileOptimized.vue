<template>
  <div class="mobile-optimized" :class="{ 'is-mobile': isMobile, 'is-tablet': isTablet }">
    <!-- 移动端头部 -->
    <div v-if="isMobile" class="mobile-header">
      <div class="mobile-title">
        <slot name="mobile-title">
          <h3>{{ title }}</h3>
        </slot>
      </div>
      <div class="mobile-actions">
        <slot name="mobile-actions" />
      </div>
    </div>

    <!-- 桌面端内容 -->
    <div v-if="!isMobile" class="desktop-content">
      <slot name="desktop" />
    </div>

    <!-- 移动端内容 -->
    <div v-else class="mobile-content">
      <!-- 标签页导航 -->
      <div v-if="tabs.length > 0" class="mobile-tabs">
        <div class="tab-scroll">
          <div 
            v-for="tab in tabs" 
            :key="tab.key"
            class="tab-item"
            :class="{ active: activeTab === tab.key }"
            @click="handleTabChange(tab.key)"
          >
            <el-icon v-if="tab.icon">
              <component :is="tab.icon" />
            </el-icon>
            <span>{{ tab.label }}</span>
          </div>
        </div>
      </div>

      <!-- 标签页内容 -->
      <div class="mobile-tab-content">
        <slot name="mobile" :active-tab="activeTab" />
      </div>
    </div>

    <!-- 移动端底部操作栏 -->
    <div v-if="isMobile && showBottomActions" class="mobile-bottom-actions">
      <slot name="bottom-actions">
        <Button 
          v-for="action in bottomActions" 
          :key="action.key"
          :type="action.type"
          :icon="action.icon"
          :loading="action.loading"
          @click="action.handler"
          class="bottom-action-btn"
        >
          {{ action.label }}
        </Button>
      </slot>
    </div>

    <!-- 移动端抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerTitle"
      direction="btt"
      size="80%"
      class="mobile-drawer"
    >
      <slot name="drawer" :close-drawer="closeDrawer" />
    </el-drawer>

    <!-- 移动端操作表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="isMobile ? '95%' : '600px'"
      :fullscreen="isMobile"
      class="mobile-dialog"
    >
      <slot name="dialog" :close-dialog="closeDialog" />
      
      <template #footer v-if="showDialogFooter">
        <div class="dialog-footer">
          <Button @click="closeDialog">取消</Button>
          <Button type="primary" @click="handleDialogConfirm" :loading="dialogLoading">
            确认
          </Button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Button from '@/components/common/Button.vue'
// 临时注释掉 useBreakpoints 导入，因为缺少 @vueuse/core 依赖
// import { useBreakpoints } from '@vueuse/core'

interface Tab {
  key: string
  label: string
  icon?: string
}

interface BottomAction {
  key: string
  label: string
  type?: 'primary' | 'secondary' | 'text'
  icon?: string
  loading?: boolean
  handler: () => void
}

interface Props {
  title?: string
  tabs?: Tab[]
  defaultTab?: string
  bottomActions?: BottomAction[]
  showBottomActions?: boolean
  drawerTitle?: string
  dialogTitle?: string
  showDialogFooter?: boolean
}

interface Emits {
  (e: 'tab-change', tab: string): void
  (e: 'dialog-confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  tabs: () => [],
  defaultTab: '',
  bottomActions: () => [],
  showBottomActions: true,
  drawerTitle: '',
  dialogTitle: '',
  showDialogFooter: true
})

const emit = defineEmits<Emits>()

// 临时使用 window.innerWidth 替代 useBreakpoints
const isMobile = ref(window.innerWidth < 768)
const isTablet = ref(window.innerWidth >= 768 && window.innerWidth < 1200)
const isDesktop = ref(window.innerWidth >= 1200)

// 监听窗口大小变化
onMounted(() => {
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
    isTablet.value = window.innerWidth >= 768 && window.innerWidth < 1200
    isDesktop.value = window.innerWidth >= 1200
  }

  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
})

// 标签页状态
const activeTab = ref(props.defaultTab || (props.tabs[0]?.key ?? ''))

// 抽屉状态
const drawerVisible = ref(false)

// 对话框状态
const dialogVisible = ref(false)
const dialogLoading = ref(false)

// 方法
const handleTabChange = (tab: string) => {
  activeTab.value = tab
  emit('tab-change', tab)
}

const openDrawer = () => {
  drawerVisible.value = true
}

const closeDrawer = () => {
  drawerVisible.value = false
}

const openDialog = () => {
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  dialogLoading.value = false
}

const handleDialogConfirm = () => {
  emit('dialog-confirm')
}

const setDialogLoading = (loading: boolean) => {
  dialogLoading.value = loading
}

// 触摸手势支持
let touchStartX = 0
let touchStartY = 0

const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX
  touchStartY = event.touches[0].clientY
}

const handleTouchEnd = (event: TouchEvent) => {
  const touchEndX = event.changedTouches[0].clientX
  const touchEndY = event.changedTouches[0].clientY
  
  const deltaX = touchEndX - touchStartX
  const deltaY = touchEndY - touchStartY
  
  // 水平滑动切换标签页
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
    const currentIndex = props.tabs.findIndex(tab => tab.key === activeTab.value)
    
    if (deltaX > 0 && currentIndex > 0) {
      // 向右滑动，切换到上一个标签页
      handleTabChange(props.tabs[currentIndex - 1].key)
    } else if (deltaX < 0 && currentIndex < props.tabs.length - 1) {
      // 向左滑动，切换到下一个标签页
      handleTabChange(props.tabs[currentIndex + 1].key)
    }
  }
}

// 生命周期
onMounted(() => {
  if (isMobile.value) {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  if (isMobile.value) {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})

// 暴露方法
defineExpose({
  openDrawer,
  closeDrawer,
  openDialog,
  closeDialog,
  setDialogLoading,
  isMobile,
  isTablet,
  isDesktop
})
</script>

<style scoped lang="scss">
.mobile-optimized {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &.is-mobile {
    .desktop-content {
      display: none;
    }
  }
  
  &:not(.is-mobile) {
    .mobile-content,
    .mobile-header,
    .mobile-bottom-actions {
      display: none;
    }
  }
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .mobile-title {
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .mobile-actions {
    display: flex;
    gap: 8px;
  }
}

.desktop-content {
  flex: 1;
  overflow: hidden;
}

.mobile-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-tabs {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  
  .tab-scroll {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .tab-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 12px 16px;
      white-space: nowrap;
      color: #606266;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 2px solid transparent;
      
      &:hover {
        color: #409eff;
        background: #f0f9ff;
      }
      
      &.active {
        color: #409eff;
        border-bottom-color: #409eff;
        background: #f0f9ff;
      }
      
      .el-icon {
        font-size: 16px;
      }
    }
  }
}

.mobile-tab-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
  background: #f5f5f5;
}

.mobile-bottom-actions {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  
  .bottom-action-btn {
    flex: 1;
    height: 44px;
    font-size: 16px;
  }
}

// 移动端抽屉样式
:deep(.mobile-drawer) {
  .el-drawer__header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    .el-drawer__title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .el-drawer__body {
    padding: 16px;
  }
}

// 移动端对话框样式
:deep(.mobile-dialog) {
  .el-dialog__header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .el-dialog__body {
    padding: 16px;
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .el-dialog__footer {
    padding: 16px;
    border-top: 1px solid #e4e7ed;
    
    .dialog-footer {
      display: flex;
      gap: 12px;
      
      .el-button {
        flex: 1;
        height: 44px;
        font-size: 16px;
      }
    }
  }
}

// 触摸友好的交互元素
.touch-friendly {
  min-height: 44px;
  min-width: 44px;
  
  .el-button {
    min-height: 44px;
    padding: 12px 16px;
    font-size: 16px;
  }
  
  .el-input {
    .el-input__inner {
      height: 44px;
      font-size: 16px;
    }
  }
  
  .el-select {
    .el-input__inner {
      height: 44px;
      font-size: 16px;
    }
  }
}

// 平板端适配
@media (min-width: 768px) and (max-width: 1024px) {
  .mobile-tabs {
    .tab-scroll {
      .tab-item {
        padding: 14px 20px;
        font-size: 15px;
      }
    }
  }
  
  .mobile-tab-content {
    padding: 20px;
  }
  
  .mobile-bottom-actions {
    padding: 16px 20px;
    
    .bottom-action-btn {
      height: 48px;
    }
  }
}

// 大屏幕适配
@media (min-width: 1200px) {
  .desktop-content {
    padding: 24px;
  }
}

// 动画效果
.tab-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-tab-content {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .tab-item {
    border: 1px solid;
    
    &.active {
      background: #000;
      color: #fff;
    }
  }
}
</style>