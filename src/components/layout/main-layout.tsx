import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import { useAuth } from '../../hooks/use-auth';

const MainLayout = () => {
  const { user } = useAuth();

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 min-h-screen bg-slate-50">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-slate-800">Panel de Control</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500">Admin: {user?.email}</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
