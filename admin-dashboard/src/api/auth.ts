import { http } from './request'
import type { LoginForm, LoginResponse, User, MenuNode } from '@/types'

// 认证相关API
export const authApi = {
  // 登录
  login(data: LoginForm) {
    return http.post<LoginResponse>('/auth/login', data)
  },

  // 登出
  logout() {
    return http.post('/auth/logout')
  },

  // 获取当前用户信息
  getUserInfo() {
    return http.get<User>('/auth/user-info')
  },

  // 获取用户菜单
  getUserMenus() {
    return http.get<MenuNode[]>('/auth/menus')
  },

  // 获取用户权限
  getUserPermissions() {
    return http.get<string[]>('/auth/permissions')
  },

  // 刷新token
  refreshToken() {
    return http.post<{ token: string }>('/auth/refresh-token')
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }) {
    return http.put('/auth/change-password', data)
  },

  // 校验权限
  checkPermission(permission: string) {
    return http.post<{ hasPermission: boolean }>('/auth/check-permission', { permission })
  },

  // 获取验证码
  getCaptcha() {
    return http.get<{ captcha: string; key: string }>('/auth/captcha')
  }
}