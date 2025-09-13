import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTagList,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  checkTagCanDelete,
  getToolList,
  getToolDetail,
  createTool,
  updateTool,
  deleteTool,
  toggleToolStatus,
  batchOperateTools,
  getToolCases,
  associateCase,
  removeCase,
  searchForumPosts,
  getForumCategories,
  getToolStatistics,
  uploadToolLogo
} from '@/api/aiTools'
import type {
  AITool,
  AIToolTag,
  AIToolForm,
  AIToolTagForm,
  AIToolQueryParams,
  AIToolTagQueryParams,
  AIToolListResponse,
  AIToolTagListResponse,
  AIToolBatchOperation,
  CaseAssociation,
  ForumPost,
  ForumPostQueryParams,
  ForumCategory,
  AIToolStatistics,
  TagDeleteCheckResult
} from '@/types/aiTools'
import { ElMessage } from 'element-plus'

export const useAIToolsStore = defineStore('aiTools', () => {
  // ==================== 状态定义 ====================
  
  // 工具列表
  const tools = ref<AITool[]>([])
  const toolsTotal = ref(0)
  const toolsLoading = ref(false)
  
  // 标签列表
  const tags = ref<AIToolTag[]>([])
  const tagsTotal = ref(0)
  const tagsLoading = ref(false)
  const allTags = ref<AIToolTag[]>([]) // 用于下拉选择的所有标签
  
  // 论坛相关
  const forumPosts = ref<ForumPost[]>([])
  const forumPostsTotal = ref(0)
  const forumPostsLoading = ref(false)
  const forumCategories = ref<ForumCategory[]>([])
  
  // 当前选中的工具
  const currentTool = ref<AITool | null>(null)
  const currentToolCases = ref<any[]>([])
  
  // 统计信息
  const statistics = ref<AIToolStatistics | null>(null)
  
  // ==================== 计算属性 ====================
  
  const enabledToolsCount = computed(() => 
    tools.value.filter(tool => tool.status === 'enabled').length
  )
  
  const disabledToolsCount = computed(() => 
    tools.value.filter(tool => tool.status === 'disabled').length
  )
  
  // ==================== 标签管理 ====================
  
  // 获取标签列表
  const fetchTagList = async (params?: AIToolTagQueryParams) => {
    try {
      tagsLoading.value = true
      const response = await getTagList(params)
      console.log('fetchTagList response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        tags.value = response.data.list as AIToolTag[]
        tagsTotal.value = response.data.total as number
      }
      return response
    } catch (error) {
      console.error('获取标签列表失败:', error)
      ElMessage.error('获取标签列表失败')
      throw error
    } finally {
      tagsLoading.value = false
    }
  }
  
  // 获取所有标签（用于下拉选择）
  const fetchAllTags = async () => {
    try {
      const response = await getAllTags()
      console.log('fetchAllTags response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        allTags.value = response.data as AIToolTag[]
      }
      return response
    } catch (error) {
      console.error('获取标签选项失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取标签选项失败')
      }
      throw error
    }
  }
  
  // 创建标签
  const createNewTag = async (data: AIToolTagForm) => {
    try {
      const response = await createTag(data)
      console.log('createNewTag response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('标签创建成功')
        await fetchTagList() // 刷新列表
        await fetchAllTags() // 刷新选项
        return response.data as AIToolTag
      }
      throw new Error(response?.message || '创建标签失败')
    } catch (error) {
      console.error('创建标签失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '创建标签失败')
      throw error
    }
  }
  
  // 更新标签
  const updateExistingTag = async (id: number, data: AIToolTagForm) => {
    try {
      const response = await updateTag(id, data)
      console.log('updateExistingTag response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('标签更新成功')
        await fetchTagList() // 刷新列表
        await fetchAllTags() // 刷新选项
        return response.data as AIToolTag
      }
      throw new Error(response?.message || '更新标签失败')
    } catch (error) {
      console.error('更新标签失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '更新标签失败')
      throw error
    }
  }
  
  // 检查标签是否可以删除
  const checkTagDeletion = async (id: number) => {
    try {
      const response = await checkTagCanDelete(id)
      console.log('checkTagDeletion response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        return response.data as TagDeleteCheckResult
      }
      throw new Error(response?.message || '检查标签删除状态失败')
    } catch (error) {
      console.error('检查标签删除状态失败:', error)
      throw error
    }
  }
  
  // 删除标签
  const removeTag = async (id: number) => {
    try {
      const response = await deleteTag(id)
      console.log('removeTag response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('标签删除成功')
        await fetchTagList() // 刷新列表
        await fetchAllTags() // 刷新选项
        return
      }
      throw new Error(response?.message || '删除标签失败')
    } catch (error) {
      console.error('删除标签失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '删除标签失败')
      throw error
    }
  }
  
  // ==================== 工具管理 ====================
  
  // 获取工具列表
  const fetchToolList = async (params?: AIToolQueryParams) => {
    try {
      toolsLoading.value = true
      console.log('fetchToolList called with params:', params)
      const response = await getToolList(params)
      console.log('getToolList response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        console.log('Setting tools data:', response.data)
        tools.value = response.data.list as AITool[]
        toolsTotal.value = response.data.total as number
      }
      return response
    } catch (error) {
      console.error('获取工具列表失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('获取工具列表失败')
      }
      throw error
    } finally {
      toolsLoading.value = false
    }
  }
  
  // 获取工具详情
  const fetchToolDetail = async (id: number) => {
    try {
      const response = await getToolDetail(id)
      console.log('fetchToolDetail response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        currentTool.value = response.data as AITool
        return response.data as AITool
      }
      throw new Error(response?.message || '获取工具详情失败')
    } catch (error) {
      console.error('获取工具详情失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '获取工具详情失败')
      throw error
    }
  }
  
  // 创建工具
  const createNewTool = async (data: AIToolForm) => {
    try {
      const response = await createTool(data)
      console.log('createNewTool response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('工具创建成功')
        await fetchToolList() // 刷新列表
        return response.data as AITool
      }
      throw new Error(response?.message || '创建工具失败')
    } catch (error) {
      console.error('创建工具失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '创建工具失败')
      throw error
    }
  }
  
  // 更新工具
  const updateExistingTool = async (id: number, data: AIToolForm) => {
    try {
      const response = await updateTool(id, data)
      console.log('updateExistingTool response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('工具更新成功')
        await fetchToolList() // 刷新列表
        return response.data as AITool
      }
      throw new Error(response?.message || '更新工具失败')
    } catch (error) {
      console.error('更新工具失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '更新工具失败')
      throw error
    }
  }
  
  // 删除工具
  const removeTool = async (id: number) => {
    try {
      const response = await deleteTool(id)
      console.log('removeTool response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('工具删除成功')
        await fetchToolList() // 刷新列表
        return
      }
      throw new Error(response?.message || '删除工具失败')
    } catch (error) {
      console.error('删除工具失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '删除工具失败')
      throw error
    }
  }
  
  // 切换工具状态
  const changeToolStatus = async (id: number, status: 'enabled' | 'disabled') => {
    try {
      const response = await toggleToolStatus(id, status)
      console.log('changeToolStatus response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        const statusText = status === 'enabled' ? '启用' : '禁用'
        ElMessage.success(`工具${statusText}成功`)
        await fetchToolList() // 刷新列表
        return
      }
      throw new Error(response?.message || '切换工具状态失败')
    } catch (error) {
      console.error('切换工具状态失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '切换工具状态失败')
      throw error
    }
  }
  
  // 批量操作工具
  const batchOperateToolList = async (data: AIToolBatchOperation) => {
    try {
      const response = await batchOperateTools(data)
      console.log('batchOperateToolList response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('批量操作成功')
        await fetchToolList() // 刷新列表
        return
      }
      throw new Error(response?.message || '批量操作失败')
    } catch (error) {
      console.error('批量操作失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '批量操作失败')
      throw error
    }
  }
  
  // ==================== 案例管理 ====================
  
  // 获取工具关联案例
  const fetchToolCases = async (toolId: number) => {
    try {
      const response = await getToolCases(toolId)
      console.log('fetchToolCases response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        currentToolCases.value = response.data as any[]
        return response.data as any[]
      }
      throw new Error(response?.message || '获取工具案例失败')
    } catch (error) {
      console.error('获取工具案例失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '获取工具案例失败')
      throw error
    }
  }
  
  // 关联案例
  const associateToolCase = async (data: CaseAssociation) => {
    try {
      const response = await associateCase(data)
      console.log('associateToolCase response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('案例关联成功')
        await fetchToolCases(data.toolId) // 刷新案例列表
        return
      }
      throw new Error(response?.message || '关联案例失败')
    } catch (error) {
      console.error('关联案例失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '关联案例失败')
      throw error
    }
  }
  
  // 移除关联案例
  const removeToolCase = async (toolId: number, postId: number) => {
    try {
      const response = await removeCase(toolId, postId)
      console.log('removeToolCase response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        ElMessage.success('案例移除成功')
        await fetchToolCases(toolId) // 刷新案例列表
        return
      }
      throw new Error(response?.message || '移除案例失败')
    } catch (error) {
      console.error('移除案例失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '移除案例失败')
      throw error
    }
  }
  
  // ==================== 论坛相关 ====================
  
  // 获取论坛版块
  const fetchForumCategories = async () => {
    try {
      const response = await getForumCategories()
      console.log('fetchForumCategories response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        forumCategories.value = response.data as ForumCategory[]
      }
      return response
    } catch (error) {
      console.error('获取论坛版块失败:', error)
      ElMessage.error('获取论坛版块失败')
      throw error
    }
  }
  
  // 搜索论坛帖子
  const searchPosts = async (params: ForumPostQueryParams) => {
    try {
      forumPostsLoading.value = true
      const response = await searchForumPosts(params)
      console.log('searchPosts response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        forumPosts.value = response.data.list as ForumPost[]
        forumPostsTotal.value = response.data.total as number
      }
      return response
    } catch (error) {
      console.error('搜索帖子失败:', error)
      // 检查是否是静态模式下的错误
      const isStaticMode = import.meta.env.VITE_STATIC_MODE === 'true' || 
        import.meta.env.VITE_API_BASE_URL === '' || 
        !import.meta.env.VITE_API_BASE_URL
      
      if (!isStaticMode) {
        ElMessage.error('搜索帖子失败')
      }
      throw error
    } finally {
      forumPostsLoading.value = false
    }
  }
  
  // ==================== 统计信息 ====================
  
  // 获取统计信息
  const fetchStatistics = async () => {
    try {
      const response = await getToolStatistics()
      console.log('fetchStatistics response:', response)
      // 类型检查 - 正确处理API响应结构
      if (response && response.code === 200) {
        statistics.value = response.data as AIToolStatistics
      }
      return response
    } catch (error) {
      console.error('获取统计信息失败:', error)
      throw error
    }
  }
  
  // ==================== 文件上传 ====================
  
  // 上传工具Logo
  const uploadLogo = async (file: File) => {
    try {
      const response = await uploadToolLogo(file)
      if (response && response.code === 200) {
        return response.data.url
      }
      throw new Error(response?.message || '上传Logo失败')
    } catch (error) {
      console.error('上传Logo失败:', error)
      ElMessage.error(error instanceof Error ? error.message : '上传Logo失败')
      throw error
    }
  }
  
  // ==================== 重置方法 ====================
  
  const resetCurrentTool = () => {
    currentTool.value = null
    currentToolCases.value = []
  }
  
  const resetForumPosts = () => {
    forumPosts.value = []
    forumPostsTotal.value = 0
  }
  
  return {
    // 状态
    tools,
    toolsTotal,
    toolsLoading,
    tags,
    tagsTotal,
    tagsLoading,
    allTags,
    forumPosts,
    forumPostsTotal,
    forumPostsLoading,
    forumCategories,
    currentTool,
    currentToolCases,
    statistics,
    
    // 计算属性
    enabledToolsCount,
    disabledToolsCount,
    
    // 标签管理方法
    fetchTagList,
    fetchAllTags,
    createNewTag,
    updateExistingTag,
    checkTagDeletion,
    removeTag,
    
    // 工具管理方法
    fetchToolList,
    fetchToolDetail,
    createNewTool,
    updateExistingTool,
    removeTool,
    changeToolStatus,
    batchOperateToolList,
    
    // 案例管理方法
    fetchToolCases,
    associateToolCase,
    removeToolCase,
    
    // 论坛相关方法
    fetchForumCategories,
    searchPosts,
    
    // 统计信息方法
    fetchStatistics,
    
    // 文件上传方法
    uploadLogo,
    
    // 重置方法
    resetCurrentTool,
    resetForumPosts
  }
})