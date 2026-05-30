import type { LoginRequest, LoginResponse, RefreshResponse } from '../types'
import { mockUsers, mockTokens } from './data'

const CREDENTIALS: Record<string, string> = {
  admin: 'admin123', op01: 'op123456', op02: 'op123456', manager01: 'manager123',
}

export function mockLogin(data: LoginRequest): LoginResponse {
  const pw = CREDENTIALS[data.username]
  if (!pw || pw !== data.password) throw { code: 'INVALID_CREDENTIALS', message: '用户名或密码错误', status: 401 }
  const user = mockUsers.find(u => u.username === data.username)!
  return { accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken, user: { id: user.id, username: user.username, role: user.role } }
}

export function mockRefresh(token: string): RefreshResponse {
  if (token !== mockTokens.refreshToken) throw { code: 'TOKEN_EXPIRED', message: 'refresh token 已过期', status: 401 }
  return { accessToken: mockTokens.accessToken, refreshToken: mockTokens.refreshToken }
}
