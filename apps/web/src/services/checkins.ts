const API_URL = 'http://localhost:3000/api'

export interface CheckIn {
    id: string
    createdAt: string
    clientId: string
    clientFirstName: string
    clientLastName: string
    branchName: string | null
}

export interface CheckInResult {
    checkIn?: { id: string }
    client?: string
    plan?: string
    message: string
    error?: string
}

export async function getTodayCheckIns(): Promise<CheckIn[]> {
    const res = await fetch(`${API_URL}/checkins`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener check-ins')
    return res.json()
}

export async function registerCheckIn(clientId: string, branchId: string): Promise<CheckInResult> {
    const res = await fetch(`${API_URL}/checkins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ clientId, branchId }),
    })
    const data = await res.json()
    if (!res.ok) {
        return { message: data.message || 'Error desconocido', error: data.error }
    }
    return data
}