import React from 'react';
import { TrendingUp, Info, Users } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Card } from '../../../../../../components/ui/Card';
import type { BaseTabProps } from '../types';

export const DesviosTab: React.FC<BaseTabProps> = ({ rows, formatCurrency }) => {
  const totalAdicionales = rows.reduce((s, r) => s + (Number(r['Adicionales']) || 0), 0);
  const totalInasistencias = rows.reduce((s, r) => s + (Number(r['Inasistencias']) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <span>Variables de Operación</span>
        </h3>
        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Adicional Total</span>
          <span className="text-lg font-black text-slate-900">{formatCurrency(totalAdicionales)}</span>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <Info size={16} className="text-rose-500" />
          <span>Licencias & Ausentismo</span>
        </h3>
        <div className="flex justify-between items-center p-4 bg-rose-50/50 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase">Jornadas Perdidas</span>
          <span className="text-lg font-black text-rose-600">{totalInasistencias} días</span>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <Users size={16} className="text-emerald-500" />
          <span>Indicador de Presentismo</span>
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={[
                  { name: 'Presentismo', value: rows.length - totalInasistencias }, 
                  { name: 'Pérdida', value: totalInasistencias }
                ]} 
                dataKey="value" 
                cx="50%" 
                cy="50%" 
                innerRadius={35} 
                outerRadius={55}
                stroke="transparent"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DesviosTab;
