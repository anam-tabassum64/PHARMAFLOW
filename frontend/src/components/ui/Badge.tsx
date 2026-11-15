import React from 'react';
import { MovementType } from '../../types/movement';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'teal';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded font-medium',
    md: 'text-xs px-2.5 py-1 rounded font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border ${variantStyles[variant]} ${sizeStyles[size]}`}
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
      return <Badge variant="teal">SALE</Badge>;
    case 'RETURN':
      return <Badge variant="warning">RETURN</Badge>;
    case 'ADJUSTMENT':
      return <Badge variant="neutral">ADJUSTMENT</Badge>;
    default:
      return <Badge variant="neutral">{type}</Badge>;
  }
};
