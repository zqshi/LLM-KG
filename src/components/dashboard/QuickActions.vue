<template>
  <el-card class="quick-actions-card">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <h3 class="card-title">快捷操作</h3>
          <el-text size="small" type="info" class="card-subtitle">
            常用功能一键直达，提升工作效率
          </el-text>
        </div>
        <div class="header-actions">
          <el-tooltip content="自定义快捷操作" placement="top">
            <el-button 
              size="small" 
              :icon="Setting" 
              circle
              @click="handleCustomize"
            />
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="actions-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="actions-loading">
        <el-skeleton animated>
          <template #template>
            <div class="skeleton-grid">
              <el-skeleton-item 
                v-for="i in 8" 
                :key="i"
                variant="button" 
                style="width: 100%; height: 60px;" 
              />
            </div>
          </template>
        </el-skeleton>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="actions-error">
        <el-alert
          title="加载失败"
          :description="error"
          type="error"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 快捷操作网格 -->
      <div v-else class="actions-grid">
        <div
          v-for="action in visibleActions"
          :key="action.id"
          class="action-item"
          :class="`action-${action.type}`"
          @click="handleActionClick(action)"
        >
          <div class="action-icon">
            <el-icon :size="24">
              <component :is="getActionIcon(action.icon)" />
            </el-icon>
          </div>
          <span class="action-label">{{ action.name }}</span>
          
          <!-- 新功能标识 -->
          <el-badge 
            v-if="isNewAction(action)"
            value="新"
            type="danger"
            class="new-badge"
          />
          
          <!-- 热门标识 -->
          <el-tag 
            v-if="isHotAction(action)"
            type="warning"
            size="small"
            class="hot-tag"
          >
            热门
          </el-tag>
        </div>

        <!-- 更多操作入口 -->
        <div 
          v-if="hasMoreActions"
          class="action-item action-more"
          @click="handleShowMore"
        >
          <div class="action-icon">
            <el-icon :size="24">
              <MoreFilled />
            </el-icon>
          </div>
          <span class="action-label">更多</span>
        </div>
      </div>

      <!-- 操作统计 -->
      <div class="actions-stats">
        <div class="stat-item">
          <span class="stat-label">今日使用</span>
          <span class="stat-value">{{ todayUsageCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">总操作数</span>
          <span class="stat-value">{{ totalActionsCount }}</span>
        </div>
      </div>
    </div>

    <!-- 更多操作抽屉 -->
    <el-drawer
      v-model="moreActionsVisible"
      title="所有快捷操作"
      direction="rtl"
      size="400px"
    >
      <div class="drawer-content">
        <div class="drawer-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索操作..."
            :prefix-icon="Search"
            clearable
          />
        </div>

        <div class="drawer-categories">
          <div 
            v-for="category in actionCategories"
            :key="category.name"
            class="category-section"
          >
            <h4 class="category-title">{{ category.name }}</h4>
            <div class="category-actions">
              <div
                v-for="action in category.actions"
                :key="action.id"
                class="drawer-action-item"
                @click="handleActionClick(action)"
              >
                <div class="drawer-action-icon">
                  <el-icon :size="20">
                    <component :is="getActionIcon(action.icon)" />
                  </el-icon>
                </div>
                <div class="drawer-action-content">
                  <span class="drawer-action-name">{{ action.name }}</span>
                  <span class="drawer-action-desc">快速{{ action.name.toLowerCase() }}</span>
                </div>
                <el-icon class="drawer-action-arrow">
                  <ArrowRight />
                </el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { QuickAction } from '@/api/dashboard'
import {
  Setting, MoreFilled, Search, ArrowRight,
  View, User, EditPen, TrendCharts, Document,
  Picture, ChatDotRound, Lock, Bell, House,
  Star, DataBoard, Tools, Monitor, Connection,
  Checked, Operation, Timer, Menu, Warning,
  Goods, FolderOpened
} from '@element-plus/icons-vue'

// Props 定义
interface Props {
  quickActions?: QuickAction[]
  loading?: boolean
  error?: string | null
  maxDisplayCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  quickActions: () => [],
  loading: false,
  error: null,
  maxDisplayCount: 8
})

// Emits 定义
interface Emits {
  (e: 'action-click', action: QuickAction): void
  (e: 'customize'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const moreActionsVisible = ref(false)
const searchKeyword = ref('')
const todayUsageCount = ref(23) // 模拟数据
const newActionIds = ref(['publish_content', 'ai_assist']) // 新功能ID列表
const hotActionIds = ref(['content_audit', 'user_management']) // 热门功能ID列表

// 图标映射
const iconMap = {
  View, User, EditPen, TrendCharts, Document, Picture,
  ChatDotRound, Lock, Bell, House, Star, DataBoard,
  Tools, Monitor, Connection, Checked, Operation,
  Timer, Menu, Warning, Goods, FolderOpened, Setting
} as any

// 计算属性
const visibleActions = computed(() => {
  if (!props.quickActions || props.quickActions.length === 0) return []
  
  // 过滤有权限且可见的操作
  const availableActions = props.quickActions.filter(action => {
    return action.visible && (!action.permission || authStore.checkPermission(action.permission))
  })
  
  return availableActions.slice(0, props.maxDisplayCount)
})

const hasMoreActions = computed(() => {
  return props.quickActions && props.quickActions.length > props.maxDisplayCount
})

const totalActionsCount = computed(() => {
  return visibleActions.value.length
})

const actionCategories = computed(() => {
  if (!props.quickActions) return []
  
  const categories = [
    { name: '内容管理', actions: [] as QuickAction[] },
    { name: '用户管理', actions: [] as QuickAction[] },
    { name: '系统管理', actions: [] as QuickAction[] },
    { name: '运营管理', actions: [] as QuickAction[] }
  ]
  
  // 根据搜索关键词过滤
  const filteredActions = props.quickActions.filter(action => {
    if (!searchKeyword.value) return true
    return action.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  })
  
  // 分类操作
  filteredActions.forEach(action => {
    if (action.path.includes('/content/') || action.path.includes('/audit/')) {
      categories[0].actions.push(action)
    } else if (action.path.includes('/rbac/') || action.path.includes('/user/')) {
      categories[1].actions.push(action)
    } else if (action.path.includes('/system/') || action.path.includes('/config/')) {
      categories[2].actions.push(action)
    } else {
      categories[3].actions.push(action)
    }
  })
  
  return categories.filter(category => category.actions.length > 0)
})

// 方法
const getActionIcon = (iconName: string) => {
  return iconMap[iconName] || Document
}

const isNewAction = (action: QuickAction) => {
  return newActionIds.value.includes(action.id)
}

const isHotAction = (action: QuickAction) => {
  return hotActionIds.value.includes(action.id)
}

const handleActionClick = (action: QuickAction) => {
  emit('action-click', action)
  
  // 记录使用统计
  todayUsageCount.value++
  
  // 跳转到指定页面
  if (action.path) {
    router.push(action.path)
  }
  
  // 关闭抽屉
  if (moreActionsVisible.value) {
    moreActionsVisible.value = false
  }
}

const handleCustomize = () => {
  emit('customize')
  // TODO: 打开自定义设置对话框
}

const handleShowMore = () => {
  moreActionsVisible.value = true
}

// 获取操作的使用频率（模拟数据）- 暂时注释掉未使用的函数
// const getActionUsageCount = (actionId: string) => {
//   const usageMap: Record<string, number> = {
//     'content_audit': 156,
//     'user_management': 89,
//     'publish_content': 67,
//     'system_settings': 45
//   }
//   return usageMap[actionId] || 0
// }
</script>

<style scoped>
.quick-actions-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.card-subtitle {
  display: block;
  line-height: 1.4;
}

.header-actions {
  flex-shrink: 0;
}

.actions-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.actions-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
  width: 100%;
}

.actions-error {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  flex: 1;
  padding: var(--spacing-sm) 0;
}

.action-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-medium);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
  min-height: 80px;
  gap: var(--spacing-sm);
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-primary);
}

