import { Link, useLocation } from 'react-router'
import { useSession } from '@/hooks/useSession'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router'

const navigation = [
    { name: 'Dashboard', path: '/dashboard', roles: ['owner', 'receptionist', 'trainer'] },
    { name: 'Clientes', path: '/clients', roles: ['owner', 'receptionist'] },
    { name: 'Membresías', path: '/memberships', roles: ['owner', 'receptionist'] },
    { name: 'Pagos', path: '/payments', roles: ['owner', 'receptionist'] },
    { name: 'Check-in', path: '/checkin', roles: ['owner', 'receptionist'] },
    { name: 'Clases', path: '/classes', roles: ['owner', 'trainer'] },
]

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { data: session } = useSession()
    const location = useLocation()
    const navigate = useNavigate()
    const userRole = (session?.user as { role?: string })?.role ?? 'receptionist'

    const handleLogout = async () => {
        await authClient.signOut()
        navigate('/login')
    }

    const filteredNav = navigation.filter((item) => item.roles.includes(userRole))

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold">Gym System</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {session?.user?.name}
                    </p>
                    <Badge role={userRole} />
                </div>

                <Separator />

                <nav className="flex-1 p-4 space-y-1">
                    {filteredNav.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-accent text-accent-foreground'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}

function Badge({ role }: { role: string }) {
    const labels: Record<string, string> = {
        owner: 'Dueño',
        receptionist: 'Recepcionista',
        trainer: 'Entrenador',
    }

    return (
        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
      {labels[role] ?? role}
    </span>
    )
}