import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Mobile-specific real-time subscriptions
export class MobileRealtimeService {
    private channels: Map<string, RealtimeChannel> = new Map();

    // Subscribe to trip updates (for drivers and passengers)
    subscribeToTripUpdates(tripId: string, callbacks: {
        onTripUpdate?: (trip: any) => void;
        onBookingUpdate?: (booking: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `trip_${tripId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'trips',
                    filter: `id=eq.${tripId}`
                },
                (payload) => {
                    console.log('Trip update:', payload);
                    callbacks.onTripUpdate?.(payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `trip_id=eq.${tripId}`
                },
                (payload) => {
                    console.log('Booking update:', payload);
                    callbacks.onBookingUpdate?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to trip ${tripId} updates`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to trip ${tripId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Subscribe to user messages
    subscribeToMessages(userId: string, callbacks: {
        onNewMessage?: (message: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `messages_${userId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `recipient_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New message:', payload);
                    callbacks.onNewMessage?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to messages for user ${userId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to messages for user ${userId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Subscribe to notifications
    subscribeToNotifications(userId: string, callbacks: {
        onNewNotification?: (notification: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `notifications_${userId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New notification:', payload);
                    callbacks.onNewNotification?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to notifications for user ${userId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to notifications for user ${userId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Subscribe to wallet updates
    subscribeToWalletUpdates(userId: string, callbacks: {
        onWalletUpdate?: (wallet: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `wallet_${userId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'wallets',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('Wallet update:', payload);
                    callbacks.onWalletUpdate?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to wallet updates for user ${userId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to wallet updates for user ${userId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Subscribe to location updates (for live trip tracking)
    subscribeToLocationUpdates(tripId: string, callbacks: {
        onLocationUpdate?: (location: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `location_${tripId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'broadcast',
                { event: 'location_update' },
                (payload) => {
                    console.log('Location update:', payload);
                    callbacks.onLocationUpdate?.(payload.payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to location updates for trip ${tripId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to location updates for trip ${tripId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Send location update
    async sendLocationUpdate(tripId: string, location: { latitude: number; longitude: number; timestamp?: string }) {
        const channelName = `location_${tripId}`;
        const channel = this.channels.get(channelName);

        if (channel) {
            await channel.send({
                type: 'broadcast',
                event: 'location_update',
                payload: {
                    tripId,
                    ...location,
                    timestamp: location.timestamp || new Date().toISOString()
                }
            });
        }
    }

    // Unsubscribe from a specific channel
    unsubscribe(channelName: string) {
        const channel = this.channels.get(channelName);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(channelName);
        }
    }

    // Unsubscribe from all channels
    unsubscribeAll() {
        for (const [channelName, channel] of this.channels) {
            supabase.removeChannel(channel);
        }
        this.channels.clear();
    }

    // Get connection status
    getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
        // This is a simplified status check
        // In a real app, you'd track the actual connection state
        return 'connected';
    }
}

// Singleton instance
export const mobileRealtime = new MobileRealtimeService();