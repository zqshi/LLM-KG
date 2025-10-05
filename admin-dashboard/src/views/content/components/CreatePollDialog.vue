<template>
  <BaseModal
    v-model="dialogVisible"
    :title="isEdit ? '编辑投票帖' : '创建投票帖'"
    width="800px"
    :destroy-on-close="true"
    class="create-poll-dialog"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="poll-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <div class="section-title">基本信息</div>
        
        <el-form-item label="投票标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入投票帖标题"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="投票问题" prop="question">
          <el-input
            v-model="form.question"
            placeholder="请输入投票问题"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="帖子内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="4"
            placeholder="请输入帖子内容描述"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="版块" prop="categoryId">
          <el-select v-model="form.categoryId" placeholder="请选择版块" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </div>

      <!-- 投票配置 -->
      <div class="form-section">
        <div class="section-title">投票配置</div>
        
        <el-form-item label="投票类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio value="single">单选投票</el-radio>
            <el-radio value="multiple">多选投票</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="form.type === 'multiple'" label="最大选择数" prop="maxChoices">
          <el-input-number
            v-model="form.maxChoices"
            :min="2"
            :max="form.options.length"
            placeholder="最多可选择几个选项"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="投票选项" prop="options" required>
          <div class="options-container">
            <div v-for="(option, index) in form.options" :key="index" class="option-item">
              <div class="option-content">
                <el-input
                  v-model="option.text"
                  placeholder="选项内容"
                  maxlength="100"
                  class="option-input"
                />
                <el-input
                  v-model="option.description"
                  placeholder="选项描述（可选）"
                  maxlength="200"
                  class="option-input option-input-description"
                />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="removeOption(index)"
                  :disabled="form.options.length <= 2"
                  style="margin-left: 10px"
                />
              </div>
              <!-- 选项图片上传 -->
              <div class="option-image" v-if="option.image">
                <el-image
                  :src="option.image"
                  style="width: 100px; height: 60px"
                  fit="cover"
                />
                <el-button
                  type="text"
                  size="small"
                  @click="option.image = ''"
                  style="margin-left: 10px"
                >
                  移除图片
                </el-button>
              </div>
              <div class="option-upload" v-else>
                <el-upload
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="(response) => handleImageUpload(response, index)"
                  :before-upload="beforeImageUpload"
                  accept="image/*"
                >
                  <el-button size="small" type="text">
                    <el-icon><Plus /></el-icon>
                    添加图片
                  </el-button>
                </el-upload>
              </div>
            </div>
            
            <el-button
              plain
              @click="addOption"
              :disabled="form.options.length >= 10"
              style="width: 100%; margin-top: 10px"
            >
              <el-icon><Plus /></el-icon>
              添加选项（最多10个）
            </el-button>
          </div>
        </el-form-item>
      </div>

      <!-- 时间设置 -->
      <div class="form-section">
        <div class="section-title">时间设置</div>
        
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
            :disabled-date="disabledStartDate"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
            :disabled-date="disabledEndDate"
          />
        </el-form-item>

        <el-form-item label="快速设置">
          <el-button-group>
            <el-button @click="setQuickTime(1)">1天</el-button>
            <el-button @click="setQuickTime(3)">3天</el-button>
            <el-button @click="setQuickTime(7)">7天</el-button>
            <el-button @click="setQuickTime(30)">30天</el-button>
          </el-button-group>
        </el-form-item>
      </div>

      <!-- 权限设置 -->
      <div class="form-section">
        <div class="section-title">权限设置</div>
        
        <el-form-item label="参与范围" prop="scopeConfig.scope">
          <el-radio-group v-model="form.scopeConfig.scope" @change="handleScopeChange">
            <el-radio value="all">全员可参与</el-radio>
            <el-radio value="category">版块内用户</el-radio>
            <el-radio value="department">指定部门</el-radio>
            <el-radio value="role">指定角色</el-radio>
            <el-radio value="custom">自定义用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 部门选择 -->
        <el-form-item
          v-if="form.scopeConfig.scope === 'department'"
          label="选择部门"
          prop="scopeConfig.departments"
        >
          <el-select
            v-model="form.scopeConfig.departments"
            multiple
            placeholder="请选择部门"
            style="width: 100%"
          >
            <el-option
              v-for="dept in departments"
              :key="dept.id"
              :label="dept.name"
              :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <!-- 角色选择 -->
        <el-form-item
          v-if="form.scopeConfig.scope === 'role'"
          label="选择角色"
          prop="scopeConfig.roles"
        >
          <el-select
            v-model="form.scopeConfig.roles"
            multiple
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option
              v-for="role in roles"
              :key="role.id"
              :label="role.name"
              :value="role.code"
            />
          </el-select>
        </el-form-item>

        <!-- 自定义用户选择 -->
        <el-form-item
          v-if="form.scopeConfig.scope === 'custom'"
          label="选择用户"
          prop="scopeConfig.userIds"
        >
          <el-select
            v-model="form.scopeConfig.userIds"
            multiple
            filterable
            remote
            placeholder="搜索并选择用户"
            :remote-method="searchUsers"
            :loading="searchingUsers"
            style="width: 100%"
          >
            <el-option
              v-for="user in searchedUsers"
              :key="user.id"
              :label="`${user.name} (${user.department})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="结果可见性" prop="resultVisibility">
          <el-radio-group v-model="form.resultVisibility">
            <el-radio value="real_time">实时可见</el-radio>
            <el-radio value="after_end">结束后可见</el-radio>
            <el-radio value="never">仅管理员可见</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <!-- 奖励设置 -->
      <div class="form-section">
        <div class="section-title">
          奖励设置
          <el-switch
            v-model="hasRewards"
            style="margin-left: 20px"
            @change="handleRewardToggle"
          />
        </div>
        
        <div v-if="hasRewards" class="rewards-container">
          <div v-for="(reward, index) in form.rewards" :key="index" class="reward-item">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item :prop="`rewards.${index}.name`" label="奖励名称">
                  <el-input v-model="reward.name" placeholder="奖励名称" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :prop="`rewards.${index}.type`" label="奖励类型">
                  <el-select v-model="reward.type" placeholder="类型" style="width: 100%">
                    <el-option label="积分" value="points" />
                    <el-option label="徽章" value="badge" />
                    <el-option label="礼品" value="gift" />
                    <el-option label="优惠券" value="voucher" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item :prop="`rewards.${index}.value`" label="奖励价值">
                  <el-input-number v-model="reward.value" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item :prop="`rewards.${index}.condition`" label="获得条件">
                  <el-select v-model="reward.condition" style="width: 100%">
                    <el-option label="参与即可" value="participate" />
                    <el-option label="选择获胜选项" value="winner" />
                    <el-option label="所有参与者" value="all_participants" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-form-item label=" ">
                  <el-button
                    type="danger"
                    :icon="Delete"
                    @click="removeReward(index)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item :prop="`rewards.${index}.description`" label="奖励描述">
              <el-input
                v-model="reward.description"
                type="textarea"
                placeholder="奖励描述"
                :rows="2"
              />
            </el-form-item>
          </div>
          
          <el-button plain @click="addReward" style="width: 100%">
            <el-icon><Plus /></el-icon>
            添加奖励
          </el-button>
        </div>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button @click="handleSaveDraft" :loading="saving">保存草稿</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">
        {{ isEdit ? '更新' : '创建并发布' }}
      </el-button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CreatePollPostForm, PollPostListItem } from '@/types/poll'
