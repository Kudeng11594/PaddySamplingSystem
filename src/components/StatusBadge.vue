<script setup lang="ts">
import { computed } from 'vue'
import type { AppointmentStatus } from '../api/types'

const props = defineProps<{
  status: AppointmentStatus | string
}>()

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#f5f5f5', text: '#999999', label: '待取号' },
  token_assigned: { bg: '#e3f2fd', text: '#1565c0', label: '已取号' },
  waiting: { bg: '#e3f2fd', text: '#1565c0', label: '排队中' },
  called: { bg: '#fff3e0', text: '#e65100', label: '扦样中' },
  completed: { bg: '#e8f5e9', text: '#2e7d32', label: '已完成' },
  cancelled: { bg: '#f5f5f5', text: '#999999', label: '已取消' },
}

const style = computed(() => statusMap[props.status] ?? statusMap.pending)
</script>

<template>
  <span class="status-badge" :style="{ background: style.bg, color: style.text }">
    {{ style.label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
}
</style>
