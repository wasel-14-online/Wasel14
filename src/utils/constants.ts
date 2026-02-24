export const APP_CONFIG = {
  name: 'Wassel',
  version: '1.0.0',
  supportEmail: 'support@wassel.com',
  supportPhone: '+971 4 XXX XXXX'
};

export const TRIP_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const USER_ROLES = {
  PASSENGER: 'passenger',
  DRIVER: 'driver',
  ADMIN: 'admin'
} as const;

export const CURRENCIES = {
  AED: { symbol: 'د.إ', name: 'UAE Dirham' },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal' },
  EGP: { symbol: 'ج.م', name: 'Egyptian Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' }
} as const;

export const PRICING = {
  PLATFORM_FEE_PERCENTAGE: 20,
  DRIVER_EARNINGS_PERCENTAGE: 80,
  CANCELLATION_FEES: {
    BEFORE_ASSIGNMENT: 0,
    AFTER_ASSIGNMENT: 0.1,
    DRIVER_EN_ROUTE: 0.5,
    TRIP_STARTED: 1
  }
};

export const LIMITS = {
  MAX_TRIP_DISTANCE_KM: 500,
  MAX_SCHEDULED_DAYS: 30,
  MAX_RECURRING_TRIPS: 10,
  MAX_UPLOAD_SIZE_MB: 10,
  DRIVER_SEARCH_RADIUS_KM: 10
};

export const TIMEOUTS = {
  DRIVER_RESPONSE_SECONDS: 30,
  TRIP_MATCHING_SECONDS: 300,
  PAYMENT_TIMEOUT_SECONDS: 60
};

export const NOTIFICATION_TYPES = {
  TRIP_UPDATE: 'trip_update',
  PAYMENT: 'payment',
  PROMO: 'promo',
  SYSTEM: 'system',
  SAFETY: 'safety'
} as const;
