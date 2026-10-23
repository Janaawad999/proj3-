/**
 * AgriPulse Centralized Axios API Client
 * 
 * Features:
 * - Dynamic Base URL from environment variables via config.js
 * - Automatic JWT Bearer token injection
 * - 401 session expiration handling
 * - Error message normalization for clean UI consumption
 */

import axios from 'axios';
import { API_BASE_URL } from './config';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Request Interceptor: Inject JWT Bearer Token
apiClient.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token');
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (e) {
            console.warn('[apiClient] Failed to read token from localStorage', e);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Global HTTP Status Codes & Error Normalization
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Normalize user-friendly error message
        const responseData = error.response?.data;
        const status = error.response?.status;

        let friendlyMessage = 'Unable to connect to AgriPulse backend service.';
        if (responseData?.message) {
            friendlyMessage = responseData.message;
        } else if (responseData?.error) {
            friendlyMessage = typeof responseData.error === 'string' ? responseData.error : responseData.error.message;
        } else if (error.message) {
            friendlyMessage = error.message;
        }

        error.userMessage = friendlyMessage;

        // Auto-handle 401 Unauthorized
        if (status === 401) {
            const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
            if (!isAuthEndpoint) {
                console.warn('[apiClient] 401 Unauthorized — Session expired. Clearing token.');
                try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } catch (e) {}

                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
