<template>
  <div class="unified-page-header">
    <div class="header-content">
      <div class="header-left">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="description" class="page-description">{{ description }}</p>
      </div>
      <div class="header-actions" v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.unified-page-header {
  background: white;
  padding: 28px 32px;
  margin: -24px -24px 24px -24px;
  border-bottom: 1px solid $color-border-light;
  box-shadow: $shadow-card;
  
  .header-content {
    @include flex-between;
    gap: 24px;
  }
  
  .header-left {
    flex: 1;
    
    .page-title {
      font-size: 28px;
      font-weight: 700;
      color: $color-text-primary;
      margin: 0 0 8px 0;
      line-height: 1.2;
    }
    
    .page-description {
      color: $color-text-secondary;
      font-size: 14px;
      line-height: 1.6;
      margin: 0;
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
  }
}

// 响应式设计
@include respond-below(md) {
  .unified-page-header {
    padding: 20px 16px;
    margin: -16px -16px 20px -16px;
    
    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    
    .header-left .page-title {
      font-size: 24px;
    }
    
    .header-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>