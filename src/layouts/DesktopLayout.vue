<template>
  <div class="desktop-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">好雨粮库</div>
      <nav class="sidebar-nav">
        <div
          v-for="item in visibleItems"
          :key="item.path"
          class="sidebar-item"
          :class="{ active: currentPath.startsWith(item.path) }"
          @click="navigate(item.path)"
        >
          {{ item.label }}
        </div>
      </nav>
      <div class="sidebar-footer" @click="logout">退出登录</div>
    </aside>
    <div class="main-area">
      <header class="top-bar">
        <h1 class="page-title">
          <slot name="title" />
        </h1>
        <div class="user-info">
          <span>{{ roleLabel }} {{ userName }}</span>
          <span class="logout-link" @click="logout">退出</span>
        </div>
      </header>
      <div class="content">
        <slot />
      </div>
      <footer class="footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface SidebarItem {
  label: string
  path: string
  roles: string[]
}

const sidebarItems: SidebarItem[] = [
  { label: '预约列表', path: '/admin/appointments', roles: ['admin', 'operator', 'manager'] },
  { label: '排队看板', path: '/admin/queue-board', roles: ['admin', 'operator', 'manager'] },
  { label: '扦样录入', path: '/admin/sampling', roles: ['admin', 'operator'] },
  { label: '数据看板', path: '/admin/dashboard', roles: ['admin', 'operator', 'manager'] },
  { label: '用户管理', path: '/admin/users', roles: ['admin'] },
]

const userRole = computed(() => authStore.user?.role || 'admin')
const userName = computed(() => authStore.user?.username || '')
const roleLabel = computed(() =>
  ({ admin: '管理员', operator: '操作员', manager: '管理者' })[userRole.value] || ''
)

const visibleItems = computed(() =>
  sidebarItems.filter(item => item.roles.includes(userRole.value))
)

const currentPath = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.desktop-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg, #fefbfb);
}

.sidebar {
  width: 200px;
  background: #FF6600;
  color: white;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-brand {
  padding: 1rem;
  font-size: 1rem;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem 0;
}

.sidebar-item {
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  cursor: pointer;
  border-left: 3px solid transparent;
}

.sidebar-item.active {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
  border-left-color: white;
}

.sidebar-footer {
  padding: 0.6rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 0.8rem;
  cursor: pointer;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  background: white;
  border-bottom: 1px solid var(--color-border, #eeeeee);
}

.page-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333333);
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-muted, #888888);
}

.logout-link {
  cursor: pointer;
}

.content {
  flex: 1;
  padding: 1rem 1.25rem;
  overflow-y: auto;
}

.footer {
  flex-shrink: 0;
}
</style>
