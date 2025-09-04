<template>
  <div class="goods-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">商品管理</h1>
        <p class="page-subtitle">管理跳蚤市场中的所有商品信息</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品标题、描述"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.categoryId" placeholder="选择分类" clearable style="width: 150px">
            <el-option
              v-for="category in categoryList"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="待审核" value="under_review" />
            <el-option label="已发布" value="published" />
            <el-option label="已下架" value="offline" />
            <el-option label="已售出" value="sold" />
          </el-select>
        </el-form-item>
        <el-form-item label="新旧程度">
          <el-select v-model="searchForm.condition" placeholder="选择新旧程度" clearable style="width: 120px">
            <el-option label="全新" value="new" />
            <el-option label="几乎全新" value="almost_new" />
            <el-option label="二手" value="old" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格范围">
          <el-input-number
            v-model="searchForm.priceMin"
            :min="0"
            :max="99999"
            placeholder="最低价"
            style="width: 120px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input-number
            v-model="searchForm.priceMax"
            :min="0"
            :max="99999"
            placeholder="最高价"
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card class="table-card">
      <!-- 表格操作栏 -->
      <div class="table-operations">
        <div class="table-operations-left">
          <el-button
            type="danger"
            :disabled="!selectedGoodsIds.length"
            @click="handleBatchOffline"
          >
            <el-icon><Delete /></el-icon>
            批量下架
          </el-button>
          <el-button
            type="success"
            :disabled="!selectedGoodsIds.length"
            @click="handleBatchApprove"
          >
            <el-icon><Check /></el-icon>
            批量审核通过
          </el-button>
          <el-button
            type="warning"
            :disabled="!selectedGoodsIds.length"
            @click="handleBatchReject"
          >
            <el-icon><Close /></el-icon>
            批量审核拒绝
          </el-button>
        </div>
        <div class="table-operations-right">
          <span>已选 {{ selectedGoodsIds.length }} 项</span>
          <el-divider direction="vertical" />
          <span>共 {{ goodsTotal }} 条数据</span>
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        ref="tableRef"
        v-loading="goodsLoading"
        :data="goodsList"
        class="data-table"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="goods-info">
              <div class="goods-image">
                <el-image
                  v-if="row.images && row.images.length > 0"
                  :src="row.images[0].url"
                  :preview-src-list="row.images.map(img => img.url)"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 4px"
                />
                <div v-else class="no-image">
                  <el-icon><Picture /></el-icon>
                </div>
              </div>
              <div class="goods-details">
                <div class="goods-title">{{ row.title }}</div>
                <div class="goods-desc">{{ row.description || '暂无描述' }}</div>
                <div class="goods-meta">
                  <el-tag size="small" type="info">{{ getCategoryName(row.categoryId) }}</el-tag>
                  <el-tag size="small" :type="getConditionType(row.condition)">{{ getConditionText(row.condition) }}</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" prop="price" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="卖家" width="120">
          <template #default="{ row }">
            <div class="seller-info">
              <el-avatar :size="32" :src="row.seller?.avatar" />
              <span>{{ row.seller?.name || '未知用户' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="浏览/点赞" width="100">
          <template #default="{ row }">
            <div class="stats">
              <div><el-icon><View /></el-icon> {{ row.viewCount }}</div>
              <div><el-icon><StarFilled /></el-icon> {{ row.likeCount }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleViewDetail(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              
              <template v-if="row.status === 'under_review'">
                <el-button link type="success" @click="handleApprove(row)">
                  <el-icon><Check /></el-icon>
                  通过
                </el-button>
                <el-button link type="danger" @click="handleReject(row)">
                  <el-icon><Close /></el-icon>
                  拒绝
                </el-button>
              </template>
              
              <template v-else-if="row.status === 'published'">
                <el-button link type="warning" @click="handleOffline(row)">
                  <el-icon><Delete /></el-icon>
                  下架
                </el-button>
                <el-button link type="info" @click="handleMarkSold(row)">
                  <el-icon><Check /></el-icon>
                  标记售出
                </el-button>
              </template>
              
              <template v-else-if="row.status === 'offline'">
                <el-button link type="success" @click="handlePublish(row)">
                  <el-icon><Upload /></el-icon>
                  上架
                </el-button>
              </template>
              
              <el-dropdown trigger="click">
                <el-button link type="info">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleEdit(row)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDelete(row)" divided>
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="goodsTotal"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 商品详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="商品详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <GoodsDetailDialog
        v-if="detailDialogVisible && currentGoods"
        :goods="currentGoods"
        @close="detailDialogVisible = false"
      />
    </el-dialog>

    <!-- 审核拒绝对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="审核拒绝"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝理由" required>
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝理由..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFleaMarketStore } from '@/stores/fleaMarket'
import type { FleaGoods, FleaGoodsQueryParams } from '@/types'
import GoodsDetailDialog from './components/GoodsDetailDialog.vue'

// Store
const fleaMarketStore = useFleaMarketStore()

// 响应式数据
const tableRef = ref()
const detailDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const currentRejectGoods = ref<FleaGoods | null>(null)

// 搜索表单
const searchForm = reactive<FleaGoodsQueryParams>({
  keyword: '',
  categoryId: undefined,
  status: undefined,
  condition: undefined,
  priceMin: undefined,
  priceMax: undefined,
  page: 1,
  pageSize: 20
})

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 20
})

// 拒绝表单
const rejectForm = reactive({
  reason: ''
})

// 计算属性
const goodsList = computed(() => fleaMarketStore.goodsList)
const goodsTotal = computed(() => fleaMarketStore.goodsTotal)
const goodsLoading = computed(() => fleaMarketStore.goodsLoading)
const selectedGoodsIds = computed(() => fleaMarketStore.selectedGoodsIds)
const categoryList = computed(() => fleaMarketStore.categoryList)
const currentGoods = computed(() => fleaMarketStore.currentGoods)

// 生命周期
onMounted(() => {
  loadData()
  fleaMarketStore.fetchCategoryList()
})

// 方法
const loadData = () => {
  const params = {
    ...searchForm,
    page: pagination.page,
    pageSize: pagination.pageSize
  }
  fleaMarketStore.fetchGoodsList(params)
}

const refreshData = () => {
  pagination.page = 1
  loadData()
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    categoryId: undefined,
    status: undefined,
    condition: undefined,
    priceMin: undefined,
    priceMax: undefined
  })
  pagination.page = 1
  loadData()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  loadData()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadData()
}

