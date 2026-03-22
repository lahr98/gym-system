import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as authSchema from '../auth-schema'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: authSchema,
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: ['http://localhost:5173'],
})