<template>
  <el-dialog
    v-model="visible"
    title="选择图标"
    width="800px"
    destroy-on-close
  >
    <div class="icon-picker">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索图标名称..."
          :prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <el-radio-group v-model="activeCategory" @change="handleCategoryChange">
          <el-radio-button
            v-for="category in iconCategories"
            :key="category.key"
            :value="category.key"
          >
            {{ category.name }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 图标网格 -->
      <div class="icon-grid" v-loading="loading">
        <div
          v-for="icon in filteredIcons"
          :key="icon.name"
          class="icon-item"
          :class="{ active: selectedIcon === icon.name }"
          @click="handleIconClick(icon.name)"
        >
          <el-icon :size="24">
            <component :is="icon.name" />
          </el-icon>
          <div class="icon-name">{{ icon.name }}</div>
        </div>
        
        <div v-if="filteredIcons.length === 0" class="empty-state">
          <el-empty description="未找到匹配的图标" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :disabled="!selectedIcon">
          确定选择
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

// ================================
// Props和Emits
// ================================

interface Props {
  visible: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  select: [icon: string]
}>()

// ================================
// 响应式数据
// ================================

const loading = ref(false)
const searchKeyword = ref('')
const activeCategory = ref('all')
const selectedIcon = ref('')

// 图标数据
const iconList = ref<Array<{ name: string; category: string; keywords: string[] }>>([])

// 图标分类
const iconCategories = [
  { key: 'all', name: '全部' },
  { key: 'basic', name: '基础' },
  { key: 'navigation', name: '导航' },
  { key: 'business', name: '业务' },
  { key: 'system', name: '系统' },
  { key: 'media', name: '媒体' },
  { key: 'other', name: '其他' }
]

// ================================
// 计算属性
// ================================

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const filteredIcons = computed(() => {
  let result = [...iconList.value]

  // 分类筛选
  if (activeCategory.value !== 'all') {
    result = result.filter(icon => icon.category === activeCategory.value)
  }

  // 关键字搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(icon => 
      icon.name.toLowerCase().includes(keyword) ||
      icon.keywords.some(k => k.toLowerCase().includes(keyword))
    )
  }

  return result
})

// ================================
// 监听器
// ================================

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    initIcons()
    selectedIcon.value = ''
    searchKeyword.value = ''
    activeCategory.value = 'all'
  }
})

// ================================
// 生命周期
// ================================

onMounted(() => {
  initIcons()
})

// ================================
// 方法
// ================================

/** 初始化图标列表 */
const initIcons = () => {
  loading.value = true
  
  try {
    const icons = Object.keys(ElementPlusIcons).map(iconName => ({
      name: iconName,
      category: categorizeIcon(iconName),
      keywords: generateKeywords(iconName)
    }))
    
    iconList.value = icons
  } catch (error) {
    console.error('初始化图标列表失败:', error)
  } finally {
    loading.value = false
  }
}

/** 图标分类 */
const categorizeIcon = (iconName: string): string => {
  const name = iconName.toLowerCase()
  
  // 导航相关
  if (/^(menu|navigation|arrow|back|forward|home|house)/.test(name) ||
      /^(up|down|left|right|top|bottom)/.test(name)) {
    return 'navigation'
  }
  
  // 业务相关
  if (/^(user|avatar|person|people|team|group|company|office)/.test(name) ||
      /^(money|coin|price|shopping|cart|goods|order)/.test(name) ||
      /^(document|file|folder|data|chart|graph)/.test(name)) {
    return 'business'
  }
  
  // 系统相关
  if (/^(setting|config|tool|gear|wrench|key|lock)/.test(name) ||
      /^(check|error|warning|info|success|fail)/.test(name) ||
      /^(add|plus|delete|remove|edit|update)/.test(name)) {
    return 'system'
  }
  
  // 媒体相关
  if (/^(picture|image|photo|camera|video|play|pause)/.test(name) ||
      /^(music|sound|volume|microphone)/.test(name)) {
    return 'media'
  }
  
  // 基础图标
  if (/^(circle|square|triangle|star|heart|diamond)/.test(name) ||
      /^(line|border|background|color)/.test(name)) {
    return 'basic'
  }
  
  return 'other'
}

/** 生成关键字 */
const generateKeywords = (iconName: string): string[] => {
  const keywords = [iconName.toLowerCase()]
  
  // 根据图标名称生成相关关键字
  const keywordMap: Record<string, string[]> = {
    'user': ['用户', '人员', '账户'],
    'home': ['首页', '主页', '房屋'],
    'setting': ['设置', '配置', '选项'],
    'menu': ['菜单', '导航', '列表'],
    'search': ['搜索', '查找', '放大镜'],
    'edit': ['编辑', '修改', '笔'],
    'delete': ['删除', '移除', '垃圾桶'],
    'add': ['添加', '新增', '加号'],
    'check': ['检查', '确认', '勾选'],
    'close': ['关闭', '取消', '叉号'],
    // ... 可以添加更多映射
  }
  
  const name = iconName.toLowerCase()
  Object.entries(keywordMap).forEach(([key, values]) => {
    if (name.includes(key)) {
      keywords.push(...values)
    }
  })
  
  return keywords
}

/** 处理搜索 */
const handleSearch = () => {
  // 搜索时重置分类到"全部"
  if (searchKeyword.value && activeCategory.value !== 'all') {
    activeCategory.value = 'all'
  }
}

