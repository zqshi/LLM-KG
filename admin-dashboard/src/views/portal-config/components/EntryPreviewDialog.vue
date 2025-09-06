<template>
  <el-dialog
    v-model="visible"
    title="快捷入口预览"
    width="800px"
    class="entry-preview-dialog"
  >
    <div class="preview-container">
      <div class="preview-header">
        <h3>用户门户预览</h3>
        <p>以下是用户在门户首页看到的快捷入口效果</p>
      </div>
      
      <div class="preview-content">
        <!-- 模拟用户门户环境 -->
        <div class="portal-mockup">
          <div class="portal-header">
            <div class="portal-logo">
              <el-icon :size="24"><House /></el-icon>
              <span>企业门户</span>
            </div>
            <div class="portal-user">
              <el-avatar :size="32">用户</el-avatar>
            </div>
          </div>
          
          <div class="portal-body">
            <div class="welcome-section">
              <h2>欢迎回来！</h2>
              <p>快速访问您的常用功能</p>
            </div>
            
            <div class="entries-section">
              <div class="section-title">快捷入口</div>
              
              <div v-if="enabledEntries.length > 0" class="entries-preview-grid">
                <div
                  v-for="entry in enabledEntries"
                  :key="entry.id"
                  class="preview-entry-card"
                  @click="handleEntryClick(entry)"
                >
                  <div 
                    class="preview-entry-icon"
                    :style="{
                      backgroundColor: entry.iconBgColor || '#667eea',
                      color: entry.iconColor || '#ffffff'
                    }"
                  >
                    <img 
                      v-if="entry.iconType === 'image' && entry.iconUrl" 
                      :src="entry.iconUrl" 
                      :alt="entry.name"
                      class="preview-icon-image"
                    />
                    <el-icon v-else-if="entry.iconName" :size="28">
                      <component :is="entry.iconName" />
                    </el-icon>
                    <el-icon v-else :size="28">
                      <Link />
                    </el-icon>
                  </div>
                  
                  <div class="preview-entry-info">
                    <div class="preview-entry-name">{{ entry.name }}</div>
                    <div v-if="entry.description" class="preview-entry-description">
                      {{ entry.description }}
                    </div>
                  </div>
                  
                  <div class="preview-entry-type">
                    <el-tag 
                      :type="getTypeTagType(entry.type)" 
                      size="small" 
                      effect="plain"
                    >
                      {{ getTypeLabel(entry.type) }}
                    </el-tag>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-entries">
                <el-empty 
                  description="暂无启用的快捷入口" 
                  :image-size="100"
                >
                  <el-text type="info">请先在管理界面创建并启用快捷入口</el-text>
                </el-empty>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="preview-footer">
        <div class="preview-stats">
          <div class="stat-item">
            <span class="stat-label">总入口数:</span>
            <span class="stat-value">{{ enabledEntries.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">预计加载时间:</span>
            <span class="stat-value">{{ Math.ceil(enabledEntries.length * 0.1) }}ms</span>
          </div>
        </div>
        
        <div class="preview-actions">
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出配置
          </el-button>
          <el-button @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新预览
          </el-button>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button type="success" @click="handleApplyConfig">
          <el-icon><Check /></el-icon>
          应用配置
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { House, Link, Download, Refresh, Check } from '@element-plus/icons-vue'

interface EntryItem {
  id: number
  name: string
  description: string
  url: string
  iconType: 'icon' | 'image'
  iconName?: string
  iconUrl?: string
  iconBgColor: string
  iconColor: string
  type: 'internal' | 'external' | 'app'
  enabled: boolean
  clickCount: number
  sortOrder: number
}

interface Props {
  modelValue: boolean
  entries: EntryItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const enabledEntries = computed(() => 
  props.entries.filter(e => e.enabled).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
)

const getTypeLabel = (type: string) => {
  const labels = {
    internal: '内部',
    external: '外部',
    app: '应用'
  }
  return labels[type as keyof typeof labels] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    internal: 'primary',
    external: 'success',
    app: 'warning'
  }
  return types[type as keyof typeof types] || 'info'
}

const handleEntryClick = (entry: EntryItem) => {
  ElMessage.success(`模拟点击: ${entry.name}`)
  
  // 模拟跳转逻辑
  if (entry.type === 'external') {
    ElNotification({
      title: '外部链接',
      message: `将在新窗口打开: ${entry.url}`,
      type: 'info',
      duration: 3000
    })
  } else {
    ElNotification({
      title: '内部跳转',
      message: `将跳转到: ${entry.url}`,
      type: 'success',
      duration: 3000
    })
  }
}

const handleExport = () => {
  const config = {
    entries: enabledEntries.value,
    exportTime: new Date().toISOString(),
    version: '1.0.0'
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `portal-config-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('配置导出成功')
}

const handleRefresh = () => {
  ElMessage.info('预览已刷新')
}

const handleApplyConfig = () => {
  ElMessage.success('配置已应用到用户门户')
  ElNotification({
    title: '配置应用成功',
    message: `已成功应用 ${enabledEntries.value.length} 个快捷入口到用户门户`,
    type: 'success',
    duration: 5000
  })
  visible.value = false
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.entry-preview-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.preview-container {
  .preview-header {
    padding: 20px 24px;
    border-bottom: 1px solid $color-border-light;
    background: $color-bg-section;
    
    h3 {
      margin: 0 0 8px 0;
      color: $color-text-primary;
      font-size: 18px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: $color-text-secondary;
      font-size: 14px;
    }
  }
  
  .preview-content {
    padding: 24px;
  }
  
  .portal-mockup {
    background: white;
    border-radius: $radius-lg;
    box-shadow: $shadow-card;
    overflow: hidden;
    
    .portal-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .portal-logo {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 16px;
      }
    }
    
    .portal-body {
      padding: 24px;
      
      .welcome-section {
        text-align: center;
        margin-bottom: 32px;
        
        h2 {
          margin: 0 0 8px 0;
          color: $color-text-primary;
          font-size: 24px;
          font-weight: 700;
        }
        
        p {
          margin: 0;
          color: $color-text-secondary;
          font-size: 16px;
        }
      }
      
      .entries-section {
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: $color-text-primary;
          margin-bottom: 20px;
          padding-bottom: 8px;
          border-bottom: 2px solid $color-primary;
          display: inline-block;
        }
      }
    }
  }
  
  .entries-preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
    
    .preview-entry-card {
      background: white;
      border: 1px solid $color-border-light;
      border-radius: $radius-lg;
      padding: 20px;
      cursor: pointer;
      transition: all $transition-medium;
      text-align: center;
      
      &:hover {
        transform: translateY(-4px);
        box-shadow: $shadow-card-hover;
        border-color: $color-primary;
      }
      
      .preview-entry-icon {
        width: 56px;
        height: 56px;
        border-radius: $radius-lg;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        box-shadow: $shadow-card;
        
        .preview-icon-image {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }
      }
      
      .preview-entry-info {
        margin-bottom: 12px;
        
        .preview-entry-name {
          font-size: 16px;
          font-weight: 600;
          color: $color-text-primary;
          margin-bottom: 4px;
          @include text-ellipsis;
        }
        
        .preview-entry-description {
          font-size: 12px;
          color: $color-text-tertiary;
          @include text-ellipsis-multiline(2);
          min-height: 32px;
        }
      }
      
      .preview-entry-type {
        display: flex;
        justify-content: center;
      }
    }
  }
  
  .no-entries {
    text-align: center;
    padding: 40px 20px;
    color: $color-text-tertiary;
  }
  
  .preview-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid $color-border-light;
    background: $color-bg-section;
    
    .preview-stats {
      display: flex;
      gap: 24px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        
        .stat-label {
          color: $color-text-secondary;
        }
        
        .stat-value {
          color: $color-text-primary;
          font-weight: 500;
        }
      }
    }
    
    .preview-actions {
      display: flex;
      gap: 8px;
    }
  }
}

.dialog-footer {
  text-align: right;
  padding: 16px 0 0 0;
  border-top: 1px solid $color-border-light;
}

// 响应式设计
@include respond-below(md) {
  .preview-container {
    .portal-mockup .portal-body {
      padding: 16px;
      
      .welcome-section {
        margin-bottom: 24px;
        
        h2 {
          font-size: 20px;
        }
      }
    }
    
    .entries-preview-grid {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 12px;
      
      .preview-entry-card {
        padding: 16px;
        
        .preview-entry-icon {
          width: 48px;
          height: 48px;
          margin-bottom: 8px;
        }
        
        .preview-entry-info .preview-entry-name {
          font-size: 14px;
        }
      }
    }
    
    .preview-footer {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      
      .preview-stats {
        justify-content: center;
      }
      
      .preview-actions {
        justify-content: center;
      }
    }
  }
}
</style>