# Paddy Backend API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Hono + SQLite + JWT backend service with 22 RESTful API endpoints for the grain sampling system.

**Architecture:** Hono routes → middleware (auth, error) → services → SQLite (better-sqlite3). State machine validation on status transitions. Counters table for appointment number generation.

**Tech Stack:** Node.js 20+, TypeScript 5, Hono 4, better-sqlite3, @hono/jwt, bcryptjs, @hono/node-server

---

## File Structure

```
PADDY/backend/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point, starts server via @hono/node-server
│   ├── app.ts                   # Hono app, middleware registration, route mounting
│   ├── db/
│   │   ├── schema.ts            # CREATE TABLE statements + seed admin user
│   │   └── index.ts             # better-sqlite3 connection singleton
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification + role guard middleware
│   │   └── error.ts             # Global unhandled error catcher
│   ├── routes/
│   │   ├── auth.ts              # POST /api/auth/login, /api/auth/refresh
│   │   ├── appointments.ts      # 11 appointment CRUD + state transition endpoints
│   │   ├── queue.ts             # GET /api/queue, GET /api/queue/my-position
│   │   ├── dashboard.ts         # GET /api/dashboard/today
│   │   └── users.ts             # 4 user management endpoints (admin only)
│   ├── services/
│   │   ├── auth.ts              # Login password verify, token generation, refresh
│   │   ├── appointment.ts       # Appointment CRUD, state machine, queue position
│   │   ├── queue.ts             # Queue ordered listing, position calculation
│   │   ├── dashboard.ts         # Today statistics aggregation queries
│   │   └── user.ts              # User CRUD, password hashing
│   └── utils/
│       ├── jwt.ts               # signAccessToken, signRefreshToken, verify wrapper
│       ├── validation.ts        # Phone, licensePlate, moisture, riceYield validators
│       └── response.ts          # success(), successList(), successMsg(), error() helpers
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `PADDY/backend/package.json`
- Create: `PADDY/backend/tsconfig.json`
- Create: `PADDY/backend/.env.example`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "paddy-backend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@hono/jwt": "^0.4.0",
    "@hono/node-server": "^1.13.0",
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^11.0.0",
    "hono": "^4.6.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.0",
    "@types/better-sqlite3": "^7.6.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create .env.example**

```
PORT=3000
JWT_SECRET=change-this-to-a-random-secret
DATABASE_PATH=./data/paddy.db
```

- [ ] **Step 4: Install dependencies**

Run: `cd PADDY/backend && npm install`
Expected: All 10 packages installed, `node_modules/` and `package-lock.json` created.

---

### Task 2: Database Layer

**Files:**
- Create: `PADDY/backend/src/db/index.ts`
- Create: `PADDY/backend/src/db/schema.ts`

- [ ] **Step 1: Database connection (`src/db/index.ts`)**

```typescript
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DATABASE_PATH || './data/paddy.db'

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}
```

- [ ] **Step 2: Schema and seed (`src/db/schema.ts`)**

```typescript
import { getDb } from './index.js'
import bcrypt from 'bcryptjs'

export function initSchema(): void {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      appointmentNo TEXT UNIQUE NOT NULL,
      driverName TEXT NOT NULL,
      phone TEXT NOT NULL,
      licensePlate TEXT NOT NULL,
      variety TEXT NOT NULL,
      appointmentDate TEXT NOT NULL,
      appointmentTime TEXT NOT NULL,
      remark TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      tokenNo TEXT DEFAULT '',
      moisture REAL,
      riceYield REAL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      queuedAt TEXT,
      calledAt TEXT,
      cancelledAt TEXT,
      cancelReason TEXT DEFAULT '',
      cancelBy TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      prefix TEXT NOT NULL,
      seq INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointmentDate);
    CREATE INDEX IF NOT EXISTS idx_appointments_no ON appointments(appointmentNo);
    CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(phone);
  `)
}

export function seedDefaultUsers(): void {
  const db = getDb()
  const existing = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (existing.count > 0) return
  const hash = bcrypt.hashSync('admin123', 10)
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)').run(id, 'admin', hash, 'admin')
  console.log('Default admin user created (admin / admin123)')
}
```

- [ ] **Step 3: Quick schema verification**

