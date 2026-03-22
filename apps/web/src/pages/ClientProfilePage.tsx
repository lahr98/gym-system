import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, useLocation} from 'react-router'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getClientProfile, type ClientProfile } from '@/services/clients'
import { getPlans, getBranches, createMembership, type MembershipPlan, type Branch } from '@/services/memberships'
import { createPayment } from '@/services/payments'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const methodLabels: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
}

export default function ClientProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const passedClient = (location.state as { client?: ClientProfile['client'] })?.client
    console.log('passedClient:', passedClient)

    const [profile, setProfile] = useState<ClientProfile | null>(
        passedClient ? { client: passedClient, membership: null, payments: [] } : null
    )
    const [plans, setPlans] = useState<MembershipPlan[]>([])
    const [branches, setBranches] = useState<Branch[]>([])

    // Estado del formulario de membresía + pago
    const [showMembershipForm, setShowMembershipForm] = useState(false)
    const [searchParams] = useSearchParams()
    useEffect(() => {
        if (searchParams.get('assign') === 'true') {
            setShowMembershipForm(true)
        }
    }, [searchParams])
    useEffect(() => {
        if (passedClient && !profile?.membership) {
            setProfile({ client: passedClient, membership: null, payments: [] })
        }
    }, [passedClient])
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        planId: '',
        branchId: '',
        startDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',

    })

    const selectedPlan = plans.find((p) => p.id === form.planId)

    const loadProfile = async () => {
        if (!id) return
        try {
            const [profileData, plansData, branchesData] = await Promise.all([
                getClientProfile(id),
                getPlans(),
                getBranches(),
            ])
            setProfile(profileData)
            setPlans(plansData)
            setBranches(branchesData)
        } catch (err) {
            console.error(err)
        } finally {
        }
    }

    useEffect(() => {
        loadProfile()
    }, [id])

    const handleAssignMembership = async () => {
        if (!id || !form.planId || !selectedPlan) return
        if (!selectedPlan.multiBranch && !form.branchId) return
        setSaving(true)

        try {
            // 1. Crear membresía
            const membership = await createMembership({
                clientId: id,
                planId: form.planId,
                branchId: selectedPlan.multiBranch ? undefined : form.branchId,
                startDate: form.startDate,
            })

            // 2. Registrar pago
            await createPayment({
                clientId: id,
                membershipId: membership.id,
                amount: selectedPlan.price,
                method: form.paymentMethod,
                branchId: selectedPlan.multiBranch ? undefined : form.branchId,
            })

            setForm({
                planId: '',
                branchId: '',
                startDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'cash',
            })
            setShowMembershipForm(false)
            await loadProfile()
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const isExpired = (endDate: string) => new Date(endDate) < new Date()

    if (!profile && !passedClient) {
        return <p className="text-muted-foreground">Cargando perfil...</p>
    }

    const displayProfile = profile || {
        client: passedClient!,
        membership: null,
        payments: [],
    }

    const { client, membership, payments } = displayProfile

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" className="mb-2" onClick={() => navigate('/clients')}>
                        ← Volver a clientes
                    </Button>
                    <h1 className="text-2xl font-bold">{client.firstName} {client.lastName}</h1>
                    <p className="text-muted-foreground">
                        Registrado el {new Date(client.createdAt).toLocaleDateString('es-MX')}
                    </p>
                </div>
            </div>

            {/* Datos personales */}
            <Card>
                <CardHeader>
                    <CardTitle>Datos personales</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Email:</span>{' '}
                            {client.email ?? 'No registrado'}
                        </div>
                        <div>
                            <span className="text-muted-foreground">Teléfono:</span>{' '}
                            {client.phone ?? 'No registrado'}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Membresía activa */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Membresía</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => setShowMembershipForm(!showMembershipForm)}
                        >
                            {showMembershipForm ? 'Cancelar' : membership ? 'Renovar' : 'Asignar plan'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {membership ? (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Plan:</span>{' '}
                                {membership.planName}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Precio:</span>{' '}
                                {membership.planPrice ? formatPrice(membership.planPrice) : '—'}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Sucursal:</span>{' '}
                                {membership.multiBranch ? 'Ambas sucursales' : membership.branchName ?? '—'}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Estado:</span>{' '}
                                {isExpired(membership.endDate) ? (
                                    <Badge variant="destructive">Vencida</Badge>
                                ) : (
                                    <Badge variant="default">Activa</Badge>
                                )}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Inicio:</span>{' '}
                                {new Date(membership.startDate).toLocaleDateString('es-MX')}
                            </div>
                            <div>
                                <span className="text-muted-foreground">Vencimiento:</span>{' '}
                                {new Date(membership.endDate).toLocaleDateString('es-MX')}
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Sin membresía asignada.</p>
                    )}

                    {/* Formulario de asignar/renovar membresía + cobro */}
                    {showMembershipForm && (
                        <>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-2 gap-4">
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
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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

                                <div className="space-y-2">
                                    <Label>Método de pago *</Label>
                                    <select
                                        value={form.paymentMethod}
                                        onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="cash">Efectivo</option>
                                        <option value="transfer">Transferencia / SPEI</option>
                                        <option value="card">Tarjeta</option>
                                    </select>
                                </div>
                            </div>

                            {selectedPlan && (
                                <div className="mt-4 p-3 rounded-md bg-accent">
                                    <p className="text-sm font-medium">
                                        Cobro: {selectedPlan.name} — {formatPrice(selectedPlan.price)} — {selectedPlan.durationDays} días — Pago con {methodLabels[form.paymentMethod]}
                                    </p>
                                </div>
                            )}

                            <Button className="mt-4" onClick={handleAssignMembership} disabled={saving}>
                                {saving ? 'Procesando...' : 'Asignar plan y registrar cobro'}
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Historial de pagos */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de pagos</CardTitle>
                </CardHeader>
                <CardContent>
                    {payments.length === 0 ? (
                        <p className="text-muted-foreground">Sin pagos registrados.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead>Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell>
                                            {new Date(p.createdAt).toLocaleDateString('es-MX')}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatPrice(p.amount)}
                                        </TableCell>
                                        <TableCell>{methodLabels[p.method] ?? p.method}</TableCell>
                                        <TableCell>{p.branchName ?? '—'}</TableCell>
                                        <TableCell>{p.notes ?? '—'}</TableCell>
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