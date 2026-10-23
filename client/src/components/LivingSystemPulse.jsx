import React, { useState } from 'react';
import { Droplets, Activity, Gauge, Zap, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * LivingSystemPulse: The Signature Visual Centerpiece of AgriPulse
 * 
 * An original, interactive organic SVG representation of the agricultural
 * irrigation system's health, fluid dynamics, and sector status.
 */
const LivingSystemPulse = ({ 
    healthyPct = 78, 
    warningPct = 16, 
    criticalPct = 6, 
    totalPumps = 18, 
    totalFlow = 7450, 
    averagePressure = 5.9,
    selectedSector = null,
    onSelectSector
}) => {
    const [hoveredNode, setHoveredNode] = useState(null);

    // Fleet status determination
    const overallStatus = criticalPct > 0 ? 'CAUTION' : warningPct > 0 ? 'ATTENTION' : 'OPTIMAL';
    const overallScore = Math.max(0, 100 - (criticalPct * 3 + warningPct * 1.5));

    const sectorNodes = [
        {
            id: 'sector-delta-7',
            name: 'Delta-7',
            type: 'Pivot Network',
            angle: 30, // degrees
            status: 'CRITICAL', // P-04
            pressure: 6.2,
            pumps: 6,
            color: '#D94C45',
            cx: 190,
            cy: 70
        },
        {
            id: 'sector-alpha-3',
            name: 'Alpha-3',
            type: 'Drip Orchards',
            angle: 150,
            status: 'HEALTHY',
            pressure: 4.5,
            pumps: 6,
            color: '#173F35',
            cx: 50,
            cy: 160
        },
        {
            id: 'sector-gamma-12',
            name: 'Gamma-12',
            type: 'Canal Intake',
            angle: 270,
            status: 'HEALTHY',
            pressure: 7.0,
            pumps: 6,
            color: '#173F35',
            cx: 150,
            cy: 200
        }
    ];

    return (
        <div className="w-full bg-gradient-to-b from-white to-[#F9F8F3] border border-[#E6E5DC] rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
            {/* Subtle botanical background ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7F36B]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#DCE7D8]/30 rounded-full blur-3xl pointer-events-none" />

            {/* Header row */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EFEA] relative z-10">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#173F35] animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#173F35]">
                        LIVING SYSTEM HEALTH PULSE
                    </span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#EBF1E8] px-2.5 py-1 rounded-full border border-[#DCE7D8]">
                    <span className="w-2 h-2 rounded-full bg-[#E7A944] animate-ping" />
                    <span className="text-[0.68rem] font-bold text-[#173F35]">
                        {overallStatus === 'CAUTION' ? 'Action Required (P-04)' : 'Nominal Operations'}
                    </span>
                </div>
            </div>

            {/* Centerpiece SVG Layout */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 my-4 relative z-10">
                {/* Visual Pulse Ring SVG */}
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex-shrink-0 flex items-center justify-center mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 240 240" fill="none">
                        {/* Outer organic boundary rings */}
                        <circle cx="120" cy="120" r="110" stroke="#E6E5DC" strokeWidth="1" strokeDasharray="3 3" />
                        <circle cx="120" cy="120" r="95" stroke="#DCE7D8" strokeWidth="1.5" className="animate-ring-pulse opacity-60" />
                        <circle cx="120" cy="120" r="80" stroke="#173F35" strokeWidth="2" strokeDasharray="8 4" className="animate-water-flow opacity-40" />

                        {/* Hydraulic flow orbit paths */}
                        <path 
                            d="M120 30 C170 30, 210 70, 210 120 C210 170, 170 210, 120 210 C70 210, 30 170, 30 120 C30 70, 70 30, 120 30" 
                            stroke="#C7F36B" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            opacity="0.75"
                        />

                        {/* Fluid particle waves */}
                        <circle cx="120" cy="40" r="4" fill="#173F35">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="0 120 120"
                                to="360 120 120"
                                dur="8s"
                                repeatCount="indefinite"
                            />
                        </circle>
                        <circle cx="120" cy="40" r="2.5" fill="#C7F36B">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                from="180 120 120"
                                to="540 120 120"
                                dur="8s"
                                repeatCount="indefinite"
                            />
                        </circle>

                        {/* Sector connecting spokes */}
                        <line x1="120" y1="120" x2="190" y2="70" stroke="#E6E5DC" strokeWidth="1.5" strokeDasharray="2 2" />
                        <line x1="120" y1="120" x2="50" y2="160" stroke="#E6E5DC" strokeWidth="1.5" strokeDasharray="2 2" />
                        <line x1="120" y1="120" x2="150" y2="200" stroke="#E6E5DC" strokeWidth="1.5" strokeDasharray="2 2" />

                        {/* Inner Core Circle */}
                        <circle cx="120" cy="120" r="54" fill="#FAF9F5" stroke="#173F35" strokeWidth="2.5" className="shadow-sm" />
                        <circle cx="120" cy="120" r="48" fill="#173F35" />

                        {/* Center Vitality Metrics */}
                        <text x="120" y="112" textAnchor="middle" fill="#C7F36B" fontSize="22" fontWeight="800" fontFamily="Manrope, sans-serif">
                            {Math.round(overallScore)}%
                        </text>
                        <text x="120" y="128" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" letterSpacing="0.05em" fontFamily="Manrope, sans-serif">
                            FLEET VITALITY
                        </text>
                        <text x="120" y="142" textAnchor="middle" fill="#A0ABA4" fontSize="8" fontFamily="JetBrains Mono, monospace">
                            {totalPumps} ACTIVE PUMPS
                        </text>

                        {/* Sector Interactive Orbit Nodes */}
                        {sectorNodes.map((node) => {
                            const isSelected = selectedSector?.id === node.id;
                            const isHovered = hoveredNode === node.id;

                            return (
                                <g 
                                    key={node.id}
                                    className="cursor-pointer transition-transform"
                                    onClick={() => onSelectSector && onSelectSector(isSelected ? null : { id: node.id, name: `Sector ${node.name}` })}
                                    onMouseEnter={() => setHoveredNode(node.id)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    {/* Pulse aura if critical */}
                                    {node.status === 'CRITICAL' && (
                                        <circle 
                                            cx={node.cx} 
                                            cy={node.cy} 
                                            r="18" 
                                            fill="#D94C45" 
                                            opacity="0.2" 
                                            className="animate-ping"
                                            style={{ animationDuration: '2.5s' }}
                                        />
                                    )}

                                    {/* Node background */}
                                    <circle 
                                        cx={node.cx} 
                                        cy={node.cy} 
                                        r={isSelected || isHovered ? 16 : 14} 
                                        fill={node.status === 'CRITICAL' ? '#FDECEC' : '#EBF1E8'} 
                                        stroke={node.status === 'CRITICAL' ? '#D94C45' : '#173F35'} 
                                        strokeWidth={isSelected ? 3 : 2} 
                                    />

                                    {/* Node text */}
                                    <text 
                                        x={node.cx} 
                                        y={node.cy + 3.5} 
                                        textAnchor="middle" 
                                        fill={node.status === 'CRITICAL' ? '#9E1F1A' : '#173F35'} 
                                        fontSize="8" 
                                        fontWeight="800" 
                                        fontFamily="JetBrains Mono, monospace"
                                    >
                                        {node.name.split('-')[0]}
                                    </text>

                                    {/* Micro tag below node */}
                                    <rect 
                                        x={node.cx - 24} 
                                        y={node.cy + 17} 
                                        width="48" 
                                        height="13" 
                                        rx="4" 
                                        fill="#FFFFFF" 
                                        stroke="#E6E5DC" 
                                        strokeWidth="0.8" 
                                    />
                                    <text 
                                        x={node.cx} 
                                        y={node.cy + 26} 
                                        textAnchor="middle" 
                                        fill={node.status === 'CRITICAL' ? '#D94C45' : '#252B28'} 
                                        fontSize="6.5" 
                                        fontWeight="700" 
                                        fontFamily="JetBrains Mono, monospace"
                                    >
                                        {node.status === 'CRITICAL' ? 'ALERT' : `${node.pressure} bar`}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Right / Bottom Telemetry Metrics Grid */}
                <div className="flex-1 w-full space-y-3.5">
                    {/* Fleet Health Composition Bar */}
                    <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E6E5DC]">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-bold text-[#173F35]">Machinery Distribution</span>
                            <span className="text-[0.68rem] font-mono text-[#858A80]">
                                {healthyPct}% Nominal • {warningPct}% Caution • {criticalPct}% Critical
                            </span>
                        </div>
                        {/* Segmented Bar */}
                        <div className="h-2.5 w-full bg-[#EFEFE7] rounded-full overflow-hidden flex gap-0.5 p-0.5">
                            <div 
                                className="bg-[#173F35] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${healthyPct}%` }}
                                title={`Healthy: ${healthyPct}%`}
                            />
                            <div 
                                className="bg-[#E7A944] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${warningPct}%` }}
                                title={`Caution: ${warningPct}%`}
                            />
                            <div 
                                className="bg-[#D94C45] h-full rounded-full transition-all duration-500" 
                                style={{ width: `${criticalPct}%` }}
                                title={`Critical: ${criticalPct}%`}
                            />
                        </div>
                    </div>

                    {/* Aggregate Hydraulic Vitals */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-white p-3 rounded-xl border border-[#E6E5DC] flex items-center gap-3 shadow-2xs">
                            <div className="w-8 h-8 rounded-lg bg-[#EBF1E8] text-[#173F35] flex items-center justify-center flex-shrink-0">
                                <Droplets size={16} />
                            </div>
                            <div>
                                <div className="text-[0.68rem] text-[#858A80] font-medium">Total Hydraulic Flow</div>
                                <div className="text-base font-extrabold font-mono text-[#173F35]">
                                    {totalFlow.toLocaleString()} <span className="text-[0.65rem] font-sans font-semibold text-[#858A80]">L/min</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-[#E6E5DC] flex items-center gap-3 shadow-2xs">
                            <div className="w-8 h-8 rounded-lg bg-[#FAF0E1] text-[#925805] flex items-center justify-center flex-shrink-0">
                                <Gauge size={16} />
                            </div>
                            <div>
                                <div className="text-[0.68rem] text-[#858A80] font-medium">Avg Line Pressure</div>
                                <div className="text-base font-extrabold font-mono text-[#252B28]">
                                    {averagePressure} <span className="text-[0.65rem] font-sans font-semibold text-[#858A80]">bar</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sector Quick Switcher Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[0.65rem] font-mono uppercase tracking-wider text-[#858A80] font-bold mr-1">
                            Filter Sector:
                        </span>
                        <button
                            onClick={() => onSelectSector && onSelectSector(null)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                !selectedSector 
                                    ? 'bg-[#173F35] text-white shadow-xs' 
                                    : 'bg-white hover:bg-[#EFEFE7] text-[#555A52] border border-[#D8D7CD]'
                            }`}
                        >
                            All (18)
                        </button>
                        {sectorNodes.map(s => {
                            const isSel = selectedSector?.id === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => onSelectSector && onSelectSector(isSel ? null : { id: s.id, name: `Sector ${s.name}` })}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                        isSel 
                                            ? 'bg-[#173F35] text-white shadow-xs' 
                                            : 'bg-white hover:bg-[#EFEFE7] text-[#555A52] border border-[#D8D7CD]'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'CRITICAL' ? 'bg-[#D94C45]' : 'bg-[#173F35]'}`} />
                                    <span>{s.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LivingSystemPulse;
