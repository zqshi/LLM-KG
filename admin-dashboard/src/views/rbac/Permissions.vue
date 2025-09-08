<template>
  <div class="permissions-page">
    <UnifiedPageHeader 
      title="权限点管理" 
      description="管理系统权限点，支持树形结构展示和层级管理"
    >
      <template #actions>
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleCreate"
          v-if="hasPermission('rbac:permission:create')"
        >
          新建权限
        </el-button>
        <el-button 
          :icon="Refresh" 
          @click="refreshData"
          :loading="loading"
        >
          刷新
        </el-button>
      </template>
    </UnifiedPageHeader>

    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>权限点列表</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="权限名称">
            <el-input
              v-model="searchForm.keyword"
              placeholder="权限名称/标识符"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="权限类型">
            <el-select v-model="searchForm.type" placeholder="选择类型" clearable style="width: 120px">
              <el-option label="菜单权限" :value="1" />
              <el-option label="按钮权限" :value="2" />
              <el-option label="API权限" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item label="所属模块">
            <el-input
              v-model="searchForm.module"
              placeholder="模块名称"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">搜索</el-button>
            <el-button @click="handleReset" :icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 权限树 -->
      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="permissionTree"
          :props="treeProps"
          :expand-on-click-node="false"
          :default-expand-all="true"
          node-key="id"
          v-loading="loading"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <div class="node-content">
                <el-icon class="node-icon">
                  <Menu v-if="data.type === 1" />
                  <Operation v-else-if="data.type === 2" />
                  <Link v-else />
                </el-icon>
                <span class="node-label">{{ data.name }}</span>
                <el-tag 
                  size="small" 
                  :type="getPermissionTypeColor(data.type)"
                  class="type-tag"
                >
                  {{ getPermissionTypeText(data.type) }}
                </el-tag>
                <el-tag 
                  size="small" 
                  type="info"
                  class="key-tag"
                >
                  {{ data.permKey }}
                </el-tag>
              </div>
              <div class="node-actions">
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click.stop="handleCreate(data)"
                  v-if="hasPermission('rbac:permission:create')"
                >
                  新建子权限
                </el-button>
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click.stop="handleEdit(data)"
                  v-if="hasPermission('rbac:permission:update')"
                >
                  编辑
                </el-button>
                <el-button 
                  link 
                  type="danger" 
                  size="small"
                  @click.stop="handleDelete(data)"
                  v-if="hasPermission('rbac:permission:delete') && (!data.children || data.children.length === 0)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 创建/编辑对话框 -->
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
            <el-form-item label="权限名称" prop="name">
              <el-input 
                v-model="form.name" 
                placeholder="请输入权限名称"
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限标识符" prop="permKey">
              <el-input 
                v-model="form.permKey" 
                placeholder="如: rbac:user:view"
                maxlength="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="权限类型" prop="type">
              <el-select v-model="form.type" placeholder="选择权限类型">
                <el-option label="菜单权限" :value="1" />
                <el-option label="按钮权限" :value="2" />
                <el-option label="API权限" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属模块">
              <el-input 
                v-model="form.module" 
                placeholder="如: RBAC"
                maxlength="50"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="上级权限">
              <el-tree-select
                v-model="form.parentId"
                :data="permissionTree"
                :props="{ children: 'children', label: 'name', value: 'id' }"
                placeholder="选择上级权限（留空为根权限）"
                clearable
                check-strictly
                :render-after-expand="false"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number 
                v-model="form.sort" 
                :min="0"
                :max="9999"
                placeholder="数字越小越靠前"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="路径">
              <el-input 
                v-model="form.path" 
                placeholder="菜单路径或API路径"
                maxlength="200"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图标">
              <el-input 
                v-model="form.icon" 
                placeholder="图标名称"
                maxlength="50"
              />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus, Refresh, Search, Menu, Operation, Link } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRbacStore } from '@/stores/rbac'
import { useAuthStore } from '@/stores/auth'
import type { Permission, PermissionType } from '@/types'

// Store
const rbacStore = useRbacStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const treeRef = ref()
const formRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: undefined as PermissionType | undefined,
  module: ''
})

// 权限表单
const form = reactive({
  id: undefined as number | undefined,
  name: '',
  permKey: '',
  type: 1 as PermissionType,
  module: '',
  parentId: undefined as number | undefined,
  path: '',
  icon: '',
  sort: 0
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在2-50个字符', trigger: 'blur' }
  ],
  permKey: [
    { required: true, message: '请输入权限标识符', trigger: 'blur' },
    { min: 2, max: 100, message: '权限标识符长度在2-100个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_:.-]+$/, message: '权限标识符只能包含字母、数字、下划线、冒号、点号、横线', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ]
}

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

// 计算属性
const permissionTree = computed(() => rbacStore.permissionTree)
const dialogTitle = computed(() => form.id ? '编辑权限' : '新建权限')

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.checkPermission(permission)
}

// 权限类型映射
const getPermissionTypeText = (type?: PermissionType) => {
  const map = {
    1: '菜单',
    2: '按钮',
    3: 'API'
  }
  return type ? map[type] : '未知'
}

const getPermissionTypeColor = (type?: PermissionType) => {
  const map = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return type ? map[type] : 'info'
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await rbacStore.fetchPermissions()
  } catch (error) {
    ElMessage.error('加载权限列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 这里可以实现搜索逻辑，暂时只刷新数据
  refreshData()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = undefined
  searchForm.module = ''
  handleSearch()
}

// 创建权限
const handleCreate = (parentPermission?: Permission) => {
  resetForm()
  if (parentPermission) {
    form.parentId = parentPermission.id
    form.module = parentPermission.module
  }
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = (permission: Permission) => {
  resetForm()
  form.id = permission.id
  form.name = permission.name
  form.permKey = permission.permKey
  form.type = permission.type
  form.module = permission.module || ''
  form.parentId = permission.parentId
  form.path = permission.path || ''
  form.icon = permission.icon || ''
  form.sort = permission.sort || 0
  dialogVisible.value = true
}

// 删除权限
const handleDelete = async (permission: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定删除权限"${permission.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 检查是否有子权限
    if (permission.children && permission.children.length > 0) {
      ElMessage.error('请先删除子权限')
      return
    }

    // 调用删除API
    await rbacStore.deletePermission(permission.id)
    ElMessage.success('删除成功')
    
    // 刷新数据
    await refreshData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 表单提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (form.id) {
      // 更新
      await rbacStore.updatePermission(form.id, form)
      ElMessage.success('更新成功')
    } else {
      // 创建
      await rbacStore.createPermission(form)
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
  form.permKey = ''
  form.type = 1
  form.module = ''
  form.parentId = undefined
  form.path = ''
  form.icon = ''
  form.sort = 0
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.permissions-page {
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-bar {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.tree-container {
  min-height: 500px;
}

.tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 14px;
}

.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.node-icon {
  color: #409EFF;
}

.node-label {
  font-weight: 500;
}

.type-tag, .key-tag {
  margin-left: 8px;
}

.key-tag {
  font-family: monospace;
}

.node-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.tree-node:hover .node-actions {
  opacity: 1;
}

:deep(.el-tree-node__content) {
  height: 40px;
  line-height: 40px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>