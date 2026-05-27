<template><div v-if="visible" class="toast" :class="`toast-${type}`">{{message}}</div></template>
<script setup lang="ts">
defineProps<{visible:boolean;message:string;type?:'success'|'error'|'info'}>()
</script>
<style scoped>
.toast{position:fixed;top:var(--space-lg);left:50%;transform:translateX(-50%);padding:var(--space-sm) var(--space-lg);border-radius:var(--radius-md);z-index:200;font-size:.875rem}
.toast-success{background:var(--color-success);color:white}.toast-error{background:var(--color-error);color:white}.toast-info{background:var(--color-primary);color:white}
</style>
