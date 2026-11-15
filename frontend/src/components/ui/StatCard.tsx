import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
}) => {
  const colorMap = {
    emerald: {
      bg: 'from-emerald-500/10 to-transparent border-emerald-500/20',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-transparent border-amber-500/20',
      iconBg: 'bg-amber-500/15 text-amber-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-transparent border-rose-500/20',
      iconBg: 'bg-rose-500/15 text-rose-400',
    },
    sky: {
      bg: 'from-sky-500/10 to-transparent border-sky-500/20',
      iconBg: 'bg-sky-500/15 text-sky-400',
    },
    indigo: {
      bg: 'from-indigo-500/10 to-transparent border-indigo-500/20',
      iconBg: 'bg-indigo-500/15 text-indigo-400',
    },
  };

  const style = colorMap[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${style.bg} bg-slate-850/80 p-5 border shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-slate-600`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};
