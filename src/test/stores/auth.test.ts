import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'

// Mock the api module
vi.mock('../../api', () => ({
  login: vi.fn().mockResolvedValue({
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    user: { id: 'u1', username: 'admin', role: 'admin' },
  }),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('initializes with null values when not logged in', () => {
    const store = useAuthStore()
    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
  })

  it('restores session from localStorage', () => {
    localStorage.setItem('accessToken', 'saved-token')
    localStorage.setItem('refreshToken', 'saved-refresh')
    localStorage.setItem('user', JSON.stringify({ id: 'u2', username: 'op01', role: 'operator' }))

    const store = useAuthStore()
    expect(store.token).toBe('saved-token')
    expect(store.refreshToken).toBe('saved-refresh')
    expect(store.user?.username).toBe('op01')
    expect(store.user?.role).toBe('operator')
  })

  it('handles malformed JSON in localStorage gracefully', () => {
    localStorage.setItem('user', '{invalid-json}')
    const store = useAuthStore()
    expect(store.user).toBeNull()
  })

  it('login() stores tokens and user in state and localStorage', async () => {
    const store = useAuthStore()
    await store.login('admin', 'password123')

    expect(store.token).toBe('test-access-token')
    expect(store.refreshToken).toBe('test-refresh-token')
    expect(store.user).toEqual({ id: 'u1', username: 'admin', role: 'admin' })

    expect(localStorage.getItem('accessToken')).toBe('test-access-token')
    expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token')
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 'u1', username: 'admin', role: 'admin' }))
  })

  it('logout() clears all auth state and localStorage', () => {
    localStorage.setItem('accessToken', 'test-token')
    localStorage.setItem('refreshToken', 'test-refresh')
    localStorage.setItem('user', JSON.stringify({ id: 'u1', username: 'admin', role: 'admin' }))

    const store = useAuthStore()
    store.logout()

    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
