import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="h-screen flex items-center justify-center">Cargando...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
