import React from 'react';
import { MovementType } from '../../types/movement';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const variantStyles = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    info: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    neutral: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full',
    md: 'text-sm px-3 py-1 rounded-lg',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export const MovementBadge: React.FC<{ type: MovementType }> = ({ type }) => {
  switch (type) {
    case 'PURCHASE':
      return <Badge variant="success">PURCHASE</Badge>;
    case 'SALE':
      return <Badge variant="info">SALE</Badge>;
    case 'RETURN':
      return <Badge variant="warning">RETURN</Badge>;
    case 'ADJUSTMENT':
      return <Badge variant="purple">ADJUSTMENT</Badge>;
    default:
      return <Badge variant="neutral">{type}</Badge>;
  }
};
