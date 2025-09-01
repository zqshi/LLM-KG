<template>
  <div class="import-export">
    <!-- 导入功能 -->
    <div class="import-section">
      <el-upload
        ref="uploadRef"
        :action="uploadAction"
        :headers="uploadHeaders"
        :data="uploadData"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :on-progress="handleUploadProgress"
        :show-file-list="false"
        :auto-upload="false"
        accept=".xlsx,.xls,.csv"
        class="upload-container"
      >
        <template #trigger>
          <el-button type="primary" :icon="Upload">
            选择文件
          </el-button>
        </template>

        <el-button 
          type="success" 
          @click="handleUpload"
          :loading="uploading"
          :disabled="!selectedFile"
          style="margin-left: 10px"
        >
          开始导入
        </el-button>

        <template #tip>
          <div class="upload-tip">
            <p>支持Excel (.xlsx, .xls) 和 CSV (.csv) 格式</p>
            <el-button type="text" @click="downloadTemplate">
              <el-icon><Download /></el-icon>
              下载模板文件
            </el-button>
          </div>
        </template>
      </el-upload>

      <!-- 文件预览 -->
      <div class="file-preview" v-if="selectedFile">
        <div class="file-info">
          <el-icon><Document /></el-icon>
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
          <el-button 
            type="text" 
            @click="removeFile"
            style="margin-left: 8px"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <!-- 导入配置 -->
        <div class="import-config">
          <el-form :model="importConfig" label-width="120px" size="small">
            <el-form-item label="覆盖模式">
              <el-radio-group v-model="importConfig.mode">
                <el-radio value="append">追加模式</el-radio>
                <el-radio value="update">更新模式</el-radio>
                <el-radio value="replace">替换模式</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="重复处理">
              <el-radio-group v-model="importConfig.duplicateAction">
                <el-radio value="skip">跳过重复</el-radio>
                <el-radio value="update">更新重复</el-radio>
                <el-radio value="error">报错停止</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="数据验证">
              <el-checkbox v-model="importConfig.validateData">启用数据验证</el-checkbox>
              <el-checkbox v-model="importConfig.validateLeader">验证领导信息</el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 导入进度 -->
      <div class="import-progress" v-if="uploading || importResult">
        <el-progress 
          :percentage="uploadProgress" 
          :status="progressStatus"
          :stroke-width="8"
          class="progress-bar"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>

      <!-- 导入结果 -->
      <div class="import-result" v-if="importResult">
        <el-alert
          :title="`导入完成：成功 ${importResult.successCount} 条，失败 ${importResult.errorCount} 条`"
          :type="importResult.errorCount > 0 ? 'warning' : 'success'"
          :closable="false"
          show-icon
        />

        <div class="result-details" v-if="importResult.errors?.length">
          <el-divider>错误详情</el-divider>
          <el-table :data="importResult.errors" size="small" max-height="200">
            <el-table-column prop="row" label="行号" width="80" />
            <el-table-column prop="field" label="字段" width="100" />
            <el-table-column prop="message" label="错误信息" />
          </el-table>
          
          <div class="result-actions">
            <el-button 
              type="primary" 
              size="small"
              @click="downloadErrorReport"
            >
              下载错误报告
            </el-button>
            <el-button 
              type="text" 
              size="small"
              @click="clearResult"
            >
              清除结果
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <el-divider />

    <!-- 导出功能 -->
    <div class="export-section">
      <div class="export-header">
        <h4>数据导出</h4>
        <div class="export-actions">
          <el-button 
            type="primary"
            @click="handleExport('current')"
            :loading="exporting"
          >
            <el-icon><Download /></el-icon>
            导出当前页
          </el-button>
          <el-button 
            type="success"
            @click="handleExport('selected')"
            :loading="exporting"
            :disabled="!selectedIds?.length"
          >
            <el-icon><Download /></el-icon>
            导出选中项 ({{ selectedIds?.length || 0 }})
          </el-button>
          <el-button 
            type="warning"
            @click="showExportDialog = true"
            :loading="exporting"
          >
            <el-icon><Download /></el-icon>
            自定义导出
          </el-button>
        </div>
      </div>

      <div class="export-formats">
        <span class="format-label">导出格式：</span>
        <el-radio-group v-model="exportFormat" size="small">
          <el-radio-button value="xlsx">Excel</el-radio-button>
          <el-radio-button value="csv">CSV</el-radio-button>
          <el-radio-button value="json">JSON</el-radio-button>
          <el-radio-button value="pdf">PDF</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <!-- 自定义导出对话框 -->
    <el-dialog
      v-model="showExportDialog"
      title="自定义导出"
      width="600px"
    >
      <el-form :model="exportConfig" label-width="120px">
        <el-form-item label="导出范围">
          <el-radio-group v-model="exportConfig.scope">
            <el-radio value="all">全部数据</el-radio>
            <el-radio value="filtered">当前筛选结果</el-radio>
            <el-radio value="date_range">指定时间范围</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="时间范围" v-if="exportConfig.scope === 'date_range'">
          <el-date-picker
            v-model="exportConfig.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="导出字段">
          <el-checkbox-group v-model="exportConfig.fields">
            <el-checkbox value="content">名言内容</el-checkbox>
            <el-checkbox value="leader">领导信息</el-checkbox>
            <el-checkbox value="occasion">讲话场合</el-checkbox>
            <el-checkbox value="time">发生时间</el-checkbox>
            <el-checkbox value="background">背景说明</el-checkbox>
            <el-checkbox value="tags">标签</el-checkbox>
            <el-checkbox value="status">状态</el-checkbox>
            <el-checkbox value="stats">统计数据</el-checkbox>
            <el-checkbox value="audit">审核信息</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="数据处理">
          <el-checkbox v-model="exportConfig.includeHtml">包含HTML格式</el-checkbox>
          <el-checkbox v-model="exportConfig.includeHistory">包含历史版本</el-checkbox>
          <el-checkbox v-model="exportConfig.compressFile">压缩文件</el-checkbox>
        </el-form-item>

        <el-form-item label="文件名">
          <el-input 
            v-model="exportConfig.filename" 
            placeholder="导出文件名（不含扩展名）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showExportDialog = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleCustomExport"
          :loading="exporting"
        >
          开始导出
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, 
  Download, 
  Document, 
  Close 
} from '@element-plus/icons-vue'
import { quotationApi } from '@/api'
import { useAuthStore } from '@/stores/auth'

