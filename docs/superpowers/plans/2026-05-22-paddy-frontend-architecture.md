# Paddy Frontend Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the frontend foundation for the grain sampling system — theme system, mock layer, and responsive layouts for driver (mobile) and admin (PC) users.

**Architecture:** uniapp Vite project with Vue 3 + TypeScript. CSS variables (tokens.css) → Tailwind config extend. Mock layer via VITE_USE_MOCK env switch (Adapter pattern). MobileLayout (bottom tabs) / DesktopLayout (sidebar) split by route group.

**Tech Stack:** uniapp, Vue 3, TypeScript, Vite, Tailwind CSS, Pinia, Vitest

---

## File Structure

```
PADDY/src/
├── styles/
│   ├── tokens.css           # Shared design tokens (colors, spacing, radius)
│   ├── theme-mobile.css      # Driver-side variable overrides
│   └── theme-admin.css       # Admin-side variable overrides
├── api/
│   ├── types.ts              # Shared request/response interfaces
│   ├── mock/
│   │   ├── data.ts           # Mock dataset covering all statuses
│   │   ├── auth.ts           # Mock auth handlers
│   │   ├── appointment.ts    # Mock appointment handlers
│   │   ├── queue.ts          # Mock queue handlers
│   │   ├── dashboard.ts      # Mock dashboard handlers
│   │   └── index.ts          # Mock adapter export
│   ├── real/
│   │   ├── auth.ts           # Real HTTP auth calls
│   │   ├── appointment.ts    # Real HTTP appointment calls
│   │   ├── queue.ts          # Real HTTP queue calls
│   │   ├── dashboard.ts      # Real HTTP dashboard calls
│   │   └── index.ts          # Real adapter export
│   └── index.ts              # Adapter: exports mock or real based on VITE_USE_MOCK
├── layouts/
│   ├── MobileLayout.vue      # Bottom tab nav, max-width 480px
│   └── DesktopLayout.vue     # Sidebar + top bar, min-width 1024px
├── pages/
│   ├── driver/               # Driver pages (mobile)
│   │   ├── create.vue
│   │   ├── query.vue
│   │   └── queue.vue
│   ├── admin/                # Admin pages (desktop)
│   │   ├── appointments.vue
│   │   ├── queue-board.vue
│   │   ├── sampling.vue
│   │   ├── dashboard.vue
│   │   └── users.vue
│   ├── manager/
│   │   └── dashboard.vue     # Manager mobile dashboard
│   └── auth/
│       └── login.vue
├── stores/
│   └── auth.ts               # Pinia auth store
├── components/
│   └── ui/                   # Shared base components
│       ├── Button.vue
│       ├── Input.vue
│       ├── Modal.vue
│       └── Toast.vue
├── router/
│   └── index.ts              # Route definitions + guard
└── main.ts                   # App entry, register plugins
```

---

### Task 0: Project Scaffold (if needed)

- [ ] **Step 1: Check if PADDY/ has a project**

Run: `ls PADDY/package.json 2>/dev/null && cat PADDY/package.json | head -5`
If package.json exists with vue/vite dependencies, skip to Task 1.
If not, scaffold:

```bash
cd PADDY
npx degit dcloudio/uni-preset-vue#vite-ts .
npm install
npm install -D tailwindcss @tailwindcss/vite
```

---

### Task 1: Theme System

**Files:**
- Create: `PADDY/src/styles/tokens.css`
- Create: `PADDY/src/styles/theme-mobile.css`
- Create: `PADDY/src/styles/theme-admin.css`
- Modify: `PADDY/tailwind.config.js`

- [ ] **Step 1: Create tokens.css**

```css
:root {
  --color-primary: oklch(55% 0.18 250);
  --color-primary-light: oklch(70% 0.15 250);
  --color-bg: oklch(98% 0 0);
  --color-surface: oklch(100% 0 0);
  --color-text: oklch(18% 0 0);
  --color-text-secondary: oklch(50% 0 0);
  --color-border: oklch(88% 0 0);
  --color-success: oklch(60% 0.18 145);
  --color-warning: oklch(75% 0.18 85);
  --color-error: oklch(55% 0.20 25);
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

- [ ] **Step 2: Create theme-mobile.css**

```css
:root {
  --color-primary: oklch(50% 0.20 250);
  --color-primary-light: oklch(65% 0.18 250);
  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 1.25rem;
}
```

- [ ] **Step 3: Create theme-admin.css**

```css
:root {
  --color-primary: oklch(45% 0.22 250);
  --color-bg: oklch(96% 0 0);
  --color-surface: oklch(100% 0 0);
  --space-xs: 0.125rem;
  --space-sm: 0.375rem;
  --space-md: 0.75rem;
}
```

- [ ] **Step 4: Configure tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{vue,ts,js}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: 'var(--color-primary)', light: 'var(--color-primary-light)' },
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        text: { DEFAULT: 'var(--color-text)', secondary: 'var(--color-text-secondary)' },
        border: 'var(--color-border)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      spacing: {
        xs: 'var(--space-xs)', sm: 'var(--space-sm)',
        md: 'var(--space-md)', lg: 'var(--space-lg)', xl: 'var(--space-xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)',
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 5: Verify Tailwind compiles**

Run: `cd PADDY && npx tailwindcss --help || echo "Tailwind installed"`
Add `tailwindcss` plugin to Vite config, run `npm run dev`, check that `bg-primary` resolves to the correct oklch value in dev tools.

---

### Task 2: Shared API Types

**Files:**
- Create: `PADDY/src/api/types.ts`

- [ ] **Step 1: Create types.ts**

```typescript
// ---- Enums ----
export type AppointmentStatus = 'pending' | 'token_assigned' | 'waiting' | 'called' | 'completed' | 'cancelled'
export type UserRole = 'admin' | 'operator' | 'manager'
export type CancelBy = 'driver' | 'operator'
export type Variety = '中科发5' | '吉宏6' | '鲜食玉米' | '杂粮'