.action-primary {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, rgba(64, 158, 255, 0.1) 100%);
  border-color: var(--color-primary);
}

.action-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-light) 0%, rgba(64, 158, 255, 0.2) 100%);
}

.action-success {
  background: linear-gradient(135deg, var(--color-success-light) 0%, rgba(103, 194, 58, 0.1) 100%);
  border-color: var(--color-success);
}

.action-warning {
  background: linear-gradient(135deg, var(--color-warning-light) 0%, rgba(250, 173, 20, 0.1) 100%);
  border-color: var(--color-warning);
}

.action-danger {
  background: linear-gradient(135deg, var(--color-danger-light) 0%, rgba(245, 108, 108, 0.1) 100%);
  border-color: var(--color-danger);
}

.action-info {
  background: linear-gradient(135deg, var(--color-info-light) 0%, rgba(144, 147, 153, 0.1) 100%);
  border-color: var(--color-info);
}

.action-more {
  background: var(--color-bg-light);
  border: 2px dashed var(--color-border);
}

.action-more:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.action-primary .action-icon {
  color: var(--color-primary);
}

.action-success .action-icon {
  color: var(--color-success);
}

.action-warning .action-icon {
  color: var(--color-warning);
}

.action-danger .action-icon {
  color: var(--color-danger);
}

.action-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  text-align: center;
  line-height: 1.2;
}

.new-badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.hot-tag {
  position: absolute;
  top: 4px;
  right: 4px;
  transform: scale(0.8);
}

.actions-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border-light);
  margin-top: var(--spacing-md);
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-primary);
}

/* 抽屉样式 */
.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-search {
  margin-bottom: var(--spacing-lg);
}

.drawer-categories {
  flex: 1;
  overflow-y: auto;
}

.category-section {
  margin-bottom: var(--spacing-xl);
}

.category-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-md) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.category-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.drawer-action-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-medium);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-light);
}

.drawer-action-item:hover {
  background: var(--color-bg-light);
  border-color: var(--color-primary);
  transform: translateX(4px);
}

.drawer-action-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-radius: var(--radius-md);
  margin-right: var(--spacing-md);
}

.drawer-action-content {
  flex: 1;
  min-width: 0;
}

.drawer-action-name {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
}

.drawer-action-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.drawer-action-arrow {
  flex-shrink: 0;
  color: var(--color-text-tertiary);
  transition: transform var(--transition-medium);
}

.drawer-action-item:hover .drawer-action-arrow {
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .actions-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
  
  .action-item {
    flex-direction: row;
    text-align: left;
    justify-content: flex-start;
    min-height: 60px;
    padding: var(--spacing-md);
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
    margin-bottom: 0;
    margin-right: var(--spacing-md);
  }
  
  .actions-stats {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

/* 动画效果 */
.actions-grid {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>