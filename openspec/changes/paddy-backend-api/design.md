## Context

好雨粮库原粮进厂扦样系统需要一个后端 API 服务，为 uniapp H5 前端提供数据接口。PRD 已完成功能定义（M1-M6），详细 API 设计已在 `docs/superpowers/specs/2026-05-22-paddy-api-design.md` 中定义。

- 单粮库单点部署，日约 100 单，并发量低
- 司机端无需登录；管理端（约 5-10 用户）需要 JWT 鉴权
- 数据存于 SQLite，无需独立数据库服务器

## Goals / Non-Goals

**Goals:**
- 在 PADDY/backend 目录下构建 Hono + SQLite 后端服务
- 实现 22 个 RESTful API 端点（认证、预约管理、排队叫号、扦样录入、数据看板、用户管理）
- 实现 JWT 认证（accessToken/refreshToken）
- 请求参数校验与业务规则验证（状态机、字段范围）
- 统一的错误处理中间件

**Non-Goals:**
- 不考虑水平扩展（单点部署）
- 不涉及地磅称重、财务结算
- 不涉及 WebSocket（用 30s 轮询满足实时性）

## Decisions

1. **Hono 框架**：轻量、TypeScript 原生、支持中间件链、路由组织清晰，适合小型 API 服务。

2. **SQLite (better-sqlite3)**：单文件数据库，零运维，适合日 100 单的规模。better-sqlite3 是同步 API，在低并发场景下比异步 sqlite3 更简单可靠。

3. **项目结构（路由 → 中间件 → 服务 → 数据访问）**：
   ```
   backend/
   ├── src/
   │   ├── index.ts           — 入口，启动 Hono 服务
   │   ├── app.ts             — Hono app 实例、中间件注册
   │   ├── db/
   │   │   ├── schema.ts      — SQLite 建表
   │   │   └── index.ts       — 数据库连接
   │   ├── middleware/
   │   │   ├── auth.ts        — JWT 验证中间件
   │   │   └── error.ts       — 统一错误处理
   │   ├── routes/
   │   │   ├── auth.ts        — 认证路由
   │   │   ├── appointments.ts — 预约路由
   │   │   ├── queue.ts       — 排队路由
   │   │   ├── dashboard.ts   — 看板路由
   │   │   └── users.ts       — 用户管理路由
   │   ├── services/
   │   │   ├── auth.ts
   │   │   ├── appointment.ts
   │   │   ├── queue.ts
   │   │   ├── dashboard.ts
   │   │   └── user.ts
   │   └── utils/
   │       ├── jwt.ts         — JWT 签发/验证
   │       ├── validation.ts  — 参数校验工具
   │       └── response.ts    — 统一响应格式
   └── package.json
   ```

4. **预约号生成**：用 counters 表实现 YYYYMMDD + 当日序号（3 位自增）。

5. **排队队列实现**：用 waiting 状态 + queuedAt 时间戳排序，skip 操作把 queuedAt 更新为当前时间（移到队尾）。

6. **状态机验证**：每个状态转换端点校验当前 status 是否允许该操作，返回 409 INVALID_STATUS。

## Risks / Trade-offs

- **SQLite 并发写** → 日 100 单场景不构成问题。better-sqlite3 同步写入保证数据一致性。
- **排队逻辑在内存+数据库** → 无 Redis 依赖，部署简单。单节点够用。
- **JWT 无法主动撤销** → 用户仅 5-10 人，密码泄露概率低。如需撤销可在后续迭代加入黑名单表。
