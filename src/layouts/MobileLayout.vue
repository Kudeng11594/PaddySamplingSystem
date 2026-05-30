<template>
  <div class="mobile-layout">
    <div class="mobile-container">
      <header class="mobile-header">
        <slot name="header" />
      </header>
      <main class="mobile-body">
        <slot />
      </main>
    </div>
    <nav class="bottom-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ active: currentPath === tab.path }"
        @click="navigate(tab.path)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const role = computed(() => authStore.user?.role || 'driver')

interface TabItem {
  label: string
  path: string
  icon: string
}

const driverTabs: TabItem[] = [
  { label: '预约', path: '/driver/create', icon: '📋' },
  { label: '查询', path: '/driver/query', icon: '🔍' },
  { label: '排队', path: '/driver/queue', icon: '🚶' },
]

const managerTabs: TabItem[] = [
  { label: '看板', path: '/manager/dashboard', icon: '📊' },
  { label: '查询', path: '/driver/query', icon: '🔍' },
  { label: '排队', path: '/driver/queue', icon: '🚶' },
]

const tabs = computed(() => role.value === 'manager' ? managerTabs : driverTabs)
const currentPath = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}
</script>

<style scoped>
.mobile-layout {
  max-width: 380px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg, #fefbfb);
}

.mobile-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-header {
  flex-shrink: 0;
}

.mobile-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  padding-bottom: 0;
}

.bottom-tabs {
  display: flex;
  border-top: 1px solid var(--color-border, #eeeeee);
  background: var(--color-surface, #ffffff);
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #888888;
  min-height: 44px;
  gap: 2px;
}

.tab-item.active {
  color: #FF6600;
}

.tab-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.tab-label {
  font-size: 0.7rem;
  line-height: 1;
}
</style>
