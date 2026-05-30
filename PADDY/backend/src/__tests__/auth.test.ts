import { describe, it, expect, beforeEach } from 'vitest'
import { getDb } from '../db/index.js'
import bcrypt from 'bcryptjs'
import * as authService from '../services/auth.js'

function seedUser(tokenVersion = 1) {
  const db = getDb()
  const id = crypto.randomUUID()
  const hash = bcrypt.hashSync('test123', 10)
  db.prepare('INSERT INTO users (id, username, password, role, tokenVersion) VALUES (?, ?, ?, ?, ?)').run(id, 'testuser', hash, 'operator', tokenVersion)
  return { id, username: 'testuser', role: 'operator' }
}

beforeEach(() => {
  getDb().exec('DELETE FROM users')
})

describe('login', () => {
  it('returns tokens and user for valid credentials', async () => {
    seedUser()
    const result = await authService.login('testuser', 'test123')
    expect(result).not.toBeNull()
    expect(result!.accessToken).toBeTruthy()
    expect(result!.refreshToken).toBeTruthy()
    expect(result!.user.username).toBe('testuser')
  })
  it('returns null for wrong password', async () => {
    seedUser()
    const result = await authService.login('testuser', 'wrongpass')
    expect(result).toBeNull()
  })
  it('returns null for non-existent user', async () => {
    const result = await authService.login('nobody', 'test123')
    expect(result).toBeNull()
  })
})

describe('refreshTokens', () => {
  it('returns new token pair for valid refresh token', async () => {
    seedUser()
    const loginResult = await authService.login('testuser', 'test123')
    const refreshed = await authService.refreshTokens(loginResult!.refreshToken)
    expect(refreshed).not.toBeNull()
    expect(refreshed!.accessToken).toBeTruthy()
    expect(refreshed!.refreshToken).toBeTruthy()
    expect(refreshed!.refreshToken).not.toBe(loginResult!.refreshToken)
  })
  it('returns null for expired/invalid token', async () => {
    const result = await authService.refreshTokens('invalid-token')
    expect(result).toBeNull()
  })
  it('rejects already-rotated refresh token', async () => {
    seedUser()
    const loginResult = await authService.login('testuser', 'test123')!
    const firstRefresh = await authService.refreshTokens(loginResult!.refreshToken)
    expect(firstRefresh).not.toBeNull()
    const secondRefresh = await authService.refreshTokens(loginResult!.refreshToken)
    expect(secondRefresh).toBeNull()
  })
  it('rejects refresh token used after another valid refresh (leaked token)', async () => {
    seedUser()
    const loginResult = await authService.login('testuser', 'test123')!
    const clientA = await authService.refreshTokens(loginResult!.refreshToken)
    expect(clientA).not.toBeNull()
    const clientB = await authService.refreshTokens(loginResult!.refreshToken)
    expect(clientB).toBeNull()
  })
})
