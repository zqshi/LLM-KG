<template>
  <div class="article-editor">
    <el-form :model="articleForm" :rules="formRules" ref="editorFormRef" label-width="120px">
      <!-- 基本信息 -->
      <el-card class="basic-info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <div class="header-actions">
              <el-button size="small" @click="autoGenerate">
                <el-icon><MagicStick /></el-icon>
                AI优化
              </el-button>
              <el-button size="small" type="info" @click="previewArticle">
                <el-icon><View /></el-icon>
                预览
              </el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="文章标题" prop="title">
              <el-input
                v-model="articleForm.title"
                placeholder="请输入文章标题"
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
              <el-select v-model="articleForm.category" style="width: 100%">
                <el-option label="科技" value="tech" />
                <el-option label="财经" value="finance" />
                <el-option label="政策" value="policy" />
                <el-option label="行业动态" value="industry" />
                <el-option label="国际资讯" value="international" />
                <el-option label="企业新闻" value="enterprise" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="文章标签">
              <div class="tags-input">
                <el-tag
                  v-for="tag in articleForm.tags"
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
          </el-col>
          <el-col :span="6">
            <el-form-item label="优先级">
              <el-rate v-model="articleForm.priority" :max="3" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="质量评分">
              <el-rate v-model="articleForm.quality" :max="5" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="摘要/导语">
          <el-input
            v-model="articleForm.summary"
            type="textarea"
            :rows="3"
            placeholder="请输入文章摘要或导语，建议控制在150字以内"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-card>

      <!-- 富文本编辑器 -->
      <el-card class="content-editor-card">
        <template #header>
          <div class="card-header">
            <span>正文内容</span>
            <div class="editor-tools">
              <el-button size="small" @click="insertTemplate">模板</el-button>
              <el-button size="small" @click="checkSpelling">语法检查</el-button>
              <el-button size="small" @click="wordCount">字数统计</el-button>
              <span class="word-count">{{ contentWordCount }} 字</span>
            </div>
          </div>
        </template>

        <el-form-item prop="content">
          <div class="editor-container">
            <!-- 编辑器工具栏 -->
            <div class="editor-toolbar">
              <el-button-group size="small">
                <el-button @click="execCommand('bold')">
                  <el-icon><EditPen /></el-icon>
                </el-button>
                <el-button @click="execCommand('italic')">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button @click="execCommand('underline')">
                  <el-icon><Document /></el-icon>
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

              <el-button-group size="small">
                <el-button @click="insertLink">
                  <el-icon><Link /></el-icon>
                  链接
                </el-button>
                <el-button @click="showImageDialog">
                  <el-icon><Picture /></el-icon>
                  图片
                </el-button>
                <el-button @click="insertTable">
                  <el-icon><Grid /></el-icon>
                  表格
                </el-button>
              </el-button-group>

              <el-select v-model="fontSize" size="small" style="width: 80px;" @change="changeFontSize">
                <el-option label="12px" value="1" />
                <el-option label="14px" value="2" />
                <el-option label="16px" value="3" />
                <el-option label="18px" value="4" />
                <el-option label="20px" value="5" />
                <el-option label="24px" value="6" />
                <el-option label="32px" value="7" />
              </el-select>

              <el-color-picker v-model="textColor" @change="changeTextColor" size="small" />
            </div>

            <!-- 编辑器内容区域 -->
            <div 
              class="editor-content"
              ref="editorRef"
              contenteditable="true"
              @input="onContentChange"
              @paste="onPaste"
              v-html="articleForm.content"
            ></div>
          </div>
        </el-form-item>
      </el-card>

      <!-- 附加信息 -->
      <el-card class="additional-info-card">
        <template #header>
          <span>附加信息</span>
        </template>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原文链接">
              <el-input v-model="articleForm.originalUrl" placeholder="请输入原文链接（选填）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布渠道">
              <el-checkbox-group v-model="articleForm.publishChannels">
                <el-checkbox label="portal">企业门户</el-checkbox>
                <el-checkbox label="wechat">微信公众号</el-checkbox>
                <el-checkbox label="email">内部邮件</el-checkbox>
                <el-checkbox label="dingtalk">钉钉群</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="编辑备注">
          <el-input
            v-model="articleForm.editorNote"
            type="textarea"
            :rows="2"
            placeholder="记录编辑过程中的备注信息"
          />
        </el-form-item>
      </el-card>
    </el-form>

    <!-- 操作按钮区域 -->
    <div class="action-buttons">
      <el-button @click="resetForm">重置</el-button>
      <el-button @click="saveDraft">保存草稿</el-button>
      <el-button type="info" @click="previewArticle">预览</el-button>
      <el-button type="success" @click="submitForReview">提交审核</el-button>
      <el-button type="primary" @click="publishArticle">直接发布</el-button>
    </div>

    <!-- 图片上传对话框 -->
    <el-dialog v-model="imageDialogVisible" title="插入图片" width="600px">
      <el-tabs v-model="imageTabActive">
        <el-tab-pane label="上传图片" name="upload">
          <el-upload
            class="image-uploader"
            :action="uploadUrl"
            :show-file-list="false"
            :before-upload="beforeImageUpload"
            :on-success="handleImageSuccess"
            accept="image/*"
            drag
          >
            <div class="upload-area">
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                将图片拖拽到此处，或<em>点击上传</em>
              </div>
              <div class="el-upload__tip">
                支持 jpg、png、gif 格式，文件大小不超过 5MB
              </div>
            </div>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="网络图片" name="url">
          <el-form label-width="80px">
            <el-form-item label="图片URL">
              <el-input v-model="imageForm.url" placeholder="请输入图片网络地址" />
            </el-form-item>
            <el-form-item label="图片描述">
              <el-input v-model="imageForm.alt" placeholder="请输入图片描述（选填）" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="insertNetworkImage">插入图片</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog v-model="previewVisible" title="文章预览" width="900px">
      <div class="article-preview">
        <div class="preview-header">
          <h1>{{ articleForm.title }}</h1>
          <div class="preview-meta">
            <el-tag :type="getCategoryColor(articleForm.category)">
              {{ getCategoryText(articleForm.category) }}
            </el-tag>
            <span class="preview-date">{{ new Date().toLocaleString() }}</span>
          </div>
          <div class="preview-tags" v-if="articleForm.tags.length">
            <el-tag 
              v-for="tag in articleForm.tags" 
              :key="tag" 
              size="small" 
              type="info"
              style="margin-right: 8px;"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
        
        <div class="preview-summary" v-if="articleForm.summary">
          <p class="summary-text">{{ articleForm.summary }}</p>
        </div>
        
        <div class="preview-content" v-html="articleForm.content"></div>
        
        <div class="preview-footer">
          <div v-if="articleForm.originalUrl" class="original-link">
            <strong>原文链接：</strong>
            <el-link :href="articleForm.originalUrl" type="primary" target="_blank">
              {{ articleForm.originalUrl }}
            </el-link>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 链接插入对话框 -->
    <el-dialog v-model="linkDialogVisible" title="插入链接" width="500px">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { 
  MagicStick,
  View, 
  EditPen,
  Edit,
  Document,
  Link,
  Picture,
  Grid,
  UploadFilled
} from '@element-plus/icons-vue'

