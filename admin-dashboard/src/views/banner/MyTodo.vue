<template>
  <div class="my-todo">
    <UnifiedPageHeader 
      title="我的待办" 
      description="查看和处理我需要审批的Banner项目"
    >
      <template #actions>
        <div class="stats">
          <el-statistic title="待处理数量" :value="todoStats.pending" />
          <el-statistic title="今日已处理" :value="todoStats.todayProcessed" />
        </div>
      </template>
    </UnifiedPageHeader>

    <div class="filter-bar">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="紧急程度:">
          <el-select v-model="filterForm.priority" placeholder="请选择紧急程度" clearable>
            <el-option label="紧急" value="high" />
            <el-option label="普通" value="normal" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="Banner类型:">
          <el-select v-model="filterForm.bannerType" placeholder="请选择Banner类型" clearable>
            <el-option label="活动Banner" value="activity" />
            <el-option label="产品Banner" value="product" />
            <el-option label="公告Banner" value="notice" />
          </el-select>
        </el-form-item>
        <el-form-item label="提交时间:">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">筛选</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="todo-list">
      <el-card 
        v-for="item in todoList" 
        :key="item.id" 
        class="todo-item" 
        :class="{ 'urgent': item.priority === 'high' }"
        shadow="hover"
      >
        <div class="todo-header">
          <div class="title-section">
            <h3 class="todo-title">{{ item.bannerTitle }}</h3>
            <div class="tags">
              <el-tag 
                :type="getPriorityType(item.priority)" 
                size="small"
              >
                {{ getPriorityText(item.priority) }}
              </el-tag>
              <el-tag 
                type="info" 
                size="small"
              >
                {{ item.currentNode }}
              </el-tag>
            </div>
          </div>
          <div class="time-info">
            <div class="submit-time">提交时间：{{ item.submitTime }}</div>
            <div class="timeout-warning" v-if="item.isTimeout">
              <el-icon color="#F56C6C"><Warning /></el-icon>
              已超时 {{ item.timeoutHours }} 小时
            </div>
            <div class="remaining-time" v-else>
              剩余时间：{{ item.remainingHours }} 小时
            </div>
          </div>
        </div>

        <div class="todo-content">
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="banner-preview">
                <el-image
                  :src="item.bannerImageUrl"
                  fit="cover"
                  style="width: 100%; height: 80px"
                  :preview-src-list="[item.bannerImageUrl]"
                  preview-teleported
                />
              </div>
            </el-col>
            <el-col :span="18">
              <div class="details">
                <p><strong>跳转链接：</strong>{{ item.linkUrl }}</p>
                <p><strong>生效时间：</strong>{{ item.startTime }} ~ {{ item.endTime }}</p>
                <p><strong>提交人：</strong>{{ item.submitter }}</p>
                <p><strong>申请说明：</strong>{{ item.description || '无' }}</p>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="todo-actions">
          <div class="action-buttons">
            <el-button type="success" @click="approveTodo(item)">
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button type="danger" @click="rejectTodo(item)">
              <el-icon><Close /></el-icon>
              拒绝
            </el-button>
            <el-button type="info" @click="viewHistory(item)">
              <el-icon><Clock /></el-icon>
              查看历史
            </el-button>
            <el-button type="warning" @click="delegateApproval(item)">
              <el-icon><User /></el-icon>
              委派
            </el-button>
          </div>
        </div>
      </el-card>

      <el-empty v-if="todoList.length === 0" description="暂无待办事项" />
    </div>

    <div class="pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 拒绝原因对话框 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝审批" width="500px">
      <el-form :model="rejectForm" :rules="rejectRules" ref="rejectFormRef" label-width="80px">
        <el-form-item label="拒绝原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="4"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 委派对话框 -->
    <el-dialog v-model="delegateDialogVisible" title="委派审批" width="500px">
      <el-form :model="delegateForm" :rules="delegateRules" ref="delegateFormRef" label-width="80px">
        <el-form-item label="委派给" prop="userId">
          <el-select v-model="delegateForm.userId" placeholder="请选择委派对象" style="width: 100%">
            <el-option 
              v-for="user in userList" 
              :key="user.id" 
              :label="user.name" 
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="委派说明" prop="note">
          <el-input
            v-model="delegateForm.note"
            type="textarea"
            :rows="3"
            placeholder="请输入委派说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="delegateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmDelegate">确认委派</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审批历史对话框 -->
    <el-dialog v-model="historyDialogVisible" title="审批历史" width="800px">
      <el-timeline>
        <el-timeline-item
          v-for="(record, index) in approvalHistory"
          :key="index"
          :timestamp="record.time"
          :type="getHistoryType(record.action)"
        >
          <div class="history-item">
            <div class="history-header">
              <span class="action">{{ getActionText(record.action) }}</span>
              <span class="operator">{{ record.operator }}</span>
            </div>
            <div class="history-content" v-if="record.comment">
              {{ record.comment }}
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Clock, User, Warning } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

