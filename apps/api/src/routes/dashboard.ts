import { Hono } from 'hono'
import { eq, gte, and, desc, count, sum } from 'drizzle-orm'
import { db, clients, memberships, membershipPlans, payments, checkIns, branches } from '../db'

const dashboardRouter = new Hono()

dashboardRouter.get('/', async (c) => {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Total de clientes activos
    const [clientsCount] = await db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.isActive, true))

    // Membresías activas (no vencidas)
    const activeMemberships = await db
        .select({ id: memberships.id, endDate: memberships.endDate })
        .from(memberships)
        .where(eq(memberships.isActive, true))

    const activeCount = activeMemberships.filter(
        (m) => new Date(m.endDate) >= now
    ).length

    const expiredCount = activeMemberships.filter(
        (m) => new Date(m.endDate) < now
    ).length

    // Ingresos de hoy
    const todayPayments = await db
        .select({ amount: payments.amount })
        .from(payments)
        .where(gte(payments.createdAt, todayStart))

    const todayIncome = todayPayments.reduce((sum, p) => sum + p.amount, 0)

    // Ingresos del mes
    const monthPayments = await db
        .select({ amount: payments.amount })
        .from(payments)
        .where(gte(payments.createdAt, monthStart))

    const monthIncome = monthPayments.reduce((sum, p) => sum + p.amount, 0)

    // Check-ins de hoy
    const [todayCheckIns] = await db
        .select({ count: count() })
        .from(checkIns)
        .where(gte(checkIns.createdAt, todayStart))

    // Últimos 5 pagos
    const recentPayments = await db
        .select({
            id: payments.id,
            amount: payments.amount,
            method: payments.method,
            createdAt: payments.createdAt,
            clientFirstName: clients.firstName,
            clientLastName: clients.lastName,
        })
        .from(payments)
        .leftJoin(clients, eq(payments.clientId, clients.id))
        .orderBy(desc(payments.createdAt))
        .limit(5)

    // Últimos 5 check-ins
    const recentCheckIns = await db
        .select({
            id: checkIns.id,
            createdAt: checkIns.createdAt,
            clientFirstName: clients.firstName,
            clientLastName: clients.lastName,
            branchName: branches.name,
        })
        .from(checkIns)
        .leftJoin(clients, eq(checkIns.clientId, clients.id))
        .leftJoin(branches, eq(checkIns.branchId, branches.id))
        .orderBy(desc(checkIns.createdAt))
        .limit(5)

    return c.json({
        totalClients: clientsCount.count,
        activeMemberships: activeCount,
        expiredMemberships: expiredCount,
        todayIncome,
        monthIncome,
        todayCheckIns: todayCheckIns.count,
        todayPaymentsCount: todayPayments.length,
        recentPayments,
        recentCheckIns,
    })
})

export default dashboardRouter