import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Components (keep most imports static for clarity)
const EnhancedDashboard = lazy(() => import('./components/premium/EnhancedDashboard'));
import { FindRide } from './components/FindRide';
import { OfferRide } from './components/OfferRide';
import { MyTrips } from './components/MyTrips';
import { RecurringTrips } from './components/RecurringTrips';
import { Messages } from './components/Messages';
import { Favorites } from './components/Favorites';
import { Payments } from './components/Payments';
import { TripAnalytics } from './components/TripAnalytics';
import { SafetyCenter } from './components/SafetyCenter';
import { VerificationCenter } from './components/VerificationCenter';
import { Settings } from './components/Settings';
import { NotificationCenter } from './components/NotificationCenter';
import { UserProfile } from './components/UserProfile';
import { ReferralProgram } from './components/ReferralProgram';
import { BusinessAccounts } from './components/BusinessAccounts';
import { PackageDelivery } from './components/PackageDelivery';
import { ScooterRentals } from './components/ScooterRentals';
import { FreightShipping } from './components/FreightShipping';
import { PetTransport } from './components/PetTransport';
import { SchoolTransport } from './components/SchoolTransport';
import { MedicalTransport } from './components/MedicalTransport';
import { CarRentals } from './components/CarRentals';
import { ShuttleService } from './components/ShuttleService';
import { LuxuryRides } from './components/LuxuryRides';
import { DriverEarnings } from './components/DriverEarnings';
import { DisputeCenter } from './components/DisputeCenter';
import { PaymentMethods } from './components/PaymentMethods';
import { ScheduledTrips } from './components/ScheduledTrips';
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
import { TermsOfService } from './components/legal/TermsOfService';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { CookiePolicy } from './components/legal/CookiePolicy';
import { RefundPolicy } from './components/legal/RefundPolicy';
import { DriverAgreement } from './components/legal/DriverAgreement';
import { CurrencySelector } from './components/CurrencySelector';
import { EnhancedRating } from './components/EnhancedRating';
import { SafetyReport } from './components/SafetyReport';
import { DriverBadges } from './components/DriverBadges';
import { CancellationPolicy } from './components/CancellationPolicy';
import { RefundStatus } from './components/RefundStatus';
import { TripInsurance } from './components/TripInsurance';
import { AccidentReport } from './components/AccidentReport';
import { InsuranceClaim } from './components/InsuranceClaim';
import { RideSocial } from './components/social/RideSocial';
import { DriverEconomySystem } from './components/driver/DriverEconomySystem';
const LiveTrip = lazy(() => import('./components/LiveTrip'));
import { TripExport } from './components/TripExport';
import { CancelTrip } from './components/CancelTrip';
import { PromoCodesManager } from './components/PromoCodesManager';
import { PopularRoutes } from './components/PopularRoutes';
import { WorkflowGuide } from './components/WorkflowGuide';
import { ThinkingCoach } from './components/ThinkingCoach';

// Wrapper to provide legacy onNavigate prop.
// If `props` is provided, returns a ready-to-render element.
// If `props` is omitted, returns a component to be used as `<Component />`.
const withNavigation = <P extends object>(
    Component: React.ComponentType<P & { onNavigate?: (page: string) => void }>,
    props?: P
) => {
    const Wrapper: React.FC<P> = (injectedProps) => {
        const navigate = useNavigate();
        const handleNavigate = (page: string) => {
            if (page === 'dashboard') navigate('/');
            else navigate(`/${page}`);
        };

        return <Component {...(props as P)} {...(injectedProps as P)} onNavigate={handleNavigate} />;
    };

    return props ? <Wrapper /> : (Wrapper as unknown as React.ComponentType<any>);
};

