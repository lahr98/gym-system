import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
    return c.json({ message: 'Gym System API is running' })
})

serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`🏋️ API running on http://localhost:${info.port}`)
})