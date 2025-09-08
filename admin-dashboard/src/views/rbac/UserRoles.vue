<template>
  <div class="user-roles-page">
    <UnifiedPageHeader 
      title="用户授权" 
      description="为用户分配角色，管理用户权限"
    />

    <el-card class="main-card">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户搜索">
            <el-input
              v-model="searchForm.keyword"
              placeholder="用户名/姓名"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="部门">
            <el-tree-select
              v-model="searchForm.groupId"
              :data="groupTree"
              :props="{ children: 'children', label: 'name', value: 'id' }"
              placeholder="选择部门"
              clearable
              check-strictly
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="searchForm.roleId" placeholder="选择角色" clearable style="width: 150px">
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="left-actions">
          <el-button
            type="primary"
            :icon="Plus"
            @click="handleBatchAssign"
            :disabled="selectedUsers.length === 0"
            v-if="hasPermission('rbac:user:assign')"
          >
            批量授权
          </el-button>
        </div>
        <div class="right-actions">
          <el-button :icon="Refresh" @click="refreshData" :loading="loading">刷新</el-button>
        </div>
      </div>

      <!-- 用户表格 -->
      <el-table
        ref="tableRef"
        :data="userList"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="group.name" label="部门" min-width="120" />
        <el-table-column label="当前角色" min-width="300">
          <template #default="{ row }">
            <div class="roles-container">
              <el-tag
                v-for="role in row.roles"
                :key="role.id"
                size="small"
                class="role-tag"
                closable
                @close="handleRemoveRole(row, role)"
                v-if="hasPermission('rbac:user:assign')"
              >
                {{ role.name }}
              </el-tag>
              <el-tag
                v-for="role in row.roles"
                :key="role.id"
                size="small"
                class="role-tag"
                v-else
              >
                {{ role.name }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleAssign(row)"
              v-if="hasPermission('rbac:user:assign')"
            >
              分配角色
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleViewPermissions(row)"
            >
              查看权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 分配角色对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配角色"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="assign-content">
        <div class="user-info" v-if="currentUser">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ currentUser.name }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ currentUser.email || '-' }}</el-descriptions-item>
            <el-descriptions-item label="部门">{{ currentUser.group?.name || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider content-position="left">角色分配</el-divider>

        <el-transfer
          v-model="selectedRoleIds"
          :data="transferData"
          :titles="['可分配角色', '已分配角色']"
          :props="{ key: 'id', label: 'name' }"
          filterable
          :filter-placeholder="'搜索角色'"
        >
          <template #default="{ option }">
            <div class="transfer-item">
              <span class="role-name">{{ option.name }}</span>
              <el-tag size="small" type="info" class="role-tag">{{ option.code }}</el-tag>
            </div>
          </template>
        </el-transfer>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSaveAssignment"
            :loading="assignLoading"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量分配角色对话框 -->
    <el-dialog
      v-model="batchAssignDialogVisible"
      title="批量分配角色"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="batch-assign-content">
        <el-alert
          title="批量授权说明"
          type="info"
          :closable="false"
          show-icon
          class="alert"
        >
          <template #default>
            将为选中的 {{ selectedUsers.length }} 个用户批量分配角色。
            注意：此操作会覆盖用户现有的角色分配。
          </template>
        </el-alert>

        <el-divider content-position="left">选择角色</el-divider>

        <el-checkbox-group v-model="batchSelectedRoles">
          <div class="role-grid">
            <el-checkbox
              v-for="role in roleList"
              :key="role.id"
              :label="role.id"
              class="role-checkbox"
            >
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-desc">{{ role.description || role.code }}</div>
              </div>
            </el-checkbox>
          </div>
        </el-checkbox-group>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="batchAssignDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSaveBatchAssignment"
            :loading="batchAssignLoading"
            :disabled="batchSelectedRoles.length === 0"
          >
            确定分配
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="用户权限详情"
      width="800px"
    >
      <div class="permission-content" v-if="currentUser">
        <div class="user-summary">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="用户">{{ currentUser.name }}</el-descriptions-item>
            <el-descriptions-item label="角色数量">{{ currentUser.roles.length }}</el-descriptions-item>
            <el-descriptions-item label="权限数量">{{ currentUserPermissions.length }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-tabs type="border-card" class="permission-tabs">
          <el-tab-pane label="角色列表">
            <el-table :data="currentUser.roles" border>
              <el-table-column prop="name" label="角色名称" />
              <el-table-column prop="code" label="角色编码" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="dataScope" label="数据权限">
                <template #default="{ row }">
                  <el-tag size="small">{{ getDataScopeText(row.dataScope) }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="权限清单">
            <el-table :data="currentUserPermissions" border max-height="400">
              <el-table-column prop="name" label="权限名称" />
              <el-table-column prop="permKey" label="权限标识" />
              <el-table-column prop="type" label="类型" width="80">
                <template #default="{ row }">
                  <el-tag size="small" :type="getPermissionTypeColor(row.type)">
                    {{ getPermissionTypeText(row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="module" label="所属模块" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRbacStore } from '@/stores/rbac'
import { useAuthStore } from '@/stores/auth'
import type { User, Role, Permission, UserGroup, DataScopeType, PermissionType } from '@/types'

// Store
const rbacStore = useRbacStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const assignDialogVisible = ref(false)
const batchAssignDialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const assignLoading = ref(false)
const batchAssignLoading = ref(false)
const tableRef = ref()
const selectedUsers = ref<User[]>([])
const currentUser = ref<User>()
const selectedRoleIds = ref<number[]>([])
const batchSelectedRoles = ref<number[]>([])
const currentUserPermissions = ref<Permission[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  groupId: undefined as number | undefined,
  roleId: undefined as number | undefined,
  page: 1,
  pageSize: 20
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 计算属性
const userList = computed(() => rbacStore.users)
const roleList = computed(() => rbacStore.roles)
const groupTree = computed(() => rbacStore.groupTree)

// Transfer 数据
const transferData = computed(() => {
  return roleList.value.map(role => ({
    id: role.id,
    name: role.name,
    code: role.code,
    disabled: false
  }))
})

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.checkPermission(permission)
}

// 数据权限和权限类型映射函数
const getDataScopeText = (scope?: DataScopeType) => {
  const map = { 1: '全部数据', 2: '本部门数据', 3: '本部门及子部门数据', 4: '本人数据' }
  return scope ? map[scope] : '未设置'
}

const getPermissionTypeText = (type?: PermissionType) => {
  const map = { 1: '菜单', 2: '按钮', 3: 'API' }
  return type ? map[type] : '未知'
}

const getPermissionTypeColor = (type?: PermissionType) => {
  const map = { 1: 'primary', 2: 'success', 3: 'warning' }
  return type ? map[type] : 'info'
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    await rbacStore.fetchUsers(params)
    pagination.total = rbacStore.userTotal
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  refreshData()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.groupId = undefined
  searchForm.roleId = undefined
  handleSearch()
}

// 选择变更
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 分配角色
const handleAssign = (user: User) => {
  currentUser.value = user
  selectedRoleIds.value = user.roles.map(role => role.id)
  assignDialogVisible.value = true
}

// 批量分配
const handleBatchAssign = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  batchSelectedRoles.value = []
  batchAssignDialogVisible.value = true
}

// 移除角色
const handleRemoveRole = async (user: User, role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定移除用户"${user.name}"的角色"${role.name}"吗？`,
      '移除角色确认',
      { type: 'warning' }
    )
    
    const newRoleIds = user.roles
      .filter(r => r.id !== role.id)
      .map(r => r.id)
    
    await rbacStore.assignUserRoles(user.id, newRoleIds)
    ElMessage.success('移除成功')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

// 查看权限
const handleViewPermissions = async (user: User) => {
  currentUser.value = user
  
  // 收集用户所有权限
  const allPermissions: Permission[] = []
  user.roles.forEach(role => {
    if (role.permissions) {
      role.permissions.forEach(permission => {
        if (!allPermissions.find(p => p.id === permission.id)) {
          allPermissions.push(permission)
        }
      })
    }
  })
  
  currentUserPermissions.value = allPermissions
  permissionDialogVisible.value = true
}

// 保存分配
const handleSaveAssignment = async () => {
  if (!currentUser.value) return
  
  try {
    assignLoading.value = true
    
    await rbacStore.assignUserRoles(currentUser.value.id, selectedRoleIds.value)
    ElMessage.success('角色分配成功')
    assignDialogVisible.value = false
    await refreshData()
  } catch (error) {
    ElMessage.error('角色分配失败')
  } finally {
    assignLoading.value = false
  }
}

// 保存批量分配
const handleSaveBatchAssignment = async () => {
  if (batchSelectedRoles.value.length === 0) {
    ElMessage.warning('请选择要分配的角色')
    return
  }
  
  try {
    batchAssignLoading.value = true
    
    // 批量分配角色
    const promises = selectedUsers.value.map(user => 
      rbacStore.assignUserRoles(user.id, batchSelectedRoles.value)
    )
    
    await Promise.all(promises)
    
    ElMessage.success(`成功为 ${selectedUsers.value.length} 个用户分配角色`)
    batchAssignDialogVisible.value = false
    await refreshData()
  } catch (error) {
    ElMessage.error('批量分配失败')
  } finally {
    batchAssignLoading.value = false
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    rbacStore.fetchGroups(),
    rbacStore.fetchRoles(),
    refreshData()
  ])
})
</script>

<style scoped>
.user-roles-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.main-card {
  min-height: 600px;
}

.search-bar {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.left-actions, .right-actions {
  display: flex;
  gap: 8px;
}

.roles-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-tag {
  margin: 2px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.assign-content {
  max-height: 600px;
  overflow-y: auto;
}

.user-info {
  margin-bottom: 20px;
}

.transfer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.role-name {
  font-weight: 500;
}

.batch-assign-content {
  max-height: 500px;
  overflow-y: auto;
}

.alert {
  margin-bottom: 20px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.role-checkbox {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  transition: all 0.2s;
}

.role-checkbox:hover {
  border-color: #409EFF;
  background-color: #f0f9ff;
}

.role-info {
  margin-left: 8px;
}

.role-info .role-name {
  font-weight: 500;
  color: #303133;
}

.role-info .role-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.permission-content {
  max-height: 600px;
  overflow-y: auto;
}

.user-summary {
  margin-bottom: 20px;
}

.permission-tabs {
  margin-top: 20px;
}

:deep(.el-transfer) {
  .el-transfer-panel {
    width: 250px;
  }
}

:deep(.el-checkbox-group) {
  width: 100%;
}
</style>