import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import LoginPage from '../../pages/auth/login.vue'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({}),
}))

// Mock the API module used by auth store
vi.mock('../../api', () => ({
  login: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockPush.mockReset()
    localStorage.clear()
  })

  function createWrapper() {
    return mount(LoginPage, {
      global: {
        plugins: [createPinia()],
      },
    })
  }

  it('renders brand header with title', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('好雨粮库')
    expect(wrapper.text()).toContain('原粮进厂扦样系统')
    expect(wrapper.find('.brand-header').exists()).toBe(true)
  })

  it('renders login form inputs', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('shows error when submitting empty form', async () => {
    const wrapper = createWrapper()
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.text()).toContain('请输入用户名和密码')
  })

  it('shows login button enabled by default', () => {
    const wrapper = createWrapper()
    const btn = wrapper.find('button[type="submit"]')
    expect(btn.text()).toBe('登录')
    expect(btn.attributes('disabled')).toBeUndefined()
  })

  it('shows footer links', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('服务条款')
    expect(wrapper.text()).toContain('隐私政策')
  })

  it('has login-page class', () => {
    const wrapper = createWrapper()
    expect(wrapper.classes()).toContain('login-page')
  })

  it('has login-card class', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.login-card').exists()).toBe(true)
  })
})
