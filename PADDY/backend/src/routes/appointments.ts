import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success, successList, successMsg, error } from '../utils/response.js'
import { validateAppointmentInput, validateMoisture, validateRiceYield } from '../utils/validation.js'
import * as svc from '../services/appointment.js'

const router = new Hono()

router.post('/', async (c) => {
  const body = await c.req.json()
  const errors = validateAppointmentInput(body)
  if (errors.length > 0) return error(c, 'VALIDATION_ERROR', '参数校验失败', 400, errors)
  return success(c, svc.createAppointment(body), 201)
})

router.post('/query', async (c) => {
  const { phone, appointmentNo } = await c.req.json()
  if (!phone || !appointmentNo) return error(c, 'VALIDATION_ERROR', '手机号和预约编号不能为空')
  const appt = svc.queryAppointment(phone, appointmentNo)
  if (!appt) return error(c, 'NOT_FOUND', '未找到匹配的记录', 404)
  return success(c, appt)
})

router.post('/:id/cancel-by-driver', async (c) => {
  const id = c.req.param('id')!
  const { phone, reason } = await c.req.json()
  const appt = svc.getAppointmentById(id)
  if (!appt) return error(c, 'NOT_FOUND', '预约不存在', 404)
  if ((appt as any).phone !== phone) return error(c, 'FORBIDDEN', '手机号与预约不匹配', 403)
  if ((appt as any).status !== 'pending') return error(c, 'INVALID_STATUS', '当前状态不允许取消', 409)
  const now = new Date().toISOString()
  return success(c, svc.updateStatus(id, 'cancelled', { cancelledAt: now, cancelReason: reason || '司机取消', cancelBy: 'driver' }))
})

router.use('/*', authMiddleware)

router.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const pageSize = parseInt(c.req.query('pageSize') || '20')
  const result = svc.listAppointments({ page, pageSize, status: c.req.query('status'), keyword: c.req.query('keyword'), sortBy: c.req.query('sortBy'), sortOrder: c.req.query('sortOrder') })
  return successList(c, result.items, result.total, result.page, result.pageSize)
})

router.get('/:id', async (c) => {
  const appt = svc.getAppointmentById(c.req.param('id')!)
  if (!appt) return error(c, 'NOT_FOUND', '预约不存在', 404)
  return success(c, appt)
})

router.post('/:id/assign-token', roleGuard('operator', 'admin'), async (c) => {
  const id = c.req.param('id')!; const { tokenNo } = await c.req.json()
  if (!tokenNo) return error(c, 'VALIDATION_ERROR', '令牌号不能为空')
  const result = svc.updateStatus(id, 'token_assigned', { tokenNo })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许分配令牌', 409)
  return success(c, result)
})

router.post('/:id/check-in', roleGuard('operator', 'admin'), async (c) => {
  const result = svc.updateStatus(c.req.param('id')!, 'waiting', { queuedAt: new Date().toISOString() })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许签到入队', 409)
  return success(c, result)
})

router.post('/:id/call', roleGuard('operator', 'admin'), async (c) => {
  const result = svc.updateStatus(c.req.param('id')!, 'called', { calledAt: new Date().toISOString() })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许叫号', 409)
  return success(c, result)
})

router.post('/:id/complete', roleGuard('operator', 'admin'), async (c) => {
  const id = c.req.param('id')!; const { moisture, riceYield } = await c.req.json()
  if (moisture === undefined || riceYield === undefined) return error(c, 'VALIDATION_ERROR', '水分和出米率不能为空')
  const mErr = validateMoisture(moisture); if (mErr) return error(c, 'VALIDATION_ERROR', mErr)
  const rErr = validateRiceYield(riceYield); if (rErr) return error(c, 'VALIDATION_ERROR', rErr)
  const result = svc.updateStatus(id, 'completed', { moisture, riceYield })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许录入结果', 409)
  const next = svc.getCallNextAppointment()
  if (next) svc.updateStatus(next.id, 'called', { calledAt: new Date().toISOString() })
  return success(c, result)
})

router.post('/:id/cancel', roleGuard('operator', 'admin'), async (c) => {
  const { reason } = await c.req.json()
  if (!reason) return error(c, 'VALIDATION_ERROR', '取消原因不能为空')
  const result = svc.updateStatus(c.req.param('id')!, 'cancelled', { cancelledAt: new Date().toISOString(), cancelReason: reason, cancelBy: 'operator' })
  if (result.error === 'NOT_FOUND') return error(c, 'NOT_FOUND', '预约不存在', 404)
  if (result.error === 'INVALID_STATUS') return error(c, 'INVALID_STATUS', '当前状态不允许取消', 409)
  return success(c, result)
})

router.post('/:id/skip', roleGuard('operator', 'admin'), async (c) => {
  const id = c.req.param('id')!; const appt = svc.getAppointmentById(id)
  if (!appt) return error(c, 'NOT_FOUND', '预约不存在', 404)
  if ((appt as any).status !== 'waiting') return error(c, 'INVALID_STATUS', '只有等待中的预约可以跳过', 409)
  const { getDb } = await import('../db/index.js')
  getDb().prepare('UPDATE appointments SET queuedAt = ? WHERE id = ?').run(new Date().toISOString(), id)
  return success(c, { ...svc.getAppointmentById(id), message: '已移至队尾' })
})

export default router
