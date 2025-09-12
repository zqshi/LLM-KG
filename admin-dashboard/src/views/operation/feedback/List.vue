<template>
  <div class="feedback-management-page">
    <UnifiedPageHeader 
      title="问题反馈管理" 
      description="统一管理用户反馈，提升问题处理效率和用户满意度"
    />

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row" v-if="statistics">
      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon total">
              <el-icon><MessageBox /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ statistics.total }}</div>
              <div class="stats-label">反馈总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ statistics.pending }}</div>
              <div class="stats-label">待处理</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon processing">
              <el-icon><Loading /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ statistics.processing }}</div>
              <div class="stats-label">处理中</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card class="stats-card">
          <div class="stats-content">
            <div class="stats-icon resolved">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ statistics.resolved }}</div>
              <div class="stats-label">已解决</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="search-card">
      <div class="search-controls">
        <div class="search-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索反馈标题或内容"
            :prefix-icon="Search"
            clearable
            style="width: 260px"
            @clear="handleSearch"
          />
        </div>
        <div class="filter-group">
          <el-select
            v-model="queryParams.type"
            placeholder="请选择反馈类型"
            clearable
            style="width: 150px"
            @clear="handleSearch"
          >
            <el-option
              v-for="option in typeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-select
            v-model="queryParams.status"
            placeholder="请选择处理状态"
            clearable
            multiple
            style="width: 180px"
            @clear="handleSearch"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-select
            v-model="queryParams.priority"
            placeholder="请选择优先级"
            clearable
            multiple
            style="width: 150px"
            @clear="handleSearch"
          >
            <el-option
              v-for="option in priorityOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            style="width: 240px"
          />

          <el-button @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </div>
      </div>
    </el-card>

    <!-- 反馈列表 -->
    <el-card class="table-card">
      <el-table
        :data="feedbackList"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="id" label="反馈ID" width="80" />
        
        <el-table-column prop="title" label="反馈标题" min-width="200">
          <template #default="{ row }">
            <el-link @click="handleViewDetail(row.id)" type="primary">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="type" label="反馈类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'problem' ? 'danger' : 'primary'">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="submitterName" label="提交人" width="120" />

        <el-table-column prop="createTime" label="提交时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="处理状态" width="100">
          <template #default="{ row }">
            <el-tag :color="getStatusConfig(row.status)?.color">
              {{ getStatusConfig(row.status)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="priority" label="优先级" width="80">
          <template #default="{ row }">
            <el-tag :color="getPriorityConfig(row.priority)?.color" size="small">
              {{ getPriorityConfig(row.priority)?.label }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="processerName" label="处理人" width="120">
          <template #default="{ row }">
            {{ row.processerName || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(row.id)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MessageBox, Clock, Loading, CircleCheck, Search } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useFeedbackManagementStore } from '@/stores/feedbackManagement'
import { storeToRefs } from 'pinia'

const router = useRouter()
const feedbackStore = useFeedbackManagementStore()

const {
  feedbackList,
  statistics,
  availableProcessors,
  loading,
  total,
  queryParams,
  typeOptions,
  statusOptions,
  priorityOptions
} = storeToRefs(feedbackStore)

const dateRange = ref<[string, string]>(['', ''])

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    problem: '问题反馈',
    suggestion: '建议反馈',
    bug: 'Bug反馈',
    feature: '功能需求'
  }
  return typeMap[type] || type
}

const getStatusConfig = (status: string) => {
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: '待处理', color: '#f56c6c' },
    processing: { label: '处理中', color: '#e6a23c' },
    resolved: { label: '已解决', color: '#67c23a' },
    closed: { label: '已关闭', color: '#909399' }
  }
  return statusMap[status] || { label: status, color: '#909399' }
}

const getPriorityConfig = (priority: string) => {
  const priorityMap: Record<string, { label: string; color: string }> = {
    low: { label: '低', color: '#67c23a' },
    normal: { label: '中', color: '#e6a23c' },
    high: { label: '高', color: '#f56c6c' },
    urgent: { label: '紧急', color: '#f56c6c' }
  }
  return priorityMap[priority] || { label: priority, color: '#909399' }
}

const handleDateChange = (dates: [string, string] | null) => {
  if (dates) {
    queryParams.value.startTime = dates[0]
    queryParams.value.endTime = dates[1]
  } else {
    queryParams.value.startTime = ''
    queryParams.value.endTime = ''
  }
}

const resetQuery = () => {
  feedbackStore.resetQuery()
  dateRange.value = ['', '']
  handleSearch()
}

const handleSearch = () => {
  queryParams.value.page = 1
  feedbackStore.loadFeedbackList()
}

const handlePageChange = (page: number) => {
  queryParams.value.page = page
  feedbackStore.loadFeedbackList()
}

const handlePageSizeChange = (size: number) => {
  queryParams.value.pageSize = size
  queryParams.value.page = 1
  feedbackStore.loadFeedbackList()
}

const handleViewDetail = (id: number) => {
  router.push(`/operation/feedback/${id}`)
}

onMounted(async () => {
  await Promise.all([
    feedbackStore.loadFeedbackList(),
    feedbackStore.loadStatistics(),
    feedbackStore.loadAvailableProcessors()
  ])
})
</script>

<style scoped lang="scss">
.feedback-management-page {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stats-card {
  min-height: 80px;

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
    font-size: 20px;

    &.total {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    &.pending {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    &.processing {
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    }

    &.resolved {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    }
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

.search-card {
  margin-bottom: 20px;

  .search-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .filter-group {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
  }
}

.table-card {
  .pagination {
    margin-top: 20px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    gap: 16px;
    align-items: stretch !important;
  }

  .filter-group {
    flex-wrap: wrap;
  }

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
}
</style>