<template>
  <div class="poll-post-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-header">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回论坛
        </el-button>
      </div>

      <!-- 投票帖内容 -->
      <div v-if="loading" class="loading">
        <el-skeleton :rows="8" animated />
      </div>

      <div v-else-if="pollPost" class="poll-content">
        <!-- 帖子头部信息 -->
        <div class="post-header">
          <div class="header-left">
            <h1 class="post-title">{{ pollPost.title }}</h1>
            <div class="post-badges">
              <el-tag type="primary" size="small">
                <el-icon><DataBoard /></el-icon>
                投票帖
              </el-tag>
              <el-tag v-if="pollPost.poll.hasRewards" type="warning" size="small">
                <el-icon><Trophy /></el-icon>
                有奖投票
              </el-tag>
              <el-tag :type="getStatusType(pollPost.poll.status)" size="small">
                {{ getStatusText(pollPost.poll.status) }}
              </el-tag>
            </div>
          </div>
          
          <div class="post-actions">
            <el-button :icon="Star" @click="toggleLike" :type="isLiked ? 'primary' : 'default'">
              {{ pollPost.likeCount }}
            </el-button>
            <el-button :icon="Share" @click="sharePoll">分享</el-button>
            <el-dropdown @command="handleMoreAction">
              <el-button :icon="More" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="favorite">收藏</el-dropdown-item>
                  <el-dropdown-item command="report" divided>举报</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 作者信息和发布时间 -->
        <div class="post-meta">
          <div class="author-info">
            <el-avatar :size="48" :src="pollPost.author.avatar" />
            <div class="author-details">
              <div class="author-name">{{ pollPost.author.name }}</div>
              <div class="author-dept">{{ pollPost.author.department }}</div>
            </div>
          </div>
          
          <div class="time-info">
            <div class="create-time">发布时间：{{ formatDateTime(pollPost.createTime) }}</div>
            <div class="poll-time">
              投票时间：{{ formatDateTime(pollPost.poll.startTime) }} - {{ formatDateTime(pollPost.poll.endTime) }}
            </div>
            <div v-if="pollPost.poll.status === 'ongoing'" class="countdown">
              <el-icon><Timer /></el-icon>
              距离结束还剩：{{ getTimeRemaining() }}
            </div>
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="post-content" v-html="pollPost.content"></div>

        <!-- 投票区域 -->
        <div class="poll-section">
          <div class="poll-header">
            <h2>{{ pollPost.poll.question }}</h2>
            <div class="poll-info">
              <span class="vote-type">
                {{ pollPost.poll.isMultiChoice ? '多选投票' : '单选投票' }}
                <span v-if="pollPost.poll.maxChoices">(最多{{ pollPost.poll.maxChoices }}个选项)</span>
              </span>
              <span class="participant-count">{{ pollPost.poll.participantCount }} 人参与</span>
            </div>
          </div>

          <!-- 投票表单（未投票状态） -->
          <div v-if="!pollPost.poll.userVoted && pollPost.poll.canVote && pollPost.poll.status === 'ongoing'" class="voting-form">
            <div class="vote-options">
              <div
                v-for="option in pollPost.poll.options"
                :key="option.id"
                class="vote-option"
                @click="toggleOption(option.id)"
              >
                <div class="option-selector">
                  <el-radio
                    v-if="!pollPost.poll.isMultiChoice"
                    v-model="selectedOptions[0]"
                    :label="option.id"
                    @click.stop
                  />
                  <el-checkbox
                    v-else
                    v-model="selectedOptionIds"
                    :label="option.id"
                    @click.stop
                  />
                </div>
                
                <div class="option-content">
                  <div class="option-text">{{ option.text }}</div>
                  <div v-if="option.description" class="option-description">{{ option.description }}</div>
                  <div v-if="option.image" class="option-image">
                    <el-image :src="option.image" fit="cover" style="width: 200px; height: 120px; border-radius: 6px;" />
                  </div>
                </div>
              </div>
            </div>

            <div class="vote-actions">
              <el-button 
                type="primary" 
                size="large" 
                @click="submitVote" 
                :loading="voting"
                :disabled="!hasValidSelection"
              >
                提交投票
              </el-button>
              <div class="vote-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>投票后无法修改，请仔细选择</span>
              </div>
            </div>
          </div>

          <!-- 投票结果（已投票或结束状态） -->
          <div v-else-if="pollPost.poll.canViewResult" class="vote-results">
            <div class="results-header">
              <h3>投票结果</h3>
              <div class="results-stats">
                <span>总投票数：{{ pollPost.poll.totalVoters }}</span>
                <span>参与人数：{{ pollPost.poll.participantCount }}</span>
              </div>
            </div>

            <div class="results-chart">
              <div
                v-for="(option, index) in pollPost.poll.options"
                :key="option.id"
                class="result-item"
              >
                <div class="result-header">
                  <div class="option-info">
                    <span class="option-text">{{ option.text }}</span>
                    <span 
                      v-if="pollPost.poll.userVoted && pollPost.poll.userChoices.includes(option.id)"
                      class="my-choice"
                    >
                      <el-icon><Check /></el-icon>
                      我的选择
                    </span>
                  </div>
                  <div class="vote-stats">
                    <span class="vote-count">{{ option.count }} 票</span>
                    <span class="vote-percentage">{{ option.percent.toFixed(1) }}%</span>
                  </div>
                </div>
                
                <div class="progress-bar">
                  <el-progress
                    :percentage="option.percent"
                    :color="getProgressColor(index)"
                    :stroke-width="20"
                    :show-text="false"
                  />
                </div>
                
                <div v-if="option.description" class="option-description">{{ option.description }}</div>
              </div>
            </div>
          </div>

          <!-- 无权查看结果 -->
          <div v-else class="no-permission">
            <el-empty description="投票结束后可查看结果" />
          </div>
        </div>

        <!-- 奖励信息 -->
        <div v-if="pollPost.poll.hasRewards" class="rewards-section">
          <div class="rewards-header">
            <h3>
              <el-icon><Gift /></el-icon>
              投票奖励
            </h3>
          </div>
          
          <div class="rewards-list">
            <div
              v-for="reward in pollPost.poll.rewards"
              :key="reward.id"
              class="reward-item"
            >
              <div class="reward-icon">
                <el-icon v-if="reward.type === 'points'"><Star /></el-icon>
                <el-icon v-else-if="reward.type === 'badge'"><Trophy /></el-icon>
                <el-icon v-else-if="reward.type === 'gift'"><Gift /></el-icon>
                <el-icon v-else><Ticket /></el-icon>
              </div>
              
              <div class="reward-content">
                <div class="reward-name">{{ reward.name }}</div>
                <div class="reward-description">{{ reward.description }}</div>
                <div class="reward-condition">
                  {{ getRewardConditionText(reward.condition) }}
                  <span v-if="reward.value" class="reward-value">（价值：{{ reward.value }}）</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 投票统计信息 -->
        <div v-if="pollPost.poll.canViewResult && statisticsVisible" class="statistics-section">
          <div class="statistics-header">
            <h3>详细统计</h3>
            <el-button text @click="statisticsVisible = !statisticsVisible">
              {{ statisticsVisible ? '收起' : '展开' }}
              <el-icon><ArrowDown /></el-icon>
            </el-button>
          </div>
          
          <!-- 统计图表将在这里显示 -->
          <div class="statistics-content">
            <PollStatistics :poll-id="pollPost.id" />
          </div>
        </div>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <div class="comments-header">
          <h3>讨论 ({{ pollPost?.replyCount || 0 }})</h3>
          <el-button v-if="pollPost" @click="showCommentForm = !showCommentForm">
            {{ showCommentForm ? '取消评论' : '参与讨论' }}
          </el-button>
        </div>

        <!-- 评论表单 -->
        <div v-if="showCommentForm" class="comment-form">
          <el-input
            v-model="commentContent"
            type="textarea"
            :rows="3"
            placeholder="说说你的看法..."
            maxlength="500"
            show-word-limit
          />
          <div class="comment-actions">
            <el-button @click="showCommentForm = false">取消</el-button>
            <el-button type="primary" @click="submitComment" :loading="commenting">发布评论</el-button>
          </div>
        </div>

        <!-- 评论列表 -->
        <div class="comments-list">
          <!-- 评论列表将在这里显示 -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { PollPost, SubmitVoteForm } from '@/types'
