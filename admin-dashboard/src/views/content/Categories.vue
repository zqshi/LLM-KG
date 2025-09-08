<template>
  <div class="categories-page">
    <UnifiedPageHeader 
      title="版块管理" 
      description="管理内容版块，支持创建、编辑和排序版块结构"
    >
      <template #actions>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增版块
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 版块统计 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon>
                <FolderOpened />
              </el-icon>
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
              <el-icon>
                <Document />
              </el-icon>
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
              <el-icon>
                <User />
              </el-icon>
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
    <div class="categories-section">
      <div class="categories-grid">
        <draggable v-model="categoryList" @end="handleSort" class="drag-container" item-key="id">
          <template #item="{ element: category }">
            <el-card class="category-card" :class="{ disabled: !category.isActive }">
              <template #header>
                <div class="card-header">
                  <div class="header-left">
                    <el-icon class="drag-handle">
                      <Rank />
                    </el-icon>
                    <span class="category-name">{{ category.name }}</span>
                    <el-tag v-if="!category.isActive" type="danger" size="small">已禁用</el-tag>
                  </div>
                  <div class="header-actions">
                    <el-button type="primary" plain size="small" @click="enterCategory(category)">进入版块</el-button>
                  </div>
                  <el-dropdown @command="(command) => handleAction(command, category)">
                    <el-button text>
                      <el-icon>
                        <MoreFilled />
                      </el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="moderators">管理版主</el-dropdown-item>
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
                    <el-avatar v-for="moderator in category.moderators.slice(0, 3)" :key="moderator.id" :size="24"
                      :src="moderator.avatar" class="moderator-avatar">
                      {{ moderator.nickname?.charAt(0) || '?' }}
                    </el-avatar>
                    <span v-if="category.moderators.length > 3" class="more-count">
                      +{{ category.moderators.length - 3 }}
                    </span>
                  </div>
                </div>

                <!-- 最新帖子预览 -->
                <div class="latest-posts">
                  <div class="latest-title">最新帖子</div>
                  <ul class="latest-list">
                    <li v-for="post in (latestPosts[category.id] || [])" :key="post.id" class="latest-item">
                      <span class="dot"></span>
                      <span class="title" @click="goPreviewPost(category, post)">{{ post.title }}</span>
                      <span class="time">{{ formatTime(post.createdAt) }}</span>
                    </li>
                  </ul>
                  <div v-if="!(latestPosts[category.id]?.length)" class="latest-empty">暂无帖子</div>
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
    </div>

    <!-- 版块编辑对话框 -->
    <el-dialog v-model="categoryDialogVisible" :title="isEdit ? '编辑版块' : '新增版块'" width="680px"
      @close="handleDialogClose" class="modern-dialog">
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryFormRules" label-width="120px" class="modern-form">
        <el-form-item label="版块名称" prop="name">
          <el-input 
            v-model="categoryForm.name" 
            placeholder="请输入版块名称" 
            class="modern-input"
            clearable
            maxlength="20"
            show-word-limit>
            <template #prefix>
              <el-icon class="input-icon"><FolderOpened /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="版块标识" prop="code">
          <el-input 
            v-model="categoryForm.code" 
            placeholder="请输入版块标识（英文）" 
            :disabled="isEdit" 
            class="modern-input"
            clearable>
            <template #prefix>
              <el-icon class="input-icon"><Key /></el-icon>
            </template>
            <template #suffix v-if="!isEdit">
              <el-tooltip content="只能包含字母、数字和下划线" placement="top">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="版块描述" prop="description">
          <el-input 
            v-model="categoryForm.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入版块描述，将在版块列表中展示" 
            class="modern-textarea"
            maxlength="200"
            show-word-limit
            resize="none" />
        </el-form-item>

        <el-form-item label="版块图标" prop="icon">
          <div class="icon-selector">
            <el-input 
              v-model="categoryForm.icon" 
              placeholder="请输入图标名称"
              class="modern-input">
              <template #prepend>
                <div class="icon-preview">
                  <el-icon v-if="categoryForm.icon" class="preview-icon">
                    <component :is="categoryForm.icon" />
                  </el-icon>
                  <el-icon v-else class="preview-icon placeholder">
                    <Picture />
                  </el-icon>
                </div>
              </template>
            </el-input>
            <div class="icon-suggestions">
              <el-button 
                v-for="icon in commonIcons" 
                :key="icon"
                size="small"
                :type="categoryForm.icon === icon ? 'primary' : ''"
                @click="categoryForm.icon = icon"
                class="icon-btn">
                <el-icon><component :is="icon" /></el-icon>
              </el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="排序权重" prop="sortOrder">
          <el-input-number 
            v-model="categoryForm.sortOrder" 
            :min="0" 
            :max="9999" 
            placeholder="数字越小排序越靠前"
            class="modern-input-number"
            controls-position="right"
            style="width: 100%" />
          <div class="form-tip">
            <el-icon class="tip-icon"><InfoFilled /></el-icon>
            数字越小，版块在列表中排序越靠前
          </div>
        </el-form-item>

        <el-form-item label="版块权限" prop="isPublic">
          <div class="radio-group-modern">
            <el-radio-group v-model="categoryForm.isPublic" class="modern-radio-group">
              <el-radio :value="true" class="modern-radio">
                <div class="radio-content">
                  <el-icon class="radio-icon"><Unlock /></el-icon>
                  <div class="radio-text">
                    <div class="radio-title">公开版块</div>
                    <div class="radio-desc">所有用户都可以访问</div>
                  </div>
                </div>
              </el-radio>
              <el-radio :value="false" class="modern-radio">
                <div class="radio-content">
                  <el-icon class="radio-icon"><Lock /></el-icon>
                  <div class="radio-text">
                    <div class="radio-title">私有版块</div>
                    <div class="radio-desc">需要特定权限才能访问</div>
                  </div>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
        </el-form-item>

        <el-form-item label="审核模式" prop="auditMode">
          <el-radio-group v-model="categoryForm.auditMode" class="audit-mode-group">
            <el-radio value="none" class="audit-option">
              <div class="audit-content">
                <el-icon class="audit-icon success"><CircleCheck /></el-icon>
                <span>无需审核</span>
              </div>
            </el-radio>
            <el-radio value="pre" class="audit-option">
              <div class="audit-content">
                <el-icon class="audit-icon warning"><Clock /></el-icon>
                <span>先审后发</span>
              </div>
            </el-radio>
            <el-radio value="post" class="audit-option">
              <div class="audit-content">
                <el-icon class="audit-icon info"><View /></el-icon>
                <span>先发后审</span>
              </div>
            </el-radio>
            <el-radio value="sample" class="audit-option">
              <div class="audit-content">
                <el-icon class="audit-icon primary"><DataLine /></el-icon>
                <span>抽样审核</span>
              </div>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="版块状态" prop="isActive">
          <div class="switch-container">
            <el-switch 
              v-model="categoryForm.isActive" 
              class="modern-switch"
              size="large"
              active-text="启用" 
              inactive-text="禁用"
              :active-icon="Select"
              :inactive-icon="Close" />
            <div class="switch-desc">
              {{ categoryForm.isActive ? '版块将在用户端显示' : '版块将隐藏，用户无法访问' }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="发帖权限">
          <div class="permissions-grid">
            <el-checkbox-group v-model="categoryForm.postPermissions" class="modern-checkbox-group">
              <div class="permission-item" v-for="perm in permissionOptions" :key="perm.value">
                <el-checkbox :value="perm.value" class="modern-checkbox">
                  <div class="checkbox-content">
                    <el-icon :class="`perm-icon ${perm.type}`">
                      <component :is="perm.icon" />
                    </el-icon>
                    <div class="checkbox-text">
                      <div class="checkbox-title">{{ perm.label }}</div>
                      <div class="checkbox-desc">{{ perm.desc }}</div>
                    </div>
                  </div>
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer-modern">
          <el-button 
            @click="categoryDialogVisible = false" 
            class="cancel-btn"
            size="large">
            <el-icon><Close /></el-icon>
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="handleCategorySave" 
            :loading="saveLoading"
            class="confirm-btn"
            size="large">
            <el-icon v-if="!saveLoading"><Check /></el-icon>
            {{ isEdit ? '更新版块' : '创建版块' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 版主管理对话框 -->
    <el-dialog v-model="moderatorDialogVisible" title="管理版主" width="700px">
      <div class="moderator-management">
        <div class="current-moderators">
          <h4>当前版主</h4>
          <div class="moderator-list">
            <div v-for="moderator in currentModerators" :key="moderator.id" class="moderator-item">
              <el-avatar :size="32" :src="moderator.avatar">
                {{ moderator.nickname.charAt(0) }}
              </el-avatar>
              <div class="moderator-info">
                <div class="moderator-name">{{ moderator.nickname || '未知' }}</div>
                <div class="moderator-dept">{{ moderator.department }}</div>
              </div>
              <el-button type="danger" size="small" @click="removeModerator(moderator)">
                移除
              </el-button>
            </div>
          </div>
        </div>

        <div class="add-moderator">
          <h4>添加版主</h4>
          <el-select v-model="selectedUserId" placeholder="请选择用户" filterable style="width: 200px; margin-right: 10px">
            <el-option v-for="user in availableUsers" :key="user.id" :label="`${user.nickname} (${user.department})`"
              :value="user.id" />
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
import { useRouter } from 'vue-router'
import type { User } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'
import draggable from 'vuedraggable'
import {
  Plus, FolderOpened, Select, Document, User as UserIcon,
  MoreFilled, Rank, Picture, Key, QuestionFilled, InfoFilled,
  Unlock, Lock, CircleCheck, Clock, View, DataLine, Close, Check,
  UserFilled, Star, ShieldFilled
} from '@element-plus/icons-vue'
import { contentApi } from '@/api/content'
import { ElMessage, ElMessageBox } from 'element-plus'

// 统一组件导入
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import StatsCard from '@/components/StatsCard.vue'

interface Category {
  id: number
  name: string
  code: string
  description: string
  icon: string
  sortOrder: number
  isPublic: boolean
  isActive: boolean
  auditMode: 0 | 1 | 2 | 3
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
  auditMode: 0 as 0 | 1 | 2 | 3,
  postPermissions: ['all']
})

const categoryList = ref<Category[]>([])
const currentModerators = ref<User[]>([])
const availableUsers = ref<User[]>([])
const router = useRouter()

// 常用图标选项
const commonIcons = [
  'FolderOpened', 'Document', 'Monitor', 'Briefcase', 'OfficeBuilding', 
  'Trophy', 'Star', 'Bell', 'Setting', 'User', 'DataBoard', 'ChatDotRound'
]

// 权限选项
const permissionOptions = [
  { 
    value: 'all', 
    label: '所有用户', 
    desc: '包括游客和注册用户', 
    icon: 'User', 
    type: 'success' 
  },
  { 
    value: 'member', 
    label: '注册用户', 
    desc: '仅已注册的用户可以发帖', 
    icon: 'UserFilled', 
    type: 'primary' 
  },
  { 
    value: 'vip', 
    label: 'VIP用户', 
    desc: '需要VIP等级的用户', 
    icon: 'Star', 
    type: 'warning' 
  },
  { 
    value: 'moderator', 
    label: '仅版主', 
    desc: '只有版主可以发帖', 
    icon: 'ShieldFilled', 
    type: 'danger' 
  }
]
const latestPosts = ref<Record<number, { id: number; title: string; createdAt: string }[]>>({})
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
    auditMode: 2,
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
    auditMode: 1,
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

const getAuditModeName = (mode: number) => {
  const modeMap: Record<number, string> = {
    0: '无需审核',
    1: '先审后发',
    2: '先发后审',
    3: '抽样审核'
  }
  return modeMap[mode] || '未知'
}

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
const getAuditModeColor = (mode: 0 | 1 | 2 | 3): TagType => {
  const colorMap: Record<number, TagType> = {
    0: 'success',
    1: 'danger',
    2: 'warning',
    3: 'info'
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
      ; (categoryForm as any)[key] = true
    } else if (key === 'auditMode') {
      categoryForm[key] = 'none'
    } else if (key === 'postPermissions') {
      categoryForm[key] = ['all']
    } else {
      ; (categoryForm as any)[key] = ''
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
        ; (categoryForm as any)[key] = (category as any)[key] || (key === 'postPermissions' ? [] : '')
      })
      categoryDialogVisible.value = true
      break

    case 'moderators':
      currentModerators.value = [...category.moderators]
      moderatorDialogVisible.value = true
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


// 进入版块专属页
const enterCategory = (category: Category) => {
  router.push({
    name: 'ContentCategoryHome',
    params: { code: category.code },
    query: { name: category.name }
  })
}

// 加载某个版块的最新帖子（取3条）
const loadLatestForCategory = async (category: Category) => {
  try {
    const { data } = await contentApi.getList({
      page: 1, pageSize: 3, module: 'forum', category: category.name
    } as any)
    latestPosts.value[category.id] = (data?.list || []).map((it: any) => ({
      id: it.id, title: it.title, createdAt: it.createdAt
    }))
  } catch {
    latestPosts.value[category.id] = []
  }
}

const formatTime = (s: string) => new Date(s).toLocaleString('zh-CN')
const goPreviewPost = (_category: Category, post: { id: number }) => {
  router.push({ name: 'ContentDetail', params: { id: post.id } })
}


onMounted(() => {
  loadCategories()
  loadAvailableUsers()
  // 异步拉取每个版块的最新帖子
  setTimeout(() => {
    categoryList.value.forEach(cat => loadLatestForCategory(cat))
  }, 0)
})
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .header-left {
    .page-title {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;
}

.stats-content {
  display: flex;
  align-items: center;
  min-height: 80px;
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

/* 统计卡片响应式：中屏两列，小屏一列，避免挤压导致内容裁切 */
@media (max-width: 992px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 12px;
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }

  .stats-content {
    min-height: 64px;
  }

  .stats-value {
    font-size: 20px;
  }
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  gap: 8px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.drag-handle {
  cursor: move;
  color: #c0c4cc;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
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
  white-space: normal;
  word-break: break-word;
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
  gap: 8px;
  flex-wrap: wrap;
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

/* 头部动作按钮 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
}

/* 最新帖子预览样式 */
.latest-posts { margin: 12px 0 8px; }
.latest-title { font-size: 13px; color: #606266; margin-bottom: 8px; }
.latest-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.latest-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #303133; }
.latest-item .dot { width: 6px; height: 6px; background:#409EFF; border-radius: 50%; display:inline-block; }
.latest-item .title { cursor: pointer; flex: 1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.latest-item .title:hover { text-decoration: underline; color:#409EFF; }
.latest-item .time { color:#909399; font-size:12px; }
.latest-empty { color:#909399; font-size:12px; }

/* 现代化表单样式 */
.modern-dialog {
  .el-dialog {
    border-radius: 16px;
    overflow: hidden;
  }
  
  .el-dialog__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
    margin: 0;
  }
  
  .el-dialog__title {
    color: white;
    font-size: 18px;
    font-weight: 600;
  }
  
  .el-dialog__headerbtn .el-dialog__close {
    color: white;
    font-size: 20px;
  }
  
  .el-dialog__body {
    padding: 32px 24px 24px;
    background: #fafbfc;
  }
}

.modern-form {
  .el-form-item {
    margin-bottom: 28px;
  }
  
  .el-form-item__label {
    font-weight: 600;
    color: #374151;
    line-height: 1.8;
  }
  
  .el-form-item__content {
    line-height: 1.8;
  }
}

.modern-input {
  .el-input__wrapper {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    transition: all 0.2s ease;
    padding: 8px 12px;
    
    &:hover {
      border-color: #cbd5e1;
    }
    
    &.is-focus {
      border-color: #2f81f7;
      box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.1);
    }
  }
  
  .input-icon {
    color: #6b7280;
    margin-right: 8px;
  }
  
  .help-icon {
    color: #9ca3af;
    cursor: help;
    
    &:hover {
      color: #6b7280;
    }
  }
}

.modern-textarea {
  .el-textarea__inner {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    transition: all 0.2s ease;
    padding: 12px;
    line-height: 1.6;
    
    &:hover {
      border-color: #cbd5e1;
    }
    
    &:focus {
      border-color: #2f81f7;
      box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.1);
    }
  }
}

.modern-input-number {
  .el-input-number__wrapper {
    border-radius: 8px;
    border: 2px solid #e5e7eb;
    
    &:hover {
      border-color: #cbd5e1;
    }
    
    &.is-focus {
      border-color: #2f81f7;
      box-shadow: 0 0 0 3px rgba(47, 129, 247, 0.1);
    }
  }
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #6b7280;
  font-size: 13px;
  
  .tip-icon {
    color: #3b82f6;
    font-size: 14px;
  }
}

.icon-selector {
  .icon-preview {
    width: 40px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 6px;
    
    .preview-icon {
      font-size: 18px;
      color: #374151;
      
      &.placeholder {
        color: #9ca3af;
      }
    }
  }
  
  .icon-suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  
  .icon-btn {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
}

.radio-group-modern {
  .modern-radio-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .modern-radio {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s ease;
    background: white;
    
    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    
    &.is-checked {
      border-color: #2f81f7;
      background: linear-gradient(90deg, rgba(47, 129, 247, 0.05) 0%, rgba(47, 129, 247, 0.02) 100%);
    }
    
    .el-radio__input {
      display: none;
    }
    
    .el-radio__label {
      padding-left: 0;
    }
  }
  
  .radio-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .radio-icon {
    font-size: 20px;
    color: #6b7280;
  }
  
  .radio-text {
    flex: 1;
  }
  
  .radio-title {
    font-weight: 600;
    color: #374151;
    margin-bottom: 2px;
  }
  
  .radio-desc {
    color: #6b7280;
    font-size: 13px;
  }
}

.audit-mode-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  
  .audit-option {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
    transition: all 0.2s ease;
    background: white;
    
    &:hover {
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    
    &.is-checked {
      border-color: #2f81f7;
      background: linear-gradient(135deg, rgba(47, 129, 247, 0.05) 0%, rgba(47, 129, 247, 0.02) 100%);
    }
    
    .el-radio__input {
      display: none;
    }
    
    .el-radio__label {
      padding-left: 0;
    }
  }
  
  .audit-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  
  .audit-icon {
    font-size: 24px;
    
    &.success { color: #10b981; }
    &.warning { color: #f59e0b; }
    &.info { color: #3b82f6; }
    &.primary { color: #8b5cf6; }
  }
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .modern-switch {
    .el-switch__core {
      border-radius: 16px;
      height: 32px;
      
      &::after {
        width: 28px;
        height: 28px;
      }
    }
  }
  
  .switch-desc {
    color: #6b7280;
    font-size: 13px;
    flex: 1;
  }
}

.permissions-grid {
  .modern-checkbox-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .permission-item {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.2s ease;
    background: white;
    
    &:hover {
      border-color: #cbd5e1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    
    .modern-checkbox {
      width: 100%;
      margin: 0;
      
      .el-checkbox__input {
        display: none;
      }
      
      .el-checkbox__label {
        padding: 16px;
        width: 100%;
        display: block;
      }
      
      &.is-checked {
        .permission-item {
          border-color: #2f81f7;
          background: linear-gradient(90deg, rgba(47, 129, 247, 0.05) 0%, rgba(47, 129, 247, 0.02) 100%);
        }
      }
    }
  }
  
  .checkbox-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .perm-icon {
    font-size: 20px;
    
    &.success { color: #10b981; }
    &.primary { color: #3b82f6; }
    &.warning { color: #f59e0b; }
    &.danger { color: #ef4444; }
  }
  
  .checkbox-text {
    flex: 1;
  }
  
  .checkbox-title {
    font-weight: 600;
    color: #374151;
    margin-bottom: 2px;
  }
  
  .checkbox-desc {
    color: #6b7280;
    font-size: 12px;
  }
}

.dialog-footer-modern {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  background: white;
  border-top: 1px solid #e5e7eb;
  
  .cancel-btn {
    border-radius: 8px;
    padding: 12px 24px;
    font-weight: 500;
  }
  
  .confirm-btn {
    border-radius: 8px;
    padding: 12px 32px;
    font-weight: 600;
    background: linear-gradient(135deg, #2f81f7 0%, #1d4ed8 100%);
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(47, 129, 247, 0.3);
    }
  }
}
</style>