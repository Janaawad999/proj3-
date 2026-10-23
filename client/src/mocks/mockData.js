/**
 * AgriPulse Dedicated Mock Data Layer
 * 
 * Provides calibrated mock datasets for industrial smart irrigation telemetry,
 * ISO 10816 vibration baselines, pump registries, alerts, work orders, computer vision,
 * and AI diagnostic knowledge bases.
 */

export * from '../services/agriPulseData';
import { 
    SMART_PUMPS, 
    IRRIGATION_SECTORS, 
    INTELLIGENCE_BRIEFS, 
    WORK_ORDERS 
} from '../services/agriPulseData';

// Mock system settings
export const MOCK_SETTINGS = {
    vibrationWarning: 4.5,
    vibrationCritical: 7.1,
    tempWarning: 75.0,
    tempCritical: 88.0,
    samplingRateMs: 2500,
    alertEmail: 't.mansour@agripulse.ai',
    webhookUrl: 'https://scada.agripulse.internal/hooks/anomaly',
    isoStandard: 'ISO 10816-3 (Class II Medium Industrial Pumps)',
    telemetryGateway: 'AgriPulse-ESP32-Industrial-Cluster-01',
    notificationsEnabled: true
};

// Mock user profiles
export const MOCK_USERS = {
    demoEngineer: {
        id: 'usr-engineer-01',
        displayName: 'Tariq Mansour',
        email: 't.mansour@agripulse.ai',
        role: 'Lead Irrigation Engineer',
        organizationId: 'agripulse-delta-7',
        avatar: null,
        assignedSectors: ['sector-delta-7', 'sector-alpha-3', 'sector-gamma-12']
    },
    demoAgronomist: {
        id: 'usr-agronomist-02',
        displayName: 'Dr. Salma Fayed',
        email: 's.fayed@agripulse.ai',
        role: 'Agronomy & Foliar Specialist',
        organizationId: 'agripulse-delta-7',
        avatar: null,
        assignedSectors: ['sector-delta-7']
    },
    demoTechnician: {
        id: 'usr-tech-03',
        displayName: 'Ahmed El-Sayed',
        email: 'a.elsayed@agripulse.ai',
        role: 'Mechanical Field Technician',
        organizationId: 'agripulse-delta-7',
        avatar: null,
        assignedSectors: ['sector-delta-7', 'sector-gamma-12']
    }
};

// Mock dashboard aggregated overview stats
export const getMockDashboardOverview = () => {
    const totalPumps = SMART_PUMPS.length;
    const criticalPumps = SMART_PUMPS.filter(p => p.status === 'CRITICAL');
    const warningPumps = SMART_PUMPS.filter(p => p.status === 'WARNING');
    const healthyPumps = SMART_PUMPS.filter(p => p.status === 'HEALTHY' || p.status === 'STANDBY');

    const totalFlow = SMART_PUMPS.reduce((acc, p) => acc + (p.metrics?.flowRate || 0), 0);
    const totalPower = SMART_PUMPS.reduce((acc, p) => acc + (p.metrics?.powerKw || 0), 0);
    const avgHealthScore = Math.round(
        SMART_PUMPS.reduce((acc, p) => acc + (p.healthScore || 0), 0) / totalPumps
    );

    return {
        fleetSummary: {
            totalPumps,
            criticalCount: criticalPumps.length,
            warningCount: warningPumps.length,
            healthyCount: healthyPumps.length,
            healthyPercent: Math.round((healthyPumps.length / totalPumps) * 100),
            warningPercent: Math.round((warningPumps.length / totalPumps) * 100),
            criticalPercent: Math.round((criticalPumps.length / totalPumps) * 100),
            avgHealthScore,
            totalFlowRateLpm: Math.round(totalFlow),
            totalPowerKw: Math.round(totalPower * 10) / 10,
            onlinePumpsCount: 16,
            activeSectorsCount: IRRIGATION_SECTORS.length,
            totalHectaresCovered: 4370
        },
        sectors: IRRIGATION_SECTORS,
        urgentPumps: criticalPumps,
        recentAlerts: INTELLIGENCE_BRIEFS.slice(0, 5),
        recentWorkOrders: WORK_ORDERS.slice(0, 4)
    };
};
