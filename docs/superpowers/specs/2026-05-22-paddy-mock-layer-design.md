# Paddy Mock 层设计文档

> Project: 好雨粮库原粮进厂扦样系统
> Date: 2026-05-22
> Based on: PRD §7 非功能需求 — Mock 层

---

## 1. 背景

前端开发需要在不依赖后端服务的情况下独立进行。需要一个 Mock 层，开发时返回模拟数据，正式上线时无缝切换到真实 API 接口。

## 2. 方案：环境变量开关 + Adapter 模式

通过 `VITE_USE_MOCK` 环境变量控制，代码中 export 统一的 `api` 对象，根据环境变量指向 mock 或 real 实现。

## 3. 目录结构

```
src/
├── api/
│   ├── index.ts              # 导出统一 api 对象
│   ├── types.ts              # 请求/响应的 TypeScript 类型定义
│   ├── real/
│   │   ├── index.ts          # 聚合所有 real 模块
│   │   ├── appointment.ts    # 预约 API (axios/fetch)
│   │   ├── auth.ts           # 认证 API
│   │   ├── queue.ts          # 排队 API
│   │   ├── dashboard.ts      # 看板 API
│   │   └── user.ts           # 用户管理 API
│   └── mock/
│       ├── index.ts          # 聚合所有 mock 模块
│       ├── appointment.ts    # 预约 Mock 实现
│       ├── auth.ts           # 认证 Mock 实现
│       ├── queue.ts          # 排队 Mock 实现
│       ├── dashboard.ts      # 看板 Mock 实现
│       ├── user.ts           # 用户管理 Mock 实现
│       └── data.ts           # 模拟数据集（预置司机/预约数据）
```

## 4. 核心实现

### api/index.ts — 统一出口

```typescript
import { VITE_USE_MOCK, VITE_API_BASE_URL } from '@/config'
import { realApi } from './real'
import { mockApi } from './mock'

const baseApi = VITE_USE_MOCK === 'true' ? mockApi : realApi

// 注入 baseURL 到 real 实现
if (VITE_USE_MOCK !== 'true' && VITE_API_BASE_URL) {
  // real 模块内部使用 VITE_API_BASE_URL 构造请求
}

export const api = baseApi
```

### api/types.ts — 共享类型

所有 API 模块共享请求和响应类型，保证 mock 和 real 返回结构一致：

```typescript
export interface Appointment {
  _id: string
  appointmentNo: string
  driverName: string
  phone: string
  licensePlate: string
  variety: string
  appointmentDate: string
  appointmentTime: string
  status: AppointmentStatus
  tokenNo?: string
  moisture?: number
  riceYield?: number
  createdAt: string
  queuedAt?: string
  calledAt?: string
}

export type AppointmentStatus =
  | 'pending' | 'token_assigned' | 'waiting'
  | 'called' | 'completed' | 'cancelled'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
```

### mock/data.ts — 模拟数据集

预置一批有代表性的模拟数据，覆盖不同状态、不同品种、不同日期的预约，包含当前排队队列的模拟状态。所有数据在内存中操作，支持增删改。

## 5. 使用方式

| 环境 | .env 配置 | 效果 |
|------|-----------|------|
| 开发 | `VITE_USE_MOCK=true` | 前端独立开发，无需后端 |
| 调试 | `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=http://localhost:3000` | 联调模式，连接本地后端 |
| 生产 | `VITE_USE_MOCK=false`, `VITE_API_BASE_URL=https://api.example.com` | 连接正式后端 |

## 6. 上线切换流程

1. **开发阶段**：`VITE_USE_MOCK=true`，mock 数据覆盖所有状态和边界
2. **联调阶段**：`VITE_USE_MOCK=false`，连接本地后端，逐模块验证
3. **预发布**：`VITE_USE_MOCK=false`，连接 staging 后端
4. **正式上线**：修改 `.env.production` 配置，构建产物仅包含 real 代码（mock 代码被 tree-shake 移除）

## 7. 风险与注意事项

- 类型定义需从 API 设计文档自动同步，避免 mock 和 real 结构不一致
- Vite tree-shaking：`VITE_USE_MOCK=true` 时 real 代码被 shake；`VITE_USE_MOCK=false` 时 mock 代码被 shake
