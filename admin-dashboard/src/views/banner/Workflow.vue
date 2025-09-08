<template>
  <div class="workflow-config">
    <UnifiedPageHeader 
      title="Banner审批流配置" 
      description="配置和管理Banner审批流程，设定审批节点和角色"
    >
      <template #actions>
        <el-button type="primary" @click="createWorkflow">
          <el-icon><Plus /></el-icon>
          创建审批流
        </el-button>
      </template>
    </UnifiedPageHeader>

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="流程名称:">
          <el-input v-model="searchForm.name" placeholder="请输入流程名称" clearable />
        </el-form-item>
        <el-form-item label="状态:">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="workflowList" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="流程名称" min-width="200" />
      <el-table-column prop="type" label="审批类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.type === 'serial' ? 'primary' : 'success'">
            {{ row.type === 'serial' ? '串行审批' : '并行审批' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="审批节点" min-width="300">
        <template #default="{ row }">
          <div class="approval-nodes">
            <el-tag 
              v-for="(node, index) in row.nodes" 
              :key="index" 
              size="small" 
              class="node-tag"
            >
              {{ node.name }}({{ node.roleNames.join(', ') }})
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            active-value="active"
            inactive-value="inactive"
            @change="toggleWorkflowStatus(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="editWorkflow(row)">编辑</el-button>
          <el-button link type="info" @click="viewWorkflow(row)">查看</el-button>
          <el-button link type="success" @click="copyWorkflow(row)">复制</el-button>
          <el-button link type="danger" @click="deleteWorkflow(row)">删除</el-button>
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

    <!-- 创建/编辑审批流对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="900px">
      <el-form :model="workflowForm" :rules="rules" ref="workflowFormRef" label-width="120px">
        <el-form-item label="流程名称" prop="name">
          <el-input v-model="workflowForm.name" placeholder="请输入流程名称" />
        </el-form-item>
        
        <el-form-item label="审批类型" prop="type">
          <el-radio-group v-model="workflowForm.type">
            <el-radio label="serial">串行审批（按顺序审批）</el-radio>
            <el-radio label="parallel">并行审批（同时审批）</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="workflowForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入流程描述"
          />
        </el-form-item>

        <el-divider>审批节点配置</el-divider>

        <div class="nodes-config">
          <div 
            v-for="(node, index) in workflowForm.nodes" 
            :key="index" 
            class="node-item"
          >
            <div class="node-header">
              <span class="node-title">节点 {{ index + 1 }}</span>
              <el-button 
                type="danger" 
                size="small" 
                circle 
                @click="removeNode(index)"
                v-if="workflowForm.nodes.length > 1"
              >
                <el-icon><Minus /></el-icon>
              </el-button>
            </div>
            
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item :prop="`nodes.${index}.name`" :rules="nodeRules.name">
                  <template #label>节点名称</template>
                  <el-input v-model="node.name" placeholder="请输入节点名称" />
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item :prop="`nodes.${index}.roleIds`" :rules="nodeRules.roleIds">
                  <template #label>审批角色</template>
                  <el-select 
                    v-model="node.roleIds" 
                    multiple 
                    placeholder="请选择审批角色"
                    style="width: 100%"
                  >
                    <el-option 
                      v-for="role in roleList" 
                      :key="role.id" 
                      :label="role.name" 
                      :value="role.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="审批方式">
                  <el-radio-group v-model="node.approvalType">
                    <el-radio label="any">任意一人通过</el-radio>
                    <el-radio label="all">全部通过</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="超时时间(小时)">
                  <el-input-number 
                    v-model="node.timeoutHours" 
                    :min="1" 
                    :max="720"
                    placeholder="超时时间"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <el-button 
            type="dashed" 
            class="add-node-btn" 
            @click="addNode"
          >
            <el-icon><Plus /></el-icon>
            添加审批节点
          </el-button>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveWorkflow">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 查看审批流对话框 -->
    <el-dialog v-model="viewDialogVisible" title="查看审批流" width="800px">
      <div class="workflow-view">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="流程名称">{{ viewWorkflowData.name }}</el-descriptions-item>
          <el-descriptions-item label="审批类型">
            <el-tag :type="viewWorkflowData.type === 'serial' ? 'primary' : 'success'">
              {{ viewWorkflowData.type === 'serial' ? '串行审批' : '并行审批' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建人">{{ viewWorkflowData.creator }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewWorkflowData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ viewWorkflowData.description }}</el-descriptions-item>
        </el-descriptions>

        <el-divider>审批节点流程图</el-divider>
        
        <div class="workflow-diagram">
          <div class="start-node">开始</div>
          <div 
            v-for="(node, index) in viewWorkflowData.nodes" 
            :key="index" 
            class="approval-node"
          >
            <div class="node-content">
              <div class="node-name">{{ node.name }}</div>
              <div class="node-roles">{{ node.roleNames?.join(', ') }}</div>
              <div class="node-type">{{ node.approvalType === 'any' ? '任意一人通过' : '全部通过' }}</div>
            </div>
          </div>
          <div class="end-node">结束</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Minus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

interface ApprovalNode {
  name: string
  roleIds: number[]
  roleNames?: string[]
  approvalType: 'any' | 'all'
  timeoutHours: number
}

interface Workflow {
  id: number
  name: string
  type: 'serial' | 'parallel'
  status: 'active' | 'inactive'
  nodes: ApprovalNode[]
  creator: string
  createTime: string
  description?: string
}

interface Role {
  id: number
  name: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const viewDialogVisible = ref(false)
const dialogTitle = ref('创建审批流')
const workflowFormRef = ref<FormInstance>()

const searchForm = reactive({
  name: '',
  status: ''
})

const workflowForm = reactive({
  id: 0,
  name: '',
  type: 'serial' as 'serial' | 'parallel',
  nodes: [] as ApprovalNode[],
  description: ''
})

const viewWorkflowData = ref<Workflow>({} as Workflow)

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const workflowList = ref<Workflow[]>([])
const roleList = ref<Role[]>([])

const rules = {
  name: [{ required: true, message: '请输入流程名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择审批类型', trigger: 'change' }]
}

const nodeRules = {
  name: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择审批角色', trigger: 'change' }]
}

const createWorkflow = () => {
  dialogTitle.value = '创建审批流'
  Object.assign(workflowForm, {
    id: 0,
    name: '',
    type: 'serial',
    nodes: [{
      name: '初审',
      roleIds: [],
      approvalType: 'any',
      timeoutHours: 24
    }],
    description: ''
  })
  dialogVisible.value = true
}

const editWorkflow = (workflow: Workflow) => {
  dialogTitle.value = '编辑审批流'
  Object.assign(workflowForm, {
    id: workflow.id,
    name: workflow.name,
    type: workflow.type,
    nodes: workflow.nodes.map(node => ({ ...node })),
    description: workflow.description || ''
  })
  dialogVisible.value = true
}

const viewWorkflow = (workflow: Workflow) => {
  viewWorkflowData.value = workflow
  viewDialogVisible.value = true
}

const copyWorkflow = (workflow: Workflow) => {
  dialogTitle.value = '复制审批流'
  Object.assign(workflowForm, {
    id: 0,
    name: workflow.name + ' - 副本',
    type: workflow.type,
    nodes: workflow.nodes.map(node => ({ ...node })),
    description: workflow.description || ''
  })
  dialogVisible.value = true
}

const deleteWorkflow = async (workflow: Workflow) => {
  try {
    await ElMessageBox.confirm('确定要删除这个审批流吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    console.log('删除审批流:', workflow)
    ElMessage.success('删除成功')
    fetchWorkflowList()
  } catch {
    
  }
}

const toggleWorkflowStatus = (workflow: Workflow) => {
  console.log('切换状态:', workflow)
  ElMessage.success(`已${workflow.status === 'active' ? '启用' : '禁用'}审批流`)
}

const addNode = () => {
  workflowForm.nodes.push({
    name: '',
    roleIds: [],
    approvalType: 'any',
    timeoutHours: 24
  })
}

const removeNode = (index: number) => {
  workflowForm.nodes.splice(index, 1)
}

const saveWorkflow = async () => {
  if (!workflowFormRef.value) return
  
  await workflowFormRef.value.validate((valid) => {
    if (valid) {
      console.log('保存审批流数据:', workflowForm)
      ElMessage.success('审批流保存成功')
      dialogVisible.value = false
      fetchWorkflowList()
    }
  })
}

const handleSearch = () => {
  pagination.currentPage = 1
  fetchWorkflowList()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    name: '',
    status: ''
  })
  handleSearch()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchWorkflowList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchWorkflowList()
}

const fetchRoleList = async () => {
  try {
    // 模拟API调用
    const mockRoles: Role[] = [
      { id: 1, name: '部门主管' },
      { id: 2, name: '运营总监' },
      { id: 3, name: '市场总监' },
      { id: 4, name: '总经理' },
      { id: 5, name: 'CEO' }
    ]
    
    roleList.value = mockRoles
  } catch (error) {
    ElMessage.error('获取角色列表失败')
  }
}

const fetchWorkflowList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData: Workflow[] = [
      {
        id: 1,
        name: 'Banner标准审批流',
        type: 'serial',
        status: 'active',
        nodes: [
          {
            name: '初审',
            roleIds: [1],
            roleNames: ['部门主管'],
            approvalType: 'any',
            timeoutHours: 24
          },
          {
            name: '终审',
            roleIds: [2],
            roleNames: ['运营总监'],
            approvalType: 'any',
            timeoutHours: 48
          }
        ],
        creator: '管理员',
        createTime: '2024-01-15 10:00:00',
        description: '普通Banner的标准审批流程'
      },
      {
        id: 2,
        name: '重要Banner审批流',
        type: 'parallel',
        status: 'active',
        nodes: [
          {
            name: '多部门审核',
            roleIds: [2, 3],
            roleNames: ['运营总监', '市场总监'],
            approvalType: 'all',
            timeoutHours: 48
          },
          {
            name: '最终审批',
            roleIds: [4],
            roleNames: ['总经理'],
            approvalType: 'any',
            timeoutHours: 72
          }
        ],
        creator: '管理员',
        createTime: '2024-01-20 14:30:00',
        description: '重要活动Banner的高级审批流程'
      }
    ]
    
    workflowList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('获取审批流列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoleList()
  fetchWorkflowList()
})
</script>

<style scoped>
.workflow-config {
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

.approval-nodes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.node-tag {
  margin: 2px;
}

.nodes-config {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 20px;
}

.node-item {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 15px;
  background: #f9f9f9;
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.node-title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

.add-node-btn {
  width: 100%;
  height: 60px;
  border-style: dashed;
  color: #409eff;
}

.workflow-view {
  padding: 10px;
}

.workflow-diagram {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  overflow-x: auto;
}

.start-node, .end-node {
  padding: 10px 20px;
  background: #67c23a;
  color: white;
  border-radius: 20px;
  font-weight: bold;
  white-space: nowrap;
}

.end-node {
  background: #909399;
}

.approval-node {
  min-width: 150px;
  padding: 15px;
  background: white;
  border: 2px solid #409eff;
  border-radius: 8px;
  text-align: center;
  position: relative;
}

.approval-node::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  border-right: 10px solid #409eff;
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.node-name {
  font-weight: bold;
  color: #303133;
}

.node-roles {
  font-size: 12px;
  color: #606266;
}

.node-type {
  font-size: 12px;
  color: #909399;
}
</style>