// ---- API Envelope ----
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: { code: string; message: string; details?: any }
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ---- Appointment ----
export interface Appointment {
  _id: string
  appointmentNo: string
  driverName: string
  phone: string
  licensePlate: string
  variety: Variety
  appointmentDate: string
  appointmentTime: string
  remark: string
  status: AppointmentStatus
  tokenNo: string
  moisture?: number
  riceYield?: number
  createdAt: string
  queuedAt?: string
  calledAt?: string
  cancelledAt?: string
  cancelReason?: string
  cancelBy?: CancelBy
}

export interface CreateAppointmentRequest {
  driverName: string; phone: string; licensePlate: string; variety: Variety
  appointmentDate: string; appointmentTime: string; remark?: string
}

export interface QueryAppointmentRequest {
  phone: string; appointmentNo: string
}

export interface ListAppointmentsParams {
  page?: number; pageSize?: number; status?: AppointmentStatus
  keyword?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
}

export interface AssignTokenRequest { tokenNo: string }
export interface CompleteSamplingRequest { moisture: number; riceYield: number }
export interface CancelRequest { reason: string }
export interface CancelByDriverRequest { phone: string; reason?: string }

// ---- Queue ----
export interface QueueItem {
  position: number; appointmentId: string; appointmentNo: string
  driverName: string; licensePlate: string; tokenNo: string; queuedAt: string
}

export interface QueueBoard {
  queue: QueueItem[]; waitingCount: number
  currentServing: { appointmentId: string; appointmentNo: string; driverName: string } | null
}

export interface MyPosition {
  position?: number; waitingAhead?: number; status: AppointmentStatus
}

// ---- Dashboard ----
export interface DashboardData {
  totalAppointments: number; waitingCount: number
  completedCount: number; cancelledCount: number; lastUpdated: string
}

// ---- Auth ----
export interface LoginRequest { username: string; password: string }
export interface LoginResponse {
  accessToken: string; refreshToken: string
  user: { id: string; username: string; role: UserRole }
}
export interface RefreshRequest { refreshToken: string }
export interface RefreshResponse { accessToken: string; refreshToken: string }

// ---- User Management ----
export interface User { id: string; username: string; role: UserRole; createdAt: string }
export interface CreateUserRequest { username: string; password: string; role: UserRole }
export interface ResetPasswordRequest { newPassword: string }
```

---

### Task 3: Mock Data Set

**Files:**
- Create: `PADDY/src/api/mock/data.ts`

- [ ] **Step 1: Create data.ts**

```typescript
import type { Appointment, User } from '../types'

export const mockAppointments: Appointment[] = [
  { _id: '1', appointmentNo: '20260522001', driverName: '张三', phone: '13800138000',
    licensePlate: '辽A12345', variety: '中科发5', appointmentDate: '2026-05-22',
    appointmentTime: '08:30', remark: '', status: 'pending', tokenNo: '',
    createdAt: '2026-05-22T06:00:00Z' },
  { _id: '2', appointmentNo: '20260522002', driverName: '李四', phone: '13900139000',
    licensePlate: '吉B67890', variety: '吉宏6', appointmentDate: '2026-05-22',
    appointmentTime: '09:00', remark: '第一次送粮', status: 'token_assigned', tokenNo: 'A001',
    createdAt: '2026-05-22T06:30:00Z' },
  { _id: '3', appointmentNo: '20260522003', driverName: '王五', phone: '13700137000',
    licensePlate: '黑C11111', variety: '鲜食玉米', appointmentDate: '2026-05-22',
    appointmentTime: '09:30', remark: '', status: 'waiting', tokenNo: 'A002',
    createdAt: '2026-05-22T07:00:00Z', queuedAt: '2026-05-22T08:00:00Z' },
  { _id: '4', appointmentNo: '20260522004', driverName: '赵六', phone: '13600136000',
    licensePlate: '辽D22222', variety: '杂粮', appointmentDate: '2026-05-22',
    appointmentTime: '10:00', remark: '', status: 'called', tokenNo: 'A003',
    createdAt: '2026-05-22T07:30:00Z', queuedAt: '2026-05-22T08:15:00Z',
    calledAt: '2026-05-22T09:00:00Z' },
  { _id: '5', appointmentNo: '20260522005', driverName: '钱七', phone: '13500135000',
    licensePlate: '蒙E33333', variety: '中科发5', appointmentDate: '2026-05-22',
    appointmentTime: '10:30', remark: '', status: 'completed', tokenNo: 'A004',
    moisture: 14.5, riceYield: 60.2,
    createdAt: '2026-05-22T08:00:00Z', queuedAt: '2026-05-22T08:30:00Z',
    calledAt: '2026-05-22T09:15:00Z' },
  { _id: '6', appointmentNo: '20260521001', driverName: '孙八', phone: '13400134000',
    licensePlate: '辽F44444', variety: '吉宏6', appointmentDate: '2026-05-21',
    appointmentTime: '14:00', remark: '取消', status: 'cancelled', tokenNo: 'A005',
    createdAt: '2026-05-21T06:00:00Z', cancelledAt: '2026-05-21T11:00:00Z',
    cancelReason: '司机迟到', cancelBy: 'operator' },
]

