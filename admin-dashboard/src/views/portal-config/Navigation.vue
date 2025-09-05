<template>
  <div class="navigation-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-row :gutter="20" align="middle">
        <el-col :span="12">
          <h2 class="page-title">导航菜单管理</h2>
          <p class="page-description">管理前台门户的导航菜单结构，支持拖拽排序和权限控制</p>
        </el-col>
        <el-col :span="12" class="text-right">
          <el-space>
            <el-button type="success" @click="handlePreview" :icon="View" plain>
              预览效果
            </el-button>
            <el-button type="primary" @click="handleCreateNavigation" :icon="Plus">
              新增导航
            </el-button>
            <el-button type="warning" @click="handleCreateSnapshot" :icon="DocumentCopy" plain>
              创建快照
            </el-button>
          </el-space>
        </el-col>
      </el-row>
    </div>

    <!-- 操作栏 -->
    <div class="operation-bar">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索导航菜单..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterStatus"
            placeholder="状态筛选"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select
            v-model="filterType"
            placeholder="类型筛选"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="内部路由" value="route" />
            <el-option label="外部链接" value="url" />
            <el-option label="分组标题" value="group" />
          </el-select>
        </el-col>
        <el-col :span="4" class="text-right">
          <el-tooltip content="展开所有" placement="top">
            <el-button :icon="ArrowDown" circle @click="expandAll" />
          </el-tooltip>
          <el-tooltip content="折叠所有" placement="top">
            <el-button :icon="ArrowUp" circle @click="collapseAll" />
          </el-tooltip>
        </el-col>
      </el-row>
    </div>

    <!-- 导航树形表格 -->
    <div class="navigation-tree">
      <el-card v-loading="loading" :body-style="{ padding: 0 }">
        <el-table
          ref="navigationTableRef"
          :data="filteredNavigation"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="false"
          :expand-row-keys="expandedKeys"
          @expand-change="handleExpandChange"
          stripe
          border
        >
          <!-- 拖拽列 -->
          <el-table-column width="50" align="center">
            <template #default="{ row }">
              <el-icon v-if="!row.children?.length" class="drag-handle" size="16">
                <Rank />
              </el-icon>
            </template>
          </el-table-column>

          <!-- 名称和图标 -->
          <el-table-column prop="name" label="菜单名称" min-width="200">
            <template #default="{ row }">
              <div class="menu-name-cell">
                <el-icon v-if="row.icon" class="menu-icon" :size="18">
                  <component :is="row.icon" />
                </el-icon>
                <span class="menu-name">{{ row.name }}</span>
                <el-tag
                  v-if="row.level === 1"
                  size="small"
                  type="primary"
                  effect="plain"
                  class="level-tag"
                >
                  一级菜单
                </el-tag>
                <el-tag
                  v-else-if="row.level === 2"
                  size="small"
                  type="success"
                  effect="plain"
                  class="level-tag"
                >
                  二级菜单
                </el-tag>
              </div>
            </template>
          </el-table-column>

          <!-- 类型 -->
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag
                :type="getTypeColor(row.type)"
                size="small"
                effect="light"
              >
                {{ getTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 链接地址 -->
          <el-table-column prop="path" label="链接地址" min-width="200">
            <template #default="{ row }">
              <div v-if="row.path" class="path-cell">
                <el-link
                  v-if="row.type === 'url'"
                  :href="row.path"
                  :target="row.target"
                  type="primary"
                  :underline="false"
                  class="external-link"
                >
                  {{ row.path }}
                  <el-icon><LinkIcon /></el-icon>
                </el-link>
                <code v-else class="route-path">{{ row.path }}</code>
              </div>
              <span v-else class="text-placeholder">-</span>
            </template>
          </el-table-column>

          <!-- 排序 -->
          <el-table-column prop="sort_order" label="排序" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">
                {{ row.sort_order }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 可见角色 -->
          <el-table-column label="可见角色" width="150">
            <template #default="{ row }">
              <div v-if="row.roles?.length" class="roles-cell">
                <el-tag
                  v-for="roleId in row.roles.slice(0, 2)"
                  :key="roleId"
                  size="small"
                  type="warning"
                  effect="light"
                  class="role-tag"
                >
                  {{ getRoleName(roleId) }}
                </el-tag>
                <el-tag
                  v-if="row.roles.length > 2"
                  size="small"
                  type="info"
                  effect="light"
                >
                  +{{ row.roles.length - 2 }}
                </el-tag>
              </div>
              <el-tag v-else size="small" type="success" effect="light">
                所有用户
              </el-tag>
            </template>
          </el-table-column>

          <!-- 状态 -->
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.is_enabled"
                @change="handleToggleStatus(row)"
                :loading="row.statusLoading"
              />
            </template>
          </el-table-column>

          <!-- 操作 -->
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-space>
                <el-button
                  v-if="row.level === 1"
                  size="small"
                  type="success"
                  :icon="Plus"
                  @click="handleCreateSubNavigation(row)"
                  plain
                >
                  添加子菜单
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  :icon="Edit"
                  @click="handleEditNavigation(row)"
                  plain
                />
                <el-button
                  size="small"
                  type="danger"
                  :icon="Delete"
                  @click="handleDeleteNavigation(row)"
                  plain
                />
                <el-dropdown trigger="click" @command="handleCommand">
                  <el-button size="small" :icon="More" circle />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'roles', row }">
                        <el-icon><User /></el-icon> 角色权限
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'copy', row }">
                        <el-icon><DocumentCopy /></el-icon> 复制菜单
                      </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'move', row }" divided>
                        <el-icon><Sort /></el-icon> 移动到...
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </el-space>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 导航菜单编辑对话框 -->
    <NavigationEditDialog
      v-model:visible="editDialogVisible"
      :navigation-data="currentNavigation"
      :is-edit="isEditMode"
      :parent-options="parentOptions"
      @success="handleEditSuccess"
    />

    <!-- 角色权限设置对话框 -->
    <NavigationRoleDialog
      v-model:visible="roleDialogVisible"
      :navigation-data="currentNavigation"
      @success="handleRoleSuccess"
    />

    <!-- 快照创建对话框 -->
    <SnapshotDialog
      v-model:visible="snapshotDialogVisible"
      config-type="navigation"
      @success="handleSnapshotSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElTable } from 'element-plus'
