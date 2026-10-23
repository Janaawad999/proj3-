/**
 * AgriPulse API Configuration & Mock Switch
 * 
 * Controls backend integration parameters:
 * - API Base URL via VITE_API_BASE_URL
 * - Mock vs Real Backend toggle via VITE_USE_MOCK_DATA
 * - Graceful fallback to mock data when backend is unreachable
 */

// Environment variable resolution
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const envBaseUrl = env.VITE_API_BASE_URL || env.VITE_API_URL;
export const API_BASE_URL = envBaseUrl || 'http://localhost:8000/api';

// Check if mock mode is explicitly forced or configured via env
const envMockFlag = env.VITE_USE_MOCK_DATA;

// Default to MOCK mode when:
// 1. VITE_USE_MOCK_DATA is 'true' or not set (default for frontend independent development)
// 2. Or runtime override in localStorage is set
const getInitialMockState = () => {
    try {
        const stored = localStorage.getItem('agripulse_use_mock_data');
        if (stored !== null) {
            return stored === 'true';
        }
    } catch (e) {}

    // If VITE_USE_MOCK_DATA is explicitly 'false', attempt real backend
    if (envMockFlag === 'false') {
        return false;
    }
    // Default to true for independent frontend development
    return true;
};

let currentMockMode = getInitialMockState();

export const isMockMode = () => currentMockMode;

export const setMockMode = (enabled) => {
    currentMockMode = Boolean(enabled);
    try {
        localStorage.setItem('agripulse_use_mock_data', currentMockMode ? 'true' : 'false');
    } catch (e) {}
    console.info(`[AgriPulse API] Mock Data Mode: ${currentMockMode ? 'ENABLED (Standalone Demo)' : 'DISABLED (Real Backend)'}`);
};

/**
 * Execute real API call with automatic graceful mock fallback.
 * If real API fails with a network disconnection or 503/404, falls back to mock handler.
 */
export const withMockFallback = async (realApiCall, mockFallbackCall, operationName = 'API Operation') => {
    if (isMockMode()) {
        return await mockFallbackCall();
    }

    try {
        return await realApiCall();
    } catch (error) {
        // Check if backend is completely unreachable or offline
        const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
        const isServerUnavailable = error.response?.status >= 500;

        if (isNetworkError || isServerUnavailable) {
            console.warn(`[AgriPulse API] Backend unreachable for ${operationName}. Falling back to mock data safely.`);
            return await mockFallbackCall();
        }

        // Rethrow legitimate 4xx client errors (e.g., validation, unauthorized)
        throw error;
    }
};

export default {
    API_BASE_URL,
    isMockMode,
    setMockMode,
    withMockFallback
};
