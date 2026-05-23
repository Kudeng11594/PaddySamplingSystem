# Paddy UI Design Specification

## 1. Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #FF6600;
  --color-bg: #fefbfb;
  --color-surface: #ffffff;
  --color-border: #eeeeee;
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-text-muted: #888888;
  --color-text-placeholder: #999999;

  /* Status badges */
  --color-status-completed-bg: #e8f5e9;
  --color-status-completed-text: #2e7d32;
  --color-status-queueing-bg: #e3f2fd;
  --color-status-queueing-text: #1565c0;
  --color-status-waiting-bg: #fff3e0;
  --color-status-waiting-text: #e65100;
  --color-status-cancelled-bg: #f5f5f5;
  --color-status-cancelled-text: #999999;

  /* Danger */
  --color-danger: #e53935;
  --color-success: #4caf50;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

## 2. Layout System

### Mobile Layout (MobileLayout)

Used for routes: `/driver/*`, `/manager/*`

- Full-width viewport, max 380px content
- Bottom tab navigation bar (3 tabs)
- Tab variations by role:
  - Driver: 预约 | 查询 | 排队
  - Manager: 看板 | 查询 | 设置
- Active tab: primary color #FF6600, inactive: #888
- Status bar area at top

Component stack: Header → Body (scrollable) → Bottom Tabs

### Desktop Layout (DesktopLayout)

Used for routes: `/admin/*`

- Left sidebar 200px, primary color background
- Sidebar items with white left border highlight on active
- Top header bar: page title (left) + user info (right)
- Main content area with flexible width
- Footer bar for pagination

Component stack: Sidebar + (TopBar + Content)

## 3. Page Specifications

### 3.1 Login (`/login`)

Layout: Centered card, responsive (mobile full-width, PC centered)

