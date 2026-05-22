# Paddy 响应式布局设计文档

> Project: 好雨粮库原粮进厂扦样系统
> Date: 2026-05-22
> Based on: PRD §7 非功能需求 — 兼容性

---

## 1. 背景

PRD 要求：司机端手机H5，管理端 PC。两类用户使用场景和页面布局差异大，需要一套布局策略同时满足两端。

## 2. 方案：布局分离（两个 Layout）

定义 `MobileLayout`（司机端）和 `DesktopLayout`（管理端），通过路由分组切换。同一 uniapp 项目，共享 API/Mock 层和基础组件，布局和页面分离。

## 3. 目录结构

```
src/
├── layouts/
│   ├── MobileLayout.vue    # 底部导航、单列滚动、max-width: 480px 居中
│   └── DesktopLayout.vue   # 侧边栏 + 顶栏 + 主内容区，min-width: 1024px
├── pages/
│   ├── driver/             # 司机端页面
│   │   ├── create.vue      # 创建预约
│   │   ├── query.vue       # 查询记录
│   │   └── queue.vue       # 排队状态+叫号通知
│   ├── admin/              # 管理端页面
│   │   ├── appointments.vue  # 预约列表（表格+筛选）
│   │   ├── queue-board.vue   # 排队看板
│   │   ├── sampling.vue      # 扦样录入
│   │   ├── dashboard.vue     # 数据看板
│   │   └── users.vue         # 用户管理
│   └── auth/
│       └── login.vue         # 登录页（自适应两种布局）
```

## 4. 布局定义

### MobileLayout

- 顶部：标题栏（显示页面名称 + 返回按钮）
- 中间：滚动内容区（单列卡片/表单布局）
- 底部：Tab 导航（预约/查询/排队）
- 样式：`max-width: 480px; margin: 0 auto;` 在手机正常显示，在 PC 上居中缩窄

### DesktopLayout

- 左侧：侧边栏导航（菜单树，按角色显示可访问页面）
- 顶部：用户信息 + 退出按钮
- 主内容区：数据表格/看板/表单
- 样式：`min-width: 1024px`，充分利用宽屏空间

## 5. 路由结构

```
/login                 → 登录（自适应布局）
/driver/create         → MobileLayout  → 创建预约（司机）
/driver/query          → MobileLayout  → 查询记录（司机）
/driver/queue          → MobileLayout  → 排队状态（司机）
/manager/dashboard     → MobileLayout  → 数据看板（管理者手机H5）
/admin/appointments    → DesktopLayout → 预约列表（操作员/管理者PC）
/admin/queue-board     → DesktopLayout → 排队看板（操作员PC）
/admin/sampling        → DesktopLayout → 扦样录入（操作员PC）
/admin/dashboard       → DesktopLayout → 数据看板（操作员/管理者PC）
/admin/users           → DesktopLayout → 用户管理（管理员PC）
```

## 6. 共享层

两端共享：
- `src/api/` — API/Mock 层
- `src/stores/` — Pinia 状态管理
- `src/components/ui/` — 基础 UI 组件（Button, Input, Modal, Toast）
- `src/utils/` — 工具函数

两端独立：
- 页面组件（pages/driver/ vs pages/admin/）
- 布局（layouts/）
- 页面特有的业务组件

## 7. 认证与路由守卫

```typescript
router.beforeEach((to, from, next) => {
  const token = useAuthStore().token
  if (to.path.startsWith('/admin') && !token) {
    next('/login')
  } else if (to.path.startsWith('/driver')) {
    next() // 司机端无需登录
  } else {
    next()
  }
})
```
