<template>
  <el-dialog
    v-model="visible"
    :title="editingNav?.id ? '编辑导航' : '新建导航'"
    width="600px"
    class="navigation-edit-dialog"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="nav-form"
    >
      <el-form-item label="导航名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入导航名称"
          maxlength="50"
          show-word-limit
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="导航图标" prop="icon">
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

      <el-form-item label="导航路径" prop="path">
        <el-input
          v-model="form.path"
          placeholder="如：/dashboard 或 https://example.com"
          class="form-input"
        />
      </el-form-item>

      <el-form-item label="导航类型" prop="type">
        <el-radio-group v-model="form.type" class="nav-type-group">
          <el-radio value="internal" class="type-radio">
            <div class="radio-content">
              <i class="el-icon-link type-icon"></i>
              <span>内部路由</span>
            </div>
          </el-radio>
          <el-radio value="external" class="type-radio">
            <div class="radio-content">
              <i class="el-icon-top-right type-icon"></i>
              <span>外部链接</span>
            </div>
          </el-radio>
          <el-radio value="parent" class="type-radio">
            <div class="radio-content">
              <i class="el-icon-folder type-icon"></i>
              <span>父级菜单</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="打开方式" prop="target" v-if="form.type === 'external'">
        <el-select v-model="form.target" placeholder="选择打开方式" class="form-select">
          <el-option label="新窗口打开" value="_blank" />
          <el-option label="当前窗口打开" value="_self" />
        </el-select>
      </el-form-item>

      <el-form-item label="父级导航" prop="parent_id" v-if="form.type !== 'parent'">
        <el-select v-model="form.parent_id" placeholder="选择父级导航（可选）" class="form-select">
          <el-option label="无（顶级导航）" :value="null" />
          <el-option
            v-for="nav in parentNavOptions"
            :key="nav.id"
            :label="nav.name"
            :value="nav.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="导航描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入导航描述（选填）"
          maxlength="200"
          show-word-limit
          class="form-textarea"
        />
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

      <el-form-item label="显示设置">
        <div class="display-settings">
          <el-switch
            v-model="form.is_active"
            active-text="显示"
            inactive-text="隐藏"
            class="display-switch"
          />
          <el-checkbox v-model="form.is_new" class="new-badge">
            显示 NEW 标记
          </el-checkbox>
        </div>
      </el-form-item>
    </el-form>

    <!-- 图标选择器 -->
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
          {{ editingNav?.id ? '更新' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import IconPickerDialog from './IconPickerDialog.vue'
import type { NavigationItem, NavigationForm } from '@/types/navigation'

interface Props {
  modelValue: boolean
  editingNav?: NavigationItem | null
  navigationList?: NavigationItem[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', data: NavigationForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const showIconPicker = ref(false)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive<NavigationForm>({
  name: '',
  icon: '',
  path: '',
  type: 'internal',
  target: '_blank',
  parent_id: null,
  description: '',
  roles: [],
  is_active: true,
  is_new: false,
  sort_order: 0
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入导航名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  icon: [
    { required: true, message: '请选择导航图标', trigger: 'change' }
  ],
  path: [
    { required: true, message: '请输入导航路径', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择导航类型', trigger: 'change' }
  ]
}

const parentNavOptions = computed(() => {
  return (props.navigationList || []).filter(nav => 
    nav.type === 'parent' && (!props.editingNav || nav.id !== props.editingNav.id)
  )
})

const roleOptions = ref([
  { id: 'admin', name: '管理员' },
  { id: 'editor', name: '编辑员' },
  { id: 'viewer', name: '查看员' },
  { id: 'guest', name: '访客' }
])

watch(() => props.editingNav, (nav) => {
  if (nav && props.modelValue) {
    Object.assign(form, {
      name: nav.name,
      icon: nav.icon,
      path: nav.path,
      type: nav.type || 'internal',
      target: nav.target || '_blank',
      parent_id: nav.parent_id,
      description: nav.description || '',
      roles: nav.roles || [],
      is_active: nav.is_active !== false,
      is_new: nav.is_new || false,
      sort_order: nav.sort_order || 0
    })
  }
})

const resetForm = () => {
  Object.assign(form, {
    name: '',
    icon: '',
    path: '',
    type: 'internal',
    target: '_blank',
    parent_id: null,
    description: '',
    roles: [],
    is_active: true,
    is_new: false,
    sort_order: 0
  })
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
    ElMessage.success(props.editingNav?.id ? '导航更新成功' : '导航创建成功')
    visible.value = false
  } catch (error) {
    ElMessage.error('操作失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.navigation-edit-dialog {
  --dialog-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.nav-form {
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
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.05);
    }

    .icon-preview,
    .icon-placeholder {
      font-size: 24px;
      margin-bottom: 4px;
      color: #667eea;
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

.nav-type-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  .type-radio {
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

  .nav-type-group :deep(.el-radio__input.is-checked) + & {
    border-color: #667eea;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    color: #667eea;
  }
}

.type-icon {
  font-size: 16px;
}

.display-settings {
  display: flex;
  align-items: center;
  gap: 24px;

  .display-switch {
    :deep(.el-switch__core) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  }

  .new-badge {
    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: #667eea;
      border-color: #667eea;
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
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }
  }
}

@media (max-width: 768px) {
  .icon-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-type-group {
    flex-direction: column;
  }

  .radio-content {
    justify-content: center;
  }

  .display-settings {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>