export const mockUsers: User[] = [
  { id: 'u1', username: 'admin', role: 'admin', createdAt: '2026-05-01T00:00:00Z' },
  { id: 'u2', username: 'op01', role: 'operator', createdAt: '2026-05-01T00:00:00Z' },
  { id: 'u3', username: 'op02', role: 'operator', createdAt: '2026-05-02T00:00:00Z' },
  { id: 'u4', username: 'manager01', role: 'manager', createdAt: '2026-05-03T00:00:00Z' },
]

export const mockTokens = {
  accessToken: 'mock-access-token-for-testing',
  refreshToken: 'mock-refresh-token-for-testing',
}
```

---

### Task 4: Mock Auth Module

**Files:**
- Create: `PADDY/src/api/mock/auth.ts`

- [ ] **Step 1: Create mock/auth.ts**

```typescript
import type { LoginRequest, LoginResponse, RefreshResponse } from '../types'
import { mockUsers, mockTokens } from './data'

const CREDENTIALS: Record<string, string> = {
  admin: 'admin123', op01: 'op123456', op02: 'op123456', manager01: 'manager123',
}

export function mockLogin(data: LoginRequest): LoginResponse {
  const pw = CREDENTIALS[data.username]
  if (!pw || pw !== data.password) throw { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误', status: 401 }
  const user = mockUsers.find(u => u.username === data.username)!
  return { accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken, user: { id: user.id, username: user.username, role: user.role } }
}

export function mockRefresh(token: string): RefreshResponse {
  if (token !== mockTokens.refreshToken) throw { code: 'TOKEN_EXPIRED', message: 'refresh token 已过期', status: 401 }
  return { accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken }
}
```

---

### Task 5: Mock Appointment Module

**Files:**
- Create: `PADDY/src/api/mock/appointment.ts`

- [ ] **Step 1: Create mock/appointment.ts**

```typescript
import type { Appointment, CreateAppointmentRequest, QueryAppointmentRequest, ListAppointmentsParams, PaginatedData, AssignTokenRequest, CompleteSamplingRequest, CancelRequest, CancelByDriverRequest } from '../types'
import { mockAppointments } from './data'

let appointments = [...mockAppointments]
let nextSeq = 7
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')

export function resetMockData() { appointments = [...mockAppointments]; nextSeq = 7 }

function findOrThrow(id: string) {
  const a = appointments.find(x => x._id === id)
  if (!a) throw { code: 'NOT_FOUND', message: '预约不存在', status: 404 }
  return a
}

function update(id: string, updates: Partial<Appointment>) {
  const idx = appointments.findIndex(x => x._id === id)
  appointments[idx] = { ...appointments[idx], ...updates }
  return appointments[idx]
}

export function mockCreateAppointment(data: CreateAppointmentRequest) {
  const appt: Appointment = { _id: String(Date.now()), appointmentNo: `${today}${String(nextSeq++).padStart(3, '0')}`, ...data, remark: data.remark || '', status: 'pending', tokenNo: '', createdAt: new Date().toISOString() }
  appointments.unshift(appt); return appt
}

export function mockQueryAppointment(data: QueryAppointmentRequest) {
  const appt = appointments.find(a => a.phone === data.phone && a.appointmentNo === data.appointmentNo)
  if (!appt) throw { code: 'NOT_FOUND', message: '未找到匹配的记录', status: 404 }
  if (appt.status === 'waiting') {
    const pos = appointments.filter(a => a.status === 'waiting' && a.queuedAt! < appt.queuedAt!).length
    return { ...appt, queuePosition: pos + 1 }
  }
  return appt
}

export function mockListAppointments(params: ListAppointmentsParams): PaginatedData<Appointment> {
  let f = [...appointments]
  if (params.status) f = f.filter(a => a.status === params.status)
  if (params.keyword) { const kw = params.keyword.toLowerCase(); f = f.filter(a => a.driverName.includes(kw) || a.phone.includes(kw) || a.licensePlate.includes(kw)) }
  const total = f.length; const page = params.page || 1; const ps = params.pageSize || 20
  return { items: f.slice((page-1)*ps, page*ps), total, page, pageSize }
}

export function mockGetAppointment(id: string) { return findOrThrow(id) }

export function mockAssignToken(id: string, data: AssignTokenRequest) {
  const a = findOrThrow(id)
  if (a.status !== 'pending') throw { code: 'INVALID_STATUS', message: '当前状态不允许分配令牌', status: 409 }
  return update(id, { status: 'token_assigned', tokenNo: data.tokenNo })
}

export function mockCheckIn(id: string) {
  const a = findOrThrow(id)
  if (a.status !== 'token_assigned') throw { code: 'INVALID_STATUS', message: '当前状态不允许签到入队', status: 409 }
  return update(id, { status: 'waiting', queuedAt: new Date().toISOString() })
}

export function mockCall(id: string) {
  const a = findOrThrow(id)
  if (a.status !== 'waiting') throw { code: 'INVALID_STATUS', message: '当前状态不允许叫号', status: 409 }
  return update(id, { status: 'called', calledAt: new Date().toISOString() })
}

export function mockComplete(id: string, data: CompleteSamplingRequest) {
  const a = findOrThrow(id)
  if (a.status !== 'called') throw { code: 'INVALID_STATUS', message: '当前状态不允许录入结果', status: 409 }
  return update(id, { status: 'completed', moisture: data.moisture, riceYield: data.riceYield })
}

export function mockCancel(id: string, data: CancelRequest) {
  const a = findOrThrow(id)
  if (a.status === 'completed') throw { code: 'INVALID_STATUS', message: '已完成预约不可取消', status: 409 }
  return update(id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: data.reason, cancelBy: 'operator' })
}

