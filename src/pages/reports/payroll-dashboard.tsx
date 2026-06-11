import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, TrendingUp, Loader2, ChevronLeft, 
  Download, Filter, RotateCcw, Search, BarChart3, Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

// Servicios
import { payrollService } from '../../services/api/payroll-service';

// Hooks y Utils
import { usePayrollFilters } from './payroll-dashboard/hooks/usePayrollFilters';
import { formatCurrency, formatShortCurrency } from './payroll-dashboard/utils/payrollCalculations';

// Tipos
import type { DashboardDetailsResponse, TabKey, ChatMessage } from './payroll-dashboard/types';

// Componentes Atómicos
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { KpiCard } from './payroll-dashboard/components/kpi-card';
import { AIAssistant } from './payroll-dashboard/components/ai-assistant';

// Pestañas
import { PersonalTab } from './payroll-dashboard/components/tabs/personal-tab';
import { CostosTab, DesviosTab, RetencionesTab, FichaTab } from './payroll-dashboard/components/tabs';

const TAB_KEYS: TabKey[] = ['personal', 'costos', 'desvios', 'retenciones', 'ficha'];

const TAB_LABELS: Record<TabKey, { icon: React.ReactNode; label: string }> = {
  personal:    { icon: <Users size={16} />,      label: 'Estructura de Personal' },
  costos:      { icon: <DollarSign size={16} />,  label: 'Análisis de Costos' },
  desvios:     { icon: <TrendingUp size={16} />,  label: 'Desvíos & Variables' },
  retenciones: { icon: <Percent size={16} />,     label: 'Retenciones & Descuentos' },
  ficha:       { icon: <BarChart3 size={16} />,   label: 'Ficha Individual' },
};

