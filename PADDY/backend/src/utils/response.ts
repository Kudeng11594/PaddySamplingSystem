import { Context } from 'hono'

import type { ContentfulStatusCode } from 'hono/utils/http-status'

export function success(c: Context, data: any, status: ContentfulStatusCode = 200) {
  return c.json({ success: true, data }, status)
}

export function successMsg(c: Context, message: string = '操作成功') {
  return c.json({ success: true, data: null, message })
}

export function successList(c: Context, items: any[], total: number, page: number, pageSize: number) {
  return c.json({ success: true, data: { items, total, page, pageSize } })
}

export function error(c: Context, code: string, message: string, status: ContentfulStatusCode = 400, details?: any) {
  return c.json({ success: false, error: { code, message, ...(details ? { details } : {}) } }, status)
}