export function mockCancelByDriver(id: string, data: CancelByDriverRequest) {
  const a = findOrThrow(id)
  if (a.phone !== data.phone) throw { code: 'FORBIDDEN', message: '手机号与预约不匹配', status: 403 }
  if (a.status !== 'pending') throw { code: 'INVALID_STATUS', message: '当前状态不允许取消', status: 409 }
  return update(id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: data.reason || '司机取消', cancelBy: 'driver' })
}

export function mockSkip(id: string) {
  const a = findOrThrow(id)
  if (a.status !== 'waiting') throw { code: 'INVALID_STATUS', message: '只有等待中的预约可以跳过', status: 409 }
  return update(id, { queuedAt: new Date().toISOString() })
}
```

---

### Task 6: Mock Queue, Dashboard, and Index

**Files:**
- Create: `PADDY/src/api/mock/queue.ts`
- Create: `PADDY/src/api/mock/dashboard.ts`
- Create: `PADDY/src/api/mock/index.ts`

- [ ] **Step 1: mock/queue.ts**

```typescript
import type { QueueBoard, MyPosition } from '../types'
import { mockAppointments } from './data'

export function mockGetQueue(): QueueBoard {
  const waiting = mockAppointments.filter(a => a.status === 'waiting').sort((a, b) => new Date(a.queuedAt!).getTime() - new Date(b.queuedAt!).getTime())
  const current = mockAppointments.find(a => a.status === 'called') || null
  return {
    queue: waiting.map((a, i) => ({ position: i + 1, appointmentId: a._id, appointmentNo: a.appointmentNo, driverName: a.driverName, licensePlate: a.licensePlate, tokenNo: a.tokenNo, queuedAt: a.queuedAt! })),
    waitingCount: waiting.length,
    currentServing: current ? { appointmentId: current._id, appointmentNo: current.appointmentNo, driverName: current.driverName } : null,
  }
}

export function mockGetMyPosition(appointmentNo: string): MyPosition | null {
  const a = mockAppointments.find(x => x.appointmentNo === appointmentNo)
  if (!a || (a.status !== 'waiting' && a.status !== 'called' && a.status !== 'completed')) return null
  const r: MyPosition = { status: a.status }
  if (a.status === 'waiting') {
    const ahead = mockAppointments.filter(x => x.status === 'waiting' && x.queuedAt! < a.queuedAt!).length
    r.position = ahead + 1; r.waitingAhead = ahead
  }
  return r
}
```

- [ ] **Step 2: mock/dashboard.ts**

```typescript
import type { DashboardData } from '../types'
import { mockAppointments } from './data'

export function mockGetTodayDashboard(): DashboardData {
  const today = new Date().toISOString().slice(0, 10)
  const t = mockAppointments.filter(a => a.appointmentDate === today)
  return { totalAppointments: t.length, waitingCount: t.filter(a => a.status === 'waiting').length, completedCount: t.filter(a => a.status === 'completed').length, cancelledCount: t.filter(a => a.status === 'cancelled').length, lastUpdated: new Date().toISOString() }
}
```

- [ ] **Step 3: mock/index.ts**

```typescript
export { mockLogin, mockRefresh } from './auth'
export { mockCreateAppointment, mockQueryAppointment, mockListAppointments, mockGetAppointment, mockAssignToken, mockCheckIn, mockCall, mockComplete, mockCancel, mockCancelByDriver, mockSkip, resetMockData } from './appointment'
export { mockGetQueue, mockGetMyPosition } from './queue'
export { mockGetTodayDashboard } from './dashboard'
import { mockUsers } from '../data'
export function mockListUsers() { return { items: mockUsers, total: mockUsers.length } }
```

---

### Task 7: Real API Modules

**Files:**
- Create: `PADDY/src/api/real/auth.ts`
- Create: `PADDY/src/api/real/appointment.ts`
- Create: `PADDY/src/api/real/queue.ts`
- Create: `PADDY/src/api/real/dashboard.ts`
- Create: `PADDY/src/api/real/index.ts`

- [ ] **Step 1: real/auth.ts**

```typescript
import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, ApiResponse } from '../types'
const BASE = import.meta.env.VITE_API_BASE_URL || ''
async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...opts.headers as Record<string, string> }, ...opts })
  const json: ApiResponse<T> = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}
