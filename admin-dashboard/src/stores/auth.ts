import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginResponse, MenuNode } from '@/types'
import { SUPER_ADMIN_PERMISSIONS, isSuperAdmin, hasPermission as hasUserPermission } from './permissions'

// 生成默认菜单的函数 - 与router/index.ts保持严格一致
function generateDefaultMenus(): MenuNode[] {
  return [
    {
      id: 0,
      name: '全局仪表盘',
      path: '/dashboard',
      icon: 'Monitor'
    },
    {
      id: 1,
      name: '认证与权限管理',
      path: '/rbac',
      icon: 'Lock',
      children: [
        { id: 11, name: '组织架构', path: '/rbac/organizations', icon: 'OfficeBuilding' },
        { id: 12, name: '用户管理', path: '/rbac/users', icon: 'User' },
        { id: 13, name: '角色管理', path: '/rbac/roles', icon: 'UserFilled' },
        { id: 14, name: '权限点管理', path: '/rbac/permissions', icon: 'Key' },
        { id: 15, name: '用户授权', path: '/rbac/user-roles', icon: 'Avatar' },
        { id: 16, name: '数据同步配置', path: '/rbac/sync-config', icon: 'Refresh' }
      ]
    },
    {
      id: 2,
      name: '内容管理',
      path: '/content',
      icon: 'Document',
      children: [
        { id: 21, name: '版块管理', path: '/content/categories', icon: 'FolderOpened' },
        { id: 24, name: '投票管理', path: '/content/polls', icon: 'DataBoard' },
        { id: 26, name: '置顶/加精申请', path: '/content/feature-requests', icon: 'Star' },
        { id: 23, name: '数据看板', path: '/content/dashboard', icon: 'DataBoard' }
      ]
    },
    {
      id: 3,
      name: '资讯聚合管理',
      path: '/news',
      icon: 'Newspaper',
      children: [
        { id: 31, name: '资讯源管理', path: '/news/sources', icon: 'Connection' },
        { id: 32, name: '资讯内容池', path: '/news/content-pool', icon: 'DataBoard' },
        { id: 34, name: '任务监控', path: '/news/task-monitor', icon: 'Monitor' }
      ]
    },
    {
      id: 4,
      name: 'Banner管理',
      path: '/banner',
      icon: 'Picture',
      children: [
        { id: 41, name: 'Banner列表', path: '/banner/list', icon: 'Picture' },
        { id: 43, name: '我的待办', path: '/banner/my-todo', icon: 'Bell' },
        { id: 44, name: '我的已办', path: '/banner/my-done', icon: 'CircleCheck' },
        { id: 45, name: '状态追踪', path: '/banner/status-tracking', icon: 'DataLine' }
      ]
    },
    {
      id: 5,
      name: '跳蚤市场管理',
      path: '/flea-market',
      icon: 'ShoppingCart',
      children: [
        { id: 61, name: '分类管理', path: '/flea-market/categories', icon: 'Menu' },
        { id: 62, name: '商品管理', path: '/flea-market/goods', icon: 'Goods' },
        { id: 63, name: '举报管理', path: '/flea-market/reports', icon: 'Warning' },
        { id: 64, name: '数据看板', path: '/flea-market/dashboard', icon: 'DataBoard' }
      ]
    },
    {
      id: 6,
      name: '领导名言管理',
      path: '/quotation',
      icon: 'ChatDotRound',
      children: [
        { id: 71, name: '名言管理', path: '/quotation/list', icon: 'ChatDotRound' },
        { id: 73, name: '展示配置', path: '/quotation/display', icon: 'Setting' }
      ]
    },
    {
      id: 7,
      name: '统一审核中心',
      path: '/audit',
      icon: 'Check',
      children: [{ id: 81, name: '审核中心', path: '/audit/center', icon: 'Check' }]
    },
    {
      id: 8,
      name: '运营与推荐管理',
      path: '/operation',
      icon: 'Setting',
      children: [
        { id: 91, name: '首页配置', path: '/operation/homepage', icon: 'House' },
        { id: 92, name: '推荐位管理', path: '/operation/recommendations', icon: 'Star' },
        { id: 93, name: '榜单管理', path: '/operation/rankings', icon: 'TrendCharts' },
        { id: 94, name: '数据看板', path: '/operation/dashboard', icon: 'DataBoard' },
        {
          id: 95,
          name: '工具箱管理',
          path: '/operation/ai-tools',
          icon: 'Tools',
          children: [
            { id: 951, name: '工具标签管理', path: '/operation/ai-tools/tags', icon: 'Collection' },
            { id: 952, name: '工具列表', path: '/operation/ai-tools/tools', icon: 'Box' }
          ]
        },
        { id: 96, name: '问题反馈管理', path: '/operation/feedback', icon: 'ChatDotRound' }
      ]
    },
    {
      id: 9,
      name: '门户配置管理',
      path: '/portal-config',
      icon: 'Grid',
      children: [
        { id: 111, name: '导航管理', path: '/portal-config/navigation', icon: 'Menu' },
        { id: 112, name: '入口面板', path: '/portal-config/entry-panel', icon: 'Grid' },
        { id: 113, name: '版本管理', path: '/portal-config/version-control', icon: 'Clock' },
        { id: 115, name: '性能监控', path: '/portal-config/performance', icon: 'Monitor' }
      ]
    },
    {
      id: 10,
      name: '配置与审计',
      path: '/system',
      icon: 'Tools',
      children: [
        { id: 121, name: '系统配置', path: '/system/settings', icon: 'Setting' },
        { id: 122, name: '审计日志', path: '/system/logs', icon: 'DocumentChecked' },
        { id: 123, name: '操作告警', path: '/system/alerts', icon: 'Bell' },
        { id: 124, name: '权限验证', path: '/system/permissions-test', icon: 'Key', meta: { hideInMenu: true } }
      ]
    }
  ]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>('')
  const user = ref<User | null>(null)
  const permissions = ref<string[]>([])
  const menus = ref<MenuNode[]>([])
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const currentUser = computed(() => user.value)
  const hasPermission = computed(() => (permission: string) => {
    // 演示模式下拥有所有权限
    if (token.value === 'demo-token') {
      return true;
    }
    return permissions.value.includes(permission)
  })

  // 登录
  async function login(loginData: { username: string; password: string }) {
    loading.value = true
    try {
      // 调用登录API（使用相对路径，通过Vite代理）
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '登录失败')
      }

      const result = await response.json()
      if (result.code !== 200) {
        throw new Error(result.message || '登录失败')
      }

      // 使用API返回的数据
      const loginResponse = result.data

      token.value = loginResponse.token
      user.value = loginResponse.user
      permissions.value = loginResponse.permissions
      menus.value = loginResponse.menus

      // 如果是管理员，使用完整默认菜单，确保看到所有模块
      const isAdminUser =
        !!user.value &&
        (user.value.username === 'admin' ||
          (Array.isArray(user.value.roles) &&
            user.value.roles.some(r => ['system_admin', 'super_admin', 'admin'].includes(r.code))))

      if (isAdminUser) {
        menus.value = generateDefaultMenus()
      }

      // 存储到localStorage
      localStorage.setItem('auth_token', loginResponse.token)
      localStorage.setItem('user_info', JSON.stringify(loginResponse.user))
      localStorage.setItem('permissions', JSON.stringify(loginResponse.permissions))
      localStorage.setItem('menus', JSON.stringify(menus.value))

      return loginResponse
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    token.value = ''
    user.value = null
    permissions.value = []
    menus.value = []

    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    localStorage.removeItem('permissions')
    localStorage.removeItem('menus')
  }

  // 强制清除所有缓存数据
  function clearAllCache() {
    console.log('强制清除所有缓存数据')
    localStorage.clear()
    token.value = ''
    user.value = null
    permissions.value = []
    menus.value = []
  }

  // 初始化：从localStorage恢复状态
  function initAuth() {
    try {
      console.log('=== 开始初始化Auth状态 ===')

      // 演示模式：如果localStorage中没有登录信息，则自动进入演示模式
      const storedToken = localStorage.getItem('auth_token')
      const storedUser = localStorage.getItem('user_info')
      const storedPermissions = localStorage.getItem('permissions')
      const storedMenus = localStorage.getItem('menus')

      console.log('存储的token:', storedToken ? '存在' : '不存在')
      console.log('存储的用户信息:', storedUser ? '存在' : '不存在')
      console.log('存储的权限信息:', storedPermissions ? '存在' : '不存在')
      console.log('存储的菜单信息:', storedMenus ? '存在' : '不存在')

      // 如果没有存储的登录信息，进入演示模式
      if (!storedToken || !storedUser || !storedPermissions) {
        console.log('未检测到登录信息，进入演示模式')
        
        // 设置演示用户信息
        token.value = 'demo-token'
        user.value = {
          id: 1,
          username: 'demo',
          name: '演示用户',
          email: 'demo@example.com',
          phone: '13800138000',
          avatar: '',
          groupId: 1,
          status: 1,
          roles: [
            {
              id: 1,
              code: 'demo_user',
              name: '演示用户',
              description: '演示用户角色',
              permissions: [],
              dataScope: 'all' as any,
              status: 1,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            }
          ],
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        
        // 设置所有权限（演示模式）
        permissions.value = SUPER_ADMIN_PERMISSIONS
        
        // 设置菜单
        menus.value = generateDefaultMenus()
        
        // 保存到localStorage
        localStorage.setItem('auth_token', token.value)
        localStorage.setItem('user_info', JSON.stringify(user.value))
        localStorage.setItem('permissions', JSON.stringify(permissions.value))
        localStorage.setItem('menus', JSON.stringify(menus.value))
        
        console.log('演示模式初始化完成')
        return
      }

      // 开发模式自动登录
      if (import.meta.env.DEV) {
        console.log('开发模式：检查是否需要自动登录')
        
        // 强制更新菜单数据 - 清除旧的菜单缓存
        console.log('🔄 强制更新菜单数据，清除旧的缓存')
        localStorage.removeItem('menus')
        
        if (!storedToken) {
          console.log('开发模式：自动登录管理员用户')
          // 自动登录管理员用户
          token.value = 'dev-admin-token'
          user.value = {
            id: 1,
            username: 'admin',
            name: '系统管理员',
            email: 'admin@example.com',
            phone: '13800138000',
            avatar: '',
            groupId: 1,
            status: 1,
            roles: [
              {
                id: 1,
                code: 'super_admin',
                name: '超级管理员',
                description: '超级管理员角色',
                permissions: [],
                dataScope: 'all' as any,
                status: 1,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString()
              }
            ],
            createTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          }
          permissions.value = SUPER_ADMIN_PERMISSIONS // 超级管理员的完整权限
          
          // 强制使用最新的菜单结构
          console.log('🔧 强制更新菜单为最新结构')
          menus.value = generateDefaultMenus()
          
          // 保存到localStorage
          localStorage.setItem('auth_token', token.value)
          localStorage.setItem('user_info', JSON.stringify(user.value))
          localStorage.setItem('permissions', JSON.stringify(permissions.value))
          localStorage.setItem('menus', JSON.stringify(menus.value))

          console.log('开发模式：自动登录完成')
          console.log('📋 菜单列表验证:', menus.value.find(m => m.name === '内容管理')?.children?.map(c => c.name))
          return
        }
      }

      // 强制清除可能损坏的缓存数据
      console.log('存储的token:', storedToken ? '存在' : '不存在')
      console.log('存储的用户信息:', storedUser ? '存在' : '不存在')
      console.log('存储的权限信息:', storedPermissions ? '存在' : '不存在')
      console.log('存储的菜单信息:', storedMenus ? '存在' : '不存在')

      // 检查数据完整性
      if (storedPermissions) {
        try {
          const parsedPermissions = JSON.parse(storedPermissions)
          console.log('权限解析结果:', parsedPermissions)
          console.log('是否包含dashboard:view:', parsedPermissions.includes('dashboard:view'))
        } catch (e) {
          console.error('权限数据解析失败:', e)
          logout()
          return
        }
      }

      // 基本登录信息检查（菜单可以重建，不是必须的）
      if (storedToken && storedUser && storedPermissions) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        permissions.value = JSON.parse(storedPermissions)

        console.log('Auth状态恢复成功')
        console.log('用户:', user.value?.name)
        console.log('权限数量:', permissions.value.length)
        console.log('权限列表:', permissions.value)
        console.log('dashboard:view权限检查:', permissions.value.includes('dashboard:view'))

        // 优先使用存储的菜单数据，如果不存在则重建
        if (storedMenus) {
          try {
            menus.value = JSON.parse(storedMenus)
            console.log('菜单数据恢复成功，菜单数量:', menus.value.length)
            console.log(
              '菜单数据详情:',
              menus.value.map(m => ({
                name: m.name,
                path: m.path,
                childrenCount: m.children?.length || 0
              }))
            )
          } catch (e) {
            console.error('菜单数据解析失败，重建菜单:', e)
            menus.value = generateDefaultMenus()
            console.log('重建后菜单数量:', menus.value.length)
          }
        } else {
          console.log('没有存储的菜单数据，重建默认菜单')
          menus.value = generateDefaultMenus()
          console.log('重建后菜单数量:', menus.value.length)
          console.log(
            '重建后菜单详情:',
            menus.value.map(m => ({ name: m.name, path: m.path }))
          )
        }

        // 如果是管理员账号，确保覆盖为完整菜单
        const isAdminUser =
          !!user.value &&
          (user.value.username === 'admin' ||
            (Array.isArray(user.value.roles) &&
              user.value.roles.some(r =>
                ['system_admin', 'super_admin', 'admin'].includes(r.code)
              )))
        if (isAdminUser) {
          console.log('🔧 管理员用户，强制更新为最新菜单')
          menus.value = generateDefaultMenus()
          // 强制更新菜单缓存
          localStorage.setItem('menus', JSON.stringify(menus.value))
          console.log('📋 管理员菜单验证:', menus.value.find(m => m.name === '内容管理')?.children?.map(c => c.name))
        }
      } else {
        console.log('没有有效的登录信息，保持未登录状态')
        // 确保清理任何可能残留的部分数据
        logout()
      }
    } catch (error) {
      console.error('Auth状态初始化失败:', error)
      // 发生错误时清理所有状态
      logout()
    }
  }

  // 检查权限
  function checkPermission(permission: string): boolean {
    // 演示模式下拥有所有权限
    if (token.value === 'demo-token') {
      return true;
    }
    return hasUserPermission(user.value, permission)
  }

  // 检查多个权限（AND关系）
  function checkPermissions(perms: string[]): boolean {
    // 演示模式下拥有所有权限
    if (token.value === 'demo-token') {
      return true;
    }
    // 超级管理员拥有所有权限
    if (isSuperAdmin(user.value)) return true
    return perms.every(perm => hasUserPermission(user.value, perm))
  }

  // 检查多个权限（OR关系）
  function checkAnyPermission(perms: string[]): boolean {
    // 演示模式下拥有所有权限
    if (token.value === 'demo-token') {
      return true;
    }
    // 超级管理员拥有所有权限
    if (isSuperAdmin(user.value)) return true
    return perms.some(perm => hasUserPermission(user.value, perm))
  }

  return {
    // 状态
    token,
    user,
    permissions,
    menus,
    loading,

    // 计算属性
    isLoggedIn,
    currentUser,
    hasPermission,

    // 方法
    login,
    logout,
    initAuth,
    clearAllCache,
    checkPermission,
    checkPermissions,
    checkAnyPermission
  }
})