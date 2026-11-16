import React from 'react';
import { MovementType } from '../../types/movement';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-[#E7EDE5] text-[#183D32] border-[#A8B8A2]/40',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
    info: 'bg-[#F1F0E9] text-[#252A27] border-[#E6E5DD]',
    neutral: 'bg-[#F8F7F2] text-[#777C76] border-[#E6E5DD]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const MovementBadge: React.FC<{ type: MovementType }> = ({ type }) => {
  const configs: Record<MovementType, { label: string; style: string }> = {
    PURCHASE: {
      label: 'Purchase (Inward)',
      style: 'bg-[#E7EDE5] text-[#183D32] border-[#A8B8A2]/40',
    },
    SALE: {
      label: 'Sale (Dispense)',
      style: 'bg-[#F1F0E9] text-[#252A27] border-[#E6E5DD]',
    },
    RETURN: {
      label: 'Patient Return',
      style: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    },
    ADJUSTMENT: {
      label: 'Stock Adjustment',
      style: 'bg-[#F8F7F2] text-[#4C544F] border-[#E6E5DD]',
    },
  };

  const config = configs[type] || { label: type, style: 'bg-[#F8F7F2] text-[#777C76] border-[#E6E5DD]' };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.style}`}
    >
      {config.label}
    </span>
  );
};
