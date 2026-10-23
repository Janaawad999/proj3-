import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Activity, Sparkles, 
    ScanEye, MoreHorizontal 
} from 'lucide-react';

const MobileBottomNav = ({ onOpenMore, isMoreOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const navTabs = [
        {
            id: 'home',
            label: 'Home',
            path: '/',
            icon: LayoutDashboard,
            isActive: currentPath === '/' || currentPath === '/overview'
        },
        {
            id: 'fleet',
            label: 'Fleet',
            path: '/operations',
            icon: Activity,
            isActive: currentPath === '/operations' || currentPath === '/transactions',
            hasAlertDot: true // Pump P-04 is critical
        },
        {
            id: 'ai',
            label: 'AI Copilot',
            path: '/diagnostics',
            icon: Sparkles,
            isActive: currentPath === '/diagnostics' || currentPath === '/copilots' || currentPath === '/copilot',
            isSpecial: true // Elevated glowing fresh lime button
        },
        {
            id: 'vision',
            label: 'Vision',
            path: '/field-vision',
            icon: ScanEye,
            isActive: currentPath === '/field-vision'
        },
        {
            id: 'more',
            label: 'More',
            onClick: onOpenMore,
            icon: MoreHorizontal,
            isActive: isMoreOpen || ['/predictive', '/maintenance', '/assets', '/analytics', '/settings', '/documents'].some(p => currentPath.startsWith(p))
        }
    ];

    return (
        <nav 
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 agri-glass border-t border-[#D8D7CD]/80 pb-safe shadow-lg"
            aria-label="Mobile Navigation"
        >
            <div className="flex items-center justify-around px-2 pt-2 pb-1.5 max-w-lg mx-auto">
                {navTabs.map(tab => {
                    const Icon = tab.icon;

                    if (tab.isSpecial) {
                        return (
                            <button
                                key={tab.id}
                                onClick={() => navigate(tab.path)}
                                className="relative flex flex-col items-center justify-center -mt-5 group"
                                aria-label="AI Diagnostics Copilot"
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
                                    tab.isActive 
                                        ? 'bg-[#C7F36B] text-[#173F35] ring-4 ring-[#173F35]/20 scale-105 shadow-lime-glow' 
                                        : 'bg-[#173F35] text-[#C7F36B] hover:scale-105 active:scale-95'
                                }`}>
                                    <Sparkles size={20} className={tab.isActive ? 'animate-spin' : ''} style={{ animationDuration: '6s' }} />
                                </div>
                                <span className={`text-[0.62rem] font-extrabold mt-1 tracking-tight ${
                                    tab.isActive ? 'text-[#173F35]' : 'text-[#555A52]'
                                }`}>
                                    AI Copilot
                                </span>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.onClick) {
                                    tab.onClick();
                                } else {
                                    navigate(tab.path);
                                }
                            }}
                            className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 min-w-[56px] min-h-[48px] active:scale-95"
                            aria-label={tab.label}
                        >
                            <div className="relative">
                                <div className={`p-1 rounded-lg transition-colors ${
                                    tab.isActive ? 'bg-[#173F35] text-white' : 'text-[#858A80]'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                {tab.hasAlertDot && !tab.isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#D94C45] ring-2 ring-[#FAF9F5]" />
                                )}
                            </div>
                            <span className={`text-[0.62rem] font-bold mt-0.5 tracking-tight ${
                                tab.isActive ? 'text-[#173F35]' : 'text-[#858A80]'
                            }`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