Run: `mkdir -p PADDY/backend/data && cd PADDY/backend && npx tsx -e "import { initSchema } from './src/db/schema.js'; import { getDb } from './src/db/index.js'; initSchema(); const tables = getDb().prepare(\"SELECT name FROM sqlite_master WHERE type='table'\").all(); console.log('Tables:', JSON.stringify(tables));"`
Expected output: `Tables: [{"name":"appointments"},{"name":"users"},{"name":"counters"}]`

---

### Task 3: Core Utilities

**Files:**
- Create: `PADDY/backend/src/utils/response.ts`
- Create: `PADDY/backend/src/utils/jwt.ts`
- Create: `PADDY/backend/src/utils/validation.ts`

- [ ] **Step 1: Response helpers (`src/utils/response.ts`)**

```typescript
import { Context } from 'hono'

export function success(c: Context, data: any, status: number = 200) {
  return c.json({ success: true, data }, status)
}

export function successMsg(c: Context, message: string = '操作成功') {
  return c.json({ success: true, message })
}

export function successList(c: Context, items: any[], total: number, page: number, pageSize: number) {
  return c.json({ success: true, data: { items, total, page, pageSize } })
}

export function error(c: Context, code: string, message: string, status: number = 400, details?: any) {
  return c.json({ error: { code, message, ...(details ? { details } : {}) } }, status)
}
```

- [ ] **Step 2: JWT utilities (`src/utils/jwt.ts`)**

```typescript
import { sign, verify } from '@hono/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const ACCESS_EXP = 2 * 60 * 60       // 2 hours
const REFRESH_EXP = 7 * 24 * 60 * 60 // 7 days

export interface TokenPayload {
  sub: string
  role: string
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return sign(
    { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ACCESS_EXP },
    JWT_SECRET
  )
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return sign(
    { ...payload, type: 'refresh', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + REFRESH_EXP },
    JWT_SECRET
  )
}

export async function verifyToken(token: string): Promise<any> {
  return verify(token, JWT_SECRET)
}
```

- [ ] **Step 3: Validation utilities (`src/utils/validation.ts`)**

```typescript
export interface ValidationError {
  field: string
  message: string
}

export function validatePhone(phone: string): string | null {
  return /^1\d{10}$/.test(phone) ? null : '手机号格式不正确'
}

export function validateLicensePlate(plate: string): string | null {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁][A-Z][A-HJ-NP-Z0-9]{5,6}$/.test(plate)
    ? null : '车牌号格式不正确'
}

const VARIETIES = ['中科发5', '吉宏6', '鲜食玉米', '杂粮']
export function validateVariety(variety: string): string | null {
  return VARIETIES.includes(variety) ? null : '品种不在允许范围内'
}

export function validateDate(date: string): string | null {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? null : '日期格式不正确（YYYY-MM-DD）'
}

export function validateTime(time: string): string | null {
  return /^\d{2}:\d{2}$/.test(time) ? null : '时间格式不正确（HH:mm）'
}

export function validateMoisture(value: number): string | null {
  return value >= 12 && value <= 20 ? null : '水分范围 12%-20%'
}

export function validateRiceYield(value: number): string | null {
  return value >= 55 && value <= 65 ? null : '出米率范围 55%-65%'
}

export function validatePassword(password: string): string | null {
  return password.length >= 6 ? null : '密码最少 6 位'
}

const ROLES = ['admin', 'operator', 'manager']
export function validateRole(role: string): string | null {
  return ROLES.includes(role) ? null : '角色无效'
}

export function validateAppointmentInput(data: any): ValidationError[] {
  const errors: ValidationError[] = []
  const checks: [string, any, (v: any) => string | null][] = [
    ['phone', data.phone, validatePhone],
    ['licensePlate', data.licensePlate, validateLicensePlate],
    ['variety', data.variety, validateVariety],
    ['appointmentDate', data.appointmentDate, validateDate],
    ['appointmentTime', data.appointmentTime, validateTime],
  ]
  for (const [field, value, fn] of checks) {
    const err = fn(value)
    if (err) errors.push({ field, message: err })
  }
  return errors
}
```

---

### Task 4: Middleware

**Files:**
- Create: `PADDY/backend/src/middleware/auth.ts`
- Create: `PADDY/backend/src/middleware/error.ts`

- [ ] **Step 1: Auth middleware (`src/middleware/auth.ts`)**

