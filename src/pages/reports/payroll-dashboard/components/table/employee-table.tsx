import React from 'react';
import { Users, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import { Badge } from '../../../../../components/ui/Badge';
import { PayrollRow } from '../../types';

interface EmployeeTableProps {
  rows: PayrollRow[];
  formatCurrency: (v: number) => string;
}

/**
 * Tabla de empleados para el administrador (v3.1).
 * Usa exclusivamente keys camelCase para resolver el bug de los ceros.
 */
export const EmployeeTable: React.FC<EmployeeTableProps> = ({ rows, formatCurrency }) => {
  return (
    <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900">
      <div className="p-5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-2">
          <Users size={16} className="text-indigo-500" />
          <span>Nómina Detallada</span>
        </h3>
        <Badge variant="neutral">{rows.length} Registros</Badge>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-white dark:bg-slate-900 sticky top-0 z-10">
            <tr>
              {['Legajo', 'Apellido y Nombre', 'Sucursal', 'Convenio', 'Antigüedad', 'Neto a Pagar', 'Acciones'].map(h => (
                <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {rows.slice(0, 100).map((row, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  #{row.legajo || i}
                </td>
                <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {row.apellidoNombre || '-'}
                </td>
                <td className="px-5 py-4">
                  <Badge variant="neutral">{row.sucursal || '-'}</Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge variant="info">{row.convenio || '-'}</Badge>
                </td>
                <td className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">
                   {row.antiguedad !== undefined ? `${row.antiguedad} años` : '-'}
                </td>
                <td className="px-5 py-4 font-black text-slate-900 dark:text-white">
                  {formatCurrency(Number(row.netoAPagar) || 0)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors" title="Editar">
                      <Edit3 size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg transition-colors" title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 100 && (
          <div className="p-4 text-center bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800">
            Vista limitada a los primeros 100 registros
          </div>
        )}
      </div>
    </Card>
  );
};
