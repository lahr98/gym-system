import { createMiddleware } from 'hono/factory'
import { auth } from '../lib/auth'

type UserRole = 'owner' | 'receptionist' | 'trainer'

// Middleware que verifica que el usuario esté logueado
export const requireAuth = createMiddleware(async (c, next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    })

    if (!session) {
        return c.json({ error: 'No autorizado. Inicia sesión.' }, 401)
    }

    c.set('user', session.user)
    c.set('session', session.session)
    await next()
})

// Middleware que verifica el rol del usuario
export const requireRole = (...roles: UserRole[]) => {
    return createMiddleware(async (c, next) => {
        const user = c.get('user') as { role?: string } | undefined

        if (!user) {
            return c.json({ error: 'No autorizado.' }, 401)
        }

        if (!roles.includes(user.role as UserRole)) {
            return c.json({ error: 'No tienes permisos para esta acción.' }, 403)
        }

        await next()
    })
}