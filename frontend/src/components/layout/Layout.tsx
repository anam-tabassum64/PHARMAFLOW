import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onRefresh?: () => void;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onRefresh,
  currentUser,
  onLogout,
  children,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F8F7F2] text-[#252A27] antialiased font-sans selection:bg-[#183D32] selection:text-white">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onRefresh={onRefresh}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          currentUser={currentUser}
        />
        <main className="flex-1 p-5 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