interface ImportConfig {
  mode: 'append' | 'update' | 'replace'
  duplicateAction: 'skip' | 'update' | 'error'
  validateData: boolean
  validateLeader: boolean
}

interface ImportResult {
  successCount: number
  errorCount: number
  errors?: Array<{
    row: number
    field: string
    message: string
  }>
}

interface ExportConfig {
  scope: 'all' | 'filtered' | 'date_range'
  dateRange?: [string, string]
  fields: string[]
  includeHtml: boolean
  includeHistory: boolean
  compressFile: boolean
  filename: string
}

interface Props {
  selectedIds?: number[]
  currentData?: any[]
  filterParams?: any
}

interface Emits {
  (e: 'import-success', result: ImportResult): void
  (e: 'export-success', filename: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

const uploadRef = ref()
const selectedFile = ref<File>()
const uploading = ref(false)
const uploadProgress = ref(0)
const progressStatus = ref<'success' | 'exception' | 'warning' | ''>('')
const progressText = ref('')
const importResult = ref<ImportResult>()
const exporting = ref(false)
const exportFormat = ref<'xlsx' | 'csv' | 'json' | 'pdf'>('xlsx')
const showExportDialog = ref(false)

const importConfig = ref<ImportConfig>({
  mode: 'append',
  duplicateAction: 'skip',
  validateData: true,
  validateLeader: true
})

const exportConfig = ref<ExportConfig>({
  scope: 'all',
  dateRange: undefined,
  fields: ['content', 'leader', 'occasion', 'time', 'status'],
  includeHtml: false,
  includeHistory: false,
  compressFile: false,
  filename: `名言数据_${new Date().toISOString().split('T')[0]}`
})

const uploadAction = computed(() => {
  return '/api/quotation/import'
})

const uploadHeaders = computed(() => {
  return {
    'Authorization': `Bearer ${authStore.token}`
  }
})

const uploadData = computed(() => {
  return {
    config: JSON.stringify(importConfig.value)
  }
})

const beforeUpload = (file: File) => {
  const isValidFormat = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-excel',
                        'text/csv'].includes(file.type)
  if (!isValidFormat) {
    ElMessage.error('只支持 Excel 和 CSV 格式文件')
    return false
  }

  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过 5MB')
    return false
  }

