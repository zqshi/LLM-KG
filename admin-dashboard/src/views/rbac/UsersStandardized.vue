<template>
  <div class="users-page page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">用户管理</h1>
        <p class="page-description">管理系统用户，支持创建、编辑、禁用用户和重置密码</p>
      </div>
      <div class="page-actions">
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleCreate"
          v-if="hasPermission('rbac:user:create')"
        >
          新建用户
        </el-button>
        <el-button
          :icon="Download"
          @click="handleExport"
          :loading="exportLoading"
        >
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统一表格组件 -->
    <Table
      ref="tableRef"
      :data="userList"
      :columns="tableColumns"
      :loading="loading"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="pagination.total"
      :actions="tableActions"
      :batch-actions="batchActions"
      title="用户列表"
      subtitle="系统中所有用户的详细信息"
      show-selection
      show-index
      @refresh="refreshData"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
      @batch-action="handleBatchAction"
      @export="handleExport"
    >
      <!-- 自定义筛选工具栏 -->
      <template #toolbar>
        <div class="filter-toolbar">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/姓名/邮箱"
            :prefix-icon="Search"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          
          <el-tree-select
            v-model="searchForm.groupId"
            :data="groupTree"
            :props="{ children: 'children', label: 'name', value: 'id' }"
            placeholder="选择部门"
            clearable
            check-strictly
            style="width: 200px"
            @change="handleSearch"
          />
          
          <el-select
            v-model="searchForm.status"
            placeholder="用户状态"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
          
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="RefreshLeft" @click="handleReset">
            重置
          </el-button>
        </div>
      </template>

      <!-- 自定义角色列 -->
      <template #roles="{ row }">
        <div class="roles-container">
          <el-tag
            v-for="role in row.roles?.slice(0, 2)"
            :key="role.id"
            size="small"
            class="role-tag"
          >
            {{ role.name }}
          </el-tag>
          <el-tooltip
            v-if="row.roles?.length > 2"
            :content="row.roles.slice(2).map(r => r.name).join(', ')"
            placement="top"
          >
            <el-tag size="small" type="info">
              +{{ row.roles.length - 2 }}
            </el-tag>
          </el-tooltip>
          <span v-if="!row.roles?.length" class="text-tertiary">暂无角色</span>
        </div>
      </template>

      <!-- 自定义状态列 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 自定义创建时间列 -->
      <template #createTime="{ row }">
        <span :title="row.createTime">
          {{ formatDate(row.createTime) }}
        </span>
      </template>
    </Table>

    <!-- 创建/编辑用户模态框 -->
    <Modal
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
      :confirm-loading="submitLoading"
      :confirm-disabled="!canSubmit"
      form-mode
      :form-config="formConfig"
      @confirm="handleSubmit"
      @cancel="handleCancel"
    >
      <Form
        ref="formRef"
        :model="form"
        :rules="formRules"
        layout="vertical"
        size="default"
        @validate="handleFormValidate"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <FormItem
              prop="username"
              label="用户名"
              :required="true"
              tooltip="用户登录时使用的唯一标识"
              help-text="3-20个字符，支持字母、数字、下划线"
            >
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                :disabled="!!form.id"
                maxlength="20"
                show-word-limit
              />
            </FormItem>
          </el-col>
          
          <el-col :span="12">
            <FormItem
              prop="name"
              label="真实姓名"
              :required="true"
            >
              <el-input
                v-model="form.name"
                placeholder="请输入真实姓名"
                maxlength="20"
                show-word-limit
              />
            </FormItem>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <FormItem
              prop="email"
              label="邮箱地址"
              :required="true"
              help-text="用于接收系统通知和密码重置"
            >
              <el-input
                v-model="form.email"
                placeholder="请输入邮箱地址"
                type="email"
              />
            </FormItem>
          </el-col>
          
          <el-col :span="12">
            <FormItem
              prop="phone"
              label="手机号码"
              help-text="用于双重验证和紧急联系"
            >
              <el-input
                v-model="form.phone"
                placeholder="请输入手机号码"
                maxlength="11"
              />
            </FormItem>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <FormItem
              prop="groupId"
              label="所属部门"
              :required="true"
            >
              <el-tree-select
                v-model="form.groupId"
                :data="groupTree"
                :props="{ children: 'children', label: 'name', value: 'id' }"
                placeholder="请选择部门"
                check-strictly
              />
            </FormItem>
          </el-col>
          
          <el-col :span="12">
            <FormItem
              prop="roleIds"
              label="用户角色"
              :required="true"
              help-text="可选择多个角色，权限会自动合并"
            >
              <el-select
                v-model="form.roleIds"
                placeholder="请选择角色"
                multiple
                collapse-tags
                collapse-tags-tooltip
              >
                <el-option
                  v-for="role in availableRoles"
                  :key="role.id"
                  :label="role.name"
                  :value="role.id"
                />
              </el-select>
            </FormItem>
          </el-col>
        </el-row>

        <FormItem
          v-if="!form.id"
          prop="password"
          label="初始密码"
          :required="!form.id"
          help-text="至少8个字符，包含字母和数字"
        >
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入初始密码"
            show-password
            maxlength="32"
          />
        </FormItem>

        <FormItem
          prop="status"
          label="账户状态"
        >
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </FormItem>

        <FormItem
          prop="remark"
          label="备注信息"
          help-text="可选的用户备注信息"
        >
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="200"
            show-word-limit
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 重置密码模态框 -->
    <Modal
      v-model="resetPasswordVisible"
      title="重置用户密码"
      type="warning"
      width="500px"
      :confirm-loading="resetLoading"
      @confirm="handleConfirmResetPassword"
    >
      <div class="reset-password-content">
        <el-alert
          title="密码重置确认"
          type="warning"
          :closable="false"
          show-icon
          class="mb-lg"
        >
          <template #default>
            <p>您即将重置用户 <strong>{{ currentUser?.name }}</strong> 的密码</p>
            <p>重置后的临时密码将发送到用户邮箱</p>
          </template>
        </el-alert>

        <Form :model="resetForm" :rules="resetFormRules" layout="vertical">
          <FormItem
            prop="newPassword"
            label="新密码"
            :required="true"
            help-text="至少8个字符，包含字母和数字"
          >
            <el-input
              v-model="resetForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
              maxlength="32"
            />
          </FormItem>
          
          <FormItem
            prop="confirmPassword"
            label="确认密码"
            :required="true"
          >
            <el-input
              v-model="resetForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
              maxlength="32"
            />
          </FormItem>
          
          <FormItem>
            <el-checkbox v-model="resetForm.sendEmail">
              发送邮件通知用户
            </el-checkbox>
          </FormItem>
        </Form>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  RefreshLeft,
  Download,
  Edit,
  Delete,
  Key,
  User
} from '@element-plus/icons-vue'

