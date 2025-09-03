<template>
  <div class="banner-list">
    <div class="header">
      <h2>Banner管理</h2>
      <el-button type="primary" @click="createBanner">
        <el-icon><Plus /></el-icon>
        创建Banner
      </el-button>
    </div>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="Banner名称:">
          <el-input v-model="searchForm.title" placeholder="请输入Banner名称" clearable />
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="draft" />
            <el-option label="待审批" value="pending" />
            <el-option label="审批中" value="reviewing" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已发布" value="published" />
            <el-option label="已下线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="bannerList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="Banner预览" width="120">
        <template #default="{ row }">
          <el-image
            :src="row.imageUrl"
            :preview-src-list="[row.imageUrl]"
            fit="cover"
            style="width: 80px; height: 40px"
            preview-teleported
          />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="linkUrl" label="跳转链接" min-width="200" />
      <el-table-column label="生效时间" min-width="160">
        <template #default="{ row }">
          {{ formatDateRange(row.startTime, row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="280" fixed="right">
        <template #default="{ row }">
          <el-button v-if="canEdit(row)" link type="primary" @click="editBanner(row)">编辑</el-button>
          <el-button link type="info" @click="viewWorkflow(row)">查看流程</el-button>
          <el-button v-if="canSubmitApproval(row)" link type="warning" @click="submitApproval(row)">
            提交审核
          </el-button>
          <el-button v-if="canPublish(row)" link type="success" @click="publishBanner(row)">
            发布
          </el-button>
          <el-button v-if="canOffline(row)" link type="danger" @click="offlineBanner(row)">
            下线
          </el-button>
          <el-button v-if="canDelete(row)" link type="danger" @click="deleteBanner(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 查看流程对话框 -->
    <el-dialog v-model="workflowDialogVisible" title="查看Banner审批流程" width="1000px">
      <div class="unified-workflow-container" v-loading="workflowLoading">
        <UnifiedWorkflowViewer
          :workflow-data="currentWorkflowData"
          :banner-info="currentBannerInfo"
          view-mode="auto"
          :show-mode-switch="true"
          :show-banner-info="true"
        />
      </div>
    </el-dialog>

    <!-- 创建/编辑Banner对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="bannerForm" :rules="rules" ref="bannerFormRef" label-width="100px">
        <el-form-item label="Banner标题" prop="title">
          <el-input v-model="bannerForm.title" placeholder="请输入Banner标题" />
        </el-form-item>
        
        <el-form-item label="Banner图片" prop="imageUrl">
          <el-upload
            class="banner-upload"
            :action="uploadAction"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
          >
            <img v-if="bannerForm.imageUrl" :src="bannerForm.imageUrl" class="banner-preview" />
            <el-icon v-else class="banner-upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="跳转链接" prop="linkUrl">
          <el-input v-model="bannerForm.linkUrl" placeholder="请输入跳转链接" />
        </el-form-item>

        <el-form-item label="生效时间" prop="timeRange">
          <el-date-picker
            v-model="bannerForm.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="bannerForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入Banner描述"
          />
        </el-form-item>

        <!-- 审核配置部分 -->
        <el-divider content-position="left">审核配置</el-divider>
        
        <el-form-item>
          <el-checkbox v-model="bannerForm.auditOptions.submitForAuditImmediately">
            创建后立即提交审核
          </el-checkbox>
        </el-form-item>

        <div v-if="bannerForm.auditOptions.submitForAuditImmediately">
          <ApprovalConfigPanel 
            :banner-data="{
              title: bannerForm.title,
              imageUrl: bannerForm.imageUrl,
              linkUrl: bannerForm.linkUrl,
              description: bannerForm.description
            }"
            :initial-config="bannerForm.auditOptions.approvalConfig"
            @config-change="handleApprovalConfigChange"
            @ready="handleApprovalConfigReady"
          />
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBanner">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, SuccessFilled, CircleCloseFilled, Loading } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps } from 'element-plus'
import { bannerApi, bannerStatusUtils, type Banner, type BannerForm, type BannerQueryParams } from '@/api/banner'
import { useAuthStore } from '@/stores/auth'
import UnifiedWorkflowViewer from '@/components/workflow/UnifiedWorkflowViewer.vue'
import ApprovalConfigPanel from '@/components/ApprovalConfigPanel.vue'
import type { WorkflowData, BannerInfo } from '@/components/workflow/UnifiedWorkflowViewer.vue'

// 使用用户信息
const authStore = useAuthStore()

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('创建Banner')
const bannerFormRef = ref<FormInstance>()

// 工作流对话框相关
const workflowDialogVisible = ref(false)
const workflowLoading = ref(false)
const currentBanner = ref<Banner | null>(null)

// 工作流步骤接口定义
interface WorkflowStep {
  id: number
  name: string
  status: 'pending' | 'processing' | 'approved' | 'rejected'
  approver?: string
  processTime?: string
  comment?: string
  duration?: string
}

const workflowSteps = ref<WorkflowStep[]>([])

const searchForm = reactive<BannerQueryParams>({
  title: '',
  status: undefined
})

const bannerForm = reactive<BannerForm & { id?: number, timeRange: string[] }>({
  id: 0,
  title: '',
  imageUrl: '',
  linkUrl: '',
  startTime: '',
  endTime: '',
  timeRange: [] as string[],
  description: '',
  auditOptions: {
    submitForAuditImmediately: false,
    priority: 'normal' as 'high' | 'normal' | 'low',
    metadata: {},
    approvalConfig: null,
    approvalReady: false
  }
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const bannerList = ref<Banner[]>([])

const uploadAction = '/api/upload'

const rules = {
  title: [{ required: true, message: '请输入Banner标题', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传Banner图片', trigger: 'change' }],
  linkUrl: [{ required: true, message: '请输入跳转链接', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择生效时间', trigger: 'change' }]
}

const getStatusType = bannerStatusUtils.getStatusType
const getStatusText = bannerStatusUtils.getStatusText

const formatDateRange = (start: string, end: string) => {
  return `${start} ~ ${end}`
}

const canSubmitApproval = (banner: Banner) => {
  return bannerStatusUtils.canSubmitAudit(banner.status)
}

const canPublish = (banner: Banner) => {
  return bannerStatusUtils.canPublish(banner.status)
}

const canOffline = (banner: Banner) => {
  return bannerStatusUtils.canOffline(banner.status)
}

const canEdit = (banner: Banner) => {
  return bannerStatusUtils.canEdit(banner.status)
}

const canDelete = (banner: Banner) => {
  return bannerStatusUtils.canDelete(banner.status)
}

// 转换为统一工作流组件所需的数据格式
const currentWorkflowData = computed((): WorkflowData => {
  if (!workflowSteps.value.length) {
    return { steps: [] }
  }

  const steps = workflowSteps.value.map(step => ({
    id: step.id,
    name: step.name,
    status: step.status as 'pending' | 'processing' | 'approved' | 'rejected',
    approvers: step.approver ? [step.approver] : [],
    processTime: step.processTime,
    comment: step.comment,
    duration: step.duration
  }))

  // 模拟操作历史数据
  const operationHistory = steps
    .filter(step => step.status !== 'pending')
    .map(step => ({
      time: step.processTime || '',
      operator: step.approvers[0] || '系统',
      action: step.status === 'approved' ? 'approve' as const : 
              step.status === 'rejected' ? 'reject' as const : 'submit' as const,
      comment: step.comment,
      node: step.name,
      duration: step.duration
    }))

  return {
    steps,
    operationHistory
  }
})

const currentBannerInfo = computed((): BannerInfo | undefined => {
  if (!currentBanner.value) return undefined

  return {
    id: currentBanner.value.id,
    title: currentBanner.value.title,
    imageUrl: currentBanner.value.imageUrl,
    linkUrl: currentBanner.value.linkUrl,
    startTime: currentBanner.value.startTime,
    endTime: currentBanner.value.endTime,
    status: currentBanner.value.status,
    description: currentBanner.value.description,
    creator: currentBanner.value.creator,
    createTime: currentBanner.value.createTime
  }
})

const createBanner = () => {
  dialogTitle.value = '创建Banner'
  Object.assign(bannerForm, {
    id: 0,
    title: '',
    imageUrl: '',
    linkUrl: '',
    startTime: '',
    endTime: '',
    timeRange: [],
    description: '',
    auditOptions: {
      submitForAuditImmediately: false,
      priority: 'normal' as 'high' | 'normal' | 'low',
      metadata: {},
      approvalConfig: null,
      approvalReady: false
    }
  })
  dialogVisible.value = true
}

const editBanner = (banner: Banner) => {
  dialogTitle.value = '编辑Banner'
  Object.assign(bannerForm, {
    id: banner.id,
    title: banner.title,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl,
    startTime: banner.startTime,
    endTime: banner.endTime,
    timeRange: [banner.startTime, banner.endTime],
    description: banner.description || '',
    auditOptions: {
      submitForAuditImmediately: false,
      priority: 'normal' as 'high' | 'normal' | 'low',
      metadata: {},
      approvalConfig: null,
      approvalReady: false
    }
  })
  dialogVisible.value = true
}

const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.data && response.data.url) {
    bannerForm.imageUrl = response.data.url
  } else if (response.url) {
    bannerForm.imageUrl = response.url
  }
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

const saveBanner = async () => {
  if (!bannerFormRef.value) return
  
  await bannerFormRef.value.validate(async (valid) => {
    if (valid) {
      // 如果选择了立即提交审核但审批配置未就绪
      if (bannerForm.auditOptions.submitForAuditImmediately && !bannerForm.auditOptions.approvalReady) {
        ElMessage.warning('请完成审批流程配置后再保存')
        return
      }

      try {
        loading.value = true
        
        const data: BannerForm = {
          title: bannerForm.title,
          imageUrl: bannerForm.imageUrl,
          linkUrl: bannerForm.linkUrl,
          startTime: bannerForm.timeRange[0],
          endTime: bannerForm.timeRange[1],
          description: bannerForm.description,
          auditOptions: bannerForm.auditOptions
        }
        
        if (bannerForm.id) {
          // 更新Banner
          await bannerApi.updateBanner(bannerForm.id, data)
          ElMessage.success('Banner更新成功')
        } else {
          // 创建Banner
          await bannerApi.createBanner(data, authStore.user?.id || 0, authStore.user?.name || '')
          if (data.auditOptions?.submitForAuditImmediately) {
            const configMode = bannerForm.auditOptions.approvalConfig?.mode || '默认'
            const stepsCount = bannerForm.auditOptions.approvalConfig?.preview?.length || 0
            ElMessage.success(`Banner创建成功，已提交审核（${configMode}模式，${stepsCount}个审批节点）`)
          } else {
            ElMessage.success('Banner创建成功')
          }
        }
        
        dialogVisible.value = false
        fetchBannerList()
      } catch (error) {
        console.error('保存Banner失败:', error)
        ElMessage.error('保存Banner失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const viewWorkflow = async (banner: Banner) => {
  currentBanner.value = banner
  workflowDialogVisible.value = true
  workflowLoading.value = true
  
  try {
    // 模拟API调用获取工作流数据
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 根据Banner状态生成相应的工作流步骤
    const steps: WorkflowStep[] = []
    
    if (banner.status === 'draft') {
      steps.push({
        id: 1,
        name: '提交审核',
        status: 'pending'
      })
    } else if (banner.status === 'pending') {
      steps.push({
        id: 1,
        name: '提交审核',
        status: 'approved',
        approver: banner.creator,
        processTime: banner.createTime,
        comment: '已提交审核'
      })
      steps.push({
        id: 2,
        name: '初审',
        status: 'processing',
        processTime: new Date().toLocaleString()
      })
    } else if (banner.status === 'reviewing') {
      steps.push({
        id: 1,
        name: '提交审核',
        status: 'approved',
        approver: banner.creator,
        processTime: banner.createTime,
        comment: '已提交审核'
      })
      steps.push({
        id: 2,
        name: '初审',
        status: 'processing',
        approver: '部门主管',
        processTime: new Date().toLocaleString()
      })
    } else if (banner.status === 'approved') {
      steps.push({
        id: 1,
        name: '提交审核',
        status: 'approved',
        approver: banner.creator,
        processTime: banner.createTime,
        comment: '已提交审核'
      })
      steps.push({
        id: 2,
        name: '初审',
        status: 'approved',
        approver: '部门主管',
        processTime: '2024-01-20 10:30:00',
        comment: '内容合规，通过审核'
      })
      steps.push({
        id: 3,
        name: '终审',
        status: 'approved',
        approver: '运营总监',
        processTime: '2024-01-20 14:15:00',
        comment: '审核通过，可以发布'
      })
    } else if (banner.status === 'rejected') {
      steps.push({
        id: 1,
        name: '提交审核',
        status: 'approved',
        approver: banner.creator,
        processTime: banner.createTime,
        comment: '已提交审核'
      })
      steps.push({
        id: 2,
        name: '初审',
        status: 'rejected',
        approver: '部门主管',
        processTime: '2024-01-20 10:30:00',
        comment: '图片质量不符合要求，请重新制作'
      })
    } else if (banner.status === 'published') {
      steps.push({
        id: 1,
        name: '提交审核',
        status: 'approved',
        approver: banner.creator,
        processTime: banner.createTime,
        comment: '已提交审核'
      })
      steps.push({
        id: 2,
        name: '初审',
        status: 'approved',
        approver: '部门主管',
        processTime: '2024-01-20 10:30:00',
        comment: '内容合规，通过审核'
      })
      steps.push({
        id: 3,
        name: '终审',
        status: 'approved',
        approver: '运营总监',
        processTime: '2024-01-20 14:15:00',
        comment: '审核通过，可以发布'
      })
      steps.push({
        id: 4,
        name: '发布上线',
        status: 'approved',
        approver: '系统',
        processTime: '2024-01-20 15:00:00',
        comment: '已发布上线'
      })
    }
    
    workflowSteps.value = steps
  } catch (error) {
    console.error('获取工作流数据失败:', error)
    ElMessage.error('获取工作流数据失败')
  } finally {
    workflowLoading.value = false
  }
}

const submitApproval = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要提交审核吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await bannerApi.submitForAudit(banner.id, authStore.user?.id || 0, authStore.user?.name || '')
    ElMessage.success('提交审核成功')
    fetchBannerList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交审核失败:', error)
      ElMessage.error('提交审核失败')
    }
  } finally {
    loading.value = false
  }
}

const publishBanner = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要发布这个Banner吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await bannerApi.publishBanner(banner.id)
    ElMessage.success('Banner发布成功')
    fetchBannerList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布Banner失败:', error)
      ElMessage.error('发布Banner失败')
    }
  } finally {
    loading.value = false
  }
}

const offlineBanner = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要下线这个Banner吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await bannerApi.offlineBanner(banner.id)
    ElMessage.success('Banner下线成功')
    fetchBannerList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下线Banner失败:', error)
      ElMessage.error('下线Banner失败')
    }
  } finally {
    loading.value = false
  }
}

const deleteBanner = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要删除这个Banner吗？删除后无法恢复！', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    await bannerApi.deleteBanner(banner.id)
    ElMessage.success('Banner删除成功')
    fetchBannerList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除Banner失败:', error)
      ElMessage.error('删除Banner失败')
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchBannerList()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    title: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchBannerList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchBannerList()
}


const fetchBannerList = async () => {
  loading.value = true
  try {
    const queryParams: BannerQueryParams = {
      ...searchForm,
      page: pagination.currentPage,
      size: pagination.pageSize
    }
    
    const response = await bannerApi.getBanners(queryParams)
    bannerList.value = response.data.data.list
    pagination.total = response.data.data.total
  } catch (error) {
    console.error('获取Banner列表失败:', error)
    ElMessage.error('获取Banner列表失败')
    
    // 如果API调用失败，使用模拟数据作为降级
    const mockData: Banner[] = [
      {
        id: 1,
        title: '春节活动Banner',
        imageUrl: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Spring+Festival',
        linkUrl: 'https://example.com/spring-festival',
        startTime: '2024-02-01 00:00:00',
        endTime: '2024-02-29 23:59:59',
        status: 'published',
        creator: '张三',
        createTime: '2024-01-20 10:00:00',
        description: '春节活动推广Banner'
      },
      {
        id: 2,
        title: '产品发布会Banner',
        imageUrl: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Product+Launch',
        linkUrl: 'https://example.com/product-launch',
        startTime: '2024-03-01 00:00:00',
        endTime: '2024-03-15 23:59:59',
        status: 'approved',
        creator: '李四',
        createTime: '2024-02-25 14:30:00',
        description: '新产品发布会宣传Banner'
      },
      {
        id: 3,
        title: '员工培训Banner',
        imageUrl: 'https://via.placeholder.com/800x400/45B7D1/FFFFFF?text=Training',
        linkUrl: 'https://example.com/training',
        startTime: '2024-03-10 00:00:00',
        endTime: '2024-03-20 23:59:59',
        status: 'reviewing',
        creator: '王五',
        createTime: '2024-03-05 09:15:00',
        description: '员工技能培训Banner'
      }
    ]
    
    bannerList.value = mockData
    pagination.total = mockData.length
  } finally {
    loading.value = false
  }
}

// 处理审批配置变化
const handleApprovalConfigChange = (config: any) => {
  bannerForm.auditOptions.approvalConfig = config
  console.log('审批配置已更新:', config)
}

// 处理审批配置就绪状态
const handleApprovalConfigReady = (isReady: boolean) => {
  bannerForm.auditOptions.approvalReady = isReady
  console.log('审批配置就绪状态:', isReady)
}

onMounted(() => {
  fetchBannerList()
})
</script>

<style scoped>
.banner-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.banner-upload {
  display: inline-block;
}

.banner-preview {
  width: 200px;
  height: 100px;
  object-fit: cover;
  display: block;
  border-radius: 6px;
}

.banner-upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
}

.banner-upload-icon:hover {
  border-color: #409eff;
  color: #409eff;
}

.audit-info {
  margin-top: 10px;
}

.audit-info p {
  margin: 4px 0;
  font-size: 13px;
}

/* 统一工作流容器样式 */
.unified-workflow-container {
  min-height: 300px;
  padding: 4px;
}
</style>