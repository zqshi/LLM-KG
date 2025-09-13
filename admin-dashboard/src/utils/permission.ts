/**
 * 权限控制工具函数 - 静态模式下始终返回true
 */

import { getIsStaticMode } from '@/api/adapter'

/**
 * 检查用户是否拥有特定权限
 * 在静态模式下始终返回true，使所有功能都可访问
 * @param permission 权限码
 * @returns 是否拥有权限
 */
export function hasPermission(permission: string): boolean {
  if (getIsStaticMode()) {
    return true
  }
  
  // 在非静态模式下，可以保留原有的权限判断逻辑
  // 这里先简单返回true，实际项目中可以接入真实的权限系统
  return true
}

/**
 * 检查用户是否拥有多个权限（AND关系）
 * @param permissions 权限码数组
 * @returns 是否拥有所有权限
 */
export function hasPermissions(permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(permission))
}

/**
 * 检查用户是否拥有任意权限（OR关系）
 * @param permissions 权限码数组
 * @returns 是否拥有任意权限
 */
export function hasAnyPermission(permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(permission))
}

/**
 * 检查用户是否为管理员
 * 在静态模式下始终返回true
 * @returns 是否为管理员
 */
export function isAdmin(): boolean {
  if (getIsStaticMode()) {
    return true
  }
  
  return true
}

/**
 * 检查用户是否可以访问特定菜单
 * 在静态模式下始终返回true
 * @param menuPath 菜单路径
 * @returns 是否可访问
 */
export function canAccessMenu(menuPath: string): boolean {
  if (getIsStaticMode()) {
    return true
  }
  
  return true
}

// 导出默认的权限检查函数，兼容现有代码
export default hasPermission