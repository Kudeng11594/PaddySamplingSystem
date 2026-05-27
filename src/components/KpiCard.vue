<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  borderColor: string
  trend?: string
  trendColor?: string
}>()
</script>

<template>
  <div class="kpi-card" :style="{ borderLeftColor: borderColor }">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value">{{ value }}</div>
    <div v-if="trend" class="kpi-trend" :style="{ color: trendColor || '#999' }">{{ trend }}</div>
  </div>
</template>

<style scoped>
.kpi-card {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eeeeee);
  border-left: 3px solid;
}

.kpi-label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #888888);
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text, #333333);
  margin-top: 0.3rem;
}

.kpi-trend {
  font-size: 0.7rem;
  margin-top: 0.2rem;
}
</style>