interface ArticleForm {
  id?: number
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  priority: number
  quality: number
  originalUrl: string
  publishChannels: string[]
  editorNote: string
}

interface Props {
  article?: ArticleForm
  mode?: 'create' | 'edit'
}

interface Emits {
  (e: 'save', article: ArticleForm): void
  (e: 'submit', article: ArticleForm): void
  (e: 'publish', article: ArticleForm): void
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create'
})

const emit = defineEmits<Emits>()

const editorFormRef = ref<FormInstance>()
const editorRef = ref<HTMLElement>()
const tagInputRef = ref()
const imageDialogVisible = ref(false)
const previewVisible = ref(false)
const linkDialogVisible = ref(false)
const tagInputVisible = ref(false)
const tagInputValue = ref('')
const imageTabActive = ref('upload')
const fontSize = ref('3')
const textColor = ref('#333333')
const uploadUrl = 'https://jsonplaceholder.typicode.com/posts'

const articleForm = reactive<ArticleForm>({
  title: '',
  content: '<p>请在此处输入文章内容...</p>',
  summary: '',
  category: '',
  tags: [],
  priority: 1,
  quality: 3,
  originalUrl: '',
  publishChannels: ['portal'],
  editorNote: ''
})

const imageForm = reactive({
  url: '',
  alt: ''
})

const linkForm = reactive({
  url: '',
  text: '',
  target: '_blank'
})

const formRules: FormRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在 5 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择文章分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

const contentWordCount = computed(() => {
  const text = articleForm.content.replace(/<[^>]*>/g, '')
  return text.length
})

const getCategoryColor = (category: string) => {
  const colorMap: Record<string, string> = {
    tech: 'primary',
    finance: 'success',
    policy: 'warning',
    industry: 'info',
    international: 'danger',
    enterprise: ''
  }
  return colorMap[category] || ''
}

const getCategoryText = (category: string) => {
  const textMap: Record<string, string> = {
    tech: '科技',
    finance: '财经',
    policy: '政策',
    industry: '行业动态',
    international: '国际资讯',
    enterprise: '企业新闻'
  }
  return textMap[category] || category
}

