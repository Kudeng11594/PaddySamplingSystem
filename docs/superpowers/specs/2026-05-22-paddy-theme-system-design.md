# Paddy 主题系统设计文档

> Project: 好雨粮库原粮进厂扦样系统
> Date: 2026-05-22
> Based on: PRD §8 技术栈 — 样式: CSS 变量主题 + Tailwind CSS

---

## 1. 背景

PRD 技术栈中同时列出了 "Tailwind CSS" 和 "CSS 变量主题"，两者不冲突。CSS 变量是设计 token 的载体，Tailwind 是消费 token 的 utility 框架。通过 `tailwind.config.js` 的 `extend` 将 CSS 变量映射为 Tailwind 语义化 class。

## 2. 方案

### tokens.css — 设计 token 定义

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
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

### tailwind.config.js — 变量映射

```js
export default {
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
    spacing: { xs: 'var(--space-xs)', sm: 'var(--space-sm)', md: 'var(--space-md)', lg: 'var(--space-lg)' },
    borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)' },
  },
}
```

### 模板中使用

```vue
<button class="bg-primary text-white px-md py-sm rounded-md">提交</button>
```

## 3. 多端主题

司机端（mobile）和管理端（PC）可加载不同的 CSS 变量值，实现差异化视觉：

```
src/styles/
├── tokens.css          # 共享 token（间距、圆角）
├── theme-mobile.css    # 司机端色板
└── theme-admin.css     # 管理端色板
```
