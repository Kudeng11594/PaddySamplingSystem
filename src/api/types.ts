// ---- Enums ----
export type AppointmentStatus = 'pending' | 'token_assigned' | 'waiting' | 'called' | 'completed' | 'cancelled'
export type UserRole = 'admin' | 'operator' | 'manager'
export type CancelBy = 'driver' | 'operator'
export type Variety = '中科发5' | '吉宏6' | '鲜食玉米' | '杂粮'

// ---- API Envelope ----
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: { code: string; message: string; details?: unknown }
}

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ---- Appointment ----
export interface Appointment {
  _id: string
  appointmentNo: string
  driverName: string
  phone: string
  licensePlate: string
  variety: Variety
  appointmentDate: string
  appointmentTime: string
  remark: string
  status: AppointmentStatus
  tokenNo: string
  moisture?: number
  riceYield?: number
  createdAt: string
  queuedAt?: string
  calledAt?: string
  cancelledAt?: string
  cancelReason?: string
  cancelBy?: CancelBy
}

export interface CreateAppointmentRequest {
  driverName: string; phone: string; licensePlate: string; variety: Variety
  appointmentDate: string; appointmentTime: string; remark?: string
}

export interface QueryAppointmentRequest {
  phone: string; appointmentNo: string
}

export interface ListAppointmentsParams {
  page?: number; pageSize?: number; status?: AppointmentStatus
  keyword?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'
}

export interface AssignTokenRequest { tokenNo: string }
export interface CompleteSamplingRequest { moisture: number; riceYield: number }
export interface CancelRequest { reason: string }
export interface CancelByDriverRequest { phone: string; reason?: string }

// ---- Queue ----
export interface QueueItem {
  position: number; appointmentId: string; appointmentNo: string
  driverName: string; licensePlate: string; tokenNo: string; queuedAt: string
}

export interface QueueBoard {
  queue: QueueItem[]; waitingCount: number
  currentServing: { appointmentId: string; appointmentNo: string; driverName: string } | null
}

export interface MyPosition {
  position?: number; waitingAhead?: number; status: AppointmentStatus
}

// ---- Dashboard ----
export interface DashboardData {
  totalAppointments: number; waitingCount: number
  completedCount: number; cancelledCount: number; lastUpdated: string
}

// ---- Auth ----
export interface LoginRequest { username: string; password: string }
export interface LoginResponse {
  accessToken: string; refreshToken: string
  user: { id: string; username: string; role: UserRole }
}
export interface RefreshRequest { refreshToken: string }
export interface RefreshResponse { accessToken: string; refreshToken: string }

// ---- User Management ----
export interface User { id: string; username: string; role: UserRole; createdAt: string }
export interface CreateUserRequest { username: string; password: string; role: UserRole }
export interface ResetPasswordRequest { newPassword: string }

// === UI Display Types ===

export interface VarietyDistribution {
  variety: string
  percentage: number
  color: string
}

export interface TrendDataPoint {
  date: string
  count: number
  isToday?: boolean
}

export interface OperationLog {
  datetime: string
  licensePlate: string
  activity: string
  operator: string
}

export interface DashboardDetail {
  todayAppointments: number
  completedCount: number
  queueingCount: number
  cancelledCount: number
  cancelRate: string
  dailyTrend: TrendDataPoint[]
  varietyDistribution: VarietyDistribution[]
  operationLogs: OperationLog[]
  avgSamplingTime: number
  avgWaitTime: number
  peakHours: string
  passRate: number
  yesterdayComparison: { appointments: string; completed: string }
}

export interface QueueBoardItem {
  id: number
  tokenNumber: string
  licensePlate: string
  driverName: string
  variety: string
  waitTimeMinutes: number
  status: string
}

export interface QueueBoardDisplay {
  currentSampling: QueueBoardItem | null
  nextInLine: QueueBoardItem | null
  waitingQueue: QueueBoardItem[]
  todayStats: { totalAppointments: number; completed: number; queueing: number; cancelled: number }
  avgWaitTime: number
  peakHours: string
}
