import React from 'react';
import {
  LayoutDashboard,
  Pill,
  Boxes,
  Layers,
  ArrowLeftRight,
  BarChart3,
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'medicines'
  | 'batches'
  | 'inventory'
  | 'movements'
  | 'suppliers'
  | 'reports'
  | 'health';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  currentUser,
  onLogout,
}) => {
  const operationsNav = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines' as NavTab, label: 'Medicine Formulary', icon: Pill },
    { id: 'batches' as NavTab, label: 'Batch Control', icon: Boxes },
    { id: 'inventory' as NavTab, label: 'Inventory Levels', icon: Layers },
    { id: 'movements' as NavTab, label: 'Stock Movements', icon: ArrowLeftRight },
    { id: 'suppliers' as NavTab, label: 'Suppliers & Vendors', icon: Building2 },
  ];

  const auditNav = [
    { id: 'reports' as NavTab, label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'health' as NavTab, label: 'System Health', icon: Activity },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#183D32] text-white">
      {/* Brand Header */}
      <div className={`h-18 flex items-center border-b border-[#235345] px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#E7EDE5] text-[#183D32] flex items-center justify-center shrink-0 shadow-subtle">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <span className="font-heading font-extrabold text-sm tracking-tight text-white block">
                PHARMAFLOW
              </span>
              <span className="text-[10px] text-[#A8B8A2] font-medium tracking-wider uppercase block">
                Dispensary Engine
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-[#A8B8A2] hover:text-white hover:bg-[#235345] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {/* Operations Group */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#A8B8A2]">
              Operations
            </div>
          )}
          <div className="space-y-1">
            {operationsNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E7EDE5] text-[#183D32] shadow-subtle'
                      : 'text-[#D5DFD1] hover:text-white hover:bg-[#235345]/50'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#183D32]' : 'text-[#A8B8A2]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audit Group */}
        <div>
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#A8B8A2]">
              Governance & Audit
            </div>
          )}
          <div className="space-y-1">
            {auditNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E7EDE5] text-[#183D32] shadow-subtle'
                      : 'text-[#D5DFD1] hover:text-white hover:bg-[#235345]/50'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#183D32]' : 'text-[#A8B8A2]'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-[#235345]">
        <div className={`rounded-xl bg-[#122E26] p-2.5 flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#E7EDE5] text-[#183D32] font-heading font-bold text-xs flex items-center justify-center shrink-0">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
            </div>
            {!isCollapsed && (
              <div className="leading-tight overflow-hidden text-left">
                <span className="font-semibold text-xs text-white block truncate">
                  {currentUser?.name || 'Lead Pharmacist'}
                </span>
                <span className="text-[10px] text-[#A8B8A2] block truncate">
                  {currentUser?.role || 'Dispensary Shift #1'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out to Portal"
              className="p-1.5 rounded-lg text-[#A8B8A2] hover:text-white hover:bg-[#235345] transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 min-h-screen transition-all duration-200 border-r border-[#235345] ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-40 bg-[#252A27]/50 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#183D32] transition-transform duration-200 ease-in-out shadow-modal ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};
