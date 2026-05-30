import type { DashboardData, DashboardDetail } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string): Promise<T> {
  const t = localStorage.getItem('accessToken')
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
  })
  const json = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}

export async function getTodayDashboard(): Promise<DashboardData> {
  return request<DashboardData>('/api/dashboard/today')
}

export async function getDashboardDetail(): Promise<DashboardDetail> {
  return request<DashboardDetail>('/api/dashboard/detail')
}
