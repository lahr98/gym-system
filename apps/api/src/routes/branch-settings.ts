import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, branches } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'

const branchesRouter = new Hono()

branchesRouter.use('*', requireAuth)

// Obtener todas las sucursales
branchesRouter.get('/', requireRole('owner'), async (c) => {
  const all = await db
    .select()
    .from(branches)
    .orderBy(branches.createdAt)
  return c.json(all)
})

// Crear sucursal
branchesRouter.post('/', requireRole('owner'), async (c) => {
  const body = await c.req.json()

  const [newBranch] = await db
    .insert(branches)
    .values({
      name: body.name,
      address: body.address || null,
    })
    .returning()

  return c.json(newBranch, 201)
})

// Actualizar sucursal
branchesRouter.put('/:id', requireRole('owner'), async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const [updated] = await db
    .update(branches)
    .set({
      name: body.name,
      address: body.address || null,
    })
    .where(eq(branches.id, id))
    .returning()

  if (!updated) {
    return c.json({ error: 'Sucursal no encontrada', message: 'No se encontró la sucursal.' }, 404)
  }

  return c.json(updated)
})

// Toggle activo/inactivo
branchesRouter.delete('/:id', requireRole('owner'), async (c) => {
  const id = c.req.param('id')

  const [branch] = await db
    .select()
    .from(branches)
    .where(eq(branches.id, id))

  if (!branch) {
    return c.json({ error: 'Sucursal no encontrada', message: 'No se encontró la sucursal.' }, 404)
  }

  const [toggled] = await db
    .update(branches)
    .set({ isActive: !branch.isActive })
    .where(eq(branches.id, id))
    .returning()

  return c.json(toggled)
})

export default branchesRouter