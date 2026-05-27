<script setup lang="ts">
import { ref, computed } from 'vue'
import DesktopLayout from '../../layouts/DesktopLayout.vue'
import StatusBadge from '../../components/StatusBadge.vue'
import { mockAppointments } from '../../api/mock/data'
import { mockVarieties } from '../../api/mock/data'

const keyword = ref('')
const statusFilter = ref('')
const varietyFilter = ref('')
const page = ref(1)
const pageSize = 10

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待取号' },
  { value: 'token_assigned', label: '已取号' },
  { value: 'waiting', label: '排队中' },
  { value: 'called', label: '扦样中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const filtered = computed(() => {
  let list = [...mockAppointments]
  const kw = keyword.value.toLowerCase().trim()
  if (kw) {
    list = list.filter(
      a =>
        a.appointmentNo.toLowerCase().includes(kw) ||
        a.licensePlate.toLowerCase().includes(kw) ||
        a.driverName.includes(kw)
    )
  }
  if (statusFilter.value) {
    list = list.filter(a => a.status === statusFilter.value)
  }
  if (varietyFilter.value) {
    list = list.filter(a => a.variety === varietyFilter.value)
  }
  return list
})

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize) || 1)

const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function resetPage() {
  page.value = 1
}
</script>

<template>
  <DesktopLayout>
    <template #title>预约列表</template>

    <div class="filter-bar">
      <input
        v-model="keyword"
        class="filter-input"
        placeholder="预约编号 / 车牌号 / 驾驶员"
        @input="resetPage"
      />
      <select v-model="statusFilter" class="filter-select" @change="resetPage">
        <option
          v-for="opt in statusOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
      <select v-model="varietyFilter" class="filter-select" @change="resetPage">
        <option value="">全部品种</option>
        <option v-for="v in mockVarieties" :key="v" :value="v">{{ v }}</option>
      </select>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>预约编号</th>
            <th>驾驶员</th>
            <th>车牌号</th>
            <th>品种</th>
            <th>预约时间</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paged" :key="item._id">
            <td class="cell-number">{{ item.appointmentNo }}</td>
            <td>{{ item.driverName }}</td>
            <td>{{ item.licensePlate }}</td>
            <td>{{ item.variety }}</td>
            <td>{{ item.appointmentDate }} {{ item.appointmentTime }}</td>
            <td><StatusBadge :status="item.status" /></td>
          </tr>
          <tr v-if="paged.length === 0">
            <td colspan="6" class="cell-empty">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <span class="page-info">
        共 {{ filtered.length }} 条，第 {{ page }} / {{ totalPages }} 页
      </span>
      <div class="page-actions">
        <button
          class="page-btn"
          :disabled="page <= 1"
          @click="page--"
        >
          上一页
        </button>
        <button
          class="page-btn"
          :disabled="page >= totalPages"
          @click="page++"
        >
          下一页
        </button>
      </div>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-input {
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  min-height: 36px;
}

.filter-input:focus {
  border-color: #FF6600;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  background: var(--color-surface, #fff);
  min-height: 36px;
  min-width: 120px;
}

.table-wrap {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  border: 1px solid var(--color-border, #eee);
  overflow: hidden;
  margin-bottom: 1rem;
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
  white-space: nowrap;
}

.data-table td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--color-border, #f5f5f5);
  color: var(--color-text, #333);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.cell-number {
  font-weight: 600;
  font-family: monospace;
}

.cell-empty {
  text-align: center;
  color: var(--color-text-placeholder, #999);
  padding: 2rem 0 !important;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-info {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.page-actions {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  font-size: 0.8rem;
  color: var(--color-text, #333);
  cursor: pointer;
  min-height: 32px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  border-color: #FF6600;
  color: #FF6600;
}
</style>
