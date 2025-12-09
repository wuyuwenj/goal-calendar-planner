import axios from 'axios';
import { supabase } from './supabase';

console.log('API: Base URL =', process.env.EXPO_PUBLIC_API_URL);
console.log('API: Timeout = 180000ms (3 minutes)');

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 180000, // 3 minute timeout for AI plan generation (marathon plans can be large)
});

// Cache for the current session to avoid AsyncStorage delays
let cachedSession: { access_token: string } | null = null;

// Update cached session when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = session;
});

// Initialize cached session
supabase.auth.getSession().then(({ data: { session } }) => {
  cachedSession = session;
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    // Use cached session first, fall back to getSession
    let accessToken = cachedSession?.access_token;

    if (!accessToken) {
      const { data: { session } } = await supabase.auth.getSession();
      accessToken = session?.access_token;
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      console.warn('No session found for API request to:', config.url);
    }
  } catch (error) {
    console.warn('Failed to get session for request:', error);
  }

  return config;
});

// Handle token refresh and errors
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle timeout errors gracefully
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.warn('API request timeout - is the backend server running?');
      return Promise.reject(new Error('Connection timeout. Please check if the server is running.'));
    }

    // Handle network errors
    if (!error.response) {
      console.warn('Network error - unable to reach server');
      return Promise.reject(new Error('Unable to connect to server. Please check your connection.'));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const {
          data: { session },
        } = await supabase.auth.refreshSession();

        if (session) {
          // Update cache with refreshed session
          cachedSession = session;
          originalRequest.headers.Authorization = `Bearer ${session.access_token}`;
          return api.request(originalRequest);
        }
      } catch (refreshError) {
        console.warn('Failed to refresh session:', refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export { api };

// Typed API helpers
export const apiClient = {
  get: <T>(url: string) => api.get<never, T>(url),
  post: <T>(url: string, data?: unknown) => api.post<never, T>(url, data),
  patch: <T>(url: string, data?: unknown) => api.patch<never, T>(url, data),
  put: <T>(url: string, data?: unknown) => api.put<never, T>(url, data),
  delete: <T>(url: string) => api.delete<never, T>(url),
};
