import { API_URL } from '@/lib/config'

export interface Plan {
    id: string
    name: string
    durationDays: number
    price: number
    multiBranch: boolean
    isActive: boolean
    createdAt: string
}

export interface CreatePlanData {
    name: string
    durationDays: number
    price: number
    multiBranch: boolean
}

export async function getPlans(): Promise<Plan[]> {
    const res = await fetch(`${API_URL}/plans`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener planes')
    return res.json()
}

export async function createPlan(data: CreatePlanData): Promise<Plan> {
    const res = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al crear plan')
    return res.json()
}

export async function updatePlan(id: string, data: CreatePlanData): Promise<Plan> {
    const res = await fetch(`${API_URL}/plans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al actualizar plan')
    return res.json()
}

export async function togglePlan(id: string): Promise<Plan> {
    const res = await fetch(`${API_URL}/plans/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al cambiar estado del plan')
    return res.json()
}