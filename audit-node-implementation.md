# 审核节点接入实现方案

## 1. 审核节点基类设计

### 基础审核节点类

```typescript
// src/composables/useAuditNode.ts
import { ref, computed } from 'vue'
import { auditTaskApi } from '@/api/audit'
import { useAuditStore } from '@/stores/audit'
import type { 
  AuditConfig, 
  AuditResult, 
  BizType, 
  AuditMode, 
  Priority,
  AssignRule 
} from '@/types'

export interface AuditNodeConfig {
  bizType: BizType
  mode: AuditMode
  sampleRate?: number
  priority: Priority
  assignRule: AssignRule
  autoApprove?: boolean
  sensitiveWordCheck?: boolean
  callbackUrl?: string
}

export interface AuditNodeResult {
  taskId: string
  status: 'approved' | 'rejected' | 'pending'
  reason?: string
  detail?: string
  auditorId?: number
  processTime?: number
}

export function useAuditNode(bizType: BizType) {
  const auditStore = useAuditStore()
  const loading = ref(false)
  const config = ref<AuditNodeConfig | null>(null)

  // 获取审核配置
  const getAuditConfig = async (): Promise<AuditNodeConfig | null> => {
    try {
      const policies = await auditStore.loadPolicies()
      const policy = policies.find(p => p.bizType === bizType && p.isActive)
      
      if (policy) {
        config.value = {
          bizType: policy.bizType,
          mode: policy.mode,
          sampleRate: policy.sampleRate,
          priority: policy.priority,
          assignRule: policy.assignRule,
          autoApprove: policy.mode === 'post',
          sensitiveWordCheck: true,
          callbackUrl: `/api/audit/callback/${bizType}`
        }
        return config.value
      }
      return null
    } catch (error) {
      console.error('获取审核配置失败:', error)
      return null
    }
  }

  // 检查是否需要审核
  const shouldAudit = (content: any, customConfig?: Partial<AuditNodeConfig>): boolean => {
    const auditConfig = customConfig || config.value
    if (!auditConfig) return false

    // 先审后发模式：总是需要审核
    if (auditConfig.mode === 'pre') return true
    
    // 先发后审模式：不需要审核
    if (auditConfig.mode === 'post') return false
    
    // 抽审模式：根据抽样率决定
    if (auditConfig.mode === 'sample') {
      const rate = auditConfig.sampleRate || 0.1
      return Math.random() < rate
    }
    
    return false
  }

  // 提交审核任务
  const submitAuditTask = async (
    content: any, 
    submitterId: number,
    customConfig?: Partial<AuditNodeConfig>
  ): Promise<string | null> => {
    try {
      loading.value = true
      const auditConfig = customConfig || config.value
      
      if (!auditConfig) {
        throw new Error('审核配置未找到')
      }

      const taskData = {
        bizType: auditConfig.bizType,
        bizId: content.id?.toString() || content.bizId,
        content: {
          title: content.title,
          content: content.content || content.description,
          images: content.images || [],
          metadata: {
            module: content.module,
            category: content.category,
            tags: content.tags || [],
            author: content.author
          }
        },
        submitterId
      }

      const response = await auditTaskApi.submitTask(taskData)
      return response.data.taskId
    } catch (error) {
      console.error('提交审核任务失败:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // 查询审核结果
  const getAuditResult = async (bizId: string): Promise<AuditNodeResult | null> => {
    try {
      const response = await auditTaskApi.getResult(bizType, bizId)
      return {
        taskId: response.data.taskId || '',
        status: response.data.status as 'approved' | 'rejected' | 'pending',
        reason: response.data.reason,
        detail: response.data.detail,
        auditorId: response.data.auditorId,
        processTime: response.data.processTime
      }
    } catch (error) {
      console.error('查询审核结果失败:', error)
      return null
    }
  }

  // 处理审核结果回调
  const handleAuditResult = async (
    taskId: string, 
    result: AuditNodeResult,
    onApproved?: (result: AuditNodeResult) => void,
    onRejected?: (result: AuditNodeResult) => void
  ): Promise<void> => {
    try {
      if (result.status === 'approved') {
        onApproved?.(result)
      } else if (result.status === 'rejected') {
        onRejected?.(result)
      }
    } catch (error) {
      console.error('处理审核结果失败:', error)
    }
  }

  // 轮询审核结果
  const pollAuditResult = async (
    bizId: string,
    onResult: (result: AuditNodeResult) => void,
    maxAttempts: number = 30,
    interval: number = 2000
  ): Promise<void> => {
    let attempts = 0
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.warn('审核结果轮询超时')
        return
      }
      
      const result = await getAuditResult(bizId)
      if (result && result.status !== 'pending') {
        onResult(result)
        return
      }
      
      attempts++
      setTimeout(poll, interval)
    }
    
    poll()
  }

  return {
    loading,
    config,
    getAuditConfig,
    shouldAudit,
    submitAuditTask,
    getAuditResult,
    handleAuditResult,
    pollAuditResult
  }
}
```

