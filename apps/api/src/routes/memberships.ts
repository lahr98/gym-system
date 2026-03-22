import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, memberships, membershipPlans, clients, branches } from '../db'

const membershipsRouter = new Hono()

// Obtener todas las membresías activas
membershipsRouter.get('/', async (c) => {
    const all = await db
        .select({
            id: memberships.id,
            planId: memberships.planId,
            planName: membershipPlans.name,
            planPrice: membershipPlans.price,
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
        .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
        .where(eq(memberships.isActive, true))
        .orderBy(memberships.createdAt)

    return c.json(all)
})

// Obtener planes activos (para el formulario)
membershipsRouter.get('/plans', async (c) => {
    const all = await db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.isActive, true))
        .orderBy(membershipPlans.price)
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

    // Buscar el plan para obtener la duración
    const [plan] = await db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.id, body.planId))

    if (!plan) {
        return c.json({ error: 'Plan no encontrado' }, 404)
    }

    const startDate = new Date(body.startDate)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.durationDays)

    const [newMembership] = await db
        .insert(memberships)
        .values({
            clientId: body.clientId,
            planId: body.planId,
            branchId: plan.multiBranch ? null : (body.branchId || null),
            multiBranch: plan.multiBranch,
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