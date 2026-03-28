import { Link, useLocation } from 'react-router'
import { useSession } from '@/hooks/useSession'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Banknote,
    ScanLine,
    Package,
    Dumbbell,
    Settings,
    Bell,
    LogOut,
    Search,
} from 'lucide-react'

const navigation = [
    { name: 'Dashboard',   path: '/dashboard',   icon: LayoutDashboard, roles: ['owner', 'receptionist', 'trainer'] },
    { name: 'Clientes',    path: '/clients',      icon: Users,           roles: ['owner', 'receptionist'] },
    { name: 'Membresías',  path: '/memberships',  icon: CreditCard,      roles: ['owner', 'receptionist'] },
    { name: 'Pagos',       path: '/payments',     icon: Banknote,        roles: ['owner', 'receptionist'] },
    { name: 'Check-in',    path: '/checkin',      icon: ScanLine,        roles: ['owner', 'receptionist'] },
    { name: 'Planes',      path: '/plans',        icon: Package,         roles: ['owner'] },
]

const roleLabels: Record<string, string> = {
    owner: 'Dueño',
    receptionist: 'Recepcionista',
    trainer: 'Entrenador',
}

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { data: session } = useSession()
    const location = useLocation()
    const navigate = useNavigate()
    const userRole = (session?.user as { role?: string })?.role ?? 'receptionist'
    const userName = session?.user?.name ?? ''

    const handleLogout = async () => {
        await authClient.signOut()
        navigate('/login')
    }

    const filteredNav = navigation.filter((item) => item.roles.includes(userRole))

    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 py-5">
                    <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
                        <Dumbbell className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-bold leading-tight">Gym System</p>
                        <p className="text-xs text-muted-foreground leading-tight">{roleLabels[userRole] ?? userRole}</p>
                    </div>
                </div>

                <Separator />

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    {filteredNav.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <Separator />

                {/* Footer sidebar */}
                <div className="px-3 py-4 space-y-0.5">
                    <Link
                        to="/settings"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                        <Settings className="w-4 h-4 shrink-0" />
                        Configuración
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Right side */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top header */}
                <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                        </button>

                        <Separator orientation="vertical" className="h-8" />

                        <div className="flex items-center gap-2.5">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium leading-tight">{userName}</p>
                                <p className="text-xs text-muted-foreground leading-tight">{roleLabels[userRole] ?? userRole}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
                                {initials || '?'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
