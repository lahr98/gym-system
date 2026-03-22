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
            navigate(`/clients/${newClient.id}?assign=true`,{
                state: { cliente: newClient }
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
        return fullName.includes(search.toLowerCase())
    })

    if (loading) {
        return <p className="text-muted-foreground">Cargando clientes...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Clientes</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancelar' : 'Nuevo cliente'}
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

            {/* Buscador */}
            <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
            />

            {/* Tabla de clientes */}
            {filtered.length === 0 ? (
                <p className="text-muted-foreground">No hay clientes registrados.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Registro</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">

                                    <a href={`/clients/${client.id}`}
                                    onClick={(e) => {
                                    e.preventDefault()
                                    navigate(`/clients/${client.id}`,{
                                        state: {client }
                                    })
                                }}
                                    className="text-primary underline hover:no-underline cursor-pointer"
                                    >
                                    {client.firstName} {client.lastName}
                                </a>
                            </TableCell>
                                <TableCell>{client.email ?? '—'}</TableCell>
                                <TableCell>{client.phone ?? '—'}</TableCell>
                                <TableCell>
                                    {new Date(client.createdAt).toLocaleDateString('es-MX')}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeactivate(client.id)}
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