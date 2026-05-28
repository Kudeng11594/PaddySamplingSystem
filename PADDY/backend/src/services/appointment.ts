import { getDb } from '../db/index.js'

interface CreateInput {
  driverName: string; phone: string; licensePlate: string; variety: string
  appointmentDate: string; appointmentTime: string; remark?: string
}

export function generateAppointmentNo(): string {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const result = db.prepare(
    'INSERT INTO counters (id, prefix, seq) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET seq = seq + 1 RETURNING seq'
  ).get(`appointment_${today}`, today) as { seq: number }
  return `${today}${String(result.seq).padStart(3, '0')}`
}

export function createAppointment(data: CreateInput) {
  const db = getDb()
  const id = crypto.randomUUID()
  const appointmentNo = generateAppointmentNo()
  const createdAt = new Date().toISOString()
  db.prepare(`
    INSERT INTO appointments (id, appointmentNo, driverName, phone, licensePlate, variety, appointmentDate, appointmentTime, remark, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(id, appointmentNo, data.driverName, data.phone, data.licensePlate, data.variety, data.appointmentDate, data.appointmentTime, data.remark || '', createdAt)
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id)
}

export function getAppointmentById(id: string): any {
  return getDb().prepare('SELECT * FROM appointments WHERE id = ?').get(id)
}

export function getAppointmentByNo(no: string) {
  return getDb().prepare('SELECT * FROM appointments WHERE appointmentNo = ?').get(no)
}

export function queryAppointment(phone: string, appointmentNo: string) {
  const db = getDb()
  const appt = db.prepare('SELECT * FROM appointments WHERE phone = ? AND appointmentNo = ?').get(phone, appointmentNo) as any
  if (!appt) return null
  if (appt.status === 'waiting') {
    const pos = db.prepare("SELECT COUNT(*) as pos FROM appointments WHERE status = 'waiting' AND queuedAt < ?").get(appt.queuedAt) as { pos: number }
    return { ...appt, queuePosition: pos.pos + 1 }
  }
  return appt
}

export function listAppointments(params: {
  page: number; pageSize: number; status?: string; keyword?: string; sortBy?: string; sortOrder?: string
}) {
  const db = getDb()
  const { page, pageSize, status, keyword, sortBy = 'createdAt', sortOrder = 'desc' } = params
  const conditions: string[] = []
  const values: any[] = []
  if (status) { conditions.push('status = ?'); values.push(status) }
  if (keyword) {
    conditions.push('(driverName LIKE ? OR phone LIKE ? OR licensePlate LIKE ?)')
    const kw = `%${keyword}%`; values.push(kw, kw, kw)
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  const allowedSort = ['createdAt', 'appointmentDate', 'appointmentTime']
  const sortField = allowedSort.includes(sortBy!) ? sortBy! : 'createdAt'
  const sortDir = sortOrder === 'asc' ? 'ASC' : 'DESC'
  const countRow = db.prepare(`SELECT COUNT(*) as total FROM appointments ${where}`).get(...values) as { total: number }
  const offset = (page - 1) * pageSize
  const items = db.prepare(`SELECT * FROM appointments ${where} ORDER BY ${sortField} ${sortDir} LIMIT ? OFFSET ?`).all(...values, pageSize, offset)
  return { items, total: countRow.total, page, pageSize }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['token_assigned', 'cancelled'],
  token_assigned: ['waiting', 'cancelled'],
  waiting: ['called', 'token_assigned', 'cancelled'],
  called: ['completed', 'cancelled'],
}

export function updateStatus(id: string, newStatus: string, extra: Record<string, any> = {}): any {
  const db = getDb()
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any
  if (!appt) return { error: 'NOT_FOUND' }
  const allowed = VALID_TRANSITIONS[appt.status]
  if (!allowed || !allowed.includes(newStatus)) return { error: 'INVALID_STATUS', currentStatus: appt.status }
  const updates: string[] = ['status = ?']
  const values: any[] = [newStatus]
  if (extra.tokenNo !== undefined) { updates.push('tokenNo = ?'); values.push(extra.tokenNo) }
  if (extra.queuedAt !== undefined) { updates.push('queuedAt = ?'); values.push(extra.queuedAt) }
  if (extra.calledAt !== undefined) { updates.push('calledAt = ?'); values.push(extra.calledAt) }
  if (extra.moisture !== undefined) { updates.push('moisture = ?'); values.push(extra.moisture) }
  if (extra.riceYield !== undefined) { updates.push('riceYield = ?'); values.push(extra.riceYield) }
  if (extra.cancelledAt !== undefined) { updates.push('cancelledAt = ?'); values.push(extra.cancelledAt) }
  if (extra.cancelReason !== undefined) { updates.push('cancelReason = ?'); values.push(extra.cancelReason) }
  if (extra.cancelBy !== undefined) { updates.push('cancelBy = ?'); values.push(extra.cancelBy) }
  values.push(id)
  db.prepare(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`).run(...values)
  return db.prepare('SELECT * FROM appointments WHERE id = ?').get(id)
}

export function getCallNextAppointment(): any | null {
  return getDb().prepare("SELECT * FROM appointments WHERE status = 'waiting' ORDER BY queuedAt ASC LIMIT 1").get() as any || null
}