## 2. 内容管理模块接入实现

### 内容审核节点

```typescript
// src/composables/useContentAuditNode.ts
import { useAuditNode } from './useAuditNode'
import { useContentStore } from '@/stores/content'
import type { Content, BizType } from '@/types'

export function useContentAuditNode() {
  const contentStore = useContentStore()
  const auditNode = useAuditNode('forum_post' as BizType)

  // 内容创建/更新时的审核处理
  const handleContentSubmit = async (
    content: Content,
    submitterId: number,
    isUpdate: boolean = false
  ): Promise<boolean> => {
    try {
      // 获取审核配置
      const config = await auditNode.getAuditConfig()
      if (!config) {
        console.warn('未找到内容审核配置，跳过审核')
        return true
      }

      // 检查是否需要审核
      if (!auditNode.shouldAudit(content, config)) {
        // 不需要审核，直接发布
        if (isUpdate) {
          await contentStore.updateContent(content.id, { status: 2 })
        } else {
          await contentStore.createContent({ ...content, status: 2 })
        }
        return true
      }

      // 需要审核，提交审核任务
      const taskId = await auditNode.submitAuditTask(content, submitterId, config)
      if (!taskId) {
        throw new Error('提交审核任务失败')
      }

      // 设置内容状态为待审核
      if (isUpdate) {
        await contentStore.updateContent(content.id, { status: 1 })
      } else {
        await contentStore.createContent({ ...content, status: 1 })
      }

      // 轮询审核结果
      auditNode.pollAuditResult(
        content.id.toString(),
        (result) => {
          handleAuditResult(content.id, result)
        }
      )

      return true
    } catch (error) {
      console.error('内容审核处理失败:', error)
      return false
    }
  }

  // 处理审核结果
  const handleAuditResult = async (contentId: number, result: any) => {
    try {
      if (result.status === 'approved') {
        // 审核通过，发布内容
        await contentStore.updateContent(contentId, { 
          status: 2,
          publishedAt: new Date().toISOString()
        })
      } else if (result.status === 'rejected') {
        // 审核拒绝，更新状态和拒绝原因
        await contentStore.updateContent(contentId, { 
          status: 3,
          auditReason: result.reason
        })
      }
    } catch (error) {
      console.error('处理内容审核结果失败:', error)
    }
  }

  // 手动审核操作（兼容现有功能）
  const manualAudit = async (
    contentId: number, 
    action: 'approve' | 'reject', 
    reason?: string
  ): Promise<boolean> => {
    try {
      // 直接调用现有的审核接口
      return await contentStore.auditContent(contentId, action, reason)
    } catch (error) {
      console.error('手动审核失败:', error)
      return false
    }
  }

  return {
    ...auditNode,
    handleContentSubmit,
    handleAuditResult,
    manualAudit
  }
}
```

## 3. 资讯聚合管理模块接入实现

### 资讯审核节点

