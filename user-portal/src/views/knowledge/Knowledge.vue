<template>
  <div class="knowledge-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>知识平台</h1>
        <p>分享知识，共同成长 - 构建企业智慧图谱</p>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-section">
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索知识文档、作者或标签..."
            :prefix-icon="Search"
            size="large"
            clearable
            @input="handleSearch"
            style="max-width: 500px"
          />
          <el-button type="primary" size="large" @click="$router.push('/knowledge/upload')">
            <el-icon><Plus /></el-icon>
            上传文档
          </el-button>
        </div>

        <div class="filter-controls">
          <div class="filter-tabs">
            <div
              v-for="category in categories"
              :key="category.value"
              class="filter-tab"
              :class="{ active: selectedCategory === category.value }"
              @click="selectedCategory = category.value"
            >
              {{ category.label }}
            </div>
          </div>

          <div class="filter-options">
            <el-select
              v-model="selectedDepartment"
              placeholder="按部门筛选"
              clearable
              style="width: 120px"
              @change="handleFilter"
            >
              <el-option
                v-for="dept in departments"
                :key="dept"
                :label="dept"
                :value="dept"
              />
            </el-select>
            <el-select
              v-model="fileType"
              placeholder="文件类型"
              clearable
              style="width: 120px"
              @change="handleFilter"
            >
              <el-option label="文档" value="doc" />
              <el-option label="PDF" value="pdf" />
              <el-option label="视频" value="video" />
              <el-option label="演示文稿" value="ppt" />
            </el-select>
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              style="width: 120px"
              @change="handleSort"
            >
              <el-option label="最新发布" value="createTime" />
              <el-option label="最近更新" value="updateTime" />
              <el-option label="阅读量" value="readCount" />
              <el-option label="点赞数" value="likeCount" />
              <el-option label="下载量" value="downloadCount" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 热门标签 -->
      <div class="popular-tags">
        <h3>热门标签</h3>
        <div class="tags-list">
          <el-tag
            v-for="tag in popularTags"
            :key="tag.name"
            :type="selectedTags.includes(tag.name) ? 'primary' : 'info'"
            :effect="selectedTags.includes(tag.name) ? 'dark' : 'plain'"
            @click="toggleTag(tag.name)"
            style="cursor: pointer; margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag.name }} ({{ tag.count }})
          </el-tag>
        </div>
      </div>

      <!-- 知识文档列表 -->
      <div class="knowledge-content">
        <!-- 视图切换 -->
        <div class="view-controls">
          <div class="result-info">
            共找到 {{ filteredKnowledge.length }} 个文档
          </div>
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="list">
              <el-icon><List /></el-icon>
              列表视图
            </el-radio-button>
            <el-radio-button value="grid">
              <el-icon><Grid /></el-icon>
              网格视图
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <el-skeleton :rows="8" animated />
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredKnowledge.length === 0" class="empty">
          <el-empty description="没有找到相关文档">
            <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
          </el-empty>
        </div>

        <!-- 列表视图 -->
        <div v-else-if="viewMode === 'list'" class="knowledge-list">
          <div
            v-for="item in paginatedKnowledge"
            :key="item.id"
            class="knowledge-item"
            @click="$router.push(`/knowledge/${item.id}`)"
          >
            <div class="item-icon">
              <el-icon :size="40" :color="getFileTypeColor(item.fileType)">
                <component :is="getFileTypeIcon(item.fileType)" />
              </el-icon>
            </div>
            
            <div class="item-content">
              <div class="item-header">
                <h3>{{ item.title }}</h3>
                <div class="item-badges">
                  <el-tag :type="getCategoryType(item.category)" size="small">
                    {{ item.category }}
                  </el-tag>
                  <el-tag type="info" size="small" effect="plain">
                    {{ item.fileType.toUpperCase() }}
                  </el-tag>
                </div>
              </div>
              
              <p class="item-summary">{{ item.summary }}</p>
              
              <div class="item-tags">
                <el-tag
                  v-for="tag in item.tags.slice(0, 4)"
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              
              <div class="item-meta">
                <div class="meta-left">
                  <span><el-icon><User /></el-icon>{{ item.author }}</span>
                  <span><el-icon><OfficeBuilding /></el-icon>{{ item.department }}</span>
                  <span><el-icon><Calendar /></el-icon>{{ formatTime(item.updateTime) }}</span>
                </div>
                <div class="meta-right">
                  <span><el-icon><View /></el-icon>{{ item.readCount }}</span>
                  <span><el-icon><Star /></el-icon>{{ item.likeCount }}</span>
                  <span><el-icon><Download /></el-icon>{{ item.downloadCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 网格视图 -->
        <div v-else class="knowledge-grid">
          <div
            v-for="item in paginatedKnowledge"
            :key="item.id"
            class="grid-item"
            @click="$router.push(`/knowledge/${item.id}`)"
          >
            <div class="grid-header">
              <div class="file-icon">
                <el-icon :size="32" :color="getFileTypeColor(item.fileType)">
                  <component :is="getFileTypeIcon(item.fileType)" />
                </el-icon>
              </div>
              <el-tag :type="getCategoryType(item.category)" size="small">
                {{ item.category }}
              </el-tag>
            </div>
            
            <div class="grid-content">
              <h4>{{ item.title }}</h4>
              <p>{{ item.summary }}</p>
            </div>
            
            <div class="grid-footer">
              <div class="author-info">
                <span>{{ item.author }}</span>
                <span>{{ formatTime(item.updateTime) }}</span>
              </div>
              <div class="stats">
                <span><el-icon><View /></el-icon>{{ item.readCount }}</span>
                <span><el-icon><Download /></el-icon>{{ item.downloadCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="filteredKnowledge.length > 0" class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredKnowledge.length"
            layout="total, sizes, prev, pager, next, jumper"
            :page-sizes="[10, 20, 50, 100]"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useContentStore } from '@/stores/content'
import type { Knowledge } from '@/types'
import {
  Search,
  Plus,
  User,
  Calendar,
  View,
  Star,
  Download,
  OfficeBuilding,
  List,
  Grid,
  Document,
  VideoCamera,
  Files,
  PictureRounded
} from '@element-plus/icons-vue'

const contentStore = useContentStore()

// 响应式数据
const searchKeyword = ref('')
const selectedCategory = ref('all')
const selectedDepartment = ref('')
const fileType = ref('')
const sortBy = ref('updateTime')
const selectedTags = ref<string[]>([])
const viewMode = ref('list')
const currentPage = ref(1)
const pageSize = ref(20)
const loading = ref(false)

// 分类选项
const categories = [
  { label: '全部', value: 'all' },
  { label: '前端技术', value: '前端技术' },
  { label: '后端技术', value: '后端技术' },
  { label: '管理制度', value: '管理制度' },
  { label: '产品文档', value: '产品文档' },
  { label: '培训资料', value: '培训资料' },
  { label: '行业报告', value: '行业报告' }
]

// 计算属性
const departments = computed(() => {
  const depts = new Set(contentStore.knowledge.map(item => item.department))
  return Array.from(depts).sort()
})

const popularTags = computed(() => {
  const tagCount: Record<string, number> = {}
  
  contentStore.knowledge.forEach(item => {
    item.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })
  
  return Object.entries(tagCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20)
})

const filteredKnowledge = computed(() => {
  let knowledge = contentStore.knowledge.filter(item => item.status === 'published')
  
  // 按分类筛选
  if (selectedCategory.value !== 'all') {
    knowledge = knowledge.filter(item => item.category === selectedCategory.value)
  }
  
  // 按部门筛选
  if (selectedDepartment.value) {
    knowledge = knowledge.filter(item => item.department === selectedDepartment.value)
  }
  
  // 按文件类型筛选
  if (fileType.value) {
    knowledge = knowledge.filter(item => item.fileType === fileType.value)
  }
  
  // 按标签筛选
  if (selectedTags.value.length > 0) {
    knowledge = knowledge.filter(item => 
      selectedTags.value.some(tag => item.tags.includes(tag))
    )
  }
  
  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    knowledge = knowledge.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.summary.toLowerCase().includes(keyword) ||
      item.author.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }
  
  // 排序
  knowledge.sort((a, b) => {
    switch (sortBy.value) {
      case 'createTime':
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      case 'updateTime':
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
      case 'readCount':
        return b.readCount - a.readCount
      case 'likeCount':
        return b.likeCount - a.likeCount
      case 'downloadCount':
        return b.downloadCount - a.downloadCount
      default:
        return 0
    }
  })
  
  return knowledge
})

const paginatedKnowledge = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredKnowledge.value.slice(start, end)
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const toggleTag = (tagName: string) => {
  const index = selectedTags.value.indexOf(tagName)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tagName)
  }
  currentPage.value = 1
}

