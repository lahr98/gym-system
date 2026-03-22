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
    getMemberships, getBranches, createMembership,
    deleteMembership, type Membership, type Branch,
} from '@/services/memberships'
import { getClients, type Client } from '@/services/clients'

const typeLabels: Record<string, string> = {
    daily: 'Pase del día',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    annual: 'Anual',
}

export default function MembershipsPage() {
    const [memberships, setMemberships] = useState<Membership[]>([])
    const [clients, setClients] = useState<Client[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        clientId: '',
        type: 'monthly',
        branchId: '',
        multiBranch: false,
        startDate: new Date().toISOString().split('T')[0],
    })

    const loadData = async () => {
        try {
            const [m, c, b] = await Promise.all([
                getMemberships(),
                getClients(),
                getBranches(),
            ])
            setMemberships(m)
            setClients(c)
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
        if (!form.clientId || !form.type) return
        setSaving(true)

        try {
            await createMembership({
                clientId: form.clientId,
                type: form.type,
                branchId: form.multiBranch ? undefined : form.branchId || undefined,
                multiBranch: form.multiBranch,
                startDate: form.startDate,
            })
            setForm({
                clientId: '',
                type: 'monthly',
                branchId: '',
                multiBranch: false,
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
                                <Label>Tipo de plan *</Label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="daily">Pase del día</option>
                                    <option value="biweekly">Quincenal</option>
                                    <option value="monthly">Mensual</option>
                                    <option value="annual">Anual</option>
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

                            <div className="space-y-2">
                                <Label>Sucursal</Label>
                                <select
                                    value={form.multiBranch ? 'multi' : form.branchId}
                                    onChange={(e) => {
                                        if (e.target.value === 'multi') {
                                            setForm({ ...form, multiBranch: true, branchId: '' })
                                        } else {
                                            setForm({ ...form, multiBranch: false, branchId: e.target.value })
                                        }
                                    }}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Seleccionar sucursal</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                    <option value="multi">Ambas sucursales</option>
                                </select>
                            </div>
                        </div>

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
                                <TableCell>{typeLabels[m.type]}</TableCell>
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