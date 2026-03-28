import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  getStaff, createStaffUser, updateStaffUser, deactivateStaffUser, type StaffUser,
} from '@/services/staff'
import {
  getBranches, createBranch, updateBranch, toggleBranch, type Branch,
} from '@/services/branches'
import {
  getPlans, createPlan, updatePlan, togglePlan, type Plan, type CreatePlanData,
} from '@/services/plans'

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const roleLabels: Record<string, string> = {
  owner: 'Dueño',
  receptionist: 'Recepcionista',
  trainer: 'Entrenador',
  deactivated: 'Desactivado',
}

// ============================================
// Staff Tab
// ============================================

function StaffTab() {
  const [staff, setStaff] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'receptionist' })

  const loadStaff = async () => {
    try {
      const data = await getStaff()
      setStaff(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStaff() }, [])

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return
    setSaving(true)
    try {
      await createStaffUser(form)
      setForm({ name: '', email: '', password: '', role: 'receptionist' })
      setShowForm(false)
      await loadStaff()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm('¿Desactivar este usuario?')) return
    try {
      await deactivateStaffUser(id)
      await loadStaff()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando staff...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Usuarios del sistema</h2>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo usuario'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="space-y-2">
                <Label>Rol *</Label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="receptionist">Recepcionista</option>
                  <option value="trainer">Entrenador</option>
                  <option value="owner">Dueño</option>
                </select>
              </div>
            </div>
            <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creando...' : 'Crear usuario'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((user) => (
            <TableRow key={user.id} className={user.role === 'deactivated' ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'owner' ? 'default' : 'secondary'}>
                  {roleLabels[user.role] ?? user.role}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(user.createdAt).toLocaleDateString('es-MX')}
              </TableCell>
              <TableCell>
                {user.role !== 'deactivated' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeactivate(user.id)}
                  >
                    Desactivar
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ============================================
// Plans Tab
// ============================================

function PlansTab() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CreatePlanData>({ name: '', durationDays: 30, price: 0, multiBranch: false })
  const [priceDisplay, setPriceDisplay] = useState('')

  const loadPlans = async () => {
    try {
      const data = await getPlans()
      setPlans(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPlans() }, [])

  const resetForm = () => {
    setForm({ name: '', durationDays: 30, price: 0, multiBranch: false })
    setPriceDisplay('')
    setEditingId(null)
    setShowForm(false)
  }

  const handlePriceChange = (value: string) => {
    setPriceDisplay(value)
    const num = parseFloat(value)
    if (!isNaN(num)) setForm({ ...form, price: Math.round(num * 100) })
  }

  const handleEdit = (plan: Plan) => {
    setForm({ name: plan.name, durationDays: plan.durationDays, price: plan.price, multiBranch: plan.multiBranch })
    setPriceDisplay((plan.price / 100).toString())
    setEditingId(plan.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name || !form.durationDays || !form.price) return
    setSaving(true)
    try {
      if (editingId) {
        await updatePlan(editingId, form)
      } else {
        await createPlan(form)
      }
      resetForm()
      await loadPlans()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await togglePlan(id)
      await loadPlans()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando planes...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Planes de membresía</h2>
        <Button size="sm" onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? 'Cancelar' : 'Nuevo plan'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Mensualidad" />
              </div>
              <div className="space-y-2">
                <Label>Duración (días) *</Label>
                <Input type="number" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label>Precio (MXN) *</Label>
                <Input type="number" step="0.01" value={priceDisplay} onChange={(e) => handlePriceChange(e.target.value)} placeholder="550.00" />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.multiBranch} onChange={(e) => setForm({ ...form, multiBranch: e.target.checked })} className="rounded" />
                  Acceso a ambas sucursales
                </label>
              </div>
            </div>
            <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear plan'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Duración</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Sucursales</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} className={!plan.isActive ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>{plan.durationDays} días</TableCell>
              <TableCell>{formatPrice(plan.price)}</TableCell>
              <TableCell>{plan.multiBranch ? 'Ambas' : 'Una'}</TableCell>
              <TableCell>
                <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                  {plan.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(plan)}>Editar</Button>
                  <Button variant={plan.isActive ? 'destructive' : 'default'} size="sm" onClick={() => handleToggle(plan.id)}>
                    {plan.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ============================================
// Branches Tab
// ============================================

function BranchesTab() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', address: '' })

  const loadBranches = async () => {
    try {
      const data = await getBranches()
      setBranches(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBranches() }, [])

  const resetForm = () => {
    setForm({ name: '', address: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (branch: Branch) => {
    setForm({ name: branch.name, address: branch.address ?? '' })
    setEditingId(branch.id)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      if (editingId) {
        await updateBranch(editingId, form)
      } else {
        await createBranch(form)
      }
      resetForm()
      await loadBranches()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      await toggleBranch(id)
      await loadBranches()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <p className="text-muted-foreground">Cargando sucursales...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sucursales</h2>
        <Button size="sm" onClick={() => showForm ? resetForm() : setShowForm(true)}>
          {showForm ? 'Cancelar' : 'Nueva sucursal'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Sucursal Centro" />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle, número, colonia" />
              </div>
            </div>
            <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear sucursal'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {branches.map((branch) => (
            <TableRow key={branch.id} className={!branch.isActive ? 'opacity-50' : ''}>
              <TableCell className="font-medium">{branch.name}</TableCell>
              <TableCell>{branch.address ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                  {branch.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(branch)}>Editar</Button>
                  <Button variant={branch.isActive ? 'destructive' : 'default'} size="sm" onClick={() => handleToggle(branch.id)}>
                    {branch.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ============================================
// Settings Page
// ============================================

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Administra tu gimnasio.</p>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Usuarios</TabsTrigger>
          <TabsTrigger value="plans">Planes</TabsTrigger>
          <TabsTrigger value="branches">Sucursales</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="mt-4">
          <StaffTab />
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <PlansTab />
        </TabsContent>

        <TabsContent value="branches" className="mt-4">
          <BranchesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}