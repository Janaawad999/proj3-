import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    BrainCircuit,
    Sparkles,
    ScanEye,
    Layers,
    Wrench,
    BarChart3,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    HelpCircle
} from 'lucide-react';
import AgriPulseBrandMark from './AgriPulseBrandMark';
import './Sidebar.css';

const NAV_ITEMS = [
    {
        id: 'overview',
        label: 'Overview',
        path: '/',
        icon: LayoutDashboard,
        badge: null
    },
    {
        id: 'operations',
        label: 'Live Operations',
        path: '/operations',
        icon: Activity,
        badge: '18 Pumps'
    },
    {
        id: 'predictive',
        label: 'Predictive Intelligence',
        path: '/predictive',
        icon: BrainCircuit,
        badge: 'RUL'
    },
    {
        id: 'diagnostics',
        label: 'AI Diagnostics',
        path: '/diagnostics',
        icon: Sparkles,
        badge: 'RAG'
    },
    {
        id: 'field-vision',
        label: 'Field Vision',
        path: '/field-vision',
        icon: ScanEye,
        badge: 'YOLOv8'
    },
    {
        id: 'assets',
        label: 'Pump Assets',
        path: '/assets',
        icon: Layers,
        badge: null
    },
    {
        id: 'maintenance',
        label: 'Maintenance',
        path: '/maintenance',
        icon: Wrench,
        badge: 'P1 Alert'
    },
    {
        id: 'analytics',
        label: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
        badge: null
    },
    {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: Settings,
        badge: null
    }
];

const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // User data
    const [userData] = useState(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return {
                    name: user.displayName || user.name || 'Tariq Mansour',
                    role: user.role || 'Lead Irrigation Specialist'
                };
            } catch (error) {}
        }
        return {
            name: 'Tariq Mansour',
            role: 'Lead Irrigation Specialist'
        };
    });

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        // Also support legacy aliases:
        if (path === '/operations' && location.pathname.startsWith('/transactions')) return true;
        if (path === '/diagnostics' && (location.pathname.startsWith('/copilot') || location.pathname.startsWith('/copilots'))) return true;
        if (path === '/maintenance' && location.pathname.startsWith('/budgets-goals')) return true;
        return location.pathname.startsWith(path);
    };

    return (
        <aside className={`agri-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Top Brand Header */}
            <div className="agri-sidebar-header">
                <div 
                    className="cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <AgriPulseBrandMark 
                        size={32} 
                        showText={!isCollapsed} 
                        textVariant="dark" 
                        subtitle="Living Intelligence" 
                    />
                </div>
                <button
                    onClick={onToggleCollapse}
                    className="agri-sidebar-collapse-btn"
                    title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                </button>
            </div>

            {/* Navigation links */}
            <nav className="agri-sidebar-nav">
                <div className="agri-nav-section-title">
                    {!isCollapsed && <span>TELEMETRY & AI</span>}
                </div>

                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.path);
                    const IconComponent = item.icon;

                    return (
                        <button
                            key={item.id}
                            className={`agri-nav-item ${active ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <span className="agri-nav-icon-wrapper">
                                <IconComponent size={18} className="agri-nav-icon" />
                            </span>

                            {!isCollapsed && (
                                <span className="agri-nav-label-container">
                                    <span className="agri-nav-label">{item.label}</span>
                                    {item.badge && (
                                        <span className={`agri-nav-badge ${
                                            item.badge.includes('Alert') ? 'badge-alert' : ''
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </span>
                            )}

                            {active && <span className="agri-active-bar" />}
                        </button>
                    );
                })}
            </nav>

            {/* Footer with user plate and quick actions */}
            <div className="agri-sidebar-footer">
                {!isCollapsed && (
                    <div className="agri-user-plate">
                        <div className="agri-user-avatar">
                            {userData.name.charAt(0)}
                        </div>
                        <div className="agri-user-info">
                            <div className="agri-user-name">{userData.name}</div>
                            <div className="agri-user-role">{userData.role}</div>
                        </div>
                    </div>
                )}

                <div className={`agri-footer-controls ${isCollapsed ? 'collapsed' : ''}`}>
                    <button
                        onClick={handleLogout}
                        className="agri-footer-btn text-[#D94C45] hover:bg-[#FDECEC]"
                        title="Sign Out"
                    >
                        <LogOut size={16} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
