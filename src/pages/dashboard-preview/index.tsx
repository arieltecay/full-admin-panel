import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, TrendingUp, Award, Percent,
  Search, ChevronLeft, Sun, Moon, RotateCcw, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';

// Servicios y Hooks
import { dashboardService } from '../../services/api/dashboard-service';
// Usamos el hook de filtros del dashboard de reportes que ya existe
import { usePayrollFilters } from '../reports/payroll-dashboard/hooks/usePayrollFilters';
import { formatCurrency, formatShortCurrency } from '../reports/payroll-dashboard/utils/payrollCalculations';

// Tipos
import type { DashboardDetailsResponse, ChatMessage, TabKey } from '../reports/payroll-dashboard/types';

// Componentes UI Atómicos (Reutilizando los del admin)
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AIAssistant } from '../reports/payroll-dashboard/components/ai-assistant';
import { KpiCard } from '../reports/payroll-dashboard/components/kpi-card';

// Pestañas Modulares
import { PersonalTab } from '../reports/payroll-dashboard/components/tabs/personal-tab';
import { CostosTab } from '../reports/payroll-dashboard/components/tabs/costos-tab';
import { DesviosTab } from '../reports/payroll-dashboard/components/tabs/desvios-tab';
import { RetencionesTab } from '../reports/payroll-dashboard/components/tabs/retenciones-tab';
import { FichaTab } from '../reports/payroll-dashboard/components/tabs/ficha-tab';

const TAB_KEYS: TabKey[] = ['personal', 'costos', 'desvios', 'retenciones', 'ficha'];

const TAB_LABELS: Record<TabKey, { icon: React.ReactNode; label: string }> = {
  personal:    { icon: <Users size={16} />,      label: 'Estructura' },
  costos:      { icon: <DollarSign size={16} />,  label: 'Costos' },
  desvios:     { icon: <TrendingUp size={16} />,  label: 'Desvíos' },
  retenciones: { icon: <Percent size={16} />,     label: 'Retenciones' },
  ficha:       { icon: <Users size={16} />,       label: 'Ficha' },
};

/**
 * DashboardPreview: Copia fiel de lo que ve el cliente (PayrollViewer del frontend).
 */
