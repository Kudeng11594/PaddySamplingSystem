import { getDb } from '../db/index.js'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, verifyToken } from '../utils/jwt.js'

export async function login(username: string, password: string) {
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
  if (!user || !bcrypt.compareSync(password, user.password)) return null
  const payload = { sub: user.id, role: user.role }
  const accessToken = await signAccessToken(payload)
  const refreshToken = await signRefreshToken(payload)
  return { accessToken, refreshToken, user: { id: user.id, username: user.username, role: user.role } }
}

export async function refreshTokens(refreshTokenStr: string) {
  let payload: any
  try { payload = await verifyToken(refreshTokenStr) } catch { return null }
  if (payload.type !== 'refresh') return null
  const db = getDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub) as any
  if (!user) return null
  const newPayload = { sub: user.id, role: user.role }
  const accessToken = await signAccessToken(newPayload)
  const refreshToken = await signRefreshToken(newPayload)
  return { accessToken, refreshToken }
}
