import { Context } from 'hono'
import { ZodSchema, ZodError, ZodIssue } from 'zod'

export async function validateBody<T>(c: Context, schema: ZodSchema<T>): Promise<T | null> {
    try {
        const body = await c.req.json()
        return schema.parse(body)
    } catch (error: unknown) {
        if (error instanceof ZodError) {
            const messages: string[] = error.issues.map((issue: ZodIssue) => issue.message)
            c.status(400)
            c.res = c.json({ error: 'Datos inválidos', details: messages }) as unknown as Response
            return null
        }
        throw error
    }
}