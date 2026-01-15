import { Platform } from 'react-native';

/**
 * Platform detection utilities for iOS and Android specific features
 */
export const PlatformUtils = {
    /**
     * Check if running on iOS
     */
    isIOS(): boolean {
        return Platform.OS === 'ios';
    },

    /**
     * Check if running on Android
     */
    isAndroid(): boolean {
        return Platform.OS === 'android';
    },

    /**
     * Get platform-specific value
     */
    select<T>(options: { ios: T; android: T }): T {
        return this.isIOS() ? options.ios : options.android;
    },

    /**
     * Get platform name
     */
    getPlatformName(): 'ios' | 'android' {
        return Platform.OS as 'ios' | 'android';
    },

    /**
     * Check if biometric authentication is supported
     */
    async isBiometricSupported(): Promise<boolean> {
        try {
            const LocalAuthentication = await import('expo-local-authentication');
            const supported = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            return supported && enrolled;
        } catch (error) {
            console.warn('Biometric authentication not available:', error);
            return false;
        }
    },

    /**
     * Get available biometric types
     */
    async getBiometricTypes(): Promise<string[]> {
        try {
            const LocalAuthentication = await import('expo-local-authentication');
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            return types.map(type => {
                switch (type) {
                    case LocalAuthentication.AuthenticationType.FINGERPRINT:
                        return 'fingerprint';
                    case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
                        return 'face';
                    case LocalAuthentication.AuthenticationType.IRIS:
                        return 'iris';
                    default:
                        return 'unknown';
                }
            });
        } catch (error) {
            console.warn('Failed to get biometric types:', error);
            return [];
        }
    },

    /**
     * Check if Apple Pay is available (iOS only)
     */
    async isApplePayAvailable(): Promise<boolean> {
        if (!this.isIOS()) return false;

        try {
            const ApplePay = await import('expo-apple-pay');
            // Check if Apple Pay is available on the device
            return true; // For now, assume it's available if the module loads
        } catch (error) {
            console.warn('Apple Pay not available:', error);
            return false;
        }
    },

    /**
     * Get platform-specific payment method name
     */
    getPaymentMethodName(): string {
        return this.select({
            ios: 'Apple Pay',
            android: 'Google Pay'
        });
    },

    /**
     * Get platform-specific biometric method name
     */
    getBiometricMethodName(): string {
        return this.select({
            ios: 'Face ID / Touch ID',
            android: 'Fingerprint / Face Unlock'
        });
    }
};