import { ThemeProvider } from 'next-themes';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPWA } from './components/InstallPWA';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { Toaster } from './components/ui/sonner';
import { useKeyboardNavigation, SkipLink } from './components/ui/accessibility';
import { SkeletonScreen } from './components/ui/skeleton-screen';
import { useState, useEffect } from 'react';
import { isDemoMode } from './lib/supabase';
import { seedDatabase } from './lib/seedData';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { AppRouter } from './AppRouter';

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');

  // Enable keyboard navigation
  useKeyboardNavigation();

  // Seed database if empty and in demo mode
  useEffect(() => {
    if (isDemoMode) {
      const hasSeeded = localStorage.getItem('wasel_demo_seeded');
      if (!hasSeeded) {
        seedDatabase().then(() => {
          localStorage.setItem('wasel_demo_seeded', 'true');
        });
      }
    }
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <SkeletonScreen variant="dashboard" className="max-w-md" />
      </div>
    );
  }

  // If not logged in, show Landing Page or Auth Page
  // Note: Future improvement would be to move these into the generic Router as public routes
  if (!user) {
    if (showAuthPage) {
      return (
        <>
          <Toaster />
          <AuthPage
            initialTab={authTab}
            onBack={() => setShowAuthPage(false)}
            onSuccess={() => {
              // AuthContext will automatically update user state
            }}
          />
        </>
      );
    }

    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <InstallPWA />
      <Toaster />
      <AppRouter />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <AIProvider>
                <AppContent />
              </AIProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}