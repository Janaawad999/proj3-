# AgriPulse — Standalone UI/UX Design Prototype
## Creative Direction: Living Intelligence (Nature + Engineering + Intelligence)

Welcome to the standalone, zero-dependency UI/UX design prototype for **AgriPulse** — an AI-powered predictive maintenance and digital twin platform for agricultural smart irrigation pumps.

This prototype was crafted as a dedicated design deliverable for graduation project evaluation and stakeholder demonstrations. It runs entirely independently of backend APIs or build pipelines, ensuring guaranteed reproducibility and instant exploration.

---

## 1. Quick Launch Instructions

You can run and explore this prototype immediately using any standard web browser.

### Option A: Local HTTP Server (Recommended)
From the repository root or the prototype directory, start a local Python HTTP server:

```bash
# From workspace root:
python3 -m http.server 5174 --directory design-prototype

# Or from inside design-prototype/:
cd design-prototype
python3 -m http.server 5174
```

Then open your browser to:
👉 **[http://localhost:5174](http://localhost:5174)**

> **Note on Port Selection**: Port `5174` is chosen to avoid conflicting with the production React Vite server which runs on port `5173`.

### Option B: Direct Browser Open (Zero Setup)
On macOS, simply execute:
```bash
open /Users/janamac/Desktop/YourApp/design-prototype/index.html
```
Or double-click `index.html` in macOS Finder. All assets (fonts, icons, charts) are delivered via CDN and relative files.

---

## 2. Deliverable Architecture & File Structure

This dedicated `design-prototype/` directory is completely isolated from the existing `client/` and `server/` codebases:

```
design-prototype/
├── index.html        # Clean HTML5 shell with collapsible sidebar & top navbar
├── styles.css        # Living Intelligence design tokens, fluid flow keyframes, custom styling
├── app.js            # State-driven application controller for all 10 views & interactions
├── data.js           # Comprehensive simulated industrial dataset (18 pumps, Weibull, RAG, YOLOv8)
└── README.md         # This comprehensive documentation and review guide
```

Companion Deliverable:
- **`../AGRI_PULSE_UI_UX_DESIGN.md`**: Complete 14-section formal UI/UX specification document.

---

## 3. Visual Identity: Living Intelligence

The design departs entirely from generic dark SCADA dashboards and sterile white SaaS templates:

| Color Token | HEX Code | Purpose in Prototype |
| :--- | :--- | :--- |
| **Warm Ivory** | `#F6F5EF` | Primary canvas background; creates a calm, editorial agricultural aesthetic. |
| **Forest Green** | `#173F35` | Primary brand accent, navigation headers, primary action buttons, active states. |
| **Deep Evergreen** | `#102D27` | High-contrast specialized surfaces: CAD pump twin, AI diagnostic terminal. |
| **Fresh Lime** | `#C7F36B` | High-visibility accent: active sensor probe hotspots, pulse indicators, CTAs. |
| **Sage** | `#DCE7D8` | Soft pill badges, nominal health highlights, clean dividers. |
| **Graphite** | `#252B28` | Primary high-contrast typography and engineering metric numbers. |
| **Muted Stone** | `#858A80` | Secondary metadata, sensor units, axis labels, timestamps. |
| **Amber** | `#E7A944` | Warning state: ISO 10816 Zone C, elevated bearing temperatures (75°C–88°C). |
| **Signal Red** | `#D94C45` | Critical alarm: cavitation harmonics, ISO Zone D vibration (>7.1 mm/s). |

---

## 4. Interactive Features by Screen

The prototype contains all 10 core screens specified in the design brief. Use the left navigation sidebar or screen switchers to test each one:

### 1. Overview Dashboard (Signature Screen)
- **Interactive SVG CAD Centrifugal Pump Twin**:
  - Live animated fluid flow particles (`@keyframes flow-pulse`) inside the suction inlet, volute casing, and discharge nozzle.
  - **Clickable Sensor Probes**: Click on the **Impeller**, **Mechanical Seal**, **Inlet Suction**, **Discharge Nozzle**, or **Motor Stator** to inspect live probe parameters in the adjacent telemetry panel.
- **Fleet Reliability Health Meter**: Proportional breakdown (78% Optimal, 16% Caution, 6% Urgent).
- **24-Hour Telemetry Analysis**:
  - Interactive Chart.js area chart with ISO 10816 Zone C warning threshold at 4.5 mm/s.
  - Tab switchers to toggle between **Vibration (mm/s)**, **Bearing Temp (°C)**, **Pressure (bar)**, and **Current (A)**.
- **Intelligence Briefing & Activity Stream**: Real-time event log and failure warnings.

### 2. Live Operations (`/operations`)
- **Fleet Operations Matrix**: Tabular telemetry overview across all 18 pumps.
- **Sector & Status Filtering**: Filter by Sector (All, Delta-7, Alpha-3, Gamma-12) or Status (Critical, Warning, Healthy, Standby).
- **Slide-out Pump Inspection Drawer**: Click any pump row or "Inspect" button to open an engineering drawer featuring live circular gauges, sensor tolerances, and incident logs.
- **Safe Equipment Control Simulation**:
  - Simulated Variable Frequency Drive (VFD) slider (30 Hz to 60 Hz).
  - Adjusting the frequency triggers a **Two-Person Safety Confirmation Modal** with explicit disclaimers before updating simulated pump speed.

### 3. Predictive Intelligence (`/predictive`)
- **Ranked At-Risk Machinery**: Prioritized list of pumps sorted by estimated time to failure.
- **Weibull Remaining Useful Life (RUL) Curve**:
  - Chart.js curve plotting machine reliability (%) against cumulative operating runtime hours.
  - Interactive inspection of Pump P-04 showing 38-hour failure horizon before catastrophic bearing seizure.
- **Prescriptive Intervention Plan**: Exact spare parts catalog numbers (e.g., SKF 6312 deep groove bearing, Viton mechanical seal kit, ISO VG 46 synthetic grease) and Lockout/Tagout (LOTO) protocols.

### 4. AI Diagnostics (RAG Technical Workspace)
- **Deep Evergreen Dual-Pane Terminal**:
  - **Left Pane**: Contextual conversational diagnostic interface with quick prompt chips (*"Explain P-04 cavitation harmonics"*, *"Recommended bearing lubrication"*).
  - **Right Pane**: Structured diagnostic sheet showing observed telemetry evidence, ranked root causes, retrieved OEM manual excerpts (Grundfos CR 95 Manual & ISO 10816-3), and mandatory LOTO safety protocol.
- **Export Action**: Single-click "Copy Diagnostic Sheet" action for maintenance dispatches.
- **Offline Resilience Demo**: Includes an explicit gateway status indicator and fallback mechanism.

### 5. Field Vision (Computer Vision Foliar Analysis)
- **High-Resolution Canopy Canvas**: Visualizes drone-captured foliar imagery.
- **Interactive Annotation Toggle**:
  - Switch between **Annotated View** (YOLOv8 bounding boxes with confidence scores) and **Raw Canopy View**.
  - Interactive detection classes: *Water Stress & Canopy Desiccation (94.2%)*, *Leaf Rust (91.8%)*, *Healthy Foliage (97.4%)*.
- **Hydraulic Pump Correlation Callout**: Directly cross-references foliar moisture deficit with downstream discharge pressure drops on Pump P-09.

### 6. Pump Assets (`/assets`)
- **Comprehensive Lifecycle Registry**: Detailed asset cards for all 18 pumps across sectors.
- **Engineering Specification Sheet**: Serial numbers, commissioning dates, motor power (kW/HP), rated head (m), impeller diameter (mm), and calibrated ISO 10816 baseline vibration thresholds.

### 7. Maintenance Management (`/maintenance`)
- **Work Order Management Board**: Status tabs (*All*, *In Progress*, *Scheduled*, *Backlog*, *Verified*).
- **Priority-Coded Work Orders**: P1 Critical, P2 High, and P3 Routine work orders with assigned engineers, required parts, and downtime estimates.
- **Create Work Order Modal**: Interactive dialog to draft and dispatch maintenance assignments.

### 8. Engineering Analytics (`/analytics`)
- **Fleet KPIs**: Mean Time Between Failures (MTBF: 4,820h), Mean Time To Repair (MTTR: 3.4h), Overall Fleet Health (87.4%).
- **Hydraulic QH Performance Curve**: Chart comparing actual measured pump operating points against OEM factory design curves to detect head loss and impeller wear.
- **Specific Energy Consumption Chart**: Multi-month energy consumption tracking (kWh per 1,000 m³ water pumped).

### 9. System Settings (`/settings`)
- **Vibration Severity Calibration**: Configurable ISO 10816 Zone C alert (4.5 mm/s) and Zone D trip (7.1 mm/s) thresholds.
- **Hardware Sampling Rate**: Selectable polling frequencies (1,000ms, 2,500ms, 10,000ms).
- **Notification Relay**: Configurable engineer email alerts and SCADA webhook endpoints.

### 10. Authentication / Login (`/login`)
- **Branded Sign-In View**: Editorial Warm Ivory canvas with Deep Evergreen card header.
- **Graduation Evaluation Bypass**: One-click *"Enter as Lead Irrigation Engineer (Demo Access)"* button to instantly authenticate and evaluate the platform.

---

## 5. Strict Academic & Industrial Data Integrity Framework

To maintain the highest level of academic rigor and industrial safety during evaluation:

1. **Clear Data Provenance**:
   - Every telemetry view includes a transparent tag: `[SIMULATED TELEMETRY — SENSOR GATEWAY OFFLINE]`.
   - Computer vision detections are explicitly labeled: `[BENCHMARK MODEL FIXTURE — YOLOv8s]`.
   - Failure predictions are marked: `[WEIBULL RELIABILITY MODEL]`.

2. **Safe Equipment Controls Guardrail**:
   - All physical actuation controls (VFD sliders, Start/Stop switches) are explicitly designated as:
     `[DEMO CONTROL — NO PHYSICAL ACTUATOR CONNECTED]`.
   - Any actuation attempt opens a confirmation dialog stating that no physical command will be sent to real hydraulic infrastructure.

---

## 6. Implementation & Transition Guide (for Production React Client)

When integrating these visual components into the existing React application (`client/src/`):

1. **Palette Mapping**:
   Add the Living Intelligence color tokens to `client/tailwind.config.js`:
   ```javascript
   theme: {
     extend: {
       colors: {
         'warm-ivory': '#F6F5EF',
         'forest-green': '#173F35',
         'deep-evergreen': '#102D27',
         'fresh-lime': '#C7F36B',
         'sage': '#DCE7D8',
         'graphite': '#252B28',
         'muted-stone': '#858A80',
         'signal-red': '#D94C45',
         'industrial-amber': '#E7A944',
       }
     }
   }
   ```

2. **Component Mapping**:
   - `design-prototype/app.js` (Overview CAD Schematic) ➡️ Create `client/src/components/digital-twin/PumpSchematic.tsx`
   - Telemetry Drawer ➡️ Create `client/src/components/telemetry/PumpDrawer.tsx`
   - AI Diagnostics Split Terminal ➡️ Update `client/src/pages/Diagnostics.tsx`
   - Field Vision Canvas ➡️ Update `client/src/pages/FieldVision.tsx`

3. **API Integration**:
   - Connect `data.js` telemetry structures to existing endpoints: `GET /api/pumps`, `GET /api/pumps/:id/telemetry`, `POST /api/diagnostics/query`.
   - If backend endpoints are offline, use the built-in deterministic fallback data fixtures established in `design-prototype/data.js`.
