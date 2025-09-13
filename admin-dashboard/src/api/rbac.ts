import { http } from './request'
import { apiAdapter } from './adapter'
import { users, roles, permissions, organizations, syncConfigs } from '@/services/staticData'
import type {
  User, Role, Permission, UserGroup, SyncConfig, SyncResult,
  UserQueryParams, RoleQueryParams,
  UserForm, RoleForm, GroupForm,
  PaginationParams
} from '@/types'

// 用户管理API
export const userApi = {
  // 获取用户列表
  getUsers(params: UserQueryParams) {
    return apiAdapter.get(
      () => http.get<{ list: User[]; total: number }>('/rbac/users', params),
      async () => users,
      {
        mockPagination: true,
        paginationParams: params
      }
    )
  },

  // 获取用户详情
  getUser(id: number) {
    return apiAdapter.get(
      () => http.get<User>(`/rbac/users/${id}`),
      async () => users.find(u => u.id === id) || users[0]
    )
  },

  // 创建用户
  createUser(data: UserForm) {
    return apiAdapter.post(
      () => http.post<User>('/rbac/users', data),
      data as any,
      '用户创建成功'
    )
  },

  // 更新用户
  updateUser(id: number, data: Partial<UserForm>) {
    return apiAdapter.put(
      () => http.put<User>(`/rbac/users/${id}`, data),
      id,
      data,
      '用户更新成功'
    )
  },

  // 删除用户
  deleteUser(id: number) {
    return apiAdapter.delete(
      () => http.delete(`/rbac/users/${id}`),
      '用户删除成功'
    )
  },

  // 批量删除用户
  batchDeleteUsers(ids: number[]) {
    return apiAdapter.delete(
      () => http.delete('/rbac/users/batch', { ids }),
      `成功删除${ids.length}个用户`
    )
  },

  // 重置用户密码
  resetPassword(id: number) {
    return apiAdapter.action(
      () => http.post<{ password: string }>(`/rbac/users/${id}/reset-password`),
      { password: 'NewPassword123!' },
      '密码重置成功'
    )
  },

  // 启用/禁用用户
  toggleUserStatus(id: number, status: 1 | 0) {
    return apiAdapter.action(
      () => http.patch(`/rbac/users/${id}/status`, { status }),
      { status },
      status === 1 ? '用户已启用' : '用户已禁用'
    )
  },

  // 为用户分配角色
  assignRoles(userId: number, roleIds: number[]) {
    return apiAdapter.action(
      () => http.post(`/rbac/users/${userId}/roles`, { roleIds }),
      { roleIds },
      '角色分配成功'
    )
  },

  // 获取用户角色
  getUserRoles(userId: number) {
    return apiAdapter.get(
      () => http.get<Role[]>(`/rbac/users/${userId}/roles`),
      async () => {
        const user = users.find(u => u.id === userId)
        return user?.roles || []
      }
    )
  }
}

// 角色管理API
export const roleApi = {
  // 获取角色列表
  getRoles(params?: RoleQueryParams) {
    return apiAdapter.get(
      () => http.get<{ list: Role[]; total: number }>('/rbac/roles', params),
      async () => roles,
      {
        mockPagination: true,
        paginationParams: params
      }
    )
  },

  // 获取所有角色（不分页）
  getAllRoles() {
    return apiAdapter.get(
      () => http.get<Role[]>('/rbac/roles/all'),
      async () => roles
    )
  },

  // 获取角色详情
  getRole(id: number) {
    return apiAdapter.get(
      () => http.get<Role>(`/rbac/roles/${id}`),
      async () => roles.find(r => r.id === id) || roles[0]
    )
  },

  // 创建角色
  createRole(data: RoleForm) {
    return apiAdapter.post(
      () => http.post<Role>('/rbac/roles', data),
      data as any,
      '角色创建成功'
    )
  },

  // 更新角色
  updateRole(id: number, data: Partial<RoleForm>) {
    return apiAdapter.put(
      () => http.put<Role>(`/rbac/roles/${id}`, data),
      id,
      data,
      '角色更新成功'
    )
  },

  // 删除角色
  deleteRole(id: number) {
    return apiAdapter.delete(
      () => http.delete(`/rbac/roles/${id}`),
      '角色删除成功'
    )
  },

  // 为角色分配权限
  assignPermissions(roleId: number, permissionIds: number[]) {
    return apiAdapter.action(
      () => http.post(`/rbac/roles/${roleId}/permissions`, { permissionIds }),
      { permissionIds },
      '权限分配成功'
    )
  },

  // 获取角色权限
  getRolePermissions(roleId: number) {
    return apiAdapter.get(
      () => http.get<Permission[]>(`/rbac/roles/${roleId}/permissions`),
      async () => {
        const role = roles.find(r => r.id === roleId)
        return role?.permissions || []
      }
    )
  },

  // 复制角色
  copyRole(id: number, name: string, code: string) {
    return apiAdapter.post(
      () => http.post<Role>(`/rbac/roles/${id}/copy`, { name, code }),
      { name, code } as any,
      '角色复制成功'
    )
  }
}

