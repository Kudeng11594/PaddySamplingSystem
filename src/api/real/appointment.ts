import type {
  Appointment, CreateAppointmentRequest, QueryAppointmentRequest, ListAppointmentsParams,
  PaginatedData, AssignTokenRequest, CompleteSamplingRequest, CancelRequest, CancelByDriverRequest,
} from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

function authHeaders() {
  const t = localStorage.getItem('accessToken')
  return t ? { 'Authorization': `Bearer ${t}` } : {} as Record<string, string>
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders(), ...opts.headers as Record<string, string> },
    ...opts,
  })
  const json = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}

export function createAppointment(d: CreateAppointmentRequest) {
  return request<Appointment>('/api/appointments', { method: 'POST', body: JSON.stringify(d) })
}

export function queryAppointment(d: QueryAppointmentRequest) {
  return request<Appointment & { queuePosition?: number }>('/api/appointments/query', {
    method: 'POST', body: JSON.stringify(d),
  })
}

export function listAppointments(p: ListAppointmentsParams) {
  const q = new URLSearchParams()
  if (p.page) q.set('page', String(p.page))
  if (p.pageSize) q.set('pageSize', String(p.pageSize))
  if (p.status) q.set('status', p.status)
  if (p.keyword) q.set('keyword', p.keyword)
  if (p.sortBy) q.set('sortBy', p.sortBy)
  if (p.sortOrder) q.set('sortOrder', p.sortOrder)
  return request<PaginatedData<Appointment>>(`/api/appointments?${q.toString()}`)
}

export function getAppointment(id: string) {
  return request<Appointment>(`/api/appointments/${id}`)
}

export function assignToken(id: string, d: AssignTokenRequest) {
  return request<Appointment>(`/api/appointments/${id}/assign-token`, { method: 'POST', body: JSON.stringify(d) })
}

export function checkIn(id: string) {
  return request<Appointment>(`/api/appointments/${id}/check-in`, { method: 'POST' })
}

export function callAppointment(id: string) {
  return request<Appointment>(`/api/appointments/${id}/call`, { method: 'POST' })
}

export function completeSampling(id: string, d: CompleteSamplingRequest) {
  return request<Appointment>(`/api/appointments/${id}/complete`, { method: 'POST', body: JSON.stringify(d) })
}

export function cancelAppointment(id: string, d: CancelRequest) {
  return request<Appointment>(`/api/appointments/${id}/cancel`, { method: 'POST', body: JSON.stringify(d) })
}

export function cancelByDriver(id: string, d: CancelByDriverRequest) {
  return request<Appointment>(`/api/appointments/${id}/cancel-by-driver`, { method: 'POST', body: JSON.stringify(d) })
}

export function skipAppointment(id: string) {
  return request<Appointment>(`/api/appointments/${id}/skip`, { method: 'POST' })
}
