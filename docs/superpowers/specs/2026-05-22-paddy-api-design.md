# Paddy API 设计文档

> Project: 好雨粮库原粮进厂扦样系统
> Date: 2026-05-22
> Based on: PRD at docs/PRD.md

---

## 1. API 设计原则

- **RESTful 资源路径 + 动作式端点**：CRUD 操作使用标准 REST，状态转换使用 `POST /:id/action` 形式
- **响应格式**：成功直接返回数据体；失败使用统一错误格式（方案 C）
- **认证**：JWT（accessToken 2h + refreshToken 7d）
- **基础路径**：`/api`
- **后端**：Hono + SQLite

---

## 2. 统一响应格式

### 成功响应

```json
// 单条数据
{ "success": true, "data": { ... } }

// 列表查询
{ "success": true, "data": { "items": [...], "total": 50, "page": 1, "pageSize": 20 } }

// 无数据操作（如删除）
{ "success": true, "message": "操作成功" }
```

### 错误响应

```json
{ "error": { "code": "ERROR_CODE", "message": "用户可读的错误描述", "details": {} } }
```

### HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 / 业务校验失败 |
| 401 | 未登录 / token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 状态冲突（如当前状态不允许操作） |
| 500 | 服务器内部错误 |

---

## 3. API 端点清单

### 3.1 认证 (Auth)

```
POST /api/auth/login            → 登录，返回 accessToken + refreshToken
POST /api/auth/refresh          → 刷新 accessToken
```

#### POST /api/auth/login

```
Request:
{ "username": "string", "password": "string" }

200 Response:
{
  "success": true,
  "data": {
    "accessToken": "jwt...",
    "refreshToken": "jwt...",
    "user": { "id": "...", "username": "...", "role": "admin|operator|manager" }
  }
}

401 Response:
{ "error": { "code": "INVALID_CREDENTIALS", "message": "用户名或密码错误" } }
```

#### POST /api/auth/refresh

```
Request:
{ "refreshToken": "jwt..." }

200 Response:
{ "success": true, "data": { "accessToken": "jwt...", "refreshToken": "jwt..." } }

401 Response:
{ "error": { "code": "TOKEN_EXPIRED", "message": "refresh token 已过期，请重新登录" } }
```

#### JWT Payload

```json
{ "sub": "user_id", "role": "admin|operator|manager", "iat": 1234567890, "exp": 1234567890 }
```

#### Token 时效

| Token | 时效 |
|-------|------|
| accessToken | 2 小时 |
| refreshToken | 7 天 |

---

### 3.2 预约管理 (Appointments)

```
GET    /api/appointments                        → 预约列表（管理端）
POST   /api/appointments                        → 创建预约（司机端，公开）
GET    /api/appointments/:id                    → 预约详情
POST   /api/appointments/query                  → 司机查询记录（公开）
POST   /api/appointments/:id/assign-token       → pending → token_assigned
POST   /api/appointments/:id/check-in           → token_assigned → waiting
POST   /api/appointments/:id/call               → waiting → called
POST   /api/appointments/:id/complete           → called → completed
POST   /api/appointments/:id/cancel             → 取消（操作员）
POST   /api/appointments/:id/cancel-by-driver   → 取消（司机）
POST   /api/appointments/:id/skip               → waiting → waiting(队尾)
```

#### POST /api/appointments（公开，无需登录）

```
Request:
{
  "driverName": "string",
  "phone": "string",
  "licensePlate": "string",
  "variety": "中科发5 | 吉宏6 | 鲜食玉米 | 杂粮",
  "appointmentDate": "YYYY-MM-DD",
  "appointmentTime": "HH:mm",
  "remark?": "string"
}

201 Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "appointmentNo": "20260522001",
    "status": "pending",
    ...
  }
}

400 Response:
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { "field": "phone", "message": "手机号格式不正确" } } }
```

#### POST /api/appointments/query（公开，无需登录）

```
Request:
{ "phone": "string", "appointmentNo": "20260522001" }

200 Response:
{ "success": true, "data": { ...appointment, "queuePosition?": 3 } }

404 Response:
{ "error": { "code": "NOT_FOUND", "message": "未找到匹配的记录" } }
```