const clearFilters = () => {
  selectedCategory.value = 'all'
  selectedDepartment.value = ''
  fileType.value = ''
  selectedTags.value = []
  searchKeyword.value = ''
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    '前端技术': 'primary',
    '后端技术': 'success',
    '管理制度': 'warning',
    '产品文档': 'info',
    '培训资料': 'danger',
    '行业报告': ''
  }
  return types[category] || 'info'
}

const getFileTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    doc: Document,
    pdf: Files,
    video: VideoCamera,
    ppt: PictureRounded,
    other: Document
  }
  return icons[type] || Document
}

const getFileTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    doc: '#409EFF',
    pdf: '#F56C6C',
    video: '#67C23A',
    ppt: '#E6A23C',
    other: '#909399'
  }
  return colors[type] || '#909399'
}

// 监听分类变化
watch(selectedCategory, () => {
  currentPage.value = 1
})

// 组件挂载时初始化数据
onMounted(async () => {
  if (contentStore.knowledge.length === 0) {
    loading.value = true
    try {
      await contentStore.fetchKnowledge()
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped lang="scss">
.knowledge-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--el-bg-color-page);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin: 0;
  }
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  .search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .filter-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    .filter-tabs {
      display: flex;
      gap: 24px;
      flex: 1;

      .filter-tab {
        padding: 8px 16px;
        cursor: pointer;
        border-radius: 6px;
        color: var(--el-text-color-regular);
        font-weight: 500;
        transition: all 0.3s;

        &:hover {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }

        &.active {
          color: var(--el-color-primary);
          background: var(--el-color-primary-light-9);
        }
      }
    }

    .filter-options {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }
}

.popular-tags {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
    margin-top: 0;
  }

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.knowledge-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 24px;

  .view-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .result-info {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .loading {
    padding: 40px 0;
  }

  .empty {
    text-align: center;
    padding: 80px 0;
  }
}

.knowledge-list {
  .knowledge-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--el-fill-color-lighter);
      border-radius: 8px;
      padding-left: 20px;
      padding-right: 20px;
    }

    &:last-child {
      border-bottom: none;
    }

    .item-icon {
      flex-shrink: 0;
      margin-top: 8px;
    }

    .item-content {
      flex: 1;
      min-width: 0;

      .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin: 0;
          margin-right: 16px;
          line-height: 1.4;
        }

        .item-badges {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
      }

      .item-summary {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.6;
        margin-bottom: 12px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .item-tags {
        margin-bottom: 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .item-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--el-text-color-secondary);

        .meta-left,
        .meta-right {
          display: flex;
          gap: 16px;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }
      }
    }
  }
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;

  .grid-item {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: var(--el-box-shadow-light);
      transform: translateY(-2px);
    }

    .grid-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .file-icon {
        padding: 8px;
        background: var(--el-fill-color-extra-light);
        border-radius: 6px;
      }
    }

    .grid-content {
      margin-bottom: 16px;

      h4 {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      p {
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .grid-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--el-text-color-secondary);
      padding-top: 16px;
      border-top: 1px solid var(--el-border-color-lighter);

      .author-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .stats {
        display: flex;
        gap: 12px;

        span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .filter-section {
    .search-bar {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
    }

    .filter-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;

      .filter-tabs {
        flex-wrap: wrap;
        gap: 12px;
      }

      .filter-options {
        flex-wrap: wrap;
      }
    }
  }

  .knowledge-content .view-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .knowledge-list .knowledge-item {
    flex-direction: column;
    
    .item-content .item-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .item-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>