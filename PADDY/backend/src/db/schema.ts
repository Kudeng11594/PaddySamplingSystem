import { getDb } from './index.js'
import bcrypt from 'bcryptjs'

export function initSchema(): void {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      appointmentNo TEXT UNIQUE NOT NULL,
      driverName TEXT NOT NULL,
      phone TEXT NOT NULL,
      licensePlate TEXT NOT NULL,
      variety TEXT NOT NULL,
      appointmentDate TEXT NOT NULL,
      appointmentTime TEXT NOT NULL,
      remark TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      tokenNo TEXT DEFAULT '',
      moisture REAL,
      riceYield REAL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      queuedAt TEXT,
      calledAt TEXT,
      cancelledAt TEXT,
      cancelReason TEXT DEFAULT '',
      cancelBy TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'operator',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS counters (
      id TEXT PRIMARY KEY,
      prefix TEXT NOT NULL,
      seq INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointmentDate);
    CREATE INDEX IF NOT EXISTS idx_appointments_no ON appointments(appointmentNo);
    CREATE INDEX IF NOT EXISTS idx_appointments_phone ON appointments(phone);
  `)
}

export function seedDefaultUsers(): void {
  const db = getDb()
  const existing = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
  if (existing.count > 0) return
  const hash = bcrypt.hashSync('admin123', 10)
  const id = crypto.randomUUID()
  db.prepare('INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)').run(id, 'admin', hash, 'admin')
  console.log('Default admin user created (admin / admin123)')
}
