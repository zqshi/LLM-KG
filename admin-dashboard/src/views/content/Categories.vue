<template>
  <div class="categories-page">
    <!-- 页面头部 -->
    <UnifiedPageHeader 
      :title="activeTab === 'categories' ? '内容版块管理' : '帖子标签管理'"
      :description="activeTab === 'categories' ? '管理内容版块，支持创建、编辑和排序版块结构' : '管理帖子标签，为内容提供标准化分类'"
    >
      <template #actions>
        <el-button 
          @click="activeTab = 'categories'" 
          :type="activeTab === 'categories' ? 'primary' : ''"
          :plain="activeTab !== 'categories'"
        >
          <el-icon><FolderOpened /></el-icon>
          版块管理
        </el-button>
        <el-button 
          @click="activeTab = 'tags'" 
          :type="activeTab === 'tags' ? 'primary' : ''"
          :plain="activeTab !== 'tags'"
        >
          <el-icon><Collection /></el-icon>
          标签管理
        </el-button>
        <el-button 
          v-if="activeTab === 'categories'"
          type="primary" 
          @click="handleAdd"
        >
          <el-icon><Plus /></el-icon>
          新增版块
        </el-button>
        <el-button 
          v-if="activeTab === 'tags'"
          type="primary" 
          @click="handleAddTag"
        >
          <el-icon><Plus /></el-icon>
          新增标签
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 主内容区域 -->
    <div class="page-content">
      <!-- 版块管理内容 -->
      <div v-if="activeTab === 'categories'" class="categories-content">
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
          <div class="categories-grid" v-loading="loading">
            <el-card v-for="category in categoryList" :key="category.id" class="category-card" :class="{ disabled: !category.isActive }">
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
          </div>
        </div>
      </div>
      
      <!-- 标签管理内容 -->
      <div v-if="activeTab === 'tags'" class="tags-content">
        <!-- 标签表格 -->
        <el-card class="table-card">
          <el-table 
            v-loading="tagsLoading"
            :data="tags" 
            style="width: 100%"
            :header-cell-style="{ background: '#fafafa' }"
          >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column prop="id" label="ID" width="80" align="center" sortable="custom" />
          
          <el-table-column prop="name" label="标签名称" min-width="200" sortable="custom">
            <template #default="{ row }">
              <div class="tag-name-cell">
                <span 
                  class="tag-preview" 
                  :style="{ backgroundColor: row.color, color: getTextColor(row.color) }"
                >
                  {{ row.name }}
                </span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="code" label="标签代码" width="150" align="center">
            <template #default="{ row }">
              <span class="tag-code">{{ row.code }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="tag-description">{{ row.description || '-' }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="postCount" label="使用量" width="120" align="center" sortable="custom">
            <template #default="{ row }">
              <span 
                class="usage-count" 
                @click="viewTagUsage(row)"
              >
                {{ row.postCount || 0 }} 个内容
              </span>
            </template>
          </el-table-column>
          
          <el-table-column prop="isActive" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                v-model="row.isActive"
                @change="handleTagStatusChange(row)"
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" width="180" align="center" sortable="custom">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                @click="handleEditTag(row)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="handleDeleteTag(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="tagQueryParams.page"
              v-model:page-size="tagQueryParams.pageSize"
              :total="tagTotal"
              :page-sizes="[10, 20, 50, 100]"
              background
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleTagSizeChange"
              @current-change="handleTagCurrentChange"
            />
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 版块新增/编辑对话框 -->
    <CategoryDialog
      v-model:visible="categoryDialogVisible"
      :form-data="currentCategory"
      :is-edit="isEditCategory"
      @success="handleCategoryDialogSuccess"
    />
    
    <!-- 标签新增/编辑对话框 -->
    <TagDialog
      v-model:visible="tagDialogVisible"
      :form-data="currentTag"
      :is-edit="isEditTag"
      @success="handleTagDialogSuccess"
    />
    
    <!-- 版主管理对话框 -->
    <ModeratorDialog
      v-model:visible="moderatorDialogVisible"
      :category-id="currentCategory.id || 0"
      :category-name="currentCategory.name || ''"
      :moderators="currentCategory.moderators || []"
      @success="handleModeratorDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/types'
import type { FormInstance, FormRules } from 'element-plus'
import draggable from 'vuedraggable'
import {
  Plus, FolderOpened, Select, Document, User as UserIcon,
  MoreFilled, Rank, Picture, Key, QuestionFilled, InfoFilled,
  Unlock, Lock, CircleCheck, Clock, View, DataLine, Close, Check,
  UserFilled, Search, RefreshLeft, Edit, Delete, PriceTag, Collection
} from '@element-plus/icons-vue'
import { contentApi } from '@/api/content'
import { categoriesApi } from '@/api/categories'
import type { Category as ApiCategory } from '@/api/categories'
import { ElMessage, ElMessageBox } from 'element-plus'

import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import CategoryDialog from './components/CategoryDialog.vue'
import TagDialog from './components/TagDialog.vue'
import ModeratorDialog from './components/ModeratorDialog.vue'

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

// 标签相关变量
const activeTab = ref<'categories' | 'tags'>('categories')
const tagsLoading = ref(false)
const tags = ref([])
const tagQueryParams = ref({ page: 1, pageSize: 10 })
const tagTotal = ref(0)
const loading = ref(false)

const categoryList = ref<Category[]>([])
const router = useRouter()

// 对话框相关状态
const categoryDialogVisible = ref(false)
const tagDialogVisible = ref(false)
const moderatorDialogVisible = ref(false)
const isEditCategory = ref(false)
const isEditTag = ref(false)
const currentCategory = ref<Partial<Category>>({})
const currentTag = ref<Partial<any>>({}) // 标签类型

const categoryStats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  totalPosts: 0,
  todayPosts: 0,
  moderators: 0
})

