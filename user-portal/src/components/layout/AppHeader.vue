<template>
  <header class="app-header">
    <div class="container">
      <div class="header-left">
        <router-link to="/" class="logo">
          <a-icon :size="28" type="building" style="color: var(--primary-color)" />
          <span class="logo-text">企业门户</span>
        </router-link>
      </div>

      <div class="header-center">
        <nav class="nav-menu">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ active: $route.path === item.path }"
          >
            <a-icon :size="18" :type="item.icon" />
            {{ item.title }}
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <div class="search-box">
          <a-input
            v-model="searchKeyword"
            placeholder="搜索内容..."
            :prefix-icon="search"
            @keyup.enter="handleSearch"
            allow-clear
          />
        </div>

        <a-dropdown v-if="userStore.isLoggedIn" @select="handleNotificationCommand">
          <a-badge :count="userStore.unreadCount" :show-zero="false">
            <a-button class="notification-btn" type="text">
              <a-icon :size="20" type="bell" />
            </a-button>
          </a-badge>
          <template #content>
            <a-dropdown-menu class="notification-dropdown">
              <div class="notification-header">
                <span>消息通知</span>
                <a-button size="small" @click="handleNotificationCommand('markAllRead')">
                  全部已读
                </a-button>
              </div>
              <div class="notification-list">
                <div
                  v-for="notification in userStore.notifications.slice(0, 5)"
                  :key="notification.id"
                  class="notification-item"
                  :class="{ unread: !notification.isRead }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-content">
                    <h4>{{ notification.title }}</h4>
                    <p>{{ notification.content }}</p>
                    <span class="notification-time">{{ formatTime(notification.createTime) }}</span>
                  </div>
                </div>
              </div>
              <a-dropdown-item key="viewAll" class="view-all">
                查看全部消息
              </a-dropdown-item>
            </a-dropdown-menu>
          </template>
        </a-dropdown>

        <a-dropdown v-if="userStore.isLoggedIn" @select="handleUserCommand">
          <div class="user-info">
            <a-avatar :size="36" :src="userStore.userInfo?.avatar" />
            <span class="username">{{ userStore.userInfo?.name }}</span>
            <a-icon :size="16" type="chevron-down" />
          </div>
          <template #content>
            <a-dropdown-menu>
              <a-dropdown-item key="profile">个人中心</a-dropdown-item>
              <a-dropdown-item key="settings">设置</a-dropdown-item>
              <a-dropdown-item key="logout" divider>退出登录</a-dropdown-item>
            </a-dropdown-menu>
          </template>
        </a-dropdown>

        <a-button v-else type="primary" @click="$router.push('/login')">
          登录
        </a-button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import type { Notification } from '@/types'
import { Search } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')

const menuItems = [
  { path: '/', title: '首页', icon: 'home' },
  { path: '/news', title: '资讯中心', icon: 'file-text' },
  { path: '/knowledge', title: '知识平台', icon: 'book' },
  { path: '/forum', title: '企业论坛', icon: 'message-square' },
  { path: '/market', title: '跳蚤市场', icon: 'shopping-bag' }
]

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchKeyword.value.trim() }
    })
  }
}

const handleNotificationCommand = (command: string) => {
  if (command === 'markAllRead') {
    userStore.markAllNotificationsAsRead()
  } else if (command === 'viewAll') {
    router.push('/profile?tab=notifications')
  }
}

const handleNotificationClick = (notification: Notification) => {
  userStore.markNotificationAsRead(notification.id)
  if (notification.link) {
    router.push(notification.link)
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/profile?tab=settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/')
      break
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}
</script>

<style scoped lang="scss">
.app-header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }
}

.header-left {
  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--color-text-1);

    .logo-text {
      font-size: 20px;
      font-weight: 600;
      margin-left: 8px;
    }
  }
}

.header-center {
  flex: 1;
  max-width: 600px;

  .nav-menu {
    display: flex;
    justify-content: center;
    gap: 32px;

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 16px;
      text-decoration: none;
      color: var(--color-text-2);
      border-radius: 6px;
      transition: all 0.3s;
      font-size: 14px;

      .a-icon {
        margin-bottom: 4px;
      }

      &:hover,
      &.active {
        color: var(--primary-color);
        background: var(--primary-color-light-9);
      }
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;

  .search-box {
    width: 240px;
  }

  .notification-btn {
    padding: 8px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.3s;

    &:hover {
      background: var(--color-bg-2);
    }

    .username {
      font-size: 14px;
      color: var(--color-text-1);
    }
  }
}

.notification-dropdown {
  width: 320px;

  .notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-2);
    font-weight: 600;
  }

  .notification-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .notification-item {
    padding: 12px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border-3);
    transition: all 0.3s;

    &:hover {
      background: var(--color-bg-2);
    }

    &.unread {
      background: var(--primary-color-light-9);
      border-left: 3px solid var(--primary-color);
    }

    .notification-content {
      h4 {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--color-text-1);
      }

      p {
        font-size: 12px;
        color: var(--color-text-2);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .notification-time {
        font-size: 11px;
        color: var(--color-text-3);
      }
    }
  }

  .view-all {
    text-align: center;
    color: var(--primary-color);
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .header-center {
    display: none;
  }

  .header-right {
    .search-box {
      width: 180px;
    }
  }
}
</style>