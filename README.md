# AgriPulse — Autonomous Pump Telemetry & Precision Agriculture Frontend

> **AgriPulse** is an industrial-grade precision agriculture and autonomous pump telemetry dashboard built with **React 18** and **Vite**. It provides real-time sensor monitoring, ISO 10816 vibration severity diagnostics, Weibull Remaining Useful Life (RUL) predictive intelligence, YOLOv8 foliar pathology vision scanning, and automated maintenance work orders for large-scale agricultural irrigation sectors.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Status](https://img.shields.io/badge/Frontend-Ready%20for%20Backend-brightgreen.svg)]()
[![Mock Mode](https://img.shields.io/badge/Standalone-100%25%20Functional-173F35.svg)]()

---

## ⚡ Highlights

- **100% Standalone Functionality**: Runs out of the box with realistic industrial mock telemetry. **No backend or database required** to run, demo, test, or evaluate all UI features.
- **Backend-Ready Architecture**: Clean, centralized API service layer (`client/src/services/api/`) with standardized Axios interceptors, JWT token auto-injection, unified error handling, and a 1-flag toggle between mock data and real APIs.
- **Fail-Safe Fallbacks**: Uses `withMockFallback()` to catch network disconnects gracefully during active backend development without white-screening or crashing.
- **Living Intelligence Design**: Styled with the AgriPulse palette: Deep Forest Green (`#173F35`), Fresh Lime (`#C7F36B`), Ivory (`#F6F5EF`), and industrial status alerts. Fully responsive across desktop, tablet, and mobile.
- **Full Backend Integration Specification**: Complete REST contract documented in [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md).

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (tested on Node v20/v24)
- **npm** 9+

### Running the Frontend

```bash
# 1. Navigate to the client directory
cd client

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
```

Open your browser to `http://localhost:5173`.

### 🔑 Demo Login
When prompted at the login screen, click **"1-Tap Demo: Lead Engineer"** or sign in with:
- **Email**: `tariq@agripulse.io`
- **Role**: Lead Reliability Engineer (Al-Waha Sector Alpha)

---

## ⚙️ Configuration: Mock Mode vs Real Backend

AgriPulse includes an environment switch in `client/.env` (or repository root `.env`):

```bash
# Set to 'true' to run independently using rich industrial mock telemetry
# Set to 'false' to connect to a live backend API server
VITE_USE_MOCK_DATA=true

# Base URL for the live backend API
VITE_API_BASE_URL=http://localhost:8000/api/v1

# AI Diagnostics provider (mock | backend | openai)
VITE_AI_PROVIDER=mock
```

### Transitioning to a Live Backend:
1. Copy `.env.example` to `.env`:
   ```bash
   cp client/.env.example client/.env
   ```
2. Set `VITE_USE_MOCK_DATA=false`
3. Update `VITE_API_BASE_URL` to point to your backend server (e.g., `http://localhost:8000/api/v1`)
4. Restart Vite (`npm run dev`)

> **Note on Fail-Safe Development**: If `VITE_USE_MOCK_DATA=false` but the backend is temporarily offline or returns a network error, AgriPulse falls back to mock data transparently, keeping the interface usable while backend routes are under construction.

---

## 📁 Project Structure

```
proj3/
├── BACKEND_INTEGRATION.md      # Complete REST API specification & contracts
├── README.md                   # This documentation
├── .env.example                # Root environment template
└── client/
    ├── .env.example            # Client environment template
    ├── package.json            # Client dependencies & scripts
    ├── vite.config.js          # Vite build & proxy configuration
    ├── tailwind.config.js      # AgriPulse color palette & typography
    └── src/
        ├── App.jsx             # Route definitions & layout wrappers
        ├── main.jsx            # React root mount
        ├── components/         # Reusable UI widgets
        │   ├── TopNavbar.jsx   # Header with breadcrumbs & status pill
        │   ├── MobileDock.jsx  # Floating thumb-friendly bottom nav
        │   ├── Sidebar.jsx     # Desktop navigation drawer
        │   └── ...
        ├── pages/              # Application views
        │   ├── HomePage.jsx                 # Executive telemetry dashboard
        │   ├── LiveOperationsPage.jsx      # Real-time pump telemetry matrix
        │   ├── PumpAssetsPage.jsx          # Asset catalog & pump details
        │   ├── PredictiveIntelligencePage.jsx # Weibull RUL & FFT spectrum
        │   ├── MaintenancePage.jsx         # Work orders & dispatch modal
        │   ├── FieldVisionPage.jsx         # Foliar pathology scan & YOLOv8
        │   ├── AIDiagnosticsPage.jsx       # Agronomic AI copilot
        │   ├── SettingsPage.jsx            # Thresholds & notifications
        │   └── LoginScreen.jsx             # Authentication view
        ├── services/
        │   ├── api.js          # Backward-compatibility export layer
        │   └── api/            # Centralized API Architecture
        │       ├── index.js             # Unified services export barrel
        │       ├── config.js            # Base URL, mock toggles & fallback
        │       ├── endpoints.js         # Canonical REST routes
        │       ├── apiClient.js         # Axios instance & interceptors
        │       ├── pumpService.js       # Pumps catalog & telemetry
        │       ├── alertService.js      # Critical alarm streams
        │       ├── workOrderService.js   # Maintenance work orders
        │       ├── assistantService.js  # AI chat copilot
        │       ├── cropScanService.js   # Image vision diagnostics
        │       ├── dashboardService.js  # System metrics & health scores
        │       ├── settingsService.js   # System preferences
        │       └── authService.js       # Login, logout & session tokens
        └── mocks/              # Standalone Mock Data Layer
            ├── mockData.js     # Curated industrial datasets (18 pumps, sectors)
            └── mockHandlers.js # Async simulation handlers with delay & state
```

---

## 🔌 API Service Architecture

All backend communication is centralized in `client/src/services/api/`:

| Module | Primary Endpoints | Responsibilities |
|---|---|---|
| [`apiClient.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/apiClient.js) | Global | Axios instance with JWT Bearer auto-injection, 401 handling, and normalized error messages. |
| [`pumpService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/pumpService.js) | `/pumps`, `/pumps/:id` | Lists pumps, filters by sector/status, queries telemetry and Weibull health curves. |
| [`alertService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/alertService.js) | `/alerts`, `/alerts/:id/acknowledge` | Retrieves active ISO vibration warnings and emergency telemetry triggers. |
| [`workOrderService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/workOrderService.js) | `/work-orders` | Fetches maintenance work orders and submits new maintenance tickets. |
| [`cropScanService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/cropScanService.js) | `/crops/analyze` | Handles multipart image uploads for foliar leaf pathology detection. |
| [`assistantService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/assistantService.js) | `/assistant/chat` | AI Copilot conversational queries with domain grounding. |
| [`dashboardService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/dashboardService.js) | `/dashboard/summary`, `/dashboard/flow-timeseries` | Aggregated metrics, sector flow timeseries, and efficiency scores. |
| [`settingsService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/settingsService.js) | `/settings` | Vibration thresholds, email notification toggles, and sync intervals. |
| [`authService.js`](file:///Users/janamac/Desktop/proj3/client/src/services/api/authService.js) | `/auth/login`, `/auth/me` | User authentication, token persistence, and profile details. |

For detailed request/response schemas, JSON payloads, query parameters, and field requirements, see **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)**.

---

## 🖥️ Screen & Module Capabilities

1. **Executive Dashboard (`/`)**:
   - Fleet Health index, active pump count, total energy consumption, and aggregated water throughput.
   - 24-hour sector flow comparison chart (Recharts).
   - Real-time Alert stream with ISO 10816 severity levels.

2. **Live Operations (`/live`)**:
   - Real-time telemetry matrix of 18 pumps across Al-Waha Sectors Alpha, Beta, and Gamma.
   - Metrics: Vibration RMS (mm/s), RPM, Pressure (bar), Flow Rate (m³/h), Bearing Temperature (°C).
   - Sector filtering, status chips, and one-click diagnostics.

3. **Pump Assets (`/pumps`)**:
   - Visual catalog cards for Grundfos NK / KSB MegaCPK centrifugal pumps.
   - Search filter by pump name, serial number, or model.
   - Detailed modal displaying operating specs, maintenance records, and sensor status.

4. **Predictive Intelligence (`/predictive`)**:
   - Weibull Remaining Useful Life (RUL) survival curves with 90-day time horizons.
   - Fast Fourier Transform (FFT) vibration spectrum detecting early bearing race defects and cavitation.

5. **Maintenance & Work Orders (`/maintenance`)**:
   - Kanban / table view of open, in-progress, and resolved work orders.
   - Modal for dispatching new work orders with priority (P1 Critical to P4 Routine) and technician assignment.
   - Form validation, loading spinners, and empty states.

6. **Field Vision (`/vision`)**:
   - Drag-and-drop foliar pathology leaf scanner.
   - AI bounding box visualization (Leaf Rust, Powdery Mildew, Early Blight).
   - Agronomic treatment recommendations and severity scoring.

7. **AI Agronomic Diagnostics (`/ai`)**:
   - Domain-grounded chatbot trained on ISO 10816 vibration standards and industrial pump manuals.
   - Preset quick queries (e.g., "Analyze Sector Alpha vibration spike", "Explain bearing fault frequency").

8. **System Settings (`/settings`)**:
   - Configurable alert trigger thresholds (Vibration warning/critical, Temp limits).
   - Notification dispatch settings and telemetry poll frequency.
   - Form validation and dynamic save notifications.

---

## 🎨 Design System & Theme Specifications

- **Background Canvas**: `#F6F5EF` (Warm Ivory)
- **Primary Industrial Accent**: `#173F35` (Deep Forest Green)
- **Living Intelligence Accent**: `#C7F36B` (Fresh Lime)
- **Warning & Critical Alerts**: `#F59E0B` (Amber Warning), `#EF4444` (Critical Red)
- **Card Surfaces**: Pure White `#FFFFFF` with soft borders (`border-[#173F35]/10`) and subtle shadows.
- **Responsive Layout**:
  - Desktop: Collapsible sidebar navigation + industrial telemetry navbar with connection status.
  - Mobile & Tablet: Fixed top breadcrumb bar + thumb-friendly floating bottom dock (`MobileDock.jsx`).

---

## 🛠️ Available Scripts

Run from the `client/` directory:

| Command | Action |
|---|---|
| `npm run dev` | Starts Vite dev server at `http://localhost:5173` with HMR |
| `npm run build` | Bundles and minifies production assets into `dist/` |
| `npm run preview` | Serves the production build locally for verification |

---

## 📋 Handover Checklist for the Backend Developer

- [x] Read [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) for endpoint paths, methods, and expected JSON structures.
- [x] Implement CORS headers allowing requests from `http://localhost:5173`.
- [x] Use `Authorization: Bearer <token>` for authenticated endpoints.
- [x] Set `VITE_USE_MOCK_DATA=false` in `.env` to test endpoints with live data.
- [x] Follow the standardized JSON response wrapper `{ "success": true, "data": { ... } }`.
