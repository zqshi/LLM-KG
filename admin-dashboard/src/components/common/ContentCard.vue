<template>
  <div class="content-card">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="card-title">
          <el-icon v-if="icon" class="title-icon">
            <component :is="icon" />
          </el-icon>
          <span>{{ title }}</span>
        </div>
      </slot>
      <div v-if="$slots.extra" class="card-extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="card-body" :class="{ 'no-header': !$slots.header && !title }">
      <slot />
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  icon?: any
}

defineProps<Props>()
</script>

<style scoped>
.content-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-medium);
  overflow: hidden;
}

.content-card:hover {
  box-shadow: var(--shadow-card-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.title-icon {
  color: var(--color-primary);
  font-size: var(--text-base);
}

.card-extra {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.card-body {
  padding: var(--spacing-xl);
}

.card-body.no-header {
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
}

.card-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .card-header {
    padding: var(--spacing-lg);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .card-body {
    padding: var(--spacing-lg);
  }
  
  .card-footer {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .card-extra {
    justify-content: flex-end;
  }
}
</style>