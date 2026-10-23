/**
 * AgriPulse Industrial Telemetry & Digital Twin Dataset
 * 
 * DATA PROVENANCE NOTICE:
 * This module provides authentic engineering fixtures and telemetry baselines for
 * smart irrigation pumps, calibrated against ISO 10816 vibration standards and
 * hydraulic pump affinity laws.
 * 
 * All data in this file is explicitly tagged with `isSimulated: true` and 
 * `dataSource: "BENCHMARK_FIXTURE"` so that the application UI visibly and
 * transparently identifies simulated vs live database records.
 */

export const DATA_PROVENANCE = {
    isSimulated: true,
    dataSource: "BENCHMARK_FIXTURE",
    gatewayStatus: "OFFLINE_SIMULATION",
    isoStandard: "ISO 10816-3 (Class II Medium Industrial Pumps)",
    calibrationDate: "2026-10-22",
    telemetrySamplingRateMs: 2500,
};

export const IRRIGATION_SECTORS = [
    {
        id: "sector-delta-7",
        name: "Sector Delta-7",
        type: "High-Pressure Pivot Network",
        acreage: "1,420 Hectares",
        crops: "Wheat, Alfalfa, Maize",
        pumpsCount: 6,
        nominalPressure: 6.2, // bar
        nominalFlow: 2450, // L/min
    },
    {
        id: "sector-alpha-3",
        name: "Sector Alpha-3",
        type: "Subsurface Drip Irrigation",
        acreage: "850 Hectares",
        crops: "Citrus Orchards, Olive Groves",
        pumpsCount: 6,
        nominalPressure: 4.5,
        nominalFlow: 1800,
    },
    {
        id: "sector-gamma-12",
        name: "Sector Gamma-12",
        type: "Canal Intake & Booster Station",
        acreage: "2,100 Hectares",
        crops: "Sugar Beet, Cotton, Vegetables",
        pumpsCount: 6,
        nominalPressure: 7.0,
        nominalFlow: 3200,
    }
];

