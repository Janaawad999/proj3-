import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BrainCircuit, AlertTriangle, Clock, ArrowRight, 
    Sparkles, ShieldAlert, CheckCircle2, ChevronRight,
    Wrench, Calendar, Info, Layers, Activity, RefreshCw
} from 'lucide-react';
import { 
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, ReferenceLine, AreaChart, Area 
} from 'recharts';
import { 
    SMART_PUMPS, PUMP_04_RUL_DECAY_CURVE, 
    DATA_PROVENANCE, WORK_ORDERS 
} from '../services/agriPulseData';
import { pumpService } from '../services/api';

const PredictiveIntelligencePage = () => {
    const navigate = useNavigate();
    const [pumps, setPumps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadPumps = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await pumpService.getPumps();
            const list = res?.data || res?.pumps || res;
            if (Array.isArray(list) && list.length > 0) {
                setPumps(list);
            } else {
                setPumps(SMART_PUMPS);
            }
        } catch (err) {
            console.warn('Failed to load predictive telemetry:', err);
            setError(err?.userMessage || 'Could not load predictive telemetry');
            setPumps(SMART_PUMPS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPumps();
    }, []);

    const activePumps = (Array.isArray(pumps) && pumps.length > 0) ? pumps : SMART_PUMPS;

    // Ranked at-risk pumps (Urgency sorted)
    const atRiskPumps = activePumps
        .filter(p => p.status === 'CRITICAL' || p.status === 'WARNING')
        .sort((a, b) => (a.rulHours ?? 9999) - (b.rulHours ?? 9999));

    const [selectedPumpId, setSelectedPumpId] = useState('P-04');
    const fallbackPump = SMART_PUMPS.find(p => p.id === 'P-04') || activePumps[0] || {};
    const selectedPump = activePumps.find(p => p.id === selectedPumpId) || atRiskPumps[0] || activePumps[0] || fallbackPump;
    const setSelectedPump = (p) => setSelectedPumpId(p?.id || 'P-04');

    // Timeline intervention items
    const interventions = [
        {
            timeframe: "Immediate (0h – 12h)",
            pump: "P-04",
            action: "Throttle VFD to 45 Hz (-22% load) to prevent bearing thermal galling.",
            status: "RECOMMENDED",
            severity: "CRITICAL"
        },
        {
            timeframe: "Before 38h Limit (Friday 08:00 UTC)",
            pump: "P-04",
            action: "Deploy Technician for SKF 6312 Bearing Kit replacement & NPSH line inspection.",
            status: "SCHEDULED",
            severity: "CRITICAL"
        },
        {
            timeframe: "Next 96h Window",
            pump: "P-09",
            action: "Inspect DN80 Flange Gasket and clean suction mesh to restore 4.5 bar line pressure.",
            status: "PLANNED",
            severity: "WARNING"
        },
        {
            timeframe: "Routine Cycle (180h)",
            pump: "P-12",
            action: "Calibrate terminal voltage phase balance and clean contactor terminal oxidations.",
            status: "PLANNED",
            severity: "WARNING"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-7">
            {/* Header with Provenance Notice */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-5">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            RELIABILITY FORESIGHT WORKSPACE
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            {DATA_PROVENANCE?.dataSource || 'BENCHMARK_FIXTURE'}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Predictive Intelligence & RUL Analysis
                    </h1>
                    <p className="text-sm text-[#858A80] mt-1 max-w-2xl leading-relaxed">
                        Continuous failure mode forecasting based on ISO 10816 vibration severity and Weibull reliability degradation models.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => navigate('/diagnostics')}
                        className="agri-btn agri-btn-lime text-xs"
                    >
                        <Sparkles size={14} />
                        Run AI Diagnostic Query
                    </button>
                    <button
                        onClick={() => navigate('/maintenance')}
                        className="agri-btn agri-btn-outline text-xs"
                    >
                        <Wrench size={14} />
                        Manage Work Orders
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
                        onClick={loadPumps} 
                        className="underline font-bold text-xs flex items-center gap-1 hover:text-[#7A1511]"
                    >
                        <RefreshCw size={12} />
                        Retry
                    </button>
                </div>
            )}

            {/* Model Provenance Banner */}
            <div className="bg-[#EFEFE7] border border-[#D8D7CD] rounded-md p-3.5 flex items-start gap-3 text-xs text-[#555A52]">
                <Info size={16} className="text-[#173F35] flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    <strong className="text-[#173F35]">Data Integrity Notice:</strong> Measured telemetry values are benchmarked from continuous vibration transducers. 
                    Remaining Useful Life (RUL) projections are calculated via two-parameter Weibull failure probability modeling (\(\beta=2.4, \eta=1,850h\)). 
                    Operational recommendations represent rule-based predictive engineering synthesis.
                </div>
            </div>

            {/* Main Risk Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Ranked At-Risk Pumps (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                Ranked At-Risk Assets ({loading ? '...' : atRiskPumps.length})
                            </h3>
                            <span className="text-[0.68rem] font-mono text-[#D94C45] font-bold">
                                Sorted by Urgency
                            </span>
                        </div>

                        {loading ? (
                            <div className="space-y-3 mt-3">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="p-3 rounded-md bg-[#F6F5EF] animate-pulse space-y-2">
                                        <div className="h-4 w-3/4 bg-[#E8E7DF] rounded" />
                                        <div className="h-3 w-1/2 bg-[#E8E7DF] rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : atRiskPumps.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#858A80] space-y-2">
                                <CheckCircle2 size={24} className="mx-auto text-[#173F35]" />
                                <div>No critical or warning pump degradation detected.</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F6F5EF] mt-3 space-y-1">
                                {atRiskPumps.map((p, idx) => {
                                    const isSelected = (selectedPump?.id || '') === p.id;
                                    const displayName = p.name ? p.name.split('(')[0] : p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPump(p)}
                                            className={`w-full text-left p-3 rounded-md transition-all ${
                                                isSelected 
                                                    ? 'bg-[#173F35] text-white shadow-sm' 
                                                    : 'hover:bg-[#F6F5EF] text-[#252B28]'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem] font-bold font-mono ${
                                                        isSelected ? 'bg-[#C7F36B] text-[#173F35]' : 'bg-[#EFEFE7] text-[#555]'
                                                    }`}>
                                                        #{idx + 1}
                                                    </span>
                                                    <div>
                                                        <div className="font-extrabold text-xs">{p.id} — {displayName}</div>
                                                        <div className={`text-[0.68rem] ${isSelected ? 'text-[#DCE7D8]' : 'text-[#858A80]'}`}>
                                                            {p.model || 'Centrifugal Pump'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded ${
                                                    p.status === 'CRITICAL' 
                                                        ? 'bg-[#D94C45] text-white' 
                                                        : 'bg-[#E7A944] text-[#252B28]'
                                                }`}>
                                                    {p.status || 'WARNING'}
                                                </span>
                                            </div>

                                            <div className={`mt-2 text-xs font-medium ${isSelected ? 'text-[#C7F36B]' : 'text-[#D94C45]'}`}>
                                                Failure: {p.failureMode || 'Cavitation & Thermal Stress'}
                                            </div>

                                            <div className="mt-1.5 flex items-center justify-between text-[0.7rem] font-mono">
                                                <span className={isSelected ? 'text-[#DCE7D8]' : 'text-[#858A80]'}>
                                                    RUL: <strong className={isSelected ? 'text-white' : 'text-[#252B28]'}>{p.rulHours ?? '--'} Operating Hours</strong>
                                                </span>
                                                <span className={isSelected ? 'text-[#C7F36B]' : 'text-[#173F35]'}>
                                                    Health: {p.healthScore ?? '--'}%
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0EFEA] text-[0.72rem] text-[#858A80]">
                        Selected asset telemetry curve loaded on right panel.
                    </div>
                </div>

                {/* Right: RUL Degradation Curve & Failure Window (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Primary RUL Degradation Chart */}
                    <div className="bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#F0EFEA] gap-2">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                        Remaining Useful Life (RUL) Curve — {selectedPump?.name || 'Selected Asset'}
                                    </h3>
                                    <span className="text-[0.65rem] font-mono px-1.5 py-0.2 rounded bg-[#FDECEC] text-[#D94C45] font-bold">
                                        CRITICAL WINDOW: {selectedPump?.rulWindow || '38h – 48h operating window'}
                                    </span>
                                </div>
                                <p className="text-[0.72rem] text-[#858A80] mt-0.5">
                                    Weibull Reliability Decay (Health % vs Runtime Hours) • Current Runtime: {selectedPump?.cumulativeRuntimeHours ?? 6420}h
                                </p>
                            </div>

                            <span className="text-xs font-mono font-bold text-[#173F35] bg-[#DCE7D8] px-2 py-1 rounded">
                                {selectedPump?.failureMode || 'Bearing Degradation'}
                            </span>
                        </div>

                        {/* Recharts RUL Degradation */}
                        <div className="h-64 mt-4 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PUMP_04_RUL_DECAY_CURVE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="rulGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#173F35" stopOpacity="0.3" />
                                            <stop offset="95%" stopColor="#173F35" stopOpacity="0.0" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E6E5DC" vertical={false} />
                                    <XAxis dataKey="hoursRun" stroke="#858A80" fontSize={11} tickLine={false} unit="h" />
                                    <YAxis stroke="#858A80" fontSize={11} tickLine={false} unit="%" />
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
                                    <ReferenceLine 
                                        x={6420} 
                                        stroke="#D94C45" 
                                        strokeWidth={2}
                                        label={{ value: 'CURRENT (42% HLT)', fill: '#D94C45', fontSize: 10, position: 'top' }} 
                                    />
                                    <ReferenceLine 
                                        x={6458} 
                                        stroke="#E7A944" 
                                        strokeDasharray="3 3"
                                        label={{ value: '38h THRESHOLD', fill: '#E7A944', fontSize: 10, position: 'bottom' }} 
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="healthPercent" 
                                        stroke="#173F35" 
                                        strokeWidth={2.5}
                                        fillOpacity={1} 
                                        fill="url(#rulGrad)" 
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="baselineNominal" 
                                        stroke="#858A80" 
                                        strokeDasharray="4 4"
                                        strokeWidth={1.5}
                                        dot={false} 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Chart Footnote Details */}
                        <div className="mt-3 pt-3 border-t border-[#F0EFEA] flex flex-wrap items-center justify-between text-xs text-[#858A80] gap-2">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#D94C45]" />
                                <span>Steep drop indicates micro-spalling progression in bearing raceway.</span>
                            </span>
                            <span className="font-mono text-[#D94C45] font-bold">
                                Probability of Unscheduled Stoppage: 88%
                            </span>
                        </div>
                    </div>

                    {/* Prescribed Action & Required Spare Parts Card */}
                    <div className="bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                                <Wrench size={15} />
                                Evidence-Based Recommended Action Plan
                            </h3>
                            <span className="text-[0.68rem] font-mono font-bold text-[#D94C45] bg-[#FDECEC] px-2 py-0.5 rounded">
                                P1 URGENT
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                            <div className="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                                <div className="font-bold text-[#173F35] mb-1">Required Physical Spare Parts:</div>
                                <ul className="list-disc list-inside text-[#555A52] space-y-1 font-mono text-[0.72rem]">
                                    <li>SKF 6312 Deep Groove Ball Bearing (C3 Clearance)</li>
                                    <li>Viton Mechanical Seal Kit #CR95 (Burgmann)</li>
                                    <li>ISO VG 46 High-Load Synthetic Grease (150g)</li>
                                </ul>
                            </div>

                            <div className="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                                <div className="font-bold text-[#173F35] mb-1">Safety & Labor Estimate:</div>
                                <div className="text-[#555A52] space-y-1 leading-snug">
                                    <div><strong>Estimated Downtime:</strong> 4.5 Hours</div>
                                    <div><strong>Safety Protocol:</strong> Lockout/Tagout (LOTO) on Breaker CB-04</div>
                                    <div><strong>Assigned Tech:</strong> Tariq Mansour (Senior Mechanical)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. INTERACTIVE INTERVENTION TIMELINE */}
            <div className="bg-white border border-[#E6E5DC] rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#173F35]" />
                        <h3 className="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                            Prescriptive Intervention Timeline
                        </h3>
                    </div>
                    <span className="text-xs text-[#858A80]">
                        Gantt Maintenance Windows Before Predicted Failure Points
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    {interventions.map((item, idx) => (
                        <div 
                            key={idx}
                            className={`p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                                item.severity === 'CRITICAL' 
                                    ? 'bg-[#FDECEC]/50 border-[#F8B4B1]' 
                                    : 'bg-[#FDF4E6]/50 border-[#F5D8A3]'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[0.68rem] font-bold text-[#173F35] bg-[#DCE7D8] px-1.5 py-0.5 rounded">
                                        Target: {item.pump}
                                    </span>
                                    <span className={`text-[0.65rem] font-mono font-bold px-1.5 py-0.2 rounded ${
                                        item.severity === 'CRITICAL' ? 'bg-[#D94C45] text-white' : 'bg-[#E7A944] text-[#252B28]'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="font-bold text-[#252B28] mt-2 text-xs">
                                    {item.timeframe}
                                </div>
                                <p className="text-[#555A52] mt-1 text-[0.72rem] leading-relaxed">
                                    {item.action}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/maintenance')}
                                className="mt-3 pt-2 border-t border-black/10 text-[0.7rem] font-bold text-[#173F35] hover:underline flex items-center justify-between"
                            >
                                <span>Create Work Order</span>
                                <ArrowRight size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PredictiveIntelligencePage;
