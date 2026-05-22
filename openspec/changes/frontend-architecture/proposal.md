## Why

Paddy 项目前端（uniapp + Vue 3 + Tailwind CSS）需要一套完整的前端架构来支撑司机端（手机H5）和管理端（PC）的双端需求，包括数据模拟、双端布局和主题系统。

## What Changes

- **Mock 层**：环境变量开关（VITE_USE_MOCK）控制前端在开发时使用模拟数据，上线时无缝切换真实 API
- **响应式布局**：MobileLayout（司机端）和 DesktopLayout（管理端）通过路由分组分离
- **主题系统**：CSS 变量定义设计 token，通过 tailwind.config.js 映射为 Tailwind 语义化 class

## Capabilities

### New Capabilities
- `mock-layer`: 前端 API 调用层，支持开发环境 Mock 数据，生产环境切换为真实 HTTP 请求
- `responsive-layout`: 双端布局系统，司机端 MobileLayout，管理端 DesktopLayout，通过路由守卫自动切换
- `theme-system`: CSS 变量主题 + Tailwind 语义化 class 映射

### Modified Capabilities

无。

## Impact

- PADDY 项目 src/api/ 目录新增 Mock/Real 适配层
- PADDY 项目 src/layouts/ 和 src/pages/driver/ + src/pages/admin/ 目录结构
- PADDY 项目 src/styles/tokens.css + tailwind.config.js 主题配置
