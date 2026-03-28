import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getPayments, type Payment } from '@/services/payments'
import { TrendingUp, DollarSign, Filter } from 'lucide-react'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const methodLabels: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
}

const methodVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
    cash: 'default',
    transfer: 'secondary',
    card: 'outline',
}

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        getPayments()
            .then(setPayments)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const filtered = payments.filter((p) => {
        const name = `${p.clientFirstName} ${p.clientLastName}`.toLowerCase()
        return name.includes(filter.toLowerCase())
    })

    const totalToday = payments
        .filter((p) => new Date(p.createdAt).toDateString() === new Date().toDateString())
        .reduce((sum, p) => sum + p.amount, 0)

    const totalMonth = payments
        .filter((p) => {
            const d = new Date(p.createdAt)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((sum, p) => sum + p.amount, 0)

    if (loading) {
        return <p className="text-muted-foreground">Cargando pagos...</p>
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold">Pagos</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Historial de ingresos y cobros registrados.
                </p>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Ingresos hoy</p>
                                <p className="text-3xl font-bold mt-1">{formatPrice(totalToday)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-5 pb-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Ingresos del mes</p>
                                <p className="text-3xl font-bold mt-1">{formatPrice(totalMonth)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtro */}
            <Card>
                <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
                            <Filter className="w-3.5 h-3.5" />
                            Filtros:
                        </div>
                        <Input
                            placeholder="Buscar por nombre de cliente..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="max-w-xs h-9 text-sm"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Card>
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground text-sm">
                            No hay pagos registrados.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="pl-6">Fecha</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Monto</TableHead>
                                    <TableHead>Método</TableHead>
                                    <TableHead>Sucursal</TableHead>
                                    <TableHead className="pr-6">Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="pl-6 text-sm text-muted-foreground">
                                            {new Date(p.createdAt).toLocaleDateString('es-MX', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {p.clientFirstName} {p.clientLastName}
                                        </TableCell>
                                        <TableCell className="font-bold text-sm">
                                            {formatPrice(p.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={methodVariants[p.method] ?? 'default'}>
                                                {methodLabels[p.method] ?? p.method}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {p.branchName ?? '—'}
                                        </TableCell>
                                        <TableCell className="pr-6 text-sm text-muted-foreground">
                                            {p.notes ?? '—'}
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
