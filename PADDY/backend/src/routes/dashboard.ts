import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success } from '../utils/response.js'
import { getTodayDashboard } from '../services/dashboard.js'

const router = new Hono()

router.get('/today', authMiddleware, roleGuard('manager', 'admin', 'operator'), async (c) => {
  return success(c, getTodayDashboard())
})

export default router
