const API_URL = 'http://localhost:3000/api'

export interface Membership {
    id: string
    planId: string | null
    planName: string | null
    planPrice: number | null
    multiBranch: boolean
    startDate: string
    endDate: string
    isActive: boolean
    createdAt: string
    clientId: string
    clientFirstName: string
    clientLastName: string
    branchId: string | null
    branchName: string | null
}

export interface MembershipPlan {
    id: string
    name: string
    durationDays: number
    price: number
    multiBranch: boolean
    isActive: boolean
}

export interface Branch {
    id: string
    name: string
    address: string | null
}

export interface CreateMembershipData {
    clientId: string
    planId: string
    branchId?: string
    startDate: string
}

export async function getMemberships(): Promise<Membership[]> {
    const res = await fetch(`${API_URL}/memberships`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener membresías')
    return res.json()
}

export async function getPlans(): Promise<MembershipPlan[]> {
    const res = await fetch(`${API_URL}/memberships/plans`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener planes')
    return res.json()
}

export async function getBranches(): Promise<Branch[]> {
    const res = await fetch(`${API_URL}/memberships/branches`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener sucursales')
    return res.json()
}

export async function createMembership(data: CreateMembershipData): Promise<Membership> {
    const res = await fetch(`${API_URL}/memberships`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al crear membresía')
    return res.json()
}

export async function deleteMembership(id: string): Promise<Membership> {
    const res = await fetch(`${API_URL}/memberships/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al desactivar membresía')
    return res.json()
}