<template>
  <div class="unified-stats-card" :class="{ 'clickable': clickable }" @click="handleClick">
    <div class="stats-content">
      <div class="stats-icon" :style="iconStyle" v-if="icon">
        <el-icon :size="iconSize">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stats-info">
        <div class="stats-value" :style="{ color: valueColor }">
          <AnimatedNumber :value="value" :duration="animationDuration" />
          <span v-if="suffix" class="stats-suffix">{{ suffix }}</span>
        </div>
        <div class="stats-label">{{ label }}</div>
        <div v-if="trend !== undefined" class="stats-trend" :class="trendClass">
          <el-icon :size="12">
            <ArrowUp v-if="trend > 0" />
            <ArrowDown v-if="trend < 0" />
            <Minus v-if="trend === 0" />
          </el-icon>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>
    </div>
    <div v-if="description" class="stats-description">
      {{ description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import AnimatedNumber from './AnimatedNumber.vue'

interface Props {
  label: string
  value: number
  icon?: string
  iconColor?: string
  valueColor?: string
  suffix?: string
  trend?: number
  description?: string
  clickable?: boolean
  iconSize?: number
  animationDuration?: number
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: '#667eea',
  valueColor: '#1e293b',
  iconSize: 24,
  animationDuration: 1000,
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const iconStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.iconColor} 0%, ${adjustColor(props.iconColor, -20)} 100%)`,
  color: 'white'
}))

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  if (props.trend > 0) return 'trend-up'
  if (props.trend < 0) return 'trend-down'
  return 'trend-neutral'
})

function adjustColor(color: string, amount: number): string {
  // 简单的颜色调整函数
  const usePound = color[0] === '#'
  const col = color.slice(usePound ? 1 : 0)
  const num = parseInt(col, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`
}

function handleClick() {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.unified-stats-card {
  @include card-style;
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &.clickable {
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-card-hover;
    }
  }
  
  .stats-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .stats-icon {
    width: 48px;
    height: 48px;
    border-radius: $radius-lg;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .stats-info {
    flex: 1;
    
    .stats-value {
      font-size: 24px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 4px;
      
      .stats-suffix {
        font-size: 16px;
        font-weight: 500;
        margin-left: 4px;
        opacity: 0.8;
      }
    }
    
    .stats-label {
      color: $color-text-secondary;
      font-size: 14px;
      margin-bottom: 4px;
    }
    
    .stats-trend {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      
      &.trend-up {
        color: $color-success;
      }
      
      &.trend-down {
        color: $color-danger;
      }
      
      &.trend-neutral {
        color: $color-text-tertiary;
      }
    }
  }
  
  .stats-description {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid $color-border-light;
    color: $color-text-tertiary;
    font-size: 12px;
    line-height: 1.4;
  }
}

// 动画效果
.unified-stats-card {
  transition: all $transition-medium;
  
  &:hover .stats-icon {
    transform: scale(1.05);
  }
  
  .stats-icon {
    transition: transform $transition-medium;
  }
}

// 响应式设计
@include respond-below(sm) {
  .unified-stats-card {
    padding: 16px;
    
    .stats-content {
      gap: 12px;
    }
    
    .stats-icon {
      width: 40px;
      height: 40px;
    }
    
    .stats-info .stats-value {
      font-size: 20px;
    }
  }
}
</style>