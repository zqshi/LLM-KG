<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="90%"
    top="5vh"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="create-post-dialog"
  >
    <div class="dialog-content">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        @submit.prevent
      >
        <!-- 标题 -->
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入帖子标题（建议30字以内）"
            maxlength="100"
            show-word-limit
            clearable
            @blur="checkTitleDuplicate"
          >
            <template #prefix>
              <el-icon><Edit /></el-icon>
            </template>
          </el-input>
          <div v-if="titleCheckResult.duplicate" class="title-warning">
            <el-alert
              title="标题可能重复"
              type="warning"
              :description="`建议标题：${titleCheckResult.suggestions?.join('、')}`"
              show-icon
              :closable="false"
            />
          </div>
        </el-form-item>

        <!-- 描述/导语 -->
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入内容摘要或导语（可选）"
            :rows="2"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 分类选择 -->
        <el-form-item label="分类" prop="categoryId">
          <el-cascader
            v-model="form.categoryId"
            :options="categoryOptions"
            :props="cascaderProps"
            placeholder="请选择帖子分类"
            style="width: 100%"
            clearable
            filterable
            @change="handleCategoryChange"
          />
        </el-form-item>

        <!-- 标签 -->
        <el-form-item label="标签">
          <div class="tags-container">
            <div class="selected-tags">
              <el-tag
                v-for="(tag, index) in form.tags"
                :key="index"
                closable
                @close="removeTag(index)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </div>
            <div class="tag-input">
              <el-input
                v-model="tagInput"
                placeholder="输入标签后按回车添加"
                size="small"
                @keyup.enter="addTag"
                @blur="addTag"
                style="width: 200px"
              />
              <el-button size="small" @click="showRecommendedTags" :loading="loadingTags">
                推荐标签
              </el-button>
            </div>
            <div v-if="recommendedTags.length > 0" class="recommended-tags">
              <span class="label">推荐：</span>
              <el-tag
                v-for="tag in recommendedTags"
                :key="tag"
                size="small"
                @click="selectRecommendedTag(tag)"
                class="recommended-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-form-item>

        <!-- 正文内容 -->
        <el-form-item label="正文" prop="content">
          <div class="editor-container">
            <div class="editor-toolbar">
              <el-button-group size="small">
                <el-button @click="insertTemplate('announcement')">
                  <el-icon><Bell /></el-icon>公告
                </el-button>
                <el-button @click="insertTemplate('activity')">
                  <el-icon><Calendar /></el-icon>活动
                </el-button>
                <el-button @click="insertTemplate('tutorial')">
                  <el-icon><Document /></el-icon>教程
                </el-button>
              </el-button-group>
              <div class="editor-stats">
                <el-text type="info" size="small">
                  字数：{{ contentWordCount }} | 预计阅读：{{ estimatedReadTime }}分钟
                </el-text>
              </div>
            </div>
            <el-input
              v-model="form.content"
              type="textarea"
              placeholder="请输入帖子正文内容（支持Markdown格式）..."
              :rows="12"
              maxlength="10000"
              show-word-limit
            />
          </div>
        </el-form-item>

        <!-- 可见范围 -->
        <el-form-item label="可见范围" prop="visibleRange">
          <el-tree
            ref="orgTreeRef"
            :data="organizationTree"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="form.visibleRange"
            @check="handleOrgTreeCheck"
            class="org-tree"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon><OfficeBuilding /></el-icon>
                {{ node.label }}
              </span>
            </template>
          </el-tree>
        </el-form-item>

        <!-- 附件上传 -->
        <el-form-item label="附件">
          <el-upload
            ref="uploadRef"
            :file-list="fileList"
            :action="uploadAction"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :on-remove="handleFileRemove"
            multiple
            :limit="5"
            drag
            class="upload-area"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持图片、文档、压缩包等格式，单个文件不超过10MB，最多5个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 高级选项 -->
        <el-form-item label="高级选项">
          <div class="advanced-options">
            <el-checkbox v-model="isTop">置顶帖子</el-checkbox>
            <el-checkbox v-model="isElite">设为精华</el-checkbox>
            <el-checkbox v-model="form.officialFlag" disabled>官方发布</el-checkbox>
          </div>
        </el-form-item>

        <!-- 置顶时间 -->
        <el-form-item v-if="isTop" label="置顶时间">
          <el-date-picker
            v-model="topExpiryDate"
            type="datetime"
            placeholder="选择置顶过期时间（可选）"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="info" @click="handleSaveDraft" :loading="draftSaving">
          保存草稿
        </el-button>
        <el-button type="primary" @click="handleSubmit" :loading="publishing">
          立即发布
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElTree, type FormInstance, type UploadInstance } from 'element-plus'
import { 
  Edit, Bell, Calendar, Document, OfficeBuilding, UploadFilled 
} from '@element-plus/icons-vue'
import { useContentStore } from '@/stores/content'
import contentApi from '@/api/content'
import type { AdminPostForm, OrganizationNode, CascaderValue } from '@/types'
import type { CascaderValue as ElCascaderValue } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  categoryCode?: string
  categoryName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
}>()