import {
  Plus, Edit, Delete, Search, View, DocumentCopy, More, User, Sort,
  ArrowDown, ArrowUp, Rank, Link as LinkIcon
} from '@element-plus/icons-vue'
import Sortable from 'sortablejs'

// 导入API和类型
import { portalConfigApi } from '@/api/navigation'
import type { NavigationItem, NavigationQueryParams } from '@/types/navigation'

// 导入子组件
import NavigationEditDialog from './components/NavigationEditDialog.vue'
import NavigationRoleDialog from './components/NavigationRoleDialog.vue'
import SnapshotDialog from './components/SnapshotDialog.vue'

// ================================
// 响应式数据
// ================================

const loading = ref(false)
const navigationTableRef = ref<InstanceType<typeof ElTable>>()

// 导航数据
const navigationList = ref<NavigationItem[]>([])
const expandedKeys = ref<number[]>([])

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref<boolean | ''>('')
const filterType = ref('')

// 对话框状态
const editDialogVisible = ref(false)
const roleDialogVisible = ref(false)
const snapshotDialogVisible = ref(false)

// 当前编辑的导航
const currentNavigation = ref<NavigationItem | null>(null)
const isEditMode = ref(false)

// 拖拽相关
let sortableInstance: Sortable | null = null

// ================================
// 计算属性
// ================================

