<script setup lang="ts">
import { ref } from 'vue'
import MobileLayout from '../../layouts/MobileLayout.vue'
import QueueTimeline from '../../components/QueueTimeline.vue'

const appointment = ref({
  number: '20260522-002',
  variety: '吉宏6',
  time: '2026-05-22 09:00',
  plate: '辽B67890',
  driver: '李师傅',
})

const queuePosition = ref(2)
const totalAhead = ref(1)
const estimatedWait = ref('约15分钟')
const currentStatus = ref('waiting')
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">排队状态</div>
    </template>

    <div class="info-card">
      <div class="info-row">
        <span class="info-label">预约编号</span>
        <span class="info-value">{{ appointment.number }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">品种</span>
        <span class="info-value">{{ appointment.variety }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">预约时间</span>
        <span class="info-value">{{ appointment.time }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">车牌号</span>
        <span class="info-value">{{ appointment.plate }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">驾驶员</span>
        <span class="info-value">{{ appointment.driver }}</span>
      </div>
    </div>

    <div class="position-card">
      <div class="position-number">{{ queuePosition }}</div>
      <div class="position-label">当前排队位置</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(totalAhead / (totalAhead + 1)) * 100}%` }" />
      </div>
      <div class="position-info">
        <span>前方 {{ totalAhead }} 位</span>
        <span>预计 {{ estimatedWait }}</span>
      </div>
    </div>

    <div class="timeline-section">
      <div class="section-title">进度跟踪</div>
      <QueueTimeline :current-status="currentStatus" />
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

.info-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #eee);
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.85rem;
}

.info-label {
  color: var(--color-text-muted, #888);
}

.info-value {
  color: var(--color-text, #333);
  font-weight: 500;
}

.position-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1.25rem;
  border: 1px solid var(--color-border, #eee);
  text-align: center;
  margin-bottom: 1rem;
}

.position-number {
  font-size: 3rem;
  font-weight: 700;
  color: #FF6600;
  line-height: 1;
}

.position-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  margin: 0.5rem 0;
}

.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #FF6600;
  border-radius: 3px;
  transition: width 0.3s;
}

.position-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.timeline-section {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.5rem;
}
</style>
