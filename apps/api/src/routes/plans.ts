import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { db, membershipPlans } from '../db'
import { requireAuth, requireRole } from '../middleware/auth'
import { createPlanSchema } from '../validators'
import { validateBody } from '../validators/validate'

const plansRouter = new Hono()

plansRouter.use('*', requireAuth)

// Ver todos los planes (solo dueño)
plansRouter.get('/', requireRole('owner'), async (c) => {
    const all = await db
        .select()
        .from(membershipPlans)
        .orderBy(membershipPlans.price)
    return c.json(all)
})

// Crear plan (solo dueño)
plansRouter.post('/', requireRole('owner'), async (c) => {
    const data = await validateBody(c, createPlanSchema)
    if (!data) return c.res

    const [newPlan] = await db
        .insert(membershipPlans)
        .values({
            name: data.name,
            durationDays: data.durationDays,
            price: data.price,
            multiBranch: data.multiBranch,
        })
        .returning()

    return c.json(newPlan, 201)
})

// Actualizar plan (solo dueño)
plansRouter.put('/:id', requireRole('owner'), async (c) => {
    const id = c.req.param('id')
    const data = await validateBody(c, createPlanSchema)
    if (!data) return c.res

    const [updated] = await db
        .update(membershipPlans)
        .set({
            name: data.name,
            durationDays: data.durationDays,
            price: data.price,
            multiBranch: data.multiBranch,
        })
        .where(eq(membershipPlans.id, id))
        .returning()

    if (!updated) {
        return c.json({ error: 'Plan no encontrado' }, 404)
    }

    return c.json(updated)
})

// Desactivar/activar plan (solo dueño)
plansRouter.delete('/:id', requireRole('owner'), async (c) => {
    const id = c.req.param('id')

    const [plan] = await db
        .select()
        .from(membershipPlans)
        .where(eq(membershipPlans.id, id))

    if (!plan) {
        return c.json({ error: 'Plan no encontrado' }, 404)
    }

    const [toggled] = await db
        .update(membershipPlans)
        .set({ isActive: !plan.isActive })
        .where(eq(membershipPlans.id, id))
        .returning()

    return c.json(toggled)
})

export default plansRouter