import { sign, verify } from 'hono/jwt'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const ACCESS_EXP = 2 * 60 * 60
const REFRESH_EXP = 7 * 24 * 60 * 60

export interface TokenPayload {
  sub: string
  role: string
}

export async function signAccessToken(payload: TokenPayload): Promise<string> {
  return sign(
    { ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ACCESS_EXP },
    JWT_SECRET
  )
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return sign(
    { ...payload, type: 'refresh', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + REFRESH_EXP },
    JWT_SECRET
  )
}

export async function verifyToken(token: string): Promise<any> {
  return verify(token, JWT_SECRET, 'HS256')
}
