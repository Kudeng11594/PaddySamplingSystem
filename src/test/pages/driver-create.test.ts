import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useRoute: () => ({}),
}))

const mockCreateAppointment = vi.fn()
const mockGetVarieties = vi.fn().mockResolvedValue(['中科发5', '吉宏6'])
vi.mock('../../api', () => ({
  createAppointment: (...args: any[]) => mockCreateAppointment(...args),
  getVarieties: (...args: any[]) => mockGetVarieties(...args),
}))

async function createWrapper() {
  const Page = (await import('../../pages/driver/create.vue')).default
  return mount(Page, {
    global: {
      stubs: {
        MobileLayout: { template: '<div class="mobile-layout"><slot name="header" /><slot /></div>' },
        TagSelector: { template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o" :value="o">{{ o }}</option></select>', props: ['modelValue', 'options'], emits: ['update:modelValue'] },
      },
    },
  })
}

describe('DriverCreatePage', () => {
  beforeEach(() => {
    mockPush.mockReset()
    mockCreateAppointment.mockReset()
    mockGetVarieties.mockClear()
    localStorage.clear()
  })

  it('loads varieties on mount', async () => {
    await createWrapper()
    expect(mockGetVarieties).toHaveBeenCalledTimes(1)
  })

  it('renders form fields', async () => {
    const wrapper = await createWrapper()
    expect(wrapper.text()).toContain('新建预约')
    expect(wrapper.text()).toContain('驾驶员姓名')
    expect(wrapper.text()).toContain('手机号')
    expect(wrapper.text()).toContain('车牌号')
    expect(wrapper.text()).toContain('粮食品种')
    expect(wrapper.text()).toContain('提交预约')
  })

  it('prevents submission with empty form', async () => {
    const wrapper = await createWrapper()
    await wrapper.find('.submit-btn').trigger('click')
    expect(mockCreateAppointment).not.toHaveBeenCalled()
  })

  async function fillForm(wrapper: ReturnType<typeof mount>) {
    const inputs = wrapper.findAll('input')
    await inputs[0].setValue('张师傅')
    await inputs[1].setValue('13800138000')
    await inputs[2].setValue('辽B12345')
    await inputs[3].setValue('2026-05-27')
    await inputs[4].setValue('14:30')

    const selects = wrapper.findAll('select')
    if (selects.length > 0) {
      await selects[0].setValue('中科发5')
    }
  }

  it('calls createAppointment on valid form submission', async () => {
    mockCreateAppointment.mockResolvedValueOnce({ _id: '1' })
    const wrapper = await createWrapper()

    await fillForm(wrapper)
    await wrapper.find('.submit-btn').trigger('click')

    expect(mockCreateAppointment).toHaveBeenCalledTimes(1)
    expect(mockCreateAppointment).toHaveBeenCalledWith({
      driverName: '张师傅',
      phone: '13800138000',
      licensePlate: '辽B12345',
      variety: '中科发5',
      appointmentDate: '2026-05-27',
      appointmentTime: '14:30',
      remark: undefined,
    })
    expect(mockPush).toHaveBeenCalledWith('/driver/queue')
  })

  it('shows error message on submission failure', async () => {
    mockCreateAppointment.mockRejectedValueOnce(new Error('网络错误'))
    const wrapper = await createWrapper()

    await fillForm(wrapper)
    await wrapper.find('.submit-btn').trigger('click')

    expect(mockCreateAppointment).toHaveBeenCalledTimes(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('disables button while submitting', async () => {
    mockCreateAppointment.mockImplementationOnce(() => new Promise(() => {}))
    const wrapper = await createWrapper()

    await fillForm(wrapper)
    await wrapper.find('.submit-btn').trigger('click')

    const btn = wrapper.find('.submit-btn')
    expect(btn.attributes('disabled')).toBeDefined()
    expect(btn.text()).toBe('提交中...')
  })
})
