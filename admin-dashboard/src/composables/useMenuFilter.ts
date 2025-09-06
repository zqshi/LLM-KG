import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type { MenuNode } from '@/types'

// 定义角色枚举
export enum UserRole {
  SUPER_ADMIN = 'super_admin', // 超级管理员：全权限
  ADMIN = 'admin', // 管理员：除系统配置外的所有权限
  CONTENT_MANAGER = 'content_manager', // 内容管理员：内容相关功能
  AUDIT_MANAGER = 'audit_manager', // 审核管理员：审核相关功能
  OPERATION_MANAGER = 'operation_manager', // 运营管理员：运营推荐功能
  EDITOR = 'editor', // 编辑：基础内容编辑权限
  VIEWER = 'viewer' // 查看者：只读权限
}

// 角色权限映射表
const ROLE_MENU_ACCESS: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'dashboard',
    'rbac',
    'content',
    'news',
    'banner',
    'flea-market',
    'quotation',
    'audit',
    'operation',
    'portal-config',
    'system'
  ],
  [UserRole.ADMIN]: [
    'dashboard',
    'rbac',
    'content',
    'news',
    'banner',
    'flea-market',
    'quotation',
    'audit',
    'operation',
    'portal-config'
  ],
  [UserRole.CONTENT_MANAGER]: ['dashboard', 'content', 'news', 'banner', 'quotation'],
  [UserRole.AUDIT_MANAGER]: ['dashboard', 'content', 'news', 'banner', 'flea-market', 'audit'],
  [UserRole.OPERATION_MANAGER]: ['dashboard', 'content', 'operation', 'banner', 'portal-config'],
  [UserRole.EDITOR]: ['dashboard', 'content', 'news'],
  [UserRole.VIEWER]: ['dashboard']
}

/**
 * 菜单过滤组合式函数
 * 基于用户角色和权限动态过滤菜单项
 */
export function useMenuFilter() {
  const authStore = useAuthStore()

  // 统一的管理员识别：用户名为admin，或角色code包含 system_admin/super_admin/admin
  const isAdminUser = computed(() => {
    const u = authStore.currentUser
    const roles = (u?.roles || []).map(r => r.code)
    return (
      !!u &&
      (u.username === 'admin' ||
        roles.includes('system_admin') ||
        roles.includes('super_admin') ||
        roles.includes('admin'))
    )
  })

  /**
   * 获取用户角色
   * 从用户信息中提取角色，默认为viewer
   */
  const getUserRole = computed((): UserRole => {
    const user = authStore.currentUser
    if (!user) {
      return UserRole.VIEWER
    }
    // 管理员直接视为超级管理员
    if (isAdminUser.value) return UserRole.SUPER_ADMIN

    const roleCodes = (user.roles || []).map(r => r.code)

    if (roleCodes.includes('content_manager') || roleCodes.includes('content_auditor')) {
      return UserRole.CONTENT_MANAGER
    }
    if (roleCodes.includes('audit_manager')) {
      return UserRole.AUDIT_MANAGER
    }
    if (roleCodes.includes('operation_manager')) {
      return UserRole.OPERATION_MANAGER
    }
    if (roleCodes.includes('editor')) {
      return UserRole.EDITOR
    }
    return UserRole.VIEWER
  })

  /**
   * 检查菜单项是否对当前角色可见
   */
  const isMenuAccessible = (menuPath: string, userRole: UserRole): boolean => {
    const accessibleMenus = ROLE_MENU_ACCESS[userRole] || []

    // 提取菜单的顶级路径
    const pathParts = menuPath.split('/')
    const topLevelPath = pathParts.length > 1 ? pathParts[1] : menuPath.replace('/', '')

    return accessibleMenus.includes(topLevelPath)
  }

  /**
   * 递归过滤菜单项
   */
  const filterMenuItems = (menus: MenuNode[], userRole: UserRole): MenuNode[] => {
    return menus
      .filter(menu => isMenuAccessible(menu.path, userRole))
      .map(menu => ({
        ...menu,
        children: menu.children ? filterMenuItems(menu.children, userRole) : undefined
      }))
      .filter(menu => {
        // 如果菜单有子项，确保过滤后至少有一个可见的子项
        if (menu.children) {
          return menu.children.length > 0
        }
        return true
      })
  }

  /**
   * 获取过滤后的菜单
   */
  const filteredMenus = computed(() => {
    const allMenus = authStore.menus
    const currentRole = getUserRole.value

    // 管理员返回全部菜单，不做过滤
    if (isAdminUser.value) {
      return allMenus
    }

    console.log('=== 菜单过滤调试信息 ===')
    console.log('当前用户角色:', currentRole)
    console.log('原始菜单数量:', allMenus.length)
    console.log('角色可访问的顶级菜单:', ROLE_MENU_ACCESS[currentRole])

    const filtered = filterMenuItems(allMenus, currentRole)

    console.log('过滤后菜单数量:', filtered.length)
    console.log(
      '过滤后菜单:',
      filtered.map(m => ({ name: m.name, path: m.path }))
    )

    return filtered
  })

  /**
   * 检查用户是否有特定功能的访问权限
   */
  const hasFeatureAccess = (feature: string): boolean => {
    const currentRole = getUserRole.value
    return ROLE_MENU_ACCESS[currentRole]?.includes(feature) || false
  }

  /**
   * 获取角色显示名称
   */
  const getRoleDisplayName = (role: UserRole): string => {
    const roleNames = {
      [UserRole.SUPER_ADMIN]: '超级管理员',
      [UserRole.ADMIN]: '管理员',
      [UserRole.CONTENT_MANAGER]: '内容管理员',
      [UserRole.AUDIT_MANAGER]: '审核管理员',
      [UserRole.OPERATION_MANAGER]: '运营管理员',
      [UserRole.EDITOR]: '编辑',
      [UserRole.VIEWER]: '查看者'
    }
    return roleNames[role] || '未知角色'
  }

  return {
    getUserRole,
    filteredMenus,
    hasFeatureAccess,
    getRoleDisplayName,
    isMenuAccessible,
    UserRole
  }
}