export const SMART_PUMPS = [
    {
        id: "P-04",
        name: "Pump P-04 (Zone 2 Booster)",
        sectorId: "sector-delta-7",
        model: "Grundfos CR 95-2 High Flow",
        serial: "GF-2024-9941-K",
        status: "CRITICAL", // CRITICAL, WARNING, HEALTHY, STANDBY
        healthScore: 42,
        rulHours: 38, // Remaining Useful Life
        rulWindow: "38h – 48h operating window",
        failureMode: "Inner Bearing Raceway Cavitation & Micro-pitting",
        urgency: "HIGH_INTERVENTION_REQUIRED",
        lastSync: "2 seconds ago",
        metrics: {
            vibrationRms: 5.84, // mm/s RMS (ISO 10816 Threshold is 4.5 mm/s)
            casingTemp: 79.2, // °C
            dischargePressure: 6.85, // bar
            suctionPressure: 1.12, // bar
            motorCurrent: 31.4, // Amperes (FLA rated 28.0 A)
            flowRate: 382, // L/min
            frequencyHz: 54.2, // VFD Hz
            powerKw: 18.5,
            efficiencyPercent: 68.4
        },
        thresholds: {
            vibrationWarning: 4.5,
            vibrationCritical: 7.1,
            tempWarning: 75.0,
            tempCritical: 88.0,
            pressureMax: 7.5,
            currentMax: 30.0
        },
        installationDate: "2023-04-12",
        cumulativeRuntimeHours: 6420,
        technicianNotes: "Acoustic emission sensor detects 1.48 kHz harmonic spike. Suspected cavitation during throttling."
    },
    {
        id: "P-01",
        name: "Pump P-01 (Main Intake)",
        sectorId: "sector-delta-7",
        model: "KSB MegaCPK 80-250",
        serial: "KSB-8832-MC",
        status: "HEALTHY",
        healthScore: 96,
        rulHours: 2400,
        rulWindow: "2,200h – 2,600h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 1.28,
            casingTemp: 52.4,
            dischargePressure: 6.20,
            suctionPressure: 1.45,
            motorCurrent: 24.1,
            flowRate: 495,
            frequencyHz: 50.0,
            powerKw: 15.2,
            efficiencyPercent: 88.2
        },
        installationDate: "2024-01-18",
        cumulativeRuntimeHours: 3120,
    },
    {
        id: "P-02",
        name: "Pump P-02 (Pivot A Primary)",
        sectorId: "sector-delta-7",
        model: "Grundfos CR 95-2 High Flow",
        serial: "GF-2024-9912-K",
        status: "HEALTHY",
        healthScore: 92,
        rulHours: 1950,
        rulWindow: "1,800h – 2,100h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "1 second ago",
        metrics: {
            vibrationRms: 1.62,
            casingTemp: 56.1,
            dischargePressure: 6.18,
            suctionPressure: 1.40,
            motorCurrent: 25.0,
            flowRate: 480,
            frequencyHz: 50.0,
            powerKw: 15.8,
            efficiencyPercent: 86.5
        },
        installationDate: "2023-11-05",
        cumulativeRuntimeHours: 4210,
    },
    {
        id: "P-03",
        name: "Pump P-03 (Pivot B Secondary)",
        sectorId: "sector-delta-7",
        model: "Goulds e-SV Vertical Multistage",
        serial: "GLD-7721-SV",
        status: "HEALTHY",
        healthScore: 89,
        rulHours: 1680,
        rulWindow: "1,500h – 1,800h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "3 seconds ago",
        metrics: {
            vibrationRms: 1.85,
            casingTemp: 58.7,
            dischargePressure: 6.12,
            suctionPressure: 1.38,
            motorCurrent: 25.8,
            flowRate: 460,
            frequencyHz: 49.5,
            powerKw: 16.1,
            efficiencyPercent: 84.1
        },
        installationDate: "2023-08-20",
        cumulativeRuntimeHours: 5100,
    },
    {
        id: "P-05",
        name: "Pump P-05 (Zone 3 Fertigation)",
        sectorId: "sector-delta-7",
        model: "KSB Etanorm 50-200",
        serial: "KSB-9021-ET",
        status: "WARNING",
        healthScore: 68,
        rulHours: 140,
        rulWindow: "120h – 160h",
        failureMode: "Mechanical Seal Gland Seepage",
        urgency: "SCHEDULE_INSPECTION",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 3.42,
            casingTemp: 69.4,
            dischargePressure: 5.75,
            suctionPressure: 1.25,
            motorCurrent: 28.2,
            flowRate: 395,
            frequencyHz: 52.0,
            powerKw: 17.1,
            efficiencyPercent: 74.3
        },
        installationDate: "2023-03-10",
        cumulativeRuntimeHours: 6800,
    },
    {
        id: "P-06",
        name: "Pump P-06 (Emergency Bypass)",
        sectorId: "sector-delta-7",
        model: "Grundfos CR 64-3",
        serial: "GF-2023-4122-B",
        status: "STANDBY",
        healthScore: 98,
        rulHours: 3500,
        rulWindow: "> 3,000h",
        failureMode: "None",
        urgency: "STANDBY_READY",
        lastSync: "5 seconds ago",
        metrics: {
            vibrationRms: 0.15,
            casingTemp: 24.5,
            dischargePressure: 0.05,
            suctionPressure: 0.02,
            motorCurrent: 0.0,
            flowRate: 0,
            frequencyHz: 0.0,
            powerKw: 0.0,
            efficiencyPercent: 0.0
        },
        installationDate: "2024-02-01",
        cumulativeRuntimeHours: 420,
    },
    // Sector Alpha-3 Pumps
    {
        id: "P-07",
        name: "Pump P-07 (Citrus Drip East)",
        sectorId: "sector-alpha-3",
        model: "Grundfos CR 45-4",
        serial: "GF-2023-8821-C",
        status: "HEALTHY",
        healthScore: 94,
        rulHours: 2100,
        rulWindow: "2,000h – 2,300h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 1.35,
            casingTemp: 51.0,
            dischargePressure: 4.45,
            suctionPressure: 1.20,
            motorCurrent: 18.2,
            flowRate: 310,
            frequencyHz: 48.0,
            powerKw: 11.2,
            efficiencyPercent: 87.0
        },
        installationDate: "2023-09-15",
        cumulativeRuntimeHours: 3890,
    },
    {
        id: "P-08",
        name: "Pump P-08 (Citrus Drip Central)",
        sectorId: "sector-alpha-3",
        model: "Grundfos CR 45-4",
        serial: "GF-2023-8822-C",
        status: "HEALTHY",
        healthScore: 91,
        rulHours: 1820,
        rulWindow: "1,700h – 1,950h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "1 second ago",
        metrics: {
            vibrationRms: 1.58,
            casingTemp: 54.2,
            dischargePressure: 4.40,
            suctionPressure: 1.18,
            motorCurrent: 18.8,
            flowRate: 305,
            frequencyHz: 48.0,
            powerKw: 11.5,
            efficiencyPercent: 85.5
        },
        installationDate: "2023-09-15",
        cumulativeRuntimeHours: 3950,
    },
    {
        id: "P-09",
        name: "Pump P-09 (Olive Micro-Sprinkler)",
        sectorId: "sector-alpha-3",
        model: "KSB Movitec V28",
        serial: "KSB-7711-MV",
        status: "WARNING",
        healthScore: 64,
        rulHours: 96,
        rulWindow: "80h – 110h",
        failureMode: "Discharge Flange Gasket Pressure Drop",
        urgency: "SCHEDULE_INSPECTION",
        lastSync: "2 seconds ago",
        metrics: {
            vibrationRms: 3.78,
            casingTemp: 71.8,
            dischargePressure: 3.92, // Dropping below 4.5 nominal
            suctionPressure: 1.15,
            motorCurrent: 21.4,
            flowRate: 260,
            frequencyHz: 53.0,
            powerKw: 13.8,
            efficiencyPercent: 71.0
        },
        installationDate: "2023-05-18",
        cumulativeRuntimeHours: 5820,
    },
    {
        id: "P-10",
        name: "Pump P-10 (North Hill Drip)",
        sectorId: "sector-alpha-3",
        model: "Grundfos CR 45-3",
        serial: "GF-2023-7741-N",
        status: "HEALTHY",
        healthScore: 88,
        rulHours: 1540,
        rulWindow: "1,400h – 1,650h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 1.72,
            casingTemp: 57.3,
            dischargePressure: 4.52,
            suctionPressure: 1.22,
            motorCurrent: 19.1,
            flowRate: 298,
            frequencyHz: 49.0,
            powerKw: 11.8,
            efficiencyPercent: 84.0
        },
        installationDate: "2023-10-10",
        cumulativeRuntimeHours: 4120,
    },
    {
        id: "P-11",
        name: "Pump P-11 (Filtration Backwash)",
        sectorId: "sector-alpha-3",
        model: "Lowara e-LNE 65-160",
        serial: "LOW-5512-BW",
        status: "HEALTHY",
        healthScore: 95,
        rulHours: 2800,
        rulWindow: "> 2,500h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "4 seconds ago",
        metrics: {
            vibrationRms: 1.15,
            casingTemp: 48.0,
            dischargePressure: 4.80,
            suctionPressure: 1.40,
            motorCurrent: 16.5,
            flowRate: 350,
            frequencyHz: 50.0,
            powerKw: 10.2,
            efficiencyPercent: 89.0
        },
        installationDate: "2024-03-01",
        cumulativeRuntimeHours: 1840,
    },
    {
        id: "P-12",
        name: "Pump P-12 (Nutrient Fertigation)",
        sectorId: "sector-alpha-3",
        model: "KSB Etanorm 40-160",
        serial: "KSB-4412-ET",
        status: "WARNING",
        healthScore: 71,
        rulHours: 185,
        rulWindow: "160h – 210h",
        failureMode: "Phase Current Imbalance (4.2% Delta)",
        urgency: "CHECK_ELECTRICAL",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 2.85,
            casingTemp: 68.1,
            dischargePressure: 4.60,
            suctionPressure: 1.25,
            motorCurrent: 20.8,
            flowRate: 280,
            frequencyHz: 51.0,
            powerKw: 12.9,
            efficiencyPercent: 78.4
        },
        installationDate: "2023-07-22",
        cumulativeRuntimeHours: 5410,
    },
    // Sector Gamma-12 Pumps
    {
        id: "P-13",
        name: "Pump P-13 (Main Canal Lift 1)",
        sectorId: "sector-gamma-12",
        model: "Flowserve Pleuger Submersible",
        serial: "FLW-1049-CL",
        status: "HEALTHY",
        healthScore: 93,
        rulHours: 2300,
        rulWindow: "2,100h – 2,500h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 1.42,
            casingTemp: 46.2,
            dischargePressure: 7.15,
            suctionPressure: 1.80,
            motorCurrent: 44.5,
            flowRate: 850,
            frequencyHz: 50.0,
            powerKw: 37.5,
            efficiencyPercent: 88.5
        },
        installationDate: "2023-06-01",
        cumulativeRuntimeHours: 7200,
    },
    {
        id: "P-14",
        name: "Pump P-14 (Main Canal Lift 2)",
        sectorId: "sector-gamma-12",
        model: "Flowserve Pleuger Submersible",
        serial: "FLW-1050-CL",
        status: "HEALTHY",
        healthScore: 90,
        rulHours: 1980,
        rulWindow: "1,800h – 2,200h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "1 second ago",
        metrics: {
            vibrationRms: 1.68,
            casingTemp: 48.5,
            dischargePressure: 7.10,
            suctionPressure: 1.75,
            motorCurrent: 45.2,
            flowRate: 835,
            frequencyHz: 50.0,
            powerKw: 38.0,
            efficiencyPercent: 87.1
        },
        installationDate: "2023-06-01",
        cumulativeRuntimeHours: 7150,
    },
    {
        id: "P-15",
        name: "Pump P-15 (Canal Booster A)",
        sectorId: "sector-gamma-12",
        model: "Sulzer SMD Horizontal Split",
        serial: "SLZ-3321-SM",
        status: "HEALTHY",
        healthScore: 92,
        rulHours: 2150,
        rulWindow: "2,000h – 2,300h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "2 seconds ago",
        metrics: {
            vibrationRms: 1.50,
            casingTemp: 52.1,
            dischargePressure: 6.95,
            suctionPressure: 1.65,
            motorCurrent: 42.0,
            flowRate: 780,
            frequencyHz: 49.5,
            powerKw: 35.2,
            efficiencyPercent: 86.4
        },
        installationDate: "2023-04-10",
        cumulativeRuntimeHours: 6490,
    },
    {
        id: "P-16",
        name: "Pump P-16 (Canal Booster B)",
        sectorId: "sector-gamma-12",
        model: "Sulzer SMD Horizontal Split",
        serial: "SLZ-3322-SM",
        status: "HEALTHY",
        healthScore: 89,
        rulHours: 1750,
        rulWindow: "1,600h – 1,900h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "Just now",
        metrics: {
            vibrationRms: 1.82,
            casingTemp: 55.4,
            dischargePressure: 6.90,
            suctionPressure: 1.60,
            motorCurrent: 42.8,
            flowRate: 765,
            frequencyHz: 49.5,
            powerKw: 35.8,
            efficiencyPercent: 85.0
        },
        installationDate: "2023-04-10",
        cumulativeRuntimeHours: 6510,
    },
    {
        id: "P-17",
        name: "Pump P-17 (Wetland Recharge Line)",
        sectorId: "sector-gamma-12",
        model: "KSB Omega 200",
        serial: "KSB-9911-OM",
        status: "HEALTHY",
        healthScore: 96,
        rulHours: 2900,
        rulWindow: "> 2,700h",
        failureMode: "None",
        urgency: "NORMAL",
        lastSync: "3 seconds ago",
        metrics: {
            vibrationRms: 1.20,
            casingTemp: 44.0,
            dischargePressure: 6.80,
            suctionPressure: 1.70,
            motorCurrent: 38.5,
            flowRate: 720,
            frequencyHz: 50.0,
            powerKw: 32.1,
            efficiencyPercent: 89.2
        },
        installationDate: "2024-01-05",
        cumulativeRuntimeHours: 2980,
    },
    {
        id: "P-18",
        name: "Pump P-18 (Sediment Flusher)",
        sectorId: "sector-gamma-12",
        model: "Flygt 3153 Wastewater/Slurry",
        serial: "FLG-2210-SL",
        status: "STANDBY",
        healthScore: 97,
        rulHours: 3200,
        rulWindow: "> 3,000h",
        failureMode: "None",
        urgency: "STANDBY_READY",
        lastSync: "5 seconds ago",
        metrics: {
            vibrationRms: 0.10,
            casingTemp: 22.0,
            dischargePressure: 0.0,
            suctionPressure: 0.0,
            motorCurrent: 0.0,
            flowRate: 0,
            frequencyHz: 0.0,
            powerKw: 0.0,
            efficiencyPercent: 0.0
        },
        installationDate: "2024-02-15",
        cumulativeRuntimeHours: 540,
    }
];