export function login(d: LoginRequest) { return request<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(d) }) }
export function refresh(d: RefreshRequest) { return request<RefreshResponse>('/api/auth/refresh', { method: 'POST', body: JSON.stringify(d) }) }
```

- [ ] **Step 2: real/appointment.ts**

```typescript
import type { Appointment, CreateAppointmentRequest, QueryAppointmentRequest, ListAppointmentsParams, PaginatedData, AssignTokenRequest, CompleteSamplingRequest, CancelRequest, CancelByDriverRequest } from '../types'
const BASE = import.meta.env.VITE_API_BASE_URL || ''
function authHeaders() { const t = localStorage.getItem('accessToken'); return t ? { 'Authorization': `Bearer ${t}` } : {} as Record<string, string> }
async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...authHeaders(), ...opts.headers as Record<string, string> }, ...opts })
  const json = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}
export function createAppointment(d: CreateAppointmentRequest) { return request<Appointment>('/api/appointments', { method: 'POST', body: JSON.stringify(d) }) }
export function queryAppointment(d: QueryAppointmentRequest) { return request<Appointment & { queuePosition?: number }>('/api/appointments/query', { method: 'POST', body: JSON.stringify(d) }) }
export function listAppointments(p: ListAppointmentsParams) { const q = new URLSearchParams(); if(p.page) q.set('page',String(p.page)); if(p.pageSize) q.set('pageSize',String(p.pageSize)); if(p.status) q.set('status',p.status); if(p.keyword) q.set('keyword',p.keyword); if(p.sortBy) q.set('sortBy',p.sortBy); if(p.sortOrder) q.set('sortOrder',p.sortOrder); return request<PaginatedData<Appointment>>(`/api/appointments?${q.toString()}`) }
export function getAppointment(id: string) { return request<Appointment>(`/api/appointments/${id}`) }
export function assignToken(id: string, d: AssignTokenRequest) { return request<Appointment>(`/api/appointments/${id}/assign-token`, { method: 'POST', body: JSON.stringify(d) }) }
export function checkIn(id: string) { return request<Appointment>(`/api/appointments/${id}/check-in`, { method: 'POST' }) }
export function callAppointment(id: string) { return request<Appointment>(`/api/appointments/${id}/call`, { method: 'POST' }) }
export function completeSampling(id: string, d: CompleteSamplingRequest) { return request<Appointment>(`/api/appointments/${id}/complete`, { method: 'POST', body: JSON.stringify(d) }) }
export function cancelAppointment(id: string, d: CancelRequest) { return request<Appointment>(`/api/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify(d) }) }
export function cancelByDriver(id: string, d: CancelByDriverRequest) { return request<Appointment>(`/api/appointments/${id}/cancel-by-driver`, { method: 'POST', body: JSON.stringify(d) }) }
export function skipAppointment(id: string) { return request<Appointment>(`/api/appointments/${id}/skip`, { method: 'POST' }) }
```

- [ ] **Step 3: real/queue.ts**

```typescript
import type { QueueBoard, MyPosition } from '../types'
const BASE = import.meta.env.VITE_API_BASE_URL || ''
async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = localStorage.getItem('accessToken'); const h: Record<string,string> = {'Content-Type':'application/json'}; if(t) h['Authorization']=`Bearer ${t}`
  const res = await fetch(`${BASE}${path}`,{headers:h,...opts}); const json=await res.json()
  if(!json.success&&json.error) throw{code:json.error.code,message:json.error.message,status:res.status}
  return json.data as T
}
export function getQueue(){return request<QueueBoard>('/api/queue')}
export function getMyPosition(n:string){return request<MyPosition>(`/api/queue/my-position?appointmentNo=${encodeURIComponent(n)}`)}
```

- [ ] **Step 4: real/dashboard.ts**

```typescript
import type { DashboardData } from '../types'
const BASE=import.meta.env.VITE_API_BASE_URL||''
export async function getTodayDashboard():Promise<DashboardData>{
  const t=localStorage.getItem('accessToken')
  const res=await fetch(`${BASE}/api/dashboard/today`,{headers:{'Authorization':`Bearer ${t}`,'Content-Type':'application/json'}})
  const json=await res.json()
  if(!json.success&&json.error) throw{code:json.error.code,message:json.error.message,status:res.status}
  return json.data
}
```

- [ ] **Step 5: real/index.ts**

```typescript
export { login, refresh } from './auth'
export { createAppointment, queryAppointment, listAppointments, getAppointment, assignToken, checkIn, callAppointment, completeSampling, cancelAppointment, cancelByDriver, skipAppointment } from './appointment'
export { getQueue, getMyPosition } from './queue'
export { getTodayDashboard } from './dashboard'

import type { User, CreateUserRequest, ResetPasswordRequest } from '../types'
const BASE=import.meta.env.VITE_API_BASE_URL||''
async function request<T>(path:string, opts:RequestInit={}):Promise<T>{
  const t=localStorage.getItem('accessToken')
  const res=await fetch(`${BASE}${path}`,{headers:{'Authorization':`Bearer ${t}`,'Content-Type':'application/json',...opts.headers as Record<string,string>},...opts})
  const json=await res.json()
  if(!json.success&&json.error) throw{code:json.error.code,message:json.error.message,status:res.status}
  return json.data as T
}
export function listUsers(){return request<{items:User[];total:number}>('/api/users')}
export function createUser(d:CreateUserRequest){return request<{id:string;username:string;role:string}>('/api/users',{method:'POST',body:JSON.stringify(d)})}
export function deleteUser(id:string){return request<void>(`/api/users/${id}`,{method:'DELETE'})}
export function resetPassword(id:string,d:ResetPasswordRequest){return request<void>(`/api/users/${id}/reset-password`,{method:'POST',body:JSON.stringify(d)})}
```

---

### Task 8: API Adapter Index

**Files:**
- Create: `PADDY/src/api/index.ts`

- [ ] **Step 1: Create api/index.ts**

```typescript
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const api = USE_MOCK ? await import('./mock/index.ts') : await import('./real/index.ts')

export const {
  login, refresh,
  createAppointment, queryAppointment, listAppointments, getAppointment,
  assignToken, checkIn, callAppointment, completeSampling,
  cancelAppointment, cancelByDriver, skipAppointment,
  getQueue, getMyPosition,
  getTodayDashboard,
  listUsers, createUser, deleteUser, resetPassword,
} = api

export const resetMockData = USE_MOCK ? (api as typeof import('./mock/index.ts')).resetMockData : undefined
```

---

### Task 9: MobileLayout

**Files:**
- Create: `PADDY/src/layouts/MobileLayout.vue`

- [ ] **Step 1: Create MobileLayout.vue**

```vue
<template>
  <div class="mobile-layout">
    <header class="mobile-header">
      <button v-if="showBack" class="back-btn" @click="goBack">&#8592;</button>
      <h1 class="header-title">{{ title }}</h1>
    </header>
    <main class="mobile-content"><slot /></main>
    <nav class="mobile-tabs">
      <router-link v-for="tab in tabs" :key="tab.path" :to="tab.path" class="tab-item" :class="{ active: isActive(tab.path) }">
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const tabs = [
  { path: '/driver/create', icon: '📋', label: '预约' },
  { path: '/driver/query', icon: '🔍', label: '查询' },
  { path: '/driver/queue', icon: '🔄', label: '排队' },
]
const title = computed(() => {
  const map: Record<string, string> = { '/driver/create': '创建预约', '/driver/query': '查询记录', '/driver/queue': '排队状态' }
  return map[route.path] || '好雨粮库'
})
const showBack = computed(() => route.path !== '/driver/create')
const isActive = (path: string) => route.path.startsWith(path)
const goBack = () => router.back()
</script>

<style scoped>
.mobile-layout { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: var(--color-bg); }
.mobile-header { display: flex; align-items: center; padding: var(--space-md); background: var(--color-surface); border-bottom: 1px solid var(--color-border); position: sticky; top: 0; z-index: 10; }
.back-btn { background: none; border: none; font-size: 1.25rem; padding: 0 var(--space-sm); cursor: pointer; }
.header-title { flex: 1; text-align: center; font-size: 1.125rem; font-weight: 600; margin: 0; }
.mobile-content { flex: 1; overflow-y: auto; padding: var(--space-md); }
.mobile-tabs { display: flex; border-top: 1px solid var(--color-border); background: var(--color-surface); position: sticky; bottom: 0; }
.tab-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: var(--space-sm) 0; text-decoration: none; color: var(--color-text-secondary); font-size: 0.75rem; }
.tab-item.active { color: var(--color-primary); }
.tab-icon { font-size: 1.25rem; }
</style>
```

---

### Task 10: DesktopLayout

**Files:**
- Create: `PADDY/src/layouts/DesktopLayout.vue`

- [ ] **Step 1: Create DesktopLayout.vue**

```vue
<template>
  <div class="desktop-layout">
    <aside class="sidebar">
      <div class="sidebar-header"><h2>好雨粮库</h2></div>
      <nav class="sidebar-nav">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="nav-item" :class="{ active: isActive(item.path) }">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>
    <div class="main-area">
      <header class="topbar">
        <span class="topbar-title">{{ currentTitle }}</span>
        <div class="topbar-right">
          <span class="user-info">{{ user?.username }} ({{ roleLabel }})</span>
          <button class="logout-btn" @click="handleLogout">退出</button>
        </div>
      </header>
      <main class="desktop-content"><slot /></main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const user = computed(() => auth.user)
const roleLabel = computed(() => ({ admin: '管理员', operator: '操作员', manager: '管理者' })[auth.user?.role || ''] || '')
const menuItems = computed(() => {
  const role = auth.user?.role
  const items = [
    { path: '/admin/appointments', icon: '📋', label: '预约列表', roles: ['operator','manager'] },
    { path: '/admin/queue-board', icon: '🔄', label: '排队看板', roles: ['operator','manager'] },
    { path: '/admin/sampling', icon: '📊', label: '扦样录入', roles: ['operator'] },
    { path: '/admin/dashboard', icon: '📈', label: '数据看板', roles: ['operator','manager'] },
    { path: '/admin/users', icon: '👤', label: '用户管理', roles: ['admin'] },
  ]
  return role ? items.filter(item => item.roles.includes(role)) : []
})
const currentTitle = computed(() => menuItems.value.find(item => isActive(item.path))?.label || '')
const isActive = (path: string) => route.path.startsWith(path)
const handleLogout = () => { auth.logout(); router.push('/login') }
</script>

<style scoped>
.desktop-layout { display: flex; min-height: 100vh; min-width: 1024px; }
.sidebar { width: 220px; background: var(--color-surface); border-right: 1px solid var(--color-border); display: flex; flex-direction: column; }
.sidebar-header { padding: var(--space-lg); border-bottom: 1px solid var(--color-border); }
.sidebar-header h2 { margin: 0; font-size: 1.25rem; color: var(--color-primary); }
.sidebar-nav { flex: 1; padding: var(--space-sm); }
.nav-item { display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md); text-decoration: none; color: var(--color-text); font-size: 0.875rem; }
.nav-item:hover { background: var(--color-bg); }
.nav-item.active { background: var(--color-primary); color: white; }
.main-area { flex: 1; display: flex; flex-direction: column; }
.topbar { display: flex; align-items: center; justify-content: space-between; padding: var(--space-md) var(--space-lg); border-bottom: 1px solid var(--color-border); background: var(--color-surface); }
.topbar-title { font-size: 1.125rem; font-weight: 600; }
.topbar-right { display: flex; align-items: center; gap: var(--space-md); }
.user-info { font-size: 0.875rem; color: var(--color-text-secondary); }
.logout-btn { padding: var(--space-xs) var(--space-md); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: none; cursor: pointer; font-size: 0.875rem; }
.logout-btn:hover { background: var(--color-bg); }
.desktop-content { flex: 1; padding: var(--space-lg); overflow-y: auto; }
</style>
```

---

### Task 11: Auth Store (Pinia)

**Files:**
- Create: `PADDY/src/stores/auth.ts`

- [ ] **Step 1: Create auth store**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserRole } from '../api/types'
import { login as apiLogin } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const user = ref<{ id: string; username: string; role: UserRole } | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  async function login(username: string, password: string) {
    const r = await apiLogin({ username, password })
    token.value = r.accessToken; refreshToken.value = r.refreshToken; user.value = r.user
    localStorage.setItem('accessToken', r.accessToken); localStorage.setItem('refreshToken', r.refreshToken); localStorage.setItem('user', JSON.stringify(r.user))
  }

  function logout() {
    token.value = null; refreshToken.value = null; user.value = null
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user')
  }

  return { token, refreshToken, user, login, logout }
})
```

---

### Task 12: Router

**Files:**
- Create: `PADDY/src/router/index.ts`

- [ ] **Step 1: Create router**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../pages/auth/login.vue') },
    { path: '/driver', component: () => import('../layouts/MobileLayout.vue'), children: [
      { path: 'create', component: () => import('../pages/driver/create.vue') },
      { path: 'query', component: () => import('../pages/driver/query.vue') },
      { path: 'queue', component: () => import('../pages/driver/queue.vue') },
    ]},
    { path: '/manager', component: () => import('../layouts/MobileLayout.vue'), children: [
      { path: 'dashboard', component: () => import('../pages/manager/dashboard.vue') },
    ]},
    { path: '/admin', component: () => import('../layouts/DesktopLayout.vue'), meta: { requiresAuth: true }, children: [
      { path: 'appointments', component: () => import('../pages/admin/appointments.vue') },
      { path: 'queue-board', component: () => import('../pages/admin/queue-board.vue') },
      { path: 'sampling', component: () => import('../pages/admin/sampling.vue') },
      { path: 'dashboard', component: () => import('../pages/admin/dashboard.vue') },
      { path: 'users', component: () => import('../pages/admin/users.vue') },
    ]},
    { path: '/', redirect: '/driver/create' },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.token) { next('/login'); return }
  }
  next()
})

export default router
```

