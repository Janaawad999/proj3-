import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, Search, Filter, AlertTriangle, CheckCircle2, 
    X, Sliders, Play, Square, Gauge, Thermometer, 
    Zap, Droplets, Info, ShieldAlert, ArrowUpDown,
    RefreshCw
} from 'lucide-react';
import { SMART_PUMPS, IRRIGATION_SECTORS, DATA_PROVENANCE } from '../services/agriPulseData';
import { pumpService, dashboardService } from '../services/api';

const LiveOperationsPage = () => {
    const navigate = useNavigate();
    const [pumps, setPumps] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sectorFilter, setSectorFilter] = useState('ALL');
    const [selectedPump, setSelectedPump] = useState(null);

    // Simulated equipment control state
    const [simulatedFrequency, setSimulatedFrequency] = useState(50.0);
    const [simulatedPumpRunning, setSimulatedPumpRunning] = useState(true);
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const [safetyModalAction, setSafetyModalAction] = useState('');

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [pumpsRes, sectorsRes] = await Promise.all([
                pumpService.getPumps(),
                dashboardService.getSectors()
            ]);
            const pumpsList = pumpsRes.data || pumpsRes.pumps || pumpsRes;
            const sectorsList = sectorsRes.data || sectorsRes;
            setPumps(Array.isArray(pumpsList) ? pumpsList : SMART_PUMPS);
            setSectors(Array.isArray(sectorsList) ? sectorsList : IRRIGATION_SECTORS);
        } catch (err) {
            console.warn('Failed to load fleet data:', err);
            setError(err.userMessage || 'Could not load fleet telemetry');
            setPumps(SMART_PUMPS);
            setSectors(IRRIGATION_SECTORS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const activePumps = pumps.length > 0 ? pumps : SMART_PUMPS;
    const activeSectors = sectors.length > 0 ? sectors : IRRIGATION_SECTORS;

    // Filter logic
    const filteredPumps = activePumps.filter(p => {
        const matchesSearch = p.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        const matchesSector = sectorFilter === 'ALL' || p.sectorId === sectorFilter;
        return matchesSearch && matchesStatus && matchesSector;
    });

    const handleControlClick = (actionName) => {
        setSafetyModalAction(actionName);
        setShowSafetyModal(true);
    };

    const confirmSimulatedAction = () => {
        if (safetyModalAction === 'TOGGLE_RUN') {
            setSimulatedPumpRunning(!simulatedPumpRunning);
        }
        setShowSafetyModal(false);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            INDUSTRIAL SCADA MONITORING
                        </span>
                        <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            {DATA_PROVENANCE.dataSource}
                        </span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Live Fleet Operations
                    </h1>
                    <p className="text-sm text-[#858A80] mt-0.5">
                        High-information telemetry matrix across all 18 smart irrigation pumps.
                    </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-white border border-[#D8D7CD] text-[#173F35] font-bold">
                        Total Online: 16 / 18
                    </span>
                    <span className="px-2.5 py-1 rounded bg-[#FDECEC] border border-[#F8B4B1] text-[#D94C45] font-bold">
                        Critical: 1
                    </span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-[#E6E5DC] rounded-lg p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search size={15} className="absolute left-3 top-2.5 text-[#858A80]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter by Pump ID, name, or model..."
                        className="w-full pl-9 pr-3 py-1.5 rounded-md border border-[#D8D7CD] text-xs focus:outline-none focus:border-[#173F35]"
                    />
                </div>

                {/* Dropdown Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[#858A80]">Sector:</span>
                        <select
                            value={sectorFilter}
                            onChange={(e) => setSectorFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded border border-[#D8D7CD] bg-white font-medium text-xs text-[#252B28]"
                        >
                            <option value="ALL">All Sectors</option>
                            {activeSectors.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[#858A80]">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-2.5 py-1.5 rounded border border-[#D8D7CD] bg-white font-medium text-xs text-[#252B28]"
                        >
                            <option value="ALL">All States</option>
                            <option value="CRITICAL">Critical Alarms</option>
                            <option value="WARNING">Warning</option>
                            <option value="HEALTHY">Healthy</option>
                            <option value="STANDBY">Standby</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-lg text-xs text-[#9E1F1A] flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={loadData} className="underline font-bold text-xs flex items-center gap-1">
                        <RefreshCw size={12} />
                        Retry
                    </button>
                </div>
            )}

            {/* Operations Table */}
            <div className="bg-white border border-[#E6E5DC] rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#E6E5DC] bg-[#F6F5EF] text-[#173F35] font-extrabold uppercase tracking-wider text-[0.68rem]">
                                <th className="p-3">Pump ID</th>
                                <th className="p-3">Model & Location</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Flow (L/min)</th>
                                <th className="p-3 text-right">Pressure (bar)</th>
                                <th className="p-3 text-right">Vibration (mm/s)</th>
                                <th className="p-3 text-right">Temp (°C)</th>
                                <th className="p-3 text-right">Current (A)</th>
                                <th className="p-3 text-center">Health</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EFEA] font-mono">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(n => (
                                    <tr key={n} className="animate-pulse">
                                        <td colSpan={10} className="p-4 bg-[#FAF9F5]">
                                            <div className="h-4 bg-[#EFEFE7] rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredPumps.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="p-8 text-center text-[#858A80] font-sans">
                                        <Activity size={28} className="mx-auto mb-2 text-[#858A80]" />
                                        <div className="font-semibold text-xs text-[#252B28]">No pump telemetry records found</div>
                                        <div className="text-[0.68rem] text-[#858A80] mt-1">
                                            No pumps match the selected query or filters.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPumps.map((pump) => {
                                const isCritical = pump.status === 'CRITICAL';
                                const isWarning = pump.status === 'WARNING';
                                return (
                                    <tr 
                                        key={pump.id}
                                        onClick={() => setSelectedPump(pump)}
                                        className="hover:bg-[#F6F5EF] cursor-pointer transition-colors"
                                    >
                                        <td className="p-3 font-bold text-[#173F35]">
                                            {pump.id}
                                        </td>
                                        <td className="p-3 font-sans">
                                            <div className="font-bold text-[#252B28]">{pump.name}</div>
                                            <div className="text-[0.68rem] text-[#858A80]">{pump.model}</div>
                                        </td>
                                        <td className="p-3 font-sans">
                                            <span className={`inline-block text-[0.65rem] font-bold px-2 py-0.5 rounded ${
                                                isCritical ? 'bg-[#FDECEC] text-[#D94C45] border border-[#F8B4B1]' :
                                                isWarning ? 'bg-[#FDF4E6] text-[#925805] border border-[#F5D8A3]' :
                                                pump.status === 'STANDBY' ? 'bg-[#ECEBE4] text-[#666]' :
                                                'bg-[#DCE7D8] text-[#173F35]'
                                            }`}>
                                                {pump.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right text-[#252B28]">
                                            {pump.metrics.flowRate}
                                        </td>
                                        <td className="p-3 text-right text-[#252B28]">
                                            {pump.metrics.dischargePressure.toFixed(2)}
                                        </td>
                                        <td className={`p-3 text-right font-bold ${
                                            pump.metrics.vibrationRms > 4.5 ? 'text-[#D94C45]' : 'text-[#252B28]'
                                        }`}>
                                            {pump.metrics.vibrationRms.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right text-[#252B28]">
                                            {pump.metrics.casingTemp.toFixed(1)}
                                        </td>
                                        <td className="p-3 text-right text-[#252B28]">
                                            {pump.metrics.motorCurrent.toFixed(1)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="font-bold text-xs text-[#173F35]">
                                                {pump.healthScore}%
                                            </span>
                                        </td>
                                        <td className="p-3 text-center font-sans">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPump(pump);
                                                }}
                                                className="text-[0.7rem] font-bold text-[#173F35] hover:underline"
                                            >
                                                Inspect
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Slide-out Pump Inspection Drawer */}
            {selectedPump && (
                <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#D8D7CD] shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <div>
                                <span className="text-[0.68rem] font-mono text-[#858A80] uppercase tracking-wider font-extrabold">
                                    PUMP INSPECTION & TELEMETRY
                                </span>
                                <h2 className="text-xl font-extrabold text-[#173F35]">
                                    {selectedPump.name}
                                </h2>
                            </div>
                            <button
                                onClick={() => setSelectedPump(null)}
                                className="p-1 rounded hover:bg-[#F6F5EF] text-[#858A80]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Status Alert Banner */}
                        {selectedPump.status === 'CRITICAL' && (
                            <div className="mt-4 p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded-md text-xs text-[#9E1F1A]">
                                <strong>Critical Advisory:</strong> {selectedPump.failureMode}. Vibration velocity is currently at 
                                {selectedPump.metrics.vibrationRms} mm/s RMS (exceeding ISO 10816 limit 4.5 mm/s).
                            </div>
                        )}

                        {/* Gauges Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
                            <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                <div className="text-[0.68rem] text-[#858A80] font-sans">Discharge Pressure</div>
                                <div className="text-lg font-bold text-[#173F35] mt-1">
                                    {selectedPump.metrics.dischargePressure} <span className="text-xs font-normal">bar</span>
                                </div>
                            </div>

                            <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                <div className="text-[0.68rem] text-[#858A80] font-sans">Flow Delivery</div>
                                <div className="text-lg font-bold text-[#173F35] mt-1">
                                    {selectedPump.metrics.flowRate} <span className="text-xs font-normal">L/min</span>
                                </div>
                            </div>

                            <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                <div className="text-[0.68rem] text-[#858A80] font-sans">Vibration Velocity</div>
                                <div className={`text-lg font-bold mt-1 ${
                                    selectedPump.metrics.vibrationRms > 4.5 ? 'text-[#D94C45]' : 'text-[#173F35]'
                                }`}>
                                    {selectedPump.metrics.vibrationRms} <span className="text-xs font-normal">mm/s</span>
                                </div>
                            </div>

                            <div className="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                                <div className="text-[0.68rem] text-[#858A80] font-sans">Motor Casing Temp</div>
                                <div className="text-lg font-bold text-[#173F35] mt-1">
                                    {selectedPump.metrics.casingTemp} <span className="text-xs font-normal">°C</span>
                                </div>
                            </div>
                        </div>

                        {/* ================= SAFE EQUIPMENT CONTROLS ================= */}
                        <div className="mt-6 pt-4 border-t border-[#F0EFEA] space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Sliders size={15} className="text-[#173F35]" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#173F35]">
                                        Actuator & VFD Controls
                                    </h4>
                                </div>
                                <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-[#FDF4E6] text-[#925805] font-bold border border-[#F5D8A3]">
                                    DEMO CONTROL
                                </span>
                            </div>

                            <div className="p-3 rounded-lg bg-[#ECEBE4]/50 border border-[#D5D4CA] text-[0.72rem] text-[#555A52]">
                                <strong className="text-[#173F35]">Safety Notice:</strong> No physical actuator or SCADA relay is connected. 
                                Adjusting these controls modifies simulated software state only and will not energize field contactors.
                            </div>

                            {/* VFD Frequency Slider */}
                            <div>
                                <div className="flex justify-between text-xs font-semibold mb-1">
                                    <span>VFD Inverter Frequency:</span>
                                    <span className="font-mono text-[#173F35] font-bold">{simulatedFrequency.toFixed(1)} Hz</span>
                                </div>
                                <input
                                    type="range"
                                    min="30"
                                    max="60"
                                    step="0.5"
                                    value={simulatedFrequency}
                                    onChange={(e) => setSimulatedFrequency(parseFloat(e.target.value))}
                                    className="w-full accent-[#173F35] cursor-pointer"
                                />
                                <div className="flex justify-between text-[0.65rem] text-[#858A80] font-mono mt-0.5">
                                    <span>30 Hz (Min Head)</span>
                                    <span>50 Hz (Rated)</span>
                                    <span>60 Hz (Over-speed)</span>
                                </div>
                            </div>

                            {/* Motor Start / Stop Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleControlClick('TOGGLE_RUN')}
                                    className={`flex-1 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                                        simulatedPumpRunning 
                                            ? 'bg-[#D94C45] hover:bg-[#B33832] text-white' 
                                            : 'bg-[#173F35] hover:bg-[#113129] text-white'
                                    }`}
                                >
                                    {simulatedPumpRunning ? <Square size={13} /> : <Play size={13} />}
                                    <span>{simulatedPumpRunning ? "Simulate Motor Trip / Stop" : "Simulate Motor Start"}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#F0EFEA] flex gap-2">
                        <button
                            onClick={() => navigate('/predictive')}
                            className="flex-1 py-2 rounded bg-[#173F35] text-white text-xs font-bold hover:bg-[#113129]"
                        >
                            View RUL Forecast
                        </button>
                        <button
                            onClick={() => navigate('/diagnostics')}
                            className="flex-1 py-2 rounded bg-[#C7F36B] text-[#173F35] text-xs font-bold hover:bg-[#B5E655]"
                        >
                            AI Diagnosis
                        </button>
                    </div>
                </div>
            )}

            {/* Safety Confirmation Dialog for Simulated Equipment Controls */}
            {showSafetyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-sm w-full p-5 border border-[#D8D7CD] shadow-2xl space-y-3">
                        <div className="flex items-center gap-2 text-[#D94C45] font-bold text-sm">
                            <ShieldAlert size={18} />
                            <span>Confirm Simulated Control Action</span>
                        </div>
                        <p className="text-xs text-[#555A52] leading-relaxed">
                            You are requesting a simulated motor state change for <strong>{selectedPump?.name}</strong>. 
                            This is an authorized prototype demonstration. Physical plant safety interlocks are not engaged.
                        </p>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setShowSafetyModal(false)}
                                className="px-3 py-1.5 rounded border border-[#D8D7CD] text-xs font-semibold hover:bg-[#F6F5EF]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSimulatedAction}
                                className="px-3 py-1.5 rounded bg-[#173F35] text-white text-xs font-bold hover:bg-[#113129]"
                            >
                                Confirm Simulation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveOperationsPage;