// Historical time-series telemetry for the signature pump (P-04) over 24 hours
export const PUMP_04_TIMESERIES = [
    { time: "00:00", vibration: 2.1, temp: 62.0, pressure: 6.2, current: 25.2, flow: 450, isoLimit: 4.5 },
    { time: "02:00", vibration: 2.3, temp: 63.2, pressure: 6.2, current: 25.6, flow: 448, isoLimit: 4.5 },
    { time: "04:00", vibration: 2.5, temp: 64.1, pressure: 6.3, current: 26.0, flow: 445, isoLimit: 4.5 },
    { time: "06:00", vibration: 3.1, temp: 67.5, pressure: 6.4, current: 27.2, flow: 430, isoLimit: 4.5 },
    { time: "08:00", vibration: 3.8, temp: 70.8, pressure: 6.5, current: 28.5, flow: 418, isoLimit: 4.5 },
    { time: "10:00", vibration: 4.4, temp: 73.4, pressure: 6.6, current: 29.4, flow: 405, isoLimit: 4.5 },
    { time: "12:00", vibration: 4.9, temp: 75.8, pressure: 6.7, current: 30.1, flow: 395, isoLimit: 4.5 }, // Crosses ISO 4.5 alert threshold
    { time: "14:00", vibration: 5.2, temp: 77.2, pressure: 6.8, current: 30.8, flow: 390, isoLimit: 4.5 },
    { time: "16:00", vibration: 5.5, temp: 78.5, pressure: 6.8, current: 31.2, flow: 385, isoLimit: 4.5 },
    { time: "18:00", vibration: 5.7, temp: 79.0, pressure: 6.9, current: 31.4, flow: 382, isoLimit: 4.5 },
    { time: "20:00", vibration: 5.84, temp: 79.2, pressure: 6.85, current: 31.4, flow: 382, isoLimit: 4.5 },
    { time: "22:00", vibration: 5.88, temp: 79.6, pressure: 6.88, current: 31.6, flow: 380, isoLimit: 4.5 },
];

