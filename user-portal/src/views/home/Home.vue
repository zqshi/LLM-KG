<template>
  <div class="home-page">
    <!-- Banner 轮播区 -->
    <section class="banner-section">
      <div class="container">
        <a-carousel
          height="400px"
          indicator-position="bottom"
          :autoplay="true"
          :interval="5000"
        >
          <a-carousel-item
            v-for="banner in contentStore.activeBanners"
            :key="banner.id"
            @click="handleBannerClick(banner)"
          >
            <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
              <div class="banner-overlay">
                <div class="banner-content">
                  <h2>{{ banner.title }}</h2>
                  <p>{{ banner.description }}</p>
                  <a-button type="primary" size="large">了解详情</a-button>
                </div>
              </div>
            </div>
          </a-carousel-item>
        </a-carousel>
      </div>
    </section>

    <!-- 快速入口区 -->
    <section class="quick-access">
      <div class="container">
        <div class="quick-grid">
          <div
            v-for="item in quickAccessItems"
            :key="item.title"
            class="quick-item"
            @click="handleQuickAccess(item)"
          >
            <div class="quick-icon">
              <a-icon :size="32" :type="item.iconType" />
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 主要内容区 -->
    <section class="main-content">
      <div class="container">
        <div class="content-grid">
          <!-- 个性化推荐 -->
          <div class="content-card recommendations">
            <div class="card-header">
              <h3>个性化推荐</h3>
              <a-button text>更多</a-button>
            </div>
            <div class="recommendations-list">
              <div
                v-for="item in contentStore.recommendations.slice(0, 5)"
                :key="item.id"
                class="recommendation-item"
                @click="handleRecommendationClick(item)"
              >
                <div class="rec-type">
                  <a-tag :type="getTypeTagType(item.type)" size="small">
                    {{ getTypeName(item.type) }}
                  </a-tag>
                </div>
                <div class="rec-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.summary }}</p>
                  <span class="rec-reason">{{ item.reason }}</span>
                </div>
                <div class="rec-score">
                  {{ Math.round(item.score * 100) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- 最新资讯 -->
          <div class="content-card news">
            <div class="card-header">
              <h3>最新资讯</h3>
              <a-button text @click="$router.push('/news')">更多</a-button>
            </div>
            <div class="news-list">
              <div
                v-for="item in contentStore.latestNews.slice(0, 6)"
                :key="item.id"
                class="news-item"
                @click="$router.push(`/news/${item.id}`)"
              >
                <div class="news-content">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.summary }}</p>
                  <div class="news-meta">
                    <span>{{ item.author }}</span>
                    <span>{{ formatTime(item.publishTime) }}</span>
                    <span>{{ item.readCount }} 阅读</span>
                  </div>
                </div>
                <a-tag v-if="item.isTop" type="danger" size="small">置顶</a-tag>
              </div>
            </div>
          </div>

          <!-- 热门论坛 -->
          <div class="content-card forum">
            <div class="card-header">
              <h3>热门讨论</h3>
              <a-button text @click="$router.push('/forum')">更多</a-button>
            </div>
            <div class="forum-list">
              <div
                v-for="post in contentStore.forumPosts.slice(0, 6)"
                :key="post.id"
                class="forum-item"
                @click="$router.push(`/forum/post/${post.id}`)"
              >
                <div class="forum-author">
                  <a-avatar :size="32" :src="post.author.avatar" />
                </div>
                <div class="forum-content">
                  <h4>{{ post.title }}</h4>
                  <div class="forum-meta">
                    <span>{{ post.author.name }}</span>
                    <span>{{ formatTime(post.createTime) }}</span>
                    <span>{{ post.viewCount }} 浏览</span>
                    <span>{{ post.replyCount }} 回复</span>
                  </div>
                </div>
                <div class="forum-tags">
                  <a-tag
                    v-for="tag in post.tags.slice(0, 2)"
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </a-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 公司动态 & 领导名言 -->
    <section class="bottom-section">
      <div class="container">
        <div class="bottom-grid">
          <!-- 公司动态 -->
          <div class="content-card company-updates">
            <div class="card-header">
              <h3>公司动态</h3>
            </div>
            <div class="updates-list">
              <div
                v-for="item in contentStore.news.filter(n => n.category === '公司新闻').slice(0, 4)"
                :key="item.id"
                class="update-item"
                @click="$router.push(`/news/${item.id}`)"
              >
                <div class="update-dot"></div>
                <div class="update-content">
                  <h4>{{ item.title }}</h4>
                  <span class="update-time">{{ formatTime(item.publishTime) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 领导名言 -->
          <div class="content-card leader-quote">
            <div class="card-header">
              <h3>领导名言</h3>
              <a-button
                text
                size="small"
                @click="refreshQuote"
              >
                <a-icon type="refresh" />
              </a-button>
            </div>
            <div v-if="currentQuote" class="quote-content">
              <blockquote>
                "{{ currentQuote.content }}"
              </blockquote>
              <div class="quote-author">
                <strong>{{ currentQuote.author }}</strong>
                <span>{{ currentQuote.position }}</span>
              </div>
              <p v-if="currentQuote.context" class="quote-context">
                {{ currentQuote.context }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContentStore } from '@/stores/content'
import type { Banner, Recommendation } from '@/types'

const router = useRouter()
const contentStore = useContentStore()

const quickAccessItems = [
  {
    title: '资讯中心',
    description: '获取最新公司资讯',
    iconType: 'document',
    path: '/news'
  },
  {
    title: '知识平台',
    description: '学习企业知识库',
    iconType: 'reading',
    path: '/knowledge'
  },
  {
    title: '企业论坛',
    description: '参与员工讨论',
    iconType: 'message-square',
    path: '/forum'
  },
  {
    title: '跳蚤市场',
    description: '员工二手交易',
    iconType: 'shopping-bag',
    path: '/market'
  },
  {
    title: 'OA系统',
    description: '办公自动化',
    iconType: 'management',
    external: true,
    url: 'http://oa.company.com'
  },
  {
    title: '技术支持',
    description: '获取技术帮助',
    iconType: 'service',
    path: '/support'
  }
]

const currentQuote = computed(() => contentStore.randomQuote)

const handleBannerClick = (banner: Banner) => {
  if (banner.link) {
    if (banner.link.startsWith('http')) {
      window.open(banner.link, '_blank')
    } else {
      router.push(banner.link)
    }
  }
}

const handleQuickAccess = (item: any) => {
  if (item.external) {
    window.open(item.url, '_blank')
  } else {
    router.push(item.path)
  }
}

const handleRecommendationClick = (item: Recommendation) => {
  router.push(item.link)
}

const getTypeName = (type: string) => {
  const names = {
    news: '资讯',
    knowledge: '知识',
    forum: '论坛',
    market: '市场'
  }
  return names[type as keyof typeof names] || type
}

const getTypeTagType = (type: string) => {
  const types = {
    news: 'primary',
    knowledge: 'success',
    forum: 'warning',
    market: 'info'
  }
  return types[type as keyof typeof types] as any || 'info'
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('zh-CN')
}

const refreshQuote = () => {
  // 触发重新计算随机名言
  contentStore.fetchQuotes()
}

onMounted(() => {
  if (contentStore.banners.length === 0) {
    contentStore.initializeContent()
  }
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
}

.banner-section {
  .banner-item {
    position: relative;
    height: 100%;
    background-size: cover;
    background-position: center;
    cursor: pointer;

    .banner-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;

      .banner-content {
        text-align: center;
        color: white;
        max-width: 600px;
        padding: 0 20px;

        h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        p {
          font-size: 18px;
          margin-bottom: 24px;
          opacity: 0.9;
        }
      }
    }
  }
}

.quick-access {
  padding: 60px 0;
  background: white;

  .quick-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 24px;
  }

  .quick-item {
    text-align: center;
    padding: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    border: 1px solid var(--color-border-3);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-light);
      border-color: var(--primary-color);
    }

    .quick-icon {
      margin-bottom: 16px;
      color: var(--primary-color);
    }

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--color-text-1);
    }

    p {
      font-size: 14px;
      color: var(--color-text-2);
      margin: 0;
    }
  }
}

