<template>
  <BaseModal
    :model-value="visible"
    @update:modelValue="(val) => emit('update:visible', val)"
    :title="isEdit ? '编辑版块' : '新增版块'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="category-dialog"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent
    >
      <el-form-item label="版块名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入版块名称"
          maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>

      <el-form-item label="版块代码" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入版块代码（英文字母、数字、下划线）"
          maxlength="30"
          show-word-limit
          clearable
          :disabled="isEdit"
        />
        <div class="form-tip">用于URL路径，创建后不可修改</div>
      </el-form-item>

      <el-form-item label="版块描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入版块描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="版块图标" prop="icon">
        <div class="icon-selector">
          <el-select
            v-model="form.icon"
            placeholder="选择图标"
            clearable
            filterable
            class="icon-select"
          >
            <el-option
              v-for="icon in iconOptions"
              :key="icon.value"
              :label="icon.label"
              :value="icon.value"
            >
              <div class="icon-option">
                <el-icon class="icon-preview">
                  <component :is="icon.component" />
                </el-icon>
                <span>{{ icon.label }}</span>
              </div>
            </el-option>
          </el-select>
          <div v-if="form.icon" class="selected-icon">
            <el-icon size="24">
              <component :is="getIconComponent(form.icon)" />
            </el-icon>
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

      <el-form-item label="访问权限" prop="isPublic">
        <el-radio-group v-model="form.isPublic">
          <el-radio :value="true">公开版块</el-radio>
          <el-radio :value="false">私有版块</el-radio>
        </el-radio-group>
        <div class="form-tip">私有版块仅对特定部门可见</div>
      </el-form-item>

      <!-- 私有版块部门范围配置 -->
      <el-form-item 
        v-if="!form.isPublic" 
        label="可见部门" 
        prop="visibleDepartments"
      >
        <el-tree-select
          v-model="form.visibleDepartments"
          :data="departmentTree"
          :loading="departmentLoading"
          multiple
          show-checkbox
          check-strictly
          :render-after-expand="false"
          placeholder="请选择可见部门"
          style="width: 100%"
          node-key="id"
          :props="{
            children: 'children',
            label: 'name',
            value: 'id'
          }"
        />
        <div class="form-tip">选择哪些部门的员工可以访问此版块</div>
      </el-form-item>

      <el-form-item label="发帖权限" prop="postPermissions">
        <el-checkbox-group v-model="form.postPermissions">
          <el-checkbox value="all">所有用户</el-checkbox>
          <el-checkbox value="member">注册用户</el-checkbox>
          <el-checkbox value="verified">认证用户</el-checkbox>
          <el-checkbox value="admin">管理员</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="审核模式" prop="auditMode">
        <el-radio-group v-model="form.auditMode">
          <el-radio value="none">无需审核</el-radio>
          <el-radio value="pre">先审后发</el-radio>
          <el-radio value="post">先发后审</el-radio>
          <el-radio value="sample">抽样审核</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 抽样审核比例配置 -->
      <el-form-item 
        v-if="form.auditMode === 'sample'" 
        label="抽样比例" 
        prop="sampleRate"
      >
        <div class="sample-rate-config">
          <el-slider
            v-model="form.sampleRate"
            :min="1"
            :max="100"
            :step="1"
            show-stops
            :marks="{
              10: '10%',
              25: '25%',
              50: '50%',
              75: '75%',
              100: '100%'
            }"
            style="margin: 12px 0 20px 0"
          />
          <div class="rate-display">
            <span class="rate-value">{{ form.sampleRate }}%</span>
            <span class="rate-desc">的帖子将被抽中进行审核</span>
          </div>
        </div>
        <div class="form-tip">设置抽样审核的比例，系统将随机抽取对应比例的帖子进行人工审核</div>
      </el-form-item>

      <el-form-item label="版块状态" prop="isActive">
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
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import BaseModal from '@/components/modal/BaseModal.vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { categoriesApi } from '@/api/categories'
import type { Category as ApiCategory, CreateCategoryForm, UpdateCategoryForm } from '@/api/categories'
import {
  Monitor, Briefcase, OfficeBuilding, Document, User,
  Management, Operation, School, HelpFilled, Star,
  ChatDotRound, DataLine, Trophy, Tools,
  Basketball, Coffee, Reading, Microphone, Camera
} from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  formData?: Partial<Category>
  isEdit?: boolean
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

interface DepartmentNode {
  id: string
  name: string
  children?: DepartmentNode[]
}

interface Category {
  id?: number
  name: string
  code: string
  description: string
  icon: string
  sortOrder: number
  isPublic: boolean
  isActive: boolean
  auditMode: 'none' | 'pre' | 'post' | 'sample'
  postPermissions: string[]
  visibleDepartments: string[]
  sampleRate: number
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false
})

const emit = defineEmits<Emits>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const departmentLoading = ref(false)

