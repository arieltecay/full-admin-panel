import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService, Client } from '../../services/client-service';
import { payrollService } from '../../services/api/payroll-service';
import { 
  Upload, Loader2, FileSpreadsheet, AlertCircle, CheckCircle2, 
  Calendar, History, ChevronRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

const PayrollUpload = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [period, setPeriod] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClient) {
      fetchHistory();
    } else {
      setHistory([]);
    }
  }, [selectedClient]);

  const fetchHistory = async () => {
    try {
      const data = await payrollService.getPayrollPeriods(selectedClient);
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history', error);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !period || !file) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsUploading(true);
    try {
      // Enviar el archivo directamente a nuestra API (que se encargará de subir a Cloudinary)
      await payrollService.uploadPayroll(selectedClient, period, file);
      
      toast.success('Nómina cargada y procesada correctamente');
      
      // Actualizar historial inmediatamente
      fetchHistory();

      // Redirigir al dashboard analítico
      setTimeout(() => {
        navigate(`/reports/payroll/${selectedClient}/${period}`);
      }, 1500);

      setFile(null);
      // Resetear file input
      const fileInput = document.getElementById('payroll-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Error al procesar la nómina');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Cargando clientes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Upload size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cargar Nómina (Payroll)</h2>
          <p className="text-slate-500">Sube el archivo CSV para procesar los sueldos del período</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start space-x-3 text-sm text-slate-600">
                <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <p>
                  El archivo debe ser un <strong>CSV</strong>. El sistema normaliza automáticamente columnas duplicadas e importes monetarios.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center">
                    Seleccionar Cliente
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all appearance-none bg-white"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                  >
                    <option value="">-- Elegir cliente --</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                {/* Período */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center">
                    <Calendar size={16} className="mr-2" />
                    Período (MM-YYYY)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 06-2026"
                    pattern="\d{2}-\d{4}"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                  />
                </div>
              </div>

              {/* Archivo */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Archivo CSV</label>
                <div className={`relative group border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center space-y-4 ${file ? 'border-green-400 bg-green-50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                  <input
                    id="payroll-file"
                    type="file"
                    accept=".csv"
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  
                  {file ? (
                    <>
                      <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <CheckCircle2 size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-800">{file.name}</p>
                        <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB - Listo para subir</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                        className="text-xs text-red-500 hover:underline relative z-10"
                      >
                        Cambiar archivo
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-indigo-50 text-indigo-500 rounded-full group-hover:scale-110 transition-transform">
                        <FileSpreadsheet size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700">Haz clic o arrastra el archivo</p>
                        <p className="text-sm text-slate-500">Solo archivos CSV</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    <span>Procesando archivo...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} />
                    <span>Subir y Procesar Nómina</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Historial */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center">
                <History className="mr-2 text-indigo-500" size={18} />
                Historial
              </h3>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                {history.length}
              </span>
            </div>

            {selectedClient ? (
              <div className="space-y-3">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/reports/payroll/${selectedClient}/${item.period}`)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group text-left"
                    >
                      <div>
                        <p className="font-bold text-slate-700">{item.period}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(item.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={18} />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400 italic">No hay nóminas cargadas</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">Selecciona un cliente para ver su historial</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollUpload;
