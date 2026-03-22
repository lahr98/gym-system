import { useSession } from '@/hooks/useSession'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

export default function DashboardPage() {
    const { data: session } = useSession()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await authClient.signOut()
        navigate('/login')
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Bienvenido, {session?.user?.name}
                    </p>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                    Cerrar sesión
                </Button>
            </div>
        </div>
    )
}