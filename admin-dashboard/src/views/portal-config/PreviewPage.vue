<template>
  <div class="preview-page">
    <UnifiedPageHeader 
      title="门户预览" 
      description="实时预览门户配置效果"
    >
      <template #actions>
        <el-button @click="goBack" :icon="ArrowLeft" plain>
          返回配置
        </el-button>
        <el-radio-group v-model="previewMode" size="default">
          <el-radio-button value="desktop">
            <el-icon><Monitor /></el-icon>
            桌面端
          </el-radio-button>
          <el-radio-button value="tablet">
            <el-icon><Iphone /></el-icon>
            平板
          </el-radio-button>
          <el-radio-button value="mobile">
            <el-icon><Cellphone /></el-icon>
            移动端
          </el-radio-button>
        </el-radio-group>
        <el-button @click="refreshPreview" :loading="refreshing" type="primary">
          <el-icon><Refresh /></el-icon>
          刷新预览
        </el-button>
      </template>
    </UnifiedPageHeader>

    <div class="preview-container">
      <PreviewPanel 
        :navigation-data="navigationData"
        :entry-panel-data="entryPanelData"
        class="full-preview"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Monitor, Iphone, Cellphone, Refresh } from '@element-plus/icons-vue'
import PreviewPanel from './components/PreviewPanel.vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { navigationApi } from '@/api/navigation'
import { entryPanelApi } from '@/api/entryPanel'
import type { NavigationItem, EntryPanel } from '@/types/navigation'

const router = useRouter()
const previewMode = ref('desktop')
const refreshing = ref(false)
const navigationData = ref<NavigationItem[]>([])
const entryPanelData = ref<EntryPanel[]>([])

const goBack = () => {
  router.back()
}

const loadPreviewData = async () => {
  try {
    const [navResponse, panelResponse] = await Promise.all([
      navigationApi.getNavigations(),
      entryPanelApi.getPanels()
    ])
    
    navigationData.value = navResponse.data || []
    entryPanelData.value = panelResponse.data || []
  } catch (error) {
    console.error('加载预览数据失败:', error)
  }
}

const refreshPreview = async () => {
  refreshing.value = true
  await loadPreviewData()
  setTimeout(() => {
    refreshing.value = false
  }, 500)
}

onMounted(() => {
  loadPreviewData()
})
</script>

<style scoped lang="scss">
.preview-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .page-title {
      h2 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }

      p {
        margin: 4px 0 0 0;
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.preview-container {
  flex: 1;
  overflow: hidden;

  .full-preview {
    height: 100%;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .preview-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;

    .header-left,
    .header-right {
      justify-content: center;
    }
  }
}
</style>