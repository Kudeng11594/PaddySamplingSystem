import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KpiCard from '../../components/KpiCard.vue'

describe('KpiCard', () => {
  const baseProps = { label: '今日预约', value: 42, borderColor: '#FF6600' }

  it('renders label and value', () => {
    const wrapper = mount(KpiCard, { props: baseProps })
    expect(wrapper.text()).toContain('今日预约')
    expect(wrapper.text()).toContain('42')
  })

  it('applies border-left-color from prop', () => {
    const wrapper = mount(KpiCard, { props: baseProps })
    expect(wrapper.attributes('style')).toContain('border-left-color: #FF6600')
  })

  it('renders trend text when provided', () => {
    const wrapper = mount(KpiCard, { props: { ...baseProps, trend: '昨日 30' } })
    expect(wrapper.text()).toContain('昨日 30')
  })

  it('does not render trend when not provided', () => {
    const wrapper = mount(KpiCard, { props: baseProps })
    expect(wrapper.find('.kpi-trend').exists()).toBe(false)
  })

  it('uses default trend color when trendColor not provided', () => {
    const wrapper = mount(KpiCard, { props: { ...baseProps, trend: '昨日 30' } })
    expect(wrapper.find('.kpi-trend').attributes('style')).toContain('color: #999')
  })

  it('uses custom trend color when provided', () => {
    const wrapper = mount(KpiCard, { props: { ...baseProps, trend: '↑ 20%', trendColor: '#2e7d32' } })
    expect(wrapper.find('.kpi-trend').attributes('style')).toContain('color: #2e7d32')
  })

  it('renders kpi-card class', () => {
    const wrapper = mount(KpiCard, { props: baseProps })
    expect(wrapper.classes()).toContain('kpi-card')
  })

  it('renders string value correctly', () => {
    const wrapper = mount(KpiCard, { props: { ...baseProps, value: '18min' } })
    expect(wrapper.text()).toContain('18min')
  })
})