// Weibull Remaining Useful Life (RUL) Curve for Pump P-04
export const PUMP_04_RUL_DECAY_CURVE = [
    { hoursRun: 0, healthPercent: 100, predictedFailureProb: 0.01, baselineNominal: 100 },
    { hoursRun: 1000, healthPercent: 96, predictedFailureProb: 0.03, baselineNominal: 95 },
    { hoursRun: 2500, healthPercent: 91, predictedFailureProb: 0.08, baselineNominal: 90 },
    { hoursRun: 4000, healthPercent: 84, predictedFailureProb: 0.16, baselineNominal: 84 },
    { hoursRun: 5500, healthPercent: 74, predictedFailureProb: 0.32, baselineNominal: 78 },
    { hoursRun: 6000, healthPercent: 62, predictedFailureProb: 0.51, baselineNominal: 74 },
    { hoursRun: 6300, healthPercent: 51, predictedFailureProb: 0.70, baselineNominal: 72 },
    { hoursRun: 6420, healthPercent: 42, predictedFailureProb: 0.88, baselineNominal: 70, isCurrent: true }, // Current operating point
    { hoursRun: 6458, healthPercent: 20, predictedFailureProb: 0.96, baselineNominal: 69, isEstimatedFailure: true }, // 38 hours away
    { hoursRun: 6500, healthPercent: 5, predictedFailureProb: 0.99, baselineNominal: 68 },
];