/** 过滤后的导航数据 */
const filteredNavigation = computed(() => {
  let result = [...navigationList.value]

  // 关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.path?.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (filterStatus.value !== '') {
    result = result.filter(item => item.is_enabled === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }

  return result
})

/** 父级菜单选项（用于编辑对话框） */
const parentOptions = computed(() => {
  const options = [{ id: 0, name: '顶级菜单', level: 0 }]
  
  const addOption = (item: NavigationItem) => {
    if (item.level === 1) {
      options.push({
        id: item.id!,
        name: item.name,
        level: item.level
      })
    }
  }

  navigationList.value.forEach(addOption)
  return options
})

// ================================
// 生命周期
// ================================

onMounted(() => {
  fetchNavigationData()
  initSortable()
})

// ================================
// 方法
// ================================

/** 获取导航数据 */
const fetchNavigationData = async () => {
  try {
    loading.value = true
    const response = await portalConfigApi.navigation.getNavigationTree()
    navigationList.value = response.data || []
  } catch (error) {
    console.error('获取导航数据失败:', error)
    ElMessage.error('获取导航数据失败')
  } finally {
    loading.value = false
  }
}

/** 初始化拖拽排序 */
const initSortable = async () => {
  await nextTick()
  
  const tableBody = navigationTableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
  if (!tableBody) return

  sortableInstance = new Sortable(tableBody, {
    handle: '.drag-handle',
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    onEnd: handleSortEnd
  })
}

/** 处理拖拽结束 */
const handleSortEnd = async (event: any) => {
  const { oldIndex, newIndex } = event
  if (oldIndex === newIndex) return

  try {
    const movedItem = navigationList.value[oldIndex]
    navigationList.value.splice(oldIndex, 1)
    navigationList.value.splice(newIndex, 0, movedItem)

    // 更新排序
    const sortData = navigationList.value.map((item, index) => ({
      id: item.id!,
      parent_id: item.parent_id,
      sort_order: index + 1
    }))

    await portalConfigApi.navigation.updateNavigationSort(sortData)
    ElMessage.success('排序更新成功')
  } catch (error) {
    console.error('更新排序失败:', error)
    ElMessage.error('更新排序失败')
    // 恢复原来的顺序
    await fetchNavigationData()
  }
}

/** 搜索处理 */
const handleSearch = () => {
  // 搜索时自动展开所有匹配项
  if (searchKeyword.value) {
    expandAll()
  }
}

/** 筛选处理 */
const handleFilter = () => {
  // 筛选后刷新表格
  nextTick(() => {
    navigationTableRef.value?.doLayout()
  })
}

/** 展开所有 */
const expandAll = () => {
  expandedKeys.value = navigationList.value.map(item => item.id!).filter(Boolean)
}

/** 折叠所有 */
const collapseAll = () => {
  expandedKeys.value = []
}

/** 处理展开/折叠 */
const handleExpandChange = (row: NavigationItem, expanded: boolean) => {
  if (expanded) {
    if (!expandedKeys.value.includes(row.id!)) {
      expandedKeys.value.push(row.id!)
    }
  } else {
    const index = expandedKeys.value.indexOf(row.id!)
    if (index > -1) {
      expandedKeys.value.splice(index, 1)
    }
  }
}

/** 新增导航 */
const handleCreateNavigation = () => {
  currentNavigation.value = {
    parent_id: 0,
    name: '',
    type: 'route',
    sort_order: navigationList.value.length + 1,
    is_enabled: true,
    level: 1,
    roles: []
  }
  isEditMode.value = false
  editDialogVisible.value = true
}

/** 新增子导航 */
const handleCreateSubNavigation = (parent: NavigationItem) => {
  const childrenCount = parent.children?.length || 0
  currentNavigation.value = {
    parent_id: parent.id!,
    name: '',
    type: 'route',
    sort_order: childrenCount + 1,
    is_enabled: true,
    level: 2,
    roles: []
  }
  isEditMode.value = false
  editDialogVisible.value = true
}

