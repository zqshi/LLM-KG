<template>
  <div class="audit-page">
    <UnifiedPageHeader 
      title="审核中心" 
      description="审核待发布内容，管理内容质量和发布流程"
    >
      <template #actions>
        <el-badge :value="auditStats.pending" type="warning">
          <el-button type="primary" @click="handleQuickAudit">
            <el-icon><View /></el-icon>
            快速审核
          </el-button>
        </el-badge>
      </template>
    </UnifiedPageHeader>

    <!-- 审核统计 -->
    <el-row :gutter="16" class="audit-stats">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ auditStats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon approved">
              <el-icon><Select /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ auditStats.approved }}</div>
              <div class="stat-label">今日通过</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon rejected">
              <el-icon><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ auditStats.rejected }}</div>
              <div class="stat-label">今日拒绝</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon efficiency">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ auditStats.efficiency }}%</div>
              <div class="stat-label">审核效率</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选条件 -->
    <div class="search-form">
      <el-form :model="searchForm" :inline="true">
        <el-form-item label="内容类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="文章" value="article" />
            <el-option label="帖子" value="post" />
            <el-option label="红黑榜" value="ranking" />
            <el-option label="商品" value="product" />
            <el-option label="名言" value="quote" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="审核状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable>
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 审核列表 -->
    <div class="audit-list">
      <div class="list-header">
        <div class="header-left">
          <el-checkbox
            v-model="selectAll"
            @change="handleSelectAll"
            :indeterminate="indeterminate"
          >
            全选
          </el-checkbox>
          <el-button
            type="success"
            :disabled="selectedItems.length === 0"
            @click="handleBatchApprove"
          >
            批量通过
          </el-button>
          <el-button
            type="danger"
            :disabled="selectedItems.length === 0"
            @click="handleBatchReject"
          >
            批量拒绝
          </el-button>
        </div>
        
        <div class="header-right">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="list">列表视图</el-radio-button>
            <el-radio-button value="card">卡片视图</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 列表视图 -->
      <el-table
        v-if="viewMode === 'list'"
        :data="auditList"
        @selection-change="handleSelectionChange"
        stripe
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="内容信息" min-width="300">
          <template #default="{ row }">
            <div class="content-info">
              <div class="content-header">
                <el-tag :type="getTypeColor(row.content.type)" size="small">
                  {{ getTypeName(row.content.type) }}
                </el-tag>
                <span class="content-title">{{ row.content.title }}</span>
              </div>
              <div class="content-meta">
                <span class="author">作者：{{ row.content.author.nickname }}</span>
                <span class="category">分类：{{ row.content.category }}</span>
                <span class="time">提交：{{ formatTime(row.createdAt) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="内容预览" width="200">
          <template #default="{ row }">
            <div class="content-preview" @click="handlePreview(row)">
              <el-button type="primary" link>
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="风险等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getRiskColor(row.riskLevel)" size="small">
              {{ getRiskName(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="AI评分" width="100">
          <template #default="{ row }">
            <div class="ai-score">
              <el-progress
                :percentage="row.aiScore"
                :color="getScoreColor(row.aiScore)"
                :stroke-width="6"
                text-inside
              />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="审核操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="audit-actions">
              <el-button
                type="success"
                size="small"
                @click="handleApprove(row)"
              >
                通过
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleReject(row)"
              >
                拒绝
              </el-button>
              <el-button
                size="small"
                @click="handleRevise(row)"
              >
                打回修改
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <div
          v-for="item in auditList"
          :key="item.id"
          class="audit-card"
          :class="{ selected: selectedItems.includes(item) }"
        >
          <div class="card-header">
            <el-checkbox
              :model-value="selectedItems.includes(item)"
              @change="(checked) => handleItemSelect(item, checked)"
            />
            <el-tag :type="getTypeColor(item.content.type)" size="small">
              {{ getTypeName(item.content.type) }}
            </el-tag>
            <el-tag :type="getRiskColor(item.riskLevel)" size="small">
              {{ getRiskName(item.riskLevel) }}
            </el-tag>
          </div>
          
          <div class="card-content">
            <h4 class="card-title" @click="handlePreview(item)">
              {{ item.content.title }}
            </h4>
            <div class="card-meta">
              <div class="meta-item">
                <el-avatar :size="20" :src="item.content.author.avatar">
                  {{ item.content.author.nickname.charAt(0) }}
                </el-avatar>
                <span>{{ item.content.author.nickname }}</span>
              </div>
              <div class="meta-item">
                <el-icon><FolderOpened /></el-icon>
                <span>{{ item.content.category }}</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ formatTime(item.createdAt) }}</span>
              </div>
            </div>
            
            <div class="ai-analysis">
              <div class="ai-score-card">
                <span class="score-label">AI评分</span>
                <el-progress
                  :percentage="item.aiScore"
                  :color="getScoreColor(item.aiScore)"
                  :stroke-width="4"
                />
              </div>
              <div class="risk-tags" v-if="item.riskTags.length">
                <el-tag
                  v-for="tag in item.riskTags"
                  :key="tag"
                  type="warning"
                  size="small"
                  class="risk-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
          
          <div class="card-actions">
            <el-button
              type="success"
              size="small"
              @click="handleApprove(item)"
            >
              通过
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleReject(item)"
            >
              拒绝
            </el-button>
            <el-button
              size="small"
              @click="handleRevise(item)"
            >
              打回修改
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 审核详情对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="currentItem?.content.title"
      width="800px"
      top="5vh"
    >
      <div v-if="currentItem" class="preview-content">
        <div class="preview-meta">
          <div class="meta-row">
            <span class="meta-label">作者：</span>
            <span>{{ currentItem.content.author.nickname }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">类型：</span>
            <el-tag :type="getTypeColor(currentItem.content.type)" size="small">
              {{ getTypeName(currentItem.content.type) }}
            </el-tag>
          </div>
          <div class="meta-row">
            <span class="meta-label">分类：</span>
            <span>{{ currentItem.content.category }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">提交时间：</span>
            <span>{{ formatDateTime(currentItem.createdAt) }}</span>
          </div>
        </div>
        
        <div class="content-body">
          <h4>内容正文：</h4>
          <div class="content-text">
            {{ currentItem.content.content || '内容预览...' }}
          </div>
        </div>
        
        <div class="ai-analysis-detail" v-if="currentItem.aiAnalysis">
          <h4>AI分析报告：</h4>
          <div class="analysis-content">
            <p><strong>风险等级：</strong>{{ getRiskName(currentItem.riskLevel) }}</p>
            <p><strong>综合评分：</strong>{{ currentItem.aiScore }}分</p>
            <p><strong>分析结果：</strong>{{ currentItem.aiAnalysis }}</p>
            <div v-if="currentItem.riskTags.length" class="risk-tags-detail">
              <p><strong>风险标签：</strong></p>
              <el-tag
                v-for="tag in currentItem.riskTags"
                :key="tag"
                type="warning"
                size="small"
                class="risk-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="previewDialogVisible = false">关闭</el-button>
        <el-button type="success" @click="handleApprove(currentItem)">通过</el-button>
        <el-button type="warning" @click="handleRevise(currentItem)">打回修改</el-button>
        <el-button type="danger" @click="handleReject(currentItem)">拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 拒绝理由对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="审核拒绝" width="500px">
      <el-form label-width="80px">
        <el-form-item label="拒绝理由" required>
          <el-input
            v-model="rejectReason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝理由..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject" :loading="auditLoading">
          确认拒绝
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import type { AuditRecord, Content, PaginationParams } from '@/types'
import {
  View, Clock, Select, Close, TrendCharts,
  FolderOpened
} from '@element-plus/icons-vue'

interface AuditItem extends AuditRecord {
  riskLevel: 'low' | 'medium' | 'high'
  aiScore: number
  aiAnalysis: string
  riskTags: string[]
}

const searchForm = reactive({
  type: '',
  status: 'pending'
})

const dateRange = ref<[string, string] | null>(null)
const viewMode = ref<'list' | 'card'>('list')
const previewDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')
const auditLoading = ref(false)
const currentItem = ref<AuditItem | null>(null)

const pagination = reactive<PaginationParams>({
  page: 1,
  pageSize: 20,
  total: 0
})

const auditList = ref<AuditItem[]>([])
const selectedItems = ref<AuditItem[]>([])

const auditStats = ref({
  pending: 23,
  approved: 156,
  rejected: 12,
  efficiency: 92
})

const selectAll = computed({
  get: () => selectedItems.value.length === auditList.value.length && auditList.value.length > 0,
  set: (val: boolean) => {
    if (val) {
      selectedItems.value = [...auditList.value]
    } else {
      selectedItems.value = []
    }
  }
})

const indeterminate = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.length < auditList.value.length
})

const mockAuditData = (): AuditItem[] => [
  {
    id: 1,
    contentId: 1,
    content: {
      id: 1,
      title: '如何提高团队协作效率的几点思考',
      type: 'article',
      category: '管理经验',
      author: {
        id: 2,
        username: 'zhangsan',
        nickname: '张三',
        email: 'zhangsan@company.com',
        department: '产品部',
        status: 'active',
        roles: [],
        createdAt: '',
        updatedAt: ''
      },
      status: 'pending',
      content: '团队协作是现代企业成功的关键因素之一。通过多年的管理实践，我总结了以下几点经验...',
      tags: [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isTop: false,
      isRecommended: false,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    auditorId: 0,
    auditor: { id: 0, username: '', nickname: '', email: '', department: '', status: 'active', roles: [], createdAt: '', updatedAt: '' },
    action: 'approve',
    createdAt: '2024-01-15T10:30:00Z',
    riskLevel: 'low',
    aiScore: 85,
    aiAnalysis: '内容积极正面，符合企业文化价值观，建议通过审核。',
    riskTags: []
  },
  {
    id: 2,
    contentId: 2,
    content: {
      id: 2,
      title: '年度优秀员工推荐 - 技术部某员工表现突出',
      type: 'ranking',
      category: '企业红黑榜',
      author: {
        id: 3,
        username: 'lisi',
        nickname: '李四',
        email: 'lisi@company.com',
        department: '人事部',
        status: 'active',
        roles: [],
        createdAt: '',
        updatedAt: ''
      },
      status: 'pending',
      content: '推荐技术部XX同事为年度优秀员工，该同事在过去一年中表现突出...',
      tags: [],
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      isTop: false,
      isRecommended: false,
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T09:15:00Z'
    },
    auditorId: 0,
    auditor: { id: 0, username: '', nickname: '', email: '', department: '', status: 'active', roles: [], createdAt: '', updatedAt: '' },
    action: 'approve',
    createdAt: '2024-01-15T09:15:00Z',
    riskLevel: 'medium',
    aiScore: 72,
    aiAnalysis: '内容涉及员工评价，需要核实具体事实和数据，建议人工审核。',
    riskTags: ['员工信息', '需核实']
  }
]

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    article: '文章',
    post: '帖子',
    ranking: '红黑榜',
    product: '商品',
    quote: '名言'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    article: 'primary',
    post: 'success',
    ranking: 'warning',
    product: 'info',
    quote: 'danger'
  }
  return colorMap[type] || 'info'
}

const getRiskName = (level: string) => {
  const riskMap: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险'
  }
  return riskMap[level] || level
}

const getRiskColor = (level: string) => {
  const colorMap: Record<string, string> = {
    low: 'success',
    medium: 'warning',
    high: 'danger'
  }
  return colorMap[level] || 'info'
}

const getScoreColor = (score: number) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  return Math.floor(hours / 24) + '天前'
}

const formatDateTime = (timeString: string) => {
  return new Date(timeString).toLocaleString('zh-CN')
}

const loadAuditList = () => {
  const mockData = mockAuditData()
  auditList.value = mockData.filter(item => {
    if (searchForm.type && item.content.type !== searchForm.type) return false
    if (searchForm.status && item.action !== searchForm.status) return false
    return true
  })
  pagination.total = auditList.value.length
}

const handleSearch = () => {
  pagination.page = 1
  loadAuditList()
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.status = 'pending'
  dateRange.value = null
  handleSearch()
}

const handleSelectionChange = (selection: AuditItem[]) => {
  selectedItems.value = selection
}

const handleSelectAll = () => {
  // 已通过计算属性处理
}

const handleItemSelect = (item: AuditItem, checked: boolean) => {
  if (checked) {
    if (!selectedItems.value.includes(item)) {
      selectedItems.value.push(item)
    }
  } else {
    const index = selectedItems.value.indexOf(item)
    if (index > -1) {
      selectedItems.value.splice(index, 1)
    }
  }
}

const handleQuickAudit = () => {
  // 快速审核模式
  ElMessage.info('快速审核模式开发中...')
}

const handlePreview = (item: AuditItem) => {
  currentItem.value = item
  previewDialogVisible.value = true
}

const handleApprove = (item: AuditItem | null) => {
  if (!item) return
  
  auditLoading.value = true
  setTimeout(() => {
    auditLoading.value = false
    previewDialogVisible.value = false
    ElMessage.success('审核通过')
    loadAuditList()
  }, 1000)
}

const handleReject = (item: AuditItem | null) => {
  if (!item) return
  
  currentItem.value = item
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

const handleRevise = (item: AuditItem | null) => {
  if (!item) return
  
  ElMessage.success('已打回修改')
  loadAuditList()
}

const confirmReject = () => {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请输入拒绝理由')
    return
  }
  
  auditLoading.value = true
  setTimeout(() => {
    auditLoading.value = false
    rejectDialogVisible.value = false
    previewDialogVisible.value = false
    ElMessage.success('审核拒绝')
    loadAuditList()
  }, 1000)
}

const handleBatchApprove = () => {
  ElMessageBox.confirm(
    `确定要通过选中的 ${selectedItems.value.length} 条内容吗？`,
    '批量通过',
    { type: 'warning' }
  ).then(() => {
    ElMessage.success('批量通过成功')
    selectedItems.value = []
    loadAuditList()
  })
}

const handleBatchReject = () => {
  ElMessageBox.confirm(
    `确定要拒绝选中的 ${selectedItems.value.length} 条内容吗？`,
    '批量拒绝',
    { type: 'warning' }
  ).then(() => {
    ElMessage.success('批量拒绝成功')
    selectedItems.value = []
    loadAuditList()
  })
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadAuditList()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadAuditList()
}

onMounted(() => {
  loadAuditList()
})
</script>

<style scoped>
.audit-page {
  padding: 20px;
}

.audit-stats {
  margin-bottom: 20px;
}

.stat-card {
  height: 80px;
}

.stat-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: #fff;
}

