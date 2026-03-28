import { API_URL } from '@/lib/config'

export interface Branch {
  id: string
  name: string
  address: string | null
  isActive: boolean
  createdAt: string
}

export interface CreateBranchData {
  name: string
  address?: string
}

export async function getBranches(): Promise<Branch[]> {
  const res = await fetch(`${API_URL}/branches`, { credentials: 'include' })
  if (!res.ok) throw new Error('Error al obtener sucursales')
  return res.json()
}

export async function createBranch(data: CreateBranchData): Promise<Branch> {
  const res = await fetch(`${API_URL}/branches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear sucursal')
  return res.json()
}

export async function updateBranch(id: string, data: CreateBranchData): Promise<Branch> {
  const res = await fetch(`${API_URL}/branches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar sucursal')
  return res.json()
}

export async function toggleBranch(id: string): Promise<Branch> {
  const res = await fetch(`${API_URL}/branches/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Error al cambiar estado')
  return res.json()
}