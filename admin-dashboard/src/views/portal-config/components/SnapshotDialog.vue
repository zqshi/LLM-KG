<template>
  <el-dialog
    v-model="visible"
    title="创建配置快照"
    width="500px"
    destroy-on-close
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="快照名称" prop="version_name">
        <el-input
          v-model="formData.version_name"
          placeholder="请输入快照名称，如：v1.2.0"
          maxlength="50"
          show-word-limit
        />
        <div class="form-tip">
          建议使用语义化版本命名，如：v1.0.0、v1.1.0-beta
        </div>
      </el-form-item>

      <el-form-item label="快照类型" prop="config_type">
        <el-radio-group v-model="formData.config_type">
          <el-radio value="all">
            <div class="radio-content">
              <div class="radio-title">完整快照</div>
              <div class="radio-desc">包含导航菜单和入口面板的完整配置</div>
            </div>
          </el-radio>
          <el-radio value="navigation">
            <div class="radio-content">
              <div class="radio-title">仅导航菜单</div>
              <div class="radio-desc">只保存当前的导航菜单配置</div>
            </div>
          </el-radio>
          <el-radio value="entry_panel">
            <div class="radio-content">
              <div class="radio-title">仅入口面板</div>
              <div class="radio-desc">只保存当前的入口面板配置</div>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注说明" prop="remarks">
        <el-input
          v-model="formData.remarks"
          type="textarea"
          :rows="3"
          placeholder="描述此次配置变更的内容和目的（可选）"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <!-- 快照预览 -->
    <div class="snapshot-preview" v-if="previewData">
      <el-divider content-position="left">
        <span class="preview-title">快照预览</span>
      </el-divider>
      
      <div class="preview-content">
        <div v-if="formData.config_type === 'all' || formData.config_type === 'navigation'">
          <h4>导航菜单 ({{ previewData.navigationCount }} 项)</h4>
          <el-tree
            :data="previewData.navigationTree"
            :props="{ label: 'name', children: 'children' }"
            default-expand-all
            class="preview-tree"
          />
        </div>

        <div v-if="formData.config_type === 'all' || formData.config_type === 'entry_panel'">
          <h4>入口面板 ({{ previewData.panelCount }} 个面板)</h4>
          <div class="panel-preview">
            <div
              v-for="panel in previewData.panels"
              :key="panel.id"
              class="panel-item"
            >
              <div class="panel-name">{{ panel.title }}</div>
              <div class="panel-stats">{{ panel.itemCount }} 个入口项</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          创建快照
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, type FormRules, type FormInstance } from 'element-plus'

// 导入API和类型
import { portalConfigApi } from '@/api/navigation'
import type { ConfigVersionType, VersionFormData } from '@/types/navigation'

// ================================
// Props和Emits
// ================================

interface Props {
  visible: boolean
  configType?: ConfigVersionType
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  configType: 'all'
})

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  success: []
}>()

// ================================
// 响应式数据
// ================================

const formRef = ref<FormInstance>()
const submitting = ref(false)

// 表单数据
const formData = reactive<VersionFormData>({
  version_name: '',
  config_type: 'all',
  remarks: ''
})

// 预览数据
const previewData = ref<{
  navigationCount: number
  navigationTree: any[]
  panelCount: number
  panels: Array<{ id: number; title: string; itemCount: number }>
} | null>(null)

// ================================
// 表单验证规则
// ================================

const formRules: FormRules = {
  version_name: [
    { required: true, message: '请输入快照名称', trigger: 'blur' },
    { min: 1, max: 50, message: '快照名称长度在1-50个字符之间', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9\u4e00-\u9fa5\-_.]+$/,
      message: '快照名称只能包含字母、数字、中文、连字符、下划线和点',
      trigger: 'blur'
    }
  ],
  config_type: [
    { required: true, message: '请选择快照类型', trigger: 'change' }
  ]
}

// ================================
// 计算属性
// ================================

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// ================================
// 监听器
// ================================

watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    initFormData()
    loadPreviewData()
  } else {
    resetForm()
  }
})

watch(() => formData.config_type, () => {
  loadPreviewData()
})

