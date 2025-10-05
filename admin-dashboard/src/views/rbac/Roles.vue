<template>
  <div class="roles-page">
    <UnifiedPageHeader 
      title="角色管理" 
      description="管理系统角色，为角色分配权限，支持数据权限范围设置"
    >
      <template #actions>
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleCreate"
          v-if="hasPermission('rbac:role:create')"
        >
          新建角色
        </el-button>
        <el-button :icon="Refresh" @click="refreshData" :loading="loading">刷新</el-button>
      </template>
    </UnifiedPageHeader>

    <el-card class="main-card">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="角色名称/编码"
              clearable
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

      <!-- 角色表格 -->
      <el-table
        :data="roleList"
        v-loading="loading"
        stripe
        border
      >
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" min-width="150" />
        <el-table-column prop="description" label="角色描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="dataScope" label="数据权限" width="120">
          <template #default="{ row }">
            <el-tag :type="getDataScopeType(row.dataScope)" size="small">
              {{ getDataScopeText(row.dataScope) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限数量" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.permissions?.length || 0 }}</el-tag>
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
              v-if="hasPermission('rbac:role:update')"
            >
              编辑
            </el-button>
            <el-button
              link
              type="warning"
              size="small"
              @click="handleAssignPermissions(row)"
              v-if="hasPermission('rbac:role:update')"
            >
              分配权限
            </el-button>
            <el-button
              link
              type="success"
              size="small"
              @click="handleCopy(row)"
              v-if="hasPermission('rbac:role:create')"
            >
              复制
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
              v-if="hasPermission('rbac:role:delete')"
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

    <!-- 创建/编辑角色对话框 -->
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
        label-width="100px"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="角色名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入角色名称"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色编码" prop="code">
              <el-input 
                v-model="form.code" 
                placeholder="请输入角色编码"
                :disabled="!!form.id"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="角色描述">
          <el-input 
            v-model="form.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="数据权限" prop="dataScope">
              <el-select v-model="form.dataScope" placeholder="选择数据权限范围">
                <el-option label="全部数据" :value="1" />
                <el-option label="本部门数据" :value="2" />
                <el-option label="本部门及子部门数据" :value="3" />
                <el-option label="本人数据" :value="4" />
              </el-select>
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

    <!-- 分配权限对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="分配权限"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="permission-assign">
        <div class="role-info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="角色名称">{{ currentRole?.name }}</el-descriptions-item>
            <el-descriptions-item label="角色编码">{{ currentRole?.code }}</el-descriptions-item>
            <el-descriptions-item label="数据权限">
              {{ getDataScopeText(currentRole?.dataScope) }}
            </el-descriptions-item>
            <el-descriptions-item label="角色描述">{{ currentRole?.description || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <el-divider content-position="left">权限分配</el-divider>

        <el-tree
          ref="permissionTreeRef"
          :data="permissionTree"
          :props="permissionTreeProps"
          show-checkbox
          node-key="id"
          :default-checked-keys="checkedPermissions"
          @check="handlePermissionCheck"
          class="permission-tree"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon v-if="data.type === 1" class="node-icon">
                <Menu />
              </el-icon>
              <el-icon v-else-if="data.type === 2" class="node-icon">
                <Operation />
              </el-icon>
              <el-icon v-else class="node-icon">
                <Link />
              </el-icon>
              <span class="node-label">{{ data.name }}</span>
              <el-tag size="small" class="node-tag">{{ data.permKey }}</el-tag>
            </div>
          </template>
        </el-tree>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleSavePermissions"
            :loading="permissionSubmitLoading"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 复制角色对话框 -->
    <el-dialog
      v-model="copyDialogVisible"
      title="复制角色"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="copyFormRef"
        :model="copyForm"
        :rules="copyFormRules"
        label-width="100px"
      >
        <el-form-item label="源角色">
          <el-input :value="currentRole?.name" disabled />
        </el-form-item>
        <el-form-item label="新角色名称" prop="name">
          <el-input 
            v-model="copyForm.name" 
            placeholder="请输入新角色名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="新角色编码" prop="code">
          <el-input 
            v-model="copyForm.code" 
            placeholder="请输入新角色编码"
            maxlength="50"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="copyDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleCopySubmit"
            :loading="copySubmitLoading"
          >
            确定复制
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, Menu, Operation, Link } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRbacStore } from '@/stores/rbac'
import { useAuthStore } from '@/stores/auth'
import type { Role, RoleForm, RoleQueryParams, Permission, DataScopeType } from '@/types'

// Store
const rbacStore = useRbacStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const permissionDialogVisible = ref(false)
const permissionSubmitLoading = ref(false)
const copyDialogVisible = ref(false)
const copySubmitLoading = ref(false)
const formRef = ref<FormInstance>()
const copyFormRef = ref<FormInstance>()
const permissionTreeRef = ref()
const currentRole = ref<Role>()
const checkedPermissions = ref<number[]>([])

// 搜索表单
const searchForm = reactive<RoleQueryParams>({
  keyword: '',
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

// 角色表单
const form = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
  dataScope: 4,
  status: 1,
  permissionIds: []
})

// 复制表单
const copyForm = reactive({
  name: '',
  code: ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在2-50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度在2-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  dataScope: [
    { required: true, message: '请选择数据权限范围', trigger: 'change' }
  ]
}

const copyFormRules: FormRules = {
  name: [
    { required: true, message: '请输入新角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在2-50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入新角色编码', trigger: 'blur' },
    { min: 2, max: 50, message: '角色编码长度在2-50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '角色编码只能包含字母、数字和下划线', trigger: 'blur' }
  ]
}

// 权限树配置
const permissionTreeProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const roleList = computed(() => rbacStore.roles)
const permissionTree = computed(() => rbacStore.permissionTree)
const dialogTitle = computed(() => form.id ? '编辑角色' : '新建角色')

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.checkPermission(permission)
}

// 数据权限类型映射
const getDataScopeText = (scope?: DataScopeType) => {
  const map = {
    1: '全部数据',
    2: '本部门数据',
    3: '本部门及子部门数据',
    4: '本人数据'
  }
  return scope ? map[scope] : '未设置'
}

const getDataScopeType = (scope?: DataScopeType) => {
  const map = {
    1: 'danger',
    2: 'warning',
    3: 'primary',
    4: 'success'
  }
  return scope ? map[scope] : 'info'
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
    await rbacStore.fetchRoles(params)
    pagination.total = rbacStore.roleTotal
  } catch (error) {
    ElMessage.error('加载角色列表失败')
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
  searchForm.status = undefined
  handleSearch()
}

// 创建角色
const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (role: Role) => {
  resetForm()
  form.id = role.id
  form.name = role.name
  form.code = role.code
  form.description = role.description
  form.dataScope = role.dataScope
  form.status = role.status
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (role: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定删除角色"${role.name}"吗？`,
      '删除确认',
      { type: 'warning' }
    )
    
    await rbacStore.deleteRole(role.id)
    ElMessage.success('删除成功')
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 分配权限
const handleAssignPermissions = async (role: Role) => {
  currentRole.value = role
  
  // 获取角色权限
  try {
    const permissions = await rbacStore.getRolePermissions(role.id)
    checkedPermissions.value = permissions.map(p => p.id)
  } catch (error) {
    checkedPermissions.value = []
  }
  
  permissionDialogVisible.value = true
}

// 权限选择变更
const handlePermissionCheck = (data: Permission, checkState: any) => {
  // 这里可以添加权限选择的逻辑
}

// 保存权限分配
const handleSavePermissions = async () => {
  if (!currentRole.value) return
  
  try {
    permissionSubmitLoading.value = true
    
    // 获取选中的权限ID
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys]
    
    await rbacStore.assignRolePermissions(currentRole.value.id, allCheckedKeys)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
    await refreshData()
  } catch (error) {
    ElMessage.error('权限分配失败')
  } finally {
    permissionSubmitLoading.value = false
  }
}

// 复制角色
const handleCopy = (role: Role) => {
  currentRole.value = role
  copyForm.name = `${role.name}_副本`
  copyForm.code = `${role.code}_copy`
  copyDialogVisible.value = true
}

// 复制提交
const handleCopySubmit = async () => {
  if (!copyFormRef.value || !currentRole.value) return
  
  try {
    await copyFormRef.value.validate()
    
    copySubmitLoading.value = true
    
    await rbacStore.copyRole(currentRole.value.id, copyForm.name, copyForm.code)
    ElMessage.success('复制成功')
    copyDialogVisible.value = false
    await refreshData()
  } catch (error) {
    if (typeof error === 'string') {
      ElMessage.error(error)
    }
  } finally {
    copySubmitLoading.value = false
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (form.id) {
      await rbacStore.updateRole(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await rbacStore.createRole(form)
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
  form.name = ''
  form.code = ''
  form.description = ''
  form.dataScope = 4
  form.status = 1
  form.permissionIds = []
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    rbacStore.fetchPermissions(),
    refreshData()
  ])
})
</script>

<style scoped>
.roles-page {
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 优化新建角色弹窗表单间距 */
.el-dialog .el-form .el-row {
  margin-bottom: 16px !important;
}

.el-dialog .el-form .el-form-item {
  margin-bottom: 16px !important;
}

.el-dialog .el-form .el-form-item:last-child {
  margin-bottom: 0 !important;
}

.el-dialog .el-form .el-form-item__content {
  margin-top: 4px !important;
}

/* 优化新建角色弹窗文本框样式 */
.el-dialog .el-form .el-form-item .el-input__wrapper,
.el-dialog .el-form .el-form-item .el-select__wrapper {
  border-width: 1px !important;
  border-color: #d1d5db !important;
  border-style: solid !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.el-dialog .el-form .el-form-item .el-input__wrapper:hover,
.el-dialog .el-form .el-form-item .el-select__wrapper:hover {
  border-color: #3b82f6 !important;
}

.el-dialog .el-form .el-form-item .el-input__wrapper.is-focus,
.el-dialog .el-form .el-form-item .el-select__wrapper.is-focused {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1) !important;
  outline: none !important;
}

.permission-assign {
  max-height: 600px;
  overflow-y: auto;
}

.role-info {
  margin-bottom: 20px;
}

.permission-tree {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-icon {
  color: #409EFF;
}

.node-label {
  flex: 1;
  font-weight: 500;
}

.node-tag {
  opacity: 0.7;
}

:deep(.el-tree-node__content) {
  height: 36px;
  line-height: 36px;
}
</style>