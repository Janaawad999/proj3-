import axios from 'axios';

/**
 * Axios API Instance
 * 
 * Pre-configured with:
 * - Base URL from environment variable
 * - JWT token injection via request interceptor
 * - 401 auto-logout via response interceptor
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 (unauthorized / stale session)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isLoginOrRegister = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
            // If not an explicit login attempt that failed credentials, clear stale session and redirect
            if (!isLoginOrRegister) {
                console.warn('[API] 401 Unauthorized - Clearing stale token and redirecting to /login');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