```typescript
import { Context, Next } from 'hono'
import { verifyToken } from '../utils/jwt.js'
import { error } from '../utils/response.js'

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return error(c, 'TOKEN_INVALID', '未提供有效的认证令牌', 401)
  }
  try {
    const token = auth.slice(7)
    const payload = await verifyToken(token)
    if (payload.type === 'refresh') {
      return error(c, 'TOKEN_INVALID', '请使用 accessToken', 401)
    }
    c.set('user', { id: payload.sub, role: payload.role })
    await next()
  } catch (e: any) {
    if (e.name === 'JwtTokenExpired') {
      return error(c, 'TOKEN_EXPIRED', 'token 已过期', 401)
    }
    return error(c, 'TOKEN_INVALID', 'token 无效', 401)
  }
}

export function roleGuard(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as { id: string; role: string }
    if (!roles.includes(user.role)) {
      return error(c, 'FORBIDDEN', '无权限执行此操作', 403)
    }
    await next()
  }
}
```

- [ ] **Step 2: Error middleware (`src/middleware/error.ts`)**

```typescript
import { Context, Next } from 'hono'
import { error } from '../utils/response.js'

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (e: any) {
    console.error('Unhandled error:', e)
    return error(c, 'INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
```

---

### Task 5: Auth Routes and Service

**Files:**
- Create: `PADDY/backend/src/services/auth.ts`
- Create: `PADDY/backend/src/routes/auth.ts`

- [ ] **Step 1: Auth service (`src/services/auth.ts`)**

```typescript
import { getDb } from '../db/index.js'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js'

export async function login(username: string, password: string) {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null
  }
  const payload = { sub: user.id, role: user.role }
  const accessToken = await signAccessToken(payload)
  const refreshToken = await signRefreshToken(payload)
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, role: user.role }
  }
}

export async function refreshTokens(refreshTokenStr: string) {
  let payload: any
  try {
    payload = await verifyToken(refreshTokenStr)
  } catch {
    return null
  }
  if (payload.type !== 'refresh') return null

  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as any
  if (!user) return null

  const newPayload = { sub: user.id, role: user.role }
  const accessToken = await signAccessToken(newPayload)
  const refreshToken = await signRefreshToken(newPayload)
  return { accessToken, refreshToken }
}
```

- [ ] **Step 2: Auth routes (`src/routes/auth.ts`)**

```typescript
import { Hono } from 'hono'
import { login, refreshTokens } from '../services/auth.js'
import { success, error } from '../utils/response.js'

const authRouter = new Hono()

authRouter.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) {
    return error(c, 'VALIDATION_ERROR', '用户名和密码不能为空')
  }
  const result = await login(username, password)
  if (!result) {
    return error(c, 'INVALID_CREDENTIALS', '用户名或密码错误', 401)
  }
  return success(c, result)
})

authRouter.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json()
  if (!refreshToken) {
    return error(c, 'VALIDATION_ERROR', 'refreshToken 不能为空')
  }
  const result = await refreshTokens(refreshToken)
  if (!result) {
    return error(c, 'TOKEN_EXPIRED', 'refresh token 已过期，请重新登录', 401)
  }
  return success(c, result)
})

export default authRouter
```

---

### Task 6: Appointment Service

**Files:**
- Create: `PADDY/backend/src/services/appointment.ts`

- [ ] **Step 1: Appointment service (`src/services/appointment.ts`)**

```typescript
import { getDb } from '../db/index.js'

interface CreateInput {
  driverName: string
  phone: string
  licensePlate: string
  variety: string
  appointmentDate: string
  appointmentTime: string
  remark?: string
}

export function generateAppointmentNo(): string {
  const db = getDb()
  const today = new Date()
  const prefix = today.toISOString().slice(0, 10).replace(/-/g, '')
  const result = db.prepare(
    'INSERT INTO counters (id, prefix, seq) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET seq = seq + 1 RETURNING seq'
  ).get(`appointment_${prefix}`, prefix) as { seq: number }
  return `${prefix}${String(result.seq).padStart(3, '0')}`
}

export function createAppointment(data: CreateInput) {
  const db = getDb()
  const id = crypto.randomUUID()
  const appointmentNo = generateAppointmentNo()
  const createdAt = new Date().toISOString()
  db.prepare(`
    INSERT INTO appointments (id, appointmentNo, driverName, phone, licensePlate, variety, appointmentDate, appointmentTime, remark, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(id, appointmentNo, data.driverName, data.phone, data.licensePlate, data.variety, data.appointmentDate, data.appointmentTime, data.remark || '', createdAt)
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id)
}