// 部门树数据
const departmentTree = ref<DepartmentNode[]>([])

// 表单数据
const form = reactive<Category>({
  name: '',
  code: '',
  description: '',
  icon: 'Monitor',
  sortOrder: 0,
  isPublic: true,
  isActive: true,
  auditMode: 'post',
  postPermissions: ['all'],
  visibleDepartments: [],
  sampleRate: 25
})

// 加载部门树数据
const loadDepartmentTree = async () => {
  try {
    departmentLoading.value = true
    const response = await categoriesApi.getDepartmentTree()
    if (response.code === 200) {
      departmentTree.value = response.data
    }
  } catch (error) {
    console.warn('加载部门数据失败，使用默认数据:', error)
    // 使用默认Mock数据
    departmentTree.value = [
      {
        id: 'tech',
        name: '技术部',
        children: [
          { id: 'tech-frontend', name: '前端开发组' },
          { id: 'tech-backend', name: '后端开发组' },
          { id: 'tech-mobile', name: '移动端开发组' },
          { id: 'tech-test', name: '测试组' }
        ]
      },
      {
        id: 'product',
        name: '产品部',
        children: [
          { id: 'product-design', name: '产品设计组' },
          { id: 'product-operation', name: '产品运营组' },
          { id: 'product-data', name: '数据分析组' }
        ]
      },
      {
        id: 'marketing',
        name: '市场部',
        children: [
          { id: 'marketing-brand', name: '品牌推广组' },
          { id: 'marketing-content', name: '内容营销组' },
          { id: 'marketing-channel', name: '渠道拓展组' }
        ]
      },
      {
        id: 'hr',
        name: '人事部',
        children: [
          { id: 'hr-recruit', name: '招聘组' },
          { id: 'hr-training', name: '培训组' },
          { id: 'hr-culture', name: '企业文化组' }
        ]
      },
      {
        id: 'finance',
        name: '财务部',
        children: [
          { id: 'finance-accounting', name: '会计组' },
          { id: 'finance-budget', name: '预算组' },
          { id: 'finance-audit', name: '审计组' }
        ]
      },
      {
        id: 'admin',
        name: '行政部',
        children: [
          { id: 'admin-office', name: '办公管理组' },
          { id: 'admin-facility', name: '设施管理组' },
          { id: 'admin-security', name: '安全管理组' }
        ]
      }
    ]
  } finally {
    departmentLoading.value = false
  }
}
const iconOptions = [
  { label: '技术分享', value: 'Monitor', component: Monitor },
  { label: '产品心得', value: 'Briefcase', component: Briefcase },
  { label: '企业文化', value: 'OfficeBuilding', component: OfficeBuilding },
  { label: '文档资料', value: 'Document', component: Document },
  { label: '用户交流', value: 'User', component: User },
  { label: '项目管理', value: 'Management', component: Management },
  { label: '运营活动', value: 'Operation', component: Operation },
  { label: '培训学习', value: 'School', component: School },
  { label: '帮助支持', value: 'HelpFilled', component: HelpFilled },
  { label: '精选推荐', value: 'Star', component: Star },
  { label: '讨论交流', value: 'ChatDotRound', component: ChatDotRound },
  { label: '数据分析', value: 'DataLine', component: DataLine },
  { label: '成就展示', value: 'Trophy', component: Trophy },
  { label: '工具分享', value: 'Tools', component: Tools },
  { label: '运动健身', value: 'Basketball', component: Basketball },
  { label: '生活分享', value: 'Coffee', component: Coffee },
  { label: '阅读分享', value: 'Reading', component: Reading },
  { label: '演讲分享', value: 'Microphone', component: Microphone },
  { label: '摄影作品', value: 'Camera', component: Camera }
]