.main-content {
  padding: 60px 0;
  background: var(--color-bg-1);

  .content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

.bottom-section {
  padding: 60px 0;
  background: white;

  .bottom-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
  }
}

.content-card {
  background: white;
  border-radius: 8px;
  box-shadow: var(--shadow-light);
  padding: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color-border-3);
    padding-bottom: 16px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-1);
      margin: 0;
    }
  }
}

.recommendations {
  .recommendation-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border-3);
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: var(--color-bg-2);
      border-radius: 6px;
      padding-left: 12px;
      padding-right: 12px;
    }

    &:last-child {
      border-bottom: none;
    }

    .rec-content {
      flex: 1;

      h4 {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: var(--color-text-1);
      }

      p {
        font-size: 12px;
        color: var(--color-text-2);
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .rec-reason {
        font-size: 11px;
        color: var(--primary-color);
      }
    }

    .rec-score {
      font-size: 12px;
      font-weight: 500;
      color: var(--color-success);
    }
  }
}

.news-list, .forum-list, .updates-list {
  .news-item, .forum-item, .update-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border-3);
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: var(--color-bg-2);
      border-radius: 6px;
      padding-left: 12px;
      padding-right: 12px;
    }

    &:last-child {
      border-bottom: none;
    }
  }
}

.news-item {
  .news-content {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--color-text-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      font-size: 12px;
      color: var(--color-text-2);
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .news-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: var(--color-text-3);
    }
  }
}

.forum-item {
  gap: 12px;

  .forum-content {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--color-text-1);
    }

    .forum-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: var(--color-text-2);
    }
  }

  .forum-tags {
    display: flex;
    gap: 4px;
  }
}

.update-item {
  gap: 12px;

  .update-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-color);
    flex-shrink: 0;
    margin-top: 8px;
  }

  .update-content {
    flex: 1;

    h4 {
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 4px;
      color: var(--color-text-1);
    }

    .update-time {
      font-size: 12px;
      color: var(--color-text-2);
    }
  }
}

.quote-content {
  blockquote {
    font-size: 16px;
    font-style: italic;
    color: var(--color-text-1);
    margin: 0 0 16px 0;
    padding-left: 16px;
    border-left: 4px solid var(--primary-color);
    line-height: 1.6;
  }

  .quote-author {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;

    strong {
      font-size: 14px;
      color: var(--color-text-1);
    }

    span {
      font-size: 12px;
      color: var(--color-text-2);
    }
  }

  .quote-context {
    font-size: 12px;
    color: var(--color-text-2);
    margin: 0;
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .main-content .content-grid,
  .bottom-section .bottom-grid {
    grid-template-columns: 1fr;
  }

  .quick-access .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>