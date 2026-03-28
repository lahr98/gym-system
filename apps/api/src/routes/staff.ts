import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, users } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'
import { auth } from '../lib/auth'

const staffRouter = new Hono()

staffRouter.use('*', requireAuth)

// Obtener todos los usuarios staff
staffRouter.get('/', requireRole('owner'), async (c) => {
  const all = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt)

  return c.json(all)
})

// Crear usuario staff
staffRouter.post('/', requireRole('owner'), async (c) => {
  const body = await c.req.json()

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: body.password,
      },
    })

    if (!result?.user?.id) {
      return c.json({ error: 'Error al crear usuario', message: 'No se pudo crear la cuenta.' }, 400)
    }

    await db
      .update(users)
      .set({ role: body.role })
      .where(eq(users.id, result.user.id))

    return c.json({
      id: result.user.id,
      name: body.name,
      email: body.email,
      role: body.role,
    }, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return c.json({ error: 'Error al crear usuario', message }, 400)
  }
})

// Actualizar rol de usuario
staffRouter.put('/:id', requireRole('owner'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const [updated] = await db
    .update(users)
    .set({
      name: body.name,
      role: body.role,
    })
    .where(eq(users.id, id))
    .returning()

  if (!updated) {
    return c.json({ error: 'Usuario no encontrado', message: 'No se encontró el usuario.' }, 404)
  }

  return c.json(updated)
})

// Desactivar usuario (no eliminar)
staffRouter.delete('/:id', requireRole('owner'), async (c) => {
  const id = c.req.param('id')
const currentUser = (c as any).get('user') as { id: string }

  if (id === currentUser.id) {
    return c.json({ error: 'Acción no permitida', message: 'No puedes desactivar tu propia cuenta.' }, 400)
  }

  const [updated] = await db
    .update(users)
    .set({ role: 'deactivated' as string })
    .where(eq(users.id, id))
    .returning()

  if (!updated) {
    return c.json({ error: 'Usuario no encontrado', message: 'No se encontró el usuario.' }, 404)
  }

  return c.json({ message: 'Usuario desactivado' })
})

export default staffRouter