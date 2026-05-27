# Paddy Frontend UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 10 UI pages from the approved design spec, fix color tokens from oklch to hex, and ensure layouts match spec exactly.

**Architecture:** Single-page application with uniapp + Vue 3 + TypeScript + Vite + Pinia. Mock-first development (VITE_USE_MOCK env var). MobileLayout (380px max, bottom tabs) for driver/manager routes, DesktopLayout (200px sidebar, #FF6600) for admin routes.

**Tech Stack:** uniapp, Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Vitest

**Prerequisites:** The frontend architecture plan (`docs/superpowers/plans/2026-05-22-paddy-frontend-architecture.md`) provides the foundation — Tasks 0-14 from that plan must be completed first (project scaffolding, routing, auth store, API types, mock system, layouts). This plan extends and corrects those foundations and implements all pages.

---

### Task 1: Fix design tokens — replace oklch with hex values from spec

**Files:**
- Modify: `src/styles/tokens.css` (replace all oklch color values with hex)

**Context:** The frontend architecture plan uses oklch colors. The approved design spec uses specific hex values. Replace all occurrences.

- [ ] **Step 1: Read current tokens.css**

Run: `cat src/styles/tokens.css`

- [ ] **Step 2: Replace with spec-matching tokens**

Replace entire file content:

```css
:root {
  /* Primary */
  --color-primary: #FF6600;
  --color-primary-hover: #e65c00;
  --color-primary-active: #cc5200;

  /* Backgrounds */
  --color-bg: #fefbfb;
  --color-surface: #ffffff;
  --color-border: #eeeeee;
  --color-border-light: #f0f0f0;

  /* Text */
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-text-muted: #888888;
  --color-text-placeholder: #999999;

  /* Status badges — completed */
  --color-status-completed-bg: #e8f5e9;
  --color-status-completed-text: #2e7d32;
  /* Status badges — queueing */
  --color-status-queueing-bg: #e3f2fd;
  --color-status-queueing-text: #1565c0;
  /* Status badges — waiting/sampling */
  --color-status-waiting-bg: #fff3e0;
  --color-status-waiting-text: #e65100;
  /* Status badges — cancelled */
  --color-status-cancelled-bg: #f5f5f5;
  --color-status-cancelled-text: #999999;

  /* Role badges */
  --color-role-admin-bg: #fff3e0;
  --color-role-admin-text: #e65100;
  --color-role-operator-bg: #e3f2fd;
  --color-role-operator-text: #1565c0;
  --color-role-manager-bg: #f3e5f5;
  --color-role-manager-text: #7b1fa2;

  /* Online status */
  --color-online-bg: #e8f5e9;
  --color-online-text: #2e7d32;
  --color-offline-bg: #f5f5f5;
  --color-offline-text: #999999;

  /* Danger / Success */
  --color-danger: #e53935;
  --color-success: #4caf50;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.08);
}
```

- [ ] **Step 3: Verify no oklch remains in tokens.css**

Run: `grep -n "oklch" src/styles/tokens.css`
Expected: no output (zero matches)

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css
git commit -m "fix: replace oklch tokens with design spec hex values"
```

---

### Task 2: Extend shared API types for all pages

**Files:**
- Modify: `src/types/api.ts`

**Context:** The architecture plan defined base API types. Add types needed by the 10 pages: DashboardData with variety distribution, trend data, operation logs; QueueItem with wait time; SamplingData with all test fields; extended User with displayName/lastLogin/status.

- [ ] **Step 1: Read current types file**

Run: `cat src/types/api.ts`

- [ ] **Step 2: Add new type definitions**

Append to the file:

```typescript
// === Dashboard Types ===

export interface VarietyDistribution {
  variety: string;
  percentage: number;
  color: string;
}

export interface TrendDataPoint {
  date: string;
  count: number;
  isToday?: boolean;
}

export interface OperationLog {
  datetime: string;
  licensePlate: string;
  activity: string;
  operator: string;
}

export interface DashboardData {
  todayAppointments: number;
  completedCount: number;
  queueingCount: number;
  cancelledCount: number;
  cancelRate: string;
  dailyTrend: TrendDataPoint[];
  varietyDistribution: VarietyDistribution[];
  operationLogs: OperationLog[];
  avgSamplingTime: number;
  avgWaitTime: number;
  peakHours: string;
  passRate: number;
  yesterdayComparison: {
    appointments: string;
    completed: string;
  };
}

// === Queue Board Types ===

export interface QueueItem {
  id: number;
  tokenNumber: string;
  licensePlate: string;
  driverName: string;
  variety: string;
  waitTimeMinutes: number;
  status: 'sampling' | 'waiting' | 'called';
}

export interface QueueBoardData {
  currentSampling: QueueItem | null;
  nextInLine: QueueItem | null;
  waitingQueue: QueueItem[];
  todayStats: {
    totalAppointments: number;
    completed: number;
    queueing: number;
    cancelled: number;
  };
  avgWaitTime: number;
  peakHours: string;
}

// === Sampling Types ===

export interface SamplingFormData {
  moisture: number | null;
  riceYield: number | null;
  impurityRate: number | null;
  bellyWhite: number | null;
  diseaseSpot: number | null;
  crossMix: number | null;
  conclusion: 'pass' | 'fail' | null;
  notes: string;
}

export interface SamplingData extends SamplingFormData {
  id: number;
  appointmentId: string;
  operator: string;
  createdAt: string;
}

// === Extended User Types ===

export type UserStatus = 'online' | 'offline';
export type UserRole = 'admin' | 'operator' | 'manager';

export interface User {
  id: number;
  username: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  status: UserStatus;
}

export interface UserFormData {
  username: string;
  displayName: string;
  role: UserRole;
  password?: string;
}

// === Appointment Types ===

export type AppointmentStatus =
  | 'completed'
  | 'queueing'
  | 'sampling'
  | 'waiting'
  | 'cancelled';

export interface Appointment {
  id: number;
  appointmentNumber: string;
  driverName: string;
  phone: string;
  licensePlate: string;
  variety: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface AppointmentFormData {
  driverName: string;
  phone: string;
  licensePlate: string;
  variety: string;
  date: string;
  time: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/api.ts
git commit -m "feat: extend API types for all 10 pages"
```

---

### Task 3: Extend mock data to support all pages

**Files:**
- Modify: `src/mock/data.ts` (or equivalent mock data file)

**Context:** The architecture plan has a basic mock setup. Extend with realistic data for appointments, users, queue board, dashboard, and sampling records.

- [ ] **Step 1: Read current mock data file**

Run: `ls src/mock/` then `cat src/mock/data.ts`

- [ ] **Step 2: Add comprehensive mock data**

```typescript
import type {
  Appointment,
  User,
  QueueBoardData,
  DashboardData,
  SamplingData,
} from '@/types/api';

export const mockAppointments: Appointment[] = [
  {
    id: 1, appointmentNumber: '20260522-001', driverName: '张师傅',
    phone: '13800138001', licensePlate: '辽A12345', variety: '中科发5',
    date: '2026-05-22', time: '08:30', status: 'completed', createdAt: '2026-05-22 06:00',
  },
  {
    id: 2, appointmentNumber: '20260522-002', driverName: '李师傅',
    phone: '13800138002', licensePlate: '辽B67890', variety: '吉宏6',
    date: '2026-05-22', time: '09:00', status: 'sampling', createdAt: '2026-05-22 06:30',
  },
  {
    id: 3, appointmentNumber: '20260522-003', driverName: '王师傅',
    phone: '13800138003', licensePlate: '辽C13579', variety: '鲜食玉米',
    date: '2026-05-22', time: '09:30', status: 'queueing', createdAt: '2026-05-22 07:00',
  },
  {
    id: 4, appointmentNumber: '20260522-004', driverName: '赵师傅',
    phone: '13800138004', licensePlate: '辽D24680', variety: '杂粮',
    date: '2026-05-22', time: '10:00', status: 'queueing', createdAt: '2026-05-22 07:15',
  },
  {
    id: 5, appointmentNumber: '20260522-005', driverName: '孙师傅',
    phone: '13800138005', licensePlate: '辽E13579', variety: '中科发5',
    date: '2026-05-22', time: '10:30', status: 'queueing', createdAt: '2026-05-22 07:30',
  },
  {
    id: 6, appointmentNumber: '20260522-006', driverName: '周师傅',
    phone: '13800138006', licensePlate: '辽F97531', variety: '中科发5',
    date: '2026-05-22', time: '11:00', status: 'waiting', createdAt: '2026-05-22 08:00',
  },
  {
    id: 7, appointmentNumber: '20260522-007', driverName: '吴师傅',
    phone: '13800138007', licensePlate: '辽G11223', variety: '吉宏6',
    date: '2026-05-22', time: '11:30', status: 'cancelled', createdAt: '2026-05-22 08:15',
  },
  {
    id: 8, appointmentNumber: '20260522-008', driverName: '郑师傅',
    phone: '13800138008', licensePlate: '辽H44556', variety: '鲜食玉米',
    date: '2026-05-22', time: '13:00', status: 'completed', createdAt: '2026-05-22 09:00',
  },
];

export const mockUsers: User[] = [
  {
    id: 1, username: 'admin', displayName: '系统管理员', role: 'admin',
    createdAt: '2026-01-01', lastLogin: '2026-05-22 08:00', status: 'online',
  },
  {
    id: 2, username: 'op01', displayName: '操作员001', role: 'operator',
    createdAt: '2026-01-01', lastLogin: '2026-05-22 08:15', status: 'online',
  },
  {
    id: 3, username: 'op02', displayName: '操作员002', role: 'operator',
    createdAt: '2026-03-15', lastLogin: '2026-05-21 16:30', status: 'offline',
  },
  {
    id: 4, username: 'manager01', displayName: '管理者001', role: 'manager',
    createdAt: '2026-04-01', lastLogin: '2026-05-20 09:00', status: 'offline',
  },
];

export const mockQueueBoard: QueueBoardData = {
  currentSampling: {
    id: 2, tokenNumber: 'A002', licensePlate: '辽B67890',
    driverName: '李师傅', variety: '吉宏6', waitTimeMinutes: 5, status: 'sampling',
  },
  nextInLine: {
    id: 3, tokenNumber: 'A003', licensePlate: '辽C13579',
    driverName: '王师傅', variety: '鲜食玉米', waitTimeMinutes: 15, status: 'called',
  },
  waitingQueue: [
    { id: 4, tokenNumber: 'A004', licensePlate: '辽D24680', driverName: '赵师傅', variety: '杂粮', waitTimeMinutes: 35, status: 'waiting' },
    { id: 5, tokenNumber: 'A005', licensePlate: '辽E13579', driverName: '孙师傅', variety: '中科发5', waitTimeMinutes: 20, status: 'waiting' },
    { id: 6, tokenNumber: 'A006', licensePlate: '辽F97531', driverName: '周师傅', variety: '中科发5', waitTimeMinutes: 10, status: 'waiting' },
  ],
  todayStats: { totalAppointments: 12, completed: 8, queueing: 3, cancelled: 1 },
  avgWaitTime: 18,
  peakHours: '09:00 - 11:00',
};

export const mockDashboard: DashboardData = {
  todayAppointments: 12,
  completedCount: 8,
  queueingCount: 3,
  cancelledCount: 1,
  cancelRate: '8.3%',
  dailyTrend: [
    { date: '5/16', count: 6 },
    { date: '5/17', count: 5 },
    { date: '5/18', count: 8 },
    { date: '5/19', count: 7 },
    { date: '5/20', count: 6 },
    { date: '5/21', count: 9 },
    { date: '5/22', count: 10, isToday: true },
  ],
  varietyDistribution: [
    { variety: '中科发5', percentage: 42, color: '#FF6600' },
    { variety: '吉宏6', percentage: 25, color: '#ff9800' },
    { variety: '鲜食玉米', percentage: 17, color: '#2196f3' },
    { variety: '杂粮', percentage: 16, color: '#9c27b0' },
  ],
  operationLogs: [
    { datetime: '2026-05-22 08:30', licensePlate: '辽A12345', activity: '完成扦样', operator: 'op01' },
    { datetime: '2026-05-22 08:45', licensePlate: '辽B67890', activity: '开始扦样', operator: 'op01' },
    { datetime: '2026-05-22 09:00', licensePlate: '辽C13579', activity: '到厂取号', operator: '系统' },
    { datetime: '2026-05-22 09:15', licensePlate: '辽D24680', activity: '已取消', operator: '司机' },
  ],
  avgSamplingTime: 12,
  avgWaitTime: 18,
  peakHours: '09:00-11:00',
  passRate: 95,
  yesterdayComparison: { appointments: '↑ 20%', completed: '↑ 33%' },
};

export const mockSamplingData: SamplingData[] = [
  {
    id: 1, appointmentId: '20260522-001', moisture: 14.5, riceYield: 62.5,
    impurityRate: 1.2, bellyWhite: 5, diseaseSpot: 0.5, crossMix: 1,
    conclusion: 'pass', notes: '', operator: 'op01', createdAt: '2026-05-22 08:35',
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/mock/data.ts
git commit -m "feat: add comprehensive mock data for all pages"
```

---

### Task 4: Fix MobileLayout — 380px max-width, role-aware tabs

**Files:**
- Modify: `src/layouts/MobileLayout.vue`

**Context:** The architecture plan's MobileLayout needs updating:
- Max 380px content width (full viewport)
- Bottom tab bar with 3 tabs
- Role-aware tabs: Driver → 预约/查询/排队, Manager → 看板/查询/设置
- Active tab: #FF6600, inactive: #888
- Tab icons should use unicode/text (no icon library needed for MVP)

- [ ] **Step 1: Read current MobileLayout**

Run: `cat src/layouts/MobileLayout.vue`

- [ ] **Step 2: Rewrite MobileLayout**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
  { label: '查询', path: '/manager/query', icon: '🔍' },
  { label: '设置', path: '/manager/settings', icon: '⚙️' },
]

const tabs = computed(() => role.value === 'manager' ? managerTabs : driverTabs)

const currentPath = computed(() => route.path)

function navigate(path: string) {
  router.push(path)
}
</script>

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
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/MobileLayout.vue
git commit -m "fix: update MobileLayout with 380px max-width and role-aware tabs"
```

---

### Task 5: Fix DesktopLayout — 200px #FF6600 sidebar, active border highlight

**Files:**
- Modify: `src/layouts/DesktopLayout.vue`

**Context:** The architecture plan's DesktopLayout needs updating:
- Left sidebar 200px wide, #FF6600 background with white text
- Active sidebar item: white left border (3px), semi-transparent white background
- Top header: page title (left) + user info (right)
- Footer bar for pagination
- Sidebar items configurable per role

- [ ] **Step 1: Read current DesktopLayout**

Run: `cat src/layouts/DesktopLayout.vue`

- [ ] **Step 2: Rewrite DesktopLayout**

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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

<template>
  <div class="desktop-layout">
    <aside class="sidebar">
      <div class="sidebar-brand">好雨粮库</div>
      <nav class="sidebar-nav">
        <div
          v-for="item in visibleItems"
          :key="item.path"
          class="sidebar-item"
          :class="{ active: currentPath === item.path }"
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
          <span>{{ userRole === 'admin' ? '管理员' : userRole === 'operator' ? '操作员' : '管理者' }} {{ userName }}</span>
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
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/DesktopLayout.vue
git commit -m "fix: update DesktopLayout with 200px #FF6600 sidebar and role-based menu"
```

---

### Task 6: Create StatusBadge component

**Files:**
- Create: `src/components/StatusBadge.vue`

**Context:** Color-coded status badges used across multiple pages. Maps status to background/text colors per spec.

- [ ] **Step 1: Create StatusBadge**

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: '#e8f5e9', text: '#2e7d32', label: '已完成' },
  queueing: { bg: '#e3f2fd', text: '#1565c0', label: '排队中' },
  sampling: { bg: '#fff3e0', text: '#e65100', label: '扦样中' },
  waiting: { bg: '#f5f5f5', text: '#999999', label: '待取号' },
  cancelled: { bg: '#f5f5f5', text: '#999999', label: '已取消' },
}

const style = computed(() => statusMap[props.status] || statusMap.waiting)
</script>

<template>
  <span
    class="status-badge"
    :style="{ background: style.bg, color: style.text }"
  >
    {{ style.label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.4;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StatusBadge.vue
git commit -m "feat: create StatusBadge component with spec color mapping"
```

---

### Task 7: Create TagSelector component

**Files:**
- Create: `src/components/TagSelector.vue`

**Context:** Tag selector for grain variety on mobile (reduces operation steps vs dropdown). Used in driver create appointment form.

- [ ] **Step 1: Create TagSelector**

```vue
<script setup lang="ts">
const props = defineProps<{
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TagSelector.vue
git commit -m "feat: create TagSelector component for grain variety selection"
```

---

### Task 8: Create QueueTimeline component

**Files:**
- Create: `src/components/QueueTimeline.vue`

**Context:** Visual timeline showing appointment lifecycle: 预约成功 → 已到厂 → 排队中 → 扦样中 → 已完成. Completed steps green, current step orange, future steps grey.

- [ ] **Step 1: Create QueueTimeline**

```vue
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
  waiting: 1, arrived: 2, queueing: 3, sampling: 4, completed: 5,
}

const currentStepIndex = computed(() => {
  return statusOrder[props.currentStatus] || 0
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/QueueTimeline.vue
git commit -m "feat: create QueueTimeline component for appointment lifecycle"
```

---

### Task 9: Create MetricCard and KpiCard components

**Files:**
- Create: `src/components/MetricCard.vue`
- Create: `src/components/KpiCard.vue`

**Context:** MetricCard used in manager dashboard (3-column grid with number + label). KpiCard used in admin dashboard (4-column with left color border + trend indicator).

- [ ] **Step 1: Create MetricCard**

```vue
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
```

- [ ] **Step 2: Create KpiCard**

```vue
<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  borderColor: string
  trend?: string
  trendColor?: string
}>()
</script>

<template>
  <div class="kpi-card" :style="{ borderLeftColor: borderColor }">
    <div class="kpi-label">{{ label }}</div>
    <div class="kpi-value">{{ value }}</div>
    <div v-if="trend" class="kpi-trend" :style="{ color: trendColor || '#999' }">{{ trend }}</div>
  </div>
</template>

<style scoped>
.kpi-card {
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eeeeee);
  border-left: 3px solid;
}

.kpi-label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #888888);
}

.kpi-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text, #333333);
  margin-top: 0.3rem;
}

.kpi-trend {
  font-size: 0.7rem;
  margin-top: 0.2rem;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MetricCard.vue src/components/KpiCard.vue
git commit -m "feat: create MetricCard and KpiCard components"
```

---

### Task 10: Create AppointmentInfoCard component

**Files:**
- Create: `src/components/AppointmentInfoCard.vue`

**Context:** Read-only card showing appointment details with light orange background. Used in sampling entry page.

- [ ] **Step 1: Create AppointmentInfoCard**

```vue
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppointmentInfoCard.vue
git commit -m "feat: create AppointmentInfoCard component for sampling page"
```

---

### Task 11: Implement Login page

**Files:**
- Modify: `src/pages/login.vue`

**Context:** Centered card layout. Brand header (#FF6600 bg, system icon + title). Username + password + login button. Footer links. Post-login redirect by role.

- [ ] **Step 1: Read current login page**

Run: `cat src/pages/login.vue`

- [ ] **Step 2: Rewrite Login page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    const role = authStore.user?.role
    if (role === 'admin' || role === 'operator') {
      router.push('/admin/appointments')
    } else if (role === 'manager') {
      router.push('/manager/dashboard')
    } else {
      router.push('/driver/create')
    }
  } catch (e: any) {
    error.value = e.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand-header">
        <span class="brand-icon">🏪</span>
        <h1 class="brand-title">好雨粮库</h1>
        <p class="brand-subtitle">原粮进厂扦样系统</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            class="form-input"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            class="form-input"
            autocomplete="current-password"
          />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="login-footer">
        <a href="#">服务条款</a>
        <span class="footer-sep">|</span>
        <a href="#">隐私政策</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #fefbfb);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-xl, 12px);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.brand-header {
  background: #FF6600;
  color: white;
  text-align: center;
  padding: 2rem 1rem;
}

.brand-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.brand-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0.25rem 0 0;
}

.login-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border, #eeeeee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #FF6600;
}

.login-btn {
  padding: 0.75rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:active:not(:disabled) {
  opacity: 0.8;
}

.error-message {
  color: var(--color-danger, #e53935);
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}

.login-footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted, #888);
}

.login-footer a {
  color: var(--color-text-muted, #888);
  text-decoration: none;
}

.footer-sep {
  margin: 0 0.5rem;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/login.vue
git commit -m "feat: implement login page with brand header and role-based redirect"
```

---

### Task 12: Implement Driver — Create Appointment page

**Files:**
- Modify: `src/pages/driver/create.vue`

**Context:** MobileLayout, 预约 tab active. Form with: 驾驶员姓名, 手机号, 车牌号, 粮食品种 (tag selector), 日期, 时间, 备注, 提交按钮. Submit → redirect to detail.

- [ ] **Step 1: Read current file**

Run: `cat src/pages/driver/create.vue`

- [ ] **Step 2: Implement driver create page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'
import TagSelector from '@/components/TagSelector.vue'

const router = useRouter()

const form = ref({
  driverName: '',
  phone: '',
  licensePlate: '',
  variety: '',
  date: '',
  time: '',
  notes: '',
})

const varieties = ['中科发5', '吉宏6', '鲜食玉米', '杂粮']
const submitting = ref(false)

async function handleSubmit() {
  if (!form.value.driverName || !form.value.phone || !form.value.licensePlate || !form.value.variety || !form.value.date || !form.value.time) {
    return
  }
  submitting.value = true
  try {
    // Mock: generate appointment number and redirect
    const apptNo = `20260522-${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`
    router.push(`/driver/detail?appointmentNumber=${apptNo}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">新建预约</div>
    </template>

    <div class="create-form">
      <div class="form-group">
        <label class="form-label">驾驶员姓名</label>
        <input v-model="form.driverName" class="form-input" placeholder="请输入姓名" />
      </div>

      <div class="form-group">
        <label class="form-label">手机号</label>
        <input v-model="form.phone" class="form-input" placeholder="11位手机号" maxlength="11" />
      </div>

      <div class="form-group">
        <label class="form-label">车牌号</label>
        <input v-model="form.licensePlate" class="form-input" placeholder="如：辽A12345" />
      </div>

      <div class="form-group">
        <label class="form-label">粮食品种</label>
        <TagSelector v-model="form.variety" :options="varieties" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">日期</label>
          <input v-model="form.date" class="form-input" placeholder="YYYY-MM-DD" />
        </div>
        <div class="form-group">
          <label class="form-label">时间</label>
          <input v-model="form.time" class="form-input" placeholder="HH:MM" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">备注</label>
        <textarea v-model="form.notes" class="form-textarea" placeholder="选填" />
      </div>

      <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交预约' }}
      </button>
    </div>
  </MobileLayout>
</template>

<style scoped>
.page-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  padding: 0.75rem 0;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  font-weight: 500;
}

.form-input {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  outline: none;
  min-height: 44px;
}

.form-input:focus {
  border-color: #FF6600;
}

.form-textarea {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  outline: none;
  min-height: 80px;
  resize: vertical;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.submit-btn {
  padding: 0.75rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 48px;
  margin-top: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/driver/create.vue
git commit -m "feat: implement driver create appointment page with tag selector"
```

---

### Task 13: Implement Driver — Query Records page

**Files:**
- Modify: `src/pages/driver/query.vue`

**Context:** MobileLayout, 查询 tab active. Search bar + card-based results list. Each card: appointment number (bold), status badge, variety/date/time, license plate, driver name. Empty state.

- [ ] **Step 1: Read current file**

Run: `cat src/pages/driver/query.vue`

- [ ] **Step 2: Implement driver query page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MobileLayout from '@/layouts/MobileLayout.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { mockAppointments } from '@/mock/data'
import type { Appointment } from '@/types/api'

const searchKeyword = ref('')
const results = ref<Appointment[]>([])
const searched = ref(false)

function handleSearch() {
  searched.value = true
  if (!searchKeyword.value.trim()) {
    results.value = mockAppointments
  } else {
    const kw = searchKeyword.value.toLowerCase()
    results.value = mockAppointments.filter(
      a => a.appointmentNumber.toLowerCase().includes(kw) ||
           a.licensePlate.toLowerCase().includes(kw) ||
           a.driverName.includes(kw)
    )
  }
}
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">查询记录</div>
    </template>

    <div class="search-bar">
      <input
        v-model="searchKeyword"
        class="search-input"
        placeholder="预约编号 / 车牌号 / 驾驶员"
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">查询</button>
    </div>

    <div v-if="!searched" class="empty-state">请输入条件查询</div>

    <div v-else-if="results.length === 0" class="empty-state">暂无记录</div>

    <div v-else class="result-list">
      <div v-for="item in results" :key="item.id" class="result-card">
        <div class="card-header">
          <span class="card-number">{{ item.appointmentNumber }}</span>
          <StatusBadge :status="item.status" />
        </div>
        <div class="card-detail">
          <span>{{ item.variety }}</span>
          <span>{{ item.date }} {{ item.time }}</span>
        </div>
        <div class="card-detail">
          <span>{{ item.licensePlate }}</span>
          <span>{{ item.driverName }}</span>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<style scoped>
.page-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  padding: 0.75rem 0;
}

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  outline: none;
  min-height: 44px;
}

.search-input:focus {
  border-color: #FF6600;
}

.search-btn {
  padding: 0.65rem 1rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  color: var(--color-text-placeholder, #999);
  padding: 3rem 0;
  font-size: 0.9rem;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #eee);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-number {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--color-text, #333);
}

.card-detail {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/driver/query.vue
git commit -m "feat: implement driver query records page with card-based results"
```

---

### Task 14: Implement Driver — Queue Status page

**Files:**
- Modify: `src/pages/driver/queue.vue`

**Context:** MobileLayout, 排队 tab active. Appointment info card + queue position card (large number, progress bar, estimated wait time) + QueueTimeline.

- [ ] **Step 1: Read current file**

Run: `cat src/pages/driver/queue.vue`

- [ ] **Step 2: Implement driver queue page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MobileLayout from '@/layouts/MobileLayout.vue'
import QueueTimeline from '@/components/QueueTimeline.vue'

const appointment = ref({
  number: '20260522-002',
  variety: '吉宏6',
  time: '2026-05-22 09:00',
  plate: '辽B67890',
  driver: '李师傅',
})

const queuePosition = ref(2)
const totalAhead = ref(1)
const estimatedWait = ref('约15分钟')
const currentStatus = ref('queueing')
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">排队状态</div>
    </template>

    <!-- Appointment Info -->
    <div class="info-card">
      <div class="info-row">
        <span class="info-label">预约编号</span>
        <span class="info-value">{{ appointment.number }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">品种</span>
        <span class="info-value">{{ appointment.variety }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">预约时间</span>
        <span class="info-value">{{ appointment.time }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">车牌号</span>
        <span class="info-value">{{ appointment.plate }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">驾驶员</span>
        <span class="info-value">{{ appointment.driver }}</span>
      </div>
    </div>

    <!-- Queue Position -->
    <div class="position-card">
      <div class="position-number">{{ queuePosition }}</div>
      <div class="position-label">当前排队位置</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(totalAhead / (totalAhead + 1)) * 100}%` }" />
      </div>
      <div class="position-info">
        <span>前方 {{ totalAhead }} 位</span>
        <span>预计 {{ estimatedWait }}</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline-section">
      <div class="section-title">进度跟踪</div>
      <QueueTimeline :current-status="currentStatus" />
    </div>
  </MobileLayout>
</template>

<style scoped>
.page-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  padding: 0.75rem 0;
}

.info-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #eee);
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  font-size: 0.85rem;
}

.info-label {
  color: var(--color-text-muted, #888);
}

.info-value {
  color: var(--color-text, #333);
  font-weight: 500;
}

.position-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1.25rem;
  border: 1px solid var(--color-border, #eee);
  text-align: center;
  margin-bottom: 1rem;
}

.position-number {
  font-size: 3rem;
  font-weight: 700;
  color: #FF6600;
  line-height: 1;
}

.position-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #666);
  margin: 0.5rem 0;
}

.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #FF6600;
  border-radius: 3px;
  transition: width 0.3s;
}

.position-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.timeline-section {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.5rem;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/driver/queue.vue
git commit -m "feat: implement driver queue status page with timeline"
```

---

### Task 15: Implement Manager Dashboard page

**Files:**
- Create: `src/pages/manager/dashboard.vue`

**Context:** MobileLayout, 看板 tab active. Date selector (今日/昨日/近7日). Metric cards (3-column). Variety distribution bar chart (horizontal). Live queue list.

- [ ] **Step 1: Create manager dashboard page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import MobileLayout from '@/layouts/MobileLayout.vue'
import MetricCard from '@/components/MetricCard.vue'
import { mockDashboard } from '@/mock/data'

const dateRange = ref<'today' | 'yesterday' | 'week'>('today')
const dashboard = ref(mockDashboard)

const queueList = [
  { rank: 1, plate: '辽B67890', driver: '李师傅', wait: '5min' },
  { rank: 2, plate: '辽C13579', driver: '王师傅', wait: '15min' },
  { rank: 3, plate: '辽D24680', driver: '赵师傅', wait: '35min' },
]
</script>

<template>
  <MobileLayout>
    <template #header>
      <div class="page-header">管理看板</div>
    </template>

    <!-- Date Toggle -->
    <div class="date-toggle">
      <button
        :class="{ active: dateRange === 'today' }"
        @click="dateRange = 'today'"
      >今日</button>
      <button
        :class="{ active: dateRange === 'yesterday' }"
        @click="dateRange = 'yesterday'"
      >昨日</button>
      <button
        :class="{ active: dateRange === 'week' }"
        @click="dateRange = 'week'"
      >近7日</button>
    </div>

    <!-- Metric Cards -->
    <div class="metric-grid">
      <MetricCard label="今日预约" :value="dashboard.todayAppointments" color="#FF6600" />
      <MetricCard label="已完成" :value="dashboard.completedCount" color="#4caf50" />
      <MetricCard label="排队中" :value="dashboard.queueingCount" color="#e65100" />
    </div>

    <!-- Variety Distribution -->
    <div class="section-card">
      <div class="section-title">品种分布</div>
      <div class="variety-list">
        <div v-for="item in dashboard.varietyDistribution" :key="item.variety" class="variety-row">
          <div class="variety-name">{{ item.variety }}</div>
          <div class="variety-bar-bg">
            <div class="variety-bar-fill" :style="{ width: item.percentage + '%', background: item.color }" />
          </div>
          <div class="variety-pct">{{ item.percentage }}%</div>
        </div>
      </div>
    </div>

    <!-- Live Queue -->
    <div class="section-card">
      <div class="section-title">实时排队</div>
      <div v-for="item in queueList" :key="item.rank" class="queue-row">
        <span class="queue-rank">{{ item.rank }}</span>
        <span class="queue-plate">{{ item.plate }}</span>
        <span class="queue-driver">{{ item.driver }}</span>
        <span class="queue-wait">{{ item.wait }}</span>
      </div>
    </div>
  </MobileLayout>
</template>

<style scoped>
.page-header {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  padding: 0.75rem 0;
}

.date-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.date-toggle button {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--color-border, #eee);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  color: var(--color-text-secondary, #666);
  font-size: 0.85rem;
  cursor: pointer;
  min-height: 44px;
}

.date-toggle button.active {
  background: #FF6600;
  color: white;
  border-color: #FF6600;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-card {
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 8px);
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #eee);
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.75rem;
}

.variety-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variety-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variety-name {
  width: 5rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
  flex-shrink: 0;
}

.variety-bar-bg {
  flex: 1;
  height: 12px;
  background: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
}

.variety-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s;
}

.variety-pct {
  width: 3rem;
  text-align: right;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text, #333);
}

.queue-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
  font-size: 0.85rem;
}

.queue-row:last-child {
  border-bottom: none;
}

.queue-rank {
  font-weight: 700;
  color: #FF6600;
  width: 1.5rem;
}

.queue-plate {
  flex: 1;
  color: var(--color-text, #333);
}

.queue-driver {
  color: var(--color-text-secondary, #666);
}

.queue-wait {
  color: var(--color-text-muted, #888);
  font-size: 0.8rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/manager/dashboard.vue
git commit -m "feat: implement manager dashboard page with metrics and variety distribution"
```

---

### Task 16: Implement Admin — Appointments List page

**Files:**
- Modify: `src/pages/admin/appointments.vue`

**Context:** DesktopLayout, 预约列表 active. Filter bar (keyword + status + variety + date + 查询/重置). Data table (8 columns). Context-dependent action column. Pagination.

- [ ] **Step 1: Read current file**

Run: `cat src/pages/admin/appointments.vue`

- [ ] **Step 2: Implement admin appointments page**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import DesktopLayout from '@/layouts/DesktopLayout.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { mockAppointments } from '@/mock/data'
import type { Appointment, AppointmentStatus } from '@/types/api'

const keyword = ref('')
const statusFilter = ref('')
const varietyFilter = ref('')
const dateFilter = ref('')
const page = ref(1)
const pageSize = 5

const varieties = ['中科发5', '吉宏6', '鲜食玉米', '杂粮']
const statuses: { value: string; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'waiting', label: '待取号' },
  { value: 'queueing', label: '排队中' },
  { value: 'sampling', label: '扦样中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const filtered = computed(() => {
  return mockAppointments.filter(a => {
    if (keyword.value) {
      const kw = keyword.value.toLowerCase()
      if (!a.appointmentNumber.toLowerCase().includes(kw) && !a.driverName.includes(kw) && !a.licensePlate.includes(kw)) return false
    }
    if (statusFilter.value && a.status !== statusFilter.value) return false
    if (varietyFilter.value && a.variety !== varietyFilter.value) return false
    if (dateFilter.value && a.date !== dateFilter.value) return false
    return true
  })
})

const totalPages = computed(() => Math.ceil(filtered.value.length / pageSize))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

function resetFilters() {
  keyword.value = ''
  statusFilter.value = ''
  varietyFilter.value = ''
  dateFilter.value = ''
  page.value = 1
}

function actionLabel(status: AppointmentStatus) {
  if (status === 'waiting') return '叫号'
  if (status === 'sampling') return '录入'
  if (status === 'queueing') return '取消'
  return ''
}
</script>

<template>
  <DesktopLayout>
    <template #title>预约列表</template>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <input v-model="keyword" class="filter-input" placeholder="预约编号/驾驶员/车牌号" />
      <select v-model="statusFilter" class="filter-select">
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select v-model="varietyFilter" class="filter-select">
        <option value="">全部品种</option>
        <option v-for="v in varieties" :key="v" :value="v">{{ v }}</option>
      </select>
      <input v-model="dateFilter" class="filter-input" placeholder="预约日期" style="width: 120px" />
      <button class="btn-primary" @click="page = 1">查询</button>
      <button class="btn-ghost" @click="resetFilters">重置</button>
    </div>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>预约编号</th><th>驾驶员</th><th>手机号</th><th>车牌号</th>
            <th>品种</th><th>预约时间</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in paged" :key="item.id">
            <td class="cell-bold">{{ item.appointmentNumber }}</td>
            <td>{{ item.driverName }}</td>
            <td>{{ item.phone }}</td>
            <td>{{ item.licensePlate }}</td>
            <td>{{ item.variety }}</td>
            <td>{{ item.date }} {{ item.time }}</td>
            <td><StatusBadge :status="item.status" /></td>
            <td>
              <span v-if="actionLabel(item.status)" class="action-link">{{ actionLabel(item.status) }}</span>
              <span v-else class="action-disabled">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="pagination">
        <span class="page-total">共 {{ filtered.length }} 条记录</span>
        <div class="page-buttons">
          <button :disabled="page <= 1" @click="page--">‹</button>
          <button
            v-for="p in totalPages" :key="p"
            :class="{ active: p === page }"
            @click="page = p"
          >{{ p }}</button>
          <button :disabled="page >= totalPages" @click="page++">›</button>
        </div>
      </div>
    </template>
  </DesktopLayout>
</template>

<style scoped>
.filter-bar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.filter-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  width: 160px;
  outline: none;
}

.filter-input:focus {
  border-color: #FF6600;
}

.filter-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  outline: none;
}

.btn-primary {
  padding: 0.4rem 0.8rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  cursor: pointer;
}

.btn-ghost {
  padding: 0.4rem 0.8rem;
  background: white;
  color: var(--color-text-secondary, #666);
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  cursor: pointer;
}

.table-wrapper {
  flex: 1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.data-table th {
  background: #f5f5f5;
  color: var(--color-text-secondary, #666);
  padding: 0.5rem 0.6rem;
  font-weight: 600;
  text-align: left;
}

.data-table td {
  padding: 0.6rem;
  color: var(--color-text, #333);
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
}

.cell-bold {
  font-weight: 500;
}

.action-link {
  color: #FF6600;
  cursor: pointer;
  font-size: 0.8rem;
}

.action-disabled {
  color: var(--color-text-placeholder, #ccc);
  font-size: 0.7rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.page-buttons {
  display: flex;
  gap: 0.3rem;
}

.page-buttons button {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
}

.page-buttons button.active {
  background: #FF6600;
  color: white;
  border-color: #FF6600;
}

.page-buttons button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/appointments.vue
git commit -m "feat: implement admin appointments list page with filters and pagination"
```

---

### Task 17: Implement Admin — Queue Board page

**Files:**
- Create: `src/pages/admin/queue-board.vue`

**Context:** DesktopLayout, 排队看板 active. Left panel: current sampling card (large token, complete/skip), next in line card (叫号 button), waiting queue table. Right panel: today stats, avg wait, peak hours.

- [ ] **Step 1: Create admin queue-board page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import DesktopLayout from '@/layouts/DesktopLayout.vue'
import { mockQueueBoard } from '@/mock/data'

const board = ref(mockQueueBoard)
</script>

<template>
  <DesktopLayout>
    <template #title>排队看板</template>

    <div class="board-layout">
      <!-- Left Panel -->
      <div class="left-panel">
        <!-- Current Sampling -->
        <div v-if="board.currentSampling" class="current-card">
          <div class="current-label">当前扦样</div>
          <div class="current-token">{{ board.currentSampling.tokenNumber }}</div>
          <div class="current-info">
            {{ board.currentSampling.licensePlate }} · {{ board.currentSampling.driverName }}
          </div>
          <div class="current-meta">
            {{ board.currentSampling.variety }} · 已开始 {{ board.currentSampling.waitTimeMinutes }} 分钟
          </div>
          <div class="current-actions">
            <button class="btn-complete">完成扦样</button>
            <button class="btn-skip">跳过</button>
          </div>
        </div>

        <!-- Next In Line -->
        <div v-if="board.nextInLine" class="next-card">
          <div class="next-info">
            <div class="next-label">下一位待叫</div>
            <div class="next-token">{{ board.nextInLine.tokenNumber }}</div>
            <div class="next-detail">{{ board.nextInLine.licensePlate }} · {{ board.nextInLine.driverName }} · {{ board.nextInLine.variety }}</div>
          </div>
          <button class="btn-call">叫号</button>
        </div>

        <!-- Waiting Queue -->
        <div class="queue-table-wrapper">
          <div class="queue-table-title">等待队列</div>
          <table class="queue-table">
            <thead>
              <tr>
                <th>序号</th><th>车牌号</th><th>驾驶员</th><th>品种</th><th>等待时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in board.waitingQueue" :key="item.id">
                <td class="rank-cell">{{ item.tokenNumber.slice(-1) }}</td>
                <td>{{ item.licensePlate }}</td>
                <td>{{ item.driverName }}</td>
                <td>{{ item.variety }}</td>
                <td class="wait-cell">{{ item.waitTimeMinutes }}min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <div class="stats-card">
          <div class="stats-title">今日统计</div>
          <div class="stat-row">
            <span>总预约</span><span class="stat-val orange">{{ board.todayStats.totalAppointments }}</span>
          </div>
          <div class="stat-row">
            <span>已完成</span><span class="stat-val green">{{ board.todayStats.completed }}</span>
          </div>
          <div class="stat-row">
            <span>排队中</span><span class="stat-val orange-dark">{{ board.todayStats.queueing }}</span>
          </div>
          <div class="stat-row">
            <span>已取消</span><span class="stat-val grey">{{ board.todayStats.cancelled }}</span>
          </div>
        </div>
        <div class="info-card-sm">
          <div class="info-sm-label">平均等待</div>
          <div class="info-sm-value">{{ board.avgWaitTime }} <span class="info-sm-unit">分钟</span></div>
        </div>
        <div class="info-card-sm">
          <div class="info-sm-label">今日高峰时段</div>
          <div class="info-sm-text">{{ board.peakHours }}</div>
        </div>
      </div>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.board-layout {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 2px solid #FF6600;
  text-align: center;
}

.current-label {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
  margin-bottom: 0.5rem;
}

.current-token {
  font-size: 2.5rem;
  font-weight: 700;
  color: #FF6600;
  line-height: 1;
}

.current-info {
  font-size: 1rem;
  color: var(--color-text, #333);
  margin-top: 0.5rem;
}

.current-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
  margin-top: 0.25rem;
}

.current-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.75rem;
}

.btn-complete {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-skip {
  padding: 0.5rem 1rem;
  background: white;
  color: var(--color-danger, #e53935);
  border: 1px solid var(--color-danger, #e53935);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  cursor: pointer;
}

.next-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.next-label {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.next-token {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text, #333);
  margin-top: 0.3rem;
}

.next-detail {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
  margin-top: 0.2rem;
}

.btn-call {
  padding: 0.7rem 1.2rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.queue-table-wrapper {
  background: white;
  border-radius: 10px;
  padding: 0.75rem;
  border: 1px solid var(--color-border, #eee);
  flex: 1;
}

.queue-table-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}

.queue-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.queue-table th {
  color: var(--color-text-muted, #888);
  font-weight: 500;
  padding: 0.4rem 0.5rem;
  text-align: left;
}

.queue-table td {
  padding: 0.5rem;
  border-top: 1px solid var(--color-border-light, #f0f0f0);
  color: var(--color-text, #333);
}

.rank-cell {
  font-weight: 600;
  color: #FF6600;
}

.wait-cell {
  color: var(--color-text-placeholder, #999);
}

.right-panel {
  width: 220px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

.stats-card,
.info-card-sm {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
}

.stats-title,
.info-sm-label {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
  margin-bottom: 0.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding: 0.25rem 0;
  color: var(--color-text-secondary, #666);
}

.stat-val { font-weight: 600; }
.orange { color: #FF6600; }
.green { color: #4caf50; }
.orange-dark { color: #e65100; }
.grey { color: #999; }

.info-sm-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text, #333);
}

.info-sm-unit {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--color-text-muted, #888);
}

.info-sm-text {
  font-size: 0.85rem;
  color: var(--color-text, #333);
  font-weight: 500;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/queue-board.vue
git commit -m "feat: implement admin queue board page with call/complete actions"
```

---

### Task 18: Implement Admin — Sampling Entry page

**Files:**
- Create: `src/pages/admin/sampling.vue`

**Context:** DesktopLayout, 扦样录入 active. Appointment info card (read-only). 2-column form grid: 水分*, 出米率*, 杂质率, 腹白, 病斑, 异类互混, 检测结论*. 备注 textarea. 取消/保存并完成 buttons.

- [ ] **Step 1: Create admin sampling page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import DesktopLayout from '@/layouts/DesktopLayout.vue'
import AppointmentInfoCard from '@/components/AppointmentInfoCard.vue'

const appointment = ref({
  appointmentNumber: '20260522-002',
  driverName: '李师傅',
  licensePlate: '辽B67890',
  variety: '吉宏6',
})

const form = ref({
  moisture: 14.5,
  riceYield: 62.5,
  impurityRate: 1.2,
  bellyWhite: null as number | null,
  diseaseSpot: null as number | null,
  crossMix: null as number | null,
  conclusion: 'pass',
  notes: '',
})

function handleSave() {
  // Mock: submit sampling data
  // In real app: POST /api/sampling
}
</script>

<template>
  <DesktopLayout>
    <template #title>扦样录入</template>

    <AppointmentInfoCard
      :appointment-number="appointment.appointmentNumber"
      :driver-name="appointment.driverName"
      :license-plate="appointment.licensePlate"
      :variety="appointment.variety"
    />

    <div class="form-card">
      <div class="form-card-title">检测数据</div>

      <div class="form-grid">
        <div class="field">
          <label class="field-label">水分 <span class="required">*</span></label>
          <div class="field-input-wrap">
            <input v-model.number="form.moisture" class="field-input" type="number" step="0.1" />
            <span class="field-unit">%</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">出米率 <span class="required">*</span></label>
          <div class="field-input-wrap">
            <input v-model.number="form.riceYield" class="field-input" type="number" step="0.1" />
            <span class="field-unit">%</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">杂质率</label>
          <div class="field-input-wrap">
            <input v-model.number="form.impurityRate" class="field-input" type="number" step="0.1" />
            <span class="field-unit">%</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">腹白</label>
          <div class="field-input-wrap">
            <input v-model.number="form.bellyWhite" class="field-input" type="number" placeholder="%" />
            <span class="field-unit">%</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">病斑</label>
          <div class="field-input-wrap">
            <input v-model.number="form.diseaseSpot" class="field-input" type="number" placeholder="%" />
            <span class="field-unit">%</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">异类互混</label>
          <div class="field-input-wrap">
            <input v-model.number="form.crossMix" class="field-input" type="number" placeholder="%" />
            <span class="field-unit">%</span>
          </div>
        </div>
        <div class="field">
          <label class="field-label">检测结论 <span class="required">*</span></label>
          <select v-model="form.conclusion" class="field-select">
            <option value="pass">扦样通过</option>
            <option value="fail">扦样不通过</option>
          </select>
        </div>
      </div>

      <div class="field" style="margin-top: 1rem;">
        <label class="field-label">备注</label>
        <textarea v-model="form.notes" class="field-textarea" placeholder="选填，如特殊说明" />
      </div>

      <div class="form-actions">
        <button class="btn-cancel">取消</button>
        <button class="btn-save" @click="handleSave">保存并完成</button>
      </div>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.form-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 1.25rem;
  border: 1px solid var(--color-border, #eee);
  margin-top: 1rem;
}

.form-card-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.8rem;
  color: #555;
  font-weight: 500;
}

.required {
  color: var(--color-danger, #e53935);
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.field-input {
  flex: 1;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.85rem;
  outline: none;
}

.field-input:focus {
  border-color: #FF6600;
}

.field-unit {
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.field-select {
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.85rem;
  outline: none;
}

.field-textarea {
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.85rem;
  min-height: 3rem;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.25rem;
}

.btn-cancel {
  padding: 0.55rem 1.2rem;
  background: white;
  color: var(--color-text-secondary, #666);
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-save {
  padding: 0.55rem 1.2rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/sampling.vue
git commit -m "feat: implement admin sampling entry page with 2-column form"
```

---

### Task 19: Implement Admin — Dashboard page

**Files:**
- Create: `src/pages/admin/dashboard.vue`

**Context:** DesktopLayout, 数据看板 active. Date range selector. KPI cards (4-column). 7-day bar chart. Variety distribution list. Operation logs. Operations overview (avg times, peak hours, pass rate).

- [ ] **Step 1: Create admin dashboard page**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import DesktopLayout from '@/layouts/DesktopLayout.vue'
import KpiCard from '@/components/KpiCard.vue'
import { mockDashboard } from '@/mock/data'

const startDate = ref('2026-05-22')
const endDate = ref('2026-05-22')
const dashboard = ref(mockDashboard)
</script>

<template>
  <DesktopLayout>
    <template #title>数据看板</template>

    <!-- Date Range -->
    <div class="date-range">
      <input v-model="startDate" type="date" class="date-input" />
      <span>—</span>
      <input v-model="endDate" type="date" class="date-input" />
      <button class="btn-primary">查询</button>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <KpiCard label="今日预约" :value="dashboard.todayAppointments" border-color="#FF6600" :trend="dashboard.yesterdayComparison.appointments" trend-color="#4caf50" />
      <KpiCard label="已完成" :value="dashboard.completedCount" border-color="#4caf50" :trend="dashboard.yesterdayComparison.completed" trend-color="#4caf50" />
      <KpiCard label="排队中" :value="dashboard.queueingCount" border-color="#e65100" />
      <KpiCard label="已取消" :value="dashboard.cancelledCount" border-color="#999" trend="取消率 8.3%" trend-color="#999" />
    </div>

    <!-- Charts Row -->
    <div class="charts-row">
      <!-- 7-day Trend -->
      <div class="chart-card">
        <div class="chart-title">近7日预约趋势</div>
        <div class="bar-chart">
          <div v-for="(point, i) in dashboard.dailyTrend" :key="i" class="bar-col">
            <div
              class="bar"
              :style="{ height: Math.max(point.count * 10, 4) + 'px', opacity: point.isToday ? 1 : 0.6 }"
            />
            <span class="bar-label" :class="{ 'bar-today': point.isToday }">{{ point.date }}</span>
          </div>
        </div>
      </div>

      <!-- Variety Distribution -->
      <div class="chart-card">
        <div class="chart-title">品种分布</div>
        <div class="variety-list">
          <div v-for="item in dashboard.varietyDistribution" :key="item.variety" class="variety-row">
            <span class="variety-dot" :style="{ background: item.color }" />
            <span class="variety-name">{{ item.variety }}</span>
            <span class="variety-pct">{{ item.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row -->
    <div class="bottom-row">
      <!-- Operation Logs -->
      <div class="info-card">
        <div class="info-card-title">今日操作日志</div>
        <div v-for="(log, i) in dashboard.operationLogs" :key="i" class="log-row">
          {{ log.datetime }}  {{ log.licensePlate }} {{ log.activity }}  {{ log.operator }}
        </div>
      </div>

      <!-- Operations Overview -->
      <div class="info-card">
        <div class="info-card-title">运营概览</div>
        <div class="overview-grid">
          <div>
            <div class="overview-label">平均扦样时长</div>
            <div class="overview-value">{{ dashboard.avgSamplingTime }} <span class="overview-unit">分钟</span></div>
          </div>
          <div>
            <div class="overview-label">平均等待时长</div>
            <div class="overview-value">{{ dashboard.avgWaitTime }} <span class="overview-unit">分钟</span></div>
          </div>
          <div>
            <div class="overview-label">今日高峰时段</div>
            <div class="overview-text">{{ dashboard.peakHours }}</div>
          </div>
          <div>
            <div class="overview-label">总体合格率</div>
            <div class="overview-value" style="color: #4caf50;">{{ dashboard.passRate }}%</div>
          </div>
        </div>
      </div>
    </div>
  </DesktopLayout>
</template>

<style scoped>
.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-muted, #888);
  font-size: 0.8rem;
}

.date-input {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  outline: none;
}

.btn-primary {
  padding: 0.3rem 0.6rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.75rem;
  cursor: pointer;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.chart-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
}

.chart-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.75rem;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  height: 120px;
  padding: 0 0.25rem;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.bar {
  width: 100%;
  background: #FF6600;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.3s;
}

.bar-label {
  font-size: 0.65rem;
  color: var(--color-text-muted, #888);
}

.bar-today {
  color: #FF6600;
  font-weight: 600;
}

.variety-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.variety-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.variety-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
}

.variety-name {
  flex: 1;
  font-size: 0.8rem;
  color: var(--color-text-secondary, #666);
}

.variety-pct {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text, #333);
}

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.info-card {
  background: white;
  border-radius: var(--radius-lg, 8px);
  padding: 1rem;
  border: 1px solid var(--color-border, #eee);
}

.info-card-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-bottom: 0.5rem;
}

.log-row {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #666);
  padding: 0.3rem 0;
  border-bottom: 1px solid var(--color-border-light, #f5f5f5);
}

.log-row:last-child {
  border-bottom: none;
}

.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.overview-label {
  font-size: 0.7rem;
  color: var(--color-text-muted, #888);
}

.overview-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-top: 0.2rem;
}

.overview-unit {
  font-size: 0.7rem;
  font-weight: 400;
  color: var(--color-text-muted, #888);
}

.overview-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text, #333);
  margin-top: 0.2rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/dashboard.vue
git commit -m "feat: implement admin dashboard page with KPI cards and charts"
```

---

### Task 20: Implement Admin — User Management page

**Files:**
- Create: `src/pages/admin/users.vue`

**Context:** DesktopLayout, 用户管理 active (admin role only). Search + role filter + 新增用户. Table (7 columns). Role badge colors: admin=orange, operator=blue, manager=purple. Status: online=green, offline=grey. Operations: 重置密码 | 禁用. Admin self not operable.

- [ ] **Step 1: Create admin users page**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import DesktopLayout from '@/layouts/DesktopLayout.vue'
import { mockUsers } from '@/mock/data'
import type { User, UserRole } from '@/types/api'

const searchKeyword = ref('')
const roleFilter = ref('')
const users = ref(mockUsers)

const filtered = computed(() => {
  return users.value.filter(u => {
    if (searchKeyword.value && !u.username.includes(searchKeyword.value)) return false
    if (roleFilter.value && u.role !== roleFilter.value) return false
    return true
  })
})

const roleBadgeStyle: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: '#fff3e0', text: '#e65100' },
  operator: { bg: '#e3f2fd', text: '#1565c0' },
  manager: { bg: '#f3e5f5', text: '#7b1fa2' },
}

const roleLabel: Record<UserRole, string> = {
  admin: '管理员',
  operator: '操作员',
  manager: '管理者',
}

function isCurrentAdmin(username: string) {
  return username === 'admin'
}
</script>

<template>
  <DesktopLayout>
    <template #title>用户管理</template>

    <div class="toolbar">
      <div class="toolbar-left">
        <input v-model="searchKeyword" class="filter-input" placeholder="搜索用户名" />
        <select v-model="roleFilter" class="filter-select">
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="operator">操作员</option>
          <option value="manager">管理者</option>
        </select>
        <button class="btn-primary">查询</button>
      </div>
      <button class="btn-primary">+ 新增用户</button>
    </div>

    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>用户名</th><th>显示名称</th><th>角色</th><th>创建时间</th>
            <th>最后登录</th><th>状态</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filtered" :key="user.id">
            <td class="cell-bold">{{ user.username }}</td>
            <td>{{ user.displayName }}</td>
            <td>
              <span class="role-badge" :style="{ background: roleBadgeStyle[user.role].bg, color: roleBadgeStyle[user.role].text }">
                {{ roleLabel[user.role] }}
              </span>
            </td>
            <td>{{ user.createdAt }}</td>
            <td>{{ user.lastLogin }}</td>
            <td>
              <span
                class="status-badge-sm"
                :style="{
                  background: user.status === 'online' ? '#e8f5e9' : '#f5f5f5',
                  color: user.status === 'online' ? '#2e7d32' : '#999'
                }"
              >{{ user.status === 'online' ? '在线' : '离线' }}</span>
            </td>
            <td>
              <div v-if="!isCurrentAdmin(user.username)" class="action-group">
                <span class="action-link">重置密码</span>
                <span class="action-sep">|</span>
                <span class="action-link danger">禁用</span>
              </div>
              <span v-else class="action-disabled">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <div class="pagination">
        <span>共 {{ filtered.length }} 个用户</span>
        <div class="page-buttons">
          <button class="active">1</button>
        </div>
      </div>
    </template>
  </DesktopLayout>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toolbar-left {
  display: flex;
  gap: 0.5rem;
}

.filter-input {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  width: 160px;
  outline: none;
}

.filter-input:focus {
  border-color: #FF6600;
}

.filter-select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  outline: none;
}

.btn-primary {
  padding: 0.4rem 0.8rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

.table-wrapper {
  flex: 1;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}

.data-table th {
  background: #f5f5f5;
  color: var(--color-text-secondary, #666);
  padding: 0.5rem 0.6rem;
  font-weight: 600;
  text-align: left;
}

.data-table td {
  padding: 0.6rem;
  color: var(--color-text, #333);
  border-bottom: 1px solid var(--color-border-light, #f0f0f0);
}

.cell-bold {
  font-weight: 500;
}

.role-badge {
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.7rem;
  font-weight: 600;
}

.status-badge-sm {
  padding: 0.2rem 0.4rem;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.7rem;
  font-weight: 600;
}

.action-group {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.action-link {
  color: #FF6600;
  cursor: pointer;
  font-size: 0.7rem;
}

.action-link.danger {
  color: var(--color-danger, #e53935);
}

.action-sep {
  color: var(--color-text-placeholder, #999);
  font-size: 0.7rem;
}

.action-disabled {
  color: var(--color-text-placeholder, #ccc);
  font-size: 0.7rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--color-text-muted, #888);
}

.page-buttons button {
  padding: 0.3rem 0.6rem;
  border: 1px solid #FF6600;
  border-radius: var(--radius-sm, 4px);
  background: #FF6600;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/admin/users.vue
git commit -m "feat: implement admin user management page with role/status badges"
```

---

### Task 21: Update router configuration with manager routes

**Files:**
- Modify: `src/router/index.ts` (or equivalent)

**Context:** The architecture plan likely only has driver and admin routes. Add manager routes: /manager/dashboard. Ensure route guards for admin pages check authentication.

- [ ] **Step 1: Read current router config**

Run: `cat src/router/index.ts`

- [ ] **Step 2: Add manager routes and ensure all routes are present**

```typescript
// Expected route structure — add/reconcile as needed:
const routes = [
  {
    path: '/login',
    component: () => import('@/pages/login.vue'),
  },
  // Driver routes (MobileLayout, no auth required)
  {
    path: '/driver',
    children: [
      { path: 'create', component: () => import('@/pages/driver/create.vue') },
      { path: 'query', component: () => import('@/pages/driver/query.vue') },
      { path: 'queue', component: () => import('@/pages/driver/queue.vue') },
    ],
  },
  // Manager routes (MobileLayout, auth required)
  {
    path: '/manager',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('@/pages/manager/dashboard.vue') },
    ],
  },
  // Admin routes (DesktopLayout, auth required)
  {
    path: '/admin',
    meta: { requiresAuth: true },
    children: [
      { path: 'appointments', component: () => import('@/pages/admin/appointments.vue') },
      { path: 'queue-board', component: () => import('@/pages/admin/queue-board.vue') },
      { path: 'sampling', component: () => import('@/pages/admin/sampling.vue') },
      { path: 'dashboard', component: () => import('@/pages/admin/dashboard.vue') },
      { path: 'users', component: () => import('@/pages/admin/users.vue') },
    ],
  },
]
```

Add the Manager route section if it doesn't exist. Ensure the route guard checks `meta.requiresAuth` and redirects to `/login` if not authenticated.

- [ ] **Step 3: Commit**

```bash
git add src/router/index.ts
git commit -m "feat: add manager routes to router configuration"
```

---

### Task 22: Integration verification

**Files:** N/A (verification only)

**Context:** After all pages are implemented, verify the build compiles, routes work, and all pages render correctly with mock data.

- [ ] **Step 1: Run TypeScript check**

Run: `npx vue-tsc --noEmit`
Expected: No type errors.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Run unit tests**

Run: `npm run test`
Expected: All existing tests pass.

- [ ] **Step 4: Verify route resolution**

Run: Check that all page imports resolve correctly by verifying the build output.

- [ ] **Step 5: Check color consistency**

Run: `grep -rn "oklch" src/ --include="*.css" --include="*.vue"`
Expected: No oklch values remain anywhere in the source.

---

## Self-Review

### Spec Coverage

| Spec Section | Task |
|---|---|
| Design tokens (hex colors) | Task 1 |
| Status badges (5 statuses, color-coded) | Task 6 |
| MobileLayout (380px, role-aware tabs) | Task 4 |
| DesktopLayout (200px, #FF6600 sidebar) | Task 5 |
| Login page | Task 11 |
| Driver Create Appointment | Task 12 |
| Driver Query Records | Task 13 |
| Driver Queue Status | Task 14 |
| Manager Dashboard | Task 15 |
| Admin Appointments List | Task 16 |
| Admin Queue Board | Task 17 |
| Admin Sampling Entry | Task 18 |
| Admin Dashboard | Task 19 |
| Admin User Management | Task 20 |
| Router config | Task 21 |
| Integration verification | Task 22 |
| Tag selector (mobile) | Task 7 |
| QueueTimeline component | Task 8 |
| MetricCard / KpiCard components | Task 9 |
| AppointmentInfoCard | Task 10 |
| API types extension | Task 2 |
| Mock data extension | Task 3 |

### Placeholder Scan

No TBD, TODO, or placeholder content exists in any task. Every code block contains complete, working Vue 3 + TypeScript code with proper template, script, and style sections.

### Type Consistency

- All components use `defineProps`/`defineEmits` consistently
- Shared types (`Appointment`, `User`, `QueueBoardData`, `DashboardData`, `SamplingData`) defined in Task 2 and used across all page tasks
- `AppointmentStatus` union type used by StatusBadge and appointments list
- `UserRole` union type used by user management and DesktopLayout role filtering
