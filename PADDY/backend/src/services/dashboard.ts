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

function formatComparison(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '↑ 100%' : '→ 0%'
  const diff = ((current - previous) / previous) * 100
  const sign = diff > 0 ? '↑' : diff < 0 ? '↓' : '→'
  return `${sign} ${Math.abs(Math.round(diff))}%`
}

function shiftHour(time: string): string {
  const [h, m] = time.split(':').map(Number)
  return `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function getDashboardDetail() {
  const db = getDb()
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const todayStats = db.prepare(`
    SELECT COUNT(*) as total,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status IN ('waiting','called') THEN 1 ELSE 0 END) as queueing
    FROM appointments WHERE appointmentDate = ?
  `).get(today) as any

  const total = todayStats.total || 0
  const completed = todayStats.completed || 0
  const cancelled = todayStats.cancelled || 0
  const queueing = todayStats.queueing || 0

  const yesterdayTotals = db.prepare(`
    SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
    FROM appointments WHERE appointmentDate = ?
  `).get(yesterday) as any

  const dailyTrend: { date: string; count: number; isToday?: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const ds = d.toISOString().slice(0, 10)
    const row = db.prepare('SELECT COUNT(*) as cnt FROM appointments WHERE appointmentDate = ?').get(ds) as any
    dailyTrend.push({ date: `${d.getMonth() + 1}/${d.getDate()}`, count: row.cnt || 0, isToday: i === 0 })
  }

  const varieties = db.prepare(
    'SELECT variety, COUNT(*) as cnt FROM appointments WHERE appointmentDate = ? GROUP BY variety ORDER BY cnt DESC'
  ).all(today) as any[]
  const totalVariety = varieties.reduce((s: number, v: any) => s + v.cnt, 0) || 1
  const colors = ['#FF6600', '#ff9800', '#2196f3', '#9c27b0', '#4caf50', '#e91e63']
  const varietyDistribution = varieties.map((v: any, i: number) => ({
    variety: v.variety, percentage: Math.round((v.cnt / totalVariety) * 100), color: colors[i % colors.length],
  }))

  const recent = db.prepare(`
    SELECT licensePlate, status, createdAt, queuedAt, calledAt, cancelReason, driverName
    FROM appointments WHERE appointmentDate = ?
    ORDER BY COALESCE(calledAt, queuedAt, createdAt) DESC LIMIT 10
  `).all(today) as any[]
  const activityMap: Record<string, string> = {
    completed: '完成扦样', cancelled: '已取消', called: '扦样中', waiting: '排队中',
    token_assigned: '已取号', pending: '待取号',
  }
  const operationLogs = recent.map((a: any) => {
    let activity = activityMap[a.status] || a.status
    if (a.status === 'cancelled' && a.cancelReason) activity += `(${a.cancelReason})`
    const ts = a.calledAt || a.queuedAt || a.createdAt
    return { datetime: ts ? ts.replace('T', ' ').slice(0, 16) : '', licensePlate: a.licensePlate, activity, operator: a.driverName }
  })

  const avgRow = db.prepare(`
    SELECT AVG(CASE WHEN calledAt IS NOT NULL AND queuedAt IS NOT NULL
      THEN (julianday(calledAt) - julianday(queuedAt)) * 1440 ELSE NULL END) as sampling,
      AVG(CASE WHEN queuedAt IS NOT NULL
      THEN (julianday(queuedAt) - julianday(createdAt)) * 1440 ELSE NULL END) as wait
    FROM appointments WHERE appointmentDate = ? AND status IN ('called','completed')
  `).get(today) as any

  const peak = db.prepare(
    'SELECT appointmentTime, COUNT(*) as cnt FROM appointments WHERE appointmentDate = ? GROUP BY appointmentTime ORDER BY cnt DESC LIMIT 1'
  ).get(today) as any
  const peakHours = peak ? `${peak.appointmentTime}-${shiftHour(peak.appointmentTime)}` : '08:00-10:00'

  return {
    todayAppointments: total,
    completedCount: completed,
    queueingCount: queueing,
    cancelledCount: cancelled,
    cancelRate: total > 0 ? `${((cancelled / total) * 100).toFixed(1)}%` : '0%',
    dailyTrend,
    varietyDistribution,
    operationLogs,
    avgSamplingTime: Math.round(avgRow.sampling || 0),
    avgWaitTime: Math.round(avgRow.wait || 0),
    peakHours,
    passRate: completed > 0 ? Math.round((completed / (completed + cancelled || 1)) * 100) : 100,
    yesterdayComparison: {
      appointments: formatComparison(total, yesterdayTotals.total || 0),
      completed: formatComparison(completed, yesterdayTotals.completed || 0),
    },
  }
}
