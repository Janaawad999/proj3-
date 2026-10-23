import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    Activity, Sparkles, AlertTriangle, Clock, 
    ChevronRight, RefreshCw, CheckCircle2, Layers 
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip, ReferenceLine, Line 
} from 'recharts';
import PumpSchematic from '../components/digital-twin/PumpSchematic';
import { 
    SMART_PUMPS, INTELLIGENCE_BRIEFS, 
    DATA_PROVENANCE, PUMP_04_TIMESERIES, 
    ACTIVITIES 
} from '../services/agriPulseData';
import { pumpService } from '../services/api';

/**
 * HomePage — Overview Dashboard (Signature Screen)
 * 
 * Recreated from AgriPulse Living Intelligence design prototype:
 * - Editorial masthead with provenance tag and quick action CTAs
 * - Fleet Operational State KPI matrix with critical anomaly card and 3-color reliability bar
 * - Monitored Assets list with interactive selection
 * - Interactive CAD Digital Twin Centrifugal Pump SVG Schematic with probe readouts
 * - 24-Hour Telemetry Analysis chart with metric switcher tabs (Vibration, Temp, Pressure, Current)
 * - Intelligence Briefing with prescriptive RAG recommendations
 * - Chronological Activity Stream audit log
 */
const HomePage = () => {
    const navigate = useNavigate();
    const outletContext = useOutletContext();
    const selectedSector = outletContext?.selectedSector;

    const [pumps, setPumps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Selected target pump for Digital Twin CAD schematic
    const [selectedPumpId, setSelectedPumpId] = useState('P-04');

    // Selected sensor metric tab for 24h chart & schematic ('vibration' | 'temperature' | 'pressure' | 'current')
    const [selectedSensorMetric, setSelectedSensorMetric] = useState('vibration');

    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await pumpService.getPumps();
            const list = res?.data || res?.pumps || res;
            setPumps(Array.isArray(list) && list.length > 0 ? list : SMART_PUMPS);
        } catch (err) {
            console.warn('Failed to load dashboard data:', err);
            setError(err?.userMessage || 'Could not refresh telemetry data');
            setPumps(SMART_PUMPS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const allPumps = pumps.length > 0 ? pumps : SMART_PUMPS;

    // Filter active pumps if a sector is selected in the top navbar
    const activePumps = selectedSector 
        ? allPumps.filter(p => p.sectorId === selectedSector.id)
        : allPumps;

    // Active pump object for the CAD Schematic
    const activePump = activePumps.find(p => p.id === selectedPumpId) 
        || allPumps.find(p => p.id === selectedPumpId) 
        || activePumps[0] 
        || SMART_PUMPS[0];

    // Aggregated metrics
    const totalCount = activePumps.length || 1;
    const totalFlow = activePumps.reduce((acc, p) => acc + (p.metrics?.flowRate || 0), 0);
    const totalPower = activePumps.reduce((acc, p) => acc + (p.metrics?.powerKw || 0), 0);

    const healthyCount = activePumps.filter(p => p.status === 'HEALTHY' || p.status === 'STANDBY').length;
    const warningCount = activePumps.filter(p => p.status === 'WARNING').length;
    const criticalCount = activePumps.filter(p => p.status === 'CRITICAL').length;

    const healthyPct = Math.round((healthyCount / totalCount) * 100);
    const warningPct = Math.round((warningCount / totalCount) * 100);
    const criticalPct = Math.round((criticalCount / totalCount) * 100);

    // Metric key mapping for timeseries chart
    const metricDataKeyMap = {
        vibration: 'vibration',
        temperature: 'temp',
        pressure: 'pressure',
        current: 'current'
    };
    const currentDataKey = metricDataKeyMap[selectedSensorMetric] || 'vibration';

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* 1. EDITORIAL MASTHEAD */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            AUTONOMOUS FLEET RADAR
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            {DATA_PROVENANCE?.dataSource || 'SIMULATED_BENCHMARK_FIXTURE'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#173F35] tracking-tight">
                        Your irrigation network, in focus.
                    </h1>
                    <p className="text-xs md:text-sm text-[#858A80] mt-1 max-w-2xl leading-relaxed">
                        Continuous mechanical telemetry, cavitation forecasting, and automated hydraulic balance across{' '}
                        <strong className="text-[#252B28]">
                            {selectedSector ? selectedSector.name : 'All 3 Irrigation Sectors (18 Smart Pumps)'}
                        </strong>.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate('/predictive')} 
                        className="agri-btn agri-btn-lime text-xs"
                    >
                        <Sparkles size={14} />
                        <span>Failure Forecast</span>
                    </button>
                    <button 
                        onClick={() => navigate('/operations')} 
                        className="agri-btn agri-btn-outline text-xs bg-white"
                    >
                        <Activity size={14} />
                        <span>Fleet Matrix</span>
                    </button>
                </div>
            </div>

            {/* Error Notification Banner */}
            {error && (
                <div className="p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-lg text-xs text-[#9E1F1A] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={15} />
                        <span>{error}</span>
                    </div>
                    <button 
                        onClick={loadDashboardData} 
                        className="underline font-bold text-xs flex items-center gap-1 hover:text-[#7A1511]"
                    >
                        <RefreshCw size={12} />
                        Retry
                    </button>
                </div>
            )}

            {/* 2. FLEET STATUS & HEALTH COMPOSITION (8 cols + 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Operational State KPIs & Critical Card (8 cols) */}
                <div className="lg:col-span-8 agri-card flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#173F35]"></span>
                                Fleet Operational State
                            </h3>
                            <span className="text-xs font-mono text-[#858A80]">
                                Total Load: {totalPower.toFixed(1)} kW
                            </span>
                        </div>

                        {/* Top KPI Metric Numbers */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                            <div>
                                <div className="text-[0.68rem] uppercase font-semibold text-[#858A80]">Monitored Assets</div>
                                <div className="text-2xl font-extrabold text-[#173F35] font-mono mt-0.5">
                                    {totalCount} <span className="text-xs text-[#858A80] font-normal">Pumps</span>
                                </div>
                                <div className="text-[0.68rem] text-[#858A80]">3 Sectors Active</div>
                            </div>
                            <div>
                                <div className="text-[0.68rem] uppercase font-semibold text-[#858A80]">Total Delivery</div>
                                <div className="text-2xl font-extrabold text-[#173F35] font-mono mt-0.5">
                                    {totalFlow.toLocaleString()} <span className="text-xs text-[#858A80] font-normal">L/min</span>
                                </div>
                                <div className="text-[0.68rem] text-[#173F35] font-semibold">92% Target Flow</div>
                            </div>
                            <div>
                                <div className="text-[0.68rem] uppercase font-semibold text-[#2E7D32]">Optimal Units</div>
                                <div className="text-2xl font-extrabold text-[#2E7D32] font-mono mt-0.5">{healthyCount}</div>
                                <div className="text-[0.68rem] text-[#2E7D32] font-semibold">{healthyPct}% Healthy</div>
                            </div>
                            <div>
                                <div className="text-[0.68rem] uppercase font-semibold text-[#D94C45]">Urgent Intervention</div>
                                <div className="text-2xl font-extrabold text-[#D94C45] font-mono mt-0.5">
                                    {criticalCount} <span className="text-xs font-normal text-[#858A80]">unit</span>
                                </div>
                                <div className="text-[0.68rem] text-[#D94C45] font-semibold">P-04 Cavitation</div>
                            </div>
                        </div>

                        {/* Critical Alert Card */}
                        <div className="bg-[#FDECEC] border border-[#F8B4B1] rounded-md p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="text-[#D94C45] mt-0.5 flex-shrink-0" />
                                <div className="text-xs">
                                    <div className="font-bold text-[#9E1F1A] flex flex-wrap items-center gap-2">
                                        <span>CRITICAL ANOMALY: Pump P-04 Bearing Cavitation</span>
                                        <span className="font-mono text-[0.7rem] bg-[#FAD9D7] px-1.5 py-0.2 rounded text-[#8A1612]">
                                            RUL: 38 Operating Hours
                                        </span>
                                    </div>
                                    <p className="text-[#7A1C18] mt-1 leading-relaxed text-[0.75rem]">
                                        Vibration RMS reached 5.84 mm/s at 1.48 kHz harmonic peak. Risk of inner raceway micro-spalling. Immediate VFD throttle to 45 Hz recommended.
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedPumpId('P-04');
                                    navigate('/predictive');
                                }} 
                                className="px-3 py-1.5 rounded bg-[#D94C45] text-white font-bold text-[0.7rem] hover:bg-[#B33832] transition-colors flex-shrink-0 self-end sm:self-auto"
                            >
                                Inspect Risk
                            </button>
                        </div>
                    </div>

                    {/* Fleet Reliability Proportion Bar */}
                    <div className="mt-4 pt-3 border-t border-[#F0EFEA]">
                        <div className="flex justify-between text-xs font-semibold text-[#858A80] mb-1.5">
                            <span>Fleet Reliability Proportion</span>
                            <span className="font-mono text-[0.7rem]">
                                {healthyPct}% Optimal • {warningPct}% Caution • {criticalPct}% Urgent
                            </span>
                        </div>
                        <div className="h-2.5 w-full bg-[#EFEFE7] rounded-full overflow-hidden flex">
                            <div style={{ width: `${healthyPct}%` }} className="bg-[#173F35] transition-all duration-500" title="Healthy"></div>
                            <div style={{ width: `${warningPct}%` }} className="bg-[#E7A944] transition-all duration-500" title="Warning"></div>
                            <div style={{ width: `${criticalPct}%` }} className="bg-[#D94C45] transition-all duration-500" title="Critical"></div>
                        </div>
                    </div>
                </div>

                {/* Right: Monitored Assets Switcher List (4 cols) */}
                <div className="lg:col-span-4 agri-card flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                Monitored Assets ({activePumps.length})
                            </h3>
                            <span className="text-[0.68rem] text-[#858A80] font-mono">Click to inspect</span>
                        </div>

                        <div className="divide-y divide-[#F6F5EF] max-h-72 overflow-y-auto mt-2 space-y-1">
                            {activePumps.map(pump => {
                                const isSelected = pump.id === selectedPumpId;
                                const displayName = pump.name ? pump.name.split('(')[0] : pump.id;

                                return (
                                    <button
                                        key={pump.id}
                                        type="button"
                                        onClick={() => setSelectedPumpId(pump.id)}
                                        className={`w-full text-left p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                                            isSelected ? 'bg-[#173F35] text-white shadow-xs' : 'hover:bg-[#F6F5EF] text-[#252B28]'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                pump.status === 'CRITICAL' ? 'bg-[#D94C45]' :
                                                pump.status === 'WARNING' ? 'bg-[#E7A944]' : 'bg-[#C7F36B]'
                                            }`}></span>
                                            <div className="min-w-0 truncate">
                                                <div className="font-bold text-xs truncate">
                                                    {pump.id} — {displayName}
                                                </div>
                                                <div className={`text-[0.68rem] font-mono truncate ${isSelected ? 'text-[#DCE7D8]' : 'text-[#858A80]'}`}>
                                                    {pump.metrics?.flowRate} L/min • {pump.metrics?.dischargePressure} bar
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`text-[0.65rem] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ml-2 ${
                                            isSelected ? 'bg-[#C7F36B] text-[#173F35]' : 'bg-[#EFEFE7] text-[#555]'
                                        }`}>
                                            {pump.healthScore}%
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-3 border-t border-[#F0EFEA] text-xs text-[#858A80] flex justify-between">
                        <span>Digital Twin Target:</span>
                        <span className="font-mono font-bold text-[#173F35]">{activePump.id}</span>
                    </div>
                </div>
            </div>

            {/* 3. SIGNATURE PUMP CAD SCHEMATIC VISUALIZATION */}
            <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-[#173F35]">
                            CAD Digital Twin Schematic & Telemetry Probes
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            Focus: {activePump.name}
                        </span>
                    </div>
                    <span className="text-[0.7rem] text-[#858A80]">
                        Click on probes (VIB, TEMP, BAR, AMPS) to view live readings
                    </span>
                </div>

                <PumpSchematic 
                    pump={activePump} 
                    activeMetric={selectedSensorMetric} 
                    onSelectMetric={(m) => setSelectedSensorMetric(m)} 
                />
            </div>

            {/* 4. 24-HOUR TELEMETRY CHART & INTELLIGENCE BRIEFING */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* 24h Telemetry Chart (7 cols) */}
                <div className="lg:col-span-7 agri-card space-y-3">
                    <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#F0EFEA] gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                    24-Hour Telemetry Analysis
                                </h3>
                                <span className="text-[0.68rem] font-mono px-1.5 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                                    ISO 10816 CLASS II
                                </span>
                            </div>
                            <p className="text-[0.7rem] text-[#858A80] mt-0.5">
                                Parameter: <strong className="text-[#173F35] uppercase">{selectedSensorMetric}</strong> on {activePump.id}
                            </p>
                        </div>

                        {/* Metric Switcher Tabs */}
                        <div className="flex gap-1 bg-[#EFEFE7] p-1 rounded text-[0.7rem] font-semibold">
                            {[
                                { id: 'vibration', label: 'Vibration' },
                                { id: 'temperature', label: 'Temp' },
                                { id: 'pressure', label: 'Pressure' },
                                { id: 'current', label: 'Current' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setSelectedSensorMetric(tab.id)}
                                    className={`px-2 py-0.5 rounded transition-all ${
                                        selectedSensorMetric === tab.id 
                                            ? 'bg-[#173F35] text-white shadow-xs' 
                                            : 'text-[#555] hover:text-[#173F35]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Recharts Area Curve */}
                    <div className="h-60 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={PUMP_04_TIMESERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop 
                                            offset="5%" 
                                            stopColor={selectedSensorMetric === 'vibration' ? '#D94C45' : '#173F35'} 
                                            stopOpacity={0.25} 
                                        />
                                        <stop 
                                            offset="95%" 
                                            stopColor={selectedSensorMetric === 'vibration' ? '#D94C45' : '#173F35'} 
                                            stopOpacity={0.0} 
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E6E5DC" vertical={false} />
                                <XAxis dataKey="time" stroke="#858A80" fontSize={11} tickLine={false} />
                                <YAxis stroke="#858A80" fontSize={11} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#102D27', 
                                        border: '1px solid #1C4B40',
                                        borderRadius: '6px',
                                        color: '#FFFFFF',
                                        fontSize: '12px',
                                        fontFamily: 'monospace'
                                    }} 
                                />
                                {selectedSensorMetric === 'vibration' && (
                                    <ReferenceLine 
                                        y={4.5} 
                                        stroke="#D94C45" 
                                        strokeDasharray="3 3"
                                        label={{ value: 'ISO ZONE C (4.5 mm/s)', fill: '#D94C45', fontSize: 10, position: 'right' }} 
                                    />
                                )}
                                <Area 
                                    type="monotone" 
                                    dataKey={currentDataKey} 
                                    stroke={selectedSensorMetric === 'vibration' ? '#D94C45' : '#173F35'} 
                                    strokeWidth={2.5}
                                    fillOpacity={1} 
                                    fill="url(#metricGrad)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="pt-2 border-t border-[#F0EFEA] flex justify-between text-xs text-[#858A80]">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#D94C45]"></span>
                            <span>12:00 UTC: Vibration breached ISO 10816 Zone C alert limit (4.5 mm/s)</span>
                        </span>
                        <span className="font-mono text-[#D94C45] font-bold">Peak: 5.88 mm/s</span>
                    </div>
                </div>

                {/* Intelligence Briefing (5 cols) */}
                <div className="lg:col-span-5 agri-card flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                                <Sparkles size={14} className="text-[#173F35]" />
                                Intelligence Briefing
                            </h3>
                            <span className="text-[0.68rem] font-mono px-1.5 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                                RAG EVIDENCE
                            </span>
                        </div>

                        <div className="space-y-3 mt-3">
                            {INTELLIGENCE_BRIEFS.slice(0, 3).map(b => (
                                <div key={b.id} className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC] text-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-[#252B28] flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${b.severity === 'CRITICAL' ? 'bg-[#D94C45]' : 'bg-[#E7A944]'}`}></span>
                                            {b.title}
                                        </div>
                                        <span className="font-mono text-[0.65rem] font-bold bg-[#DCE7D8] text-[#173F35] px-1.5 py-0.5 rounded">
                                            {b.pumpId}
                                        </span>
                                    </div>
                                    <p className="text-[#555A52] text-[0.72rem] mt-1 leading-snug">
                                        {b.summary}
                                    </p>
                                    <div className="mt-2 text-[0.7rem] bg-white p-1.5 rounded border border-[#E6E5DC] text-[#173F35]">
                                        <strong>Prescription:</strong> {b.recommendedAction || b.recommendation}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/diagnostics')} 
                        className="mt-4 w-full py-2 rounded bg-[#173F35] text-white font-bold text-xs hover:bg-[#12332B] transition-colors flex items-center justify-center gap-1.5"
                    >
                        <span>Open Technical AI Diagnostics</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* 5. CHRONOLOGICAL ACTIVITY STREAM */}
            <div className="agri-card">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                    <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                        <Clock size={14} className="text-[#173F35]" />
                        Chronological Activity Stream
                    </h3>
                    <span className="text-xs text-[#858A80]">Continuous Telemetry Event Audit</span>
                </div>

                <div className="divide-y divide-[#F6F5EF] mt-2">
                    {ACTIVITIES.map((a, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between text-xs flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-[0.7rem] text-[#858A80] w-16">{a.time}</span>
                                <span className={`text-[0.65rem] font-mono font-bold px-1.5 py-0.2 rounded ${
                                    a.type === 'CRITICAL' ? 'bg-[#D94C45] text-white' :
                                    a.type === 'ACTION' ? 'bg-[#E7A944] text-[#252B28]' :
                                    a.type === 'MAINTENANCE' ? 'bg-[#173F35] text-white' :
                                    'bg-[#DCE7D8] text-[#173F35]'
                                }`}>
                                    {a.type}
                                </span>
                                <span className="text-[#252B28] font-medium">{a.text}</span>
                            </div>
                            <span className="text-[0.7rem] text-[#858A80] font-mono">{a.actor}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
