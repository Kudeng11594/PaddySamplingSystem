import { describe, it, expect } from 'vitest'
import {
  mockAppointments,
  mockUsers,
  mockDashboardDetail,
  mockQueueBoardDisplay,
  mockVarieties,
} from '../../api/mock/data'
import type { AppointmentStatus } from '../../api/types'

describe('mockAppointments data integrity', () => {
  it('has 6 appointments', () => {
    expect(mockAppointments).toHaveLength(6)
  })

  it('each appointment has required fields', () => {
    for (const a of mockAppointments) {
      expect(a._id).toBeTruthy()
      expect(a.appointmentNo).toBeTruthy()
      expect(a.driverName).toBeTruthy()
      expect(a.phone).toMatch(/^1\d{10}$/)
      expect(a.licensePlate).toBeTruthy()
      expect(a.variety).toBeTruthy()
      expect(a.appointmentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(a.appointmentTime).toMatch(/^\d{2}:\d{2}$/)
      expect(a.status).toBeTruthy()
      expect(a.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    }
  })

  it('covers all statuses at least once', () => {
    const statuses = new Set(mockAppointments.map(a => a.status))
    const allStatuses: AppointmentStatus[] = [
      'pending', 'token_assigned', 'waiting', 'called', 'completed', 'cancelled',
    ]
    for (const s of allStatuses) {
      expect(statuses.has(s)).toBe(true)
    }
  })

  it('covers all varieties', () => {
    const varieties = new Set(mockAppointments.map(a => a.variety))
    for (const v of mockVarieties) {
      expect(varieties.has(v)).toBe(true)
    }
  })

  it('appointment numbers follow YYYYMMDDNNN pattern', () => {
    for (const a of mockAppointments) {
      expect(a.appointmentNo).toMatch(/^20\d{2}\d{4}\d{3}$/)
    }
  })
})

describe('mockUsers data integrity', () => {
  it('has 4 users', () => {
    expect(mockUsers).toHaveLength(4)
  })

  it('each user has required fields', () => {
    for (const u of mockUsers) {
      expect(u.id).toBeTruthy()
      expect(u.username).toBeTruthy()
      expect(['admin', 'operator', 'manager']).toContain(u.role)
      expect(u.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    }
  })

  it('covers all roles', () => {
    const roles = new Set(mockUsers.map(u => u.role))
    expect(roles.has('admin')).toBe(true)
    expect(roles.has('operator')).toBe(true)
    expect(roles.has('manager')).toBe(true)
  })
})

describe('mockDashboardDetail data integrity', () => {
  it('has all required KPIs', () => {
    expect(mockDashboardDetail.todayAppointments).toBeGreaterThan(0)
    expect(mockDashboardDetail.completedCount).toBeGreaterThan(0)
    expect(mockDashboardDetail.queueingCount).toBeGreaterThan(0)
    expect(mockDashboardDetail.cancelledCount).toBeGreaterThanOrEqual(0)
    expect(typeof mockDashboardDetail.passRate).toBe('number')
  })

  it('dailyTrend has 7 entries with valid data', () => {
    expect(mockDashboardDetail.dailyTrend).toHaveLength(7)
    for (const point of mockDashboardDetail.dailyTrend) {
      expect(point.date).toMatch(/^\d{1,2}\/\d{1,2}$/)
      expect(typeof point.count).toBe('number')
      expect(point.count).toBeGreaterThanOrEqual(0)
    }
  })

  it('varietyDistribution percentages sum to 100', () => {
    const sum = mockDashboardDetail.varietyDistribution.reduce((s, v) => s + v.percentage, 0)
    expect(sum).toBe(100)
  })

  it('varietyDistribution has unique varieties', () => {
    const varieties = mockDashboardDetail.varietyDistribution.map(v => v.variety)
    expect(new Set(varieties).size).toBe(varieties.length)
  })

  it('has yesterdayComparison fields', () => {
    expect(mockDashboardDetail.yesterdayComparison.appointments).toBeTruthy()
    expect(mockDashboardDetail.yesterdayComparison.completed).toBeTruthy()
  })

  it('operationLogs has entries with required fields', () => {
    expect(mockDashboardDetail.operationLogs.length).toBeGreaterThan(0)
    for (const log of mockDashboardDetail.operationLogs) {
      expect(log.datetime).toBeTruthy()
      expect(log.licensePlate).toBeTruthy()
      expect(log.activity).toBeTruthy()
      expect(log.operator).toBeTruthy()
    }
  })
})

describe('mockQueueBoardDisplay data integrity', () => {
  it('has currentSampling or nextInLine', () => {
    expect(mockQueueBoardDisplay.currentSampling).toBeTruthy()
    expect(mockQueueBoardDisplay.nextInLine).toBeTruthy()
  })

  it('waitingQueue has items with required fields', () => {
    expect(mockQueueBoardDisplay.waitingQueue.length).toBeGreaterThan(0)
    for (const item of mockQueueBoardDisplay.waitingQueue) {
      expect(item.tokenNumber).toMatch(/^A\d{3}$/)
      expect(item.licensePlate).toBeTruthy()
      expect(item.driverName).toBeTruthy()
      expect(item.variety).toBeTruthy()
      expect(typeof item.waitTimeMinutes).toBe('number')
      expect(item.status).toBeTruthy()
    }
  })

  it('todayStats has all fields', () => {
    const { totalAppointments, completed, queueing, cancelled } = mockQueueBoardDisplay.todayStats
    expect(totalAppointments).toBeGreaterThan(0)
    expect(completed).toBeGreaterThan(0)
    expect(queueing).toBeGreaterThan(0)
    expect(cancelled).toBeGreaterThanOrEqual(0)
  })

  it('has valid derived stats', () => {
    expect(typeof mockQueueBoardDisplay.avgWaitTime).toBe('number')
    expect(mockQueueBoardDisplay.avgWaitTime).toBeGreaterThan(0)
    expect(mockQueueBoardDisplay.peakHours).toMatch(/\d{2}:\d{2}/)
  })
})
