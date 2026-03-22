import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, clients } from '../db'

const clientsRouter = new Hono()

// Obtener todos los clientes activos
clientsRouter.get('/', async (c) => {
    const allClients = await db
        .select()
        .from(clients)
        .where(eq(clients.isActive, true))
        .orderBy(clients.createdAt)
    return c.json(allClients)
})

// Obtener un cliente por ID
clientsRouter.get('/:id', async (c) => {
    const id = c.req.param('id')
    const [found] = await db.select().from(clients).where(eq(clients.id, id))

    if (!found) {
        return c.json({ error: 'Cliente no encontrado' }, 404)
    }

    return c.json(found)
})

// Crear un nuevo cliente
clientsRouter.post('/', async (c) => {
    const body = await c.req.json()

    const [newClient] = await db
        .insert(clients)
        .values({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email || null,
            phone: body.phone || null,
        })
        .returning()

    return c.json(newClient, 201)
})

// Actualizar un cliente
clientsRouter.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()

    const [updated] = await db
        .update(clients)
        .set({
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email || null,
            phone: body.phone || null,
        })
        .where(eq(clients.id, id))
        .returning()

    if (!updated) {
        return c.json({ error: 'Cliente no encontrado' }, 404)
    }

    return c.json(updated)
})

// Desactivar un cliente (soft delete)
clientsRouter.delete('/:id', async (c) => {
    const id = c.req.param('id')

    const [deactivated] = await db
        .update(clients)
        .set({ isActive: false })
        .where(eq(clients.id, id))
        .returning()

    if (!deactivated) {
        return c.json({ error: 'Cliente no encontrado' }, 404)
    }

    return c.json(deactivated)
})

export default clientsRouter