import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, memberships, clients, branches } from '../db'

const membershipsRouter = new Hono()

// Obtener todas las membresías activas con datos del cliente
membershipsRouter.get('/', async (c) => {
    const all = await db
        .select({
            id: memberships.id,
            type: memberships.type,
            multiBranch: memberships.multiBranch,
            startDate: memberships.startDate,
            endDate: memberships.endDate,
            isActive: memberships.isActive,
            createdAt: memberships.createdAt,
            clientId: memberships.clientId,
            clientFirstName: clients.firstName,
            clientLastName: clients.lastName,
            branchId: memberships.branchId,
            branchName: branches.name,
        })
        .from(memberships)
        .leftJoin(clients, eq(memberships.clientId, clients.id))
        .leftJoin(branches, eq(memberships.branchId, branches.id))
        .where(eq(memberships.isActive, true))
        .orderBy(memberships.createdAt)

    return c.json(all)
})

// Obtener sucursales (para el formulario)
membershipsRouter.get('/branches', async (c) => {
    const all = await db
        .select()
        .from(branches)
        .where(eq(branches.isActive, true))
    return c.json(all)
})

// Crear membresía
membershipsRouter.post('/', async (c) => {
    const body = await c.req.json()

    const startDate = new Date(body.startDate)
    let endDate: Date

    switch (body.type) {
        case 'daily':
            endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + 1)
            break
        case 'biweekly':
            endDate = new Date(startDate)
            endDate.setDate(endDate.getDate() + 15)
            break
        case 'monthly':
            endDate = new Date(startDate)
            endDate.setMonth(endDate.getMonth() + 1)
            break
        case 'annual':
            endDate = new Date(startDate)
            endDate.setFullYear(endDate.getFullYear() + 1)
            break
        default:
            return c.json({ error: 'Tipo de membresía inválido' }, 400)
    }

    const [newMembership] = await db
        .insert(memberships)
        .values({
            clientId: body.clientId,
            type: body.type,
            branchId: body.branchId || null,
            multiBranch: body.multiBranch || false,
            startDate,
            endDate,
        })
        .returning()

    return c.json(newMembership, 201)
})

// Desactivar membresía
membershipsRouter.delete('/:id', async (c) => {
    const id = c.req.param('id')

    const [deactivated] = await db
        .update(memberships)
        .set({ isActive: false })
        .where(eq(memberships.id, id))
        .returning()

    if (!deactivated) {
        return c.json({ error: 'Membresía no encontrada' }, 404)
    }

    return c.json(deactivated)
})

export default membershipsRouter