import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, FileText, Settings, LogOut, Users } from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';

const Sidebar = () => {
  const { logout } = useAuth();
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={20} />, label: 'Clientes', path: '/clients' },
    { icon: <LayoutDashboard size={20} />, label: 'Tableros', path: '/dashboards' },
    { icon: <Home size={20} />, label: 'Gestionar Home', path: '/home-management' },
    { icon: <FileText size={20} />, label: 'Informes', path: '/reports' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        Admin Master
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex items-center space-x-3 p-3 w-full text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