// ================================
// 生命周期
// ================================

onMounted(() => {
  if (props.visible) {
    loadPreviewData()
  }
})

// ================================
// 方法
// ================================

/** 初始化表单数据 */
const initFormData = () => {
  formData.config_type = props.configType
  formData.version_name = generateVersionName()
  formData.remarks = ''
}

/** 生成版本名称 */
const generateVersionName = (): string => {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '')
  return `snapshot-${dateStr}-${timeStr}`
}

/** 重置表单 */
const resetForm = () => {
  formRef.value?.resetFields()
  previewData.value = null
}

/** 加载预览数据 */
const loadPreviewData = async () => {
  try {
    const preview: any = {
      navigationCount: 0,
      navigationTree: [],
      panelCount: 0,
      panels: []
    }

    // 加载导航数据
    if (formData.config_type === 'all' || formData.config_type === 'navigation') {
      const navResponse = await portalConfigApi.navigation.getNavigationTree()
      preview.navigationTree = navResponse.data || []
      preview.navigationCount = countNavigationItems(preview.navigationTree)
    }

    // 加载入口面板数据
    if (formData.config_type === 'all' || formData.config_type === 'entry_panel') {
      const panelsResponse = await portalConfigApi.entryPanel.getEntryPanelList()
      const panels = panelsResponse.data?.items || []
      preview.panels = panels.map((panel: any) => ({
        id: panel.id,
        title: panel.title,
        itemCount: panel.items?.length || 0
      }))
      preview.panelCount = panels.length
    }

    previewData.value = preview
  } catch (error) {
    console.error('加载预览数据失败:', error)
    ElMessage.warning('加载预览数据失败')
  }
}

/** 计算导航项数量 */
const countNavigationItems = (items: any[]): number => {
  return items.reduce((count, item) => {
    return count + 1 + (item.children ? countNavigationItems(item.children) : 0)
  }, 0)
}

/** 取消 */
const handleCancel = () => {
  visible.value = false
}

/** 提交 */
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true

    await portalConfigApi.version.createSnapshot(formData)
    
    ElMessage.success('配置快照创建成功')
    emit('success')
  } catch (error) {
    console.error('创建快照失败:', error)
    ElMessage.error('创建快照失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
// ================================
// 对话框样式优化
// ================================
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.18);
  
  .el-dialog__header {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    color: white;
    padding: 24px 32px;
    border: none;
    
    .el-dialog__title {
      font-size: 20px;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      
      &::before {
        content: '📸';
        font-size: 24px;
      }
    }
    
    .el-dialog__headerbtn {
      top: 20px;
      right: 20px;
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transition: all 0.3s ease;
      
      &:hover {
        background: rgba(255, 77, 79, 0.9);
        transform: scale(1.1) rotate(90deg);
        
        .el-dialog__close {
          color: white;
        }
      }
    }
  }
  
  .el-dialog__body {
    padding: 28px 32px;
    background: linear-gradient(135deg, #fafbfc 0%, #f1f5f9 100%);
  }
  
  .el-dialog__footer {
    background: white;
    padding: 20px 32px;
    border-top: 1px solid #e4e7ed;
  }
}

// ================================
// 表单样式优化
// ================================
:deep(.el-form) {
  .el-form-item {
    margin-bottom: 24px;
    
    .el-form-item__label {
      font-weight: 600;
      color: #1f2937;
      font-size: 15px;
      line-height: 1.5;
      padding-bottom: 8px;
    }
    
    .el-form-item__content {
      line-height: 1.5;
    }
    
    // 输入框样式
    .el-input {
      .el-input__wrapper {
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        border: 1px solid #e4e7ed;
        
        &:hover {
          border-color: #fa709a;
          box-shadow: 0 4px 12px rgba(250, 112, 154, 0.2);
        }
        
        &.is-focus {
          border-color: #fa709a;
          box-shadow: 0 0 0 2px rgba(250, 112, 154, 0.2);
        }
      }
    }
    
    // 文本域样式
    .el-textarea {
      .el-textarea__inner {
        border-radius: 10px;
        border: 1px solid #e4e7ed;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #fa709a;
          box-shadow: 0 4px 12px rgba(250, 112, 154, 0.2);
        }
        
        &:focus {
          border-color: #fa709a;
          box-shadow: 0 0 0 2px rgba(250, 112, 154, 0.2);
        }
      }
    }
    
    // 单选框组样式
    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: 16px;
      
      .el-radio {
        display: flex;
        align-items: flex-start;
        padding: 20px;
        margin: 0;
        border: 2px solid transparent;
        border-radius: 12px;
        transition: all 0.3s ease;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        
        &:hover {
          border-color: #fa709a;
          background: rgba(250, 112, 154, 0.02);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(250, 112, 154, 0.15);
        }
        
        &.is-checked {
          border-color: #fa709a;
          background: linear-gradient(135deg, rgba(250, 112, 154, 0.08) 0%, rgba(254, 225, 64, 0.08) 100%);
          box-shadow: 0 8px 24px rgba(250, 112, 154, 0.2);
          
          .el-radio__label {
            color: #fa709a;
          }
        }
        
        .el-radio__input {
          margin-right: 16px;
          
          &.is-checked .el-radio__inner {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            border-color: #fa709a;
          }
        }
        
        .el-radio__label {
          flex: 1;
          font-size: 14px;
          line-height: 1.5;
          padding-left: 0;
        }
      }
    }
  }
}

