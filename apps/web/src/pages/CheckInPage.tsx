import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getClients, type Client } from '@/services/clients'
import { getBranches, type Branch } from '@/services/memberships'
import { getTodayCheckIns, registerCheckIn, type CheckIn, type CheckInResult } from '@/services/checkins'

export default function CheckInPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [branches, setBranches] = useState<Branch[]>([])
    const [todayCheckIns, setTodayCheckIns] = useState<CheckIn[]>([])
    const [search, setSearch] = useState('')
    const [selectedBranch, setSelectedBranch] = useState('')
    const [result, setResult] = useState<CheckInResult | null>(null)
    const [loading, setLoading] = useState(true)
    const searchRef = useRef<HTMLInputElement>(null)

    const loadData = async () => {
        try {
            const [c, b, ci] = await Promise.all([
                getClients(),
                getBranches(),
                getTodayCheckIns(),
            ])
            setClients(c)
            setBranches(b)
            setTodayCheckIns(ci)
            if (b.length > 0 && !selectedBranch) {
                setSelectedBranch(b[0].id)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleCheckIn = async (clientId: string) => {
        if (!selectedBranch) return

        const res = await registerCheckIn(clientId, selectedBranch)
        setResult(res)
        setSearch('')

        if (!res.error) {
            await loadData()
        }

        // Limpiar resultado después de 4 segundos
        setTimeout(() => setResult(null), 4000)

        // Devolver foco al buscador
        searchRef.current?.focus()
    }

    const filtered = search.length >= 2
        ? clients.filter((c) => {
            const fullName = `${c.firstName} ${c.lastName}`.toLowerCase()
            return fullName.includes(search.toLowerCase())
        })
        : []

    if (loading) {
        return <p className="text-muted-foreground">Cargando...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Check-in</h1>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sucursal:</span>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Resultado del check-in */}
            {result && (
                <Card className={result.error ? 'border-destructive' : 'border-green-500'}>
                    <CardContent className="py-4">
                        <p className={`text-lg font-bold ${result.error ? 'text-destructive' : 'text-green-500'}`}>
                            {result.message}
                        </p>
                        {result.plan && (
                            <p className="text-sm text-muted-foreground">Plan: {result.plan}</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Buscador de clientes */}
            <div className="space-y-2">
                <Input
                    ref={searchRef}
                    placeholder="Buscar cliente por nombre (mínimo 2 letras)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="text-lg py-6"
                    autoFocus
                />

                {filtered.length > 0 && (
                    <div className="rounded-md border border-border">
                        {filtered.slice(0, 8).map((client) => (
                            <button
                                key={client.id}
                                onClick={() => handleCheckIn(client.id)}
                                className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-left border-b border-border last:border-0 transition-colors"
                            >
                <span className="font-medium">
                  {client.firstName} {client.lastName}
                </span>
                                <span className="text-sm text-muted-foreground">
                  Registrar entrada →
                </span>
                            </button>
                        ))}
                    </div>
                )}

                {search.length >= 2 && filtered.length === 0 && (
                    <p className="text-sm text-muted-foreground">No se encontraron clientes.</p>
                )}
            </div>

            {/* Check-ins de hoy */}
            <div>
                <h2 className="text-lg font-semibold mb-3">
                    Entradas de hoy ({todayCheckIns.length})
                </h2>
                {todayCheckIns.length === 0 ? (
                    <p className="text-muted-foreground">Sin entradas registradas hoy.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hora</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Sucursal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {todayCheckIns.map((ci) => (
                                <TableRow key={ci.id}>
                                    <TableCell>
                                        {new Date(ci.createdAt).toLocaleTimeString('es-MX', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {ci.clientFirstName} {ci.clientLastName}
                                    </TableCell>
                                    <TableCell>{ci.branchName ?? '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    )
}