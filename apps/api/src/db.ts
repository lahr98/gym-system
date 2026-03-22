import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'

// ============================================
// Conexión
// ============================================

const client = postgres(process.env.DATABASE_URL!)
export const db = drizzle(client)

// ============================================
// Enums
// ============================================

export const membershipTypeEnum = pgEnum('membership_type', ['monthly', 'biweekly', 'daily', 'annual'])

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'card'])

// ============================================
// Branches (Sucursales)
// ============================================

export const branches = pgTable('branches', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================
// Clients
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

// ============================================
// Memberships
// ============================================

export const memberships = pgTable('memberships', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').notNull().references(() => clients.id),
    type: membershipTypeEnum('type').notNull(),
    branchId: uuid('branch_id').references(() => branches.id),
    multiBranch: boolean('multi_branch').notNull().default(false),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})