import { describe, it, expect } from 'vitest'
import { mockGetTodayDashboard, mockGetDashboardDetail } from '../../api/mock/dashboard'

describe('mockGetTodayDashboard', () => {
  it('returns dashboard data for today', () => {
    const result = mockGetTodayDashboard()
    expect(result).toHaveProperty('totalAppointments')
    expect(result).toHaveProperty('completedCount')
    expect(result).toHaveProperty('waitingCount')
    expect(result).toHaveProperty('cancelledCount')
    expect(result.totalAppointments).toBeGreaterThanOrEqual(0)
  })
})

describe('mockGetDashboardDetail', () => {
  it('returns dashboard detail with KPI data', () => {
    const result = mockGetDashboardDetail()
    expect(result).toHaveProperty('todayAppointments')
    expect(result).toHaveProperty('completedCount')
    expect(result).toHaveProperty('queueingCount')
    expect(result).toHaveProperty('cancelledCount')
    expect(result).toHaveProperty('avgWaitTime')
    expect(result).toHaveProperty('avgSamplingTime')
    expect(result).toHaveProperty('varietyDistribution')
    expect(Array.isArray(result.varietyDistribution)).toBe(true)
    expect(result.varietyDistribution.length).toBeGreaterThan(0)
  })
})
