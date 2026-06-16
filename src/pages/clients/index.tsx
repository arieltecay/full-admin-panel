import { useState, useEffect } from 'react';
import { clientService } from '../../services/client-service';
import { Client } from './types';
import { 
  UserPlus, Mail, User, ShieldCheck, Loader2, Search, 
  Calendar, Clock, ToggleLeft, ToggleRight, MessageSquare,
  Send, Eye, EyeOff, KeyRound
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedClientForNote, setSelectedClientForNote] = useState<Client | null>(null);
  const [customNote, setCustomNote] = useState('');

  // Extend modal state
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [selectedClientForExtend, setSelectedClientForExtend] = useState<Client | null>(null);
  const [extendDays, setExtendDays] = useState<number | ''>(1);

  // Password modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedClientForPassword, setSelectedClientForPassword] = useState<Client | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      toast.error('Error al cargar la lista de clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      await clientService.registerClient({ ...formData, managerPassword: formData.password });
      toast.success('Cliente registrado exitosamente');
      setFormData({ name: '', email: '', password: '' });
      fetchClients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar cliente');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleToggleActive = async (client: Client) => {
    setUpdatingId(client._id);
    try {
      await clientService.updateClient(client._id, { isActive: !client.isActive });
      toast.success(`Cliente ${!client.isActive ? 'activado' : 'desactivado'}`);
      fetchClients();
    } catch (error) {
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const extendAccessByDays = async (clientId: string, days: number) => {
    setUpdatingId(clientId);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    
    try {
      await clientService.updateClient(clientId, { 
        accessExpiresAt: expirationDate.toISOString(),
        status: 'active'
      });
      toast.success(`Acceso extendido por ${days} días`);
      fetchClients();
    } catch (error) {
      toast.error('Error al extender el acceso');
    } finally {
      setUpdatingId(null);
    }
  };

  const openExtendModal = (client: Client) => {
    setSelectedClientForExtend(client);
    setExtendDays(1);
    setIsExtendModalOpen(true);
  };

  const closeExtendModal = () => {
    setIsExtendModalOpen(false);
    setSelectedClientForExtend(null);
    setExtendDays(1);
  };

  const handleExtendFromModal = async () => {
    if (!selectedClientForExtend || !extendDays) return;
    await extendAccessByDays(selectedClientForExtend._id, Number(extendDays));
    closeExtendModal();
  };

  const handleSaveNote = async () => {
    if (!selectedClientForNote) return;
    try {
      await clientService.updateClient(selectedClientForNote._id, { customNote });
      toast.success('Nota guardada');
      setIsNoteModalOpen(false);
      fetchClients();
    } catch (error) {
      toast.error('Error al guardar la nota');
    }
  };

  const openPasswordModal = (client: Client) => {
    setSelectedClientForPassword(client);
    setNewPassword(client.managerPassword || '');
    setIsPasswordVisible(false);
    setIsEditingPassword(false);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setSelectedClientForPassword(null);
    setNewPassword('');
    setIsPasswordVisible(false);
    setIsEditingPassword(false);
  };

  const handleUpdatePassword = async () => {
    if (!selectedClientForPassword) return;
    setUpdatingId(selectedClientForPassword._id);
    try {
      await clientService.updateClient(selectedClientForPassword._id, { managerPassword: newPassword });
      toast.success('Contraseña actualizada');
      closePasswordModal();
      fetchClients();
    } catch (error) {
      toast.error('Error al actualizar la contraseña');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeletePassword = async () => {
    if (!selectedClientForPassword) return;
    if (!confirm('¿Eliminar la contraseña interna?')) return;
    setUpdatingId(selectedClientForPassword._id);
    try {
      await clientService.updateClient(selectedClientForPassword._id, { managerPassword: '' });
      toast.success('Contraseña eliminada');
      closePasswordModal();
      fetchClients();
    } catch (error) {
      toast.error('Error al eliminar la contraseña');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 text-left">Gestión de Clientes</h2>
          <p className="text-slate-500">Registra y administra los accesos de tus clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Registro */}
        <div className="lg:col-span-1">
          <form onSubmit={handleRegister} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center space-x-2">
              <UserPlus size={20} />
              <span>Nuevo Cliente</span>
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Juan Pérez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="cliente@correo.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contraseña Temporal</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isRegistering ? <Loader2 className="animate-spin" size={20} /> : <span>Registrar Cliente</span>}
            </button>
          </form>
        </div>

        {/* Lista de Clientes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
              placeholder="Buscar cliente por nombre o email..."
              value={searchTerm}
              onChange={e => setSearchSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado / Acceso</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                        Cargando clientes...
                      </td>
                    </tr>
                  ) : filteredClients.map(client => (
                    <tr key={client._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{client.name}</div>
                        <div className="text-xs text-slate-500 flex items-center mt-1">
                          <Mail size={12} className="mr-1" />
                          {client.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${client.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                              {client.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                            {client.accessExpiresAt && (
                              <span className="text-[10px] font-bold text-slate-400 flex items-center">
                                 <Clock size={10} className="mr-1" />
                                 Expira: {new Date(client.accessExpiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {client.accessExpiresAt && new Date() > new Date(client.accessExpiresAt) && (
                            <span className="text-[10px] font-black text-rose-500 uppercase">Acceso Expirado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 overflow-visible">
                        <div className="flex items-center space-x-3">
                          {/* Toggle Active */}
                          <button 
                            disabled={updatingId === client._id}
                            onClick={() => handleToggleActive(client)}
                            className={`p-2 rounded-xl transition-all ${client.isActive ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100' : 'text-slate-400 bg-slate-100 hover:bg-slate-200'}`}
                            title={client.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {client.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>

                          {/* Extend Button */}
                          <button
                            onClick={() => openExtendModal(client)}
                            className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all flex items-center space-x-1"
                            title="Extender acceso"
                          >
                            <Calendar size={18} />
                            <span className="text-xs font-bold">Extender</span>
                          </button>

                          {/* Password Button */}
                          <button
                            onClick={() => openPasswordModal(client)}
                            className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all flex items-center space-x-1"
                            title="Contraseña interna"
                          >
                            <KeyRound size={18} />
                            <span className="text-xs font-bold">Contraseña</span>
                          </button>

                          {/* Custom Note */}
                          <button 
                            onClick={() => {
                              setSelectedClientForNote(client);
                              setCustomNote(client.customNote || '');
                              setIsNoteModalOpen(true);
                            }}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all"
                            title="Nota personalizada"
                          >
                            <MessageSquare size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-slate-400">No se encontraron clientes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      <Modal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        title="Mensaje para el Cliente"
      >
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-sm font-bold text-indigo-700">Cliente: {selectedClientForNote?.name}</p>
          </div>
          <textarea
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm font-medium"
            placeholder="Escribe un mensaje o nota importante..."
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
          />
          <button
            onClick={handleSaveNote}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Send size={18} />
            <span>Guardar Mensaje</span>
          </button>
        </div>
      </Modal>

      {/* Extend Modal */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={closeExtendModal}
        title={`Extender acceso - ${selectedClientForExtend?.name}`}
      >
        <div className="space-y-6">
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-sm font-bold text-indigo-700">{selectedClientForExtend?.email}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Días a extender
            </label>
            <input
              type="number"
              min={1}
              value={extendDays}
              onChange={e => setExtendDays(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-medium"
              placeholder="Cantidad de días"
            />
          </div>

          <button
            onClick={handleExtendFromModal}
            disabled={!extendDays || updatingId === selectedClientForExtend?._id}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {updatingId === selectedClientForExtend?._id ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Calendar size={18} />
                <span>Extender {extendDays ? `${extendDays} días` : ''}</span>
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        title={`Contraseña de ${selectedClientForPassword?.name}`}
      >
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <p className="text-sm font-bold text-amber-700">{selectedClientForPassword?.email}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Contraseña interna
            </label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                readOnly={!isEditingPassword}
                value={isEditingPassword ? newPassword : (selectedClientForPassword?.managerPassword || '')}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none transition-all text-sm font-medium"
                placeholder={isEditingPassword ? 'Nueva contraseña' : 'Sin contraseña'}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!isEditingPassword ? (
              <>
                <button
                  onClick={() => setIsEditingPassword(true)}
                  className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl transition-all text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={handleDeletePassword}
                  disabled={!selectedClientForPassword?.managerPassword || updatingId === selectedClientForPassword?._id}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  Eliminar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setNewPassword(selectedClientForPassword?.managerPassword || '');
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdatePassword}
                  disabled={updatingId === selectedClientForPassword?._id}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  {updatingId === selectedClientForPassword?._id ? (
                    <Loader2 className="animate-spin mx-auto" size={18} />
                  ) : (
                    'Guardar'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientsPage;
