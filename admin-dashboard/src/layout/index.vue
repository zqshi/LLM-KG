<template>
  <div class="layout-container">
    <!-- 固定顶部Header -->
    <header class="fixed-header" role="banner">
      <div class="header-container">
        <div class="header-logo" @click="toggleCollapse">
          <div class="logo-icon">
            <el-icon size="24">
              <DataBoard />
            </el-icon>
          </div>
          <div class="logo-text">
            <h2>知识聚合平台</h2>
            <span>管理端</span>
          </div>
        </div>

        <div class="header-right">
          <!-- 搜索框 -->
          <div class="global-search">
            <el-input 
              v-model="globalSearchText" 
              placeholder="搜索功能、内容..." 
              class="search-input"
              clearable
              @keyup.enter="handleGlobalSearch">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <el-button class="badge-item modern-badge" :aria-label="`通知中心，${pendingCount}条未读通知`"
            @click="handleNotificationClick">
            <el-badge :value="pendingCount" class="notification-badge">
              <el-icon size="18">
                <Bell />
              </el-icon>
            </el-badge>
          </el-button>

          <!-- 主题切换按钮 -->
          <el-dropdown @command="handleThemeChange">
            <el-button class="theme-toggle-btn" circle
              :aria-label="`当前主题：${themeStore.getThemeDisplayName(themeStore.currentTheme)}，点击切换主题`">
              <el-icon size="16">
                <component :is="currentThemeIcon" />
              </el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="theme in themeOptions" :key="theme.value" :command="theme.value"
                  :class="{ 'is-active': themeStore.currentTheme === theme.value }">
                  <el-icon style="margin-right: 8px;">
                    <component :is="theme.icon" />
                  </el-icon>
                  {{ theme.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-dropdown trigger="click">
            <div class="user-profile modern-profile">
              <el-avatar :size="36" class="user-avatar">
                {{ userInfo.name?.charAt(0) || 'U' }}
              </el-avatar>
              <div class="user-info" v-show="!isMobile">
                <span class="username">{{ userInfo.name || '未登录' }}</span>
                <span class="user-role">{{ getRoleDisplayName(getUserRole) }}</span>
              </div>
              <el-icon class="dropdown-icon">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <div class="main-container">
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '280px'" role="navigation" aria-label="主导航菜单" id="main-navigation" class="navigation-aside">
          <el-menu :default-active="activeMenu" class="el-menu-vertical modern-menu" @select="handleMenuSelect" :collapse="isCollapse"
            background-color="transparent" text-color="var(--color-text-tertiary)" active-text-color="var(--color-primary)" role="menu" aria-label="主导航菜单">
            <template v-for="item in menuList" :key="item.path">
              <el-sub-menu v-if="item.children && item.children.length" :index="item.path || ''">
                <template #title>
                  <el-tooltip :content="item.name" placement="right" :disabled="!isCollapse">
                    <el-icon>
                      <component :is="item.icon || 'Menu'" />
                    </el-icon>
                  </el-tooltip>
                  <span>{{ item.name }}</span>
                </template>
                <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path || ''">
                  <el-tooltip :content="child.name" placement="right" :disabled="!isCollapse">
                    <el-icon>
                      <component :is="child.icon || 'Document'" />
                    </el-icon>
                  </el-tooltip>
                  <template #title>{{ child.name }}</template>
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="item.path || ''">
                <el-tooltip :content="item.name" placement="right" :disabled="!isCollapse">
                  <el-icon>
                    <component :is="item.icon || 'Menu'" />
                  </el-icon>
                </el-tooltip>
                <template #title>{{ item.name }}</template>
              </el-menu-item>
            </template>
          </el-menu>
        </el-aside>

        <el-main role="main" aria-label="主要内容区域" id="main-content">
          <router-view />
        </el-main>
      </el-container>
    </div>

    <!-- 反馈收集组件 -->
    <FeedbackWidget />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useAccessibility } from '@/composables/useAccessibility'
import { useMenuFilter } from '@/composables/useMenuFilter'
import FeedbackWidget from '@/components/FeedbackWidget.vue'
import {
  Monitor, User, Document, Setting, Tools, FolderOpened,
  House, TrendCharts, Star, MagicStick, ShoppingCart,
  ChatDotRound, WarnTriangleFilled, DocumentChecked,
  UserFilled, Lock, View, Fold, Expand, Bell, ArrowDown,
  OfficeBuilding, Key, Avatar, Refresh, Connection, DataBoard,
  Check, Picture, Operation, CircleCheck, DataLine,
  ShoppingBag, Warning, Menu, EditPen, Reading, Sunny, Moon, Search,
  Grid, Clock, Collection, Box, PriceTag
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { announce } = useAccessibility()
const { filteredMenus, getUserRole, getRoleDisplayName } = useMenuFilter()

const isCollapse = ref(false)
const pendingCount = ref(8)
const globalSearchText = ref('')
const isMobile = ref(false)

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// 全局搜索处理
const handleGlobalSearch = () => {
  if (!globalSearchText.value.trim()) return
  ElMessage.success(`搜索功能开发中: ${globalSearchText.value}`)
  // TODO: 实现全局搜索逻辑
}

// 主题切换相关
const themeOptions = [
  { value: 'light', label: '浅色模式', icon: 'Sunny' },
  { value: 'dark', label: '深色模式', icon: 'Moon' },
  { value: 'auto', label: '跟随系统', icon: 'Monitor' }
]

const currentThemeIcon = computed(() => {
  return themeStore.getThemeIcon(themeStore.currentTheme)
})

const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
  themeStore.setTheme(theme)
  const themeName = themeStore.getThemeDisplayName(theme)
  ElMessage.success(`已切换到${themeName}`)
  // 宣布主题变更给屏幕阅读器用户
  announce(`主题已切换到${themeName}`)
}

// 处理通知点击
const handleNotificationClick = () => {
  ElMessage.info('通知中心功能开发中')
  announce('打开通知中心')
}

const userInfo = computed(() => {
  return authStore.user || {
    id: 0,
    name: '未登录',
    username: '',
    email: ''
  }
})

// 图标名称映射，确保所有图标都存在
const iconMapping: Record<string, string> = {
  'Monitor': 'Monitor',
  'Lock': 'Lock',
  'Document': 'Document', 
  'Newspaper': 'Reading',  // 使用Reading图标替代Newspaper
  'Picture': 'Picture',
  'ShoppingCart': 'ShoppingCart',
  'ChatDotRound': 'ChatDotRound',
  'Check': 'Check',
  'Setting': 'Setting',
  'Grid': 'Grid',
  'Tools': 'Tools',
  'House': 'House',
  'Star': 'Star',
  'TrendCharts': 'TrendCharts',
  'DataBoard': 'DataBoard',
  'Menu': 'Menu',
  'Clock': 'Clock',
  'FolderOpened': 'FolderOpened',
  'Connection': 'Connection',
  'Bell': 'Bell',
  'CircleCheck': 'CircleCheck',
  'DataLine': 'DataLine',
  'Warning': 'Warning',
  'OfficeBuilding': 'OfficeBuilding',
  'User': 'User',
  'UserFilled': 'UserFilled',
  'Key': 'Key',
  'Avatar': 'Avatar',
  'Refresh': 'Refresh',
  'Goods': 'ShoppingBag', // 替换不存在的图标
  'DocumentChecked': 'DocumentChecked',
  'Collection': 'Collection',
  'Box': 'Box',
  'PriceTag': 'PriceTag'
}

const menuList = computed(() => {
  try {
    // 检查是否处于演示模式
    const isDemoMode = authStore.token === 'demo-token';
    console.log('=== Layout组件菜单数据详细分析 ===')
    console.log('用户登录状态:', authStore.isLoggedIn)
    console.log('演示模式:', isDemoMode)
    console.log('用户权限数量:', authStore.permissions.length)
    console.log('用户角色:', getUserRole.value)
    console.log('角色显示名称:', getRoleDisplayName(getUserRole.value))

    // 使用基于角色过滤后的菜单，并映射图标名称
    const menus = filteredMenus.value.map(menu => {
      const mappedIcon = iconMapping[menu.icon || ''] || 'Menu'
      return {
        ...menu,
        icon: mappedIcon,
        children: menu.children?.map(child => {
          const childMappedIcon = iconMapping[child.icon || ''] || 'Document'
          return {
            ...child,
            icon: childMappedIcon
          }
        })
      }
    })

    console.log('最终菜单列表:', menus)
    return menus
  } catch (error) {
    console.error('菜单数据解析错误:', error)
    return []
  }
})

const activeMenu = computed(() => {
  const matched = route.matched
  if (matched.length >= 2) {
    return matched[matched.length - 1].path
  }
  return route.path
})

const breadcrumbList = computed(() => {
  return route.matched.filter(item => item.meta?.title)
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
  // 为屏幕阅读器用户宣布状态变化
  announce(isCollapse.value ? '侧边菜单已收起' : '侧边菜单已展开')
}

const handleMenuSelect = (index: string) => {
  if (route.path !== index) {
    router.push(index)

    // 为屏幕阅读器用户宣布导航变化
    const menuItem = menuList.value.find(item =>
      item.path === index ||
      (item.children && item.children.find(child => child.path === index))
    )
    if (menuItem) {
      const selectedItem = menuItem.path === index
        ? menuItem
        : menuItem.children?.find(child => child.path === index)

      if (selectedItem) {
        announce(`正在导航到${selectedItem.name}页面`)
      }
    }
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    authStore.logout()
    router.push('/login')
    ElMessage.success('退出成功')
  })
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  background-color: var(--color-bg-page);
}

/* 固定顶部Header */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 60px;
  z-index: 1000;
  background: linear-gradient(90deg, #ffffff 0%, #f8fafc 100%);
  backdrop-filter: blur(8px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid #e2e8f0;
}

/* 主内容容器 */
.main-container {
  padding-top: 60px;
  min-height: 100vh;
}

.logo-container {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-medium);
  height: 80px;
  background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-primary-lighter) 100%);
  border-bottom: 1px solid var(--color-border);
}

