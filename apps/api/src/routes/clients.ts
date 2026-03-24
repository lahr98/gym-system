import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, clients, memberships, membershipPlans, payments, branches } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'

const clientsRouter = new Hono()

// Todas las rutas requieren autenticación
clientsRouter.use('*', requireAuth)

// Obtener todos los clientes activos (dueño y recepcionista)
clientsRouter.get('/', requireRole('owner', 'receptionist'), async (c) => {
    const allClients = await db
        .select()
        .from(clients)
        .where(eq(clients.isActive, true))
        .orderBy(clients.createdAt)
    return c.json(allClients)
})

// Obtener perfil completo (dueño y recepcionista)
clientsRouter.get('/:id', requireRole('owner', 'receptionist'), async (c) => {
    const id = c.req.param('id')

    const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, id))

    if (!client) {
        return c.json({ error: 'Cliente no encontrado' }, 404)
    }

    const activeMembership = await db
        .select({
            id: memberships.id,
            planName: membershipPlans.name,
            planPrice: membershipPlans.price,
            multiBranch: memberships.multiBranch,
            startDate: memberships.startDate,
            endDate: memberships.endDate,
            branchName: branches.name,
        })
        .from(memberships)
        .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
        .leftJoin(branches, eq(memberships.branchId, branches.id))
        .where(eq(memberships.clientId, id))
        .orderBy(desc(memberships.createdAt))
        .limit(1)

    const paymentHistory = await db
        .select({
            id: payments.id,
            amount: payments.amount,
            method: payments.method,
            notes: payments.notes,
            createdAt: payments.createdAt,
            branchName: branches.name,
        })
        .from(payments)
        .leftJoin(branches, eq(payments.branchId, branches.id))
        .where(eq(payments.clientId, id))
        .orderBy(desc(payments.createdAt))

    return c.json({
        client,
        membership: activeMembership[0] ?? null,
        payments: paymentHistory,
    })
})

// Crear cliente (dueño y recepcionista)
clientsRouter.post('/', requireRole('owner', 'receptionist'), async (c) => {
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

// Actualizar cliente (dueño y recepcionista)
clientsRouter.put('/:id', requireRole('owner', 'receptionist'), async (c) => {
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

// Desactivar cliente (solo dueño)
clientsRouter.delete('/:id', requireRole('owner'), async (c) => {
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