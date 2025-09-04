<template>
  <div class="content-pool">
    <!-- 页面头部 -->
    <div class="header">
      <h2>资讯审核中心</h2>
      <div class="header-actions">
        <el-button type="primary" @click="refreshList">
          <el-icon><Refresh /></el-icon>
          刷新列表
        </el-button>
        <el-button type="success" @click="batchApprove" :disabled="selectedArticles.length === 0">
          <el-icon><Check /></el-icon>
          批量审核通过 ({{ selectedArticles.length }})
        </el-button>
        <el-button type="danger" @click="batchReject" :disabled="selectedArticles.length === 0">
          <el-icon><Close /></el-icon>
          批量拒绝 ({{ selectedArticles.length }})
        </el-button>
      </div>
    </div>

    <!-- 审核统计仪表板 -->
    <el-row :gutter="20" class="stats-dashboard">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value primary">{{ stats.pendingCount }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value warning">{{ stats.duplicateCount }}</div>
            <div class="stat-label">疑似重复</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value success">{{ stats.todayApproved }}</div>
            <div class="stat-label">今日已审核</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-value info">{{ stats.avgProcessTime }}min</div>
            <div class="stat-label">平均处理时间</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="内容搜索:">
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索标题或内容关键词"
            style="width: 300px"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="资讯源:">
          <el-select v-model="filterForm.sourceId" placeholder="请选择资讯源" clearable>
            <el-option 
              v-for="source in sourceList" 
              :key="source.id" 
              :label="source.name" 
              :value="source.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="自动分类:">
          <el-select v-model="filterForm.category" placeholder="请选择分类" clearable>
            <el-option label="科技" value="tech" />
            <el-option label="财经" value="finance" />
            <el-option label="政策" value="policy" />
            <el-option label="行业动态" value="industry" />
            <el-option label="国际资讯" value="international" />
          </el-select>
        </el-form-item>
        <el-form-item label="重复检测:">
          <el-select v-model="filterForm.duplicateStatus" placeholder="重复状态" clearable>
            <el-option label="正常" value="normal" />
            <el-option label="疑似重复" value="duplicate" />
            <el-option label="已合并" value="merged" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 资讯列表 -->
    <el-card class="article-list-card">
      <template #header>
        <div class="card-header">
          <span>待审核资讯列表</span>
          <div class="header-right">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="list">列表视图</el-radio-button>
              <el-radio-button value="card">卡片视图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <!-- 列表视图 -->
      <el-table 
        v-if="viewMode === 'list'"
        :data="articleList" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="内容预览" min-width="400">
          <template #default="{ row }">
            <div class="article-preview">
              <div class="article-header">
                <h4 class="article-title" @click="previewArticle(row)">{{ row.title }}</h4>
                <div class="article-meta">
                  <el-tag size="small" :type="getSourceTypeColor(row.sourceType)">
                    {{ row.sourceName }}
                  </el-tag>
                  <span class="fetch-time">{{ row.fetchTime }}</span>
                </div>
              </div>
              <div class="article-content">
                {{ truncateContent(row.content, 100) }}
              </div>
              <div class="article-tags" v-if="row.autoTags && row.autoTags.length">
                <el-tag 
                  v-for="tag in row.autoTags.slice(0, 3)" 
                  :key="tag" 
                  size="small" 
                  type="info"
                >
                  {{ tag }}
                </el-tag>
                <span v-if="row.autoTags.length > 3" class="more-tags">+{{ row.autoTags.length - 3 }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            <el-select 
              v-model="row.category" 
              size="small" 
              @change="updateCategory(row)"
              style="width: 100%"
            >
              <el-option label="科技" value="tech" />
              <el-option label="财经" value="finance" />
              <el-option label="政策" value="policy" />
              <el-option label="行业动态" value="industry" />
              <el-option label="国际资讯" value="international" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="质量评分" width="100" align="center">
          <template #default="{ row }">
            <el-rate 
              v-model="row.qualityScore" 
              :max="5" 
              size="small"
              @change="updateQualityScore(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="重复检测" width="120" align="center">
          <template #default="{ row }">
            <div v-if="row.isDuplicate">
              <el-tag type="warning" size="small">
                <el-icon><Warning /></el-icon>
                疑似重复
              </el-tag>
              <div class="similarity">相似度: {{ row.similarity }}%</div>
            </div>
            <el-tag v-else type="success" size="small">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="previewArticle(row)">预览</el-button>
            <el-button link type="info" @click="editArticle(row)">编辑</el-button>
            <el-button link type="success" @click="approveArticle(row)">通过</el-button>
            <el-button link type="danger" @click="rejectArticle(row)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 卡片视图 -->
      <div v-else class="card-view">
        <el-row :gutter="20">
          <el-col :span="8" v-for="article in articleList" :key="article.id">
            <el-card class="article-card" :class="{ 'duplicate': article.isDuplicate }">
              <div class="card-content">
                <div class="card-header">
                  <el-checkbox 
                    v-model="selectedIds" 
                    :value="article.id"
                    @change="updateSelection"
                  />
                  <el-tag size="small" :type="getSourceTypeColor(article.sourceType)">
                    {{ article.sourceName }}
                  </el-tag>
                  <span class="fetch-time">{{ article.fetchTime }}</span>
                </div>
                <h4 class="card-title" @click="previewArticle(article)">{{ article.title }}</h4>
                <p class="card-content-text">{{ truncateContent(article.content, 120) }}</p>
                <div class="card-tags" v-if="article.autoTags && article.autoTags.length">
                  <el-tag 
                    v-for="tag in article.autoTags.slice(0, 2)" 
                    :key="tag" 
                    size="small" 
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="card-actions">
                  <el-button size="small" type="success" @click="approveArticle(article)">通过</el-button>
                  <el-button size="small" type="danger" @click="rejectArticle(article)">拒绝</el-button>
                  <el-button size="small" type="info" @click="editArticle(article)">编辑</el-button>
                </div>
                <div v-if="article.isDuplicate" class="duplicate-warning">
                  <el-icon><Warning /></el-icon>
                  疑似重复内容 ({{ article.similarity }}%)
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 分页 -->
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
    </el-card>

    <!-- 文章预览对话框 -->
    <el-dialog v-model="previewVisible" :title="selectedArticle?.title" width="900px">
      <div v-if="selectedArticle" class="article-preview-dialog">
        <div class="preview-meta">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="来源">{{ selectedArticle.sourceName }}</el-descriptions-item>
            <el-descriptions-item label="抓取时间">{{ selectedArticle.fetchTime }}</el-descriptions-item>
            <el-descriptions-item label="自动分类">{{ selectedArticle.category }}</el-descriptions-item>
            <el-descriptions-item label="质量评分">
              <el-rate v-model="selectedArticle.qualityScore" :max="5" size="small" disabled />
            </el-descriptions-item>
            <el-descriptions-item label="重复检测">
              <el-tag :type="selectedArticle.isDuplicate ? 'warning' : 'success'" size="small">
                {{ selectedArticle.isDuplicate ? `疑似重复 (${selectedArticle.similarity}%)` : '正常' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="原文链接">
              <el-link :href="selectedArticle.originalUrl" type="primary" target="_blank">查看原文</el-link>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="preview-content">
          <h3>文章内容</h3>
          <div class="content-text" v-html="selectedArticle.content"></div>
        </div>

        <div class="preview-tags">
          <h4>自动标签</h4>
          <el-tag 
            v-for="tag in selectedArticle.autoTags" 
            :key="tag" 
            size="small" 
            type="info"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="previewVisible = false">关闭</el-button>
          <el-button type="info" @click="editCurrentArticle">编辑</el-button>
          <el-button type="danger" @click="rejectCurrentArticle">拒绝</el-button>
          <el-button type="success" @click="approveCurrentArticle">审核通过</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝原因" width="500px">
      <el-form :model="rejectForm" label-width="80px">
        <el-form-item label="拒绝原因">
          <el-select v-model="rejectForm.reason" placeholder="请选择拒绝原因">
            <el-option label="内容质量差" value="poor_quality" />
            <el-option label="内容重复" value="duplicate" />
            <el-option label="与公司无关" value="irrelevant" />
            <el-option label="信息过时" value="outdated" />
            <el-option label="来源不可靠" value="unreliable_source" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" v-if="rejectForm.reason === 'other'">
          <el-input
            v-model="rejectForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">确定拒绝</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, 
  Check, 
  Close, 
  Search, 
  Warning 
} from '@element-plus/icons-vue'

interface NewsArticle {
  id: number
  title: string
  content: string
  sourceId: number
  sourceName: string
  sourceType: 'rss' | 'api' | 'crawler'
  originalUrl: string
  category: string
  autoTags: string[]
  status: 'pending' | 'approved' | 'rejected'
  fetchTime: string
  qualityScore: number
  isDuplicate: boolean
  similarity?: number
  duplicateGroupId?: string
}

interface NewsSource {
  id: number
  name: string
  type: 'rss' | 'api' | 'crawler'
}

const loading = ref(false)
const previewVisible = ref(false)
const rejectDialogVisible = ref(false)
const viewMode = ref<'list' | 'card'>('list')
const selectedArticle = ref<NewsArticle | null>(null)
const selectedArticles = ref<NewsArticle[]>([])
const selectedIds = ref<number[]>([])

const filterForm = reactive({
  keyword: '',
  sourceId: '',
  category: '',
  duplicateStatus: ''
})

const rejectForm = reactive({
  reason: '',
  note: ''
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const stats = reactive({
  pendingCount: 0,
  duplicateCount: 0,
  todayApproved: 0,
  avgProcessTime: 0
})

const articleList = ref<NewsArticle[]>([])
const sourceList = ref<NewsSource[]>([])

const getSourceTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    rss: 'primary',
    api: 'success',
    crawler: 'warning'
  }
  return colorMap[type] || ''
}

const truncateContent = (content: string, maxLength: number) => {
  if (content.length <= maxLength) return content
  return content.substring(0, maxLength) + '...'
}

const fetchStats = async () => {
  // 模拟API调用
  Object.assign(stats, {
    pendingCount: 156,
    duplicateCount: 23,
    todayApproved: 89,
    avgProcessTime: 2.5
  })
}

const fetchSources = async () => {
  sourceList.value = [
    { id: 1, name: '科技资讯RSS', type: 'rss' },
    { id: 2, name: '财经API接口', type: 'api' },
    { id: 3, name: '企业新闻爬虫', type: 'crawler' }
  ]
}

const fetchArticleList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockArticles: NewsArticle[] = [
      {
        id: 1,
        title: '人工智能技术在金融行业的最新应用进展',
        content: '随着人工智能技术的快速发展，金融行业正在经历一场深刻的数字化变革。从智能客服到风险控制，从算法交易到个性化投资建议，AI技术正在重塑金融服务的各个环节。本文将详细分析当前AI在金融行业的主要应用场景，以及未来的发展趋势...',
        sourceId: 1,
        sourceName: '科技资讯RSS',
        sourceType: 'rss',
        originalUrl: 'https://example.com/article/1',
        category: 'tech',
        autoTags: ['人工智能', '金融科技', '数字化转型', '机器学习'],
        status: 'pending',
        fetchTime: '2024-03-01 14:30:00',
        qualityScore: 4,
        isDuplicate: false
      },
      {
        id: 2,
        title: '央行发布新政策支持小微企业融资',
        content: '中国人民银行今日发布最新政策文件，旨在进一步支持小微企业融资，降低融资成本。新政策包括定向降准、专项再贷款等多项措施，预计将为小微企业提供更多流动性支持...',
        sourceId: 2,
        sourceName: '财经API接口',
        sourceType: 'api',
        originalUrl: 'https://example.com/article/2',
        category: 'policy',
        autoTags: ['央行政策', '小微企业', '融资', '金融政策'],
        status: 'pending',
        fetchTime: '2024-03-01 14:15:00',
        qualityScore: 5,
        isDuplicate: true,
        similarity: 85,
        duplicateGroupId: 'group_001'
      },
      {
        id: 3,
        title: '区块链技术在供应链管理中的创新实践',
        content: '区块链技术因其去中心化、不可篡改的特性，在供应链管理领域展现出巨大潜力。越来越多的企业开始探索区块链在商品溯源、物流跟踪、质量管控等环节的应用...',
        sourceId: 3,
        sourceName: '企业新闻爬虫',
        sourceType: 'crawler',
        originalUrl: 'https://example.com/article/3',
        category: 'tech',
        autoTags: ['区块链', '供应链', '技术创新', '企业管理'],
        status: 'pending',
        fetchTime: '2024-03-01 13:45:00',
        qualityScore: 3,
        isDuplicate: false
      }
    ]
    
    articleList.value = mockArticles
    pagination.total = mockArticles.length
  } catch (error) {
    ElMessage.error('获取资讯列表失败')
  } finally {
    loading.value = false
  }
}