.logo-icon {
  color: var(--color-primary);
  margin-right: var(--spacing-md);
}

.logo-text {
  overflow: hidden;
  transition: all var(--transition-fast);
}

.logo-text h2 {
  margin: 0;
  font-size: var(--text-lg);
  color: var(--color-text-primary);
}

.logo-text span {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.modern-menu {
  border-right: none;
}


.breadcrumb-icon {
  margin-right: var(--spacing-xs);
}

.modern-badge {
  margin: 0 var(--spacing-sm);
}

.modern-profile {
  display: flex;
  align-items: center;
  padding: var(--spacing-xs);
  cursor: pointer;
}

.user-info {
  margin: 0 var(--spacing-md);
}

.username {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  display: block;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}

.dropdown-icon {
  color: var(--color-text-tertiary);
}

/* 修复下方缺失选择器的CSS规则 */
.logo-container-enhanced {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 var(--spacing-lg);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.logo-container-enhanced:hover {
  background: linear-gradient(135deg, #5a67d8 0%, #667eea 100%);
  transform: translateY(-1px);
}

.logo-container-enhanced::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
}

.logo-icon-enhanced {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-xl);
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-floating);
  transition: all var(--transition-medium);
}

.logo-icon-enhanced:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(76, 154, 255, 0.4);
}

