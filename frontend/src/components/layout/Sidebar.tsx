import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Boxes,
  Layers,
  ArrowLeftRight,
  BarChart3,
  Activity,
  Cross,
  Building2,
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
  const operationsNav = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines' as NavTab, label: 'Medicine Formulary', icon: Pill },
    { id: 'batches' as NavTab, label: 'Batch Control', icon: Boxes },
    { id: 'inventory' as NavTab, label: 'Inventory Levels', icon: Layers },
    { id: 'movements' as NavTab, label: 'Stock Movements', icon: ArrowLeftRight },
  ];

  const auditNav = [
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'health' as NavTab, label: 'System Health', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#14243A] border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm">
          <Cross className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white">
              PharmaFlow
            </h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-teal-400 font-mono border border-slate-700">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-normal">
            Inventory & Batch System
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Operations Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Operations
          </div>
          <div className="space-y-1">
            {operationsNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Governance & Compliance Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Governance & Audit
          </div>
          <div className="space-y-1">
            {auditNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Facility Footer Info */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="rounded-lg bg-slate-900/90 p-3 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Dispensary Unit #4</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            St. Jude Central Dispensary
            <br />
            License #PH-2026-MUM
          </p>
        </div>
      </div>
    </aside>
  );
};
