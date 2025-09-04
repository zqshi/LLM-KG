<template>
  <div class="homepage-page">
    <div class="page-header">
      <h1 class="page-title">首页管理</h1>
      <div class="page-actions">
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          预览首页
        </el-button>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧配置面板 -->
      <el-col :span="16">
        <div class="config-panels">
          <!-- Banner轮播图管理 -->
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <span>Banner轮播图</span>
                <el-button type="primary" size="small" @click="handleAddBanner">
                  <el-icon><Plus /></el-icon>
                  添加Banner
                </el-button>
              </div>
            </template>
            
            <div class="banner-list">
              <draggable
                v-model="bannerList"
                @end="updateBannerOrder"
                class="drag-list"
                item-key="id"
              >
                <template #item="{ element: banner, index }">
                  <div class="banner-item">
                    <div class="banner-drag">
                      <el-icon><Rank /></el-icon>
                    </div>
                    <div class="banner-image">
                      <img :src="banner.image || '/placeholder-banner.jpg'" :alt="banner.title" />
                    </div>
                    <div class="banner-info">
                      <div class="banner-title">{{ banner.title }}</div>
                      <div class="banner-meta">
                        <span class="banner-link">{{ banner.link || '无链接' }}</span>
                        <el-tag :type="banner.isActive ? 'success' : 'danger'" size="small">
                          {{ banner.isActive ? '已启用' : '已禁用' }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="banner-actions">
                      <el-button size="small" @click="handleEditBanner(banner)">编辑</el-button>
                      <el-button size="small" @click="toggleBannerStatus(banner)">
                        {{ banner.isActive ? '禁用' : '启用' }}
                      </el-button>
                      <el-button size="small" type="danger" @click="deleteBanner(index)">
                        删除
                      </el-button>
                    </div>
                  </div>
                </template>
              </draggable>
              
              <div v-if="bannerList.length === 0" class="empty-placeholder">
                暂无Banner，点击右上角按钮添加
              </div>
            </div>
          </el-card>

          <!-- 推荐位管理 -->
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <span>推荐位配置</span>
                <el-switch
                  v-model="recommendConfig.enabled"
                  active-text="启用推荐位"
                  inactive-text="禁用推荐位"
                />
              </div>
            </template>
            
            <div class="recommend-config">
              <el-form :model="recommendConfig" label-width="120px">
                <el-form-item label="显示数量">
                  <el-input-number
                    v-model="recommendConfig.count"
                    :min="1"
                    :max="20"
                    style="width: 200px"
                  />
                </el-form-item>
                
                <el-form-item label="更新频率">
                  <el-radio-group v-model="recommendConfig.updateFrequency">
                    <el-radio value="realtime">实时更新</el-radio>
                    <el-radio value="hourly">每小时</el-radio>
                    <el-radio value="daily">每日</el-radio>
                  </el-radio-group>
                </el-form-item>
                
                <el-form-item label="推荐算法">
                  <el-checkbox-group v-model="recommendConfig.algorithms">
                    <el-checkbox value="hot">热门内容</el-checkbox>
                    <el-checkbox value="latest">最新发布</el-checkbox>
                    <el-checkbox value="manual">人工推荐</el-checkbox>
                    <el-checkbox value="personalized">个性化推荐</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 排行榜配置 -->
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <span>排行榜设置</span>
                <el-switch
                  v-model="rankingConfig.enabled"
                  active-text="显示排行榜"
                  inactive-text="隐藏排行榜"
                />
              </div>
            </template>
            
            <div class="ranking-config">
              <el-form :model="rankingConfig" label-width="120px">
                <el-form-item label="排行榜类型">
                  <el-checkbox-group v-model="rankingConfig.types">
                    <el-checkbox value="user">用户活跃榜</el-checkbox>
                    <el-checkbox value="content">热门内容榜</el-checkbox>
                    <el-checkbox value="department">部门贡献榜</el-checkbox>
                    <el-checkbox value="newcomer">新人榜</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                
                <el-form-item label="显示条数">
                  <el-input-number
                    v-model="rankingConfig.itemCount"
                    :min="3"
                    :max="50"
                    style="width: 200px"
                  />
                </el-form-item>
                
                <el-form-item label="统计周期">
                  <el-radio-group v-model="rankingConfig.period">
                    <el-radio value="daily">日榜</el-radio>
                    <el-radio value="weekly">周榜</el-radio>
                    <el-radio value="monthly">月榜</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>
          </el-card>

          <!-- 版块排序 -->
          <el-card class="config-card">
            <template #header>
              <div class="card-header">
                <span>版块显示排序</span>
                <span class="header-tip">拖拽调整版块在首页的显示顺序</span>
              </div>
            </template>
            
            <div class="section-order">
              <draggable
                v-model="sectionOrder"
                @end="updateSectionOrder"
                class="section-drag-list"
                item-key="id"
              >
                <template #item="{ element: section }">
                  <div class="section-item">
                    <div class="section-drag">
                      <el-icon><Rank /></el-icon>
                    </div>
                    <div class="section-info">
                      <div class="section-name">{{ section.name }}</div>
                      <div class="section-desc">{{ section.description }}</div>
                    </div>
                    <div class="section-toggle">
                      <el-switch
                        v-model="section.visible"
                        active-text="显示"
                        inactive-text="隐藏"
                        size="small"
                      />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧预览面板 -->
      <el-col :span="8">
        <div class="preview-panel">
          <el-card>
            <template #header>
              <span>首页预览</span>
            </template>
            
            <div class="homepage-preview">
              <!-- Banner预览 -->
              <div v-if="bannerList.length > 0" class="preview-section">
                <h4 class="preview-title">轮播图</h4>
                <div class="preview-banner">
                  <img
                    :src="bannerList[0]?.image || '/placeholder-banner.jpg'"
                    :alt="bannerList[0]?.title"
                    class="preview-banner-img"
                  />
                  <div class="banner-indicators">
                    <span
                      v-for="(banner, index) in bannerList.slice(0, 3)"
                      :key="index"
                      class="indicator"
                      :class="{ active: index === 0 }"
                    ></span>
                  </div>
                </div>
              </div>

              <!-- 推荐位预览 -->
              <div v-if="recommendConfig.enabled" class="preview-section">
                <h4 class="preview-title">
                  推荐内容
                  <span class="section-count">({{ recommendConfig.count }}条)</span>
                </h4>
                <div class="preview-recommend">
                  <div
                    v-for="i in Math.min(3, recommendConfig.count)"
                    :key="i"
                    class="recommend-item"
                  >
                    <div class="recommend-title">推荐内容标题 {{ i }}</div>
                    <div class="recommend-meta">作者 · 2小时前</div>
                  </div>
                </div>
              </div>

              <!-- 版块预览 -->
              <div
                v-for="section in sectionOrder.filter(s => s.visible)"
                :key="section.id"
                class="preview-section"
              >
                <h4 class="preview-title">{{ section.name }}</h4>
                <div class="preview-content">
                  <div
                    v-for="i in 3"
                    :key="i"
                    class="content-item"
                  >
                    <div class="content-title">{{ section.name }}内容 {{ i }}</div>
                    <div class="content-meta">作者 · 1天前</div>
                  </div>
                </div>
              </div>

              <!-- 排行榜预览 -->
              <div v-if="rankingConfig.enabled" class="preview-section">
                <h4 class="preview-title">
                  排行榜
                  <span class="section-count">({{ rankingConfig.period }})</span>
                </h4>
                <div class="preview-ranking">
                  <div
                    v-for="i in Math.min(5, rankingConfig.itemCount)"
                    :key="i"
                    class="ranking-item"
                  >
                    <span class="ranking-number">{{ i }}</span>
                    <span class="ranking-name">用户{{ i }}</span>
                    <span class="ranking-score">{{ 100 - i * 10 }}分</span>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>

    <!-- Banner编辑对话框 -->
    <el-dialog
      v-model="bannerDialogVisible"
      :title="isEditBanner ? '编辑Banner' : '添加Banner'"
      width="600px"
      @close="handleBannerDialogClose"
    >
      <el-form
        ref="bannerFormRef"
        :model="bannerForm"
        :rules="bannerFormRules"
        label-width="100px"
      >
        <el-form-item label="Banner标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入Banner标题" />
        </el-form-item>
        
        <el-form-item label="Banner图片" prop="image">
          <div class="image-upload">
            <el-input
              v-model="bannerForm.image"
              placeholder="请输入图片URL或上传图片"
            />
            <el-button style="margin-left: 10px">上传图片</el-button>
          </div>
          <div v-if="bannerForm.image" class="image-preview">
            <img :src="bannerForm.image" alt="预览" />
          </div>
        </el-form-item>
        
        <el-form-item label="跳转链接" prop="link">
          <el-input
            v-model="bannerForm.link"
            placeholder="请输入点击后跳转的链接（可选）"
          />
        </el-form-item>
        
        <el-form-item label="显示位置" prop="position">
          <el-radio-group v-model="bannerForm.position">
            <el-radio value="top">顶部轮播</el-radio>
            <el-radio value="middle">中部横幅</el-radio>
            <el-radio value="sidebar">侧边栏</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="展示时间">
          <el-date-picker
            v-model="bannerForm.displayTime"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="isActive">
          <el-switch
            v-model="bannerForm.isActive"
            active-text="启用"
            inactive-text="禁用"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="bannerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBannerSave" :loading="saveLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import draggable from 'vuedraggable'
import {
  View, Check, Plus, Rank
} from '@element-plus/icons-vue'

interface Banner {
  id: number
  title: string
  image: string
  link: string
  position: 'top' | 'middle' | 'sidebar'
  displayTime: [string, string] | null
  isActive: boolean
  sortOrder: number
}

interface Section {
  id: number
  name: string
  description: string
  visible: boolean
  sortOrder: number
}

const bannerFormRef = ref<FormInstance>()
const bannerDialogVisible = ref(false)
const isEditBanner = ref(false)
const saveLoading = ref(false)
const editingBannerIndex = ref(-1)

const bannerForm = reactive({
  title: '',
  image: '',
  link: '',
  position: 'top' as 'top' | 'middle' | 'sidebar',
  displayTime: null as [string, string] | null,
  isActive: true
})

const bannerList = ref<Banner[]>([])

const recommendConfig = reactive({
  enabled: true,
  count: 6,
  updateFrequency: 'daily' as 'realtime' | 'hourly' | 'daily',
  algorithms: ['hot', 'latest']
})

const rankingConfig = reactive({
  enabled: true,
  types: ['user', 'content'],
  itemCount: 10,
  period: 'weekly' as 'daily' | 'weekly' | 'monthly'
})

const sectionOrder = ref<Section[]>([])

const bannerFormRules: FormRules = {
  title: [
    { required: true, message: '请输入Banner标题', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请输入Banner图片', trigger: 'blur' }
  ]
}

const mockBannerData = (): Banner[] => [
  {
    id: 1,
    title: '企业知识分享平台正式上线',
    image: '/api/placeholder/800/300?text=Banner1',
    link: '/announcement/1',
    position: 'top',
    displayTime: null,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 2,
    title: '年度优秀员工评选活动开始',
    image: '/api/placeholder/800/300?text=Banner2',
    link: '/activity/annual-award',
    position: 'top',
    displayTime: null,
    isActive: true,
    sortOrder: 2
  }
]

const mockSectionData = (): Section[] => [
  { id: 1, name: '技术分享', description: '最新技术文章和经验分享', visible: true, sortOrder: 1 },
  { id: 2, name: '产品心得', description: '产品设计和用户体验', visible: true, sortOrder: 2 },
  { id: 3, name: '企业文化', description: '公司文化和团建活动', visible: true, sortOrder: 3 },
  { id: 4, name: '行业动态', description: '行业资讯和趋势分析', visible: false, sortOrder: 4 },
  { id: 5, name: '培训资料', description: '内部培训和学习资源', visible: true, sortOrder: 5 }
]

const loadData = () => {
  bannerList.value = mockBannerData()
  sectionOrder.value = mockSectionData()
}

const handleAddBanner = () => {
  isEditBanner.value = false
  editingBannerIndex.value = -1
  resetBannerForm()
  bannerDialogVisible.value = true
}

const handleEditBanner = (banner: Banner) => {
  isEditBanner.value = true
  editingBannerIndex.value = bannerList.value.findIndex(b => b.id === banner.id)
  Object.keys(bannerForm).forEach(key => {
    ;(bannerForm as any)[key] = (banner as any)[key] || (key === 'isActive' ? true : '')
  })
  bannerDialogVisible.value = true
}

const resetBannerForm = () => {
  Object.keys(bannerForm).forEach(key => {
    if (key === 'position') {
      bannerForm[key] = 'top'
    } else if (key === 'isActive') {
      bannerForm[key] = true
    } else {
      ;(bannerForm as any)[key] = key === 'displayTime' ? null : ''
    }
  })
}

const handleBannerDialogClose = () => {
  bannerFormRef.value?.resetFields()
  resetBannerForm()
}

const handleBannerSave = () => {
  if (!bannerFormRef.value) return
  
  bannerFormRef.value.validate((valid) => {
    if (valid) {
      saveLoading.value = true
      setTimeout(() => {
        if (isEditBanner.value && editingBannerIndex.value >= 0) {
          // 更新现有Banner
          const banner = bannerList.value[editingBannerIndex.value]
          Object.keys(bannerForm).forEach(key => {
            ;(banner as any)[key] = (bannerForm as any)[key]
          })
        } else {
          // 添加新Banner
          const newBanner: Banner = {
            id: Date.now(),
            ...bannerForm,
            sortOrder: bannerList.value.length + 1
          }
          bannerList.value.push(newBanner)
        }
        
        saveLoading.value = false
        bannerDialogVisible.value = false
        ElMessage.success(isEditBanner.value ? '更新成功' : '添加成功')
      }, 1000)
    }
  })
}

const toggleBannerStatus = (banner: Banner) => {
  banner.isActive = !banner.isActive
  ElMessage.success(banner.isActive ? 'Banner已启用' : 'Banner已禁用')
}

const deleteBanner = (index: number) => {
  ElMessageBox.confirm('确定要删除这个Banner吗？', '删除确认', { type: 'warning' })
    .then(() => {
      bannerList.value.splice(index, 1)
      ElMessage.success('删除成功')
    })
}

const updateBannerOrder = () => {
  bannerList.value.forEach((banner, index) => {
    banner.sortOrder = index + 1
  })
  ElMessage.success('Banner排序已更新')
}

const updateSectionOrder = () => {
  sectionOrder.value.forEach((section, index) => {
    section.sortOrder = index + 1
  })
  ElMessage.success('版块排序已更新')
}

const handlePreview = () => {
  ElMessage.info('预览功能开发中...')
}

const handleSave = () => {
  saveLoading.value = true
  setTimeout(() => {
    saveLoading.value = false
    ElMessage.success('配置保存成功')
  }, 1000)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.homepage-page {
  padding: 20px;
}

.config-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-tip {
  font-size: 12px;
  color: #909399;
}

.banner-list {
  min-height: 100px;
}

.drag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.banner-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.banner-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.banner-drag {
  cursor: move;
  color: #c0c4cc;
  margin-right: 12px;
}

.banner-image {
  width: 80px;
  height: 45px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 12px;
}

.banner-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-info {
  flex: 1;
  min-width: 0;
}

.banner-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.banner-link {
  color: #909399;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.banner-actions {
  display: flex;
  gap: 8px;
}

.section-drag-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.section-drag {
  cursor: move;
  color: #c0c4cc;
  margin-right: 12px;
}

.section-info {
  flex: 1;
}

.section-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.section-desc {
  font-size: 12px;
  color: #909399;
}

.preview-panel {
  position: sticky;
  top: 20px;
}

.homepage-preview {
  max-height: 70vh;
  overflow-y: auto;
}

.preview-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-section:last-child {
  border-bottom: none;
}

.preview-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-count {
  font-size: 12px;
  color: #909399;
  font-weight: normal;
}

.preview-banner {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.preview-banner-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.banner-indicators {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s;
}

.indicator.active {
  background-color: #409eff;
}

.preview-recommend, .preview-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommend-item, .content-item {
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.recommend-title, .content-title {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recommend-meta, .content-meta {
  font-size: 11px;
  color: #909399;
}

.preview-ranking {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 12px;
}

.ranking-number {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 8px;
}

.ranking-name {
  flex: 1;
  color: #303133;
}

.ranking-score {
  color: #e6a23c;
  font-weight: 500;
}

.empty-placeholder {
  text-align: center;
  color: #909399;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px dashed #e4e7ed;
}

.image-upload {
  display: flex;
  align-items: center;
}

.image-preview {
  margin-top: 8px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
}

.image-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}
</style>