const formRef = ref<FormInstance>()
const orgTreeRef = ref<InstanceType<typeof ElTree>>()
const uploadRef = ref<UploadInstance>()
const contentStore = useContentStore()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  return props.categoryName ? `在【${props.categoryName}】版块发布新帖` : '管理员发布新帖'
})

// 扩展 AdminPostForm 类型以包含级联选择器的值类型
interface ExtendedAdminPostForm extends Omit<AdminPostForm, 'categoryId'> {
  categoryId: CascaderValue | number
}

// 表单数据 - 使用扩展的类型
const form = reactive<ExtendedAdminPostForm>({
  title: '',
  description: '',
  categoryId: [] as CascaderValue,
  tags: [],
  content: '',
  contentHtml: '',
  visibleRange: [],
  attachments: [],
  officialFlag: true // 默认官方发布
})

// 额外的表单状态
const isTop = ref(false)
const isElite = ref(false)
const topExpiryDate = ref('')
const tagInput = ref('')
const titleCheckResult = ref<{ duplicate: boolean; suggestions?: string[] }>({ duplicate: false, suggestions: [] })
const publishing = ref(false)
const draftSaving = ref(false)
const loadingTags = ref(false)

// 数据选项
const categoryOptions = ref<any[]>([])
const organizationTree = ref<OrganizationNode[]>([])
const recommendedTags = ref<string[]>([])
const fileList = ref<any[]>([])

// 配置选项
const cascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  emitPath: false, // 只返回最后一级的值
  checkStrictly: false // 严格模式，只能选择叶子节点
}

const treeProps = {
  children: 'children',
  label: 'name'
}

const uploadAction = '/api/forum/posts/upload-attachment'

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入帖子标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度应在5-100字符之间', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择帖子分类', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 10, message: '内容至少需要10个字符', trigger: 'blur' }
  ],
  visibleRange: [
    { required: true, type: 'array' as const, min: 1, message: '请选择可见范围', trigger: 'change' }
  ]
}

// 计算属性
const contentWordCount = computed(() => {
  return form.content.replace(/\s/g, '').length
})

const estimatedReadTime = computed(() => {
  return Math.max(1, Math.ceil(contentWordCount.value / 300))
})

// 初始化数据
onMounted(async () => {
  await Promise.all([
    loadCategoryOptions(),
    loadOrganizationTree()
  ])
})

// 监听弹窗打开状态
watch(() => props.modelValue, (val) => {
  if (val) {
    // 重置表单
    resetForm()
    // 如果有传入分类信息，预设分类
    if (props.categoryCode) {
      // 这里需要根据 categoryCode 找到对应的 categoryId
      // 暂时先设置为空，实际需要通过API查询
    }
  }
})

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const response = await contentApi.getCascaderCategories()
    if (response.code === 200) {
      categoryOptions.value = response.data
    }
  } catch (error) {
    console.error('加载分类数据失败:', error)
    ElMessage.error('加载分类数据失败')
  }
}

