<template>
  <div class="system-settings-page">
    <UnifiedPageHeader 
      title="系统设置" 
      description="管理系统基本配置、安全设置和功能参数"
    >
      <template #actions>
        <el-button type="primary" @click="handleSave" :loading="saveLoading">
          <el-icon><Check /></el-icon>
          保存设置
        </el-button>
      </template>
    </UnifiedPageHeader>

    <el-row :gutter="20">
      <el-col :span="18">
        <div class="settings-panels">
          <!-- 基础配置 -->
          <el-card class="settings-card">
            <template #header>
              <span>基础配置</span>
            </template>
            
            <el-form :model="basicSettings" label-width="120px">
              <el-form-item label="站点名称">
                <el-input v-model="basicSettings.siteName" style="width: 300px" />
              </el-form-item>
              
              <el-form-item label="站点描述">
                <el-input
                  v-model="basicSettings.siteDescription"
                  type="textarea"
                  :rows="3"
                  style="width: 400px"
                />
              </el-form-item>
              
              <el-form-item label="站点Logo">
                <div class="logo-upload">
                  <el-upload
                    class="logo-uploader"
                    :show-file-list="false"
                    :before-upload="beforeLogoUpload"
                  >
                    <img v-if="basicSettings.siteLogo" :src="basicSettings.siteLogo" class="logo" />
                    <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div class="logo-tips">
                    <p>建议尺寸：200x60px，支持PNG、JPG格式</p>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="版权信息">
                <el-input v-model="basicSettings.copyright" style="width: 400px" />
              </el-form-item>
              
              <el-form-item label="备案信息">
                <el-input v-model="basicSettings.icp" style="width: 300px" />
              </el-form-item>
              
              <el-form-item label="联系邮箱">
                <el-input v-model="basicSettings.contactEmail" style="width: 300px" />
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 功能配置 -->
          <el-card class="settings-card">
            <template #header>
              <span>功能配置</span>
            </template>
            
            <el-form :model="featureSettings" label-width="120px">
              <el-form-item label="用户注册">
                <el-switch
                  v-model="featureSettings.allowRegistration"
                  active-text="允许注册"
                  inactive-text="关闭注册"
                />
              </el-form-item>
              
              <el-form-item label="邮箱验证">
                <el-switch
                  v-model="featureSettings.emailVerification"
                  active-text="需要验证"
                  inactive-text="无需验证"
                />
              </el-form-item>
              
              <el-form-item label="内容评论">
                <el-switch
                  v-model="featureSettings.allowComments"
                  active-text="允许评论"
                  inactive-text="禁止评论"
                />
              </el-form-item>
              
              <el-form-item label="匿名浏览">
                <el-switch
                  v-model="featureSettings.allowAnonymous"
                  active-text="允许匿名"
                  inactive-text="仅限登录"
                />
              </el-form-item>
              
              <el-form-item label="文件上传">
                <div class="upload-config">
                  <el-switch
                    v-model="featureSettings.allowUpload"
                    active-text="允许上传"
                    inactive-text="禁止上传"
                  />
                  <div v-if="featureSettings.allowUpload" class="upload-limits">
                    <div class="limit-item">
                      <span>单文件大小限制：</span>
                      <el-input-number
                        v-model="featureSettings.maxFileSize"
                        :min="1"
                        :max="100"
                        style="width: 120px"
                      />
                      <span>MB</span>
                    </div>
                    <div class="limit-item">
                      <span>允许的文件类型：</span>
                      <el-checkbox-group v-model="featureSettings.allowedFileTypes">
                        <el-checkbox value="image">图片</el-checkbox>
                        <el-checkbox value="document">文档</el-checkbox>
                        <el-checkbox value="video">视频</el-checkbox>
                        <el-checkbox value="audio">音频</el-checkbox>
                      </el-checkbox-group>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 安全配置 -->
          <el-card class="settings-card">
            <template #header>
              <span>安全配置</span>
            </template>
            
            <el-form :model="securitySettings" label-width="120px">
              <el-form-item label="登录限制">
                <div class="security-item">
                  <el-switch
                    v-model="securitySettings.enableLoginLimit"
                    active-text="启用登录限制"
                    inactive-text="不限制登录"
                  />
                  <div v-if="securitySettings.enableLoginLimit" class="limit-config">
                    <span>允许失败次数：</span>
                    <el-input-number
                      v-model="securitySettings.maxLoginAttempts"
                      :min="3"
                      :max="10"
                      style="width: 100px"
                    />
                    <span>次，锁定时间：</span>
                    <el-input-number
                      v-model="securitySettings.lockoutDuration"
                      :min="5"
                      :max="60"
                      style="width: 100px"
                    />
                    <span>分钟</span>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="密码策略">
                <div class="password-policy">
                  <el-checkbox v-model="securitySettings.passwordPolicy.requireMixedCase">
                    必须包含大小写字母
                  </el-checkbox>
                  <el-checkbox v-model="securitySettings.passwordPolicy.requireNumbers">
                    必须包含数字
                  </el-checkbox>
                  <el-checkbox v-model="securitySettings.passwordPolicy.requireSpecialChars">
                    必须包含特殊字符
                  </el-checkbox>
                  <div class="policy-item">
                    <span>最小长度：</span>
                    <el-input-number
                      v-model="securitySettings.passwordPolicy.minLength"
                      :min="6"
                      :max="20"
                      style="width: 100px"
                    />
                    <span>位</span>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="会话超时">
                <el-input-number
                  v-model="securitySettings.sessionTimeout"
                  :min="30"
                  :max="480"
                  style="width: 120px"
                />
                <span style="margin-left: 8px">分钟</span>
              </el-form-item>
              
              <el-form-item label="IP白名单">
                <div class="ip-whitelist">
                  <el-switch
                    v-model="securitySettings.enableIpWhitelist"
                    active-text="启用IP白名单"
                    inactive-text="不限制IP"
                  />
                  <div v-if="securitySettings.enableIpWhitelist" class="whitelist-config">
                    <el-input
                      v-model="newIpAddress"
                      placeholder="请输入IP地址或IP段"
                      style="width: 200px; margin-right: 10px"
                    />
                    <el-button @click="addIpAddress">添加</el-button>
                    <div class="ip-list">
                      <el-tag
                        v-for="(ip, index) in securitySettings.ipWhitelist"
                        :key="index"
                        closable
                        @close="removeIpAddress(index)"
                        style="margin: 4px"
                      >
                        {{ ip }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 通知配置 -->
          <el-card class="settings-card">
            <template #header>
              <span>通知配置</span>
            </template>
            
            <el-form :model="notificationSettings" label-width="120px">
              <el-form-item label="邮件服务">
                <div class="email-config">
                  <el-switch
                    v-model="notificationSettings.email.enabled"
                    active-text="启用邮件通知"
                    inactive-text="禁用邮件通知"
                  />
                  <div v-if="notificationSettings.email.enabled" class="email-settings">
                    <div class="setting-row">
                      <span class="setting-label">SMTP服务器：</span>
                      <el-input
                        v-model="notificationSettings.email.smtpHost"
                        style="width: 200px"
                      />
                    </div>
                    <div class="setting-row">
                      <span class="setting-label">端口：</span>
                      <el-input-number
                        v-model="notificationSettings.email.smtpPort"
                        :min="25"
                        :max="587"
                        style="width: 120px"
                      />
                    </div>
                    <div class="setting-row">
                      <span class="setting-label">发送邮箱：</span>
                      <el-input
                        v-model="notificationSettings.email.fromEmail"
                        style="width: 200px"
                      />
                    </div>
                    <div class="setting-row">
                      <span class="setting-label">邮箱密码：</span>
                      <el-input
                        v-model="notificationSettings.email.password"
                        type="password"
                        show-password
                        style="width: 200px"
                      />
                    </div>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="短信服务">
                <div class="sms-config">
                  <el-switch
                    v-model="notificationSettings.sms.enabled"
                    active-text="启用短信通知"
                    inactive-text="禁用短信通知"
                  />
                  <div v-if="notificationSettings.sms.enabled" class="sms-settings">
                    <div class="setting-row">
                      <span class="setting-label">服务商：</span>
                      <el-select v-model="notificationSettings.sms.provider" style="width: 150px">
                        <el-option label="阿里云" value="aliyun" />
                        <el-option label="腾讯云" value="tencent" />
                        <el-option label="华为云" value="huawei" />
                      </el-select>
                    </div>
                    <div class="setting-row">
                      <span class="setting-label">AccessKey：</span>
                      <el-input
                        v-model="notificationSettings.sms.accessKey"
                        style="width: 200px"
                      />
                    </div>
                    <div class="setting-row">
                      <span class="setting-label">SecretKey：</span>
                      <el-input
                        v-model="notificationSettings.sms.secretKey"
                        type="password"
                        show-password
                        style="width: 200px"
                      />
                    </div>
                  </div>
                </div>
              </el-form-item>
              
              <el-form-item label="Webhook">
                <div class="webhook-config">
                  <el-switch
                    v-model="notificationSettings.webhook.enabled"
                    active-text="启用Webhook"
                    inactive-text="禁用Webhook"
                  />
                  <div v-if="notificationSettings.webhook.enabled" class="webhook-settings">
                    <div class="setting-row">
                      <span class="setting-label">Webhook URL：</span>
                      <el-input
                        v-model="notificationSettings.webhook.url"
                        placeholder="https://example.com/webhook"
                        style="width: 300px"
                      />
                    </div>
                    <div class="setting-row">
                      <span class="setting-label">验证Token：</span>
                      <el-input
                        v-model="notificationSettings.webhook.secret"
                        style="width: 200px"
                      />
                    </div>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 存储配置 -->
          <el-card class="settings-card">
            <template #header>
              <span>存储配置</span>
            </template>
            
            <el-form :model="storageSettings" label-width="120px">
              <el-form-item label="存储方式">
                <el-radio-group v-model="storageSettings.type">
                  <el-radio value="local">本地存储</el-radio>
                  <el-radio value="oss">阿里云OSS</el-radio>
                  <el-radio value="cos">腾讯云COS</el-radio>
                  <el-radio value="obs">华为云OBS</el-radio>
                </el-radio-group>
              </el-form-item>
              
              <div v-if="storageSettings.type !== 'local'">
                <el-form-item label="访问密钥">
                  <el-input
                    v-model="storageSettings.accessKey"
                    style="width: 300px"
                  />
                </el-form-item>
                
                <el-form-item label="私有密钥">
                  <el-input
                    v-model="storageSettings.secretKey"
                    type="password"
                    show-password
                    style="width: 300px"
                  />
                </el-form-item>
                
                <el-form-item label="存储桶名">
                  <el-input
                    v-model="storageSettings.bucket"
                    style="width: 200px"
                  />
                </el-form-item>
                
                <el-form-item label="区域">
                  <el-input
                    v-model="storageSettings.region"
                    style="width: 200px"
                  />
                </el-form-item>
                
                <el-form-item label="自定义域名">
                  <el-input
                    v-model="storageSettings.customDomain"
                    placeholder="可选，如：https://cdn.example.com"
                    style="width: 300px"
                  />
                </el-form-item>
              </div>
            </el-form>
          </el-card>
        </div>
      </el-col>

      <!-- 右侧状态面板 -->
      <el-col :span="6">
        <div class="status-panels">
          <!-- 系统状态 -->
          <el-card>
            <template #header>
              <span>系统状态</span>
            </template>
            
            <div class="system-status">
              <div class="status-item">
                <div class="status-label">系统版本</div>
                <div class="status-value">v1.2.3</div>
              </div>
              
              <div class="status-item">
                <div class="status-label">运行时长</div>
                <div class="status-value">15天 8小时</div>
              </div>
              
              <div class="status-item">
                <div class="status-label">数据库</div>
                <div class="status-value">
                  <el-tag type="success" size="small">正常</el-tag>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">缓存</div>
                <div class="status-value">
                  <el-tag type="success" size="small">正常</el-tag>
                </div>
              </div>
              
              <div class="status-item">
                <div class="status-label">存储空间</div>
                <div class="status-value">
                  <el-progress :percentage="68" :stroke-width="6" />
                </div>
              </div>
            </div>
          </el-card>

          <!-- 快速操作 -->
          <el-card style="margin-top: 20px">
            <template #header>
              <span>快速操作</span>
            </template>
            
            <div class="quick-actions">
              <el-button @click="handleClearCache" style="width: 100%; margin-bottom: 10px">
                <el-icon><Refresh /></el-icon>
                清空缓存
              </el-button>
              
              <el-button @click="handleSystemBackup" style="width: 100%; margin-bottom: 10px">
                <el-icon><FolderAdd /></el-icon>
                系统备份
              </el-button>
              
              <el-button @click="handleSystemRestart" style="width: 100%; margin-bottom: 10px">
                <el-icon><SwitchButton /></el-icon>
                重启系统
              </el-button>
              
              <el-button @click="handleTestEmail" style="width: 100%; margin-bottom: 10px">
                <el-icon><Message /></el-icon>
                测试邮件
              </el-button>
            </div>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import {
  Check, Plus, Refresh, FolderAdd, SwitchButton, Message
} from '@element-plus/icons-vue'

const saveLoading = ref(false)
const newIpAddress = ref('')

const basicSettings = reactive({
  siteName: '企业知识聚合平台',
  siteDescription: '企业内部知识分享与交流平台，促进团队协作与知识传播',
  siteLogo: '',
  copyright: '© 2024 企业知识聚合平台 版权所有',
  icp: '',
  contactEmail: 'admin@company.com'
})

const featureSettings = reactive({
  allowRegistration: false,
  emailVerification: true,
  allowComments: true,
  allowAnonymous: false,
  allowUpload: true,
  maxFileSize: 10,
  allowedFileTypes: ['image', 'document']
})

const securitySettings = reactive({
  enableLoginLimit: true,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  passwordPolicy: {
    requireMixedCase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    minLength: 8
  },
  sessionTimeout: 120,
  enableIpWhitelist: false,
  ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
})

const notificationSettings = reactive({
  email: {
    enabled: true,
    smtpHost: 'smtp.exmail.qq.com',
    smtpPort: 587,
    fromEmail: 'noreply@company.com',
    password: ''
  },
  sms: {
    enabled: false,
    provider: 'aliyun',
    accessKey: '',
    secretKey: ''
  },
  webhook: {
    enabled: false,
    url: '',
    secret: ''
  }
})

const storageSettings = reactive({
  type: 'local',
  accessKey: '',
  secretKey: '',
  bucket: '',
  region: '',
  customDomain: ''
})

const beforeLogoUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  
  // 模拟上传成功
  setTimeout(() => {
    basicSettings.siteLogo = URL.createObjectURL(file)
  }, 1000)
  
  return false // 阻止自动上传
}

