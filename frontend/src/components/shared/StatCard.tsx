import React from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  sub?: string;
  accent?: 'default' | 'cyan' | 'violet' | 'emerald' | 'rose' | 'amber';
  className?: string;
}

const accentMap = {
  default: 'text-indigo-400',
  cyan:    'text-cyan-400',
  violet:  'text-violet-400',
  emerald: 'text-emerald-400',
  rose:    'text-rose-400',
  amber:   'text-amber-400',
};

export function StatCard({ label, value, icon, sub, accent = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/5 bg-[#0d1424] p-5 flex flex-col gap-2',
        'hover:border-indigo-500/30 hover:bg-[#131d2e] transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">{label}</span>
        {icon && <span className={cn('opacity-70', accentMap[accent])}>{icon}</span>}
      </div>
      <div className={cn('text-3xl font-bold', accentMap[accent])}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
