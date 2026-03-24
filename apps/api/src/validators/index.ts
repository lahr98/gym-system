import { z } from 'zod'

// Clientes
export const createClientSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    phone: z.string().max(20).optional().or(z.literal('')),
})

export const updateClientSchema = createClientSchema

// Membresías
export const createMembershipSchema = z.object({
    clientId: z.string().uuid('ID de cliente inválido'),
    planId: z.string().uuid('ID de plan inválido'),
    branchId: z.string().uuid('ID de sucursal inválido').optional(),
    startDate: z.string().refine((val) => {
        const date = new Date(val)
        return !isNaN(date.getTime())
    }, 'Fecha de inicio inválida'),
})

// Pagos
export const createPaymentSchema = z.object({
    clientId: z.string().uuid('ID de cliente inválido'),
    membershipId: z.string().uuid().optional().or(z.literal('')),
    amount: z.number().int().positive('El monto debe ser mayor a 0'),
    method: z.enum(['cash', 'transfer', 'card']),
    branchId: z.string().uuid().optional().or(z.literal('')),
    receivedBy: z.string().optional().or(z.literal('')),
    notes: z.string().max(500).optional().or(z.literal('')),
})

// Check-ins
export const createCheckInSchema = z.object({
    clientId: z.string().uuid('ID de cliente inválido'),
    branchId: z.string().uuid('ID de sucursal inválido'),
})

// Planes de membresía
export const createPlanSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    durationDays: z.number().int().positive('La duración debe ser mayor a 0'),
    price: z.number().int().positive('El precio debe ser mayor a 0'),
    multiBranch: z.boolean().default(false),
})