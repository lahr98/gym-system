import { pgTable, uuid, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core'

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', ['owner', 'receptionist', 'trainer'])

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'transfer', 'card'])

export const membershipTypeEnum = pgEnum('membership_type', ['monthly', 'biweekly', 'daily', 'annual'])

// ============================================
// BRANCHES (Sucursales)
// ============================================

export const branches = pgTable('branches', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    address: text('address'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================
// USERS (Staff del gym)
// ============================================

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    name: text('name').notNull(),
    role: userRoleEnum('role').notNull(),
    branchId: uuid('branch_id').references(() => branches.id),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================
// CLIENTS (Clientes del gym)
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
// MEMBERSHIPS (Membresías activas de clientes)
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

// ============================================
// PAYMENTS (Registro de pagos)
// ============================================

export const payments = pgTable('payments', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').notNull().references(() => clients.id),
    membershipId: uuid('membership_id').references(() => memberships.id),
    amount: integer('amount').notNull(),
    method: paymentMethodEnum('method').notNull(),
    branchId: uuid('branch_id').references(() => branches.id),
    receivedBy: uuid('received_by').references(() => users.id),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ============================================
// CHECK-INS (Control de acceso)
// ============================================

export const checkIns = pgTable('check_ins', {
    id: uuid('id').defaultRandom().primaryKey(),
    clientId: uuid('client_id').notNull().references(() => clients.id),
    branchId: uuid('branch_id').references(() => branches.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
})