import PollAPI, { PollContentAPI } from '@/api/poll'
import PollStatistics from '../../components/PollStatistics.vue'
import {
  ArrowLeft, DataBoard, Trophy, Timer, Star, Share, More, Gift,
  Check, InfoFilled, ArrowDown, Ticket
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const voting = ref(false)
const commenting = ref(false)
const pollPost = ref<PollPost | null>(null)
const selectedOptions = ref<number[]>([])
const selectedOptionIds = ref<number[]>([])
const isLiked = ref(false)
const statisticsVisible = ref(false)
const showCommentForm = ref(false)
const commentContent = ref('')

// 计算属性
const pollId = computed(() => route.params.id as string)

const hasValidSelection = computed(() => {
  if (!pollPost.value) return false
  
  if (pollPost.value.poll.isMultiChoice) {
    const maxChoices = pollPost.value.poll.maxChoices || pollPost.value.poll.options.length
    return selectedOptionIds.value.length > 0 && selectedOptionIds.value.length <= maxChoices
  } else {
    return selectedOptions.value.length > 0
  }
})

// 进度条颜色
const progressColors = [
  '#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399',
  '#FF6B9D', '#4FACFE', '#43E97B', '#FA709A', '#6C5CE7'
]

// 方法
const loadPollPost = async () => {
  try {
    const response = await PollAPI.getPollPost(pollId.value)
    pollPost.value = response.data
    
    // 如果用户已投票，设置选中状态
    if (response.data.poll.userVoted) {
      selectedOptions.value = response.data.poll.userChoices
      selectedOptionIds.value = response.data.poll.userChoices
    }
  } catch (error) {
    ElMessage.error('加载投票帖失败')
    console.error('加载投票帖失败:', error)
  } finally {
    loading.value = false
  }
}

const toggleOption = (optionId: number) => {
  if (!pollPost.value || pollPost.value.poll.userVoted || pollPost.value.poll.status !== 'ongoing') {
    return
  }

  if (pollPost.value.poll.isMultiChoice) {
    const index = selectedOptionIds.value.indexOf(optionId)
    const maxChoices = pollPost.value.poll.maxChoices || pollPost.value.poll.options.length
    
    if (index > -1) {
      selectedOptionIds.value.splice(index, 1)
    } else if (selectedOptionIds.value.length < maxChoices) {
      selectedOptionIds.value.push(optionId)
    } else {
      ElMessage.warning(`最多只能选择${maxChoices}个选项`)
    }
  } else {
    selectedOptions.value = [optionId]
  }
}

const submitVote = async () => {
  if (!pollPost.value || !hasValidSelection.value) return

  try {
    await ElMessageBox.confirm(
      '确定提交投票吗？投票后无法修改。',
      '确认投票',
      { type: 'warning' }
    )

    voting.value = true
    
    const voteForm: SubmitVoteForm = {
      pollId: pollId.value,
      optionIds: pollPost.value.poll.isMultiChoice ? selectedOptionIds.value : selectedOptions.value
    }

    const response = await PollAPI.submitVote(voteForm)
    
    if (response.data.success) {
      ElMessage.success('投票提交成功！')
      
      // 显示获得的奖励
      if (response.data.rewardEarned) {
        ElMessage({
          message: `恭喜获得奖励：${response.data.rewardEarned.name}`,
          type: 'success',
          duration: 5000
        })
      }
      
      // 重新加载投票数据
      await loadPollPost()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('投票提交失败')
    }
  } finally {
    voting.value = false
  }
}

const toggleLike = async () => {
  if (!pollPost.value) return

  try {
    const response = await PollContentAPI.likePollPost(pollPost.value.id)
    isLiked.value = response.data.liked
    pollPost.value.likeCount = response.data.likeCount
    
    ElMessage.success(response.data.liked ? '点赞成功' : '取消点赞')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const sharePoll = async () => {
  if (!pollPost.value) return

  try {
    const response = await PollAPI.sharePoll(pollPost.value.id, 'link')
    
    // 复制链接到剪贴板
    await navigator.clipboard.writeText(response.data.shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch (error) {
    ElMessage.error('分享失败')
  }
}

const handleMoreAction = async (command: string) => {
  if (!pollPost.value) return

  switch (command) {
    case 'favorite':
      try {
        await PollContentAPI.favoritePollPost(pollPost.value.id)
        ElMessage.success('收藏成功')
      } catch (error) {
        ElMessage.error('收藏失败')
      }
      break
      
    case 'report':
      try {
        const reason = await ElMessageBox.prompt('请说明举报原因', '举报投票帖')
        await PollAPI.reportPoll(pollPost.value.id, reason.value)
        ElMessage.success('举报提交成功')
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('举报失败')
        }
      }
      break
  }
}

const submitComment = async () => {
  if (!pollPost.value || !commentContent.value.trim()) return

  commenting.value = true
  try {
    await PollContentAPI.commentPollPost(pollPost.value.id, commentContent.value)
    ElMessage.success('评论发布成功')
    commentContent.value = ''
    showCommentForm.value = false
    // TODO: 刷新评论列表
  } catch (error) {
    ElMessage.error('评论发布失败')
  } finally {
    commenting.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    ongoing: 'success',
    ended: 'info',
    scheduled: 'primary',
    cancelled: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    ongoing: '进行中',
    ended: '已结束',
    scheduled: '未开始',
    cancelled: '已取消'
  }
  return textMap[status] || status
}

const getProgressColor = (index: number) => {
  return progressColors[index % progressColors.length]
}

const getRewardConditionText = (condition: string) => {
  const textMap: Record<string, string> = {
    participate: '参与即可获得',
    winner: '选择获胜选项',
    all_participants: '所有参与者'
  }
  return textMap[condition] || condition
}

const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTimeRemaining = () => {
  if (!pollPost.value) return ''
  
  const endTime = new Date(pollPost.value.poll.endTime)
  const now = new Date()
  const diff = endTime.getTime() - now.getTime()
  
  if (diff <= 0) return '已结束'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

// 生命周期
onMounted(() => {
  loadPollPost()
})
</script>

<style scoped lang="scss">
.poll-post-page {
  min-height: 100vh;
  background: var(--el-bg-color-page);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-header {
  margin-bottom: 20px;
}

.loading {
  text-align: center;
  padding: 40px 0;
}

.poll-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: var(--el-box-shadow-light);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .post-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin: 0 0 16px 0;
    line-height: 1.3;
  }

  .post-badges {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .post-actions {
    display: flex;
    gap: 8px;
  }
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;

  .author-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .author-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .author-dept {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .time-info {
    text-align: right;
    font-size: 14px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;

    .countdown {
      color: var(--el-color-warning);
      font-weight: 500;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 4px;
    }
  }
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
  margin-bottom: 32px;
}

.poll-section {
  background: var(--el-fill-color-extra-light);
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;

  .poll-header {
    text-align: center;
    margin-bottom: 32px;

    h2 {
      font-size: 24px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin: 0 0 12px 0;
    }

    .poll-info {
      display: flex;
      justify-content: center;
      gap: 24px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
}

.voting-form {
  .vote-options {
    .vote-option {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      margin-bottom: 16px;
      background: white;
      border: 2px solid var(--el-border-color-light);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
      }

      .option-content {
        flex: 1;

        .option-text {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }

        .option-description {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin-bottom: 12px;
        }

        .option-image {
          margin-top: 12px;
        }
      }
    }
  }

  .vote-actions {
    text-align: center;
    margin-top: 32px;

    .vote-tips {
      margin-top: 16px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
  }
}

.vote-results {
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      margin: 0;
      font-size: 20px;
      color: var(--el-text-color-primary);
    }

    .results-stats {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .result-item {
    margin-bottom: 24px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    border: 1px solid var(--el-border-color-light);

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .option-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .option-text {
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }

        .my-choice {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--el-color-success);
          background: var(--el-color-success-light-9);
          padding: 2px 8px;
          border-radius: 12px;
        }
      }

      .vote-stats {
        display: flex;
        gap: 12px;
        font-size: 14px;

        .vote-count {
          font-weight: 600;
          color: var(--el-text-color-primary);
        }

        .vote-percentage {
          color: var(--el-text-color-secondary);
        }
      }
    }

    .option-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-top: 12px;
    }
  }
}

.no-permission {
  text-align: center;
  padding: 40px 0;
}

.rewards-section {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;

  .rewards-header {
    text-align: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 20px;
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }

  .rewards-list {
    .reward-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 16px;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;

      .reward-icon {
        width: 40px;
        height: 40px;
        background: var(--el-color-primary);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .reward-content {
        flex: 1;

        .reward-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .reward-description {
          font-size: 14px;
          color: var(--el-text-color-regular);
          margin-bottom: 8px;
        }

        .reward-condition {
          font-size: 12px;
          color: var(--el-text-color-secondary);

          .reward-value {
            color: var(--el-color-warning);
            font-weight: 500;
          }
        }
      }
    }
  }
}

.statistics-section {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 32px;

  .statistics-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }
  }
}

.comments-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: var(--el-box-shadow-light);

  .comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    h3 {
      margin: 0;
      font-size: 18px;
      color: var(--el-text-color-primary);
    }
  }

  .comment-form {
    margin-bottom: 32px;

    .comment-actions {
      margin-top: 12px;
      text-align: right;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .poll-content {
    padding: 20px;
  }

  .post-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .post-meta {
    flex-direction: column;
    gap: 16px;

    .time-info {
      text-align: left;
    }
  }

  .poll-section {
    padding: 20px;
  }

  .results-header {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: flex-start !important;
  }

  .vote-option {
    flex-direction: column !important;
    align-items: flex-start !important;
  }
}
</style>