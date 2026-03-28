import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    getClients,
    createClient,
    deleteClient,
    type Client,
    type CreateClientData,
} from '@/services/clients'
import { UserPlus, Eye, Trash2, Filter, X } from 'lucide-react'

function getInitials(firstName: string, lastName: string) {
    return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
    return (
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(firstName, lastName)}
        </div>
    )
}

export default function ClientsPage() {
    const navigate = useNavigate()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [form, setForm] = useState<CreateClientData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    })
    const [saving, setSaving] = useState(false)

    const loadClients = async () => {
        try {
            const data = await getClients()
            setClients(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadClients()
    }, [])

    const handleSubmit = async () => {
        if (!form.firstName || !form.lastName) return
        setSaving(true)
        try {
            const newClient = await createClient(form)
            navigate(`/clients/${newClient.id}?assign=true`, {
                state: { cliente: newClient },
            })
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleDeactivate = async (id: string) => {
        if (!confirm('¿Desactivar este cliente?')) return
        try {
            await deleteClient(id)
            await loadClients()
        } catch (err) {
            console.error(err)
        }
    }

    const filtered = clients.filter((c) => {
        const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
        const email = (c.email ?? '').toLowerCase()
        const q = search.toLowerCase()
        return fullName.includes(q) || email.includes(q)
    })

    const hasFilters = search.length > 0

    if (loading) {
        return <p className="text-muted-foreground">Cargando clientes...</p>
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gestiona la base de datos de tus socios y sus estados.
                    </p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="gap-2">
                    {showForm ? (
                        <>
                            <X className="w-4 h-4" />
                            Cancelar
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4" />
                            Nuevo Cliente
                        </>
                    )}
                </Button>
            </div>

            {/* Formulario de nuevo cliente */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Registrar nuevo cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre *</Label>
                                <Input
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Apellido *</Label>
                                <Input
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    placeholder="Apellido"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="271 123 4567"
                                />
                            </div>
                        </div>
                        <Button className="mt-4" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Guardando...' : 'Guardar cliente'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Filtros */}
            <Card>
                <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
                            <Filter className="w-3.5 h-3.5" />
                            Filtros:
                        </div>
                        <Input
                            placeholder="Buscar por nombre o email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-xs h-9 text-sm"
                        />
                        {hasFilters && (
                            <button
                                onClick={() => setSearch('')}
                                className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors ml-auto"
                            >
                                <X className="w-3.5 h-3.5" />
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Card>
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            {hasFilters ? 'No hay clientes que coincidan con la búsqueda.' : 'No hay clientes registrados.'}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Cliente</TableHead>
                                    <TableHead>Teléfono</TableHead>
                                    <TableHead>Registro</TableHead>
                                    <TableHead className="text-right pr-6">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((client) => (
                                    <TableRow key={client.id} className="group">
                                        <TableCell className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <Avatar firstName={client.firstName} lastName={client.lastName} />
                                                <div>
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/clients/${client.id}`, {
                                                                state: { client },
                                                            })
                                                        }
                                                        className="font-medium text-sm hover:text-primary transition-colors text-left"
                                                    >
                                                        {client.firstName} {client.lastName}
                                                    </button>
                                                    <p className="text-xs text-muted-foreground">
                                                        {client.email ?? '—'}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {client.phone ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(client.createdAt).toLocaleDateString('es-MX')}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() =>
                                                        navigate(`/clients/${client.id}`, {
                                                            state: { client },
                                                        })
                                                    }
                                                    className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                                    title="Ver perfil"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(client.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                    title="Desactivar cliente"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Footer count */}
            {filtered.length > 0 && (
                <p className="text-xs text-muted-foreground px-1">
                    Mostrando <span className="font-medium text-foreground">{filtered.length}</span> de{' '}
                    <span className="font-medium text-foreground">{clients.length}</span> clientes
                </p>
            )}
        </div>
    )
}
