<template>
  <div class="categories-page">
    <div class="page-header">
      <h1 class="page-title">版块管理</h1>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增版块
      </el-button>
    </div>

    <!-- 版块统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><FolderOpened /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ categoryStats.total }}</div>
              <div class="stats-label">总版块数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon active">
              <el-icon><Select /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ categoryStats.active }}</div>
              <div class="stats-label">启用版块</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon posts">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ categoryStats.totalPosts }}</div>
              <div class="stats-label">总内容数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon moderators">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ categoryStats.moderators }}</div>
              <div class="stats-label">版主总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 版块列表 -->
    <div class="categories-grid">
      <draggable
        v-model="categoryList"
        @end="handleSort"
        class="drag-container"
        item-key="id"
      >
        <template #item="{ element: category }">
          <el-card class="category-card" :class="{ disabled: !category.isActive }">
            <template #header>
              <div class="card-header">
                <div class="header-left">
                  <el-icon class="drag-handle"><Rank /></el-icon>
                  <span class="category-name">{{ category.name }}</span>
                  <el-tag v-if="!category.isActive" type="danger" size="small">已禁用</el-tag>
                </div>
                <el-dropdown @command="(command) => handleAction(command, category)">
                  <el-button text>
                    <el-icon><MoreFilled /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="moderators">管理版主</el-dropdown-item>
                      <el-dropdown-item command="settings">版块设置</el-dropdown-item>
                      <el-dropdown-item command="toggle" divided>
                        {{ category.isActive ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>

            <div class="category-content">
              <div class="category-description">
                {{ category.description || '暂无描述' }}
              </div>
              
              <div class="category-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ category.postCount }}</span>
                  <span class="stat-label">内容数</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ category.todayPosts }}</span>
                  <span class="stat-label">今日新增</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ category.moderators?.length || 0 }}</span>
                  <span class="stat-label">版主</span>
                </div>
              </div>

              <div class="category-moderators" v-if="category.moderators?.length">
                <div class="moderators-label">版主：</div>
                <div class="moderators-list">
                  <el-avatar
                    v-for="moderator in category.moderators.slice(0, 3)"
                    :key="moderator.id"
                    :size="24"
                    :src="moderator.avatar"
                    class="moderator-avatar"
                  >
                    {{ moderator.nickname.charAt(0) }}
                  </el-avatar>
                  <span v-if="category.moderators.length > 3" class="more-count">
                    +{{ category.moderators.length - 3 }}
                  </span>
                </div>
              </div>

              <div class="category-settings">
                <div class="setting-item">
                  <span class="setting-label">排序：</span>
                  <span class="setting-value">{{ category.sortOrder }}</span>
                </div>
                <div class="setting-item">
                  <span class="setting-label">权限：</span>
                  <el-tag :type="category.isPublic ? 'success' : 'warning'" size="small">
                    {{ category.isPublic ? '公开' : '私有' }}
                  </el-tag>
                </div>
                <div class="setting-item">
                  <span class="setting-label">审核：</span>
                  <el-tag :type="getAuditModeColor(category.auditMode)" size="small">
                    {{ getAuditModeName(category.auditMode) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </template>
      </draggable>
    </div>

    <!-- 版块编辑对话框 -->
    <el-dialog
      v-model="categoryDialogVisible"
      :title="isEdit ? '编辑版块' : '新增版块'"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryFormRules"
        label-width="100px"
      >
        <el-form-item label="版块名称" prop="name">
          <el-input v-model="categoryForm.name" placeholder="请输入版块名称" />
        </el-form-item>
        
        <el-form-item label="版块标识" prop="code">
          <el-input 
            v-model="categoryForm.code" 
            placeholder="请输入版块标识（英文）"
            :disabled="isEdit"
          />
        </el-form-item>
        
        <el-form-item label="版块描述" prop="description">
          <el-input
            v-model="categoryForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入版块描述"
          />
        </el-form-item>
        
        <el-form-item label="版块图标" prop="icon">
          <el-input v-model="categoryForm.icon" placeholder="请输入图标名称">
            <template #prepend>
              <el-icon v-if="categoryForm.icon">
                <component :is="categoryForm.icon" />
              </el-icon>
              <el-icon v-else><Picture /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number
            v-model="categoryForm.sortOrder"
            :min="0"
            :max="9999"
            placeholder="数字越小排序越靠前"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="版块权限" prop="isPublic">
          <el-radio-group v-model="categoryForm.isPublic">
            <el-radio :value="true">公开版块</el-radio>
            <el-radio :value="false">私有版块</el-radio>
          </el-radio-group>
          <div class="form-help">私有版块需要特定权限才能访问</div>
        </el-form-item>
        
        <el-form-item label="审核模式" prop="auditMode">
          <el-radio-group v-model="categoryForm.auditMode">
            <el-radio value="none">无需审核</el-radio>
            <el-radio value="pre">先审后发</el-radio>
            <el-radio value="post">先发后审</el-radio>
            <el-radio value="sample">抽样审核</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="版块状态" prop="isActive">
          <el-switch
            v-model="categoryForm.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
        
        <el-form-item label="发帖权限">
          <el-checkbox-group v-model="categoryForm.postPermissions">
            <el-checkbox value="all">所有用户</el-checkbox>
            <el-checkbox value="member">注册用户</el-checkbox>
            <el-checkbox value="vip">VIP用户</el-checkbox>
            <el-checkbox value="moderator">仅版主</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="categoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCategorySave" :loading="saveLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 版主管理对话框 -->
    <el-dialog v-model="moderatorDialogVisible" title="管理版主" width="700px">
      <div class="moderator-management">
        <div class="current-moderators">
          <h4>当前版主</h4>
          <div class="moderator-list">
            <div
              v-for="moderator in currentModerators"
              :key="moderator.id"
              class="moderator-item"
            >
              <el-avatar :size="32" :src="moderator.avatar">
                {{ moderator.nickname.charAt(0) }}
              </el-avatar>
              <div class="moderator-info">
                <div class="moderator-name">{{ moderator.nickname }}</div>
                <div class="moderator-dept">{{ moderator.department }}</div>
              </div>
              <el-button
                type="danger"
                size="small"
                @click="removeModerator(moderator)"
              >
                移除
              </el-button>
            </div>
          </div>
        </div>
        
        <div class="add-moderator">
          <h4>添加版主</h4>
          <el-select
            v-model="selectedUserId"
            placeholder="请选择用户"
            filterable
            style="width: 200px; margin-right: 10px"
          >
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.nickname} (${user.department})`"
              :value="user.id"
            />
          </el-select>
          <el-button type="primary" @click="addModerator">添加</el-button>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="moderatorDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { User } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'
import draggable from 'vuedraggable'
import {
  Plus, FolderOpened, Select, Document, User as UserIcon,
  MoreFilled, Rank, Picture
} from '@element-plus/icons-vue'

interface Category {
  id: number
  name: string
  code: string
  description: string
  icon: string
  sortOrder: number
  isPublic: boolean
  isActive: boolean
  auditMode: 'none' | 'pre' | 'post' | 'sample'
  postPermissions: string[]
  postCount: number
  todayPosts: number
  moderators: User[]
  createdAt: string
  updatedAt: string
}

const categoryFormRef = ref<FormInstance>()
const categoryDialogVisible = ref(false)
const moderatorDialogVisible = ref(false)
const isEdit = ref(false)
const saveLoading = ref(false)
const selectedUserId = ref<number>()

const categoryForm = reactive({
  name: '',
  code: '',
  description: '',
  icon: 'FolderOpened',
  sortOrder: 0,
  isPublic: true,
  isActive: true,
  auditMode: 'none' as 'none' | 'pre' | 'post' | 'sample',
  postPermissions: ['all']
})

const categoryList = ref<Category[]>([])
const currentModerators = ref<User[]>([])
const availableUsers = ref<User[]>([])
const currentCategory = ref<Category | null>(null)

const categoryStats = ref({
  total: 8,
  active: 6,
  totalPosts: 2456,
  moderators: 15
})

const categoryFormRules: FormRules = {
  name: [
    { required: true, message: '请输入版块名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入版块标识', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '版块标识只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ]
}

const mockCategoryData = (): Category[] => [
  {
    id: 1,
    name: '技术分享',
    code: 'tech_share',
    description: '分享技术经验、开发心得、解决方案等',
    icon: 'Monitor',
    sortOrder: 1,
    isPublic: true,
    isActive: true,
    auditMode: 'post',
    postPermissions: ['all'],
    postCount: 456,
    todayPosts: 8,
    moderators: [
      { id: 1, username: 'admin', nickname: '系统管理员', email: '', department: '技术部', status: 'active', roles: [], createdAt: '', updatedAt: '' },
      { id: 2, username: 'tech_lead', nickname: '技术负责人', email: '', department: '技术部', status: 'active', roles: [], createdAt: '', updatedAt: '' }
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    name: '产品心得',
    code: 'product_insight',
    description: '产品设计思路、用户体验、市场分析等内容',
    icon: 'Briefcase',
    sortOrder: 2,
    isPublic: true,
    isActive: true,
    auditMode: 'pre',
    postPermissions: ['member'],
    postCount: 234,
    todayPosts: 3,
    moderators: [
      { id: 3, username: 'product_manager', nickname: '产品经理', email: '', department: '产品部', status: 'active', roles: [], createdAt: '', updatedAt: '' }
    ],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-14T15:30:00Z'
  },
  {
    id: 3,
    name: '企业文化',
    code: 'company_culture',
    description: '企业价值观、文化活动、团建等相关内容',
    icon: 'OfficeBuilding',
    sortOrder: 3,
    isPublic: true,
    isActive: true,
    auditMode: 'pre',
    postPermissions: ['member'],
    postCount: 189,
    todayPosts: 2,
    moderators: [
      { id: 4, username: 'hr_manager', nickname: 'HR经理', email: '', department: '人事部', status: 'active', roles: [], createdAt: '', updatedAt: '' }
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-13T09:20:00Z'
  },
  {
    id: 4,
    name: '企业红黑榜',
    code: 'company_ranking',
    description: '员工表彰、批评建议、绩效公示等',
    icon: 'Trophy',
    sortOrder: 4,
    isPublic: false,
    isActive: true,
    auditMode: 'pre',
    postPermissions: ['moderator'],
    postCount: 67,
    todayPosts: 1,
    moderators: [
      { id: 5, username: 'admin2', nickname: '管理员2', email: '', department: '管理层', status: 'active', roles: [], createdAt: '', updatedAt: '' }
    ],
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-12T14:45:00Z'
  }
]

const mockAvailableUsers = (): User[] => [
  { id: 10, username: 'user1', nickname: '张三', email: '', department: '技术部', status: 'active', roles: [], createdAt: '', updatedAt: '' },
  { id: 11, username: 'user2', nickname: '李四', email: '', department: '产品部', status: 'active', roles: [], createdAt: '', updatedAt: '' },
  { id: 12, username: 'user3', nickname: '王五', email: '', department: '运营部', status: 'active', roles: [], createdAt: '', updatedAt: '' }
]

const getAuditModeName = (mode: string) => {
  const modeMap: Record<string, string> = {
    none: '无需审核',
    pre: '先审后发',
    post: '先发后审',
    sample: '抽样审核'
  }
  return modeMap[mode] || mode
}

const getAuditModeColor = (mode: string) => {
  const colorMap: Record<string, string> = {
    none: 'success',
    pre: 'danger',
    post: 'warning',
    sample: 'info'
  }
  return colorMap[mode] || 'info'
}

const loadCategories = () => {
  categoryList.value = mockCategoryData()
}

const loadAvailableUsers = () => {
  availableUsers.value = mockAvailableUsers()
}

const handleAdd = () => {
  isEdit.value = false
  Object.keys(categoryForm).forEach(key => {
    if (key === 'sortOrder') {
      categoryForm[key] = categoryList.value.length + 1
    } else if (key === 'isPublic' || key === 'isActive') {
      ;(categoryForm as any)[key] = true
    } else if (key === 'auditMode') {
      categoryForm[key] = 'none'
    } else if (key === 'postPermissions') {
      categoryForm[key] = ['all']
    } else {
      ;(categoryForm as any)[key] = ''
    }
  })
  categoryForm.icon = 'FolderOpened'
  categoryDialogVisible.value = true
}

const handleAction = (command: string, category: Category) => {
  currentCategory.value = category
  
  switch (command) {
    case 'edit':
      isEdit.value = true
      Object.keys(categoryForm).forEach(key => {
        ;(categoryForm as any)[key] = (category as any)[key] || (key === 'postPermissions' ? [] : '')
      })
      categoryDialogVisible.value = true
      break
      
    case 'moderators':
      currentModerators.value = [...category.moderators]
      moderatorDialogVisible.value = true
      break
      
    case 'settings':
      ElMessage.info('版块设置功能开发中...')
      break
      
    case 'toggle':
      category.isActive = !category.isActive
      ElMessage.success(category.isActive ? '版块已启用' : '版块已禁用')
      break
      
    case 'delete':
      if (category.postCount > 0) {
        ElMessage.warning(`该版块下还有 ${category.postCount} 篇内容，无法删除`)
        return
      }
      
      ElMessageBox.confirm(
        `确定要删除版块 "${category.name}" 吗？`,
        '删除版块',
        { type: 'warning' }
      ).then(() => {
        ElMessage.success('删除成功')
        loadCategories()
      })
      break
  }
}

const handleSort = () => {
  // 更新排序
  categoryList.value.forEach((category, index) => {
    category.sortOrder = index + 1
  })
  ElMessage.success('排序更新成功')
}

const handleDialogClose = () => {
  categoryFormRef.value?.resetFields()
}

const handleCategorySave = () => {
  if (!categoryFormRef.value) return
  
  categoryFormRef.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      setTimeout(() => {
        saveLoading.value = false
        categoryDialogVisible.value = false
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        loadCategories()
      }, 1000)
    }
  })
}

const addModerator = () => {
  if (!selectedUserId.value) {
    ElMessage.warning('请选择用户')
    return
  }
  
  const user = availableUsers.value.find(u => u.id === selectedUserId.value)
  if (user && !currentModerators.value.find(m => m.id === user.id)) {
    currentModerators.value.push(user)
    selectedUserId.value = undefined
    ElMessage.success('添加成功')
  }
}

const removeModerator = (moderator: User) => {
  const index = currentModerators.value.findIndex(m => m.id === moderator.id)
  if (index > -1) {
    currentModerators.value.splice(index, 1)
    ElMessage.success('移除成功')
  }
}

onMounted(() => {
  loadCategories()
  loadAvailableUsers()
})
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  height: 80px;
}

.stats-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stats-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stats-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stats-icon.active {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stats-icon.posts {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stats-icon.moderators {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stats-label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.drag-container {
  display: contents;
}

.category-card {
  transition: all 0.3s;
  cursor: move;
}

.category-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-card.disabled {
  opacity: 0.6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  cursor: move;
  color: #c0c4cc;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-content {
  padding: 10px 0;
}

.category-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  min-height: 44px;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.category-moderators {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.moderators-label {
  font-size: 12px;
  color: #606266;
}

.moderators-list {
  display: flex;
  align-items: center;
  gap: 4px;
}

.moderator-avatar {
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.more-count {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.category-settings {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.setting-label {
  color: #909399;
}

.setting-value {
  color: #606266;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.moderator-management {
  max-height: 400px;
  overflow-y: auto;
}

.current-moderators {
  margin-bottom: 20px;
}

.current-moderators h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

.moderator-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.moderator-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.moderator-info {
  flex: 1;
  margin-left: 12px;
}

.moderator-name {
  font-weight: 500;
  color: #303133;
}

.moderator-dept {
  font-size: 12px;
  color: #909399;
}

.add-moderator h4 {
  margin: 0 0 12px 0;
  color: #303133;
}
</style>