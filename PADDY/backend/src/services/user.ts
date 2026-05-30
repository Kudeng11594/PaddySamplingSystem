import { getDb } from '../db/index.js'
import bcrypt from 'bcryptjs'

export function listUsers() {
  const db = getDb()
  const items = db.prepare("SELECT id, username, role, createdAt FROM users ORDER BY createdAt ASC").all()
  return { items, total: items.length }
}

export function createUser(username: string, password: string, role: string) {
  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) return { error: 'DUPLICATE_USERNAME' }
  const id = crypto.randomUUID()
  const hash = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)').run(id, username, hash, role)
  return { id, username, role }
}

export function deleteUser(id: string) {
  const db = getDb()
  const result = db.prepare('DELETE FROM users WHERE id = ? AND role != ?').run(id, 'admin')
  return result.changes > 0
}

export function resetPassword(id: string, newPassword: string) {
  const db = getDb()
  const hash = bcrypt.hashSync(newPassword, 10)
  const result = db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id)
  return result.changes > 0
}
