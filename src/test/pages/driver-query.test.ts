import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

function flushDom() {
  return new Promise(resolve => setTimeout(resolve, 0))
}

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({}),
}))

const mockListAppointments = vi.fn()
vi.mock('../../api', () => ({
  listAppointments: (...args: any[]) => mockListAppointments(...args),
}))

const mockAppointments = [
  { _id: '1', appointmentNo: 'YD20260527001', licensePlate: '辽B12345', driverName: '张师傅', status: 'waiting', variety: '中科发5', appointmentDate: '2026-05-27', appointmentTime: '09:00' },
  { _id: '2', appointmentNo: 'YD20260527002', licensePlate: '辽C67890', driverName: '李师傅', status: 'completed', variety: '吉宏6', appointmentDate: '2026-05-27', appointmentTime: '10:00' },
]

async function createWrapper() {
  mockListAppointments.mockResolvedValue({ items: mockAppointments, total: 2, page: 1, pageSize: 100 })
  const Page = (await import('../../pages/driver/query.vue')).default
  return mount(Page, {
    global: {
      stubs: {
        MobileLayout: { template: '<div class="mobile-layout"><slot name="header" /><slot /></div>' },
        StatusBadge: { template: '<span class="status-badge">{{ status }}</span>', props: ['status'] },
      },
    },
  })
}

describe('DriverQueryPage', () => {
  beforeEach(() => {
    mockListAppointments.mockReset()
    localStorage.clear()
  })

  it('loads appointments on mount', async () => {
    await createWrapper()
    expect(mockListAppointments).toHaveBeenCalledTimes(1)
    expect(mockListAppointments).toHaveBeenCalledWith({ pageSize: 100 })
  })

  it('renders search input and button', async () => {
    const wrapper = await createWrapper()
    expect(wrapper.find('.search-input').exists()).toBe(true)
    expect(wrapper.find('.search-btn').exists()).toBe(true)
    expect(wrapper.find('.search-input').attributes('placeholder')).toContain('预约编号')
  })

  it('shows all results when search with empty keyword', async () => {
    const wrapper = await createWrapper()
    await flushDom()
    await wrapper.vm.$nextTick()
    await wrapper.find('.search-btn').trigger('click')
    expect(wrapper.text()).toContain('YD20260527001')
    expect(wrapper.text()).toContain('辽B12345')
    expect(wrapper.text()).toContain('YD20260527002')
    expect(wrapper.text()).toContain('辽C67890')
  })

  it('filters results by keyword search', async () => {
    const wrapper = await createWrapper()
    await flushDom()
    await wrapper.vm.$nextTick()

    const input = wrapper.find('.search-input')
    await input.setValue('辽B')
    await wrapper.find('.search-btn').trigger('click')

    expect(wrapper.text()).toContain('辽B12345')
    expect(wrapper.text()).not.toContain('辽C67890')
  })

  it('shows empty state before searching', async () => {
    mockListAppointments.mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 100 })
    const wrapper = await createWrapper()
    expect(wrapper.text()).toContain('请输入条件查询')
  })

  it('shows no results message after empty search', async () => {
    const wrapper = await createWrapper()
    await new Promise(r => setTimeout(r, 50))

    const input = wrapper.find('.search-input')
    await input.setValue('不存在')
    await wrapper.find('.search-btn').trigger('click')

    expect(wrapper.text()).toContain('暂无记录')
  })
})
