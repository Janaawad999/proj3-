# AgriPulse UI/UX Design Specification
## Creative Direction: Living Intelligence (Nature + Engineering + Intelligence)

---

## 1. Project Overview & Design Goals

### 1.1 Executive Summary
**AgriPulse** is an advanced AI-powered predictive maintenance and digital twin platform engineered specifically for agricultural smart irrigation pumps. The platform bridges the physical domain of hydraulic infrastructure with artificial intelligence, combining high-frequency IoT sensor telemetry, failure mode forecasting (Weibull Remaining Useful Life), Retrieval-Augmented Generation (RAG) technical diagnostics, and YOLOv8 computer vision for foliar water-stress and crop disease detection.

### 1.2 Creative Direction: Living Intelligence
The visual identity departs from conventional generic dark SCADA systems and standard SaaS templates. It is anchored in three interconnected pillars:
1. **NATURE**: The vitality, organic geometries, and fluid dynamics of living agricultural ecosystems.
2. **ENGINEERING**: The precision, tolerances, structural integrity, and ISO standards of industrial pumping machinery.
3. **INTELLIGENCE**: Clear, transparent, explainable machine learning insights and digital twins that augment human operational decision-making.

### 1.3 Key Design Objectives
- **Editorial Sophistication**: Establish a calm, confident, publication-grade layout with intentional whitespace, varied component scales, and clear visual hierarchy.
- **High Information Density**: Enable senior irrigation engineers and operators to scan 18 pumps, multiple hydraulic sectors, and hundreds of sensor streams without cognitive overload.
- **Data Integrity & Honesty**: Clearly demarcate real live telemetry from simulated benchmark models, preventing deceptive AI hallucinations or accidental hardware control actuations.
- **Industrial Precision**: Incorporate authentic engineering schematics, ISO 10816 vibration standards, and affinity curves.

---

## 2. User Personas & Key User Journeys

### 2.1 Target Personas

#### Persona 1: Lead Irrigation Engineer (Tariq Mansour, 42)
- **Role**: Oversees 18 industrial booster and intake pumps across 4,370 hectares in the Nile Delta & Western Desert.
- **Goals**: Zero unscheduled irrigation stoppages; maintain required line pressures (4.5 to 7.0 bar) across all pivot and drip sectors; optimize motor power draw (kWh/1,000 m³).
- **Pain Points**: Sudden bearing failures, hydraulic cavitation during manual valve throttling, lack of visibility into remaining pump lifespan.
- **Primary Interface**: Overview Dashboard, Live Operations, Predictive Intelligence, Engineering Analytics.

#### Persona 2: Agronomy & Foliar Health Specialist (Dr. Salma Fayed, 35)
- **Role**: Monitors crop canopy vigor, soil moisture deficit, and early foliar pathology across citrus, wheat, and maize fields.
- **Goals**: Rapidly diagnose whether localized crop wilting is caused by fungal pathogens or irrigation line pressure drops.
- **Pain Points**: Disconnect between field scouting observations and pumping station telemetry.
- **Primary Interface**: Field Vision (YOLOv8 Computer Vision), AI Diagnostics, Overview.

#### Persona 3: Mechanical Field Technician (Ahmed El-Sayed, 29)
- **Role**: Dispatched on-site to inspect mechanical seals, replace bearings, align drive shafts, and grease pump assemblies.
- **Goals**: Clear, concise step-by-step repair checklists, exact spare part numbers (e.g. SKF 6312, Viton O-rings), and verified Lockout/Tagout (LOTO) safety procedures.
- **Pain Points**: Ambiguous fault descriptions, missing OEM manuals in the field, hazardous electrical environments.
- **Primary Interface**: Maintenance Work Orders, AI Diagnostics (RAG Manuals), Mobile Tablet View.

### 2.2 Key User Journeys

```
[Telemetry Anomaly Ingestion] 
       │ (Vibration > 4.5 mm/s ISO 10816 Zone C)
       ▼
[Overview Dashboard Callout] ──► [Click Pump P-04]
       │
       ▼
[Predictive Intelligence Workspace]
       │ (Weibull Curve reveals RUL = 38 Hours)
       ▼
[AI Diagnostics RAG Analysis]
       │ (Cross-references Grundfos CR 95 Manual & Cavitation Harmonics)
       ▼
[Automated Work Order Dispatch] ──► [Assigned to Ahmed El-Sayed with LOTO Protocol]
```

