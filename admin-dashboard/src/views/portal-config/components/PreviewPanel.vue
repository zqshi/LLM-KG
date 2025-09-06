<template>
  <div class="preview-panel">
    <div class="preview-header">
      <h3>实时预览</h3>
      <div class="preview-controls">
        <el-radio-group v-model="previewMode" size="small">
          <el-radio-button label="desktop">桌面端</el-radio-button>
          <el-radio-button label="tablet">平板端</el-radio-button>
          <el-radio-button label="mobile">移动端</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="preview-content">
      <div class="preview-device" :class="`preview-${previewMode}`">
        <div class="device-frame">
          <!-- 导航预览 -->
          <div class="navigation-preview">
            <div class="nav-header">
              <div class="nav-logo">企业门户</div>
              <div class="nav-menu">
                <div 
                  v-for="nav in visibleNavigation" 
                  :key="nav.id"
                  class="nav-item"
                  :class="{ 'has-children': nav.children?.length }"
                >
                  <el-icon v-if="nav.icon" class="nav-icon">
                    <component :is="nav.icon" />
                  </el-icon>
                  <span class="nav-text">{{ nav.name }}</span>
                  
                  <!-- 二级菜单 -->
                  <div v-if="nav.children?.length" class="sub-menu">
                    <div 
                      v-for="child in nav.children" 
                      :key="child.id"
                      class="sub-nav-item"
                    >
                      <el-icon v-if="child.icon" class="sub-nav-icon">
                        <component :is="child.icon" />
                      </el-icon>
                      <span>{{ child.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 入口面板预览 -->
          <div class="entry-panel-preview">
            <div class="panel-title">快捷入口</div>
            <div class="entry-grid">
              <div 
                v-for="entry in visibleEntryPanel" 
                :key="entry.id"
                class="entry-item"
                :style="{ backgroundColor: entry.bg_color || '#f0f9ff' }"
              >
                <el-icon class="entry-icon">
                  <component :is="entry.icon || 'Grid'" />
                </el-icon>
                <span class="entry-name">{{ entry.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-footer">
      <el-button size="small" @click="openFullPreview">
        <el-icon><View /></el-icon>
        全屏预览
      </el-button>
      <el-button size="small" @click="refreshPreview">
        <el-icon><Refresh /></el-icon>
        刷新预览
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { View, Refresh, Grid } from '@element-plus/icons-vue'
import type { NavigationItem } from '@/types/navigation'

interface Props {
  navigationData?: NavigationItem[]
  entryPanelData?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  navigationData: () => [],
  entryPanelData: () => []
})

const previewMode = ref<'desktop' | 'tablet' | 'mobile'>('desktop')

// 过滤可见的导航项
const visibleNavigation = computed(() => {
  return props.navigationData?.filter(nav => nav.is_enabled) || []
})

// 过滤可见的入口面板项
const visibleEntryPanel = computed(() => {
  return props.entryPanelData?.filter(entry => entry.is_enabled) || []
})

// 监听预览模式变化
watch(previewMode, (newMode) => {
  console.log('预览模式切换到:', newMode)
})

// 打开全屏预览
const openFullPreview = () => {
  const url = `/portal-config/preview?mode=${previewMode.value}`
  window.open(url, '_blank')
}

// 刷新预览
const refreshPreview = () => {
  console.log('刷新预览')
}
</script>

<style lang="scss" scoped>
.preview-panel {
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;

  .preview-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    background: #fafbfc;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .preview-controls {
      .el-radio-group {
        :deep(.el-radio-button__inner) {
          padding: 6px 12px;
          font-size: 12px;
        }
      }
    }
  }

  .preview-content {
    padding: 20px;
    background: #f5f7fa;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: flex-start;

    .preview-device {
      transition: all 0.3s ease;

      &.preview-desktop {
        width: 100%;
        max-width: 1200px;
      }

      &.preview-tablet {
        width: 768px;
        max-width: 100%;
      }

      &.preview-mobile {
        width: 375px;
        max-width: 100%;
      }

      .device-frame {
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        min-height: 400px;
      }
    }
  }

  .navigation-preview {
    .nav-header {
      background: #409eff;
      color: #fff;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      gap: 40px;

      .nav-logo {
        font-size: 18px;
        font-weight: 600;
      }

      .nav-menu {
        display: flex;
        gap: 24px;
        flex: 1;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .nav-icon {
            font-size: 16px;
          }

          .nav-text {
            font-size: 14px;
          }

          // 二级菜单
          .sub-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background: #fff;
            color: #303133;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 8px 0;
            min-width: 160px;
            z-index: 10;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;

            .sub-nav-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 16px;
              cursor: pointer;
              transition: background 0.3s ease;

              &:hover {
                background: #f0f9ff;
              }

              .sub-nav-icon {
                font-size: 14px;
                color: #409eff;
              }
            }
          }

          &.has-children:hover .sub-menu {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
        }
      }
    }
  }

  .entry-panel-preview {
    padding: 24px;

    .panel-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
    }

    .entry-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 16px;

      .entry-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 20px 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #e4e7ed;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .entry-icon {
          font-size: 32px;
          color: #409eff;
        }

        .entry-name {
          font-size: 14px;
          color: #303133;
          text-align: center;
          font-weight: 500;
        }
      }
    }
  }

  .preview-footer {
    padding: 12px 20px;
    border-top: 1px solid #e4e7ed;
    background: #fafbfc;
    display: flex;
    gap: 12px;
    justify-content: flex-end;

    .el-button {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .preview-panel {
    .preview-content {
      padding: 12px;

      .preview-device {
        &.preview-desktop,
        &.preview-tablet {
          width: 100%;
        }

        &.preview-mobile {
          width: 100%;
          max-width: 375px;
        }
      }
    }

    .navigation-preview {
      .nav-header {
        padding: 8px 12px;
        flex-direction: column;
        gap: 12px;

        .nav-menu {
          flex-direction: column;
          gap: 8px;
          width: 100%;

          .nav-item {
            justify-content: flex-start;
            width: 100%;
          }
        }
      }
    }

    .entry-panel-preview {
      padding: 16px;

      .entry-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;

        .entry-item {
          padding: 16px 12px;

          .entry-icon {
            font-size: 28px;
          }

          .entry-name {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>