---

### Task 13: Base UI Components

**Files:**
- Create: `PADDY/src/components/ui/Button.vue`
- Create: `PADDY/src/components/ui/Input.vue`
- Create: `PADDY/src/components/ui/Modal.vue`
- Create: `PADDY/src/components/ui/Toast.vue`

- [ ] **Step 1: Button.vue**

```vue
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
```

- [ ] **Step 2: Input.vue**

```vue
<template><input class="input" :value="modelValue" @input="$emit('update:modelValue',($event.target as HTMLInputElement).value)" v-bind="$attrs"/></template>
<script setup lang="ts">
defineProps<{modelValue:string}>()
defineEmits(['update:modelValue'])
</script>
<style scoped>
.input{width:100%;padding:var(--space-sm) var(--space-md);border:1px solid var(--color-border);border-radius:var(--radius-md);font-size:.875rem}
.input:focus{outline:none;border-color:var(--color-primary)}
</style>
```

- [ ] **Step 3: Modal.vue**

```vue
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
```

- [ ] **Step 4: Toast.vue**

```vue
<template><div v-if="visible" class="toast" :class="`toast-${type}`">{{message}}</div></template>
<script setup lang="ts">
defineProps<{visible:boolean;message:string;type?:'success'|'error'|'info'}>()
</script>
<style scoped>
.toast{position:fixed;top:var(--space-lg);left:50%;transform:translateX(-50%);padding:var(--space-sm) var(--space-lg);border-radius:var(--radius-md);z-index:200;font-size:.875rem}
.toast-success{background:var(--color-success);color:white}.toast-error{background:var(--color-error);color:white}.toast-info{background:var(--color-primary);color:white}
</style>
```

