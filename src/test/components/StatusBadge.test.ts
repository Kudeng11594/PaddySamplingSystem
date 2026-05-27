import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '../../components/StatusBadge.vue'

describe('StatusBadge', () => {
  it('displays correct label and colors for pending status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'pending' } })
    expect(wrapper.text()).toBe('待取号')
    expect(wrapper.attributes('style')).toContain('background: #f5f5f5')
    expect(wrapper.attributes('style')).toContain('color: #999999')
  })

  it('displays 已取号 for token_assigned status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'token_assigned' } })
    expect(wrapper.text()).toBe('已取号')
  })

  it('displays 排队中 for waiting status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'waiting' } })
    expect(wrapper.text()).toBe('排队中')
  })

  it('displays 扦样中 for called status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'called' } })
    expect(wrapper.text()).toBe('扦样中')
  })

  it('displays 已完成 for completed status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'completed' } })
    expect(wrapper.text()).toBe('已完成')
  })

  it('displays 已取消 for cancelled status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'cancelled' } })
    expect(wrapper.text()).toBe('已取消')
  })

  it('falls back to pending style for unknown status', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'unknown' } })
    expect(wrapper.text()).toBe('待取号')
    expect(wrapper.attributes('style')).toContain('background: #f5f5f5')
  })

  it('has status-badge class', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'completed' } })
    expect(wrapper.classes()).toContain('status-badge')
  })
})
