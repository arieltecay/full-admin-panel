import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './assets/styles/main.css'
import MainLayout from './components/layout/main-layout'
import LoginPage from './pages/login-page'
import HomeManagement from './pages/home-management'
import ClientsPage from './pages/clients'
import DashboardManagement from './pages/dashboard-management'
import PayrollUpload from './pages/reports/payroll-upload'
import PayrollDashboard from './pages/reports/payroll-dashboard'
import AdminDashboard from './pages/dashboard/main-dashboard'
import ProtectedRoute from './components/layout/protected-route'
import { AuthProvider } from './hooks/use-auth'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="dashboards" element={<DashboardManagement />} />
            <Route path="home-management" element={<HomeManagement />} />
            <Route path="reports" element={<PayrollUpload />} />
            <Route path="reports/payroll/:clientId/:period" element={<PayrollDashboard />} />
            <Route path="settings" element={<div>Configuración del Sistema</div>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
