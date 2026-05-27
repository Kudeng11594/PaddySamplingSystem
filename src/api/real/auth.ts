import type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse, ApiResponse } from '../types'

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts.headers as Record<string, string> },
    ...opts,
  })
  const json: ApiResponse<T> = await res.json()
  if (!json.success && json.error) throw { code: json.error.code, message: json.error.message, status: res.status }
  return json.data as T
}

export function login(d: LoginRequest) {
  return request<LoginResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(d) })
}

export function refresh(d: RefreshRequest) {
  return request<RefreshResponse>('/api/auth/refresh', { method: 'POST', body: JSON.stringify(d) })
}
