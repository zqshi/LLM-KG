<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑AI工具' : '新增AI工具'"
    width="700px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="工具Logo" prop="logo">
        <div class="logo-upload-container">
          <el-upload
            :show-file-list="false"
            :before-upload="beforeLogoUpload"
            :on-success="handleLogoSuccess"
            :on-error="handleLogoError"
            action="#"
            :auto-upload="false"
            :on-change="handleLogoChange"
            class="logo-uploader"
          >
            <div v-if="form.logo" class="logo-preview">
              <img :src="form.logo" alt="工具Logo" />
              <div class="logo-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换图片</span>
              </div>
            </div>
            <div v-else class="logo-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">上传Logo</div>
            </div>
          </el-upload>
          <div class="logo-tips">
            <p>建议尺寸：256x256px</p>
            <p>支持格式：PNG、JPG、JPEG</p>
            <p>文件大小不超过2MB</p>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="工具名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入工具名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="工具标签" prop="tagId">
        <el-select
          v-model="form.tagId"
          placeholder="请选择工具标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in allTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </el-select>
        <div v-if="allTags.length === 0" class="no-tags-tip">
          暂无可用标签，请先前往<el-link type="primary">【工具标签管理】</el-link>页面创建
        </div>
      </el-form-item>

      <el-form-item label="工具描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入工具描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="跳转地址" prop="url">
        <el-input
          v-model="form.url"
          placeholder="请输入工具的访问地址，如：https://example.com"
          maxlength="500"
        >
          <template #prepend>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <!-- 关联案例模块 -->
    <div v-if="isEdit" class="case-section">
      <el-divider content-position="left">关联热门案例</el-divider>
      <CaseSelector 
        v-if="formData?.id"
        :tool-id="formData.id"
      />
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          取消
        </el-button>
        <el-button 
          type="primary" 
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, Camera, Link } from '@element-plus/icons-vue'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useAIToolsStore } from '@/stores/aiTools'
import CaseSelector from './CaseSelector.vue'
import type { AITool, AIToolForm } from '@/types/aiTools'

interface Props {
  visible: boolean
  formData?: Partial<AITool>
  isEdit?: boolean
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

const props = withDefaults(defineProps<Props>(), {
  formData: () => ({}),
  isEdit: false
})

const emit = defineEmits<Emits>()

const aiToolsStore = useAIToolsStore()
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const logoUploading = ref(false)

// 表单数据
const form = reactive<AIToolForm>({
  logo: '',
  name: '',
  tagId: 0,
  description: '',
  url: '',
  status: 'enabled'
})

// 表单验证规则
const formRules: FormRules = {
  logo: [
    { required: true, message: '请上传工具Logo', trigger: 'change' }
  ],
  name: [
    { required: true, message: '请输入工具名称', trigger: 'blur' },
    { min: 1, max: 50, message: '工具名称长度为1-50个字符', trigger: 'blur' }
  ],
  tagId: [
    { required: true, message: '请选择工具标签', trigger: 'change', type: 'number', min: 1 }
  ],
  description: [
    { required: true, message: '请输入工具描述', trigger: 'blur' },
    { min: 1, max: 500, message: '工具描述长度为1-500个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入工具跳转地址', trigger: 'blur' },
    { 
      pattern: /^https?:\/\/.+/, 
      message: '请输入有效的URL，需以http://或https://开头', 
      trigger: 'blur' 
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性 - 从 store 获取数据
const { allTags } = storeToRefs(aiToolsStore)

// Logo上传前验证
const beforeLogoUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
  const isValidSize = file.size / 1024 / 1024 < 2

  if (!isValidType) {
    ElMessage.error('Logo只能是JPG/PNG格式!')
    return false
  }
  if (!isValidSize) {
    ElMessage.error('Logo大小不能超过2MB!')
    return false
  }
  return true
}

// Logo文件选择处理
const handleLogoChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw) return
  
  const isValid = beforeLogoUpload(uploadFile.raw)
  if (!isValid) return

  try {
    logoUploading.value = true
    const logoUrl = await aiToolsStore.uploadLogo(uploadFile.raw)
    form.logo = logoUrl
    ElMessage.success('Logo上传成功')
  } catch (error) {
    console.error('Logo上传失败:', error)
  } finally {
    logoUploading.value = false
  }
}

// Logo上传成功回调
const handleLogoSuccess = () => {
  // 由 handleLogoChange 处理
}

// Logo上传失败回调
const handleLogoError = () => {
  ElMessage.error('Logo上传失败')
}

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
    form.logo = newData.logo || ''
    form.name = newData.name || ''
    form.tagId = newData.tagId || 0
    form.description = newData.description || ''
    form.url = newData.url || ''
    form.status = newData.status || 'enabled'
  }
}, { immediate: true, deep: true })

// 监听弹窗显示状态
watch(() => props.visible, async (visible) => {
  if (visible) {
    // 确保标签数据已加载
    if (allTags.value.length === 0) {
      await aiToolsStore.fetchAllTags()
    }
    
    if (formRef.value) {
      nextTick(() => {
        formRef.value?.clearValidate()
      })
    }
  }
})

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  // 重置表单
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    const valid = await formRef.value.validate()
    if (!valid) return
    
    submitLoading.value = true
    
    if (props.isEdit && props.formData?.id) {
      // 更新工具
      await aiToolsStore.updateExistingTool(props.formData.id, form)
    } else {
      // 创建工具
      await aiToolsStore.createNewTool(form)
    }
    
    emit('success')
    
  } catch (error) {
    console.error('提交表单失败:', error)
  } finally {
    submitLoading.value = false
  }
}
</script>

<script lang="ts">
export default {
  name: 'ToolForm'
}
</script>

<style scoped>
.logo-upload-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.logo-uploader {
  flex-shrink: 0;
}

.logo-uploader :deep(.el-upload) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s;
}

.logo-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
}

.logo-preview {
  position: relative;
  width: 100px;
  height: 100px;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;
}

.logo-preview:hover .logo-overlay {
  opacity: 1;
}

.logo-placeholder {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #8c939d;
  gap: 8px;
}

.upload-icon {
  font-size: 28px;
}

.upload-text {
  font-size: 14px;
}

.logo-tips {
  flex: 1;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.5;
}

.logo-tips p {
  margin: 0 0 4px 0;
}

.no-tags-tip {
  margin-top: 8px;
  color: #e6a23c;
  font-size: 14px;
}

.case-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 12px;
}
</style>