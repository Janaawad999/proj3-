/**
 * AgriPulse Pump & Telemetry API Service
 * 
 * Handles pump registry, real-time sensor metrics, ISO 10816 vibration baselines,
 * and Weibull Remaining Useful Life (RUL) projections.
 */

import apiClient from './apiClient';
import { ENDPOINTS } from './endpoints';
import { withMockFallback } from './config';
import { mockPumpHandler } from '../../mocks/mockHandlers';

export const pumpService = {
    /**
     * Fetch list of pumps with optional sector, status, or search filters
     */
    getPumps: async (params = {}) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.PUMPS.LIST, { params });
                return response.data;
            },
            async () => {
                return await mockPumpHandler.getPumps(params);
            },
            'getPumps'
        );
    },

    /**
     * Fetch specific pump details by ID
     */
    getPumpById: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.PUMPS.DETAIL(id));
                return response.data;
            },
            async () => {
                return await mockPumpHandler.getPumpById(id);
            },
            `getPumpById(${id})`
        );
    },

    /**
     * Fetch real-time sensor timeseries and threshold limits for a pump
     */
    getPumpTelemetry: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.PUMPS.TELEMETRY(id));
                return response.data;
            },
            async () => {
                return await mockPumpHandler.getPumpTelemetry(id);
            },
            `getPumpTelemetry(${id})`
        );
    },

    /**
     * Fetch Remaining Useful Life (RUL) Weibull projection curve
     */
    getPumpRul: async (id) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.get(ENDPOINTS.PUMPS.RUL(id));
                return response.data;
            },
            async () => {
                return await mockPumpHandler.getPumpRul(id);
            },
            `getPumpRul(${id})`
        );
    },

    /**
     * Send simulated / actual equipment command (e.g. VFD throttle or emergency stop)
     */
    controlPump: async (id, actionData) => {
        return withMockFallback(
            async () => {
                const response = await apiClient.post(ENDPOINTS.PUMPS.CONTROL(id), actionData);
                return response.data;
            },
            async () => {
                return {
                    success: true,
                    message: `Simulated control action '${actionData.action}' dispatched to pump ${id}`,
                    timestamp: new Date().toISOString()
                };
            },
            `controlPump(${id})`
        );
    }
};

export default pumpService;
