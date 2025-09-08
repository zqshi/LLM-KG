<template>
  <div class="theme-toggle">
    <el-dropdown 
      @command="handleThemeChange"
      placement="bottom-end"
      trigger="click"
    >
      <Button 
        type="text" 
        class="theme-toggle__button"
        :title="currentThemeLabel"
      >
        <el-icon :size="18">
          <component :is="currentThemeIcon" />
        </el-icon>
        <span class="theme-toggle__label" v-if="showLabel">
          {{ currentThemeLabel }}
        </span>
      </Button>
      
      <template #dropdown>
        <el-dropdown-menu class="theme-dropdown">
          <el-dropdown-item 
            command="light"
            :class="{ 'is-active': themeStore.appliedTheme.value === 'light' }"
          >
            <el-icon><Sunny /></el-icon>
            <span>浅色主题</span>
          </el-dropdown-item>
          
          <el-dropdown-item 
            command="dark"
            :class="{ 'is-active': themeStore.appliedTheme.value === 'dark' }"
          >
            <el-icon><Moon /></el-icon>
            <span>深色主题</span>
          </el-dropdown-item>
          
          <el-dropdown-item 
            command="auto"
            :class="{ 'is-active': themeStore.appliedTheme.value === 'auto' }"
          >
            <el-icon><Monitor /></el-icon>
            <span>跟随系统</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sunny, Moon, Monitor } from '@element-plus/icons-vue'
import Button from '@/components/common/Button.vue'
import { useThemeStore } from '@/stores/theme'
import { useResponsive } from '@/composables/useResponsive'

interface Props {
  showLabel?: boolean
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: false,
  size: 'default'
})

const themeStore = useThemeStore()
const { isMobile } = useResponsive()

// 当前主题图标
const currentThemeIcon = computed(() => {
  const theme = themeStore.appliedTheme.value
  switch (theme) {
    case 'light':
      return Sunny
    case 'dark':
      return Moon
    case 'auto':
      return Monitor
    default:
      // 假设使用 systemTheme 替代 systemPrefersDark
      return themeStore.systemTheme.value === 'dark' ? Moon : Sunny
  }
})

// 当前主题标签
const currentThemeLabel = computed(() => {
  const theme = themeStore.appliedTheme.value
  switch (theme) {
    case 'light':
      return '浅色主题'
    case 'dark':
      return '深色主题'
    case 'auto':
      // 假设使用 systemTheme 替代 systemPrefersDark
      return `跟随系统${themeStore.systemTheme.value === 'dark' ? '(深色)' : '(浅色)'}`
    default:
      return '主题设置'
  }
})

// 主题切换处理
const handleThemeChange = (theme: string) => {
  themeStore.setTheme(theme as 'light' | 'dark' | 'auto')
  
  // 反馈系统记录用户操作
  if ('useFeedbackStore' in window) {
    const feedbackStore = (window as any).useFeedbackStore()
    feedbackStore?.trackUserAction('theme_changed', {
      theme,
      device: isMobile.value ? 'mobile' : 'desktop',
      timestamp: Date.now()
    })
  }
}
</script>

<style lang="scss" scoped>
.theme-toggle {
  display: inline-block;

  &__button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: var(--el-text-color-regular);

    &:hover {
      background-color: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &:active {
      transform: scale(0.98);
    }

    .el-icon {
      transition: transform 0.3s ease;
    }

    &:hover .el-icon {
      transform: rotate(20deg);
    }
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;

    @media (max-width: 768px) {
      display: none;
    }
  }
}

:deep(.theme-dropdown) {
  .el-dropdown-menu__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    font-size: 14px;
    transition: all 0.2s ease;

    .el-icon {
      color: var(--el-text-color-regular);
      transition: color 0.2s ease;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
      
      .el-icon {
        color: var(--el-color-primary);
      }
    }

    &.is-active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);

      .el-icon {
        color: var(--el-color-primary);
      }

      &::after {
        content: '✓';
        margin-left: auto;
        font-weight: bold;
      }
    }
  }
}

// 深色主题适配
@media (prefers-color-scheme: dark) {
  .theme-toggle {
    &__button {
      &:hover {
        background-color: var(--el-fill-color-dark);
      }
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .theme-toggle {
    &__button {
      border: 1px solid var(--el-border-color);
      
      &:hover {
        border-color: var(--el-color-primary);
      }
    }
  }
}

// 动画减少偏好
@media (prefers-reduced-motion: reduce) {
  .theme-toggle {
    &__button {
      transition: none;

      .el-icon {
        transition: none;
      }

      &:hover .el-icon {
        transform: none;
      }
    }
  }

  :deep(.theme-dropdown) {
    .el-dropdown-menu__item {
      transition: none;
    }
  }
}
</style>