// 权限管理API
export const permissionApi = {
  // 获取权限列表
  getPermissions() {
    return apiAdapter.get(
      () => http.get<Permission[]>('/rbac/permissions'),
      async () => permissions
    )
  },

  // 获取权限树
  getPermissionTree() {
    return apiAdapter.get(
      () => http.get<Permission[]>('/rbac/permissions/tree'),
      async () => {
        // 构建权限树结构
        const buildTree = (items: Permission[], parentId: number | null = null): Permission[] => {
          return items
            .filter(item => item.parentId === parentId)
            .map(item => ({
              ...item,
              children: buildTree(items, item.id)
            }))
        }
        return buildTree(permissions)
      }
    )
  },

  // 获取权限详情
  getPermission(id: number) {
    return apiAdapter.get(
      () => http.get<Permission>(`/rbac/permissions/${id}`),
      async () => permissions.find(p => p.id === id) || permissions[0]
    )
  },

  // 创建权限
  createPermission(data: Partial<Permission>) {
    return apiAdapter.post(
      () => http.post<Permission>('/rbac/permissions', data),
      data as any,
      '权限创建成功'
    )
  },

  // 更新权限
  updatePermission(id: number, data: Partial<Permission>) {
    return apiAdapter.put(
      () => http.put<Permission>(`/rbac/permissions/${id}`, data),
      id,
      data,
      '权限更新成功'
    )
  },

  // 删除权限
  deletePermission(id: number) {
    return apiAdapter.delete(
      () => http.delete(`/rbac/permissions/${id}`),
      '权限删除成功'
    )
  }
}

// 组织架构API
export const groupApi = {
  // 获取组织架构列表
  getGroups() {
    return apiAdapter.get(
      () => http.get<UserGroup[]>('/rbac/groups'),
      async () => {
        // 扁平化组织架构数据
        const flattenOrgs = (orgs: UserGroup[]): UserGroup[] => {
          const result: UserGroup[] = []
          orgs.forEach(org => {
            result.push(org)
            if (org.children) {
              result.push(...flattenOrgs(org.children))
            }
          })
          return result
        }
        return flattenOrgs(organizations)
      }
    )
  },

  // 获取组织架构树
  getGroupTree() {
    return apiAdapter.get(
      () => http.get<UserGroup[]>('/rbac/groups/tree'),
      async () => organizations
    )
  },

  // 获取组织详情
  getGroup(id: number) {
    return apiAdapter.get(
      () => http.get<UserGroup>(`/rbac/groups/${id}`),
      async () => {
        // 递归查找组织
        const findOrg = (orgs: UserGroup[], targetId: number): UserGroup | undefined => {
          for (const org of orgs) {
            if (org.id === targetId) return org
            if (org.children) {
              const found = findOrg(org.children, targetId)
              if (found) return found
            }
          }
          return undefined
        }
        return findOrg(organizations, id) || organizations[0]
      }
    )
  },

  // 创建组织
  createGroup(data: GroupForm) {
    return apiAdapter.post(
      () => http.post<UserGroup>('/rbac/groups', data),
      data as any,
      '组织创建成功'
    )
  },

  // 更新组织
  updateGroup(id: number, data: Partial<GroupForm>) {
    return apiAdapter.put(
      () => http.put<UserGroup>(`/rbac/groups/${id}`, data),
      id,
      data,
      '组织更新成功'
    )
  },

  // 删除组织
  deleteGroup(id: number) {
    return apiAdapter.delete(
      () => http.delete(`/rbac/groups/${id}`),
      '组织删除成功'
    )
  },

  // 移动组织
  moveGroup(id: number, parentId: number) {
    return apiAdapter.action(
      () => http.patch(`/rbac/groups/${id}/move`, { parentId }),
      { parentId },
      '组织移动成功'
    )
  },

  // 为组织分配角色
  assignRoles(groupId: number, roleIds: number[]) {
    return apiAdapter.action(
      () => http.post(`/rbac/groups/${groupId}/roles`, { roleIds }),
      { roleIds },
      '角色分配成功'
    )
  },

  // 获取组织角色
  getGroupRoles(groupId: number) {
    return apiAdapter.get(
      () => http.get<Role[]>(`/rbac/groups/${groupId}/roles`),
      async () => {
        // 返回默认角色
        return [roles[2]] // 返回内容管理员角色作为示例
      }
    )
  }
}


