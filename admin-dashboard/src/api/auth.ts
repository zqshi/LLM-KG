import { http } from './request'
import { apiAdapter } from './adapter'
import { staticData } from '@/services/staticData'
import type { LoginForm, LoginResponse, User, MenuNode, ApiResponse } from '@/types'

// 认证相关API
export const authApi = {
  // 登录
  async login(data: LoginForm): Promise<ApiResponse<LoginResponse>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      try {
        const allUsers: User[] = await staticData.users()
        // 在静态模式下，检查用户名和密码
        const user: User | undefined = allUsers.find((u: User) => u.username === data.username)
        if (!user) {
          return {
            code: 401,
            message: '用户不存在',
            data: null as any,
            success: false
          }
        }
        // 简单的密码验证（在实际应用中应该使用加密密码）
        if (data.password !== 'admin123') {
          return {
            code: 401,
            message: '密码错误',
            data: null as any,
            success: false
          }
        }
        
        // 获取用户权限
        const permissions: string[] = user.roles.reduce((perms: string[], role: any) => {
          if (role.permissions) {
            role.permissions.forEach((perm: any) => {
              if (perm.code && !perms.includes(perm.code)) {
                perms.push(perm.code);
              }
            });
          }
          return perms;
        }, []);
        
        return {
          code: 200,
          message: '登录成功',
          data: {
            token: 'static_mode_token_' + Date.now(),
            user: user,
            permissions: permissions,
            menus: [] // 在静态模式下返回空菜单，由store处理
          },
          success: true
        }
      } catch (error) {
        console.error('静态模式登录错误:', error)
        return {
          code: 500,
          message: '登录处理失败',
          data: null as any,
          success: false
        }
      }
    } else {
      // 调用真实API
      return http.post<LoginResponse>('/auth/login', data)
    }
  },

  // 登出
  async logout(): Promise<ApiResponse<void>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      return {
        code: 200,
        message: '登出成功',
        data: undefined
      }
    } else {
      // 调用真实API
      return http.post('/auth/logout')
    }
  },

  // 获取当前用户信息
  async getUserInfo(): Promise<ApiResponse<User>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      const allUsers: User[] = await staticData.users()
      // 在静态模式下返回默认管理员用户
      const user: User = allUsers.find((u: User) => u.username === 'admin') || allUsers[0]
      
      return {
        code: 200,
        message: '获取用户信息成功',
        data: user
      }
    } else {
      // 调用真实API
      return http.get<User>('/auth/user-info')
    }
  },

  // 获取用户菜单
  async getUserMenus(): Promise<ApiResponse<MenuNode[]>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      const menus: MenuNode[] = [
        {
          id: 1,
          name: '首页',
          path: '/dashboard',
          icon: 'House',
          children: []
        },
        {
          id: 2,
          name: '认证与权限管理',
          path: '/rbac',
          icon: 'User',
          children: [
            {
              id: 11,
              name: '用户管理',
              path: '/rbac/users',
              icon: 'User',
              children: []
            },
            {
              id: 12,
              name: '角色管理',
              path: '/rbac/roles',
              icon: 'UserFilled',
              children: []
            },
            {
              id: 13,
              name: '权限管理',
              path: '/rbac/permissions',
              icon: 'Key',
              children: []
            },
            {
              id: 14,
              name: '组织管理',
              path: '/rbac/organizations',
              icon: 'OfficeBuilding',
              children: []
            }
          ]
        },
        {
          id: 3,
          name: '内容管理',
          path: '/content',
          icon: 'Document',
          children: [
            {
              id: 21,
              name: '分类管理',
              path: '/content/categories',
              icon: 'Folder',
              children: []
            },
            {
              id: 22,
              name: '帖子管理',
              path: '/content/posts',
              icon: 'Document',
              children: []
            },
            {
              id: 23,
              name: '投票管理',
              path: '/content/polls',
              icon: 'DataLine',
              children: []
            },
            {
              id: 24,
              name: '需求管理',
              path: '/content/feature-requests',
              icon: 'Star',
              children: []
            }
          ]
        },
        {
          id: 4,
          name: '运营管理',
          path: '/operation',
          icon: 'Operation',
          children: [
            {
              id: 31,
              name: 'Banner管理',
              path: '/operation/banners',
              icon: 'Picture',
              children: []
            },
            {
              id: 32,
              name: '跳蚤市场',
              path: '/operation/flea-market',
              icon: 'Shop',
              children: []
            },
            {
              id: 33,
              name: '报价管理',
              path: '/operation/quotations',
              icon: 'Money',
              children: []
            },
            {
              id: 34,
              name: '资讯管理',
              path: '/operation/news',
              icon: 'Reading',
              children: []
            }
          ]
        },
        {
          id: 5,
          name: '审核中心',
          path: '/audit',
          icon: 'View',
          children: [
            {
              id: 41,
              name: '审核中心',
              path: '/audit/center',
              icon: 'View',
              children: []
            }
          ]
        },
        {
          id: 6,
          name: '系统管理',
          path: '/system',
          icon: 'Setting',
          children: [
            {
              id: 51,
              name: '配置管理',
              path: '/system/config',
              icon: 'Setting',
              children: []
            },
            {
              id: 52,
              name: '审计日志',
              path: '/system/audit-logs',
              icon: 'Document',
              children: []
            }
          ]
        }
      ]
      
      return {
        code: 200,
        message: '获取用户菜单成功',
        data: menus
      }
    } else {
      // 调用真实API
      return http.get<MenuNode[]>('/auth/menus')
    }
  },

  // 刷新token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      return {
        code: 200,
        message: 'Token刷新成功',
        data: {
          token: 'static_mode_refreshed_token_' + Date.now()
        }
      }
    } else {
      // 调用真实API
      return http.post<{ token: string }>('/auth/refresh-token')
    }
  },

  // 修改密码
  async changePassword(data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      // 在静态模式下模拟成功
      if (data.oldPassword !== 'admin123') {
        return {
          code: 400,
          message: '原密码错误',
          data: undefined
        }
      }
      
      return {
        code: 200,
        message: '密码修改成功',
        data: undefined
      }
    } else {
      // 调用真实API
      return http.put('/auth/change-password', data)
    }
  },

  // 校验权限
  async checkPermission(permission: string): Promise<ApiResponse<{ hasPermission: boolean }>> {
    // 检查是否启用静态模式
    const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL

    if (isStaticMode) {
      return {
        code: 200,
        message: '权限校验成功',
        data: {
          hasPermission: true // 在静态模式下总是返回true（已移除权限控制）
        }
      }
    } else {
      // 调用真实API
      return http.post<{ hasPermission: boolean }>('/auth/check-permission', { permission })
    }
  }
}