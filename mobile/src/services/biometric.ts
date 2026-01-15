import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlatformUtils } from '../utils';

/**
 * Biometric authentication service for secure login
 */
export class BiometricAuthService {
    private static instance: BiometricAuthService;
    private static readonly BIOMETRIC_ENABLED_KEY = 'biometric_enabled';
    private static readonly STORED_CREDENTIALS_KEY = 'biometric_credentials';

    private constructor() { }

    static getInstance(): BiometricAuthService {
        if (!BiometricAuthService.instance) {
            BiometricAuthService.instance = new BiometricAuthService();
        }
        return BiometricAuthService.instance;
    }

    /**
     * Check if biometric authentication is available on this device
     */
    async isBiometricAvailable(): Promise<boolean> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            return hasHardware && isEnrolled;
        } catch (error) {
            console.warn('Biometric availability check failed:', error);
            return false;
        }
    }

    /**
     * Get available biometric authentication types
     */
    async getBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
        try {
            return await LocalAuthentication.supportedAuthenticationTypesAsync();
        } catch (error) {
            console.warn('Failed to get biometric types:', error);
            return [];
        }
    }

    /**
     * Check if biometric authentication is enabled for this user
     */
    async isBiometricEnabled(): Promise<boolean> {
        try {
            const enabled = await AsyncStorage.getItem(BiometricAuthService.BIOMETRIC_ENABLED_KEY);
            return enabled === 'true';
        } catch (error) {
            console.warn('Failed to check biometric enabled status:', error);
            return false;
        }
    }

    /**
     * Enable biometric authentication for the current user
     */
    async enableBiometric(email: string, password: string): Promise<void> {
        try {
            // Verify the credentials first
            // Note: In a real app, you'd want to authenticate with your backend here

            // Store the credentials securely (in production, use proper encryption)
            const credentials = { email, password };
            await AsyncStorage.setItem(
                BiometricAuthService.STORED_CREDENTIALS_KEY,
                JSON.stringify(credentials)
            );

            // Mark biometric as enabled
            await AsyncStorage.setItem(BiometricAuthService.BIOMETRIC_ENABLED_KEY, 'true');
        } catch (error) {
            console.error('Failed to enable biometric authentication:', error);
            throw new Error('Failed to enable biometric authentication');
        }
    }

    /**
     * Disable biometric authentication
     */
    async disableBiometric(): Promise<void> {
        try {
            await AsyncStorage.removeItem(BiometricAuthService.BIOMETRIC_ENABLED_KEY);
            await AsyncStorage.removeItem(BiometricAuthService.STORED_CREDENTIALS_KEY);
        } catch (error) {
            console.error('Failed to disable biometric authentication:', error);
            throw new Error('Failed to disable biometric authentication');
        }
    }

    /**
     * Authenticate using biometrics and return stored credentials
     */
    async authenticateWithBiometric(): Promise<{ email: string; password: string } | null> {
        try {
            // Check if biometric is enabled
            const isEnabled = await this.isBiometricEnabled();
            if (!isEnabled) {
                throw new Error('Biometric authentication is not enabled');
            }

            // Check if biometric is available
            const isAvailable = await this.isBiometricAvailable();
            if (!isAvailable) {
                throw new Error('Biometric authentication is not available on this device');
            }

            // Perform biometric authentication
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Authenticate with ${PlatformUtils.getBiometricMethodName()}`,
                fallbackLabel: 'Use password instead',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                // Retrieve stored credentials
                const storedCredentials = await AsyncStorage.getItem(BiometricAuthService.STORED_CREDENTIALS_KEY);
                if (storedCredentials) {
                    return JSON.parse(storedCredentials);
                } else {
                    throw new Error('No stored credentials found');
                }
            } else {
                if (result.error === 'user_cancel') {
                    throw new Error('Authentication cancelled');
                } else if (result.error === 'not_enrolled') {
                    throw new Error('Biometric authentication not enrolled');
                } else {
                    throw new Error('Biometric authentication failed');
                }
            }
        } catch (error) {
            console.error('Biometric authentication failed:', error);
            throw error;
        }
    }

    /**
     * Get biometric authentication prompt message
     */
    getBiometricPromptMessage(): string {
        return `Use ${PlatformUtils.getBiometricMethodName()} to sign in`;
    }

    /**
     * Get biometric setup prompt message
     */
    getBiometricSetupMessage(): string {
        return `Enable ${PlatformUtils.getBiometricMethodName()} for faster sign-in`;
    }
}

// Export singleton instance
export const biometricAuth = BiometricAuthService.getInstance();