import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './lib/auth'

const app = new Hono()

// Permitir peticiones del frontend
app.use('*', cors({
    origin: 'http://localhost:5173',
    credentials: true,
}))

// Rutas de autenticación (login, registro, sesión, etc.)
app.on(['POST', 'GET'], '/api/auth/**', (c) => {
    return auth.handler(c.req.raw)
})

// Ruta de prueba
app.get('/', (c) => {
    return c.json({ message: 'Gym System API is running' })
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`🏋️ API running on http://localhost:${info.port}`)
})