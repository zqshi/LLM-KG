<template>
  <div class="news-sources">
    <UnifiedPageHeader 
      title="资讯源管理" 
      description="管理资讯数据源，配置抓取规则和监控运行状态"
    >
      <template #actions>
        <el-button type="info" @click="exportSources">
          <el-icon><Download /></el-icon>
          导出配置
        </el-button>
        <el-button type="warning" @click="importSources">
          <el-icon><Upload /></el-icon>
          导入配置
        </el-button>
        <el-button type="success" @click="batchTest" :disabled="selectedSources.length === 0">
          <el-icon><Refresh /></el-icon>
          批量测试 ({{ selectedSources.length }})
        </el-button>
        <el-button type="primary" @click="createSource">
          <el-icon><Plus /></el-icon>
          添加资讯源
        </el-button>
      </template>
    </UnifiedPageHeader>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="资讯源名称:">
          <el-input v-model="searchForm.name" placeholder="请输入资讯源名称" clearable />
        </el-form-item>
        <el-form-item label="类型:">
          <el-select v-model="searchForm.type" placeholder="请选择类型" clearable>
            <el-option label="RSS订阅" value="rss" />
            <el-option label="API接口" value="api" />
            <el-option label="网页爬虫" value="crawler" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
            <el-option label="异常" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 资讯源状态统计 -->
    <el-row :gutter="20" class="status-dashboard">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value success">{{ sourceStats.active }}</div>
            <div class="stat-label">正常运行</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value warning">{{ sourceStats.warning }}</div>
            <div class="stat-label">需要关注</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value danger">{{ sourceStats.error }}</div>
            <div class="stat-label">异常状态</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value primary">{{ sourceStats.totalFetched }}</div>
            <div class="stat-label">今日抓取</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-table 
      :data="sourceList" 
      v-loading="loading" 
      @selection-change="handleSelectionChange"
      stripe
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="资讯源名称" min-width="200" />
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getTypeColor(row.type)">
            {{ getTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="数据源地址" min-width="300" />
      <el-table-column label="抓取频率" width="120">
        <template #default="{ row }">
          {{ getFrequencyText(row.frequency) }}
        </template>
      </el-table-column>
      <el-table-column label="审核设置" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.requiresReview ? 'warning' : 'success'" size="small">
            {{ row.requiresReview ? '需要审核' : '自动通过' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="140">
        <template #default="{ row }">
          <div class="status-info">
            <el-tag :type="getStatusColor(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
            <div class="health-indicator" :class="getHealthClass(row.healthScore)">
              <div class="health-bar">
                <div class="health-fill" :style="{ width: row.healthScore + '%' }"></div>
              </div>
              <span class="health-text">{{ row.healthScore }}%</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最近抓取" width="160">
        <template #default="{ row }">
          <div v-if="row.lastFetchTime">
            {{ row.lastFetchTime }}
          </div>
          <span v-else class="text-muted">从未抓取</span>
        </template>
      </el-table-column>
      <el-table-column label="成功率" width="100">
        <template #default="{ row }">
          <el-progress
            :percentage="row.successRate"
            :status="row.successRate < 80 ? 'exception' : 'success'"
            :stroke-width="6"
          />
        </template>
      </el-table-column>
      <el-table-column label="今日抓取" width="100" align="center">
        <template #default="{ row }">
          {{ row.todayFetchCount || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="editSource(row)">编辑</el-button>
          <el-button link type="info" @click="testSource(row)">测试</el-button>
          <el-button link type="warning" @click="manualFetch(row)">立即抓取</el-button>
          <el-button link type="success" @click="viewLogs(row)">日志</el-button>
          <el-button link @click="duplicateSource(row)">复制</el-button>
          <el-button 
            link 
            :type="row.status === 'active' ? 'danger' : 'success'" 
            @click="toggleSource(row)"
          >
            {{ row.status === 'active' ? '禁用' : '启用' }}
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

    <!-- 创建/编辑资讯源对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="sourceForm" :rules="rules" ref="sourceFormRef" label-width="120px">
        <el-form-item label="资讯源名称" prop="name">
          <el-input v-model="sourceForm.name" placeholder="请输入资讯源名称" />
        </el-form-item>

        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="sourceForm.type">
            <el-radio label="rss">RSS订阅</el-radio>
            <el-radio label="api">API接口</el-radio>
            <el-radio label="crawler">网页爬虫</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="数据源地址" prop="url">
          <el-input 
            v-model="sourceForm.url" 
            type="textarea" 
            :rows="2"
            placeholder="请输入RSS链接、API地址或网页URL"
          />
        </el-form-item>

        <el-form-item label="抓取频率" prop="frequency">
          <el-select v-model="sourceForm.frequency" style="width: 100%">
            <el-option label="每5分钟" value="5min" />
            <el-option label="每15分钟" value="15min" />
            <el-option label="每30分钟" value="30min" />
            <el-option label="每小时" value="1hour" />
            <el-option label="每2小时" value="2hour" />
            <el-option label="每6小时" value="6hour" />
            <el-option label="每12小时" value="12hour" />
            <el-option label="每日一次" value="daily" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类标签" prop="category">
          <el-select v-model="sourceForm.category" multiple style="width: 100%">
            <el-option label="科技" value="tech" />
            <el-option label="财经" value="finance" />
            <el-option label="政策" value="policy" />
            <el-option label="行业动态" value="industry" />
            <el-option label="国际资讯" value="international" />
            <el-option label="企业新闻" value="enterprise" />
          </el-select>
        </el-form-item>

        <!-- API类型特有配置 -->
        <template v-if="sourceForm.type === 'api'">
          <el-form-item label="请求方法">
            <el-select v-model="sourceForm.method" style="width: 100%">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
            </el-select>
          </el-form-item>

          <el-form-item label="请求头">
            <el-input
              v-model="sourceForm.headers"
              type="textarea"
              :rows="3"
              placeholder="JSON格式，例如：{'Authorization': 'Bearer token'}"
            />
          </el-form-item>

          <el-form-item label="请求参数" v-if="sourceForm.method === 'POST'">
            <el-input
              v-model="sourceForm.requestBody"
              type="textarea"
              :rows="3"
              placeholder="JSON格式的请求体"
            />
          </el-form-item>
        </template>

        <!-- 爬虫类型特有配置 -->
        <template v-if="sourceForm.type === 'crawler'">
          <el-form-item label="内容选择器">
            <el-input v-model="sourceForm.contentSelector" placeholder="CSS选择器，例如：.article-list .item" />
          </el-form-item>

          <el-form-item label="标题选择器">
            <el-input v-model="sourceForm.titleSelector" placeholder="标题CSS选择器，例如：.title" />
          </el-form-item>

          <el-form-item label="链接选择器">
            <el-input v-model="sourceForm.linkSelector" placeholder="链接CSS选择器，例如：a" />
          </el-form-item>

          <el-form-item label="请求延迟(秒)">
            <el-input-number v-model="sourceForm.delay" :min="1" :max="60" />
          </el-form-item>
        </template>

        <el-form-item label="自动去重">
          <el-switch v-model="sourceForm.autoDedup" />
          <span class="form-tip">开启后将自动过滤重复内容</span>
        </el-form-item>

        <el-form-item label="是否需要审核">
          <el-switch v-model="sourceForm.requiresReview" />
          <span class="form-tip">关闭后该资讯源的内容将自动审核通过</span>
        </el-form-item>

        <el-form-item label="自动分类">
          <el-switch v-model="sourceForm.autoCategory" />
          <span class="form-tip">基于AI自动分类识别</span>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="sourceForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入资讯源描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="info" @click="testSourceConfig">测试配置</el-button>
          <el-button type="primary" @click="saveSource">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 日志查看对话框 -->
    <el-dialog v-model="logDialogVisible" title="抓取日志" width="900px">
      <div class="log-header">
        <el-form :inline="true">
          <el-form-item label="日志级别:">
            <el-select v-model="logFilter.level" @change="filterLogs">
              <el-option label="全部" value="" />
              <el-option label="成功" value="success" />
              <el-option label="警告" value="warning" />
              <el-option label="错误" value="error" />
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围:">
            <el-date-picker
              v-model="logFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="filterLogs"
            />
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="logList" max-height="400">
        <el-table-column prop="time" label="时间" width="160" />
        <el-table-column label="级别" width="80">
          <template #default="{ row }">
            <el-tag :type="getLogLevelColor(row.level)" size="small">
              {{ getLogLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="message" label="日志消息" min-width="300" />
        <el-table-column prop="fetchCount" label="抓取数量" width="100" />
        <el-table-column prop="duration" label="耗时(ms)" width="100" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Download, Upload, Refresh } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { newsApi } from '@/api/news'
import type { NewsSource } from '@/types'

interface LogEntry {
  time: string
  level: 'success' | 'warning' | 'error'
  message: string
  fetchCount?: number
  duration?: number
}

const loading = ref(false)
const dialogVisible = ref(false)
const logDialogVisible = ref(false)
const dialogTitle = ref('添加资讯源')
const sourceFormRef = ref<FormInstance>()
const selectedSources = ref<NewsSource[]>([])
const importDialogVisible = ref(false)

const searchForm = reactive({
  name: '',
  type: '',
  status: ''
})

const sourceForm = reactive({
  id: 0,
  name: '',
  type: 'rss' as 'rss' | 'api' | 'crawler',
  url: '',
  frequency: '1hour',
  category: [] as string[],
  requiresReview: true, // 新增字段，默认需要审核
  method: 'GET',
  headers: '',
  requestBody: '',
  contentSelector: '',
  titleSelector: '',
  linkSelector: '',
  delay: 5,
  autoDedup: true,
  autoCategory: false,
  description: ''
})

const logFilter = reactive({
  level: '',
  dateRange: [] as string[]
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const sourceList = ref<NewsSource[]>([])
const logList = ref<LogEntry[]>([])

const sourceStats = computed(() => {
  const stats = { active: 0, warning: 0, error: 0, totalFetched: 0 }
  sourceList.value.forEach(source => {
    if (source.status === 'active' && source.successRate >= 80) stats.active++
    else if (source.status === 'active' && source.successRate >= 60) stats.warning++
    else stats.error++
    stats.totalFetched += source.todayFetchCount || 0
  })
  return stats
})

const rules = {
  name: [{ required: true, message: '请输入资讯源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  url: [{ required: true, message: '请输入数据源地址', trigger: 'blur' }],
  frequency: [{ required: true, message: '请选择抓取频率', trigger: 'change' }]
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    rss: 'primary',
    api: 'success',
    crawler: 'warning'
  }
  return colorMap[type] || ''
}

const getTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    rss: 'RSS订阅',
    api: 'API接口',
    crawler: '网页爬虫'
  }
  return textMap[type] || type
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    error: 'danger'
  }
  return colorMap[status] || ''
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    error: '异常'
  }
  return textMap[status] || status
}

const getFrequencyText = (frequency: string) => {
  const textMap: Record<string, string> = {
    '5min': '每5分钟',
    '15min': '每15分钟',
    '30min': '每30分钟',
    '1hour': '每小时',
    '2hour': '每2小时',
    '6hour': '每6小时',
    '12hour': '每12小时',
    'daily': '每日一次'
  }
  return textMap[frequency] || frequency
}

const getLogLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    success: 'success',
    warning: 'warning',
    error: 'danger'
  }
  return colorMap[level] || ''
}

const getLogLevelText = (level: string) => {
  const textMap: Record<string, string> = {
    success: '成功',
    warning: '警告',
    error: '错误'
  }
  return textMap[level] || level
}

const createSource = () => {
  dialogTitle.value = '添加资讯源'
  Object.assign(sourceForm, {
    id: 0,
    name: '',
    type: 'rss',
    url: '',
    frequency: '1hour',
    category: [],
    requiresReview: true, // 新增字段
    method: 'GET',
    headers: '',
    requestBody: '',
    contentSelector: '',
    titleSelector: '',
    linkSelector: '',
    delay: 5,
    autoDedup: true,
    autoCategory: false,
    description: ''
  })
  dialogVisible.value = true
}

const editSource = (source: NewsSource) => {
  dialogTitle.value = '编辑资讯源'
  Object.assign(sourceForm, {
    id: source.id,
    name: source.name,
    type: source.type,
    url: source.url,
    frequency: source.frequency,
    category: [...source.category],
    requiresReview: source.requiresReview, // 新增字段
    method: source.method || 'GET',
    headers: source.headers || '',
    requestBody: source.requestBody || '',
    contentSelector: source.contentSelector || '',
    titleSelector: source.titleSelector || '',
    linkSelector: source.linkSelector || '',
    delay: source.delay || 5,
    autoDedup: source.autoDedup,
    autoCategory: source.autoCategory,
    description: source.description || ''
  })
  dialogVisible.value = true
}

const testSource = async (source: NewsSource) => {
  try {
    ElMessage.info('正在测试资讯源连接...')
    // 模拟测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('资讯源连接测试成功')
  } catch {
    ElMessage.error('资讯源连接测试失败')
  }
}

const testSourceConfig = async () => {
  if (!sourceFormRef.value) return
  
  await sourceFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.info('正在测试配置...')
      // 模拟测试
      setTimeout(() => {
        ElMessage.success('配置测试通过')
      }, 1500)
    }
  })
}

const manualFetch = async (source: NewsSource) => {
  try {
    await ElMessageBox.confirm('确定要立即抓取这个资讯源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    })
    
    ElMessage.info('开始抓取资讯...')
    // 模拟抓取
    setTimeout(() => {
      ElMessage.success('抓取完成，获得 15 条新资讯')
      fetchSourceList()
    }, 3000)
  } catch {
    
  }
}

const toggleSource = async (source: NewsSource) => {
  const action = source.status === 'active' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确定要${action}这个资讯源吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log(`${action}资讯源:`, source)
    ElMessage.success(`资讯源${action}成功`)
    fetchSourceList()
  } catch {
    
  }
}

const viewLogs = async (source: NewsSource) => {
  // 模拟获取日志
  logList.value = [
    {
      time: '2024-03-01 14:30:00',
      level: 'success',
      message: '成功抓取资讯数据',
      fetchCount: 12,
      duration: 1250
    },
    {
      time: '2024-03-01 13:30:00',
      level: 'warning',
      message: '部分内容解析失败',
      fetchCount: 8,
      duration: 2100
    },
    {
      time: '2024-03-01 12:30:00',
      level: 'error',
      message: '连接超时，抓取失败',
      fetchCount: 0,
      duration: 5000
    }
  ]
  
  logDialogVisible.value = true
}

const filterLogs = () => {
  console.log('筛选日志:', logFilter)
}

const saveSource = async () => {
  if (!sourceFormRef.value) return
  
  await sourceFormRef.value.validate((valid) => {
    if (valid) {
      console.log('保存资讯源数据:', sourceForm)
      ElMessage.success('资讯源保存成功')
      dialogVisible.value = false
      fetchSourceList()
    }
  })
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchSourceList()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    type: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchSourceList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchSourceList()
}

const fetchSourceList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData: NewsSource[] = [
      {
        id: 1,
        name: '科技资讯RSS',
        type: 'rss',
        url: 'https://www.example.com/tech/rss.xml',
        frequency: '1hour',
        status: 'active',
        category: ['科技', '行业动态'],
        lastFetchTime: '2024-03-01 14:30:00',
        successRate: 95,
        todayFetchCount: 48,
        healthScore: 95,
        requiresReview: false, // 可信源，无需审核
        autoDedup: true,
        autoCategory: true,
        description: '主流科技媒体RSS订阅',
        alertOnFailure: true,
        maxRetries: 3,
        timeout: 30000
      },
      {
        id: 2,
        name: '财经API接口',
        type: 'api',
        url: 'https://api.finance.com/news',
        frequency: '30min',
        status: 'active',
        category: ['财经', '政策'],
        lastFetchTime: '2024-03-01 14:00:00',
        successRate: 88,
        todayFetchCount: 72,
        healthScore: 88,
        method: 'GET',
        headers: '{"Authorization": "Bearer xxx"}',
        requiresReview: true, // API源，需要审核
        autoDedup: true,
        autoCategory: false,
        description: '财经资讯API数据源',
        alertOnFailure: true,
        maxRetries: 5,
        timeout: 45000
      },
      {
        id: 3,
        name: '企业新闻爬虫',
        type: 'crawler',
        url: 'https://www.enterprise-news.com/latest',
        frequency: '2hour',
        status: 'error',
        category: ['企业新闻'],
        lastFetchTime: '2024-03-01 10:00:00',
        successRate: 65,
        todayFetchCount: 0,
        healthScore: 45,
        contentSelector: '.news-list .item',
        titleSelector: '.title a',
        linkSelector: '.title a',
        delay: 3,
        requiresReview: true, // 爬虫源，需要审核
        autoDedup: true,
        autoCategory: true,
        description: '企业新闻网站爬虫',
        alertOnFailure: false,
        maxRetries: 2,
        timeout: 60000
      }
    ]
    
    sourceList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('获取资讯源列表失败')
  } finally {
    loading.value = false
  }
}

