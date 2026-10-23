/**
 * AgriPulse Dashboard & Aggregated Telemetry API Service
 * 
 * Provides fleet-wide health scores, hydraulic throughput,
 * sector breakdowns, and urgent pump interventions.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockDashboardHandler } from '../../mocks/mockHandlers';

export const dashboardService = {
    /**
     * Fetch aggregated fleet overview metrics
     */
    getDashboardOverview: async () => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.DASHBOARD.OVERVIEW);
                return response.data;
            },
            async () => {
                return await mockDashboardHandler.getOverview();
            },
            'getDashboardOverview'
        );
    },

    /**
     * Fetch all registered irrigation sectors
     */
    getSectors: async () => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.DASHBOARD.SECTORS);
                return response.data;
            },
            async () => {
                return await mockDashboardHandler.getSectors();
            },
            'getSectors'
        );
    }
};

export default dashboardService;