---

## 3. Design Tokens & Color Palette

### 3.1 Palette Architecture
The palette pairs a warm, natural organic ground with precision industrial greens and functional accent colors:

| Token Name | HEX Code | RGB | Role / Usage Rules |
| :--- | :--- | :--- | :--- |
| **Warm Ivory** | `#F6F5EF` | `rgb(246, 245, 239)` | Primary canvas and application page background. Delivers calm, editorial feel. Never replace with stark clinical white `#FFFFFF` or dark SCADA black. |
| **Forest Green** | `#173F35` | `rgb(23, 63, 53)` | Primary brand color, navigation indicator, primary buttons, table headers, and brand marks. |
| **Deep Evergreen** | `#102D27` | `rgb(16, 45, 39)` | High-contrast specialized surfaces: CAD pump schematics, AI Diagnostics split-terminal, and telemetry charts. |
| **Fresh Lime** | `#C7F36B` | `rgb(199, 243, 107)` | High-impact accent: active probe hotspots, primary CTAs, live sensor status pulses, and active navigation bars. |
| **Sage** | `#DCE7D8` | `rgb(220, 231, 216)` | Soft background badges, nominal health states, and subtle section dividers. |
| **Graphite** | `#252B28` | `rgb(37, 43, 40)` | Primary high-contrast typography, metrics, and headings. |
| **Muted Stone** | `#858A80` | `rgb(133, 138, 128)` | Secondary typography, timestamps, engineering units, and axis grid labels. |
| **Amber** | `#E7A944` | `rgb(231, 169, 68)` | Warning state: ISO Zone B/C threshold breaches, elevated temperatures (75°C–88°C), and demo controls. |
| **Signal Red** | `#D94C45` | `rgb(217, 76, 69)` | Critical alarm state: cavitation, ISO Zone D vibration (>7.1 mm/s), and immediate motor trips. |

---

## 4. Typography System

### 4.1 Typeface Families
- **Primary Sans-Serif**: `Manrope` (alternatively `Inter`), weights 400, 500, 600, 700, 800.
- **Engineering Monospace**: `JetBrains Mono` (alternatively `ui-monospace`), weights 400, 500, 700.
- **Numerical Rule**: All numerical readouts, timestamps, sensor coordinates, and telemetry charts **MUST** use `font-variant-numeric: tabular-nums` to eliminate layout jitter during live telemetry polling.

### 4.2 Type Scale Hierarchy
- **Display 1 (Masthead)**: 36px / 44px Line-height / Weight 800 / Tracking -0.025em / Color: Forest Green `#173F35`
- **Heading 1 (Screen Title)**: 28px / 36px Line-height / Weight 800 / Tracking -0.02em / Color: Forest Green `#173F35`
- **Heading 2 (Card Title)**: 18px / 24px Line-height / Weight 700 / Tracking -0.01em / Color: Graphite `#252B28`
- **Heading 3 (Section Subtitle)**: 14px / 20px Line-height / Weight 700 / Uppercase / Tracking +0.08em / Color: Forest Green `#173F35`
- **Body Large**: 15px / 22px Line-height / Weight 500 / Color: Graphite `#252B28`
- **Body Regular**: 13px / 18px Line-height / Weight 400 / Color: Graphite `#252B28`
- **Caption / Metadata**: 11px / 15px Line-height / Weight 500 / Color: Muted Stone `#858A80`
- **Engineering Metric Readout**: 22px–28px / Weight 700 / Tabular Figures / Font: JetBrains Mono

---

## 5. Spacing, Grid, Borders & Radii

