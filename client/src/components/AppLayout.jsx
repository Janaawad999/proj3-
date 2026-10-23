import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import MobileBottomNav from './MobileBottomNav';
import MobileMoreDrawer from './MobileMoreDrawer';
import OnboardingModal from './OnboardingModal';
import RadarInvestigationModal from './radar/RadarInvestigationModal';

/**
 * AgriPulse AppLayout
 * Mobile-First Living Intelligence shell:
 * - Mobile: Top compact header, main content with bottom padding, floating MobileBottomNav, and MobileMoreDrawer.
 * - Desktop/Tablet: Collapsible Sidebar, sticky TopNavbar, and main content canvas.
 */
const AppLayout = () => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [selectedSector, setSelectedSector] = useState(null);
    const [investigationAlertId, setInvestigationAlertId] = useState(null);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    // Auto-prompt onboarding once if not seen yet
    useEffect(() => {
        try {
            const hasSeen = localStorage.getItem('agripulse_onboarding_completed');
            if (!hasSeen) {
                // Short delay for smooth mounting before showing onboarding
                const timer = setTimeout(() => {
                    setIsOnboardingOpen(true);
                }, 700);
                return () => clearTimeout(timer);
            }
        } catch (e) {}
    }, []);

    return (
        <div className="min-h-screen bg-[#F6F5EF] flex flex-col md:flex-row relative">
            {/* Desktop / Tablet Sidebar (Hidden on mobile via CSS @media) */}
            <Sidebar 
                isCollapsed={isSidebarCollapsed} 
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            />

            {/* Main Application Container */}
            <div 
                className="flex-1 flex flex-col min-w-0 transition-all duration-200"
                style={{
                    // Only apply dynamic sidebar margin on screens md (768px+) and above
                    marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 
                        ? (isSidebarCollapsed ? '68px' : '240px') 
                        : 0
                }}
            >
                {/* Responsive Top Navigation */}
                <TopNavbar 
                    selectedSector={selectedSector}
                    onSelectSector={setSelectedSector}
                    onInvestigateAlert={(id) => setInvestigationAlertId(id)}
                    onOpenOnboarding={() => setIsOnboardingOpen(true)}
                />

                {/* Main Workspace Canvas (pb-24 on mobile ensures bottom nav never clips content) */}
                <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
                    <Outlet context={{ 
                        selectedSector,
                        onSelectSector: setSelectedSector,
                        onInvestigateAlert: (id) => setInvestigationAlertId(id),
                        onOpenOnboarding: () => setIsOnboardingOpen(true)
                    }} />
                </main>
            </div>

            {/* Mobile Bottom Navigation Dock */}
            <MobileBottomNav 
                onOpenMore={() => setIsMoreOpen(true)} 
                isMoreOpen={isMoreOpen} 
            />

            {/* Mobile More Sheet / Drawer */}
            <MobileMoreDrawer 
                isOpen={isMoreOpen} 
                onClose={() => setIsMoreOpen(false)} 
                onOpenOnboarding={() => setIsOnboardingOpen(true)} 
            />

            {/* Product Onboarding & Tour Modal */}
            <OnboardingModal 
                isOpen={isOnboardingOpen} 
                onClose={() => setIsOnboardingOpen(false)} 
            />

            {/* Radar Investigation Modal (Preserved from existing telemetry service) */}
            {investigationAlertId && (
                <RadarInvestigationModal
                    alertId={investigationAlertId}
                    onClose={() => setInvestigationAlertId(null)}
                />
            )}
        </div>
    );
};

export default AppLayout;
