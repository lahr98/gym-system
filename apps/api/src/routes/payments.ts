import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db, payments, clients, branches } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'
import { createPaymentSchema } from '../validators'
import { validateBody } from '../validators/validate'

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
    const data = await validateBody(c, createPaymentSchema)
    if (!data) return c.res

    const [newPayment] = await db
        .insert(payments)
        .values({
            clientId: data.clientId,
            membershipId: data.membershipId || null,
            amount: data.amount,
            method: data.method,
            branchId: data.branchId || null,
            receivedBy: data.receivedBy || null,
            notes: data.notes || null,
        })
        .returning()

    return c.json(newPayment, 201)
})

export default paymentsRouter