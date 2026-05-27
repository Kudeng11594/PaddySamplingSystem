import { describe, it, expect } from 'vitest'
import { mockGetQueue, mockGetMyPosition } from '../../api/mock/queue'
import { appointments } from '../../api/mock/state'

describe('mockGetQueue', () => {
  it('returns queue board with waiting list and current serving', () => {
    const result = mockGetQueue()
    expect(result).toHaveProperty('queue')
    expect(result).toHaveProperty('waitingCount')
    expect(Array.isArray(result.queue)).toBe(true)
  })

  it('each queue item has required fields', () => {
    const result = mockGetQueue()
    for (const item of result.queue) {
      expect(item.appointmentNo).toBeTruthy()
      expect(item.driverName).toBeTruthy()
      expect(item.tokenNo).toBeTruthy()
    }
  })
})

describe('mockGetMyPosition', () => {
  it('returns position for a waiting appointment', () => {
    const waiting = appointments.find(a => a.status === 'waiting')
    if (!waiting) return
    const result = mockGetMyPosition(waiting.appointmentNo)
    expect(result).not.toBeNull()
    expect(result!.status).toBe('waiting')
    expect(result!.position).toBeGreaterThanOrEqual(1)
  })

  it('returns null for unknown appointment number', () => {
    const result = mockGetMyPosition('UNKNOWN')
    expect(result).toBeNull()
  })
})
