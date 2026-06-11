import React from 'react';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card } from '../../../../../../components/ui/Card';
import type { TabWithStatsProps } from '../types';

const CHART_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6', '#f43f5e'];

export const CostosTab: React.FC<TabWithStatsProps> = ({ rows, stats, formatCurrency }) => {
  const sucursalData = stats.distributions.localidad.length > 0
    ? stats.distributions.localidad
    : stats.distributions.condicion;

  const topEmployees = [...rows]
    .sort((a, b) => (Number(b['Neto a Pagar']) || 0) - (Number(a['Neto a Pagar']) || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
            <DollarSign size={16} className="text-emerald-500" />
            <span>Distribución Regional</span>
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sucursalData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {sucursalData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 space-y-4 border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 flex items-center space-x-2">
            <TrendingUp size={16} className="text-indigo-500" />
            <span>Inversión Variable</span>
          </h3>
          <div className="space-y-5 pt-2">
            {[
              { label: 'Bono por Objetivos', value: stats.summary.totalAdicionales * 0.65, color: 'bg-indigo-500' },
              { label: 'Asistencia y Puntualidad', value: stats.summary.totalAdicionales * 0.25, color: 'bg-emerald-500' },
              { label: 'Otros Incentivos', value: stats.summary.totalAdicionales * 0.10, color: 'bg-amber-400' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1.5 font-bold">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-900">{formatCurrency(item.value)}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.value / (stats.summary.totalAdicionales || 1)) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center space-x-2">
          <Award size={16} className="text-amber-500" />
          <span>Top de Masa Salarial</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topEmployees.map((emp, i) => (
            <Card key={i} className="p-4 text-center border-slate-50 bg-slate-50/30" hoverEffect>
              <p className="text-[10px] font-black text-slate-400">RANK #{i + 1}</p>
              <p className="text-xs font-bold text-slate-800 truncate mt-1">{emp['Apellido y Nombre']}</p>
              <p className="text-base font-black text-indigo-600 mt-2">
                {formatCurrency(Number(emp['Neto a Pagar']) || 0)}
              </p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CostosTab;
