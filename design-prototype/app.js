/**
 * AgriPulse Standalone UI/UX Prototype Controller
 * 
 * Manages view switching, interactive pump schematic, telemetry charts,
 * modal dialogs, and simulated AI/equipment actions.
 */

const AppState = {
    currentView: 'overview',
    isSidebarCollapsed: false,
    selectedSectorId: null, // null = all
    selectedPumpId: 'P-04',
    selectedSensorMetric: 'vibration',
    inspectingPumpId: null,
    
    // Equipment controls (simulated)
    simulatedVfdHz: 50.0,
    simulatedPumpRunning: true,
    safetyModalAction: null,
    
    // Field Vision
    fieldVisionIndex: 0,
    showAnnotations: true,
    uploadedImageSrc: null,
    
    // AI Diagnostics
    chatHistory: [
        {
            role: 'assistant',
            text: 'Welcome to **AgriPulse Technical AI Diagnostics**. I am grounded in continuous IoT pump telemetry, ISO 10816 vibration standards, and OEM maintenance manuals.\n\nCurrently inspecting: **Pump P-04 (Grundfos CR 95-2)**. Ask any diagnostic question below or select a suggested topic.',
            timestamp: 'Just now'
        }
    ],

    // Chart.js instances
    charts: {}
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initTopNavbar();
    renderCurrentView();
});

// Setup navigation listeners
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            switchView(view);
        });
    });

    const collapseToggle = document.getElementById('sidebar-toggle');
    if (collapseToggle) {
        collapseToggle.addEventListener('click', toggleSidebar);
    }
}

function toggleSidebar() {
    AppState.isSidebarCollapsed = !AppState.isSidebarCollapsed;
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed', AppState.isSidebarCollapsed);
    }
}

function switchView(viewName) {
    AppState.currentView = viewName;
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initTopNavbar() {
    const sectorBtn = document.getElementById('sector-selector-btn');
    const sectorDropdown = document.getElementById('sector-dropdown');

    if (sectorBtn && sectorDropdown) {
        sectorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sectorDropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', () => {
            sectorDropdown.classList.add('hidden');
        });
    }
}

function selectSector(sectorId) {
    AppState.selectedSectorId = sectorId;
    const label = document.getElementById('current-sector-label');
    if (label) {
        if (!sectorId) {
            label.textContent = "All Irrigation Sectors (18 Pumps)";
        } else {
            const sec = PROTOTYPE_SECTORS.find(s => s.id === sectorId);
            label.textContent = sec ? sec.name : "Sector Selected";
        }
    }
    renderCurrentView();
}

