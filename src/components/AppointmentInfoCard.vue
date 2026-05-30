<script setup lang="ts">
defineProps<{
  appointmentNumber: string
  driverName: string
  licensePlate: string
  variety: string
}>()
</script>

<template>
  <div class="appointment-info-card">
    <span>
      <span class="info-label">预约编号：</span>
      <span class="info-value">{{ appointmentNumber }}</span>
    </span>
    <span>
      <span class="info-label">驾驶员：</span>
      <span class="info-value">{{ driverName }}</span>
    </span>
    <span>
      <span class="info-label">车牌号：</span>
      <span class="info-value">{{ licensePlate }}</span>
    </span>
    <span>
      <span class="info-label">品种：</span>
      <span class="info-value">{{ variety }}</span>
    </span>
  </div>
</template>

<style scoped>
.appointment-info-card {
  background: #fff8f0;
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem 1rem;
  border: 1px solid #ffe0b2;
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  flex-wrap: wrap;
}

.info-label {
  color: var(--color-text-muted, #888888);
}

.info-value {
  font-weight: 600;
  color: var(--color-text, #333333);
}
</style>
