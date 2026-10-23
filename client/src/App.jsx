import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ManagerLayout from './components/ManagerLayout';
import LoginScreen from './pages/LoginScreen';
import AgriPulseBrandMark from './components/AgriPulseBrandMark';

// Lazy load AgriPulse core pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LiveOperationsPage = lazy(() => import('./pages/LiveOperationsPage'));
const PredictiveIntelligencePage = lazy(() => import('./pages/PredictiveIntelligencePage'));
const AIDiagnosticsPage = lazy(() => import('./pages/AIDiagnosticsPage'));
const FieldVisionPage = lazy(() => import('./pages/FieldVisionPage'));
const PumpAssetsPage = lazy(() => import('./pages/PumpAssetsPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Retained documentation & library pages
const DocumentsLibrary = lazy(() => import('./pages/DocumentsLibrary'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const DocsViewer = lazy(() => import('./pages/DocsViewer'));

// AgriPulse Living Intelligence loading fallback
const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F5EF] text-[#173F35]">
        <div className="text-center flex flex-col items-center">
            {/* Pulsing AgriPulse Brand Mark */}
            <div className="relative mb-4 animate-pulse">
                <AgriPulseBrandMark size={56} showText={false} />
            </div>
            <div className="text-sm font-extrabold tracking-tight text-[#173F35]">
                Agri<span className="text-[#173F35]">Pulse</span>
            </div>
            <div className="text-[0.68rem] tracking-widest uppercase font-mono text-[#858A80] mt-1">
                Synchronizing Digital Twin Telemetry...
            </div>
        </div>
    </div>
);

function App() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Route */}
                <Route path="/login" element={<LoginScreen />} />

                {/* Protected Application Workspace */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<ManagerLayout />}>
                        {/* 1. Signature Screen: Overview */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/overview" element={<HomePage />} />

                        {/* 2. Live Operations (with /transactions legacy alias) */}
                        <Route path="/operations" element={<LiveOperationsPage />} />
                        <Route path="/transactions" element={<LiveOperationsPage />} />

                        {/* 3. Predictive Intelligence */}
                        <Route path="/predictive" element={<PredictiveIntelligencePage />} />
                        <Route path="/predictive-intelligence" element={<PredictiveIntelligencePage />} />

                        {/* 4. AI Diagnostics (with /copilots legacy alias) */}
                        <Route path="/diagnostics" element={<AIDiagnosticsPage />} />
                        <Route path="/copilots" element={<AIDiagnosticsPage />} />
                        <Route path="/copilot" element={<AIDiagnosticsPage />} />

                        {/* 5. Field Vision (YOLOv8 Crop Disease Detection) */}
                        <Route path="/field-vision" element={<FieldVisionPage />} />

                        {/* 6. Pump Assets */}
                        <Route path="/assets" element={<PumpAssetsPage />} />
                        <Route path="/pumps" element={<PumpAssetsPage />} />

                        {/* 7. Maintenance & Work Orders (with /budgets-goals legacy alias) */}
                        <Route path="/maintenance" element={<MaintenancePage />} />
                        <Route path="/budgets-goals" element={<MaintenancePage />} />

                        {/* 8. Analytics */}
                        <Route path="/analytics" element={<AnalyticsPage />} />
                        <Route path="/analytics/dashboards" element={<AnalyticsPage />} />

                        {/* 9. Settings */}
                        <Route path="/settings" element={<SettingsPage />} />

                        {/* Retained Technical Documentation & Manuals */}
                        <Route path="/documents" element={<DocumentsLibrary />} />
                        <Route path="/docs" element={<DocsPage />} />
                        <Route path="/docs/:slug" element={<DocsViewer />} />
                    </Route>
                </Route>

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}

export default App;
