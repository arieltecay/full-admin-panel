import { useState, useEffect } from 'react';
import { homeService, HomeConfig } from '../../services/home-service';
import { Save, Plus, Trash2, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const HomeManagement = () => {
  const [config, setConfig] = useState<HomeConfig>({
    companyName: '',
    mission: '',
    tasks: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsLoadingSaving] = useState(false);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const data = await homeService.getConfig();
      setConfig(data);
    } catch (error) {
      toast.error('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingSaving(true);
    try {
      await homeService.updateConfig(config);
      toast.success('Configuración actualizada correctamente');
    } catch (error) {
      toast.error('Error al guardar los cambios');
    } finally {
      setIsLoadingSaving(false);
    }
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setConfig({ ...config, tasks: [...config.tasks, newTask.trim()] });
    setNewTask('');
  };

  const removeTask = (index: number) => {
    const updatedTasks = config.tasks.filter((_, i) => i !== index);
    setConfig({ ...config, tasks: updatedTasks });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
          <Info size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestionar Contenidos</h2>
          <p className="text-slate-500">Modifica la información que ven tus clientes en la App principal</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Información Básica */}
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">Información de Empresa</h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Ej. Administración Profesional S.A."
                value={config.companyName}
                onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Misión Corporativa</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
                placeholder="Escribe la misión de tu empresa aquí..."
                value={config.mission}
                onChange={(e) => setConfig({ ...config, mission: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Listado de Tareas */}
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">Nuestros Servicios / Tareas</h3>
          
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="Agregar una nueva tarea..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTask())}
              />
              <button
                type="button"
                onClick={addTask}
                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {config.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-left-2 duration-300">
                  <span className="text-slate-700 font-medium">{task}</span>
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {config.tasks.length === 0 && (
                <p className="text-slate-400 italic text-sm col-span-full text-center py-4">No hay tareas agregadas aún.</p>
              )}
            </div>
          </div>
        </section>

        {/* Botón de Guardado Flotante o Final */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Save size={24} />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default HomeManagement;
