import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For React Native, we'll use hardcoded values for now
// In production, these should come from environment variables or a config file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid configuration
const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-anon-key');

// Create Supabase client for mobile
export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false, // Not applicable for mobile
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    }
);

export const isSupabaseConfigured = isConfigured;

// Database types (same as web app)
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    phone: string | null;
                    full_name: string;
                    full_name_ar: string | null;
                    avatar_url: string | null;
                    bio: string | null;
                    bio_ar: string | null;
                    date_of_birth: string | null;
                    gender: string | null;
                    city: string | null;
                    country: string;
                    phone_verified: boolean;
                    email_verified: boolean;
                    is_verified: boolean;
                    verification_level: number;
                    total_trips: number;
                    trips_as_driver: number;
                    trips_as_passenger: number;
                    rating_as_driver: number;
                    rating_as_passenger: number;
                    total_ratings_received: number;
                    smoking_allowed: boolean;
                    pets_allowed: boolean;
                    music_allowed: boolean;
                    conversation_level: string | null;
                    preferred_temperature: string | null;
                    language: string;
                    currency: string;
                    notification_enabled: boolean;
                    location_sharing_enabled: boolean;
                    wallet_balance: number;
                    total_earned: number;
                    total_spent: number;
                    created_at: string;
                    updated_at: string;
                    last_active_at: string;
                    deleted_at: string | null;
                };
                Insert: {
                    id: string;
                    email: string;
                    phone?: string | null;
                    full_name: string;
                    full_name_ar?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    bio_ar?: string | null;
                    date_of_birth?: string | null;
                    gender?: string | null;
                    city?: string | null;
                    country?: string;
                    phone_verified?: boolean;
                    email_verified?: boolean;
                    is_verified?: boolean;
                    verification_level?: number;
                    total_trips?: number;
                    trips_as_driver?: number;
                    trips_as_passenger?: number;
                    rating_as_driver?: number;
                    rating_as_passenger?: number;
                    total_ratings_received?: number;
                    smoking_allowed?: boolean;
                    pets_allowed?: boolean;
                    music_allowed?: boolean;
                    conversation_level?: string | null;
                    preferred_temperature?: string | null;
                    language?: string;
                    currency?: string;
                    notification_enabled?: boolean;
                    location_sharing_enabled?: boolean;
                    wallet_balance?: number;
                    total_earned?: number;
                    total_spent?: number;
                    created_at?: string;
                    updated_at?: string;
                    last_active_at?: string;
                    deleted_at?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    phone?: string | null;
                    full_name?: string;
                    full_name_ar?: string | null;
                    avatar_url?: string | null;
                    bio?: string | null;
                    bio_ar?: string | null;
                    date_of_birth?: string | null;
                    gender?: string | null;
                    city?: string | null;
                    country?: string;
                    phone_verified?: boolean;
                    email_verified?: boolean;
                    is_verified?: boolean;
                    verification_level?: number;
                    total_trips?: number;
                    trips_as_driver?: number;
                    trips_as_passenger?: number;
                    rating_as_driver?: number;
                    rating_as_passenger?: number;
                    total_ratings_received?: number;
                    smoking_allowed?: boolean;
                    pets_allowed?: boolean;
                    music_allowed?: boolean;
                    conversation_level?: string | null;
                    preferred_temperature?: string | null;
                    language?: string;
                    currency?: string;
                    notification_enabled?: boolean;
                    location_sharing_enabled?: boolean;
                    wallet_balance?: number;
                    total_earned?: number;
                    total_spent?: number;
                    created_at?: string;
                    updated_at?: string;
                    last_active_at?: string;
                    deleted_at?: string | null;
                };
            };
            // Add other table types as needed...
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            trip_type: 'wasel' | 'raje3';
            trip_status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
            booking_status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
            payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
            payment_method: 'cash' | 'card' | 'wallet' | 'bank_transfer';
            verification_type: 'phone' | 'email' | 'national_id' | 'drivers_license' | 'selfie';
            verification_status: 'not_started' | 'pending' | 'approved' | 'rejected';
            notification_type: 'trip_request' | 'trip_accepted' | 'trip_rejected' | 'trip_cancelled' | 'driver_arrived' | 'trip_started' | 'trip_completed' | 'payment_received' | 'payment_sent' | 'message' | 'rating_reminder' | 'verification_approved' | 'verification_rejected' | 'safety_alert';
            user_role: 'passenger' | 'driver' | 'admin';
            message_type: 'text' | 'image' | 'location' | 'system';
        };
    };
};