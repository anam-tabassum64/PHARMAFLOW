import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Boxes,
  Layers,
  ArrowLeftRight,
  BarChart3,
  Activity,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'medicines'
  | 'batches'
  | 'inventory'
  | 'movements'
  | 'reports'
  | 'health';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines' as NavTab, label: 'Medicine Catalogue', icon: Pill },
    { id: 'batches' as NavTab, label: 'Batch Management', icon: Boxes },
    { id: 'inventory' as NavTab, label: 'Inventory Overview', icon: Layers },
    { id: 'movements' as NavTab, label: 'Stock Movements', icon: ArrowLeftRight },
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'health' as NavTab, label: 'System Health', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
            PharmaFlow
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              v1.0
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Inventory & Batch Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="rounded-xl bg-slate-850 p-3 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Algions AI Labs</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Pharmacy Inventory DevOps & Cloud Engineering
          </p>
        </div>
      </div>
    </aside>
  );
};
