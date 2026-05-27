<script setup lang="ts">
import { ref } from 'vue'
import MobileLayout from '../../layouts/MobileLayout.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { mockAppointments } from '../../api/mock/data'
import type { Appointment } from '../../api/types'

const searchKeyword = ref('')
const results = ref<Appointment[]>([])
const searched = ref(false)

function handleSearch() {
  searched.value = true
  if (!searchKeyword.value.trim()) {
    results.value = mockAppointments as unknown as Appointment[]
  } else {
    const kw = searchKeyword.value.toLowerCase()
    results.value = (mockAppointments as Appointment[]).filter(
      a => a.appointmentNo.toLowerCase().includes(kw) ||
           a.licensePlate.toLowerCase().includes(kw) ||
           a.driverName.includes(kw)
    )
  }
}
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">查询记录</div>
    </template>

    <div class="search-bar">
      <input
        v-model="searchKeyword"
        class="search-input"
        placeholder="预约编号 / 车牌号 / 驾驶员"
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">查询</button>
    </div>

    <div v-if="!searched" class="empty-state">请输入条件查询</div>

    <div v-else-if="results.length === 0" class="empty-state">暂无记录</div>

    <div v-else class="result-list">
      <div v-for="item in results" :key="item._id" class="result-card">
        <div class="card-header">
          <span class="card-number">{{ item.appointmentNo }}</span>
          <StatusBadge :status="item.status" />
        </div>
        <div class="card-detail">
          <span>{{ item.variety }}</span>
          <span>{{ item.appointmentDate }} {{ item.appointmentTime }}</span>
        </div>
        <div class="card-detail">
          <span>{{ item.licensePlate }}</span>
          <span>{{ item.driverName }}</span>
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

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  min-height: 44px;
}

.search-input:focus {
  border-color: #FF6600;
}

.search-btn {
  padding: 0.65rem 1rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: var(--color-text-placeholder, #999);
  padding: 3rem 0;
  font-size: 0.9rem;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #eee);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-number {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text, #333);
}

.card-detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
}
</style>