.stat-icon.pending {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.approved {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon.rejected {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-icon.efficiency {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
}

.stat-label {
  color: #909399;
  font-size: 14px;
  margin-top: 4px;
}

.audit-list {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-info {
  padding: 8px 0;
}

.content-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.content-title {
  font-weight: 500;
  color: #303133;
  cursor: pointer;
}

.content-title:hover {
  color: #409eff;
}

.content-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.ai-score {
  width: 80px;
}

.audit-actions {
  display: flex;
  gap: 8px;
}

.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  padding: 20px;
}

.audit-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
  cursor: pointer;
}

.audit-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.audit-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  cursor: pointer;
  line-height: 1.4;
}

.card-title:hover {
  color: #409eff;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.ai-analysis {
  margin-bottom: 12px;
}

.ai-score-card {
  margin-bottom: 8px;
}

.score-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  display: block;
}

.risk-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.risk-tag {
  margin: 0 !important;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.preview-content {
  max-height: 60vh;
  overflow-y: auto;
}

.preview-meta {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.content-body {
  margin-bottom: 16px;
}

.content-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 4px;
  line-height: 1.6;
  color: #606266;
}

.ai-analysis-detail {
  background: #fff7e6;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #ffd591;
}

.analysis-content p {
  margin: 0 0 8px 0;
}

.risk-tags-detail {
  margin-top: 12px;
}

.pagination-container {
  padding: 20px;
  display: flex;
  justify-content: center;
}
</style>