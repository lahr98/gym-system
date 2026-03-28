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
import { Plus, X, Pencil } from 'lucide-react'

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
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Planes de membresía</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Configura los planes disponibles para tus clientes.
                    </p>
                </div>
                <Button onClick={() => { showForm ? resetForm() : setShowForm(true) }} className="gap-2">
                    {showForm ? (
                        <><X className="w-4 h-4" /> Cancelar</>
                    ) : (
                        <><Plus className="w-4 h-4" /> Nuevo plan</>
                    )}
                </Button>
            </div>

            {/* Formulario */}
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
                            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                <p className="text-sm font-medium text-primary">
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

            {/* Tabla */}
            <Card>
                <CardContent className="p-0">
                    {plans.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            No hay planes registrados.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Nombre</TableHead>
                                    <TableHead>Duración</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Sucursales</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {plans.map((plan) => (
                                    <TableRow key={plan.id} className={!plan.isActive ? 'opacity-50' : ''}>
                                        <TableCell className="pl-6 font-medium text-sm">{plan.name}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{plan.durationDays} días</TableCell>
                                        <TableCell className="text-sm font-semibold">{formatPrice(plan.price)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {plan.multiBranch ? 'Ambas' : 'Una'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={plan.isActive
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                    : ''}
                                                variant={plan.isActive ? 'default' : 'secondary'}
                                            >
                                                {plan.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEdit(plan)}
                                                    className="w-8 h-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
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
                </CardContent>
            </Card>
        </div>
    )
}