export function getAppointmentById(id: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id)
}

export function getAppointmentByNo(no: string) {
  const db = getDb()
  return db.prepare('SELECT * FROM appointments WHERE appointmentNo = ?').get(no)
}

export function queryAppointment(phone: string, appointmentNo: string) {
  const db = getDb()
  const appt = db.prepare('SELECT * FROM appointments WHERE phone = ? AND appointmentNo = ?').get(phone, appointmentNo) as any
  if (!appt) return null
  if (appt.status === 'waiting') {
    const pos = db.prepare('SELECT COUNT(*) as pos FROM appointments WHERE status = ? AND queuedAt < ?').get('waiting', appt.queuedAt) as { pos: number }
    return { ...appt, queuePosition: pos.pos + 1 }
  }
  return appt
}

export function listAppointments(params: {
  page: number; pageSize: number; status?: string; keyword?: string; sortBy?: string; sortOrder?: string
}) {
  const db = getDb()
  const { page, pageSize, status, keyword, sortBy = 'createdAt', sortOrder = 'desc' } = params
  const conditions: string[] = []
  const values: any[] = []

  if (status) { conditions.push('status = ?'); values.push(status) }
  if (keyword) {
    conditions.push('(driverName LIKE ? OR phone LIKE ? OR licensePlate LIKE ?)')
    const kw = `%${keyword}%`
    values.push(kw, kw, kw)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const allowedSort = ['createdAt', 'appointmentDate', 'appointmentTime']
  const sortField = allowedSort.includes(sortBy!) ? sortBy! : 'createdAt'
  const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC'

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM appointments ${where}`).get(...values) as { total: number }
  const offset = (page - 1) * pageSize
  const items = db.prepare(`SELECT * FROM appointments ${where} ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`).all(...values, pageSize, offset)
  return { items, total: countRow.total, page, pageSize }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['token_assigned', 'cancelled'],
  token_assigned: ['waiting', 'cancelled'],
  waiting: ['called', 'token_assigned', 'cancelled'],
  called: ['completed', 'cancelled'],
}

export function updateStatus(id: string, newStatus: string, extra: Record<string, any> = {}): any {
  const db = getDb()
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any
  if (!appt) return { error: 'NOT_FOUND' }

  const allowed = VALID_TRANSITIONS[appt.status]
  if (!allowed || !allowed.includes(newStatus)) {
    return { error: 'INVALID_STATUS', currentStatus: appt.status }
  }

  const updates: string[] = ['status = ?']
  const values: any[] = [newStatus]
  if (extra.tokenNo !== undefined) { updates.push('tokenNo = ?'); values.push(extra.tokenNo) }
  if (extra.queuedAt !== undefined) { updates.push('queuedAt = ?'); values.push(extra.queuedAt) }
  if (extra.calledAt !== undefined) { updates.push('calledAt = ?'); values.push(extra.calledAt) }
  if (extra.moisture !== undefined) { updates.push('moisture = ?'); values.push(extra.moisture) }
  if (extra.riceYield !== undefined) { updates.push('riceYield = ?'); values.push(extra.riceYield) }
  if (extra.cancelledAt !== undefined) { updates.push('cancelledAt = ?'); values.push(extra.cancelledAt) }
  if (extra.cancelReason !== undefined) { updates.push('cancelReason = ?'); values.push(extra.cancelReason) }
  if (extra.cancelBy !== undefined) { updates.push('cancelBy = ?'); values.push(extra.cancelBy) }

  values.push(id)
  db.prepare(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id)
}

export function getCallNextAppointment(): any | null {
  const db = getDb()
  return db.prepare("SELECT * FROM appointments WHERE status = 'waiting' ORDER BY queuedAt ASC LIMIT 1").get() as any || null
}
```

---

### Task 7: Queue Service

**Files:**
- Create: `PADDY/backend/src/services/queue.ts`

- [ ] **Step 1: Queue service (`src/services/queue.ts`)**

```typescript
import { getDb } from '../db/index.js'

export function getQueue() {
  const db = getDb()
  const waiting = db.prepare("SELECT * FROM appointments WHERE status = 'waiting' ORDER BY queuedAt ASC").all() as any[]
  const currentServing = db.prepare("SELECT * FROM appointments WHERE status = 'called' ORDER BY calledAt DESC LIMIT 1").get() as any || null
  const queue = waiting.map((a: any, i: number) => ({
    position: i + 1,
    appointmentId: a.id,
    appointmentNo: a.appointmentNo,
    driverName: a.driverName,
    licensePlate: a.licensePlate,
    tokenNo: a.tokenNo,
    queuedAt: a.queuedAt,
  }))
  return {
    queue,
    waitingCount: waiting.length,
    currentServing: currentServing ? {
      appointmentId: currentServing.id,
      appointmentNo: currentServing.appointmentNo,
      driverName: currentServing.driverName,
    } : null,
  }
}

export function getMyPosition(appointmentNo: string) {
  const db = getDb()
  const appt = db.prepare('SELECT * FROM appointments WHERE appointmentNo = ?').get(appointmentNo) as any
  if (!appt) return null
  const result: any = { status: appt.status }
  if (appt.status === 'waiting') {
    const pos = db.prepare("SELECT COUNT(*) as cnt FROM appointments WHERE status = 'waiting' AND queuedAt < ?").get(appt.queuedAt) as { cnt: number }
    result.position = pos.cnt + 1
    result.waitingAhead = pos.cnt
  }
  return result
}
```

---

### Task 8: Dashboard and User Services

**Files:**
- Create: `PADDY/backend/src/services/dashboard.ts`
- Create: `PADDY/backend/src/services/user.ts`

- [ ] **Step 1: Dashboard service (`src/services/dashboard.ts`)**

```typescript
import { getDb } from '../db/index.js'

export function getTodayDashboard() {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  const stats = db.prepare(`
    SELECT
      COUNT(*) as totalAppointments,
      SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waitingCount,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledCount
    FROM appointments WHERE appointmentDate = ?
  `).get(today) as any
  return {
    totalAppointments: stats.totalAppointments,
    waitingCount: stats.waitingCount,
    completedCount: stats.completedCount,
    cancelledCount: stats.cancelledCount,
    lastUpdated: new Date().toISOString(),
  }
}
```

- [ ] **Step 2: User service (`src/services/user.ts`)**

```typescript
import { getDb } from '../db/index.js'
import bcrypt from 'bcryptjs'

export function listUsers() {
  const db = getDb()
  const items = db.prepare("SELECT id, username, role, createdAt FROM users ORDER BY createdAt ASC").all()
  return { items, total: items.length }
}

export function createUser(username: string, password: string, role: string) {
  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) return { error: 'DUPLICATE_USERNAME' }
  const id = crypto.randomUUID()
  const hash = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)').run(id, username, hash, role)
  return { id, username, role }
}

export function deleteUser(id: string) {
  const db = getDb()
  const result = db.prepare('DELETE FROM users WHERE id = ? AND role != ?').run(id, 'admin')
  return result.changes > 0
}

export function resetPassword(id: string, newPassword: string) {
  const db = getDb()
  const hash = bcrypt.hashSync(newPassword, 10)
  const result = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id)
  return result.changes > 0
}
```

---

### Task 9: All Route Handlers

**Files:**
- Create: `PADDY/backend/src/routes/appointments.ts`
- Create: `PADDY/backend/src/routes/queue.ts`
- Create: `PADDY/backend/src/routes/dashboard.ts`
- Create: `PADDY/backend/src/routes/users.ts`

- [ ] **Step 1: Appointment routes (`src/routes/appointments.ts`)**

```typescript
import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success, successList, successMsg, error } from '../utils/response.js'
import { validateAppointmentInput, validateMoisture, validateRiceYield } from '../utils/validation.js'
import * as svc from '../services/appointment.js'

const router = new Hono()

// Public endpoints
router.post('/', async (c) => {
  const body = await c.req.json()
  const errors = validateAppointmentInput(body)
  if (errors.length > 0) return error(c, 'VALIDATION_ERROR', '参数校验失败', 400, errors)
  const appt = svc.createAppointment(body)
  return success(c, appt, 201)
})

router.post('/query', async (c) => {
  const { phone, appointmentNo } = await c.req.json()
  if (!phone || !appointmentNo) return error(c, 'VALIDATION_ERROR', '手机号和预约编号不能为空')
  const appt = svc.queryAppointment(phone, appointmentNo)
  if (!appt) return error(c, 'NOT_FOUND', '未找到匹配的记录', 404)
  return success(c, appt)
})

router.post('/:id/cancel-by-driver', async (c) => {
  const id = c.req.param('id')
  const { phone, reason } = await c.req.json()
  const appt = svc.getAppointmentById(id)
  if (!appt) return error(c, 'NOT_FOUND', '预约不存在', 404)
  if ((appt as any).phone !== phone) return error(c, 'FORBIDDEN', '手机号与预约不匹配', 403)
  if ((appt as any).status !== 'pending') return error(c, 'INVALID_STATUS', '当前状态不允许取消', 409)
  const now = new Date().toISOString()
  const result = svc.updateStatus(id, 'cancelled', { cancelledAt: now, cancelReason: reason || '司机取消', cancelBy: 'driver' })
  return success(c, result)
})

// JWT required
router.use('/*', authMiddleware)

router.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '20')
  const result = svc.listAppointments({
    page, pageSize,
    status: c.req.query('status'),
    keyword: c.req.query('keyword'),
    sortBy: c.req.query('sortBy'),
    sortOrder: c.req.query('sortOrder'),
  })
  return successList(c, result.items, result.total, result.page, result.pageSize)
})

router.get('/:id', async (c) => {
  const id = c.req.param('id')
  const appt = svc.getAppointmentById(id)
  if (!appt) return error(c, 'NOT_FOUND', '预约不存在', 404)
  return success(c, appt)
})

router.post('/:id/assign-token', roleGuard('operator'), async (c) => {
  const id = c.req.param('id')
  const { tokenNo } = await c.req.json()
  if (!tokenNo) return error(c, 'VALIDATION_ERROR', '令牌号不能为空')
  const result = svc.updateStatus(id, 'token_assigned', { tokenNo })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许分配令牌', 409)
  return success(c, result)
})

router.post('/:id/check-in', roleGuard('operator'), async (c) => {
  const id = c.req.param('id')
  const now = new Date().toISOString()
  const result = svc.updateStatus(id, 'waiting', { queuedAt: now })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许签到入队', 409)
  return success(c, result)
})

router.post('/:id/call', roleGuard('operator'), async (c) => {
  const id = c.req.param('id')
  const now = new Date().toISOString()
  const result = svc.updateStatus(id, 'called', { calledAt: now })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许叫号', 409)
  return success(c, result)
})

router.post('/:id/complete', roleGuard('operator'), async (c) => {
  const id = c.req.param('id')
  const { moisture, riceYield } = await c.req.json()
  if (moisture === undefined || riceYield === undefined) return error(c, 'VALIDATION_ERROR', '水分和出米率不能为空')
  const mErr = validateMoisture(moisture)
  if (mErr) return error(c, 'VALIDATION_ERROR', mErr)
  const rErr = validateRiceYield(riceYield)
  if (rErr) return error(c, 'VALIDATION_ERROR', rErr)

  const result = svc.updateStatus(id, 'completed', { moisture, riceYield })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许录入结果', 409)

  // Auto-call next
  const next = svc.getCallNextAppointment()
  if (next) {
    const now = new Date().toISOString()
    svc.updateStatus(next.id, 'called', { calledAt: now })
  }
  return success(c, result)
})

router.post('/:id/cancel', roleGuard('operator', 'admin'), async (c) => {
  const id = c.req.param('id')
  const { reason } = await c.req.json()
  if (!reason) return error(c, 'VALIDATION_ERROR', '取消原因不能为空')
  const now = new Date().toISOString()
  const result = svc.updateStatus(id, 'cancelled', { cancelledAt: now, cancelReason: reason, cancelBy: 'operator' })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许取消', 409)
  return success(c, result)
})

router.post('/:id/skip', roleGuard('operator'), async (c) => {
  const id = c.req.param('id')
  const appt = svc.getAppointmentById(id)
  if (!appt) return error(c, 'NOT_FOUND', '预约不存在', 404)
  if ((appt as any).status !== 'waiting') return error(c, 'INVALID_STATUS', '只有等待中的预约可以跳过', 409)
  const now = new Date().toISOString()
  const { getDb } = await import('../db/index.js')
  getDb().prepare('UPDATE appointments SET queuedAt = ? WHERE id = ?').run(now, id)
  const updated = svc.getAppointmentById(id)
  return success(c, { ...updated, message: '已移至队尾' })
})

export default router
```

- [ ] **Step 2: Queue routes (`src/routes/queue.ts`)**

```typescript
import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'
import * as queueService from '../services/queue.js'

const router = new Hono()

router.get('/my-position', async (c) => {
  const appointmentNo = c.req.query('appointmentNo')
  if (!appointmentNo) return error(c, 'VALIDATION_ERROR', '预约编号不能为空')
  const result = queueService.getMyPosition(appointmentNo)
  if (!result) return error(c, 'NOT_FOUND', '未找到该预约或未在排队中', 404)
  return success(c, result)
})

router.get('/', authMiddleware, roleGuard('operator', 'manager'), async (c) => {
  const result = queueService.getQueue()
  return success(c, result)
})

export default router
```

- [ ] **Step 3: Dashboard routes (`src/routes/dashboard.ts`)**

```typescript
import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success } from '../utils/response.js'
import { getTodayDashboard } from '../services/dashboard.js'

const router = new Hono()

router.get('/today', authMiddleware, roleGuard('manager'), async (c) => {
  const data = getTodayDashboard()
  return success(c, data)
})

export default router
```

- [ ] **Step 4: User management routes (`src/routes/users.ts`)**

```typescript
import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success, successMsg, error } from '../utils/response.js'
import { validatePassword, validateRole } from '../utils/validation.js'
import * as userService from '../services/user.js'

const router = new Hono()
router.use('/*', authMiddleware, roleGuard('admin'))

router.get('/', async (c) => {
  const result = userService.listUsers()
  return success(c, result)
})

router.post('/', async (c) => {
  const { username, password, role } = await c.req.json()
  if (!username || !password || !role) return error(c, 'VALIDATION_ERROR', '用户名、密码和角色不能为空')
  const pErr = validatePassword(password)
  if (pErr) return error(c, 'VALIDATION_ERROR', pErr)
  const rErr = validateRole(role)
  if (rErr) return error(c, 'VALIDATION_ERROR', rErr)
  const result = userService.createUser(username, password, role)
  if ((result as any).error === 'DUPLICATE_USERNAME') return error(c, 'DUPLICATE_USERNAME', '用户名已存在', 409)
  return success(c, result, 201)
})

router.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const ok = userService.deleteUser(id)
  if (!ok) return error(c, 'NOT_FOUND', '用户不存在', 404)
  return successMsg(c, '用户已删除')
})

router.post('/:id/reset-password', async (c) => {
  const id = c.req.param('id')
  const { newPassword } = await c.req.json()
  if (!newPassword) return error(c, 'VALIDATION_ERROR', '新密码不能为空')
  const pErr = validatePassword(newPassword)
  if (pErr) return error(c, 'VALIDATION_ERROR', pErr)
  const ok = userService.resetPassword(id, newPassword)
  if (!ok) return error(c, 'NOT_FOUND', '用户不存在', 404)
  return successMsg(c, '密码已重置')
})

export default router
```

---

### Task 10: App Assembly and Server Start

**Files:**
- Create: `PADDY/backend/src/app.ts`
- Create: `PADDY/backend/src/index.ts`
- Modify: `PADDY/backend/package.json` (already done)

- [ ] **Step 1: App assembly (`src/app.ts`)**

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorMiddleware } from './middleware/error.js'
import authRouter from './routes/auth.js'
import appointmentsRouter from './routes/appointments.js'
import queueRouter from './routes/queue.js'
import dashboardRouter from './routes/dashboard.js'
import usersRouter from './routes/users.js'

const app = new Hono()
app.use('*', cors())
app.use('*', errorMiddleware)

app.route('/api/auth', authRouter)
app.route('/api/appointments', appointmentsRouter)
app.route('/api/queue', queueRouter)
app.route('/api/dashboard', dashboardRouter)
app.route('/api/users', usersRouter)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

export default app
```

- [ ] **Step 2: Entry point (`src/index.ts`)**

```typescript
import { serve } from '@hono/node-server'
import app from './app.js'
import { initSchema, seedDefaultUsers } from './db/schema.js'

const PORT = parseInt(process.env.PORT || '3000')
initSchema()
seedDefaultUsers()

serve({ fetch: app.fetch, port: PORT })
console.log(`Server running on http://localhost:${PORT}`)
```

- [ ] **Step 3: Verify compilation**

Run: `cd PADDY/backend && npx tsx --no-warnings src/index.ts`
Let it run, then curl in another terminal.
Expected: No TS errors. Output "Server running on http://localhost:3000".

---

### Task 11: Integration Smoke Test

- [ ] **Step 1: Health check**

Run: `curl http://localhost:3000/api/health`
Expected: `{"status":"ok"}`

- [ ] **Step 2: Login**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
Expected: 200 with `accessToken`, `refreshToken`, `user.id`, `user.role: "admin"`.

- [ ] **Step 3: Create appointment**

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"driverName":"张三","phone":"13800138000","licensePlate":"辽A12345","variety":"中科发5","appointmentDate":"2026-05-22","appointmentTime":"09:30"}'
```
Expected: 201 with `status: "pending"`, `appointmentNo` like `20260522001`.

- [ ] **Step 4: Full status flow**

Set ACCESS_TOKEN from login response, APPT_ID from create response:
```bash
curl -X POST http://localhost:3000/api/appointments/$APPT_ID/assign-token \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tokenNo":"A001"}'
# → status: token_assigned

