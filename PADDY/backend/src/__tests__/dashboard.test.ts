import { describe, it, expect, beforeEach } from 'vitest'
import { getDb } from '../db/index.js'
import * as dashService from '../services/dashboard.js'

beforeEach(() => {
  getDb().exec('DELETE FROM appointments')
})

function seedAppointments() {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const insert = db.prepare(`
    INSERT INTO appointments (id, appointmentNo, driverName, phone, licensePlate, variety, appointmentDate, appointmentTime, status, createdAt, queuedAt, calledAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  insert.run('a1', 'T0001', '张三', '13800000001', '辽A11111', '中科发5', today, '09:00', 'completed', `${today}T08:00:00Z`, `${today}T08:30:00Z`, `${today}T09:00:00Z`)
  insert.run('a2', 'T0002', '李四', '13800000002', '吉B22222', '吉宏6', today, '09:30', 'waiting', `${today}T08:00:00Z`, `${today}T09:00:00Z`, null)
  insert.run('a3', 'T0003', '王五', '13800000003', '黑C33333', '鲜食玉米', today, '10:00', 'cancelled', `${today}T08:00:00Z`, null, null)
  insert.run('a4', 'T0004', '赵六', '13800000004', '辽D44444', '中科发5', yesterday, '08:00', 'completed', `${yesterday}T07:00:00Z`, `${yesterday}T07:30:00Z`, `${yesterday}T08:00:00Z`)
}

describe('getTodayDashboard', () => {
  it('returns zeros when no appointments today', () => {
    const result = dashService.getTodayDashboard()
    expect(result.totalAppointments).toBe(0)
    expect(result.waitingCount).toBe(0)
    expect(result.completedCount).toBe(0)
    expect(result.lastUpdated).toBeTruthy()
  })
  it('returns correct counts with data', () => {
    seedAppointments()
    const result = dashService.getTodayDashboard()
    expect(result.totalAppointments).toBe(3)
    expect(result.waitingCount).toBe(1)
    expect(result.completedCount).toBe(1)
    expect(result.cancelledCount).toBe(1)
  })
})

describe('getDashboardDetail', () => {
  it('returns detail object with all fields when empty', () => {
    const result = dashService.getDashboardDetail() as any
    expect(result.todayAppointments).toBe(0)
    expect(result.completedCount).toBe(0)
    expect(result.dailyTrend).toHaveLength(7)
    expect(result.varietyDistribution).toEqual([])
    expect(result.operationLogs).toEqual([])
  })
  it('returns computed stats from seed data', () => {
    seedAppointments()
    const result = dashService.getDashboardDetail() as any
    expect(result.todayAppointments).toBe(3)
    expect(result.completedCount).toBe(1)
    expect(result.cancelledCount).toBe(1)
    expect(result.cancelRate).toBeTruthy()
    expect(result.dailyTrend).toHaveLength(7)
    expect(result.varietyDistribution.length).toBeGreaterThan(0)
    expect(result.operationLogs.length).toBeGreaterThan(0)
    expect(result.avgSamplingTime).toBeGreaterThan(0)
    expect(result.peakHours).toBeTruthy()
    expect(result.passRate).toBeGreaterThan(0)
    expect(result.yesterdayComparison).toBeTruthy()
    expect(result.yesterdayComparison.appointments).toBeTruthy()
    expect(result.yesterdayComparison.completed).toBeTruthy()
  })
})
