import type { Appointment, User } from '../types'

export const mockAppointments: Appointment[] = [
  { _id: '1', appointmentNo: '20260522001', driverName: '张三', phone: '13800138000',
    licensePlate: '辽A12345', variety: '中科发5', appointmentDate: '2026-05-22',
    appointmentTime: '08:30', remark: '', status: 'pending', tokenNo: '',
    createdAt: '2026-05-22T06:00:00Z' },
  { _id: '2', appointmentNo: '20260522002', driverName: '李四', phone: '13900139000',
    licensePlate: '吉B67890', variety: '吉宏6', appointmentDate: '2026-05-22',
    appointmentTime: '09:00', remark: '第一次送粮', status: 'token_assigned', tokenNo: 'A001',
    createdAt: '2026-05-22T06:30:00Z' },
  { _id: '3', appointmentNo: '20260522003', driverName: '王五', phone: '13700137000',
    licensePlate: '黑C11111', variety: '鲜食玉米', appointmentDate: '2026-05-22',
    appointmentTime: '09:30', remark: '', status: 'waiting', tokenNo: 'A002',
    createdAt: '2026-05-22T07:00:00Z', queuedAt: '2026-05-22T08:00:00Z' },
  { _id: '4', appointmentNo: '20260522004', driverName: '赵六', phone: '13600136000',
    licensePlate: '辽D22222', variety: '杂粮', appointmentDate: '2026-05-22',
    appointmentTime: '10:00', remark: '', status: 'called', tokenNo: 'A003',
    createdAt: '2026-05-22T07:30:00Z', queuedAt: '2026-05-22T08:15:00Z',
    calledAt: '2026-05-22T09:00:00Z' },
  { _id: '5', appointmentNo: '20260522005', driverName: '钱七', phone: '13500135000',
    licensePlate: '蒙E33333', variety: '中科发5', appointmentDate: '2026-05-22',
    appointmentTime: '10:30', remark: '', status: 'completed', tokenNo: 'A004',
    moisture: 14.5, riceYield: 60.2,
    createdAt: '2026-05-22T08:00:00Z', queuedAt: '2026-05-22T08:30:00Z',
    calledAt: '2026-05-22T09:15:00Z' },
  { _id: '6', appointmentNo: '20260521001', driverName: '孙八', phone: '13400134000',
    licensePlate: '辽F44444', variety: '吉宏6', appointmentDate: '2026-05-21',
    appointmentTime: '14:00', remark: '取消', status: 'cancelled', tokenNo: 'A005',
    createdAt: '2026-05-21T06:00:00Z', cancelledAt: '2026-05-21T11:00:00Z',
    cancelReason: '司机迟到', cancelBy: 'operator' },
]

export const mockUsers: User[] = [
  { id: 'u1', username: 'admin', role: 'admin', createdAt: '2026-05-01T00:00:00Z' },
  { id: 'u2', username: 'op01', role: 'operator', createdAt: '2026-05-01T00:00:00Z' },
  { id: 'u3', username: 'op02', role: 'operator', createdAt: '2026-05-02T00:00:00Z' },
  { id: 'u4', username: 'manager01', role: 'manager', createdAt: '2026-05-03T00:00:00Z' },
]

export const mockTokens = {
  accessToken: 'mock-access-token-for-testing',
  refreshToken: 'mock-refresh-token-for-testing',
}

export const mockDashboardDetail = {
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

export const mockQueueBoardDisplay = {
  currentSampling: {
    id: 2, tokenNumber: 'A002', licensePlate: '辽B67890',
    driverName: '李师傅', variety: '吉宏6', waitTimeMinutes: 5, status: 'sampling',
  },
  nextInLine: {
    id: 3, tokenNumber: 'A003', licensePlate: '辽C13579',
    driverName: '王师傅', variety: '鲜食玉米', waitTimeMinutes: 15, status: 'called',
  },
  waitingQueue: [
    { id: 4, tokenNumber: 'A004', licensePlate: '辽D24680', driverName: '赵师傅', variety: '杂粮', waitTimeMinutes: 35, status: 'waiting' },
    { id: 5, tokenNumber: 'A005', licensePlate: '辽E13579', driverName: '孙师傅', variety: '中科发5', waitTimeMinutes: 20, status: 'waiting' },
    { id: 6, tokenNumber: 'A006', licensePlate: '辽F97531', driverName: '周师傅', variety: '中科发5', waitTimeMinutes: 10, status: 'waiting' },
  ],
  todayStats: { totalAppointments: 12, completed: 8, queueing: 3, cancelled: 1 },
  avgWaitTime: 18,
  peakHours: '09:00 - 11:00',
}

export const mockQueueList = [
  { rank: 1, plate: '辽B67890', driver: '李师傅', wait: '5min' },
  { rank: 2, plate: '辽C13579', driver: '王师傅', wait: '15min' },
  { rank: 3, plate: '辽D24680', driver: '赵师傅', wait: '35min' },
]

export const mockVarieties = ['中科发5', '吉宏6', '鲜食玉米', '杂粮']