// ================================
// 单选框内容样式
// ================================
.radio-content {
  .radio-title {
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 6px;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '📦';
      font-size: 18px;
    }
  }

  .radio-desc {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
    margin-left: 26px;
  }
}

// ================================
// 表单提示信息
// ================================
.form-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 8px;
  line-height: 1.5;
  padding: 10px 14px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #fa709a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '💡';
    margin-right: 8px;
  }
}

// ================================
// 快照预览样式
// ================================
.snapshot-preview {
  margin-top: 28px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  .preview-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '🔍';
      font-size: 18px;
    }
  }
  
  .preview-content {
    h4 {
      margin: 20px 0 16px 0;
      color: #1f2937;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      
      &::before {
        content: '📋';
        font-size: 16px;
      }
    }
    
    // 预览树样式
    .preview-tree {
      max-height: 200px;
      overflow-y: auto;
      border: 2px solid #f3f4f6;
      border-radius: 8px;
      padding: 12px;
      background: #fafbfc;
      
      :deep(.el-tree-node__content) {
        font-size: 13px;
        height: 32px;
        border-radius: 6px;
        margin-bottom: 4px;
        
        &:hover {
          background: rgba(250, 112, 154, 0.1);
        }
      }
    }
    
    // 面板预览样式
    .panel-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      
      .panel-item {
        padding: 16px 20px;
        border: 2px solid #f3f4f6;
        border-radius: 8px;
        background: #fafbfc;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #fa709a;
          background: rgba(250, 112, 154, 0.05);
          transform: translateY(-2px);
        }
        
        .panel-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }
        
        .panel-stats {
          font-size: 12px;
          color: #6b7280;
        }
      }
    }
  }
}

// ================================
// 对话框底部按钮
// ================================
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  
  .el-button {
    padding: 12px 24px;
    border-radius: 10px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    &.el-button--primary {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      border: none;
      
      &:hover {
        background: linear-gradient(135deg, #fee140 0%, #fa709a 100%);
        box-shadow: 0 8px 24px rgba(250, 112, 154, 0.4);
      }
    }
    
    &.el-button--default {
      background: white;
      border: 1px solid #e4e7ed;
      color: #606266;
      
      &:hover {
        background: #f8fafc;
        border-color: #fa709a;
        color: #fa709a;
      }
    }
  }
}

// ================================
// 响应式设计
// ================================
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 16px auto !important;
  }
  
  .snapshot-preview .preview-content {
    .panel-preview {
      grid-template-columns: 1fr;
      gap: 8px;
      
      .panel-item {
        padding: 12px 16px;
      }
    }
  }
  
  .dialog-footer {
    flex-direction: column-reverse;
    gap: 12px;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>