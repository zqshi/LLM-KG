<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-content">
        <!-- 个人信息卡片 -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="120" :src="userInfo.avatar" />
              <el-button type="primary" size="small" @click="showAvatarUpload = true">
                更换头像
              </el-button>
            </div>
            <div class="basic-info">
              <h2>{{ userInfo.name }}</h2>
              <p class="position">{{ userInfo.department }} · {{ userInfo.position }}</p>
              <p class="join-date">加入时间: {{ formatDate(userInfo.joinDate) }}</p>
              <div class="user-level">
                <el-tag type="warning" size="large">{{ userInfo.level }}</el-tag>
                <span class="points">积分: {{ userInfo.points }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-number">{{ stats.postsCount }}</div>
              <div class="stat-label">发布话题</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.repliesCount }}</div>
              <div class="stat-label">回复数</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.likesCount }}</div>
              <div class="stat-label">获得点赞</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.itemsCount }}</div>
              <div class="stat-label">发布商品</div>
            </div>
          </div>
        </div>

        <!-- 主要内容区 -->
        <div class="main-content">
          <!-- 左侧导航 -->
          <div class="content-nav">
            <el-menu :default-active="activeTab" @select="handleTabSelect">
              <el-menu-item index="info">
                <el-icon><User /></el-icon>
                <span>个人资料</span>
              </el-menu-item>
              <el-menu-item index="posts">
                <el-icon><ChatDotRound /></el-icon>
                <span>我的话题</span>
              </el-menu-item>
              <el-menu-item index="items">
                <el-icon><Shop /></el-icon>
                <span>我的商品</span>
              </el-menu-item>
              <el-menu-item index="favorites">
                <el-icon><Star /></el-icon>
                <span>我的收藏</span>
              </el-menu-item>
              <el-menu-item index="settings">
                <el-icon><Setting /></el-icon>
                <span>账户设置</span>
              </el-menu-item>
            </el-menu>
          </div>

          <!-- 右侧内容 -->
          <div class=\"content-area\">
            <!-- 个人资料 -->
            <div v-show=\"activeTab === 'info'\" class=\"tab-content\">
              <div class=\"section-header\">
                <h3>个人资料</h3>
                <el-button type=\"primary\" @click=\"editMode = !editMode\">
                  {{ editMode ? '保存' : '编辑' }}
                </el-button>
              </div>
              
              <el-form :model=\"userInfo\" label-width=\"100px\" :disabled=\"!editMode\">
                <el-form-item label=\"姓名\">
                  <el-input v-model=\"userInfo.name\" />
                </el-form-item>
                <el-form-item label=\"部门\">
                  <el-input v-model=\"userInfo.department\" />
                </el-form-item>
                <el-form-item label=\"职位\">
                  <el-input v-model=\"userInfo.position\" />
                </el-form-item>
                <el-form-item label=\"邮箱\">
                  <el-input v-model=\"userInfo.email\" />
                </el-form-item>
                <el-form-item label=\"电话\">
                  <el-input v-model=\"userInfo.phone\" />
                </el-form-item>
              </el-form>
            </div>

            <!-- 我的话题 -->
            <div v-show=\"activeTab === 'posts'\" class=\"tab-content\">
              <div class=\"section-header\">
                <h3>我的话题</h3>
              </div>
              <div class=\"posts-list\">
                <div
                  v-for=\"post in myPosts\"
                  :key=\"post.id\"
                  class=\"post-item\"
                  @click=\"$router.push(`/forum/post/${post.id}`)\"
                >
                  <h4>{{ post.title }}</h4>
                  <div class=\"post-meta\">
                    <span>{{ post.category }}</span>
                    <span>{{ formatTime(post.createTime) }}</span>
                    <span>{{ post.viewCount }} 浏览</span>
                    <span>{{ post.replyCount }} 回复</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 我的商品 -->
            <div v-show=\"activeTab === 'items'\" class=\"tab-content\">
              <div class=\"section-header\">
                <h3>我的商品</h3>
                <el-button type=\"primary\" @click=\"$router.push('/market/publish')\">发布商品</el-button>
              </div>
              <div class=\"items-grid\">
                <div
                  v-for=\"item in myItems\"
                  :key=\"item.id\"
                  class=\"item-card\"
                  @click=\"$router.push(`/market/${item.id}`)\"
                >
                  <div class=\"item-image\">
                    <img :src=\"item.images[0]\" :alt=\"item.title\" />
                    <el-tag :type=\"getStatusType(item.status)\" size=\"small\" class=\"status-tag\">
                      {{ getStatusText(item.status) }}
                    </el-tag>
                  </div>
                  <div class=\"item-info\">
                    <h4>{{ item.title }}</h4>
                    <div class=\"price\">¥{{ item.price }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 我的收藏 -->
            <div v-show=\"activeTab === 'favorites'\" class=\"tab-content\">
              <div class=\"section-header\">
                <h3>我的收藏</h3>
              </div>
              <el-empty description=\"暂无收藏内容\" />
            </div>

            <!-- 账户设置 -->
            <div v-show=\"activeTab === 'settings'\" class=\"tab-content\">
              <div class=\"section-header\">
                <h3>账户设置</h3>
              </div>
              <el-form label-width=\"120px\">
                <el-form-item label=\"邮件通知\">
                  <el-switch v-model=\"settings.emailNotifications\" />
                </el-form-item>
                <el-form-item label=\"系统通知\">
                  <el-switch v-model=\"settings.systemNotifications\" />
                </el-form-item>
                <el-form-item label=\"隐私设置\">
                  <el-radio-group v-model=\"settings.privacy\">
                    <el-radio value=\"public\">公开</el-radio>
                    <el-radio value=\"private\">仅好友可见</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button type=\"primary\">保存设置</el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang=\"ts\">
