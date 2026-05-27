import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppointmentInfoCard from '../../components/AppointmentInfoCard.vue'

describe('AppointmentInfoCard', () => {
  const props = {
    appointmentNumber: '20260522001',
    driverName: '张三',
    licensePlate: '辽A12345',
    variety: '中科发5',
  }

  it('renders all appointment info fields', () => {
    const wrapper = mount(AppointmentInfoCard, { props })
    expect(wrapper.text()).toContain('20260522001')
    expect(wrapper.text()).toContain('张三')
    expect(wrapper.text()).toContain('辽A12345')
    expect(wrapper.text()).toContain('中科发5')
  })

  it('renders labels', () => {
    const wrapper = mount(AppointmentInfoCard, { props })
    expect(wrapper.text()).toContain('预约编号：')
    expect(wrapper.text()).toContain('驾驶员：')
    expect(wrapper.text()).toContain('车牌号：')
    expect(wrapper.text()).toContain('品种：')
  })

  it('has appointment-info-card class', () => {
    const wrapper = mount(AppointmentInfoCard, { props })
    expect(wrapper.classes()).toContain('appointment-info-card')
  })
})
