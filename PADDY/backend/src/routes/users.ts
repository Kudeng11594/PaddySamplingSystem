import { Hono } from 'hono'
import { authMiddleware, roleGuard } from '../middleware/auth.js'
import { success, successMsg, error } from '../utils/response.js'
import { validatePassword, validateRole } from '../utils/validation.js'
import * as userService from '../services/user.js'

const router = new Hono()
router.use('/*', authMiddleware, roleGuard('admin'))

router.get('/', async (c) => success(c, userService.listUsers()))

router.post('/', async (c) => {
  const { username, password, role } = await c.req.json()
  if (!username || !password || !role) return error(c, 'VALIDATION_ERROR', '用户名、密码和角色不能为空')
  const pErr = validatePassword(password); if (pErr) return error(c, 'VALIDATION_ERROR', pErr)
  const rErr = validateRole(role); if (rErr) return error(c, 'VALIDATION_ERROR', rErr)
  const result = userService.createUser(username, password, role)
  if ((result as any).error === 'DUPLICATE_USERNAME') return error(c, 'DUPLICATE_USERNAME', '用户名已存在', 409)
  return success(c, result, 201)
})

router.delete('/:id', async (c) => {
  const ok = userService.deleteUser(c.req.param('id'))
  if (!ok) return error(c, 'NOT_FOUND', '用户不存在', 404)
  return successMsg(c, '用户已删除')
})

router.post('/:id/reset-password', async (c) => {
  const id = c.req.param('id'); const { newPassword } = await c.req.json()
  if (!newPassword) return error(c, 'VALIDATION_ERROR', '新密码不能为空')
  const pErr = validatePassword(newPassword); if (pErr) return error(c, 'VALIDATION_ERROR', pErr)
  const ok = userService.resetPassword(id, newPassword)
  if (!ok) return error(c, 'NOT_FOUND', '用户不存在', 404)
  return successMsg(c, '密码已重置')
})

export default router