```typescript
// src/composables/useNewsAuditNode.ts
import { useAuditNode } from './useAuditNode'
import type { BizType } from '@/types'

export function useNewsAuditNode() {
  const auditNode = useAuditNode('news' as BizType)

  // 资讯抓取后的审核处理
  const handleNewsSubmit = async (
    newsItem: any,
    submitterId: number
  ): Promise<boolean> => {
    try {
      const config = await auditNode.getAuditConfig()
      if (!config) {
        console.warn('未找到资讯审核配置，跳过审核')
        return true
      }

      // 资讯通常需要审核
      if (!auditNode.shouldAudit(newsItem, config)) {
        return true
      }

      const taskId = await auditNode.submitAuditTask(newsItem, submitterId, config)
      if (!taskId) {
        throw new Error('提交资讯审核任务失败')
      }

      // 轮询审核结果
      auditNode.pollAuditResult(
        newsItem.id.toString(),
        (result) => {
          handleNewsAuditResult(newsItem.id, result)
        }
      )

      return true
    } catch (error) {
      console.error('资讯审核处理失败:', error)
      return false
    }
  }

  // 处理资讯审核结果
  const handleNewsAuditResult = async (newsId: number, result: any) => {
    try {
      // 这里需要调用资讯模块的API来更新状态
      // 具体实现根据资讯模块的API设计
      console.log('资讯审核结果:', newsId, result)
    } catch (error) {
      console.error('处理资讯审核结果失败:', error)
    }
  }

  return {
    ...auditNode,
    handleNewsSubmit,
    handleNewsAuditResult
  }
}
```

## 4. Banner管理模块接入实现

### Banner审核节点

```typescript
// src/composables/useBannerAuditNode.ts
import { useAuditNode } from './useAuditNode'
import type { BizType } from '@/types'

export function useBannerAuditNode() {
  const auditNode = useAuditNode('banner' as BizType)

  // Banner提交审批时的审核处理
  const handleBannerSubmit = async (
    banner: any,
    submitterId: number
  ): Promise<boolean> => {
    try {
      const config = await auditNode.getAuditConfig()
      if (!config) {
        console.warn('未找到Banner审核配置，跳过审核')
        return true
      }

      // Banner通常需要审核
      if (!auditNode.shouldAudit(banner, config)) {
        return true
      }

      const taskId = await auditNode.submitAuditTask(banner, submitterId, config)
      if (!taskId) {
        throw new Error('提交Banner审核任务失败')
      }

      // 轮询审核结果
      auditNode.pollAuditResult(
        banner.id.toString(),
        (result) => {
          handleBannerAuditResult(banner.id, result)
        }
      )

      return true
    } catch (error) {
      console.error('Banner审核处理失败:', error)
      return false
    }
  }

  // 处理Banner审核结果
  const handleBannerAuditResult = async (bannerId: number, result: any) => {
    try {
      // 这里需要调用Banner模块的API来更新状态
      // 具体实现根据Banner模块的API设计
      console.log('Banner审核结果:', bannerId, result)
    } catch (error) {
      console.error('处理Banner审核结果失败:', error)
    }
  }

  return {
    ...auditNode,
    handleBannerSubmit,
    handleBannerAuditResult
  }
}
```

## 5. 在业务模块中的使用示例

### 内容管理模块集成

```vue
<!-- src/views/content/Edit.vue -->
<template>
  <div class="content-edit">
    <!-- 现有内容编辑表单 -->
    <el-form ref="formRef" :model="form" :rules="rules">
      <!-- 表单内容 -->
    </el-form>
    
    <div class="form-actions">
      <el-button @click="handleSave">保存草稿</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        提交审核
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useContentAuditNode } from '@/composables/useContentAuditNode'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const contentAuditNode = useContentAuditNode()
const submitting = ref(false)

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    // 表单验证
    await formRef.value?.validate()
    
    // 提交审核
    const success = await contentAuditNode.handleContentSubmit(
      form.value,
      authStore.currentUser?.id || 0,
      !!form.value.id
    )
    
    if (success) {
      ElMessage.success('提交审核成功')
      // 跳转到列表页面
    } else {
      ElMessage.error('提交审核失败')
    }
  } catch (error) {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>
```