/** 编辑导航 */
const handleEditNavigation = (row: NavigationItem) => {
  currentNavigation.value = { ...row }
  isEditMode.value = true
  editDialogVisible.value = true
}

/** 删除导航 */
const handleDeleteNavigation = async (row: NavigationItem) => {
  const hasChildren = row.children && row.children.length > 0
  
  const message = hasChildren 
    ? `确定要删除导航菜单 "${row.name}" 及其所有子菜单吗？此操作不可恢复。`
    : `确定要删除导航菜单 "${row.name}" 吗？此操作不可恢复。`

  try {
    await ElMessageBox.confirm(message, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    })

    await portalConfigApi.navigation.deleteNavigation(row.id!)
    ElMessage.success('删除成功')
    await fetchNavigationData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除导航失败:', error)
      ElMessage.error('删除导航失败')
    }
  }
}

/** 切换状态 */
const handleToggleStatus = async (row: NavigationItem) => {
  row.statusLoading = true
  try {
    await portalConfigApi.navigation.toggleNavigationStatus(row.id!, row.is_enabled)
    ElMessage.success(`已${row.is_enabled ? '启用' : '禁用'}导航菜单`)
  } catch (error) {
    console.error('状态切换失败:', error)
    ElMessage.error('状态切换失败')
    // 恢复原状态
    row.is_enabled = !row.is_enabled
  } finally {
    row.statusLoading = false
  }
}

/** 下拉菜单命令处理 */
const handleCommand = ({ action, row }: { action: string, row: NavigationItem }) => {
  switch (action) {
    case 'roles':
      currentNavigation.value = row
      roleDialogVisible.value = true
      break
    case 'copy':
      handleCopyNavigation(row)
      break
    case 'move':
      handleMoveNavigation(row)
      break
  }
}

/** 复制导航 */
const handleCopyNavigation = (row: NavigationItem) => {
  currentNavigation.value = {
    ...row,
    id: undefined,
    name: `${row.name} - 副本`,
    sort_order: navigationList.value.length + 1
  }
  isEditMode.value = false
  editDialogVisible.value = true
}

/** 移动导航 */
const handleMoveNavigation = (row: NavigationItem) => {
  // TODO: 实现移动功能
  ElMessage.info('移动功能开发中...')
}

/** 预览效果 */
const handlePreview = () => {
  // 跳转到预览页面
  const routeData = {
    name: 'PortalPreview',
    query: { type: 'navigation' }
  }
  // TODO: 使用router跳转
  ElMessage.info('预览功能开发中...')
}

/** 创建快照 */
const handleCreateSnapshot = () => {
  snapshotDialogVisible.value = true
}

/** 编辑成功回调 */
const handleEditSuccess = () => {
  editDialogVisible.value = false
  fetchNavigationData()
}

/** 角色权限设置成功回调 */
const handleRoleSuccess = () => {
  roleDialogVisible.value = false
  fetchNavigationData()
}

/** 快照创建成功回调 */
const handleSnapshotSuccess = () => {
  snapshotDialogVisible.value = false
  ElMessage.success('配置快照创建成功')
}

// ================================
// 工具方法
// ================================

/** 获取类型名称 */
const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    route: '内部路由',
    url: '外部链接',
    group: '分组'
  }
  return typeMap[type] || type
}

/** 获取类型颜色 */
const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    route: 'primary',
    url: 'success',
    group: 'warning'
  }
  return colorMap[type] || ''
}

/** 获取角色名称 */
const getRoleName = (roleId: number) => {
  // TODO: 从角色store或API获取角色名称
  return `角色${roleId}`
}
</script>

<style lang="scss" scoped>
// 这里包含之前优化的所有样式...
// 为了节省空间，这里只显示主要的结构
.navigation-management {
  padding: 20px;
  background: var(--bg-color-light);
  min-height: calc(100vh - 60px);
}

// 其他样式保持不变...
</style>