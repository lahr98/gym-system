import { Hono } from 'hono'
import { eq, desc, and, gte } from 'drizzle-orm'
import { db, clients, memberships, membershipPlans, checkIns, branches } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'

const checkinsRouter = new Hono()

checkinsRouter.use('*', requireAuth)

// Dueño y recepcionista ven check-ins
checkinsRouter.get('/', requireRole('owner', 'receptionist'), async (c) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const all = await db
        .select({
            id: checkIns.id,
            createdAt: checkIns.createdAt,
            clientId: checkIns.clientId,
            clientFirstName: clients.firstName,
            clientLastName: clients.lastName,
            branchName: branches.name,
        })
        .from(checkIns)
        .leftJoin(clients, eq(checkIns.clientId, clients.id))
        .leftJoin(branches, eq(checkIns.branchId, branches.id))
        .where(gte(checkIns.createdAt, today))
        .orderBy(desc(checkIns.createdAt))

    return c.json(all)
})

// Verificar membresía y registrar check-in
// Dueño y recepcionista registran check-ins
checkinsRouter.post('/', requireRole('owner', 'receptionist'), async (c) => {
    const body = await c.req.json()
    const { clientId, branchId } = body

    // Verificar que el cliente existe
    const [client] = await db
        .select()
        .from(clients)
        .where(eq(clients.id, clientId))

    if (!client) {
        return c.json({ error: 'Cliente no encontrado' }, 404)
    }

    // Buscar membresía activa
    const [activeMembership] = await db
        .select({
            id: memberships.id,
            endDate: memberships.endDate,
            multiBranch: memberships.multiBranch,
            branchId: memberships.branchId,
            planName: membershipPlans.name,
        })
        .from(memberships)
        .leftJoin(membershipPlans, eq(memberships.planId, membershipPlans.id))
        .where(
            and(
                eq(memberships.clientId, clientId),
                eq(memberships.isActive, true)
            )
        )
        .orderBy(desc(memberships.createdAt))
        .limit(1)

    if (!activeMembership) {
        return c.json({
            error: 'Sin membresía',
            message: `${client.firstName} ${client.lastName} no tiene membresía asignada.`,
        }, 403)
    }

    // Verificar que no esté vencida
    if (new Date(activeMembership.endDate) < new Date()) {
        return c.json({
            error: 'Membresía vencida',
            message: `La membresía de ${client.firstName} ${client.lastName} venció el ${new Date(activeMembership.endDate).toLocaleDateString('es-MX')}.`,
        }, 403)
    }

    // Verificar sucursal si no es multi-sucursal
    if (!activeMembership.multiBranch && activeMembership.branchId !== branchId) {
        return c.json({
            error: 'Sucursal incorrecta',
            message: `${client.firstName} ${client.lastName} no tiene acceso a esta sucursal.`,
        }, 403)
    }

    // Registrar check-in
    const [newCheckIn] = await db
        .insert(checkIns)
        .values({
            clientId,
            branchId: branchId || null,
        })
        .returning()

    return c.json({
        checkIn: newCheckIn,
        client: `${client.firstName} ${client.lastName}`,
        plan: activeMembership.planName,
        message: '✅ Acceso permitido',
    }, 201)
})

export default checkinsRouter