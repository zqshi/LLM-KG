import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Mock fetch API
global.fetch = vi.fn()

describe('Admin用户仅显示全局仪表盘菜单测试', () => {
  let authStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    vi.clearAllMocks()
  })

  describe('Admin登录菜单配置测试', () => {
    it('admin用户登录后应该只返回全局仪表盘菜单', async () => {
      // Mock登录API响应 - 仅包含全局仪表盘菜单
      const mockLoginResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              username: 'admin',
              name: '系统管理员',
              email: 'admin@company.com',
              status: 1
            },
            permissions: [
              'dashboard:view',
              'rbac:org:view', 'rbac:org:create', 'rbac:user:view', 'rbac:user:create', 
              'rbac:role:view', 'rbac:permission:view', 'rbac:user:assign', 'rbac:sync:config',
              'content:view', 'content:category:view', 'content:category:create', 
              'content:category:edit', 'content:category:delete', 'content:create', 
              'content:edit', 'content:delete', 'news:view', 'news:create', 'news:edit',
              'banner:view', 'flea-market:view', 'quotation:view', 'operation:view', 
              'system:view', 'system:logs:view', 'system:alerts:view', 'system:settings:view'
            ],
            // 重点：menus数组只包含全局仪表盘
            menus: [
              {
                id: 0,
                name: '全局仪表盘',
                path: '/dashboard',
                icon: 'Monitor'
              }
            ]
          }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockLoginResponse as any)

      // 执行登录
      const loginData = { username: 'admin', password: '123456' }
      const result = await authStore.login(loginData)

      // 验证登录成功
      expect(result).toBeDefined()
      expect(authStore.isLoggedIn).toBe(true)
      expect(authStore.user?.username).toBe('admin')

      // 验证菜单配置：只包含全局仪表盘
      expect(authStore.menus).toHaveLength(1)
      expect(authStore.menus[0].name).toBe('全局仪表盘')
      expect(authStore.menus[0].path).toBe('/dashboard')
      expect(authStore.menus[0].icon).toBe('Monitor')

      // 验证不包含其他菜单模块
      const menuNames = authStore.menus.map(menu => menu.name)
      expect(menuNames).not.toContain('认证与权限管理')
      expect(menuNames).not.toContain('内容管理')
      expect(menuNames).not.toContain('资讯聚合管理')
      expect(menuNames).not.toContain('Banner管理')
      expect(menuNames).not.toContain('跳蚤市场管理')
      expect(menuNames).not.toContain('领导名言管理')
      expect(menuNames).not.toContain('运营与推荐管理')
      expect(menuNames).not.toContain('配置与审计')
    })

    it('admin用户应该拥有所有模块和页面的访问权限（尽管菜单只显示仪表盘）', async () => {
      // Mock登录API响应
      const mockLoginResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              username: 'admin',
              name: '系统管理员'
            },
            permissions: [
              // 仪表盘权限
              'dashboard:view',
              
              // RBAC权限
              'rbac:org:view', 'rbac:org:create', 'rbac:org:edit', 'rbac:org:delete',
              'rbac:user:view', 'rbac:user:create', 'rbac:user:edit', 'rbac:user:delete', 'rbac:user:assign',
              'rbac:role:view', 'rbac:role:create', 'rbac:role:edit', 'rbac:role:delete',
              'rbac:permission:view', 'rbac:permission:create', 'rbac:permission:edit', 'rbac:permission:delete',
              'rbac:sync:config',
              
              // 内容管理权限
              'content:view', 'content:create', 'content:edit', 'content:delete',
              'content:category:view', 'content:category:create', 'content:category:edit', 'content:category:delete',
              
              // 资讯管理权限
              'news:view', 'news:create', 'news:edit', 'news:delete',
              
              // Banner管理权限
              'banner:view', 'banner:create', 'banner:edit', 'banner:delete',
              
              // 跳蚤市场权限
              'flea-market:view', 'flea-market:create', 'flea-market:edit', 'flea-market:delete',
              
              // 名言管理权限
              'quotation:view', 'quotation:create', 'quotation:edit', 'quotation:delete',
              
              // 运营管理权限
              'operation:view', 'operation:create', 'operation:edit', 'operation:delete',
              
              // 系统管理权限
              'system:view', 'system:settings:view', 'system:settings:edit',
              'system:logs:view', 'system:alerts:view', 'system:alerts:manage'
            ],
            menus: [
              {
                id: 0,
                name: '全局仪表盘',
                path: '/dashboard',
                icon: 'Monitor'
              }
            ]
          }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockLoginResponse as any)

      // 执行登录
      await authStore.login({ username: 'admin', password: '123456' })

      // 验证权限覆盖所有模块
      const criticalPermissions = [
        'dashboard:view',
        'rbac:org:view', 'rbac:user:view', 'rbac:role:view', 'rbac:permission:view', 'rbac:user:assign', 'rbac:sync:config',
        'content:view', 'content:create', 'content:edit', 'content:delete',
        'news:view', 'news:create', 'news:edit',
        'banner:view', 'flea-market:view', 'quotation:view', 'operation:view',
        'system:view', 'system:logs:view', 'system:settings:view', 'system:alerts:view'
      ]

      criticalPermissions.forEach(permission => {
        expect(authStore.checkPermission(permission)).toBe(true)
      })

      // 验证权限数量充足（应该包含大量权限）
      expect(authStore.permissions.length).toBeGreaterThan(30)
    })

    it('菜单配置应该与权限配置独立 - 菜单简化但权限完整', async () => {
      // Mock登录响应
      const mockLoginResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              username: 'admin',
              name: '系统管理员'
            },
            permissions: [
              'dashboard:view',
              'rbac:user:view',
              'content:view',
              'system:logs:view'
            ],
            menus: [
              {
                id: 0,
                name: '全局仪表盘',
                path: '/dashboard',
                icon: 'Monitor'
              }
            ]
          }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockLoginResponse as any)

      await authStore.login({ username: 'admin', password: '123456' })

      // 验证菜单简化：只有1个菜单项
      expect(authStore.menus).toHaveLength(1)
      expect(authStore.menus[0].name).toBe('全局仪表盘')

      // 验证权限完整：能访问其他模块（尽管菜单不显示）
      expect(authStore.checkPermission('rbac:user:view')).toBe(true)
      expect(authStore.checkPermission('content:view')).toBe(true)
      expect(authStore.checkPermission('system:logs:view')).toBe(true)

      // 用户可以直接通过URL访问有权限的页面，即使菜单不显示
      expect(authStore.checkPermission('dashboard:view')).toBe(true)
    })
  })

  describe('菜单显示逻辑测试', () => {
    it('应该正确处理空的children数组', async () => {
      const mockLoginResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-jwt-token',
            user: { id: 1, username: 'admin', name: '系统管理员' },
            permissions: ['dashboard:view'],
            menus: [
              {
                id: 0,
                name: '全局仪表盘',
                path: '/dashboard',
                icon: 'Monitor',
                children: [] // 空的children数组应该被正确处理
              }
            ]
          }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockLoginResponse as any)

      await authStore.login({ username: 'admin', password: '123456' })

      expect(authStore.menus).toHaveLength(1)
      expect(authStore.menus[0].children).toEqual([])
    })

    it('应该正确处理没有children字段的菜单项', async () => {
      const mockLoginResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          code: 200,
          message: '登录成功',
          data: {
            token: 'mock-jwt-token',
            user: { id: 1, username: 'admin', name: '系统管理员' },
            permissions: ['dashboard:view'],
            menus: [
              {
                id: 0,
                name: '全局仪表盘',
                path: '/dashboard',
                icon: 'Monitor'
                // 没有children字段
              }
            ]
          }
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockLoginResponse as any)

      await authStore.login({ username: 'admin', password: '123456' })

      expect(authStore.menus).toHaveLength(1)
      expect(authStore.menus[0].children).toBeUndefined()
    })
  })

  describe('边界情况测试', () => {
    it('登录失败时菜单应该为空', async () => {
      const mockLoginResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({
          code: 401,
          message: '用户名或密码错误'
        })
      }

      vi.mocked(fetch).mockResolvedValue(mockLoginResponse as any)

      try {
        await authStore.login({ username: 'admin', password: 'wrong' })
      } catch (error) {
        // 登录失败是预期的
      }

      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.menus).toHaveLength(0)
    })

    it('网络错误时应该保持未登录状态', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      try {
        await authStore.login({ username: 'admin', password: '123456' })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }

      expect(authStore.isLoggedIn).toBe(false)
      expect(authStore.menus).toHaveLength(0)
    })
  })
})