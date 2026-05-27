export { mockLogin, mockRefresh } from './auth'
export { mockLogin as login, mockRefresh as refresh } from './auth'
export {
  mockCreateAppointment, mockQueryAppointment, mockListAppointments, mockGetAppointment,
  mockAssignToken, mockCheckIn, mockCall, mockComplete, mockCancel, mockCancelByDriver, mockSkip,
} from './appointment'
export {
  mockCreateAppointment as createAppointment, mockQueryAppointment as queryAppointment,
  mockListAppointments as listAppointments, mockGetAppointment as getAppointment,
  mockAssignToken as assignToken, mockCheckIn as checkIn, mockCall as callAppointment,
  mockComplete as completeSampling, mockCancel as cancelAppointment,
  mockCancelByDriver as cancelByDriver, mockSkip as skipAppointment,
} from './appointment'
export { mockGetQueue, mockGetMyPosition } from './queue'
export { mockGetQueue as getQueue, mockGetMyPosition as getMyPosition } from './queue'
export { mockGetTodayDashboard } from './dashboard'
export { mockGetTodayDashboard as getTodayDashboard } from './dashboard'
import { mockUsers } from './data'
import { resetState } from './state'
export { resetState }
export const resetMockData = resetState

export function mockListUsers(): { items: typeof mockUsers; total: number } { return { items: mockUsers, total: mockUsers.length } }
export const listUsers = mockListUsers

export function mockCreateUser(): { id: string; username: string; role: string } {
  return { id: 'mock-new', username: 'new-user', role: 'operator' }
}
export const createUser = mockCreateUser

export function mockDeleteUser(): void { /* no-op */ }
export const deleteUser = mockDeleteUser

export function mockResetPassword(): void { /* no-op */ }
export const resetPassword = mockResetPassword
