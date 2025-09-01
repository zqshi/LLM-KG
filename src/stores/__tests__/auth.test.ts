import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { beforeEach, describe, it, expect, vi } from 'vitest'

describe('认证存储 (AuthStore)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // 清理localStorage
    localStorage.clear()
    // 清理console.log调用
    vi.clearAllMocks()
  })

  describe('登录状态持久化', () => {
    it('应该能正确初始化认证状态', () => {
      // 先设置localStorage数据再创建store
      localStorage.setItem('auth_token', 'test-token-123')
      localStorage.setItem('user_info', JSON.stringify({ 
        id: 1, 
        name: '测试用户', 
        username: 'testuser',
        email: 'test@example.com'
      }))
      localStorage.setItem('permissions', JSON.stringify(['dashboard:view', 'content:view']))
      localStorage.setItem('menus', JSON.stringify([
        { id: 0, name: '全局仪表盘', path: '/dashboard', icon: 'Monitor' }
      ]))

      const authStore = useAuthStore()
      
      // 初始化认证状态
      authStore.initAuth()

      // 验证状态恢复
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.token).toBe('test-token-123')
      expect(authStore.user?.name).toBe('测试用户')
      expect(authStore.permissions).toContain('dashboard:view')
      expect(authStore.menus).toHaveLength(1)
    })

    it('应该在没有菜单数据时重建默认菜单', () => {
      // 先设置localStorage数据
      localStorage.setItem('auth_token', 'test-token-123')
      localStorage.setItem('user_info', JSON.stringify({ 
        id: 1, 
        name: '测试用户', 
        username: 'testuser',
        email: 'test@example.com'
      }))
      localStorage.setItem('permissions', JSON.stringify(['dashboard:view']))

      const authStore = useAuthStore()
      
      // 初始化认证状态
      authStore.initAuth()

      // 验证默认菜单被重建
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.menus.length).toBeGreaterThan(0)
      expect(authStore.menus[0].name).toBe('全局仪表盘')
    })

    it('应该在数据不完整时保持未登录状态', () => {
      // 模拟不完整的数据（缺少权限信息）
      localStorage.setItem('auth_token', 'test-token-123')
      localStorage.setItem('user_info', JSON.stringify({ id: 1, name: '测试用户' }))

      const authStore = useAuthStore()
      
      // 初始化认证状态
      authStore.initAuth()

      // 验证状态
      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.token).toBe('')
      expect(authStore.user).toBe(null)
    })
  })

  describe('登录功能', () => {
    it('应该正确处理登录并存储菜单数据', async () => {
      const authStore = useAuthStore()
      
      // 模拟API响应
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: 200,
          data: {
            token: 'new-token-123',
            user: { id: 1, name: '新用户', username: 'newuser', email: 'new@example.com' },
            permissions: ['dashboard:view', 'content:view'],
            menus: [
              { id: 0, name: '全局仪表盘', path: '/dashboard', icon: 'Monitor' },
              { id: 1, name: 'RBAC', path: '/rbac', icon: 'Lock' }
            ]
          }
        })
      })

      // 执行登录
      await authStore.login({ username: 'newuser', password: 'password' })

      // 验证状态
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.user?.name).toBe('新用户')
      expect(authStore.menus).toHaveLength(2)

      // 验证localStorage存储
      expect(localStorage.getItem('auth_token')).toBe('new-token-123')
      expect(localStorage.getItem('menus')).toBeTruthy()
    })
  })

  describe('登出功能', () => {
    it('应该清除所有认证数据包括菜单', () => {
      // 先设置一些数据
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('user_info', JSON.stringify({ id: 1, name: '测试' }))
      localStorage.setItem('permissions', JSON.stringify(['test']))
      localStorage.setItem('menus', JSON.stringify([{ id: 0, name: '测试' }]))

      const authStore = useAuthStore()
      
      // 执行登出
      authStore.logout()

      // 验证所有数据被清除（在测试环境中，removeItem返回undefined而不是null）
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(localStorage.getItem('user_info')).toBeNull()
      expect(localStorage.getItem('permissions')).toBeNull()
      expect(localStorage.getItem('menus')).toBeNull()

      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.menus).toHaveLength(0)
    })
  })

  describe('菜单显示修复验证', () => {
    it('页面刷新后应该能正确显示所有模块', () => {
      // 模拟完整的登录状态
      localStorage.setItem('auth_token', 'test-token')
      localStorage.setItem('user_info', JSON.stringify({ 
        id: 1, 
        name: '管理员', 
        username: 'admin',
        email: 'admin@example.com'
      }))
      localStorage.setItem('permissions', JSON.stringify([
        'dashboard:view', 'rbac:org:view', 'content:view', 'news:view'
      ]))

      const authStore = useAuthStore()
      
      // 初始化认证状态
      authStore.initAuth()

      // 验证所有9个主要模块都存在
      expect(authStore.menus).toHaveLength(9)
      expect(authStore.menus.map(m => m.name)).toEqual([
        '全局仪表盘',
        '统一认证与权限管理 (RBAC)',
        '统一内容管理中心', 
        '资讯聚合管理',
        'Banner管理与审批流',
        '审核中心',
        '跳蚤市场管理',
        '领导名言管理',
        '运营与推荐管理',
        '配置与审计'
      ])
    })
  })
})