/** 处理分类切换 */
const handleCategoryChange = () => {
  // 切换分类时清空搜索
  searchKeyword.value = ''
}

/** 处理图标点击 */
const handleIconClick = (iconName: string) => {
  selectedIcon.value = iconName
}

/** 取消选择 */
const handleCancel = () => {
  visible.value = false
}

/** 确认选择 */
const handleConfirm = () => {
  if (selectedIcon.value) {
    emit('select', selectedIcon.value)
  }
}
</script>

<style lang="scss" scoped>
// ================================
// 对话框样式优化
// ================================


// ================================
// 图标选择器主容器
// ================================
.icon-picker {
  // 搜索栏样式
  .search-bar {
    margin-bottom: 24px;
    position: relative;
    
    .el-input {
      .el-input__wrapper {
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border: 1px solid #e4e7ed;
        transition: all 0.3s ease;
        height: 48px;
        
        &:hover {
          border-color: #667eea;
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.2);
        }
        
        &.is-focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }
        
        .el-input__inner {
          font-size: 15px;
          color: #303133;
          
          &::placeholder {
            color: #a8abb2;
            font-style: italic;
          }
        }
        
        .el-input__prefix {
          color: #667eea;
          font-size: 18px;
        }
      }
    }
  }

  // 分类标签样式
  .category-tabs {
    margin-bottom: 24px;
    padding: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    
    :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    :deep(.el-radio-button) {
      margin: 0;
      
      .el-radio-button__inner {
        border-radius: 20px;
        padding: 8px 16px;
        border: 1px solid #e4e7ed;
        background: #fafbfc;
        color: #606266;
        font-weight: 500;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #667eea;
          color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: translateY(-1px);
        }
      }
      
      &.is-active .el-radio-button__inner {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-color: #667eea;
        color: white;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        transform: translateY(-2px);
      }
      
      &:first-child .el-radio-button__inner {
        border-left: 1px solid #e4e7ed;
      }
    }
  }

  // 图标网格样式
  .icon-grid {
    min-height: 450px;
    max-height: 550px;
    overflow-y: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 12px;
    padding: 16px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 8px;
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
        transition: left 0.5s ease;
      }

      &:hover {
        border-color: #667eea;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
        
        &::before {
          left: 100%;
        }
        
        .el-icon {
          transform: scale(1.2) rotate(5deg);
          color: #667eea;
        }
        
        .icon-name {
          color: #667eea;
          font-weight: 600;
        }
      }

      &.active {
        border-color: #667eea;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
        transform: translateY(-6px) scale(1.08);
        
        .el-icon {
          color: white;
          transform: scale(1.3) rotate(-5deg);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
        }

        .icon-name {
          color: white;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
      }
      
      .el-icon {
        font-size: 24px;
        transition: all 0.3s ease;
        margin-bottom: 8px;
        color: #606266;
      }

      .icon-name {
        font-size: 11px;
        color: #606266;
        text-align: center;
        line-height: 1.2;
        word-break: break-all;
        font-weight: 500;
        transition: all 0.3s ease;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      padding: 60px 20px;
      text-align: center;
      
      :deep(.el-empty) {
        .el-empty__image {
          width: 120px;
          
          svg {
            color: #c0c4cc;
          }
        }
        
        .el-empty__description {
          color: #909399;
          font-size: 15px;
          margin-top: 16px;
        }
      }
    }
  }
  
  // 自定义滚动条
  .icon-grid::-webkit-scrollbar {
    width: 8px;
  }
  
  .icon-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  .icon-grid::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4px;
    
    &:hover {
      background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    }
  }
}

// ================================
// 对话框底部按钮
// ================================
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  
  .el-button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.3s ease, height 0.3s ease;
    }
    
    &:active::before {
      width: 300px;
      height: 300px;
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
      }
      
      &:disabled {
        background: #c0c4cc;
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
    
    &.el-button--default {
      background: white;
      border: 1px solid #e4e7ed;
      color: #606266;
      
      &:hover {
        background: #f8fafc;
        border-color: #667eea;
        color: #667eea;
      }
    }
  }
}

// ================================
// 响应式设计
// ================================
@media (max-width: 1024px) {
  :deep(.el-dialog) {
    width: 90% !important;
  }
  
  .icon-picker .icon-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 10px;
    
    .icon-item {
      padding: 12px 6px;
      
      .el-icon {
        font-size: 20px;
      }
      
      .icon-name {
        font-size: 10px;
      }
    }
  }
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 16px auto !important;
  }
  
  .icon-picker {
    .search-bar .el-input .el-input__wrapper {
      height: 44px;
    }
    
    .category-tabs {
      padding: 12px;
      
      :deep(.el-radio-button .el-radio-button__inner) {
        padding: 6px 12px;
        font-size: 13px;
      }
    }
    
    .icon-grid {
      grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      gap: 8px;
      min-height: 350px;
      max-height: 400px;
      
      .icon-item {
        padding: 10px 4px;
        border-radius: 8px;
        
        .el-icon {
          font-size: 18px;
        }
        
        .icon-name {
          font-size: 9px;
        }
      }
    }
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
    gap: 12px;
    
    .el-button {
      width: 100%;
    }
  }
}

// ================================
// 入场动画
// ================================
@keyframes icon-appear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.icon-picker .icon-grid .icon-item {
  animation: icon-appear 0.3s ease-out;
  animation-fill-mode: both;
  
  @for $i from 1 through 50 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.02s};
    }
  }
}
</style>