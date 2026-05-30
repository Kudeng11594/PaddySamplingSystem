<script setup lang="ts">
defineProps<{
  options: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function select(option: string) {
  emit('update:modelValue', option)
}
</script>

<template>
  <div class="tag-selector">
    <button
      v-for="option in options"
      :key="option"
      class="tag"
      :class="{ selected: modelValue === option }"
      @click="select(option)"
    >
      {{ option }}
    </button>
  </div>
</template>

<style scoped>
.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border, #eeeeee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  background: var(--color-surface, #ffffff);
  color: var(--color-text, #333333);
  cursor: pointer;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.tag.selected {
  background: #FF6600;
  color: white;
  border-color: #FF6600;
}
</style>
