import { serve } from '@hono/node-server'
import app from './app.js'
import { initSchema, seedDefaultUsers } from './db/schema.js'

const PORT = parseInt(process.env.PORT || '3000')
initSchema()
seedDefaultUsers()

serve({ fetch: app.fetch, port: PORT })
console.log(`Server running on http://localhost:${PORT}`)
