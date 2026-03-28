import { API_URL } from '@/lib/config'

export interface StaffUser {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface CreateStaffData {
  name: string
  email: string
  password: string
  role: string
}

export async function getStaff(): Promise<StaffUser[]> {
  const res = await fetch(`${API_URL}/staff`, { credentials: 'include' })
  if (!res.ok) throw new Error('Error al obtener staff')
  return res.json()
}

export async function createStaffUser(data: CreateStaffData): Promise<StaffUser> {
  const res = await fetch(`${API_URL}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear usuario')
  return res.json()
}

export async function updateStaffUser(id: string, data: { name: string; role: string }): Promise<StaffUser> {
  const res = await fetch(`${API_URL}/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar usuario')
  return res.json()
}

export async function deactivateStaffUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/staff/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Error al desactivar usuario')
}