### 5.1 Grid & Spacing System
- Strict **8px baseline grid** (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- Page container max-width: `1400px` centered with fluid gutters (`16px` on mobile, `24px` on tablet, `32px` on desktop).

### 5.2 Geometry & Corner Radii
- Small tags / badges: `4px` radius.
- Standard buttons & inputs: `6px` radius.
- Dashboard cards & panels: `8px` radius.
- Large specialized containers (CAD schematic, AI Terminal): `10px` radius.
- Avoid pill-shaped oversized cards or bubbly geometry.

### 5.3 Borders & Shadows
- **Standard Border**: `1px solid #D8D7CD`
- **Subtle Divider**: `1px solid #E6E5DC`
- **Evergreen Border**: `1px solid #1C4B40`
- **Subtle Drop Shadow**: `0 1px 3px rgba(23, 63, 53, 0.04), 0 1px 2px rgba(23, 63, 53, 0.02)`
- **Panel Shadow**: `0 4px 14px rgba(23, 63, 53, 0.05)`
- **Deep Evergreen Shadow**: `0 12px 30px rgba(16, 45, 39, 0.25)`

---

## 6. Information Architecture & Navigation

```
AgriPulse Application Shell
│
├── Left Slim Sidebar (Collapsible 240px ◄► 68px)
│   ├── Brand Mark & Logo (AgriPulse Living Intelligence)
│   ├── Navigation Items (9 Core Screens)
│   └── User Engineer Plate & Sign Out
│
├── Top Minimal Navigation Bar (Sticky 56px)
│   ├── Global Irrigation Sector Selector (Sector Delta-7, Alpha-3, Gamma-12)
│   ├── Live System Connection Monitor (Connected ◄► Degraded ◄► Offline)
│   ├── Anomaly Notification Center Popover (with unread alert counts)
│   └── User Role Badge (Lead Irrigation Engineer)
│
└── Main Workspace Canvas (Warm Ivory #F6F5EF)
    ├── 1. Overview (Signature Screen)
    ├── 2. Live Operations (/operations)
    ├── 3. Predictive Intelligence (/predictive)
    ├── 4. AI Diagnostics (/diagnostics)
    ├── 5. Field Vision (/field-vision)
    ├── 6. Pump Assets (/assets)
    ├── 7. Maintenance (/maintenance)
    ├── 8. Analytics (/analytics)
    ├── 9. Settings (/settings)
    └── Authentication (/login)
```

---

## 7. Detailed Screen-by-Screen Specifications

### 7.1 Screen 1: Overview (Signature Screen)
- **Visual Goal**: Immediately communicate fleet health and critical risk without resorting to six identical cards.
- **Composition**:
  1. **Editorial Masthead**: *"Your irrigation network, in focus."* with live sector context.
  2. **Operational Fleet State Card**: Asymmetrical 8-column card featuring monitored asset count, total flow throughput (4,820 L/min), active electrical load (142 kW), and an urgent risk alert callout for Pump P-04.
  3. **Reliability Health Bar**: Proportional health meter (78% Optimal, 16% Caution, 6% Urgent).
  4. **Signature CAD Pump Schematic**: Interactive SVG engineering visualization of an industrial centrifugal pump. Highlights suction inlet, volute casing, rotating impeller, mechanical seal, and motor housing. Includes animated water flow arrows and interactive probe callouts.
  5. **24-Hour Telemetry Analysis**: Refined area chart with ISO 10816 Zone C threshold line (4.5 mm/s RMS) and metric switcher tabs (Vibration, Temperature, Pressure, Current).
  6. **Intelligence Briefing**: Curated failure advisories with verified telemetry evidence.
  7. **Activity Stream**: Chronological system event log.

### 7.2 Screen 2: Live Operations
- **Visual Goal**: High-information operational matrix for real-time SCADA telemetry.
- **Composition**:
  - Filter bar: Sector dropdown, status filter (All, Critical, Warning, Healthy, Standby), and multi-field text search.
  - Multi-column data table: Pump ID, Location, Status, Flow (L/min), Pressure (bar), Vibration (mm/s), Temperature (°C), Current (A), Health Score, Quick Actions.
  - Slide-out Pump Inspection Drawer: Opens from right edge with gauge dials, sensor tolerance checks, and incident logs.
  - **Safe Equipment Controls Guardrail**: Simulated VFD frequency slider (30 Hz to 60 Hz) and Start/Stop toggle, guarded by safety confirmation dialogs and persistent `[DEMO CONTROL]` warning tags.

### 7.3 Screen 3: Predictive Intelligence
- **Visual Goal**: Communicate engineering foresight rather than simple lists.
- **Composition**:
  - Ranked at-risk pumps sorted by failure urgency (P-04 Bearing Cavitation, P-09 Discharge Flange Drop, P-12 Phase Imbalance).
  - Remaining Useful Life (RUL) Curve: Weibull reliability decay graph plotting Health % vs Operating Runtime Hours, marking the current operating point and failure horizon.
  - Prescriptive Intervention Timeline: Gantt-style intervention windows (Immediate VFD throttling, 38h bearing replacement, 96h flange renewal).
  - Recommended Action Plan: Lists exact required spare parts (e.g. SKF 6312 bearing, Viton seal kit, ISO VG 46 grease) and LOTO safety protocols.

### 7.4 Screen 4: AI Diagnostics (RAG Technical Workspace)
- **Visual Goal**: Specialized technical diagnostic terminal rather than an ordinary chat window.
- **Composition**:
  - Deep Evergreen (`#102D27`) split layout.
  - **Left Pane (Interactive Dialogue)**: Contextual pump selector, conversation history with markdown rendering, suggested diagnostic prompts, and message input.
  - **Right Pane (Structured Diagnostic Sheet)**:
    1. Observed Evidence: Vibration velocity, acoustic cavitation harmonics (1,480 Hz), casing temperature.
    2. Probable Root Causes: Ranked by probability.
    3. Retrieved OEM Manual Citations: Verified excerpts from Grundfos CR 95 manual and ISO 10816 standards.
    4. Mandatory Safety Protocol: Lockout/Tagout (LOTO) Padlock procedures.
    5. Single-click "Copy Diagnostic Sheet" action.
  - **Strict Integrity Rule**: If the external LLM backend is offline, the interface displays an explicit offline alert and presents deterministic OEM manual citations instead of generating fake diagnostics.

### 7.5 Screen 5: Field Vision (Computer Vision)
- **Visual Goal**: High-resolution agronomic pathology canvas correlating canopy health with irrigation hydraulics.
- **Composition**:
  - Focal image canvas with Original vs Annotated view toggle.
  - YOLOv8 pathology bounding boxes with confidence scores (Water Stress & Canopy Desiccation 94.2%, Leaf Rust 91.8%, Healthy Foliage 97.4%).
  - Hydraulic Pump Correlation: Directly correlates foliar moisture stress with localized pressure drops on pump P-09.
  - Drag-and-drop image uploader and preset agricultural drone benchmarks.
  - Transparent `[BENCHMARK MODEL FIXTURE]` attribution badge.

### 7.6 Screen 6: Pump Assets
- **Visual Goal**: Industrial equipment specification sheets and lifecycle registry.
- **Composition**:
  - Searchable asset list with serial numbers and health scores.
  - Selected asset engineering datasheet: Model architecture, rated kW/HP, rated head, impeller diameter, commissioning date, cumulative runtime.
  - Calibrated ISO 10816 vibration tolerance limits.

### 7.7 Screen 7: Maintenance Management
- **Visual Goal**: Clear work-order dispatch with priority tracking.
- **Composition**:
  - Status filter tabs (All, Scheduled, In Progress, Backlog, Verified).
  - Work order cards with priority badges (P1 Critical, P2 High, P3 Routine).
  - Modal form for creating work orders: Target pump asset, priority, assigned technician, estimated downtime, and LOTO safety instructions.

### 7.8 Screen 8: Analytics
- **Visual Goal**: Professional data journalism combined with engineering analytics.
- **Composition**:
  - Fleet MTBF (4,820h) and MTTR (3.4h) metrics.
  - Hydraulic Performance Curve (Head vs Flow QH curve): Actual measured curve vs OEM factory baseline.
  - Specific Energy Consumption: Bar chart tracking kWh per 1,000 m³ water delivered over 6 months.

### 7.9 Screen 9: Settings
- **Visual Goal**: Industrial sensor tolerance calibration and notification routing.
- **Composition**:
  - ISO 10816 vibration severity limits (Zone C alert, Zone D danger).
  - Hardware sampling rate selector (1,000ms, 2,500ms, 10,000ms).
  - On-duty engineer email and SCADA webhook relay configuration.

### 7.10 Screen 10: Authentication / Login
- **Visual Goal**: Welcoming, professional entry point reflecting Living Intelligence.
- **Composition**:
  - Centered card with Deep Evergreen brand header and vector AgriPulse logo mark.
  - Form inputs for email, password, and sign-in.
  - Academic evaluation bypass button: *"Enter as Lead Irrigation Engineer (Demo Access)"* for immediate prototype review.

---

## 8. Data Visualization Guidelines

1. **ISO 10816 Threshold Demarcation**:
   - Always display reference threshold lines on vibration velocity charts:
     - `1.8 mm/s`: Zone A (New machine commissioning)
     - `4.5 mm/s`: Zone C (Alert / Maintenance required)
     - `7.1 mm/s`: Zone D (Critical Danger / Automated Trip)
2. **Chart Styling**:
   - Area charts must use subtle linear gradients fading to zero opacity at the baseline.
   - Grid lines: `1px dashed #E6E5DC` (vertical grid lines hidden to reduce visual noise).
   - Tooltips: Deep Evergreen background (`#102D27`) with monospaced tabular figures.
3. **Hydraulic Affinity Curves**:
   - Factory OEM curves shown as dashed reference lines (`stroke-dasharray="4 4"`).
   - Measured actual operating curves shown as solid Forest Green lines (`#173F35`).

---

## 9. AI Diagnostics & RAG Presentation Rules

1. **Evidence Grounding**: Every AI recommendation must cite:
   - Specific telemetry parameters (vibration amplitude, frequency peak in Hz, temperature delta).
   - Exact OEM document title, section number, and page.
2. **Probability Transparency**: Failure mode probabilities must be displayed as calibrated confidence scores (e.g., `88% Prob`).
3. **Safety Prioritization**: Lockout/Tagout (LOTO) protocols and high-voltage warnings must always be formatted in Signal Red alert cards before mechanical disassembly steps.
4. **Offline Resilience**: When an external LLM endpoint fails or is unconfigured, the UI must explicitly display:
   > **AI Gateway Offline (HTTP 502)**: *Could not contact LLM diagnostic service. Reviewing static OEM technical manuals below.*
   Under no circumstances may the system generate fabricated AI diagnoses when disconnected.

---

## 10. Data Provenance & Safety Controls Framework

| Data Element | Real vs. Simulated Handling | UI Badge / Label Requirement |
| :--- | :--- | :--- |
| **Authentication & User Profile** | Real API (`/api/auth`) with demo fallback | `[AUTHENTICATED USER]` |
| **IoT Pump Telemetry** | Simulated engineering benchmark fixtures | `[SIMULATED TELEMETRY — SENSOR GATEWAY OFFLINE]` |
| **Physical VFD & Motor Controls** | Simulated demo controls; no physical actuators | `[DEMO CONTROL — NO PHYSICAL ACTUATOR]` + Confirmation Modal |
| **YOLOv8 Foliar Detections** | Pre-computed benchmark test set fixtures | `[BENCHMARK MODEL FIXTURE — YOLOv8s]` |
| **Weibull RUL Forecasting** | Parametric mathematical degradation model | `[WEIBULL RELIABILITY MODEL]` |

---

## 11. Accessibility & Responsive Breakpoints

### 11.1 Accessibility Standards (WCAG 2.1 AA)
- Contrast ratio between text and background exceeds 4.5:1 (Graphite `#252B28` on Warm Ivory `#F6F5EF` achieves 11.2:1).
- Clear visible focus rings (`2px solid #173F35`) on all interactive inputs and buttons.
- Touch target sizes exceed 44x44px for primary mobile navigation.
- Screen-reader friendly aria-labels on SVG schematic hotspots.

### 11.2 Breakpoint Matrix
- **Desktop (>= 1200px)**: Fixed 240px sidebar, multi-column operational grids, side-by-side CAD schematic & probe telemetry.
- **Tablet (768px – 1199px)**: Collapsible 68px sidebar, 2-column card layouts, stacked schematic and telemetry graphs.
- **Mobile (< 768px)**: Bottom bar or slide-over drawer navigation, single-column stacked telemetry cards, horizontal scroll on data tables.
