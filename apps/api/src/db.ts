import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'

// ============================================
// Conexión a la base de datos
// ============================================

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)

// ============================================
// Esquema de clientes
// ============================================

export const clients = pgTable('clients', {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email'),
    phone: text('phone'),
    photoUrl: text('photo_url'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})