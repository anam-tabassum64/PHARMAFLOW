import React from 'react';
import { LucideIcon, PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = PackageOpen,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-700 bg-slate-850/40 my-6">
      <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 mb-4 border border-slate-700/50">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-900/30"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