const addIpAddress = () => {
  if (newIpAddress.value && !securitySettings.ipWhitelist.includes(newIpAddress.value)) {
    securitySettings.ipWhitelist.push(newIpAddress.value)
    newIpAddress.value = ''
  }
}

const removeIpAddress = (index: number) => {
  securitySettings.ipWhitelist.splice(index, 1)
}

const handleSave = () => {
  saveLoading.value = true
  setTimeout(() => {
    saveLoading.value = false
    ElMessage.success('系统设置保存成功')
  }, 1500)
}

const handleClearCache = () => {
  ElMessageBox.confirm('确定要清空系统缓存吗？', '清空缓存', { type: 'warning' })
    .then(() => {
      ElMessage.success('缓存清空成功')
    })
}

const handleSystemBackup = () => {
  ElMessage.info('系统备份功能开发中...')
}

const handleSystemRestart = () => {
  ElMessageBox.confirm('确定要重启系统吗？这将断开所有用户连接。', '重启系统', { type: 'warning' })
    .then(() => {
      ElMessage.success('系统重启指令已发送')
    })
}

const handleTestEmail = () => {
  if (!notificationSettings.email.enabled) {
    ElMessage.warning('请先启用邮件服务')
    return
  }
  ElMessage.success('测试邮件发送成功')
}
</script>

<style scoped>
.system-settings-page {
  padding: 20px;
}

.settings-panels {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-card {
  margin-bottom: 0;
}

.logo-upload {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.logo-uploader .logo {
  width: 120px;
  height: 40px;
  display: block;
  object-fit: contain;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.logo-uploader-icon:hover {
  border-color: #409eff;
  color: #409eff;
}

.logo-tips {
  color: #909399;
  font-size: 12px;
}

.upload-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-limits {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.security-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.limit-config {
  margin-left: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-policy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.policy-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ip-whitelist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.whitelist-config {
  margin-left: 20px;
}

.ip-list {
  margin-top: 12px;
  min-height: 40px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 8px;
}

.email-config,
.sms-config,
.webhook-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.email-settings,
.sms-settings,
.webhook-settings {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-label {
  min-width: 100px;
  color: #606266;
  font-size: 14px;
}

.status-panels {
  position: sticky;
  top: 20px;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 14px;
  color: #606266;
}

.status-value {
  font-weight: 500;
  color: #303133;
}

.quick-actions {
  display: flex;
  flex-direction: column;
}

:deep(.logo-uploader .el-upload) {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}
</style>