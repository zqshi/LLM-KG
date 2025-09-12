<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑标签' : '新增标签'"
    width="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="80px"
      @submit.prevent
    >
      <el-form-item label="标签名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入标签名称"
          maxlength="20"
          show-word-limit
          @keyup.enter="handleSubmit"
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
import { ref, reactive, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAIToolsStore } from '@/stores/aiTools'
import type { AIToolTag, AIToolTagForm } from '@/types/aiTools'

interface Props {
  visible: boolean
  formData?: Partial<AIToolTag>
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

// 表单数据
const form = reactive<AIToolTagForm>({
  name: ''
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 20, message: '标签名称长度为1-20个字符', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, 
      message: '标签名称只能包含中英文、数字、下划线和短横线', 
      trigger: 'blur' 
    }
  ]
}

// 监听表单数据变化
watch(() => props.formData, (newData) => {
  if (newData) {
    form.name = newData.name || ''
  }
}, { immediate: true, deep: true })

// 监听弹窗显示状态
watch(() => props.visible, (visible) => {
  if (visible && formRef.value) {
    // 延迟聚焦，确保弹窗完全打开
    nextTick(() => {
      formRef.value?.clearValidate()
    })
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
      // 更新标签
      await aiToolsStore.updateExistingTag(props.formData.id, form)
    } else {
      // 创建标签
      await aiToolsStore.createNewTag(form)
    }
    
    emit('success')
    
  } catch (error) {
    console.error('提交表单失败:', error)
  } finally {
    submitLoading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 12px;
}
</style>