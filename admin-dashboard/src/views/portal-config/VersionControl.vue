<template>
  <div class="version-control">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h2 class="page-title">
            <i class="el-icon-time title-icon"></i>
            版本管理
          </h2>
          <p class="page-description">管理门户配置的版本历史，支持版本对比、回滚和快照创建</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showSnapshotDialog = true" class="action-btn">
            <i class="el-icon-camera" class="btn-icon"></i>
            创建快照
          </el-button>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon total">
          <i class="el-icon-folder-opened"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.totalVersions }}</div>
          <div class="stat-label">总版本数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon active">
          <i class="el-icon-circle-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.activeVersion }}</div>
          <div class="stat-label">当前版本</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon recent">
          <i class="el-icon-refresh"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.recentUpdates }}</div>
          <div class="stat-label">最近更新</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon rollback">
          <i class="el-icon-refresh-left"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ statistics.rollbackCount }}</div>
          <div class="stat-label">回滚次数</div>
        </div>
      </div>
    </div>

    <!-- 版本列表 -->
    <div class="version-list-container">
      <div class="container-header">
        <h3 class="container-title">版本历史</h3>
        <div class="header-filters">
          <el-input
            v-model="searchQuery"
            placeholder="搜索版本..."
            prefix-icon="el-icon-search"
            class="search-input"
            clearable
          />
          <el-select v-model="filterType" placeholder="筛选类型" class="filter-select">
            <el-option label="全部" value="all" />
            <el-option label="手动快照" value="manual" />
            <el-option label="自动备份" value="auto" />
            <el-option label="发布版本" value="release" />
          </el-select>
        </div>
      </div>

      <div class="version-timeline">
        <div
          v-for="(version, index) in filteredVersions"
          :key="version.id"
          :class="[
            'timeline-item',
            { 'active': version.is_current, 'first': index === 0 }
          ]"
        >
          <div class="timeline-dot">
            <i :class="getVersionIcon(version.type)" class="dot-icon"></i>
          </div>
          
          <div class="version-card">
            <div class="card-header">
              <div class="version-info">
                <div class="version-title-row">
                  <h4 class="version-title">{{ version.name }}</h4>
                  <el-tag
                    :type="getVersionTagType(version.type)"
                    class="version-tag"
                  >
                    {{ getVersionTypeText(version.type) }}
                  </el-tag>
                  <el-tag v-if="version.is_current" type="success" class="current-tag">
                    当前版本
                  </el-tag>
                </div>
                <p class="version-description">{{ version.description }}</p>
              </div>
              <div class="version-meta">
                <div class="meta-item">
                  <i class="el-icon-user" class="meta-icon"></i>
                  <span>{{ version.created_by_name }}</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-time" class="meta-icon"></i>
                  <span>{{ formatDate(version.created_at) }}</span>
                </div>
                <div class="meta-item">
                  <i class="el-icon-data-line" class="meta-icon"></i>
                  <span>v{{ version.version_number }}</span>
                </div>
              </div>
            </div>

            <div class="card-content">
              <div class="change-summary">
                <div class="change-stats">
                  <div class="change-item added">
                    <i class="el-icon-plus" class="change-icon"></i>
                    <span>{{ version.changes?.added || 0 }} 新增</span>
                  </div>
                  <div class="change-item modified">
                    <i class="el-icon-edit" class="change-icon"></i>
                    <span>{{ version.changes?.modified || 0 }} 修改</span>
                  </div>
                  <div class="change-item removed">
                    <i class="el-icon-minus" class="change-icon"></i>
                    <span>{{ version.changes?.removed || 0 }} 删除</span>
                  </div>
                </div>
                <div class="config-preview" v-if="version.config_preview">
                  <span class="preview-label">配置预览:</span>
                  <span class="preview-text">{{ version.config_preview }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <el-button-group class="action-group">
                <el-button
                  size="small"
                  @click="previewVersion(version)"
                  class="action-btn-small"
                >
                  <i class="el-icon-view" class="btn-icon"></i>
                  预览
                </el-button>
                <el-button
                  size="small"
                  @click="compareVersion(version)"
                  class="action-btn-small"
                >
                  <i class="el-icon-document-copy" class="btn-icon"></i>
                  对比
                </el-button>
                <el-button
                  v-if="!version.is_current"
                  size="small"
                  type="warning"
                  @click="rollbackToVersion(version)"
                  class="action-btn-small"
                >
                  <i class="el-icon-refresh-left" class="btn-icon"></i>
                  回滚
                </el-button>
                <el-button
                  v-if="version.type === 'manual' && !version.is_current"
                  size="small"
                  type="danger"
                  @click="deleteVersion(version)"
                  class="action-btn-small"
                >
                  <i class="el-icon-delete" class="btn-icon"></i>
                  删除
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore">
        <el-button @click="loadMoreVersions" :loading="loadingMore" class="load-more-btn">
          <i class="el-icon-download" class="btn-icon"></i>
          加载更多版本
        </el-button>
      </div>
    </div>

    <!-- 快照创建对话框 -->
    <SnapshotDialog
      v-model="showSnapshotDialog"
      @confirm="handleSnapshotCreate"
    />

    <!-- 版本预览对话框 -->
    <el-dialog
      v-model="showPreviewDialog"
      title="版本预览"
      width="80%"
      class="version-preview-dialog"
    >
      <div v-if="previewVersion" class="preview-content">
        <div class="preview-header">
          <h4>{{ previewVersion.name }} (v{{ previewVersion.version_number }})</h4>
          <p>{{ previewVersion.description }}</p>
        </div>
        <div class="preview-config">
          <pre class="config-json">{{ formatConfig(previewVersion.config_data) }}</pre>
        </div>
      </div>
    </el-dialog>

    <!-- 版本对比对话框 -->
    <el-dialog
      v-model="showCompareDialog"
      title="版本对比"
      width="90%"
      class="version-compare-dialog"
    >
      <div class="compare-content">
        <div class="compare-header">
          <div class="compare-selector">
            <label>对比版本:</label>
            <el-select v-model="compareTargetId" placeholder="选择对比版本">
              <el-option
                v-for="version in versions"
                :key="version.id"
                :label="`${version.name} (v${version.version_number})`"
                :value="version.id"
                :disabled="version.id === compareSourceId"
              />
            </el-select>
          </div>
        </div>
        <div class="compare-result" v-if="compareTargetId">
          <div class="diff-viewer">
            <div class="diff-section">
              <h5>当前版本</h5>
              <pre class="diff-content source">{{ formatConfig(getVersionById(compareSourceId)?.config_data) }}</pre>
            </div>
            <div class="diff-section">
              <h5>对比版本</h5>
              <pre class="diff-content target">{{ formatConfig(getVersionById(compareTargetId)?.config_data) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SnapshotDialog from './components/SnapshotDialog.vue'
import type { ConfigVersion } from '@/types/navigation'

const showSnapshotDialog = ref(false)
const showPreviewDialog = ref(false)
const showCompareDialog = ref(false)
const searchQuery = ref('')
const filterType = ref('all')
const loadingMore = ref(false)
const hasMore = ref(true)

const previewVersion = ref<ConfigVersion | null>(null)
const compareSourceId = ref<number>(0)
const compareTargetId = ref<number>(0)

const statistics = reactive({
  totalVersions: 12,
  activeVersion: 'v2.1.0',
  recentUpdates: 3,
  rollbackCount: 2
})

const versions = ref<ConfigVersion[]>([
  {
    id: 1,
    name: '导航菜单重构',
    description: '重构了主导航菜单结构，优化了用户体验',
    version_number: '2.1.0',
    type: 'release',
    config_data: {},
    config_preview: '主导航: 5个菜单项，入口面板: 3个面板',
    changes: { added: 2, modified: 3, removed: 1 },
    is_current: true,
    created_by: 1,
    created_by_name: '张三',
    created_at: '2024-01-15 14:30:00'
  },
  {
    id: 2,
    name: '添加新功能入口',
    description: '在主页添加了数据分析和报告功能的快速入口',
    version_number: '2.0.5',
    type: 'manual',
    config_data: {},
    config_preview: '主导航: 4个菜单项，入口面板: 2个面板',
    changes: { added: 1, modified: 1, removed: 0 },
    is_current: false,
    created_by: 2,
    created_by_name: '李四',
    created_at: '2024-01-14 09:15:00'
  },
  {
    id: 3,
    name: '自动备份',
    description: '系统自动创建的配置备份',
    version_number: '2.0.4',
    type: 'auto',
    config_data: {},
    config_preview: '主导航: 4个菜单项，入口面板: 2个面板',
    changes: { added: 0, modified: 0, removed: 0 },
    is_current: false,
    created_by: 0,
    created_by_name: '系统',
    created_at: '2024-01-13 16:00:00'
  }
])

const filteredVersions = computed(() => {
  let filtered = versions.value
  
  if (searchQuery.value) {
    filtered = filtered.filter(version => 
      version.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      version.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  if (filterType.value !== 'all') {
    filtered = filtered.filter(version => version.type === filterType.value)
  }
  
  return filtered
})

const getVersionIcon = (type: string) => {
  switch (type) {
    case 'release': return 'el-icon-star-on'
    case 'manual': return 'el-icon-camera'
    case 'auto': return 'el-icon-refresh'
    default: return 'el-icon-document'
  }
}

const getVersionTagType = (type: string) => {
  switch (type) {
    case 'release': return 'success'
    case 'manual': return 'primary'
    case 'auto': return 'info'
    default: return ''
  }
}

const getVersionTypeText = (type: string) => {
  switch (type) {
    case 'release': return '发布版本'
    case 'manual': return '手动快照'
    case 'auto': return '自动备份'
    default: return '未知类型'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const formatConfig = (config: any) => {
  return JSON.stringify(config, null, 2)
}

const getVersionById = (id: number) => {
  return versions.value.find(v => v.id === id)
}

const previewVersion = (version: ConfigVersion) => {
  previewVersion.value = version
  showPreviewDialog.value = true
}

const compareVersion = (version: ConfigVersion) => {
  compareSourceId.value = version.id
  compareTargetId.value = 0
  showCompareDialog.value = true
}

const rollbackToVersion = async (version: ConfigVersion) => {
  try {
    await ElMessageBox.confirm(
      `确定要回滚到版本 "${version.name}" (v${version.version_number}) 吗？此操作将覆盖当前配置。`,
      '确认回滚',
      {
        type: 'warning',
        confirmButtonText: '确定回滚',
        cancelButtonText: '取消'
      }
    )
    
    // TODO: 调用API进行回滚
    ElMessage.success('版本回滚成功')
    
    // 更新当前版本标记
    versions.value.forEach(v => v.is_current = false)
    version.is_current = true
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('回滚失败，请重试')
    }
  }
}

const deleteVersion = async (version: ConfigVersion) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除版本 "${version.name}" (v${version.version_number}) 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    // TODO: 调用API删除版本
    const index = versions.value.findIndex(v => v.id === version.id)
    if (index > -1) {
      versions.value.splice(index, 1)
    }
    
    ElMessage.success('版本删除成功')
    
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请重试')
    }
  }
}

const handleSnapshotCreate = (data: any) => {
  // TODO: 调用API创建快照
  console.log('创建快照:', data)
  ElMessage.success('快照创建成功')
}

const loadMoreVersions = async () => {
  loadingMore.value = true
  try {
    // TODO: 调用API加载更多版本
    await new Promise(resolve => setTimeout(resolve, 1000))
    hasMore.value = false
  } catch (error) {
    ElMessage.error('加载失败，请重试')
  } finally {
    loadingMore.value = false
  }
}

onMounted(() => {
  // TODO: 加载版本数据
})
</script>

<style scoped>
.version-control {
  padding: 24px;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-section {
  flex: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 32px;
  opacity: 0.9;
}

.page-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 12px 24px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.btn-icon {
  font-size: 16px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;

  &.total {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.active {
    background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  }

  &.recent {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.rollback {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  }
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
}

.version-list-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.container-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 24px 32px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.container-title {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.header-filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-input {
  width: 300px;

  :deep(.el-input__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.filter-select {
  width: 150px;

  :deep(.el-select__wrapper) {
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.version-timeline {
  padding: 32px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 79px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
    opacity: 0.3;
  }
}

.timeline-item {
  display: flex;
  margin-bottom: 32px;
  position: relative;

  &.first .timeline-dot {
    background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
    transform: scale(1.2);
    box-shadow: 0 4px 16px rgba(86, 171, 47, 0.4);
  }

  &.active .version-card {
    border: 2px solid #56ab2f;
    box-shadow: 0 8px 30px rgba(86, 171, 47, 0.2);
  }
}

.timeline-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.dot-icon {
  color: white;
  font-size: 18px;
}

.version-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.card-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 1px solid #e9ecef;
}

.version-info {
  margin-bottom: 16px;
}

.version-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.version-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.version-tag {
  font-size: 12px;
  font-weight: 500;
}

.current-tag {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  border: none;
  color: white;
  font-weight: 600;
}

.version-description {
  color: #6c757d;
  margin: 0;
  line-height: 1.6;
}

.version-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6c757d;
  font-size: 14px;
}

.meta-icon {
  font-size: 14px;
  opacity: 0.7;
}

.card-content {
  padding: 20px 24px;
}

.change-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.change-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.change-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;

  &.added {
    color: #28a745;
  }

  &.modified {
    color: #007bff;
  }

  &.removed {
    color: #dc3545;
  }
}

.change-icon {
  font-size: 14px;
}

.config-preview {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.preview-label {
  color: #6c757d;
  font-size: 12px;
  font-weight: 500;
  margin-right: 8px;
}

.preview-text {
  color: #495057;
  font-size: 14px;
}

.card-actions {
  padding: 16px 24px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.action-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn-small {
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 6px 12px;
}

.load-more {
  padding: 32px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.load-more-btn {
  border-radius: 10px;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
}

.version-preview-dialog,
.version-compare-dialog {
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
  }

  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
}

.preview-content {
  padding: 16px;
}

.preview-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.preview-header h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.preview-header p {
  margin: 0;
  color: #6c757d;
}

.config-json {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
}

.compare-content {
  padding: 16px;
}

.compare-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.compare-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compare-selector label {
  font-weight: 600;
  color: #2c3e50;
}

.diff-viewer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.diff-section h5 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.diff-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 12px;
  line-height: 1.5;
  overflow-x: auto;
  max-height: 400px;

  &.source {
    border-left: 4px solid #28a745;
  }

  &.target {
    border-left: 4px solid #007bff;
  }
}

@media (max-width: 768px) {
  .version-control {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .container-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .header-filters {
    flex-direction: column;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }

  .version-timeline::before {
    left: 19px;
  }

  .timeline-dot {
    width: 20px;
    height: 20px;
    margin-right: 16px;
  }

  .dot-icon {
    font-size: 12px;
  }

  .version-meta {
    flex-direction: column;
    gap: 8px;
  }

  .change-stats {
    flex-direction: column;
    gap: 12px;
  }

  .diff-viewer {
    grid-template-columns: 1fr;
  }
}
</style>