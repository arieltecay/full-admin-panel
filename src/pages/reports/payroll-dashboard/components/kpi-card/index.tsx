import React from 'react';
import { Card } from '../../../../../components/ui/Card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface KpiCardProps {
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'indigo' | 'amber' | 'rose' | 'pink';
  label: string;
  value: string | number;
  sub: string;
  variation?: number;
  negative?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  icon, color, label, value, sub, variation, negative 
}) => {
  const bgMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    pink: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
  };

  const isPositive = variation !== undefined && variation > 0;

  return (
    <Card className="p-5 flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm dark:bg-slate-900" hoverEffect>
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${bgMap[color]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">
            {label}
          </p>
          <p className={`text-2xl font-black tracking-tight text-slate-900 dark:text-white ${negative ? 'text-rose-600 dark:text-rose-400' : ''}`}>
            {value}
          </p>
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {sub}
          </p>
        </div>
      </div>

      {variation !== undefined && variation !== 0 && (
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-black ${
          isPositive ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
        }`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{Math.abs(variation).toFixed(1)}%</span>
        </div>
      )}
    </Card>
  );
};

export default KpiCard;
