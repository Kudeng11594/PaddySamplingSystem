import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserRole } from '../api/types'
import { login as apiLogin } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  let savedUser: { id: string; username: string; role: UserRole } | null = null
  try { savedUser = JSON.parse(localStorage.getItem('user') || 'null') } catch { /* ignore */ }
  const user = ref<{ id: string; username: string; role: UserRole } | null>(savedUser)

  async function login(username: string, password: string) {
    const r = await apiLogin({ username, password })
    token.value = r.accessToken; refreshToken.value = r.refreshToken; user.value = r.user
    localStorage.setItem('accessToken', r.accessToken); localStorage.setItem('refreshToken', r.refreshToken); localStorage.setItem('user', JSON.stringify(r.user))
  }

  function logout() {
    token.value = null; refreshToken.value = null; user.value = null
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); localStorage.removeItem('user')
  }

  return { token, refreshToken, user, login, logout }
})
