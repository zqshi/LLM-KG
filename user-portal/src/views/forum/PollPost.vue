<template>
  <div class="bg-neutral-100 text-neutral-700 min-h-screen font-inter">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 面包屑导航 -->
      <div class="text-sm text-gray-500 mb-6">
        <router-link to="/" class="hover:text-primary transition-colors">首页</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <router-link to="/forum" class="hover:text-primary transition-colors">论坛</router-link>
        <i class="fa fa-angle-right mx-2 text-gray-400 text-xs"></i>
        <span class="text-gray-700">投票帖</span>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm p-8 text-center">
        <div class="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <div class="text-gray-500">加载中...</div>
      </div>

      <!-- 主内容区域 -->
      <div v-else-if="pollPost" class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 投票帖主体 -->
        <div class="lg:col-span-3 space-y-6">
          <!-- 帖子头部 -->
          <div class="bg-white rounded-xl shadow-card overflow-hidden">
            <div class="gradient-bg p-6 text-white">
              <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div class="flex-1">
                  <!-- 标签 -->
                  <div class="flex flex-wrap items-center gap-2 mb-4">
                    <span class="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-white/20 text-white rounded-full backdrop-blur-sm">
                      <i class="fa fa-pie-chart"></i>
                      投票帖
                    </span>
                    <span v-if="pollPost.poll.hasRewards" class="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-orange-500/80 text-white rounded-full">
                      <i class="fa fa-trophy"></i>
                      有奖投票
                    </span>
                    <span :class="getStatusColorClass(pollPost.poll.status)" class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full">
                      {{ getStatusText(pollPost.poll.status) }}
                    </span>
                  </div>
                  
                  <!-- 标题 -->
                  <h1 class="text-2xl lg:text-3xl font-bold mb-4 text-balance leading-tight">
                    {{ pollPost.title }}
                  </h1>
                  
                  <!-- 投票信息 -->
                  <div class="flex flex-wrap items-center gap-4 text-sm text-white/90">
                    <span class="flex items-center gap-1">
                      <i class="fa fa-users"></i>
                      {{ pollPost.poll.participantCount }} 人参与
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="fa fa-clock-o"></i>
                      {{ formatDateTime(pollPost.poll.endTime) }} 结束
                    </span>
                    <span v-if="pollPost.poll.status === 'ongoing'" class="flex items-center gap-1 text-yellow-200">
                      <i class="fa fa-hourglass-half"></i>
                      {{ getTimeRemaining() }}
                    </span>
                  </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="flex items-center gap-2">
                  <button
                    @click="toggleLike"
                    :class="isLiked ? 'bg-red-500/80' : 'bg-white/20 hover:bg-white/30'"
                    class="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-all text-white"
                  >
                    <i :class="isLiked ? 'fa fa-heart text-red-300' : 'fa fa-heart-o'"></i>
                    {{ pollPost.likeCount }}
                  </button>
                  
                  <button
                    @click="sharePoll"
                    class="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm transition-all text-white"
                  >
                    <i class="fa fa-share"></i>
                    分享
                  </button>
                </div>
              </div>
            </div>

            <!-- 作者信息 -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center gap-4">
                <img :src="pollPost.author.avatar" :alt="pollPost.author.name" class="w-12 h-12 rounded-full object-cover">
                <div class="flex-1">
                  <div class="font-semibold text-gray-900">{{ pollPost.author.name }}</div>
                  <div class="text-sm text-gray-600">{{ pollPost.author.department }}</div>
                </div>
                <div class="text-right text-sm text-gray-500">
                  <div>发布于 {{ formatDateTime(pollPost.createTime) }}</div>
                </div>
              </div>
            </div>

            <!-- 帖子内容 -->
            <div v-if="pollPost.content" class="p-6 prose prose-gray max-w-none border-b border-gray-100">
              <div class="text-gray-800 leading-relaxed" v-html="pollPost.content"></div>
            </div>

            <!-- 投票区域 -->
            <div class="p-6">
              <div class="text-center mb-6">
                <h2 class="text-xl font-bold text-gray-900 mb-3">{{ pollPost.poll.question }}</h2>
                <div class="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <span class="flex items-center gap-1">
                    <i class="fa fa-list"></i>
                    {{ pollPost.poll.isMultiChoice ? '多选投票' : '单选投票' }}
                    <span v-if="pollPost.poll.maxChoices" class="text-gray-500">(最多{{ pollPost.poll.maxChoices }}个)</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="fa fa-users"></i>
                    {{ pollPost.poll.participantCount }} 人参与
                  </span>
                </div>
              </div>

              <!-- 投票表单（未投票状态） -->
              <div v-if="!pollPost.poll.userVoted && pollPost.poll.canVote && pollPost.poll.status === 'ongoing'" class="space-y-4">
                <div
                  v-for="option in pollPost.poll.options"
                  :key="option.id"
                  @click="toggleOption(option.id)"
                  class="group p-4 border-2 border-gray-200 rounded-xl cursor-pointer transition-all hover:border-primary hover:shadow-md bg-gradient-to-r hover:from-primary/5 hover:to-transparent"
                  :class="{
                    'border-primary bg-primary/5': pollPost.poll.isMultiChoice ? selectedOptionIds.includes(option.id) : selectedOptions[0] === option.id
                  }"
                >
                  <div class="flex items-start gap-4">
                    <div class="flex-shrink-0 mt-1">
                      <input
                        v-if="!pollPost.poll.isMultiChoice"
                        :checked="selectedOptions[0] === option.id"
                        type="radio"
                        :name="'poll-option-' + pollPost.id"
                        class="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                        @click.stop
                      >
                      <input
                        v-else
                        :checked="selectedOptionIds.includes(option.id)"
                        type="checkbox"
                        class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        @click.stop
                      >
                    </div>
                    
                    <div class="flex-1">
                      <div class="font-medium text-gray-900 mb-1">{{ option.text }}</div>
                      <div v-if="option.description" class="text-sm text-gray-600 mb-2">{{ option.description }}</div>
                      <div v-if="option.image" class="mt-3">
                        <img :src="option.image" alt="选项图片" class="w-48 h-28 object-cover rounded-lg">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="text-center mt-8">
                  <button
                    @click="submitVote"
                    :disabled="!hasValidSelection || voting"
                    class="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                  >
                    <span v-if="voting" class="flex items-center gap-2">
                      <div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      提交中...
                    </span>
                    <span v-else>提交投票</span>
                  </button>
                  <div class="flex items-center justify-center gap-2 text-sm text-gray-500 mt-3">
                    <i class="fa fa-info-circle"></i>
                    <span>投票后无法修改，请仔细选择</span>
                  </div>
                </div>
              </div>

              <!-- 投票结果（已投票或结束状态） -->
              <div v-else-if="pollPost.poll.canViewResult">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-semibold text-gray-900">投票结果</h3>
                  <div class="flex items-center gap-4 text-sm text-gray-600">
                    <span>总投票数：{{ pollPost.poll.totalVoters }}</span>
                    <span>参与人数：{{ pollPost.poll.participantCount }}</span>
                  </div>
                </div>

                <div class="space-y-4">
                  <div
                    v-for="(option, index) in pollPost.poll.options"
                    :key="option.id"
                    class="p-4 bg-white border border-gray-200 rounded-xl"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-3">
                        <span class="font-medium text-gray-900">{{ option.text }}</span>
                        <span 
                          v-if="pollPost.poll.userVoted && pollPost.poll.userChoices.includes(option.id)"
                          class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                        >
                          <i class="fa fa-check"></i>
                          我的选择
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-sm">
                        <span class="font-semibold text-gray-900">{{ option.count }} 票</span>
                        <span class="text-gray-500">{{ option.percent.toFixed(1) }}%</span>
                      </div>
                    </div>
                    
                    <!-- 自定义进度条 -->
                    <div class="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div 
                        class="h-3 rounded-full transition-all duration-500 ease-out"
                        :style="{ 
                          width: option.percent + '%', 
                          background: `linear-gradient(90deg, ${getProgressColor(index)}, ${getProgressColor(index)}88)` 
                        }"
                      ></div>
                    </div>
                    
                    <div v-if="option.description" class="text-sm text-gray-600 mt-2">{{ option.description }}</div>
                  </div>
                </div>
              </div>

              <!-- 无权查看结果 -->
              <div v-else class="text-center py-12">
                <i class="fa fa-lock text-4xl text-gray-300 mb-4"></i>
                <div class="text-gray-500">投票结束后可查看结果</div>
              </div>
            </div>
          </div>

          <!-- 奖励信息 -->
          <div v-if="pollPost.poll.hasRewards" class="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-6 mb-6">
            <div class="text-center mb-4">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center justify-center gap-2">
                <i class="fa fa-gift text-orange-500"></i>
                投票奖励
              </h3>
            </div>
            
            <div class="space-y-3">
              <div
                v-for="reward in pollPost.poll.rewards"
                :key="reward.id"
                class="flex items-center gap-4 p-3 bg-white/80 rounded-lg backdrop-blur-sm"
              >
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" :class="{
                  'bg-blue-500': reward.type === 'points',
                  'bg-yellow-500': reward.type === 'badge',
                  'bg-green-500': reward.type === 'gift',
                  'bg-purple-500': reward.type === 'other'
                }">
                  <i v-if="reward.type === 'points'" class="fa fa-star"></i>
                  <i v-else-if="reward.type === 'badge'" class="fa fa-trophy"></i>
                  <i v-else-if="reward.type === 'gift'" class="fa fa-gift"></i>
                  <i v-else class="fa fa-ticket"></i>
                </div>
                
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ reward.name }}</div>
                  <div class="text-sm text-gray-600">{{ reward.description }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ getRewardConditionText(reward.condition) }}
                    <span v-if="reward.value" class="text-orange-600 font-medium ml-1">（价值：{{ reward.value }}）</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 投票统计信息 -->
          <div v-if="pollPost.poll.canViewResult" class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">详细统计</h3>
              <button 
                @click="statisticsVisible = !statisticsVisible"
                class="text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                {{ statisticsVisible ? '收起' : '展开' }}
                <i class="fa fa-angle-down transition-transform" :class="{ 'rotate-180': statisticsVisible }"></i>
              </button>
            </div>
            
            <div v-if="statisticsVisible" class="border-t border-gray-100 pt-4">
              <PollStatistics :poll-id="pollPost.id" />
            </div>
          </div>

          <!-- 评论区域 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">
                讨论 <span class="text-gray-500 font-normal">({{ pollPost?.replyCount || 0 }})</span>
              </h3>
              <button 
                v-if="pollPost"
                @click="showCommentForm = !showCommentForm"
                class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                {{ showCommentForm ? '取消评论' : '参与讨论' }}
              </button>
            </div>

            <!-- 评论表单 -->
            <div v-if="showCommentForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
              <textarea
                v-model="commentContent"
                placeholder="说说你的看法..."
                rows="3"
                maxlength="500"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
              />
              <div class="flex justify-between items-center mt-3">
                <span class="text-xs text-gray-400">{{ commentContent.length }}/500</span>
                <div class="flex gap-2">
                  <button @click="showCommentForm = false" class="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    取消
                  </button>
                  <button 
                    @click="submitComment" 
                    :disabled="commenting || !commentContent.trim()"
                    class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span v-if="commenting">发布中...</span>
                    <span v-else>发布评论</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 评论列表 -->
            <div class="space-y-4">
              <!-- 评论列表将在这里显示 -->
              <div class="text-center text-gray-500 py-8">
                暂无评论，来发表你的看法吧！
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧侧边栏 -->
        <div class="lg:col-span-1 space-y-6">
          <!-- 投票状态卡片 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h4 class="font-semibold text-gray-900 mb-4">投票状态</h4>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">投票状态</span>
                <span :class="getStatusColorClass(pollPost.poll.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ getStatusText(pollPost.poll.status) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">总投票数</span>
                <span class="font-medium">{{ pollPost.poll.totalVoters }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">参与人数</span>
                <span class="font-medium">{{ pollPost.poll.participantCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">投票类型</span>
                <span class="font-medium">{{ pollPost.poll.isMultiChoice ? '多选' : '单选' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">结束时间</span>
                <span class="font-medium">{{ formatDateTime(pollPost.poll.endTime) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 创建者信息 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h4 class="font-semibold text-gray-900 mb-4">创建者</h4>
            <div class="text-center">
              <img :src="pollPost.author.avatar" :alt="pollPost.author.name" class="w-16 h-16 rounded-full mx-auto mb-3 object-cover">
              <h5 class="font-semibold text-gray-900">{{ pollPost.author.name }}</h5>
              <p class="text-sm text-gray-600 mb-3">{{ pollPost.author.department }}</p>
              <button class="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors">
                <i class="fa fa-plus mr-2"></i>关注
              </button>
            </div>
          </div>
          
          <!-- 相关投票 -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h4 class="font-semibold text-gray-900 mb-4">相关投票</h4>
            <div class="space-y-3">
              <div class="flex gap-3">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">公司团建活动选择</h5>
                  <div class="text-xs text-gray-500">2天前 · 145人参与</div>
                </div>
              </div>
              
              <div class="flex gap-3">
                <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex-shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-sm font-medium text-gray-900 line-clamp-2 mb-1">新办公室装修风格投票</h5>
                  <div class="text-xs text-gray-500">1周前 · 89人参与</div>
                </div>
              </div>
            </div>
          </div>
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

const getStatusColorClass = (status: string) => {
  const colorClasses: Record<string, string> = {
    ongoing: 'bg-green-100 text-green-800',
    ended: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colorClasses[status] || 'bg-gray-100 text-gray-800'
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

<style scoped>
:root {
  --primary: #165DFF;
  --secondary: #36CFC9;
  --neutral-100: #F5F7FA;
  --neutral-200: #E5E6EB;
  --neutral-300: #C9CDD4;
  --neutral-400: #86909C;
  --neutral-500: #4E5969;
  --neutral-600: #272E3B;
  --neutral-700: #1D2129;
}

.font-inter {
  font-family: 'Inter', system-ui, sans-serif;
}

.bg-neutral-100 {
  background-color: var(--neutral-100);
}

.text-neutral-700 {
  color: var(--neutral-700);
}

.text-primary {
  color: var(--primary);
}

.bg-primary {
  background-color: var(--primary);
}

.hover\:text-primary:hover {
  color: var(--primary);
}

.hover\:bg-primary\/90:hover {
  background-color: rgba(22, 93, 255, 0.9);
}

.bg-primary\/5 {
  background-color: rgba(22, 93, 255, 0.05);
}

.border-primary {
  border-color: var(--primary);
}

.hover\:border-primary:hover {
  border-color: var(--primary);
}

.shadow-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.shadow-hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.gradient-bg {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
}

.transition-custom {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.text-balance {
  text-wrap: balance;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.focus\:ring-primary:focus {
  --tw-ring-color: var(--primary);
  --tw-ring-opacity: 0.5;
  box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.1);
}

.focus\:border-primary:focus {
  border-color: var(--primary);
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.rotate-180 {
  transform: rotate(180deg);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.prose {
  max-width: none;
}

.prose :deep(p) {
  margin-bottom: 1em;
}

.prose :deep(h1) {
  font-size: 1.5em;
  font-weight: 700;
  margin-bottom: 0.5em;
}

.prose :deep(h2) {
  font-size: 1.25em;
  font-weight: 600;
  margin-bottom: 0.5em;
}

.prose :deep(ul) {
  list-style-type: disc;
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.prose :deep(ol) {
  list-style-type: decimal;
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--primary);
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
  font-size: 0.875em;
}

.prose :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1em;
  border-radius: 0.5em;
  overflow-x: auto;
  margin: 1em 0;
}

@media (max-width: 1024px) {
  .lg\:col-span-3 {
    grid-column: span 1;
  }
  
  .lg\:col-span-1 {
    grid-column: span 1;
  }
  
  .lg\:grid-cols-4 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .lg\:flex-row {
    flex-direction: column;
  }
  
  .lg\:items-center {
    align-items: stretch;
  }
  
  .lg\:text-3xl {
    font-size: 1.5rem;
  }
}
</style>