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
    isHealthLoading,
    isHealthError,
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
    isReadyLoading,
    isReadyError,
    refetch: refetchReady,
  } = useQuery({
    queryKey: ['system-readiness'],
    queryFn: healthApi.getReadiness,
    refetchInterval: 10000,
  }) as any;

  const isHealthy = !isHealthError && health?.status === 'healthy';
  const isReady = !isReadyError && readiness?.status === 'ready';

  return (
    <div className="space-y-6">
      {/* Infrastructure Status Banner */}
      <div className="p-6 rounded-2xl bg-slate-850 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isHealthy && isReady
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isHealthy && isReady ? 'All Production Systems Operational' : 'System Degraded / Offline'}
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isHealthy && isReady
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isHealthy && isReady ? 'HEALTHY' : 'INCIDENT'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              PharmaFlow Modular Monolith Engine • Automated health probes active every 10 seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refetchHealth();
              refetchReady();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Probe Now</span>
          </button>
          <a
            href="/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50"
          >
            <span>OpenAPI Spec</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Observability KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: API Liveness */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">FastAPI Service</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isHealthy ? 'Liveness: 200 OK' : 'Probe Failed'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Endpoint: <code className="text-slate-300 font-mono">GET /health</code>
          </div>
        </div>

        {/* Card 2: Database Readiness */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Link</span>
            <Database className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isReady ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isReady ? 'Readiness: Connected' : 'Unreachable'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Endpoint: <code className="text-slate-300 font-mono">GET /ready</code>
          </div>
        </div>

        {/* Card 3: Network Latency */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Round-Trip Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {latencyMs !== null ? `${latencyMs} ms` : 'Measuring...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Real-time API response time
          </div>
        </div>

        {/* Card 4: Engine Version */}
        <div className="p-5 rounded-2xl bg-slate-850 border border-slate-800 shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Engine Version</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            v{health?.version || '1.0.0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Env: <span className="text-slate-300 capitalize">{health?.environment || 'development'}</span>
          </div>
        </div>
      </div>

      {/* DevOps & Architecture Inspection Card */}
      <div className="rounded-2xl bg-slate-850 border border-slate-800 shadow-xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Production Engineering & Architectural Standards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Concurrency & Stock Guardrails
            </h4>
            <p className="text-slate-300 leading-relaxed">
              FastAPI backend incorporates conditional atomic queries (
              <code className="text-emerald-400">WHERE available_quantity &gt;= qty</code>) and row-level
              locking. Sales cannot oversell or make stock negative under simultaneous load.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              FEFO & Expiry Integrity
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Strict business validation prevents dispensing from expired lots (
              <code className="text-emerald-400">expiry_date &lt; date.today()</code>). Customer returns of
              expired items are barred from returning to saleable inventory.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Immutable Audit Trail
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Every purchase, sale, return, and adjustment writes an immutable{' '}
              <code className="text-emerald-400">StockMovement</code> record. Historical transactions
              cannot be silently mutated or removed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              DevOps Containerization & Probes
            </h4>
            <p className="text-slate-300 leading-relaxed">
              Dockerfile with non-root security user, built-in container health checks, automated
              Alembic migrations, and standardized Kubernetes-ready <code className="text-emerald-400">/health</code>{' '}
              and <code className="text-emerald-400">/ready</code> probes.
            </p>
          </div>
        </div>

        {/* Live Raw Diagnostic Payloads */}
        <div className="pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Live Diagnostics Response Payloads
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
              <code>{JSON.stringify(health || { status: 'loading...' }, null, 2)}</code>
            </pre>
            <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto">
              <code>{JSON.stringify(readiness || { status: 'loading...' }, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