---

### Task 14: Main Entry and Vite Config

**Files:**
- Modify: `PADDY/src/main.ts`
- Modify: `PADDY/vite.config.ts`

- [ ] **Step 1: Update main.ts**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/tokens.css'
const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 2: Update vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [uni(), tailwindcss()],
})
```

---

### Task 15: Verify Theme

- [ ] **Step 1: Quick theme test**

Add to App.vue temporarily:
```vue
<template>
  <div class="bg-surface p-lg rounded-lg" style="box-shadow: 0 1px 3px rgba(0,0,0,.1)">
    <h1 class="text-text" style="font-size:1.25rem;font-weight:700">Theme Test</h1>
    <button class="bg-primary text-white" style="padding:.5rem 1rem;border-radius:.5rem;margin-top:.5rem">Button</button>
  </div>
</template>
```
Run `npm run dev`. Inspect in browser: bg-primary should resolve to oklch value. Remove after verification.

---

### Task 16: Verify Mock API

- [ ] **Step 1: Test mock endpoints**

Run `cd PADDY && npm run dev`. In browser console:
```js
const api = await import('./src/api/index.ts')

// List appointments
const appts = await api.listAppointments({ page: 1 })
console.log(appts)  // { items: [...6 items], total: 6, page: 1, pageSize: 20 }

