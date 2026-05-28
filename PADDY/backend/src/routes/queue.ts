import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'
import * as queueService from '../services/queue.js'

const router = new Hono()

router.get('/my-position', async (c) => {
  const appointmentNo = c.req.query('appointmentNo')
  if (!appointmentNo) return error(c, 'VALIDATION_ERROR', '预约编号不能为空')
  const result = queueService.getMyPosition(appointmentNo)
  if (!result) return error(c, 'NOT_FOUND', '未找到该预约或未在排队中', 404)
  return success(c, result)
})

router.get('/', authMiddleware, roleGuard('operator', 'manager', 'admin'), async (c) => {
  return success(c, queueService.getQueue())
})

export default router
