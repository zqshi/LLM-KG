import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useMenuFilter, UserRole } from '../useMenuFilter'
import { useAuthStore } from '@/stores/auth'
import type { User, MenuNode } from '@/types'

// Mock Pinia store
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    menus: [],
    currentUser: null,
    isLoggedIn: false,
    permissions: []
  }))
}))

describe('useMenuFilter', () => {
  let mockAuthStore: any
  let mockMenus: MenuNode[]

  beforeEach(() => {
    // 创建模拟菜单数据
    mockMenus = [
      {
        id: 1,
        name: '全局仪表盘',
        path: '/dashboard',
        icon: 'Monitor'
      },
      {
        id: 2,
        name: '认证与权限管理',
        path: '/rbac',
        icon: 'Lock',
        children: [
          { id: 21, name: '用户管理', path: '/rbac/users', icon: 'User' },
          { id: 22, name: '角色管理', path: '/rbac/roles', icon: 'UserFilled' }
        ]
      },
      {
        id: 3,
        name: '内容管理',
        path: '/content',
        icon: 'Document',
        children: [
          { id: 31, name: '版块管理', path: '/content/categories', icon: 'FolderOpened' },
          { id: 32, name: '内容列表', path: '/content/list', icon: 'Document' }
        ]
      },
      {
        id: 4,
        name: '系统配置',
        path: '/system',
        icon: 'Tools',
        children: [{ id: 41, name: '系统设置', path: '/system/settings', icon: 'Setting' }]
      }
    ]

    mockAuthStore = {
      menus: mockMenus,
      currentUser: null,
      isLoggedIn: false,
      permissions: []
    }

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  describe('getUserRole', () => {
    it('应该返回VIEWER角色当用户未登录时', () => {
      const { getUserRole } = useMenuFilter()
      expect(getUserRole.value).toBe(UserRole.VIEWER)
    })

    it('应该返回VIEWER角色当用户没有角色时', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: []
      } as User

      const { getUserRole } = useMenuFilter()
      expect(getUserRole.value).toBe(UserRole.VIEWER)
    })

    it('应该返回SUPER_ADMIN角色当用户是超级管理员时', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN]
      } as User

      const { getUserRole } = useMenuFilter()
      expect(getUserRole.value).toBe(UserRole.SUPER_ADMIN)
    })

    it('应该返回最高权限角色', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.EDITOR, UserRole.CONTENT_MANAGER, UserRole.VIEWER]
      } as User

      const { getUserRole } = useMenuFilter()
      expect(getUserRole.value).toBe(UserRole.CONTENT_MANAGER)
    })
  })

  describe('filteredMenus', () => {
    it('VIEWER角色应该只能看到仪表盘', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.VIEWER]
      } as User

      const { filteredMenus } = useMenuFilter()

      expect(filteredMenus.value).toHaveLength(1)
      expect(filteredMenus.value[0].name).toBe('全局仪表盘')
      expect(filteredMenus.value[0].path).toBe('/dashboard')
    })

    it('CONTENT_MANAGER角色应该能看到仪表盘和内容管理', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.CONTENT_MANAGER]
      } as User

      const { filteredMenus } = useMenuFilter()

      const menuNames = filteredMenus.value.map(m => m.name)
      expect(menuNames).toContain('全局仪表盘')
      expect(menuNames).toContain('内容管理')
      expect(menuNames).not.toContain('认证与权限管理')
      expect(menuNames).not.toContain('系统配置')
    })

    it('SUPER_ADMIN角色应该能看到所有菜单', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.SUPER_ADMIN]
      } as User

      const { filteredMenus } = useMenuFilter()

      expect(filteredMenus.value).toHaveLength(4)

      const menuNames = filteredMenus.value.map(m => m.name)
      expect(menuNames).toContain('全局仪表盘')
      expect(menuNames).toContain('认证与权限管理')
      expect(menuNames).toContain('内容管理')
      expect(menuNames).toContain('系统配置')
    })

    it('应该保持子菜单结构完整', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.ADMIN]
      } as User

      const { filteredMenus } = useMenuFilter()

      const rbacMenu = filteredMenus.value.find(m => m.name === '认证与权限管理')
      expect(rbacMenu).toBeDefined()
      expect(rbacMenu?.children).toHaveLength(2)
      expect(rbacMenu?.children?.[0].name).toBe('用户管理')
      expect(rbacMenu?.children?.[1].name).toBe('角色管理')
    })

    it('应该过滤掉没有可访问子菜单的父级菜单', () => {
      // 创建只有系统配置权限但没有其他权限的情况
      const restrictedMenus: MenuNode[] = [
        {
          id: 1,
          name: '系统配置',
          path: '/system',
          icon: 'Tools',
          children: [] // 没有子菜单
        }
      ]

      mockAuthStore.menus = restrictedMenus
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.VIEWER]
      } as User

      const { filteredMenus } = useMenuFilter()

      // VIEWER角色不应该看到系统配置
      const systemMenu = filteredMenus.value.find(m => m.name === '系统配置')
      expect(systemMenu).toBeUndefined()
    })
  })

  describe('hasFeatureAccess', () => {
    it('SUPER_ADMIN应该拥有所有功能访问权限', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.SUPER_ADMIN]
      } as User

      const { hasFeatureAccess } = useMenuFilter()

      expect(hasFeatureAccess('dashboard')).toBe(true)
      expect(hasFeatureAccess('rbac')).toBe(true)
      expect(hasFeatureAccess('content')).toBe(true)
      expect(hasFeatureAccess('system')).toBe(true)
    })

    it('VIEWER应该只有仪表盘访问权限', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.VIEWER]
      } as User

      const { hasFeatureAccess } = useMenuFilter()

      expect(hasFeatureAccess('dashboard')).toBe(true)
      expect(hasFeatureAccess('rbac')).toBe(false)
      expect(hasFeatureAccess('content')).toBe(false)
      expect(hasFeatureAccess('system')).toBe(false)
    })

    it('CONTENT_MANAGER应该有内容相关功能访问权限', () => {
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.CONTENT_MANAGER]
      } as User

      const { hasFeatureAccess } = useMenuFilter()

      expect(hasFeatureAccess('dashboard')).toBe(true)
      expect(hasFeatureAccess('content')).toBe(true)
      expect(hasFeatureAccess('news')).toBe(true)
      expect(hasFeatureAccess('banner')).toBe(true)
      expect(hasFeatureAccess('quotation')).toBe(true)
      expect(hasFeatureAccess('rbac')).toBe(false)
      expect(hasFeatureAccess('system')).toBe(false)
    })
  })

  describe('getRoleDisplayName', () => {
    it('应该返回正确的角色显示名称', () => {
      const { getRoleDisplayName } = useMenuFilter()

      expect(getRoleDisplayName(UserRole.SUPER_ADMIN)).toBe('超级管理员')
      expect(getRoleDisplayName(UserRole.ADMIN)).toBe('管理员')
      expect(getRoleDisplayName(UserRole.CONTENT_MANAGER)).toBe('内容管理员')
      expect(getRoleDisplayName(UserRole.AUDIT_MANAGER)).toBe('审核管理员')
      expect(getRoleDisplayName(UserRole.OPERATION_MANAGER)).toBe('运营管理员')
      expect(getRoleDisplayName(UserRole.EDITOR)).toBe('编辑')
      expect(getRoleDisplayName(UserRole.VIEWER)).toBe('查看者')
    })

    it('应该为未知角色返回默认名称', () => {
      const { getRoleDisplayName } = useMenuFilter()

      expect(getRoleDisplayName('unknown_role' as UserRole)).toBe('未知角色')
    })
  })

  describe('isMenuAccessible', () => {
    it('应该正确判断菜单访问权限', () => {
      const { isMenuAccessible } = useMenuFilter()

      // SUPER_ADMIN可以访问所有菜单
      expect(isMenuAccessible('/dashboard', UserRole.SUPER_ADMIN)).toBe(true)
      expect(isMenuAccessible('/rbac/users', UserRole.SUPER_ADMIN)).toBe(true)
      expect(isMenuAccessible('/system/settings', UserRole.SUPER_ADMIN)).toBe(true)

      // VIEWER只能访问仪表盘
      expect(isMenuAccessible('/dashboard', UserRole.VIEWER)).toBe(true)
      expect(isMenuAccessible('/rbac/users', UserRole.VIEWER)).toBe(false)
      expect(isMenuAccessible('/content/list', UserRole.VIEWER)).toBe(false)

      // CONTENT_MANAGER可以访问内容相关功能
      expect(isMenuAccessible('/content/list', UserRole.CONTENT_MANAGER)).toBe(true)
      expect(isMenuAccessible('/news/sources', UserRole.CONTENT_MANAGER)).toBe(true)
      expect(isMenuAccessible('/rbac/users', UserRole.CONTENT_MANAGER)).toBe(false)
    })

    it('应该处理根路径和深层路径', () => {
      const { isMenuAccessible } = useMenuFilter()

      expect(isMenuAccessible('/content', UserRole.CONTENT_MANAGER)).toBe(true)
      expect(isMenuAccessible('/content/categories', UserRole.CONTENT_MANAGER)).toBe(true)
      expect(isMenuAccessible('/content/categories/edit/1', UserRole.CONTENT_MANAGER)).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应该处理空菜单数据', () => {
      mockAuthStore.menus = []
      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.ADMIN]
      } as User

      const { filteredMenus } = useMenuFilter()

      expect(filteredMenus.value).toEqual([])
    })

    it('应该处理无效的菜单数据', () => {
      mockAuthStore.menus = [
        null,
        undefined,
        { id: 1, name: '', path: '' }, // 无效菜单项
        { id: 2, name: '有效菜单', path: '/dashboard' } // 有效菜单项，使用dashboard路径确保SUPER_ADMIN能访问
      ].filter(Boolean) as MenuNode[]

      mockAuthStore.currentUser = {
        id: 1,
        name: '测试用户',
        roles: [UserRole.SUPER_ADMIN]
      } as User

      const { filteredMenus } = useMenuFilter()

      // 应该只显示有效且可访问的菜单项
      expect(filteredMenus.value).toHaveLength(1)
      expect(filteredMenus.value[0].name).toBe('有效菜单')
    })
  })
})
