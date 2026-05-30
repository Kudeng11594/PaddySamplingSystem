import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from '../../components/MetricCard.vue'

describe('MetricCard', () => {
  it('renders label and value', () => {
    const wrapper = mount(MetricCard, { props: { label: '今日预约', value: 18 } })
    expect(wrapper.text()).toContain('今日预约')
    expect(wrapper.text()).toContain('18')
  })

  it('uses default color #FF6600 when color not provided', () => {
    const wrapper = mount(MetricCard, { props: { label: '排队中', value: 5 } })
    expect(wrapper.find('.metric-value').attributes('style')).toContain('color: #FF6600')
  })

  it('uses custom color when provided', () => {
    const wrapper = mount(MetricCard, { props: { label: '已完成', value: 8, color: '#2e7d32' } })
    expect(wrapper.find('.metric-value').attributes('style')).toContain('color: #2e7d32')
  })

  it('renders metric-card class', () => {
    const wrapper = mount(MetricCard, { props: { label: '测试', value: 0 } })
    expect(wrapper.classes()).toContain('metric-card')
  })

  it('renders string value correctly', () => {
    const wrapper = mount(MetricCard, { props: { label: '等待时间', value: '18min' } })
    expect(wrapper.text()).toContain('18min')
  })
})
