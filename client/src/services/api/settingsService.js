/**
 * AgriPulse System Settings & Calibration API Service
 * 
 * Handles ISO 10816 vibration severity thresholds, casing temperature alarms,
 * telemetry sampling rates, and notification webhook destinations.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockSettingsHandler } from '../../mocks/mockHandlers';

export const settingsService = {
    /**
     * Fetch platform calibration settings
     */
    getSettings: async () => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.SETTINGS.GET);
                return response.data;
            },
            async () => {
                return await mockSettingsHandler.getSettings();
            },
            'getSettings'
        );
    },

    /**
     * Update platform calibration settings
     */
    updateSettings: async (settingsData) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.put(ENDPOINTS.SETTINGS.UPDATE, settingsData);
                return response.data;
            },
            async () => {
                return await mockSettingsHandler.updateSettings(settingsData);
            },
            'updateSettings'
        );
    }
};

export default settingsService;
