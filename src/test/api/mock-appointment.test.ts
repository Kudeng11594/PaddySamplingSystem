import { describe, it, expect, beforeEach } from 'vitest'
import {
  mockCreateAppointment, mockListAppointments, mockGetAppointment,
  mockAssignToken, mockCheckIn, mockCall, mockComplete,
  mockCancel, mockCancelByDriver, mockSkip,
} from '../../api/mock/appointment'
import { resetState } from '../../api/mock/state'
import type { CreateAppointmentRequest, ListAppointmentsParams } from '../../api/types'

const sampleCreate: CreateAppointmentRequest = {
  driverName: '测试司机',
  phone: '13900001111',
  licensePlate: '京A88888',
  variety: '玉米',
  appointmentDate: '2026-06-01',
  appointmentTime: '09:00',
  remark: '',
}

describe('mockCreateAppointment', () => {
  beforeEach(() => resetState())

  it('creates appointment with pending status', () => {
    const appt = mockCreateAppointment(sampleCreate)
    expect(appt.driverName).toBe('测试司机')
    expect(appt.status).toBe('pending')
    expect(appt.appointmentNo).toBeTruthy()
    expect(appt._id).toBeTruthy()
  })

  it('increments sequence number', () => {
    const a1 = mockCreateAppointment(sampleCreate)
    const a2 = mockCreateAppointment({ ...sampleCreate, driverName: '司机2' })
    expect(Number(a2.appointmentNo.slice(-3))).toBeGreaterThan(Number(a1.appointmentNo.slice(-3)))
  })
})

describe('mockListAppointments', () => {
  beforeEach(() => resetState())

  it('lists all appointments without filters', () => {
    mockCreateAppointment(sampleCreate)
    const result = mockListAppointments({})
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.total).toBeGreaterThan(0)
  })

  it('filters by status', () => {
    const result = mockListAppointments({ status: 'pending' })
    for (const a of result.items) expect(a.status).toBe('pending')
  })

  it('filters by keyword', () => {
    mockCreateAppointment(sampleCreate)
    const result = mockListAppointments({ keyword: '测试司机' })
    expect(result.items.length).toBeGreaterThan(0)
  })

  it('paginates results', () => {
    for (let i = 0; i < 5; i++) mockCreateAppointment({ ...sampleCreate, driverName: `司机${i}` })
    const page1 = mockListAppointments({ page: 1, pageSize: 2 })
    expect(page1.items.length).toBe(2)
    expect(page1.page).toBe(1)
    expect(page1.pageSize).toBe(2)
  })
})

describe('appointment status transitions', () => {
  let id: string

  beforeEach(() => {
    resetState()
    id = mockCreateAppointment(sampleCreate)._id
  })

  it('full lifecycle: pending → token_assigned → waiting → called → completed', () => {
    const a = mockAssignToken(id, { tokenNo: 'T001' })
    expect(a.status).toBe('token_assigned')
    const w = mockCheckIn(id)
    expect(w.status).toBe('waiting')
    const c = mockCall(id)
    expect(c.status).toBe('called')
    const d = mockComplete(id, { moisture: 14.5, riceYield: 72.3 })
    expect(d.status).toBe('completed')
  })

  it('rejects assignToken from non-pending status', () => {
    mockAssignToken(id, { tokenNo: 'T001' })
    expect(() => mockAssignToken(id, { tokenNo: 'T002' })).toThrow()
  })

  it('rejects checkIn without token_assigned', () => {
    expect(() => mockCheckIn(id)).toThrow()
  })

  it('rejects call without waiting status', () => {
    expect(() => mockCall(id)).toThrow()
  })

  it('rejects complete without called status', () => {
    expect(() => mockComplete(id, { moisture: 14, riceYield: 70 })).toThrow()
  })

  it('cancels a pending appointment', () => {
    const r = mockCancel(id, { reason: '测试取消' })
    expect(r.status).toBe('cancelled')
  })

  it('rejects cancel of completed appointment', () => {
    mockAssignToken(id, { tokenNo: 'T001' })
    mockCheckIn(id)
    mockCall(id)
    mockComplete(id, { moisture: 14, riceYield: 70 })
    expect(() => mockCancel(id, { reason: '不可取消' })).toThrow()
  })

  it('driver can cancel own pending appointment', () => {
    mockCancelByDriver(id, { phone: '13900001111' })
    expect(mockGetAppointment(id).status).toBe('cancelled')
  })

  it('rejects driver cancel with wrong phone', () => {
    expect(() => mockCancelByDriver(id, { phone: 'wrong' })).toThrow()
  })

  it('rejects driver cancel when not pending', () => {
    mockAssignToken(id, { tokenNo: 'T001' })
    expect(() => mockCancelByDriver(id, { phone: '13900001111' })).toThrow()
  })

  it('skip re-queues a waiting appointment', () => {
    mockAssignToken(id, { tokenNo: 'T001' })
    mockCheckIn(id)
    const s = mockSkip(id)
    expect(s.status).toBe('waiting')
  })
})
