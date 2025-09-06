<template>
  <el-dialog
    v-model="visible"
    :title="isEditing ? '编辑快捷入口' : '新建快捷入口'"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    class="entry-edit-dialog"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      class="entry-form"
    >
      <el-row :gutter="20">
        <el-col :span="24">
          <el-form-item label="入口名称" prop="name" required>
            <el-input
              v-model="formData.name"
              placeholder="请输入快捷入口名称"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="描述信息" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入入口描述（可选）"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="链接地址" prop="url" required>
            <el-input
              v-model="formData.url"
              placeholder="请输入链接地址，如：/admin/system 或 https://example.com"
            >
              <template #prepend>
                <el-select 
                  v-model="formData.type" 
                  style="width: 100px"
                  @change="handleTypeChange"
                >
                  <el-option label="内部" value="internal" />
                  <el-option label="外部" value="external" />
                  <el-option label="应用" value="app" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        
        <el-col :span="24">
          <el-form-item label="图标设置" required>
            <el-radio-group v-model="formData.iconType" @change="handleIconTypeChange">
              <el-radio value="icon">图标</el-radio>
              <el-radio value="image">图片</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        
        <!-- 图标选择 -->
        <el-col :span="24" v-if="formData.iconType === 'icon'">
          <el-form-item label="选择图标" prop="iconName">
            <div class="icon-selector">
              <div 
                class="icon-preview"
                :style="{
                  backgroundColor: formData.iconBgColor,
                  color: formData.iconColor
                }"
                @click="showIconPicker = true"
              >
                <el-icon v-if="formData.iconName" :size="24">
                  <component :is="formData.iconName" />
                </el-icon>
                <el-icon v-else :size="24">
                  <Plus />
                </el-icon>
              </div>
              <div class="icon-controls">
                <el-button @click="showIconPicker = true" size="small">
                  选择图标
                </el-button>
                <div class="color-controls">
                  <div class="color-item">
                    <label>背景色</label>
                    <el-color-picker 
                      v-model="formData.iconBgColor" 
                      size="small"
                      :predefine="predefineColors"
                    />
                  </div>
                  <div class="color-item">
                    <label>前景色</label>
                    <el-color-picker 
                      v-model="formData.iconColor" 
                      size="small"
                      :predefine="['#ffffff', '#000000', '#333333', '#666666']"
                    />
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-col>
        
        <!-- 图片上传 -->
        <el-col :span="24" v-else>
          <el-form-item label="上传图片" prop="iconUrl">
            <el-upload
              class="icon-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="handleImageUpload"
              accept="image/*"
            >
              <div class="upload-area">
                <img v-if="formData.iconUrl" :src="formData.iconUrl" class="uploaded-icon" />
                <div v-else class="upload-placeholder">
                  <el-icon :size="32"><Upload /></el-icon>
                  <div>点击上传图标</div>
                  <div class="upload-tip">支持 JPG、PNG，建议尺寸 64x64px</div>
                </div>
              </div>
            </el-upload>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="排序值">
            <el-input-number
              v-model="formData.sortOrder"
              :min="0"
              :max="999"
              placeholder="排序值"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="启用状态">
            <el-switch
              v-model="formData.enabled"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <!-- 图标选择器 -->
    <el-dialog
      v-model="showIconPicker"
      title="选择图标"
      width="500px"
      class="icon-picker-dialog"
    >
      <div class="icon-grid">
        <div
          v-for="icon in availableIcons"
          :key="icon.name"
          class="icon-item"
          :class="{ active: formData.iconName === icon.name }"
          @click="selectIcon(icon.name)"
        >
          <el-icon :size="20">
            <component :is="icon.name" />
          </el-icon>
          <span>{{ icon.label }}</span>
        </div>
      </div>
    </el-dialog>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditing ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Upload } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'

interface EntryItem {
  id?: number
  name: string
  description: string
  url: string
  iconType: 'icon' | 'image'
  iconName?: string
  iconUrl?: string
  iconBgColor: string
  iconColor: string
  type: 'internal' | 'external' | 'app'
  enabled: boolean
  sortOrder: number
}

interface Props {
  modelValue: boolean
  entry?: EntryItem | null
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  entry: null,
  isEditing: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: Partial<EntryItem>]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const submitting = ref(false)
const showIconPicker = ref(false)

// 表单数据
const formData = reactive<EntryItem>({
  name: '',
  description: '',
  url: '',
  iconType: 'icon',
  iconName: 'Link',
  iconUrl: '',
  iconBgColor: '#667eea',
  iconColor: '#ffffff',
  type: 'internal',
  enabled: true,
  sortOrder: 0
})

// 预定义颜色
const predefineColors = [
  '#667eea', '#764ba2', '#52c41a', '#fa8c16', '#f5222d',
  '#722ed1', '#eb2f96', '#13c2c2', '#1890ff', '#faad14'
]