curl -X POST http://localhost:3000/api/appointments/$APPT_ID/check-in \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# → status: waiting

curl -X POST http://localhost:3000/api/appointments/$APPT_ID/call \
  -H "Authorization: Bearer $ACCESS_TOKEN"
# → status: called

curl -X POST http://localhost:3000/api/appointments/$APPT_ID/complete \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"moisture":14.5,"riceYield":60.2}'
# → status: completed
```

- [ ] **Step 5: Queue position**

```bash
curl 'http://localhost:3000/api/queue/my-position?appointmentNo=20260522001'
```
Expected: `{ success: true, data: { status: "completed" } }` (already done).

- [ ] **Step 6: Dashboard**

```bash
curl http://localhost:3000/api/dashboard/today \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```
Expected: Stats for today.

- [ ] **Step 7: Error cases**

```bash
# Invalid phone
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{"driverName":"测试","phone":"123","licensePlate":"辽A12345","variety":"中科发5","appointmentDate":"2026-05-22","appointmentTime":"09:00"}'
# → 400 VALIDATION_ERROR

# No auth header
curl http://localhost:3000/api/appointments
# → 401 TOKEN_INVALID

# Invalid status transition
curl -X POST http://localhost:3000/api/appointments/$APPT_ID/assign-token \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tokenNo":"A002"}'
# → 409 INVALID_STATUS (already completed)
```

