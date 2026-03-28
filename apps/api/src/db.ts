import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'
import { getRequiredEnv } from './lib/env'

// ============================================
// Conexión
// ============================================

const client = postgres(getRequiredEnv('DATABASE_URL'))
export const db = drizzle(client)

// ============================================
// Enums
// ============================================

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
// Membership Plans (Catálogo de planes)
// ============================================

export const membershipPlans = pgTable('membership_plans', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    durationDays: integer('duration_days').notNull(),
    price: integer('price').notNull(),
    multiBranch: boolean('multi_branch').notNull().default(false),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================
// Memberships (Membresías asignadas)
// ============================================

export const memberships = pgTable('memberships', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').notNull().references(() => clients.id),
    planId: uuid('plan_id').references(() => membershipPlans.id),
    branchId: uuid('branch_id').references(() => branches.id),
    multiBranch: boolean('multi_branch').notNull().default(false),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date').notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================
// Payments (Pagos)
// ============================================

export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').notNull().references(() => clients.id),
    membershipId: uuid('membership_id').references(() => memberships.id),
    amount: integer('amount').notNull(),
    method: paymentMethodEnum('method').notNull(),
    branchId: uuid('branch_id').references(() => branches.id),
    receivedBy: text('received_by'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})
// ============================================
// Check-ins (Control de acceso)
// ============================================

export const checkIns = pgTable('check_ins', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').notNull().references(() => clients.id),
    branchId: uuid('branch_id').references(() => branches.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})