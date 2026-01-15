import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { mobileAuth } from '../services/auth';
import { router } from 'expo-router';

interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    initialized: boolean;

    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, fullName: string) => Promise<void>;
    signOut: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    loading: false,
    initialized: false,

    initialize: async () => {
        try {
            // Connect to the auth service listener to keep store in sync
            mobileAuth.addAuthStateListener((user, session) => {
                set({ user, session, initialized: true });

                // Handle navigation based on auth state
                // We use setImmediate to ensure navigation happens after state update and render cycle
                if (!session) {
                    // router.replace('/auth/login'); // Moved to layout to avoid loops
                }
            });

            // Initial check is handled by the listener getting called immediately in addAuthStateListener
            // but we can also explicity refresh to be sure
            await mobileAuth.refreshSession();

        } catch (error) {
            console.error('Auth store initialization error:', error);
            set({ initialized: true });
        }
    },

    signIn: async (email, password) => {
        set({ loading: true });
        try {
            await mobileAuth.signIn(email, password);
            // Navigation is handled by the layout listening to state changes
        } catch (error) {
            console.error('Sign in error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    signUp: async (email, password, fullName) => {
        set({ loading: true });
        try {
            await mobileAuth.signUp(email, password, fullName);
            // Navigation is handled by the layout listening to state changes
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        set({ loading: true });
        try {
            await mobileAuth.signOut();
            router.replace('/auth/login');
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            set({ loading: false, user: null, session: null });
        }
    },
}));