const handleSelectionChange = (val: NewsSource[]) => {
  selectedSources.value = val
}

const getHealthClass = (score: number) => {
  if (score >= 80) return 'health-good'
  if (score >= 60) return 'health-warning'
  return 'health-poor'
}

const duplicateSource = (source: NewsSource) => {
  const newSource = {
    ...source,
    id: 0,
    name: source.name + ' - 复制',
    status: 'inactive' as const
  }
  
  dialogTitle.value = '复制资讯源'
  Object.assign(sourceForm, newSource)
  dialogVisible.value = true
}

const batchTest = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量测试选中的 ${selectedSources.value.length} 个资讯源吗？`,
      '批量测试确认',
      {
        confirmButtonText: '确定测试',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    ElMessage.info(`正在测试 ${selectedSources.value.length} 个资讯源...`)
    
    // 模拟批量测试
    setTimeout(() => {
      ElMessage.success(`批量测试完成`)
      selectedSources.value = []
      fetchSourceList()
    }, 3000)
  } catch {}
}

const exportSources = () => {
  const data = JSON.stringify(sourceList.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `news-sources-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('资讯源配置已导出')
}

const importSources = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const sources = JSON.parse(e.target?.result as string)
        if (Array.isArray(sources)) {
          ElMessageBox.confirm(
            `即将导入 ${sources.length} 个资讯源配置，是否继续？`,
            '导入确认',
            {
              confirmButtonText: '确定导入',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            // 这里实际项目中应该调用API导入
            ElMessage.success(`成功导入 ${sources.length} 个资讯源配置`)
            fetchSourceList()
          }).catch(() => {})
        } else {
          ElMessage.error('文件格式错误')
        }
      } catch {
        ElMessage.error('文件解析失败')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}

onMounted(() => {
  fetchSourceList()
})
</script>

<style scoped>
.news-sources {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.status-dashboard {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat {
  padding: 20px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-value.success { color: #67C23A; }
.stat-value.warning { color: #E6A23C; }
.stat-value.danger { color: #F56C6C; }
.stat-value.primary { color: #409EFF; }

.stat-label {
  font-size: 14px;
  color: #666;
}

.status-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.health-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.health-bar {
  flex: 1;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  transition: width 0.3s;
}

.health-good .health-fill {
  background: #67C23A;
}

.health-warning .health-fill {
  background: #E6A23C;
}

.health-poor .health-fill {
  background: #F56C6C;
}

.health-text {
  font-size: 11px;
  color: #666;
  min-width: 30px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.text-muted {
  color: #c0c4cc;
}

.form-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}

.log-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}
</style>