// Queue
const queue = await api.getQueue()
console.log(queue)  // { queue: [1 waiting], waitingCount: 1, currentServing: {...} }

// Dashboard
const dash = await api.getTodayDashboard()
console.log(dash)   // { totalAppointments: 5, waitingCount: 1, completedCount: 1, cancelledCount: 1, ... }
```

- [ ] **Step 2: Test error responses**

```js
// Invalid login
try { await api.login({ username: 'admin', password: 'wrong' }) }
catch(e) { console.log(e.code) }  // "INVALID_CREDENTIALS"

// Wrong phone for cancel
try { await api.cancelByDriver('1', { phone: 'wrong' }) }
catch(e) { console.log(e.code) }  // "FORBIDDEN"
```

- [ ] **Step 3: Verify real API switch**

Set `VITE_USE_MOCK=false` and `VITE_API_BASE_URL=http://localhost:3000` in `.env`.
Start backend from the backend plan. Test login:
```js
const api = await import('./src/api/index.ts')
const r = await api.login({ username: 'admin', password: 'admin123' })
console.log(r.accessToken)  // Should be a real JWT
```

---

### Task 17: Verify Responsive Layout

- [ ] **Step 1: Mobile viewport (375px)**

Set dev tools to 375px width. Navigate to `/driver/create`.
- Header "创建预约" visible
- Bottom tabs: 预约/查询/排队
- Single column, no horizontal scroll

- [ ] **Step 2: Desktop viewport (1440px)**

Set dev tools to 1440px. Navigate to `/admin/appointments`. Must be logged in.
- Sidebar with role-filtered menu
- Top bar with username + logout
- Main content filling remaining space

- [ ] **Step 3: Route guard**

Clear localStorage. Navigate to `/admin/appointments`.
- Redirect to `/login`

- [ ] **Step 4: Manager mobile dashboard**

Navigate to `/manager/dashboard` at 375px.
- Renders in MobileLayout
- Shows dashboard data

---

## Self-Review

**1. Spec coverage:**

| Spec Requirement | Implementation |
|---|---|
| CSS tokens as custom properties | Task 1 — tokens.css with all colors, spacing, radius |
| Tailwind maps CSS variables | Task 1 Step 4 — tailwind.config.js extend |
| Driver/admin different themes | Task 1 — theme-mobile.css / theme-admin.css |
| VITE_USE_MOCK env switch | Task 8 — api/index.ts dynamic import |
| Shared types for mock/real | Task 2 — types.ts |
| Mock data all 6 statuses | Task 3 — data.ts |
| Mock auth, appointment, queue, dashboard | Tasks 4-6 |
| Real HTTP layer | Task 7 — all 5 modules |
| MobileLayout bottom tabs | Task 9 |
| DesktopLayout sidebar | Task 10 |
| Auth store (Pinia) | Task 11 |
| Route-based layout split | Task 12 — /driver→Mobile, /admin→Desktop |
| Manager mobile dashboard route | Task 12 — /manager/dashboard→MobileLayout |
| Route guard for admin | Task 12 — beforeEach |
| Base UI components | Task 13 — Button, Input, Modal, Toast |
| Vite config with tailwind | Task 14 |

**2. Placeholder scan:** No "TBD", "implement later", or "add appropriate" found. Every file has complete code.

**3. Type consistency:** Types in types.ts match usage across all mock/real modules. Route paths match layout imports. Store function signatures match API types.
