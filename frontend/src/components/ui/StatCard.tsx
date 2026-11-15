import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'emerald' | 'amber' | 'rose' | 'navy' | 'slate';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'teal',
  badge,
}) => {
  const variantStyles = {
    teal: {
      iconBg: 'bg-teal-50 text-teal-700 border-teal-200/60',
      accent: 'border-l-4 border-l-teal-700',
    },
    emerald: {
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      accent: 'border-l-4 border-l-emerald-600',
    },
    amber: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200/60',
      accent: 'border-l-4 border-l-amber-600',
    },
    rose: {
      iconBg: 'bg-red-50 text-red-700 border-red-200/60',
      accent: 'border-l-4 border-l-red-600',
    },
    navy: {
      iconBg: 'bg-slate-100 text-navy-800 border-slate-200',
      accent: 'border-l-4 border-l-navy-800',
    },
    slate: {
      iconBg: 'bg-slate-50 text-slate-600 border-slate-200',
      accent: 'border-l-4 border-l-slate-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.teal;

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200/90 shadow-sm p-4 transition-all duration-150 hover:border-slate-300 hover:shadow ${style.accent}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`w-8 h-8 rounded flex items-center justify-center border ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
          {badge && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1 truncate">{subtitle}</p>}
      </div>
    </div>
  );
};
