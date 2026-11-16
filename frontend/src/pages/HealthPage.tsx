import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import {
  Activity,
  CheckCircle2,
  Database,
  Server,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Cpu,
  Clock,
  Terminal,
} from 'lucide-react';

export const HealthPage: React.FC = () => {
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const {
    data: health,
    refetch: refetchHealth,
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const start = performance.now();
      const res = await healthApi.getHealth();
      const duration = Math.round(performance.now() - start);
      setLatencyMs(duration);
      return res;
    },
    refetchInterval: 10000,
  }) as any;

  const {
    data: readiness,
    isReadyError,
    refetch: refetchReady,
  } = useQuery({
    queryKey: ['system-readiness'],
    queryFn: healthApi.getReadiness,
    refetchInterval: 10000,
  }) as any;

  const isHealthy = health?.status === 'healthy';
  const isReady = !isReadyError && readiness?.status === 'ready';

  return (
    <div className="space-y-6">
      {/* Infrastructure Status Banner */}
      <div className="p-6 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isHealthy && isReady
                ? 'bg-[#E7EDE5] text-[#183D32] border border-[#A8B8A2]/50'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-heading font-bold text-[#252A27] tracking-tight">
                {isHealthy && isReady ? 'All Systems Operational' : 'System Degraded / Offline'}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isHealthy && isReady
                    ? 'bg-[#E7EDE5] text-[#183D32] border border-[#A8B8A2]/50'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {isHealthy && isReady ? 'HEALTHY' : 'INCIDENT'}
              </span>
            </div>
            <p className="text-xs text-[#777C76] mt-0.5">
              PharmaFlow Enterprise Engine • Automated health probes active every 10 seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              refetchHealth();
              refetchReady();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-[#F8F7F2] text-[#252A27] border border-[#E6E5DD] shadow-subtle transition-all duration-150"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#777C76]" />
            <span>Probe Now</span>
          </button>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#183D32] hover:bg-[#122E26] text-white shadow-subtle transition-all duration-150"
          >
            <span>API Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Observability KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: API Liveness */}
        <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
          <div className="flex items-center justify-between text-[#777C76] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">FastAPI Service</span>
            <Server className="w-4 h-4 text-[#183D32]" />
          </div>
          <div className="text-lg font-heading font-bold text-[#252A27] flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHealthy ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
            <span>{isHealthy ? 'Liveness: 200 OK' : 'Probe Failed'}</span>
          </div>
          <div className="text-[11px] text-[#777C76] mt-2">
            Endpoint: <code className="text-[#183D32] font-mono">GET /health</code>
          </div>
        </div>

        {/* Card 2: Database Readiness */}
        <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
          <div className="flex items-center justify-between text-[#777C76] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Database Link</span>
            <Database className="w-4 h-4 text-[#252A27]" />
          </div>
          <div className="text-lg font-heading font-bold text-[#252A27] flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isReady ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
            <span>{isReady ? 'Readiness: Connected' : 'Unreachable'}</span>
          </div>
          <div className="text-[11px] text-[#777C76] mt-2">
            Endpoint: <code className="text-[#183D32] font-mono">GET /ready</code>
          </div>
        </div>

        {/* Card 3: Network Latency */}
        <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
          <div className="flex items-center justify-between text-[#777C76] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Round-Trip Latency</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-heading font-bold font-mono text-[#183D32]">
            {latencyMs !== null ? `${latencyMs} ms` : 'Measuring...'}
          </div>
          <div className="text-[11px] text-[#777C76] mt-2">
            Real-time API response time
          </div>
        </div>

        {/* Card 4: Engine Version */}
        <div className="p-5 rounded-xl bg-white border border-[#E6E5DD] shadow-subtle">
          <div className="flex items-center justify-between text-[#777C76] mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Engine Version</span>
            <Cpu className="w-4 h-4 text-[#252A27]" />
          </div>
          <div className="text-lg font-heading font-bold text-[#252A27] font-mono">
            v{health?.version || '1.0.0'}
          </div>
          <div className="text-[11px] text-[#777C76] mt-2">
            Env: <span className="text-[#252A27] capitalize">{health?.environment || 'production'}</span>
          </div>
        </div>
      </div>

      {/* Production Engineering & Architectural Standards Card */}
      <div className="rounded-xl bg-white border border-[#E6E5DD] shadow-subtle p-6 space-y-6">
        <h3 className="text-sm font-heading font-bold text-[#252A27] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#183D32]" />
          Production Engineering & Architectural Standards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] space-y-1.5">
            <h4 className="font-heading font-semibold text-[#252A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#183D32]" />
              Concurrency & Stock Guardrails
            </h4>
            <p className="text-[#777C76] leading-relaxed">
              FastAPI backend incorporates conditional atomic queries (
              <code className="text-[#183D32] font-mono">WHERE available_quantity &gt;= qty</code>) and row-level
              locking. Sales cannot oversell or make stock negative under simultaneous load.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] space-y-1.5">
            <h4 className="font-heading font-semibold text-[#252A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#183D32]" />
              FEFO & Expiry Integrity
            </h4>
            <p className="text-[#777C76] leading-relaxed">
              Strict business validation prevents dispensing from expired lots (
              <code className="text-[#183D32] font-mono">expiry_date &lt; date.today()</code>). Customer returns of
              expired items are barred from returning to saleable inventory.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] space-y-1.5">
            <h4 className="font-heading font-semibold text-[#252A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#183D32]" />
              Immutable Audit Trail
            </h4>
            <p className="text-[#777C76] leading-relaxed">
              Every purchase, sale, return, and adjustment writes an immutable{' '}
              <code className="text-[#183D32] font-mono">StockMovement</code> record. Historical transactions
              cannot be silently mutated or removed.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#F8F7F2] border border-[#E6E5DD] space-y-1.5">
            <h4 className="font-heading font-semibold text-[#252A27] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#183D32]" />
              DevOps Containerization & Probes
            </h4>
            <p className="text-[#777C76] leading-relaxed">
              Dockerfile with non-root security user, built-in container health checks, automated
              Alembic migrations, and standardized Kubernetes-ready <code className="text-[#183D32] font-mono">/health</code>{' '}
              and <code className="text-[#183D32] font-mono">/ready</code> probes.
            </p>
          </div>
        </div>

        {/* Live Raw Diagnostic Payloads */}
        <div className="pt-2">
          <span className="text-xs font-heading font-bold uppercase tracking-wider text-[#252A27] block mb-2 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-[#183D32]" />
            Live Diagnostics Response Payloads
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <pre className="p-4 rounded-xl bg-[#252A27] font-mono text-[11px] text-[#A8B8A2] overflow-x-auto border border-[#3F4743]">
              <code>{JSON.stringify(health || { status: 'loading...' }, null, 2)}</code>
            </pre>
            <pre className="p-4 rounded-xl bg-[#252A27] font-mono text-[11px] text-[#E7EDE5] overflow-x-auto border border-[#3F4743]">
              <code>{JSON.stringify(readiness || { status: 'loading...' }, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
export default HealthPage;
