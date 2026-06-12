import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Home, Settings, 
  LogOut, Users, ChevronLeft, Menu,
  Database, BarChart3
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { useSidebar } from '../../context/sidebar-context';

const Sidebar = () => {
  const { logout } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={20} />, label: 'Clientes', path: '/clients' },
    { icon: <BarChart3 size={20} />, label: 'Gestión BI', path: '/dashboards' },
    { icon: <Database size={20} />, label: 'Carga de Datos', path: '/reports' },
    { icon: <Home size={20} />, label: 'Home', path: '/home-management' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/settings' },
  ];

  return (
    <aside className={`bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-50 ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        {!isCollapsed && <span className="text-xl font-bold animate-in fade-in duration-500">Admin Master</span>}
        <button 
          onClick={toggleSidebar}
          className={`p-2 hover:bg-slate-800 rounded-xl transition-all ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : ''}
            className={({ isActive }) => 
              `flex items-center space-x-3 p-3 rounded-xl transition-all ${
                isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 text-slate-400'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
          >
            <div className="shrink-0">{item.icon}</div>
            {!isCollapsed && <span className="font-bold text-sm tracking-tight animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className={`flex items-center space-x-3 p-3 w-full text-slate-400 hover:text-red-400 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Cerrar Sesión' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="font-bold text-sm tracking-tight">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
