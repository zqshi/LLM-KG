<template>
  <div class="content-create">
    <div class="page-header">
      <h2>发布新帖</h2>
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>

    <el-card shadow="never">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入帖子标题"
            maxlength="100"
            show-word-limit
            clearable
          />
        </el-form-item>

        <el-form-item label="内容类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择内容类型" style="width: 200px">
            <el-option label="文章" value="article" />
            <el-option label="帖子" value="post" />
            <el-option label="资讯" value="news" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属版块" prop="category">
          <el-input
            v-model="form.category"
            placeholder="版块名称"
            readonly
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="标签" prop="tags">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="inputRef"
            v-model="inputValue"
            style="width: 120px"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button
            v-else
            size="small"
            @click="showInput"
          >
            + 添加标签
          </el-button>
        </el-form-item>

        <el-form-item label="内容" prop="content">
          <div class="editor-container">
            <el-input
              v-model="form.content"
              type="textarea"
              placeholder="请输入帖子内容，支持Markdown格式"
              :autosize="{ minRows: 10, maxRows: 20 }"
              maxlength="10000"
              show-word-limit
            />
          </div>
        </el-form-item>

        <el-form-item label="高级选项">
          <div class="advanced-options">
            <el-checkbox v-model="form.isTop">置顶帖子</el-checkbox>
            <el-checkbox v-model="form.isElite">设为精华</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item v-if="form.isTop" label="置顶时间">
          <el-date-picker
            v-model="topExpiryDate"
            type="datetime"
            placeholder="选择置顶过期时间（可选）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button
              type="primary"
              :loading="submitting"
              @click="handleSubmit('publish')"
            >
              <el-icon><DocumentAdd /></el-icon>
              发布
            </el-button>
            <el-button
              :loading="submitting"
              @click="handleSubmit('draft')"
            >
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElInput, type FormInstance } from 'element-plus'
import { ArrowLeft, DocumentAdd, Document, Refresh } from '@element-plus/icons-vue'
import { useContentStore } from '@/stores/content'
import type { ContentForm } from '@/types'

const router = useRouter()
const route = useRoute()
const contentStore = useContentStore()

const formRef = ref<FormInstance>()
const inputRef = ref<InstanceType<typeof ElInput>>()

const submitting = ref(false)
const inputVisible = ref(false)
const inputValue = ref('')
const topExpiryDate = ref('')

// 表单数据
const form = reactive<ContentForm>({
  title: '',
  type: 'post',
  module: 'forum',
  category: String(route.query.category || ''),
  content: '',
  tags: [],
  isTop: false,
  isElite: false
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5-100字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择内容类型', trigger: 'change' }
  ],
  category: [
    { required: true, message: '版块信息不能为空', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容至少需要10个字符', trigger: 'blur' }
  ]
}

// 标签管理
const removeTag = (tag: string) => {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.input?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !form.tags.includes(inputValue.value)) {
    if (form.tags.length >= 5) {
      ElMessage.warning('最多只能添加5个标签')
      return
    }
    form.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 表单提交
const handleSubmit = async (action: 'publish' | 'draft') => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    const formData: ContentForm = {
      ...form,
      status: action === 'publish' ? 2 : 1, // 2:已发布, 1:待审核(草稿)
      topExpiry: form.isTop && topExpiryDate.value ? topExpiryDate.value : undefined
    }

    const success = await contentStore.createContent(formData)
    
    if (success) {
      ElMessage.success(action === 'publish' ? '帖子发布成功！' : '草稿保存成功！')
      goBack()
    }
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  form.tags = []
  topExpiryDate.value = ''
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 如果没有分类信息，默认跳转回列表页
  if (!form.category) {
    ElMessage.warning('请从版块页面进入创建帖子')
    router.push('/content/dashboard')
  }
})
</script>

<style scoped>
.content-create {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.editor-container {
  width: 100%;
}

.advanced-options {
  display: flex;
  gap: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.el-card {
  border-radius: 8px;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-tag {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>