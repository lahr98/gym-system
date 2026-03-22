import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ClientsPage from '@/pages/ClientsPage'
import ClientProfilePage from '@/pages/ClientProfilePage'
import MembershipsPage from '@/pages/MembershipsPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import PaymentsPage from '@/pages/PaymentsPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <DashboardPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clients"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <ClientsPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/clients/:id"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <ClientProfilePage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/memberships"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <MembershipsPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout>
                                <PaymentsPage />
                            </DashboardLayout>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    )
}

export default App