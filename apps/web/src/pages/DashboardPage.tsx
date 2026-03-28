import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getDashboardData, type DashboardData } from '@/services/dashboard'
import {
    Users,
    CreditCard,
    TrendingUp,
    DollarSign,
    ScanLine,
    AlertTriangle,
} from 'lucide-react'

function formatPrice(cents: number): string {
    return `$${(cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
}

const methodLabels: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
}

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: React.ElementType
    iconColor?: string
    iconBg?: string
    valueColor?: string
}

function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'text-primary', iconBg = 'bg-primary/10', valueColor }: StatCardProps) {
    return (
        <Card>
            <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        <p className={`text-3xl font-bold mt-1 ${valueColor ?? ''}`}>{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
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
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Resumen general de tu gimnasio.</p>
            </div>

            {/* Tarjetas principales */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard
                    title="Clientes registrados"
                    value={data.totalClients}
                    icon={Users}
                    iconColor="text-primary"
                    iconBg="bg-primary/10"
                />
                <StatCard
                    title="Membresías activas"
                    value={data.activeMemberships}
                    subtitle={data.expiredMemberships > 0 ? `${data.expiredMemberships} vencidas` : undefined}
                    icon={CreditCard}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                    valueColor="text-emerald-600"
                />
                <StatCard
                    title="Ingresos hoy"
                    value={formatPrice(data.todayIncome)}
                    subtitle={`${data.todayPaymentsCount} cobros`}
                    icon={TrendingUp}
                    iconColor="text-primary"
                    iconBg="bg-primary/10"
                />
                <StatCard
                    title="Ingresos del mes"
                    value={formatPrice(data.monthIncome)}
                    icon={DollarSign}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                />
            </div>

            {/* Segunda fila */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard
                    title="Entradas hoy"
                    value={data.todayCheckIns}
                    icon={ScanLine}
                    iconColor="text-sky-600"
                    iconBg="bg-sky-50"
                />
                <StatCard
                    title="Membresías vencidas"
                    value={data.expiredMemberships}
                    icon={AlertTriangle}
                    iconColor="text-destructive"
                    iconBg="bg-destructive/10"
                    valueColor="text-destructive"
                />
            </div>

            {/* Tablas de actividad reciente */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Últimos pagos */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Últimos pagos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.recentPayments.length === 0 ? (
                            <p className="text-muted-foreground text-sm px-6 pb-6">Sin pagos recientes.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">Cliente</TableHead>
                                        <TableHead>Monto</TableHead>
                                        <TableHead className="pr-6">Método</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recentPayments.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="pl-6 font-medium text-sm">
                                                {p.clientFirstName} {p.clientLastName}
                                            </TableCell>
                                            <TableCell className="text-sm font-bold">
                                                {formatPrice(p.amount)}
                                            </TableCell>
                                            <TableCell className="pr-6">
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
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Últimas entradas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {data.recentCheckIns.length === 0 ? (
                            <p className="text-muted-foreground text-sm px-6 pb-6">Sin entradas recientes.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">Cliente</TableHead>
                                        <TableHead>Hora</TableHead>
                                        <TableHead className="pr-6">Sucursal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.recentCheckIns.map((ci) => (
                                        <TableRow key={ci.id}>
                                            <TableCell className="pl-6 font-medium text-sm">
                                                {ci.clientFirstName} {ci.clientLastName}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {new Date(ci.createdAt).toLocaleTimeString('es-MX', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
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
