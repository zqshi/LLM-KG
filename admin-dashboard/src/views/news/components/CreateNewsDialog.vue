<template>
  <el-dialog 
    v-model="visible"
    title="创建资讯"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="create-form"
    >
      <el-row :gutter="20">
        <el-col :span="16">
          <el-form-item label="文章标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入资讯标题"
              maxlength="100"
              show-word-limit
              :rows="2"
              type="textarea"
              resize="none"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="文章分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
              <el-option 
                v-for="cat in categories" 
                :key="cat.value" 
                :label="cat.label" 
                :value="cat.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="资讯摘要" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入资讯摘要或导语，建议控制在150字以内"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="正文内容" prop="content">
        <div class="editor-container">
          <div class="editor-toolbar">
            <el-button-group size="small">
              <el-button @click="execCommand('bold')">
                <el-icon><EditPen /></el-icon>
                粗体
              </el-button>
              <el-button @click="execCommand('italic')">
                <el-icon><Edit /></el-icon>
                斜体
              </el-button>
              <el-button @click="execCommand('underline')">
                <el-icon><Document /></el-icon>
                下划线
              </el-button>
            </el-button-group>
            
            <el-button-group size="small">
              <el-button @click="execCommand('justifyLeft')">左对齐</el-button>
              <el-button @click="execCommand('justifyCenter')">居中</el-button>
              <el-button @click="execCommand('justifyRight')">右对齐</el-button>
            </el-button-group>

            <el-button-group size="small">
              <el-button @click="execCommand('insertUnorderedList')">无序列表</el-button>
              <el-button @click="execCommand('insertOrderedList')">有序列表</el-button>
            </el-button-group>

            <el-button size="small" @click="insertLink">
              <el-icon><Link /></el-icon>
              链接
            </el-button>

            <span class="word-count">{{ contentWordCount }} 字</span>
          </div>

          <div 
            class="editor-content"
            ref="editorRef"
            contenteditable="true"
            @input="onContentChange"
            @paste="onPaste"
            v-html="form.content"
          ></div>
        </div>
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="生效时间" prop="effectiveTime">
            <el-date-picker
              v-model="form.effectiveTime"
              type="datetime"
              placeholder="选择生效时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="失效时间">
            <el-date-picker
              v-model="form.expireTime"
              type="datetime"
              placeholder="选择失效时间（可选）"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="可见范围" prop="visibilityScope">
        <el-radio-group v-model="visibilityType" @change="onVisibilityTypeChange">
          <el-radio value="ALL">全员可见</el-radio>
          <el-radio value="DEPARTMENTS">指定部门</el-radio>
        </el-radio-group>
        <div v-if="visibilityType === 'DEPARTMENTS'" class="department-selector">
          <el-select
            v-model="form.visibilityScope"
            multiple
            placeholder="请选择可见部门"
            style="width: 100%"
          >
            <el-option 
              v-for="org in organizationList" 
              :key="org.id" 
              :label="org.name" 
              :value="org.id" 
            />
          </el-select>
        </div>
      </el-form-item>

      <el-form-item label="标签">
        <div class="tags-input">
          <el-tag
            v-for="tag in form.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-if="tagInputVisible"
            ref="tagInputRef"
            v-model="tagInputValue"
            size="small"
            style="width: 120px"
            @keyup.enter="addTag"
            @blur="addTag"
          />
          <el-button
            v-else
            size="small"
            @click="showTagInput"
          >
            + 添加标签
          </el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button @click="handleSaveDraft">保存草稿</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          创建资讯
        </el-button>
      </div>
    </template>

    <!-- 链接插入对话框 -->
    <el-dialog v-model="linkDialogVisible" title="插入链接" width="500px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="链接地址">
          <el-input v-model="linkForm.url" placeholder="请输入链接地址" />
        </el-form-item>
        <el-form-item label="链接文字">
          <el-input v-model="linkForm.text" placeholder="请输入链接显示的文字" />
        </el-form-item>
        <el-form-item label="打开方式">
          <el-radio-group v-model="linkForm.target">
            <el-radio value="_self">当前窗口</el-radio>
            <el-radio value="_blank">新窗口</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="linkDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmInsertLink">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  EditPen,
  Edit,
  Document,
  Link
} from '@element-plus/icons-vue'
import { useNewsStore } from '@/stores/news'
import type { NewsArticleForm } from '@/types'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newsStore = useNewsStore()
const formRef = ref<FormInstance>()
const editorRef = ref<HTMLElement>()
const tagInputRef = ref()
const submitting = ref(false)
const linkDialogVisible = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const visibilityType = ref<'ALL' | 'DEPARTMENTS'>('ALL')

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive<NewsArticleForm>({
  title: '',
  description: '',
  content: '<p>请在此处输入资讯内容...</p>',
  effectiveTime: '',
  expireTime: '',
  visibilityScope: 'ALL',
  category: '',
  tags: []
})