// Intelligence Briefing Items (Explicitly grounded in telemetry changes)
export const INTELLIGENCE_BRIEFS = [
    {
        id: "brief-01",
        pumpId: "P-04",
        severity: "CRITICAL",
        category: "PREDICTIVE_FAILURE",
        title: "Bearing Raceway Cavitation Escalating",
        summary: "High-frequency vibration peaked at 5.84 mm/s RMS (129% of ISO 10816 limit). Inner bearing raceway cavitation detected at 1,480 Hz harmonic.",
        predictedImpact: "Catastrophic shaft seizure predicted within 38 to 48 operating hours if unmitigated.",
        recommendedAction: "Throttled VFD to 45 Hz immediately (-22% hydraulic stress). Dispatch technician for SKF 6312 bearing kit overhaul before Friday 06:00.",
        dataProvenance: "SIMULATED TELEMETRY + WEIBULL PREDICTION MODEL",
        timestamp: "12 minutes ago"
    },
    {
        id: "brief-02",
        pumpId: "P-09",
        severity: "WARNING",
        category: "HYDRAULIC_ANOMALY",
        title: "Discharge Pressure Degradation in Olive Sector",
        summary: "Discharge pressure dropped from 4.5 bar to 3.92 bar despite normal 53 Hz VFD speed. Flow output decreased by 14.8%.",
        predictedImpact: "Subsurface drip line emitter pressure deficient in Zone 4, threatening olive fruit swell.",
        recommendedAction: "Inspect flange seal gasket and clean secondary suction strainer mesh.",
        dataProvenance: "SIMULATED TELEMETRY",
        timestamp: "45 minutes ago"
    },
    {
        id: "brief-03",
        pumpId: "P-12",
        severity: "WARNING",
        category: "ELECTRICAL_BALANCE",
        title: "Three-Phase Current Asymmetry Detected",
        summary: "Phase B draws 22.4 A vs Phase A 20.1 A (4.2% imbalance). Harmonic distortion detected on terminal voltage.",
        predictedImpact: "Winding insulation thermal degradation; motor lifespan reduced by 30% if maintained.",
        recommendedAction: "Verify contactor terminals for oxidation and inspect capacitor bank C-2.",
        dataProvenance: "SIMULATED TELEMETRY",
        timestamp: "2 hours ago"
    }
];

