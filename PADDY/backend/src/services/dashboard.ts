import { getDb } from '../db/index.js'

export function getTodayDashboard() {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  const stats = db.prepare(`
    SELECT COUNT(*) as totalAppointments,
      SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waitingCount,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedCount,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledCount
    FROM appointments WHERE appointmentDate = ?
  `).get(today) as any
  return {
    totalAppointments: stats.totalAppointments || 0,
    waitingCount: stats.waitingCount || 0,
    completedCount: stats.completedCount || 0,
    cancelledCount: stats.cancelledCount || 0,
    lastUpdated: new Date().toISOString(),
  }
}