// 加载组织架构树
const loadOrganizationTree = async () => {
  try {
    const response = await contentApi.getOrganizationTree()
    if (response.code === 200) {
      organizationTree.value = response.data
      // 默认选择全公司
      if (organizationTree.value.length > 0) {
        form.visibleRange = [organizationTree.value[0].id]
      }
    }
  } catch (error) {
    console.error('加载组织架构失败:', error)
    ElMessage.error('加载组织架构失败')
  }
}

// 分类选择变化处理
const handleCategoryChange = (value: any) => {
  if (value) {
    form.categoryId = value as CascaderValue
    // 分类变化时，重新获取推荐标签
    if (form.content && value) {
      getRecommendedTags()
    }
  }
}

// 组织架构树选择处理
const handleOrgTreeCheck = (data: any, checkedInfo: any) => {
  form.visibleRange = checkedInfo.checkedKeys
}

// 标签相关方法
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !form.tags.includes(tag)) {
    form.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index: number) => {
  form.tags.splice(index, 1)
}

const selectRecommendedTag = (tag: string) => {
  if (!form.tags.includes(tag)) {
    form.tags.push(tag)
  }
}

const showRecommendedTags = async () => {
  await getRecommendedTags()
}

const getRecommendedTags = async () => {
  if (!form.content) {
    ElMessage.warning('请先输入帖子内容')
    return
  }
  
  loadingTags.value = true
  try {
    const categoryId = Array.isArray(form.categoryId) 
      ? form.categoryId[form.categoryId.length - 1] 
      : form.categoryId
    const response = await contentApi.getRecommendedTags(form.content, categoryId as number)
    if (response.code === 200) {
      recommendedTags.value = response.data.filter(tag => !form.tags.includes(tag))
    }
  } catch (error) {
    console.error('获取推荐标签失败:', error)
    ElMessage.error('获取推荐标签失败')
  } finally {
    loadingTags.value = false
  }
}