  selectedFile.value = file
  return false // 阻止自动上传
}

const handleUpload = () => {
  if (!selectedFile.value) {
    ElMessage.error('请先选择文件')
    return
  }
  
  uploadRef.value.submit()
}

const handleUploadProgress = (event: any) => {
  uploadProgress.value = Math.round(event.percent)
  progressText.value = `正在上传... ${uploadProgress.value}%`
}

const handleUploadSuccess = (response: any) => {
  uploading.value = false
  progressStatus.value = 'success'
  progressText.value = '导入完成'
  
  if (response.code === 200) {
    importResult.value = response.data
    emit('import-success', response.data)
    ElMessage.success('数据导入成功')
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

const handleUploadError = (error: any) => {
  uploading.value = false
  progressStatus.value = 'exception'
  progressText.value = '导入失败'
  
  console.error('上传错误:', error)
  ElMessage.error('导入失败，请检查文件格式和网络连接')
}

const removeFile = () => {
  selectedFile.value = undefined
  uploadRef.value.clearFiles()
}

const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

const downloadTemplate = async () => {
  try {
    const response = await quotationApi.downloadTemplate()
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '名言导入模板.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('模板文件下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败')
  }
}

const downloadErrorReport = async () => {
  if (!importResult.value?.errors?.length) return

  const errorData = importResult.value.errors
  const csvContent = 'data:text/csv;charset=utf-8,' +
    '行号,字段,错误信息\n' +
    errorData.map(error => `${error.row},${error.field},${error.message}`).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', '导入错误报告.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const clearResult = () => {
  importResult.value = undefined
  uploadProgress.value = 0
  progressStatus.value = ''
  progressText.value = ''
}

const handleExport = async (scope: 'current' | 'selected') => {
  let exportData: any
  let filename = `名言数据_${scope}`

  switch (scope) {
    case 'current':
      exportData = props.currentData || []
      filename += `_当前页_${exportData.length}条`
      break
    case 'selected':
      if (!props.selectedIds?.length) {
        ElMessage.warning('请先选择要导出的数据')
        return
      }
      filename += `_选中_${props.selectedIds.length}条`
      break
  }

  await performExport({
    scope,
    format: exportFormat.value,
    filename,
    data: exportData,
    selectedIds: props.selectedIds
  })
}

const handleCustomExport = async () => {
  await performExport({
    scope: exportConfig.value.scope,
    format: exportFormat.value,
    filename: exportConfig.value.filename,
    config: exportConfig.value,
    filterParams: props.filterParams
  })
  showExportDialog.value = false
}

const performExport = async (params: any) => {
  exporting.value = true
  
  try {
    const response = await quotationApi.exportData(params)
    
    // 创建下载链接
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${params.filename}.${params.format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    emit('export-success', `${params.filename}.${params.format}`)
    ElMessage.success('数据导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  } finally {
    exporting.value = false
  }
}
</script>

<style lang="scss" scoped>
.import-export {
  .import-section {
    .upload-container {
      margin-bottom: 20px;
    }

    .upload-tip {
      color: var(--el-text-color-regular);
      font-size: 14px;

      p {
        margin: 4px 0;
      }
    }

    .file-preview {
      margin: 16px 0;
      padding: 16px;
      background: var(--el-fill-color-lighter);
      border-radius: 8px;

      .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-size: 14px;

        .file-name {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .file-size {
          color: var(--el-text-color-regular);
        }
      }

      .import-config {
        :deep(.el-form-item) {
          margin-bottom: 12px;
        }

        :deep(.el-checkbox) {
          margin-right: 20px;
        }
      }
    }

    .import-progress {
      margin: 16px 0;

      .progress-bar {
        margin-bottom: 8px;
      }

      .progress-text {
        text-align: center;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }

    .import-result {
      margin: 16px 0;

      .result-details {
        margin-top: 16px;

        .result-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
      }
    }
  }

  .export-section {
    .export-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        color: var(--el-text-color-primary);
      }

      .export-actions {
        display: flex;
        gap: 8px;
      }
    }

    .export-formats {
      display: flex;
      align-items: center;
      gap: 12px;

      .format-label {
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
    }
  }
}

@media (max-width: 768px) {
  .import-export {
    .export-section .export-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .export-actions {
        flex-direction: column;

        .el-button {
          width: 100%;
        }
      }
    }

    .export-formats {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }
  }
}
</style>