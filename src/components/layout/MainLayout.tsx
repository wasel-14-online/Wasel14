import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { MobileNav } from '../MobileNav';
import { DemoBanner } from '../DemoBanner';
import { FloatingActionButton } from '../premium/FloatingActionButton';
import { VoiceAssistant } from '../advanced/VoiceAssistant';

export function MainLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Helper to get current page ID from path
    const getCurrentPage = () => {
        const path = location.pathname.substring(1); // remove leading slash
        return path || 'dashboard';
    };

    const currentPage = getCurrentPage();

    const handleNavigate = (page: string) => {
        if (page === 'dashboard') navigate('/');
        else navigate(`/${page}`);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Voice Assistant */}
            <VoiceAssistant />

            {/* Floating Action Button - Hide on mobile if MobileNav is showing to avoid clutter */}
            <div className="hidden md:block">
                <FloatingActionButton
                    onBookRide={() => navigate('/find-ride')}
                    onBookDelivery={() => navigate('/package-delivery')}
                    onScheduleTrip={() => navigate('/scheduled-trips')}
                    onCorporateBooking={() => navigate('/business')}
                />
            </div>

            {/* Mobile Navigation */}
            <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />

            {/* Sidebar */}
            <Sidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    onNavigate={handleNavigate}
                />

                <main id="main-content" className="flex-1 overflow-y-auto p-3 sm:p-6" role="main">
                    <DemoBanner />
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
