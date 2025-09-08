<template>
  <div class="users-page">
    <UnifiedPageHeader 
      title="用户管理" 
      description="管理系统用户，支持创建、编辑、禁用用户和重置密码"
    />

    <el-card class="main-card">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="用户名/姓名/邮箱"
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
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
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
            @click="handleCreate"
            v-if="hasPermission('rbac:user:create')"
          >
            新建用户
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            @click="handleBatchDelete"
            :disabled="selectedUsers.length === 0"
            v-if="hasPermission('rbac:user:delete')"
          >
            批量删除
          </el-button>
        </div>
        <div class="right-actions">
          <el-button :icon="Download" @click="handleExport">导出</el-button>
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
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column prop="group.name" label="部门" min-width="120" />
        <el-table-column label="角色" min-width="200">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role.id"
              size="small"
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleEdit(row)"
              v-if="hasPermission('rbac:user:update')"
            >
              编辑
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleResetPassword(row)"
              v-if="hasPermission('rbac:user:update')"
            >
              重置密码
            </el-button>
            <el-button
              link
              :type="row.status === 1 ? 'danger' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
              v-if="hasPermission('rbac:user:update')"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-if="hasPermission('rbac:user:delete')"
            >
              删除
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

    <!-- 创建/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="form.username" 
                placeholder="请输入用户名"
                :disabled="!!form.id"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入真实姓名"
                maxlength="20"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input 
                v-model="form.email" 
                placeholder="请输入邮箱"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input 
                v-model="form.phone" 
                placeholder="请输入手机号"
                maxlength="11"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="部门" prop="groupId">
              <el-tree-select
                v-model="form.groupId"
                :data="groupTree"
                :props="{ children: 'children', label: 'name', value: 'id' }"
                placeholder="选择部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :label="1">启用</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="分配角色">
          <el-select
            v-model="form.roleIds"
            multiple
            placeholder="选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roleList"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="!form.id" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入初始密码（留空系统自动生成）"
            show-password
            maxlength="20"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="submitLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRbacStore } from '@/stores/rbac'
import { useAuthStore } from '@/stores/auth'
import type { User, UserForm, UserQueryParams } from '@/types'

// Store
const rbacStore = useRbacStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const tableRef = ref()
const formRef = ref<FormInstance>()
const selectedUsers = ref<User[]>([])

// 搜索表单
const searchForm = reactive<UserQueryParams>({
  keyword: '',
  groupId: undefined,
  status: undefined,
  page: 1,
  pageSize: 20
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 用户表单
const form = reactive<UserForm>({
  username: '',
  name: '',
  email: '',
  phone: '',
  groupId: 0,
  status: 1,
  roleIds: [],
  password: ''
})

// 表单验证规则
const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  groupId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' }
  ]
}

// 计算属性
const userList = computed(() => rbacStore.users)
const roleList = computed(() => rbacStore.roles)
const groupTree = computed(() => rbacStore.groupTree)
const dialogTitle = computed(() => form.id ? '编辑用户' : '新建用户')

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.checkPermission(permission)
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
  searchForm.status = undefined
  handleSearch()
}

// 创建用户
const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (user: User) => {
  resetForm()
  form.id = user.id
  form.username = user.username
  form.name = user.name
  form.email = user.email || ''
  form.phone = user.phone || ''
  form.groupId = user.groupId
  form.status = user.status
  form.roleIds = user.roles.map(role => role.id)
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定删除用户"${user.name}"吗？`,
      '删除确认',
      { type: 'warning' }
    )
    
    await rbacStore.deleteUser(user.id)
    ElMessage.success('删除成功')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定删除选中的${selectedUsers.value.length}个用户吗？`,
      '批量删除确认',
      { type: 'warning' }
    )
    
    const userIds = selectedUsers.value.map(user => user.id)
    await rbacStore.batchDeleteUsers(userIds)
    ElMessage.success('批量删除成功')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 重置密码
const handleResetPassword = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定重置用户"${user.name}"的密码吗？重置后的临时密码将通过邮件发送。`,
      '重置密码确认',
      { type: 'warning' }
    )
    
    const result = await rbacStore.resetUserPassword(user.id)
    ElMessage.success(`密码重置成功，新密码：${result.password}`)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
    }
  }
}

// 切换状态
const handleToggleStatus = async (user: User) => {
  try {
    const newStatus = user.status === 1 ? 0 : 1
    const action = newStatus === 1 ? '启用' : '禁用'
    
    await ElMessageBox.confirm(
      `确定${action}用户"${user.name}"吗？`,
      `${action}确认`,
      { type: 'warning' }
    )
    
    await rbacStore.updateUser(user.id, { status: newStatus })
    ElMessage.success(`${action}成功`)
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 选择变更
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (form.id) {
      await rbacStore.updateUser(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await rbacStore.createUser(form)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    await refreshData()
  } catch (error) {
    if (typeof error === 'string') {
      ElMessage.error(error)
    }
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.id = undefined
  form.username = ''
  form.name = ''
  form.email = ''
  form.phone = ''
  form.groupId = 0
  form.status = 1
  form.roleIds = []
  form.password = ''
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
.users-page {
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

.role-tag {
  margin-right: 4px;
  margin-bottom: 4px;
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
</style>