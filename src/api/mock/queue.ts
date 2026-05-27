import type { QueueBoard, MyPosition } from '../types'
import { appointments } from './state'

export function mockGetQueue(): QueueBoard {
  const waiting = appointments.filter(a => a.status === 'waiting').sort((a, b) => new Date(a.queuedAt!).getTime() - new Date(b.queuedAt!).getTime())
  const current = appointments.find(a => a.status === 'called') || null
  return {
    queue: waiting.map((a, i) => ({
      position: i + 1, appointmentId: a._id, appointmentNo: a.appointmentNo,
      driverName: a.driverName, licensePlate: a.licensePlate, tokenNo: a.tokenNo, queuedAt: a.queuedAt!,
    })),
    waitingCount: waiting.length,
    currentServing: current ? { appointmentId: current._id, appointmentNo: current.appointmentNo, driverName: current.driverName } : null,
  }
}

export function mockGetMyPosition(appointmentNo: string): MyPosition | null {
  const a = appointments.find(x => x.appointmentNo === appointmentNo)
  if (!a || (a.status !== 'waiting' && a.status !== 'called' && a.status !== 'completed')) return null
  const r: MyPosition = { status: a.status }
  if (a.status === 'waiting') {
    const ahead = appointments.filter(x => x.status === 'waiting' && x.queuedAt! < a.queuedAt!).length
    r.position = ahead + 1; r.waitingAhead = ahead
  }
  return r
}
