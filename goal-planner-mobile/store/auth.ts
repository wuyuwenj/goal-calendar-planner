import { create } from 'zustand';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { apiClient } from '../lib/api';
import type { User } from '../types';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as Localization from 'expo-localization';
import { useGoalStore } from './goal';

WebBrowser.maybeCompleteAuthSession();

// Conditionally import Superwall for identify
let Superwall: any = null;
try {
  Superwall = require('expo-superwall').default;
} catch {
  // Superwall not available (Expo Go)
}

// Helper to identify user with Superwall
const identifyWithSuperwall = (userId: string) => {
  if (Superwall) {
    try {
      Superwall.identify(userId);
      console.log('Superwall: Identified user', userId);
    } catch (err) {
      console.warn('Superwall identify failed:', err);
    }
  }
};

// Helper to reset Superwall identity on logout
const resetSuperwallIdentity = () => {
  if (Superwall) {
    try {
      Superwall.reset();
      console.log('Superwall: Reset identity');
    } catch (err) {
      console.warn('Superwall reset failed:', err);
    }
  }
};

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithCalendarAccess: () => Promise<boolean>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchProfile: () => Promise<void>;
  syncTimezone: () => Promise<void>;
  updateTimezone: (timezone: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  clearError: () => set({ error: null }),

  initialize: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        set({ session, isAuthenticated: true });
        // Identify user with Superwall for webhook tracking
        identifyWithSuperwall(session.user.id);
        await get().fetchProfile();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      if (event === 'SIGNED_OUT') {
        // Reset Superwall identity on logout
        resetSuperwallIdentity();
        // Reset goal store to clear cached data
        useGoalStore.getState().reset();
        set({
          session: null,
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
        return;
      }

      set({ session, isAuthenticated: !!session });

      if (session && event === 'SIGNED_IN') {
        // Identify user with Superwall for webhook tracking
        identifyWithSuperwall(session.user.id);
        await get().fetchProfile();
      }
    });
  },

  fetchProfile: async () => {
    try {
      const profile = await apiClient.get<User>('/api/profile');
      set({ user: profile, error: null });

      // Auto-sync phone timezone after fetching profile
      await get().syncTimezone();
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      // Don't show error for network issues on profile fetch
      // The user is still authenticated via Supabase
      set({ error: null });
    }
  },

  syncTimezone: async () => {
    try {
      const phoneTimezone = Localization.getCalendars()[0]?.timeZone ||
                           Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentUser = get().user;

      // Only update if different from server
      if (phoneTimezone && currentUser && currentUser.timezone !== phoneTimezone) {
        console.log(`Syncing timezone: ${currentUser.timezone} -> ${phoneTimezone}`);
        await get().updateTimezone(phoneTimezone);
      }
    } catch (error) {
      console.error('Failed to sync timezone:', error);
    }
  },

  updateTimezone: async (timezone: string) => {
    try {
      const updatedProfile = await apiClient.patch<User>('/api/profile', { timezone });
      set({ user: { ...get().user!, timezone: updatedProfile.timezone } });
    } catch (error: any) {
      console.error('Failed to update timezone:', error);
      throw error;
    }
  },

  signInWithGoogle: async () => {
    // Prevent multiple simultaneous auth attempts
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      // Use the app's custom scheme for development builds
      const redirectUri = makeRedirectUri({
        scheme: 'trellis',
      });

      console.log('Redirect URI:', redirectUri);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri
        );

        if (result.type === 'success') {
          console.log('Auth result URL:', result.url);

          const url = new URL(result.url);

          // Supabase returns tokens in hash fragment, not query params
          // e.g., exp://...#access_token=xxx&refresh_token=yyy
          let access_token = url.searchParams.get('access_token');
          let refresh_token = url.searchParams.get('refresh_token');

          // Check hash fragment if not in query params
          if (!access_token && url.hash) {
            const hashParams = new URLSearchParams(url.hash.substring(1));
            access_token = hashParams.get('access_token');
            refresh_token = hashParams.get('refresh_token');
          }

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
          } else {
            console.log('No tokens found in URL');
            set({ error: 'Authentication failed. Please try again.' });
          }
        } else if (result.type === 'cancel') {
          // User cancelled - not an error
          console.log('User cancelled authentication');
        }
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      set({ error: err.message || 'Failed to sign in' });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    // Only available on iOS
    if (Platform.OS !== 'ios') {
      set({ error: 'Sign in with Apple is only available on iOS' });
      return;
    }

    // Prevent multiple simultaneous auth attempts
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Sign in with Supabase using the Apple ID token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;

      // Apple only returns name on first sign-in, so we need to update it
      if (credential.fullName?.givenName || credential.fullName?.familyName) {
        const fullName = [
          credential.fullName?.givenName,
          credential.fullName?.familyName,
        ].filter(Boolean).join(' ');

        if (fullName) {
          await supabase.auth.updateUser({
            data: { full_name: fullName },
          });
        }
      }

      console.log('Apple sign in successful');
    } catch (err: any) {
      // Don't show error if user cancelled
      if (err.code === 'ERR_REQUEST_CANCELED') {
        console.log('User cancelled Apple sign in');
        set({ isLoading: false });
        return;
      }
      console.error('Apple sign in error:', err);
      set({ error: err.message || 'Failed to sign in with Apple' });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    // Prevent multiple simultaneous auth attempts
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Email sign in successful');
    } catch (err: any) {
      console.error('Email sign in error:', err);
      set({ error: err.message || 'Failed to sign in' });
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithCalendarAccess: async () => {
    if (get().isLoading) return false;
    set({ isLoading: true, error: null });

    try {
      // Use backend's direct Google OAuth (has proper calendar scopes)
      const response = await apiClient.get<{ url: string }>('/api/calendar/connect');
      const oauthUrl = response.url;

      console.log('Calendar: Opening Google OAuth:', oauthUrl);

      // The backend callback redirects to trellis://calendar-connected or trellis://calendar-error
      const result = await WebBrowser.openAuthSessionAsync(
        oauthUrl,
        'trellis://calendar-connected'
      );

      console.log('Calendar: OAuth result:', result.type);

      if (result.type === 'success') {
        // Backend callback already stored the refresh token in the database
        // Just check if it was successful based on the redirect URL
        const url = result.url;
        if (url.includes('calendar-connected')) {
          console.log('Calendar: Successfully connected!');
          return true;
        } else if (url.includes('calendar-error')) {
          console.error('Calendar: OAuth error from callback');
          set({ error: 'Failed to connect Google Calendar' });
          return false;
        }
      }

      return false;
    } catch (error: any) {
      console.error('Calendar access error:', error);
      set({ error: error.message || 'Failed to get calendar access' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      // Reset Superwall identity
      resetSuperwallIdentity();
      // Reset goal store to clear cached data
      useGoalStore.getState().reset();
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Still clear local state even if signOut fails
      resetSuperwallIdentity();
      useGoalStore.getState().reset();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));
