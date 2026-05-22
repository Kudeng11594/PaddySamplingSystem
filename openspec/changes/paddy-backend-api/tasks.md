## 1. Project Setup

- [ ] 1.1 Scaffold backend directory with package.json, tsconfig.json
- [ ] 1.2 Install dependencies: hono, better-sqlite3, @hono/jwt, other essentials
- [ ] 1.3 Create Hono app entry point with CORS middleware

## 2. Database

- [ ] 2.1 Implement database connection (better-sqlite3)
- [ ] 2.2 Define and execute SQL schema (appointments, users, counters tables)
- [ ] 2.3 Seed default admin user

## 3. Core Utilities

- [ ] 3.1 Implement JWT sign/verify utilities (accessToken + refreshToken)
- [ ] 3.2 Implement unified response helpers (success + error format)
- [ ] 3.3 Implement request validation utilities (phone, licensePlate, moisture, riceYield)
- [ ] 3.4 Implement auth middleware (JWT verification + role check)
- [ ] 3.5 Implement error handling middleware (catch + format)

## 4. Auth API

- [ ] 4.1 Implement POST /api/auth/login (username + password → tokens)
- [ ] 4.2 Implement POST /api/auth/refresh (refresh token → new tokens)

## 5. Appointment API

- [ ] 5.1 Implement POST /api/appointments (create appointment, generate appointmentNo)
- [ ] 5.2 Implement POST /api/appointments/query (driver query by phone + appointmentNo)
- [ ] 5.3 Implement GET /api/appointments (list with pagination, filtering, keyword search)
- [ ] 5.4 Implement GET /api/appointments/:id (detail view)
- [ ] 5.5 Implement POST /api/appointments/:id/assign-token (pending → token_assigned)
- [ ] 5.6 Implement POST /api/appointments/:id/check-in (token_assigned → waiting, enqueue)
- [ ] 5.7 Implement POST /api/appointments/:id/call (waiting → called)
- [ ] 5.8 Implement POST /api/appointments/:id/complete (called → completed, validate moisture/riceYield)
- [ ] 5.9 Implement POST /api/appointments/:id/cancel (operator cancel with reason)
- [ ] 5.10 Implement POST /api/appointments/:id/cancel-by-driver (phone verification)
- [ ] 5.11 Implement POST /api/appointments/:id/skip (waiting → queue tail)

## 6. Queue API

- [ ] 6.1 Implement GET /api/queue (operator queue board)
- [ ] 6.2 Implement GET /api/queue/my-position (driver position check)

## 7. Dashboard API

- [ ] 7.1 Implement GET /api/dashboard/today (today statistics)

## 8. User Management API

- [ ] 8.1 Implement GET /api/users (list users, admin only)
- [ ] 8.2 Implement POST /api/users (create user, admin only)
- [ ] 8.3 Implement DELETE /api/users/:id (delete user, admin only)
- [ ] 8.4 Implement POST /api/users/:id/reset-password (admin only)

## 9. Verification

- [ ] 9.1 Run and fix build issues
- [ ] 9.2 Manual test all 22 endpoints with curl/httpie