interface TodoItem {
  id: number
  bannerTitle: string
  bannerImageUrl: string
  linkUrl: string
  startTime: string
  endTime: string
  submitter: string
  submitTime: string
  currentNode: string
  priority: 'high' | 'normal' | 'low'
  bannerType: string
  description?: string
  isTimeout: boolean
  timeoutHours?: number
  remainingHours?: number
}

interface ApprovalRecord {
  time: string
  operator: string
  action: 'submit' | 'approve' | 'reject' | 'delegate'
  comment?: string
}

interface User {
  id: number
  name: string
  department: string
}

const rejectDialogVisible = ref(false)
const delegateDialogVisible = ref(false)
const historyDialogVisible = ref(false)
const rejectFormRef = ref<FormInstance>()
const delegateFormRef = ref<FormInstance>()

const filterForm = reactive({
  priority: '',
  bannerType: '',
  dateRange: [] as string[]
})

const rejectForm = reactive({
  reason: '',
  todoId: 0
})

const delegateForm = reactive({
  userId: 0,
  note: '',
  todoId: 0
})

const todoStats = reactive({
  pending: 0,
  todayProcessed: 0
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const todoList = ref<TodoItem[]>([])
const userList = ref<User[]>([])
const approvalHistory = ref<ApprovalRecord[]>([])

const rejectRules = {
  reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
}

const delegateRules = {
  userId: [{ required: true, message: '请选择委派对象', trigger: 'change' }],
  note: [{ required: true, message: '请输入委派说明', trigger: 'blur' }]
}

const getPriorityType = (priority: string) => {
  const typeMap: Record<string, string> = {
    high: 'danger',
    normal: 'warning',
    low: 'info'
  }
  return typeMap[priority] || ''
}

const getPriorityText = (priority: string) => {
  const textMap: Record<string, string> = {
    high: '紧急',
    normal: '普通',
    low: '低'
  }
  return textMap[priority] || priority
}

const getHistoryType = (action: string) => {
  const typeMap: Record<string, any> = {
    submit: 'primary',
    approve: 'success',
    reject: 'danger',
    delegate: 'warning'
  }
  return typeMap[action] || 'primary'
}

const getActionText = (action: string) => {
  const textMap: Record<string, string> = {
    submit: '提交审批',
    approve: '审批通过',
    reject: '审批拒绝',
    delegate: '委派审批'
  }
  return textMap[action] || action
}

const approveTodo = async (item: TodoItem) => {
  try {
    await ElMessageBox.confirm('确定要通过这个Banner审批吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    
    console.log('通过审批:', item)
    ElMessage.success('审批通过')
    fetchTodoList()
  } catch {
    
  }
}

const rejectTodo = (item: TodoItem) => {
  rejectForm.todoId = item.id
  rejectForm.reason = ''
  rejectDialogVisible.value = true
}

const confirmReject = async () => {
  if (!rejectFormRef.value) return
  
  await rejectFormRef.value.validate((valid) => {
    if (valid) {
      console.log('拒绝审批:', rejectForm)
      ElMessage.success('已拒绝审批')
      rejectDialogVisible.value = false
      fetchTodoList()
    }
  })
}

const delegateApproval = (item: TodoItem) => {
  delegateForm.todoId = item.id
  delegateForm.userId = 0
  delegateForm.note = ''
  delegateDialogVisible.value = true
}

const confirmDelegate = async () => {
  if (!delegateFormRef.value) return
  
  await delegateFormRef.value.validate((valid) => {
    if (valid) {
      console.log('委派审批:', delegateForm)
      ElMessage.success('委派成功')
      delegateDialogVisible.value = false
      fetchTodoList()
    }
  })
}

const viewHistory = async (item: TodoItem) => {
  // 模拟获取审批历史
  approvalHistory.value = [
    {
      time: '2024-03-01 09:00:00',
      operator: '张三',
      action: 'submit',
      comment: '提交Banner审批申请'
    },
    {
      time: '2024-03-01 14:30:00',
      operator: '李四',
      action: 'approve',
      comment: '初审通过，Banner设计符合规范'
    }
  ]
  
  historyDialogVisible.value = true
}

const handleFilter = () => {
  pagination.currentPage = 1
  fetchTodoList()
}

const resetFilter = () => {
  Object.assign(filterForm, {
    priority: '',
    bannerType: '',
    dateRange: []
  })
  handleFilter()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTodoList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  fetchTodoList()
}

const fetchUserList = async () => {
  try {
    // 模拟API调用
    const mockUsers: User[] = [
      { id: 1, name: '王五', department: '运营部' },
      { id: 2, name: '赵六', department: '市场部' },
      { id: 3, name: '孙七', department: '运营部' }
    ]
    
    userList.value = mockUsers
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  }
}

const fetchTodoStats = async () => {
  try {
    // 模拟API调用
    todoStats.pending = 5
    todoStats.todayProcessed = 8
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  }
}

const fetchTodoList = async () => {
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockData: TodoItem[] = [
      {
        id: 1,
        bannerTitle: '春节活动Banner',
        bannerImageUrl: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Spring+Festival',
        linkUrl: 'https://example.com/spring-festival',
        startTime: '2024-02-01 00:00:00',
        endTime: '2024-02-29 23:59:59',
        submitter: '张三',
        submitTime: '2024-02-28 10:00:00',
        currentNode: '运营总监审核',
        priority: 'high',
        bannerType: 'activity',
        description: '春节活动推广Banner，需要尽快上线',
        isTimeout: false,
        remainingHours: 12
      },
      {
        id: 2,
        bannerTitle: '产品发布会Banner',
        bannerImageUrl: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Product+Launch',
        linkUrl: 'https://example.com/product-launch',
        startTime: '2024-03-01 00:00:00',
        endTime: '2024-03-15 23:59:59',
        submitter: '李四',
        submitTime: '2024-02-26 14:30:00',
        currentNode: '市场总监审核',
        priority: 'normal',
        bannerType: 'product',
        description: '新产品发布会宣传Banner',
        isTimeout: true,
        timeoutHours: 6
      },
      {
        id: 3,
        bannerTitle: '员工培训通知Banner',
        bannerImageUrl: 'https://via.placeholder.com/800x400/45B7D1/FFFFFF?text=Training',
        linkUrl: 'https://example.com/training',
        startTime: '2024-03-10 00:00:00',
        endTime: '2024-03-20 23:59:59',
        submitter: '王五',
        submitTime: '2024-03-01 09:15:00',
        currentNode: '部门主管审核',
        priority: 'low',
        bannerType: 'notice',
        description: '员工技能培训通知Banner',
        isTimeout: false,
        remainingHours: 36
      }
    ]
    
    todoList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('获取待办列表失败')
  }
}

onMounted(() => {
  fetchUserList()
  fetchTodoStats()
  fetchTodoList()
})
</script>

<style scoped>
.my-todo {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  gap: 40px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.todo-item {
  border-left: 4px solid #409eff;
}

.todo-item.urgent {
  border-left-color: #f56c6c;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.title-section h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.tags {
  display: flex;
  gap: 8px;
}

.time-info {
  text-align: right;
  font-size: 12px;
  color: #909399;
}

.timeout-warning {
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 4px;
}

.remaining-time {
  color: #67c23a;
}

.todo-content {
  margin-bottom: 20px;
}

.banner-preview {
  border-radius: 4px;
  overflow: hidden;
}

.details p {
  margin: 8px 0;
  color: #606266;
}

.details strong {
  color: #303133;
}

.todo-actions {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.history-item {
  padding: 8px 0;
}

.history-header {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: bold;
}

.action {
  color: #409eff;
}

.operator {
  color: #303133;
}

.history-content {
  margin-top: 8px;
  color: #606266;
  padding-left: 12px;
  border-left: 2px solid #e4e7ed;
}
</style>