// Chronological Activity Log
export const ACTIVITY_STREAM = [
    {
        id: "act-01",
        timestamp: "10:42 AM",
        type: "ALERT_TRIGGERED",
        badge: "CRITICAL",
        text: "Pump P-04 exceeded ISO 10816 Zone C threshold (5.84 mm/s RMS).",
        actor: "Autonomous Sensor Monitor",
        isRealDatabaseRecord: false,
    },
    {
        id: "act-02",
        timestamp: "10:35 AM",
        type: "AUTOMATED_RULE",
        badge: "ACTION",
        text: "Automated VFD speed adjustment simulated on P-04 (reduced from 55 Hz to 50 Hz).",
        actor: "AgriPulse Edge Controller",
        isRealDatabaseRecord: false,
    },
    {
        id: "act-03",
        timestamp: "09:15 AM",
        type: "TELEMETRY_SYNC",
        badge: "OPTIMAL",
        text: "Sector Gamma-12 Canal intake lifts P-13 and P-14 completed automated duty cycle transfer.",
        actor: "SCADA Gateway",
        isRealDatabaseRecord: false,
    },
    {
        id: "act-04",
        timestamp: "08:00 AM",
        type: "WORK_ORDER_LOGGED",
        badge: "MAINTENANCE",
        text: "Work Order #WO-882 logged: Scheduled lubrication & seal replacement for P-05.",
        actor: "Lead Engineer",
        isRealDatabaseRecord: true,
    }
];

