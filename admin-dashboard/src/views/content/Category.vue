<template>
  <div class="category-home">
    <UnifiedPageHeader 
      :title="displayName + '版块'" 
      description="查看并管理该版块下的所有帖子"
    >
      <template #actions>
        <el-button type="primary" @click="createPost">
          <el-icon><Plus /></el-icon>
          发布新帖
        </el-button>
      </template>
    </UnifiedPageHeader>

    <el-card class="info-card" shadow="never">
      <div class="stats">
        <div class="stat">
          <div class="num">{{ contentStats.total || 0 }}</div>
          <div class="label">总内容数</div>
        </div>
        <div class="stat">
          <div class="num">{{ contentStats.today || 0 }}</div>
          <div class="label">今日新增</div>
        </div>
        <div class="stat">
          <div class="num">{{ followers }}</div>
          <div class="label">关注人数</div>
        </div>
      </div>
    </el-card>

    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" class="filter-line" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="queryParams.keyword" placeholder="标题或摘要" clearable style="width: 220px" @keyup.enter="reload"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px" @change="reload">
            <el-option label="待审核" :value="1" />
            <el-option label="已发布" :value="2" />
            <el-option label="已拒绝" :value="3" />
            <el-option label="已删除" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="reload">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="reset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table :data="contentList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"/>
        <el-table-column label="标题/摘要" min-width="320">
          <template #default="{ row }">
            <div class="title-cell">
              <el-link type="primary" class="title-link" @click="preview(row)">{{ row.title }}</el-link>
              <div class="meta">
                <el-tag :type="getStatusColor(row.status)" size="small">{{ getStatusName(row.status) }}</el-tag>
                <span class="sep">|</span>
                <span class="author">{{ row.author?.name }}</span>
                <span class="sep">|</span>
                <span class="time">{{ formatDateTime(row.createdAt) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="互动" width="140">
          <template #default="{ row }">
            <span class="kpi">阅 {{ row.viewCount }}</span>
            <span class="kpi">评 {{ row.commentCount }}</span>
            <span class="kpi">赞 {{ row.likeCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="preview(row)">预览</el-button>
            <el-dropdown @command="(cmd) => rowAction(cmd, row)">
              <el-button size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit" v-if="canEdit(row)">编辑</el-dropdown-item>
                  <el-dropdown-item command="audit" v-if="canAudit(row)">审核</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10,20,50,100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="reload"
          @current-change="reload"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
import { useContentStore } from '@/stores/content'
import { useAuthStore } from '@/stores/auth'
import type { Content } from '@/types'
import { Plus, Search, Refresh, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const contentStore = useContentStore()
const authStore = useAuthStore()
const { contentList, loading, pagination, queryParams, contentStats } = storeToRefs(contentStore)

const code = computed(() => String(router.currentRoute.value.params.code || ''))
const displayName = computed(() => String(router.currentRoute.value.query.name || code.value))
const followers = 0

const formatDateTime = (s: string) => new Date(s).toLocaleString('zh-CN')

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'
const getStatusName = (status: number) => ({1:'待审核',2:'已发布',3:'已拒绝',4:'已删除'} as Record<number,string>)[status] || `状态${status}`
const getStatusColor = (status: number): TagType => ({1:'warning',2:'success',3:'danger',4:'info'} as Record<number,TagType>)[status] || 'info'

const canEdit = (row: Content) => authStore.hasPermission('content:edit') || row.author?.id === authStore.currentUser?.id
const canAudit = (row: Content) => authStore.hasPermission('content:audit') && row.status === 1

const reload = async () => {
  await contentStore.loadContentList()
}
const reset = () => {
  queryParams.value.keyword = ''
  queryParams.value.status = undefined as any
  queryParams.value.page = 1
  reload()
}

const preview = (row: Content) => {
  router.push({ name: 'ContentList', query: { module: 'forum', category: row.category, from: 'category' } })
}

const rowAction = (cmd: string, row: Content) => {
  if (cmd === 'edit') router.push({ name: 'ContentEdit', params: { id: row.id } })
  else if (cmd === 'audit') router.push({ name: 'ContentList', query: { module: 'forum', category: row.category, status: 1, from: 'category' } })
  else if (cmd === 'delete') contentStore.deleteContent(row.id).then(reload)
}

const createPost = () => {
  router.push({ name: 'ContentCreate', query: { module: 'forum', category: displayName.value } })
}

onMounted(async () => {
  // 进入版块页：固定模块为 forum，分类默认取路由 name
  queryParams.value.module = 'forum'
  if (displayName.value) queryParams.value.category = displayName.value
  queryParams.value.page = queryParams.value.page || 1
  queryParams.value.pageSize = queryParams.value.pageSize || 20

  await contentStore.loadCategories('forum')
  await contentStore.loadContentList()
  await contentStore.loadStats()
})
</script>

<style scoped>
.category-home { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { margin: 0; font-size: 22px; font-weight: 600; color: #303133; }
.desc { color: #909399; margin-top: 4px; font-size: 13px; }
.right { display: flex; gap: 8px; }
.info-card { margin-bottom: 12px; }
.stats { display: flex; gap: 16px; }
.stat { background: #f8f9fa; border-radius: 8px; padding: 12px 16px; text-align: center; min-width: 120px; }
.num { font-weight: 600; font-size: 20px; color: #303133; line-height: 1; }
.label { color: #606266; font-size: 12px; margin-top: 4px; }
.filter-card { margin-bottom: 12px; }
.filter-line { display: flex; gap: 12px; align-items: center; }
.table-card { margin-top: 12px; }
.title-cell .title-link { font-weight: 500; }
.meta { display:flex; align-items:center; gap:8px; color:#909399; font-size:12px; margin-top:6px; }
.sep { color:#e4e7ed; }
.kpi { margin-right: 10px; color:#909399; font-size:12px; }
.pagination { display:flex; justify-content:center; margin-top: 16px; }
</style>