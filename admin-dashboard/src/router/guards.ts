import type { Router } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// 路由权限守卫
export function setupRouterGuards(router: Router) {
  console.log('设置路由守卫...')
  
  // 全局前置守卫
  router.beforeEach((to, _from, next) => {
    console.log('=== 路由守卫触发 ===')
    console.log('访问路径:', to.path)
    
    // 阻止访问已废弃的审计日志路径
    const blockedPaths = ['/rbac/audit-logs', '/content/audit-logs', '/audit/logs']
    if (blockedPaths.includes(to.path)) {
      console.log('阻止访问已废弃的审计日志路径:', to.path)
      next('/dashboard/system/logs') // 重定向到全局审计日志
      return
    }
    
    try {
      const authStore = useAuthStore()
      console.log('authStore获取成功')
      console.log('当前登录状态:', authStore.isLoggedIn)
      console.log('Token:', !!authStore.token)
      console.log('User:', !!authStore.user)
      
      // 白名单路由（不需要登录）
      const whiteList = ['/login']
      
      // 演示模式：允许访问所有路由
      const isDemoMode = authStore.token === 'demo-token';
      // 静态模式：允许访问所有路由
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL;
      
      if (whiteList.includes(to.path) || isDemoMode || isStaticMode) {
        console.log(isDemoMode ? '演示模式，直接通过' : 
                   isStaticMode ? '静态模式，直接通过' : '白名单路由，直接通过')
        next()
        return
      }
      
      // 检查是否已登录
      if (!authStore.isLoggedIn) {
        console.log('未登录，重定向到登录页')
        next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
        return
      }
      
      // 权限检查 - 只对明确设置了权限的路由进行检查
      const permission = to.meta?.permission as string
      // 演示模式下跳过权限检查
      
      if (permission && !isDemoMode) {
        console.log(`检查权限: ${permission}`)
        console.log('用户权限列表:', authStore.permissions)
        
        if (!authStore.checkPermission(permission)) {
          console.log(`用户缺少权限: ${permission}`)
          ElMessage.error('您没有权限访问该页面')
          // 重定向到第一个有权限的页面或仪表盘
          const firstAvailableMenu = authStore.menus.find(menu => {
            if (menu.path && !menu.children) {
              // 检查单级菜单权限
              const menuPermission = getRoutePermission(menu.path)
              return !menuPermission || authStore.checkPermission(menuPermission)
            } else if (menu.children && menu.children.length > 0) {
              // 检查子菜单权限
              return menu.children.some(child => {
                if (child.path) {
                  const childPermission = getRoutePermission(child.path)
                  return childPermission ? (!childPermission || authStore.checkPermission(childPermission)) : true
                }
                return true
              })
            }
            return false
          })
          
          if (firstAvailableMenu) {
            if (firstAvailableMenu.children && firstAvailableMenu.children.length > 0) {
              const firstChild = firstAvailableMenu.children.find(child => {
                if (child.path) {
                  const childPermission = getRoutePermission(child.path)
                  return childPermission ? (!childPermission || authStore.checkPermission(childPermission)) : true
                }
                return true
              })
              if (firstChild && firstChild.path) {
                next(firstChild.path)
              } else {
                next('/dashboard')
              }
            } else if (firstAvailableMenu.path) {
              next(firstAvailableMenu.path)
            } else {
              next('/dashboard')
            }
          } else {
            next('/dashboard')
          }
          return
        } else {
          console.log('权限检查通过')
        }
      } else {
        console.log('该路由无需权限检查或处于演示/静态模式')
      }
      
      console.log('已登录，权限验证通过，允许访问')
      next()
    } catch (error) {
      console.error('路由守卫错误:', error)
      ElMessage.error('路由验证失败，请重新登录')
      next('/login')
    }
  })
  
  // 全局后置守卫
  router.afterEach((to) => {
    // 设置页面标题
    const title = to.meta?.title as string
    if (title) {
      document.title = `${title} - 企业知识聚合平台`
    }
    
    // 页面加载完成，可以在这里添加埋点或其他逻辑
    console.log(`路由跳转到: ${to.path}`)
  })
  
  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
    ElMessage.error('页面加载失败，请刷新重试')
  })
}

// 权限验证函数
export function hasPermission(permission: string): boolean {
  const authStore = useAuthStore()
  // 演示模式下拥有所有权限
  if (authStore.token === 'demo-token') {
    return true;
  }
  // 静态模式下拥有所有权限
  if (import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL) {
    return true;
  }
  return authStore.checkPermission(permission)
}

// 权限验证指令（用于v-permission）
export function checkPermission(permission: string | string[]): boolean {
  const authStore = useAuthStore()
  
  // 演示模式下拥有所有权限
  if (authStore.token === 'demo-token') {
    return true;
  }
  // 静态模式下拥有所有权限
  if (import.meta.env.VITE_STATIC_MODE === 'true' || 
      import.meta.env.VITE_API_BASE_URL === '' || 
      !import.meta.env.VITE_API_BASE_URL) {
    return true;
  }
  
  if (Array.isArray(permission)) {
    return authStore.checkAnyPermission(permission)
  } else {
    return authStore.checkPermission(permission)
  }
}

// 获取路由权限的辅助函数
function getRoutePermission(path: string): string | undefined {
  // 这个映射应该与路由配置中的权限设置保持一致
  const routePermissionMap: Record<string, string> = {
    '/dashboard': 'dashboard:view',
    '/content/dashboard': 'content:view',
    '/content/list': 'content:view',
    '/content/categories': 'content:category:view',

    '/content/feature-requests': 'content:feature:review',
    '/rbac/organizations': 'rbac:org:view',
    '/rbac/users': 'rbac:user:view',
    '/rbac/roles': 'rbac:role:view',
    '/rbac/permissions': 'rbac:permission:view',
    '/rbac/user-roles': 'rbac:user:assign',
    '/rbac/sync-config': 'rbac:sync:config',
    '/system/logs': 'system:logs:view',
    '/system/settings': 'system:settings:view',
    '/system/alerts': 'system:alerts:view',
  }
  
  return routePermissionMap[path]
}