import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="p-10 rounded-xl bg-white border border-dashed border-[#A8B8A2]/60 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-xl bg-[#E7EDE5] text-[#183D32] flex items-center justify-center mb-3.5 shadow-subtle">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-heading font-extrabold text-[#183D32] tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#777C76] max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
