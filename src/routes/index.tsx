import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/layout/main-layout';
import LoginPage from '../pages/login-page';
import HomeManagement from '../pages/home-management';
import ClientsPage from '../pages/clients';
import DashboardManagement from '../pages/dashboard-management';
import PayrollUpload from '../pages/reports/payroll-upload';
import PayrollDashboard from '../pages/reports/payroll-dashboard';
import DashboardPreview from '../pages/dashboard-preview';
import AdminDashboard from '../pages/dashboard/main-dashboard';
import ProtectedRoute from '../components/layout/protected-route';
import { AuthProvider } from '../hooks/use-auth';
import { SidebarProvider } from '../context/sidebar-context';

const AppLayout = () => (
  <AuthProvider>
    <SidebarProvider>
      <Outlet />
    </SidebarProvider>
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'clients',
            element: <ClientsPage />,
          },
          {
            path: 'dashboards',
            element: <DashboardManagement />,
          },
          {
            path: 'home-management',
            element: <HomeManagement />,
          },
          {
            path: 'reports',
            element: <PayrollUpload />,
          },
          {
            path: 'reports/payroll/:clientId/:period',
            element: <PayrollDashboard />,
          },
          {
            path: 'dashboard-preview/:dashboardId',
            element: <DashboardPreview />,
          },
          {
            path: 'settings',
            element: <div>Configuración del Sistema</div>,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
