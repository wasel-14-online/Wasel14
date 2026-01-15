import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { MobileAPIError } from './api';

// Configure notification handling
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export class NotificationService {
    private static instance: NotificationService;

    private constructor() { }

    static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    /**
     * Register for push notifications
     */
    async registerForPushNotificationsAsync(userId: string) {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        try {
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Push token:', token);
            await this.savePushToken(userId, token);
        } catch (error) {
            console.error('Error getting push token:', error);
        }

        return token;
    }

    /**
     * Save push token to user profile
     */
    private async savePushToken(userId: string, token: string) {
        try {
            // First check if token exists to avoid duplicate entries/calls if not needed
            // This assumes a 'push_tokens' table or a column in 'profiles'.
            // For this MVP, we will assume a column `push_token` in the `profiles` table
            // OR a separate table `user_push_tokens`.

            // Let's try updating the profile directly first as it's simpler
            const { error } = await supabase
                .from('profiles')
                .update({ push_token: token } as any) // Type assertion as column might not exist in types yet
                .eq('id', userId);

            if (error) {
                console.error('Error saving push token to Supabase:', error);
                // If column doesn't exist, we might want to log it or handle it
                // For now, we just log.
            }
        } catch (error) {
            console.error('Error saving push token:', error);
        }
    }

    /**
     * Send a local notification (for testing/demo)
     */
    async sendLocalNotification(title: string, body: string, data = {}) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
            },
            trigger: null, // Send immediately
        });
    }
}

export const notificationService = NotificationService.getInstance();
