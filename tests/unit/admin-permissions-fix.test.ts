import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRbacStore } from '@/stores/rbac'

describe('Admin超级管理员权限修复测试', () => {
  let rbacStore: ReturnType<typeof useRbacStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    rbacStore = useRbacStore()
  })

  describe('权限定义完整性测试', () => {
    it('应该包含所有路由所需的权限定义', async () => {
      await rbacStore.fetchPermissions()
      const permissions = rbacStore.permissions

      const requiredPermissions = [
        // 仪表盘权限
        'dashboard:view',
        
        // RBAC权限管理
        'rbac:org:view',
        'rbac:org:create', 
        'rbac:org:edit',
        'rbac:org:delete',
        'rbac:user:view',
        'rbac:user:create',
        'rbac:user:edit', 
        'rbac:user:delete',
        'rbac:user:assign',
        'rbac:role:view',
        'rbac:role:create',
        'rbac:role:edit',
        'rbac:role:delete',
        'rbac:permission:view',
        'rbac:permission:create',
        'rbac:permission:edit',
        'rbac:permission:delete',
        'rbac:sync:config',
        
        // 内容管理权限
        'content:view',
        'content:create',
        'content:edit',
        'content:delete',
        'content:audit',
        'content:category:view',
        'content:category:create',
        'content:category:edit',
        'content:category:delete',
        
        // 系统管理权限
        'system:logs:view',
        'system:settings:view',
        'system:settings:edit',
        'system:alerts:view',
        'system:alerts:manage'
      ]

      const permissionKeys = permissions.map(p => p.permKey)
      
      requiredPermissions.forEach(requiredPerm => {
        expect(permissionKeys).toContain(requiredPerm)
      })
    })

    it('权限应该按模块正确分组', async () => {
      await rbacStore.fetchPermissions()
      const permissions = rbacStore.permissions

      const modules = [...new Set(permissions.map(p => p.module))]
      
      expect(modules).toContain('RBAC')
      expect(modules).toContain('Content')
      expect(modules).toContain('System')
      expect(modules).toContain('Dashboard')
    })
  })

  describe('Admin角色权限测试', () => {
    it('system_admin角色应该拥有所有权限', async () => {
      await rbacStore.fetchRoles()
      await rbacStore.fetchPermissions()
      
      const adminRole = rbacStore.roles.find(role => role.code === 'system_admin')
      expect(adminRole).toBeDefined()
      
      const allPermissionKeys = rbacStore.permissions.map(p => p.permKey)
      
      // admin应该拥有所有定义的权限
      allPermissionKeys.forEach(permKey => {
        expect(adminRole!.permissions).toContain(permKey)
      })
    })

    it('admin用户应该具备所有关键页面访问权限', async () => {
      await rbacStore.fetchUsers()
      await rbacStore.fetchRoles()
      
      const adminUser = rbacStore.users.find(user => user.username === 'admin')
      expect(adminUser).toBeDefined()
      
      const adminRole = adminUser!.roles.find(role => role.code === 'system_admin')
      expect(adminRole).toBeDefined()

      // 关键页面权限检查
      const criticalPermissions = [
        'dashboard:view',
        'rbac:org:view',
        'rbac:user:view', 
        'rbac:role:view',
        'rbac:permission:view',
        'rbac:user:assign',
        'rbac:sync:config',
        'content:view',
        'system:logs:view',
        'system:settings:view',
        'system:alerts:view'
      ]

      criticalPermissions.forEach(permission => {
        expect(adminRole!.permissions).toContain(permission)
      })
    })

    it('admin应该有完整的CRUD权限', async () => {
      await rbacStore.fetchRoles()
      
      const adminRole = rbacStore.roles.find(role => role.code === 'system_admin')
      expect(adminRole).toBeDefined()

      // 检查各模块的完整CRUD权限
      const crudPermissions = [
        // 用户管理CRUD
        'rbac:user:view',
        'rbac:user:create', 
        'rbac:user:edit',
        'rbac:user:delete',
        
        // 角色管理CRUD
        'rbac:role:view',
        'rbac:role:create',
        'rbac:role:edit', 
        'rbac:role:delete',
        
        // 权限管理CRUD
        'rbac:permission:view',
        'rbac:permission:create',
        'rbac:permission:edit',
        'rbac:permission:delete',
        
        // 组织架构CRUD
        'rbac:org:view',
        'rbac:org:create',
        'rbac:org:edit',
        'rbac:org:delete'
      ]

      crudPermissions.forEach(permission => {
        expect(adminRole!.permissions).toContain(permission)
      })
    })
  })

  describe('权限验证逻辑测试', () => {
    it('admin用户应该通过所有权限检查', async () => {
      await rbacStore.fetchUsers()
      await rbacStore.fetchRoles()
      
      const adminUser = rbacStore.users.find(user => user.username === 'admin')
      const adminRole = adminUser!.roles.find(role => role.code === 'system_admin')
      
      // 模拟权限检查函数
      const checkPermission = (permission: string): boolean => {
        return adminRole!.permissions.includes(permission)
      }

      // 测试各种权限检查
      expect(checkPermission('dashboard:view')).toBe(true)
      expect(checkPermission('rbac:permission:view')).toBe(true)
      expect(checkPermission('system:logs:view')).toBe(true)
      expect(checkPermission('rbac:user:assign')).toBe(true)
      expect(checkPermission('rbac:sync:config')).toBe(true)
    })
  })

  describe('数据一致性测试', () => {
    it('权限定义和角色权限应该保持一致', async () => {
      await rbacStore.fetchPermissions()
      await rbacStore.fetchRoles()
      
      const adminRole = rbacStore.roles.find(role => role.code === 'system_admin')
      const allPermissions = rbacStore.permissions.map(p => p.permKey)
      
      // admin角色的权限应该是所有已定义权限的子集
      adminRole!.permissions.forEach(permission => {
        expect(allPermissions).toContain(permission)
      })
      
      // admin角色应该拥有所有权限（作为超级管理员）
      expect(adminRole!.permissions.length).toBe(allPermissions.length)
    })

    it('权限树结构应该正确构建', async () => {
      await rbacStore.fetchPermissions()
      
      expect(rbacStore.permissionTree).toBeDefined()
      expect(rbacStore.permissionTree.length).toBeGreaterThan(0)
      
      // 检查是否按模块正确分组
      const treeModules = rbacStore.permissionTree.map(node => node.name)
      expect(treeModules).toContain('RBAC')
      expect(treeModules).toContain('Content') 
      expect(treeModules).toContain('System')
      expect(treeModules).toContain('Dashboard')
    })
  })
})