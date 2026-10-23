import api from './api';

/**
 * Financial Radar Client API Service
 * 
 * Handles fetching proactive alerts, investigation breakdowns,
 * marking alerts as read/dismissed, and manual radar scans.
 */
const radarService = {
    /**
     * Get alerts list with unread counter
     */
    getAlerts: async (params = {}) => {
        const response = await api.get('/alerts', { params });
        return response.data;
    },

    /**
     * Get detailed investigation report for a specific alert
     */
    getInvestigation: async (id) => {
        const response = await api.get(`/alerts/${id}/investigate`);
        return response.data;
    },

    /**
     * Mark an alert as READ
     */
    markAsRead: async (id) => {
        const response = await api.patch(`/alerts/${id}/read`);
        return response.data;
    },

    /**
     * Mark all alerts as READ
     */
    markAllAsRead: async () => {
        const response = await api.patch('/alerts/read-all');
        return response.data;
    },

    /**
     * Dismiss / Delete an alert
     */
    dismissAlert: async (id) => {
        const response = await api.delete(`/alerts/${id}`);
        return response.data;
    },

    /**
     * Run on-demand Financial Radar analysis scan
     */
    triggerRadarCheck: async (data = {}) => {
        const response = await api.post('/radar/check', data);
        return response.data;
    }
};

export default radarService;