.logo-text-enhanced {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-text-enhanced h2 {
  font-size: 16px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-text-enhanced span {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 2px;
  font-weight: 400;
}

.modern-menu {
  border-right: none;
  min-height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: var(--spacing-lg) var(--spacing-sm);
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.navigation-aside {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  transition: all var(--transition-medium);
}

.el-menu-vertical::-webkit-scrollbar {
  width: 8px;
}

.el-menu-vertical::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.el-menu-vertical::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.el-menu-vertical::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 250px;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 var(--spacing-xl);
  gap: var(--spacing-lg);
}

/* Header Logo区域 */
.header-logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-medium);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-lg);
  min-width: 200px;
}

.header-logo:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  transform: translateY(-1px);
}

.header-logo .logo-icon {
  margin-right: var(--spacing-sm);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(47, 129, 247, 0.3);
  transition: all var(--transition-medium);
}

.header-logo .logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(47, 129, 247, 0.4);
}

.header-logo .logo-icon .el-icon {
  color: white;
}

.header-logo .logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.header-logo .logo-text h2 {
  font-size: 16px;
  margin: 0;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 0.5px;
}

.header-logo .logo-text span {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
  font-weight: 400;
}

.modern-menu {
  border-right: none;
  min-height: calc(100vh - 60px);
  max-height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding: var(--spacing-lg) var(--spacing-sm);
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
}

