<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    const role = authStore.user?.role
    if (role === 'admin' || role === 'operator') {
      router.push('/admin/appointments')
    } else if (role === 'manager') {
      router.push('/manager/dashboard')
    } else {
      router.push('/driver/create')
    }
  } catch {
    error.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand-header">
        <span class="brand-icon">🏪</span>
        <h1 class="brand-title">好雨粮库</h1>
        <p class="brand-subtitle">原粮进厂扦样系统</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            class="form-input"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            class="form-input"
            autocomplete="current-password"
          />
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="login-footer">
        <a href="#">服务条款</a>
        <span class="footer-sep">|</span>
        <a href="#">隐私政策</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #fefbfb);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface, #ffffff);
  border-radius: var(--radius-xl, 12px);
  overflow: hidden;
  box-shadow: var(--shadow-md, 0 2px 4px rgba(0, 0, 0, 0.08));
}

.brand-header {
  background: #FF6600;
  color: white;
  text-align: center;
  padding: 2rem 1rem;
}

.brand-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.brand-subtitle {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0.25rem 0 0;
}

.login-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border, #eeeeee);
  border-radius: var(--radius-md, 6px);
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #FF6600;
}

.login-btn {
  padding: 0.75rem;
  background: #FF6600;
  color: white;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  min-height: 44px;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:active:not(:disabled) {
  opacity: 0.8;
}

.error-message {
  color: var(--color-danger, #e53935);
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
}

.login-footer {
  padding: 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-text-muted, #888);
}

.login-footer a {
  color: var(--color-text-muted, #888);
  text-decoration: none;
}

.footer-sep {
  margin: 0 0.5rem;
}
</style>
