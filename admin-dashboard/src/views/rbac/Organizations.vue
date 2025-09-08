<template>
  <div class="organizations-page">
    <UnifiedPageHeader 
      title="组织架构管理" 
      description="管理企业组织架构，支持树形结构展示和拖拽调整"
    >
      <template #actions>
        <el-button 
          type="primary" 
          :icon="Plus" 
          @click="handleCreate"
          v-if="hasPermission('rbac:org:create')"
        >
          新建组织
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
          <span>组织架构树</span>
        </div>
      </template>

      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="groupTree"
          :props="treeProps"
          :expand-on-click-node="false"
          :default-expand-all="true"
          node-key="id"
          draggable
          @node-drop="handleNodeDrop"
          :allow-drop="allowDrop"
          :allow-drag="allowDrag"
          v-loading="loading"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <div class="node-content">
                <el-icon class="node-icon">
                  <OfficeBuilding />
                </el-icon>
                <span class="node-label">{{ data.name }}</span>
                <el-tag 
                  v-if="data.userCount !== undefined" 
                  size="small" 
                  type="info"
                  class="user-count"
                >
                  {{ data.userCount }}人
                </el-tag>
              </div>
              <div class="node-actions">
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click.stop="handleCreate(data)"
                  v-if="hasPermission('rbac:org:create')"
                >
                  新建子组织
                </el-button>
                <el-button 
                  link 
                  type="primary" 
                  size="small"
                  @click.stop="handleEdit(data)"
                  v-if="hasPermission('rbac:org:update')"
                >
                  编辑
                </el-button>
                <el-button 
                  link 
                  type="danger" 
                  size="small"
                  @click.stop="handleDelete(data)"
                  v-if="hasPermission('rbac:org:delete') && data.userCount === 0"
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
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="上级组织" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="groupTree"
            :props="treeSelectProps"
            placeholder="选择上级组织（留空为根组织）"
            clearable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>
        <el-form-item label="组织名称" prop="name">
          <el-input 
            v-model="form.name" 
            placeholder="请输入组织名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number 
            v-model="form.sort" 
            :min="0"
            :max="9999"
            placeholder="数字越小越靠前"
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
import { Plus, Refresh, OfficeBuilding } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useRbacStore } from '@/stores/rbac'
import { useAuthStore } from '@/stores/auth'
import type { UserGroup, GroupForm } from '@/types'
import type { Node } from 'element-plus/es/components/tree/src/tree.type'

// Store
const rbacStore = useRbacStore()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const treeRef = ref()
const formRef = ref<FormInstance>()

// 表单数据
const form = reactive<GroupForm>({
  name: '',
  parentId: undefined,
  sort: 0
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入组织名称', trigger: 'blur' },
    { min: 2, max: 50, message: '组织名称长度在2-50个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值范围0-9999', trigger: 'blur' }
  ]
}

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name'
}

const treeSelectProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 计算属性
const groupTree = computed(() => rbacStore.groupTree)
const dialogTitle = computed(() => 
  form.id ? '编辑组织' : '新建组织'
)

// 权限检查
const hasPermission = (permission: string) => {
  return authStore.checkPermission(permission)
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await rbacStore.fetchGroups()
  } catch (error) {
    ElMessage.error('加载组织架构失败')
  } finally {
    loading.value = false
  }
}

// 创建组织
const handleCreate = (parentGroup?: UserGroup) => {
  resetForm()
  if (parentGroup) {
    form.parentId = parentGroup.id
  }
  dialogVisible.value = true
}

// 编辑组织
const handleEdit = (group: UserGroup) => {
  resetForm()
  form.id = group.id
  form.name = group.name
  form.parentId = group.parentId
  form.sort = group.sort
  dialogVisible.value = true
}

// 删除组织
const handleDelete = async (group: UserGroup) => {
  try {
    await ElMessageBox.confirm(
      `确定删除组织"${group.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 检查是否有子组织或用户
    if (group.children && group.children.length > 0) {
      ElMessage.error('请先删除子组织')
      return
    }
    
    if (group.userCount && group.userCount > 0) {
      ElMessage.error('请先移走该组织下的用户')
      return
    }

    // 调用删除API
    await rbacStore.deleteGroup(group.id)
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
      await rbacStore.updateGroup(form.id, form)
      ElMessage.success('更新成功')
    } else {
      // 创建
      await rbacStore.createGroup(form)
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
  form.parentId = undefined
  form.sort = 0
}

// 拖拽相关
const allowDrop = (draggingNode: Node, dropNode: Node, type: string) => {
  // 只允许放入和前后排序
  return type !== 'inner' || hasPermission('rbac:org:update')
}

const allowDrag = (draggingNode: Node) => {
  // 检查是否有更新权限
  return hasPermission('rbac:org:update')
}

const handleNodeDrop = async (
  draggingNode: Node,
  dropNode: Node,
  dropType: string,
  event: DragEvent
) => {
  try {
    const draggingData = draggingNode.data as UserGroup
    const dropData = dropNode.data as UserGroup
    
    let newParentId: number | undefined
    
    if (dropType === 'inner') {
      // 移入作为子节点
      newParentId = dropData.id
    } else {
      // 移动到同级
      newParentId = dropData.parentId
    }
    
    // 调用移动API
    await rbacStore.moveGroup(draggingData.id, newParentId || 0)
    
    ElMessage.success('移动成功')
    await refreshData()
  } catch (error) {
    ElMessage.error('移动失败')
    // 恢复原状态
    await refreshData()
  }
}

// 生命周期
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.organizations-page {
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

.user-count {
  margin-left: 8px;
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