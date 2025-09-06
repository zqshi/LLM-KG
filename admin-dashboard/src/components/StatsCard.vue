<template>
  <div 
    class="stats-card" 
    :class="[`stats-card--${type}`, { 'stats-card--clickable': clickable, 'stats-card--loading': loading }]"
    @click="handleClick"
  >
    <!-- Loading Skeleton -->
    <div v-if="loading" class="loading-skeleton">
      <div class="skeleton-icon"></div>
      <div class="skeleton-content">
        <div class="skeleton-value"></div>
        <div class="skeleton-label"></div>
      </div>
    </div>
    
    <!-- Normal Content -->
    <template v-else>
      <div class="stats-content">
        <div class="stats-icon" :class="`stats-icon--${type}`" v-if="icon">
          <el-icon :size="iconSize">
            <component :is="icon" />
          </el-icon>
        </div>
        
        <div class="stats-info">
          <div class="stats-value" :style="valueStyle">
            <AnimatedNumber 
              :value="numericValue" 
              :duration="animationDuration"
              :format="numberFormat"
            />
            <span v-if="suffix" class="stats-suffix">{{ suffix }}</span>
          </div>
          <div class="stats-label">{{ label }}</div>
          
          <!-- Trend Display -->
          <div v-if="trend !== undefined" class="stats-trend" :class="trendClass">
            <el-icon :size="12" class="trend-icon">
              <ArrowUp v-if="trendDirection === 'up'" /> 
              <ArrowDown v-if="trendDirection === 'down'" /> 
              <Minus v-if="trendDirection === 'neutral'" /> 
            </el-icon>
            <span class="trend-value">{{ formatTrend(trend) }}%</span>
            <span v-if="trendLabel" class="trend-label">{{ trendLabel }}</span>
          </div>
        </div>
      </div>
      
      <!-- Description Footer -->
      <div v-if="description" class="stats-description">
        {{ description }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import AnimatedNumber from './AnimatedNumber.vue'

interface Props {
  label: string
  value: number | string
  icon?: any
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  iconSize?: number
  valueColor?: string
  suffix?: string
  trend?: number
  trendLabel?: string
  description?: string
  clickable?: boolean
  loading?: boolean
  animationDuration?: number
  numberFormat?: 'default' | 'compact' | 'decimal' | 'percent'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  iconSize: 24,
  clickable: false,
  loading: false,
  animationDuration: 1200,
  numberFormat: 'default'
})

const emit = defineEmits<{
  click: []
}>()

// Computed values
const numericValue = computed(() => {
  if (typeof props.value === 'number') return props.value
  const parsed = parseFloat(props.value)
  return isNaN(parsed) ? 0 : parsed
})

const valueStyle = computed(() => ({
  color: props.valueColor || 'var(--color-text-primary)'
}))

const trendDirection = computed(() => {
  if (props.trend === undefined) return 'neutral'
  if (props.trend > 0) return 'up'
  if (props.trend < 0) return 'down'
  return 'neutral'
})

const trendClass = computed(() => `trend--${trendDirection.value}`)

// Methods
function handleClick() {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}

function formatTrend(value: number): string {
  return Math.abs(value).toFixed(1)
}
</script>

<style scoped>
.stats-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  min-height: 120px;
  transition: all var(--transition-medium);
  position: relative;
  overflow: hidden;
}

.stats-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradient-primary);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-medium);
}

.stats-card:hover::before {
  transform: scaleX(1);
}

.stats-card.stats-card--clickable {
  cursor: pointer;
}

.stats-card.stats-card--clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stats-card.stats-card--clickable:active {
  transform: translateY(-2px);
}

.stats-card.stats-card--success::before {
  background: var(--gradient-success);
}

.stats-card.stats-card--warning::before {
  background: var(--gradient-warning);
}

.stats-card.stats-card--danger::before {
  background: var(--gradient-danger);
}

.stats-card.stats-card--info::before {
  background: var(--gradient-info);
}

/* Loading State */
.stats-card.stats-card--loading {
  pointer-events: none;
}

.loading-skeleton {
  display: flex;
  align-items: center;
  height: 120px;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.skeleton-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-border-lighter);
  animation: pulse 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
}

.skeleton-value {
  height: 28px;
  width: 80px;
  background: var(--color-border-lighter);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-label {
  height: 16px;
  width: 120px;
  background: var(--color-border-lighter);
  border-radius: var(--radius-md);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Content Styling */
.stats-content {
  display: flex;
  align-items: center;
  min-height: 120px;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.stats-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  transition: transform var(--transition-fast);
}

.stats-card:hover .stats-icon {
  transform: scale(1.05);
}

.stats-icon--primary {
  background: var(--gradient-primary);
}

.stats-icon--success {
  background: var(--gradient-success);
}

.stats-icon--warning {
  background: var(--gradient-warning);
}

.stats-icon--danger {
  background: var(--gradient-danger);
}

.stats-icon--info {
  background: var(--gradient-info);
}

.stats-info {
  flex: 1;
  min-width: 0;
}

.stats-value {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.stats-suffix {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  opacity: 0.8;
}

.stats-label {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
}

.stats-trend {
  font-size: var(--text-xs);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
}

.trend-icon {
  opacity: 0.8;
}

.trend--up {
  color: var(--color-success);
}

.trend--down {
  color: var(--color-danger);
}

.trend--neutral {
  color: var(--color-text-tertiary);
}

.trend-label {
  color: var(--color-text-quaternary);
  font-weight: var(--font-weight-normal);
}

.stats-description {
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  color: var(--color-text-tertiary);
  font-size: var(--text-xs);
  line-height: var(--line-height-normal);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-card {
    min-height: 100px;
  }
  
  .stats-content {
    padding: var(--spacing-lg);
    min-height: 100px;
    gap: var(--spacing-md);
  }
  
  .stats-icon {
    width: 48px;
    height: 48px;
  }
  
  .stats-value {
    font-size: 24px;
  }
  
  .loading-skeleton {
    padding: var(--spacing-lg);
    height: 100px;
  }
  
  .stats-description {
    padding: var(--spacing-sm) var(--spacing-lg) var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .stats-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
  }
  
  .stats-icon {
    width: 40px;
    height: 40px;
  }
  
  .stats-value {
    font-size: 20px;
  }
}

/* Dark Theme Support */
:root[data-theme="dark"] .stats-card {
  background: var(--gradient-card);
  border-color: var(--color-border-light);
}
</style>