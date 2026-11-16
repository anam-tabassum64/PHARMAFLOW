import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'forest' | 'sage' | 'amber' | 'rose' | 'charcoal' | 'teal' | 'emerald' | 'navy';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'forest',
  badge,
}) => {
  const variantStyles = {
    forest: {
      iconBg: 'bg-[#E7EDE5] text-[#183D32] border border-[#A8B8A2]/30',
      accent: 'border-l-4 border-l-[#183D32]',
    },
    sage: {
      iconBg: 'bg-[#F1F0E9] text-[#4C544F] border border-[#E6E5DD]',
      accent: 'border-l-4 border-l-[#A8B8A2]',
    },
    amber: {
      iconBg: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
      accent: 'border-l-4 border-l-[#C27803]',
    },
    rose: {
      iconBg: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]',
      accent: 'border-l-4 border-l-[#C93B2B]',
    },
    charcoal: {
      iconBg: 'bg-[#F1F0E9] text-[#252A27] border border-[#E6E5DD]',
      accent: 'border-l-4 border-l-[#252A27]',
    },
    // Backwards compatibility mappings
    teal: {
      iconBg: 'bg-[#E7EDE5] text-[#183D32] border border-[#A8B8A2]/30',
      accent: 'border-l-4 border-l-[#183D32]',
    },
    emerald: {
      iconBg: 'bg-[#E7EDE5] text-[#183D32] border border-[#A8B8A2]/30',
      accent: 'border-l-4 border-l-[#183D32]',
    },
    navy: {
      iconBg: 'bg-[#F1F0E9] text-[#252A27] border border-[#E6E5DD]',
      accent: 'border-l-4 border-l-[#252A27]',
    },
  };

  const style = variantStyles[variant] || variantStyles.forest;

  return (
    <div
      className={`bg-white rounded-xl border border-[#E6E5DD] p-4 sm:p-5 shadow-subtle hover:border-[#A8B8A2]/60 transition-all ${style.accent}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777C76]">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${style.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-heading font-extrabold text-[#183D32] tracking-tight">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              badge.toLowerCase().includes('expired') || badge.toLowerCase().includes('deficit')
                ? 'bg-[#FEE2E2] text-[#991B1B]'
                : badge.toLowerCase().includes('restock') || badge.toLowerCase().includes('warning')
                ? 'bg-[#FEF3C7] text-[#92400E]'
                : 'bg-[#E7EDE5] text-[#183D32]'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-[#777C76] mt-1.5 font-medium leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
};
