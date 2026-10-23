/**
 * AgriPulse Authentication API Service
 * 
 * Handles engineer session management, JWT tokens, and user profile state.
 * Works seamlessly in Demo Mode when no backend is running.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockAuthHandler } from '../../mocks/mockHandlers';

export const authService = {
    /**
     * Sign in with engineer email and password
     */
    login: async (email, password) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            },
            async () => {
                return await mockAuthHandler.login(email, password);
            },
            'login'
        );
    },

    /**
     * Register a new engineer account
     */
    register: async (name, email, password) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, { name, email, password });
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            },
            async () => {
                return await mockAuthHandler.register(name, email, password);
            },
            'register'
        );
    },

    /**
     * Clear session and return to login
     */
    logout: () => {
        try {
            apiClient.post(ENDPOINTS.AUTH.LOGOUT).catch(() => {});
        } catch (e) {}
        mockAuthHandler.logout();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },

    /**
     * Get active logged in user profile
     */
    getCurrentUser: () => {
        return mockAuthHandler.getCurrentUser();
    },

    /**
     * Update current user profile
     */
    updateProfile: async (profileData) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.put(ENDPOINTS.AUTH.PROFILE, profileData);
                if (response.data?.user) {
                    localStorage.setItem('user', JSON.stringify(response.data.user));
                }
                return response.data;
            },
            async () => {
                const current = mockAuthHandler.getCurrentUser();
                const updated = { ...current, ...profileData };
                localStorage.setItem('user', JSON.stringify(updated));
                return { success: true, user: updated };
            },
            'updateProfile'
        );
    }
};

export default authService;
