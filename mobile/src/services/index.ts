// Mobile API Services
export {
    authAPI,
    tripsAPI,
    bookingsAPI,
    messagesAPI,
    walletAPI,
    notificationsAPI,
    referralAPI,
    MobileAPIError
} from './api';

export { notificationService } from './notifications-service';

// Mobile Authentication Service
export { mobileAuth, MobileAuthService } from './auth';

// Biometric Authentication Service
export { biometricAuth, BiometricAuthService } from './biometric';

// Payment Service
export { paymentService, PaymentService } from './payment';

// Mobile Real-time Services
export { mobileRealtime, MobileRealtimeService } from './realtime';

// Re-export supabase for direct access when needed
export { supabase, isSupabaseConfigured } from '../lib/supabase';
