import { API_URL } from '@/lib/config'

export interface DashboardData {
  totalClients: number
  activeMemberships: number
  expiredMemberships: number
  todayCheckIns: number
  recentCheckIns: {
    id: string
    createdAt: string
    clientFirstName: string
    clientLastName: string
    branchName: string | null
  }[]
  role: string
  // Solo owner
  todayIncome?: number
  monthIncome?: number
  todayPaymentsCount?: number
  recentPayments?: {
    id: string
    amount: number
    method: string
    createdAt: string
    clientFirstName: string
    clientLastName: string
  }[]
}

export async function getDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${API_URL}/dashboard`, { credentials: 'include' })
  if (!res.ok) throw new Error('Error al obtener datos del dashboard')
  return res.json()
}