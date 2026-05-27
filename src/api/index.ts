import type {
  LoginRequest, LoginResponse,
  RefreshRequest, RefreshResponse,
  CreateAppointmentRequest, QueryAppointmentRequest, ListAppointmentsParams,
  AssignTokenRequest, CompleteSamplingRequest,
  CancelRequest, CancelByDriverRequest,
  Appointment, QueueBoard, MyPosition, DashboardData,
  User, CreateUserRequest, ResetPasswordRequest,
} from './types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

type ApiModule = typeof import('./mock/index')
let _api: ApiModule | null = null
const _promise = (async () => {
  _api = USE_MOCK ? await import('./mock/index') : await import('./real/index')
})()

async function ensureApi(): Promise<ApiModule> {
  if (!_api) await _promise
  return _api!
}

// ---- Auth ----
export async function login(req: LoginRequest): Promise<LoginResponse> { return (await ensureApi()).login(req) }
export async function refresh(req: RefreshRequest): Promise<RefreshResponse> { return (await ensureApi()).refresh(req) }

// ---- Appointments ----
export async function createAppointment(req: CreateAppointmentRequest): Promise<Appointment> { return (await ensureApi()).createAppointment(req) }
export async function queryAppointment(req: QueryAppointmentRequest): Promise<Appointment | null> { return (await ensureApi()).queryAppointment(req) }
export async function listAppointments(params?: ListAppointmentsParams): Promise<{ items: Appointment[]; total: number; page: number; pageSize: number }> { return (await ensureApi()).listAppointments(params) }
export async function getAppointment(id: string): Promise<Appointment | null> { return (await ensureApi()).getAppointment(id) }

// ---- Queue Operations ----
export async function assignToken(appointmentId: string, req: AssignTokenRequest): Promise<Appointment> { return (await ensureApi()).assignToken(appointmentId, req) }
export async function checkIn(appointmentId: string): Promise<void> { return (await ensureApi()).checkIn(appointmentId) }
export async function callAppointment(appointmentId: string): Promise<void> { return (await ensureApi()).callAppointment(appointmentId) }
export async function completeSampling(appointmentId: string, req: CompleteSamplingRequest): Promise<Appointment> { return (await ensureApi()).completeSampling(appointmentId, req) }
export async function cancelAppointment(appointmentId: string, req: CancelRequest): Promise<Appointment> { return (await ensureApi()).cancelAppointment(appointmentId, req) }
export async function cancelByDriver(appointmentId: string, req: CancelByDriverRequest): Promise<Appointment> { return (await ensureApi()).cancelByDriver(appointmentId, req) }
export async function skipAppointment(appointmentId: string): Promise<void> { return (await ensureApi()).skipAppointment(appointmentId) }

// ---- Queue ----
export async function getQueue(): Promise<QueueBoard> { return (await ensureApi()).getQueue() }
export async function getMyPosition(appointmentId: string): Promise<MyPosition> { return (await ensureApi()).getMyPosition(appointmentId) }

// ---- Dashboard ----
export async function getTodayDashboard(): Promise<DashboardData> { return (await ensureApi()).getTodayDashboard() }

// ---- User Management ----
export async function listUsers(): Promise<User[]> { return (await ensureApi()).listUsers() }
export async function createUser(req: CreateUserRequest): Promise<User> { return (await ensureApi()).createUser(req) }
export async function deleteUser(id: string): Promise<void> { return (await ensureApi()).deleteUser(id) }
export async function resetPassword(id: string, req: ResetPasswordRequest): Promise<void> { return (await ensureApi()).resetPassword(id, req) }

// ---- Mock Utilities (only available in mock mode) ----
export async function resetMockData(): Promise<void> {
  const api = await ensureApi()
  return (api as typeof import('./mock/index')).resetMockData?.()
}