// 可用图标
const availableIcons = [
  { name: 'Link', label: '链接' },
  { name: 'Setting', label: '设置' },
  { name: 'DataAnalysis', label: '分析' },
  { name: 'Document', label: '文档' },
  { name: 'User', label: '用户' },
  { name: 'Bell', label: '通知' },
  { name: 'ChatDotRound', label: '聊天' },
  { name: 'Shopping', label: '购物' },
  { name: 'Monitor', label: '监控' },
  { name: 'Tools', label: '工具' },
  { name: 'Calendar', label: '日历' },
  { name: 'Camera', label: '相机' },
  { name: 'Coffee', label: '咖啡' },
  { name: 'Compass', label: '指南针' },
  { name: 'CreditCard', label: '卡片' },
  { name: 'Files', label: '文件' },
  { name: 'House', label: '房屋' },
  { name: 'Menu', label: '菜单' },
  { name: 'Message', label: '消息' },
  { name: 'Phone', label: '电话' },
  { name: 'PieChart', label: '图表' },
  { name: 'Present', label: '礼物' },
  { name: 'Search', label: '搜索' },
  { name: 'Star', label: '星星' },
  { name: 'Trophy', label: '奖杯' }
]

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入入口名称', trigger: 'blur' },
    { min: 1, max: 20, message: '名称长度为1-20个字符', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入链接地址'))
          return
        }
        
        if (formData.type === 'internal') {
          if (!value.startsWith('/')) {
            callback(new Error('内部链接应以 / 开头'))
            return
          }
        } else if (formData.type === 'external') {
          if (!value.startsWith('http://') && !value.startsWith('https://')) {
            callback(new Error('外部链接应以 http:// 或 https:// 开头'))
            return
          }
        }
        
        callback()
      },
      trigger: 'blur'
    }
  ]
}

// 重置表单函数
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    description: '',
    url: '',
    iconType: 'icon',
    iconName: 'Link',
    iconUrl: '',
    iconBgColor: '#667eea',
    iconColor: '#ffffff',
    type: 'internal',
    enabled: true,
    sortOrder: 0
  })
}

// 监听entry变化，更新表单数据
watch(() => props.entry, (newEntry) => {
  if (newEntry) {
    Object.assign(formData, {
      name: newEntry.name,
      description: newEntry.description,
      url: newEntry.url,
      iconType: newEntry.iconType,
      iconName: newEntry.iconName,
      iconUrl: newEntry.iconUrl,
      iconBgColor: newEntry.iconBgColor,
      iconColor: newEntry.iconColor,
      type: newEntry.type,
      enabled: newEntry.enabled,
      sortOrder: newEntry.sortOrder
    })
  } else {
    resetForm()
  }
}, { immediate: true })

const handleTypeChange = (type: string) => {
  // 根据类型自动调整URL格式
  if (type === 'internal' && formData.url && !formData.url.startsWith('/')) {
    formData.url = '/' + formData.url
  } else if (type === 'external' && formData.url && !formData.url.startsWith('http')) {
    formData.url = 'https://' + formData.url
  }
}

const handleIconTypeChange = () => {
  if (formData.iconType === 'icon') {
    formData.iconUrl = ''
    if (!formData.iconName) {
      formData.iconName = 'Link'
    }
  } else {
    formData.iconName = ''
  }
}

const selectIcon = (iconName: string) => {
  formData.iconName = iconName
  showIconPicker.value = false
}

const handleImageUpload = (file: File) => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  // 验证文件大小
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  // 创建文件预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    formData.iconUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)
  
  return false // 阻止自动上传
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 构建保存数据
    const saveData: Partial<EntryItem> = {
      name: formData.name,
      description: formData.description,
      url: formData.url,
      iconType: formData.iconType,
      iconBgColor: formData.iconBgColor,
      iconColor: formData.iconColor,
      type: formData.type,
      enabled: formData.enabled,
      sortOrder: formData.sortOrder
    }
    
    if (formData.iconType === 'icon') {
      saveData.iconName = formData.iconName
    } else {
      saveData.iconUrl = formData.iconUrl
    }
    
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('save', saveData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  visible.value = false
}

const handleClose = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  resetForm()
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.entry-edit-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }
}

.entry-form {
  .icon-selector {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .icon-preview {
      width: 48px;
      height: 48px;
      border-radius: $radius-lg;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: $shadow-card;
      transition: all $transition-medium;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .icon-controls {
      flex: 1;
      
      .color-controls {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        
        .color-item {
          display: flex;
          align-items: center;
          gap: 6px;
          
          label {
            font-size: 12px;
            color: $color-text-secondary;
            white-space: nowrap;
          }
        }
      }
    }
  }
  
  .icon-uploader {
    .upload-area {
      width: 100px;
      height: 100px;
      border: 2px dashed $color-border-primary;
      border-radius: $radius-lg;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all $transition-medium;
      
      &:hover {
        border-color: $color-primary;
        background: lighten($color-primary, 45%);
      }
      
      .uploaded-icon {
        width: 64px;
        height: 64px;
        object-fit: contain;
        border-radius: $radius-md;
      }
      
      .upload-placeholder {
        text-align: center;
        color: $color-text-tertiary;
        
        .upload-tip {
          font-size: 11px;
          margin-top: 4px;
        }
      }
    }
  }
}

.icon-picker-dialog {
  .icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
    
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      border: 1px solid $color-border-light;
      border-radius: $radius-md;
      cursor: pointer;
      transition: all $transition-medium;
      
      &:hover {
        border-color: $color-primary;
        background: lighten($color-primary, 45%);
      }
      
      &.active {
        border-color: $color-primary;
        background: lighten($color-primary, 40%);
        color: $color-primary;
      }
      
      span {
        font-size: 11px;
        margin-top: 4px;
        text-align: center;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>