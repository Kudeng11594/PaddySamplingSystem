export { mockLogin as login, mockRefresh as refresh } from './auth'
export {
  mockCreateAppointment as createAppointment,
  mockQueryAppointment as queryAppointment,
  mockListAppointments as listAppointments,
  mockGetAppointment as getAppointment,
  mockAssignToken as assignToken,
  mockCheckIn as checkIn,
  mockCall as callAppointment,
  mockComplete as completeSampling,
  mockCancel as cancelAppointment,
  mockCancelByDriver as cancelByDriver,
  mockSkip as skipAppointment,
} from './appointment'
export { mockGetQueue as getQueue, mockGetMyPosition as getMyPosition } from './queue'
export { mockGetTodayDashboard as getTodayDashboard, mockGetDashboardDetail as getDashboardDetail } from './dashboard'
import { mockUsers, mockVarieties } from './data'
import { resetState } from './state'
export { resetState }
export const resetMockData = resetState
export function getVarieties(): string[] { return [...mockVarieties] }

export function listUsers(): { items: typeof mockUsers; total: number } {
  return { items: mockUsers, total: mockUsers.length }
}
export function createUser(): { id: string; username: string; role: string } {
  return { id: 'mock-new', username: 'new-user', role: 'operator' }
}
export function deleteUser(): void { /* no-op */ }
export function resetPassword(): void { /* no-op */ }
