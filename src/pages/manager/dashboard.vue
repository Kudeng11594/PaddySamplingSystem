<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MobileLayout from '../../layouts/MobileLayout.vue'
import MetricCard from '../../components/MetricCard.vue'
import { getDashboardDetail, getQueue } from '../../api'
import type { DashboardDetail, QueueBoard } from '../../api/types'

const detail = ref<DashboardDetail>(null!)
const queueData = ref<QueueBoard>(null!)

const queueList = computed(() => {
  if (!queueData.value) return []
  return queueData.value.queue.map(item => ({
    rank: item.position,
    plate: item.licensePlate,
    driver: item.driverName,
    wait: `${Math.floor((Date.now() - new Date(item.queuedAt).getTime()) / 60000)}min`,
  }))
})

onMounted(async () => {
  detail.value = await getDashboardDetail()
  const q = await getQueue()
  queueData.value = q
})

const dateOptions = ['今天', '昨天', '本周']
const activeDate = ref('今天')

const todayStats = computed(() => [
  { label: '今日预约', value: detail.value.todayAppointments },
  { label: '已完成', value: detail.value.completedCount },
  { label: '排队中', value: detail.value.queueingCount },
  { label: '已取消', value: detail.value.cancelledCount },
])
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">管理看板</div>
    </template>

    <div class="date-tabs">
      <button
        v-for="opt in dateOptions"
        :key="opt"
        class="date-tab"
        :class="{ active: activeDate === opt }"
        @click="activeDate = opt"
      >
        {{ opt }}
      </button>
    </div>

    <div class="metric-grid">
      <MetricCard
        v-for="stat in todayStats"
        :key="stat.label"
        :label="stat.label"
        :value="stat.value"
      />
    </div>

    <div class="section-card">
      <div class="section-title">品种分布</div>
      <div class="variety-list">
        <div
          v-for="item in detail.varietyDistribution"
          :key="item.variety"
          class="variety-row"
        >
          <div class="variety-header">
            <span class="variety-name">{{ item.variety }}</span>
            <span class="variety-pct">{{ item.percentage }}%</span>
          </div>
          <div class="variety-bar">
            <div
              class="variety-fill"
              :style="{ width: item.percentage + '%', background: item.color }"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-title">实时排队</div>
      <div class="queue-list">
        <div
          v-for="item in queueList"
          :key="item.rank"
          class="queue-row"
        >
          <span class="queue-rank">#{{ item.rank }}</span>
          <span class="queue-plate">{{ item.plate }}</span>
          <span class="queue-driver">{{ item.driver }}</span>
          <span class="queue-wait">{{ item.wait }}</span>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<style scoped>
.page-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  padding: 0.75rem 0;
}

.date-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.date-tab {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  min-height: 36px;
}

.date-tab.active {
  background: #FF6600;
  color: white;
  border-color: #FF6600;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.75rem;
}

.variety-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.variety-row {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.variety-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.variety-name {
  color: var(--color-text, #333);
}

.variety-pct {
  color: var(--color-text-muted, #888);
}

.variety-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.variety-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.queue-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border, #f5f5f5);
  font-size: 0.85rem;
}

.queue-row:last-child {
  border-bottom: none;
}

.queue-rank {
  font-weight: 700;
  color: #FF6600;
  min-width: 1.5rem;
}

.queue-plate {
  flex: 1;
  color: var(--color-text, #333);
}

.queue-driver {
  color: var(--color-text-secondary, #666);
}

.queue-wait {
  color: var(--color-text-muted, #888);
  font-size: 0.8rem;
}
</style>
