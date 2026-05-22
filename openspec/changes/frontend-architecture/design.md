## Context

Paddy 前端需要一套统一的前端架构来支撑司机端（手机H5）和管理端（PC）的开发。三方面需要设计：Mock 层允许前后端并行开发、布局分离保证两端体验、主题系统统一设计语言。

## Goals / Non-Goals

**Goals:**
- Mock 层：开发环境使用模拟数据，生产环境无缝切换到真实 API
- 布局：司机端 MobileLayout（max-width: 480px），管理端 DesktopLayout（min-width: 1024px）
- 主题：CSS 变量定义 token，Tailwind config 映射为语义化 class

**Non-Goals:**
- 不涉及 Mock 数据具体内容（开发时填充）
- 不涉及页面级 UI 交互细节
- 不涉及服务端渲染

## Decisions

1. **Adapter 模式 + 环境变量**：统一 export `api` 对象，VITE_USE_MOCK 控制指向 mock 或 real 实现。类型共享保证一致性。详见 `docs/superpowers/specs/2026-05-22-paddy-mock-layer-design.md`。

2. **路由级布局分离**：driver/* 路由挂载 MobileLayout，admin/* 挂载 DesktopLayout。共享基础组件的和 API 层。详见 `docs/superpowers/specs/2026-05-22-paddy-responsive-layout-design.md`。

3. **CSS 变量 → Tailwind 映射**：tokens.css 定义变量值，tailwind.config.js 通过 extend 映射为语义化 class。两端可加载不同的主题 CSS。详见 `docs/superpowers/specs/2026-05-22-paddy-theme-system-design.md`。

## Risks / Trade-offs

- Mock 和 Real 类型不一致 → 共享 types.ts 文件，TypeScript 编译检查保证
- 布局分离带来的组件复用问题 → 基础 UI 组件（Button/Input/Modal）统一放在 src/components/ui/
- CSS 变量 → Tailwind 映射增加配置复杂度 → 但这是行业标准做法，shadcn/vue、Nuxt UI 均采用此模式