#### GET /api/appointments（需 JWT）

```
Query Parameters:
  page      - 页码，默认 1
  pageSize  - 每页条数，默认 20
  status    - 筛选状态 (pending|token_assigned|waiting|called|completed|cancelled)
  keyword   - 搜索关键词（模糊匹配 driverName/phone/licensePlate）
  sortBy    - 排序字段，默认 createdAt
  sortOrder - 排序方向，默认 desc

200 Response:
{
  "success": true,
  "data": {
    "items": [ ...appointments ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

#### GET /api/appointments/:id（需 JWT）

```
200 Response:
{ "success": true, "data": { full appointment object } }

404 Response:
{ "error": { "code": "NOT_FOUND", "message": "预约不存在" } }
```

#### POST /api/appointments/:id/assign-token（需 JWT）

```
Request:
{ "tokenNo": "A001" }

200 Response:
{ "success": true, "data": { "_id": "...", "status": "token_assigned", "tokenNo": "A001", ... } }

409 Response:
{ "error": { "code": "INVALID_STATUS", "message": "当前状态不允许分配令牌" } }
```

#### POST /api/appointments/:id/check-in（需 JWT）

```
Request: (无 body)

200 Response:
{ "success": true, "data": { "_id": "...", "status": "waiting", "queuedAt": "ISO timestamp", ... } }

409 Response:
{ "error": { "code": "INVALID_STATUS", "message": "当前状态不允许签到入队" } }
```

#### POST /api/appointments/:id/call（需 JWT）

```
Request: (无 body)

200 Response:
{ "success": true, "data": { "_id": "...", "status": "called", "calledAt": "ISO timestamp", ... } }
```

#### POST /api/appointments/:id/complete（需 JWT）

```
Request:
{ "moisture": 14.5, "riceYield": 60.2 }

200 Response:
{ "success": true, "data": { "_id": "...", "status": "completed", "moisture": 14.5, "riceYield": 60.2, ... } }

400 Response:
{ "error": { "code": "VALIDATION_ERROR", "message": "水分范围 12%-20%" } }
```

#### POST /api/appointments/:id/cancel（需 JWT）

```
Request:
{ "reason": "string" }

200 Response:
{ "success": true, "data": { "_id": "...", "status": "cancelled", "cancelledAt": "...", "cancelReason": "...", "cancelBy": "operator", ... } }
```

#### POST /api/appointments/:id/cancel-by-driver（公开，手机号验证）

```
Request:
{ "phone": "13800138000", "reason?": "string" }

200 Response:
{ "success": true, "data": { "_id": "...", "status": "cancelled", "cancelBy": "driver", ... } }

403 Response:
{ "error": { "code": "FORBIDDEN", "message": "手机号与预约不匹配" } }
```

#### POST /api/appointments/:id/skip（需 JWT）

```
Request: (无 body)

200 Response:
{ "success": true, "data": { "_id": "...", "status": "waiting", "message": "已移至队尾" } }
```

---

### 3.3 排队叫号 (Queue)

```
GET /api/queue                       → 当前等待队列（管理端看板）
GET /api/queue/my-position           → 司机查自己位置
```

#### GET /api/queue（需 JWT）

```
Query Parameters:
  appointmentNo  - 可选，筛选指定预约

200 Response:
{
  "success": true,
  "data": {
    "queue": [
      {
        "position": 1,
        "appointmentId": "...",
        "appointmentNo": "...",
        "driverName": "张三",
        "licensePlate": "辽A12345",
        "tokenNo": "A001",
        "queuedAt": "ISO timestamp"
      },
      ...
    ],
    "waitingCount": 5,
    "currentServing": { "appointmentId": "...", "appointmentNo": "...", "driverName": "..." } | null
  }
}
```

#### GET /api/queue/my-position（公开）

```
Query Parameters:
  appointmentNo - 预约编号 (必填)

200 Response:
{
  "success": true,
  "data": {
    "position": 3,
    "waitingAhead": 2,
    "status": "waiting | called | completed",
    "queue": [ ... ]
  }
}

