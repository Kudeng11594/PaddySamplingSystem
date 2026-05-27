<template><button class="btn" :class="[`btn-${variant}`,{'btn-disabled':disabled}]" :disabled="disabled"><slot/></button></template>
<script setup lang="ts">
defineProps<{ variant?: 'primary'|'secondary'|'danger'; disabled?: boolean }>()
</script>
<style scoped>
.btn{padding:var(--space-sm) var(--space-md);border-radius:var(--radius-md);border:none;cursor:pointer;font-size:.875rem}
.btn-primary{background:var(--color-primary);color:white}
.btn-secondary{background:var(--color-bg);border:1px solid var(--color-border)}
.btn-danger{background:var(--color-error);color:white}
.btn-disabled{opacity:.5;cursor:not-allowed}
</style>
