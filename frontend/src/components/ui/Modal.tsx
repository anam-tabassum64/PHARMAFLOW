import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252A27]/40 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidthStyles[maxWidth]} bg-white rounded-2xl border border-[#E6E5DD] shadow-modal overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E6E5DD] bg-[#F8F7F2] flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-heading font-extrabold text-[#183D32] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#777C76] mt-0.5 leading-normal">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#777C76] hover:text-[#252A27] hover:bg-[#E6E5DD] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