// 导入统一组件
import Table from '@/components/common/Table.vue'
import Modal from '@/components/common/Modal.vue'
import Form from '@/components/common/Form.vue'
import FormItem from '@/components/common/FormItem.vue'

// 导入API和工具函数
import { userAPI } from '@/api/rbac/users'
import { roleAPI } from '@/api/rbac/roles'
import { groupAPI } from '@/api/rbac/groups'
import { hasPermission } from '@/utils/permission'
import { formatDate } from '@/utils/date'

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const submitLoading = ref(false)
const resetLoading = ref(false)
const dialogVisible = ref(false)
const resetPasswordVisible = ref(false)
const canSubmit = ref(false)

const userList = ref<any[]>([])
const selectedUsers = ref<any[]>([])
const groupTree = ref<any[]>([])
const availableRoles = ref<any[]>([])
const currentUser = ref<any>(null)

const tableRef = ref()
const formRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  groupId: null,
  status: null
})

// 分页数据
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 用户表单
const form = reactive({
  id: null,
  username: '',
  name: '',
  email: '',
  phone: '',
  groupId: null,
  roleIds: [],
  password: '',
  status: 1,
  remark: ''
})

// 重置密码表单
const resetForm = reactive({
  newPassword: '',
  confirmPassword: '',
  sendEmail: true
})

