import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { NavTab } from './components/layout/Sidebar';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { LandingPage } from './pages/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardPage } from './pages/DashboardPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { BatchesPage } from './pages/BatchesPage';
import { InventoryPage } from './pages/InventoryPage';
import { MovementsPage } from './pages/MovementsPage';
import { SuppliersPage } from './pages/SuppliersPage';
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

interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Check saved session on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pharmaflow_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
          setCurrentView('app');
        }
      }
    } catch (e) {
      console.warn('Could not parse stored auth user session', e);
    }
  }, []);

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleExploreWorkspace = () => {
    if (!currentUser) {
      const demoUser: AuthUser = {
        name: 'Dr. Sarah Mitchell',
        email: 's.mitchell@pharmaflow.health',
        role: 'Chief Pharmacist',
      };
      setCurrentUser(demoUser);
      localStorage.setItem('pharmaflow_auth_user', JSON.stringify(demoUser));
    }
    setCurrentView('app');
  };

  const handleAuthSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setCurrentView('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('pharmaflow_auth_user');
    setCurrentUser(null);
    setCurrentView('landing');
    setCurrentTab('dashboard');
  };

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
      case 'suppliers':
        return <SuppliersPage />;
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
        {isInitializing ? (
          <LoadingScreen onComplete={() => setIsInitializing(false)} />
        ) : currentView === 'landing' ? (
          <>
            <LandingPage
              onLoginClick={handleOpenLogin}
              onGetStartedClick={handleOpenSignup}
              onExploreWorkspace={handleExploreWorkspace}
            />
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              initialMode={authModalMode}
              onSuccess={handleAuthSuccess}
            />
          </>
        ) : (
          <Layout
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onRefresh={() => queryClient.invalidateQueries()}
            currentUser={currentUser}
            onLogout={handleLogout}
          >
            {renderActivePage()}
          </Layout>
        )}
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
