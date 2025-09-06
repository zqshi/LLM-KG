<template>
  <div class="unified-page-header">
    <div class="header-content">
      <div class="title-section">
        <h1 class="page-title">
          <template v-if="icon">
            <el-icon class="title-icon">
              <component :is="icon" />
            </el-icon>
          </template>
          {{ title }}
        </h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
      <div v-if="$slots.extra" class="extra-content">
        <slot name="extra" />
      </div>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  title: string
  description?: string
  icon?: Component | null
}

defineProps<Props>()
</script>

<style scoped>
.unified-page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-2xl) var(--spacing-2xl) var(--spacing-xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-medium);
}

.unified-page-header:hover {
  box-shadow: var(--shadow-card-hover);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  flex: 1;
  min-width: 0;
}

.title-section {
  flex: 1;
  min-width: 0;
}

.page-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  line-height: var(--line-height-tight);
}

.title-icon {
  color: var(--color-primary);
  font-size: var(--text-2xl);
  flex-shrink: 0;
}

.page-description {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-base);
  line-height: var(--line-height-normal);
  max-width: 600px;
}

.extra-content {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .unified-page-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .page-title {
    font-size: var(--text-2xl);
  }
  
  .header-actions {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .unified-page-header {
    padding: var(--spacing-lg) var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    border-radius: var(--radius-lg);
  }
  
  .page-title {
    font-size: var(--text-xl);
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .title-icon {
    font-size: var(--text-xl);
  }
  
  .page-description {
    font-size: var(--text-sm);
  }
  
  .header-actions {
    gap: var(--spacing-sm);
  }
}

/* 动画效果 */
.unified-page-header {
  animation: slideUp var(--transition-medium) var(--ease-out-cubic);
}

/* 深色主题适配 */
:root[data-theme="dark"] .unified-page-header {
  background: var(--gradient-card);
  border-color: var(--color-border-light);
}
</style>