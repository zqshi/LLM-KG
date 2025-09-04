import { defineStore } from 'pinia'
import type { User, Notification } from '@/types'

interface UserState {
  currentUser: User | null
  isLoggedIn: boolean
  notifications: Notification[]
  unreadCount: number
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    isLoggedIn: false,
    notifications: [],
    unreadCount: 0
  }),

  getters: {
    userInfo: (state) => state.currentUser,
    hasNotifications: (state) => state.notifications.length > 0,
    unreadNotifications: (state) => 
      state.notifications.filter(n => !n.isRead)
  },

  actions: {
    // 登录
    async login(credentials: { username: string; password: string }) {
      // 模拟登录API调用
      const mockUser: User = {
        id: '1',
        name: '张三',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        department: '技术部',
        position: '高级工程师',
        email: 'zhangsan@company.com',
        phone: '13800138000',
        joinDate: '2022-01-15',
        points: 2580,
        level: '钻石会员'
      }
      
      this.currentUser = mockUser
      this.isLoggedIn = true
      
      // 模拟获取通知
      await this.fetchNotifications()
      
      return mockUser
    },

    // 登出
    logout() {
      this.currentUser = null
      this.isLoggedIn = false
      this.notifications = []
      this.unreadCount = 0
    },

    // 获取通知
    async fetchNotifications() {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'system',
          title: '系统升级通知',
          content: '系统将于今晚22:00进行升级维护，预计持续2小时',
          createTime: '2024-01-15 10:30:00',
          isRead: false
        },
        {
          id: '2',
          type: 'reply',
          title: '新的回复',
          content: '王五回复了你的帖子"关于新技术栈的讨论"',
          createTime: '2024-01-15 09:15:00',
          isRead: false,
          link: '/forum/post/123'
        },
        {
          id: '3',
          type: 'like',
          title: '收到点赞',
          content: '李四点赞了你分享的知识文档',
          createTime: '2024-01-14 16:45:00',
          isRead: true
        }
      ]
      
      this.notifications = mockNotifications
      this.unreadCount = mockNotifications.filter(n => !n.isRead).length
    },

    // 标记通知为已读
    markNotificationAsRead(id: string) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification && !notification.isRead) {
        notification.isRead = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },

    // 标记所有通知为已读
    markAllNotificationsAsRead() {
      this.notifications.forEach(n => n.isRead = true)
      this.unreadCount = 0
    },

    // 更新用户信息
    updateUserInfo(userInfo: Partial<User>) {
      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, ...userInfo }
      }
    }
  },

})