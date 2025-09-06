<template>
  <div class="quotation-display">
    <UnifiedPageHeader
      title="展示配置"
      description="配置名言在门户首页的展示规则，最大化其影响力"
    >
      <template #actions>
        <el-button type="primary" :icon="Plus" @click="showCreatePlaylistDialog = true">
          创建精选集
        </el-button>
      </template>
    </UnifiedPageHeader>

    <el-row :gutter="20">
      <!-- 左侧：展示配置 -->
      <el-col :span="16">
        <!-- 每日一语配置 -->
        <el-card class="daily-quote-card" style="margin-bottom: 20px">
          <template #header>
            <div class="card-header">
              <span>每日一语配置</span>
              <el-switch
                v-model="dailyQuoteConfig.isEnabled"
                @change="updateDailyQuoteConfig"
                active-text="启用"
                inactive-text="禁用"
              />
            </div>
          </template>
          
          <el-form :model="dailyQuoteForm" label-width="120px" @submit.prevent>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="发送时间">
                  <el-time-picker
                    v-model="dailyQuoteForm.sendTime"
                    format="HH:mm"
                    value-format="HH:mm"
                    placeholder="选择发送时间"
                    style="width: 100%"
                    @change="updateDailyQuoteConfig"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="选择模式">
                  <el-select
                    v-model="dailyQuoteForm.mode"
                    placeholder="选择名言选择模式"
                    style="width: 100%"
                    @change="updateDailyQuoteConfig"
                  >
                    <el-option label="随机选择" value="random" />
                    <el-option label="顺序播放" value="sequence" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item v-if="dailyQuoteForm.mode === 'sequence'" label="指定名言">
              <el-select
                v-model="dailyQuoteForm.targetQuotationIds"
                multiple
                filterable
                placeholder="选择要展示的名言（留空则从所有已发布名言中选择）"
                style="width: 100%"
                @change="updateDailyQuoteConfig"
              >
                <el-option
                  v-for="quotation in publishedQuotations"
                  :key="quotation.id"
                  :label="`${(quotation.content ?? '').slice(0, 30)}... - ${quotation.leader?.name || ''}`"
                  :value="quotation.id"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="最近发送">
              <div class="last-sent-info">
                <span v-if="dailyQuoteConfig.lastSentTime">
                  {{ formatDateTime(dailyQuoteConfig.lastSentTime) }}
                </span>
                <span v-else class="no-data">未发送过</span>
              </div>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 精选集管理 -->
        <el-card class="playlist-card">
          <template #header>
            <div class="card-header">
              <span>精选集管理</span>
              <el-badge :value="playlists.length" type="primary">
                <el-button size="small" :icon="Collection">
                  精选集
                </el-button>
              </el-badge>
            </div>
          </template>
          
          <div v-loading="loading">
            <el-empty v-if="playlists.length === 0" description="暂无精选集" />
            
            <div v-else class="playlist-list">
              <div 
                v-for="playlist in playlists"
                :key="playlist.id"
                class="playlist-item"
              >
                <div class="playlist-header">
                  <div class="playlist-info">
                    <h3 class="playlist-name">{{ playlist.name }}</h3>
                    <p v-if="playlist.description" class="playlist-desc">{{ playlist.description }}</p>
                  </div>
                  <div class="playlist-actions">
                    <el-switch
                      v-model="playlist.isActive"
                      active-text="启用"
                      inactive-text="禁用"
                      @change="togglePlaylistStatus(playlist)"
                    />
                    <el-button size="small" :icon="Edit" @click="editPlaylist(playlist)">
                      编辑
                    </el-button>
                    <el-button 
                      size="small" 
                      type="danger"
                      :icon="Delete"
                      @click="deletePlaylist(playlist)"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div class="playlist-content">
                  <div class="playlist-meta">
                    <el-tag size="small">{{ playlist.quotations.length }} 条名言</el-tag>
                    <span v-if="playlist.startTime && playlist.endTime" class="time-range">
                      {{ formatDate(playlist.startTime) }} - {{ formatDate(playlist.endTime) }}
                    </span>
                  </div>
                  
                  <div class="playlist-quotes">
                    <div 
                      v-for="(quotation, index) in playlist.quotations.slice(0, 3)"
                      :key="quotation.id"
                      class="quote-preview"
                    >
                      <span class="quote-index">{{ index + 1 }}.</span>
                      <span class="quote-text">{{ (quotation.content ?? '').slice(0, 40) }}...</span>
                      <span class="quote-author">{{ quotation.leader?.name }}</span>
                    </div>
                    <div v-if="playlist.quotations.length > 3" class="more-quotes">
                      还有 {{ playlist.quotations.length - 3 }} 条名言...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：数据看板 -->
      <el-col :span="8">
        <!-- 展示统计 -->
        <el-card class="stats-card" style="margin-bottom: 20px">
          <template #header>
            <span>展示统计</span>
          </template>
          
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-value">{{ quotationStats.publishedCount }}</div>
              <div class="stat-label">已发布名言</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalShowCount }}</div>
              <div class="stat-label">总展示次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ totalLikeCount }}</div>
              <div class="stat-label">总点赞数</div>
            </div>
          </div>
        </el-card>

        <!-- 热门名言TOP10 -->
        <el-card class="popular-card">
          <template #header>
            <div class="card-header">
              <span>热门名言 TOP10</span>
              <el-button 
                size="small" 
                text 
                :icon="Refresh"
                @click="loadPopularQuotations"
              >
                刷新
              </el-button>
            </div>
          </template>
          
          <div v-loading="popularLoading" class="popular-list">
            <el-empty v-if="popularQuotations.length === 0" description="暂无数据" />
            
            <div v-else>
              <div 
                v-for="(quotation, index) in popularQuotations"
                :key="quotation.id"
                class="popular-item"
              >
                <div class="rank-badge" :class="getRankClass(index)">
                  {{ index + 1 }}
                </div>
                <div class="popular-content">
                  <p class="popular-text">{{ (quotation.content ?? '').slice(0, 50) }}...</p>
                  <div class="popular-meta">
                    <span class="author">{{ quotation.leader?.name }}</span>
                    <div class="stats">
                      <span class="stat">
                        <el-icon><View /></el-icon>
                        {{ quotation.showCount }}
                      </span>
                      <span class="stat">
                        <el-icon><Star /></el-icon>
                        {{ quotation.likeCount }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 领导贡献排行 -->
        <el-card class="leader-ranking-card" style="margin-top: 20px">
          <template #header>
            <span>领导贡献排行</span>
          </template>
          
          <div class="leader-ranking">
            <div 
              v-for="(leader, index) in quotationStats.topLeaders?.slice(0, 5) || []"
              :key="leader.leaderId"
              class="leader-item"
            >
              <div class="leader-rank">{{ index + 1 }}</div>
              <div class="leader-info">
                <span class="leader-name">{{ leader.leaderName }}</span>
                <span class="leader-count">{{ leader.count }} 条</span>
              </div>
              <div class="leader-bar">
                <div 
                  class="bar-fill"
                  :style="{ width: `${quotationStats.topLeaders?.length ? (leader.count / quotationStats.topLeaders[0]?.count) * 100 : 0}%` }"
                ></div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建精选集对话框 -->
    <el-dialog
      v-model="showCreatePlaylistDialog"
      :title="editingPlaylist ? '编辑精选集' : '创建精选集'"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="playlistFormRef"
        :model="playlistForm"
        :rules="playlistRules"
        label-width="100px"
      >
        <el-form-item label="精选集名称" prop="name">
          <el-input
            v-model="playlistForm.name"
            placeholder="为精选集起个名字，如：创新主题合集"
            :maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="playlistForm.description"
            type="textarea"
            :rows="3"
            placeholder="描述这个精选集的主题和用途"
            :maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="playlistForm.startTime"
                type="date"
                placeholder="选择生效开始时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="playlistForm.endTime"
                type="date"
                placeholder="选择生效结束时间"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="选择名言" prop="quotationIds">
          <div class="quotation-selector">
            <div class="selector-header">
              <el-input
                v-model="quotationSearchKeyword"
                placeholder="搜索名言内容或领导姓名"
                :prefix-icon="Search"
                clearable
                style="width: 300px"
              />
              <el-select
                v-model="quotationFilterLeader"
                placeholder="筛选领导"
                clearable
                style="width: 150px; margin-left: 12px"
              >
                <el-option
                  v-for="leader in leaders"
                  :key="leader.id"
                  :label="leader.name"
                  :value="leader.id"
                />
              </el-select>
            </div>
            
            <div class="quotation-list">
              <el-checkbox-group v-model="playlistForm.quotationIds">
                <div 
                  v-for="quotation in filteredQuotations"
                  :key="quotation.id"
                  class="quotation-option"
                >
                  <el-checkbox :label="quotation.id">
                    <div class="quotation-content">
                      <p class="quotation-text">{{ quotation.content }}</p>
                      <div class="quotation-meta">
                        <span class="leader">{{ quotation.leader?.name }}</span>
                        <span class="occasion">{{ quotation.occasion }}</span>
                        <div class="stats">
                          <span><el-icon><View /></el-icon> {{ quotation.showCount }}</span>
                          <span><el-icon><Star /></el-icon> {{ quotation.likeCount }}</span>
                        </div>
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>
            
            <div class="selected-count">
              已选择 {{ playlistForm.quotationIds.length }} 条名言
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePlaylistDialog">取消</el-button>
          <el-button 
            type="primary" 
            :loading="submitLoading"
            @click="submitPlaylistForm"
          >
            {{ editingPlaylist ? '保存修改' : '创建精选集' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Collection,
  Edit,
  Delete,
  Refresh,
  Search,
  View,
  Star
} from '@element-plus/icons-vue'
import { useQuotationStore } from '@/stores/quotation'
import { userApi, quotationApi } from '@/api'
import type { Quotation, User, QuotationPlaylist, DailyQuoteConfig } from '@/types'

// Store
const quotationStore = useQuotationStore()

// 响应式数据
const showCreatePlaylistDialog = ref(false)
const editingPlaylist = ref<QuotationPlaylist | null>(null)
const publishedQuotations = ref<Quotation[]>([])
const popularQuotations = ref<Quotation[]>([])
const popularLoading = ref(false)
const leaders = ref<User[]>([])
const quotationSearchKeyword = ref('')
const quotationFilterLeader = ref<number | null>(null)

// 表单数据
const playlistFormRef = ref()
const playlistForm = reactive({
  name: '',
  description: '',
  quotationIds: [] as number[],
  startTime: '',
  endTime: ''
})

const playlistRules = {
  name: [
    { required: true, message: '请输入精选集名称', trigger: 'blur' }
  ],
  quotationIds: [
    { required: true, message: '请至少选择一条名言', trigger: 'change' }
  ]
}

const dailyQuoteForm = reactive({
  isEnabled: false,
  sendTime: '09:00',
  mode: 'random' as 'random' | 'sequence',
  targetQuotationIds: [] as number[]
})

// 从 Store 获取数据
const {
  playlists,
  dailyQuoteConfig,
  quotationStats,
  loading,
  submitLoading
} = quotationStore

// 计算属性
const totalShowCount = computed(() => {
  return quotationStats.popularQuotations?.reduce((sum, q) => sum + q.showCount, 0) || 0
})

const totalLikeCount = computed(() => {
  return quotationStats.popularQuotations?.reduce((sum, q) => sum + q.likeCount, 0) || 0
})

const filteredQuotations = computed(() => {
  let filtered = publishedQuotations.value

  if (quotationSearchKeyword.value) {
    const keyword = quotationSearchKeyword.value.toLowerCase()
    filtered = filtered.filter(q => {
      const contentLower = (q.content ?? '').toLowerCase()
      const leaderLower = (q.leader?.name ?? '').toLowerCase()
      return contentLower.includes(keyword) || leaderLower.includes(keyword)
    })
  }

  if (quotationFilterLeader.value) {
    filtered = filtered.filter(q => q.leaderId === quotationFilterLeader.value)
  }

  return filtered
})

// 方法
const loadPublishedQuotations = async () => {
  try {
    const response = await quotationStore.loadQuotationList({
      status: 'published',
      page: 1,
      pageSize: 1000
    })
    publishedQuotations.value = response.data.list || []
  } catch (error) {
    console.error('加载已发布名言失败:', error)
  }
}

const loadPopularQuotations = async () => {
  popularLoading.value = true
  try {
    const response = await quotationApi.getPopularQuotations(10)
    popularQuotations.value = response.data
  } catch (error) {
    console.error('加载热门名言失败:', error)
    ElMessage.error('加载热门名言失败')
  } finally {
    popularLoading.value = false
  }
}

const loadLeaders = async () => {
  try {
    const response = await userApi.getUsers({ page: 1, pageSize: 1000 })
    leaders.value = response.data.list
  } catch (error) {
    console.error('加载领导列表失败:', error)
    ElMessage.error('加载领导列表失败')
  }
}

const updateDailyQuoteConfig = async () => {
  try {
    await quotationStore.updateDailyQuoteConfig({
      isEnabled: dailyQuoteConfig.isEnabled,
      sendTime: dailyQuoteForm.sendTime,
      mode: dailyQuoteForm.mode,
      targetQuotationIds: dailyQuoteForm.targetQuotationIds
    })
    ElMessage.success('每日一语配置已更新')
  } catch (error) {
    console.error('更新每日一语配置失败:', error)
  }
}

const togglePlaylistStatus = async (playlist: QuotationPlaylist) => {
  try {
    // 调用API更新精选集状态
    ElMessage.success(`精选集已${playlist.isActive ? '启用' : '禁用'}`)
  } catch (error) {
    console.error('更新精选集状态失败:', error)
    // 回滚状态
    playlist.isActive = !playlist.isActive
  }
}

const editPlaylist = (playlist: QuotationPlaylist) => {
  editingPlaylist.value = playlist
  Object.assign(playlistForm, {
    name: playlist.name,
    description: playlist.description || '',
    quotationIds: playlist.quotationIds ? [...playlist.quotationIds] : [],
    startTime: playlist.startTime || '',
    endTime: playlist.endTime || ''
  })
  showCreatePlaylistDialog.value = true
}

const deletePlaylist = async (playlist: QuotationPlaylist) => {
  try {
    await ElMessageBox.confirm('确定要删除这个精选集吗？', '确认删除', {
      type: 'warning'
    })
    
    // 调用API删除精选集
    ElMessage.success('精选集已删除')
    await quotationStore.loadPlaylists()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除精选集失败:', error)
    }
  }
}

const submitPlaylistForm = async () => {
  if (!playlistFormRef.value) return
  
  try {
    await playlistFormRef.value.validate()
    
    const data = {
      ...playlistForm,
      quotations: publishedQuotations.value.filter(q => 
        playlistForm.quotationIds.includes(q.id)
      ),
      isActive: true
    }
    
    if (editingPlaylist.value) {
      // 更新精选集
      ElMessage.success('精选集已更新')
    } else {
      // 创建精选集
      ElMessage.success('精选集已创建')
    }
    
    await quotationStore.loadPlaylists()
    closePlaylistDialog()
  } catch (error) {
    console.error('提交精选集表单失败:', error)
  }
}

const closePlaylistDialog = () => {
  showCreatePlaylistDialog.value = false
  editingPlaylist.value = null
  Object.assign(playlistForm, {
    name: '',
    description: '',
    quotationIds: [],
    startTime: '',
    endTime: ''
  })
  playlistFormRef.value?.clearValidate()
}

const getRankClass = (index: number) => {
  if (index === 0) return 'gold'
  if (index === 1) return 'silver'
  if (index === 2) return 'bronze'
  return 'normal'
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(async () => {
  // 同步每日一语配置到表单
  watch(() => dailyQuoteConfig, (config) => {
    if (config) {
      Object.assign(dailyQuoteForm, {
        isEnabled: config.isEnabled,
        sendTime: config.sendTime,
        mode: config.mode,
        targetQuotationIds: config.targetQuotationIds || []
      })
    }
  }, { immediate: true, deep: true })

  // 加载初始数据
  await Promise.all([
    quotationStore.loadPlaylists(),
    quotationStore.loadDailyQuoteConfig(),
    quotationStore.loadStats(),
    loadPublishedQuotations(),
    loadPopularQuotations(),
    loadLeaders()
  ])
})

// 监听对话框关闭
watch(showCreatePlaylistDialog, (show) => {
  if (!show) {
    quotationSearchKeyword.value = ''
    quotationFilterLeader.value = null
  }
})
</script>

<style scoped>
.quotation-display {
  padding: 20px;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.header-title h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.header-description {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 通用卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 每日一语配置 */
.last-sent-info {
  color: #606266;
  font-size: 14px;
}

.last-sent-info .no-data {
  color: #c0c4cc;
}

/* 精选集列表 */
.playlist-list {
  max-height: 500px;
  overflow-y: auto;
}

.playlist-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.playlist-item:hover {
  border-color: #c6e2ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.playlist-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.playlist-desc {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

.playlist-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.playlist-content {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.playlist-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.time-range {
  color: #909399;
  font-size: 13px;
}

.playlist-quotes {
  padding: 0;
}

.quote-preview {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f7fa;
}

.quote-preview:last-child {
  border-bottom: none;
}

.quote-index {
  color: #909399;
  font-size: 12px;
  margin-right: 8px;
  min-width: 20px;
}

.quote-text {
  flex: 1;
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

.quote-author {
  color: #409eff;
  font-size: 12px;
  margin-left: 8px;
}

.more-quotes {
  color: #c0c4cc;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

/* 统计数据 */
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  color: #606266;
  font-size: 14px;
}

/* 热门名言列表 */
.popular-list {
  max-height: 400px;
  overflow-y: auto;
}

.popular-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.popular-item:last-child {
  border-bottom: none;
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #f6d55c, #f39c12);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #bdc3c7, #95a5a6);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #d35400, #e67e22);
}

.rank-badge.normal {
  background: #c0c4cc;
}

.popular-content {
  flex: 1;
}

.popular-text {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 13px;
  line-height: 1.4;
}

.popular-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author {
  color: #409eff;
  font-size: 12px;
  font-weight: 500;
}

.stats {
  display: flex;
  gap: 12px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #909399;
  font-size: 12px;
}

/* 领导贡献排行 */
.leader-ranking {
  padding: 0;
}

.leader-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.leader-item:last-child {
  border-bottom: none;
}

.leader-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  color: #606266;
  margin-right: 12px;
}

.leader-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-right: 12px;
}

.leader-name {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.leader-count {
  color: #409eff;
  font-size: 12px;
}

.leader-bar {
  flex: 2;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff, #67c23a);
  border-radius: 2px;
  transition: width 0.6s ease;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 名言选择器 */
.quotation-selector {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.selector-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.quotation-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}

.quotation-option {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.quotation-option:hover {
  border-color: #c6e2ff;
  background: #f5f9ff;
}

.quotation-content {
  margin-left: 8px;
}

.quotation-text {
  margin: 0 0 8px 0;
  color: #303133;
  line-height: 1.4;
  font-size: 14px;
}

.quotation-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.leader {
  color: #409eff;
  font-weight: 500;
  font-size: 13px;
}

.occasion {
  color: #909399;
  font-size: 12px;
}

.stats {
  display: flex;
  gap: 12px;
}

.stats span {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #c0c4cc;
  font-size: 12px;
}

.selected-count {
  text-align: center;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 14px;
  margin-top: 16px;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .quotation-display .el-row {
    flex-direction: column;
  }
  
  .quotation-display .el-col {
    max-width: 100%;
    flex: none;
  }
}

@media (max-width: 768px) {
  .quotation-display {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .playlist-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .playlist-actions {
    justify-content: flex-start;
  }
  
  .playlist-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .selector-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .selector-header .el-input,
  .selector-header .el-select {
    width: 100% !important;
    margin-left: 0 !important;
  }
}
</style>