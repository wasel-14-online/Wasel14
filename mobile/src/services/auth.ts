import { authAPI } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mobile-specific authentication service
export class MobileAuthService {
    private static instance: MobileAuthService;
    private currentUser: any = null;
    private session: any = null;
    private authStateListeners: ((user: any, session: any) => void)[] = [];

    private constructor() {
        this.initializeAuthState();
    }

    static getInstance(): MobileAuthService {
        if (!MobileAuthService.instance) {
            MobileAuthService.instance = new MobileAuthService();
        }
        return MobileAuthService.instance;
    }

    // Initialize auth state from storage
    private async initializeAuthState() {
        try {
            const storedSession = await AsyncStorage.getItem('supabase_session');
            if (storedSession) {
                this.session = JSON.parse(storedSession);
                this.currentUser = this.session?.user || null;
                this.notifyAuthStateChange();
            }
        } catch (error) {
            console.error('Failed to initialize auth state:', error);
        }
    }

    // Sign up with email and password
    async signUp(email: string, password: string, fullName: string) {
        try {
            const result = await authAPI.signUp(email, password, fullName);

            if (result.user && result.session) {
                this.currentUser = result.user;
                this.session = result.session;
                await this.persistSession();
                this.notifyAuthStateChange();
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Sign in with email and password
    async signIn(email: string, password: string) {
        try {
            const result = await authAPI.signIn(email, password);

            if (result.user && result.session) {
                this.currentUser = result.user;
                this.session = result.session;
                await this.persistSession();
                this.notifyAuthStateChange();
            }

            return result;
        } catch (error) {
            throw error;
        }
    }

    // Sign out
    async signOut() {
        try {
            await authAPI.signOut();
            this.currentUser = null;
            this.session = null;
            await this.clearSession();
            this.notifyAuthStateChange();
        } catch (error) {
            // Even if API call fails, clear local state
            this.currentUser = null;
            this.session = null;
            await this.clearSession();
            this.notifyAuthStateChange();
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get current session
    getCurrentSession() {
        return this.session;
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return !!(this.currentUser && this.session);
    }

    // Refresh session
    async refreshSession() {
        try {
            const result = await authAPI.getSession();
            if (result.session) {
                this.session = result.session;
                this.currentUser = result.session.user;
                await this.persistSession();
                this.notifyAuthStateChange();
                return result;
            } else {
                // Session expired
                await this.signOut();
                return null;
            }
        } catch (error) {
            console.error('Failed to refresh session:', error);
            await this.signOut();
            throw error;
        }
    }

    // Get user profile
    async getProfile() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            return await authAPI.getProfile();
        } catch (error) {
            // If profile fetch fails due to auth error, sign out
            if (error instanceof Error && (error.message?.includes('JWT') || (error as any).statusCode === 401)) {
                await this.signOut();
            }
            throw error;
        }
    }

    // Update user profile
    async updateProfile(updates: { full_name?: string; phone?: string; avatar_url?: string }) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const result = await authAPI.updateProfile(updates);

            // Update local user data
            if (result.profile) {
                this.currentUser.user_metadata = {
                    ...this.currentUser.user_metadata,
                    ...updates
                };
                await this.persistSession();
                this.notifyAuthStateChange();
            }

            return result;
        } catch (error) {
            // If update fails due to auth error, sign out
            if (error instanceof Error && (error.message?.includes('JWT') || (error as any).statusCode === 401)) {
                await this.signOut();
            }
            throw error;
        }
    }

    // Persist session to AsyncStorage
    private async persistSession() {
        try {
            if (this.session) {
                await AsyncStorage.setItem('supabase_session', JSON.stringify(this.session));
            }
        } catch (error) {
            console.error('Failed to persist session:', error);
        }
    }

    // Clear session from AsyncStorage
    private async clearSession() {
        try {
            await AsyncStorage.removeItem('supabase_session');
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }

    // Add auth state listener
    addAuthStateListener(callback: (user: any, session: any) => void) {
        this.authStateListeners.push(callback);
        // Immediately call with current state
        callback(this.currentUser, this.session);
    }

    // Remove auth state listener
    removeAuthStateListener(callback: (user: any, session: any) => void) {
        const index = this.authStateListeners.indexOf(callback);
        if (index > -1) {
            this.authStateListeners.splice(index, 1);
        }
    }

    // Notify all auth state listeners
    private notifyAuthStateChange() {
        this.authStateListeners.forEach(callback => {
            try {
                callback(this.currentUser, this.session);
            } catch (error) {
                console.error('Auth state listener error:', error);
            }
        });
    }

    // Auto-refresh session periodically
    startSessionRefresh(intervalMinutes: number = 30) {
        const intervalMs = intervalMinutes * 60 * 1000;

        return setInterval(async () => {
            if (this.isAuthenticated()) {
                try {
                    await this.refreshSession();
                } catch (error) {
                    console.error('Auto session refresh failed:', error);
                }
            }
        }, intervalMs);
    }

    // Clean up resources
    cleanup() {
        this.authStateListeners = [];
    }
}

// Export singleton instance
export const mobileAuth = MobileAuthService.getInstance();