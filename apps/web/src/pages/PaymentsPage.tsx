import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getPayments, type Payment } from '@/services/payments'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const methodLabels: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
}

const methodColors: Record<string, 'default' | 'secondary' | 'outline'> = {
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
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Pagos</h1>
            </div>

            {/* Resumen rápido */}
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border p-4">
                    <p className="text-sm text-muted-foreground">Ingresos hoy</p>
                    <p className="text-2xl font-bold">{formatPrice(totalToday)}</p>
                </div>
                <div className="rounded-md border border-border p-4">
                    <p className="text-sm text-muted-foreground">Ingresos del mes</p>
                    <p className="text-2xl font-bold">{formatPrice(totalMonth)}</p>
                </div>
            </div>

            {/* Buscador */}
            <input
                placeholder="Buscar por nombre de cliente..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

            {/* Tabla */}
            {filtered.length === 0 ? (
                <p className="text-muted-foreground">No hay pagos registrados.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead>Sucursal</TableHead>
                            <TableHead>Notas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>
                                    {new Date(p.createdAt).toLocaleDateString('es-MX', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {p.clientFirstName} {p.clientLastName}
                                </TableCell>
                                <TableCell className="font-bold">
                                    {formatPrice(p.amount)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={methodColors[p.method] ?? 'default'}>
                                        {methodLabels[p.method] ?? p.method}
                                    </Badge>
                                </TableCell>
                                <TableCell>{p.branchName ?? '—'}</TableCell>
                                <TableCell>{p.notes ?? '—'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    )
}