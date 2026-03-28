import { createMiddleware } from 'hono/factory'

export const logger = createMiddleware(async (c, next) => {
    const start = Date.now()
    const method = c.req.method
    const path = c.req.path

    try {
        await next()
        const duration = Date.now() - start
        const status = c.res.status
        console.log(`${method} ${path} - ${status} - ${duration}ms`)
    } catch (error: unknown) {
        const duration = Date.now() - start
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error(`${method} ${path} - 500 (${duration}ms) - ERROR: ${message}`)
        throw error
    }
})