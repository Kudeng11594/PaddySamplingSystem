import { Hono } from 'hono'
import { login, refreshTokens } from '../services/auth.js'
import { success, error } from '../utils/response.js'

const authRouter = new Hono()

authRouter.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) return error(c, 'VALIDATION_ERROR', '用户名和密码不能为空')
  const result = await login(username, password)
  if (!result) return error(c, 'INVALID_CREDENTIALS', '用户名或密码错误', 401)
  return success(c, result)
})

authRouter.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json()
  if (!refreshToken) return error(c, 'VALIDATION_ERROR', 'refreshToken 不能为空')
  const result = await refreshTokens(refreshToken)
  if (!result) return error(c, 'TOKEN_EXPIRED', 'refresh token 已过期，请重新登录', 401)
  return success(c, result)
})

export default authRouter