const DashboardPreview = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const navigate = useNavigate();
  
  // En el admin controlamos el tema localmente para la previsualización
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [details, setDetails] = useState<DashboardDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [isAiOpen, setIsAiOpen] = useState(true);

  const { 
    filters, setters, filteredRows, filteredStats, 
    isLoadingStats, resetFilters 
  } = usePayrollFilters(details?.rows || [], details?.dashboard?.clientId, details?.dashboard?.period, details?.stats);

  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  const fetchDetails = useCallback(async () => {
    if (!dashboardId) return;
    
    try {
      setIsLoading(true);
      const data = await dashboardService.getDashboardDetails(dashboardId);
      setDetails(data);
      setChatMessages([{
        role: 'assistant',
        content: `¡Hola! He cargado el tablero de **${data.clientName}**. ¿Qué análisis deseas realizar?`
      }]);
    } catch (error) {
      toast.error('Error al cargar datos de previsualización');
    } finally {
      setIsLoading(false);
    }
  }, [dashboardId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSendChat = async () => {
    if (!chatInput.trim() || !dashboardId) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSendingChat(true);
    try {
      const result = await dashboardService.queryDashboardAI(dashboardId, userMsg);
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error al conectar con el servicio de IA.' }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  if (isLoading || !details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  // Estilo dinámico basado en la configuración del tablero
  const primaryColor = details.dashboard?.theme?.primaryColor || '#6366f1';

  const stats = filteredStats || details.stats;
  const currentSummary = stats.summary;

  const uniqueSucursales = [...new Set(details.rows.map(r => String(r.sucursal || '')).filter(Boolean))];
  const uniqueConvenios = [...new Set(details.rows.map(r => String(r.convenio || '')).filter(Boolean))];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboards')} className="p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <span className="font-black text-lg text-slate-900 dark:text-white tracking-tighter">
                  {details.dashboard?.title.toUpperCase() || 'TABLERO'}
                </span>
                <Badge variant="info">Vista Previa</Badge>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Cliente: {details.clientName} | Período: {details.dashboard?.period}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme} 
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 transition-colors"
              title="Cambiar Tema"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={() => navigate('/dashboards')}
              className="px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Volver a Gestión
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">
        <Card className="p-6 border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Filtros Dinámicos</h3>
            <button 
              onClick={resetFilters}
              className="flex items-center space-x-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline transition-all"
            >
              <RotateCcw size={14} />
              <span>RESETEAR</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <select value={filters.filterSucursal} onChange={e => setters.setFilterSucursal(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all">
              <option value="">Todas las Sucursales</option>
              {uniqueSucursales.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
            <select value={filters.filterConvenio} onChange={e => setters.setFilterConvenio(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all">
              <option value="">Todos los Convenios</option>
              {uniqueConvenios.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>
            <select value={filters.filterAntiguedad} onChange={e => setters.setFilterAntiguedad(e.target.value)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all">
              <option value="">Rango (Cualquiera)</option>
              <option value="0-5">0 - 5 años</option>
              <option value="5-10">5 - 10 años</option>
              <option value="10-99">10+ años</option>
            </select>
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={filters.filterSearch}
                onChange={e => setters.setFilterSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {isLoadingStats ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl" />
            ))
          ) : (
            <>
              <KpiCard icon={<Users size={20} />} color="blue" label="DOTACIÓN" value={currentSummary.totalEmployees} sub="Nómina Activa" />
              <KpiCard icon={<DollarSign size={20} />} color="emerald" label="MASA SALARIAL" value={formatShortCurrency(currentSummary.totalNeto || currentSummary.masaSalarial)} sub="Neto Liquidado" />
              <KpiCard icon={<TrendingUp size={20} />} color="indigo" label="PROMEDIO" value={formatShortCurrency(currentSummary.promedioNeto || currentSummary.averageRemuneration)} sub="Por empleado" />
              <KpiCard icon={<Award size={20} />} color="amber" label="ADICIONALES" value={formatShortCurrency(currentSummary.totalAdicionales)} sub="Variables" />
              <KpiCard icon={<Percent size={20} />} color="rose" label="RETENCIONES" value={formatShortCurrency(Math.abs(currentSummary.totalDeducciones))} sub="Aportes Ley" negative />
            </>
          )}
        </div>

        <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto">
          {TAB_KEYS.map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{ 
                backgroundColor: activeTab === key ? primaryColor : 'transparent',
                boxShadow: activeTab === key ? `0 10px 15px -3px ${primaryColor}4D` : 'none'
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
                ${activeTab === key 
                  ? 'text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {TAB_LABELS[key].label}
            </button>
          ))}
        </div>

        <div className="min-h-[500px]">
          {activeTab === 'personal' && <PersonalTab rows={filteredRows} stats={stats} formatCurrency={formatCurrency} />}
          {activeTab === 'costos' && <CostosTab rows={filteredRows} stats={stats} formatCurrency={formatCurrency} />}
          {activeTab === 'desvios' && <DesviosTab rows={filteredRows} stats={stats} formatCurrency={formatCurrency} />}
          {activeTab === 'retenciones' && <RetencionesTab rows={filteredRows} stats={stats} formatCurrency={formatCurrency} />}
          {activeTab === 'ficha' && (
            <FichaTab
              rows={details.rows}
              meta={details.metadata}
              clientName={details.clientName}
              selectedEmployee={selectedEmployee}
              onSelectEmployee={setSelectedEmployee}
            />
          )}
        </div>
      </div>

      <AIAssistant 
        messages={chatMessages} 
        input={chatInput} 
        setInput={setChatInput} 
        onSend={handleSendChat} 
        isLoading={isSendingChat} 
        isOpen={isAiOpen}
        onToggle={() => setIsAiOpen(!isAiOpen)}
      />
    </div>
  );
};

export default DashboardPreview;