// 加载版块数据
const loadCategories = async () => {
  try {
    loading.value = true
    
    // 尝试使用真实API
    const response = await categoriesApi.getList()
    console.log('API响应:', response)
    
    if (response && response.data && response.data.categories) {
      categoryList.value = response.data.categories || []
      
      // 获取统计数据
      if (response.data.stats) {
        categoryStats.value = {
          ...response.data.stats,
          inactive: response.data.stats.total - response.data.stats.active
        }
      } else {
        // 如果没有统计数据，手动计算
        categoryStats.value = {
          total: categoryList.value.length,
          active: categoryList.value.filter(cat => cat.isActive).length,
          inactive: categoryList.value.filter(cat => !cat.isActive).length,
          totalPosts: categoryList.value.reduce((sum, cat) => sum + cat.postCount, 0),
          todayPosts: categoryList.value.reduce((sum, cat) => sum + cat.todayPosts, 0),
          moderators: categoryList.value.reduce((sum, cat) => sum + (cat.moderators?.length || 0), 0)
        }
      }
      
      // 加载每个版块的最新帖子
      for (const category of categoryList.value) {
        await loadLatestPosts(category.id)
      }
      
      console.log('版块数据加载成功, 共', categoryList.value.length, '个版块')
    } else {
      throw new Error('API返回数据格式错误')
    }
  } catch (error) {
    console.error('加载版块数据失败:', error)
    console.log('使用本地Mock数据作为降级方案')
    
    // 使用本地mock数据作为降级方案
    categoryList.value = getMockCategoryData()
    categoryStats.value = {
      total: categoryList.value.length,
      active: categoryList.value.filter(cat => cat.isActive).length,
      inactive: categoryList.value.filter(cat => !cat.isActive).length,
      totalPosts: categoryList.value.reduce((sum, cat) => sum + cat.postCount, 0),
      todayPosts: categoryList.value.reduce((sum, cat) => sum + cat.todayPosts, 0),
      moderators: categoryList.value.reduce((sum, cat) => sum + cat.moderators.length, 0)
    }
    
    // 加载每个版块的最新帖子
    for (const category of categoryList.value) {
      await loadLatestPosts(category.id)
    }
  } finally {
    loading.value = false
  }
}

// 加载版块最新帖子
const latestPosts = ref<Record<number, Array<{ id: number; title: string; createdAt: string }>>>({})

