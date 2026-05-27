<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentStatus: string
}>()

interface TimelineStep {
  key: string
  label: string
}

const steps: TimelineStep[] = [
  { key: 'created', label: '预约成功' },
  { key: 'arrived', label: '已到厂' },
  { key: 'queueing', label: '排队中' },
  { key: 'sampling', label: '扦样中' },
  { key: 'completed', label: '已完成' },
]

const statusOrder: Record<string, number> = {
  pending: 0,
  token_assigned: 1,
  waiting: 2,
  called: 3,
  completed: 4,
}

const currentStepIndex = computed(() => {
  return statusOrder[props.currentStatus] ?? 0
})

function stepState(index: number): 'completed' | 'current' | 'future' {
  if (index < currentStepIndex.value) return 'completed'
  if (index === currentStepIndex.value) return 'current'
  return 'future'
}
</script>

<template>
  <div class="timeline">
    <div
      v-for="(step, index) in steps"
      :key="step.key"
      class="timeline-step"
      :class="stepState(index)"
    >
      <div class="step-indicator">
        <span v-if="stepState(index) === 'completed'" class="step-check">✓</span>
        <span v-else class="step-dot">{{ index + 1 }}</span>
      </div>
      <span class="step-label">{{ step.label }}</span>
      <div v-if="index < steps.length - 1" class="step-line" />
    </div>
  </div>
</template>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.timeline-step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0;
  position: relative;
}

.step-indicator {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  z-index: 1;
}

.step-check {
  color: white;
}

.step-dot {
  color: var(--color-text-muted, #888);
  font-size: 0.7rem;
}

.timeline-step.completed .step-indicator {
  background: #4caf50;
  color: white;
}

.timeline-step.current .step-indicator {
  background: #FF6600;
  color: white;
}

.timeline-step.future .step-indicator {
  background: #eeeeee;
  color: #999999;
}

.step-label {
  font-size: 0.85rem;
  color: var(--color-text, #333);
}

.timeline-step.future .step-label {
  color: var(--color-text-muted, #888);
}

.step-line {
  position: absolute;
  left: 13.5px;
  top: 34px;
  width: 1px;
  height: calc(100% - 8px);
  background: #eeeeee;
  z-index: 0;
}

.timeline-step.completed .step-line {
  background: #4caf50;
}

.timeline-step.current .step-line {
  background: #eeeeee;
}
</style>