const PayrollDashboard = () => {
  const { clientId, period } = useParams<{ clientId: string, period: string }>();
  const navigate = useNavigate();
  
  // State
  const [data, setData] = useState<DashboardDetailsResponse | null>(null);
  const [periods, setPeriods] = useState<any[]>([]);
  const [comparisonPeriod, setComparisonPeriod] = useState<string>('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');

  // Filtros
  const { filters, setters, filteredRows, resetFilters } = usePayrollFilters(data?.rows || []);

  // Chat AI
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  const fetchData = useCallback(async () => {
    if (!clientId || !period) return;
    try {
      setIsLoading(true);
      const [stats, rows, periodsData] = await Promise.all([
        payrollService.getPayrollStats(clientId, period),
        payrollService.getPayroll(clientId, period, 1, 1000),
        payrollService.getPayrollPeriods(clientId)
      ]);
      
      setData({
        clientName: stats.metadata?.contribuyente || 'Cliente',
        metadata: stats.metadata,
        stats: stats,
        rows: rows.data || []
      });
      
      setPeriods(periodsData.filter((p: any) => p.period !== period));
      
      setChatMessages([{
        role: 'assistant',
        content: `Panel administrativo activado para **${stats.metadata?.contribuyente}**. He procesado ${rows.data?.length} legajos del período ${period}. ¿Qué deseas auditar?`
      }]);
    } catch (error) {
      toast.error('Error al cargar datos de nómina');
    } finally {
      setIsLoading(false);
    }
  }, [clientId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompare = async (compareWith: string) => {
    setComparisonPeriod(compareWith);
    if (!compareWith) {
      setComparisonData(null);
      return;
    }
    try {
      const result = await payrollService.comparePayrolls(clientId!, compareWith, period!);
      setComparisonData(result);
      toast.success('Comparación cargada');
    } catch (error) {
      toast.error('Error en la comparación');
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !clientId) return;
    const msg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsSendingChat(true);
    // Nota: El admin no tiene un dashboardId directo, usamos el servicio de payroll si existe o el de dashboard genérico
    // Por ahora simulamos la respuesta o usamos el servicio si está disponible
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Auditoría en proceso. El servicio de IA para administradores está analizando los desvíos.' }]);
      setIsSendingChat(false);
    }, 1000);
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Cargando Inteligencia de Datos...</p>
      </div>
    );
  }

  // Cálculos filtrados
  const filteredTotalRem = filteredRows.reduce((sum, r) => sum + (Number(r['Neto a Pagar']) || 0), 0);
  const filteredTotalAdicionales = filteredRows.reduce((sum, r) => sum + (Number(r['Adicionales']) || 0), 0);
  
  const uniqueSucursales = [...new Set(data.rows.map(r => String(r['Sucursal'] || '')).filter(Boolean))];
  const uniqueConvenios = [...new Set(data.rows.map(r => String(r['Convenio'] || '')).filter(Boolean))];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all border border-slate-100 bg-slate-50/50"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{data.clientName.toUpperCase()}</h1>
              <Badge variant="info">Modo Auditor</Badge>
            </div>
            <p className="text-slate-500 font-medium flex items-center mt-1">
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-black mr-2 uppercase tracking-wider">
                {period}
              </span>
              CUIT: {data.metadata?.cuit}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Comparar:</span>
            <select 
              className="bg-slate-50 border-none rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={comparisonPeriod}
              onChange={(e) => handleCompare(e.target.value)}
            >
              <option value="">-- Sin comparación --</option>
              {periods.map(p => <option key={p.period} value={p.period}>{p.period}</option>)}
            </select>
          </div>

          <button className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95">
            <Download size={16} />
            <span>Exportar Informe</span>
          </button>
        </div>
      </div>

      {/* KPIs Pro (con soporte de comparación) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard 
          label="Dotación" 
          value={filteredRows.length} 
          icon={<Users className="text-blue-600" />} 
          color="blue"
          sub="Personal Activo"
          variation={comparisonData?.variations.totalEmployees}
        />
        <KpiCard 
          label="Masa Neta" 
          value={formatShortCurrency(filteredTotalRem)} 
          icon={<DollarSign className="text-emerald-600" />} 
          color="emerald"
          sub="Neto Liquidado"
          variation={comparisonData?.variations.totalRemuneration}
        />
        <KpiCard 
          label="Promedio" 
          value={formatShortCurrency(filteredRows.length > 0 ? filteredTotalRem/filteredRows.length : 0)} 
          icon={<TrendingUp className="text-indigo-600" />} 
          color="indigo"
          sub="Sueldo Medio"
          variation={comparisonData?.variations.averageRemuneration}
        />
        <KpiCard 
          label="Adicionales" 
          value={formatShortCurrency(filteredTotalAdicionales)} 
          icon={<TrendingUp className="text-amber-600" />} 
          color="amber"
          sub="Conceptos Var."
        />
        <KpiCard 
          label="Hijos" 
          value={data.stats.summary.totalHijos} 
          icon={<Users className="text-pink-600" />} 
          color="pink"
          sub="Cargas de Familia"
        />
      </div>

      {/* Filtros Atómicos */}
      <Card className="p-6 border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Filter size={18} className="text-indigo-600" />
            </div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Auditoría por Segmento</h3>
          </div>
          <button 
            onClick={resetFilters} 
            className="text-[10px] font-black text-indigo-600 hover:underline transition-all flex items-center space-x-1.5"
          >
            <RotateCcw size={14} />
            <span>RESETEAR</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <select 
            value={filters.filterSucursal} 
            onChange={e => setters.setFilterSucursal(e.target.value)} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          >
            <option value="">Todas las Sucursales</option>
            {uniqueSucursales.map((s, i) => <option key={i} value={s}>{s}</option>)}
          </select>
          
          <select 
            value={filters.filterConvenio} 
            onChange={e => setters.setFilterConvenio(e.target.value)} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          >
            <option value="">Todos los Convenios</option>
            {uniqueConvenios.map((c, i) => <option key={i} value={c}>{c}</option>)}
          </select>

          <select 
            value={filters.filterAntiguedad} 
            onChange={e => setters.setFilterAntiguedad(e.target.value)} 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          >
            <option value="">Rango de Antigüedad</option>
            <option value="0-5">0 - 5 años</option>
            <option value="5-10">5 - 10 años</option>
            <option value="10-99">10+ años</option>
          </select>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Legajo o Apellido..."
              value={filters.filterSearch}
              onChange={e => setters.setFilterSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Tabs Nav */}
      <div className="flex items-center space-x-1.5 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm overflow-x-auto">
        {TAB_KEYS.map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap
              ${activeTab === key 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-95' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {TAB_LABELS[key].icon}
              <span>{TAB_LABELS[key].label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'personal' && <PersonalTab rows={filteredRows} stats={data.stats} formatCurrency={formatCurrency} />}
        {activeTab === 'costos' && <CostosTab rows={filteredRows} stats={data.stats} formatCurrency={formatCurrency} />}
        {activeTab === 'desvios' && <DesviosTab rows={filteredRows} formatCurrency={formatCurrency} />}
        {activeTab === 'retenciones' && <RetencionesTab rows={filteredRows} formatCurrency={formatCurrency} />}
        {activeTab === 'ficha' && (
          <FichaTab
            rows={data.rows}
            meta={data.metadata}
            clientName={data.clientName}
            selectedEmployee={''}
            onSelectEmployee={() => {}}
          />
        )}
      </div>

      {/* AI Assistant for Admin */}
      <AIAssistant 
        messages={chatMessages} 
        input={chatInput} 
        setInput={setChatInput} 
        onSend={handleSendChat} 
        isLoading={isSendingChat} 
      />
    </div>
  );
};

export default PayrollDashboard;
