<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  color?: string
}>()
</script>

<template>
  <div class="metric-card">
    <div class="metric-value" :style="{ color: color || '#FF6600' }">{{ value }}</div>
    <div class="metric-label">{{ label }}</div>
  </div>
</template>

<style scoped>
.metric-card {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem;
  text-align: center;
  border: 1px solid var(--color-border, #eeeeee);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #888888);
  margin-top: 0.25rem;
}
</style>