const loadLatestPosts = async (categoryId: number) => {
  try {
    // 尝试使用真实API
    const response = await categoriesApi.getLatestPosts(categoryId, 3)
    if (response.code === 200) {
      latestPosts.value[categoryId] = response.data
    }
  } catch (error) {
    console.warn(`加载版块 ${categoryId} 最新帖子失败:`, error)
    // 使用Mock数据作为降级
    latestPosts.value[categoryId] = [
      {
        id: 1,
        title: '最新技术分享帖子',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2, 
        title: '实用开发技巧总结',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
}

// 获取本地mock数据
const getMockCategoryData = (): Category[] => [
  {
    id: 1,
    name: '技术分享',
    code: 'tech_share',
    description: '分享技术经验、开发心得、解决方案等内容',
    icon: 'Monitor',
    sortOrder: 1,
    isActive: true,
    isPublic: true,
    auditMode: 'post',
    postPermissions: ['all'],
    postCount: 456,
    todayPosts: 8,
    moderators: [
      {
        id: 1,
        username: 'tech_admin',
        name: '技术管理员',
        nickname: '技术管理员',
        email: 'tech@example.com',
        department: '技术部',
        groupId: 1,
        status: 1,
        roles: [],
        createTime: '2024-01-01T00:00:00Z',
        updateTime: '2024-01-16T14:30:00Z'
      } as User
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
    isActive: true,
    isPublic: true,
    auditMode: 'pre',
    postPermissions: ['member'],
    postCount: 234,
    todayPosts: 3,
    moderators: [
      {
        id: 3,
        username: 'product_manager',
        name: '产品经理',
        nickname: '产品经理',
        email: 'pm@example.com',
        department: '产品部',
        groupId: 2,
        status: 1,
        roles: [],
        createTime: '2024-01-01T00:00:00Z',
        updateTime: '2024-01-16T14:30:00Z'
      } as User
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
    isActive: true,
    isPublic: true,
    auditMode: 'pre',
    postPermissions: ['member'],
    postCount: 189,
    todayPosts: 2,
    moderators: [
      {
        id: 4,
        username: 'hr_manager',
        name: 'HR经理',
        nickname: 'HR经理',
        email: 'hr@example.com',
        department: '人事部',
        groupId: 3,
        status: 1,
        roles: [],
        createTime: '2024-01-01T00:00:00Z',
        updateTime: '2024-01-16T14:30:00Z'
      } as User
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-13T12:15:00Z'
  }
]

// 方法定义
const handleAdd = () => {
  console.log('添加版块')
  currentCategory.value = {}
  isEditCategory.value = false
  categoryDialogVisible.value = true
}

const handleAddTag = () => {
  console.log('添加标签')
  currentTag.value = {}
  isEditTag.value = false
  tagDialogVisible.value = true
}

const handleSort = () => {
  console.log('排序')
  ElMessage.success('版块排序已更新')
  // TODO: 实现实际的排序保存逻辑
}

const enterCategory = (category: Category) => {
  console.log('进入版块', category)
  // 跳转到版块详情页面
  router.push({
    name: 'ContentCategory',
    params: { 
      categoryId: category.id.toString(),
      categoryName: category.name 
    },
    query: {
      code: category.code
    }
  })
  
  ElMessage.success(`正在进入「${category.name}」版块`)
}

const handleAction = (command: string, category: Category) => {
  console.log('操作', command, category)
  
  switch (command) {
    case 'edit':
      console.log('编辑版块', category)
      currentCategory.value = { ...category }
      isEditCategory.value = true
      categoryDialogVisible.value = true
      break
    case 'moderators':
      console.log('管理版主', category)
      currentCategory.value = { ...category }
      moderatorDialogVisible.value = true
      break
    case 'toggle': {
      const action = category.isActive ? '禁用' : '启用'
      ElMessageBox.confirm(
        `确定要${action}版块「${category.name}」吗？`,
        `${action}版块`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          // 尝试使用真实API
          await categoriesApi.updateStatus(category.id, !category.isActive)
          
          // 更新本地状态
          const categoryIndex = categoryList.value.findIndex(cat => cat.id === category.id)
          if (categoryIndex !== -1) {
            categoryList.value[categoryIndex].isActive = !categoryList.value[categoryIndex].isActive
            // 更新统计数据
            categoryStats.value.active = categoryList.value.filter(cat => cat.isActive).length
            categoryStats.value.inactive = categoryList.value.filter(cat => !cat.isActive).length
          }
          
          ElMessage.success(`${action}成功`)
        } catch (error) {
          console.error(`${action}版块失败:`, error)
          ElMessage.error(`${action}失败，请稍后重试`)
        }
      }).catch(() => {
        ElMessage.info('已取消')
      })
      break
    }
    case 'delete': {
      ElMessageBox.confirm(
        `确定要删除版块「${category.name}」吗？此操作不可恢复！`,
        '删除版块',
        {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'error'
        }
      ).then(async () => {
        try {
          // 尝试使用真实API
          await categoriesApi.delete(category.id)
          
          // 删除本地数据
          const categoryIndex = categoryList.value.findIndex(cat => cat.id === category.id)
          if (categoryIndex !== -1) {
            categoryList.value.splice(categoryIndex, 1)
            // 更新统计数据
            categoryStats.value.total = categoryList.value.length
            categoryStats.value.active = categoryList.value.filter(cat => cat.isActive).length
            categoryStats.value.inactive = categoryList.value.filter(cat => !cat.isActive).length
            categoryStats.value.totalPosts = categoryList.value.reduce((sum, cat) => sum + cat.postCount, 0)
            categoryStats.value.moderators = categoryList.value.reduce((sum, cat) => sum + cat.moderators.length, 0)
          }
          
          ElMessage.success('删除成功')
        } catch (error) {
          console.error('删除版块失败:', error)
          ElMessage.error('删除失败，请稍后重试')
        }
      }).catch(() => {
        ElMessage.info('已取消')
      })
      break
    }
    default:
      console.log('未知操作:', command)
  }
}

const getTextColor = (color: string) => {
  return '#fff'
}

const viewTagUsage = (row: any) => {
  console.log('查看标签使用', row)
}

const handleTagStatusChange = (row: any) => {
  console.log('改变标签状态', row)
}

const handleEditTag = (row: any) => {
  console.log('编辑标签', row)
  currentTag.value = { ...row }
  isEditTag.value = true
  tagDialogVisible.value = true
}

const handleDeleteTag = (row: any) => {
  console.log('删除标签', row)
}

const formatDateTime = (time: string) => {
  return new Date(time).toLocaleString()
}

const handleTagSizeChange = (size: number) => {
  tagQueryParams.value.pageSize = size
  console.log('改变页面大小', size)
}

const handleTagCurrentChange = (page: number) => {
  tagQueryParams.value.page = page
  console.log('改变当前页', page)
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

const goPreviewPost = (category: Category, post: any) => {
  console.log('预览帖子', category, post)
  ElMessage.info(`正在预览帖子「${post.title}」`)
  // TODO: 打开帖子预览对话框或跳转到帖子详情页
}

const getAuditModeName = (mode: string) => {
  const modeMap: Record<string, string> = {
    none: '无需审核',
    pre: '先审后发',
    post: '先发后审',
    sample: '抽样审核'
  }
  return modeMap[mode] || mode
}

const getAuditModeColor = (mode: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    none: 'success',
    pre: 'danger', 
    post: 'warning',
    sample: 'info'
  }
  return colorMap[mode] || 'info'
}

// 对话框成功回调方法
const handleCategoryDialogSuccess = () => {
  categoryDialogVisible.value = false
  loadCategories() // 重新加载版块列表
}

const handleTagDialogSuccess = () => {
  tagDialogVisible.value = false
  // 这里可以重新加载标签列表
  // 目前标签功能为占位实现，实际项目中需要集成真实的标签管理
}

const handleModeratorDialogSuccess = () => {
  moderatorDialogVisible.value = false
  loadCategories() // 重新加载版块列表以更新版主信息
}

onMounted(async () => {
  await loadCategories()
})
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.page-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stats-row {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .stats-content {
    display: flex;
    align-items: center;
    min-height: 80px;
    position: relative;
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
    font-size: 20px;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.active {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }

    &.posts {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.moderators {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }
  }

  .stats-info {
    flex: 1;
    overflow: hidden;
  }

  .stats-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  .stats-label {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    margin-top: 4px;
  }
}

.table-card {
  .pagination-container {
    margin-top: 20px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .stats-row .el-col {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
    margin-bottom: 16px;
  }

  .stats-content {
    gap: 12px;
  }

  .stats-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .stats-value {
    font-size: 20px;
  }

  .stats-label {
    font-size: 12px;
  }
}

.tool-count {
  color: #6b7280;
  font-size: 13px;
}

.tag-name-cell {
  display: flex;
  align-items: center;
}

.tag-preview {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.tag-description {
  color: var(--el-text-color-regular);
}

.usage-count {
  color: var(--el-color-primary);
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 576px) {
  .stats-row .el-col {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
    margin-bottom: 12px;
  }
}

.categories-grid {
  display: grid !important;
  gap: 20px;
  width: 100%;
  /* 智能自适应网格布局 - 根据容器宽度和卡片最佳尺寸自动调整列数 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  /* 确保不被其他样式覆盖 */
  flex-direction: unset !important;
  align-items: unset !important;
  justify-content: unset !important;
}

/* 确保vuedraggable组件与网格布局兼容 */
.categories-grid.sortable-ghost {
  opacity: 0.5;
}

.categories-grid.sortable-chosen {
  transform: scale(1.02);
}

/* 强制覆盖draggable的默认样式 */
.categories-grid {
  display: grid !important;
  flex-direction: unset !important;
}

/* 智能响应式布局 - 优先用户体验，自动适应平台 */
@media (min-width: 1800px) {
  .categories-grid {
    /* 超大屏幕：允许更多列，但保持卡片合理尺寸 */
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}

@media (min-width: 1200px) and (max-width: 1799px) {
  .categories-grid {
    /* 桌面端：平衡展示密度和可读性 */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .categories-grid {
    /* 平板端：维持良好的可读性 */
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 767px) {
  .categories-grid {
    /* 手机端：保持单列优先，但允许大屏手机显示两列 */
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: 12px;
    padding: 0 4px;
  }
  
  .categories-page {
    padding: 12px;
  }
  
  .page-content {
    padding: 16px 12px;
  }
  
  .page-header {
    padding: 16px 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .page-header-right {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* 手机端版块卡片优化 */
  .category-card {
    min-height: auto;
  }

  .category-description {
    font-size: 13px;
    line-height: 1.4;
    margin-bottom: 12px;
    /* 限制最大行数，避免卡片高度不一致 */
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .category-stats {
    margin-bottom: 12px;
  }

  .stat-number {
    font-size: 16px;
  }

  .stat-label {
    font-size: 11px;
  }

  .header-actions {
    flex-direction: column;
    gap: 4px;
    align-items: stretch;
  }

  .header-actions .el-button {
    font-size: 12px;
    padding: 4px 8px;
  }
}

.category-card {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #1890ff;
  transform: translateY(-2px);
}

.category-card.disabled {
  opacity: 0.6;
  background: #f5f5f5;
}

.category-card.disabled:hover {
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.header-actions .el-button {
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  transform: translateY(-1px);
}

.category-name {
  font-weight: 600;
  color: #262626;
  margin-right: 8px;
}

.drag-handle {
  cursor: move;
  color: #8c8c8c;
  transition: color 0.3s ease;
}

.drag-handle:hover {
  color: #1890ff;
}

.category-content {
  padding-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-description {
  color: #595959;
  font-size: 14px;
  line-height: 1.5;
  /* 限制最大行数，保持卡片高度一致性 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-shrink: 0;
}

.category-stats {
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
}

.category-moderators {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.moderators-label {
  font-size: 12px;
  color: #8c8c8c;
}

.moderators-list {
  display: flex;
  align-items: center;
  gap: 4px;
}

.moderator-avatar {
  flex-shrink: 0;
}

.more-count {
  font-size: 12px;
  color: #8c8c8c;
}

.latest-posts {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.latest-title {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 8px;
  font-weight: 500;
}

.latest-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.latest-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}

.latest-item .dot {
  width: 4px;
  height: 4px;
  background: #d9d9d9;
  border-radius: 50%;
  flex-shrink: 0;
}

.latest-item .title {
  flex: 1;
  color: #595959;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.latest-item .title:hover {
  color: #1890ff;
}

.latest-item .time {
  color: #bfbfbf;
  font-size: 11px;
  flex-shrink: 0;
}

.latest-empty {
  font-size: 12px;
  color: #bfbfbf;
  text-align: center;
  padding: 12px 0;
}

.category-settings {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  margin-top: auto;
  flex-shrink: 0;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.setting-label {
  color: #8c8c8c;
}

.setting-value {
  color: #595959;
  font-weight: 500;
}

.tags-content {
  /* 标签管理样式 */
}

.tag-name-cell {
  display: flex;
  align-items: center;
}

.tag-preview {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.usage-count {
  color: #1890ff;
  cursor: pointer;
}

.usage-count:hover {
  text-decoration: underline;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>