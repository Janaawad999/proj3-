import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    BrainCircuit, Wrench, Layers, BarChart3, 
    Settings, BookOpen, LogOut, X, Sparkles, 
    HelpCircle, ChevronRight, ShieldCheck, User
} from 'lucide-react';
import { DATA_PROVENANCE } from '../services/agriPulseData';

const MORE_LINKS = [
    {
        id: 'predictive',
        label: 'Predictive Intelligence',
        desc: 'Weibull RUL failure decay forecasting',
        path: '/predictive',
        icon: BrainCircuit,
        badge: 'RUL'
    },
    {
        id: 'maintenance',
        label: 'Maintenance Work Orders',
        desc: 'Checklists, LOTO safety & spare parts',
        path: '/maintenance',
        icon: Wrench,
        badge: 'P1 Alert'
    },
    {
        id: 'assets',
        label: 'Pump Assets Registry',
        desc: 'Full 18-pump mechanical specifications',
        path: '/assets',
        icon: Layers,
        badge: null
    },
    {
        id: 'analytics',
        label: 'Analytics & Trends',
        desc: 'Historical flow, power & pressure logs',
        path: '/analytics',
        icon: BarChart3,
        badge: null
    },
    {
        id: 'documents',
        label: 'OEM Technical Manuals',
        desc: 'Grundfos, KSB & Sulzer service guides',
        path: '/documents',
        icon: BookOpen,
        badge: 'RAG'
    },
    {
        id: 'settings',
        label: 'Settings & Data Provenance',
        desc: 'Telemetry rates, thresholds & profile',
        path: '/settings',
        icon: Settings,
        badge: null
    }
];

const MobileMoreDrawer = ({ isOpen, onClose, onOpenOnboarding }) => {
    const navigate = useNavigate();
    const location = useLocation();

    if (!isOpen) return null;

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } catch (e) {}
        navigate('/login');
        onClose();
    };

    let user = { displayName: 'Tariq Mansour', role: 'Lead Irrigation Engineer' };
    try {
        const saved = localStorage.getItem('user');
        if (saved) user = JSON.parse(saved);
    } catch (e) {}

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102D27]/60 backdrop-blur-xs md:hidden animate-fadeIn">
            {/* Backdrop click to dismiss */}
            <div className="absolute inset-0" onClick={onClose} />

            {/* Bottom Sheet */}
            <div 
                className="relative w-full bg-[#FAF9F5] border-t border-[#D8D7CD] rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden pb-safe z-10"
            >
                {/* Drag handle pill */}
                <div className="w-12 h-1.5 bg-[#D8D7CD] rounded-full mx-auto mt-3 mb-1" />

                {/* Header */}
                <div className="px-5 py-3 flex items-center justify-between border-b border-[#E6E5DC]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#173F35] text-[#C7F36B] flex items-center justify-center font-bold text-xs">
                            {user.displayName?.charAt(0) || 'T'}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[#173F35]">{user.displayName}</div>
                            <div className="text-[0.68rem] text-[#858A80] font-mono">{user.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-[#EFEFE7] text-[#555A52] flex items-center justify-center hover:bg-[#E4E3DC] transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Navigation Items List */}
                <div className="p-4 overflow-y-auto space-y-1.5 flex-1">
                    <div className="text-[0.65rem] font-mono uppercase tracking-wider text-[#858A80] font-bold px-3 py-1">
                        Application Workspace
                    </div>

                    {MORE_LINKS.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.path)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                                    isActive
                                        ? 'bg-[#173F35] text-white shadow-sm'
                                        : 'bg-white hover:bg-[#F2F1EA] text-[#252B28] border border-[#E6E5DC]/80'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        isActive ? 'bg-[#102D27] text-[#C7F36B]' : 'bg-[#EBF1E8] text-[#173F35]'
                                    }`}>
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-[#173F35]'}`}>
                                            {item.label}
                                        </div>
                                        <div className={`text-[0.68rem] ${isActive ? 'text-[#DCE7D8]' : 'text-[#858A80]'}`}>
                                            {item.desc}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {item.badge && (
                                        <span className={`text-[0.62rem] font-mono font-bold px-1.5 py-0.5 rounded ${
                                            isActive
                                                ? 'bg-[#C7F36B] text-[#173F35]'
                                                : item.badge.includes('Alert') 
                                                    ? 'bg-[#FDECEC] text-[#9E1F1A] border border-[#F8B4B1]'
                                                    : 'bg-[#EBF1E8] text-[#173F35] border border-[#DCE7D8]'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                    <ChevronRight size={14} className={isActive ? 'text-[#C7F36B]' : 'text-[#858A80]'} />
                                </div>
                            </button>
                        );
                    })}

                    {/* Secondary Actions */}
                    <div className="pt-3 border-t border-[#E6E5DC] mt-3 space-y-1.5">
                        <button
                            onClick={() => {
                                onClose();
                                onOpenOnboarding();
                            }}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-[#173F35] hover:bg-[#EFEFE7] transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <HelpCircle size={16} className="text-[#858A80]" />
                                <span>Product Tour & Onboarding</span>
                            </div>
                            <span className="text-[0.65rem] font-mono text-[#858A80]">Replay</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-[#D94C45] hover:bg-[#FDECEC] transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <LogOut size={16} />
                                <span>Sign Out Session</span>
                            </div>
                        </button>
                    </div>

                    {/* Data provenance notice */}
                    <div className="mt-4 p-2.5 rounded-xl bg-[#ECEBE4] border border-[#D5D4CA] text-center">
                        <div className="text-[0.65rem] font-mono text-[#555A52] flex items-center justify-center gap-1 font-bold">
                            <ShieldCheck size={12} className="text-[#173F35]" />
                            <span>{DATA_PROVENANCE.dataSource} • {DATA_PROVENANCE.isoStandard}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileMoreDrawer;