// 获取图标组件
const getIconComponent = (iconName: string) => {
  const icon = iconOptions.find(item => item.value === iconName)
  return icon?.component || Monitor
}

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入版块名称', trigger: 'blur' },
    { min: 2, max: 50, message: '版块名称长度为2-50个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入版块代码', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, 
      message: '版块代码必须以字母开头，只能包含字母、数字和下划线', 
      trigger: 'blur' 
    },
    { min: 2, max: 30, message: '版块代码长度为2-30个字符', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value && !props.isEdit) {
          categoriesApi.checkCodeAvailable(value)
            .then(result => {
              if (!result.data) {
                callback(new Error('版块代码已存在'))
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
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ],
  sortOrder: [
    { type: 'number', min: 0, max: 9999, message: '排序权重必须在0-9999之间', trigger: 'blur' }
  ],
  postPermissions: [
    { type: 'array', min: 1, message: '请至少选择一种发帖权限', trigger: 'change' }
  ],
  visibleDepartments: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!form.isPublic && (!value || value.length === 0)) {
          callback(new Error('私有版块必须选择至少一个可见部门'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  sampleRate: [
    { type: 'number', min: 1, max: 100, message: '抽样比例必须在1-100之间', trigger: 'blur' }
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
    icon: 'Monitor',
    sortOrder: 0,
    isPublic: true,
    isActive: true,
    auditMode: 'post',
    postPermissions: ['all'],
    visibleDepartments: [],
    sampleRate: 25
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
      const updateData: UpdateCategoryForm = {
        id: form.id,
        name: form.name,
        code: form.code,
        description: form.description,
        icon: form.icon,
        sortOrder: form.sortOrder,
        isPublic: form.isPublic,
        isActive: form.isActive,
        auditMode: form.auditMode,
        postPermissions: form.postPermissions,
        visibleDepartments: form.visibleDepartments,
        sampleRate: form.sampleRate
      }
      await categoriesApi.update(updateData)
      ElMessage.success('版块更新成功')
    } else {
      // 新增模式
      const createData: CreateCategoryForm = {
        name: form.name,
        code: form.code,
        description: form.description,
        icon: form.icon,
        sortOrder: form.sortOrder,
        isPublic: form.isPublic,
        isActive: form.isActive,
        auditMode: form.auditMode,
        postPermissions: form.postPermissions,
        visibleDepartments: form.visibleDepartments,
        sampleRate: form.sampleRate
      }
      await categoriesApi.create(createData)
      ElMessage.success('版块创建成功')
    }
    
    emit('success')
    handleClose()
    
  } catch (error: any) {
    console.error('版块操作失败:', error)
    const message = error?.response?.data?.message || error?.message || '操作失败'
    ElMessage.error(message)
  } finally {
    submitLoading.value = false
  }
}

// 自动生成代码（基于名称）
watch(() => form.name, async (newName) => {
  if (!props.isEdit && newName && !form.code) {
    // 简单的拼音转换逻辑，实际项目中可以使用更专业的拼音库
    const codeMap: Record<string, string> = {
      '技术': 'tech',
      '产品': 'product', 
      '企业': 'company',
      '文化': 'culture',
      '管理': 'management',
      '运营': 'operation',
      '分享': 'share',
      '交流': 'communication',
      '讨论': 'discussion',
      '学习': 'learning',
      '培训': 'training',
      '帮助': 'help',
      '支持': 'support'
    }
    
    let code = ''
    for (const [key, value] of Object.entries(codeMap)) {
      if (newName.includes(key)) {
        code += value + '_'
      }
    }
    
    if (code) {
      const generatedCode = code.slice(0, -1) // 移除最后的下划线
      // 检查代码是否可用
      try {
        const result = await categoriesApi.checkCodeAvailable(generatedCode)
        if (result.data) {
          form.code = generatedCode
        }
      } catch (error) {
        console.warn('检查代码可用性失败:', error)
      }
    }
  }
})

// 组件挂载时初始化
onMounted(() => {
  loadDepartmentTree()
})

// 监听访问权限变化，重置部门选择
watch(() => form.isPublic, (newVal) => {
  if (newVal) {
    // 公开版块时清空部门选择
    form.visibleDepartments = []
  }
})

// 监听审核模式变化，非抽样时重置比例
watch(() => form.auditMode, (newVal) => {
  if (newVal !== 'sample') {
    // 非抽样审核时重置比例
    form.sampleRate = 25
  }
})
</script>

<style scoped>
.category-dialog :deep(.el-dialog__body) {
  padding: 20px 20px 0 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

.icon-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-select {
  flex: 1;
}

.icon-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-preview {
  color: #409EFF;
}

.selected-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  background: #F5F7FA;
}

.selected-icon .el-icon {
  color: #409EFF;
}

.dialog-footer {
  padding: 10px 0 0 0;
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 10px;
}

/* 部门选择器样式 */
.category-dialog :deep(.el-tree-select) {
  width: 100%;
}

.category-dialog :deep(.el-tree-select__popper .el-tree) {
  max-height: 300px;
  overflow-y: auto;
}

/* 抽样比例配置样式 */
.sample-rate-config {
  width: 100%;
}

.rate-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.rate-value {
  font-size: 18px;
  font-weight: 600;
  color: #409EFF;
  background: #ecf5ff;
  padding: 4px 12px;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
}

.rate-desc {
  color: #606266;
  font-size: 14px;
}

/* 滑块样式优化 */
.category-dialog :deep(.el-slider__marks-text) {
  font-size: 12px;
  color: #909399;
}

.category-dialog :deep(.el-slider__button) {
  border: 2px solid #409EFF;
  background-color: #fff;
}

.category-dialog :deep(.el-slider__bar) {
  background-color: #409EFF;
}

/* 表单项间距优化 */
.category-dialog .el-form-item {
  margin-bottom: 22px;
}

.category-dialog .el-form-item:last-child {
  margin-bottom: 0;
}
</style>