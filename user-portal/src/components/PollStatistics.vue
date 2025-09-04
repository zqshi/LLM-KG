<template>
  <div class="poll-statistics">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="4" animated />
    </div>

    <div v-else-if="statistics" class="statistics-content">
      <!-- 基础统计信息 -->
      <div class="basic-stats">
        <div class="stat-item">
          <div class="stat-value">{{ statistics.totalVotes }}</div>
          <div class="stat-label">总投票数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.participantCount }}</div>
          <div class="stat-label">参与人数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ statistics.participationRate.toFixed(1) }}%</div>
          <div class="stat-label">参与率</div>
        </div>
      </div>

      <!-- 部门参与统计 -->
      <div v-if="statistics.departmentStats.length > 0" class="department-stats">
        <h4>部门参与情况</h4>
        <div class="department-chart">
          <div
            v-for="dept in statistics.departmentStats.slice(0, 5)"
            :key="dept.department"
            class="dept-item"
          >
            <div class="dept-info">
              <span class="dept-name">{{ dept.department }}</span>
              <span class="dept-count">{{ dept.voteCount }} 票</span>
            </div>
            <div class="dept-progress">
              <el-progress
                :percentage="dept.percentage"
                :stroke-width="8"
                :show-text="false"
                color="#409EFF"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 投票时间分布 -->
      <div v-if="statistics.hourlyStats.length > 0" class="time-stats">
        <h4>投票时间分布</h4>
        <div class="time-chart">
          <div
            v-for="hourStat in getFilteredHourlyStats()"
            :key="hourStat.hour"
            class="time-bar"
          >
            <div class="time-value">{{ hourStat.voteCount }}</div>
            <div
              class="time-bar-visual"
              :style="{
                height: `${(hourStat.voteCount / getMaxHourlyVotes()) * 60}px`,
                backgroundColor: '#67C23A'
              }"
            />
            <div class="time-label">{{ formatHourLabel(hourStat.hour) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data">
      <el-empty description="暂无统计数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { PollStatistics as PollStatisticsType } from '@/types'
import PollAPI from '@/api/poll'

// Props
interface Props {
  pollId: string
}

const props = defineProps<Props>()

// 响应式数据
const loading = ref(false)
const statistics = ref<PollStatisticsType | null>(null)

// 方法
const loadStatistics = async () => {
  if (!props.pollId) return
  
  loading.value = true
  try {
    const response = await PollAPI.getPollResult(props.pollId)
    statistics.value = response.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const getMaxHourlyVotes = () => {
  if (!statistics.value?.hourlyStats.length) return 1
  return Math.max(...statistics.value.hourlyStats.map(h => h.voteCount))
}

const getFilteredHourlyStats = () => {
  if (!statistics.value?.hourlyStats) return []
  
  // 只显示有投票的时段，最多显示12个
  return statistics.value.hourlyStats
    .filter(h => h.voteCount > 0)
    .slice(0, 12)
}

const formatHourLabel = (hour: string) => {
  // 假设hour格式为 "2024-01-01 14:00"
  const time = new Date(hour)
  return time.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 生命周期
onMounted(() => {
  loadStatistics()
})
</script>

<style scoped lang="scss">
.poll-statistics {
  .loading {
    text-align: center;
    padding: 20px 0;
  }

  .no-data {
    text-align: center;
    padding: 40px 0;
  }
}

.statistics-content {
  .basic-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 32px;

    .stat-item {
      text-align: center;
      padding: 16px;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: var(--el-color-primary);
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .department-stats {
    margin-bottom: 32px;

    h4 {
      font-size: 16px;
      color: var(--el-text-color-primary);
      margin: 0 0 16px 0;
    }

    .department-chart {
      .dept-item {
        margin-bottom: 12px;

        .dept-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .dept-name {
            font-size: 14px;
            color: var(--el-text-color-primary);
          }

          .dept-count {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
  }

  .time-stats {
    h4 {
      font-size: 16px;
      color: var(--el-text-color-primary);
      margin: 0 0 16px 0;
    }

    .time-chart {
      display: flex;
      align-items: end;
      justify-content: space-between;
      height: 100px;
      padding: 20px 0;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;

      .time-bar {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0 2px;

        .time-value {
          font-size: 10px;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
          min-height: 12px;
        }

        .time-bar-visual {
          width: 12px;
          border-radius: 2px;
          transition: height 0.3s ease;
          min-height: 2px;
          margin-bottom: 8px;
        }

        .time-label {
          font-size: 8px;
          color: var(--el-text-color-secondary);
          writing-mode: vertical-rl;
          text-orientation: mixed;
          max-height: 40px;
          overflow: hidden;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .basic-stats {
    grid-template-columns: 1fr !important;
  }

  .time-chart {
    .time-bar {
      .time-label {
        writing-mode: horizontal-tb !important;
        text-orientation: initial !important;
        max-height: none !important;
        font-size: 6px !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 20px;
      }
    }
  }
}
</style>