404 Response:
{ "error": { "code": "NOT_FOUND", "message": "未找到该预约或未在排队中" } }
```

---

### 3.4 数据看板 (Dashboard)

```
GET /api/dashboard/today    → 今日作业概况
```

#### GET /api/dashboard/today（需 JWT）

```
200 Response:
{
  "success": true,
  "data": {
    "totalAppointments": 35,
    "waitingCount": 3,
    "completedCount": 28,
    "cancelledCount": 4,
    "lastUpdated": "2026-05-22T10:30:00Z"
  }
}
```

---

### 3.5 用户管理 (Users)

```
GET    /api/users                      → 用户列表（admin only）
POST   /api/users                      → 创建用户（admin only）
DELETE /api/users/:id                  → 删除用户（admin only）
POST   /api/users/:id/reset-password   → 重置密码（admin only）
```

#### GET /api/users（admin only）

```
200 Response:
{
  "success": true,
  "data": {
    "items": [
      { "id": "...", "username": "operator01", "role": "operator", "createdAt": "ISO timestamp" },
      ...
    ],
    "total": 10
  }
}
```

#### POST /api/users（admin only）

```
Request:
{ "username": "operator01", "password": "string", "role": "operator | manager" }

201 Response:
{ "success": true, "data": { "id": "...", "username": "operator01", "role": "operator" } }

409 Response:
{ "error": { "code": "DUPLICATE_USERNAME", "message": "用户名已存在" } }
```

#### DELETE /api/users/:id（admin only）

```
200 Response:
{ "success": true, "message": "用户已删除" }

404 Response:
{ "error": { "code": "NOT_FOUND", "message": "用户不存在" } }
```

#### POST /api/users/:id/reset-password（admin only）

```
Request:
{ "newPassword": "string" }

200 Response:
{ "success": true, "message": "密码已重置" }
```

---

## 4. 验证规则

| 字段 | 规则 |
|------|------|
| phone | 11 位手机号格式 |
| licensePlate | 车牌号格式（支持新能源） |
| variety | 枚举值：中科发5、吉宏6、鲜食玉米、杂粮 |
| appointmentDate | YYYY-MM-DD，不可在过去 |
| appointmentTime | HH:mm |
| moisture | 12% - 20% |
| riceYield | 55% - 65% |
| password | 最少 6 位 |
| role | admin、operator、manager |

---

## 5. 认证与鉴权对照

| 端点 | 鉴权要求 | 角色 |
|------|---------|------|
| `POST /api/auth/login` | 公开 | - |
| `POST /api/auth/refresh` | 公开 | - |
| `POST /api/appointments` | 公开 | - |
| `POST /api/appointments/query` | 公开 | - |
| `POST /api/appointments/:id/cancel-by-driver` | 公开 | - |
| `GET /api/queue/my-position` | 公开 | - |
| `GET /api/appointments` | JWT | operator, manager |
| `GET /api/appointments/:id` | JWT | operator, manager |
| `POST /api/appointments/:id/assign-token` | JWT | operator |
| `POST /api/appointments/:id/check-in` | JWT | operator |
| `POST /api/appointments/:id/call` | JWT | operator |
| `POST /api/appointments/:id/complete` | JWT | operator |
| `POST /api/appointments/:id/cancel` | JWT | operator, admin |
| `POST /api/appointments/:id/skip` | JWT | operator |
| `GET /api/queue` | JWT | operator, manager |
| `GET /api/dashboard/today` | JWT | manager |
| `GET /api/users` | JWT | admin |
| `POST /api/users` | JWT | admin |
| `DELETE /api/users/:id` | JWT | admin |
| `POST /api/users/:id/reset-password` | JWT | admin |

---

## 6. 错误码清单

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| VALIDATION_ERROR | 400 | 参数校验失败 |
| INVALID_STATUS | 409 | 当前状态不允许该操作 |
| INVALID_CREDENTIALS | 401 | 用户名或密码错误 |
| TOKEN_EXPIRED | 401 | token 已过期 |
| TOKEN_INVALID | 401 | token 无效 |
| FORBIDDEN | 403 | 无权限 |
| NOT_FOUND | 404 | 资源不存在 |
| DUPLICATE_USERNAME | 409 | 用户名已存在 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 7. 端点汇总

总计 **22 个端点**，其中 **6 个公开接口**、**16 个 JWT 鉴权接口**。