const onContentChange = () => {
  if (editorRef.value) {
    articleForm.content = editorRef.value.innerHTML
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

const changeFontSize = () => {
  execCommand('fontSize', fontSize.value)
}

const changeTextColor = () => {
  execCommand('foreColor', textColor.value)
}

const showTagInput = () => {
  tagInputVisible.value = true
  nextTick(() => {
    tagInputRef.value?.focus()
  })
}

const addTag = () => {
  if (tagInputValue.value && !articleForm.tags.includes(tagInputValue.value)) {
    if (articleForm.tags.length < 10) {
      articleForm.tags.push(tagInputValue.value)
    } else {
      ElMessage.warning('最多只能添加10个标签')
    }
  }
  tagInputValue.value = ''
  tagInputVisible.value = false
}

const removeTag = (tag: string) => {
  const index = articleForm.tags.indexOf(tag)
  if (index > -1) {
    articleForm.tags.splice(index, 1)
  }
}

const showImageDialog = () => {
  imageDialogVisible.value = true
}

const beforeImageUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片格式的文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleImageSuccess = (response: any, file: any) => {
  // 模拟图片上传成功
  const imageUrl = URL.createObjectURL(file.raw)
  insertImageToEditor(imageUrl, file.name)
  imageDialogVisible.value = false
  ElMessage.success('图片上传成功')
}

const insertNetworkImage = () => {
  if (!imageForm.url) {
    ElMessage.warning('请输入图片URL')
    return
  }
  insertImageToEditor(imageForm.url, imageForm.alt)
  imageDialogVisible.value = false
  Object.assign(imageForm, { url: '', alt: '' })
}

const insertImageToEditor = (src: string, alt: string = '') => {
  const img = `<img src="${src}" alt="${alt}" style="max-width: 100%; height: auto;" />`
  execCommand('insertHTML', img)
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

const insertTable = () => {
  const table = `
    <table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">
      <tr>
        <th style="padding: 8px; background: #f5f5f5;">表头1</th>
        <th style="padding: 8px; background: #f5f5f5;">表头2</th>
        <th style="padding: 8px; background: #f5f5f5;">表头3</th>
      </tr>
      <tr>
        <td style="padding: 8px;">单元格1</td>
        <td style="padding: 8px;">单元格2</td>
        <td style="padding: 8px;">单元格3</td>
      </tr>
    </table>
  `
  execCommand('insertHTML', table)
}

const insertTemplate = () => {
  ElMessageBox.prompt('请选择要插入的模板', '插入模板', {
    confirmButtonText: '插入',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '输入模板内容'
  }).then(({ value }) => {
    if (value) {
      execCommand('insertHTML', value)
    }
  })
}

const checkSpelling = () => {
  ElMessage.info('语法检查功能开发中...')
}

const wordCount = () => {
  ElMessage.info(`当前文章共 ${contentWordCount.value} 字`)
}

const autoGenerate = () => {
  ElMessage.info('AI优化功能开发中...')
}

const previewArticle = () => {
  if (!articleForm.title) {
    ElMessage.warning('请先输入文章标题')
    return
  }
  previewVisible.value = true
}

const resetForm = () => {
  if (editorFormRef.value) {
    editorFormRef.value.resetFields()
  }
  Object.assign(articleForm, {
    title: '',
    content: '<p>请在此处输入文章内容...</p>',
    summary: '',
    category: '',
    tags: [],
    priority: 1,
    quality: 3,
    originalUrl: '',
    publishChannels: ['portal'],
    editorNote: ''
  })
  if (editorRef.value) {
    editorRef.value.innerHTML = articleForm.content
  }
}

const saveDraft = async () => {
  if (!editorFormRef.value) return
  
  await editorFormRef.value.validate((valid) => {
    if (valid) {
      emit('save', { ...articleForm })
      ElMessage.success('草稿已保存')
    }
  })
}

const submitForReview = async () => {
  if (!editorFormRef.value) return
  
  await editorFormRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...articleForm })
      ElMessage.success('已提交审核')
    }
  })
}

const publishArticle = async () => {
  if (!editorFormRef.value) return
  
  await editorFormRef.value.validate((valid) => {
    if (valid) {
      emit('publish', { ...articleForm })
      ElMessage.success('文章已发布')
    }
  })
}

// 初始化文章数据
onMounted(() => {
  if (props.article) {
    Object.assign(articleForm, props.article)
    if (editorRef.value) {
      editorRef.value.innerHTML = articleForm.content
    }
  }
})
</script>

<style scoped>
.article-editor {
  max-width: 1200px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.basic-info-card,
.content-editor-card,
.additional-info-card {
  margin-bottom: 20px;
}

.tags-input {
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
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

.editor-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.word-count {
  font-size: 12px;
  color: #909399;
}

.editor-content {
  min-height: 400px;
  padding: 20px;
  line-height: 1.6;
  font-size: 14px;
  outline: none;
  background: #fff;
}

.editor-content:empty::before {
  content: '请在此处输入文章内容...';
  color: #c0c4cc;
}

.editor-content img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}

.editor-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 10px 0;
}

.editor-content th,
.editor-content td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.editor-content th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  margin-top: 20px;
}

.image-uploader .upload-area {
  text-align: center;
  padding: 40px;
}

.image-uploader .el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.image-uploader .el-upload__text {
  color: #606266;
  font-size: 14px;
}

.image-uploader .el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.article-preview {
  max-height: 600px;
  overflow-y: auto;
  padding: 20px;
}

.preview-header {
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.preview-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.preview-date {
  color: #999;
  font-size: 14px;
}

.preview-tags {
  margin-top: 12px;
}

.preview-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  border-left: 4px solid #409EFF;
}

.summary-text {
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  font-style: italic;
}

.preview-content {
  line-height: 1.8;
  font-size: 15px;
  color: #333;
}

.preview-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.original-link {
  color: #666;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>