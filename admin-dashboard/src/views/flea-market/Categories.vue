<template>
  <div class="categories-management">
    <UnifiedPageHeader 
      title="分类管理" 
      description="管理跳蚤市场商品分类，维护分类层次结构"
    >
      <template #actions>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增分类
        </el-button>
        <el-button type="success" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
    </UnifiedPageHeader>

    <!-- 分类列表 -->
    <el-card class="categories-card">
      <el-table
        v-loading="categoryLoading"
        :data="categoryList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        class="categories-table"
      >
        <el-table-column label="分类名称" min-width="200">
          <template #default="{ row }">
            <div class="category-name">
              <el-icon><FolderOpened /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort" width="80" />
        <el-table-column label="商品数量" width="100">
          <template #default="{ row }">
            <el-tag type="info">{{ row.goodsCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              link 
              type="success" 
              @click="handleAddChild(row)"
              v-if="!row.parentId"
            >
              <el-icon><Plus /></el-icon>
              添加子分类
            </el-button>
            <el-button 
              link 
              type="danger" 
              @click="handleDelete(row)"
              :disabled="(row.goodsCount && row.goodsCount > 0) || (row.children && row.children.length > 0)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分类编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="categoryForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="父分类" prop="parentId">
          <el-select 
            v-model="categoryForm.parentId" 
            placeholder="选择父分类（可选）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="category in parentCategoryOptions"
              :key="category.id"
              :label="category.name"
              :value="category.id"
              :disabled="isEdit && category.id === categoryForm.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number 
            v-model="categoryForm.sort" 
            :min="0"
            :max="9999"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ isEdit ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useFleaMarketStore } from '@/stores/fleaMarket'
import type { FleaCategory } from '@/types'
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'

// Store
const fleaMarketStore = useFleaMarketStore()

// 响应式数据
const formRef = ref()
const dialogVisible = ref(false)
const isEdit = ref(false)
const currentCategory = ref<FleaCategory | null>(null)

// 分类表单
const categoryForm = reactive({
  id: undefined as number | undefined,
  name: '',
  parentId: undefined as number | undefined,
  sort: 0
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 50, message: '分类名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 9999, message: '排序值必须在 0-9999 之间', trigger: 'blur' }
  ]
}

// 计算属性
const categoryList = computed(() => fleaMarketStore.categoryList)
const categoryLoading = computed(() => fleaMarketStore.categoryLoading)

// 父分类选项（只包含顶级分类）
const parentCategoryOptions = computed(() => {
  return categoryList.value.filter(cat => !cat.parentId)
})

// 生命周期
onMounted(() => {
  loadData()
})

// 方法
const loadData = () => {
  fleaMarketStore.fetchCategoryList()
}

const refreshData = () => {
  loadData()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleAddChild = (parent: FleaCategory) => {
  isEdit.value = false
  resetForm()
  categoryForm.parentId = parent.id
  dialogVisible.value = true
}

const handleEdit = (category: FleaCategory) => {
  isEdit.value = true
  currentCategory.value = category
  categoryForm.id = category.id
  categoryForm.name = category.name
  categoryForm.parentId = category.parentId
  categoryForm.sort = category.sort
  dialogVisible.value = true
}

const handleDelete = async (category: FleaCategory) => {
  try {
    await ElMessageBox.confirm(`确认删除分类"${category.name}"吗？`, '确认删除', {
      type: 'warning'
    })
    await fleaMarketStore.deleteCategory(category.id)
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error)
    }
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    const formData = {
      name: categoryForm.name,
      parentId: categoryForm.parentId || 0,
      sort: categoryForm.sort
    }
    
    if (isEdit.value) {
      await fleaMarketStore.updateCategory(categoryForm.id!, formData)
    } else {
      await fleaMarketStore.createCategory(formData)
    }
    
    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error)
    }
  }
}

const resetForm = () => {
  categoryForm.id = undefined
  categoryForm.name = ''
  categoryForm.parentId = undefined
  categoryForm.sort = 0
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('zh-CN')
}
</script>

<style scoped>
.categories-management {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-border-light);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.page-subtitle {
  color: var(--color-text-tertiary);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.categories-card {
  border-radius: 8px;
}

.categories-table {
  margin: 16px 0;
}

.category-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name span {
  font-weight: 500;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .categories-management {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
