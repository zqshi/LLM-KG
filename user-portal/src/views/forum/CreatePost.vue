<template>
  <div class="bg-gray-50 font-sans text-gray-800 min-h-screen">
    <!-- 面包屑导航 -->
    <div class="container mx-auto px-4 py-6">
      <div class="text-sm text-gray-500 mb-4">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <router-link to="/forum" class="hover:text-primary transition-colors">论坛</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <span class="text-gray-700">发布帖子</span>
      </div>

      <!-- 发帖表单 -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- 头部 -->
        <div class="p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i class="fa fa-pencil text-primary text-xl"></i>
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">发布新帖子</h1>
                <p class="text-sm text-gray-500">分享你的想法和经验</p>
              </div>
            </div>
            <div class="text-sm text-gray-500">
              <i class="fa fa-clock-o mr-1"></i>
              自动保存草稿
            </div>
          </div>
        </div>

        <!-- 表单内容 -->
        <form @submit.prevent="submitForm" class="p-6 space-y-6">
          <!-- 帖子类型选择 -->
          <div class="space-y-3">
            <label class="text-sm font-medium text-gray-700">帖子类型</label>
            <div class="flex gap-4">
              <label class="flex items-center cursor-pointer">
                <input 
                  v-model="form.type" 
                  type="radio" 
                  value="normal" 
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                >
                <span class="ml-2 text-sm text-gray-700">普通帖子</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input 
                  v-model="form.type" 
                  type="radio" 
                  value="poll" 
                  class="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-2"
                >
                <span class="ml-2 text-sm text-gray-700">投票帖</span>
              </label>
            </div>
          </div>

          <!-- 标题 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">标题 <span class="text-red-500">*</span></label>
            <input 
              v-model="form.title" 
              type="text" 
              placeholder="请输入帖子标题（建议10-50字）" 
              maxlength="100"
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              :class="{ 'border-red-300': titleError }"
            >
            <div class="flex justify-between items-center text-xs">
              <span v-if="titleError" class="text-red-500">{{ titleError }}</span>
              <span class="text-gray-400 ml-auto">{{ form.title.length }}/100</span>
            </div>
          </div>

          <!-- 分类和标签 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">分类 <span class="text-red-500">*</span></label>
              <select 
                v-model="form.category" 
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                :class="{ 'border-red-300': categoryError }"
              >
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <span v-if="categoryError" class="text-xs text-red-500">{{ categoryError }}</span>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">标签</label>
              <div class="relative">
                <input 
                  v-model="currentTag" 
                  @keydown.enter.prevent="addTag"
                  type="text" 
                  placeholder="输入标签后按回车添加" 
                  class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
              </div>
              <div class="flex flex-wrap gap-2 mt-2">
                <span 
                  v-for="(tag, index) in form.tags" 
                  :key="index" 
                  class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                >
                  {{ tag }}
                  <button @click="removeTag(index)" type="button" class="hover:bg-primary/20 rounded-full p-0.5">
                    <i class="fa fa-times text-xs"></i>
                  </button>
                </span>
              </div>
              <div class="text-xs text-gray-500">常用标签：
                <button 
                  v-for="tag in popularTags" 
                  :key="tag" 
                  @click="quickAddTag(tag)"
                  type="button"
                  class="ml-1 text-primary hover:underline"
                >
                  {{ tag }}
                </button>
              </div>
            </div>
          </div>

          <!-- 内容编辑器 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">内容 <span class="text-red-500">*</span></label>
            
            <!-- 编辑器工具栏 -->
            <div class="border border-gray-200 rounded-t-lg bg-gray-50 p-2 flex items-center gap-1">
              <button type="button" class="editor-btn" title="加粗">
                <i class="fa fa-bold"></i>
              </button>
              <button type="button" class="editor-btn" title="斜体">
                <i class="fa fa-italic"></i>
              </button>
              <button type="button" class="editor-btn" title="下划线">
                <i class="fa fa-underline"></i>
              </button>
              <div class="w-px h-4 bg-gray-300 mx-2"></div>
              <button type="button" class="editor-btn" title="链接">
                <i class="fa fa-link"></i>
              </button>
              <button type="button" class="editor-btn" title="图片">
                <i class="fa fa-image"></i>
              </button>
              <button type="button" class="editor-btn" title="代码">
                <i class="fa fa-code"></i>
              </button>
              <div class="w-px h-4 bg-gray-300 mx-2"></div>
              <button type="button" class="editor-btn" title="预览">
                <i class="fa fa-eye"></i>
              </button>
            </div>
            
            <textarea 
              v-model="form.content" 
              placeholder="请输入帖子内容，支持Markdown语法..." 
              rows="12"
              maxlength="5000"
              class="w-full px-4 py-3 border border-gray-200 border-t-0 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
              :class="{ 'border-red-300': contentError }"
            ></textarea>
            <div class="flex justify-between items-center text-xs">
              <div>
                <span v-if="contentError" class="text-red-500">{{ contentError }}</span>
                <span class="text-gray-500 ml-4">支持Markdown语法，可插入图片、代码等</span>
              </div>
              <span class="text-gray-400">{{ form.content.length }}/5000</span>
            </div>
          </div>

          <!-- 投票选项（仅在投票帖时显示） -->
          <div v-if="form.type === 'poll'" class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium text-gray-700">投票选项</label>
              <button 
                @click="addPollOption" 
                type="button" 
                class="text-sm text-primary hover:underline"
              >
                <i class="fa fa-plus mr-1"></i>添加选项
              </button>
            </div>
            <div class="space-y-2">
              <div 
                v-for="(option, index) in form.pollOptions" 
                :key="index" 
                class="flex items-center gap-2"
              >
                <span class="text-sm text-gray-500 w-8">{{ index + 1 }}.</span>
                <input 
                  v-model="option.text" 
                  type="text" 
                  :placeholder="`选项${index + 1}`" 
                  class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                >
                <button 
                  v-if="form.pollOptions.length > 2" 
                  @click="removePollOption(index)" 
                  type="button" 
                  class="text-red-500 hover:bg-red-50 p-2 rounded"
                >
                  <i class="fa fa-trash text-sm"></i>
                </button>
              </div>
            </div>
            
            <!-- 投票设置 -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-2">
                <input 
                  v-model="form.pollSettings.multiChoice" 
                  type="checkbox" 
                  id="multiChoice" 
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                >
                <label for="multiChoice" class="text-sm text-gray-700">允许多选</label>
              </div>
              <div class="space-y-2">
                <label class="text-xs text-gray-600">投票结束时间</label>
                <input 
                  v-model="form.pollSettings.endTime" 
                  type="datetime-local" 
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                >
              </div>
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-100">
            <div class="flex items-center gap-4 text-sm text-gray-500">
              <div class="flex items-center gap-2">
                <input 
                  v-model="form.isAnonymous" 
                  type="checkbox" 
                  id="anonymous" 
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                >
                <label for="anonymous">匿名发布</label>
              </div>
              <div class="flex items-center gap-2">
                <input 
                  v-model="form.allowComments" 
                  type="checkbox" 
                  id="comments" 
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  checked
                >
                <label for="comments">允许评论</label>
              </div>
            </div>
            
            <div class="flex gap-3">
              <button 
                @click="saveDraft" 
                type="button" 
                class="px-6 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                保存草稿
              </button>
              <button 
                @click="$router.go(-1)" 
                type="button" 
                class="px-6 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                type="submit" 
                class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <i class="fa fa-paper-plane"></i>
                发布帖子
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = reactive({
  type: 'normal',
  title: '',
  category: '',
  tags: [] as string[],
  content: '',
  isAnonymous: false,
  allowComments: true,
  pollOptions: [{ text: '' }, { text: '' }],
  pollSettings: {
    multiChoice: false,
    endTime: ''
  }
})

