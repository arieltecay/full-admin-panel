import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollService } from '../../services/api/payroll-service';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';
import { 
  Users, DollarSign, TrendingUp, Baby, Loader2, ChevronLeft, 
  Download, PieChart as PieIcon, BarChart3, Info, ArrowUpRight, ArrowDownRight, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

const PayrollDashboard = () => {
  const { clientId, period } = useParams<{ clientId: string, period: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtro dinámico para Obras Sociales
  const [osSearch, setOsSearch] = useState('');

  useEffect(() => {
    if (clientId && period) {
      fetchInitialData();
    }
  }, [clientId, period]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [statsData, periodsData] = await Promise.all([
        payrollService.getPayrollStats(clientId!, period!),
        payrollService.getPayrollPeriods(clientId!)
      ]);
      setStats(statsData);
      setPeriods(periodsData.filter((p: any) => p.period !== period));
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async (compareWith: string) => {
    setComparisonPeriod(compareWith);
    if (!compareWith) {
      setComparisonData(null);
      return;
    }

    try {
      const result = await payrollService.comparePayrolls(clientId!, compareWith, period!);
      setComparisonData(result);
    } catch (error) {
      toast.error('Error en la comparación');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium text-lg">Analizando datos de nómina...</p>
      </div>
    );
  }

  if (!stats) return null;

  const filteredOS = stats.distributions.obraSocial.filter((item: any) => 
    item.name.toLowerCase().includes(osSearch.toLowerCase())
  );

  const formatCurrency = (val: number) => 
    val.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors border border-slate-200"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard de Nómina</h1>
            <p className="text-slate-500 font-medium flex items-center">
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold mr-2 uppercase">
                {period}
              </span>
              {stats.metadata?.contribuyente || 'Cliente'} - CUIT: {stats.metadata?.cuit}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Selector de Comparación */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Comparar con:</span>
            <select 
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              value={comparisonPeriod}
              onChange={(e) => handleCompare(e.target.value)}
            >
              <option value="">-- Sin comparación --</option>
              {periods.map(p => (
                <option key={p.period} value={p.period}>{p.period}</option>
              ))}
            </select>
          </div>

          <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            <span>Exportar Reporte</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Empleados" 
          value={stats.summary.totalEmployees} 
          icon={<Users className="text-blue-600" />} 
          color="blue"
          variation={comparisonData?.variations.totalEmployees}
        />
        <KPICard 
          title="Masa Salarial Total" 
          value={formatCurrency(stats.summary.totalRemuneration)} 
          icon={<DollarSign className="text-emerald-600" />} 
          color="emerald"
          variation={comparisonData?.variations.totalRemuneration}
        />
        <KPICard 
          title="Sueldo Promedio" 
          value={formatCurrency(stats.summary.averageRemuneration)} 
          icon={<TrendingUp className="text-indigo-600" />} 
          color="indigo"
          variation={comparisonData?.variations.averageRemuneration}
        />
        <KPICard 
          title="Cargas de Familia" 
          value={stats.summary.totalHijos} 
          icon={<Baby className="text-pink-600" />} 
          color="pink"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Obra Social Horizontal Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <PieIcon className="mr-3 text-indigo-500" size={24} />
                Distribución de Obras Sociales
              </h3>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg uppercase">
                {filteredOS.length} variantes
              </span>
            </div>
            
            {/* Buscador interno del gráfico */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Buscar obra social..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={osSearch}
                onChange={(e) => setOsSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="h-[450px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-50 pt-4">
            {filteredOS.length > 0 ? (
              <ResponsiveContainer width="100%" height={Math.max(filteredOS.length * 35, 400)}>
                <BarChart 
                  data={filteredOS} 
                  layout="vertical"
                  margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={90} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                    {filteredOS.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Search size={32} className="opacity-20" />
                <p className="text-sm italic">No se encontraron resultados</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-slate-400 text-center italic">
            Usa el buscador o desliza para ver la lista completa
          </p>
        </div>

        {/* Condición de Revista Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800 flex items-center">
              <BarChart3 className="mr-3 text-emerald-500" size={24} />
              Condición de Revista
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.distributions.condicion}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metadata Info */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start space-x-4">
        <Info className="text-indigo-500 shrink-0 mt-1" size={24} />
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">Detalles de la Carga</h4>
          <p className="text-indigo-700 text-sm leading-relaxed">
            Nómina procesada correctamente. Se han detectado <strong>{stats.summary.totalEmployees} empleados</strong> con un 
            total de remuneraciones de <strong>{formatCurrency(stats.summary.totalRemuneration)}</strong>. 
            El CUIT registrado es {stats.metadata?.cuit} bajo la razón social {stats.metadata?.contribuyente}.
          </p>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon, color, variation }: any) => {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    indigo: "bg-indigo-50 text-indigo-600",
    pink: "bg-pink-50 text-pink-600",
  };

  const isPositive = variation > 0;
  const isNeutral = variation === 0 || variation === undefined;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      <div className="flex items-center space-x-4 mb-4">
        <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <h4 className="font-bold text-slate-500 text-sm uppercase tracking-wider">{title}</h4>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-black text-slate-900">{value}</p>
        
        {!isNeutral && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-bold ${
            isPositive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(variation).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollDashboard;
