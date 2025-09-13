<template>
  <div class="my-done">
    <UnifiedPageHeader 
      title="我已办" 
      description="查看我已完成审批的Banner项目和处理结果"
    >
      <template #actions>
        <div class="stats">
          <el-statistic title="本月已办" :value="doneStats.thisMonth" />
          <el-statistic title="累计已办" :value="doneStats.total" />
        </div>
      </template>
    </UnifiedPageHeader>

    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="处理结果:">
          <el-select v-model="filterForm.result" placeholder="请选择处理结果" clearable>
            <el-option label="通过" value="approved" />
            <el-option label="拒绝" value="rejected" />
            <el-option label="委派" value="delegated" />
          </el-select>
        </el-form-item>
        <el-form-item label="Banner类型:">
          <el-select v-model="filterForm.bannerType" placeholder="请选择Banner类型" clearable>
            <el-option label="活动Banner" value="activity" />
            <el-option label="产品Banner" value="product" />
            <el-option label="公告Banner" value="notice" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理时间:">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="doneList" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="Banner预览" width="120">
        <template #default="{ row }">
          <el-image
            :src="row.bannerImageUrl"
            :preview-src-list="[row.bannerImageUrl]"
            fit="cover"
            style="width: 80px; height: 40px"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column prop="bannerTitle" label="Banner标题" min-width="200" />
      <el-table-column prop="submitter" label="提交人" width="100" />
      <el-table-column prop="submitTime" label="提交时间" width="160" />
      <el-table-column prop="processTime" label="处理时间" width="160" />
      <el-table-column label="处理时长" width="100">
        <template #default="{ row }">
          {{ calculateDuration(row.submitTime, row.processTime) }}
        </template>
      </el-table-column>
      <el-table-column label="处理结果" width="100">
        <template #default="{ row }">
          <el-tag :type="getResultType(row.result) || undefined">
            {{ getResultText(row.result) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="当前状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.currentStatus) || undefined">
            {{ getStatusText(row.currentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="viewDetails(row)">查看详情</el-button>
          <el-button link type="info" @click="viewHistory(row)">审批历史</el-button>
          <el-button v-if="canRevoke(row)" link type="warning" @click="revokeApproval(row)">
            撤回
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="Banner详情" width="800px">
      <div class="banner-detail" v-if="currentBanner">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="banner-preview-large">
              <el-image
                :src="currentBanner.bannerImageUrl"
                :preview-src-list="[currentBanner.bannerImageUrl]"
                fit="cover"
                style="width: 100%; height: 150px"
                preview-teleported
              />
            </div>
          </el-col>
          <el-col :span="16">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="Banner标题">{{ currentBanner.bannerTitle }}</el-descriptions-item>
              <el-descriptions-item label="跳转链接">{{ currentBanner.linkUrl }}</el-descriptions-item>
              <el-descriptions-item label="生效时间">
                {{ currentBanner.startTime }} ~ {{ currentBanner.endTime }}
              </el-descriptions-item>
              <el-descriptions-item label="提交人">{{ currentBanner.submitter }}</el-descriptions-item>
              <el-descriptions-item label="Banner类型">{{ currentBanner.bannerType }}</el-descriptions-item>
              <el-descriptions-item label="申请说明">{{ currentBanner.description || '无' }}</el-descriptions-item>
            </el-descriptions>
          </el-col>
        </el-row>

        <el-divider>我的处理记录</el-divider>
        
        <div class="process-record">
          <el-card shadow="never">
            <div class="record-header">
              <div class="result-info">
                <el-tag :type="getResultType(currentBanner.result) || undefined" size="large">
                  {{ getResultText(currentBanner.result) }}
                </el-tag>
                <span class="process-time">{{ currentBanner.processTime }}</span>
              </div>
            </div>
            <div class="record-content" v-if="currentBanner.processComment">
              <strong>处理意见：</strong>
              <p>{{ currentBanner.processComment }}</p>
            </div>
          </el-card>
        </div>
      </div>
    </el-dialog>

    <!-- 审批历史对话框 -->
    <el-dialog v-model="historyDialogVisible" title="审批历史" width="800px">
      <el-timeline>
        <el-timeline-item
          v-for="(record, index) in approvalHistory"
          :key="index"
          :timestamp="record.time"
          :type="getHistoryType(record.action)"
        >
          <div class="history-item">
            <div class="history-header">
              <span class="action">{{ getActionText(record.action) }}</span>
              <span class="operator">{{ record.operator }}</span>
              <span class="node" v-if="record.node">({{ record.node }})</span>
            </div>
            <div class="history-content" v-if="record.comment">
              {{ record.comment }}
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

interface DoneItem {
  id: number
  bannerTitle: string
  bannerImageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  submitter: string
  submitTime: string
  processTime: string
  result: 'approved' | 'rejected' | 'delegated'
  currentStatus: string
  bannerType: string
  description?: string
  processComment?: string
}

interface ApprovalRecord {
  time: string
  operator: string
  action: 'submit' | 'approve' | 'reject' | 'delegate' | 'revoke'
  comment?: string
  node?: string
}

const detailDialogVisible = ref(false)
const historyDialogVisible = ref(false)

const filterForm = reactive({
  result: '',
  bannerType: '',
  dateRange: [] as string[]
})

const doneStats = reactive({
  thisMonth: 0,
  total: 0
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const doneList = ref<DoneItem[]>([])
const currentBanner = ref<DoneItem | null>(null)
const approvalHistory = ref<ApprovalRecord[]>([])

const getResultType = (result: string) => {
  const typeMap: Record<string, import('element-plus').TagProps['type']> = {
    approved: 'success',
    rejected: 'danger',
    delegated: 'warning'
  }
  return typeMap[result] || ''
}

const getResultText = (result: string) => {
  const textMap: Record<string, string> = {
    approved: '通过',
    rejected: '拒绝',
    delegated: '委派'
  }
  return textMap[result] || result
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, import('element-plus').TagProps['type'] | ''> = {
    draft: '',
    pending: 'warning',
    reviewing: 'info',
    approved: 'success',
    rejected: 'danger',
    published: 'success',
    offline: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending: '待审批',
    reviewing: '审批中',
    approved: '已通过',
    rejected: '已拒绝',
    published: '已发布',
    offline: '已下线'
  }
  return statusMap[status] || status
}

const getHistoryType = (action: string) => {
  const typeMap: Record<string, any> = {
    submit: 'primary',
    approve: 'success',
    reject: 'danger',
    delegate: 'warning',
    revoke: 'info'
  }
  return typeMap[action] || 'primary'
}

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    submit: '提交审批',
    approve: '审批通过',
    reject: '审批拒绝',
    delegate: '委派审批',
    revoke: '撤回审批'
  }
  return textMap[action] || action
}

const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  const diff = end - start
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (hours < 24) {
    return `${hours}小时`
  } else {
    const days = Math.floor(hours / 24)
    const remainHours = hours % 24
    return `${days}天${remainHours}小时`
  }
}

const canRevoke = (item: DoneItem) => {
  // 只有在特定时间内且状态为审批中的可以撤回
  const processTime = new Date(item.processTime).getTime()
  const now = new Date().getTime()
  const hoursDiff = (now - processTime) / (1000 * 60 * 60)
  
  return item.result === 'approved' && item.currentStatus === 'reviewing' && hoursDiff < 24
}

const viewDetails = (item: DoneItem) => {
  currentBanner.value = item
  detailDialogVisible.value = true
}

const viewHistory = async (item: DoneItem) => {
  // 模拟获取审批历史
  approvalHistory.value = [
    {
      time: '2024-03-01 09:00:00',
      operator: item.submitter,
      action: 'submit',
      comment: '提交Banner审批申请',
      node: '提交'
    },
    {
      time: '2024-03-01 14:30:00',
      operator: '李四',
      action: 'approve',
      comment: '初审通过，Banner设计符合规范',
      node: '部门主管审核'
    },
    {
      time: item.processTime,
      operator: '当前用户',
      action: item.result === 'approved' ? 'approve' : item.result === 'rejected' ? 'reject' : 'delegate',
      comment: item.processComment,
      node: '运营总监审核'
    }
  ]
  
  historyDialogVisible.value = true
}

const revokeApproval = async (item: DoneItem) => {
  try {
    await ElMessageBox.confirm('确定要撤回这个审批决定吗？撤回后将退回到待办状态。', '提示', {
      confirmButtonText: '确定撤回',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('撤回审批:', item)
    ElMessage.success('撤回成功')
    fetchDoneList()
  } catch (error) {
    console.error('撤回审批失败:', error)
    ElMessage.error('撤回审批失败')
  }
}

const handleFilter = () => {
  pagination.currentPage = 1
  fetchDoneList()
}

const resetFilter = () => {
  Object.assign(filterForm, {
    result: '',
    bannerType: '',
    dateRange: []
  })
  handleFilter()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchDoneList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchDoneList()
}

const fetchDoneStats = async () => {
  try {
    // 模拟API调用
    doneStats.thisMonth = 23
    doneStats.total = 156
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

const fetchDoneList = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData: DoneItem[] = [
      {
        id: 1,
        bannerTitle: '年终活动Banner',
        bannerImageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPuWbouWbouS9nOiKseW+iemHj+WKoOi9veS4lueVjOaUtuS4nOe7nzwvdGV4dD4KPC9zdmc+',
        linkUrl: 'https://example.com/year-end',
        startTime: '2024-01-15 00:00:00',
        endTime: '2024-01-31 23:59:59',
        submitter: '张三',
        submitTime: '2024-01-10 10:00:00',
        processTime: '2024-01-10 15:30:00',
        result: 'approved',
        currentStatus: 'published',
        bannerType: 'activity',
        description: '年终庆典活动Banner',
        processComment: '活动方案很好，批准上线'
      },
      {
        id: 2,
        bannerTitle: '新产品宣传Banner',
        bannerImageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNEVDREMwIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPuS9nOiKseW+iemHj+WKoOi9veS4lueVjOaUtuS4nOe7nzwvdGV4dD4KPC9zdmc+',
        linkUrl: 'https://example.com/new-product',
        startTime: '2024-02-01 00:00:00',
        endTime: '2024-02-15 23:59:59',
        submitter: '李四',
        submitTime: '2024-01-25 14:20:00',
        processTime: '2024-01-26 09:15:00',
        result: 'rejected',
        currentStatus: 'rejected',
        bannerType: 'product',
        description: 'Q1新产品推广Banner',
        processComment: '产品信息不够准确，请重新制作'
      },
      {
        id: 3,
        bannerTitle: '员工招聘Banner',
        bannerImageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjNDVCN0QxIi8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPuWksei0p+WKoOi9veS4lueVjOaUtuS4nOe7nzwvdGV4dD4KPC9zdmc+',
        linkUrl: 'https://example.com/recruitment',
        startTime: '2024-02-10 00:00:00',
        endTime: '2024-03-10 23:59:59',
        submitter: '王五',
        submitTime: '2024-02-05 11:00:00',
        processTime: '2024-02-05 16:45:00',
        result: 'delegated',
        currentStatus: 'reviewing',
        bannerType: 'notice',
        description: '春季招聘活动Banner',
        processComment: '委派给HR总监进一步审核'
      },
      {
        id: 4,
        bannerTitle: '培训通知Banner',
        bannerImageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDgwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPuWbhuWbhuWKoOi9veS4lueVjOaUtuS4nOe7nzwvdGV4dD4KPC9zdmc+',
        linkUrl: 'https://example.com/training-notice',
        startTime: '2024-03-01 00:00:00',
        endTime: '2024-03-15 23:59:59',
        submitter: '赵六',
        submitTime: '2024-02-28 16:20:00',
        processTime: '2024-03-01 10:30:00',
        result: 'approved',
        currentStatus: 'reviewing',
        bannerType: 'notice',
        description: '技能提升培训通知',
        processComment: '培训内容很有价值，同意发布'
      }
    ]
    
    doneList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('获取已办列表失败')
  }
}

onMounted(() => {
  fetchDoneStats()
  fetchDoneList()
})
</script>

<style scoped>
.my-done {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 40px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.banner-detail {
  padding: 10px;
}

.banner-preview-large {
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.process-record {
  margin-top: 20px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.process-time {
  color: #909399;
  font-size: 14px;
}

.record-content {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.record-content p {
  margin: 8px 0 0 0;
  color: #606266;
  line-height: 1.6;
}

.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: bold;
}

.action {
  color: #409eff;
}

.operator {
  color: #303133;
}

.node {
  color: #909399;
  font-weight: normal;
  font-size: 12px;
}

.history-content {
  margin-top: 8px;
  color: #606266;
  padding-left: 12px;
  border-left: 2px solid #e4e7ed;
}
</style>