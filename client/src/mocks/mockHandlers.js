/**
 * AgriPulse Mock Service Handlers
 * 
 * Simulates asynchronous backend API responses with realistic network latencies,
 * in-memory state persistence, filtering, search, and intelligent mock outputs.
 */

import {
    SMART_PUMPS,
    IRRIGATION_SECTORS,
    INTELLIGENCE_BRIEFS,
    WORK_ORDERS,
    FIELD_VISION_SAMPLES,
    PUMP_04_TIMESERIES,
    PUMP_04_RUL_DECAY_CURVE,
    MOCK_SETTINGS,
    MOCK_USERS,
    getMockDashboardOverview
} from './mockData';

// Helper to simulate network latency
export const simulateDelay = (ms = 220) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory state stores
let inMemoryWorkOrders = [...WORK_ORDERS];
let inMemoryAlerts = [...INTELLIGENCE_BRIEFS];
let inMemorySettings = { ...MOCK_SETTINGS };
let inMemoryPumps = [...SMART_PUMPS];

/**
 * Dashboard & Sectors Mock Handlers
 */
export const mockDashboardHandler = {
    getOverview: async () => {
        await simulateDelay(180);
        return {
            success: true,
            data: getMockDashboardOverview()
        };
    },
    getSectors: async () => {
        await simulateDelay(150);
        return {
            success: true,
            data: IRRIGATION_SECTORS
        };
    }
};

/**
 * Pumps Mock Handlers
 */
export const mockPumpHandler = {
    getPumps: async (params = {}) => {
        await simulateDelay(200);
        let result = [...inMemoryPumps];

        if (params.sectorId && params.sectorId !== 'ALL') {
            result = result.filter(p => p.sectorId === params.sectorId);
        }
        if (params.status && params.status !== 'ALL') {
            result = result.filter(p => p.status === params.status);
        }
        if (params.search) {
            const query = params.search.toLowerCase();
            result = result.filter(p => 
                p.id.toLowerCase().includes(query) ||
                p.name.toLowerCase().includes(query) ||
                p.model.toLowerCase().includes(query)
            );
        }

        return {
            success: true,
            data: result,
            total: result.length
        };
    },

    getPumpById: async (id) => {
        await simulateDelay(160);
        const pump = inMemoryPumps.find(p => p.id === id);
        if (!pump) {
            throw new Error(`Pump asset ${id} not found`);
        }
        return {
            success: true,
            data: pump
        };
    },

    getPumpTelemetry: async (id) => {
        await simulateDelay(220);
        const pump = inMemoryPumps.find(p => p.id === id) || inMemoryPumps[0];
        return {
            success: true,
            data: {
                pumpId: pump.id,
                currentMetrics: pump.metrics,
                thresholds: pump.thresholds,
                timeseries: PUMP_04_TIMESERIES,
                timestamp: new Date().toISOString()
            }
        };
    },

    getPumpRul: async (id) => {
        await simulateDelay(200);
        const pump = inMemoryPumps.find(p => p.id === id) || inMemoryPumps[0];
        return {
            success: true,
            data: {
                pumpId: pump.id,
                rulHours: pump.rulHours,
                rulWindow: pump.rulWindow,
                failureMode: pump.failureMode,
                urgency: pump.urgency,
                decayCurve: PUMP_04_RUL_DECAY_CURVE
            }
        };
    }
};

/**
 * Alerts Mock Handlers
 */
export const mockAlertHandler = {
    getAlerts: async (params = {}) => {
        await simulateDelay(180);
        let list = [...inMemoryAlerts];
        if (params.status && params.status !== 'ALL') {
            list = list.filter(a => a.status === params.status);
        }
        const limit = params.limit ? parseInt(params.limit, 10) : list.length;
        const alertsSlice = list.slice(0, limit);
        const unreadCount = list.filter(a => a.status === 'UNREAD').length;

        return {
            success: true,
            alerts: alertsSlice,
            total: list.length,
            unreadCount
        };
    },

    markAsRead: async (id) => {
        await simulateDelay(120);
        inMemoryAlerts = inMemoryAlerts.map(a => a.id === id ? { ...a, status: 'READ' } : a);
        return { success: true, message: `Alert ${id} marked as read` };
    },

    markAllAsRead: async () => {
        await simulateDelay(150);
        inMemoryAlerts = inMemoryAlerts.map(a => ({ ...a, status: 'READ' }));
        return { success: true, message: 'All alerts marked as read' };
    },

    dismissAlert: async (id) => {
        await simulateDelay(140);
        inMemoryAlerts = inMemoryAlerts.filter(a => a.id !== id);
        return { success: true, message: `Alert ${id} dismissed` };
    }
};

/**
 * Work Orders Mock Handlers
 */
