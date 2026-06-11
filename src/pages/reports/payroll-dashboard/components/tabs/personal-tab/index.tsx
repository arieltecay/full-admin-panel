import React from 'react';
import { Users, Edit3, Trash2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../../../../../components/ui/Card';
import { Badge } from '../../../../../../components/ui/Badge';
import type { TabWithStatsProps } from '../types';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6', '#f43f5e'];

export const PersonalTab: React.FC<TabWithStatsProps> = ({ rows, stats, formatCurrency }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
    <div className="lg:col-span-2">
      <Card className="overflow-hidden border border-slate-100 shadow-sm">
        <div className="p-5 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
            <Users size={16} className="text-indigo-500" />
            <span>Nómina Detallada</span>
          </h3>
          <Badge variant="neutral">{rows.length} Registros</Badge>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-white sticky top-0 z-10">
              <tr>
                {['Legajo', 'Apellido y Nombre', 'Sucursal', 'Convenio', 'Neto a Pagar', 'Acciones'].map(h => (
                  <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.slice(0, 100).map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-5 py-4 font-mono text-xs text-slate-500 group-hover:text-indigo-600 transition-colors">
                    #{row['Legajo'] || i}
                  </td>
                  <td className="px-5 py-4 font-bold text-slate-800 whitespace-nowrap">
                    {row['Apellido y Nombre'] || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="neutral">{row['Sucursal'] || '-'}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant="info">{row['Convenio'] || '-'}</Badge>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900">
                    {formatCurrency(Number(row['Neto a Pagar']) || 0)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors" title="Editar">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 100 && (
            <div className="p-4 text-center bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t">
              Vista limitada a los primeros 100 registros
            </div>
          )}
        </div>
      </Card>
    </div>
    
    <div className="space-y-6">
      <Card className="p-6 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center space-x-2">
          <span>Distribución por Obra Social</span>
        </h3>
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={stats.distributions.obraSocial.slice(0, 6)} 
                dataKey="value" 
                nameKey="name" 
                cx="50%" 
                cy="50%" 
                outerRadius={80} 
                innerRadius={55} 
                strokeWidth={4}
                stroke="#fff"
              >
                {stats.distributions.obraSocial.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-slate-800">{rows.length}</span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Total Empleados</span>
          </div>
        </div>
        <div className="space-y-3 pt-4">
          {stats.distributions.obraSocial.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-xs font-bold text-slate-600 truncate max-w-[120px]">{item.name}</span>
              </div>
              <span className="text-xs font-black text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

export default PersonalTab;
