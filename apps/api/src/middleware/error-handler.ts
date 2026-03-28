import { ErrorHandler } from 'hono'

export const errorHandler: ErrorHandler = (error, c) => {
    console.error(`[SERVER_ERROR] ${c.req.method} ${c.req.path}:`, error.message)
    return c.json({
    error: 'Error interno del servidor',
    message: error.message,
}, 500)
}