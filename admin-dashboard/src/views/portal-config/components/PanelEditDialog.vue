<template>
  <el-dialog
    v-model="visible"
    :title="editingPanel?.id ? '编辑面板' : '新建面板'"
    width="600px"
    class="panel-edit-dialog"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="panel-form"
    >
      <el-form-item label="面板名称" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入面板名称"
          maxlength="50"
          show-word-limit
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="面板描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入面板描述（选填）"
          maxlength="200"
          show-word-limit
          class="form-textarea"
        />
      </el-form-item>

      <el-form-item label="面板样式" prop="style">
        <div class="style-selector">
          <div
            v-for="style in styleOptions"
            :key="style.value"
            :class="[
              'style-option',
              { 'active': form.style === style.value }
            ]"
            @click="form.style = style.value"
          >
            <div :class="['style-preview', style.class]">
              <div class="preview-content">
                <i :class="style.icon" class="preview-icon"></i>
                <span class="preview-text">{{ style.label }}</span>
              </div>
            </div>
            <span class="style-name">{{ style.label }}</span>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="显示模式" prop="display_mode">
        <el-radio-group v-model="form.display_mode" class="display-mode-group">
          <el-radio value="grid" class="mode-radio">
            <div class="radio-content">
              <i class="el-icon-menu mode-icon"></i>
              <span>网格模式</span>
            </div>
          </el-radio>
          <el-radio value="list" class="mode-radio">
            <div class="radio-content">
              <i class="el-icon-s-unfold" class="mode-icon"></i>
              <span>列表模式</span>
            </div>
          </el-radio>
          <el-radio value="carousel" class="mode-radio">
            <div class="radio-content">
              <i class="el-icon-right" class="mode-icon"></i>
              <span>轮播模式</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="每行显示" prop="items_per_row" v-if="form.display_mode === 'grid'">
        <el-slider
          v-model="form.items_per_row"
          :min="2"
          :max="6"
          :marks="{ 2: '2个', 3: '3个', 4: '4个', 5: '5个', 6: '6个' }"
          class="items-slider"
        />
      </el-form-item>

      <el-form-item label="面板尺寸" prop="size">
        <el-select v-model="form.size" placeholder="选择面板尺寸" class="form-select">
          <el-option label="小号 (200x150)" value="small" />
          <el-option label="中号 (300x200)" value="medium" />
          <el-option label="大号 (400x250)" value="large" />
          <el-option label="超大 (500x300)" value="xlarge" />
        </el-select>
      </el-form-item>

      <el-form-item label="角色权限" prop="roles">
        <el-select
          v-model="form.roles"
          multiple
          placeholder="选择可见角色（不选则所有角色可见）"
          class="form-select"
        >
          <el-option
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="状态设置" prop="is_active">
        <div class="status-setting">
          <el-switch
            v-model="form.is_active"
            active-text="启用"
            inactive-text="禁用"
            class="status-switch"
          />
          <span class="status-desc" v-if="!form.is_active">
            禁用后，该面板将在前端隐藏
          </span>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false" class="cancel-btn">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="loading"
          class="submit-btn"
        >
          {{ editingPanel?.id ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { EntryPanel, EntryPanelForm } from '@/types/navigation'

interface Props {
  modelValue: boolean
  editingPanel?: EntryPanel | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: EntryPanelForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive<EntryPanelForm>({
  title: '',
  description: '',
  style: 'default',
  display_mode: 'grid',
  items_per_row: 4,
  size: 'medium',
  roles: [],
  is_active: true,
  sort_order: 0
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入面板名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
  ],
  style: [
    { required: true, message: '请选择面板样式', trigger: 'change' }
  ],
  display_mode: [
    { required: true, message: '请选择显示模式', trigger: 'change' }
  ],
  size: [
    { required: true, message: '请选择面板尺寸', trigger: 'change' }
  ]
}

const styleOptions = [
  { value: 'default', label: '默认', class: 'style-default', icon: 'el-icon-document' },
  { value: 'primary', label: '主色调', class: 'style-primary', icon: 'el-icon-star-on' },
  { value: 'success', label: '成功色', class: 'style-success', icon: 'el-icon-circle-check' },
  { value: 'info', label: '信息色', class: 'style-info', icon: 'el-icon-info' },
  { value: 'warning', label: '警告色', class: 'style-warning', icon: 'el-icon-warning' },
  { value: 'danger', label: '危险色', class: 'style-danger', icon: 'el-icon-error' }
]

const roleOptions = ref([
  { id: 'admin', name: '管理员' },
  { id: 'editor', name: '编辑员' },
  { id: 'viewer', name: '查看员' },
  { id: 'guest', name: '访客' }
])

watch(() => props.editingPanel, (panel) => {
  if (panel && props.modelValue) {
    Object.assign(form, {
      title: panel.title,
      description: panel.description || '',
      style: panel.style || 'default',
      display_mode: panel.display_mode || 'grid',
      items_per_row: panel.items_per_row || 4,
      size: panel.size || 'medium',
      roles: panel.roles || [],
      is_active: panel.is_active !== false,
      sort_order: panel.sort_order || 0
    })
  }
})

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    style: 'default',
    display_mode: 'grid',
    items_per_row: 4,
    size: 'medium',
    roles: [],
    is_active: true,
    sort_order: 0
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    emit('confirm', { ...form })
    ElMessage.success(props.editingPanel?.id ? '面板更新成功' : '面板创建成功')
    visible.value = false
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.panel-edit-dialog {
  --dialog-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --dialog-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --dialog-warning: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --dialog-border-radius: 12px;
  --dialog-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

:deep(.el-dialog) {
  border-radius: var(--dialog-border-radius);
  box-shadow: var(--dialog-shadow);
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: var(--dialog-primary);
  padding: 20px 24px 16px;
  margin: 0;
}

:deep(.el-dialog__title) {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

:deep(.el-dialog__close) {
  color: white;
  font-size: 18px;
}

:deep(.el-dialog__close:hover) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.el-dialog__body) {
  padding: 24px;
}

.panel-form {
  .form-input,
  .form-textarea,
  .form-select {
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  }

  :deep(.el-textarea__inner) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    transition: all 0.3s ease;
  }

  :deep(.el-textarea__inner:hover),
  :deep(.el-textarea__inner:focus) {
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  }
}

.style-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.style-option {
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 12px;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-2px);
  }

  &.active {
    border-color: #667eea;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  }
}

.style-preview {
  width: 80px;
  height: 60px;
  margin: 0 auto 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  &.style-default {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  &.style-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.style-success {
    background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  }

  &.style-info {
    background: linear-gradient(135deg, #3ca55c 0%, #b5fffc 100%);
  }

  &.style-warning {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  &.style-danger {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  }
}

.preview-content {
  color: white;
  text-align: center;
}

.preview-icon {
  display: block;
  font-size: 20px;
  margin-bottom: 4px;
}

.preview-text {
  font-size: 10px;
  opacity: 0.9;
}

.style-name {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.display-mode-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  .mode-radio {
    :deep(.el-radio__input) {
      display: none;
    }

    :deep(.el-radio__label) {
      padding: 0;
    }
  }
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
  }

  .mode-radio:deep(.el-radio__input.is-checked) + & {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
  }
}

.mode-icon {
  font-size: 16px;
}

.items-slider {
  width: 100%;
  margin: 12px 0;

  :deep(.el-slider__runway) {
    background: linear-gradient(to right, #667eea, #764ba2);
    height: 6px;
  }

  :deep(.el-slider__button) {
    border: 2px solid #667eea;
    background: white;
    width: 20px;
    height: 20px;
  }
}

.status-setting {
  display: flex;
  align-items: center;
  gap: 12px;

  .status-switch {
    :deep(.el-switch__core) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  .status-desc {
    font-size: 12px;
    color: #999;
    font-style: italic;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  background: #f8f9fa;
  margin: 0 -24px -24px;

  .cancel-btn {
    border-radius: 8px;
    padding: 10px 24px;
    border: 2px solid #e4e7ed;
    background: white;
    color: #666;
    transition: all 0.3s ease;

    &:hover {
      border-color: #c0c4cc;
      background: #f5f7fa;
    }
  }

  .submit-btn {
    border-radius: 8px;
    padding: 10px 24px;
    background: var(--dialog-primary);
    border: none;
    color: white;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }
}

@media (max-width: 768px) {
  .style-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .display-mode-group {
    flex-direction: column;
  }

  .radio-content {
    justify-content: center;
  }
}
</style>