function renderCurrentView() {
    const container = document.getElementById('view-container');
    if (!container) return;

    // Destroy existing charts to prevent memory leak
    Object.keys(AppState.charts).forEach(key => {
        if (AppState.charts[key]) AppState.charts[key].destroy();
    });
    AppState.charts = {};

    switch (AppState.currentView) {
        case 'overview':
            container.innerHTML = renderOverviewHTML();
            initOverviewInteractions();
            break;
        case 'operations':
            container.innerHTML = renderOperationsHTML();
            initOperationsInteractions();
            break;
        case 'predictive':
            container.innerHTML = renderPredictiveHTML();
            initPredictiveInteractions();
            break;
        case 'diagnostics':
            container.innerHTML = renderDiagnosticsHTML();
            initDiagnosticsInteractions();
            break;
        case 'field-vision':
            container.innerHTML = renderFieldVisionHTML();
            initFieldVisionInteractions();
            break;
        case 'assets':
            container.innerHTML = renderAssetsHTML();
            initAssetsInteractions();
            break;
        case 'maintenance':
            container.innerHTML = renderMaintenanceHTML();
            initMaintenanceInteractions();
            break;
        case 'analytics':
            container.innerHTML = renderAnalyticsHTML();
            initAnalyticsInteractions();
            break;
        case 'settings':
            container.innerHTML = renderSettingsHTML();
            initSettingsInteractions();
            break;
        case 'login':
            container.innerHTML = renderLoginHTML();
            initLoginInteractions();
            break;
        default:
            container.innerHTML = `<div class="p-8 text-center text-stone-500">View not found</div>`;
    }

    // Re-initialize Lucide icons in newly rendered HTML
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

/* ==========================================================================
   1. OVERVIEW SCREEN
   ========================================================================== */

function renderOverviewHTML() {
    const activePumps = AppState.selectedSectorId 
        ? PROTOTYPE_PUMPS.filter(p => p.sectorId === AppState.selectedSectorId)
        : PROTOTYPE_PUMPS;

    const activePump = PROTOTYPE_PUMPS.find(p => p.id === AppState.selectedPumpId) || PROTOTYPE_PUMPS[0];
    const totalFlow = activePumps.reduce((acc, p) => acc + (p.metrics.flowRate || 0), 0);
    const totalPower = activePumps.reduce((acc, p) => acc + (p.metrics.powerKw || 0), 0);

    const healthyCount = activePumps.filter(p => p.status === 'HEALTHY' || p.status === 'STANDBY').length;
    const warningCount = activePumps.filter(p => p.status === 'WARNING').length;
    const criticalCount = activePumps.filter(p => p.status === 'CRITICAL').length;
    const totalCount = activePumps.length;

    const healthyPct = Math.round((healthyCount / totalCount) * 100);
    const warningPct = Math.round((warningCount / totalCount) * 100);
    const criticalPct = Math.round((criticalCount / totalCount) * 100);

    return `
        <div class="space-y-6">
            <!-- Editorial Masthead -->
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            AUTONOMOUS FLEET RADAR
                        </span>
                        <span class="agri-badge badge-simulation">
                            ${PROTOTYPE_PROVENANCE.dataSource}
                        </span>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-extrabold text-[#173F35] tracking-tight">
                        Your irrigation network, in focus.
                    </h1>
                    <p class="text-xs md:text-sm text-[#858A80] mt-1 max-w-2xl">
                        Continuous mechanical telemetry, cavitation forecasting, and automated hydraulic balance across 
                        <strong class="text-[#252B28]">${AppState.selectedSectorId ? AppState.selectedSectorId : 'All 3 Irrigation Sectors (18 Smart Pumps)'}</strong>.
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <button onclick="switchView('predictive')" class="agri-btn agri-btn-lime text-xs">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
                        <span>Failure Forecast</span>
                    </button>
                    <button onclick="switchView('operations')" class="agri-btn agri-btn-outline text-xs">
                        <i data-lucide="activity" class="w-3.5 h-3.5"></i>
                        <span>Fleet Matrix</span>
                    </button>
                </div>
            </div>

            <!-- Fleet Status & Health Composition -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div class="lg:col-span-8 agri-card flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full bg-[#173F35]"></span>
                                Fleet Operational State
                            </h3>
                            <span class="text-xs font-mono text-[#858A80]">
                                Total Load: ${totalPower.toFixed(1)} kW
                            </span>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
                            <div>
                                <div class="text-[0.68rem] uppercase font-semibold text-[#858A80]">Monitored Assets</div>
                                <div class="text-2xl font-extrabold text-[#173F35] font-mono mt-0.5">${totalCount} <span class="text-xs text-[#858A80] font-normal">Pumps</span></div>
                                <div class="text-[0.68rem] text-[#858A80]">3 Sectors Active</div>
                            </div>
                            <div>
                                <div class="text-[0.68rem] uppercase font-semibold text-[#858A80]">Total Delivery</div>
                                <div class="text-2xl font-extrabold text-[#173F35] font-mono mt-0.5">${totalFlow.toLocaleString()} <span class="text-xs text-[#858A80] font-normal">L/min</span></div>
                                <div class="text-[0.68rem] text-[#173F35] font-semibold">92% Target Flow</div>
                            </div>
                            <div>
                                <div class="text-[0.68rem] uppercase font-semibold text-[#2E7D32]">Optimal Units</div>
                                <div class="text-2xl font-extrabold text-[#2E7D32] font-mono mt-0.5">${healthyCount}</div>
                                <div class="text-[0.68rem] text-[#2E7D32] font-semibold">${healthyPct}% Healthy</div>
                            </div>
                            <div>
                                <div class="text-[0.68rem] uppercase font-semibold text-[#D94C45]">Urgent Intervention</div>
                                <div class="text-2xl font-extrabold text-[#D94C45] font-mono mt-0.5">${criticalCount} <span class="text-xs font-normal text-[#858A80]">unit</span></div>
                                <div class="text-[0.68rem] text-[#D94C45] font-semibold">P-04 Cavitation</div>
                            </div>
                        </div>

                        <!-- Critical Alert Card -->
                        <div class="bg-[#FDECEC] border border-[#F8B4B1] rounded-md p-3 flex items-start gap-3">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-[#D94C45] mt-0.5 flex-shrink-0"></i>
                            <div class="flex-1 text-xs">
                                <div class="font-bold text-[#9E1F1A] flex items-center justify-between">
                                    <span>CRITICAL ANOMALY: Pump P-04 Bearing Cavitation</span>
                                    <span class="font-mono text-[0.7rem]">RUL: 38 Operating Hours</span>
                                </div>
                                <p class="text-[#7A1C18] mt-0.5 leading-relaxed text-[0.75rem]">
                                    Vibration RMS reached 5.84 mm/s at 1.48 kHz harmonic peak. Risk of inner raceway micro-spalling. Immediate VFD throttle to 45 Hz recommended.
                                </p>
                            </div>
                            <button onclick="AppState.selectedPumpId='P-04'; switchView('predictive')" class="px-2.5 py-1 rounded bg-[#D94C45] text-white font-bold text-[0.7rem] hover:bg-[#B33832]">
                                Inspect Risk
                            </button>
                        </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-[#F0EFEA]">
                        <div class="flex justify-between text-xs font-semibold text-[#858A80] mb-1">
                            <span>Fleet Reliability Proportion</span>
                            <span class="font-mono">${healthyPct}% Optimal • ${warningPct}% Caution • ${criticalPct}% Urgent</span>
                        </div>
                        <div class="h-2 w-full bg-[#EFEFE7] rounded-full overflow-hidden flex">
                            <div style="width: ${healthyPct}%" class="bg-[#173F35]"></div>
                            <div style="width: ${warningPct}%" class="bg-[#E7A944]"></div>
                            <div style="width: ${criticalPct}%" class="bg-[#D94C45]"></div>
                        </div>
                    </div>
                </div>

                <!-- Asset Quick Switcher List -->
                <div class="lg:col-span-4 agri-card flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                Monitored Assets (${activePumps.length})
                            </h3>
                            <span class="text-[0.68rem] text-[#858A80] font-mono">Click to inspect</span>
                        </div>

                        <div class="divide-y divide-[#F6F5EF] max-h-64 overflow-y-auto mt-2">
                            ${activePumps.map(pump => {
                                const isSelected = pump.id === AppState.selectedPumpId;
                                return `
                                    <div 
                                        onclick="AppState.selectedPumpId='${pump.id}'; renderCurrentView();"
                                        class="p-2 rounded cursor-pointer transition-colors flex items-center justify-between ${
                                            isSelected ? 'bg-[#173F35] text-white' : 'hover:bg-[#F6F5EF] text-[#252B28]'
                                        }"
                                    >
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full ${
                                                pump.status === 'CRITICAL' ? 'bg-[#D94C45]' :
                                                pump.status === 'WARNING' ? 'bg-[#E7A944]' : 'bg-[#C7F36B]'
                                            }"></span>
                                            <div>
                                                <div class="font-bold text-xs">${pump.id} — ${pump.name.split('(')[0]}</div>
                                                <div class="text-[0.68rem] font-mono ${isSelected ? 'text-[#DCE7D8]' : 'text-[#858A80]'}">
                                                    ${pump.metrics.flowRate} L/min • ${pump.metrics.dischargePressure} bar
                                                </div>
                                            </div>
                                        </div>
                                        <span class="text-[0.65rem] font-mono font-bold px-1.5 py-0.5 rounded ${
                                            isSelected ? 'bg-[#C7F36B] text-[#173F35]' : 'bg-[#EFEFE7] text-[#555]'
                                        }">
                                            ${pump.healthScore}%
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="pt-3 border-t border-[#F0EFEA] text-xs text-[#858A80] flex justify-between">
                        <span>Digital Twin Target:</span>
                        <span class="font-mono font-bold text-[#173F35]">${activePump.id}</span>
                    </div>
                </div>
            </div>

            <!-- Signature Pump Schematic Visualization -->
            <div>
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-extrabold uppercase tracking-wider text-[#173F35]">
                            CAD Digital Twin Schematic & Telemetry Probes
                        </span>
                        <span class="agri-badge badge-simulation">
                            Focus: ${activePump.name}
                        </span>
                    </div>
                    <span class="text-[0.7rem] text-[#858A80]">
                        Click on probes (VIB, TEMP, BAR, AMPS) to view live readings
                    </span>
                </div>

                ${renderSchematicHTML(activePump)}
            </div>

            <!-- Telemetry Time-Series & Intelligence Brief -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <!-- 24h Telemetry Chart (7 cols) -->
                <div class="lg:col-span-7 agri-card space-y-3">
                    <div class="flex flex-wrap items-center justify-between pb-3 border-b border-[#F0EFEA] gap-2">
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                    24-Hour Telemetry Analysis
                                </h3>
                                <span class="agri-badge badge-simulation">ISO 10816 CLASS II</span>
                            </div>
                            <p class="text-[0.7rem] text-[#858A80] mt-0.5">
                                Parameter: <strong class="text-[#173F35] uppercase">${AppState.selectedSensorMetric}</strong> on ${activePump.id}
                            </p>
                        </div>

                        <!-- Metric Switcher -->
                        <div class="flex gap-1 bg-[#EFEFE7] p-1 rounded text-[0.7rem] font-semibold">
                            <button onclick="setSensorMetric('vibration')" class="px-2 py-0.5 rounded ${AppState.selectedSensorMetric === 'vibration' ? 'bg-[#173F35] text-white' : 'text-[#555]'}">Vibration</button>
                            <button onclick="setSensorMetric('temperature')" class="px-2 py-0.5 rounded ${AppState.selectedSensorMetric === 'temperature' ? 'bg-[#173F35] text-white' : 'text-[#555]'}">Temp</button>
                            <button onclick="setSensorMetric('pressure')" class="px-2 py-0.5 rounded ${AppState.selectedSensorMetric === 'pressure' ? 'bg-[#173F35] text-white' : 'text-[#555]'}">Pressure</button>
                            <button onclick="setSensorMetric('current')" class="px-2 py-0.5 rounded ${AppState.selectedSensorMetric === 'current' ? 'bg-[#173F35] text-white' : 'text-[#555]'}">Current</button>
                        </div>
                    </div>

                    <div class="h-60 w-full relative">
                        <canvas id="overviewTelemetryChart"></canvas>
                    </div>

                    <div class="pt-2 border-t border-[#F0EFEA] flex justify-between text-xs text-[#858A80]">
                        <span class="flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full bg-[#D94C45]"></span>
                            <span>12:00 UTC: Vibration breached ISO 10816 Zone C alert limit (4.5 mm/s)</span>
                        </span>
                        <span class="font-mono text-[#D94C45] font-bold">Peak: 5.88 mm/s</span>
                    </div>
                </div>

                <!-- Intelligence Briefing (5 cols) -->
                <div class="lg:col-span-5 agri-card flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                            <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                                <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#173F35]"></i>
                                Intelligence Briefing
                            </h3>
                            <span class="agri-badge badge-simulation">RAG EVIDENCE</span>
                        </div>

                        <div class="space-y-3 mt-3">
                            ${PROTOTYPE_BRIEFS.map(b => `
                                <div class="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC] text-xs">
                                    <div class="flex items-center justify-between">
                                        <div class="font-bold text-[#252B28] flex items-center gap-1.5">
                                            <span class="w-2 h-2 rounded-full ${b.severity === 'CRITICAL' ? 'bg-[#D94C45]' : 'bg-[#E7A944]'}"></span>
                                            ${b.title}
                                        </div>
                                        <span class="font-mono text-[0.65rem] font-bold bg-[#DCE7D8] text-[#173F35] px-1.5 py-0.5 rounded">${b.pumpId}</span>
                                    </div>
                                    <p class="text-[#555A52] text-[0.72rem] mt-1 leading-snug">${b.summary}</p>
                                    <div class="mt-2 text-[0.7rem] bg-white p-1.5 rounded border border-[#E6E5DC] text-[#173F35]">
                                        <strong>Prescription:</strong> ${b.recommendation}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <button onclick="switchView('diagnostics')" class="mt-4 w-full py-2 rounded bg-[#173F35] text-white font-bold text-xs hover:bg-[#12332B] transition-colors flex items-center justify-center gap-1.5">
                        <span>Open Technical AI Diagnostics</span>
                        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            </div>

            <!-- Activity Stream -->
            <div class="agri-card">
                <div class="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                    <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase flex items-center gap-2">
                        <i data-lucide="clock" class="w-3.5 h-3.5 text-[#173F35]"></i>
                        Chronological Activity Stream
                    </h3>
                    <span class="text-xs text-[#858A80]">Continuous Telemetry Event Audit</span>
                </div>

                <div class="divide-y divide-[#F6F5EF] mt-2">
                    ${PROTOTYPE_ACTIVITIES.map(a => `
                        <div class="py-2.5 flex items-center justify-between text-xs">
                            <div class="flex items-center gap-3">
                                <span class="font-mono text-[#858A80] text-[0.7rem] w-16">${a.time}</span>
                                <span class="agri-badge ${a.type === 'CRITICAL' ? 'badge-critical' : a.type === 'ACTION' ? 'badge-warning' : 'badge-healthy'}">${a.type}</span>
                                <span class="text-[#252B28] font-medium">${a.text}</span>
                            </div>
                            <span class="font-mono text-[0.68rem] text-[#858A80] hidden sm:block">${a.actor}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderSchematicHTML(pump) {
    const isCritical = pump.status === 'CRITICAL';
    const activeSensor = AppState.selectedSensorMetric;

    return `
        <div class="w-full bg-[#102D27] text-[#F6F5EF] rounded-lg p-5 border border-[#1C4B40] relative overflow-hidden select-none">
            <div class="flex flex-wrap items-center justify-between pb-3 border-b border-[#1C4B40]/70 gap-2">
                <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-full bg-[#C7F36B] animate-pulse"></span>
                    <div>
                        <div class="font-extrabold text-sm text-white flex items-center gap-2">
                            <span>${pump.name}</span>
                            <span class="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">${pump.model}</span>
                        </div>
                        <div class="text-[0.7rem] text-[#A0ABA4] font-mono">SN: ${pump.serial} • Centrifugal End-Suction</div>
                    </div>
                </div>

                <div class="flex items-center gap-2 text-[0.68rem] font-mono">
                    <span class="px-2 py-0.5 rounded bg-[#1A463D] text-[#DCE7D8] border border-[#22574C]">ISO 10816 CLASS II</span>
                    <span class="px-2 py-0.5 rounded bg-white/10 text-[#C7F36B]">CAD SCHEMATIC</span>
                </div>
            </div>

            <div class="py-6 flex flex-col md:flex-row items-center justify-center gap-6">
                <!-- SVG Pump Canvas -->
                <div class="relative w-full max-w-xl aspect-[16/9] flex items-center justify-center">
                    <svg viewBox="0 0 720 400" class="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="#C7F36B" stop-opacity="0.8" />
                                <stop offset="50%" stop-color="#48C78E" stop-opacity="0.9" />
                                <stop offset="100%" stop-color="#2AAB91" stop-opacity="0.8" />
                            </linearGradient>
                            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stop-color="#1C4B41" />
                                <stop offset="50%" stop-color="#143831" />
                                <stop offset="100%" stop-color="#0B231E" />
                            </linearGradient>
                            <radialGradient id="alarmGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stop-color="#D94C45" stop-opacity="0.9" />
                                <stop offset="100%" stop-color="#D94C45" stop-opacity="0" />
                            </radialGradient>
                        </defs>

                        <!-- Foundation Skid -->
                        <rect x="60" y="320" width="600" height="24" rx="4" fill="#0D2520" stroke="#1C4B40" stroke-width="2" />
                        <line x1="80" y1="344" x2="640" y2="344" stroke="#C7F36B" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4 4" />

                        <!-- Motor Body (Right) -->
                        <rect x="390" y="140" width="220" height="170" rx="12" fill="url(#metalGrad)" stroke="#2D6B5D" stroke-width="2.5" />
                        <!-- Motor Fins -->
                        ${[0,1,2,3,4,5,6,7,8].map(i => `<line x1="${415 + i*20}" y1="140" x2="${415 + i*20}" y2="310" stroke="#0D2520" stroke-width="2"/>`).join('')}

                        <!-- Terminal Box -->
                        <rect x="440" y="98" width="70" height="42" rx="4" fill="#173F35" stroke="#C7F36B" stroke-width="1.5" />
                        <text x="475" y="124" fill="#C7F36B" font-size="11" font-family="monospace" text-anchor="middle" font-weight="bold">380V</text>

                        <!-- Shaft & Bearing Housing (Center) -->
                        <rect x="320" y="195" width="70" height="60" rx="4" fill="#0D2520" stroke="#2D6B5D" stroke-width="2" />
                        <rect x="300" y="215" width="100" height="20" fill="#858A80" opacity="0.8" />
                        <rect x="250" y="180" width="70" height="90" rx="6" fill="url(#metalGrad)" stroke="#2D6B5D" stroke-width="2" />
                        <circle cx="285" cy="225" r="24" fill="#143831" stroke="#C7F36B" stroke-width="1.5" stroke-dasharray="3 2" />

                        ${isCritical ? `<circle cx="285" cy="225" r="42" fill="url(#alarmGlow)" class="animate-pulse" />` : ''}

                        <!-- Pump Volute (Left) -->
                        <circle cx="160" cy="225" r="85" fill="url(#metalGrad)" stroke="#2D6B5D" stroke-width="3" />
                        <circle cx="160" cy="225" r="62" fill="#0D2520" stroke="#1C4B40" stroke-width="2" />

                        <!-- Rotating Impeller Vanes -->
                        <g transform="translate(160, 225)">
                            ${[0, 60, 120, 180, 240, 300].map(deg => `<path d="M0 0 Q18 20 45 32" fill="none" stroke="${isCritical ? '#E7A944' : '#C7F36B'}" stroke-width="3.5" stroke-linecap="round" transform="rotate(${deg})" />`).join('')}
                            <circle cx="0" cy="0" r="14" fill="#173F35" stroke="#FFFFFF" stroke-width="2" />
                        </g>

                        <!-- Suction Inlet & Discharge Outlet -->
                        <rect x="40" y="205" width="60" height="40" rx="2" fill="url(#metalGrad)" stroke="#2D6B5D" stroke-width="2" />
                        <line x1="40" y1="195" x2="40" y2="255" stroke="#C7F36B" stroke-width="4" stroke-linecap="round" />
                        <text x="65" y="270" fill="#A0ABA4" font-size="10" font-family="monospace" text-anchor="middle">DN100 IN</text>

                        <rect x="135" y="45" width="50" height="95" rx="2" fill="url(#metalGrad)" stroke="#2D6B5D" stroke-width="2" />
                        <line x1="125" y1="45" x2="195" y2="45" stroke="#C7F36B" stroke-width="4" stroke-linecap="round" />
                        <text x="210" y="55" fill="#A0ABA4" font-size="10" font-family="monospace">DN80 OUT</text>

                        <!-- Water Flow Animations -->
                        <path d="M 30 225 L 140 225" fill="none" stroke="url(#flowGrad)" stroke-width="5" class="animate-water-flow" />
                        <path d="M 160 225 Q 110 160 160 50" fill="none" stroke="url(#flowGrad)" stroke-width="5" class="animate-water-flow" />

                        <!-- PROBES (Clickable) -->
                        <!-- 1. VIB -->
                        <g class="cursor-pointer" onclick="setSensorMetric('vibration')">
                            <circle cx="285" cy="170" r="10" fill="${activeSensor === 'vibration' ? '#C7F36B' : isCritical ? '#D94C45' : '#173F35'}" stroke="#FFF" stroke-width="2" />
                            <text x="285" y="152" fill="#FFF" font-size="11" text-anchor="middle" font-weight="bold">VIB</text>
                        </g>

                        <!-- 2. PRESSURE -->
                        <g class="cursor-pointer" onclick="setSensorMetric('pressure')">
                            <circle cx="160" cy="30" r="10" fill="${activeSensor === 'pressure' ? '#C7F36B' : '#173F35'}" stroke="#FFF" stroke-width="2" />
                            <text x="160" y="16" fill="#FFF" font-size="11" text-anchor="middle" font-weight="bold">BAR</text>
                        </g>

                        <!-- 3. TEMP -->
                        <g class="cursor-pointer" onclick="setSensorMetric('temperature')">
                            <circle cx="500" cy="225" r="10" fill="${activeSensor === 'temperature' ? '#C7F36B' : '#173F35'}" stroke="#FFF" stroke-width="2" />
                            <text x="500" y="210" fill="#FFF" font-size="11" text-anchor="middle" font-weight="bold">TEMP</text>
                        </g>

                        <!-- 4. CURRENT -->
                        <g class="cursor-pointer" onclick="setSensorMetric('current')">
                            <circle cx="475" cy="80" r="10" fill="${activeSensor === 'current' ? '#C7F36B' : '#173F35'}" stroke="#FFF" stroke-width="2" />
                            <text x="475" y="66" fill="#FFF" font-size="11" text-anchor="middle" font-weight="bold">AMPS</text>
                        </g>
                    </svg>
                </div>

                <!-- Live Probe Readouts (Right Column) -->
                <div class="w-full md:w-64 flex flex-col gap-2.5">
                    <div class="text-[0.7rem] uppercase tracking-wider font-extrabold text-[#C7F36B] pb-1 border-b border-[#1C4B40] flex justify-between">
                        <span>TELEMETRY PROBES</span>
                        <span class="font-mono text-[#A0ABA4]">LIVE 2.5s</span>
                    </div>

                    <div onclick="setSensorMetric('vibration')" class="p-2.5 rounded cursor-pointer border transition-all ${activeSensor === 'vibration' ? 'bg-[#173F35] border-[#C7F36B]' : 'bg-[#143831] border-[#1C4B40]'}">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-[#DCE7D8]">Bearing Vibration</span>
                            <span class="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded ${isCritical ? 'bg-[#D94C45] text-white' : 'bg-[#C7F36B] text-[#102D27]'}">
                                ${isCritical ? 'ALERT' : 'NOMINAL'}
                            </span>
                        </div>
                        <div class="text-xl font-bold font-mono text-white mt-1">${pump.metrics.vibrationRms} <span class="text-xs text-[#A0ABA4] font-normal">mm/s</span></div>
                        <div class="text-[0.68rem] text-[#E7A944] font-mono">ISO Limit: 4.5 mm/s</div>
                    </div>

                    <div onclick="setSensorMetric('temperature')" class="p-2.5 rounded cursor-pointer border transition-all ${activeSensor === 'temperature' ? 'bg-[#173F35] border-[#C7F36B]' : 'bg-[#143831] border-[#1C4B40]'}">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-[#DCE7D8]">Casing Temperature</span>
                            <span class="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-[#E7A944]/20 text-[#E7A944]">ELEVATED</span>
                        </div>
                        <div class="text-xl font-bold font-mono text-white mt-1">${pump.metrics.casingTemp} <span class="text-xs text-[#A0ABA4] font-normal">°C</span></div>
                        <div class="text-[0.68rem] text-[#A0ABA4] font-mono">Max: 88.0°C</div>
                    </div>

                    <div onclick="setSensorMetric('pressure')" class="p-2.5 rounded cursor-pointer border transition-all ${activeSensor === 'pressure' ? 'bg-[#173F35] border-[#C7F36B]' : 'bg-[#143831] border-[#1C4B40]'}">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-[#DCE7D8]">Discharge Pressure</span>
                            <span class="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-[#C7F36B]/20 text-[#C7F36B]">HEAD</span>
                        </div>
                        <div class="text-xl font-bold font-mono text-white mt-1">${pump.metrics.dischargePressure} <span class="text-xs text-[#A0ABA4] font-normal">bar</span></div>
                        <div class="text-[0.68rem] text-[#A0ABA4] font-mono">Suction: 1.12 bar</div>
                    </div>

                    <div onclick="setSensorMetric('current')" class="p-2.5 rounded cursor-pointer border transition-all ${activeSensor === 'current' ? 'bg-[#173F35] border-[#C7F36B]' : 'bg-[#143831] border-[#1C4B40]'}">
                        <div class="flex justify-between items-center text-xs">
                            <span class="text-[#DCE7D8]">Motor Current</span>
                            <span class="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded bg-[#D94C45]/20 text-[#D94C45]">112% FLA</span>
                        </div>
                        <div class="text-xl font-bold font-mono text-white mt-1">${pump.metrics.motorCurrent} <span class="text-xs text-[#A0ABA4] font-normal">A</span></div>
                        <div class="text-[0.68rem] text-[#C7F36B] font-mono">Flow: ${pump.metrics.flowRate} L/min</div>
                    </div>
                </div>
            </div>

            <div class="mt-2 pt-2 border-t border-[#1C4B40]/70 flex justify-between text-xs text-[#A0ABA4]">
                <div><strong class="text-white">Active Diagnosis:</strong> ${pump.technicianNotes}</div>
                <div class="font-mono text-[0.68rem] text-[#C7F36B]">FLOW VELOCITY: 2.8 m/s</div>
            </div>
        </div>
    `;
}

function setSensorMetric(metric) {
    AppState.selectedSensorMetric = metric;
    renderCurrentView();
}

function initOverviewInteractions() {
    const ctx = document.getElementById('overviewTelemetryChart');
    if (!ctx) return;

    const labels = PROTOTYPE_TIMESERIES.map(d => d.time);
    const dataVals = PROTOTYPE_TIMESERIES.map(d => d[AppState.selectedSensorMetric]);

    AppState.charts.overview = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${AppState.selectedSensorMetric.toUpperCase()} on ${AppState.selectedPumpId}`,
                data: dataVals,
                borderColor: AppState.selectedSensorMetric === 'vibration' ? '#D94C45' : '#173F35',
                backgroundColor: AppState.selectedSensorMetric === 'vibration' ? 'rgba(217, 76, 69, 0.15)' : 'rgba(23, 63, 53, 0.15)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { grid: { display: false }, ticks: { font: { family: 'monospace', size: 10 } } },
                y: { grid: { color: '#E6E5DC' }, ticks: { font: { family: 'monospace', size: 10 } } }
            }
        }
    });
}

/* ==========================================================================
   2. LIVE OPERATIONS SCREEN
   ========================================================================== */

function renderOperationsHTML() {
    const activePumps = AppState.selectedSectorId 
        ? PROTOTYPE_PUMPS.filter(p => p.sectorId === AppState.selectedSectorId)
        : PROTOTYPE_PUMPS;

    const inspectingPump = PROTOTYPE_PUMPS.find(p => p.id === AppState.inspectingPumpId);

    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            LIVE TELEMETRY MATRIX
                        </span>
                        <span class="agri-badge badge-simulation">${PROTOTYPE_PROVENANCE.dataSource}</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Live Fleet Operations
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">High-frequency industrial monitoring across 18 smart pumps.</p>
                </div>

                <div class="flex items-center gap-2 text-xs font-mono">
                    <span class="px-2.5 py-1 rounded bg-white border border-[#D8D7CD] text-[#173F35] font-bold">Online: 16 / 18</span>
                    <span class="px-2.5 py-1 rounded bg-[#FDECEC] border border-[#F8B4B1] text-[#D94C45] font-bold">Alarms: 1</span>
                </div>
            </div>

            <!-- Operations Data Table -->
            <div class="agri-card overflow-hidden p-0">
                <div class="p-3 bg-[#F6F5EF] border-b border-[#E6E5DC] flex justify-between items-center text-xs">
                    <span class="font-bold text-[#173F35] uppercase tracking-wider text-[0.68rem]">18 Industrial Pumping Assets</span>
                    <span class="text-[#858A80] font-mono text-[0.68rem]">Click row for slide-out inspection</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr class="border-b border-[#E6E5DC] bg-white text-[#173F35] font-extrabold uppercase tracking-wider text-[0.68rem]">
                                <th class="p-3">Pump ID</th>
                                <th class="p-3">Model</th>
                                <th class="p-3">Status</th>
                                <th class="p-3 text-right">Flow (L/m)</th>
                                <th class="p-3 text-right">Head (bar)</th>
                                <th class="p-3 text-right">Vib (mm/s)</th>
                                <th class="p-3 text-right">Temp (°C)</th>
                                <th class="p-3 text-right">Current (A)</th>
                                <th class="p-3 text-center">Health</th>
                                <th class="p-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#F0EFEA] font-mono">
                            ${activePumps.map(p => `
                                <tr onclick="openPumpDrawer('${p.id}')" class="hover:bg-[#F6F5EF] cursor-pointer transition-colors">
                                    <td class="p-3 font-bold text-[#173F35]">${p.id}</td>
                                    <td class="p-3 font-sans">
                                        <div class="font-bold text-[#252B28]">${p.name.split('(')[0]}</div>
                                        <div class="text-[0.65rem] text-[#858A80]">${p.model}</div>
                                    </td>
                                    <td class="p-3 font-sans">
                                        <span class="agri-badge ${p.status === 'CRITICAL' ? 'badge-critical' : p.status === 'WARNING' ? 'badge-warning' : 'badge-healthy'}">${p.status}</span>
                                    </td>
                                    <td class="p-3 text-right">${p.metrics.flowRate}</td>
                                    <td class="p-3 text-right">${p.metrics.dischargePressure.toFixed(2)}</td>
                                    <td class="p-3 text-right font-bold ${p.metrics.vibrationRms > 4.5 ? 'text-[#D94C45]' : ''}">${p.metrics.vibrationRms.toFixed(2)}</td>
                                    <td class="p-3 text-right">${p.metrics.casingTemp.toFixed(1)}</td>
                                    <td class="p-3 text-right">${p.metrics.motorCurrent.toFixed(1)}</td>
                                    <td class="p-3 text-center font-bold text-[#173F35]">${p.healthScore}%</td>
                                    <td class="p-3 text-center font-sans">
                                        <button onclick="event.stopPropagation(); openPumpDrawer('${p.id}')" class="text-[0.7rem] font-bold text-[#173F35] hover:underline">Inspect</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Slide-Out Drawer if open -->
            ${inspectingPump ? renderDrawerHTML(inspectingPump) : ''}
            ${renderSafetyModalHTML()}
        </div>
    `;
}

function openPumpDrawer(pumpId) {
    AppState.inspectingPumpId = pumpId;
    renderCurrentView();
}

function closePumpDrawer() {
    AppState.inspectingPumpId = null;
    renderCurrentView();
}

function renderDrawerHTML(pump) {
    return `
        <div class="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-[#D8D7CD] shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
                <div class="flex items-center justify-between pb-3 border-b border-[#F0EFEA]">
                    <div>
                        <span class="text-[0.68rem] font-mono text-[#858A80] uppercase tracking-wider font-extrabold">ASSET INSPECTION DRAWER</span>
                        <h2 class="text-xl font-extrabold text-[#173F35]">${pump.name}</h2>
                    </div>
                    <button onclick="closePumpDrawer()" class="p-1 rounded hover:bg-[#F6F5EF] text-[#858A80]">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                ${pump.status === 'CRITICAL' ? `
                    <div class="mt-4 p-3 bg-[#FDECEC] border border-[#F8B4B1] rounded text-xs text-[#9E1F1A]">
                        <strong>Critical Advisory:</strong> ${pump.failureMode}. Vibration velocity is ${pump.metrics.vibrationRms} mm/s (exceeding ISO 10816 4.5 mm/s limit).
                    </div>
                ` : ''}

                <div class="grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
                    <div class="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                        <div class="text-[0.68rem] text-[#858A80] font-sans">Discharge Pressure</div>
                        <div class="text-lg font-bold text-[#173F35] mt-1">${pump.metrics.dischargePressure} bar</div>
                    </div>
                    <div class="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                        <div class="text-[0.68rem] text-[#858A80] font-sans">Flow Delivery</div>
                        <div class="text-lg font-bold text-[#173F35] mt-1">${pump.metrics.flowRate} L/min</div>
                    </div>
                    <div class="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                        <div class="text-[0.68rem] text-[#858A80] font-sans">Vibration Velocity</div>
                        <div class="text-lg font-bold ${pump.metrics.vibrationRms > 4.5 ? 'text-[#D94C45]' : 'text-[#173F35]'} mt-1">${pump.metrics.vibrationRms} mm/s</div>
                    </div>
                    <div class="p-3 rounded bg-[#F6F5EF] border border-[#E6E5DC]">
                        <div class="text-[0.68rem] text-[#858A80] font-sans">Casing Temp</div>
                        <div class="text-lg font-bold text-[#173F35] mt-1">${pump.metrics.casingTemp} °C</div>
                    </div>
                </div>

                <!-- Safe Equipment Controls -->
                <div class="mt-6 pt-4 border-t border-[#F0EFEA] space-y-4">
                    <div class="flex items-center justify-between">
                        <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#173F35] flex items-center gap-1.5">
                            <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
                            VFD & Actuator Controls
                        </h4>
                        <span class="agri-badge badge-warning">DEMO CONTROL</span>
                    </div>

                    <div class="p-3 rounded bg-[#ECEBE4]/60 border border-[#D5D4CA] text-[0.72rem] text-[#555A52]">
                        <strong>Safety Guardrail:</strong> No physical motor relay connected. Commands operate in simulation mode only.
                    </div>

                    <div>
                        <div class="flex justify-between text-xs font-semibold mb-1">
                            <span>VFD Frequency Target:</span>
                            <span class="font-mono text-[#173F35] font-bold" id="vfd-val">${AppState.simulatedVfdHz} Hz</span>
                        </div>
                        <input type="range" min="30" max="60" step="0.5" value="${AppState.simulatedVfdHz}" oninput="document.getElementById('vfd-val').innerText = this.value + ' Hz'; AppState.simulatedVfdHz = this.value;" class="w-full accent-[#173F35]" />
                    </div>

                    <button onclick="requestSafetyConfirmation('TOGGLE_RUN')" class="w-full py-2 rounded font-bold text-xs flex items-center justify-center gap-2 ${AppState.simulatedPumpRunning ? 'bg-[#D94C45] text-white' : 'bg-[#173F35] text-white'}">
                        <span>${AppState.simulatedPumpRunning ? 'Simulate Motor Trip / Stop' : 'Simulate Motor Start'}</span>
                    </button>
                </div>
            </div>

            <div class="pt-4 border-t border-[#F0EFEA] flex gap-2">
                <button onclick="AppState.selectedPumpId='${pump.id}'; switchView('predictive')" class="flex-1 py-2 rounded bg-[#173F35] text-white text-xs font-bold">RUL Forecast</button>
                <button onclick="AppState.selectedPumpId='${pump.id}'; switchView('diagnostics')" class="flex-1 py-2 rounded bg-[#C7F36B] text-[#173F35] text-xs font-bold">AI Diagnosis</button>
            </div>
        </div>
    `;
}

function requestSafetyConfirmation(action) {
    AppState.safetyModalAction = action;
    const modal = document.getElementById('safety-modal');
    if (modal) modal.classList.remove('hidden');
}

function confirmSafetyAction() {
    if (AppState.safetyModalAction === 'TOGGLE_RUN') {
        AppState.simulatedPumpRunning = !AppState.simulatedPumpRunning;
    }
    const modal = document.getElementById('safety-modal');
    if (modal) modal.classList.add('hidden');
    renderCurrentView();
}

function renderSafetyModalHTML() {
    return `
        <div id="safety-modal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg max-w-sm w-full p-5 border border-[#D8D7CD] shadow-2xl space-y-3">
                <div class="flex items-center gap-2 text-[#D94C45] font-bold text-sm">
                    <i data-lucide="shield-alert" class="w-4 h-4"></i>
                    <span>Confirm Simulated Operation</span>
                </div>
                <p class="text-xs text-[#555A52] leading-relaxed">
                    You are executing a simulated motor control command. This is an isolated software preview; physical motor contactors will not be energized.
                </p>
                <div class="flex justify-end gap-2 pt-2">
                    <button onclick="document.getElementById('safety-modal').classList.add('hidden')" class="px-3 py-1.5 rounded border border-[#D8D7CD] text-xs font-semibold">Cancel</button>
                    <button onclick="confirmSafetyAction()" class="px-3 py-1.5 rounded bg-[#173F35] text-white text-xs font-bold">Confirm Action</button>
                </div>
            </div>
        </div>
    `;
}

function initOperationsInteractions() {}

/* ==========================================================================
   3. PREDICTIVE INTELLIGENCE SCREEN
   ========================================================================== */

function renderPredictiveHTML() {
    const atRisk = PROTOTYPE_PUMPS.filter(p => p.status === 'CRITICAL' || p.status === 'WARNING').sort((a,b) => a.rulHours - b.rulHours);
    const selected = PROTOTYPE_PUMPS.find(p => p.id === AppState.selectedPumpId) || atRisk[0];

    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            RELIABILITY FORESIGHT WORKSPACE
                        </span>
                        <span class="agri-badge badge-simulation">${PROTOTYPE_PROVENANCE.dataSource}</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Predictive Intelligence & Remaining Useful Life
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">Weibull reliability modeling and predicted failure windows.</p>
                </div>
            </div>

            <div class="bg-[#EFEFE7] border border-[#D8D7CD] rounded-md p-3 text-xs text-[#555A52] flex items-center gap-2">
                <i data-lucide="info" class="w-4 h-4 text-[#173F35] flex-shrink-0"></i>
                <span><strong>Mathematical Provenance:</strong> RUL projections are calculated via two-parameter Weibull failure probability modeling (β=2.4, η=1,850h) based on ISO 10816 mechanical degradation.</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <!-- Ranked List (4 cols) -->
                <div class="lg:col-span-4 agri-card divide-y divide-[#F6F5EF]">
                    <div class="pb-3 border-b border-[#F0EFEA] flex justify-between items-center">
                        <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">At-Risk Assets (${atRisk.length})</h3>
                        <span class="text-[0.68rem] font-mono text-[#D94C45] font-bold">Sorted by Urgency</span>
                    </div>

                    <div class="space-y-1.5 pt-2">
                        ${atRisk.map((p, idx) => `
                            <div 
                                onclick="AppState.selectedPumpId='${p.id}'; renderCurrentView();"
                                class="p-3 rounded cursor-pointer transition-all ${p.id === selected.id ? 'bg-[#173F35] text-white' : 'hover:bg-[#F6F5EF] text-[#252B28]'}"
                            >
                                <div class="flex justify-between items-start">
                                    <div class="font-extrabold text-xs">#${idx+1} ${p.id} — ${p.name.split('(')[0]}</div>
                                    <span class="agri-badge ${p.status === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}">${p.status}</span>
                                </div>
                                <div class="text-[0.7rem] ${p.id === selected.id ? 'text-[#C7F36B]' : 'text-[#D94C45]'} font-semibold mt-1">Fault: ${p.failureMode}</div>
                                <div class="flex justify-between text-[0.68rem] font-mono mt-1 ${p.id === selected.id ? 'text-[#DCE7D8]' : 'text-[#858A80]'}">
                                    <span>RUL: <strong>${p.rulHours} Operating Hours</strong></span>
                                    <span>Health: ${p.healthScore}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- RUL Curve & Prescriptions (8 cols) -->
                <div class="lg:col-span-8 space-y-6">
                    <div class="agri-card space-y-3">
                        <div class="flex justify-between items-center pb-3 border-b border-[#F0EFEA]">
                            <div>
                                <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase">
                                    Weibull RUL Degradation Curve — ${selected.name}
                                </h3>
                                <div class="text-[0.7rem] text-[#858A80]">Health % vs Cumulative Runtime Hours (Current: ${selected.cumulativeRuntimeHours}h)</div>
                            </div>
                            <span class="agri-badge badge-critical">WINDOW: ${selected.rulWindow}</span>
                        </div>

                        <div class="h-64 w-full relative">
                            <canvas id="rulDecayChart"></canvas>
                        </div>

                        <div class="pt-2 border-t border-[#F0EFEA] flex justify-between text-xs text-[#858A80]">
                            <span>Current failure probability: <strong class="text-[#D94C45]">88%</strong> within next 38 hours</span>
                            <span class="font-mono text-[#173F35] font-bold">Model Confidence: 94.2%</span>
                        </div>
                    </div>

                    <!-- Action Plan & Parts -->
                    <div class="agri-card">
                        <h4 class="text-xs font-extrabold uppercase tracking-wider text-[#173F35] mb-2 flex items-center gap-1.5">
                            <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
                            Evidence-Based Action Plan & Required Parts
                        </h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                                <div class="font-bold text-[#173F35] mb-1">Required Spare Parts:</div>
                                <ul class="list-disc list-inside text-[#555A52] font-mono text-[0.7rem] space-y-0.5">
                                    <li>SKF 6312 Deep Groove Ball Bearing (C3)</li>
                                    <li>Viton Mechanical Seal Kit #CR95</li>
                                    <li>ISO VG 46 Synthetic Bearing Grease</li>
                                </ul>
                            </div>
                            <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                                <div class="font-bold text-[#173F35] mb-1">Safety & Labor:</div>
                                <div class="text-[#555A52] space-y-1">
                                    <div><strong>Downtime:</strong> 4.5 Hours estimated</div>
                                    <div><strong>LOTO:</strong> Lockout 380V Breaker CB-04</div>
                                    <div><strong>Tech:</strong> Tariq Mansour</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initPredictiveInteractions() {
    const ctx = document.getElementById('rulDecayChart');
    if (!ctx) return;

    AppState.charts.rul = new Chart(ctx, {
        type: 'line',
        data: {
            labels: PROTOTYPE_RUL_CURVE.map(d => d.hours + 'h'),
            datasets: [
                {
                    label: 'Health % (Weibull Model)',
                    data: PROTOTYPE_RUL_CURVE.map(d => d.health),
                    borderColor: '#173F35',
                    backgroundColor: 'rgba(23, 63, 53, 0.2)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Baseline Nominal',
                    data: PROTOTYPE_RUL_CURVE.map(d => d.baseline),
                    borderColor: '#858A80',
                    borderDash: [4, 4],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { font: { family: 'monospace', size: 10 } } },
                y: { min: 0, max: 100, ticks: { font: { family: 'monospace', size: 10 } } }
            }
        }
    });
}

/* ==========================================================================
   4. AI DIAGNOSTICS SCREEN
   ========================================================================== */

function renderDiagnosticsHTML() {
    const pump = PROTOTYPE_PUMPS.find(p => p.id === AppState.selectedPumpId) || PROTOTYPE_PUMPS[0];

    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            RAG TECHNICAL DIAGNOSTIC WORKSPACE
                        </span>
                        <span class="agri-badge badge-simulation">OEM KNOWLEDGE BASE</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        AI Diagnostics & Root Cause Analysis
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">Interactive dialogue on left, verified engineering report and OEM citations on right.</p>
                </div>
            </div>

            <!-- Split Workspace -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <!-- Terminal Chat (7 cols) -->
                <div class="lg:col-span-7 bg-[#102D27] text-white rounded-lg border border-[#1C4B40] shadow-xl flex flex-col h-[650px] overflow-hidden">
                    <div class="p-3 bg-[#0B231E] border-b border-[#1C4B40] flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2">
                            <i data-lucide="bot" class="w-4 h-4 text-[#C7F36B]"></i>
                            <span class="font-bold">AgriPulse Diagnostic Terminal</span>
                            <span class="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">${pump.id}</span>
                        </div>
                        <span class="text-[0.68rem] text-[#A0ABA4]">Model: Flowise Core RAG</span>
                    </div>

                    <div id="diagnostic-chat-scroll" class="flex-1 p-4 overflow-y-auto space-y-3">
                        ${AppState.chatHistory.map(m => `
                            <div class="flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}">
                                <span class="text-[0.65rem] font-mono text-[#A0ABA4] mb-0.5">${m.role === 'user' ? 'Lead Engineer' : 'AgriPulse AI'}</span>
                                <div class="p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-[#173F35] text-white border border-[#2D6B5D]' : 'bg-[#143831] text-[#EFEFE7] border border-[#1C4B40]'}">
                                    ${m.text.replace(/\n/g, '<br/>')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Prompts -->
                    <div class="p-2 bg-[#0B231E] border-t border-[#1C4B40] flex gap-1.5 overflow-x-auto text-[0.7rem]">
                        <button onclick="sendDiagnosticPrompt('Diagnose bearing vibration harmonic on P-04')" class="whitespace-nowrap px-2 py-1 rounded bg-[#173F35] text-[#DCE7D8] hover:bg-[#1C4B41]">Harmonics Diagnosis</button>
                        <button onclick="sendDiagnosticPrompt('What are LOTO safety steps for seal overhaul?')" class="whitespace-nowrap px-2 py-1 rounded bg-[#173F35] text-[#DCE7D8] hover:bg-[#1C4B41]">LOTO Checklist</button>
                        <button onclick="sendDiagnosticPrompt('Cite ISO 10816 Zone limits for CR 95')" class="whitespace-nowrap px-2 py-1 rounded bg-[#173F35] text-[#DCE7D8] hover:bg-[#1C4B41]">ISO Standards</button>
                    </div>

                    <!-- Input -->
                    <div class="p-3 bg-[#0B231E] border-t border-[#1C4B40] flex gap-2">
                        <input id="diag-input" type="text" placeholder="Ask diagnostic question about ${pump.id}..." class="flex-1 bg-[#143831] border border-[#1C4B40] rounded px-3 py-1.5 text-xs text-white placeholder-[#A0ABA4] focus:outline-none focus:border-[#C7F36B]" onkeydown="if(event.key==='Enter') sendDiagnosticInput();" />
                        <button onclick="sendDiagnosticInput()" class="px-3 py-1.5 bg-[#C7F36B] text-[#102D27] font-bold text-xs rounded hover:bg-[#B5E655]">Query</button>
                    </div>
                </div>

                <!-- Structured Report (5 cols) -->
                <div class="lg:col-span-5 agri-card space-y-4 h-[650px] overflow-y-auto">
                    <div class="pb-3 border-b border-[#F0EFEA] flex justify-between items-center">
                        <div>
                            <span class="text-[0.68rem] font-mono text-[#858A80] uppercase font-bold">STRUCTURED RAG REPORT</span>
                            <h3 class="text-base font-extrabold text-[#173F35]">${pump.name}</h3>
                        </div>
                        <button onclick="alert('Diagnostic report copied to clipboard for work order attachment.')" class="agri-btn agri-btn-outline text-[0.7rem] py-1 px-2">Copy Sheet</button>
                    </div>

                    <!-- 1. Observed Evidence -->
                    <div>
                        <div class="text-xs font-bold text-[#173F35] uppercase mb-1.5">1. Observed Telemetry Evidence</div>
                        <div class="p-2.5 bg-[#F6F5EF] rounded border border-[#E6E5DC] text-xs font-mono space-y-1">
                            <div class="flex justify-between"><span class="text-[#858A80]">Vibration:</span> <strong class="text-[#D94C45]">${pump.metrics.vibrationRms} mm/s (ISO Zone C)</strong></div>
                            <div class="flex justify-between"><span class="text-[#858A80]">Acoustic Peak:</span> <strong>1,480 Hz (Cavitation Harmonic)</strong></div>
                            <div class="flex justify-between"><span class="text-[#858A80]">Casing Temp:</span> <strong>${pump.metrics.casingTemp} °C</strong></div>
                        </div>
                    </div>

                    <!-- 2. Root Causes -->
                    <div>
                        <div class="text-xs font-bold text-[#173F35] uppercase mb-1.5">2. Probable Root Causes</div>
                        <div class="space-y-1.5 text-xs">
                            <div class="p-2 rounded bg-[#FDECEC] border border-[#F8B4B1] text-[#9E1F1A]">
                                <div class="font-bold flex justify-between"><span>Inner Bearing Raceway Fatigue</span> <span>88% Prob</span></div>
                                <div class="text-[0.7rem] text-[#7A1C18] mt-0.5">Induced by sustained discharge throttling and inadequate NPSH margin.</div>
                            </div>
                        </div>
                    </div>

                    <!-- 3. OEM Citations -->
                    <div>
                        <div class="text-xs font-bold text-[#173F35] uppercase mb-1.5">3. Retrieved OEM Manual Citations</div>
                        <div class="space-y-2">
                            ${PROTOTYPE_RAG_DOCS.map(doc => `
                                <div class="p-2.5 rounded border border-[#E6E5DC] bg-white text-xs">
                                    <div class="font-bold text-[#173F35] text-[0.72rem]">${doc.title}</div>
                                    <div class="text-[0.65rem] text-[#858A80] font-mono">${doc.section} • ${doc.page}</div>
                                    <p class="mt-1 text-[0.7rem] text-[#555] italic bg-[#F6F5EF] p-1.5 rounded">"${doc.excerpt}"</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- 4. LOTO Protocol -->
                    <div>
                        <div class="text-xs font-bold text-[#D94C45] uppercase mb-1">4. Mandatory LOTO Protocol</div>
                        <div class="p-2.5 rounded bg-[#FDECEC] text-[#7A1C18] font-mono text-[0.7rem] space-y-0.5">
                            <div>1. Lock & Tag 380V Main Breaker CB-04.</div>
                            <div>2. Bleed volute casing drain plug.</div>
                            <div>3. Verify zero hydraulic residual head.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function sendDiagnosticPrompt(promptText) {
    AppState.chatHistory.push({ role: 'user', text: promptText, timestamp: 'Just now' });
    renderCurrentView();

    setTimeout(() => {
        let aiReply = "Analyzing verified telemetry records against ISO 10816 standards...";
        if (promptText.includes('vibration') || promptText.includes('harmonic')) {
            aiReply = "**Diagnostic Synthesis**: The 1.48 kHz acoustic harmonic accompanied by 5.84 mm/s RMS vibration velocity signifies inner raceway micro-spalling. Net Positive Suction Head (NPSH) margin is currently deficient by 1.2 meters due to upstream valve throttling.\n\n**Immediate Action**: Throttle VFD to 45 Hz (-22% load) to prevent bearing seizure and deploy technician for SKF 6312 bearing kit overhaul.";
        } else if (promptText.includes('LOTO')) {
            aiReply = "**LOTO Safety Directive**: Before mechanical disassembly of Grundfos CR 95-2, apply physical padlock on Breaker CB-04, bleed pump volute drain plug, and verify zero line pressure on DN100 isolation valves.";
        } else {
            aiReply = "**Standard Cross-Reference**: ISO 10816-3 Class II medium industrial pumps establish Zone C alert threshold at 4.5 mm/s RMS and Zone D danger cutoff at 7.1 mm/s RMS.";
        }
        AppState.chatHistory.push({ role: 'assistant', text: aiReply, timestamp: 'Just now' });
        renderCurrentView();
        const scrollElem = document.getElementById('diagnostic-chat-scroll');
        if (scrollElem) scrollElem.scrollTop = scrollElem.scrollHeight;
    }, 600);
}

function sendDiagnosticInput() {
    const input = document.getElementById('diag-input');
    if (!input || !input.value.trim()) return;
    sendDiagnosticPrompt(input.value.trim());
}

function initDiagnosticsInteractions() {}

/* ==========================================================================
   5. FIELD VISION (COMPUTER VISION) SCREEN
   ========================================================================== */

function renderFieldVisionHTML() {
    const sample = PROTOTYPE_FIELD_SAMPLES[AppState.fieldVisionIndex];

    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            COMPUTER VISION WORKSPACE
                        </span>
                        <span class="agri-badge badge-simulation">YOLOv8 BENCHMARK</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Field Vision — Crop Stress & Disease Detection
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">Correlating foliar disease and water-stress canopy detections with zone pump pressures.</p>
                </div>

                <div class="flex items-center gap-1 bg-[#EFEFE7] p-1 rounded text-xs font-semibold">
                    ${PROTOTYPE_FIELD_SAMPLES.map((s, idx) => `
                        <button onclick="AppState.fieldVisionIndex=${idx}; AppState.uploadedImageSrc=null; renderCurrentView();" class="px-2.5 py-1 rounded ${AppState.fieldVisionIndex === idx && !AppState.uploadedImageSrc ? 'bg-[#173F35] text-white' : 'text-[#555]'}">
                            ${s.title.split('—')[0].trim()}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Canvas & Agronomic Side Panel -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-7 agri-card space-y-3">
                    <div class="flex justify-between items-center pb-3 border-b border-[#F0EFEA]">
                        <span class="text-xs font-bold text-[#173F35] uppercase">${AppState.uploadedImageSrc ? 'User Uploaded Foliage' : sample.title}</span>
                        <div class="flex gap-2">
                            <button onclick="AppState.showAnnotations=!AppState.showAnnotations; renderCurrentView();" class="agri-btn text-[0.7rem] py-1 px-2 ${AppState.showAnnotations ? 'agri-btn-primary' : 'agri-btn-outline'}">
                                ${AppState.showAnnotations ? 'Annotations Active' : 'Original View'}
                            </button>
                            <label class="agri-btn agri-btn-outline text-[0.7rem] py-1 px-2 cursor-pointer">
                                <span>Upload Image</span>
                                <input type="file" accept="image/*" class="hidden" onchange="handleImageUpload(event)" />
                            </label>
                        </div>
                    </div>

                    <!-- Simulated Image Canvas -->
                    <div class="relative w-full aspect-[4/3] bg-[#102D27] rounded-lg overflow-hidden border border-[#1C4B40] flex items-center justify-center select-none">
                        ${AppState.uploadedImageSrc ? `
                            <img src="${AppState.uploadedImageSrc}" class="w-full h-full object-cover" />
                        ` : `
                            <svg viewBox="0 0 600 450" class="w-full h-full opacity-80">
                                <defs>
                                    <radialGradient id="canopyGrad" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stop-color="#48C78E" />
                                        <stop offset="70%" stop-color="#2AAB91" />
                                        <stop offset="100%" stop-color="#173F35" />
                                    </radialGradient>
                                </defs>
                                <path d="M100 200 C150 100, 300 120, 350 250 C400 380, 200 400, 100 200 Z" fill="url(#canopyGrad)" />
                                <path d="M280 180 C350 80, 500 110, 520 240 C540 370, 380 390, 280 180 Z" fill="url(#canopyGrad)" opacity="0.85" />
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center font-mono text-xs text-white/40">
                                [${sample.crop.toUpperCase()} CANOPY]
                            </div>
                        `}

                        <!-- Bounding boxes -->
                        ${AppState.showAnnotations ? sample.detections.map(d => `
                            <div style="position: absolute; top: ${d.box.y}%; left: ${d.box.x}%; width: ${d.box.w}%; height: ${d.box.h}%; border: 2px solid ${d.color}; background-color: ${d.color}25; border-radius: 4px;">
                                <span style="background-color: ${d.color}; color: ${d.color === '#C7F36B' ? '#173F35' : '#FFF'};" class="text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded shadow">
                                    ${d.label} (${d.confidence}%)
                                </span>
                            </div>
                        `).join('') : ''}
                    </div>

                    <div class="flex justify-between text-xs text-[#858A80]">
                        <span>Resolution: 4032 × 3024 RGB • Multi-spectral normalized</span>
                        <span class="font-mono text-[0.68rem]">Inference: 18ms</span>
                    </div>
                </div>

                <!-- Agronomic Analysis Side Panel (5 cols) -->
                <div class="lg:col-span-5 agri-card space-y-4">
                    <div class="pb-3 border-b border-[#F0EFEA]">
                        <span class="text-[0.68rem] font-mono text-[#858A80] uppercase font-bold">AGRONOMIC DIAGNOSIS</span>
                        <h3 class="text-base font-extrabold text-[#173F35]">${sample.crop}</h3>
                        <div class="text-xs text-[#858A80]">Sector: <strong>${sample.sectorId}</strong></div>
                    </div>

                    <div>
                        <div class="text-xs font-bold text-[#173F35] uppercase mb-1.5">Identified Pathologies (${sample.detections.length})</div>
                        <div class="space-y-1.5">
                            ${sample.detections.map(d => `
                                <div class="p-2.5 rounded bg-[#F6F5EF] border border-[#E6E5DC] flex justify-between items-center text-xs">
                                    <div>
                                        <div class="font-bold text-[#252B28]">${d.label}</div>
                                        <div class="text-[0.68rem] text-[#858A80]">Severity: ${d.severity}</div>
                                    </div>
                                    <span class="agri-badge" style="background-color: ${d.color}30; color: ${d.color === '#173F35' ? '#173F35' : d.color};">${d.confidence}%</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="p-3 bg-[#EBF1E8] rounded border border-[#DCE7D8] text-xs space-y-1">
                        <div class="font-bold text-[#173F35] flex items-center gap-1.5">
                            <i data-lucide="droplets" class="w-3.5 h-3.5"></i>
                            Hydraulic Pump Correlation
                        </div>
                        <p class="text-[#252B28] leading-relaxed text-[0.72rem]">${sample.hydraulicCorrelation}</p>
                        <div class="pt-1.5 border-t border-[#DCE7D8] flex justify-between font-mono font-bold text-[#173F35] text-[0.7rem]">
                            <span>Linked Pump: ${sample.linkedPump}</span>
                            <span>Line Pressure: 3.92 bar</span>
                        </div>
                    </div>

                    <div class="p-3 bg-white rounded border border-[#E6E5DC] text-xs">
                        <div class="font-bold text-[#173F35] mb-0.5">Prescribed Action:</div>
                        <p class="text-[#555] text-[0.72rem] leading-relaxed">${sample.action}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        AppState.uploadedImageSrc = event.target.result;
        renderCurrentView();
    };
    reader.readAsDataURL(file);
}

function initFieldVisionInteractions() {}

/* ==========================================================================
   6. PUMP ASSETS SCREEN
   ========================================================================== */

function renderAssetsHTML() {
    const selected = PROTOTYPE_PUMPS.find(p => p.id === AppState.selectedPumpId) || PROTOTYPE_PUMPS[0];

    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            EQUIPMENT ASSET REGISTRY
                        </span>
                        <span class="agri-badge badge-simulation">18 REGISTERED UNITS</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Pump Assets & Technical Specifications
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">Engineering datasheets, impeller diameters, and commissioning dates.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-5 agri-card divide-y divide-[#F6F5EF] max-h-[600px] overflow-y-auto">
                    ${PROTOTYPE_PUMPS.map(p => `
                        <div onclick="AppState.selectedPumpId='${p.id}'; renderCurrentView();" class="p-3 rounded cursor-pointer transition-colors ${p.id === selected.id ? 'bg-[#173F35] text-white' : 'hover:bg-[#F6F5EF] text-[#252B28]'}">
                            <div class="flex justify-between items-center">
                                <div class="font-extrabold text-xs">${p.id} — ${p.name.split('(')[0]}</div>
                                <span class="agri-badge ${p.status === 'CRITICAL' ? 'badge-critical' : 'badge-healthy'}">${p.status}</span>
                            </div>
                            <div class="text-[0.68rem] ${p.id === selected.id ? 'text-[#DCE7D8]' : 'text-[#858A80]'} mt-0.5">${p.model} • SN: ${p.serial}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="lg:col-span-7 agri-card space-y-4">
                    <div class="pb-3 border-b border-[#F0EFEA] flex justify-between items-start">
                        <div>
                            <span class="text-[0.68rem] font-mono text-[#858A80] uppercase font-bold">SPECIFICATION SHEET</span>
                            <h2 class="text-xl font-extrabold text-[#173F35]">${selected.name}</h2>
                            <div class="text-xs text-[#858A80]">Serial: <strong class="font-mono text-[#252B28]">${selected.serial}</strong></div>
                        </div>
                        <span class="agri-badge ${selected.status === 'CRITICAL' ? 'badge-critical' : 'badge-healthy'}">${selected.status}</span>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                        <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                            <div class="text-[0.68rem] text-[#858A80] font-sans">Architecture</div>
                            <div class="font-bold text-[#173F35] mt-0.5">${selected.model}</div>
                        </div>
                        <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                            <div class="text-[0.68rem] text-[#858A80] font-sans">Rated Power</div>
                            <div class="font-bold text-[#173F35] mt-0.5">${selected.metrics.powerKw} kW (25 HP)</div>
                        </div>
                        <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                            <div class="text-[0.68rem] text-[#858A80] font-sans">Rated Head</div>
                            <div class="font-bold text-[#173F35] mt-0.5">68.5 Meters</div>
                        </div>
                        <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                            <div class="text-[0.68rem] text-[#858A80] font-sans">Impeller Vanes</div>
                            <div class="font-bold text-[#173F35] mt-0.5">185 mm (316 SS)</div>
                        </div>
                        <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                            <div class="text-[0.68rem] text-[#858A80] font-sans">Commissioning</div>
                            <div class="font-bold text-[#173F35] mt-0.5">${selected.installationDate}</div>
                        </div>
                        <div class="p-3 bg-[#F6F5EF] rounded border border-[#E6E5DC]">
                            <div class="text-[0.68rem] text-[#858A80] font-sans">Runtime</div>
                            <div class="font-bold text-[#173F35] mt-0.5">${selected.cumulativeRuntimeHours} Hours</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initAssetsInteractions() {}

/* ==========================================================================
   7. MAINTENANCE SCREEN
   ========================================================================== */

function renderMaintenanceHTML() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            FIELD WORK ORDER DISPATCH
                        </span>
                        <span class="agri-badge badge-simulation">DISPATCH BOARD</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Maintenance & Work Orders
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">Schedule preventive interventions and track LOTO safety execution.</p>
                </div>

                <button onclick="alert('Work order creation modal rendered for academic prototype demo.')" class="agri-btn agri-btn-lime text-xs">
                    <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                    <span>Create Work Order</span>
                </button>
            </div>

            <!-- Work Orders Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                ${PROTOTYPE_WORK_ORDERS.map(wo => `
                    <div class="agri-card flex flex-col justify-between space-y-4 ${wo.priority === 'P1_CRITICAL' ? 'border-[#F8B4B1]' : ''}">
                        <div>
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-xs font-extrabold text-[#173F35] bg-[#DCE7D8] px-2 py-0.5 rounded">${wo.id} • ${wo.pumpId}</span>
                                <span class="agri-badge ${wo.priority === 'P1_CRITICAL' ? 'badge-critical' : 'badge-warning'}">${wo.priority}</span>
                            </div>
                            <h3 class="font-bold text-sm text-[#252B28] mt-2.5 leading-snug">${wo.title}</h3>
                            <div class="mt-2.5 space-y-1 text-xs text-[#555]">
                                <div><strong>Technician:</strong> ${wo.assignedTechnician}</div>
                                <div><strong>Est. Downtime:</strong> ${wo.estimatedDowntimeHours} Hours</div>
                                <div class="text-[#D94C45] font-mono text-[0.7rem]">${wo.safetyRequirements}</div>
                            </div>
                        </div>

                        <div class="pt-2 border-t border-[#F0EFEA] flex justify-between items-center text-xs">
                            <span class="font-mono text-[0.68rem] text-[#858A80]">Status: ${wo.status}</span>
                            <button onclick="this.innerText='Verified'; this.classList.add('text-[#2E7D32]');" class="text-[0.7rem] font-bold text-[#173F35] hover:underline">Mark Verified</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function initMaintenanceInteractions() {}

/* ==========================================================================
   8. ANALYTICS SCREEN
   ========================================================================== */

function renderAnalyticsHTML() {
    return `
        <div class="space-y-6">
            <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E6E5DC] pb-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                            ENGINEERING ANALYTICS
                        </span>
                        <span class="agri-badge badge-simulation">${PROTOTYPE_PROVENANCE.dataSource}</span>
                    </div>
                    <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight">
                        Hydraulic Performance & Energy Analytics
                    </h1>
                    <p class="text-xs text-[#858A80] mt-0.5">Head vs Flow affinity curves, specific energy consumption, and fleet MTBF.</p>
                </div>
            </div>

            <!-- KPIs -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="agri-card">
                    <div class="text-[0.68rem] uppercase font-semibold text-[#858A80]">Mean Time Between Failures</div>
                    <div class="text-2xl font-extrabold text-[#173F35] font-mono mt-1">4,820 <span class="text-xs font-normal text-[#858A80]">Hours</span></div>
                    <div class="text-[0.7rem] text-[#2E7D32] mt-1 font-semibold">+14% vs OEM expectation</div>
                </div>
                <div class="agri-card">
                    <div class="text-[0.68rem] uppercase font-semibold text-[#858A80]">Mean Time To Repair</div>
                    <div class="text-2xl font-extrabold text-[#173F35] font-mono mt-1">3.4 <span class="text-xs font-normal text-[#858A80]">Hours</span></div>
                    <div class="text-[0.7rem] text-[#2E7D32] mt-1 font-semibold">-40 min turnaround</div>
                </div>
                <div class="agri-card">
                    <div class="text-[0.68rem] uppercase font-semibold text-[#858A80]">Fleet Hydraulic Efficiency</div>
                    <div class="text-2xl font-extrabold text-[#173F35] font-mono mt-1">84.6%</div>
                    <div class="text-[0.7rem] text-[#858A80] mt-1">BEP Target: 89%</div>
                </div>
                <div class="agri-card">
                    <div class="text-[0.68rem] uppercase font-semibold text-[#D94C45]">Throttling Loss Ratio</div>
                    <div class="text-2xl font-extrabold text-[#D94C45] font-mono mt-1">11.2%</div>
                    <div class="text-[0.7rem] text-[#D94C45] font-semibold">Over-throttled Pivot B</div>
                </div>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:col-span-6 agri-card space-y-3">
                    <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase pb-2 border-b border-[#F0EFEA]">
                        Hydraulic Head vs Flow (QH Affinity Curve)
                    </h3>
                    <div class="h-60 w-full relative">
                        <canvas id="qhChart"></canvas>
                    </div>
                </div>
                <div class="lg:col-span-6 agri-card space-y-3">
                    <h3 class="text-xs font-extrabold tracking-wider text-[#173F35] uppercase pb-2 border-b border-[#F0EFEA]">
                        Specific Energy Consumption (kWh per 1,000 m³)
                    </h3>
                    <div class="h-60 w-full relative">
                        <canvas id="energyChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function initAnalyticsInteractions() {
    const qhCtx = document.getElementById('qhChart');
    if (qhCtx) {
        AppState.charts.qh = new Chart(qhCtx, {
            type: 'line',
            data: {
                labels: ['100 L/m', '200 L/m', '300 L/m', '400 L/m', '450 L/m', '500 L/m', '600 L/m'],
                datasets: [
                    {
                        label: 'Measured Actual Head (m)',
                        data: [78, 75, 71, 64, 58, 51, 38],
                        borderColor: '#173F35',
                        borderWidth: 2.5
                    },
                    {
                        label: 'Factory OEM Benchmark (m)',
                        data: [80, 77, 73, 68, 64, 59, 48],
                        borderColor: '#858A80',
                        borderDash: [4, 4]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { font: { family: 'monospace', size: 10 } } },
                    y: { ticks: { font: { family: 'monospace', size: 10 } } }
                }
            }
        });
    }

    const enCtx = document.getElementById('energyChart');
    if (enCtx) {
        AppState.charts.energy = new Chart(enCtx, {
            type: 'bar',
            data: {
                labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                datasets: [{
                    label: 'kWh / 1000m³ Delivered',
                    data: [312, 318, 325, 334, 348, 356],
                    backgroundColor: '#173F35',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { ticks: { font: { family: 'monospace', size: 10 } } },
                    y: { min: 250, max: 400, ticks: { font: { family: 'monospace', size: 10 } } }
                }
            }
        });
    }
}

/* ==========================================================================
   9. SETTINGS SCREEN
   ========================================================================== */

function renderSettingsHTML() {
    return `
        <div class="max-w-3xl mx-auto space-y-6">
            <div class="border-b border-[#E6E5DC] pb-4">
                <span class="text-[0.68rem] font-mono tracking-widest uppercase font-extrabold px-2 py-0.5 rounded bg-[#173F35] text-[#C7F36B]">
                    CALIBRATION PREFERENCES
                </span>
                <h1 class="text-3xl font-extrabold text-[#173F35] tracking-tight mt-1">
                    Platform Settings & Alarm Tolerances
                </h1>
            </div>

            <div class="agri-card space-y-4">
                <h3 class="text-xs font-extrabold uppercase tracking-wider text-[#173F35] pb-2 border-b border-[#F0EFEA]">
                    ISO 10816 Vibration Severity Thresholds
                </h3>
                <div class="grid grid-cols-2 gap-4 text-xs">
                    <div>
                        <label class="block font-bold mb-1">Zone C Alert Limit (mm/s RMS):</label>
                        <input type="text" value="4.5" class="w-full p-2 border border-[#D8D7CD] rounded font-mono" />
                    </div>
                    <div>
                        <label class="block font-bold mb-1 text-[#D94C45]">Zone D Danger Limit (mm/s RMS):</label>
                        <input type="text" value="7.1" class="w-full p-2 border border-[#D8D7CD] rounded font-mono text-[#D94C45] font-bold" />
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button onclick="alert('Settings saved to local prototype state.')" class="agri-btn agri-btn-primary text-xs">Save Changes</button>
            </div>
        </div>
    `;
}

function initSettingsInteractions() {}

/* ==========================================================================
   10. LOGIN SCREEN
   ========================================================================== */

function renderLoginHTML() {
    return `
        <div class="max-w-md mx-auto my-12 bg-white border border-[#D8D7CD] rounded-xl shadow-xl overflow-hidden">
            <div class="bg-[#102D27] p-8 text-center text-white border-b border-[#1C4B40]">
                <div class="w-12 h-12 bg-[#173F35] rounded-xl flex items-center justify-center mx-auto mb-3">
                    <span class="w-4 h-4 rounded-full bg-[#C7F36B]"></span>
                </div>
                <h2 class="text-2xl font-extrabold">Agri<span class="text-[#C7F36B]">Pulse</span></h2>
                <p class="text-xs text-[#A0ABA4] mt-1 font-mono uppercase tracking-wider">Living Intelligence Prototype</p>
            </div>

            <div class="p-6 md:p-8 space-y-4 text-xs">
                <div>
                    <label class="block font-bold text-[#252B28] mb-1">Email Address</label>
                    <input type="email" value="t.mansour@agripulse.ai" class="w-full p-2 rounded border border-[#D8D7CD]" />
                </div>
                <div>
                    <label class="block font-bold text-[#252B28] mb-1">Password</label>
                    <input type="password" value="••••••••••••" class="w-full p-2 rounded border border-[#D8D7CD]" />
                </div>
                <button onclick="switchView('overview')" class="w-full py-2.5 rounded bg-[#173F35] text-white font-bold text-xs">Sign In</button>

                <div class="pt-3 border-t border-[#F0EFEA] text-center">
                    <div class="text-[0.68rem] uppercase font-bold text-[#858A80] mb-2">Graduation Project Demo</div>
                    <button onclick="switchView('overview')" class="w-full py-2 rounded bg-[#C7F36B] text-[#173F35] font-extrabold text-xs">
                        Enter as Lead Irrigation Engineer (Demo Access)
                    </button>
                </div>
            </div>
        </div>
    `;
}

function initLoginInteractions() {}
