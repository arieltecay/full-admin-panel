import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, DashboardItem } from '../../services/api/dashboard-service';
import { clientService } from '../../services/client-service';
import { Client } from '../clients/types';
import { payrollService } from '../../services/api/payroll-service';
import { 
  LayoutDashboard, Plus, Trash2, Edit3, CheckCircle2, 
  XCircle, Filter, Calendar, User, Palette, 
  Loader2, MoreVertical, AlertTriangle, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';

const DashboardManagement = () => {
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<DashboardItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [dashboardToDelete, setDashboardToDelete] = useState<DashboardItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    period: '',
    isActive: true,
    primaryColor: '#6366f1'
  });

  const [availablePeriods, setAvailablePeriods] = useState<any[]>([]);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      fetchPeriods(formData.clientId);
    } else {
      setAvailablePeriods([]);
    }
  }, [formData.clientId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [dashData, clientData] = await Promise.all([
        dashboardService.getDashboards(),
        clientService.getClients()
      ]);
      setDashboards(dashData);
      setClients(clientData);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPeriods = async (clientId: string) => {
    try {
      setIsLoadingPeriods(true);
      const periods = await payrollService.getPayrollPeriods(clientId);
      setAvailablePeriods(periods);
    } catch (error) {
      toast.error('Error al cargar períodos de nómina');
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        clientId: formData.clientId,
        period: formData.period,
        isActive: formData.isActive,
        theme: { primaryColor: formData.primaryColor }
      };

      if (isEditing && currentId) {
        await dashboardService.updateDashboard(currentId, payload);
        toast.success('Tablero actualizado');
      } else {
        await dashboardService.createDashboard(payload);
        toast.success('Tablero creado');
      }
      setIsModalOpen(false);
      fetchData();
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar tablero');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      clientId: '',
      period: '',
      isActive: true,
      primaryColor: '#6366f1'
    });
    setIsEditing(false);
    setCurrentId(null);
  };

  const handleEdit = (dash: DashboardItem) => {
    setIsEditing(true);
    setCurrentId(dash._id);
    setFormData({
      title: dash.title,
      clientId: typeof dash.clientId === 'object' ? dash.clientId._id : dash.clientId,
      period: dash.period,
      isActive: dash.isActive,
      primaryColor: dash.theme?.primaryColor || '#6366f1'
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (dash: DashboardItem) => {
    setDashboardToDelete(dash);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!dashboardToDelete) return;
    try {
      await dashboardService.deleteDashboard(dashboardToDelete._id);
      toast.success('Tablero eliminado');
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Tableros</h1>
          <p className="text-slate-500 font-medium">Crea y administra los tableros dinámicos para tus clientes.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>Nuevo Tablero</span>
        </button>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2 text-slate-500">
            <Filter size={18} />
            <span className="text-sm font-bold uppercase tracking-wider">Tableros Configurados</span>
          </div>
          <div className="text-xs font-bold text-slate-400">
            Total: {dashboards.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50">
                <th className="px-8 py-5">Título / Cliente</th>
                <th className="px-8 py-5">Período</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5">Personalización</th>
                <th className="px-8 py-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dashboards.map((dash) => (
                <tr key={dash._id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: `${dash.theme?.primaryColor || '#6366f1'}15`, color: dash.theme?.primaryColor || '#6366f1' }}
                      >
                        <LayoutDashboard size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{dash.title}</p>
                        <p className="text-xs text-slate-500 font-medium">
                          {typeof dash.clientId === 'object' ? dash.clientId.name : 'Cargando...'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 text-slate-600 font-semibold">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{dash.period}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {dash.isActive ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                        <CheckCircle2 size={12} />
                        <span className="text-[10px] font-black uppercase">Activo</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                        <XCircle size={12} />
                        <span className="text-[10px] font-black uppercase">Inactivo</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-white shadow-sm" 
                        style={{ backgroundColor: dash.theme?.primaryColor || '#6366f1' }}
                      />
                      <span className="text-xs font-mono text-slate-400">{dash.theme?.primaryColor || '#6366f1'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => navigate(`/dashboard-preview/${dash._id}`)}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                        title="Ver como Cliente"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(dash)}
                        className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(dash)}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{isEditing ? 'Editar Tablero' : 'Nuevo Tablero'}</h3>
                  <p className="text-xs text-slate-500 font-medium">Completa los datos para habilitar el acceso.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        required
                        disabled={isEditing}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 font-bold appearance-none"
                        value={formData.clientId}
                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value, period: '' })}
                      >
                        <option value="">Seleccionar Cliente</option>
                        {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Período de Nómina</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select
                        required
                        disabled={!formData.clientId || isLoadingPeriods || isEditing}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 font-bold appearance-none disabled:opacity-50"
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      >
                        <option value="">{isLoadingPeriods ? 'Cargando períodos...' : 'Seleccionar Período'}</option>
                        {availablePeriods.map((p, i) => (
                          <option key={i} value={p.period}>{p.period} ({p.contribuyente || 'Sin metadatos'})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Título del Tablero</label>
                  <div className="relative">
                    <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Auditoría Trimestral Q1"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-900 font-bold"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Color Principal (Marca)</label>
                    <div className="relative">
                      <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="color"
                        className="w-full h-[58px] p-1 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <input
                      type="checkbox"
                      id="isActive"
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Tablero Activo</label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-2 px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
                >
                  {isEditing ? 'Guardar Cambios' : 'Crear Tablero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-rose-100 dark:border-rose-900">
            <AlertTriangle size={40} />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">¿Estás absolutamente seguro?</h4>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm">
              Estás por eliminar el tablero <span className="text-slate-900 dark:text-slate-200 font-bold">"{dashboardToDelete?.title}"</span>. Esta acción no se puede deshacer y el cliente ya no podrá acceder a este análisis.
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl transition-all"
            >
              No, Mantener
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardManagement;
