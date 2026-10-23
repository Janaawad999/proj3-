import React from 'react';

/**
 * PumpSchematic — Interactive CAD Digital Twin Component
 * 
 * Renders an industrial cross-sectional schematic of a centrifugal smart pump
 * featuring animated hydraulic fluid flow particles, rotating impeller vanes,
 * bearing cavitation hotspot glow, and interactive sensor probe readouts.
 * 
 * Recreated from AgriPulse Living Intelligence design prototype.
 */
const PumpSchematic = ({ pump, activeMetric = 'vibration', onSelectMetric }) => {
    if (!pump) return null;

    const isCritical = pump.status === 'CRITICAL';
    const metrics = pump.metrics || {
        vibrationRms: 5.84,
        casingTemp: 79.2,
        dischargePressure: 6.85,
        suctionPressure: 1.12,
        motorCurrent: 31.4,
        flowRate: 382
    };

    const handleSelectMetric = (metric) => {
        if (typeof onSelectMetric === 'function') {
            onSelectMetric(metric);
        }
    };

    return (
        <div className="w-full bg-[#102D27] text-[#F6F5EF] rounded-lg p-4 sm:p-5 border border-[#1C4B40] relative overflow-hidden select-none shadow-lg">
            {/* Header: Identity & ISO Classification */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1C4B40]/70 gap-2">
                <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C7F36B] animate-pulse flex-shrink-0"></span>
                    <div>
                        <div className="font-extrabold text-sm text-white flex items-center gap-2 flex-wrap">
                            <span>{pump.name}</span>
                            <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-[#173F35] text-[#C7F36B] border border-[#23584B]">
                                {pump.model || 'Grundfos CR 95-2'}
                            </span>
                        </div>
                        <div className="text-[0.7rem] text-[#A0ABA4] font-mono">
                            SN: {pump.serial || 'GF-2024-9941-K'} • Centrifugal End-Suction
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[0.68rem] font-mono">
                    <span className="px-2 py-0.5 rounded bg-[#1A463D] text-[#DCE7D8] border border-[#22574C]">
                        ISO 10816 CLASS II
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[#C7F36B] font-bold">
                        CAD SCHEMATIC
                    </span>
                </div>
            </div>

            {/* Central Schematic + Probe Readouts */}
            <div className="py-5 flex flex-col lg:flex-row items-center justify-center gap-6">
                {/* SVG Centrifugal Pump Schematic */}
                <div className="relative w-full max-w-xl aspect-[16/9] flex items-center justify-center">
                    <svg viewBox="0 0 720 400" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#C7F36B" stopOpacity="0.85" />
                                <stop offset="50%" stopColor="#48C78E" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#2AAB91" stopOpacity="0.85" />
                            </linearGradient>
                            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#1C4B41" />
                                <stop offset="50%" stopColor="#143831" />
                                <stop offset="100%" stopColor="#0B231E" />
                            </linearGradient>
                            <radialGradient id="alarmGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#D94C45" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#D94C45" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Foundation Skid */}
                        <rect x="60" y="320" width="600" height="24" rx="4" fill="#0D2520" stroke="#1C4B40" strokeWidth="2" />
                        <line x1="80" y1="344" x2="640" y2="344" stroke="#C7F36B" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 4" />

                        {/* Motor Body (Right) */}
                        <rect x="390" y="140" width="220" height="170" rx="12" fill="url(#metalGrad)" stroke="#2D6B5D" strokeWidth="2.5" />
                        {/* Motor Cooling Fins */}
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <line key={i} x1={415 + i * 20} y1="140" x2={415 + i * 20} y2="310" stroke="#0D2520" strokeWidth="2" />
                        ))}

                        {/* Terminal Box */}
                        <rect x="440" y="98" width="70" height="42" rx="4" fill="#173F35" stroke="#C7F36B" strokeWidth="1.5" />
                        <text x="475" y="124" fill="#C7F36B" fontSize="11" fontFamily="monospace" textAnchor="middle" fontWeight="bold">380V</text>

                        {/* Shaft & Bearing Housing (Center) */}
                        <rect x="320" y="195" width="70" height="60" rx="4" fill="#0D2520" stroke="#2D6B5D" strokeWidth="2" />
                        <rect x="300" y="215" width="100" height="20" fill="#858A80" opacity="0.8" />
                        <rect x="250" y="180" width="70" height="90" rx="6" fill="url(#metalGrad)" stroke="#2D6B5D" strokeWidth="2" />
                        <circle cx="285" cy="225" r="24" fill="#143831" stroke="#C7F36B" strokeWidth="1.5" strokeDasharray="3 2" />

                        {/* Anomaly Alarm Glow (Cavitation Hotspot) */}
                        {isCritical && (
                            <circle cx="285" cy="225" r="42" fill="url(#alarmGlow)" className="animate-pulse" />
                        )}

                        {/* Pump Volute Casing (Left) */}
                        <circle cx="160" cy="225" r="85" fill="url(#metalGrad)" stroke="#2D6B5D" strokeWidth="3" />
                        <circle cx="160" cy="225" r="62" fill="#0D2520" stroke="#1C4B40" strokeWidth="2" />

                        {/* Rotating Impeller Vanes */}
                        <g transform="translate(160, 225)">
                            {[0, 60, 120, 180, 240, 300].map(deg => (
                                <path 
                                    key={deg} 
                                    d="M0 0 Q18 20 45 32" 
                                    fill="none" 
                                    stroke={isCritical ? '#E7A944' : '#C7F36B'} 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                    transform={`rotate(${deg})`} 
                                />
                            ))}
                            <circle cx="0" cy="0" r="14" fill="#173F35" stroke="#FFFFFF" strokeWidth="2" />
                        </g>

                        {/* Suction Inlet (DN100 IN) */}
                        <rect x="40" y="205" width="60" height="40" rx="2" fill="url(#metalGrad)" stroke="#2D6B5D" strokeWidth="2" />
                        <line x1="40" y1="195" x2="40" y2="255" stroke="#C7F36B" strokeWidth="4" strokeLinecap="round" />
                        <text x="65" y="270" fill="#A0ABA4" fontSize="10" fontFamily="monospace" textAnchor="middle">DN100 IN</text>

                        {/* Discharge Outlet (DN80 OUT) */}
                        <rect x="135" y="45" width="50" height="95" rx="2" fill="url(#metalGrad)" stroke="#2D6B5D" strokeWidth="2" />
                        <line x1="125" y1="45" x2="195" y2="45" stroke="#C7F36B" strokeWidth="4" strokeLinecap="round" />
                        <text x="210" y="55" fill="#A0ABA4" fontSize="10" fontFamily="monospace">DN80 OUT</text>

                        {/* Animated Hydraulic Fluid Flow Particles */}
                        <path d="M 30 225 L 140 225" fill="none" stroke="url(#flowGrad)" strokeWidth="5" className="animate-water-flow" />
                        <path d="M 160 225 Q 110 160 160 50" fill="none" stroke="url(#flowGrad)" strokeWidth="5" className="animate-water-flow" />

                        {/* INTERACTIVE PROBE HOTSPOTS */}
                        {/* 1. VIBRATION PROBE */}
                        <g 
                            className="cursor-pointer transition-transform hover:scale-110" 
                            onClick={() => handleSelectMetric('vibration')}
                        >
                            <circle 
                                cx="285" 
                                cy="170" 
                                r="11" 
                                fill={activeMetric === 'vibration' ? '#C7F36B' : isCritical ? '#D94C45' : '#173F35'} 
                                stroke="#FFF" 
                                strokeWidth="2" 
                            />
                            <text x="285" y="152" fill="#FFF" fontSize="11" textAnchor="middle" fontWeight="bold">VIB</text>
                        </g>

                        {/* 2. PRESSURE PROBE */}
                        <g 
                            className="cursor-pointer transition-transform hover:scale-110" 
                            onClick={() => handleSelectMetric('pressure')}
                        >
                            <circle 
                                cx="160" 
                                cy="30" 
                                r="11" 
                                fill={activeMetric === 'pressure' ? '#C7F36B' : '#173F35'} 
                                stroke="#FFF" 
                                strokeWidth="2" 
                            />
                            <text x="160" y="16" fill="#FFF" fontSize="11" textAnchor="middle" fontWeight="bold">BAR</text>
                        </g>

                        {/* 3. TEMPERATURE PROBE */}
                        <g 
                            className="cursor-pointer transition-transform hover:scale-110" 
                            onClick={() => handleSelectMetric('temperature')}
                        >
                            <circle 
                                cx="500" 
                                cy="225" 
                                r="11" 
                                fill={activeMetric === 'temperature' ? '#C7F36B' : '#173F35'} 
                                stroke="#FFF" 
                                strokeWidth="2" 
                            />
                            <text x="500" y="210" fill="#FFF" fontSize="11" textAnchor="middle" fontWeight="bold">TEMP</text>
                        </g>

                        {/* 4. CURRENT PROBE */}
                        <g 
                            className="cursor-pointer transition-transform hover:scale-110" 
                            onClick={() => handleSelectMetric('current')}
                        >
                            <circle 
                                cx="475" 
                                cy="80" 
                                r="11" 
                                fill={activeMetric === 'current' ? '#C7F36B' : '#173F35'} 
                                stroke="#FFF" 
                                strokeWidth="2" 
                            />
                            <text x="475" y="66" fill="#FFF" fontSize="11" textAnchor="middle" fontWeight="bold">AMPS</text>
                        </g>
                    </svg>
                </div>

                {/* Live Probe Readouts Panel */}
                <div className="w-full lg:w-64 flex flex-col gap-2.5">
                    <div className="text-[0.7rem] uppercase tracking-wider font-extrabold text-[#C7F36B] pb-1 border-b border-[#1C4B40] flex justify-between">
                        <span>TELEMETRY PROBES</span>
                        <span className="font-mono text-[#A0ABA4]">LIVE 2.5s</span>
                    </div>

                    {/* Vibration Card */}
                    <button 
                        type="button"
                        onClick={() => handleSelectMetric('vibration')} 
                        className={`text-left p-2.5 rounded cursor-pointer border transition-all ${
                            activeMetric === 'vibration' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-sm' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#DCE7D8]">Bearing Vibration</span>
                            <span className={`text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded ${
                                isCritical ? 'bg-[#D94C45] text-white' : 'bg-[#C7F36B] text-[#102D27]'
                            }`}>
                                {isCritical ? 'ALERT' : 'NOMINAL'}
                            </span>
                        </div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                            {metrics.vibrationRms} <span className="text-xs text-[#A0ABA4] font-normal">mm/s</span>
                        </div>
                        <div className="text-[0.68rem] text-[#E7A944] font-mono">
                            ISO Limit: 4.5 mm/s
                        </div>
                    </button>

                    {/* Temperature Card */}
                    <button 
                        type="button"
                        onClick={() => handleSelectMetric('temperature')} 
                        className={`text-left p-2.5 rounded cursor-pointer border transition-all ${
                            activeMetric === 'temperature' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-sm' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#DCE7D8]">Casing Temperature</span>
                            <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-[#E7A944]/20 text-[#E7A944]">
                                ELEVATED
                            </span>
                        </div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                            {metrics.casingTemp} <span className="text-xs text-[#A0ABA4] font-normal">°C</span>
                        </div>
                        <div className="text-[0.68rem] text-[#A0ABA4] font-mono">
                            Max: 88.0°C
                        </div>
                    </button>

                    {/* Pressure Card */}
                    <button 
                        type="button"
                        onClick={() => handleSelectMetric('pressure')} 
                        className={`text-left p-2.5 rounded cursor-pointer border transition-all ${
                            activeMetric === 'pressure' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-sm' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#DCE7D8]">Discharge Pressure</span>
                            <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-[#C7F36B]/20 text-[#C7F36B]">
                                HEAD
                            </span>
                        </div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                            {metrics.dischargePressure} <span className="text-xs text-[#A0ABA4] font-normal">bar</span>
                        </div>
                        <div className="text-[0.68rem] text-[#A0ABA4] font-mono">
                            Suction: {metrics.suctionPressure || 1.12} bar
                        </div>
                    </button>

                    {/* Current Card */}
                    <button 
                        type="button"
                        onClick={() => handleSelectMetric('current')} 
                        className={`text-left p-2.5 rounded cursor-pointer border transition-all ${
                            activeMetric === 'current' 
                                ? 'bg-[#173F35] border-[#C7F36B] shadow-sm' 
                                : 'bg-[#143831] border-[#1C4B40] hover:border-[#2D6B5D]'
                        }`}
                    >
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-[#DCE7D8]">Motor Current</span>
                            <span className="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-[#D94C45]/20 text-[#D94C45]">
                                112% FLA
                            </span>
                        </div>
                        <div className="text-xl font-bold font-mono text-white mt-1">
                            {metrics.motorCurrent} <span className="text-xs text-[#A0ABA4] font-normal">A</span>
                        </div>
                        <div className="text-[0.68rem] text-[#C7F36B] font-mono">
                            Flow: {metrics.flowRate} L/min
                        </div>
                    </button>
                </div>
            </div>

            {/* Footer Diagnostic Bar */}
            <div className="mt-2 pt-2 border-t border-[#1C4B40]/70 flex flex-col sm:flex-row justify-between text-xs text-[#A0ABA4] gap-1">
                <div>
                    <strong className="text-white">Active Diagnosis:</strong> {pump.technicianNotes || 'Continuous telemetry within baseline envelope.'}
                </div>
                <div className="font-mono text-[0.68rem] text-[#C7F36B] flex-shrink-0">
                    FLOW VELOCITY: 2.8 m/s
                </div>
            </div>
        </div>
    );
};

export default PumpSchematic;
