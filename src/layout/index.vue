<template>
  <div class="layout-container">
    <el-container>
      <el-aside width="250px" role="navigation" aria-label="主导航菜单" id="main-navigation">
        <div class="logo-container">
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
        <el-menu :default-active="activeMenu" class="el-menu-vertical" @select="handleMenuSelect" :collapse="isCollapse"
          background-color="#304156" text-color="#bfcbd9" active-text-color="#409EFF" role="menu" aria-label="主导航菜单">
          <template v-for="item in menuList" :key="item.path">
            <el-sub-menu v-if="item.children && item.children.length" :index="item.path">
              <template #title>
                <el-icon>
                  <component :is="item.icon || 'Menu'" />
                </el-icon>
                <span>{{ item.name }}</span>
              </template>
              <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
                <el-icon>
                  <component :is="child.icon || 'Document'" />
                </el-icon>
                <template #title>{{ child.name }}</template>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-else :index="item.path">
              <el-icon>
                <component :is="item.icon || 'Menu'" />
              </el-icon>
              <template #title>{{ item.name }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header height="60px" role="banner">
          <div class="header-container">
            <div class="header-left">
              <el-button type="text" @click="toggleCollapse" class="collapse-btn"
                :aria-label="isCollapse ? '展开侧边菜单' : '收起侧边菜单'" :aria-expanded="!isCollapse">
                <el-icon>
                  <Fold v-if="!isCollapse" />
                  <Expand v-else />
                </el-icon>
              </el-button>
              <el-breadcrumb separator="/" class="breadcrumb-container">
                <el-breadcrumb-item v-for="item in breadcrumbList" :key="item.path">
                  {{ item.meta?.title }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>

            <div class="header-right">
              <el-button class="badge-item" circle :aria-label="`通知中心，${pendingCount}条未读通知`"
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

              <el-dropdown>
                <span class="el-dropdown-link">
                  <el-avatar :size="32">
                    {{ userInfo.name?.charAt(0) || 'U' }}
                  </el-avatar>
                  <div class="user-info">
                    <span class="username">{{ userInfo.name || '未登录' }}</span>
                    <span class="user-role">{{ getRoleDisplayName(getUserRole) }}</span>
                  </div>
                  <el-icon>
                    <ArrowDown />
                  </el-icon>
                </span>
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
        </el-header>

        <el-main role="main" aria-label="主要内容区域" id="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

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
  ChatDotRound, Shield, WarnTriangleFilled, DocumentChecked,
  UserFilled, Lock, View, Fold, Expand, Bell, ArrowDown,
  OfficeBuilding, Key, Avatar, Refresh, Connection, DataBoard,
  Checked, Picture, Operation, CircleCheck, DataLine,
  Goods, Warning, Menu, EditPen, Newspaper, Sunny, Moon
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { announce } = useAccessibility()
const { filteredMenus, getUserRole, getRoleDisplayName } = useMenuFilter()

const isCollapse = ref(false)
const pendingCount = ref(8)

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

const menuList = computed(() => {
  try {
    console.log('=== Layout组件菜单数据详细分析 ===')
    console.log('用户登录状态:', authStore.isLoggedIn)
    console.log('用户权限数量:', authStore.permissions.length)
    console.log('用户角色:', getUserRole.value)
    console.log('角色显示名称:', getRoleDisplayName(getUserRole.value))

    // 使用基于角色过滤后的菜单
    const menus = filteredMenus.value
    console.log('过滤后的菜单数量:', menus.length)
    console.log('过滤后菜单详情:', menus.map(m => ({
      name: m.name,
      path: m.path,
      icon: m.icon,
      childrenCount: m.children?.length || 0,
      children: m.children?.map(c => ({ name: c.name, path: c.path })) || []
    })))

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
}

.logo-container {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  background: var(--gradient-sidebar);
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.logo-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
}

.logo-icon {
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

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(76, 154, 255, 0.4);
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.logo-text h2 {
  font-size: 16px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-text span {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 2px;
  font-weight: 400;
}

.el-menu-vertical {
  border-right: none;
  min-height: calc(100vh - 80px);
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--gradient-sidebar);
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
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
  background: var(--gradient-card);
  box-shadow: var(--shadow-card);
  border-bottom: 1px solid var(--color-border-lighter);
  position: relative;
}

.header-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--gradient-primary);
  opacity: 0.3;
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

.breadcrumb-container {
  margin-left: var(--spacing-md);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.badge-item {
  cursor: pointer;
  color: var(--color-text-tertiary);
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-medium);
  position: relative;
}

.badge-item:hover {
  background: var(--color-warning-light);
  color: var(--color-warning);
  transform: scale(1.05);
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-medium);
  gap: var(--spacing-sm);
}

.el-dropdown-link:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-dropdown);
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

/* 菜单项样式优化 */
.el-menu-vertical .el-menu-item,
.el-menu-vertical .el-sub-menu__title {
  height: 48px;
  line-height: 48px;
  padding: 0 20px !important;
  color: #bfcbd9;
  transition: all 0.2s ease;
}

.el-menu-vertical .el-menu-item:hover,
.el-menu-vertical .el-sub-menu__title:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #409EFF !important;
}

.el-menu-vertical .el-menu-item.is-active {
  background-color: rgba(64, 158, 255, 0.2) !important;
  color: #409EFF !important;
  border-right: 3px solid #409EFF;
}

/* 子菜单项样式 */
.el-menu-vertical .el-sub-menu .el-menu-item {
  height: 44px;
  line-height: 44px;
  padding: 0 35px !important;
  background-color: rgba(0, 0, 0, 0.1);
}

.el-menu-vertical .el-sub-menu .el-menu-item:hover {
  background-color: rgba(64, 158, 255, 0.15) !important;
}

/* 折叠状态下的优化 */
.el-menu--collapse .el-menu-item,
.el-menu--collapse .el-sub-menu__title {
  padding: 0 20px !important;
  text-align: center;
}

/* 深色主题下的布局调整 */
:root[data-theme="dark"] .el-menu-vertical {
  background: linear-gradient(180deg, #21272e 0%, #1a1e24 100%);
}

:root[data-theme="dark"] .el-menu-vertical::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}

:root[data-theme="dark"] .el-menu-vertical::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

:root[data-theme="dark"] .logo-container {
  background: linear-gradient(135deg, #1a1e24 0%, #0f1419 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

:root[data-theme="dark"] .header-container {
  background: linear-gradient(90deg, var(--color-bg-card) 0%, #1c2128 100%);
  border-bottom: 1px solid var(--color-border-lighter);
}
</style>