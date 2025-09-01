<template>
  <el-card 
    :class="['quotation-card', `quotation-card--${variant}`, { 'quotation-card--selected': selected }]"
    :shadow="shadow"
    @click="handleClick"
  >
    <template #header v-if="showHeader">
      <div class="quotation-card__header">
        <div class="quotation-card__status">
          <el-tag 
            :type="getStatusType(quotation.status)" 
            size="small"
            effect="light"
          >
            {{ getStatusText(quotation.status) }}
          </el-tag>
          <el-tag v-if="quotation.isHot" type="danger" size="small" effect="light">
            热门
          </el-tag>
        </div>
        <div class="quotation-card__actions" v-if="showActions">
          <el-dropdown @command="handleActionCommand" trigger="click">
            <el-button type="text" size="small">
              <el-icon><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit" v-if="canEdit">编辑</el-dropdown-item>
                <el-dropdown-item command="review" v-if="canReview">审核</el-dropdown-item>
                <el-dropdown-item command="publish" v-if="canPublish">发布</el-dropdown-item>
                <el-dropdown-item command="archive" v-if="canArchive">归档</el-dropdown-item>
                <el-dropdown-item command="delete" v-if="canDelete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </template>

    <div class="quotation-card__content">
      <div class="quotation-card__quote">
        <el-icon class="quotation-card__quote-icon"><ChatDotRound /></el-icon>
        <div 
          class="quotation-card__quote-text"
          v-html="displayContent"
        ></div>
      </div>

      <div class="quotation-card__meta">
        <div class="quotation-card__author">
          <el-avatar 
            :size="32" 
            :src="quotation.leader.avatar"
            :alt="quotation.leader.name"
          >
            {{ quotation.leader.name.charAt(0) }}
          </el-avatar>
          <div class="quotation-card__author-info">
            <div class="quotation-card__author-name">{{ quotation.leader.name }}</div>
            <div class="quotation-card__author-title">{{ quotation.leader.title || '领导' }}</div>
          </div>
        </div>

        <div class="quotation-card__occasion" v-if="quotation.occasion">
          <el-icon><LocationInformation /></el-icon>
          <span>{{ quotation.occasion }}</span>
        </div>
      </div>

      <div class="quotation-card__tags" v-if="quotation.tags?.length">
        <el-tag 
          v-for="tag in quotation.tags" 
          :key="tag" 
          size="small" 
          effect="plain"
          class="quotation-card__tag"
        >
          {{ tag }}
        </el-tag>
      </div>

      <div class="quotation-card__stats" v-if="showStats">
        <div class="quotation-card__stat">
          <el-icon><View /></el-icon>
          <span>{{ formatNumber(quotation.showCount) }}</span>
        </div>
        <div class="quotation-card__stat">
          <el-icon><Star /></el-icon>
          <span>{{ formatNumber(quotation.likeCount) }}</span>
        </div>
        <div class="quotation-card__time">
          {{ formatTime(quotation.createTime) }}
        </div>
      </div>
    </div>

    <div class="quotation-card__footer" v-if="showFooter">
      <el-button-group size="small" v-if="variant === 'review'">
        <el-button type="success" @click="handleApprove">
          <el-icon><Check /></el-icon>
          通过
        </el-button>
        <el-button type="warning" @click="handleRevision">
          <el-icon><Edit /></el-icon>
          修改
        </el-button>
        <el-button type="danger" @click="handleReject">
          <el-icon><Close /></el-icon>
          拒绝
        </el-button>
      </el-button-group>

      <div class="quotation-card__selection" v-if="selectable">
        <el-checkbox 
          v-model="isSelected" 
          @change="handleSelectionChange"
          :disabled="selectionDisabled"
        >
          选择
        </el-checkbox>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  MoreFilled, 
  ChatDotRound, 
  LocationInformation, 
  View, 
  Star, 
  Check, 
  Edit, 
  Close 
} from '@element-plus/icons-vue'
import type { Quotation, QuotationStatus } from '@/types'

