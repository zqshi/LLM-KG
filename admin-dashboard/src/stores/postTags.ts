import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { postTagsApi } from '@/api/postTags'
import type { 
  PostTag, 
  CreateTagForm, 
  UpdateTagForm, 
  TagQueryParams, 
  TagStats,
  TagColorOption 
} from '@/types/postTags'

export const usePostTagsStore = defineStore('postTags', () => {
  // 状态
  const tags = ref<PostTag[]>([])
  const currentTag = ref<PostTag | null>(null)
  const loading = ref(false)
  const stats = ref<TagStats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalPosts: 0
  })
  
  // 分页信息
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })

  // 查询参数
  const queryParams = ref<TagQueryParams>({
    page: 1,
    pageSize: 20,
    keyword: '',
    isActive: undefined,
    categoryId: undefined,
    sortBy: 'sortOrder',
    sortOrder: 'asc'
  })

  // 预定义颜色选项
  const colorOptions = ref<TagColorOption[]>([
    { label: '蓝色', value: '#409EFF', color: '#409EFF' },
    { label: '绿色', value: '#67C23A', color: '#67C23A' },
    { label: '橙色', value: '#E6A23C', color: '#E6A23C' },
    { label: '红色', value: '#F56C6C', color: '#F56C6C' },
    { label: '紫色', value: '#909399', color: '#909399' },
    { label: '青色', value: '#17C0AE', color: '#17C0AE' },
    { label: '粉色', value: '#F78FB3', color: '#F78FB3' },
    { label: '黄色', value: '#FFD93D', color: '#FFD93D' },
    { label: '深蓝', value: '#324057', color: '#324057' },
    { label: '深绿', value: '#2F7D32', color: '#2F7D32' }
  ])

  // 计算属性
  const activeTags = computed(() => tags.value.filter(tag => tag.isActive))
  const inactiveTags = computed(() => tags.value.filter(tag => !tag.isActive))
  const hasData = computed(() => tags.value.length > 0)
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize))

  // 获取标签列表
  const fetchTags = async (params?: Partial<TagQueryParams>) => {
    try {
      loading.value = true
      const mergedParams = { ...queryParams.value, ...params }
      
      const response = await postTagsApi.getList(mergedParams)
      if (response.code === 200) {
        tags.value = response.data.list
        pagination.value = {
          page: response.data.page,
          pageSize: response.data.pageSize,
          total: response.data.total
        }
      }
    } catch (error) {
      ElMessage.error('获取标签列表失败')
      console.error('获取标签列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 获取标签统计
  const fetchStats = async () => {
    try {
      const response = await postTagsApi.getStats()
      if (response.code === 200) {
        stats.value = response.data
      }
    } catch (error) {
      console.error('获取统计信息失败:', error)
    }
  }

  // 获取标签详情
  const fetchTagDetail = async (id: number) => {
    try {
      loading.value = true
      const response = await postTagsApi.getDetail(id)
      if (response.code === 200) {
        currentTag.value = response.data
        return response.data
      }
    } catch (error) {
      ElMessage.error('获取标签详情失败')
      console.error('获取标签详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  // 创建标签
  const createTag = async (data: CreateTagForm) => {
    try {
      loading.value = true
      const response = await postTagsApi.create(data)
      if (response.code === 200) {
        ElMessage.success('创建标签成功')
        await fetchTags()
        await fetchStats()
        return response.data
      }
    } catch (error) {
      ElMessage.error('创建标签失败')
      console.error('创建标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 更新标签
  const updateTag = async (data: UpdateTagForm) => {
    try {
      loading.value = true
      const response = await postTagsApi.update(data)
      if (response.code === 200) {
        ElMessage.success('更新标签成功')
        await fetchTags()
        await fetchStats()
        return response.data
      }
    } catch (error) {
      ElMessage.error('更新标签失败')
      console.error('更新标签失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 删除标签
  const deleteTag = async (id: number) => {
    try {
      const response = await postTagsApi.delete(id)
      if (response.code === 200) {
        ElMessage.success('删除标签成功')
        await fetchTags()
        await fetchStats()
      }
    } catch (error) {
      ElMessage.error('删除标签失败')
      console.error('删除标签失败:', error)
      throw error
    }
  }

  // 批量删除标签
  const batchDeleteTags = async (ids: number[]) => {
    try {
      const response = await postTagsApi.batchDelete(ids)
      if (response.code === 200) {
        ElMessage.success(`成功删除 ${ids.length} 个标签`)
        await fetchTags()
        await fetchStats()
      }
    } catch (error) {
      ElMessage.error('批量删除失败')
      console.error('批量删除失败:', error)
      throw error
    }
  }

  // 更新标签状态
  const updateTagStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await postTagsApi.updateStatus(id, isActive)
      if (response.code === 200) {
        ElMessage.success(`标签已${isActive ? '启用' : '禁用'}`)
        await fetchTags()
        await fetchStats()
      }
    } catch (error) {
      ElMessage.error('更新状态失败')
      console.error('更新状态失败:', error)
      throw error
    }
  }

  // 批量更新状态
  const batchUpdateStatus = async (ids: number[], isActive: boolean) => {
    try {
      const response = await postTagsApi.batchUpdateStatus(ids, isActive)
      if (response.code === 200) {
        ElMessage.success(`成功${isActive ? '启用' : '禁用'} ${ids.length} 个标签`)
        await fetchTags()
        await fetchStats()
      }
    } catch (error) {
      ElMessage.error('批量操作失败')
      console.error('批量操作失败:', error)
      throw error
    }
  }

  // 搜索标签
  const searchTags = async (keyword: string) => {
    queryParams.value.keyword = keyword
    queryParams.value.page = 1
    await fetchTags()
  }

  // 重置查询参数
  const resetQuery = () => {
    queryParams.value = {
      page: 1,
      pageSize: 20,
      keyword: '',
      isActive: undefined,
      categoryId: undefined,
      sortBy: 'sortOrder',
      sortOrder: 'asc'
    }
  }

  // 设置查询参数
  const setQueryParams = (params: Partial<TagQueryParams>) => {
    Object.assign(queryParams.value, params)
  }

  // 分页操作
  const changePage = (page: number) => {
    queryParams.value.page = page
    fetchTags()
  }

  const changePageSize = (pageSize: number) => {
    queryParams.value.pageSize = pageSize
    queryParams.value.page = 1
    fetchTags()
  }

  // 清空当前标签
  const clearCurrentTag = () => {
    currentTag.value = null
  }

  // 根据ID查找标签
  const findTagById = (id: number) => {
    return tags.value.find(tag => tag.id === id)
  }

  // 检查标签代码是否可用
  const checkCodeAvailable = async (code: string, excludeId?: number) => {
    try {
      const response = await postTagsApi.checkCodeAvailable(code, excludeId)
      return response.code === 200 && response.data
    } catch (error) {
      console.error('检查代码可用性失败:', error)
      return false
    }
  }

  return {
    // 状态
    tags,
    currentTag,
    loading,
    stats,
    pagination,
    queryParams,
    colorOptions,
    
    // 计算属性
    activeTags,
    inactiveTags,
    hasData,
    totalPages,
    
    // 方法
    fetchTags,
    fetchStats,
    fetchTagDetail,
    createTag,
    updateTag,
    deleteTag,
    batchDeleteTags,
    updateTagStatus,
    batchUpdateStatus,
    searchTags,
    resetQuery,
    setQueryParams,
    changePage,
    changePageSize,
    clearCurrentTag,
    findTagById,
    checkCodeAvailable
  }
})