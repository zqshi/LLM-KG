<template>
  <div class="publish-item-page">
    <div class="container">
      <el-breadcrumb class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/market' }">跳蚤市场</el-breadcrumb-item>
        <el-breadcrumb-item>发布商品</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="publish-form">
        <h1>发布商品</h1>
        <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
          <el-form-item label="商品名称" prop="title">
            <el-input v-model="form.title" placeholder="请输入商品名称" maxlength="50" show-word-limit />
          </el-form-item>
          
          <el-form-item label="商品分类" prop="category">
            <el-select v-model="form.category" placeholder="请选择分类">
              <el-option v-for="cat in categories" :key="cat" :label="cat" :value="cat" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="商品图片">
            <el-upload
              v-model:file-list="form.images"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :before-upload="beforeUpload"
              multiple
              :limit="5"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              最多上传5张图片，支持jpg、png格式，单张图片不超过2MB
            </div>
          </el-form-item>
          
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="5"
              placeholder="请详细描述商品的特点、使用情况等"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="成色" prop="condition">
            <el-radio-group v-model="form.condition">
              <el-radio value="new">全新</el-radio>
              <el-radio value="like-new">9成新</el-radio>
              <el-radio value="good">8成新</el-radio>
              <el-radio value="fair">7成新</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="价格设置">
            <div class="price-inputs">
              <el-form-item prop="price">
                <el-input v-model.number="form.price" placeholder="出售价格">
                  <template #prepend>¥</template>
                </el-input>
              </el-form-item>
              <el-form-item prop="originalPrice">
                <el-input v-model.number="form.originalPrice" placeholder="原价（可选）">
                  <template #prepend>¥</template>
                </el-input>
              </el-form-item>
            </div>
          </el-form-item>
          
          <el-form-item label="交易地点" prop="location">
            <el-input v-model="form.location" placeholder="如：公司内部、XX办公楼等" />
          </el-form-item>
          
          <el-form-item label="联系方式" prop="contactInfo">
            <el-input v-model="form.contactInfo" placeholder="如：微信号、电话等" />
          </el-form-item>
          
          <el-form-item>
            <el-button @click="$router.go(-1)">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">发布商品</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const submitting = ref(false)

const form = reactive({
  title: '',
  category: '',
  images: [],
  description: '',
  condition: 'like-new',
  price: null,
  originalPrice: null,
  location: '公司内部',
  contactInfo: ''
})

const rules = {
  title: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }],
  condition: [{ required: true, message: '请选择成色', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  location: [{ required: true, message: '请输入交易地点', trigger: 'blur' }],
  contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
}

const categories = ['数码产品', '家具家电', '服装配饰', '图书文具', '运动健身', '其他']

const handlePictureCardPreview = () => {
  // 图片预览逻辑
}

const beforeUpload = () => {
  return true
}

const submitForm = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      submitting.value = true
      // 模拟提交
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('商品发布成功')
        router.push('/market')
      }, 1000)
    }
  })
}
</script>

<style scoped lang="scss">
.publish-item-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0 40px;
}

.breadcrumb {
  margin-bottom: 24px;
}

.publish-form {
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

  .price-inputs {
    display: flex;
    gap: 16px;

    .el-form-item {
      margin-bottom: 0;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 8px;
  }
}
</style>