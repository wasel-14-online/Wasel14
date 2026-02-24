import { lazy, Suspense } from 'react';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPWA } from './components/InstallPWA';
import { DemoBanner } from './components/DemoBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { Toaster } from './components/ui/sonner';
import { useState } from 'react';

// Lazy load components for code splitting
const AuthPage = lazy(() => import('./components/AuthPage').then(m => ({ default: m.AuthPage })));
const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const EnhancedDashboard = lazy(() => import('./components/premium/EnhancedDashboard'));
const FindRide = lazy(() => import('./components/FindRide').then(m => ({ default: m.FindRide })));
const Sidebar = lazy(() => import('./components/Sidebar'));
const Header = lazy(() => import('./components/Header'));
const VoiceAssistant = lazy(() => import('./components/advanced/VoiceAssistant').then(m => ({ default: m.VoiceAssistant })));
const FloatingActionButton = lazy(() => import('./components/premium/FloatingActionButton').then(m => ({ default: m.FloatingActionButton })));

const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    if (showAuthPage) {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <Toaster />
          <AuthPage
            initialTab={authTab}
            onBack={() => setShowAuthPage(false)}
            onSuccess={() => {}}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Toaster />
        <LandingPage
          onLogin={() => {
            setAuthTab('login');
            setShowAuthPage(true);
          }}
          onGetStarted={() => {
            setAuthTab('signup');
            setShowAuthPage(true);
          }}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InstallPWA />
      <Toaster />
      <VoiceAssistant />
      <FloatingActionButton
        onBookRide={() => setCurrentPage('find-ride')}
        onBookDelivery={() => setCurrentPage('package-delivery')}
        onScheduleTrip={() => setCurrentPage('scheduled-trips')}
        onCorporateBooking={() => setCurrentPage('business')}
      />
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setCurrentPage} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <DemoBanner />
            {currentPage === 'dashboard' && <EnhancedDashboard onNavigate={setCurrentPage} />}
            {currentPage === 'find-ride' && <FindRide />}
          </main>
        </div>
      </div>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <LanguageProvider>
          <AuthProvider>
            <AIProvider>
              <AppContent />
            </AIProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
