import { logger } from '../services/loggerService';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = {
  handle(error: any): { message: string; code: string } {
    logger.error('Error occurred', error);

    if (error instanceof AppError) {
      return {
        message: error.message,
        code: error.code
      };
    }

    // Supabase errors
    if (error?.message) {
      return {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      };
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR'
      };
    }

    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR'
    };
  },

  async handleAsync<T>(promise: Promise<T>): Promise<[T | null, any]> {
    try {
      const data = await promise;
      return [data, null];
    } catch (error) {
      return [null, this.handle(error)];
    }
  }
};

export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_USER_NOT_FOUND: 'User not found',
  AUTH_EMAIL_EXISTS: 'Email already registered',
  AUTH_WEAK_PASSWORD: 'Password is too weak',

  // Trip errors
  TRIP_NOT_FOUND: 'Trip not found',
  TRIP_ALREADY_CANCELLED: 'Trip already cancelled',
  TRIP_CANNOT_CANCEL: 'Cannot cancel trip at this stage',

  // Payment errors
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_INSUFFICIENT_FUNDS: 'Insufficient funds',
  PAYMENT_CARD_DECLINED: 'Card declined',

  // Driver errors
  DRIVER_NOT_AVAILABLE: 'No drivers available',
  DRIVER_NOT_VERIFIED: 'Driver not verified',

  // General errors
  NETWORK_ERROR: 'Network connection error',
  VALIDATION_ERROR: 'Validation error',
  UNKNOWN_ERROR: 'An unexpected error occurred'
};
