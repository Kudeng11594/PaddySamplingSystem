import type { DashboardData } from '../types'
import { appointments } from './state'

export function mockGetTodayDashboard(): DashboardData {
  const today = new Date().toISOString().slice(0, 10)
  const t = appointments.filter(a => a.appointmentDate === today)
  return {
    totalAppointments: t.length, waitingCount: t.filter(a => a.status === 'waiting').length,
    completedCount: t.filter(a => a.status === 'completed').length,
    cancelledCount: t.filter(a => a.status === 'cancelled').length,
    lastUpdated: new Date().toISOString(),
  }
}