Components:
- Brand header: primary color background, system icon + "好雨粮库" + "原粮进厂扦样系统"
- Form: username input + password input + login button (#FF6600)
- Footer: service terms/privacy links

Behavior: Post-login redirect based on role (driver → /driver/create, admin → /admin/appointments, manager → /manager/dashboard)

### 3.2 Driver — Create Appointment (`/driver/create`)

Layout: MobileLayout (bottom tab: 预约 active)

Form fields:
- 驾驶员姓名 (text input)
- 手机号 (text input, 11 digits)
- 车牌号 (text input)
- 粮食品种 (tag selector: 中科发5 / 吉宏6 / 鲜食玉米 / 杂粮)
- 日期 (text input, placeholder YYYY-MM-DD)
- 时间 (text input, placeholder HH:MM)
- 备注 (textarea, optional)
- Submit button: "提交预约" (#FF6600 full-width)

Behavior: Submit → generate appointment number → redirect to detail page

### 3.3 Driver — Query Records (`/driver/query`)

Layout: MobileLayout (bottom tab: 查询 active)

Components:
- Search bar: text input + "查询" button
- Results list: card-based, each card shows:
  - Appointment number (bold)
  - Status badge (color-coded)
  - Variety, date/time
  - License plate, driver name
- Empty state: "暂无记录"

Status badge system:
| Status | Background | Text |
|--------|-----------|------|
| 已完成 | #e8f5e9 | #2e7d32 |
| 排队中 | #e3f2fd | #1565c0 |
| 扦样中 | #fff3e0 | #e65100 |
| 待取号 | #f5f5f5 | #999999 |
| 已取消 | #f5f5f5 | #999999 |

### 3.4 Driver — Queue Status (`/driver/queue`)

Layout: MobileLayout (bottom tab: 排队 active)

Components:
- Appointment info card: number, variety, time, plate, driver
- Queue position card: large number display, progress bar, estimated wait time
- Timeline: 预约成功 → 已到厂 → 排队中 → 扦样中 → 已完成
  - Completed steps: green checkmark (#4caf50)
  - Current step: orange highlight (#FF6600)
  - Future steps: grey (#eee)

Data refresh: 30s polling interval

### 3.5 Manager Dashboard (`/manager/dashboard`)

Layout: MobileLayout (bottom tab: 看板 / 查询 / 设置)

Components:
- Date selector: 今日 | 昨日 | 近7日 toggle buttons
- Metric cards (3-column grid):
  - 今日预约 (#FF6600 number)
  - 已完成 (#4caf50 number)
  - 排队中 (#e65100 number)
- Variety distribution: horizontal bar chart
- Live queue: numbered list of waiting vehicles with wait time

### 3.6 Admin — Appointments List (`/admin/appointments`)

Layout: DesktopLayout (sidebar: 预约列表 active)

Components:
- Filter bar: keyword search + status dropdown + variety dropdown + date + 查询/重置
- Data table (8 columns):
  - 预约编号 | 驾驶员 | 手机号 | 车牌号 | 品种 | 预约时间 | 状态 | 操作
- Action column: context-dependent (叫号/录入/取消)
- Pagination: page numbers + prev/next

### 3.7 Admin — Queue Board (`/admin/queue-board`)

Layout: DesktopLayout (sidebar: 排队看板 active)

Components:
- Left panel:
  - Current sampling card: large token number, plate, driver, completed/skip buttons
  - Next in line card: token number + plate + "叫号" button
  - Waiting queue table: rank, plate, driver, variety, wait time
- Right panel:
  - Today stats card: 总预约/已完成/排队中/已取消
  - Average wait time card
  - Peak hours card

### 3.8 Admin — Sampling Entry (`/admin/sampling`)

Layout: DesktopLayout (sidebar: 扦样录入 active)

Components:
- Appointment info card (read-only, light orange background)
- Data form (2-column grid):
  - 水分* (%) — required
  - 出米率* (%) — required
  - 杂质率 (%)
  - 腹白 (%)
  - 病斑 (%)
  - 异类互混 (%)
  - 检测结论* — dropdown: 扦样通过 / 扦样不通过
- 备注 textarea
- Action buttons: 取消 | 保存并完成 (right-aligned)

### 3.9 Admin — Dashboard (`/admin/dashboard`)

Layout: DesktopLayout (sidebar: 数据看板 active)

Components:
- Date range selector (start date — end date + query)
- KPI cards (4-column): 今日预约/已完成/排队中/已取消 with trend indicators
- Appointment trend chart (7-day bar chart)
- Variety distribution (color-coded list with percentages)
- Operation log: "YYYY-MM-DD HH:MM  LicensePlate Activity Operator"
- Operations overview: avg sampling time, avg wait time, peak hours, pass rate

### 3.10 Admin — User Management (`/admin/users`)

Layout: DesktopLayout (sidebar: 用户管理 active)

Access: admin role only

Components:
- Search bar + role filter + "新增用户" button
- User table (7 columns):
  - 用户名 | 显示名称 | 角色 | 创建时间 | 最后登录 | 状态 | 操作
- Role badge colors: 管理员=orange, 操作员=blue, 管理者=purple
- Status: 在线=green, 离线=grey
- Operations: 重置密码 | 禁用 (admin self not operable)

## 4. Interactive States

- Buttons: #FF6600 background, white text, border-radius 6px
- Hover: opacity 0.9
- Active: opacity 0.8
- Disabled: opacity 0.5, cursor not-allowed
- Input focus: border-color #FF6600
- Links/touch targets: minimum 44px height on mobile

## 5. Responsive Behavior

- Mobile: < 768px viewport, full-width layout
- Desktop: >= 768px viewport, sidebar layout
- Login page: adaptive — mobile full card, PC centered with max-width 400px
- Breakpoints follow Tailwind defaults (sm:640, md:768, lg:1024)

## 6. Design Decisions

- Tag selector over dropdown for variety on mobile (reduces operation steps)
- Text inputs for date/time initially, upgradeable to native pickers
- Large buttons for one-hand mobile operation
- Queue timeline shows full lifecycle transparency
- Desktop table actions are context-sensitive based on appointment status
- Operation log format uses date+time prefix for traceability
