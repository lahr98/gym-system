import { Hono } from 'hono'
import { eq, gte, desc, count } from 'drizzle-orm'
import { db, clients, memberships, membershipPlans, payments, checkIns, branches } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'

const dashboardRouter = new Hono()

dashboardRouter.use('*', requireAuth)

dashboardRouter.get('/', requireRole('owner', 'receptionist'), async (c) => {
  const user = (c as any).get('user') as { role: string }
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const isOwner = user.role === 'owner'

  // Todas las queries en paralelo
  const queries: Promise<any>[] = [
    db.select({ count: count() }).from(clients).where(eq(clients.isActive, true)),
    db.select({ id: memberships.id, endDate: memberships.endDate }).from(memberships).where(eq(memberships.isActive, true)),
    db.select({ count: count() }).from(checkIns).where(gte(checkIns.createdAt, todayStart)),
    db.select({
      id: checkIns.id,
      createdAt: checkIns.createdAt,
      clientFirstName: clients.firstName,
      clientLastName: clients.lastName,
      branchName: branches.name,
    }).from(checkIns)
      .leftJoin(clients, eq(checkIns.clientId, clients.id))
      .leftJoin(branches, eq(checkIns.branchId, branches.id))
      .orderBy(desc(checkIns.createdAt))
      .limit(5),
  ]

  if (isOwner) {
    queries.push(
      db.select({ amount: payments.amount }).from(payments).where(gte(payments.createdAt, todayStart)),
      db.select({ amount: payments.amount }).from(payments).where(gte(payments.createdAt, monthStart)),
      db.select({
        id: payments.id,
        amount: payments.amount,
        method: payments.method,
        createdAt: payments.createdAt,
        clientFirstName: clients.firstName,
        clientLastName: clients.lastName,
      }).from(payments)
        .leftJoin(clients, eq(payments.clientId, clients.id))
        .orderBy(desc(payments.createdAt))
        .limit(5),
    )
  }

  const results = await Promise.all(queries)

  const activeCount = results[1].filter((m: any) => new Date(m.endDate) >= now).length
  const expiredCount = results[1].filter((m: any) => new Date(m.endDate) < now).length

  const baseData = {
    totalClients: results[0][0].count,
    activeMemberships: activeCount,
    expiredMemberships: expiredCount,
    todayCheckIns: results[2][0].count,
    recentCheckIns: results[3],
    role: user.role,
  }

  if (!isOwner) {
    return c.json(baseData)
  }

  const todayPayments = results[4]
  const monthPayments = results[5]

  return c.json({
    ...baseData,
    todayIncome: todayPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
    monthIncome: monthPayments.reduce((sum: number, p: any) => sum + p.amount, 0),
    todayPaymentsCount: todayPayments.length,
    recentPayments: results[6],
  })
})

export default dashboardRouter