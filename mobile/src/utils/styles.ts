import { Platform } from 'react-native';
import { PlatformUtils } from './platform';

/**
 * Platform-specific styling utilities
 */
export const PlatformStyles = {
    /**
     * Get platform-specific shadow styles
     */
    shadow: (elevation: number = 4) => {
        if (Platform.OS === 'ios') {
            return {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: elevation / 2 },
                shadowOpacity: 0.2,
                shadowRadius: elevation,
            };
        } else {
            return {
                elevation: elevation,
            };
        }
    },

    /**
     * Get platform-specific border radius
     */
    borderRadius: (radius: number = 8) => {
        // iOS typically uses slightly larger border radius
        return PlatformUtils.select({
            ios: radius + 2,
            android: radius,
        });
    },

    /**
     * Get platform-specific font family
     */
    fontFamily: {
        regular: PlatformUtils.select({
            ios: 'System',
            android: 'Roboto',
        }),
        medium: PlatformUtils.select({
            ios: 'System',
            android: 'Roboto-Medium',
        }),
        bold: PlatformUtils.select({
            ios: 'System',
            android: 'Roboto-Bold',
        }),
    },

    /**
     * Get platform-specific button styles
     */
    button: {
        paddingVertical: PlatformUtils.select({
            ios: 12,
            android: 10,
        }),
        paddingHorizontal: 16,
        borderRadius: PlatformStyles.borderRadius(),
        ...PlatformStyles.shadow(2),
    },

    /**
     * Get platform-specific input styles
     */
    input: {
        paddingVertical: PlatformUtils.select({
            ios: 12,
            android: 10,
        }),
        paddingHorizontal: 16,
        borderRadius: PlatformStyles.borderRadius(),
        fontSize: PlatformUtils.select({
            ios: 16,
            android: 14,
        }),
    },

    /**
     * Get platform-specific spacing
     */
    spacing: {
        small: 8,
        medium: 16,
        large: 24,
        xlarge: 32,
    },

    /**
     * Get platform-specific safe area adjustments
     */
    safeArea: {
        top: PlatformUtils.select({
            ios: 44, // iPhone status bar + home indicator
            android: 24, // Android status bar
        }),
        bottom: PlatformUtils.select({
            ios: 34, // iPhone home indicator
            android: 0,
        }),
    },

    /**
     * Get platform-specific colors
     */
    colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#1f2937',
        textSecondary: '#6b7280',
    },

    /**
     * Get platform-specific animation durations
     */
    animation: {
        fast: 200,
        normal: 300,
        slow: 500,
    },
};