const handleSelectionChange = (selection: FleaGoods[]) => {
  fleaMarketStore.setSelectedGoods(selection)
}

const handleViewDetail = async (goods: FleaGoods) => {
  try {
    await fleaMarketStore.fetchGoodsDetail(goods.id)
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取商品详情失败:', error)
  }
}

const handleApprove = async (goods: FleaGoods) => {
  try {
    await ElMessageBox.confirm('确认审核通过该商品吗？', '确认操作', {
      type: 'success'
    })
    await fleaMarketStore.approveGoods(goods.id)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('审核通过失败:', error)
    }
  }
}

const handleReject = (goods: FleaGoods) => {
  currentRejectGoods.value = goods
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason.trim()) {
    ElMessage.warning('请输入拒绝理由')
    return
  }
  
  try {
    await fleaMarketStore.rejectGoods(currentRejectGoods.value!.id, rejectForm.reason)
    rejectDialogVisible.value = false
    loadData()
  } catch (error) {
    console.error('审核拒绝失败:', error)
  }
}

const handlePublish = async (goods: FleaGoods) => {
  try {
    await ElMessageBox.confirm('确认上架该商品吗？', '确认操作', {
      type: 'success'
    })
    await fleaMarketStore.publishGoods(goods.id)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('上架失败:', error)
    }
  }
}

const handleOffline = async (goods: FleaGoods) => {
  try {
    await ElMessageBox.confirm('确认下架该商品吗？', '确认操作', {
      type: 'warning'
    })
    await fleaMarketStore.offlineGoods(goods.id)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下架失败:', error)
    }
  }
}

const handleMarkSold = async (goods: FleaGoods) => {
  try {
    await ElMessageBox.confirm('确认标记该商品为已售出吗？', '确认操作', {
      type: 'info'
    })
    await fleaMarketStore.markGoodsAsSold(goods.id)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('标记售出失败:', error)
    }
  }
}

const handleEdit = (goods: FleaGoods) => {
  // TODO: 实现编辑功能
  ElMessage.info('编辑功能开发中...')
}

const handleDelete = async (goods: FleaGoods) => {
  try {
    await ElMessageBox.confirm('确认删除该商品吗？删除后不可恢复', '危险操作', {
      type: 'error'
    })
    await fleaMarketStore.deleteGoods(goods.id)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const handleBatchApprove = async () => {
  try {
    await ElMessageBox.confirm(`确认批量审核通过选中的 ${selectedGoodsIds.value.length} 个商品吗？`, '批量操作', {
      type: 'success'
    })
    await fleaMarketStore.batchOperateGoods({
      goodsIds: selectedGoodsIds.value,
      operation: 'approve'
    })
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量审核通过失败:', error)
    }
  }
}

const handleBatchReject = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝理由', '批量审核拒绝', {
      inputType: 'textarea'
    })
    await fleaMarketStore.batchOperateGoods({
      goodsIds: selectedGoodsIds.value,
      operation: 'reject',
      params: { reason }
    })
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量审核拒绝失败:', error)
    }
  }
}

const handleBatchOffline = async () => {
  try {
    await ElMessageBox.confirm(`确认批量下架选中的 ${selectedGoodsIds.value.length} 个商品吗？`, '批量操作', {
      type: 'warning'
    })
    await fleaMarketStore.batchOperateGoods({
      goodsIds: selectedGoodsIds.value,
      operation: 'offline'
    })
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量下架失败:', error)
    }
  }
}

const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

// 工具方法
const getCategoryName = (categoryId: number): string => {
  const category = categoryList.value.find(c => c.id === categoryId)
  return category?.name || '未知分类'
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

const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.goods-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: var(--color-text-tertiary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.table-card {
  border-radius: 8px;
}

.table-operations {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-lighter);
}

.table-operations-left {
  display: flex;
  gap: 8px;
}

.table-operations-right {
  display: flex;
  align-items: center;
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.data-table {
  margin: 16px 0;
}

.goods-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.goods-image .no-image {
  width: 60px;
  height: 60px;
  background: var(--color-bg-section);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-disabled);
  font-size: 24px;
}

.goods-details {
  flex: 1;
  min-width: 0;
}

.goods-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-desc {
  color: var(--color-text-tertiary);
  font-size: 13px;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-meta {
  display: flex;
  gap: 4px;
}

.price {
  font-weight: 600;
  color: var(--color-danger);
  font-size: 16px;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.seller-info span {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.stats div {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid var(--color-border-lighter);
}

@media (max-width: 768px) {
  .goods-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-operations {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .goods-info {
    flex-direction: column;
  }
  
  .action-buttons {
    justify-content: flex-start;
  }
}
</style>
