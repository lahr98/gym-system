import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
    getMemberships, getPlans, getBranches, createMembership,
    deleteMembership, type Membership, type MembershipPlan, type Branch,
} from '@/services/memberships'
import { getClients, type Client } from '@/services/clients'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

export default function MembershipsPage() {
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [plans, setPlans] = useState<MembershipPlan[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        clientId: '',
        planId: '',
        branchId: '',
        startDate: new Date().toISOString().split('T')[0],
    })

    const selectedPlan = plans.find((p) => p.id === form.planId)

    const loadData = async () => {
        try {
            const [m, c, p, b] = await Promise.all([
                getMemberships(),
                getClients(),
                getPlans(),
                getBranches(),
            ])
            setMemberships(m)
            setClients(c)
            setPlans(p)
            setBranches(b)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSubmit = async () => {
        if (!form.clientId || !form.planId) return
        if (!selectedPlan?.multiBranch && !form.branchId) return
        setSaving(true)

        try {
            await createMembership({
                clientId: form.clientId,
                planId: form.planId,
                branchId: selectedPlan?.multiBranch ? undefined : form.branchId,
                startDate: form.startDate,
            })
            setForm({
                clientId: '',
                planId: '',
                branchId: '',
                startDate: new Date().toISOString().split('T')[0],
            })
            setShowForm(false)
            await loadData()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDeactivate = async (id: string) => {
        if (!confirm('¿Desactivar esta membresía?')) return
        try {
            await deleteMembership(id)
            await loadData()
        } catch (err) {
            console.error(err)
        }
    }

    const isExpired = (endDate: string) => new Date(endDate) < new Date()

    if (loading) {
        return <p className="text-muted-foreground">Cargando membresías...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Membresías</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancelar' : 'Nueva membresía'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Asignar membresía</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cliente *</Label>
                                <select
                                    value={form.clientId}
                                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Seleccionar cliente</option>
                                    {clients.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.firstName} {c.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Plan *</Label>
                                <select
                                    value={form.planId}
                                    onChange={(e) => setForm({ ...form, planId: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Seleccionar plan</option>
                                    {plans.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} — {formatPrice(p.price)} ({p.durationDays} días)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Fecha de inicio</Label>
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                />
                            </div>

                            {selectedPlan && !selectedPlan.multiBranch && (
                                <div className="space-y-2">
                                    <Label>Sucursal *</Label>
                                    <select
                                        value={form.branchId}
                                        onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Seleccionar sucursal</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {selectedPlan?.multiBranch && (
                                <div className="flex items-end">
                                    <p className="text-sm text-muted-foreground">
                                        Este plan incluye acceso a ambas sucursales.
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedPlan && (
                            <div className="mt-4 p-3 rounded-md bg-accent">
                                <p className="text-sm font-medium">
                                    Resumen: {selectedPlan.name} — {formatPrice(selectedPlan.price)} — {selectedPlan.durationDays} días
                                </p>
                            </div>
                        )}

                        <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Guardando...' : 'Asignar membresía'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {memberships.length === 0 ? (
                <p className="text-muted-foreground">No hay membresías activas.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Sucursal</TableHead>
                            <TableHead>Inicio</TableHead>
                            <TableHead>Vencimiento</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {memberships.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell className="font-medium">
                                    {m.clientFirstName} {m.clientLastName}
                                </TableCell>
                                <TableCell>{m.planName ?? '—'}</TableCell>
                                <TableCell>{m.planPrice ? formatPrice(m.planPrice) : '—'}</TableCell>
                                <TableCell>{m.multiBranch ? 'Ambas' : m.branchName ?? '—'}</TableCell>
                                <TableCell>
                                    {new Date(m.startDate).toLocaleDateString('es-MX')}
                                </TableCell>
                                <TableCell>
                                    {new Date(m.endDate).toLocaleDateString('es-MX')}
                                </TableCell>
                                <TableCell>
                                    {isExpired(m.endDate) ? (
                                        <Badge variant="destructive">Vencida</Badge>
                                    ) : (
                                        <Badge variant="default">Activa</Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeactivate(m.id)}
                                    >
                                        Desactivar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}