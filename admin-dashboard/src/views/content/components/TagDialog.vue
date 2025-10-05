<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(val) => emit('update:visible', val)"
    :title="isEdit ? '编辑标签' : '新增标签'"
    width="500px"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="tag-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="标签名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入标签名称"
          maxlength="20"
          show-word-limit
          clearable
        />
      </el-form-item>

      <el-form-item label="标签代码" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入标签代码（英文字母、数字、下划线）"
          maxlength="30"
          show-word-limit
          clearable
          :disabled="isEdit"
        />
        <div class="form-tip">用于系统识别，创建后不可修改</div>
      </el-form-item>

      <el-form-item label="标签描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="请输入标签描述（可选）"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="标签颜色" prop="color">
        <div class="color-selector">
          <el-color-picker 
            v-model="form.color" 
            :predefine="predefineColors"
            show-alpha
          />
          <div class="color-preview">
            <el-tag 
              :color="form.color" 
              :style="{ backgroundColor: form.color, color: getTextColor(form.color) }"
              class="preview-tag"
            >
              {{ form.name || '预览标签' }}
            </el-tag>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="排序权重" prop="sortOrder">
        <el-input-number
          v-model="form.sortOrder"
          :min="0"
          :max="9999"
          controls-position="right"
          placeholder="数字越大排序越靠前"
          style="width: 200px"
        />
        <div class="form-tip">数字越大，在列表中排序越靠前</div>
      </el-form-item>

      <el-form-item label="标签状态" prop="isActive">
        <el-switch
          v-model="form.isActive"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>
    </el-form>

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
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { tagsApi } from '@/api/tags'
import type { Tag as ApiTag, CreateTagForm, UpdateTagForm } from '@/api/tags'

