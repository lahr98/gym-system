import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const { data: session, isPending } = authClient.useSession()

    useEffect(() => {
        if (session && !isPending) {
            navigate('/dashboard')
        }
    }, [session, isPending])

    const handleLogin = async () => {
        setError('')
        setLoading(true)

        const { error: authError } = await authClient.signIn.email({
            email,
            password,
        })

        setLoading(false)

        if (authError) {
            setError(authError.message ?? 'Error al iniciar sesión')
            return
        }

        navigate('/dashboard')
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm space-y-6 p-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-bold">Gym System</h1>
                    <p className="text-muted-foreground">Inicia sesión para continuar</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <Button
                        className="w-full"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Iniciar sesión'}
                    </Button>
                </div>
            </div>
        </div>
    )
}