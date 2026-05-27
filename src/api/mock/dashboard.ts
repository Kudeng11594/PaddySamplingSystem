import type { DashboardData, DashboardDetail } from '../types'
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

export function mockGetDashboardDetail(): DashboardDetail {
  return {
    todayAppointments: 12,
    completedCount: 8,
    queueingCount: 3,
    cancelledCount: 1,
    cancelRate: '8.3%',
    dailyTrend: [
      { date: '5/16', count: 6 },
      { date: '5/17', count: 5 },
      { date: '5/18', count: 8 },
      { date: '5/19', count: 7 },
      { date: '5/20', count: 6 },
      { date: '5/21', count: 9 },
      { date: '5/22', count: 10, isToday: true },
    ],
    varietyDistribution: [
      { variety: '中科发5', percentage: 42, color: '#FF6600' },
      { variety: '吉宏6', percentage: 25, color: '#ff9800' },
      { variety: '鲜食玉米', percentage: 17, color: '#2196f3' },
      { variety: '杂粮', percentage: 16, color: '#9c27b0' },
    ],
    operationLogs: [
      { datetime: '2026-05-22 08:30', licensePlate: '辽A12345', activity: '完成扦样', operator: 'op01' },
      { datetime: '2026-05-22 08:45', licensePlate: '辽B67890', activity: '开始扦样', operator: 'op01' },
      { datetime: '2026-05-22 09:00', licensePlate: '辽C13579', activity: '到厂取号', operator: '系统' },
      { datetime: '2026-05-22 09:15', licensePlate: '辽D24680', activity: '已取消', operator: '司机' },
    ],
    avgSamplingTime: 12,
    avgWaitTime: 18,
    peakHours: '09:00-11:00',
    passRate: 95,
    yesterdayComparison: { appointments: '↑ 20%', completed: '↑ 33%' },
  }
}
