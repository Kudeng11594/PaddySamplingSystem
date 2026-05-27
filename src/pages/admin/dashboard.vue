<script setup lang="ts">
import { ref } from 'vue'
import DesktopLayout from '../../layouts/DesktopLayout.vue'
import KpiCard from '../../components/KpiCard.vue'
import { mockDashboardDetail } from '../../api/mock/data'

const detail = ref(mockDashboardDetail)
const dateRange = ref('本周')
const ranges = ['今天', '本周', '本月']

const kpis = [
  { label: '今日预约', value: detail.value.todayAppointments, trend: `昨日 ${detail.value.yesterdayComparison.appointments}`, borderColor: '#FF6600' },
  { label: '已完成', value: detail.value.completedCount, trend: `昨日 ${detail.value.yesterdayComparison.completed}`, borderColor: '#2e7d32' },
  { label: '排队中', value: detail.value.queueingCount, borderColor: '#1565c0' },
  { label: '已取消', value: detail.value.cancelledCount, trend: `占 ${detail.value.cancelRate}`, borderColor: '#999' },
  { label: '平均等待', value: `${detail.value.avgWaitTime}min`, borderColor: '#e65100' },
  { label: '扦样通过率', value: `${detail.value.passRate}%`, borderColor: '#2e7d32' },
]

const insights = [
  { label: '平均扦样时间', value: `${detail.value.avgSamplingTime} 分钟` },
  { label: '高峰时段', value: detail.value.peakHours },
]
</script>

<template>
  <DesktopLayout>
    <template #title>数据看板</template>

    <div class="dashboard-actions">
      <div class="range-tabs">
        <button
          v-for="r in ranges"
          :key="r"
          class="range-tab"
          :class="{ active: dateRange === r }"
          @click="dateRange = r"
        >
          {{ r }}
        </button>
      </div>
    </div>

    <div class="kpi-grid">
      <KpiCard
        v-for="kpi in kpis"
        :key="kpi.label"
        :label="kpi.label"
        :value="kpi.value"
        :trend="kpi.trend"
        :border-color="kpi.borderColor"
      />
    </div>

    <div class="dashboard-grid">
      <div class="dash-card">
        <div class="dash-card-title">每日趋势</div>
        <div class="trend-chart">
          <div
            v-for="(point, i) in detail.dailyTrend"
            :key="i"
            class="trend-bar-wrap"
          >
            <div class="trend-bar" :class="{ today: point.isToday }">
              <div
                class="trend-fill"
                :style="{ height: (point.count / 12) * 100 + '%' }"
              />
            </div>
            <span class="trend-label">{{ point.date }}</span>
          </div>
        </div>
      </div>

      <div class="dash-card">
        <div class="dash-card-title">品种分布</div>
        <div class="variety-chart">
          <div
            v-for="item in detail.varietyDistribution"
            :key="item.variety"
            class="variety-legend-row"
          >
            <span class="variety-dot" :style="{ background: item.color }" />
            <span class="variety-legend-name">{{ item.variety }}</span>
            <span class="variety-legend-pct">{{ item.percentage }}%</span>
            <div class="variety-legend-bar">
              <div
                class="variety-legend-fill"
                :style="{ width: item.percentage + '%', background: item.color }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dash-card">
      <div class="dash-card-title">操作日志</div>
      <table class="log-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>车牌号</th>
            <th>操作</th>
            <th>操作人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, i) in detail.operationLogs" :key="i">
            <td>{{ log.datetime }}</td>
            <td>{{ log.licensePlate }}</td>
            <td>{{ log.activity }}</td>
            <td>{{ log.operator }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="insights-row">
      <div
        v-for="insight in insights"
        :key="insight.label"
        class="insight-chip"
      >
        <span class="insight-label">{{ insight.label }}</span>
        <span class="insight-value">{{ insight.value }}</span>
      </div>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.dashboard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.range-tabs {
  display: flex;
  gap: 0.25rem;
  background: #f0f0f0;
  border-radius: var(--radius-md, 6px);
  padding: 2px;
}

.range-tab {
  padding: 0.35rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  min-height: 30px;
}

.range-tab.active {
  background: white;
  color: var(--color-text, #333);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.dash-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1.25rem;
  border: 1px solid var(--color-border, #eee);
  margin-bottom: 1rem;
}

.dash-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 1rem;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  height: 120px;
}

.trend-bar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  height: 100%;
}

.trend-bar {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.trend-bar.today .trend-fill {
  background: #FF6600;
}

.trend-fill {
  width: 60%;
  max-width: 32px;
  background: #ffb380;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}

.trend-label {
  font-size: 0.7rem;
  color: var(--color-text-muted, #888);
  white-space: nowrap;
}

.variety-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.variety-legend-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.variety-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.variety-legend-name {
  width: 5rem;
  color: var(--color-text, #333);
}

.variety-legend-pct {
  width: 3rem;
  color: var(--color-text-muted, #888);
  text-align: right;
}

.variety-legend-bar {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.variety-legend-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.log-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.log-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  background: #fafafa;
  color: var(--color-text-secondary, #666);
  font-weight: 600;
  border-bottom: 1px solid var(--color-border, #eee);
}

.log-table td {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #f5f5f5);
  color: var(--color-text, #333);
}

.log-table tr:last-child td {
  border-bottom: none;
}

.insights-row {
  display: flex;
  gap: 1rem;
}

.insight-chip {
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.insight-label {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.insight-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #333);
}
</style>