export function AppRouter() {
    // Wrap components that need onNavigate
    const Dashboard = withNavigation(EnhancedDashboard) as React.ComponentType;
    const PopularRoutesWrapped = withNavigation(PopularRoutes) as React.ComponentType;

    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                {/* Core Features */}
                <Route path="/find-ride" element={<FindRide />} />
                <Route path="/carpool" element={<Navigate to="/find-ride" replace />} />
                <Route path="/offer-ride" element={<OfferRide />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/recurring" element={<RecurringTrips />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:id" element={<Messages />} />
                <Route path="/trips/:id" element={<Navigate to="/my-trips" replace />} /> {/* Todo: Direct trip details */}

                {/* Account & Settings */}
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
                <Route path="/analytics" element={<TripAnalytics />} />
                <Route path="/safety" element={<SafetyCenter />} />
                <Route path="/verification" element={<VerificationCenter />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/referrals" element={<ReferralProgram />} />
                <Route path="/business" element={<BusinessAccounts />} />

                {/* Services */}
                <Route path="/package-delivery" element={<PackageDelivery />} />
                <Route path="/scooters" element={<ScooterRentals />} />
                <Route path="/freight" element={<FreightShipping />} />
                <Route path="/pets" element={<PetTransport />} />
                <Route path="/school" element={<SchoolTransport />} />
                <Route path="/medical" element={<MedicalTransport />} />
                <Route path="/car-rentals" element={<CarRentals />} />
                <Route path="/shuttle" element={<ShuttleService />} />
                <Route path="/luxury" element={<LuxuryRides />} />

                {/* Driver */}
                <Route path="/driver-earnings" element={<DriverEarnings />} />
                <Route path="/dispute-center" element={<DisputeCenter />} />
                <Route path="/scheduled-trips" element={<ScheduledTrips />} />
                <Route path="/driver-dashboard" element={<DriverEconomySystem />} />
                <Route path="/driver-badges" element={<DriverBadges />} />
                <Route path="/start-trip" element={<Navigate to="/live-trip" />} />
                <Route
                    path="/live-trip"
                    element={
                        <Suspense fallback={<div>Loading trip…</div>}>
                            <LiveTrip
                                tripId="demo-trip-id"
                                driverId="demo-driver-id"
                                driverInfo={{
                                    name: 'Ahmed Khan',
                                    photo: '',
                                    rating: 4.8,
                                    vehicleModel: 'Toyota Camry',
                                    vehiclePlate: 'ABC 1234',
                                    vehicleColor: 'Silver',
                                }}
                                pickupLocation={{
                                    address: '123 Main Street, Amman',
                                    coordinates: { lat: 31.9539, lng: 35.9106 },
                                }}
                                dropoffLocation={{
                                    address: '456 Queen Alia Street, Amman',
                                    coordinates: { lat: 31.9731, lng: 35.8433 },
                                }}
                            />
                        </Suspense>
                    }
                />

                {/* Admin */}
                <Route path="/admin-dashboard" element={<Suspense fallback={<div>Loading admin…</div>}><AdminDashboard /></Suspense>} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/driver-agreement" element={<DriverAgreement />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />

                {/* Misc */}
                <Route path="/currency-selector" element={<CurrencySelector />} />
                <Route path="/enhanced-rating" element={<EnhancedRating />} />
                <Route path="/safety-report" element={<SafetyReport />} />
                <Route path="/refund-status" element={<RefundStatus />} />
                <Route path="/trip-insurance" element={<TripInsurance />} />
                <Route path="/accident-report" element={<AccidentReport />} />
                <Route path="/insurance-claim" element={<InsuranceClaim />} />
                <Route path="/ride-social" element={<RideSocial />} />
                <Route path="/trip-export" element={<TripExport />} />
                <Route
                    path="/cancel-trip"
                    element={withNavigation(CancelTrip, {
                        tripId: 'demo-trip-id',
                        tripStatus: 'waiting',
                        fare: 25.0,
                        onCancel: () => console.log('Cancelled'),
                        onClose: () => {},
                    })}
                />
                <Route path="/promo-codes" element={<PromoCodesManager />} />
                <Route path="/popular-routes" element={<PopularRoutesWrapped />} />
                <Route path="/workflow-guide" element={<WorkflowGuide steps={[]} />} />
                <Route path="/thinking-coach" element={<ThinkingCoach />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}

                {/* Core Features */}
                <Route path="/find-ride" element={<FindRide />} />
                <Route path="/carpool" element={<Navigate to="/find-ride" replace />} />
                <Route path="/offer-ride" element={<OfferRide />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/recurring" element={<RecurringTrips />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:id" element={<Messages />} />
                <Route path="/trips/:id" element={<Navigate to="/my-trips" replace />} /> {/* Todo: Direct trip details */}

                {/* Account & Settings */}
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/payment-methods" element={<PaymentMethods />} />
                <Route path="/analytics" element={<TripAnalytics />} />
                <Route path="/safety" element={<SafetyCenter />} />
                <Route path="/verification" element={<VerificationCenter />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<NotificationCenter />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/profile/:id" element={<UserProfile />} />
                <Route path="/referrals" element={<ReferralProgram />} />
                <Route path="/business" element={<BusinessAccounts />} />

                {/* Services */}
                <Route path="/package-delivery" element={<PackageDelivery />} />
                <Route path="/scooters" element={<ScooterRentals />} />
                <Route path="/freight" element={<FreightShipping />} />
                <Route path="/pets" element={<PetTransport />} />
                <Route path="/school" element={<SchoolTransport />} />
                <Route path="/medical" element={<MedicalTransport />} />
                <Route path="/car-rentals" element={<CarRentals />} />
                <Route path="/shuttle" element={<ShuttleService />} />
                <Route path="/luxury" element={<LuxuryRides />} />

                {/* Driver */}
                <Route path="/driver-earnings" element={<DriverEarnings />} />
                <Route path="/dispute-center" element={<DisputeCenter />} />
                <Route path="/scheduled-trips" element={<ScheduledTrips />} />
                <Route path="/driver-dashboard" element={<DriverEconomySystem />} />
                <Route path="/driver-badges" element={<DriverBadges />} />
                <Route path="/start-trip" element={<Navigate to="/live-trip" />} />
                <Route path="/live-trip" element={
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
                } />

                {/* Admin */}
                <Route path="/admin-dashboard" element={<AdminDashboard />} />

                {/* Legal */}
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/driver-agreement" element={<DriverAgreement />} />
                <Route path="/cancellation-policy" element={<CancellationPolicy />} />

                {/* Misc */}
                <Route path="/currency-selector" element={<CurrencySelector />} />
                <Route path="/enhanced-rating" element={<EnhancedRating />} />
                <Route path="/safety-report" element={<SafetyReport />} />
                <Route path="/refund-status" element={<RefundStatus />} />
                <Route path="/trip-insurance" element={<TripInsurance />} />
                <Route path="/accident-report" element={<AccidentReport />} />
                <Route path="/insurance-claim" element={<InsuranceClaim />} />
                <Route path="/ride-social" element={<RideSocial />} />
                <Route path="/trip-export" element={<TripExport />} />
                <Route path="/cancel-trip" element={
                    // This one needs navigation prop passed specially or refactored
                    withNavigation(CancelTrip, {
                        tripId: "demo-trip-id",
                        tripStatus: "waiting",
                        fare: 25.00,
                        onCancel: () => console.log('Cancelled'),
                        onClose: () => { } // handled by wrapper navigate
                    })()
                } />
                <Route path="/promo-codes" element={<PromoCodesManager />} />
                <Route path="/popular-routes" element={<PopularRoutesWrapped />} />
                <Route path="/workflow-guide" element={<WorkflowGuide steps={[]} />} />
                <Route path="/thinking-coach" element={<ThinkingCoach />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
}
