import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success } from '../utils/response.js'
import { getTodayDashboard, getDashboardDetail } from '../services/dashboard.js'

const router = new Hono()

router.get('/today', authMiddleware, roleGuard('manager', 'admin', 'operator'), async (c) => {
  return success(c, getTodayDashboard())
})

router.get('/detail', authMiddleware, roleGuard('manager', 'admin'), async (c) => {
  return success(c, getDashboardDetail())
})

export default router
