import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getDashboardData, type DashboardData } from '@/services/dashboard'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const methodLabels: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getDashboardData()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading || !data) {
        return <p className="text-muted-foreground">Cargando dashboard...</p>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Clientes registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{data.totalClients}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Membresías activas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-500">{data.activeMemberships}</p>
                        {data.expiredMemberships > 0 && (
                            <p className="text-sm text-destructive mt-1">
                                {data.expiredMemberships} vencidas
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Ingresos hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatPrice(data.todayIncome)}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.todayPaymentsCount} cobros
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Ingresos del mes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatPrice(data.monthIncome)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Entradas hoy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{data.todayCheckIns}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Membresías vencidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-destructive">{data.expiredMemberships}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tablas de actividad reciente */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Últimos pagos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Últimos pagos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.recentPayments.length === 0 ? (
                            <p className="text-muted-foreground">Sin pagos recientes.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Monto</TableHead>
                                        <TableHead>Método</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recentPayments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium">
                                                {p.clientFirstName} {p.clientLastName}
                                            </TableCell>
                                            <TableCell>{formatPrice(p.amount)}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {methodLabels[p.method] ?? p.method}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Últimas entradas */}
                <Card>
                    <CardHeader>
                        <CardTitle>Últimas entradas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.recentCheckIns.length === 0 ? (
                            <p className="text-muted-foreground">Sin entradas recientes.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead>Sucursal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recentCheckIns.map((ci) => (
                                        <TableRow key={ci.id}>
                                            <TableCell className="font-medium">
                                                {ci.clientFirstName} {ci.clientLastName}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(ci.createdAt).toLocaleTimeString('es-MX', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell>{ci.branchName ?? '—'}</TableCell>
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