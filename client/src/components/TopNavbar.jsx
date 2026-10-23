import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Activity, Bell, CheckCircle2, AlertTriangle, 
    ChevronDown, ShieldAlert, Wifi, WifiOff,
    ExternalLink, Check, RefreshCw, Sparkles, HelpCircle,
    Info, X
} from 'lucide-react';
import { IRRIGATION_SECTORS, INTELLIGENCE_BRIEFS, DATA_PROVENANCE } from '../services/agriPulseData';
import { alertService, isMockMode } from '../services/api';
import AgriPulseBrandMark from './AgriPulseBrandMark';

const TopNavbar = ({ selectedSector, onSelectSector, onInvestigateAlert, onOpenOnboarding }) => {
    const navigate = useNavigate();

    // 3-state system status: 'CONNECTED' | 'DEGRADED' | 'STANDALONE'
    const [connectionStatus, setConnectionStatus] = useState(() => isMockMode() ? 'STANDALONE' : 'CHECKING');
    const [latencyMs, setLatencyMs] = useState(null);

    // Popover states
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSectorOpen, setIsSectorOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(1);
    const [isRealAlerts, setIsRealAlerts] = useState(false);

    const notifRef = useRef(null);
    const sectorRef = useRef(null);
    const statusRef = useRef(null);

    // User profile from localStorage
    const [user] = useState(() => {
        try {
            const saved = localStorage.getItem('user');
            if (saved) return JSON.parse(saved);
        } catch (e) {}
        return {
            displayName: 'Tariq Mansour',
            email: 't.mansour@agripulse.ai',
            role: 'Lead Irrigation Engineer'
        };
    });

    // Handle system connectivity without noisy errors in standalone mock mode
    useEffect(() => {
        let isMounted = true;

        if (isMockMode()) {
            setConnectionStatus('STANDALONE');
            setLatencyMs(null);
            return;
        }

        const checkBackendHealth = async () => {
            const start = performance.now();
            try {
                const response = await fetch('/api/health', { method: 'GET' });
                const elapsed = Math.round(performance.now() - start);
                if (response.ok) {
                    if (isMounted) {
                        setLatencyMs(elapsed);
                        setConnectionStatus(elapsed > 400 ? 'DEGRADED' : 'CONNECTED');
                    }
                } else if (isMounted) {
                    setConnectionStatus('DEGRADED');
                    setLatencyMs(elapsed);
                }
            } catch (err) {
                if (isMounted) {
                    setConnectionStatus('STANDALONE');
                    setLatencyMs(null);
                }
            }
        };

        checkBackendHealth();
        const interval = setInterval(checkBackendHealth, 30000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    // Load alerts via centralized alertService
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const data = await alertService.getAlerts({ limit: 5 });
                if (data && Array.isArray(data.alerts) && data.alerts.length > 0) {
                    setAlerts(data.alerts);
                    setUnreadCount(data.unreadCount ?? data.alerts.filter(a => a.status === 'UNREAD').length);
                    setIsRealAlerts(!isMockMode());
                    return;
                }
            } catch (e) {
                // Graceful fallback
            }

            setAlerts(INTELLIGENCE_BRIEFS);
            setUnreadCount(INTELLIGENCE_BRIEFS.length);
            setIsRealAlerts(false);
        };

        fetchAlerts();
    }, []);

    // Close popovers on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setIsNotifOpen(false);
            }
            if (sectorRef.current && !sectorRef.current.contains(e.target)) {
                setIsSectorOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(e.target)) {
                setIsStatusOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = async () => {
        if (isRealAlerts) {
            try {
                if (alertService && alertService.markAllAsRead) {
                    await alertService.markAllAsRead();
                }
            } catch (e) {}
        }
        setUnreadCount(0);
    };

    return (
        <header className="h-14 border-b border-[#E6E5DC] bg-[#FAF9F5] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none backdrop-blur-md bg-opacity-95">
            {/* Left: Mobile Brand & Global Sector Selector */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* Mobile Brand Mark (shown on phones where sidebar is hidden) */}
                <div 
                    onClick={() => navigate('/')} 
                    className="flex md:hidden items-center gap-1.5 cursor-pointer pr-1"
                >
                    <AgriPulseBrandMark size={26} showText={false} />
                    <span className="text-xs font-extrabold text-[#173F35] tracking-tight">
                        Agri<span className="text-[#173F35]">Pulse</span>
                    </span>
                </div>

                {/* Sector Switcher Pill */}
                <div className="relative" ref={sectorRef}>
                    <button
                        onClick={() => setIsSectorOpen(!isSectorOpen)}
                        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-lg bg-white border border-[#D8D7CD] hover:border-[#173F35] text-[0.72rem] sm:text-xs font-semibold text-[#173F35] transition-all shadow-xs"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#173F35]" />
                        <span className="max-w-[110px] sm:max-w-none truncate">
                            {selectedSector ? selectedSector.name : "All Sectors (18 Pumps)"}
                        </span>
                        <ChevronDown size={13} className="text-[#858A80]" />
                    </button>

                    {isSectorOpen && (
                        <div className="absolute left-0 mt-1.5 w-64 sm:w-72 bg-white border border-[#D8D7CD] rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
                            <div className="px-2 py-1 text-[0.65rem] uppercase tracking-wider font-bold text-[#858A80] border-b border-[#F0EFEA]">
                                Select Irrigation Sector
                            </div>
                            <button
                                onClick={() => {
                                    onSelectSector(null);
                                    setIsSectorOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between mt-1 transition-colors ${
                                    !selectedSector ? 'bg-[#DCE7D8] text-[#173F35] font-bold' : 'hover:bg-[#F6F5EF] text-[#252B28]'
                                }`}
                            >
                                <div>
                                    <div className="font-semibold">All Sectors Overview</div>
                                    <div className="text-[0.65rem] text-[#858A80]">18 Smart Pumps • 4,370 Hectares</div>
                                </div>
                                {!selectedSector && <Check size={14} />}
                            </button>
                            {IRRIGATION_SECTORS.map(sec => (
                                <button
                                    key={sec.id}
                                    onClick={() => {
                                        onSelectSector(sec);
                                        setIsSectorOpen(false);
                                    }}
                                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between mt-0.5 transition-colors ${
                                        selectedSector?.id === sec.id ? 'bg-[#DCE7D8] text-[#173F35] font-bold' : 'hover:bg-[#F6F5EF] text-[#252B28]'
                                    }`}
                                >
                                    <div>
                                        <div className="font-semibold">{sec.name}</div>
                                        <div className="text-[0.65rem] text-[#858A80]">{sec.type} • {sec.pumpsCount} Pumps</div>
                                    </div>
                                    {selectedSector?.id === sec.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ISO Standard Pill (Desktop only) */}
                <span className="hidden xl:inline-flex items-center text-[0.68rem] text-[#858A80] font-mono px-2 py-0.5 rounded bg-[#EFEFE7] border border-[#E6E5DC]">
                    ISO 10816-3 Class II
                </span>
            </div>

            {/* Right: Live Status, Onboarding, Notifications & Profile */}
            <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Live System Connection Monitor */}
                <div className="relative" ref={statusRef}>
                    <button
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[0.68rem] font-mono transition-all"
                    >
                        {connectionStatus === 'CONNECTED' ? (
                            <div className="flex items-center gap-1.5 text-[#173F35] bg-[#DCE7D8]/60 border-[#B5CDB0] px-1.5 py-0.5 rounded">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#173F35] animate-ping" />
                                <span className="font-semibold hidden sm:inline">Telemetry Live</span>
                                <span className="text-[0.65rem] opacity-75">{latencyMs}ms</span>
                            </div>
                        ) : connectionStatus === 'DEGRADED' ? (
                            <div className="flex items-center gap-1.5 text-[#925805] bg-[#FDF4E6] border-[#F5D8A3] px-1.5 py-0.5 rounded">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E7A944]" />
                                <span className="font-semibold hidden sm:inline">High Latency</span>
                                <span className="text-[0.65rem] opacity-75">{latencyMs}ms</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#DCE7D8]/70 border border-[#B5CDB0] text-[#173F35] text-[0.72rem] font-mono">
                                <span className="w-2 h-2 rounded-full bg-[#173F35] animate-pulse" />
                                <span className="font-bold hidden sm:inline">Live Prototype Link</span>
                                <span className="text-[0.65rem] opacity-75">(120ms)</span>
                            </div>
                        )}
                    </button>

                    {/* Status Info Tooltip / Card */}
                    {isStatusOpen && (
                        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#D8D7CD] rounded-2xl shadow-xl p-3 z-50 text-xs text-[#252B28]">
                            <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEA]">
                                <span className="font-bold text-[#173F35]">Gateway Connectivity</span>
                                <span className="font-mono text-[0.68rem] font-bold text-[#858A80]">{connectionStatus}</span>
                            </div>
                            <div className="py-2 text-[0.72rem] text-[#555A52] space-y-1">
                                <p><strong>Data Baseline:</strong> {DATA_PROVENANCE.dataSource}</p>
                                <p><strong>ISO Standard:</strong> {DATA_PROVENANCE.isoStandard}</p>
                                <p><strong>Sampling Rate:</strong> {DATA_PROVENANCE.telemetrySamplingRateMs}ms</p>
                            </div>
                            <div className="text-[0.68rem] text-[#858A80] bg-[#FAF9F5] p-2 rounded-lg border border-[#E6E5DC]">
                                Hardware pump control is physically isolated to prevent accidental field actuation.
                            </div>
                        </div>
                    )}
                </div>

                {/* Tour / Onboarding Replay Button */}
                {onOpenOnboarding && (
                    <button
                        onClick={onOpenOnboarding}
                        className="p-1.5 sm:px-2 sm:py-1 rounded-lg text-[#173F35] hover:bg-[#EFEFE7] transition-colors flex items-center gap-1 text-xs font-semibold"
                        title="Replay AgriPulse Tour"
                    >
                        <HelpCircle size={16} className="text-[#173F35]" />
                        <span className="hidden sm:inline text-[0.72rem]">Tour</span>
                    </button>
                )}

                {/* Notifications Center */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="relative p-1.5 sm:p-2 rounded-lg hover:bg-white text-[#252B28] transition-colors border border-transparent hover:border-[#D8D7CD]"
                        aria-label="Active Advisories"
                    >
                        <Bell size={17} />
                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#D94C45] text-white text-[0.62rem] font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto right-0 sm:right-0 top-16 sm:top-auto sm:mt-2 w-auto sm:w-96 bg-white border border-[#D8D7CD] rounded-2xl shadow-2xl p-3.5 z-50 animate-fadeIn">
                            <div className="flex items-center justify-between pb-2 border-b border-[#F0EFEA]">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#173F35] uppercase tracking-wider">
                                        Actionable Insights
                                    </span>
                                    {!isRealAlerts && (
                                        <span className="text-[0.62rem] font-mono px-1.5 py-0.2 rounded bg-[#ECEBE4] text-[#666]">
                                            SIMULATED
                                        </span>
                                    )}
                                </div>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[0.7rem] text-[#173F35] hover:underline font-semibold"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-72 overflow-y-auto divide-y divide-[#F6F5EF] mt-1 space-y-1">
                                {alerts.map((al, idx) => (
                                    <div key={al.id || idx} className="py-2.5 px-1 hover:bg-[#FAF9F5] rounded-xl transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    al.severity === 'CRITICAL' ? 'bg-[#D94C45]' : 'bg-[#E7A944]'
                                                }`} />
                                                <span className="text-xs font-bold text-[#252B28]">
                                                    {al.title}
                                                </span>
                                            </div>
                                            <span className="text-[0.65rem] text-[#858A80] font-mono whitespace-nowrap">
                                                {al.timestamp || "Today"}
                                            </span>
                                        </div>
                                        <p className="text-[0.72rem] text-[#858A80] mt-1 leading-snug">
                                            {al.summary || al.message}
                                        </p>
                                        {al.pumpId && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-[0.65rem] font-mono text-[#173F35] font-semibold bg-[#DCE7D8] px-2 py-0.5 rounded-md">
                                                    Target: {al.pumpId}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        setIsNotifOpen(false);
                                                        if (onInvestigateAlert) onInvestigateAlert(al.id || al.pumpId);
                                                    }}
                                                    className="text-[0.72rem] text-[#173F35] font-bold hover:underline flex items-center gap-1 bg-[#EBF1E8] px-2.5 py-1 rounded-md"
                                                >
                                                    Investigate <ExternalLink size={11} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile Avatar */}
                <div 
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-2 pl-2 border-l border-[#E6E5DC] cursor-pointer"
                    title="User Settings"
                >
                    <div className="w-8 h-8 rounded-full bg-[#173F35] text-[#C7F36B] font-bold flex items-center justify-center text-xs shadow-xs hover:scale-105 transition-transform">
                        {user.displayName ? user.displayName.charAt(0) : 'T'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                        <span className="text-xs font-bold text-[#252B28] leading-tight">
                            {user.displayName || 'Tariq Mansour'}
                        </span>
                        <span className="text-[0.65rem] font-medium text-[#858A80]">
                            {user.role || 'Lead Engineer'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
