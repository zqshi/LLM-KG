<template>
  <div class="version-control">
    <UnifiedPageHeader
      title="版本管理"
      description="管理门户配置的版本历史，支持版本对比、回滚和快照创建"
    >
      <template #actions>
        <el-button type="primary" @click="showSnapshotDialog = true">
          <el-icon><Camera /></el-icon>
          创建快照
        </el-button>
      </template>
    </UnifiedPageHeader>

    <ContentCard title="版本历史">
      <template #extra>
        <el-button type="text" @click="refreshVersions">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>

      <el-table :data="versions" v-loading="loading">
          <el-table-column prop="version_number" label="版本号" width="120">
            <template #default="{ row }">
              <el-tag type="primary">{{ row.version_number }}</el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="版本名称" min-width="200" />
          
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getTypeColor(row.type)">
                {{ getTypeName(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="created_by" label="创建者" width="120" />
          
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="previewVersion(row)">预览</el-button>
              <el-button size="small" type="success" @click="rollbackVersion(row)">回滚</el-button>
              <el-button size="small" type="danger" @click="deleteVersion(row)">删除</el-button>
            </template>
          </el-table-column>
      </el-table>
    </ContentCard>

    <!-- 快照创建对话框 -->
    <el-dialog v-model="showSnapshotDialog" title="创建配置快照" width="500px">
      <el-form :model="snapshotForm" label-width="80px">
        <el-form-item label="快照名称">
          <el-input v-model="snapshotForm.name" placeholder="请输入快照名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="snapshotForm.description" 
            type="textarea" 
            placeholder="请输入快照描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showSnapshotDialog = false">取消</el-button>
        <el-button type="primary" @click="createSnapshot">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Camera, Refresh } from '@element-plus/icons-vue'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import ContentCard from '@/components/common/ContentCard.vue'

// 响应式数据
const loading = ref(false)
const showSnapshotDialog = ref(false)
const versions = ref([
  {
    id: 1,
    version_number: 'v1.0.0',
    name: '初始版本',
    type: 'manual',
    created_by: 'admin',
    created_at: '2024-01-01 10:00:00',
    description: '系统初始配置版本'
  },
  {
    id: 2,
    version_number: 'v1.1.0',
    name: '导航优化版本',
    type: 'release',
    created_by: 'admin',
    created_at: '2024-01-15 14:30:00',
    description: '优化导航菜单结构和样式'
  }
])

const snapshotForm = ref({
  name: '',
  description: ''
})

// 生命周期
onMounted(() => {
  fetchVersions()
})

// 方法
const fetchVersions = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('版本数据加载完成')
  } catch (error) {
    console.error('获取版本数据失败:', error)
    ElMessage.error('获取版本数据失败')
  } finally {
    loading.value = false
  }
}

const refreshVersions = () => {
  fetchVersions()
}

const previewVersion = (version: any) => {
  ElMessage.info(`预览版本: ${version.name}`)
}

const rollbackVersion = async (version: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要回滚到版本 "${version.name}" 吗？此操作将覆盖当前配置。`,
      '确认回滚',
      {
        type: 'warning',
        confirmButtonText: '确定回滚',
        cancelButtonText: '取消'
      }
    )
    
    ElMessage.success(`已回滚到版本: ${version.name}`)
  } catch {
    // 用户取消
  }
}

const deleteVersion = async (version: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除版本 "${version.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }
    )
    
    ElMessage.success(`已删除版本: ${version.name}`)
  } catch {
    // 用户取消
  }
}

const createSnapshot = () => {
  if (!snapshotForm.value.name) {
    ElMessage.warning('请输入快照名称')
    return
  }
  
  ElMessage.success('快照创建成功')
  showSnapshotDialog.value = false
  snapshotForm.value = { name: '', description: '' }
  fetchVersions()
}

const getTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    manual: '手动',
    auto: '自动',
    release: '发布'
  }
  return typeMap[type] || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    manual: 'primary',
    auto: 'success',
    release: 'warning'
  }
  return colorMap[type] || 'info'
}

const formatDate = (dateStr: string) => {
  return dateStr
}
</script>

<style lang="scss" scoped>
.version-control {
  padding: 20px;
}
</style>