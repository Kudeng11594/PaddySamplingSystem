export { login, refresh } from './auth'
export function getVarieties(): Promise<string[]> {
  return Promise.resolve(['中科发5', '吉宏6', '鲜食玉米', '杂粮'])
}
export {
  createAppointment, queryAppointment, listAppointments, getAppointment,
  assignToken, checkIn, callAppointment, completeSampling,
  cancelAppointment, cancelByDriver, skipAppointment,
} from './appointment'
export { getQueue, getMyPosition } from './queue'
export { getTodayDashboard, getDashboardDetail } from './dashboard'

import type { User, CreateUserRequest, ResetPasswordRequest } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = localStorage.getItem('accessToken')
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json', ...opts.headers as Record<string, string> },
    ...opts,
  })
  const json = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}

export function listUsers() {
  return request<{ items: User[]; total: number }>('/api/users')
}

export function createUser(d: CreateUserRequest) {
  return request<{ id: string; username: string; role: string }>('/api/users', { method: 'POST', body: JSON.stringify(d) })
}

export function deleteUser(id: string) {
  return request<void>(`/api/users/${id}`, { method: 'DELETE' })
}

export function resetPassword(id: string, d: ResetPasswordRequest) {
  return request<void>(`/api/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify(d) })
}
