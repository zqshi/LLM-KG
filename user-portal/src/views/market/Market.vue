<template>
  <div class="market-page">
    <div class="container">
      <div class="page-header">
        <h1>跳蚤市场</h1>
        <p>员工二手交易平台，让闲置物品重获价值</p>
        <el-button type="primary" size="large" @click="$router.push('/market/publish')">
          <el-icon><Plus /></el-icon>
          发布商品
        </el-button>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="search-controls">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品名称..."
            :prefix-icon="Search"
            clearable
            @input="handleSearch"
            style="width: 300px"
          />
          <div class="filter-options">
            <el-select v-model="selectedCategory" placeholder="分类" clearable style="width: 120px" @change="handleFilter">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
            <el-select v-model="priceRange" placeholder="价格区间" clearable style="width: 120px" @change="handleFilter">
              <el-option label="100以下" value="0-100" />
              <el-option label="100-500" value="100-500" />
              <el-option label="500-1000" value="500-1000" />
              <el-option label="1000以上" value="1000+" />
            </el-select>
            <el-select v-model="condition" placeholder="成色" clearable style="width: 100px" @change="handleFilter">
              <el-option label="全新" value="new" />
              <el-option label="9成新" value="like-new" />
              <el-option label="8成新" value="good" />
              <el-option label="7成新" value="fair" />
            </el-select>
            <el-select v-model="sortBy" placeholder="排序" style="width: 120px" @change="handleSort">
              <el-option label="最新发布" value="createTime" />
              <el-option label="价格从低到高" value="price-asc" />
              <el-option label="价格从高到低" value="price-desc" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 商品网格 -->
      <div class="market-content">
        <div v-if="loading" class="loading">
          <el-skeleton :rows="4" animated />
        </div>
        
        <div v-else-if="filteredItems.length === 0" class="empty">
          <el-empty description="暂无商品">
            <el-button type="primary" @click="clearFilters">清除筛选条件</el-button>
          </el-empty>
        </div>
        
        <div v-else>
          <div class="result-info">
            共找到 {{ filteredItems.length }} 件商品
          </div>
          
          <div class="items-grid">
            <div
              v-for="item in paginatedItems"
              :key="item.id"
              class="item-card"
              @click="$router.push(`/market/${item.id}`)"
            >
              <div class="item-image">
                <img :src="item.images[0]" :alt="item.title" />
                <div class="item-status">
                  <el-tag :type="getStatusType(item.status)" size="small">
                    {{ getStatusText(item.status) }}
                  </el-tag>
                </div>
              </div>
              
              <div class="item-info">
                <h4>{{ item.title }}</h4>
                <p class="item-description">{{ item.description }}</p>
                
                <div class="price-info">
                  <span class="current-price">¥{{ item.price }}</span>
                  <span v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</span>
                </div>
                
                <div class="item-meta">
                  <div class="seller-info">
                    <el-avatar :size="20" :src="item.seller.avatar" />
                    <span>{{ item.seller.name }}</span>
                  </div>
                  <span class="publish-time">{{ formatTime(item.createTime) }}</span>
                </div>
                
                <div class="item-tags">
                  <el-tag size="small" effect="plain">{{ item.category }}</el-tag>
                  <el-tag size="small" type="info" effect="plain">{{ getConditionText(item.condition) }}</el-tag>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pagination">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="filteredItems.length"
              layout="total, prev, pager, next"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useContentStore } from '@/stores/content'
import { Search, Plus } from '@element-plus/icons-vue'

const contentStore = useContentStore()

const searchKeyword = ref('')
const selectedCategory = ref('')
const priceRange = ref('')
const condition = ref('')
const sortBy = ref('createTime')
const currentPage = ref(1)
const pageSize = ref(12)
const loading = ref(false)

const categories = ['数码产品', '家具家电', '服装配饰', '图书文具', '运动健身', '其他']

const filteredItems = computed(() => {
  let items = contentStore.marketItems.filter(item => item.status === 'available')
  
  if (selectedCategory.value) {
    items = items.filter(item => item.category === selectedCategory.value)
  }
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    items = items.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  if (priceRange.value) {
    items = items.filter(item => {
      const price = item.price
      switch (priceRange.value) {
        case '0-100': return price < 100
        case '100-500': return price >= 100 && price < 500
        case '500-1000': return price >= 500 && price < 1000
        case '1000+': return price >= 1000
        default: return true
      }
    })
  }
  
  if (condition.value) {
    items = items.filter(item => item.condition === condition.value)
  }
  
  // 排序
  items.sort((a, b) => {
    switch (sortBy.value) {
      case 'createTime':
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      default:
        return 0
    }
  })
  
  return items
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredItems.value.slice(start, end)
})

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const clearFilters = () => {
  selectedCategory.value = ''
  priceRange.value = ''
  condition.value = ''
  searchKeyword.value = ''
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatTime = (time: string) => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    available: 'success',
    sold: 'info',
    reserved: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: '在售',
    sold: '已售',
    reserved: '预定'
  }
  return texts[status] || status
}

const getConditionText = (condition: string) => {
  const texts: Record<string, string> = {
    new: '全新',
    'like-new': '9成新',
    good: '8成新',
    fair: '7成新'
  }
  return texts[condition] || condition
}

onMounted(async () => {
  if (contentStore.marketItems.length === 0) {
    loading.value = true
    try {
      await contentStore.fetchMarketItems()
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped lang="scss">
.market-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--el-bg-color-page);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    color: var(--el-text-color-regular);
    margin-bottom: 24px;
  }

  .el-button {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}

.filter-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);

  .search-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-options {
      display: flex;
      gap: 12px;
    }
  }
}

.market-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 24px;

  .loading {
    padding: 40px 0;
  }

  .empty {
    text-align: center;
    padding: 80px 0;
  }

  .result-info {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }
}

.item-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: var(--el-box-shadow-light);
    transform: translateY(-2px);
  }

  .item-image {
    position: relative;
    height: 200px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-status {
      position: absolute;
      top: 8px;
      right: 8px;
    }
  }

  .item-info {
    padding: 16px;

    h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item-description {
      font-size: 14px;
      color: var(--el-text-color-regular);
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .price-info {
      margin-bottom: 12px;

      .current-price {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-color-danger);
        margin-right: 8px;
      }

      .original-price {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        text-decoration: line-through;
      }
    }

    .item-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 12px;
      color: var(--el-text-color-secondary);

      .seller-info {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .item-tags {
      display: flex;
      gap: 8px;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .page-header {
    .el-button {
      position: static;
      transform: none;
      margin-top: 16px;
    }
  }

  .filter-section .search-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .filter-options {
      flex-wrap: wrap;
    }
  }

  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
</style>