## 6. 配置管理实现

### 审核策略配置组件

```vue
<!-- src/views/audit/components/AuditPolicySettings.vue -->
<template>
  <div class="audit-policy-settings">
    <el-table :data="policyList" v-loading="loading">
      <el-table-column prop="name" label="策略名称" />
      <el-table-column prop="bizType" label="业务类型">
        <template #default="{ row }">
          <el-tag>{{ getBizTypeName(row.bizType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="mode" label="审核模式">
        <template #default="{ row }">
          <el-tag :type="getModeType(row.mode)">
            {{ getModeName(row.mode) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ getPriorityName(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态">
        <template #default="{ row }">
          <el-switch 
            v-model="row.isActive" 
            @change="togglePolicy(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button link type="primary" @click="editPolicy(row)">编辑</el-button>
          <el-button link type="danger" @click="deletePolicy(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <div class="actions">
      <el-button type="primary" @click="createPolicy">
        新增策略
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuditStore } from '@/stores/audit'
import type { AuditPolicy, BizType, AuditMode, Priority } from '@/types'

const auditStore = useAuditStore()
const loading = ref(false)
const policyList = ref<AuditPolicy[]>([])

const getBizTypeName = (bizType: BizType) => {
  const map = {
    'forum_post': '论坛帖子',
    'news': '资讯',
    'banner': 'Banner',
    'quotation': '名言',
    'flea_goods': '跳蚤市场商品'
  }
  return map[bizType] || bizType
}

const getModeName = (mode: AuditMode) => {
  const map = {
    'pre': '先审后发',
    'post': '先发后审',
    'sample': '抽审'
  }
  return map[mode] || mode
}

const getModeType = (mode: AuditMode) => {
  const map = {
    'pre': 'warning',
    'post': 'success',
    'sample': 'info'
  }
  return map[mode] || ''
}

const getPriorityName = (priority: Priority) => {
  const map = {
    'high': '高',
    'normal': '普通',
    'low': '低'
  }
  return map[priority] || priority
}

const getPriorityType = (priority: Priority) => {
  const map = {
    'high': 'danger',
    'normal': 'primary',
    'low': 'info'
  }
  return map[priority] || ''
}

const loadPolicies = async () => {
  try {
    loading.value = true
    await auditStore.loadPolicies()
    policyList.value = auditStore.policyList
  } catch (error) {
    console.error('加载策略列表失败:', error)
  } finally {
    loading.value = false
  }
}

const togglePolicy = async (policy: AuditPolicy) => {
  try {
    await auditStore.togglePolicy(policy.id, policy.isActive)
    ElMessage.success(`${policy.isActive ? '启用' : '禁用'}策略成功`)
  } catch (error) {
    // 回滚状态
    policy.isActive = !policy.isActive
    ElMessage.error('操作失败')
  }
}

const createPolicy = () => {
  // 打开创建策略对话框
}

const editPolicy = (policy: AuditPolicy) => {
  // 打开编辑策略对话框
}

const deletePolicy = async (policy: AuditPolicy) => {
  try {
    await ElMessageBox.confirm('确定要删除这个策略吗？', '确认删除', {
      type: 'warning'
    })
    
    await auditStore.deletePolicy(policy.id)
    ElMessage.success('删除策略成功')
    await loadPolicies()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除策略失败')
    }
  }
}

onMounted(() => {
  loadPolicies()
})
</script>
```

这个实现方案提供了：

1. **非侵入式接入**：通过审核节点的方式，不修改现有业务逻辑
2. **统一配置管理**：在统一审核中心配置所有审核策略
3. **灵活扩展**：新增业务模块时只需实现对应的审核节点
4. **向后兼容**：保留现有的手动审核功能
5. **异步处理**：支持轮询和回调两种方式获取审核结果
