import { Context, Next } from 'hono'
import { verifyToken } from '../utils/jwt.js'
import { error } from '../utils/response.js'

export async function authMiddleware(c: Context, next: Next) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return error(c, 'TOKEN_INVALID', '未提供有效的认证令牌', 401)
  }
  try {
    const token = auth.slice(7)
    const payload = await verifyToken(token)
    if (payload.type === 'refresh') {
      return error(c, 'TOKEN_INVALID', '请使用 accessToken', 401)
    }
    c.set('user', { id: payload.sub, role: payload.role })
    await next()
  } catch (e: any) {
    if (e.name === 'JwtTokenExpired') {
      return error(c, 'TOKEN_EXPIRED', 'token 已过期', 401)
    }
    return error(c, 'TOKEN_INVALID', 'token 无效', 401)
  }
}

export function roleGuard(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as { id: string; role: string }
    if (!roles.includes(user.role)) {
      return error(c, 'FORBIDDEN', '无权限执行此操作', 403)
    }
    await next()
  }
}
