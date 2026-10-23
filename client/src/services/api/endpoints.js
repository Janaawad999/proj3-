/**
 * AgriPulse Centralized API Endpoints
 * 
 * Defines all proposed backend REST API routes.
 * The backend developer should implement endpoints conforming to these paths.
 */

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        REFRESH: '/auth/refresh'
    },
    DASHBOARD: {
        OVERVIEW: '/dashboard/overview',
        STATS: '/dashboard/stats',
        SECTORS: '/sectors'
    },
    PUMPS: {
        LIST: '/pumps',
        DETAIL: (id) => `/pumps/${id}`,
        TELEMETRY: (id) => `/pumps/${id}/telemetry`,
        RUL: (id) => `/pumps/${id}/rul`,
        CONTROL: (id) => `/pumps/${id}/control`
    },
    ALERTS: {
        LIST: '/alerts',
        DETAIL: (id) => `/alerts/${id}`,
        MARK_READ: (id) => `/alerts/${id}/read`,
        MARK_ALL_READ: '/alerts/read-all',
        DISMISS: (id) => `/alerts/${id}`,
        TRIGGER_CHECK: '/alerts/check'
    },
    WORK_ORDERS: {
        LIST: '/work-orders',
        CREATE: '/work-orders',
        DETAIL: (id) => `/work-orders/${id}`,
        UPDATE: (id) => `/work-orders/${id}`,
        DELETE: (id) => `/work-orders/${id}`
    },
    ASSISTANT: {
        CHAT: '/assistant/chat',
        DOCUMENTS: '/assistant/documents'
    },
    CROP_SCAN: {
        ANALYZE: '/crop-scan',
        BENCHMARKS: '/crop-scan/benchmarks',
        HISTORY: '/crop-scan/history'
    },
    SETTINGS: {
        GET: '/settings',
        UPDATE: '/settings'
    },
    SYSTEM: {
        HEALTH: '/health'
    }
};

export default ENDPOINTS;
