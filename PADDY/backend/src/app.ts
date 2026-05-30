import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { errorMiddleware } from './middleware/error.js'
import authRouter from './routes/auth.js'
import appointmentsRouter from './routes/appointments.js'
import queueRouter from './routes/queue.js'
import dashboardRouter from './routes/dashboard.js'
import usersRouter from './routes/users.js'

const app = new Hono()
app.use('*', cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }))
app.use('*', errorMiddleware)

app.route('/api/auth', authRouter)
app.route('/api/appointments', appointmentsRouter)
app.route('/api/queue', queueRouter)
app.route('/api/dashboard', dashboardRouter)
app.route('/api/users', usersRouter)

app.get('/api/health', (c) => c.json({ success: true, data: { status: 'ok' } }))

export default app