export const mockWorkOrderHandler = {
    getWorkOrders: async (params = {}) => {
        await simulateDelay(200);
        let result = [...inMemoryWorkOrders];
        if (params.status && params.status !== 'ALL') {
            result = result.filter(wo => wo.status === params.status);
        }
        if (params.pumpId) {
            result = result.filter(wo => wo.pumpId === params.pumpId);
        }
        return {
            success: true,
            data: result,
            total: result.length
        };
    },

    createWorkOrder: async (orderData) => {
        await simulateDelay(300);
        const newOrder = {
            id: `WO-${Math.floor(1000 + Math.random() * 9000)}`,
            pumpId: orderData.pumpId || 'P-04',
            title: orderData.title || `Intervention on ${orderData.pumpId || 'Pump'}`,
            priority: orderData.priority || 'P2_HIGH',
            status: 'SCHEDULED',
            assignedTechnician: orderData.assignedTechnician || 'Tariq Mansour',
            estimatedDowntimeHours: parseFloat(orderData.estimatedDowntimeHours) || 2.0,
            targetCompletion: orderData.targetCompletion || 'Within 48h',
            spareParts: orderData.spareParts || ['Viton O-Ring', 'SKF 6312 Bearing Kit'],
            safetyRequirements: orderData.safetyRequirements || 'Standard Lockout/Tagout (LOTO) protocol on 380V breaker.',
            createdAt: new Date().toISOString()
        };
        inMemoryWorkOrders = [newOrder, ...inMemoryWorkOrders];
        return {
            success: true,
            data: newOrder,
            message: 'Work order scheduled successfully'
        };
    },

    updateWorkOrder: async (id, updates) => {
        await simulateDelay(200);
        const index = inMemoryWorkOrders.findIndex(wo => wo.id === id);
        if (index === -1) {
            throw new Error(`Work order ${id} not found`);
        }
        inMemoryWorkOrders[index] = { ...inMemoryWorkOrders[index], ...updates };
        return {
            success: true,
            data: inMemoryWorkOrders[index]
        };
    }
};

/**
 * AI Assistant Mock Handlers
 * Generates grounded, contextual responses using ISO 10816 standards,
 * pump hydraulics, cavitation physics, and LOTO safety protocols.
 */