// 表格列配置
const tableColumns = computed(() => [
  {
    prop: 'username',
    label: '用户名',
    minWidth: 120,
    sortable: true
  },
  {
    prop: 'name',
    label: '真实姓名',
    minWidth: 100,
    sortable: true
  },
  {
    prop: 'email',
    label: '邮箱地址',
    minWidth: 180,
    showTooltip: true
  },
  {
    prop: 'phone',
    label: '手机号码',
    minWidth: 130
  },
  {
    prop: 'group.name',
    label: '所属部门',
    minWidth: 120
  },
  {
    prop: 'roles',
    label: '用户角色',
    minWidth: 200,
    type: 'custom'
  },
  {
    prop: 'status',
    label: '状态',
    width: 80,
    type: 'custom',
    align: 'center'
  },
  {
    prop: 'createTime',
    label: '创建时间',
    width: 160,
    type: 'custom',
    sortable: true
  }
])

// 表格操作配置
const tableActions = computed(() => [
  {
    key: 'edit',
    label: '编辑',
    type: 'primary',
    icon: Edit,
    show: () => hasPermission('rbac:user:update')
  },
  {
    key: 'resetPassword',
    label: '重置密码',
    type: 'warning',
    icon: Key,
    show: () => hasPermission('rbac:user:update')
  },
  {
    key: 'toggleStatus',
    label: (row: any) => row.status === 1 ? '禁用' : '启用',
    type: (row: any) => row.status === 1 ? 'danger' : 'success',
    show: () => hasPermission('rbac:user:update')
  },
  {
    key: 'delete',
    label: '删除',
    type: 'danger',
    icon: Delete,
    show: () => hasPermission('rbac:user:delete')
  }
])

// 批量操作配置
const batchActions = computed(() => [
  {
    key: 'batchDelete',
    label: '批量删除',
    type: 'danger',
    icon: Delete
  },
  {
    key: 'batchEnable',
    label: '批量启用',
    type: 'success',
    icon: User
  },
  {
    key: 'batchDisable',
    label: '批量禁用',
    type: 'warning',
    icon: User
  }
])

// 对话框标题
const dialogTitle = computed(() => form.id ? '编辑用户' : '新建用户')

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字、下划线', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { max: 20, message: '姓名长度不能超过20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  groupId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  roleIds: [
    { required: true, message: '请选择用户角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8个字符', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ]
}

// 重置密码验证规则
const resetFormRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, message: '密码长度至少8个字符', trigger: 'blur' },
    { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== resetForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 表单配置
const formConfig = computed(() => ({
  model: form,
  rules: formRules,
  labelWidth: '100px'
}))

// 方法实现
const loadUserList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      groupId: searchForm.groupId,
      status: searchForm.status
    }
    
    const response = await userAPI.getUserList(params)
    userList.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载用户列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadGroupTree = async () => {
  try {
    const response = await groupAPI.getGroupTree()
    groupTree.value = response.data
  } catch (error) {
    console.error('加载部门树失败:', error)
  }
}

const loadRoles = async () => {
  try {
    const response = await roleAPI.getRoleList()
    availableRoles.value = response.data.list
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

const refreshData = () => {
  loadUserList()
}

const handleSearch = () => {
  pagination.page = 1
  loadUserList()
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    groupId: null,
    status: null
  })
  handleSearch()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  loadUserList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadUserList()
}

const handleSelectionChange = (selection: any[]) => {
  selectedUsers.value = selection
}

const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

