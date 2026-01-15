import { PlatformUtils } from '../utils';
import { Alert } from 'react-native';
import { initStripe, useStripe, presentPaymentSheet } from '@stripe/stripe-react-native';
import { supabase } from '../lib/supabase';

/**
 * Payment service for handling Stripe payments
 */
export class PaymentService {
    private static instance: PaymentService;
    private isInitialized = false;

    private constructor() { }

    static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    /**
     * Initialize Stripe
     */
    async initialize() {
        if (this.isInitialized) return;

        const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            console.warn('Stripe publishable key not found');
            return;
        }

        try {
            await initStripe({
                publishableKey,
                merchantIdentifier: 'merchant.com.wasel.app',
                urlScheme: 'wasel',
            });
            this.isInitialized = true;
            console.log('Stripe initialized');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
        }
    }

    /**
     * Check if the platform's native payment method is available
     * (Apple Pay / Google Pay via Stripe)
     */
    async isNativePaymentAvailable(): Promise<boolean> {
        // Stripe handles both Apple Pay and Google Pay
        // You would typically check this using confirmPlatformPay support
        // For now, we return true as Stripe handles device capability checks internally during payment flow
        return true;
    }

    /**
     * Get the name of the native payment method for the current platform
     */
    getNativePaymentMethodName(): string {
        return PlatformUtils.getPaymentMethodName();
    }

    /**
     * Process payment using Stripe Payment Sheet
     */
    async processPayment(
        amount: number,
        currency: string = 'USD',
        description: string = 'Ride Payment'
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // 1. Fetch PaymentIntent client secret from your backend (Supabase Edge Function)
            // Note: Since we don't have the backend set up yet, we'll simulate this part
            // In production, NEVER create PaymentIntents on the client with the Secret Key

            // For DEMO purposes only (and to test UI), we will mock the backend response
            // OR use a very specific test token if available. 
            // However, with standard Stripe implementation, we MUST have a backend endpoint.

            // Let's implement the client-side flow assuming we get a clientSecret:

            // const { data, error } = await supabase.functions.invoke('create-payment-intent', {
            //     body: { amount: amount * 100, currency } // Amount in cents
            // });

            // if (error || !data?.clientSecret) {
            //     throw new Error('Failed to create payment intent');
            // }

            // Since we cannot actually charge without a backend sending the clientSecret,
            // We will alert the user that backend is needed for real charges.
            Alert.alert(
                'Payment Info',
                'To process real payments, a backend endpoint is required to generate the PaymentIntent client secret using the Secret Key. This demo mocks the success.'
            );

            // Mock success for UI flow
            return {
                success: true,
                transactionId: `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            /* 
            // Real implementation with clientSecret:
            const { error: paymentError } = await presentPaymentSheet({
                clientSecret: data.clientSecret,
            });

            if (paymentError) {
                return { success: false, error: paymentError.message };
            }

            return { success: true }; 
            */

        } catch (error) {
            console.error('Payment processing failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment failed'
            };
        }
    }

    /**
     * Format amount for display
     */
    formatAmount(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }
}

export const paymentService = PaymentService.getInstance();