.navigation-aside {
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  transition: all var(--transition-medium);
}

.el-menu-vertical::-webkit-scrollbar {
  width: 8px;
}

.el-menu-vertical::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.el-menu-vertical::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.el-menu-vertical::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 250px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.collapse-btn {
  font-size: 18px;
  color: var(--color-text-tertiary);
  transition: all var(--transition-medium);
  border: none;
  background: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary-soft);
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.collapse-btn:hover {
  color: var(--color-primary);
  transform: scale(1.1);
}

.collapse-btn:hover::before {
  opacity: 1;
}

.modern-breadcrumb {
  padding: var(--spacing-sm) 0;
  font-size: 14px;
  
  .el-breadcrumb__item {
    display: flex;
    align-items: center;
  }
  
  .el-breadcrumb__inner {
    color: #64748b;
    font-weight: 500;
    transition: color var(--transition-fast);
  }
  
  .is-active .el-breadcrumb__inner {
    color: #2f81f7;
    font-weight: 600;
  }
  
  .breadcrumb-icon {
    margin-right: 4px;
    color: #2f81f7;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

/* 全局搜索框 */
.global-search {
  width: 280px;
  margin-right: var(--spacing-md);
}

.search-input {
  border-radius: 20px;
  
  .el-input__wrapper {
    border-radius: 20px;
    background: #f1f5f9;
    border: 1px solid transparent;
    transition: all var(--transition-medium);
    
    &:hover {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }
    
    &.is-focus {
      background: #ffffff;
      border-color: #2f81f7;
      box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.1);
    }
  }
  
  .el-input__inner {
    color: #334155;
    font-weight: 500;
    
    &::placeholder {
      color: #94a3b8;
    }
  }
}

.modern-badge {
  cursor: pointer;
  color: #64748b;
  padding: var(--spacing-sm);
  border-radius: 50%;
  transition: all var(--transition-medium);
  position: relative;
  background: transparent;
  border: 1px solid transparent;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-badge:hover {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.modern-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #475569;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  transition: all var(--transition-medium);
  gap: var(--spacing-sm);
  background: transparent;
  border: 1px solid transparent;
}

.modern-profile:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-avatar {
  border: 2px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.dropdown-icon {
  color: #94a3b8;
  transition: transform var(--transition-fast);
}

.modern-profile:hover .dropdown-icon {
  transform: rotate(180deg);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: var(--spacing-sm);
}

.username {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 2px;
  line-height: 1;
}

.el-main {
  background-color: var(--color-bg-page);
  padding: 0;
  min-height: calc(100vh - 60px);
}

/* 主题切换按钮样式 */
.theme-toggle-btn {
  background: var(--gradient-card);
  border: 1px solid var(--color-border-light);
  color: var(--color-text-secondary);
  transition: all var(--transition-medium);
  width: 36px;
  height: 36px;
  position: relative;
  overflow: hidden;
}

.theme-toggle-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary-soft);
  opacity: 0;
  transition: opacity var(--transition-medium);
}

.theme-toggle-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: scale(1.05);
  box-shadow: var(--shadow-card);
}

