const API_URL = 'http://localhost:3000/api'

export interface Payment {
    id: string
    amount: number
    method: string
    notes: string | null
    createdAt: string
    clientId: string
    clientFirstName: string
    clientLastName: string
    branchName: string | null
}

export interface CreatePaymentData {
    clientId: string
    membershipId?: string
    amount: number
    method: string
    branchId?: string
    notes?: string
}

export async function getPayments(): Promise<Payment[]> {
    const res = await fetch(`${API_URL}/payments`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener pagos')
    return res.json()
}

export async function createPayment(data: CreatePaymentData): Promise<Payment> {
    const res = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Error al registrar pago')
    return res.json()
}