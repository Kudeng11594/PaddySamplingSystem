import { mockAppointments as seedData } from './data'
import type { Appointment } from '../types'

export let appointments: Appointment[] = [...seedData]

export function resetState() {
  appointments = [...seedData]
}
