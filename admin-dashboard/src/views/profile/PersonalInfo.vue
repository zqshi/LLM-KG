<template>
  <div class="personal-info-page">
    <div class="page-header">
      <h2>个人资料</h2>
      <p class="page-description">管理您的个人信息和安全设置</p>
    </div>

    <div class="info-sections">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>基本信息</span>
            <el-button type="primary" size="small" @click="handleEdit">编辑</el-button>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <label>头像</label>
            <div class="avatar-section">
              <el-avatar :size="80" :src="userInfo.avatar">
                {{ userInfo.name?.charAt(0) }}
              </el-avatar>
              <el-button size="small" @click="handleAvatarUpload" style="margin-left: 20px">
                更换头像
              </el-button>
            </div>
          </div>

          <div class="info-item">
            <label>用户名</label>
            <span class="info-value readonly">{{ userInfo.username }}</span>
            <small class="info-tip">用户名不可修改</small>
          </div>

          <div class="info-item">
            <label>姓名</label>
            <span class="info-value readonly">{{ userInfo.name }}</span>
            <small class="info-tip">姓名由管理员维护</small>
          </div>

          <div class="info-item">
            <label>邮箱</label>
            <span class="info-value">{{ userInfo.email || '未设置' }}</span>
          </div>

          <div class="info-item">
            <label>手机号</label>
            <span class="info-value">{{ userInfo.phone || '未设置' }}</span>
          </div>

          <div class="info-item">
            <label>所属部门</label>
            <span class="info-value readonly">{{ userInfo.group?.name }}</span>
            <small class="info-tip">部门信息由管理员维护</small>
          </div>

          <div class="info-item">
            <label>个人简介</label>
            <span class="info-value">{{ userInfo.bio || '未设置个人简介' }}</span>
          </div>
        </div>
      </el-card>

      <!-- 安全设置 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>安全设置</span>
          </div>
        </template>

        <div class="security-items">
          <div class="security-item">
            <div class="security-info">
              <div class="security-title">登录密码</div>
              <div class="security-desc">定期更换密码有助于保护账户安全</div>
            </div>
            <el-button type="primary" @click="handlePasswordChange">修改密码</el-button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <div class="security-title">最后登录</div>
              <div class="security-desc">{{ formatDateTime(userInfo.lastLoginTime) || '从未登录' }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 角色信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>角色权限</span>
          </div>
        </template>

        <div class="roles-section">
          <div v-if="userInfo.roles && userInfo.roles.length > 0" class="roles-list">
            <el-tag
              v-for="role in userInfo.roles"
              :key="role.id"
              type="success"
              size="default"
              class="role-tag"
            >
              {{ role.name }}
            </el-tag>
          </div>
          <div v-else class="no-roles">
            <el-text type="info">未分配任何角色</el-text>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 编辑个人信息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑个人信息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="editForm.email"
            placeholder="请输入邮箱地址"
            type="email"
          />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="editForm.phone"
            placeholder="请输入手机号"
            maxlength="11"
          />
        </el-form-item>

        <el-form-item label="个人简介" prop="bio">
          <el-input
            v-model="editForm.bio"
            type="textarea"
            :rows="4"
            placeholder="简单介绍一下自己..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSave" :loading="saveLoading">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="450px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordFormRules"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <div class="password-tips">
        <el-alert
          title="密码安全建议"
          type="info"
          :closable="false"
          show-icon
        >
          <ul>
            <li>密码长度至少6位</li>
            <li>包含字母、数字或特殊字符</li>
            <li>避免使用个人信息作为密码</li>
            <li>定期更换密码</li>
          </ul>
        </el-alert>
      </div>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePasswordSave" :loading="saveLoading">
          修改密码
        </el-button>
      </template>
    </el-dialog>

    <!-- 头像上传对话框 -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="更换头像"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="avatar-upload-section">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          action="#"
          :auto-upload="false"
          :on-change="handleAvatarChange"
        >
          <img v-if="previewAvatar" :src="previewAvatar" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="upload-tips">
          <p>支持 JPG、PNG 格式图片</p>
          <p>建议图片尺寸为 200x200 像素</p>
          <p>文件大小不超过 2MB</p>
        </div>
      </div>

      <template #footer>
        <el-button @click="avatarDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAvatarSave" :loading="saveLoading">
          保存头像
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

// Store
const authStore = useAuthStore()

// 响应式数据
const editDialogVisible = ref(false)
const passwordDialogVisible = ref(false)
const avatarDialogVisible = ref(false)
const saveLoading = ref(false)
const editFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const previewAvatar = ref('')

// 用户信息
const userInfo = ref<User>({
  id: 1,
  username: 'current_user',
  name: '当前用户',
  email: 'user@company.com',
  phone: '13800138000',
  groupId: 1,
  group: {
    id: 1,
    name: '信息技术部',
    level: '1.1',
    sort: 1,
    createTime: '2025-08-30T00:00:00'
  },
  status: 1,
  roles: [
    {
      id: 2,
      name: '普通用户',
      code: 'normal_user',
      permissions: [],
      dataScope: 4,
      status: 1,
      createTime: '2025-08-30T00:00:00',
      updateTime: '2025-08-30T00:00:00'
    }
  ],
  createTime: '2025-08-30T00:00:00',
  updateTime: '2025-08-30T00:00:00',
  lastLoginTime: '2025-08-30T15:30:00',
  bio: '这里是个人简介...'
})

// 编辑表单
const editForm = reactive({
  email: '',
  phone: '',
  bio: ''
})

// 密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const editFormRules: FormRules = {
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  bio: [
    { max: 200, message: '个人简介不能超过200字符', trigger: 'blur' }
  ]
}

const passwordFormRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 格式化日期时间
const formatDateTime = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 编辑个人信息
const handleEdit = () => {
  editForm.email = userInfo.value.email || ''
  editForm.phone = userInfo.value.phone || ''
  editForm.bio = userInfo.value.bio || ''
  editDialogVisible.value = true
}

const handleEditSave = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    
    saveLoading.value = true
    
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息
    userInfo.value.email = editForm.email
    userInfo.value.phone = editForm.phone
    userInfo.value.bio = editForm.bio
    
    ElMessage.success('个人信息更新成功')
    editDialogVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saveLoading.value = false
  }
}

// 修改密码
const handlePasswordChange = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

const handlePasswordSave = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    
    saveLoading.value = true
    
    // 模拟密码修改
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('密码修改成功，请重新登录')
    
    // 询问是否强制登出其他设备
    try {
      await ElMessageBox.confirm(
        '是否同时登出其他已登录设备？',
        '安全提示',
        {
          confirmButtonText: '是，登出其他设备',
          cancelButtonText: '否，仅当前修改'
        }
      )
      ElMessage.success('已强制登出其他设备')
    } catch {
      // 用户取消
    }
    
    passwordDialogVisible.value = false
  } catch (error) {
    console.error('密码修改失败:', error)
  } finally {
    saveLoading.value = false
  }
}

// 头像上传
const handleAvatarUpload = () => {
  previewAvatar.value = userInfo.value.avatar || ''
  avatarDialogVisible.value = true
}

const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

const beforeAvatarUpload = (file: File) => {
  const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPGorPNG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarSuccess = (response: any, file: any) => {
  // 处理上传成功
}

const handleAvatarSave = async () => {
  saveLoading.value = true
  
  try {
    // 模拟头像上传
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    userInfo.value.avatar = previewAvatar.value
    ElMessage.success('头像更换成功')
    avatarDialogVisible.value = false
  } catch (error) {
    ElMessage.error('头像更换失败')
  } finally {
    saveLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 在实际项目中，这里应该从服务器获取当前用户信息
  // userInfo.value = authStore.user
})
</script>

<style scoped>
.personal-info-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.page-description {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.info-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 14px;
  min-height: 20px;
}

.info-value.readonly {
  color: #909399;
}

.info-tip {
  color: #c0c4cc;
  font-size: 12px;
}

.avatar-section {
  display: flex;
  align-items: center;
}

.security-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.security-info {
  flex: 1;
}

.security-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.security-desc {
  color: #909399;
  font-size: 13px;
}

.roles-section {
  padding: 10px 0;
}

.roles-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.role-tag {
  margin: 0;
}

.no-roles {
  text-align: center;
  padding: 20px;
}

.password-tips {
  margin-top: 16px;
}

.password-tips ul {
  margin: 8px 0 0 0;
  padding-left: 16px;
}

.password-tips li {
  margin: 4px 0;
  font-size: 12px;
  color: #909399;
}

.avatar-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

:deep(.avatar-uploader .el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: .3s;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
}

.upload-tips {
  text-align: center;
}

.upload-tips p {
  margin: 4px 0;
  color: #909399;
  font-size: 13px;
}
</style>