const handleTableAction = (action: string, row: any) => {
  switch (action) {
    case 'edit':
      handleEdit(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'toggleStatus':
      handleToggleStatus(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleBatchAction = (action: string, rows: any[]) => {
  switch (action) {
    case 'batchDelete':
      handleBatchDelete(rows)
      break
    case 'batchEnable':
      handleBatchToggleStatus(rows, 1)
      break
    case 'batchDisable':
      handleBatchToggleStatus(rows, 0)
      break
  }
}

const handleEdit = (row: any) => {
  Object.assign(form, {
    ...row,
    roleIds: row.roles?.map((r: any) => r.id) || [],
    groupId: row.group?.id || null
  })
  dialogVisible.value = true
}

const handleResetPassword = (row: any) => {
  currentUser.value = row
  resetForm.newPassword = ''
  resetForm.confirmPassword = ''
  resetForm.sendEmail = true
  resetPasswordVisible.value = true
}

const handleToggleStatus = async (row: any) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}用户"${row.name}"吗？`, '确认操作')
    await userAPI.updateUserStatus(row.id, row.status === 1 ? 0 : 1)
    ElMessage.success(`${action}成功`)
    await loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
    }
  }
}

const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户"${row.name}"吗？此操作不可恢复！`, '确认删除', {
      type: 'warning'
    })
    await userAPI.deleteUser(row.id)
    ElMessage.success('删除成功')
    await loadUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleBatchDelete = async (rows: any[]) => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${rows.length} 个用户吗？此操作不可恢复！`, '批量删除', {
      type: 'warning'
    })
    const ids = rows.map(row => row.id)
    await userAPI.batchDeleteUsers(ids)
    ElMessage.success('批量删除成功')
    await loadUserList()
    selectedUsers.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleBatchToggleStatus = async (rows: any[], status: number) => {
  const action = status === 1 ? '启用' : '禁用'
  try {
    await ElMessageBox.confirm(`确定要${action}选中的 ${rows.length} 个用户吗？`, `批量${action}`)
    const ids = rows.map(row => row.id)
    await userAPI.batchUpdateUserStatus(ids, status)
    ElMessage.success(`批量${action}成功`)
    await loadUserList()
    selectedUsers.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`批量${action}失败`)
    }
  }
}

const handleExport = async () => {
  try {
    exportLoading.value = true
    await userAPI.exportUsers(searchForm)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    submitLoading.value = true
    const isValid = await formRef.value.validate()
    if (!isValid) return

    if (form.id) {
      await userAPI.updateUser(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await userAPI.createUser(form)
      ElMessage.success('创建成功')
    }

    dialogVisible.value = false
    await loadUserList()
  } catch (error) {
    ElMessage.error(form.id ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const handleFormValidate = (valid: boolean) => {
  canSubmit.value = valid
}

const handleConfirmResetPassword = async () => {
  try {
    resetLoading.value = true
    await userAPI.resetPassword(currentUser.value.id, resetForm)
    ElMessage.success('密码重置成功')
    resetPasswordVisible.value = false
  } catch (error) {
    ElMessage.error('密码重置失败')
  } finally {
    resetLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(form, {
    id: null,
    username: '',
    name: '',
    email: '',
    phone: '',
    groupId: null,
    roleIds: [],
    password: '',
    status: 1,
    remark: ''
  })
}

// 生命周期
onMounted(() => {
  loadUserList()
  loadGroupTree()
  loadRoles()
})
</script>

<style scoped lang="scss">
@use '../../styles/core/mixins' as *;

.users-page {
  .filter-toolbar {
    @include flex-center;
    gap: var(--spacing-md);
    flex-wrap: wrap;
    margin-bottom: var(--spacing-lg);
  }

  .roles-container {
    @include flex-center;
    gap: var(--spacing-xs);
    flex-wrap: wrap;

    .role-tag {
      margin: 0;
    }

    .text-tertiary {
      color: var(--color-text-tertiary);
      font-size: var(--text-sm);
    }
  }

  .reset-password-content {
    .el-alert {
      margin-bottom: var(--spacing-lg);
    }
  }
}

// 响应式适配
@include respond-below(md) {
  .users-page {
    .filter-toolbar {
      flex-direction: column;
      align-items: stretch;

      .el-input,
      .el-tree-select,
      .el-select {
        width: 100% !important;
      }
    }
  }
}
</style>