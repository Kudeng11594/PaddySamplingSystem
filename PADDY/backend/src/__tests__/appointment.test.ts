import { describe, it, expect, beforeEach } from 'vitest'
import { getDb } from '../db/index.js'
import * as svc from '../services/appointment.js'

const validInput = {
  driverName: '张三', phone: '13800138000', licensePlate: '辽A12345',
  variety: '中科发5', appointmentDate: '2026-06-01', appointmentTime: '09:00', remark: '测试',
}

beforeEach(() => {
  getDb().exec('DELETE FROM appointments')
  getDb().exec('DELETE FROM counters')
})

describe('createAppointment', () => {
  it('creates an appointment and returns it with an appointmentNo', () => {
    const appt = svc.createAppointment(validInput) as any
    expect(appt).toBeTruthy()
    expect(appt.id).toBeTruthy()
    expect(appt.appointmentNo).toMatch(/^\d{11}$/)
    expect(appt.driverName).toBe('张三')
    expect(appt.status).toBe('pending')
  })
})

describe('generateAppointmentNo', () => {
  it('generates sequential numbers for the same day', () => {
    const n1 = svc.generateAppointmentNo()
    const n2 = svc.generateAppointmentNo()
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    expect(n1).toMatch(new RegExp(`^${day}\\d{3}$`))
    const seq2 = parseInt(n2.slice(-3), 10)
    const seq1 = parseInt(n1.slice(-3), 10)
    expect(seq2).toBe(seq1 + 1)
  })
})

describe('getAppointmentById', () => {
  it('returns null for non-existent id', () => {
    expect(svc.getAppointmentById('nonexistent')).toBeUndefined()
  })
  it('returns the appointment after creation', () => {
    const created = svc.createAppointment(validInput) as any
    const found = svc.getAppointmentById(created.id) as any
    expect(found).toBeTruthy()
    expect(found.id).toBe(created.id)
  })
})

describe('getAppointmentByNo', () => {
  it('finds by appointment number', () => {
    const created = svc.createAppointment(validInput) as any
    const found = svc.getAppointmentByNo(created.appointmentNo) as any
    expect(found).toBeTruthy()
    expect(found.appointmentNo).toBe(created.appointmentNo)
  })
})

describe('queryAppointment', () => {
  it('finds matching appointments by phone + no', () => {
    const created = svc.createAppointment(validInput) as any
    const result = svc.queryAppointment('13800138000', created.appointmentNo) as any
    expect(result).toBeTruthy()
    expect(result.id).toBe(created.id)
  })
  it('returns null for non-matching query', () => {
    expect(svc.queryAppointment('13900000000', '000000000001')).toBeNull()
  })
})

describe('updateStatus', () => {
  it('transitions from pending to token_assigned', () => {
    const appt = svc.createAppointment(validInput) as any
    const result = svc.updateStatus(appt.id, 'token_assigned', { tokenNo: 'A001' })
    expect((result as any).error).toBeUndefined()
    expect((result as any).status).toBe('token_assigned')
    expect((result as any).tokenNo).toBe('A001')
  })
  it('rejects invalid transition', () => {
    const appt = svc.createAppointment(validInput) as any
    const result = svc.updateStatus(appt.id, 'completed')
    expect((result as any).error).toBe('INVALID_STATUS')
  })
  it('rejects transition for non-existent appointment', () => {
    const result = svc.updateStatus('nonexistent', 'cancelled')
    expect((result as any).error).toBe('NOT_FOUND')
  })
})

describe('listAppointments', () => {
  it('returns paginated results', () => {
    svc.createAppointment(validInput)
    svc.createAppointment({ ...validInput, phone: '13900139000', licensePlate: '吉B67890' })
    const result = svc.listAppointments({ page: 1, pageSize: 10 })
    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(2)
  })
  it('filters by status', () => {
    const a1 = svc.createAppointment(validInput) as any
    svc.updateStatus(a1.id, 'token_assigned', { tokenNo: 'A001' })
    const result = svc.listAppointments({ page: 1, pageSize: 10, status: 'pending' })
    expect(result.items.every((i: any) => i.status === 'pending')).toBe(true)
  })
  it('filters by keyword', () => {
    svc.createAppointment(validInput)
    svc.createAppointment({ ...validInput, driverName: '李四', phone: '13900139000' })
    const result = svc.listAppointments({ page: 1, pageSize: 10, keyword: '李四' })
    expect(result.total).toBe(1)
    expect((result.items[0] as any).driverName).toBe('李四')
  })
})

describe('getCallNextAppointment', () => {
  it('returns null when queue is empty', () => {
    expect(svc.getCallNextAppointment()).toBeNull()
  })
  it('returns the next waiting appointment ordered by queuedAt', () => {
    const a1 = svc.createAppointment({ ...validInput, driverName: 'A', phone: '13800138001' }) as any
    svc.updateStatus(a1.id, 'token_assigned', { tokenNo: 'T1' })
    svc.updateStatus(a1.id, 'waiting', { queuedAt: '2026-06-01T09:00:00Z' })
    const a2 = svc.createAppointment({ ...validInput, driverName: 'B', phone: '13800138002' }) as any
    svc.updateStatus(a2.id, 'token_assigned', { tokenNo: 'T2' })
    svc.updateStatus(a2.id, 'waiting', { queuedAt: '2026-06-01T08:00:00Z' })
    const next = svc.getCallNextAppointment() as any
    expect(next).toBeTruthy()
    expect(next.driverName).toBe('B')
  })
})
