import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import type { 
  User, Role, Permission, UserGroup, SyncConfig,
  UserQueryParams, RoleQueryParams
} from '@/types'


export const useRbacStore = defineStore('rbac', () => {
  // 用户管理状态
  const users = ref<User[]>([])
  const userTotal = ref(0)
  const userLoading = ref(false)

  // 角色管理状态
  const roles = ref<Role[]>([])
  const roleTotal = ref(0)
  const roleLoading = ref(false)

  // 权限管理状态
  const permissions = ref<Permission[]>([])
  const permissionTree = ref<Permission[]>([])
  const permissionLoading = ref(false)

  // 组织架构状态
  const groups = ref<UserGroup[]>([])
  const groupTree = ref<UserGroup[]>([])
  const groupLoading = ref(false)


  // 同步配置状态
  const syncConfigs = ref<SyncConfig[]>([])
  const syncLoading = ref(false)

  // 计算属性
  const activeUsers = computed(() => users.value.filter(user => user.status === 1))
  const activeRoles = computed(() => roles.value.filter(role => role.status === 1))

  // ========== 用户管理 ==========
  async function fetchUsers(params: UserQueryParams = { page: 1, pageSize: 20 }) {
    userLoading.value = true
    try {
      // Mock数据 - 实际项目中调用API
      // TODO: 实际项目中应该使用 params 参数进行分页和筛选
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          name: '系统管理员',
          email: 'admin@company.com',
          phone: '13800138000',
          groupId: 1,
          group: {
            id: 1,
            name: '信息技术部',
            level: '1',
            sort: 1,
            createTime: '2025-08-30T00:00:00'
          },
          status: 1,
          roles: [
            {
              id: 1,
              name: '系统管理员',
              code: 'system_admin',
              permissions: [
                // 仪表盘权限
                'dashboard:view',
                
                // RBAC权限 - 组织架构
                'rbac:org:view', 'rbac:org:create', 'rbac:org:edit', 'rbac:org:delete',
                
                // RBAC权限 - 用户管理
                'rbac:user:view', 'rbac:user:create', 'rbac:user:edit', 'rbac:user:delete', 'rbac:user:assign',
                
                // RBAC权限 - 角色管理
                'rbac:role:view', 'rbac:role:create', 'rbac:role:edit', 'rbac:role:delete',
                
                // RBAC权限 - 权限管理
                'rbac:permission:view', 'rbac:permission:create', 'rbac:permission:edit', 'rbac:permission:delete',
                
                // RBAC权限 - 同步配置
                'rbac:sync:config',
                
                // 内容管理权限
                'content:view', 'content:create', 'content:edit', 'content:delete', 'content:audit',
                'content:category:view', 'content:category:create', 'content:category:edit', 'content:category:delete',
                
                // 系统管理权限
                'system:logs:view', 'system:settings:view', 'system:settings:edit', 
                'system:alerts:view', 'system:alerts:manage'
              ],
              dataScope: 1,
              status: 1,
              createTime: '2025-08-30T00:00:00',
              updateTime: '2025-08-30T00:00:00'
            }
          ],
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        },
        {
          id: 2,
          username: 'content_manager',
          name: '内容管理员',
          email: 'content@company.com',
          groupId: 2,
          group: {
            id: 2,
            name: '内容运营部',
            level: '1.2',
            sort: 2,
            createTime: '2025-08-30T00:00:00'
          },
          status: 1,
          roles: [
            {
              id: 2,
              name: '内容审核员',
              code: 'content_auditor',
              permissions: [],
              dataScope: 2,
              status: 1,
              createTime: '2025-08-30T00:00:00',
              updateTime: '2025-08-30T00:00:00'
            }
          ],
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        }
      ]

      users.value = mockUsers
      userTotal.value = mockUsers.length
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw error
    } finally {
      userLoading.value = false
    }
  }

  async function createUser(userData: Partial<User>) {
    try {
      // Mock - 实际调用API
      const newUser: User = {
        id: Date.now(),
        username: userData.username!,
        name: userData.name!,
        email: userData.email!,
        groupId: userData.groupId!,
        status: userData.status || 1,
        roles: [],
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      users.value.unshift(newUser)
      userTotal.value += 1
      return newUser
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    }
  }

  async function updateUser(id: number, userData: Partial<User>) {
    try {
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = { ...users.value[index], ...userData, updateTime: new Date().toISOString() }
        return users.value[index]
      }
      throw new Error('用户不存在')
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  async function deleteUser(id: number) {
    try {
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value.splice(index, 1)
        userTotal.value -= 1
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  async function batchDeleteUsers(ids: number[]) {
    try {
      users.value = users.value.filter(u => !ids.includes(u.id))
      userTotal.value = users.value.length
    } catch (error) {
      console.error('批量删除用户失败:', error)
      throw error
    }
  }

  async function resetUserPassword(id: number) {
    try {
      // Mock - 实际调用API
      const newPassword = Math.random().toString(36).slice(-8)
      return { password: newPassword }
    } catch (error) {
      console.error('重置密码失败:', error)
      throw error
    }
  }

  // ========== 角色管理 ==========
  async function fetchRoles(params: RoleQueryParams = { page: 1, pageSize: 20 }) {
    roleLoading.value = true
    try {
      // TODO: 实际项目中应该使用 params 参数进行分页和筛选
      const mockRoles: Role[] = [
        {
          id: 1,
          name: '系统管理员',
          code: 'system_admin',
          description: '拥有系统所有权限',
          permissions: [
            // 仪表盘权限
            'dashboard:view',
            
            // RBAC权限 - 组织架构
            'rbac:org:view', 'rbac:org:create', 'rbac:org:edit', 'rbac:org:delete',
            
            // RBAC权限 - 用户管理
            'rbac:user:view', 'rbac:user:create', 'rbac:user:edit', 'rbac:user:delete', 'rbac:user:assign',
            
            // RBAC权限 - 角色管理
            'rbac:role:view', 'rbac:role:create', 'rbac:role:edit', 'rbac:role:delete',
            
            // RBAC权限 - 权限管理
            'rbac:permission:view', 'rbac:permission:create', 'rbac:permission:edit', 'rbac:permission:delete',
            
            // RBAC权限 - 同步配置
            'rbac:sync:config',
            
            // 内容管理权限
            'content:view', 'content:create', 'content:edit', 'content:delete', 'content:audit',
            'content:category:view', 'content:category:create', 'content:category:edit', 'content:category:delete',
            
            // 系统管理权限
            'system:logs:view', 'system:settings:view', 'system:settings:edit', 
            'system:alerts:view', 'system:alerts:manage'
          ],
          dataScope: 1,
          status: 1,
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        },
        {
          id: 2,
          name: '内容审核员',
          code: 'content_auditor',
          description: '负责内容审核工作',
          permissions: [
            'dashboard:view',
            'content:view', 'content:category:view'
          ],
          dataScope: 2,
          status: 1,
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        },
        {
          id: 3,
          name: '普通用户',
          code: 'normal_user',
          description: '普通用户权限',
          permissions: [
            'dashboard:view'
          ],
          dataScope: 4,
          status: 1,
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        }
      ]

      roles.value = mockRoles
      roleTotal.value = mockRoles.length
    } catch (error) {
      console.error('获取角色列表失败:', error)
      throw error
    } finally {
      roleLoading.value = false
    }
  }

  async function createRole(roleData: Partial<Role>) {
    const authStore = useAuthStore()
    try {
      const newRole: Role = {
        id: Date.now(),
        name: roleData.name!,
        code: roleData.code!,
        description: roleData.description,
        permissions: roleData.permissions || [],
        dataScope: roleData.dataScope || 4,
        status: roleData.status || 1,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      roles.value.unshift(newRole)
      roleTotal.value += 1


      return newRole
    } catch (error) {
      console.error('创建角色失败:', error)
      throw error
    }
  }

  async function updateRole(id: number, roleData: Partial<Role>) {
    const authStore = useAuthStore()
    try {
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const oldRole = { ...roles.value[index] }
        roles.value[index] = { ...roles.value[index], ...roleData, updateTime: new Date().toISOString() }
        

        return roles.value[index]
      }
      throw new Error('角色不存在')
    } catch (error) {
      console.error('更新角色失败:', error)
      throw error
    }
  }

  async function deleteRole(id: number) {
    const authStore = useAuthStore()
    try {
      const index = roles.value.findIndex(r => r.id === id)
      if (index !== -1) {
        const deletedRole = { ...roles.value[index] }
        roles.value.splice(index, 1)
        roleTotal.value -= 1

      }
    } catch (error) {
      console.error('删除角色失败:', error)
      throw error
    }
  }

  // ========== 权限管理 ==========
  async function fetchPermissions() {
    permissionLoading.value = true
    try {
      const mockPermissions: Permission[] = [
        // 仪表盘权限
        {
          id: 1,
          permKey: 'dashboard:view',
          name: '查看仪表盘',
          module: 'Dashboard',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        
        // RBAC权限 - 组织架构
        {
          id: 2,
          permKey: 'rbac:org:view',
          name: '查看组织架构',
          module: 'RBAC',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 3,
          permKey: 'rbac:org:create',
          name: '创建组织',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 4,
          permKey: 'rbac:org:edit',
          name: '编辑组织',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 5,
          permKey: 'rbac:org:delete',
          name: '删除组织',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        
        // RBAC权限 - 用户管理
        {
          id: 6,
          permKey: 'rbac:user:view',
          name: '查看用户',
          module: 'RBAC',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 7,
          permKey: 'rbac:user:create',
          name: '创建用户',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 8,
          permKey: 'rbac:user:edit',
          name: '编辑用户',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 9,
          permKey: 'rbac:user:delete',
          name: '删除用户',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 10,
          permKey: 'rbac:user:assign',
          name: '分配用户角色',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        
        // RBAC权限 - 角色管理
        {
          id: 11,
          permKey: 'rbac:role:view',
          name: '查看角色',
          module: 'RBAC',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 12,
          permKey: 'rbac:role:create',
          name: '创建角色',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 13,
          permKey: 'rbac:role:edit',
          name: '编辑角色',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 14,
          permKey: 'rbac:role:delete',
          name: '删除角色',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        
        // RBAC权限 - 权限管理
        {
          id: 15,
          permKey: 'rbac:permission:view',
          name: '查看权限',
          module: 'RBAC',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 16,
          permKey: 'rbac:permission:create',
          name: '创建权限',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 17,
          permKey: 'rbac:permission:edit',
          name: '编辑权限',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 18,
          permKey: 'rbac:permission:delete',
          name: '删除权限',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        
        // RBAC权限 - 同步配置
        {
          id: 19,
          permKey: 'rbac:sync:config',
          name: '同步配置管理',
          module: 'RBAC',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        
        // 内容管理权限
        {
          id: 20,
          permKey: 'content:view',
          name: '查看内容管理',
          module: 'Content',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 21,
          permKey: 'content:create',
          name: '创建内容',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 22,
          permKey: 'content:edit',
          name: '编辑内容',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 23,
          permKey: 'content:delete',
          name: '删除内容',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 24,
          permKey: 'content:audit',
          name: '内容审核',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 25,
          permKey: 'content:category:view',
          name: '查看版块管理',
          module: 'Content',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 26,
          permKey: 'content:category:create',
          name: '创建版块',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 27,
          permKey: 'content:category:edit',
          name: '编辑版块',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 28,
          permKey: 'content:category:delete',
          name: '删除版块',
          module: 'Content',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        
        // 系统管理权限
        {
          id: 29,
          permKey: 'system:logs:view',
          name: '查看系统日志',
          module: 'System',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 30,
          permKey: 'system:settings:view',
          name: '查看系统设置',
          module: 'System',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 31,
          permKey: 'system:settings:edit',
          name: '修改系统设置',
          module: 'System',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 32,
          permKey: 'system:alerts:view',
          name: '查看系统告警',
          module: 'System',
          type: 1,
          createTime: '2025-08-30T00:00:00'
        },
        {
          id: 33,
          permKey: 'system:alerts:manage',
          name: '管理系统告警',
          module: 'System',
          type: 2,
          createTime: '2025-08-30T00:00:00'
        }
      ]

      permissions.value = mockPermissions
      buildPermissionTree()
    } catch (error) {
      console.error('获取权限列表失败:', error)
      throw error
    } finally {
      permissionLoading.value = false
    }
  }

  function buildPermissionTree() {
    // 构建权限树结构
    const tree: Permission[] = []
    const map: { [key: string]: Permission[] } = {}

    // 按模块分组
    permissions.value.forEach(perm => {
      const module = perm.module || 'Other'
      if (!map[module]) {
        map[module] = []
      }
      map[module].push(perm)
    })

    // 构建树结构
    Object.keys(map).forEach(module => {
      tree.push({
        id: Date.now() + Math.random(),
        permKey: module,
        name: module,
        type: 1,
        children: map[module],
        createTime: new Date().toISOString()
      })
    })

    permissionTree.value = tree
  }

  async function createPermission(permissionData: Partial<Permission>) {
    try {
      const newPermission: Permission = {
        id: Date.now(),
        permKey: permissionData.permKey!,
        name: permissionData.name!,
        module: permissionData.module,
        type: permissionData.type || 1,
        parentId: permissionData.parentId,
        path: permissionData.path,
        icon: permissionData.icon,
        sort: permissionData.sort,
        createTime: new Date().toISOString()
      }
      
      permissions.value.push(newPermission)
      buildPermissionTree()
      return newPermission
    } catch (error) {
      console.error('创建权限失败:', error)
      throw error
    }
  }

  async function updatePermission(id: number, permissionData: Partial<Permission>) {
    try {
      const index = permissions.value.findIndex(p => p.id === id)
      if (index !== -1) {
        permissions.value[index] = { ...permissions.value[index], ...permissionData }
        buildPermissionTree()
        return permissions.value[index]
      }
      throw new Error('权限不存在')
    } catch (error) {
      console.error('更新权限失败:', error)
      throw error
    }
  }

  async function deletePermission(id: number) {
    try {
      const index = permissions.value.findIndex(p => p.id === id)
      if (index !== -1) {
        permissions.value.splice(index, 1)
        buildPermissionTree()
      }
    } catch (error) {
      console.error('删除权限失败:', error)
      throw error
    }
  }

  // ========== 组织架构 ==========
  async function fetchGroups() {
    groupLoading.value = true
    try {
      const mockGroups: UserGroup[] = [
        {
          id: 1,
          name: '总公司',
          level: '1',
          sort: 1,
          userCount: 50,
          createTime: '2025-08-30T00:00:00',
          children: [
            {
              id: 2,
              name: '信息技术部',
              parentId: 1,
              level: '1.1',
              sort: 1,
              userCount: 15,
              createTime: '2025-08-30T00:00:00'
            },
            {
              id: 3,
              name: '内容运营部',
              parentId: 1,
              level: '1.2',
              sort: 2,
              userCount: 20,
              createTime: '2025-08-30T00:00:00'
            },
            {
              id: 4,
              name: '人力资源部',
              parentId: 1,
              level: '1.3',
              sort: 3,
              userCount: 8,
              createTime: '2025-08-30T00:00:00'
            }
          ]
        }
      ]

      groups.value = mockGroups.reduce((acc: UserGroup[], group) => {
        acc.push(group)
        if (group.children) {
          acc.push(...group.children)
        }
        return acc
      }, [])
      
      groupTree.value = mockGroups
    } catch (error) {
      console.error('获取组织架构失败:', error)
      throw error
    } finally {
      groupLoading.value = false
    }
  }

  async function createGroup(groupData: Partial<UserGroup>) {
    try {
      const newGroup: UserGroup = {
        id: Date.now(),
        name: groupData.name!,
        parentId: groupData.parentId,
        level: '1',
        sort: groupData.sort || 0,
        userCount: 0,
        createTime: new Date().toISOString()
      }
      
      groups.value.unshift(newGroup)
      // 重新构建树结构
      await fetchGroups()
      return newGroup
    } catch (error) {
      console.error('创建组织失败:', error)
      throw error
    }
  }

  async function updateGroup(id: number, groupData: Partial<UserGroup>) {
    try {
      const index = groups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        groups.value[index] = { ...groups.value[index], ...groupData, updateTime: new Date().toISOString() }
        // 重新构建树结构
        await fetchGroups()
        return groups.value[index]
      }
      throw new Error('组织不存在')
    } catch (error) {
      console.error('更新组织失败:', error)
      throw error
    }
  }

  async function deleteGroup(id: number) {
    try {
      const index = groups.value.findIndex(g => g.id === id)
      if (index !== -1) {
        groups.value.splice(index, 1)
        // 重新构建树结构
        await fetchGroups()
      }
    } catch (error) {
      console.error('删除组织失败:', error)
      throw error
    }
  }

  async function moveGroup(id: number, parentId: number) {
    try {
      const group = groups.value.find(g => g.id === id)
      if (group) {
        group.parentId = parentId === 0 ? undefined : parentId
        // 重新构建树结构
        await fetchGroups()
      }
    } catch (error) {
      console.error('移动组织失败:', error)
      throw error
    }
  }


  // ========== 同步配置 ==========
  async function fetchSyncConfigs() {
    syncLoading.value = true
    try {
      const mockConfigs: SyncConfig[] = [
        {
          id: 1,
          type: 'wework',
          name: '企业微信同步',
          status: 1,
          config: {
            corpId: 'your-corp-id',
            corpSecret: '****',
            syncSchedule: '0 2 * * *'
          },
          lastSyncTime: '2025-08-30T02:00:00',
          createTime: '2025-08-30T00:00:00',
          updateTime: '2025-08-30T00:00:00'
        }
      ]

      syncConfigs.value = mockConfigs
    } catch (error) {
      console.error('获取同步配置失败:', error)
      throw error
    } finally {
      syncLoading.value = false
    }
  }

  async function createSyncConfig(configData: Partial<SyncConfig>) {
    try {
      const newConfig: SyncConfig = {
        id: Date.now(),
        type: configData.type!,
        name: configData.name!,
        status: configData.status || 1,
        config: configData.config || {},
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      
      syncConfigs.value.unshift(newConfig)
      return newConfig
    } catch (error) {
      console.error('创建同步配置失败:', error)
      throw error
    }
  }

  async function updateSyncConfig(id: number, configData: Partial<SyncConfig>) {
    try {
      const index = syncConfigs.value.findIndex(c => c.id === id)
      if (index !== -1) {
        syncConfigs.value[index] = { ...syncConfigs.value[index], ...configData, updateTime: new Date().toISOString() }
        return syncConfigs.value[index]
      }
      throw new Error('同步配置不存在')
    } catch (error) {
      console.error('更新同步配置失败:', error)
      throw error
    }
  }

  async function deleteSyncConfig(id: number) {
    try {
      const index = syncConfigs.value.findIndex(c => c.id === id)
      if (index !== -1) {
        syncConfigs.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除同步配置失败:', error)
      throw error
    }
  }

  async function toggleSyncConfig(id: number, status: 1 | 0) {
    try {
      const config = syncConfigs.value.find(c => c.id === id)
      if (config) {
        config.status = status
      }
    } catch (error) {
      console.error('切换同步配置状态失败:', error)
      throw error
    }
  }

  async function testSyncConnection(configData: Partial<SyncConfig>) {
    try {
      // Mock 连接测试
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true, message: '连接测试成功' }
    } catch (error) {
      console.error('连接测试失败:', error)
      return { success: false, message: '连接测试失败' }
    }
  }

  async function executeSync(id: number) {
    try {
      // Mock 同步执行
      await new Promise(resolve => setTimeout(resolve, 2000))
      const result = {
        success: true,
        syncTime: new Date().toISOString(),
        totalUsers: 150,
        addedUsers: 5,
        updatedUsers: 12,
        disabledUsers: 3,
        errors: []
      }
      
      // 更新最后同步时间
      const config = syncConfigs.value.find(c => c.id === id)
      if (config) {
        config.lastSyncTime = result.syncTime
      }
      
      return result
    } catch (error) {
      console.error('执行同步失败:', error)
      throw error
    }
  }

  async function getSyncHistory(id: number) {
    try {
      // Mock 同步历史
      const mockHistory = [
        {
          success: true,
          syncTime: '2025-08-30T02:00:00',
          totalUsers: 150,
          addedUsers: 5,
          updatedUsers: 12,
          disabledUsers: 3,
          errors: []
        },
        {
          success: false,
          syncTime: '2025-08-29T02:00:00',
          totalUsers: 0,
          addedUsers: 0,
          updatedUsers: 0,
          disabledUsers: 0,
          errors: ['连接超时', 'API调用失败']
        }
      ]
      
      return { list: mockHistory, total: mockHistory.length }
    } catch (error) {
      console.error('获取同步历史失败:', error)
      throw error
    }
  }

  async function assignUserRoles(userId: number, roleIds: number[]) {
    try {
      const user = users.value.find(u => u.id === userId)
      if (user) {
        // 根据roleIds获取角色信息
        const assignedRoles = roles.value.filter(r => roleIds.includes(r.id))
        user.roles = assignedRoles
      }
    } catch (error) {
      console.error('分配用户角色失败:', error)
      throw error
    }
  }

  return {
    // 状态
    users,
    userTotal,
    userLoading,
    roles,
    roleTotal,
    roleLoading,
    permissions,
    permissionTree,
    permissionLoading,
    groups,
    groupTree,
    groupLoading,
    syncConfigs,
    syncLoading,

    // 计算属性
    activeUsers,
    activeRoles,

    // 方法
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
    resetUserPassword,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    buildPermissionTree,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    moveGroup,
    fetchSyncConfigs,
    createSyncConfig,
    updateSyncConfig,
    deleteSyncConfig,
    toggleSyncConfig,
    testSyncConnection,
    executeSync,
    getSyncHistory,
    assignUserRoles
  }
})