<template>
  <BaseModal
    :model-value="visible"
    @update:modelValue="(val: boolean) => emit('update:visible', val)"
    :title="`管理版块「${categoryName}」的版主`"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
    class="moderator-dialog"
  >
    <div class="dialog-content">
      <!-- 当前版主列表 -->
      <div class="section">
        <div class="section-header">
          <h3>当前版主 ({{ currentModerators.length }})</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="showAddModerator = true"
            :disabled="loading"
          >
            <el-icon><Plus /></el-icon>
            添加版主
          </el-button>
        </div>
        
        <div v-if="currentModerators.length === 0" class="empty-state">
          <el-empty 
            :image-size="80" 
            description="暂无版主，点击上方按钮添加版主"
          />
        </div>
        
        <div v-else class="moderators-list">
          <el-card 
            v-for="moderator in currentModerators" 
            :key="moderator.id" 
            class="moderator-card"
            shadow="hover"
          >
            <div class="moderator-info">
              <div class="moderator-avatar">
                <el-avatar 
                  :size="50" 
                  :src="moderator.avatar"
                  :style="{ backgroundColor: getAvatarColor(moderator.nickname) }"
                >
                  {{ moderator.nickname?.charAt(0) || '?' }}
                </el-avatar>
              </div>
              
              <div class="moderator-details">
                <div class="moderator-name">{{ moderator.nickname || moderator.name }}</div>
                <div class="moderator-meta">
                  <span class="username">@{{ moderator.username }}</span>
                  <span class="department" v-if="moderator.department">
                    {{ moderator.department }}
                  </span>
                </div>
                <div class="moderator-contact" v-if="moderator.email">
                  <el-icon><Message /></el-icon>
                  {{ moderator.email }}
                </div>
              </div>
              
              <div class="moderator-actions">
                <el-popconfirm
                  title="确定要移除该版主吗？"
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  @confirm="removeModerator(moderator)"
                >
                  <template #reference>
                    <el-button 
                      type="danger" 
                      size="small" 
                      plain
                      :loading="removingIds.includes(moderator.id)"
                    >
                      <el-icon><Delete /></el-icon>
                      移除
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </el-card>
        </div>
      </div>
      
      <!-- 添加版主界面 -->
      <div v-if="showAddModerator" class="section add-section">
        <div class="section-header">
          <h3>添加新版主</h3>
          <el-button 
            text 
            @click="showAddModerator = false"
          >
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
        
        <!-- 搜索用户 -->
        <div class="user-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户（姓名、用户名、邮箱）"
            clearable
            @input="handleSearch"
            @clear="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <!-- 用户搜索结果 -->
        <div v-loading="searchLoading" class="search-results">
          <div v-if="searchResults.length === 0 && searchKeyword && !searchLoading" class="empty-search">
            <el-empty 
              :image-size="60" 
              description="未找到匹配的用户"
            />
          </div>
          
          <div v-else-if="searchResults.length > 0" class="user-list">
            <el-card 
              v-for="user in searchResults" 
              :key="user.id" 
              class="user-card"
              shadow="hover"
            >
              <div class="user-info">
                <div class="user-avatar">
                  <el-avatar 
                    :size="40" 
                    :src="user.avatar"
                    :style="{ backgroundColor: getAvatarColor(user.nickname) }"
                  >
                    {{ user.nickname?.charAt(0) || '?' }}
                  </el-avatar>
                </div>
                
                <div class="user-details">
                  <div class="user-name">{{ user.nickname || user.name }}</div>
                  <div class="user-meta">
                    <span class="username">@{{ user.username }}</span>
                    <span class="department" v-if="user.department">
                      {{ user.department }}
                    </span>
                  </div>
                </div>
                
                <div class="user-actions">
                  <el-button 
                    v-if="!isAlreadyModerator(user.id)"
                    type="primary" 
                    size="small" 
                    @click="addModerator(user)"
                    :loading="addingIds.includes(user.id)"
                  >
                    <el-icon><Plus /></el-icon>
                    添加为版主
                  </el-button>
                  <el-tag v-else type="info" size="small">已是版主</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">
          关闭
        </el-button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import BaseModal from '@/components/modal/BaseModal.vue'
import { ElMessage } from 'element-plus'
import type { User } from '@/types'
import { categoriesApi } from '@/api/categories'
import {
  Plus, Delete, Close, Search, Message
} from '@element-plus/icons-vue'

