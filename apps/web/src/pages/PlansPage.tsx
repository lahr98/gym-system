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
    getPlans, createPlan, updatePlan, togglePlan, type Plan, type CreatePlanData,
} from '@/services/plans'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

export default function PlansPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<CreatePlanData>({
        name: '',
        durationDays: 30,
        price: 0,
        multiBranch: false,
    })
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

    useEffect(() => {
        loadPlans()
    }, [])

    const resetForm = () => {
        setForm({ name: '', durationDays: 30, price: 0, multiBranch: false })
        setPriceDisplay('')
        setEditingId(null)
        setShowForm(false)
    }

    const handlePriceChange = (value: string) => {
        setPriceDisplay(value)
        const num = parseFloat(value)
        if (!isNaN(num)) {
            setForm({ ...form, price: Math.round(num * 100) })
        }
    }

    const handleEdit = (plan: Plan) => {
        setForm({
            name: plan.name,
            durationDays: plan.durationDays,
            price: plan.price,
            multiBranch: plan.multiBranch,
        })
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

    if (loading) {
        return <p className="text-muted-foreground">Cargando planes...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Planes de membresía</h1>
                <Button onClick={() => {
                    if (showForm) {
                        resetForm()
                    } else {
                        setShowForm(true)
                    }
                }}>
                    {showForm ? 'Cancelar' : 'Nuevo plan'}
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? 'Editar plan' : 'Crear nuevo plan'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre del plan *</Label>
                                <Input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ej: Mensualidad"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Duración (días) *</Label>
                                <Input
                                    type="number"
                                    value={form.durationDays}
                                    onChange={(e) => setForm({ ...form, durationDays: parseInt(e.target.value) || 0 })}
                                    placeholder="30"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Precio (MXN) *</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={priceDisplay}
                                    onChange={(e) => handlePriceChange(e.target.value)}
                                    placeholder="550.00"
                                />
                            </div>

                            <div className="flex items-end gap-3 pb-1">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.multiBranch}
                                        onChange={(e) => setForm({ ...form, multiBranch: e.target.checked })}
                                        className="rounded"
                                    />
                                    Acceso a ambas sucursales
                                </label>
                            </div>
                        </div>

                        {form.name && form.price > 0 && (
                            <div className="mt-4 p-3 rounded-md bg-accent">
                                <p className="text-sm font-medium">
                                    {form.name} — {formatPrice(form.price)} — {form.durationDays} días
                                    {form.multiBranch ? ' — Multi-sucursal' : ''}
                                </p>
                            </div>
                        )}

                        <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear plan'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {plans.length === 0 ? (
                <p className="text-muted-foreground">No hay planes registrados.</p>
            ) : (
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
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(plan)}
                                        >
                                            Editar
                                        </Button>
                                        <Button
                                            variant={plan.isActive ? 'destructive' : 'default'}
                                            size="sm"
                                            onClick={() => handleToggle(plan.id)}
                                        >
                                            {plan.isActive ? 'Desactivar' : 'Activar'}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}
