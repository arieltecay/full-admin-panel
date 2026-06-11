import React from 'react';
import { Download, User } from 'lucide-react';
import { Card } from '../../../../../../components/ui/Card';
import { Button } from '../../../../../../components/ui/Button';
import type { TabFichaProps } from '../types';
import toast from 'react-hot-toast';

export const FichaTab: React.FC<TabFichaProps> = ({ 
  rows, meta, clientName, selectedEmployee, onSelectEmployee 
}) => {
  const employeeOptions = rows.map((r, i) => ({
    id: String(i),
    label: `#${r['Legajo'] || i} - ${r['Apellido y Nombre'] || 'Sin Nombre'}`,
    data: r
  }));

  const selected = selectedEmployee ? employeeOptions.find(e => e.id === selectedEmployee) : employeeOptions[0];
  const emp = selected?.data || {};

  const haberesKeys = Object.keys(emp).filter(k =>
    (typeof emp[k] === 'number') && (emp[k] as number) > 0 && !k.toLowerCase().includes('deducc') && !k.toLowerCase().includes('retenc')
  ).slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      <Card className="p-6 space-y-6 border border-slate-100 bg-slate-50/30">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <User size={16} className="text-indigo-500" />
          <span>Ficha de Empleado</span>
        </h3>
        <select
          value={selectedEmployee || '0'}
          onChange={e => onSelectEmployee(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          {employeeOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
        <Button 
          variant="secondary" 
          className="w-full font-black text-[10px] uppercase tracking-widest"
          onClick={() => toast.success('Impresión administrativa próximamente')}
        >
          <Download size={14} className="mr-2" />
          Descargar PDF
        </Button>
      </Card>

      <Card className="lg:col-span-3 p-8 border border-slate-100 relative overflow-hidden">
        <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter">{clientName?.toUpperCase()}</h2>
            <p className="text-xs font-bold text-slate-400 mt-1">CUIT: {meta?.cuit || '-'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500">PERÍODO: {meta?.period || '-'}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <th className="px-4 py-4 text-left">Concepto</th>
                <th className="px-4 py-4 text-right">Monto Liquidado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {haberesKeys.map((k, i) => (
                <tr key={i}>
                  <td className="px-4 py-4 text-slate-600 font-medium">{k}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">${Number(emp[k]).toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50">
                <td className="px-4 py-6 font-black text-slate-900 uppercase tracking-widest text-[11px]">Neto Liquidado</td>
                <td className="px-4 py-6 text-right font-black text-indigo-600 text-2xl tracking-tighter">
                  ${(Number(emp['Neto a Pagar']) || 0).toLocaleString('es-AR')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FichaTab;
