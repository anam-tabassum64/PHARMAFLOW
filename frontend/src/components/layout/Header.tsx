import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../../api/healthApi';
import { Activity, ExternalLink, RefreshCw } from 'lucide-react';
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
      title: 'Executive Inventory Dashboard',
      subtitle: 'Real-time pharmacy metrics, stock valuation, and activity trends',
    },
    medicines: {
      title: 'Medicine Master Catalogue',
      subtitle: 'Manage pharmaceutical products, SKU codes, categories and reorder thresholds',
    },
    batches: {
      title: 'Batch Inventory Control',
      subtitle: 'Track production lots, manufacturing dates, expiry dates and pricing',
    },
    inventory: {
      title: 'Inventory Stock Levels',
      subtitle: 'Aggregated stock across all batches with low-stock deficit indicators',
    },
    movements: {
      title: 'Stock Movements & Audit Operations',
      subtitle: 'Execute Purchases, Sales, Returns and Adjustments with atomic integrity',
    },
    reports: {
      title: 'Reports & Clinical Audit Trail',
      subtitle: 'Exportable stock valuation, expiry stratification and transaction ledgers',
    },
    health: {
      title: 'System Health & DevOps Observability',
      subtitle: 'Live probes, database readiness status and infrastructure runtime metrics',
    },
  };

  const current = titles[currentTab] || { title: 'PharmaFlow', subtitle: 'Platform' };

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-base font-bold text-white tracking-tight">{current.title}</h2>
        <p className="text-xs text-slate-400 hidden sm:block">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSuccess
                ? 'bg-emerald-400 animate-pulse'
                : isError
                ? 'bg-rose-500'
                : 'bg-amber-400 animate-ping'
            }`}
          />
          <span className="font-medium text-slate-300">
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
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
        </button>

        {/* Swagger Docs Link */}
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/60 transition-colors"
        >
          <span>OpenAPI Docs</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};
