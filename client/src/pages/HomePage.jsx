import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
    Activity, AlertTriangle, CheckCircle2, ChevronRight, 
    Droplets, Gauge, Info, Layers, RefreshCw, 
    Sparkles, Thermometer, Wrench, Zap, ExternalLink,
    ArrowUpRight, ShieldCheck, Clock, ArrowRight,
    ScanEye, BrainCircuit, Play, Check
} from 'lucide-react';
import LivingSystemPulse from '../components/LivingSystemPulse';
import { 
    SMART_PUMPS, INTELLIGENCE_BRIEFS, 
    DATA_PROVENANCE, IRRIGATION_SECTORS 
} from '../services/agriPulseData';

const HomePage = () => {
    const navigate = useNavigate();
    const outletContext = useOutletContext();
    const selectedSector = outletContext?.selectedSector;
    const onSelectSector = outletContext?.onSelectSector;
    const onInvestigateAlert = outletContext?.onInvestigateAlert;
    const onOpenOnboarding = outletContext?.onOpenOnboarding;

    // Filter active pumps by selected sector if filtered
    const activePumps = selectedSector 
        ? SMART_PUMPS.filter(p => p.sectorId === selectedSector.id)
        : SMART_PUMPS;

    // Fleet Health calculations
    const totalPumps = activePumps.length;
    const criticalCount = activePumps.filter(p => p.status === 'CRITICAL').length;
    const warningCount = activePumps.filter(p => p.status === 'WARNING').length;
    const healthyCount = activePumps.filter(p => p.status === 'HEALTHY' || p.status === 'STANDBY').length;

    const healthyPct = Math.round((healthyCount / totalPumps) * 100);
    const warningPct = Math.round((warningCount / totalPumps) * 100);
    const criticalPct = Math.round((criticalCount / totalPumps) * 100);

    const totalFlow = activePumps.reduce((acc, p) => acc + (p.metrics?.flowRate || 0), 0);
    const totalPower = activePumps.reduce((acc, p) => acc + (p.metrics?.powerKw || 0), 0);

    // Urgent pump for Question 2
    const urgentPump = SMART_PUMPS.find(p => p.id === 'P-04') || SMART_PUMPS[0];

    // Predictive failure candidates for Question 3
    const atRiskPumps = [
        {
            id: "P-04",
            name: "Pump P-04 (Zone 2)",
            sector: "Sector Delta-7",
            status: "CRITICAL",
            rulHours: 38,
            mode: "Bearing Cavitation & Galling",
            probability: 89,
            urgency: "Immediate (0h – 12h)"
        },
        {
            id: "P-09",
            name: "Pump P-09 (Intake Booster)",
            sector: "Sector Alpha-3",
            status: "WARNING",
            rulHours: 96,
            mode: "DN80 Flange Gasket Seal Degradation",
            probability: 64,
            urgency: "Next 96h Window"
        },
        {
            id: "P-12",
            name: "Pump P-12 (Main Line)",
            sector: "Sector Gamma-12",
            status: "WARNING",
            rulHours: 180,
            mode: "Contactor Terminal Phase Imbalance",
            probability: 42,
            urgency: "Routine Cycle"
        },
        {
            id: "P-01",
            name: "Pump P-01 (Primary Intake)",
            sector: "Sector Delta-7",
            status: "HEALTHY",
            rulHours: 2400,
            mode: "Nominal Running State",
            probability: 4,
            urgency: "Long-term (2,400h)"
        }
    ];

    // Actionable steps for Question 4
    const [completedSteps, setCompletedSteps] = useState({});
    const toggleStep = (stepId) => {
        setCompletedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 select-none">
            {/* 1. WELCOMING MOBILE-FIRST HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[0.65rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#173F35] text-[#C7F36B]">
                            LIVING INTELLIGENCE
                        </span>
                        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded-full bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                            {DATA_PROVENANCE.dataSource}
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#173F35] tracking-tight">
                        Your irrigation network, in focus.
                    </h1>
                    <p className="text-xs sm:text-sm text-[#858A80] mt-1 max-w-xl leading-relaxed">
                        Continuous mechanical vitality, cavitation forecasting, and automated hydraulic balance across{" "}
                        <strong className="text-[#252B28]">
                            {selectedSector ? selectedSector.name : "All 3 Irrigation Sectors (18 Smart Pumps)"}
                        </strong>.
                    </p>
                </div>

                {/* Quick actions for tablet/desktop */}
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={() => navigate('/diagnostics')}
                        className="agri-btn agri-btn-lime text-xs py-2 px-3.5 shadow-xs"
                    >
                        <Sparkles size={14} />
                        Ask AI Copilot
                    </button>
                    <button
                        onClick={() => navigate('/operations')}
                        className="agri-btn agri-btn-outline text-xs py-2 px-3.5 bg-white"
                    >
                        <Activity size={14} />
                        Fleet Matrix
                    </button>
                </div>
            </div>

            {/* 2. QUESTION 1: "IS MY IRRIGATION SYSTEM HEALTHY?" */}
            {/* Visual Centerpiece: Living System Health Pulse Ring */}
            <section aria-labelledby="question-1-heading" className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 id="question-1-heading" className="text-xs font-mono font-bold tracking-wider uppercase text-[#858A80] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#173F35]" />
                        1. System Vitality Overview
                    </h2>
                    <span className="text-[0.68rem] font-mono text-[#858A80]">
                        Updated just now
                    </span>
                </div>

                <LivingSystemPulse 
                    healthyPct={healthyPct}
                    warningPct={warningPct}
                    criticalPct={criticalPct}
                    totalPumps={totalPumps}
                    totalFlow={totalFlow}
                    averagePressure={5.9}
                    selectedSector={selectedSector}
                    onSelectSector={onSelectSector}
                />
            </section>

            {/* 3. QUESTION 2: "WHAT NEEDS MY ATTENTION NOW?" */}
            {/* Critical Attention Card */}
            <section aria-labelledby="question-2-heading" className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 id="question-2-heading" className="text-xs font-mono font-bold tracking-wider uppercase text-[#858A80] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D94C45]" />
                        2. Immediate Attention Required
                    </h2>
                    <span className="text-[0.68rem] font-mono text-[#D94C45] font-bold">
                        1 High-Priority Anomaly
                    </span>
                </div>

                <div className="agri-mobile-card border-l-4 border-l-[#D94C45] p-5 sm:p-6 space-y-4">
                    {/* Top title and status tag */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0EFEA]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#FDECEC] text-[#D94C45] flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm sm:text-base font-extrabold text-[#173F35]">
                                        {urgentPump.name}
                                    </h3>
                                    <span className="text-[0.65rem] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FDECEC] text-[#9E1F1A] border border-[#F8B4B1]">
                                        CRITICAL
                                    </span>
                                </div>
                                <div className="text-[0.7rem] text-[#858A80] font-mono">
                                    {urgentPump.model} • Sector Delta-7 (Zone 2 Booster)
                                </div>
                            </div>
                        </div>

                        {/* RUL Countdown Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0E1] border border-[#F5D8A3] text-xs font-mono font-bold text-[#925805] self-start sm:self-auto">
                            <Clock size={13} />
                            <span>{urgentPump.rulHours}h Remaining Life</span>
                        </div>
                    </div>

                    {/* Sensor Metric Readouts */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E5DC]">
                            <div className="text-[0.68rem] text-[#858A80] flex items-center gap-1">
                                <Activity size={12} className="text-[#D94C45]" />
                                <span>Vibration RMS</span>
                            </div>
                            <div className="text-base font-extrabold font-mono text-[#D94C45] mt-0.5">
                                {urgentPump.metrics.vibrationRms} <span className="text-[0.65rem] font-sans font-semibold text-[#858A80]">mm/s</span>
                            </div>
                            <div className="text-[0.62rem] text-[#D94C45] font-mono">
                                ISO Zone C &gt; 4.5
                            </div>
                        </div>

                        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E5DC]">
                            <div className="text-[0.68rem] text-[#858A80] flex items-center gap-1">
                                <Thermometer size={12} className="text-[#E7A944]" />
                                <span>Casing Temp</span>
                            </div>
                            <div className="text-base font-extrabold font-mono text-[#252B28] mt-0.5">
                                {urgentPump.metrics.casingTemp} <span className="text-[0.65rem] font-sans font-semibold text-[#858A80]">°C</span>
                            </div>
                            <div className="text-[0.62rem] text-[#858A80] font-mono">
                                Max Limit: 88°C
                            </div>
                        </div>

                        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E5DC]">
                            <div className="text-[0.68rem] text-[#858A80] flex items-center gap-1">
                                <Gauge size={12} className="text-[#173F35]" />
                                <span>Discharge Head</span>
                            </div>
                            <div className="text-base font-extrabold font-mono text-[#173F35] mt-0.5">
                                {urgentPump.metrics.dischargePressure} <span className="text-[0.65rem] font-sans font-semibold text-[#858A80]">bar</span>
                            </div>
                            <div className="text-[0.62rem] text-[#858A80] font-mono">
                                Target: 6.2 bar
                            </div>
                        </div>

                        <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#E6E5DC]">
                            <div className="text-[0.68rem] text-[#858A80] flex items-center gap-1">
                                <Zap size={12} className="text-[#173F35]" />
                                <span>Current Draw</span>
                            </div>
                            <div className="text-base font-extrabold font-mono text-[#252B28] mt-0.5">
                                {urgentPump.metrics.motorCurrent} <span className="text-[0.65rem] font-sans font-semibold text-[#858A80]">A</span>
                            </div>
                            <div className="text-[0.62rem] text-[#858A80] font-mono">
                                Rated FLA: 28.0 A
                            </div>
                        </div>
                    </div>

                    {/* Plain-English Root Cause Explanation */}
                    <div className="bg-[#EBF1E8]/70 border border-[#DCE7D8] rounded-xl p-3 text-xs leading-relaxed text-[#252B28]">
                        <div className="flex items-start gap-2">
                            <Sparkles size={16} className="text-[#173F35] flex-shrink-0 mt-0.5" />
                            <div>
                                <strong className="text-[#173F35]">AI Diagnostic Explanation:</strong>{" "}
                                Acoustic emission sensors detect a <strong>1.48 kHz harmonic spike</strong> coinciding with suction pressure dropping to 1.12 bar. Micro-vapor cavities are collapsing against the bronze impeller blades, generating localized cavitation erosion.
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                            onClick={() => navigate('/diagnostics')}
                            className="agri-btn agri-btn-lime text-xs py-2 px-3.5 shadow-xs flex-1 sm:flex-initial"
                        >
                            <Sparkles size={13} />
                            <span>Ask AI Copilot for Root Cause</span>
                        </button>
                        <button
                            onClick={() => navigate('/operations')}
                            className="agri-btn agri-btn-primary text-xs py-2 px-3.5 flex-1 sm:flex-initial"
                        >
                            <Activity size={13} />
                            <span>Inspect Pump Twin</span>
                        </button>
                        <button
                            onClick={() => navigate('/maintenance')}
                            className="agri-btn agri-btn-outline text-xs py-2 px-3 bg-white"
                        >
                            <Wrench size={13} />
                            <span>Review LOTO Work Order</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* 4. QUESTION 3: "WHAT MIGHT FAIL SOON?" */}
            {/* Predictive Foresight Carousel (Weibull Remaining Useful Life) */}
            <section aria-labelledby="question-3-heading" className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 id="question-3-heading" className="text-xs font-mono font-bold tracking-wider uppercase text-[#858A80] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E7A944]" />
                        3. Predictive Failure Foresight (Weibull RUL)
                    </h2>
                    <button
                        onClick={() => navigate('/predictive')}
                        className="text-xs font-bold text-[#173F35] hover:underline flex items-center gap-1"
                    >
                        <span>Full Curves</span>
                        <ChevronRight size={13} />
                    </button>
                </div>

                {/* Horizontal Touch Scrollable List on mobile */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {atRiskPumps.map((p) => {
                        const isCrit = p.status === 'CRITICAL';
                        const isWarn = p.status === 'WARNING';

                        return (
                            <div 
                                key={p.id}
                                onClick={() => navigate('/predictive')}
                                className="min-w-[260px] sm:min-w-[280px] bg-white border border-[#E6E5DC] rounded-2xl p-4 shadow-2xs hover:shadow-sm hover:border-[#173F35] transition-all cursor-pointer flex flex-col justify-between flex-shrink-0"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-[#173F35]">
                                            {p.name}
                                        </span>
                                        <span className={`text-[0.62rem] font-mono font-bold px-1.5 py-0.5 rounded ${
                                            isCrit ? 'bg-[#FDECEC] text-[#9E1F1A]' : isWarn ? 'bg-[#FAF0E1] text-[#925805]' : 'bg-[#EBF1E8] text-[#173F35]'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </div>
                                    <div className="text-[0.68rem] text-[#858A80] font-mono mt-0.5">
                                        {p.sector}
                                    </div>

                                    {/* RUL Big Metric */}
                                    <div className="mt-3">
                                        <div className="text-2xl font-extrabold font-mono text-[#173F35]">
                                            {p.rulHours >= 1000 ? `${(p.rulHours/1000).toFixed(1)}k` : p.rulHours}
                                            <span className="text-xs font-sans font-semibold text-[#858A80] ml-1">hours left</span>
                                        </div>
                                        <div className="text-[0.72rem] text-[#252B28] font-semibold mt-1 line-clamp-1">
                                            {p.mode}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress probability bar */}
                                <div className="mt-3 pt-3 border-t border-[#F0EFEA] space-y-1.5">
                                    <div className="flex items-center justify-between text-[0.65rem] font-mono">
                                        <span className="text-[#858A80]">Failure Probability</span>
                                        <span className={`font-bold ${isCrit ? 'text-[#D94C45]' : isWarn ? 'text-[#E7A944]' : 'text-[#173F35]'}`}>
                                            {p.probability}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-[#EFEFE7] rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${isCrit ? 'bg-[#D94C45]' : isWarn ? 'bg-[#E7A944]' : 'bg-[#173F35]'}`}
                                            style={{ width: `${p.probability}%` }}
                                        />
                                    </div>
                                    <div className="text-[0.62rem] font-mono text-[#858A80] text-right">
                                        Window: {p.urgency}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 5. QUESTION 4: "WHAT SHOULD I DO NEXT?" */}
            {/* Actionable Recommendations Stack */}
            <section aria-labelledby="question-4-heading" className="space-y-2">
                <div className="flex items-center justify-between">
                    <h2 id="question-4-heading" className="text-xs font-mono font-bold tracking-wider uppercase text-[#858A80] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#173F35]" />
                        4. Recommended Safe Next Actions
                    </h2>
                    <span className="text-[0.68rem] font-mono text-[#858A80]">
                        Guided by Living Intelligence
                    </span>
                </div>

                <div className="space-y-2.5">
                    {/* Action 1 */}
                    <div className="agri-mobile-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => toggleStep('vfd')}
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                    completedSteps['vfd'] 
                                        ? 'bg-[#173F35] text-white' 
                                        : 'border border-[#D8D7CD] hover:border-[#173F35] text-transparent'
                                }`}
                                aria-label="Mark action complete"
                            >
                                <Check size={13} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#173F35]">
                                        Step 1: Relieve Suction Cavitation
                                    </span>
                                    <span className="text-[0.62rem] font-mono px-1.5 py-0.2 rounded bg-[#ECEBE4] text-[#555A52] border border-[#D5D4CA]">
                                        SIMULATION ONLY
                                    </span>
                                </div>
                                <p className="text-xs text-[#858A80] mt-0.5 leading-snug">
                                    Throttle variable frequency drive (VFD) from 54.2 Hz down to 45.0 Hz to raise Net Positive Suction Head (NPSH) margin and suppress impeller cavitation.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/operations')}
                            className="agri-btn agri-btn-outline text-xs py-1.5 px-3 self-end sm:self-auto bg-white flex items-center gap-1 flex-shrink-0"
                        >
                            <span>Open VFD Simulator</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    {/* Action 2 */}
                    <div className="agri-mobile-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => toggleStep('loto')}
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                    completedSteps['loto'] 
                                        ? 'bg-[#173F35] text-white' 
                                        : 'border border-[#D8D7CD] hover:border-[#173F35] text-transparent'
                                }`}
                                aria-label="Mark action complete"
                            >
                                <Check size={13} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#173F35]">
                                        Step 2: Dispatch Technician & LOTO Work Order
                                    </span>
                                    <span className="text-[0.62rem] font-mono font-bold px-1.5 py-0.2 rounded bg-[#FAF0E1] text-[#925805] border border-[#F5D8A3]">
                                        PARTS STAGED
                                    </span>
                                </div>
                                <p className="text-xs text-[#858A80] mt-0.5 leading-snug">
                                    Assign Technician Ahmed El-Sayed for SKF 6312 bearing kit inspection. Strict electrical Lockout/Tagout (LOTO) breaker isolation required.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/maintenance')}
                            className="agri-btn agri-btn-outline text-xs py-1.5 px-3 self-end sm:self-auto bg-white flex items-center gap-1 flex-shrink-0"
                        >
                            <span>Review Work Order</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>

                    {/* Action 3 */}
                    <div className="agri-mobile-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <button
                                onClick={() => toggleStep('vision')}
                                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                    completedSteps['vision'] 
                                        ? 'bg-[#173F35] text-white' 
                                        : 'border border-[#D8D7CD] hover:border-[#173F35] text-transparent'
                                }`}
                                aria-label="Mark action complete"
                            >
                                <Check size={13} />
                            </button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#173F35]">
                                        Step 3: Correlate Foliar Crop Canopy Vigor
                                    </span>
                                    <span className="text-[0.62rem] font-mono px-1.5 py-0.2 rounded bg-[#EBF1E8] text-[#173F35] border border-[#DCE7D8]">
                                        YOLOv8
                                    </span>
                                </div>
                                <p className="text-xs text-[#858A80] mt-0.5 leading-snug">
                                    Upload or inspect citrus canopy photos in Sector Delta-7 to verify whether lower line pressure has caused foliar water stress in Zone 2 trees.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/field-vision')}
                            className="agri-btn agri-btn-outline text-xs py-1.5 px-3 self-end sm:self-auto bg-white flex items-center gap-1 flex-shrink-0"
                        >
                            <span>Launch Field Vision</span>
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. BOTTOM TOUCH DOCK / QUICK SHORTCUTS */}
            <div className="pt-2 pb-4">
                <div className="bg-[#FAF9F5] border border-[#D8D7CD] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-xl bg-[#173F35] text-[#C7F36B] flex items-center justify-center flex-shrink-0 shadow-xs">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[#173F35]">Need diagnostic clarity?</div>
                            <div className="text-[0.68rem] text-[#858A80]">The AI Copilot has indexed all Grundfos, KSB & Sulzer OEM manuals.</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/diagnostics')}
                            className="flex-1 sm:flex-initial py-2 px-4 rounded-xl bg-[#173F35] text-white text-xs font-bold hover:bg-[#113129] flex items-center justify-center gap-1.5 shadow-xs"
                        >
                            <Sparkles size={13} className="text-[#C7F36B]" />
                            <span>Ask Question</span>
                        </button>
                        {onOpenOnboarding && (
                            <button
                                onClick={onOpenOnboarding}
                                className="py-2 px-3 rounded-xl border border-[#D8D7CD] bg-white text-xs font-semibold text-[#555A52] hover:bg-[#F6F5EF]"
                            >
                                Tour
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