const refreshList = async () => {
  await Promise.all([
    fetchArticleList(),
    fetchStats(),
    fetchSources()
  ])
  ElMessage.success('列表已刷新')
}

const handleSelectionChange = (val: NewsArticle[]) => {
  selectedArticles.value = val
}

const updateSelection = () => {
  selectedArticles.value = articleList.value.filter(article => 
    selectedIds.value.includes(article.id)
  )
}

const batchApprove = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要批量审核通过选中的 ${selectedArticles.value.length} 篇资讯吗？`,
      '批量审核确认',
      {
        confirmButtonText: '确定审核通过',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success(`已审核通过 ${selectedArticles.value.length} 篇资讯`)
    selectedArticles.value = []
    selectedIds.value = []
    fetchArticleList()
  } catch {}
}

const batchReject = () => {
  if (selectedArticles.value.length === 0) return
  
  rejectDialogVisible.value = true
}

const previewArticle = (article: NewsArticle) => {
  selectedArticle.value = article
  previewVisible.value = true
}

const editArticle = (article: NewsArticle) => {
  // 编辑功能将在下一个页面实现
  ElMessage.info('编辑功能正在开发中')
}

const approveArticle = async (article: NewsArticle) => {
  try {
    await ElMessageBox.confirm(
      `确定要审核通过这篇资讯吗？`,
      '审核确认',
      {
        confirmButtonText: '确定通过',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    
    ElMessage.success('资讯已审核通过')
    fetchArticleList()
  } catch {}
}

const rejectArticle = (article: NewsArticle) => {
  selectedArticle.value = article
  rejectDialogVisible.value = true
}

const editCurrentArticle = () => {
  if (selectedArticle.value) {
    editArticle(selectedArticle.value)
    previewVisible.value = false
  }
}

const approveCurrentArticle = () => {
  if (selectedArticle.value) {
    approveArticle(selectedArticle.value)
    previewVisible.value = false
  }
}

const rejectCurrentArticle = () => {
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectForm.reason) {
    ElMessage.warning('请选择拒绝原因')
    return
  }
  
  const targetArticles = selectedArticles.value.length > 0 ? selectedArticles.value : [selectedArticle.value!]
  
  ElMessage.success(`已拒绝 ${targetArticles.length} 篇资讯`)
  rejectDialogVisible.value = false
  previewVisible.value = false
  
  // 重置表单
  Object.assign(rejectForm, {
    reason: '',
    note: ''
  })
  
  selectedArticles.value = []
  selectedIds.value = []
  fetchArticleList()
}

const updateCategory = (article: NewsArticle) => {
  ElMessage.success('分类已更新')
}

const updateQualityScore = (article: NewsArticle) => {
  ElMessage.success('质量评分已更新')
}

const handleFilter = () => {
  pagination.currentPage = 1
  fetchArticleList()
}

const resetFilter = () => {
  Object.assign(filterForm, {
    keyword: '',
    sourceId: '',
    category: '',
    duplicateStatus: ''
  })
  handleFilter()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchArticleList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchArticleList()
}

onMounted(() => {
  refreshList()
})
</script>

<style scoped>
.content-pool {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.stats-dashboard {
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

.stat-value.primary { color: #409EFF; }
.stat-value.success { color: #67C23A; }
.stat-value.warning { color: #E6A23C; }
.stat-value.info { color: #909399; }

.stat-label {
  font-size: 14px;
  color: #666;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
}

.article-list-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.article-preview {
  padding: 12px 0;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.article-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0 10px 0 0;
  cursor: pointer;
  line-height: 1.4;
}

.article-title:hover {
  color: #409EFF;
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.fetch-time {
  font-size: 12px;
  color: #999;
}

.article-content {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.article-tags {
  display: flex;
  gap: 6px;
  align-items: center;
}

.more-tags {
  font-size: 12px;
  color: #999;
}

.similarity {
  font-size: 11px;
  color: #E6A23C;
  margin-top: 2px;
}

.card-view {
  min-height: 400px;
}

.article-card {
  margin-bottom: 16px;
  transition: all 0.3s;
}

.article-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-card.duplicate {
  border-left: 4px solid #E6A23C;
}

.card-content {
  height: 280px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 12px 0;
  cursor: pointer;
  line-height: 1.4;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-title:hover {
  color: #409EFF;
}

.card-content-text {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 12px;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
}

.card-tags {
  margin-bottom: 12px;
  min-height: 24px;
}

.card-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.duplicate-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 12px;
  color: #E6A23C;
  background: #fdf6ec;
  padding: 4px;
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.article-preview-dialog {
  max-height: 600px;
  overflow-y: auto;
}

.preview-meta {
  margin-bottom: 20px;
}

.preview-content {
  margin-bottom: 20px;
}

.preview-content h3 {
  margin-bottom: 12px;
  color: #333;
}

.content-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  line-height: 1.6;
  color: #333;
}

.preview-tags h4 {
  margin-bottom: 12px;
  color: #333;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>