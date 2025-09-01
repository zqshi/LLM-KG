<template>
  <el-card 
    :class="['stats-card', `stats-card--${type}`, { 'stats-card--clickable': clickable }]"
    :shadow="shadow"
    @click="handleClick"
  >
    <div class="stats-card__content">
      <div class="stats-card__icon" :style="{ backgroundColor: iconBg }">
        <el-icon :size="iconSize" :color="iconColor">
          <component :is="iconComponent" />
        </el-icon>
      </div>
      
      <div class="stats-card__info">
        <div class="stats-card__value">
          <span class="stats-card__number">{{ displayValue }}</span>
          <div class="stats-card__trend" v-if="showTrend && trend !== undefined">
            <el-icon 
              :class="['trend-icon', trend > 0 ? 'trend-up' : trend < 0 ? 'trend-down' : 'trend-flat']"
              :size="14"
            >
              <CaretTop v-if="trend > 0" />
              <CaretBottom v-else-if="trend < 0" />
              <Minus v-else />
            </el-icon>
            <span class="trend-text">{{ Math.abs(trend) }}%</span>
          </div>
        </div>
        
        <div class="stats-card__title">{{ title }}</div>
        
        <div class="stats-card__subtitle" v-if="subtitle">
          {{ subtitle }}
        </div>
      </div>

      <div class="stats-card__extra" v-if="extra">
        <slot name="extra">
          <span class="stats-card__extra-text">{{ extra }}</span>
        </slot>
      </div>
    </div>

    <div class="stats-card__footer" v-if="showFooter">
      <div class="stats-card__period">
        <el-icon><Calendar /></el-icon>
        <span>{{ period || '今日' }}</span>
      </div>
      
      <div class="stats-card__actions" v-if="actions?.length">
        <el-button 
          v-for="action in actions"
          :key="action.key"
          :type="action.type || 'text'"
          size="small"
          @click.stop="handleAction(action)"
        >
          <el-icon v-if="action.icon">
            <component :is="action.icon" />
          </el-icon>
          {{ action.label }}
        </el-button>
      </div>
    </div>

    <div class="stats-card__chart" v-if="showChart && chartData">
      <div ref="chartRef" class="mini-chart"></div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { 
  CaretTop, 
  CaretBottom, 
  Minus, 
  Calendar,
  ChatDotRound,
  View,
  Star,
  User,
  DataAnalysis,
  TrendCharts,
  Check,
  Warning
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface StatsAction {
  key: string
  label: string
  icon?: any
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
}

interface Props {
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  title: string
  subtitle?: string
  value: number | string
  trend?: number
  showTrend?: boolean
  period?: string
  extra?: string
  icon?: string
  iconColor?: string
  iconBg?: string
  iconSize?: number
  clickable?: boolean
  shadow?: 'always' | 'hover' | 'never'
  showFooter?: boolean
  showChart?: boolean
  chartData?: number[]
  actions?: StatsAction[]
}

interface Emits {
  (e: 'click'): void
  (e: 'action', action: StatsAction): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  iconSize: 24,
  clickable: false,
  shadow: 'hover',
  showTrend: true,
  showFooter: true,
  showChart: false
})

const emit = defineEmits<Emits>()

const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

const iconMap = {
  quotation: ChatDotRound,
  view: View,
  star: Star,
  user: User,
  analytics: DataAnalysis,
  trend: TrendCharts,
  check: Check,
  warning: Warning
}

const iconComponent = computed(() => {
  return iconMap[props.icon as keyof typeof iconMap] || ChatDotRound
})

const typeColors = {
  default: { bg: '#f0f2f5', color: '#666' },
  primary: { bg: '#e6f4ff', color: '#1890ff' },
  success: { bg: '#f6ffed', color: '#52c41a' },
  warning: { bg: '#fff7e6', color: '#fa8c16' },
  danger: { bg: '#fff2f0', color: '#ff4d4f' },
  info: { bg: '#f0f5ff', color: '#722ed1' }
}

const computedIconBg = computed(() => {
  return props.iconBg || typeColors[props.type].bg
})

const computedIconColor = computed(() => {
  return props.iconColor || typeColors[props.type].color
})

const displayValue = computed(() => {
  if (typeof props.value === 'string') return props.value
  
  const num = props.value as number
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}

const handleAction = (action: StatsAction) => {
  emit('action', action)
}

const initChart = () => {
  if (!props.showChart || !chartRef.value || !props.chartData) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    grid: {
      left: 0,
      right: 0,
      top: 5,
      bottom: 5
    },
    xAxis: {
      type: 'category',
      show: false,
      data: props.chartData.map((_, index) => index)
    },
    yAxis: {
      type: 'value',
      show: false
    },
    series: [{
      data: props.chartData,
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: computedIconColor.value,
        width: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: computedIconColor.value + '30'
          }, {
            offset: 1,
            color: computedIconColor.value + '05'
          }]
        }
      }
    }],
    animation: false
  }
  
  chartInstance.setOption(option)
}

onMounted(() => {
  nextTick(() => {
    initChart()
  })
})
</script>

<style lang="scss" scoped>
.stats-card {
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-lighter);

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  &--primary {
    border-left: 4px solid var(--el-color-primary);
  }

  &--success {
    border-left: 4px solid var(--el-color-success);
  }

  &--warning {
    border-left: 4px solid var(--el-color-warning);
  }

  &--danger {
    border-left: 4px solid var(--el-color-danger);
  }

  &--info {
    border-left: 4px solid var(--el-color-info);
  }

  &__content {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    position: relative;
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__value {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__number {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1;
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 2px;

    .trend-icon {
      &.trend-up {
        color: var(--el-color-success);
      }

      &.trend-down {
        color: var(--el-color-danger);
      }

      &.trend-flat {
        color: var(--el-text-color-regular);
      }
    }

    .trend-text {
      font-size: 12px;
      font-weight: 500;
    }
  }

  &__title {
    font-size: 14px;
    color: var(--el-text-color-regular);
    margin-bottom: 4px;
  }

  &__subtitle {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__extra {
    position: absolute;
    top: 0;
    right: 0;

    &-text {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__period {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  &__actions {
    display: flex;
    gap: 4px;
  }

  &__chart {
    margin-top: 12px;
    height: 60px;

    .mini-chart {
      width: 100%;
      height: 100%;
    }
  }
}

@media (max-width: 768px) {
  .stats-card {
    &__content {
      flex-direction: column;
      gap: 12px;
    }

    &__icon {
      width: 40px;
      height: 40px;
    }

    &__number {
      font-size: 20px;
    }

    &__footer {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }
  }
}
</style>