interface Props {
  quotation: Quotation
  variant?: 'default' | 'compact' | 'review' | 'display'
  selectable?: boolean
  selected?: boolean
  selectionDisabled?: boolean
  showHeader?: boolean
  showActions?: boolean
  showStats?: boolean
  showFooter?: boolean
  shadow?: 'always' | 'hover' | 'never'
  maxLength?: number
  canEdit?: boolean
  canReview?: boolean
  canPublish?: boolean
  canArchive?: boolean
  canDelete?: boolean
}

interface Emits {
  (e: 'click', quotation: Quotation): void
  (e: 'edit', quotation: Quotation): void
  (e: 'review', quotation: Quotation, action: string): void
  (e: 'delete', quotation: Quotation): void
  (e: 'selection-change', quotation: Quotation, selected: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  selectable: false,
  selected: false,
  selectionDisabled: false,
  showHeader: true,
  showActions: true,
  showStats: true,
  showFooter: false,
  shadow: 'hover',
  maxLength: 200,
  canEdit: true,
  canReview: false,
  canPublish: false,
  canArchive: false,
  canDelete: false
})

const emit = defineEmits<Emits>()

const isSelected = ref(props.selected)

const displayContent = computed(() => {
  const content = props.quotation.contentHtml || props.quotation.content
  if (props.maxLength && content.length > props.maxLength) {
    return content.substring(0, props.maxLength) + '...'
  }
  return content
})

const getStatusType = (status: QuotationStatus) => {
  const statusMap = {
    draft: '',
    pending_review: 'warning',
    published: 'success',
    rejected: 'danger',
    archived: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: QuotationStatus) => {
  const statusMap = {
    draft: '草稿',
    pending_review: '待审核',
    published: '已发布',
    rejected: '已拒绝',
    archived: '已归档'
  }
  return statusMap[status] || status
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString('zh-CN')
}

const handleClick = () => {
  emit('click', props.quotation)
}

const handleActionCommand = (command: string) => {
  switch (command) {
    case 'edit':
      emit('edit', props.quotation)
      break
    case 'review':
    case 'publish':
    case 'archive':
      emit('review', props.quotation, command)
      break
    case 'delete':
      emit('delete', props.quotation)
      break
  }
}

const handleApprove = () => {
  emit('review', props.quotation, 'approve')
}

const handleRevision = () => {
  emit('review', props.quotation, 'revision')
}

const handleReject = () => {
  emit('review', props.quotation, 'reject')
}

const handleSelectionChange = (selected: boolean) => {
  isSelected.value = selected
  emit('selection-change', props.quotation, selected)
}
</script>

<style lang="scss" scoped>
.quotation-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  &--selected {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-8);
  }

  &--compact {
    .quotation-card__content {
      padding: 12px;
    }
  }

  &--review {
    border-left: 4px solid var(--el-color-warning);
  }

  &--display {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    
    .quotation-card__quote-icon {
      color: var(--el-color-primary);
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__status {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  &__content {
    padding: 16px 0;
  }

  &__quote {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;

    &-icon {
      color: var(--el-color-primary);
      font-size: 20px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    &-text {
      flex: 1;
      font-size: 16px;
      line-height: 1.6;
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  &__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  &__author {
    display: flex;
    align-items: center;
    gap: 8px;

    &-info {
      display: flex;
      flex-direction: column;
    }

    &-name {
      font-weight: 600;
      color: var(--el-text-color-primary);
      font-size: 14px;
    }

    &-title {
      color: var(--el-text-color-regular);
      font-size: 12px;
    }
  }

  &__occasion {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--el-text-color-regular);
    font-size: 13px;
  }

  &__tags {
    margin-bottom: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__tag {
    border-radius: 12px;
  }

  &__stats {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--el-text-color-regular);
    font-size: 13px;
  }

  &__stat {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__selection {
    margin-left: auto;
  }
}

@media (max-width: 768px) {
  .quotation-card {
    &__meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    &__stats {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    &__footer {
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>