.theme-toggle-btn:hover::before {
  opacity: 1;
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

/* 主题下拉菜单样式 */
.el-dropdown-menu .el-dropdown-menu__item.is-active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
}

.el-dropdown-menu .el-dropdown-menu__item.is-active::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 2px;
}

/* 现代化菜单项样式 */
.modern-menu .el-menu-item,
.modern-menu .el-sub-menu__title {
  height: 44px;
  line-height: 44px;
  margin: 2px 0;
  padding: 0 16px !important;
  color: #64748b;
  border-radius: 8px;
  transition: all var(--transition-medium);
  position: relative;
  font-weight: 500;
}

/* 统一的悬停状态 - 所有一级导航项使用相同的悬停效果 */
.modern-menu .el-menu-item:hover,
.modern-menu .el-sub-menu__title:hover {
  background: linear-gradient(90deg, rgba(47, 129, 247, 0.08) 0%, rgba(47, 129, 247, 0.04) 100%) !important;
  color: #2f81f7 !important;
  transform: translateX(2px);
  box-shadow: 0 1px 3px rgba(47, 129, 247, 0.1);
}

/* 统一的活跃状态 - 确保仪表盘和其他导航项样式完全一致 */
.modern-menu .el-menu-item.is-active {
  background: linear-gradient(90deg, #2f81f7 0%, #4f46e5 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(47, 129, 247, 0.3);
  font-weight: 600;
  transform: translateX(0px);
}

.modern-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  background: #2f81f7;
  border-radius: 2px;
  box-shadow: 0 0 8px rgba(47, 129, 247, 0.5);
}

/* 子菜单项样式 */
.modern-menu .el-sub-menu .el-menu-item {
  height: 40px;
  line-height: 40px;
  padding: 0 24px !important;
  margin-left: 12px;
  background: transparent;
  font-size: 13px;
}

/* 统一的子菜单项悬停效果 */
.modern-menu .el-sub-menu .el-menu-item:hover {
  background: linear-gradient(90deg, rgba(47, 129, 247, 0.06) 0%, rgba(47, 129, 247, 0.03) 100%) !important;
  color: #2f81f7 !important;
  transform: translateX(2px);
  box-shadow: 0 1px 2px rgba(47, 129, 247, 0.08);
}

/* 折叠状态下的优化 */
.modern-menu.el-menu--collapse .el-menu-item,
.modern-menu.el-menu--collapse .el-sub-menu__title {
  padding: 0 !important;
  text-align: center;
  justify-content: center;
  width: 44px !important;
  height: 44px !important;
  margin: 4px auto !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative;
}