interface Props {
  visible: boolean
  formData?: Partial<Tag>
  isEdit?: boolean
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

interface Tag {
  id?: number
  name: string
  code: string
  description?: string
  color: string
  isActive: boolean
  sortOrder: number
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const form = reactive<Tag>({
  name: '',
  code: '',
  description: '',
  color: '#409EFF',
  isActive: true,
  sortOrder: 0
})

// 预定义颜色
const predefineColors = [
  '#409EFF', // 蓝色
  '#67C23A', // 绿色
  '#E6A23C', // 橙色
  '#F56C6C', // 红色
  '#909399', // 灰色
  '#17C0AE', // 青色
  '#F78FB3', // 粉色
  '#FFD93D', // 黄色
  '#324057', // 深蓝
  '#8B5CF6', // 紫色
  '#06B6D4', // 天蓝
  '#10B981', // 翠绿
  '#F97316', // 橙红
  '#EF4444', // 鲜红
  '#6366F1', // 靛蓝
  '#EC4899'  // 玫红
]

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度为1-20个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入标签代码', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, 
      message: '标签代码必须以字母开头，只能包含字母、数字和下划线', 
      trigger: 'blur' 
    },
    { min: 2, max: 30, message: '标签代码长度为2-30个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value && !props.isEdit) {
          tagsApi.checkCodeAvailable(value)
            .then(result => {
              if (!result.data) {
                callback(new Error('标签代码已存在'))
              } else {
                callback()
              }
            })
            .catch(() => callback())
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  description: [
    { max: 100, message: '描述长度不能超过100个字符', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请选择标签颜色', trigger: 'blur' }
  ],
  sortOrder: [
    { type: 'number', min: 0, max: 9999, message: '排序权重必须在0-9999之间', trigger: 'blur' }
  ]
}

// 监听visible变化
watch(() => props.visible, (val) => {
  if (val && props.formData) {
    Object.assign(form, props.formData)
  } else if (val) {
    resetForm()
  }
})

// 重置表单
const resetForm = () => {
  Object.assign(form, {
    name: '',
    code: '',
    description: '',
    color: '#409EFF',
    isActive: true,
    sortOrder: 0
  })
  formRef.value?.clearValidate()
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    if (props.isEdit && form.id) {
      // 编辑模式
      const updateData: UpdateTagForm = {
        id: form.id,
        name: form.name,
        code: form.code,
        description: form.description,
        color: form.color,
        isActive: form.isActive,
        sortOrder: form.sortOrder
      }
      await tagsApi.update(updateData)
      ElMessage.success('标签更新成功')
    } else {
      // 新增模式
      const createData: CreateTagForm = {
        name: form.name,
        code: form.code,
        description: form.description,
        color: form.color,
        isActive: form.isActive,
        sortOrder: form.sortOrder
      }
      await tagsApi.create(createData)
      ElMessage.success('标签创建成功')
    }
    
    emit('success')
    handleClose()
    
  } catch (error: any) {
    console.error('标签操作失败:', error)
    const message = error?.response?.data?.message || error?.message || '操作失败'
    ElMessage.error(message)
  } finally {
    submitLoading.value = false
  }
}

// 根据背景色计算文字颜色
const getTextColor = (backgroundColor: string) => {
  if (!backgroundColor) return '#303133'
  
  // 移除#号
  const hex = backgroundColor.replace('#', '')
  
  // 如果是3位颜色值，转换为6位
  const fullHex = hex.length === 3 
    ? hex.split('').map(char => char + char).join('')
    : hex
  
  // 计算亮度
  const r = parseInt(fullHex.substr(0, 2), 16)
  const g = parseInt(fullHex.substr(2, 2), 16)
  const b = parseInt(fullHex.substr(4, 2), 16)
  
  // 使用 YIQ 公式计算亮度
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  
  // 根据亮度选择文字颜色
  return yiq >= 128 ? '#303133' : '#FFFFFF'
}

// 自动生成代码（基于名称）
watch(() => form.name, async (newName) => {
  if (!props.isEdit && newName && !form.code) {
    // 简单的转换逻辑
    const codeMap: Record<string, string> = {
      // 技术相关
      '前端': 'frontend',
      '后端': 'backend',
      '全栈': 'fullstack',
      '移动端': 'mobile',
      '数据库': 'database',
      '算法': 'algorithm',
      '架构': 'architecture',
      '测试': 'testing',
      '运维': 'devops',
      '安全': 'security',
      
      // 语言技术
      'JavaScript': 'javascript',
      'TypeScript': 'typescript',
      'Vue': 'vue',
      'React': 'react',
      'Angular': 'angular',
      'Node.js': 'nodejs',
      'Python': 'python',
      'Java': 'java',
      'Go': 'golang',
      'PHP': 'php',
      'C++': 'cpp',
      'MySQL': 'mysql',
      'Redis': 'redis',
      'MongoDB': 'mongodb',
      
      // 难度等级
      '入门': 'beginner',
      '进阶': 'intermediate',
      '高级': 'advanced',
      '专家': 'expert',
      
      // 内容类型
      '教程': 'tutorial',
      '实战': 'practice',
      '分享': 'share',
      '问答': 'qa',
      '讨论': 'discussion',
      '资源': 'resource',
      '工具': 'tool',
      '框架': 'framework',
      '库': 'library'
    }
    
    let code = ''
    for (const [key, value] of Object.entries(codeMap)) {
      if (newName.includes(key)) {
        code = value
        break
      }
    }
    
    // 如果没有匹配，尝试简单的拼音转换
    if (!code) {
      code = newName
        .toLowerCase()
        .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
        .replace(/[^a-zA-Z0-9]/g, '_')   // 特殊字符转下划线
        .replace(/_+/g, '_')             // 多个下划线合并
        .replace(/^_|_$/g, '')           // 移除首尾下划线
    }
    
    if (code && code.length >= 2) {
      // 检查代码是否可用
      try {
        const result = await tagsApi.checkCodeAvailable(code)
        if (result.data) {
          form.code = code
        }
      } catch (error) {
        console.warn('检查代码可用性失败:', error)
      }
    }
  }
})
</script>

<style scoped>


.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.color-selector {
  display: flex;
  align-items: center;
  gap: 16px;
}

.color-preview {
  flex: 1;
}

.preview-tag {
  border: none !important;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 4px;
}

.dialog-footer {
  padding: 10px 0 0 0;
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}
</style>