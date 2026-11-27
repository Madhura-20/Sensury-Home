import React, { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WorkspaceLayout } from './components/WorkspaceLayout';
import { SensuryProvider, useSensury } from './context/SensuryContext';
import { AppPage } from './types/sensury';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PlannerPage } from './pages/PlannerPage';
import { JourneyPage } from './pages/JourneyPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ComparePage } from './pages/ComparePage';
import { ProfessionalsPage } from './pages/ProfessionalsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { TrackerPage } from './pages/TrackerPage';
import { AssistantPage } from './pages/AssistantPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

function AppShell() {
  const { authReady, user } = useSensury();
  const [page, setPage] = useState<AppPage>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const navigate = (next: AppPage, nextAuthMode?: 'login' | 'register') => {
    if (next === 'auth' && nextAuthMode) {
      setAuthMode(nextAuthMode);
    }
    setPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <p className="text-sm font-medium text-[#475569]">Loading SENSURY HOME...</p>
      </div>
    );
  }

  // If signed in with unverified email, hold on verification card on AuthPage
  if (user && !user.emailVerified && page !== 'landing') {
    return <AuthPage onNavigate={navigate} initialMode={authMode} />;
  }

  if (page === 'landing') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (page === 'auth') {
    return <AuthPage onNavigate={navigate} initialMode={authMode} />;
  }

  return (
    <WorkspaceLayout currentPage={page} onNavigate={navigate}>
      {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
      {page === 'planner' && <PlannerPage onNavigate={navigate} />}
      {page === 'journey' && <JourneyPage />}
      {page === 'materials' && <MaterialsPage onNavigate={navigate} />}
      {page === 'calculator' && <CalculatorPage />}
      {page === 'compare' && <ComparePage />}
      {page === 'professionals' && <ProfessionalsPage onNavigate={navigate} />}
      {page === 'documents' && <DocumentsPage onNavigate={navigate} />}
      {page === 'tracker' && <TrackerPage onNavigate={navigate} />}
      {page === 'assistant' && <AssistantPage onNavigate={navigate} />}
      {page === 'profile' && <ProfilePage onNavigate={navigate} />}
      {page === 'admin' && <AdminPage />}
    </WorkspaceLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SensuryProvider>
        <AppShell />
      </SensuryProvider>
    </ErrorBoundary>
  );
}