const currentTag = ref('')

const categories = ['技术讨论', '产品反馈', '公司建议', '生活分享', '求助问答', '活动组织']
const popularTags = ['Vue', 'React', '前端', '后端', '产品', '设计', '管理', '团建']

// 表单验证
const titleError = computed(() => {
  if (!form.title.trim()) return '请输入标题'
  if (form.title.length < 5) return '标题至少需要5个字符'
  return ''
})

const categoryError = computed(() => {
  if (!form.category) return '请选择分类'
  return ''
})

const contentError = computed(() => {
  if (!form.content.trim()) return '请输入内容'
  if (form.content.length < 10) return '内容至少需要10个字符'
  return ''
})

// 标签管理
const addTag = () => {
  const tag = currentTag.value.trim()
  if (tag && !form.tags.includes(tag) && form.tags.length < 5) {
    form.tags.push(tag)
    currentTag.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const quickAddTag = (tag: string) => {
  if (!form.tags.includes(tag) && form.tags.length < 5) {
    form.tags.push(tag)
  }
}

// 投票选项管理
const addPollOption = () => {
  if (form.pollOptions.length < 10) {
    form.pollOptions.push({ text: '' })
  }
}

const removePollOption = (index: number) => {
  if (form.pollOptions.length > 2) {
    form.pollOptions.splice(index, 1)
  }
}

// 保存草稿
const saveDraft = () => {
  localStorage.setItem('forum-draft', JSON.stringify(form))
  ElMessage.success('草稿已保存')
}

// 表单提交
const submitForm = () => {
  // 基础验证
  if (titleError.value || categoryError.value || contentError.value) {
    ElMessage.error('请检查表单填写')
    return
  }

  // 投票帖特殊验证
  if (form.type === 'poll') {
    const validOptions = form.pollOptions.filter(opt => opt.text.trim())
    if (validOptions.length < 2) {
      ElMessage.error('投票帖至少需要2个选项')
      return
    }
  }

  // 模拟提交
  ElMessage.success('帖子发布成功')
  
  // 清除草稿
  localStorage.removeItem('forum-draft')
  
  router.push('/forum')
}

// 组件挂载时加载草稿
const loadDraft = () => {
  const draft = localStorage.getItem('forum-draft')
  if (draft) {
    try {
      Object.assign(form, JSON.parse(draft))
    } catch (e) {
      console.error('加载草稿失败:', e)
    }
  }
}

loadDraft()
</script>

<style scoped>
:root {
  --primary: #3B82F6;
}

.text-primary {
  color: var(--primary);
}

.bg-primary {
  background-color: var(--primary);
}

.bg-primary\/10 {
  background-color: rgba(59, 130, 246, 0.1);
}

.bg-primary\/20 {
  background-color: rgba(59, 130, 246, 0.2);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(59, 130, 246, 0.9);
}

.focus\:ring-primary:focus {
  --tw-ring-color: var(--primary);
  --tw-ring-opacity: 0.5;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.focus\:border-primary:focus {
  border-color: var(--primary);
}

.hover\:text-primary:hover {
  color: var(--primary);
}

.editor-btn {
  @apply w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-600;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}

@media (max-width: 768px) {
  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
  
  .md\:grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>