// 文件上传相关方法
const beforeUpload = (file: File) => {
  const isValidType = ['image/', 'application/', 'text/'].some(type => 
    file.type.startsWith(type)
  )
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只支持图片、文档、压缩包等格式')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any, file: any, fileList: any) => {
  if (response.code === 200) {
    form.attachments = form.attachments || []
    form.attachments.push(response.data.url)
    ElMessage.success('文件上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleUploadError = (error: any) => {
  console.error('上传失败:', error)
  ElMessage.error('文件上传失败')
}

const handleFileRemove = (file: any, fileList: any) => {
  // 从附件列表中移除对应的URL
  const index = fileList.findIndex((f: any) => f.uid === file.uid)
  if (index > -1 && form.attachments) {
    form.attachments.splice(index, 1)
  }
}

// 标题重复检查
const checkTitleDuplicate = async () => {
  if (!form.title) return
  try {
    const response = await contentApi.checkTitleDuplicate(form.title)
    if (response.code === 200) {
      titleCheckResult.value = response.data
    }
  } catch (error) {
    console.error('检查标题重复失败:', error)
  }
}

// 模板插入
const insertTemplate = (type: string) => {
  const templates = {
    announcement: '【重要公告】\n\n尊敬的各位同事：\n\n内容...\n\n特此通知。',
    activity: '【活动通知】\n\n活动主题：\n活动时间：\n活动地点：\n参与方式：',
    tutorial: '# 教程标题\n\n## 概述\n简要介绍...\n\n## 步骤\n1. 第一步\n2. 第二步'
  }
  const template = templates[type as keyof typeof templates] || ''
  if (template) {
    form.content = (form.content ? form.content + '\n\n' : '') + template
  }
}

// 关闭处理
const handleClose = () => {
  if (form.title || form.content) {
    ElMessage.warning('您有未保存的内容，请先保存草稿')
    return false
  }
  visible.value = false
}

// 取消处理
const handleCancel = () => {
  visible.value = false
  resetForm()
}

// 保存草稿
const handleSaveDraft = async () => {
  if (!form.title && !form.content) {
    ElMessage.warning('请至少输入标题或内容')
    return
  }
  
  draftSaving.value = true
  try {
    const draftData = {
      ...form,
      categoryId: Array.isArray(form.categoryId) 
        ? (form.categoryId[form.categoryId.length - 1] as number)
        : (form.categoryId as number),
      isTop: isTop.value,
      isElite: isElite.value,
      topExpiry: topExpiryDate.value
    } as AdminPostForm & { isTop?: boolean; isElite?: boolean; topExpiry?: string }
    
    const response = await contentApi.savePostDraft(draftData)
    if (response.code === 200) {
      ElMessage.success('草稿保存成功')
    }
  } catch (error) {
    console.error('保存草稿失败:', error)
    ElMessage.error('草稿保存失败')
  } finally {
    draftSaving.value = false
  }
}

// 发布处理
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    publishing.value = true
    
    // 构建发布数据
    const postData: AdminPostForm & {
      isTop?: boolean
      isElite?: boolean 
      topExpiry?: string
    } = {
      ...form,
      isTop: isTop.value,
      isElite: isElite.value,
      topExpiry: isTop.value && topExpiryDate.value ? topExpiryDate.value : undefined,
      // 确保 categoryId 是数字
      categoryId: Array.isArray(form.categoryId) 
        ? (form.categoryId[form.categoryId.length - 1] as number)
        : (form.categoryId as number)
    }
    
    const response = await contentApi.createAdminPost(postData)
    
    if (response.code === 200) {
      ElMessage.success('帖子发布成功！')
      visible.value = false
      emit('success')
      resetForm()
    } else {
      ElMessage.error(response.message || '发布失败')
    }
  } catch (error) {
    console.error('发布失败:', error)
    ElMessage.error('发布失败，请检查表单信息')
  } finally {
    publishing.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置表单数据
  Object.assign(form, {
    title: '',
    description: '',
    categoryId: [] as CascaderValue,
    tags: [],
    content: '',
    contentHtml: '',
    visibleRange: organizationTree.value.length > 0 ? [organizationTree.value[0].id] : [],
    attachments: [],
    officialFlag: true
  })
  
  // 重置其他状态
  isTop.value = false
  isElite.value = false
  topExpiryDate.value = ''
  tagInput.value = ''
  titleCheckResult.value = { duplicate: false, suggestions: [] }
  recommendedTags.value = []
  fileList.value = []
  
  // 重置组织架构树选中状态
  if (orgTreeRef.value && organizationTree.value.length > 0) {
    orgTreeRef.value.setCheckedKeys([organizationTree.value[0].id])
  }
}
</script>

<style scoped>


.dialog-content {
  width: 100%;
}

.title-warning {
  margin-top: 8px;
}

.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.editor-stats {
  color: #909399;
  font-size: 12px;
}

.advanced-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.dialog-footer {
  display: flex;
  gap: 10px;
}

/* 标签管理样式 */
.tags-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background-color: #fafafa;
}

.selected-tags {
  margin-bottom: 8px;
  min-height: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.tag-input {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.recommended-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.recommended-tags .label {
  color: #606266;
  font-size: 12px;
  margin-right: 4px;
}

.recommended-tag {
  cursor: pointer;
  margin: 0;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.recommended-tag:hover {
  opacity: 1;
}

/* 组织架构树样式 */
.org-tree {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 上传组件样式 */
.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  height: 120px;
}

.upload-area :deep(.el-upload__tip) {
  margin-top: 8px;
  color: #606266;
  font-size: 12px;
}

/* 级联选择器样式 */
:deep(.el-cascader) {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  
  .advanced-options {
    flex-direction: column;
    gap: 12px;
  }
  
  .tag-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .editor-toolbar {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
}

/* 表单项优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-form-item__content) {
  line-height: 1.4;
}

/* 高亮必填项 */
:deep(.el-form-item.is-required .el-form-item__label::before) {
  color: #f56c6c;
}
</style>