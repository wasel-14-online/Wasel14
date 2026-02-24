import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPWA } from './components/InstallPWA';
import { DemoBanner } from './components/DemoBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AIProvider } from './contexts/AIContext';
import { Toaster } from './components/ui/sonner';
import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import {
  FindRide,
  OfferRide,
  MyTrips,
  RecurringTrips,
  Messages,
  Favorites,
  Payments,
  TripAnalytics,
  SafetyCenter,
  VerificationCenter,
  Settings,
  NotificationCenter,
  UserProfile,
  ReferralProgram,
  BusinessAccounts,
  PackageDelivery,
  Sidebar,
  Header,
  LiveTrip,
  TripExport,
  CancelTrip,
  PromoCodesManager,
  PopularRoutes,
  WorkflowGuide,
  DriverEarnings,
  DisputeCenter,
  PaymentMethods,
  ScheduledTrips,
  CurrencySelector,
  EnhancedRating,
  SafetyReport,
  DriverBadges,
  CancellationPolicy,
  RefundStatus,
  TripInsurance,
  AccidentReport,
  InsuranceClaim,
  ScooterRentals,
  FreightShipping,
  PetTransport,
  SchoolTransport,
  MedicalTransport,
  CarRentals,
  ShuttleService,
  LuxuryRides,
  ThinkingCoach
} from './components/FindRide';
import { DriverEconomySystem } from './components/driver/DriverEconomySystem';
import { AdminDashboard } from './components/admin/AdminDashboard';
import {
  TermsOfService,
  PrivacyPolicy,
  CookiePolicy,
  RefundPolicy,
  DriverAgreement
} from './components/legal/TermsOfService';
import { SplashScreen, FloatingActionButton, EnhancedDashboard } from './components/premium/SplashScreen';
import { VoiceAssistant } from './components/advanced/VoiceAssistant';
import { RideSocial } from './components/social/RideSocial';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('signup');

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, show Landing Page or Auth Page
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
              // No need to manually navigate
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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
      case 'find-ride':
        return <FindRide />;
      case 'carpool': // Alias for find-ride
        return <FindRide />;
      case 'offer-ride':
        return <OfferRide />;
      case 'my-trips':
        return <MyTrips />;
      case 'recurring':
        return <RecurringTrips />;
      case 'messages':
        return <Messages />;
      case 'favorites':
        return <Favorites />;
      case 'payments':
        return <Payments />;
      case 'analytics':
        return <TripAnalytics />;
      case 'safety':
        return <SafetyCenter />;
      case 'verification':
        return <VerificationCenter />;
      case 'settings':
        return <Settings />;
      case 'notifications':
        return <NotificationCenter />;
      case 'profile':
        return <UserProfile />;
      case 'referrals':
        return <ReferralProgram />;
      case 'business':
        return <BusinessAccounts />;
      case 'package-delivery': // Delivery
        return <PackageDelivery />;
      case 'scooters': // Scooters
        return <ScooterRentals />;
      case 'freight': // Freight
        return <FreightShipping />;
      case 'pets': // Pets
        return <PetTransport />;
      case 'school': // School
        return <SchoolTransport />;
      case 'medical': // Medical
        return <MedicalTransport />;
      case 'car-rentals': // Car Rentals
        return <CarRentals />;
      case 'shuttle': // Shuttle Service
        return <ShuttleService />;
      case 'luxury': // Luxury Rides
        return <LuxuryRides />;
      case 'driver-earnings':
        return <DriverEarnings />;
      case 'dispute-center':
        return <DisputeCenter />;
      case 'payment-methods':
        return <PaymentMethods />;
      case 'scheduled-trips':
        return <ScheduledTrips />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'terms-of-service':
        return <TermsOfService />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'cookie-policy':
        return <CookiePolicy />;
      case 'refund-policy':
        return <RefundPolicy />;
      case 'driver-agreement':
        return <DriverAgreement />;
      case 'currency-selector':
        return <CurrencySelector />;
      case 'enhanced-rating':
        return <EnhancedRating />;
      case 'safety-report':
        return <SafetyReport />;
      case 'driver-badges':
        return <DriverBadges />;
      case 'cancellation-policy':
        return <CancellationPolicy />;
      case 'refund-status':
        return <RefundStatus />;
      case 'trip-insurance':
        return <TripInsurance />;
      case 'accident-report':
        return <AccidentReport />;
      case 'insurance-claim':
        return <InsuranceClaim />;
      case 'ride-social':
        return <RideSocial />;
      case 'driver-dashboard':
        return <DriverEconomySystem />;
      case 'live-trip':
        return (
          <LiveTrip
            tripId="demo-trip-id"
            driverId="demo-driver-id"
            driverInfo={{
              name: 'Ahmed Khan',
              photo: '',
              rating: 4.8,
              vehicleModel: 'Toyota Camry',
              vehiclePlate: 'ABC 1234',
              vehicleColor: 'Silver'
            }}
            pickupLocation={{
              address: '123 Main Street, Amman',
              coordinates: { lat: 31.9539, lng: 35.9106 }
            }}
            dropoffLocation={{
              address: '456 Queen Alia Street, Amman',
              coordinates: { lat: 31.9731, lng: 35.8433 }
            }}
          />
        );
      case 'trip-export':
        return <TripExport />;
      case 'cancel-trip':
        return (
          <CancelTrip
            tripId="demo-trip-id"
            tripStatus="waiting"
            fare={25.0}
            onCancel={() => {
              console.log('Trip cancelled');
              setCurrentPage('my-trips');
            }}
            onClose={() => setCurrentPage('my-trips')}
          />
        );
      case 'promo-codes':
        return <PromoCodesManager />;
      case 'popular-routes':
        return <PopularRoutes onGetStarted={() => setCurrentPage('find-ride')} />;
      case 'workflow-guide':
        return <WorkflowGuide steps={[]} />;
      case 'thinking-coach':
        return <ThinkingCoach />;
      default:
        return <EnhancedDashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <>
      <InstallPWA />
      <Toaster />

      {/* Voice Assistant */}
      <VoiceAssistant />

      {/* Floating Action Button */}
      <FloatingActionButton
        onBookRide={() => setCurrentPage('find-ride')}
        onBookDelivery={() => setCurrentPage('package-delivery')}
        onScheduleTrip={() => setCurrentPage('scheduled-trips')}
        onCorporateBooking={() => setCurrentPage('business')}
      />

      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setCurrentPage} />

          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <DemoBanner />
            {renderPage()}
          </main>
        </div>
      </div>
    </>
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