import { ref, reactive, computed } from 'vue'
import { useContentStore } from '@/stores/content'
import { User, ChatDotRound, Shop, Star, Setting } from '@element-plus/icons-vue'

const contentStore = useContentStore()

const activeTab = ref('info')
const editMode = ref(false)
const showAvatarUpload = ref(false)

// 模拟用户数据
const userInfo = reactive({
  id: '1',
  name: '张三',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  department: '技术部',
  position: '前端开发工程师',
  email: 'zhangsan@company.com',
  phone: '13800138000',
  joinDate: '2022-03-15',
  points: 2580,
  level: '黄金会员'
})

const stats = reactive({
  postsCount: 15,
  repliesCount: 48,
  likesCount: 126,
  itemsCount: 3
})

const settings = reactive({
  emailNotifications: true,
  systemNotifications: true,
  privacy: 'public'
})

// 我的话题（模拟数据）
const myPosts = computed(() => [
  {
    id: '1',
    title: '关于新技术栈的学习建议',
    category: '技术讨论',
    createTime: '2024-01-15 10:30:00',
    viewCount: 234,
    replyCount: 12
  },
  {
    id: '2',
    title: '团队协作工具推荐',
    category: '工作效率',
    createTime: '2024-01-10 14:20:00',
    viewCount: 189,
    replyCount: 8
  }
])

// 我的商品（模拟数据）
const myItems = computed(() => [
  {
    id: '1',
    title: 'MacBook Pro 2021',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop'],
    price: 12800,
    status: 'available'
  },
  {
    id: '2',
    title: 'iPhone 13 Pro',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop'],
    price: 6800,
    status: 'sold'
  }
])

const handleTabSelect = (key: string) => {
  activeTab.value = key
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString('zh-CN')
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    available: 'success',
    sold: 'info',
    reserved: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    available: '在售',
    sold: '已售',
    reserved: '预定'
  }
  return texts[status] || status
}
</script>

<style scoped lang=\"scss\">
.profile-page {
  min-height: 100vh;
  padding: 40px 0;
  background: var(--el-bg-color-page);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 32px;

  .profile-header {
    display: flex;
    gap: 32px;
    align-items: center;

    .avatar-section {
      text-align: center;

      .el-button {
        margin-top: 12px;
      }
    }

    .basic-info {
      flex: 1;

      h2 {
        font-size: 28px;
        font-weight: 700;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      .position {
        font-size: 16px;
        color: var(--el-text-color-regular);
        margin-bottom: 8px;
      }

      .join-date {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 16px;
      }

      .user-level {
        display: flex;
        align-items: center;
        gap: 16px;

        .points {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

.stats-section {
  background: white;
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 24px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;

    .stat-item {
      text-align: center;

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        color: var(--el-color-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.main-content {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;

  .content-nav {
    background: white;
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    height: fit-content;

    .el-menu {
      border: none;
    }
  }

  .content-area {
    background: white;
    border-radius: 8px;
    box-shadow: var(--el-box-shadow-light);
    padding: 32px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      h3 {
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
      }
    }

    .posts-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .post-item {
        padding: 16px;
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: var(--el-box-shadow-light);
        }

        h4 {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }

        .post-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;

      .item-card {
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 6px;
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: var(--el-color-primary);
          box-shadow: var(--el-box-shadow-light);
          transform: translateY(-2px);
        }

        .item-image {
          position: relative;
          height: 120px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .status-tag {
            position: absolute;
            top: 8px;
            right: 8px;
          }
        }

        .item-info {
          padding: 12px;

          h4 {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .price {
            font-size: 16px;
            font-weight: 600;
            color: var(--el-color-danger);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-card .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .stats-section .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-content {
    grid-template-columns: 1fr;

    .content-nav {
      .el-menu {
        display: flex;
      }
    }
  }

  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>