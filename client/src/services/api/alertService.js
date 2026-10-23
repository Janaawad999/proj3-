/**
 * AgriPulse Alerts & Notifications API Service
 * 
 * Handles proactive telemetry alerts, ISO threshold breach notices,
 * and alert dismissal / read lifecycle.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockAlertHandler } from '../../mocks/mockHandlers';

export const alertService = {
    /**
     * Get list of alerts with unread counter
     */
    getAlerts: async (params = {}) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.ALERTS.LIST, { params });
                return response.data;
            },
            async () => {
                return await mockAlertHandler.getAlerts(params);
            },
            'getAlerts'
        );
    },

    /**
     * Mark single alert as read
     */
    markAsRead: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.patch(ENDPOINTS.ALERTS.MARK_READ(id));
                return response.data;
            },
            async () => {
                return await mockAlertHandler.markAsRead(id);
            },
            `markAsRead(${id})`
        );
    },

    /**
     * Mark all active alerts as read
     */
    markAllAsRead: async () => {
        return withMockFallback(
            async () => {
                const response = await apiClient.patch(ENDPOINTS.ALERTS.MARK_ALL_READ);
                return response.data;
            },
            async () => {
                return await mockAlertHandler.markAllAsRead();
            },
            'markAllAsRead'
        );
    },

    /**
     * Dismiss / delete an alert
     */
    dismissAlert: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.delete(ENDPOINTS.ALERTS.DISMISS(id));
                return response.data;
            },
            async () => {
                return await mockAlertHandler.dismissAlert(id);
            },
            `dismissAlert(${id})`
        );
    },

    /**
     * Trigger manual anomaly / radar scan
     */
    triggerScan: async (data = {}) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.post(ENDPOINTS.ALERTS.TRIGGER_CHECK, data);
                return response.data;
            },
            async () => {
                return {
                    success: true,
                    message: 'Manual radar anomaly scan triggered successfully (Simulation)',
                    scannedSensors: 72,
                    anomaliesDetected: 1
                };
            },
            'triggerScan'
        );
    }
};

export default alertService;
