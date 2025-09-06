<template>
  <span>{{ displayValue }}</span>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  value: number
  duration?: number
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 1000,
  decimals: 0
})

const displayValue = ref(0)

const animateNumber = (start: number, end: number, duration: number) => {
  if (start === end) return
  
  const range = end - start
  const startTime = Date.now()
  
  const step = () => {
    const now = Date.now()
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // 使用easeOutCubic缓动函数
    const easeOutCubic = 1 - Math.pow(1 - progress, 3)
    
    displayValue.value = Math.round((start + range * easeOutCubic) * Math.pow(10, props.decimals)) / Math.pow(10, props.decimals)
    
    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      displayValue.value = end
    }
  }
  
  requestAnimationFrame(step)
}

watch(() => props.value, (newValue, oldValue) => {
  animateNumber(oldValue || 0, newValue, props.duration)
}, { immediate: true })

onMounted(() => {
  animateNumber(0, props.value, props.duration)
})
</script>