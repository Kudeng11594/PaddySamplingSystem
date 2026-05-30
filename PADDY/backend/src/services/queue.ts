import { getDb } from '../db/index.js'

export function getQueue() {
  const db = getDb()
  const waiting = db.prepare("SELECT * FROM appointments WHERE status = 'waiting' ORDER BY queuedAt ASC").all() as any[]
  const currentServing = db.prepare("SELECT * FROM appointments WHERE status = 'called' ORDER BY calledAt DESC LIMIT 1").get() as any || null
  const queue = waiting.map((a: any, i: number) => ({
    position: i + 1, appointmentId: a.id, appointmentNo: a.appointmentNo,
    driverName: a.driverName, licensePlate: a.licensePlate, tokenNo: a.tokenNo, queuedAt: a.queuedAt,
  }))
  return {
    queue, waitingCount: waiting.length,
    currentServing: currentServing ? {
      appointmentId: currentServing.id, appointmentNo: currentServing.appointmentNo, driverName: currentServing.driverName,
    } : null,
  }
}

export function getMyPosition(appointmentNo: string) {
  const db = getDb()
  const appt = db.prepare('SELECT * FROM appointments WHERE appointmentNo = ?').get(appointmentNo) as any
  if (!appt) return null
  const result: any = { status: appt.status }
  if (appt.status === 'waiting') {
    const pos = db.prepare("SELECT COUNT(*) as cnt FROM appointments WHERE status = 'waiting' AND queuedAt < ?").get(appt.queuedAt) as { cnt: number }
    result.position = pos.cnt + 1; result.waitingAhead = pos.cnt
  }
  return result
}