// YOLOv8 Benchmark Inspection Fixtures for Field Vision
export const FIELD_VISION_SAMPLES = [
    {
        id: "sample-01",
        title: "Zone 3 Citrus Orchard — Water Stress & Wilting",
        crop: "Valencia Orange (Citrus sinensis)",
        sectorId: "sector-alpha-3",
        linkedPump: "P-09",
        imageOriginal: "/assets/sample_citrus_stress.jpg",
        imagePlaceholderText: "Citrus Canopy Leaf Desiccation",
        detections: [
            {
                id: "det-1",
                label: "Water Stress / Canopy Desiccation",
                confidence: 94.2,
                box: { x: 18, y: 22, width: 38, height: 44 }, // percentage of container
                color: "#E7A944",
                severity: "HIGH"
            },
            {
                id: "det-2",
                label: "Early Leaf Curl",
                confidence: 88.5,
                box: { x: 58, y: 35, width: 28, height: 32 },
                color: "#E7A944",
                severity: "MEDIUM"
            }
        ],
        agronomicInsight: "Canopy temperature +3.8°C above ambient. Visual curl confirms transpiration shutdown.",
        hydraulicCorrelation: "Corresponds directly to Pump P-09 pressure drop (-0.58 bar) in Zone 3 subsurface drip line.",
        action: "Initiate emergency 45-minute lateral line flush and inspect zone pressure regulator PR-03.",
        modelBenchmark: "YOLOv8s-CropDisease v1.2 (Benchmark Test Set)"
    },
    {
        id: "sample-02",
        title: "Sector Delta-7 Wheat Pivot — Fungal Leaf Rust",
        crop: "Durum Wheat (Triticum durum)",
        sectorId: "sector-delta-7",
        linkedPump: "P-02",
        imageOriginal: "/assets/sample_wheat_rust.jpg",
        imagePlaceholderText: "Wheat Pustule Rust Clusters",
        detections: [
            {
                id: "det-3",
                label: "Puccinia triticina (Brown Rust)",
                confidence: 91.8,
                box: { x: 30, y: 15, width: 45, height: 50 },
                color: "#D94C45",
                severity: "CRITICAL"
            }
        ],
        agronomicInsight: "High humidity microclimate under Center Pivot A has accelerated fungal sporulation.",
        hydraulicCorrelation: "Pump P-02 operating at 100% duty cycle continuously during evening hours without leaf dry-off intervals.",
        action: "Modify Pivot A schedule to 04:00 – 10:00 AM window to allow solar foliar evaporation. Apply triazole fungicide.",
        modelBenchmark: "YOLOv8s-CropDisease v1.2 (Benchmark Test Set)"
    },
    {
        id: "sample-03",
        title: "Sector Gamma-12 Maize Field — Optimal Vigorous Canopy",
        crop: "Field Corn (Zea mays)",
        sectorId: "sector-gamma-12",
        linkedPump: "P-15",
        imageOriginal: "/assets/sample_corn_healthy.jpg",
        imagePlaceholderText: "Healthy High-Chlorophyll Canopy",
        detections: [
            {
                id: "det-4",
                label: "Healthy Foliage (Vigor Index 0.88)",
                confidence: 97.4,
                box: { x: 10, y: 10, width: 80, height: 80 },
                color: "#173F35",
                severity: "OPTIMAL"
            }
        ],
        agronomicInsight: "Uniform green leaf area index (GLAI) 4.2. Zero signs of moisture deficit or pest infestation.",
        hydraulicCorrelation: "Intake Boosters P-15 and P-16 maintaining nominal 6.95 bar with optimal distribution uniformity.",
        action: "Maintain current irrigation prescription: 22 mm weekly depth.",
        modelBenchmark: "YOLOv8s-CropDisease v1.2 (Benchmark Test Set)"
    }
];