/* 折叠状态下图标优化 */
.modern-menu.el-menu--collapse .el-menu-item .el-icon,
.modern-menu.el-menu--collapse .el-sub-menu__title .el-icon {
  margin-right: 0 !important;
  margin-left: 0 !important;
  font-size: 20px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 折叠状态下隐藏文本 */
.modern-menu.el-menu--collapse .el-menu-item > span,
.modern-menu.el-menu--collapse .el-sub-menu__title > span {
  display: none !important;
}

/* 折叠状态下的子菜单箭头隐藏 */
.modern-menu.el-menu--collapse .el-sub-menu__icon-arrow {
  display: none !important;
}

/* 折叠状态下的活动状态优化 */
.modern-menu.el-menu--collapse .el-menu-item.is-active {
  width: 44px !important;
  height: 44px !important;
  margin: 4px auto !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(47, 129, 247, 0.3);
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 折叠状态下的悬停效果 - 统一样式，确保所有一级导航项完全一致 */
.modern-menu.el-menu--collapse .el-menu-item:hover,
.modern-menu.el-menu--collapse .el-sub-menu__title:hover {
  width: 44px !important;
  height: 44px !important;
  transform: scale(1.05) !important;
  transition: all var(--transition-medium) !important;
  margin: 4px auto !important;
  background: linear-gradient(90deg, rgba(47, 129, 247, 0.08) 0%, rgba(47, 129, 247, 0.04) 100%) !important;
  color: #2f81f7 !important;
  box-shadow: 0 2px 8px rgba(47, 129, 247, 0.15) !important;
  border-radius: 8px !important;
}

/* 折叠状态下确保图标完全居中 */
.modern-menu.el-menu--collapse .el-menu-item .el-tooltip,
.modern-menu.el-menu--collapse .el-sub-menu__title .el-tooltip {
  width: 100%;
  height: 100%;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* 菜单图标优化 */
.modern-menu .el-menu-item .el-icon,
.modern-menu .el-sub-menu__title .el-icon {
  margin-right: 8px;
  font-size: 18px;
  transition: all var(--transition-medium);
}

.modern-menu .el-menu-item:hover .el-icon,
.modern-menu .el-sub-menu__title:hover .el-icon {
  transform: scale(1.1);
}

/* 子菜单展开效果 */
.modern-menu .el-sub-menu .el-menu {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  margin: 4px 0;
  padding: 4px 0;
}

/* 深色主题下的布局调整 */
:root[data-theme="dark"] .modern-menu {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
}

:root[data-theme="dark"] .navigation-aside {
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  border-right: 1px solid #334155;
}

:root[data-theme="dark"] .modern-menu .el-menu-item,
:root[data-theme="dark"] .modern-menu .el-sub-menu__title {
  color: #94a3b8;
}

/* 深色主题下的统一悬停效果 */
:root[data-theme="dark"] .modern-menu .el-menu-item:hover,
:root[data-theme="dark"] .modern-menu .el-sub-menu__title:hover {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%) !important;
  color: #a5b4fc !important;
  transform: translateX(2px);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.1);
}

/* 深色主题下子菜单项的统一悬停效果 */
:root[data-theme="dark"] .modern-menu .el-sub-menu .el-menu-item:hover {
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%) !important;
  color: #a5b4fc !important;
  transform: translateX(2px);
  box-shadow: 0 1px 2px rgba(99, 102, 241, 0.08);
}

/* 深色主题下折叠状态的统一悬停效果 - 确保所有一级导航项完全一致 */
:root[data-theme="dark"] .modern-menu.el-menu--collapse .el-menu-item:hover,
:root[data-theme="dark"] .modern-menu.el-menu--collapse .el-sub-menu__title:hover {
  width: 44px !important;
  height: 44px !important;
  transform: scale(1.05) !important;
  transition: all var(--transition-medium) !important;
  margin: 4px auto !important;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.06) 100%) !important;
  color: #a5b4fc !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15) !important;
  border-radius: 8px !important;
}

:root[data-theme="dark"] .fixed-header {
  background: linear-gradient(90deg, #1e293b 0%, #0f172a 100%);
  border-bottom: 1px solid #334155;
}

:root[data-theme="dark"] .search-input .el-input__wrapper {
  background: #334155;
  border-color: #475569;
}

:root[data-theme="dark"] .search-input .el-input__wrapper:hover {
  background: #475569;
  border-color: #64748b;
}

:root[data-theme="dark"] .modern-profile {
  color: #e2e8f0;
}

:root[data-theme="dark"] .modern-profile:hover {
  background: #334155;
  border-color: #475569;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .global-search {
    width: 200px;
  }
}

@media (max-width: 768px) {
  .header-container {
    padding: 0 var(--spacing-md);
  }
  
  .header-logo {
    min-width: 160px;
  }
  
  .header-logo .logo-text h2 {
    font-size: 14px;
  }
  
  .header-logo .logo-text span {
    font-size: 10px;
  }
  
  .global-search {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .navigation-aside {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
  }
  
  .modern-breadcrumb {
    font-size: 12px;
  }
  
  .modern-breadcrumb .el-breadcrumb__inner {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0 var(--spacing-sm);
  }
  
  .header-right {
    gap: var(--spacing-sm);
  }
  
  .header-logo .logo-text h2 {
    font-size: 14px;
  }
  
  .header-logo .logo-text span {
    font-size: 10px;
  }
}
</style>
```