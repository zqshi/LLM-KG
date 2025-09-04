<template>
  <div class="item-detail-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/market' }">跳蚤市场</el-breadcrumb-item>
        <el-breadcrumb-item>{{ itemDetail?.title }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div v-if="itemDetail" class="item-content">
        <div class="item-main">
          <div class="item-images">
            <div class="main-image">
              <img :src="itemDetail.images[currentImageIndex]" :alt="itemDetail.title" />
            </div>
            <div v-if="itemDetail.images.length > 1" class="thumb-images">
              <div
                v-for="(image, index) in itemDetail.images"
                :key="index"
                class="thumb-item"
                :class="{ active: index === currentImageIndex }"
                @click="currentImageIndex = index"
              >
                <img :src="image" :alt="itemDetail.title" />
              </div>
            </div>
          </div>

          <div class="item-info">
            <div class="item-status">
              <el-tag :type="getStatusType(itemDetail.status)" size="large">
                {{ getStatusText(itemDetail.status) }}
              </el-tag>
            </div>
            
            <h1>{{ itemDetail.title }}</h1>
            
            <div class="price-section">
              <div class="current-price">¥{{ itemDetail.price }}</div>
              <div v-if="itemDetail.originalPrice" class="original-price">¥{{ itemDetail.originalPrice }}</div>
            </div>
            
            <div class="item-attributes">
              <div class="attribute">
                <label>成色：</label>
                <el-tag type="info" effect="plain">{{ getConditionText(itemDetail.condition) }}</el-tag>
              </div>
              <div class="attribute">
                <label>分类：</label>
                <el-tag type="primary" effect="plain">{{ itemDetail.category }}</el-tag>
              </div>
              <div class="attribute">
                <label>交易地点：</label>
                <span>{{ itemDetail.location }}</span>
              </div>
            </div>
            
            <div class="seller-info">
              <div class="seller-avatar">
                <el-avatar :size="60" :src="itemDetail.seller.avatar" />
              </div>
              <div class="seller-details">
                <div class="seller-name">{{ itemDetail.seller.name }}</div>
                <div class="seller-dept">{{ itemDetail.seller.department }}</div>
                <div class="seller-level">{{ itemDetail.seller.level }}</div>
              </div>
            </div>
            
            <div class="contact-info">
              <p><strong>联系方式：</strong>{{ itemDetail.contactInfo }}</p>
            </div>
            
            <div class="action-buttons">
              <el-button v-if="itemDetail.status === 'available'" type="primary" size="large">
                <el-icon><ChatDotRound /></el-icon>
                立即联系
              </el-button>
              <el-button @click="handleCollect">
                <el-icon><Star /></el-icon>
                收藏
              </el-button>
              <el-button @click="handleShare">
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>
        </div>

        <div class="item-description">
          <h3>商品详情</h3>
          <div class="description-content">
            {{ itemDetail.description }}
          </div>
        </div>

        <!-- 推荐商品 -->
        <div class="related-items">
          <h3>相关商品</h3>
          <div class="items-grid">
            <div
              v-for="item in relatedItems"
              :key="item.id"
              class="item-card"
              @click="$router.push(`/market/${item.id}`)"
            >
              <div class="item-image">
                <img :src="item.images[0]" :alt="item.title" />
              </div>
              <div class="item-info">
                <h4>{{ item.title }}</h4>
                <div class="price">¥{{ item.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { MarketItem } from '@/types'
import { ChatDotRound, Star, Share } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const contentStore = useContentStore()

const itemDetail = ref<MarketItem | null>(null)
const currentImageIndex = ref(0)

const relatedItems = computed(() => {
  if (!itemDetail.value) return []
  return contentStore.marketItems
    .filter(item => 
      item.id !== itemDetail.value?.id && 
      item.status === 'available' &&
      (item.category === itemDetail.value?.category ||
       item.seller.department === itemDetail.value?.seller.department)
    )
    .slice(0, 4)
})

const fetchItemDetail = async (id: string) => {
  await contentStore.fetchMarketItems()
  const item = contentStore.marketItems.find(item => item.id === id)
  if (item) {
    itemDetail.value = item
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

const handleCollect = () => {
  ElMessage.success('收藏成功')
}

const handleShare = () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  })
}

onMounted(() => {
  const id = route.params.id as string
  if (id) {
    fetchItemDetail(id)
  }
})
</script>

<style scoped lang="scss">
.item-detail-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 24px;
}

.item-content {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden;
}

.item-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  padding: 40px;

  .item-images {
    .main-image {
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 16px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .thumb-images {
      display: flex;
      gap: 8px;

      .thumb-item {
        width: 80px;
        height: 80px;
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        border: 2px solid transparent;

        &.active {
          border-color: var(--el-color-primary);
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }
  }

  .item-info {
    .item-status {
      margin-bottom: 16px;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--el-text-color-primary);
      margin-bottom: 20px;
    }

    .price-section {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 24px;

      .current-price {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-color-danger);
      }

      .original-price {
        font-size: 18px;
        color: var(--el-text-color-secondary);
        text-decoration: line-through;
      }
    }

    .item-attributes {
      margin-bottom: 24px;

      .attribute {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;

        label {
          font-weight: 500;
          color: var(--el-text-color-primary);
          min-width: 80px;
        }
      }
    }

    .seller-info {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 20px;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;
      margin-bottom: 24px;

      .seller-details {
        .seller-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .seller-dept {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin: 4px 0;
        }

        .seller-level {
          font-size: 12px;
          background: var(--el-color-primary);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          display: inline-block;
        }
      }
    }

    .contact-info {
      margin-bottom: 24px;
      padding: 16px;
      background: var(--el-fill-color-light);
      border-radius: 6px;

      p {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }
}

.item-description {
  padding: 40px;
  border-top: 1px solid var(--el-border-color-lighter);

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
  }

  .description-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--el-text-color-regular);
  }
}

.related-items {
  padding: 40px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-extra-light);

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 20px;
  }

  .items-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .item-card {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s;
    background: white;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: var(--el-box-shadow-light);
      transform: translateY(-2px);
    }

    .item-image {
      height: 150px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .item-info {
      padding: 12px;

      h4 {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .price {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-color-danger);
      }
    }
  }
}

@media (max-width: 768px) {
  .item-main {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px 20px;
  }

  .item-description,
  .related-items {
    padding: 24px 20px;
  }

  .related-items .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>