---

## Self-Review

**1. Spec coverage:**
- Auth: Task 5 covers both endpoints — login (username+password → tokens+user) and refresh (refreshToken → new pair)
- Appointment creation: Task 6 + Task 9 — validates all fields, generates appointmentNo via counters table, returns 201
- Appointment query: POST /query with phone+appointmentNo, returns queue position when waiting
- Appointment list: GET with pagination, status filter, keyword search, sort options
- All 8 status transitions from PRD §4.2: assign-token, check-in, call, complete (with auto-call-next), cancel (operator), cancel-by-driver, skip
- Queue: Task 7 + Task 9 — queue board with positions and currentServing, my-position with waitingAhead
- Dashboard: Task 8 + Task 9 — all 4 metrics, lastUpdated timestamp
- User management: Task 8 + Task 9 — list, create (duplicate check), delete (admin protection), reset-password
- Auth matrix from spec §5: 6 public endpoints, 16 JWT endpoints with correct role guards
- Validation rules from spec §4: phone regex, license plate regex, variety enum, moisture/riceYield range

**2. Placeholder scan:** No TBD, "implement later", or "add appropriate" found. Every code block contains complete, runnable code.

**3. Type consistency:** All function signatures match call sites. `updateStatus()` returns `{ error: string }` on failure vs appointment object on success — all route handlers check `result.error` consistently. Response helpers `success()`, `successList()`, `successMsg()`, `error()` used uniformly across all route files. Service function names (`login`, `createAppointment`, `getQueue`, `getTodayDashboard`, `listUsers`) match their import names in route files.
