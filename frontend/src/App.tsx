import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { BatchesPage } from './pages/BatchesPage';
import { InventoryPage } from './pages/InventoryPage';
import { MovementsPage } from './pages/MovementsPage';
import { ReportsPage } from './pages/ReportsPage';
import { HealthPage } from './pages/HealthPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 10, // 10 seconds
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentTab} />;
      case 'medicines':
        return <MedicinesPage />;
      case 'batches':
        return <BatchesPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'movements':
        return <MovementsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'health':
        return <HealthPage />;
      default:
        return <DashboardPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Layout
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onRefresh={() => queryClient.invalidateQueries()}
        >
          {renderActivePage()}
        </Layout>
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
