import type { QueueBoard, MyPosition } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const t = localStorage.getItem('accessToken')
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (t) h['Authorization'] = `Bearer ${t}`
  const res = await fetch(`${BASE}${path}`, { headers: h, ...opts })
  const json = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}

export function getQueue() {
  return request<QueueBoard>('/api/queue')
}

export function getMyPosition(n: string) {
  return request<MyPosition>(`/api/queue/my-position?appointmentNo=${encodeURIComponent(n)}`)
}
