import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import { useAuth } from '../../hooks/use-auth';
import { useSidebar } from '../../context/sidebar-context';

const MainLayout = () => {
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex">
      <Sidebar />
      <main className={`flex-1 p-8 min-h-screen bg-slate-50 transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Bienvenido, {user?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-black text-slate-800">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{user?.email}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-600/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