// RAG Technical Document Citations for AI Diagnostics
export const RAG_TECHNICAL_DOCUMENTS = [
    {
        id: "doc-grundfos-cr",
        title: "Grundfos CR Series Multi-Stage Pump Service & Engineering Manual",
        code: "GRUNDFOS-OM-CR95",
        section: "Section 4.3 — Mechanical Seal & High-Frequency Bearing Diagnosis",
        page: "Page 44 – 46",
        verifiedExcerpt: "Vibration velocities in excess of 4.5 mm/s RMS (ISO 10816 Class II) with prominent harmonics at 1,480 Hz indicate inner bearing race micro-pitting caused by inadequate Net Positive Suction Head (NPSH) margin or extreme throttling. Immediate reduction of shaft rotational speed via VFD to below 45 Hz is recommended to prevent thermal runaway and permanent shaft galling.",
        relevanceScore: 0.96
    },
    {
        id: "doc-iso-10816",
        title: "ISO 10816-3: Mechanical Vibration Evaluation on Non-Reciprocating Machines",
        code: "ISO-10816-3-CAT-II",
        section: "Table C.1 — Vibration Velocity Severity Limits (Medium Pumps 15kW–75kW)",
        page: "Page 12",
        verifiedExcerpt: "Zone A (< 1.8 mm/s): Vibration of newly commissioned machines. Zone B (1.8–4.5 mm/s): Machines normally considered acceptable for long-term unrestricted operation. Zone C (4.5–7.1 mm/s): Machines normally considered unsatisfactory for long-term continuous operation; maintenance required. Zone D (> 7.1 mm/s): Vibration severity sufficient to cause damage.",
        relevanceScore: 0.94
    },
    {
        id: "doc-ksb-megacpk",
        title: "KSB MegaCPK Standardized Chemical & Water Centrifugal Pumps",
        code: "KSB-TEC-CPK-REV4",
        section: "Section 7.1 — Cavitation Diagnostics and Volute Maintenance",
        page: "Page 88",
        verifiedExcerpt: "Cavitation within the impeller eye produces characteristic high-frequency crackling acoustic noise and erratic discharge pressure fluctuations. In continuous duty irrigation installations, cavitation accelerates erosion of the impeller vane inlet tips and results in premature fatigue of the radial guide bearings.",
        relevanceScore: 0.89
    }
];

// Work Orders Fixtures
export const WORK_ORDERS = [
    {
        id: "WO-904",
        pumpId: "P-04",
        title: "Emergency Bearing Replacement & Cavitation Inspection",
        priority: "P1_CRITICAL",
        status: "SCHEDULED",
        assignedTechnician: "Tariq Mansour (Senior Mechanical Tech)",
        estimatedDowntimeHours: 4.5,
        targetCompletion: "Tomorrow, 08:00 UTC",
        spareParts: ["SKF 6312 Deep Groove Ball Bearing", "Viton O-Ring Kit #CR95", "ISO VG 46 Synthetic Grease"],
        safetyRequirements: "LOTO Procedure Required (Main 380V Breaker CB-04 Lockout). Bleed suction line."
    },
    {
        id: "WO-902",
        pumpId: "P-05",
        title: "Mechanical Seal Gland Replacement",
        priority: "P2_HIGH",
        status: "IN_PROGRESS",
        assignedTechnician: "Ahmed El-Sayed",
        estimatedDowntimeHours: 2.0,
        targetCompletion: "Today, 16:00 UTC",
        spareParts: ["Burgmann Mechanical Seal MG1-50", "Silicon Carbide Face"],
        safetyRequirements: "Drain pump volute before loosening gland nuts."
    },
    {
        id: "WO-885",
        pumpId: "P-09",
        title: "Discharge Flange Gasket Renewal & Strainer Cleanout",
        priority: "P2_HIGH",
        status: "BACKLOG",
        assignedTechnician: "Unassigned",
        estimatedDowntimeHours: 1.5,
        targetCompletion: "Friday",
        spareParts: ["DN80 PN16 EPDM Flange Gasket", "M16 Galvanized Studs"],
        safetyRequirements: "Depressurize header manifold."
    },
    {
        id: "WO-870",
        pumpId: "P-01",
        title: "Annual Motor Insulation & Resistance Testing",
        priority: "P3_ROUTINE",
        status: "VERIFIED",
        assignedTechnician: "Mahmoud Hassan",
        estimatedDowntimeHours: 1.0,
        targetCompletion: "Completed Yesterday",
        spareParts: [],
        safetyRequirements: "Megger test completed. Insulation resistance > 250 MOhm."
    }
];

export const ACTIVITIES = [
    { time: "10:42 AM", type: "CRITICAL", text: "Pump P-04 exceeded ISO 10816 Zone C threshold (5.84 mm/s RMS).", actor: "Telemetry Monitor" },
    { time: "10:35 AM", type: "ACTION", text: "Automated VFD speed adjustment simulated on P-04 (reduced to 50 Hz).", actor: "Edge Controller" },
    { time: "09:15 AM", type: "OPTIMAL", text: "Sector Gamma-12 Canal intake lifts completed automated duty cycle transfer.", actor: "SCADA Gateway" },
    { time: "08:00 AM", type: "MAINTENANCE", text: "Work Order #WO-882 logged: Scheduled lubrication & seal replacement for P-05.", actor: "Lead Engineer" }
];