// 数据同步API
export const syncApi = {
  // 获取同步配置列表
  getSyncConfigs() {
    return apiAdapter.get(
      () => http.get<SyncConfig[]>('/rbac/sync-configs'),
      async () => syncConfigs
    )
  },

  // 获取同步配置详情
  getSyncConfig(id: number) {
    return apiAdapter.get(
      () => http.get<SyncConfig>(`/rbac/sync-configs/${id}`),
      async () => syncConfigs.find(s => s.id === id) || syncConfigs[0]
    )
  },

  // 创建同步配置
  createSyncConfig(data: Partial<SyncConfig>) {
    return apiAdapter.post(
      () => http.post<SyncConfig>('/rbac/sync-configs', data),
      data as any,
      '同步配置创建成功'
    )
  },

  // 更新同步配置
  updateSyncConfig(id: number, data: Partial<SyncConfig>) {
    return apiAdapter.put(
      () => http.put<SyncConfig>(`/rbac/sync-configs/${id}`, data),
      id,
      data,
      '同步配置更新成功'
    )
  },

  // 删除同步配置
  deleteSyncConfig(id: number) {
    return apiAdapter.delete(
      () => http.delete(`/rbac/sync-configs/${id}`),
      '同步配置删除成功'
    )
  },

  // 启用/禁用同步配置
  toggleSyncConfig(id: number, status: 1 | 0) {
    return apiAdapter.action(
      () => http.patch(`/rbac/sync-configs/${id}/status`, { status }),
      { status },
      status === 1 ? '同步配置已启用' : '同步配置已禁用'
    )
  },

  // 测试同步连接
  testSyncConnection(data: Partial<SyncConfig>) {
    return apiAdapter.action(
      () => http.post<{ success: boolean; message: string }>('/rbac/sync-configs/test-connection', data),
      { success: true, message: '连接测试成功' },
      '连接测试成功'
    )
  },

  // 手动执行同步
  executeSync(id: number) {
    return apiAdapter.action(
      () => http.post<SyncResult>(`/rbac/sync-configs/${id}/sync`),
      {
        id: Date.now(),
        syncConfigId: id,
        status: 'success',
        startTime: new Date().toISOString().replace('T', ' ').split('.')[0],
        endTime: new Date(Date.now() + 2000).toISOString().replace('T', ' ').split('.')[0],
        totalCount: 50,
        successCount: 48,
        failureCount: 2,
        message: '同步完成，成功48条，失败2条'
      } as any,
      '同步执行成功'
    )
  },

  // 获取同步历史
  getSyncHistory(id: number, params?: PaginationParams) {
    return apiAdapter.get(
      () => http.get<{ list: SyncResult[]; total: number }>(`/rbac/sync-configs/${id}/history`, params),
      async () => {
        // 模拟同步历史数据
        const mockHistory: SyncResult[] = [
          {
            id: 1,
            syncConfigId: id,
            status: 'success',
            startTime: '2024-12-14 06:00:00',
            endTime: '2024-12-14 06:01:30',
            totalCount: 50,
            successCount: 50,
            failureCount: 0,
            message: '同步成功'
          },
          {
            id: 2,
            syncConfigId: id,
            status: 'failed',
            startTime: '2024-12-13 06:00:00',
            endTime: '2024-12-13 06:00:15',
            totalCount: 0,
            successCount: 0,
            failureCount: 0,
            message: '连接超时'
          }
        ]
        return mockHistory
      },
      {
        mockPagination: true,
        paginationParams: params
      }
    )
  },

  // 获取支持的同步类型
  getSyncTypes() {
    return apiAdapter.get(
      () => http.get<Array<{
        type: string;
        name: string;
        description: string;
        configSchema: Record<string, any>;
      }>>('/rbac/sync-configs/types'),
      async () => [
        {
          type: 'ldap',
          name: 'LDAP同步',
          description: '从LDAP服务器同步用户数据',
          configSchema: {
            server: { type: 'string', required: true, label: '服务器地址' },
            baseDN: { type: 'string', required: true, label: '基础DN' },
            bindDN: { type: 'string', required: true, label: '绑定DN' },
            password: { type: 'password', required: true, label: '密码' },
            syncInterval: { type: 'number', required: true, label: '同步间隔(秒)' }
          }
        },
        {
          type: 'ad',
          name: 'AD域同步',
          description: '从Active Directory同步用户数据',
          configSchema: {
            server: { type: 'string', required: true, label: '域控服务器' },
            domain: { type: 'string', required: true, label: '域名' },
            username: { type: 'string', required: true, label: '用户名' },
            password: { type: 'password', required: true, label: '密码' },
            syncInterval: { type: 'number', required: true, label: '同步间隔(秒)' }
          }
        }
      ]
    )
  }
}