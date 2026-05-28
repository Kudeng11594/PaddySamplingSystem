import { Context, Next } from 'hono'
import { error } from '../utils/response.js'

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next()
  } catch (e: any) {
    console.error('Unhandled error:', e)
    return error(c, 'INTERNAL_ERROR', '服务器内部错误', 500)
  }
}
