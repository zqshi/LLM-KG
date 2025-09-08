<template>
  <div class="placeholder-page">
    <UnifiedPageHeader 
      title="数据看板" 
      description="查看跳蚤市场的运营数据和统计信息"
    />
    <el-card>
      <div class="content">
        <el-result
          icon="info"
          title="数据看板"
          sub-title="跳蚤市场数据看板开发中..."
        >
          <template #extra>
            <el-button type="primary">返回首页</el-button>
          </template>
        </el-result>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import UnifiedPageHeader from '@/components/UnifiedPageHeader.vue'
// 占位组件，后续完善
</script>

<style scoped>
.placeholder-page {
  padding: 20px;
}

.content {
  text-align: center;
  padding: 40px;
}
</style>
