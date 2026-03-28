import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/error-handler'
import clientsRouter from './routes/clients'
import membershipsRouter from './routes/memberships'
import paymentsRouter from './routes/payments'
import checkinsRouter from './routes/checkins'
import dashboardRouter from './routes/dashboard'
import plansRouter from './routes/plans'
import staffRouter from './routes/staff'
import branchesRouter from './routes/branch-settings'

const app = new Hono()

app.use('*', logger)
app.onError(errorHandler)

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}))

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw)
})

app.route('/api/clients', clientsRouter)
app.route('/api/memberships', membershipsRouter)
app.route('/api/payments', paymentsRouter)
app.route('/api/checkins', checkinsRouter)
app.route('/api/dashboard', dashboardRouter)
app.route('/api/plans', plansRouter)
app.route('/api/staff', staffRouter)
app.route('/api/branches', branchesRouter)

app.get('/', (c) => {
  return c.json({ message: 'Gym System API is running' })
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`🏋️ API running on http://localhost:${info.port}`)
})