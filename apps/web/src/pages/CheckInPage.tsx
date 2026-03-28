import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getClients, type Client } from '@/services/clients'
import { getBranches, type Branch } from '@/services/memberships'
import { getTodayCheckIns, registerCheckIn, type CheckIn, type CheckInResult } from '@/services/checkins'
import { CheckCircle2, XCircle, ScanLine } from 'lucide-react'

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
        setTimeout(() => setResult(null), 4000)
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

    const selectClass = 'rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Check-in</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Registra la entrada de los socios al gimnasio.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Sucursal:</span>
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className={selectClass}
                    >
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Resultado del check-in */}
            {result && (
                <Card className={result.error ? 'border-destructive bg-destructive/5' : 'border-emerald-500 bg-emerald-50'}>
                    <CardContent className="py-4 flex items-center gap-3">
                        {result.error ? (
                            <XCircle className="w-6 h-6 text-destructive shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        )}
                        <div>
                            <p className={`text-base font-bold ${result.error ? 'text-destructive' : 'text-emerald-700'}`}>
                                {result.message}
                            </p>
                            {result.plan && (
                                <p className="text-sm text-muted-foreground">Plan: {result.plan}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Buscador */}
            <Card>
                <CardContent className="pt-5 pb-5">
                    <div className="space-y-2">
                        <div className="relative">
                            <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                placeholder="Buscar cliente por nombre (mínimo 2 letras)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 text-base py-5"
                                autoFocus
                            />
                        </div>

                        {filtered.length > 0 && (
                            <div className="rounded-lg border border-border overflow-hidden">
                                {filtered.slice(0, 8).map((client) => (
                                    <button
                                        key={client.id}
                                        onClick={() => handleCheckIn(client.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent text-left border-b border-border last:border-0 transition-colors"
                                    >
                                        <span className="font-medium text-sm">
                                            {client.firstName} {client.lastName}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
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
                </CardContent>
            </Card>

            {/* Check-ins de hoy */}
            <div>
                <h2 className="text-base font-semibold mb-3">
                    Entradas de hoy
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                        ({todayCheckIns.length} registradas)
                    </span>
                </h2>
                <Card>
                    <CardContent className="p-0">
                        {todayCheckIns.length === 0 ? (
                            <div className="py-10 text-center text-muted-foreground text-sm">
                                Sin entradas registradas hoy.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">Hora</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead className="pr-6">Sucursal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {todayCheckIns.map((ci) => (
                                        <TableRow key={ci.id}>
                                            <TableCell className="pl-6 text-sm text-muted-foreground">
                                                {new Date(ci.createdAt).toLocaleTimeString('es-MX', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">
                                                {ci.clientFirstName} {ci.clientLastName}
                                            </TableCell>
                                            <TableCell className="pr-6 text-sm text-muted-foreground">
                                                {ci.branchName ?? '—'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
