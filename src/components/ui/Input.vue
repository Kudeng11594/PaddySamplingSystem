<template><input class="input" :value="modelValue" @input="$emit('update:modelValue',($event.target as HTMLInputElement).value)" v-bind="$attrs"/></template>
<script setup lang="ts">
defineProps<{modelValue:string}>()
defineEmits(['update:modelValue'])
</script>
<style scoped>
.input{width:100%;padding:var(--space-sm) var(--space-md);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:.875rem}
.input:focus{outline:none;border-color:var(--color-primary)}
</style>