const linkForm = reactive({
  url: '',
  text: '',
  target: '_blank'
})

const categories = [
  { label: '科技', value: 'tech' },
  { label: '财经', value: 'finance' },
  { label: '政策', value: 'policy' },
  { label: '行业动态', value: 'industry' },
  { label: '国际资讯', value: 'international' },
  { label: '企业新闻', value: 'enterprise' }
]

const organizationList = computed(() => newsStore.organizationList)

const rules: FormRules = {
  title: [
    { required: true, message: '请输入资讯标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在 5 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入资讯摘要', trigger: 'blur' },
    { max: 200, message: '摘要长度不能超过 200 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入资讯内容', trigger: 'blur' }
  ],
  effectiveTime: [
    { required: true, message: '请选择生效时间', trigger: 'change' }
  ],
  visibilityScope: [
    { required: true, message: '请设置可见范围', trigger: 'change' }
  ]
}

const contentWordCount = computed(() => {
  const text = form.content.replace(/<[^>]*>/g, '')
  return text.length
})

const onContentChange = () => {
  if (editorRef.value) {
    form.content = editorRef.value.innerHTML
  }
}

const onPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
}

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
}

const insertLink = () => {
  const selection = window.getSelection()
  if (selection && selection.toString()) {
    linkForm.text = selection.toString()
  }
  linkDialogVisible.value = true
}

const confirmInsertLink = () => {
  if (!linkForm.url) {
    ElMessage.warning('请输入链接地址')
    return
  }
  const link = `<a href="${linkForm.url}" target="${linkForm.target}">${linkForm.text || linkForm.url}</a>`
  execCommand('insertHTML', link)
  linkDialogVisible.value = false
  Object.assign(linkForm, { url: '', text: '', target: '_blank' })
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const addTag = () => {
  if (tagInputValue.value && !form.tags!.includes(tagInputValue.value)) {
    if (form.tags!.length < 10) {
      form.tags!.push(tagInputValue.value)
    } else {
      ElMessage.warning('最多只能添加10个标签')
    }
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

const removeTag = (tag: string) => {
  const index = form.tags!.indexOf(tag)
  if (index > -1) {
    form.tags!.splice(index, 1)
  }
}

const onVisibilityTypeChange = () => {
  if (visibilityType.value === 'ALL') {
    form.visibilityScope = 'ALL'
  } else {
    form.visibilityScope = []
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    content: '<p>请在此处输入资讯内容...</p>',
    effectiveTime: '',
    expireTime: '',
    visibilityScope: 'ALL',
    category: '',
    tags: []
  })
  visibilityType.value = 'ALL'
  if (editorRef.value) {
    editorRef.value.innerHTML = form.content
  }
  formRef.value?.resetFields()
}

const handleCancel = () => {
  visible.value = false
}

const handleSaveDraft = () => {
  ElMessage.info('保存草稿功能待实现')
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const success = await newsStore.createNews(form)
      if (success) {
        visible.value = false
        emit('created')
      }
    } finally {
      submitting.value = false
    }
  })
}

const handleClosed = () => {
  resetForm()
}

// 监听对话框显示状态，加载组织架构数据
watch(visible, (newVal) => {
  if (newVal && newsStore.organizationList.length === 0) {
    newsStore.fetchOrganizationList()
  }
})
</script>

<style scoped>
.create-form {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  flex-wrap: wrap;
}

.word-count {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

.editor-content {
  min-height: 300px;
  padding: 16px;
  line-height: 1.6;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.editor-content:empty::before {
  content: '请在此处输入资讯内容...';
  color: #c0c4cc;
}

.department-selector {
  margin-top: 12px;
}

.tags-input {
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>