interface Props {
  visible: boolean
  categoryId: number
  categoryName: string
  moderators: User[]
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 状态管理
const loading = ref(false)
const showAddModerator = ref(false)
const searchKeyword = ref('')
const searchLoading = ref(false)
const searchResults = ref<User[]>([])
const currentModerators = ref<User[]>([])
const removingIds = ref<number[]>([])
const addingIds = ref<number[]>([])

// 搜索防抖
let searchTimer: number | null = null

// 监听props变化，更新当前版主列表
watch(() => props.moderators, (newModerators) => {
  currentModerators.value = [...newModerators]
}, { immediate: true })

watch(() => props.visible, (visible) => {
  if (visible) {
    currentModerators.value = [...props.moderators]
    showAddModerator.value = false
    searchKeyword.value = ''
    searchResults.value = []
  }
})

// 生成头像颜色
const getAvatarColor = (name?: string) => {
  if (!name) return '#409EFF'
  const colors = [
    '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', 
    '#909399', '#A66EFF', '#FF6B9D', '#FF9F40'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// 搜索用户
const handleSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  
  searchTimer = window.setTimeout(async () => {
    if (!searchKeyword.value.trim()) {
      searchResults.value = []
      return
    }
    
    try {
      searchLoading.value = true
      const response = await categoriesApi.searchUsers({
        keyword: searchKeyword.value.trim(),
        excludeIds: currentModerators.value.map(m => m.id)
      })
      
      if (response.code === 200) {
        searchResults.value = response.data || []
      } else {
        searchResults.value = []
      }
    } catch (error) {
      console.error('搜索用户失败:', error)
      searchResults.value = getMockSearchResults()
    } finally {
      searchLoading.value = false
    }
  }, 300)
}

// Mock搜索结果（开发时使用）
const getMockSearchResults = (): User[] => {
  const mockUsers: User[] = [
    {
      id: 101,
      username: 'zhang_san',
      name: '张三',
      nickname: '张三',
      email: 'zhangsan@example.com',
      department: '技术部',
      groupId: 1,
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-16T14:30:00Z'
    },
    {
      id: 102,
      username: 'li_si',
      name: '李四',
      nickname: '李四',
      email: 'lisi@example.com',
      department: '产品部',
      groupId: 2,
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-16T14:30:00Z'
    },
    {
      id: 103,
      username: 'wang_wu',
      name: '王五',
      nickname: '王五',
      email: 'wangwu@example.com',
      department: '运营部',
      groupId: 3,
      status: 1,
      roles: [],
      createTime: '2024-01-01T00:00:00Z',
      updateTime: '2024-01-16T14:30:00Z'
    }
  ]
  
  // 过滤掉已经是版主的用户，并根据关键词过滤
  const keyword = searchKeyword.value.toLowerCase()
  return mockUsers.filter(user => {
    const isNotModerator = !currentModerators.value.some(m => m.id === user.id)
    const matchesKeyword = 
      user.name.toLowerCase().includes(keyword) ||
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      (user.nickname && user.nickname.toLowerCase().includes(keyword))
    
    return isNotModerator && matchesKeyword
  })
}

// 检查用户是否已经是版主
const isAlreadyModerator = (userId: number) => {
  return currentModerators.value.some(m => m.id === userId)
}

// 添加版主
const addModerator = async (user: User) => {
  try {
    addingIds.value.push(user.id)
    
    await categoriesApi.addModerator(props.categoryId, user.id)
    
    currentModerators.value.push(user)
    // 从搜索结果中移除
    searchResults.value = searchResults.value.filter(u => u.id !== user.id)
    
    ElMessage.success(`已将「${user.nickname || user.name}」添加为版主`)
    
  } catch (error) {
    console.error('添加版主失败:', error)
    ElMessage.error('添加版主失败，请稍后重试')
  } finally {
    addingIds.value = addingIds.value.filter(id => id !== user.id)
  }
}

// 移除版主
const removeModerator = async (moderator: User) => {
  try {
    removingIds.value.push(moderator.id)
    
    await categoriesApi.removeModerator(props.categoryId, moderator.id)
    
    currentModerators.value = currentModerators.value.filter(m => m.id !== moderator.id)
    
    ElMessage.success(`已移除版主「${moderator.nickname || moderator.name}」`)
    
  } catch (error) {
    console.error('移除版主失败:', error)
    ElMessage.error('移除版主失败，请稍后重试')
  } finally {
    removingIds.value = removingIds.value.filter(id => id !== moderator.id)
  }
}

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  emit('success') // 触发父组件刷新版块数据
  showAddModerator.value = false
  searchKeyword.value = ''
  searchResults.value = []
}
</script>

<style scoped>
.moderator-dialog :deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section {
  border: 1px solid #EBEEF5;
  border-radius: 8px;
  background: #fff;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #EBEEF5;
  background: #F8F9FA;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.empty-state {
  padding: 40px 20px;
}

.moderators-list,
.user-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.moderator-card,
.user-card {
  border: 1px solid #EBEEF5;
  transition: all 0.3s ease;
}

.moderator-card:hover,
.user-card:hover {
  border-color: #409EFF;
}

.moderator-info,
.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.moderator-avatar,
.user-avatar {
  flex-shrink: 0;
}

.moderator-details,
.user-details {
  flex: 1;
  min-width: 0;
}

.moderator-name,
.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.moderator-meta,
.user-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.username {
  color: #606266;
  font-size: 14px;
}

.department {
  background: #F0F2F5;
  color: #606266;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.moderator-contact {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
}

.moderator-actions,
.user-actions {
  flex-shrink: 0;
}

.add-section {
  border-color: #409EFF;
}

.add-section .section-header {
  background: linear-gradient(90deg, #ecf5ff 0%, #f0f9ff 100%);
  border-bottom-color: #409EFF;
}

.user-search {
  padding: 20px 20px 0 20px;
}

.search-results {
  min-height: 200px;
}

.empty-search {
  padding: 40px 20px;
}

.dialog-footer {
  padding: 10px 0 0 0;
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .moderator-info,
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .moderator-actions,
  .user-actions {
    align-self: stretch;
  }
  
  .moderator-actions .el-button,
  .user-actions .el-button {
    width: 100%;
  }
  
  .moderator-meta,
  .user-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
}
</style>