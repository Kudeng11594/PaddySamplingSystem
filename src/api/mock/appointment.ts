import type { Appointment, CreateAppointmentRequest, QueryAppointmentRequest, ListAppointmentsParams, PaginatedData, AssignTokenRequest, CompleteSamplingRequest, CancelRequest, CancelByDriverRequest } from '../types'
import { appointments } from './state'

let nextSeq = appointments.length + 1
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')

function findOrThrow(id: string) {
  const a = appointments.find(x => x._id === id)
  if (!a) throw { code: 'NOT_FOUND', message: '预约不存在', status: 404 }
  return a
}

function update(id: string, updates: Partial<Appointment>) {
  const idx = appointments.findIndex(x => x._id === id)
  appointments[idx] = { ...appointments[idx], ...updates }
  return appointments[idx]
}

export function mockCreateAppointment(data: CreateAppointmentRequest) {
  const appt: Appointment = {
    _id: String(Date.now()), appointmentNo: `${today}${String(nextSeq++).padStart(3, '0')}`,
    ...data, remark: data.remark || '', status: 'pending', tokenNo: '', createdAt: new Date().toISOString(),
  }
  appointments.unshift(appt); return appt
}

export function mockQueryAppointment(data: QueryAppointmentRequest) {
  const appt = appointments.find(a => a.phone === data.phone && a.appointmentNo === data.appointmentNo)
  if (!appt) throw { code: 'NOT_FOUND', message: '未找到匹配的记录', status: 404 }
  if (appt.status === 'waiting') {
    const pos = appointments.filter(a => a.status === 'waiting' && a.queuedAt! < appt.queuedAt!).length
    return { ...appt, queuePosition: pos + 1 }
  }
  return appt
}

export function mockListAppointments(params: ListAppointmentsParams): PaginatedData<Appointment> {
  let f = [...appointments]
  if (params.status) f = f.filter(a => a.status === params.status)
  if (params.keyword) { const kw = params.keyword.toLowerCase(); f = f.filter(a => a.driverName.includes(kw) || a.phone.includes(kw) || a.licensePlate.includes(kw)) }
  const total = f.length; const page = params.page || 1; const ps = params.pageSize || 20
  return { items: f.slice((page - 1) * ps, page * ps), total, page, pageSize: ps }
}

export function mockGetAppointment(id: string) { return findOrThrow(id) }

export function mockAssignToken(id: string, data: AssignTokenRequest) {
  const a = findOrThrow(id)
  if (a.status !== 'pending') throw { code: 'INVALID_STATUS', message: '当前状态不允许分配令牌', status: 409 }
  return update(id, { status: 'token_assigned', tokenNo: data.tokenNo })
}

export function mockCheckIn(id: string) {
  const a = findOrThrow(id)
  if (a.status !== 'token_assigned') throw { code: 'INVALID_STATUS', message: '当前状态不允许签到入队', status: 409 }
  return update(id, { status: 'waiting', queuedAt: new Date().toISOString() })
}

export function mockCall(id: string) {
  const a = findOrThrow(id)
  if (a.status !== 'waiting') throw { code: 'INVALID_STATUS', message: '当前状态不允许叫号', status: 409 }
  return update(id, { status: 'called', calledAt: new Date().toISOString() })
}

export function mockComplete(id: string, data: CompleteSamplingRequest) {
  const a = findOrThrow(id)
  if (a.status !== 'called') throw { code: 'INVALID_STATUS', message: '当前状态不允许录入结果', status: 409 }
  return update(id, { status: 'completed', moisture: data.moisture, riceYield: data.riceYield })
}

export function mockCancel(id: string, data: CancelRequest) {
  const a = findOrThrow(id)
  if (a.status === 'completed') throw { code: 'INVALID_STATUS', message: '已完成预约不可取消', status: 409 }
  return update(id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: data.reason, cancelBy: 'operator' })
}

export function mockCancelByDriver(id: string, data: CancelByDriverRequest) {
  const a = findOrThrow(id)
  if (a.phone !== data.phone) throw { code: 'FORBIDDEN', message: '手机号与预约不匹配', status: 403 }
  if (a.status !== 'pending') throw { code: 'INVALID_STATUS', message: '当前状态不允许取消', status: 409 }
  return update(id, { status: 'cancelled', cancelledAt: new Date().toISOString(), cancelReason: data.reason || '司机取消', cancelBy: 'driver' })
}

export function mockSkip(id: string) {
  const a = findOrThrow(id)
  if (a.status !== 'waiting') throw { code: 'INVALID_STATUS', message: '只有等待中的预约可以跳过', status: 409 }
  return update(id, { queuedAt: new Date().toISOString() })
}
