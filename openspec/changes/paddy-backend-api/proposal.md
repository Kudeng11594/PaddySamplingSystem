## Why

好雨粮库每日约 100 车原粮进厂扦样作业，目前 PRD 已完成所有功能定义（M1-M6），但缺少后端 API 实现。需要基于 PRD 设计并实现完整的 RESTful API，为 uniapp 前端提供数据接口。

## What Changes

- 设计并实现 22 个 RESTful API 端点，覆盖认证、预约管理、排队叫号、扦样录入、数据看板、用户管理六大模块
- 集成 JWT 认证（accessToken/refreshToken）
- SQLite 数据库建表与数据访问
- 请求参数校验和业务规则验证
- 统一的错误处理中间件

## Capabilities

### New Capabilities
- `auth`: 用户登录、JWT token 签发与刷新
- `appointment`: 预约 CRUD、状态流转（分配令牌/签到/叫号/录入/取消/跳过）
- `queue`: 排队叫号看板与司机位置查询
- `dashboard`: 今日作业统计数据
- `user-management`: 管理员对操作员/粮库管理者账号的增删改

### Modified Capabilities

无。项目首次构建，尚无现有 specs。

## Impact

- 新增后端项目：Hono + SQLite 服务端
- 涉及 PADDY/backend 目录
- PRD 中 section 6 的 API 清单将由待补充变为具体端点定义
