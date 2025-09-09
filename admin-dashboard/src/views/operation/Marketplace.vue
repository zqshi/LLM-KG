<template>
  <div class="marketplace-page">
    <div class="page-header">
      <h1 class="page-title">跳蚤市场管理</h1>
      <div class="page-actions">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="商品总数" :value="stats.totalProducts" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="待审商品" :value="stats.pendingProducts" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="交易订单" :value="stats.totalOrders" />
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stats-card">
          <el-statistic title="纠纷订单" :value="stats.disputeOrders" />
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="商品管理" name="products">
        <div class="products-content">
          <div class="search-bar">
            <el-input
              v-model="productSearch"
              placeholder="搜索商品名称或描述"
              style="width: 300px; margin-right: 16px"
            />
            <el-select v-model="productStatus" placeholder="商品状态" style="width: 120px; margin-right: 16px">
              <el-option label="全部" value="" />
              <el-option label="待审核" value="pending" />
              <el-option label="已上架" value="active" />
              <el-option label="已下架" value="inactive" />
            </el-select>
            <el-button type="primary" @click="searchProducts">搜索</el-button>
          </div>
          
          <el-table :data="productList" style="width: 100%; margin-top: 16px">
            <el-table-column prop="title" label="商品名称" min-width="200">
              <template #default="{ row }">
                <div class="product-title">
                  <img :src="row.image" alt="" class="product-image" />
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="seller" label="卖家" width="120">
              <template #default="{ row }">
                <span>{{ row.seller.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="100">
              <template #default="{ row }">
                <span class="product-price">￥{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getProductStatusColor(row.status)" size="small">
                  {{ getProductStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="发布时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleViewProduct(row)">查看</el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  size="small"
                  type="success"
                  @click="handleApproveProduct(row)"
                >
                  通过
                </el-button>
                <el-button
                  v-if="row.status === 'active'"
                  size="small"
                  type="warning"
                  @click="handleOffshelfProduct(row)"
                >
                  下架
                </el-button>
                <el-button size="small" type="danger" @click="handleDeleteProduct(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="订单监控" name="orders">
        <div class="orders-content">
          <div class="search-bar">
            <el-input
              v-model="orderSearch"
              placeholder="搜索订单号或买家"
              style="width: 300px; margin-right: 16px"
            />
            <el-select v-model="orderStatus" placeholder="订单状态" style="width: 120px; margin-right: 16px">
              <el-option label="全部" value="" />
              <el-option label="待付款" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="有纠纷" value="dispute" />
            </el-select>
            <el-button type="primary" @click="searchOrders">搜索</el-button>
          </div>
          
          <el-table :data="orderList" style="width: 100%; margin-top: 16px">
            <el-table-column prop="orderNo" label="订单号" width="120" />
            <el-table-column prop="product" label="商品" min-width="200">
              <template #default="{ row }">
                <span>{{ row.product.title }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="buyer" label="买家" width="120">
              <template #default="{ row }">
                <span>{{ row.buyer.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="seller" label="卖家" width="120">
              <template #default="{ row }">
                <span>{{ row.seller.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="金额" width="100">
              <template #default="{ row }">
                <span class="order-amount">￥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getOrderStatusColor(row.status)" size="small">
                  {{ getOrderStatusName(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="下单时间" width="160">
              <template #default="{ row }">
                {{ formatDate(row.createdAt) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="handleViewOrder(row)">查看</el-button>
                <el-button
                  v-if="row.status === 'dispute'"
                  size="small"
                  type="warning"
                  @click="handleResolveDispute(row)"
                >
                  处理纠纷
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Download } from '@element-plus/icons-vue'

const activeTab = ref('products')
const productSearch = ref('')
const productStatus = ref('')
const orderSearch = ref('')
const orderStatus = ref('')

const stats = reactive({
  totalProducts: 1248,
  pendingProducts: 23,
  totalOrders: 856,
  disputeOrders: 5
})

const productList = ref([
  {
    id: 1,
    title: '二手iPhone 13',
    image: `${import.meta.env.VITE_API_BASE_URL}/placeholder/60/60?text=iPhone`,
    seller: { name: '张三' },
    price: 3999,
    category: '数码产品',
    status: 'active',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: '办公桌椅一套',
    image: `${import.meta.env.VITE_API_BASE_URL}/placeholder/60/60?text=桌椅`,
    seller: { name: '李四' },
    price: 500,
    category: '办公用品',
    status: 'pending',
    createdAt: '2024-01-14'
  }
])

const orderList = ref([
  {
    id: 1,
    orderNo: 'ORD20240115001',
    product: { title: '二手iPhone 13' },
    buyer: { name: '王五' },
    seller: { name: '张三' },
    amount: 3999,
    status: 'completed',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    orderNo: 'ORD20240114001',
    product: { title: '笔记本电脑' },
    buyer: { name: '赵六' },
    seller: { name: '李四' },
    amount: 2500,
    status: 'dispute',
    createdAt: '2024-01-14'
  }
])

const getProductStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待审核',
    active: '已上架',
    inactive: '已下架'
  }
  return statusMap[status] || status
}

const getProductStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    active: 'success',
    inactive: 'danger'
  }
  return colorMap[status] || 'info'
}

const getOrderStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    completed: '已完成',
    dispute: '有纠纷'
  }
  return statusMap[status] || status
}

const getOrderStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'warning',
    completed: 'success',
    dispute: 'danger'
  }
  return colorMap[status] || 'info'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const searchProducts = () => {
  ElMessage.info('搜索商品功能开发中...')
}

const searchOrders = () => {
  ElMessage.info('搜索订单功能开发中...')
}

const handleViewProduct = (product: any) => {
  ElMessage.info('查看商品详情功能开发中...')
}

const handleApproveProduct = (product: any) => {
  ElMessage.success('商品审核通过')
}

const handleOffshelfProduct = (product: any) => {
  ElMessage.success('商品已下架')
}

const handleDeleteProduct = (product: any) => {
  ElMessage.success('商品已删除')
}

const handleViewOrder = (order: any) => {
  ElMessage.info('查看订单详情功能开发中...')
}

const handleResolveDispute = (order: any) => {
  ElMessage.info('处理纠纷功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}
</script>

<style scoped>
.marketplace-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  text-align: center;
}

.products-content,
.orders-content {
  padding: 20px;
}

.search-bar {
  margin-bottom: 16px;
}

.product-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.product-price,
.order-amount {
  color: #e6a23c;
  font-weight: 600;
}
</style>