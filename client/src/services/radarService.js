/**
 * AgriPulse Radar / Alerts Service Adapter
 * 
 * Bridges legacy radarService calls to the centralized alertService.
 */

import alertService from './api/alertService';
import { withMockFallback } from './api/config';
import { INTELLIGENCE_BRIEFS } from './agriPulseData';

const radarService = {
    getAlerts: async (params = {}) => {
        return alertService.getAlerts(params);
    },

    getInvestigation: async (id) => {
        return withMockFallback(
            async () => {
                // Real backend endpoint if available
                const alert = await alertService.getAlerts({ id });
                return alert;
            },
            async () => {
                const found = INTELLIGENCE_BRIEFS.find(a => a.id === id) || INTELLIGENCE_BRIEFS[0];
                return {
                    success: true,
                    alert: found,
                    investigation: {
                        category: { name: found?.pumpId || 'Pump P-04' },
                        summary: {
                            percentageIncrease: 42,
                            difference: 1.34,
                            currentPeriod: 'Current Operating Shift',
                            previousPeriod: 'Baseline Nominal'
                        },
                        details: found?.finding || 'Vibration anomaly detected in ISO 10816 Zone C.'
                    }
                };
            },
            `getInvestigation(${id})`
        );
    },

    markAsRead: async (id) => {
        return alertService.markAsRead(id);
    },

    markAllAsRead: async () => {
        return alertService.markAllAsRead();
    },

    dismissAlert: async (id) => {
        return alertService.dismissAlert(id);
    },

    triggerRadarCheck: async (data = {}) => {
        return alertService.triggerScan(data);
    }
};

export default radarService;
