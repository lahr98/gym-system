const API_URL = 'http://localhost:3000/api'

export interface DashboardData {
    totalClients: number
    activeMemberships: number
    expiredMemberships: number
    todayIncome: number
    monthIncome: number
    todayCheckIns: number
    todayPaymentsCount: number
    recentPayments: {
        id: string
        amount: number
        method: string
        createdAt: string
        clientFirstName: string
        clientLastName: string
    }[]
    recentCheckIns: {
        id: string
        createdAt: string
        clientFirstName: string
        clientLastName: string
        branchName: string | null
    }[]
}

export async function getDashboardData(): Promise<DashboardData> {
    const res = await fetch(`${API_URL}/dashboard`, { credentials: 'include' })
    if (!res.ok) throw new Error('Error al obtener datos del dashboard')
    return res.json()
}