import { API_URL } from '@/lib/config'

export interface Client {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string | null
    photoUrl: string | null
    isActive: boolean
    createdAt: string
}

export interface ClientProfile {
    client: Client
    membership: {
        id: string
        planName: string | null
        planPrice: number | null
        multiBranch: boolean
        startDate: string
        endDate: string
        branchName: string | null
    } | null
    payments: {
        id: string
        amount: number
        method: string
        notes: string | null
        createdAt: string
        branchName: string | null
    }[]
}

export interface CreateClientData {
    firstName: string
    lastName: string
    email?: string
    phone?: string
}

export async function getClients(): Promise<Client[]> {
    const res = await fetch(`${API_URL}/clients`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener clientes')
    return res.json()
}

export async function getClientProfile(id: string): Promise<ClientProfile> {
    const res = await fetch(`${API_URL}/clients/${id}`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener perfil')
    return res.json()
}

export async function createClient(data: CreateClientData): Promise<Client> {
    const res = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al crear cliente')
    return res.json()
}

export async function updateClient(id: string, data: CreateClientData): Promise<Client> {
    const res = await fetch(`${API_URL}/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al actualizar cliente')
    return res.json()
}

export async function deleteClient(id: string): Promise<Client> {
    const res = await fetch(`${API_URL}/clients/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al desactivar cliente')
    return res.json()
}