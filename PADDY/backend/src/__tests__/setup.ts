import Database from 'better-sqlite3'
import { beforeAll, afterAll } from 'vitest'

process.env.JWT_SECRET = 'test-secret-for-paddy-backend'

import { useDb, closeDb } from '../db/index.js'
import { initSchema } from '../db/schema.js'

beforeAll(() => {
  const db = new Database(':memory:')
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  useDb(db)
  initSchema()
})

afterAll(() => {
  closeDb()
})