import PollAdminAPI, { PollCommonAPI } from '@/api/poll'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import BaseModal from '@/components/modal/BaseModal.vue'

// Props
interface Props {
  modelValue: boolean
  pollData?: PollPostListItem | null
  categories: { id: number; name: string }[]
}

const props = withDefaults(defineProps<Props>(), {
  pollData: null
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const saving = ref(false)
const searchingUsers = ref(false)
const hasRewards = ref(false)

const departments = ref<{ id: string; name: string }[]>([])
const roles = ref<{ id: number; name: string; code: string }[]>([])
const searchedUsers = ref<{ id: number; name: string; department: string }[]>([])

// 上传配置
const uploadUrl = '/api/upload/poll-option-image'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

// 表单数据
const form = ref<CreatePollPostForm>({
  title: '',
  content: '',
  question: '',
  type: 'single',
  maxChoices: 2,
  options: [
    { text: '', description: '', image: '' },
    { text: '', description: '', image: '' }
  ],
  startTime: '',
  endTime: '',
  scopeConfig: {
    scope: 'all',
    departments: [],
    roles: [],
    userIds: [],
    categoryIds: []
  },
  resultVisibility: 'real_time',
  rewards: [],
  categoryId: 0,
  publishImmediately: true
})

// 表单验证规则
const rules: FormRules = {
  title: [
    { required: true, message: '请输入投票标题', trigger: 'blur' }
  ],
  question: [
    { required: true, message: '请输入投票问题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择版块', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  options: [
    {
      validator: (rule, value, callback) => {
        const validOptions = value.filter((opt: any) => opt.text.trim())
        if (validOptions.length < 2) {
          callback(new Error('至少需要2个有效选项'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.pollData)

// 方法
const addOption = () => {
  if (form.value.options.length < 10) {
    form.value.options.push({ text: '', description: '', image: '' })
  }
}

const removeOption = (index: number) => {
  if (form.value.options.length > 2) {
    form.value.options.splice(index, 1)
  }
}

const addReward = () => {
  form.value.rewards.push({
    name: '',
    description: '',
    type: 'points',
    value: 0,
    quantity: 1,
    condition: 'participate'
  })
}

const removeReward = (index: number) => {
  form.value.rewards.splice(index, 1)
}

const handleRewardToggle = (value: boolean) => {
  if (value && form.value.rewards.length === 0) {
    addReward()
  } else if (!value) {
    form.value.rewards = []
  }
}

const handleScopeChange = (scope: string) => {
  // 清空之前的配置
  form.value.scopeConfig = {
    scope,
    departments: [],
    roles: [],
    userIds: [],
    categoryIds: []
  }
}

const setQuickTime = (days: number) => {
  const now = new Date()
  const startTime = new Date()
  const endTime = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  
  form.value.startTime = startTime.toISOString().slice(0, 19)
  form.value.endTime = endTime.toISOString().slice(0, 19)
}

const disabledStartDate = (time: Date) => {
  return time.getTime() < Date.now() - 24 * 60 * 60 * 1000
}

const disabledEndDate = (time: Date) => {
  const startTime = new Date(form.value.startTime)
  return time.getTime() < startTime.getTime() + 60 * 60 * 1000 // 至少1小时后
}

const searchUsers = async (keyword: string) => {
  if (!keyword) {
    searchedUsers.value = []
    return
  }
  
  searchingUsers.value = true
  try {
    const response = await PollCommonAPI.searchUsers(keyword)
    searchedUsers.value = response.data
  } catch (error) {
    console.error('搜索用户失败:', error)
  } finally {
    searchingUsers.value = false
  }
}

const handleImageUpload = (response: any, index: number) => {
  if (response.code === 200) {
    form.value.options[index].image = response.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

const beforeImageUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

const handleSaveDraft = async () => {
  if (!formRef.value) return
  
  saving.value = true
  try {
    const rewardsPayload = (form.value.rewards || []).map((r, idx) => ({
      id: (r as any).id ?? idx + 1,
      name: r.name,
      type: r.type,
      description: r.description,
      value: (r as any).value,
      image: (r as any).image,
      condition: r.condition,
      quantity: (r as any).quantity ?? 1
    }))
    const formData = { ...form.value, publishImmediately: false, rewards: rewardsPayload }
    
    if (isEdit.value && props.pollData) {
      await PollAdminAPI.updatePollPost({
        id: props.pollData.id,
        ...formData
      })
      ElMessage.success('草稿保存成功')
    } else {
      await PollAdminAPI.createPollPost(formData)
      ElMessage.success('草稿创建成功')
    }
    
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    saving.value = true
    try {
      const rewardsPayload = (form.value.rewards || []).map((r, idx) => ({
        id: (r as any).id ?? idx + 1,
        name: r.name,
        type: r.type,
        description: r.description,
        value: (r as any).value,
        image: (r as any).image,
        condition: r.condition,
        quantity: (r as any).quantity ?? 1
      }))
      const formData = { ...form.value, publishImmediately: true, rewards: rewardsPayload }
      
      if (isEdit.value && props.pollData) {
        await PollAdminAPI.updatePollPost({
          id: props.pollData.id,
          ...formData
        })
        ElMessage.success('更新成功')
      } else {
        await PollAdminAPI.createPollPost(formData)
        ElMessage.success('投票帖创建成功')
      }
      
      emit('success')
      dialogVisible.value = false
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
      console.error('提交失败:', error)
    } finally {
      saving.value = false
    }
  })
}

const handleClose = () => {
  dialogVisible.value = false
  // 重置表单
  formRef.value?.resetFields()
}

const loadReferenceData = async () => {
  try {
    const [deptResponse, roleResponse] = await Promise.all([
      PollCommonAPI.getDepartments(),
      PollCommonAPI.getRoles()
    ])
    
    departments.value = deptResponse.data
    roles.value = roleResponse.data
  } catch (error) {
    console.error('加载参考数据失败:', error)
    // 使用模拟数据，避免报错阻断
    departments.value = [
      { id: '1', name: '技术部' },
      { id: '2', name: '产品部' },
      { id: '3', name: '市场部' },
      { id: '4', name: '人事部' }
    ]
    
    roles.value = [
      { id: 1, name: '普通员工', code: 'employee' },
      { id: 2, name: '项目经理', code: 'pm' },
      { id: 3, name: '部门主管', code: 'manager' },
      { id: 4, name: '管理员', code: 'admin' }
    ]
  }
}

// 监听编辑数据变化
watch(() => props.pollData, (data) => {
  if (data) {
    // TODO: 填充编辑数据
    console.log('编辑数据:', data)
  } else {
    // 重置表单
    form.value = {
      title: '',
      content: '',
      question: '',
      type: 'single',
      maxChoices: 2,
      options: [
        { text: '', description: '', image: '' },
        { text: '', description: '', image: '' }
      ],
      startTime: '',
      endTime: '',
      scopeConfig: {
        scope: 'all',
        departments: [],
        roles: [],
        userIds: [],
        categoryIds: []
      },
      resultVisibility: 'real_time',
      rewards: [],
      categoryId: 0,
      publishImmediately: true
    }
    hasRewards.value = false
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  loadReferenceData()
})
</script>

<style scoped lang="scss">
.create-poll-dialog {
  .poll-form {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .form-section {
    margin-bottom: 30px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--el-border-color-light);
      display: flex;
      align-items: center;
    }
  }
  
  .options-container {
    width: 100%;
    
    .option-item {
      margin-bottom: 15px;
      padding: 15px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      background: var(--el-fill-color-extra-light);
      
      .option-content {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        gap: 10px;

        .option-input {
          flex: 1;

          &.option-input-description {
            flex: 1.5;
          }
        }
      }
      
      .option-image {
        display: flex;
        align-items: center;
        margin-top: 10px;
      }
      
      .option-upload {
        margin-top: 10px;
      }
    }
  }
  
  .rewards-container {
    .reward-item {
      margin-bottom: 20px;
      padding: 20px;
      border: 1px solid var(--el-border-color-light);
      border-radius: 6px;
      background: var(--el-fill-color-extra-light);
    }
  }
  

}

.el-form-item {
  margin-bottom: 20px;
}

/* 优化帖子内容文本框样式 */
.create-poll-dialog .poll-form .el-form-item:not(.option-input) textarea.el-textarea__inner {
  border-width: 1px !important;
  border-color: #d1d5db !important;
  border-style: solid !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.create-poll-dialog .poll-form .el-form-item:not(.option-input) textarea.el-textarea__inner:hover {
  border-color: #3b82f6 !important;
}

.create-poll-dialog .poll-form .el-form-item:not(.option-input) textarea.el-textarea__inner:focus {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1) !important;
  outline: none !important;
}

/* 优化版块选择框样式 */
.create-poll-dialog .poll-form .el-form-item:not(.option-input) .el-select__wrapper {
  border-width: 1px !important;
  border-color: #d1d5db !important;
  border-style: solid !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.create-poll-dialog .poll-form .el-form-item:not(.option-input) .el-select__wrapper:hover {
  border-color: #3b82f6 !important;
}

.create-poll-dialog .poll-form .el-form-item:not(.option-input) .el-select__wrapper.is-focused {
  border-color: #2563eb !important;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1) !important;
  outline: none !important;
}

@media (max-width: 768px) {
  .create-poll-dialog {
    width: 95% !important;
    
      .option-content {
        flex-direction: column !important;
        align-items: stretch !important;

        .option-input {
          margin: 5px 0 !important;

          &.option-input-description {
            flex: 1 !important; /* 在移动端将弹性比例重置为1 */
          }
        }
      }
  }
}
</style>