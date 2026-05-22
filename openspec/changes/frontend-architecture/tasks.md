## 1. Theme System

- [ ] 1.1 Create tokens.css with all design tokens (colors, spacing, border radius)
- [ ] 1.2 Configure tailwind.config.js to map CSS variables to semantic classes
- [ ] 1.3 Create theme-mobile.css and theme-admin.css for role-based theming

## 2. Mock Layer

- [ ] 2.1 Create shared TypeScript types (api/types.ts) for all API request/response schemas
- [ ] 2.2 Create mock data set (api/mock/data.ts) covering all appointment statuses
- [ ] 2.3 Implement mock modules: auth, appointment, queue, dashboard, user
- [ ] 2.4 Implement real modules: auth, appointment, queue, dashboard, user
- [ ] 2.5 Create api/index.ts with environment variable switch (VITE_USE_MOCK)

## 3. Responsive Layout

- [ ] 3.1 Implement MobileLayout.vue with bottom tab navigation
- [ ] 3.2 Implement DesktopLayout.vue with sidebar navigation
- [ ] 3.3 Add login page layout
- [ ] 3.4 Configure route tree: /driver/* → MobileLayout, /admin/* → DesktopLayout
- [ ] 3.5 Implement route guard for admin authentication

## 4. Verification

- [ ] 4.1 Verify mock data returns correct responses for all endpoints
- [ ] 4.2 Verify VITE_USE_MOCK=false correctly switches to real API calls
- [ ] 4.3 Verify MobileLayout renders correctly at 375px viewport
- [ ] 4.4 Verify DesktopLayout renders correctly at 1440px viewport
- [ ] 4.5 Verify route guard redirects unauthenticated users to /login
