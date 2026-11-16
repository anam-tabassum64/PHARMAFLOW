import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../../api/healthApi';
import { ExternalLink, RefreshCw, Menu, ShieldCheck } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onRefresh?: () => void;
  onToggleMobileMenu?: () => void;
  currentUser?: { name: string; email: string; role: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onRefresh,
  onToggleMobileMenu,
  currentUser,
}) => {
  const { data: health, isSuccess, isError, isFetching, refetch } = useQuery({
    queryKey: ['system-health-badge'],
    queryFn: healthApi.getHealth,
    refetchInterval: 30000,
    retry: 1,
  });

  const tabMetadata: Record<NavTab, { title: string; category: string }> = {
    dashboard: {
      title: 'Pharmacy Operations Workspace',
      category: 'Operations',
    },
    medicines: {
      title: 'Medicine Master Formulary',
      category: 'Operations',
    },
    batches: {
      title: 'Batch Inventory Control',
      category: 'Operations',
    },
    inventory: {
      title: 'Inventory Stock Levels & Deficits',
      category: 'Operations',
    },
    movements: {
      title: 'Stock Movements & Audit Transactions',
      category: 'Operations',
    },
    suppliers: {
      title: 'Supplier & Manufacturer Directory',
      category: 'Operations',
    },
    reports: {
      title: 'Clinical & Operational Analytics',
      category: 'Governance & Audit',
    },
    health: {
      title: 'System Health & Infrastructure',
      category: 'Governance & Audit',
    },
  };

  const current = tabMetadata[currentTab] || { title: 'Workspace', category: 'Operations' };

  return (
    <header className="h-16 bg-[#F8F7F2] border-b border-[#E6E5DD] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-[#252A27] hover:bg-[#E7EDE5] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#777C76] font-medium">
            <span>{current.category}</span>
            <span>/</span>
            <span className="text-[#183D32] font-semibold">{current.title}</span>
          </div>
          <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#183D32] tracking-tight">
            {current.title}
          </h2>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Backend Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#E6E5DD] shadow-subtle text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSuccess
                ? 'bg-[#2D7A58]'
                : isError
                ? 'bg-[#C93B2B]'
                : 'bg-[#C27803]'
            }`}
          />
          <span className="font-semibold text-[#252A27]">
            {isSuccess ? 'Engine Online' : isError ? 'Engine Disconnected' : 'Connecting...'}
          </span>
          {health?.version && (
            <span className="text-[10px] text-[#777C76] font-mono">v{health.version}</span>
          )}
        </div>

        {/* Refresh Action */}
        <button
          onClick={() => {
            refetch();
            onRefresh?.();
          }}
          disabled={isFetching}
          title="Refresh view"
          className="p-2 rounded-lg text-[#777C76] hover:text-[#183D32] hover:bg-[#E7EDE5] border border-[#E6E5DD] bg-white transition-colors disabled:opacity-50 shadow-subtle"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-[#183D32]' : ''}`} />
        </button>

        {/* Swagger Docs Link */}
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#E7EDE5] text-[#183D32] text-xs font-semibold border border-[#E6E5DD] shadow-subtle transition-colors"
        >
          <span>OpenAPI</span>
          <ExternalLink className="w-3 h-3 text-[#777C76]" />
        </a>

        {/* User Pill */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#E6E5DD]">
          <div className="w-7 h-7 rounded-full bg-[#183D32] text-white flex items-center justify-center font-heading font-bold text-xs">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <span className="text-xs font-medium text-[#252A27]">
            {currentUser?.name || 'Pharmacist'}
          </span>
        </div>
      </div>
    </header>
  );
};
