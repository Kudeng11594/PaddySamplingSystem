import type { DashboardData } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

export async function getTodayDashboard(): Promise<DashboardData> {
  const t = localStorage.getItem('accessToken')
  const res = await fetch(`${BASE}/api/dashboard/today`, {
    headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
  })
  const json = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data
}
