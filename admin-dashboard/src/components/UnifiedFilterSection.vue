<template>
  <div class="unified-filter-section">
    <div class="filter-card">
      <!-- Main Filter Row -->
      <div class="filter-main-row">
        <div class="filter-controls">
          <slot name="controls" />
        </div>
        
        <div class="filter-actions">
          <!-- View Mode Toggle (optional) -->
          <div v-if="showViewMode" class="view-mode-toggle">
            <el-button-group>
              <el-tooltip content="网格视图" placement="top">
                <el-button 
                  :type="viewMode === 'grid' ? 'primary' : ''" 
                  :icon="Grid"
                  size="default"
                  @click="$emit('view-mode-change', 'grid')"
                />
              </el-tooltip>
              <el-tooltip content="列表视图" placement="top">
                <el-button 
                  :type="viewMode === 'list' ? 'primary' : ''" 
                  :icon="List"
                  size="default"
                  @click="$emit('view-mode-change', 'list')"
                />
              </el-tooltip>
            </el-button-group>
          </div>
          
          <!-- Action Buttons -->
          <div class="action-buttons">
            <el-tooltip content="刷新数据" placement="top">
              <el-button 
                :icon="Refresh" 
                circle 
                @click="$emit('refresh')"
                :loading="refreshing"
              />
            </el-tooltip>
            
            <!-- Toggle Advanced Filters -->
            <el-tooltip :content="showAdvanced ? '收起高级筛选' : '展开高级筛选'" placement="top">
              <el-button 
                :icon="showAdvanced ? ArrowUp : ArrowDown"
                circle
                @click="toggleAdvanced"
                v-if="hasAdvancedFilters"
              />
            </el-tooltip>
            
            <!-- Custom Action Buttons -->
            <slot name="actions" />
          </div>
        </div>
      </div>
      
      <!-- Advanced Filter Section -->
      <el-collapse-transition>
        <div v-show="showAdvanced && hasAdvancedFilters" class="advanced-filters">
          <div class="advanced-filter-title">
            <el-icon><Filter /></el-icon>
            <span>高级筛选</span>
          </div>
          <div class="advanced-filter-content">
            <slot name="advanced" />
          </div>
          <div class="advanced-filter-actions">
            <el-button size="small" @click="$emit('reset-advanced')">
              <el-icon><RefreshLeft /></el-icon>
              重置筛选
            </el-button>
            <el-button type="primary" size="small" @click="$emit('apply-advanced')">
              <el-icon><Search /></el-icon>
              应用筛选
            </el-button>
          </div>
        </div>
      </el-collapse-transition>
    </div>
    
    <!-- Filter Tags (Active Filters Display) -->
    <div v-if="activeFilters.length > 0" class="filter-tags">
      <div class="filter-tags-label">
        <el-icon><Filter /></el-icon>
        <span>当前筛选：</span>
      </div>
      <div class="filter-tags-list">
        <el-tag
          v-for="filter in activeFilters"
          :key="filter.key"
          closable
          :type="filter.type || 'info'"
          size="small"
          @close="$emit('remove-filter', filter.key)"
        >
          {{ filter.label }}
        </el-tag>
      </div>
      <el-button 
        link 
        type="danger" 
        size="small"
        @click="$emit('clear-all-filters')"
        v-if="activeFilters.length > 1"
      >
        清空所有
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Grid, List, Refresh, ArrowUp, ArrowDown, 
  Filter, Search, RefreshLeft 
} from '@element-plus/icons-vue'

interface FilterTag {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

interface Props {
  showViewMode?: boolean
  viewMode?: 'grid' | 'list'
  refreshing?: boolean
  activeFilters?: FilterTag[]
  hasAdvancedFilters?: boolean
  defaultAdvancedOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showViewMode: false,
  viewMode: 'grid',
  refreshing: false,
  activeFilters: () => [],
  hasAdvancedFilters: false,
  defaultAdvancedOpen: false
})

const emit = defineEmits<{
  'view-mode-change': [mode: 'grid' | 'list']
  'refresh': []
  'reset-advanced': []
  'apply-advanced': []
  'remove-filter': [key: string]
  'clear-all-filters': []
}>()

// Local state
const showAdvanced = ref(props.defaultAdvancedOpen)

// Methods
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// Computed
const hasActiveFilters = computed(() => props.activeFilters.length > 0)
</script>

<style scoped>
.unified-filter-section {
  margin-bottom: var(--spacing-xl);
}

.filter-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-medium);
}

.filter-card:hover {
  box-shadow: var(--shadow-card-hover);
}

/* Main Filter Row */
.filter-main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  flex-wrap: wrap;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.view-mode-toggle {
  display: flex;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* Advanced Filters */
.advanced-filters {
  border-top: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  margin: 0 -1px -1px -1px;
  padding: var(--spacing-lg) var(--spacing-xl);
}

.advanced-filter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-lg);
}

.advanced-filter-content {
  margin-bottom: var(--spacing-lg);
}

.advanced-filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border-lighter);
}

/* Filter Tags */
.filter-tags {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  /* 移除边框 */
}

.filter-tags-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.filter-tags-list {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  flex: 1;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-main-row {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-lg);
  }
  
  .filter-controls {
    justify-content: flex-start;
  }
  
  .filter-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .filter-card {
    border-radius: var(--radius-lg);
    margin: 0 -var(--spacing-sm);
  }
  
  .filter-main-row {
    padding: var(--spacing-lg);
    flex-direction: column;
  }
  
  .filter-controls {
    width: 100%;
  }
  
  .filter-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .advanced-filters {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .advanced-filter-actions {
    justify-content: center;
  }
  
  .filter-tags {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .filter-tags-list {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .view-mode-toggle,
  .action-buttons {
    justify-content: center;
  }
  
  .advanced-filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

/* Animation */
.filter-card {
  animation: slideUp var(--transition-medium) var(--ease-out-cubic);
}

.filter-tags {
  animation: fadeIn var(--transition-medium) var(--ease-out-cubic);
}

/* Dark Theme Support */
:root[data-theme="dark"] .filter-card {
  background: var(--gradient-card);
  border-color: var(--color-border-light);
}

:root[data-theme="dark"] .advanced-filters {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-light);
}

:root[data-theme="dark"] .filter-tags {
  background: var(--color-bg-secondary);
  border-color: var(--color-border-lighter);
}
</style>