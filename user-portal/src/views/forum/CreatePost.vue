<template>
  <div class="create-post-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/forum' }">企业论坛</el-breadcrumb-item>
        <el-breadcrumb-item>发布话题</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="create-form">
        <h1>发布话题</h1>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入话题标题" maxlength="100" show-word-limit />
          </el-form-item>
          
          <el-form-item label="分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择分类">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="标签" prop="tags">
            <el-select v-model="form.tags" multiple placeholder="添加标签" allow-create filterable>
              <el-option v-for="tag in popularTags" :key="tag" :label="tag" :value="tag" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="内容" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="10" placeholder="请输入话题内容" maxlength="2000" show-word-limit />
          </el-form-item>
          
          <el-form-item>
            <el-button @click="$router.go(-1)">取消</el-button>
            <el-button type="primary" @click="submitForm">发布话题</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()

const form = reactive({
  title: '',
  category: '',
  tags: [],
  content: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const categories = ['技术讨论', '产品反馈', '公司建议', '生活分享', '求助问答', '活动组织']
const popularTags = ['Vue', 'React', '前端', '后端', '产品', '设计', '管理', '团建']

const submitForm = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟提交
      ElMessage.success('话题发布成功')
      router.push('/forum')
    }
  })
}
</script>

<style scoped lang="scss">
.create-post-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 24px;
}

.create-form {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 40px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 32px;
  }
}
</style>