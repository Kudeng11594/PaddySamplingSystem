import { describe, it, expect } from 'vitest'
import { mockLogin, mockRefresh } from '../../api/mock/auth'

describe('mockLogin', () => {
  it('returns tokens and user for valid admin credentials', () => {
    const result = mockLogin({ username: 'admin', password: 'admin123' })
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBeTruthy()
    expect(result.user.role).toBe('admin')
  })

  it('returns tokens and user for valid operator credentials', () => {
    const result = mockLogin({ username: 'op01', password: 'op123456' })
    expect(result.user.role).toBe('operator')
  })

  it('returns tokens and user for valid manager credentials', () => {
    const result = mockLogin({ username: 'manager01', password: 'manager123' })
    expect(result.user.role).toBe('manager')
  })

  it('throws 401 for invalid password', () => {
    expect(() => mockLogin({ username: 'admin', password: 'wrong' })).toThrow()
  })

  it('throws 401 for unknown username', () => {
    expect(() => mockLogin({ username: 'unknown', password: 'x' })).toThrow()
  })
})

describe('mockRefresh', () => {
  it('returns new tokens for valid refresh token', () => {
    const result = mockRefresh('mock-refresh-token-for-testing')
    expect(result.accessToken).toBeTruthy()
    expect(result.refreshToken).toBe('mock-refresh-token-for-testing')
  })

  it('throws 401 for invalid refresh token', () => {
    expect(() => mockRefresh('invalid-token')).toThrow()
  })
})
