const API_URL = 'http://localhost:3000/api'

export interface Membership {
    id: string
    type: 'monthly' | 'biweekly' | 'daily' | 'annual'
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

export interface Branch {
    id: string
    name: string
    address: string | null
}

export interface CreateMembershipData {
    clientId: string
    type: string
    branchId?: string
    multiBranch?: boolean
    startDate: string
}

export async function getMemberships(): Promise<Membership[]> {
    const res = await fetch(`${API_URL}/memberships`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener membresías')
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