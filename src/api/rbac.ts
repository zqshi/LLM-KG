import { http } from './request'
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
    return http.get<{
      list: User[];
      total: number;
    }>('/rbac/users', params)
  },

  // 获取用户详情
  getUser(id: number) {
    return http.get<User>(`/rbac/users/${id}`)
  },

  // 创建用户
  createUser(data: UserForm) {
    return http.post<User>('/rbac/users', data)
  },

  // 更新用户
  updateUser(id: number, data: Partial<UserForm>) {
    return http.put<User>(`/rbac/users/${id}`, data)
  },

  // 删除用户
  deleteUser(id: number) {
    return http.delete(`/rbac/users/${id}`)
  },

  // 批量删除用户
  batchDeleteUsers(ids: number[]) {
    return http.delete('/rbac/users/batch', { ids })
  },

  // 重置用户密码
  resetPassword(id: number) {
    return http.post<{ password: string }>(`/rbac/users/${id}/reset-password`)
  },

  // 启用/禁用用户
  toggleUserStatus(id: number, status: 1 | 0) {
    return http.patch(`/rbac/users/${id}/status`, { status })
  },

  // 为用户分配角色
  assignRoles(userId: number, roleIds: number[]) {
    return http.post(`/rbac/users/${userId}/roles`, { roleIds })
  },

  // 获取用户角色
  getUserRoles(userId: number) {
    return http.get<Role[]>(`/rbac/users/${userId}/roles`)
  }
}

// 角色管理API
export const roleApi = {
  // 获取角色列表
  getRoles(params?: RoleQueryParams) {
    return http.get<{
      list: Role[];
      total: number;
    }>('/rbac/roles', params)
  },

  // 获取所有角色（不分页）
  getAllRoles() {
    return http.get<Role[]>('/rbac/roles/all')
  },

  // 获取角色详情
  getRole(id: number) {
    return http.get<Role>(`/rbac/roles/${id}`)
  },

  // 创建角色
  createRole(data: RoleForm) {
    return http.post<Role>('/rbac/roles', data)
  },

  // 更新角色
  updateRole(id: number, data: Partial<RoleForm>) {
    return http.put<Role>(`/rbac/roles/${id}`, data)
  },

  // 删除角色
  deleteRole(id: number) {
    return http.delete(`/rbac/roles/${id}`)
  },

  // 为角色分配权限
  assignPermissions(roleId: number, permissionIds: number[]) {
    return http.post(`/rbac/roles/${roleId}/permissions`, { permissionIds })
  },

  // 获取角色权限
  getRolePermissions(roleId: number) {
    return http.get<Permission[]>(`/rbac/roles/${roleId}/permissions`)
  },

  // 复制角色
  copyRole(id: number, name: string, code: string) {
    return http.post<Role>(`/rbac/roles/${id}/copy`, { name, code })
  }
}

// 权限管理API
export const permissionApi = {
  // 获取权限列表
  getPermissions() {
    return http.get<Permission[]>('/rbac/permissions')
  },

  // 获取权限树
  getPermissionTree() {
    return http.get<Permission[]>('/rbac/permissions/tree')
  },

  // 获取权限详情
  getPermission(id: number) {
    return http.get<Permission>(`/rbac/permissions/${id}`)
  },

  // 创建权限
  createPermission(data: Partial<Permission>) {
    return http.post<Permission>('/rbac/permissions', data)
  },

  // 更新权限
  updatePermission(id: number, data: Partial<Permission>) {
    return http.put<Permission>(`/rbac/permissions/${id}`, data)
  },

  // 删除权限
  deletePermission(id: number) {
    return http.delete(`/rbac/permissions/${id}`)
  }
}

// 组织架构API
export const groupApi = {
  // 获取组织架构列表
  getGroups() {
    return http.get<UserGroup[]>('/rbac/groups')
  },

  // 获取组织架构树
  getGroupTree() {
    return http.get<UserGroup[]>('/rbac/groups/tree')
  },

  // 获取组织详情
  getGroup(id: number) {
    return http.get<UserGroup>(`/rbac/groups/${id}`)
  },

  // 创建组织
  createGroup(data: GroupForm) {
    return http.post<UserGroup>('/rbac/groups', data)
  },

  // 更新组织
  updateGroup(id: number, data: Partial<GroupForm>) {
    return http.put<UserGroup>(`/rbac/groups/${id}`, data)
  },

  // 删除组织
  deleteGroup(id: number) {
    return http.delete(`/rbac/groups/${id}`)
  },

  // 移动组织
  moveGroup(id: number, parentId: number) {
    return http.patch(`/rbac/groups/${id}/move`, { parentId })
  },

  // 为组织分配角色
  assignRoles(groupId: number, roleIds: number[]) {
    return http.post(`/rbac/groups/${groupId}/roles`, { roleIds })
  },

  // 获取组织角色
  getGroupRoles(groupId: number) {
    return http.get<Role[]>(`/rbac/groups/${groupId}/roles`)
  }
}


// 数据同步API
export const syncApi = {
  // 获取同步配置列表
  getSyncConfigs() {
    return http.get<SyncConfig[]>('/rbac/sync-configs')
  },

  // 获取同步配置详情
  getSyncConfig(id: number) {
    return http.get<SyncConfig>(`/rbac/sync-configs/${id}`)
  },

  // 创建同步配置
  createSyncConfig(data: Partial<SyncConfig>) {
    return http.post<SyncConfig>('/rbac/sync-configs', data)
  },

  // 更新同步配置
  updateSyncConfig(id: number, data: Partial<SyncConfig>) {
    return http.put<SyncConfig>(`/rbac/sync-configs/${id}`, data)
  },

  // 删除同步配置
  deleteSyncConfig(id: number) {
    return http.delete(`/rbac/sync-configs/${id}`)
  },

  // 启用/禁用同步配置
  toggleSyncConfig(id: number, status: 1 | 0) {
    return http.patch(`/rbac/sync-configs/${id}/status`, { status })
  },

  // 测试同步连接
  testSyncConnection(data: Partial<SyncConfig>) {
    return http.post<{ success: boolean; message: string }>('/rbac/sync-configs/test-connection', data)
  },

  // 手动执行同步
  executeSync(id: number) {
    return http.post<SyncResult>(`/rbac/sync-configs/${id}/sync`)
  },

  // 获取同步历史
  getSyncHistory(id: number, params?: PaginationParams) {
    return http.get<{
      list: SyncResult[];
      total: number;
    }>(`/rbac/sync-configs/${id}/history`, params)
  },

  // 获取支持的同步类型
  getSyncTypes() {
    return http.get<Array<{
      type: string;
      name: string;
      description: string;
      configSchema: Record<string, any>;
    }>>('/rbac/sync-configs/types')
  }
}