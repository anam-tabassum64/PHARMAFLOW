import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../../api/healthApi';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onRefresh }) => {
  const { data: health, isSuccess, isError, isFetching, refetch } = useQuery({
    queryKey: ['system-health-badge'],
    queryFn: healthApi.getHealth,
    refetchInterval: 30000,
    retry: 1,
  });

  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Pharmacy Inventory Workspace',
      subtitle: 'Real-time stock valuation, critical alerts, and operational ledger',
    },
    medicines: {
      title: 'Medicine Master Formulary',
      subtitle: 'Pharmaceutical products, SKU codes, therapeutic categories, and reorder thresholds',
    },
    batches: {
      title: 'Batch Inventory Control',
      subtitle: 'Production lot tracking, manufacturing dates, expiry dates, and pricing margins',
    },
    inventory: {
      title: 'Inventory Stock Levels',
      subtitle: 'Aggregated stock across all batches with low-stock deficit indicators',
    },
    movements: {
      title: 'Stock Movements & Transactions',
      subtitle: 'Dispensing, purchases, patient returns, and inventory reconciliation',
    },
    reports: {
      title: 'Clinical & Operational Reports',
      subtitle: 'Exportable stock valuation, expiry stratification, and audit ledgers',
    },
    health: {
      title: 'System Health & Infrastructure',
      subtitle: 'Service probes, database connectivity, and runtime metrics',
    },
  };

  const current = titles[currentTab] || { title: 'PharmaFlow', subtitle: 'Platform' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      <div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-500 hidden sm:block">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Backend Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSuccess
                ? 'bg-emerald-600'
                : isError
                ? 'bg-red-600'
                : 'bg-amber-500'
            }`}
          />
          <span className="font-medium text-slate-700">
            {isSuccess ? 'API Online' : isError ? 'API Disconnected' : 'Connecting...'}
          </span>
          {health?.version && (
            <span className="text-[10px] text-slate-400 font-mono">v{health.version}</span>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => {
            refetch();
            onRefresh?.();
          }}
          disabled={isFetching}
          title="Refresh view"
          className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-teal-700' : ''}`} />
        </button>

        {/* Swagger Docs Link */}
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-sm transition-colors"
        >
          <span>API Docs</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
