import React from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onRefresh,
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar currentTab={currentTab} onSelectTab={onSelectTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentTab={currentTab} onRefresh={onRefresh} />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
