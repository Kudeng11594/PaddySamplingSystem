<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header"><h3>{{title}}</h3><button class="modal-close" @click="$emit('close')">&times;</button></div>
      <div class="modal-body"><slot/></div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineProps<{visible:boolean;title:string}>()
defineEmits(['close'])
</script>
<style scoped>
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:100}
.modal-content{background:var(--color-surface);border-radius:var(--radius-lg);min-width:320px;max-width:480px}
.modal-header{display:flex;justify-content:space-between;align-items:center;padding:var(--space-md);border-bottom:1px solid var(--color-border)}
.modal-header h3{margin:0}.modal-close{background:none;border:none;font-size:1.5rem;cursor:pointer}
.modal-body{padding:var(--space-md)}
</style>
