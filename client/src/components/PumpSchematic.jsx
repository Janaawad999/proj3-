import React, { useState } from 'react';
import { 
    Activity, Gauge, Thermometer, Zap, 
    Droplets, AlertTriangle, CheckCircle2, Info
} from 'lucide-react';

/**
 * Signature Industrial Centrifugal Pump Schematic
 * Original SVG/CSS engineering visualization with animated hydraulic flow,
 * sensor probe callouts, and interactive component inspection.
 */
const PumpSchematic = ({ 
    pump, 
    selectedSensor = 'vibration', 
    onSelectSensor 
}) => {
    const isCritical = pump?.status === 'CRITICAL';
    const isWarning = pump?.status === 'WARNING';
    const [hoveredHotspot, setHoveredHotspot] = useState(null);

    const activeSensor = selectedSensor || 'vibration';

    return (
        <div className="w-full bg-[#102D27] text-[#F6F5EF] rounded-lg p-5 border border-[#1C4B40] relative overflow-hidden select-none">
            {/* Top Bar with Technical Spec and Provenance Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#1C4B40]/70">
                <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C7F36B] animate-pulse" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm tracking-tight text-white">
                                {pump?.name || "Pump P-04 (Zone 2 Booster)"}
                            </span>
                            <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B] font-bold">
                                {pump?.model || "Grundfos CR 95-2"}
                            </span>
                        </div>
                        <div className="text-[0.72rem] text-[#A0ABA4] font-mono mt-0.5">
                            Serial: {pump?.serial || "GF-2024-9941-K"} • Multi-stage Centrifugal
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#1A463D] text-[#DCE7D8] border border-[#22574C]">
                        ISO 10816 CLASS II
                    </span>
                    <span className="text-[0.68rem] font-mono px-2 py-0.5 rounded bg-[#ECEBE4]/10 text-[#C7F36B] border border-[#C7F36B]/20">
                        DIGITAL TWIN SCHEMATIC
                    </span>
                </div>
            </div>

            {/* Main Interactive CAD Schematic Area */}
            <div className="relative py-6 flex flex-col md:flex-row items-center justify-center gap-6">
                {/* SVG Schematic Canvas */}
                <div className="relative w-full max-w-xl aspect-[16/9] flex items-center justify-center">
                    <svg 
                        viewBox="0 0 720 400" 
                        className="w-full h-full drop-shadow-lg"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            {/* Water Flow Gradient */}
                            <linearGradient id="waterFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#C7F36B" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#48C78E" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#2AAB91" stopOpacity="0.8" />
                            </linearGradient>

                            {/* Metal Shading Gradients */}
                            <linearGradient id="pumpMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1C4B41" />
                                <stop offset="50%" stopColor="#143831" />
                                <stop offset="100%" stopColor="#0B231E" />
                            </linearGradient>

                            <linearGradient id="motorFinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22574C" />
                                <stop offset="50%" stopColor="#173F35" />
                                <stop offset="100%" stopColor="#13362E" />
                            </linearGradient>

                            {/* Warning glow for bearing cavitation */}
                            <radialGradient id="cavitationGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#D94C45" stopOpacity="0.9" />
                                <stop offset="70%" stopColor="#D94C45" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#D94C45" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Base Foundation / Skid Mounting */}
                        <rect x="60" y="320" width="600" height="24" rx="4" fill="#0D2520" stroke="#1C4B40" strokeWidth="2" />
                        <line x1="80" y1="344" x2="640" y2="344" stroke="#C7F36B" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />

                        {/* Structural Mounting Bolts */}
                        <circle cx="100" cy="332" r="4" fill="#DCE7D8" opacity="0.6" />
                        <circle cx="260" cy="332" r="4" fill="#DCE7D8" opacity="0.6" />
                        <circle cx="460" cy="332" r="4" fill="#DCE7D8" opacity="0.6" />
                        <circle cx="620" cy="332" r="4" fill="#DCE7D8" opacity="0.6" />

                        {/* ================= ELECTRIC INDUCTION MOTOR (Right side) ================= */}
                        {/* Motor Casing Body */}
                        <rect x="390" y="140" width="220" height="170" rx="12" fill="url(#motorFinGrad)" stroke="#2D6B5D" strokeWidth="2.5" />
                        
                        {/* Motor Cooling Fins */}
                        {[...Array(9)].map((_, i) => (
                            <line 
                                key={`fin-${i}`} 
                                x1={415 + i * 20} 
                                y1="140" 
                                x2={415 + i * 20} 
                                y2="310" 
                                stroke="#0D2520" 
                                strokeWidth="2" 
                            />
                        ))}

                        {/* Motor Endbell & Fan Cowl */}
                        <path d="M610 160 Q635 225 610 290 Z" fill="#143831" stroke="#2D6B5D" strokeWidth="2" />
                        {/* Fan Grille Lines */}
                        <line x1="618" y1="180" x2="618" y2="270" stroke="#22574C" strokeWidth="2" strokeDasharray="4 2" />

                        {/* Motor Terminal Junction Box (Top of Motor) */}
                        <rect x="440" y="98" width="70" height="42" rx="4" fill="#173F35" stroke="#C7F36B" strokeWidth="1.5" />
                        <text x="475" y="124" fill="#C7F36B" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                            380V
                        </text>

                        {/* ================= SHAFT & BEARING HOUSING (Center) ================= */}
                        {/* Coupling Guard */}
                        <rect x="320" y="195" width="70" height="60" rx="4" fill="#0D2520" stroke="#2D6B5D" strokeWidth="2" />
                        {/* Rotating Drive Shaft */}
                        <rect x="300" y="215" width="100" height="20" fill="#858A80" opacity="0.8" />
                        
                        {/* Bearing Pedestal & Housing */}
                        <rect x="250" y="180" width="70" height="90" rx="6" fill="url(#pumpMetal)" stroke="#2D6B5D" strokeWidth="2" />
                        <circle cx="285" cy="225" r="24" fill="#143831" stroke="#C7F36B" strokeWidth="1.5" strokeDasharray="3 2" />

                        {/* Cavitation / Fatigue Warning Glow if Critical */}
                        {isCritical && (
                            <circle cx="285" cy="225" r="42" fill="url(#cavitationGlow)" className="animate-pulse" />
                        )}

                        {/* Mechanical Seal Gland */}
                        <rect x="230" y="195" width="20" height="60" fill="#2D6B5D" stroke="#C7F36B" strokeWidth="1" />

                        {/* ================= PUMP VOLUTE & HYDRAULIC CASING (Left side) ================= */}
                        {/* Volute Spiral Chamber */}
                        <circle cx="160" cy="225" r="85" fill="url(#pumpMetal)" stroke="#2D6B5D" strokeWidth="3" />
                        <circle cx="160" cy="225" r="62" fill="#0D2520" stroke="#1C4B40" strokeWidth="2" />

                        {/* Centrifugal Impeller Vanes (Dynamic Rotation) */}
                        <g transform="translate(160, 225)">
                            {[0, 60, 120, 180, 240, 300].map((deg) => (
                                <path 
                                    key={`vane-${deg}`}
                                    d="M0 0 Q18 20 45 32"
                                    fill="none" 
                                    stroke={isCritical ? "#E7A944" : "#C7F36B"} 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round"
                                    transform={`rotate(${deg})`}
                                />
                            ))}
                            {/* Impeller Eye Hub */}
                            <circle cx="0" cy="0" r="14" fill="#173F35" stroke="#FFFFFF" strokeWidth="2" />
                        </g>

                        {/* Suction Inlet Flange (Bottom-Left) */}
                        <rect x="40" y="205" width="60" height="40" rx="2" fill="url(#pumpMetal)" stroke="#2D6B5D" strokeWidth="2" />
                        <line x1="40" y1="195" x2="40" y2="255" stroke="#C7F36B" strokeWidth="4" strokeLinecap="round" />
                        <text x="65" y="270" fill="#A0ABA4" fontSize="10" fontFamily="monospace" textAnchor="middle">
                            DN100 INLET
                        </text>

                        {/* Discharge Outlet Nozzle (Top-Left) */}
                        <rect x="135" y="45" width="50" height="95" rx="2" fill="url(#pumpMetal)" stroke="#2D6B5D" strokeWidth="2" />
                        <line x1="125" y1="45" x2="195" y2="45" stroke="#C7F36B" strokeWidth="4" strokeLinecap="round" />
                        <text x="210" y="55" fill="#A0ABA4" fontSize="10" fontFamily="monospace">
                            DN80 DISCHARGE
                        </text>

                        {/* ================= ANIMATED WATER FLOW PATHS ================= */}
                        {/* Suction path into Impeller */}
                        <path 
                            d="M 30 225 L 140 225" 
                            fill="none" 
                            stroke="url(#waterFlowGrad)" 
                            strokeWidth="5" 
                            className="animate-water-flow"
                        />
                        {/* Radial discharge spiral upward */}
                        <path 
                            d="M 160 225 Q 110 160 160 50" 
                            fill="none" 
                            stroke="url(#waterFlowGrad)" 
                            strokeWidth="5" 
                            className="animate-water-flow"
                        />

                        {/* Directional Flow Arrow Markers */}
                        <polygon points="90,221 100,225 90,229" fill="#C7F36B" />
                        <polygon points="156,90 160,80 164,90" fill="#C7F36B" />

                        {/* ================= SENSOR PROBE CALLOUTS (Clickable) ================= */}
                        
                        {/* 1. Vibration Sensor (Bearing Housing) */}
                        <g 
                            className="cursor-pointer" 
                            onClick={() => onSelectSensor && onSelectSensor('vibration')}
                            onMouseEnter={() => setHoveredHotspot('vibration')}
                            onMouseLeave={() => setHoveredHotspot(null)}
                        >
                            <circle 
                                cx="285" 
                                cy="170" 
                                r="10" 
                                fill={activeSensor === 'vibration' ? "#C7F36B" : isCritical ? "#D94C45" : "#173F35"} 
                                stroke="#FFFFFF" 
                                strokeWidth="2" 
                            />
                            <line x1="285" y1="170" x2="285" y2="200" stroke="#C7F36B" strokeWidth="2" strokeDasharray="2 2" />
                            <text x="285" y="152" fill="#FFFFFF" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                VIB
                            </text>
                        </g>

                        {/* 2. Discharge Pressure Transducer */}
                        <g 
                            className="cursor-pointer" 
                            onClick={() => onSelectSensor && onSelectSensor('pressure')}
                            onMouseEnter={() => setHoveredHotspot('pressure')}
                            onMouseLeave={() => setHoveredHotspot(null)}
                        >
                            <circle 
                                cx="160" 
                                cy="30" 
                                r="10" 
                                fill={activeSensor === 'pressure' ? "#C7F36B" : "#173F35"} 
                                stroke="#FFFFFF" 
                                strokeWidth="2" 
                            />
                            <text x="160" y="16" fill="#FFFFFF" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                BAR
                            </text>
                        </g>

                        {/* 3. Motor Casing Thermocouple */}
                        <g 
                            className="cursor-pointer" 
                            onClick={() => onSelectSensor && onSelectSensor('temperature')}
                            onMouseEnter={() => setHoveredHotspot('temperature')}
                            onMouseLeave={() => setHoveredHotspot(null)}
                        >
                            <circle 
                                cx="500" 
                                cy="225" 
                                r="10" 
                                fill={activeSensor === 'temperature' ? "#C7F36B" : "#173F35"} 
                                stroke="#FFFFFF" 
                                strokeWidth="2" 
                            />
                            <text x="500" y="210" fill="#FFFFFF" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                TEMP
                            </text>
                        </g>

                        {/* 4. Motor Current Hall Sensor */}
                        <g 
                            className="cursor-pointer" 
                            onClick={() => onSelectSensor && onSelectSensor('current')}
                            onMouseEnter={() => setHoveredHotspot('current')}
                            onMouseLeave={() => setHoveredHotspot(null)}
                        >
                            <circle 
                                cx="475" 
                                cy="80" 
                                r="10" 
                                fill={activeSensor === 'current' ? "#C7F36B" : "#173F35"} 
                                stroke="#FFFFFF" 
                                strokeWidth="2" 
                            />
                            <text x="475" y="66" fill="#FFFFFF" fontSize="11" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
                                AMPS
                            </text>
                        </g>
                    </svg>
                </div>

                {/* Sensor Hotspot Telemetry Dashboard (Right Column) */}
                <div className="w-full md:w-64 flex flex-col gap-2.5">
                    <div className="text-[0.7rem] uppercase tracking-wider font-extrabold text-[#C7F36B] flex items-center justify-between pb-1 border-b border-[#1C4B40]">
                        <span>TELEMETRY PROBES</span>
                        <span className="text-[0.65rem] font-mono text-[#A0ABA4]">LIVE 2.5s</span>
                    </div>

                    {/* Sensor 1: Vibration */}
                    <button
                        onClick={() => onSelectSensor && onSelectSensor('vibration')}
                        className={`p-2.5 rounded-md text-left transition-all border ${
                            activeSensor === 'vibration' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-md' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#DCE7D8] flex items-center gap-1.5">
                                <Activity size={14} className={isCritical ? "text-[#D94C45]" : "text-[#C7F36B]"} />
                                Bearing Vibration
                            </span>
                            <span className={`text-[0.65rem] font-bold font-mono px-1.5 py-0.2 rounded ${
                                isCritical ? 'bg-[#D94C45] text-white' : 'bg-[#C7F36B] text-[#102D27]'
                            }`}>
                                {isCritical ? "ALERT" : "NOMINAL"}
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                            <span className="text-xl font-bold font-mono text-white">
                                {pump?.metrics?.vibrationRms || 5.84} <span className="text-xs font-normal text-[#A0ABA4]">mm/s RMS</span>
                            </span>
                            <span className="text-[0.68rem] font-mono text-[#E7A944]">
                                ISO Limit: 4.5
                            </span>
                        </div>
                    </button>

                    {/* Sensor 2: Temperature */}
                    <button
                        onClick={() => onSelectSensor && onSelectSensor('temperature')}
                        className={`p-2.5 rounded-md text-left transition-all border ${
                            activeSensor === 'temperature' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-md' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#DCE7D8] flex items-center gap-1.5">
                                <Thermometer size={14} className="text-[#E7A944]" />
                                Casing Temperature
                            </span>
                            <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.2 rounded bg-[#E7A944]/20 text-[#E7A944]">
                                ELEVATED
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                            <span className="text-xl font-bold font-mono text-white">
                                {pump?.metrics?.casingTemp || 79.2} <span className="text-xs font-normal text-[#A0ABA4]">°C</span>
                            </span>
                            <span className="text-[0.68rem] font-mono text-[#A0ABA4]">
                                Max: 88.0°C
                            </span>
                        </div>
                    </button>

                    {/* Sensor 3: Pressure */}
                    <button
                        onClick={() => onSelectSensor && onSelectSensor('pressure')}
                        className={`p-2.5 rounded-md text-left transition-all border ${
                            activeSensor === 'pressure' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-md' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#DCE7D8] flex items-center gap-1.5">
                                <Gauge size={14} className="text-[#C7F36B]" />
                                Discharge Pressure
                            </span>
                            <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.2 rounded bg-[#C7F36B]/20 text-[#C7F36B]">
                                HIGH HEAD
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                            <span className="text-xl font-bold font-mono text-white">
                                {pump?.metrics?.dischargePressure || 6.85} <span className="text-xs font-normal text-[#A0ABA4]">bar</span>
                            </span>
                            <span className="text-[0.68rem] font-mono text-[#A0ABA4]">
                                Suction: 1.12 bar
                            </span>
                        </div>
                    </button>

                    {/* Sensor 4: Motor Current & Flow */}
                    <button
                        onClick={() => onSelectSensor && onSelectSensor('current')}
                        className={`p-2.5 rounded-md text-left transition-all border ${
                            activeSensor === 'current' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-md' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#DCE7D8] flex items-center gap-1.5">
                                <Zap size={14} className="text-[#C7F36B]" />
                                Motor Current
                            </span>
                            <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.2 rounded bg-[#D94C45]/20 text-[#D94C45]">
                                112% FLA
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between mt-1.5">
                            <span className="text-xl font-bold font-mono text-white">
                                {pump?.metrics?.motorCurrent || 31.4} <span className="text-xs font-normal text-[#A0ABA4]">A</span>
                            </span>
                            <span className="text-[0.68rem] font-mono text-[#C7F36B]">
                                {pump?.metrics?.flowRate || 382} L/min
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Bottom Insight Bar */}
            <div className="mt-3 pt-3 border-t border-[#1C4B40]/70 flex flex-wrap items-center justify-between text-xs text-[#A0ABA4]">
                <div className="flex items-center gap-2">
                    <Info size={14} className="text-[#C7F36B] flex-shrink-0" />
                    <span>
                        <strong className="text-white">Active Diagnosis:</strong> {pump?.technicianNotes || "Harmonic peak at 1.48 kHz indicates bearing inner raceway fatigue. NPSH margin degraded."}
                    </span>
                </div>
                <div className="font-mono text-[0.68rem] text-[#C7F36B]">
                    FLOW VELOCITY: 2.8 m/s
                </div>
            </div>
        </div>
    );
};

export default PumpSchematic;
