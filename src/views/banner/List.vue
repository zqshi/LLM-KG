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
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="editBanner(row)">编辑</el-button>
          <el-button link type="info" @click="viewWorkflow(row)">查看流程</el-button>
          <el-button v-if="canSubmitApproval(row)" link type="warning" @click="submitApproval(row)">
            提交审批
          </el-button>
          <el-button v-if="canPublish(row)" link type="success" @click="publishBanner(row)">
            发布
          </el-button>
          <el-button v-if="canOffline(row)" link type="danger" @click="offlineBanner(row)">
            下线
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, UploadProps } from 'element-plus'

interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  status: string
  creator: string
  createTime: string
  description?: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('创建Banner')
const bannerFormRef = ref<FormInstance>()

const searchForm = reactive({
  title: '',
  status: ''
})

const bannerForm = reactive({
  id: 0,
  title: '',
  imageUrl: '',
  linkUrl: '',
  timeRange: [] as string[],
  description: ''
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

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '',
    pending: 'warning',
    reviewing: 'info',
    approved: 'success',
    rejected: 'danger',
    published: 'success',
    offline: 'info'
  }
  return statusMap[status] || ''
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: '草稿',
    pending: '待审批',
    reviewing: '审批中',
    approved: '已通过',
    rejected: '已拒绝',
    published: '已发布',
    offline: '已下线'
  }
  return statusMap[status] || status
}

const formatDateRange = (start: string, end: string) => {
  return `${start} ~ ${end}`
}

const canSubmitApproval = (banner: Banner) => {
  return ['draft', 'rejected'].includes(banner.status)
}

const canPublish = (banner: Banner) => {
  return banner.status === 'approved'
}

const canOffline = (banner: Banner) => {
  return banner.status === 'published'
}

const createBanner = () => {
  dialogTitle.value = '创建Banner'
  Object.assign(bannerForm, {
    id: 0,
    title: '',
    imageUrl: '',
    linkUrl: '',
    timeRange: [],
    description: ''
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
    timeRange: [banner.startTime, banner.endTime],
    description: banner.description || ''
  })
  dialogVisible.value = true
}

const handleUploadSuccess: UploadProps['onSuccess'] = (response) => {
  bannerForm.imageUrl = response.data.url
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
  
  await bannerFormRef.value.validate((valid) => {
    if (valid) {
      const data = {
        ...bannerForm,
        startTime: bannerForm.timeRange[0],
        endTime: bannerForm.timeRange[1]
      }
      
      console.log('保存Banner数据:', data)
      ElMessage.success('Banner保存成功')
      dialogVisible.value = false
      fetchBannerList()
    }
  })
}

const viewWorkflow = (banner: Banner) => {
  console.log('查看审批流程:', banner)
}

const submitApproval = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要提交审批吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('提交审批:', banner)
    ElMessage.success('提交审批成功')
    fetchBannerList()
  } catch {
    
  }
}

const publishBanner = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要发布这个Banner吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('发布Banner:', banner)
    ElMessage.success('Banner发布成功')
    fetchBannerList()
  } catch {
    
  }
}

const offlineBanner = async (banner: Banner) => {
  try {
    await ElMessageBox.confirm('确定要下线这个Banner吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('下线Banner:', banner)
    ElMessage.success('Banner下线成功')
    fetchBannerList()
  } catch {
    
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
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
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
  } catch (error) {
    ElMessage.error('获取Banner列表失败')
  } finally {
    loading.value = false
  }
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
</style>