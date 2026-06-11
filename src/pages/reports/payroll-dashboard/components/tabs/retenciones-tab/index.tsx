import React from 'react';
import { Percent, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card } from '../../../../../../components/ui/Card';
import type { BaseTabProps } from '../types';

export const RetencionesTab: React.FC<BaseTabProps> = ({ rows, formatCurrency }) => {
  const totalRem = rows.reduce((s, r) => s + (Number(r['Neto a Pagar']) || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-500">
      <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <Percent size={16} className="text-rose-500" />
          <span>Retenciones Previsionales</span>
        </h3>
        <div className="space-y-4 pt-2">
          <div className="flex justify-between">
            <span className="text-xs font-bold text-slate-500">Jubilación (11%)</span>
            <span className="text-sm font-black text-rose-600">{formatCurrency(-totalRem * 0.11)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-bold text-slate-500">Obra Social (3%)</span>
            <span className="text-sm font-black text-rose-600">{formatCurrency(-totalRem * 0.03)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <span>Bruto vs Neto</span>
        </h3>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Bruto', value: totalRem * 1.2 },
              { name: 'Neto', value: totalRem }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                <Cell fill="#6366f1" />
                <Cell fill="#10b981" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default RetencionesTab;
