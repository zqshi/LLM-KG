<template>
  <div class="goods-detail-dialog">
    <!-- 商品基本信息 -->
    <div class="goods-basic-info">
      <div class="goods-images">
        <el-carousel 
          v-if="goods.images && goods.images.length > 0" 
          height="300px"
          indicator-position="outside"
        >
          <el-carousel-item v-for="image in goods.images" :key="image.id">
            <el-image
              :src="image.url"
              fit="contain"
              style="width: 100%; height: 100%"
              :preview-src-list="goods.images.map(img => img.url)"
            />
          </el-carousel-item>
        </el-carousel>
        <div v-else class="no-image-placeholder">
          <el-icon size="64"><Picture /></el-icon>
          <p>暂无图片</p>
        </div>
      </div>
      
      <div class="goods-info">
        <div class="goods-header">
          <h2 class="goods-title">{{ goods.title }}</h2>
          <div class="goods-status">
            <el-tag :type="getStatusType(goods.status)" size="large">
              {{ getStatusText(goods.status) }}
            </el-tag>
          </div>
        </div>
        
        <div class="goods-price">
          <span class="price">¥{{ goods.price }}</span>
          <el-tag 
            :type="getConditionType(goods.condition)" 
            size="small"
            style="margin-left: 8px"
          >
            {{ getConditionText(goods.condition) }}
          </el-tag>
        </div>
        
        <div class="goods-meta">
          <div class="meta-item">
            <span class="label">分类：</span>
            <span class="value">{{ goods.category?.name || '未知分类' }}</span>
          </div>
          <div class="meta-item">
            <span class="label">交易方式：</span>
            <span class="value">{{ getTransactionMethodText(goods.transactionMethod) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">浏览次数：</span>
            <span class="value">{{ goods.viewCount }}</span>
          </div>
          <div class="meta-item">
            <span class="label">点赞次数：</span>
            <span class="value">{{ goods.likeCount }}</span>
          </div>
          <div class="meta-item">
            <span class="label">发布时间：</span>
            <span class="value">{{ formatDateTime(goods.createTime) }}</span>
          </div>
          <div class="meta-item">
            <span class="label">更新时间：</span>
            <span class="value">{{ formatDateTime(goods.updateTime) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 商品描述 -->
    <div class="goods-description">
      <h3>商品描述</h3>
      <div class="description-content">
        {{ goods.description || '暂无描述' }}
      </div>
    </div>
    
    <!-- 卖家信息 -->
    <div class="seller-info-section">
      <h3>卖家信息</h3>
      <div class="seller-card">
        <el-avatar :size="60" :src="goods.seller?.avatar">
          {{ goods.seller?.name?.charAt(0) }}
        </el-avatar>
        <div class="seller-details">
          <div class="seller-name">{{ goods.seller?.name || '未知用户' }}</div>
          <div class="seller-meta">
            <span>邮箱：{{ goods.seller?.email || '未知' }}</span>
            <span v-if="goods.seller?.phone">电话：{{ goods.seller.phone }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 相关商品推荐 -->
    <div v-if="goods.relatedGoods && goods.relatedGoods.length > 0" class="related-goods">
      <h3>相关商品</h3>
      <div class="related-goods-list">
        <div 
          v-for="item in goods.relatedGoods" 
          :key="item.id" 
          class="related-goods-item"
          @click="$emit('viewRelated', item)"
        >
          <el-image
            v-if="item.images && item.images.length > 0"
            :src="item.images[0].url"
            fit="cover"
            style="width: 80px; height: 80px; border-radius: 4px"
          />
          <div v-else class="related-no-image">
            <el-icon><Picture /></el-icon>
          </div>
          <div class="related-info">
            <div class="related-title">{{ item.title }}</div>
            <div class="related-price">¥{{ item.price }}</div>
            <el-tag size="small" :type="getStatusType(item.status)">
              {{ getStatusText(item.status) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 聊天会话 -->
    <div v-if="goods.chatSessions && goods.chatSessions.length > 0" class="chat-sessions">
      <h3>咨询记录</h3>
      <div class="chat-sessions-list">
        <div 
          v-for="session in goods.chatSessions" 
          :key="session.id" 
          class="chat-session-item"
        >
          <el-avatar :size="40" :src="session.buyer?.avatar">
            {{ session.buyer?.name?.charAt(0) }}
          </el-avatar>
          <div class="session-info">
            <div class="session-user">{{ session.buyer?.name }}</div>
            <div class="session-time">{{ formatDateTime(session.createTime) }}</div>
          </div>
          <el-button 
            type="primary" 
            link 
            @click="$emit('viewChat', session)"
          >
            查看对话
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FleaGoodsDetail } from '@/types'

// Props
interface Props {
  goods: FleaGoodsDetail
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  viewRelated: [goods: any]
  viewChat: [session: any]
}>()

// 工具方法
const getStatusType = (status: string): string => {
  const typeMap: Record<string, string> = {
    'under_review': 'warning',
    'published': 'success',
    'offline': 'info',
    'sold': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string): string => {
  const textMap: Record<string, string> = {
    'under_review': '待审核',
    'published': '已发布',
    'offline': '已下架',
    'sold': '已售出'
  }
  return textMap[status] || '未知'
}

const getConditionType = (condition: string): string => {
  const typeMap: Record<string, string> = {
    'new': 'success',
    'almost_new': 'warning',
    'old': 'info'
  }
  return typeMap[condition] || 'info'
}

const getConditionText = (condition: string): string => {
  const textMap: Record<string, string> = {
    'new': '全新',
    'almost_new': '几乎全新',
    'old': '二手'
  }
  return textMap[condition] || '未知'
}

const getTransactionMethodText = (method: string): string => {
  const textMap: Record<string, string> = {
    'self_pickup': '自提',
    'meetup': '当面交易'
  }
  return textMap[method] || '未知'
}

const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.goods-detail-dialog {
  max-height: 70vh;
  overflow-y: auto;
}

.goods-basic-info {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.goods-images {
  flex: 1;
  max-width: 400px;
}

.no-image-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-section);
  border-radius: 8px;
  color: var(--color-text-disabled);
}

.goods-info {
  flex: 1;
  min-width: 0;
}

.goods-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.goods-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  flex: 1;
  margin-right: 16px;
}

.goods-price {
  margin-bottom: 20px;
}

.price {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-danger);
}

.goods-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.meta-item {
  display: flex;
}

.meta-item .label {
  color: var(--color-text-tertiary);
  width: 80px;
  flex-shrink: 0;
}

.meta-item .value {
  color: var(--color-text-primary);
  font-weight: 500;
}

.goods-description {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--color-bg-section);
  border-radius: 8px;
}

.goods-description h3 {
  margin: 0 0 12px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.description-content {
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
}

.seller-info-section {
  margin-bottom: 24px;
}

.seller-info-section h3 {
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.seller-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-bg-section);
  border-radius: 8px;
}

.seller-details {
  flex: 1;
}

.seller-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.seller-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.related-goods {
  margin-bottom: 24px;
}

.related-goods h3 {
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.related-goods-list {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.related-goods-item {
  display: flex;
  gap: 12px;
  min-width: 280px;
  padding: 12px;
  background: var(--color-bg-section);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-medium);
}

.related-goods-item:hover {
  background: var(--color-primary-light);
}

.related-no-image {
  width: 80px;
  height: 80px;
  background: var(--color-bg-card);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-disabled);
}

.related-info {
  flex: 1;
  min-width: 0;
}

.related-title {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.related-price {
  font-weight: 600;
  color: var(--color-danger);
  margin-bottom: 8px;
}

.chat-sessions h3 {
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.chat-sessions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg-section);
  border-radius: 8px;
}

.session-info {
  flex: 1;
}

.session-user {
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.session-time {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

@media (max-width: 768px) {
  .goods-basic-info {
    flex-direction: column;
  }
  
  .goods-meta {
    grid-template-columns: 1fr;
  }
  
  .goods-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .related-goods-list {
    flex-direction: column;
  }
  
  .related-goods-item {
    min-width: auto;
  }
}
</style>