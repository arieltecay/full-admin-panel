import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/api/dashboard-service';
import { 
  Users, FileText, PieChart, TrendingUp, Loader2, 
  UserCheck, Activity, Calendar, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getGlobalStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-medium">Sincronizando métricas globales...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control Global</h1>
        <p className="text-slate-500 font-medium">Resumen general de la plataforma y clientes activos</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Clientes" 
          value={stats?.summary?.totalClients || 0} 
          icon={<Users className="text-blue-600" />} 
          color="blue"
        />
        <StatCard 
          title="Nóminas Procesadas" 
          value={stats?.summary?.totalPayrolls || 0} 
          icon={<FileText className="text-emerald-600" />} 
          color="emerald"
        />
        <StatCard 
          title="Usuarios Activos" 
          value={stats?.summary?.activeUsers || 0} 
          icon={<UserCheck className="text-indigo-600" />} 
          color="indigo"
        />
        <StatCard 
          title="Reportes Generados" 
          value={stats?.summary?.totalReports || 0} 
          icon={<PieChart className="text-pink-600" />} 
          color="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Clients */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <Activity className="mr-3 text-blue-500" size={24} />
              Clientes Recientes
            </h3>
            <button 
              onClick={() => navigate('/clients')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center"
            >
              Ver todos <ArrowRight size={14} className="ml-1" />
            </button>
          </div>
          
          <div className="space-y-4">
            {stats?.recentClients?.map((client: any) => (
              <div key={client._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                    {client.name.substring(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{client.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{client.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${client.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {client.status}
                </span>
              </div>
            )) || <p className="text-center text-slate-400 py-4 italic">No hay clientes registrados</p>}
          </div>
        </div>

        {/* Recent Payrolls */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <TrendingUp className="mr-3 text-emerald-500" size={24} />
              Últimas Cargas
            </h3>
            <button 
              onClick={() => navigate('/reports')}
              className="text-xs font-bold text-emerald-600 hover:underline flex items-center"
            >
              Cargar Nueva <ArrowRight size={14} className="ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {stats?.recentPayrolls?.map((payroll: any) => (
              <div key={payroll._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Período {payroll.period}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Subido el {new Date(payroll.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/reports/payroll/${payroll.clientId}/${payroll.period}`)}
                  className="p-2 hover:bg-emerald-200 rounded-full text-emerald-600 transition-colors"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            )) || <p className="text-center text-slate-400 py-4 italic">No hay nóminas cargadas</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => {
  const bgClasses: any = {
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    indigo: "bg-indigo-50",
    pink: "bg-pink-50"
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-2xl ${bgClasses[color]}`}>
          {icon}
        </div>
        <h4 className="font-bold text-slate-500 text-xs uppercase tracking-widest">{title}</h4>
      </div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
};

export default AdminDashboard;
