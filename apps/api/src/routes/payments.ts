import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, payments, clients, branches } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'

const paymentsRouter = new Hono()

paymentsRouter.use('*', requireAuth)

// Obtener todos los pagos (solo dueño)
paymentsRouter.get('/', requireRole('owner'), async (c) => {
    const all = await db
        .select({
            id: payments.id,
            amount: payments.amount,
            method: payments.method,
            notes: payments.notes,
            createdAt: payments.createdAt,
            clientId: payments.clientId,
            clientFirstName: clients.firstName,
            clientLastName: clients.lastName,
            branchName: branches.name,
        })
        .from(payments)
        .leftJoin(clients, eq(payments.clientId, clients.id))
        .leftJoin(branches, eq(payments.branchId, branches.id))
        .orderBy(desc(payments.createdAt))

    return c.json(all)
})

// Registrar un pago (dueño y recepcionista)
paymentsRouter.post('/', requireRole('owner', 'receptionist'), async (c) => {
    const body = await c.req.json()

    const [newPayment] = await db
        .insert(payments)
        .values({
            clientId: body.clientId,
            membershipId: body.membershipId || null,
            amount: body.amount,
            method: body.method,
            branchId: body.branchId || null,
            receivedBy: body.receivedBy || null,
            notes: body.notes || null,
        })
        .returning()

    return c.json(newPayment, 201)
})

export default paymentsRouter