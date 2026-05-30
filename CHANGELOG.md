# Changelog

## [0.2.0.0] - 2026-05-30

### Added

- Hono + SQLite backend with full REST API (auth, appointments, queue, dashboard, users)
- JWT authentication with access/refresh token rotation and tokenVersion leak detection
- Backend test suite: 58 tests across 4 files (validation, appointments, auth, dashboard)
- Dashboard detail endpoint with daily trends, variety distribution, peak hours, pass rate

### Fixed

- DELETE `/api/users/:id` returns HTTP 204 instead of 200
- Refresh token rotation now invalidates leaked tokens after legitimate use
- Added missing backend `/api/dashboard/detail` route for frontend compatibility
- Removed obsolete Tailwind CSS reference from PRD

## [0.1.0.0] - 2026-05-27

### Added

- Login page with 好雨粮库 branding, username/password form, role-based redirect
- Driver pages: create appointment form, record query with keyword filter, queue status with progress timeline
- Manager dashboard with KPI metrics, variety distribution bars, and live queue
- Admin pages: appointment list with multi-dimension filtering, queue board with current/next/waiting panels, sampling entry form, data dashboard with charts, user management with role filtering
- Desktop layout with 200px #FF6600 sidebar and role-based navigation
- Mobile layout with 380px max-width and role-aware bottom tab bar
- Reusable components: StatusBadge (6 statuses), TagSelector, QueueTimeline (5-step), MetricCard, KpiCard, AppointmentInfoCard, UI primitives (Button, Input, Modal, Toast)
- Mock API layer with in-memory CRUD for appointments, auth, queue, and dashboard
- Auth system with Pinia store, localStorage persistence, role-based route guarding
- Test suite: 96 tests across 13 files covering stores, mock API, components, and pages
- Design token system with #FF6600 primary color and #fefbfb background