export const mockAssistantHandler = {
    sendChatMessage: async ({ question, pumpId, context }) => {
        await simulateDelay(700); // realistic AI think time

        const lowerQ = (question || '').toLowerCase();
        let reply = '';

        if (lowerQ.includes('vibrat') || lowerQ.includes('iso')) {
            reply = `### ISO 10816-3 Mechanical Vibration Diagnostic Analysis
- **Observed Vibration Level**: **5.84 mm/s RMS** (Threshold: Zone C boundary is 4.5 mm/s, Zone D trip is 7.1 mm/s).
- **Classification**: **Zone C (Unrestricted Continuous Operation Prohibited)**.
- **Harmonic Signature**: Fast Fourier Transform (FFT) displays a predominant **1.48 kHz harmonic spike** accompanied by non-synchronous sidebands.
- **Root Cause**: Inner bearing raceway micro-pitting caused by localized hydrodynamic cavitation.
- **Recommended Action**:
  1. Throttle VFD to **45 Hz (-22% load)** immediately to suppress cavitation vapor pocket collapse.
  2. Inspect suction strainer for DN80 inlet differential pressure drop.
  3. Schedule replacement of drive-end bearing with **SKF 6312 C3** bearing kit within 38 operating hours.`;
        } else if (lowerQ.includes('cavitat') || lowerQ.includes('npsh')) {
            reply = `### Cavitation & NPSH Margin Evaluation
- **Net Positive Suction Head Available (NPSHa)**: Currently calculated at **2.18 m** against required NPSHr of **2.80 m**.
- **Hydraulic Imbalance**: The pump is operating in an **NPSH deficit of -0.62 m**.
- **Mechanism**: The static pressure at the impeller inlet eye has dropped below the vapor pressure of water at 28°C (0.038 bar abs), forming microscopic vapor bubbles that implode at up to 10,000 bar localized shockwave pressure.
- **Immediate Mitigation**:
  1. Open suction gate valve to 100% full bore.
  2. Increase intake suction sump water level by at least 45 cm.
  3. Reduce flow rate from 382 L/min to nominal 320 L/min to restore positive NPSH margin.`;
        } else if (lowerQ.includes('loto') || lowerQ.includes('safe') || lowerQ.includes('lockout')) {
            reply = `### OSHA / ISO Lockout/Tagout (LOTO) Safety Protocol
Before any mechanical intervention or seal replacement on industrial pumps:
1. **De-energize Main Electrical Feed**: Isolate 380V 3-phase MCC cabinet breaker #4 and apply an OSHA-compliant red padlocked lockout hasp.
2. **Verify Zero Energy State (ZES)**: Use a calibrated CAT IV 1000V multimeter to test Phase-to-Phase and Phase-to-Ground on the pump motor terminal box.
3. **Hydraulic Isolation**: Manually close and chain suction valve SV-04 and discharge check valve DV-04.
4. **Bleed Residual Pressure**: Open the 1/4" NPT casing bleed petcock to release all line pressure. Verify pressure gauge reads 0.0 bar.
5. **Drain Casing Fluid**: Ensure hot water (79.2°C) is cooled and drained safely into the collection sump prior to decoupling the mechanical seal gland.`;
        } else {
            reply = `### AgriPulse Diagnostic Assessment
Based on continuous telemetry from **Pump ${pumpId || 'P-04'}**:
- **Operating Health Score**: **42 / 100** (Critical Action Advised)
- **Casing Temperature**: 79.2°C (Warning threshold: 75.0°C)
- **Discharge Pressure**: 6.85 bar nominal (Delta P: 5.73 bar)
- **Current Draw**: 31.4 A (Full Load Amps: 28.0 A, running +12% overload)

**Synthesis**: The telemetry profile correlates with mechanical seal friction and early stage bearing raceway damage. All verified OEM documents (Grundfos CR 95-2, KSB MegaCPK) are available in the right-side technical reference panel.`;
        }

        return {
            success: true,
            text: reply,
            dataProvenance: 'MOCK_ENGINEERING_INTELLIGENCE',
            model: 'AgriPulse-Domain-RAG-v2.1',
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Crop Scan (Field Vision) Mock Handlers
 */
export const mockCropScanHandler = {
    analyzeImage: async (fileOrFormData) => {
        await simulateDelay(600); // simulate computer vision inference

        return {
            success: true,
            sample: {
                id: `scan-${Date.now()}`,
                title: 'User Field Scouting Inspection',
                crop: 'Citrus Orchard & Pivot Maize',
                sectorId: 'Sector Delta-7 (Zone 2)',
                imagePlaceholderText: 'Processed High-Resolution Foliar Image',
                detections: [
                    {
                        id: 'det-scan-1',
                        label: 'Foliar Water Stress & Leaf Wilting',
                        confidence: 91.4,
                        severity: 'ELEVATED_STRESS',
                        color: '#E7A944',
                        box: { x: 22, y: 24, width: 54, height: 50 }
                    },
                    {
                        id: 'det-scan-2',
                        label: 'Early Leaf Rust (Puccinia sorghi)',
                        confidence: 84.7,
                        severity: 'MODERATE',
                        color: '#D94C45',
                        box: { x: 62, y: 35, width: 28, height: 32 }
                    }
                ],
                hydraulicCorrelation: 'Telemetry shows sector line pressure dropped from 6.2 bar to 3.92 bar over the past 36 hours due to Pump P-04 cavitation throttling. Canopy wilting matches under-irrigation pattern.',
                action: 'Restore nominal sector pressure by clearing P-04 intake filter or switching to Standby Pump P-05. Spot-apply approved triazole fungicide for localized rust lesions.',
                linkedPump: 'P-04 (Zone 2 Booster)'
            },
            modelAttribution: 'YOLOv8s-CropDisease v1.2 (Benchmark Mode)',
            inferenceLatencyMs: 18
        };
    },

    getSampleBenchmarks: async () => {
        await simulateDelay(150);
        return {
            success: true,
            data: FIELD_VISION_SAMPLES
        };
    }
};

/**
 * Settings Mock Handlers
 */
export const mockSettingsHandler = {
    getSettings: async () => {
        await simulateDelay(150);
        return {
            success: true,
            data: inMemorySettings
        };
    },

    updateSettings: async (newSettings) => {
        await simulateDelay(220);
        inMemorySettings = { ...inMemorySettings, ...newSettings };
        return {
            success: true,
            data: inMemorySettings,
            message: 'Settings updated successfully'
        };
    }
};

/**
 * Auth Mock Handlers
 */
export const mockAuthHandler = {
    login: async (email, password) => {
        await simulateDelay(300);
        const user = MOCK_USERS.demoEngineer;
        const token = 'demo-jwt-token-agripulse-living-intelligence';
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return {
            success: true,
            token,
            user,
            message: 'Authenticated in Demo Engineer Mode'
        };
    },

    register: async (name, email, password) => {
        await simulateDelay(300);
        const user = {
            id: `usr-${Date.now()}`,
            displayName: name || 'Demo Engineer',
            email: email || 'engineer@agripulse.ai',
            role: 'Lead Irrigation Engineer',
            organizationId: 'agripulse-delta-7'
        };
        const token = `demo-jwt-token-${Date.now()}`;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        return {
            success: true,
            token,
            user,
            message: 'Account registered successfully in Demo Mode'
        };
    },

    getCurrentUser: () => {
        try {
            const saved = localStorage.getItem('user');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return MOCK_USERS.demoEngineer;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
