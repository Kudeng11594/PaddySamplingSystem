<script setup lang="ts">
import { ref } from 'vue'
import DesktopLayout from '../../layouts/DesktopLayout.vue'
import { mockQueueBoardDisplay } from '../../api/mock/data'
import type { QueueBoardDisplay } from '../../api/types'

const board = ref<QueueBoardDisplay>(mockQueueBoardDisplay)

function statusText(s: string): string {
  const map: Record<string, string> = {
    sampling: '扦样中',
    called: '待扦样',
    waiting: '排队中',
  }
  return map[s] || s
}
</script>

<template>
  <DesktopLayout>
    <template #title>排队看板</template>

    <div class="board-grid">
      <div class="board-card current-sampling">
        <div class="board-card-title">当前扦样</div>
        <template v-if="board.currentSampling">
          <div class="sampling-plate">{{ board.currentSampling.licensePlate }}</div>
          <div class="sampling-info">
            <span>{{ board.currentSampling.driverName }}</span>
            <span>{{ board.currentSampling.variety }}</span>
          </div>
          <div class="sampling-status">扦样中</div>
        </template>
        <div v-else class="sampling-empty">暂无</div>
      </div>

      <div class="board-card next-card">
        <div class="board-card-title">即将扦样</div>
        <template v-if="board.nextInLine">
          <div class="next-plate">{{ board.nextInLine.licensePlate }}</div>
          <div class="next-info">
            <span>{{ board.nextInLine.driverName }}</span>
            <span>{{ board.nextInLine.variety }}</span>
          </div>
          <div class="next-wait">预计 {{ board.nextInLine.waitTimeMinutes }} 分钟后</div>
        </template>
        <div v-else class="sampling-empty">暂无</div>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-chip">
        今日预约 <strong>{{ board.todayStats.totalAppointments }}</strong>
      </div>
      <div class="stat-chip">
        已完成 <strong>{{ board.todayStats.completed }}</strong>
      </div>
      <div class="stat-chip">
        排队中 <strong>{{ board.todayStats.queueing }}</strong>
      </div>
      <div class="stat-chip">
        已取消 <strong>{{ board.todayStats.cancelled }}</strong>
      </div>
      <div class="stat-chip">
        平均等待 <strong>{{ board.avgWaitTime }}min</strong>
      </div>
      <div class="stat-chip">
        高峰时段 <strong>{{ board.peakHours }}</strong>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>排队号</th>
            <th>车牌号</th>
            <th>驾驶员</th>
            <th>品种</th>
            <th>等待时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in board.waitingQueue" :key="item.id">
            <td class="cell-token">{{ item.tokenNumber }}</td>
            <td>{{ item.licensePlate }}</td>
            <td>{{ item.driverName }}</td>
            <td>{{ item.variety }}</td>
            <td>{{ item.waitTimeMinutes }}min</td>
            <td>{{ statusText(item.status) }}</td>
          </tr>
          <tr v-if="board.waitingQueue.length === 0">
            <td colspan="6" class="cell-empty">队列为空</td>
          </tr>
        </tbody>
      </table>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.board-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.board-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1.25rem;
  border: 1px solid var(--color-border, #eee);
}

.board-card-title {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
  margin-bottom: 0.75rem;
}

.current-sampling {
  border-left: 4px solid #FF6600;
}

.next-card {
  border-left: 4px solid #2196f3;
}

.sampling-plate {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text, #333);
  margin-bottom: 0.25rem;
}

.sampling-info {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  margin-bottom: 0.5rem;
}

.sampling-status {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  background: #fff3e0;
  color: #e65100;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sampling-empty {
  color: var(--color-text-placeholder, #999);
  font-size: 0.85rem;
  padding: 0.5rem 0;
}

.next-plate {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text, #333);
  margin-bottom: 0.25rem;
}

.next-info {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  margin-bottom: 0.5rem;
}

.next-wait {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.stats-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.stat-chip {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
}

.stat-chip strong {
  color: var(--color-text, #333);
  margin-left: 0.25rem;
}

.table-wrap {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  border: 1px solid var(--color-border, #eee);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data-table th {
  text-align: left;
  padding: 0.65rem 0.75rem;
  background: #fafafa;
  color: var(--color-text-secondary, #666);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border, #eee);
}

.data-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #f5f5f5);
  color: var(--color-text, #333);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.cell-token {
  font-weight: 600;
  font-family: monospace;
}

.cell-empty {
  text-align: center;
  color: var(--color-text-placeholder, #999);
  padding: 2rem 0 !important;
}
</style>
