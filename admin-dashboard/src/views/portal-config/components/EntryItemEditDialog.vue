<template>
  <el-dialog
    v-model="visible"
    :title="editingItem?.id ? '编辑入口项' : '新建入口项'"
    width="500px"
    class="item-edit-dialog"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="item-form"
    >
      <el-form-item label="项目标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="请输入项目标题"
          maxlength="30"
          show-word-limit
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="2"
          placeholder="请输入项目描述（选填）"
          maxlength="100"
          show-word-limit
          class="form-textarea"
        />
      </el-form-item>

      <el-form-item label="项目图标" prop="icon">
        <div class="icon-selector">
          <div class="selected-icon" @click="showIconPicker = true">
            <i v-if="form.icon" :class="form.icon" class="icon-preview"></i>
            <i v-else class="el-icon-plus icon-placeholder"></i>
            <span class="icon-text">{{ form.icon ? '更换图标' : '选择图标' }}</span>
          </div>
          <el-input
            v-model="form.icon"
            placeholder="或直接输入图标类名"
            class="icon-input"
          />
        </div>
      </el-form-item>

      <el-form-item label="链接地址" prop="url">
        <div class="url-input-group">
          <el-select v-model="urlType" placeholder="类型" class="url-type-select">
            <el-option label="外部链接" value="external" />
            <el-option label="内部路由" value="internal" />
            <el-option label="功能调用" value="function" />
          </el-select>
          <el-input
            v-model="form.url"
            :placeholder="getUrlPlaceholder()"
            class="url-input"
          />
        </div>
      </el-form-item>

      <el-form-item label="打开方式" prop="target" v-if="urlType === 'external'">
        <el-radio-group v-model="form.target" class="target-group">
          <el-radio value="_blank">
            <div class="radio-content">
              <i class="el-icon-top-right target-icon"></i>
              <span>新窗口打开</span>
            </div>
          </el-radio>
          <el-radio value="_self">
            <div class="radio-content">
              <i class="el-icon-right target-icon"></i>
              <span>当前窗口打开</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="项目样式" prop="style">
        <el-select v-model="form.style" placeholder="选择样式" class="form-select">
          <el-option
            v-for="style in styleOptions"
            :key="style.value"
            :label="style.label"
            :value="style.value"
          >
            <div class="style-option-content">
              <div :class="['style-color', style.class]"></div>
              <span>{{ style.label }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="显示设置" prop="is_active">
        <div class="display-settings">
          <el-switch
            v-model="form.is_active"
            active-text="显示"
            inactive-text="隐藏"
            class="display-switch"
          />
          <div class="setting-group">
            <el-checkbox v-model="form.is_new" class="new-badge-check">
              显示 NEW 标记
            </el-checkbox>
            <el-checkbox v-model="form.is_hot" class="hot-badge-check">
              显示 HOT 标记
            </el-checkbox>
          </div>
        </div>
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
    </el-form>

    <!-- 图标选择器对话框 -->
    <IconPickerDialog
      v-model="showIconPicker"
      @confirm="handleIconSelect"
    />

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
          {{ editingItem?.id ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import IconPickerDialog from './IconPickerDialog.vue'
import type { EntryItem, EntryItemForm } from '@/types/navigation'

interface Props {
  modelValue: boolean
  editingItem?: EntryItem | null
  panelId?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: EntryItemForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showIconPicker = ref(false)
const urlType = ref<'external' | 'internal' | 'function'>('external')

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive<EntryItemForm>({
  title: '',
  description: '',
  icon: '',
  url: '',
  target: '_blank',
  style: 'default',
  roles: [],
  is_active: true,
  is_new: false,
  is_hot: false,
  sort_order: 0,
  panel_id: 0
})

const rules: FormRules = {
  title: [
    { required: true, message: '请输入项目标题', trigger: 'blur' },
    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 100, message: '描述长度不能超过 100 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择项目图标', trigger: 'change' }
  ],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' }
  ],
  style: [
    { required: true, message: '请选择项目样式', trigger: 'change' }
  ]
}

const styleOptions = [
  { value: 'default', label: '默认样式', class: 'color-default' },
  { value: 'primary', label: '主题色', class: 'color-primary' },
  { value: 'success', label: '成功色', class: 'color-success' },
  { value: 'info', label: '信息色', class: 'color-info' },
  { value: 'warning', label: '警告色', class: 'color-warning' },
  { value: 'danger', label: '危险色', class: 'color-danger' }
]

const roleOptions = ref([
  { id: 'admin', name: '管理员' },
  { id: 'editor', name: '编辑员' },
  { id: 'viewer', name: '查看员' },
  { id: 'guest', name: '访客' }
])

const getUrlPlaceholder = () => {
  switch (urlType.value) {
    case 'external':
      return 'https://example.com'
    case 'internal':
      return '/dashboard/analytics'
    case 'function':
      return 'openModal, downloadFile'
    default:
      return '请输入链接地址'
  }
}

watch(() => props.editingItem, (item) => {
  if (item && props.modelValue) {
    Object.assign(form, {
      title: item.title,
      description: item.description || '',
      icon: item.icon,
      url: item.url,
      target: item.target || '_blank',
      style: item.style || 'default',
      roles: item.roles || [],
      is_active: item.is_active !== false,
      is_new: item.is_new || false,
      is_hot: item.is_hot || false,
      sort_order: item.sort_order || 0,
      panel_id: item.panel_id
    })

    // 根据URL判断类型
    if (item.url.startsWith('http') || item.url.startsWith('//')) {
      urlType.value = 'external'
    } else if (item.url.startsWith('/')) {
      urlType.value = 'internal'
    } else {
      urlType.value = 'function'
    }
  }
})

watch(() => props.panelId, (panelId) => {
  if (panelId) {
    form.panel_id = panelId
  }
})

const resetForm = () => {
  Object.assign(form, {
    title: '',
    description: '',
    icon: '',
    url: '',
    target: '_blank',
    style: 'default',
    roles: [],
    is_active: true,
    is_new: false,
    is_hot: false,
    sort_order: 0,
    panel_id: props.panelId || 0
  })
  urlType.value = 'external'
  formRef.value?.clearValidate()
}

const handleIconSelect = (icon: string) => {
  form.icon = icon
  showIconPicker.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    emit('confirm', { ...form })
    ElMessage.success(props.editingItem?.id ? '入口项更新成功' : '入口项创建成功')
    visible.value = false
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.item-edit-dialog {
  --dialog-primary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

.item-form {
  .form-input,
  .form-textarea,
  .form-select {
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(79, 172, 254, 0.1);
    transition: all 0.3s ease;
  }

  :deep(.el-input__wrapper:hover),
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 4px 16px rgba(79, 172, 254, 0.2);
  }

  :deep(.el-textarea__inner) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(79, 172, 254, 0.1);
    transition: all 0.3s ease;
  }

  :deep(.el-textarea__inner:hover),
  :deep(.el-textarea__inner:focus) {
    box-shadow: 0 4px 16px rgba(79, 172, 254, 0.2);
  }
}

.icon-selector {
  display: flex;
  gap: 12px;
  align-items: flex-start;

  .selected-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #fafafa;

    &:hover {
      border-color: #4facfe;
      background: rgba(79, 172, 254, 0.05);
    }

    .icon-preview,
    .icon-placeholder {
      font-size: 24px;
      margin-bottom: 4px;
      color: #4facfe;
    }

    .icon-placeholder {
      color: #d9d9d9;
    }

    .icon-text {
      font-size: 11px;
      color: #666;
      text-align: center;
    }
  }

  .icon-input {
    flex: 1;
  }
}

.url-input-group {
  display: flex;
  gap: 8px;

  .url-type-select {
    width: 120px;
  }

  .url-input {
    flex: 1;
  }
}

.target-group {
  display: flex;
  gap: 16px;

  :deep(.el-radio__input) {
    display: none;
  }

  :deep(.el-radio__label) {
    padding: 0;
  }
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #4facfe;
    background: rgba(79, 172, 254, 0.05);
  }

  .target-group :deep(.el-radio__input.is-checked) + & {
    border-color: #4facfe;
    background: rgba(79, 172, 254, 0.1);
    color: #4facfe;
  }
}

.target-icon {
  font-size: 14px;
}

.style-option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.style-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;

  &.color-default {
    background: #909399;
  }

  &.color-primary {
    background: #409eff;
  }

  &.color-success {
    background: #67c23a;
  }

  &.color-info {
    background: #909399;
  }

  &.color-warning {
    background: #e6a23c;
  }

  &.color-danger {
    background: #f56c6c;
  }
}

.display-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .display-switch {
    :deep(.el-switch__core) {
      background: var(--dialog-primary);
    }
  }

  .setting-group {
    display: flex;
    gap: 16px;

    .new-badge-check,
    .hot-badge-check {
      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #4facfe;
        border-color: #4facfe;
      }
    }
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
      box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
    }
  }
}

@media (max-width: 768px) {
  .icon-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .url-input-group {
    flex-direction: column;
  }

  .target-group {
    flex-direction: column;
  }

  .display-settings .setting-group {
    flex-direction: column;
  }
}
</style>