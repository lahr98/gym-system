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
import { Plus, X, Trash2 } from 'lucide-react'

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

    const selectClass = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Membresías</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Asigna y gestiona las membresías de tus clientes.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    {showForm ? (
                        <><X className="w-4 h-4" /> Cancelar</>
                    ) : (
                        <><Plus className="w-4 h-4" /> Nueva membresía</>
                    )}
                </Button>
            </div>

            {/* Formulario */}
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
                                    className={selectClass}
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
                                    className={selectClass}
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
                                        className={selectClass}
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
                            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium text-primary">
                                    {selectedPlan.name} — {formatPrice(selectedPlan.price)} — {selectedPlan.durationDays} días
                                </p>
                            </div>
                        )}

                        <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Guardando...' : 'Asignar membresía'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Tabla */}
            <Card>
                <CardContent className="p-0">
                    {memberships.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            No hay membresías activas.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Cliente</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead>Vencimiento</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {memberships.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="pl-6 font-medium text-sm">
                                            {m.clientFirstName} {m.clientLastName}
                                        </TableCell>
                                        <TableCell className="text-sm">{m.planName ?? '—'}</TableCell>
                                        <TableCell className="text-sm font-semibold">
                                            {m.planPrice ? formatPrice(m.planPrice) : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {m.multiBranch ? 'Ambas' : m.branchName ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(m.endDate).toLocaleDateString('es-MX')}
                                        </TableCell>
                                        <TableCell>
                                            {isExpired(m.endDate) ? (
                                                <Badge variant="destructive">Vencida</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Activa</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <button
                                                onClick={() => handleDeactivate(m.id)}
                                                className="w-8 h-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Desactivar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
