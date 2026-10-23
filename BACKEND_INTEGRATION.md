# AgriPulse Backend Integration Specification & API Contracts

**Project**: AgriPulse — AI Predictive Maintenance & Digital Twin for Smart Irrigation Pumps  
**Author**: Frontend Engineering Team  
**Audience**: Backend & AI Systems Engineers  
**Frontend Stack**: React 18, Vite 5, Tailwind CSS, Recharts, Lucide Icons  
**Target Backend Framework**: Framework-agnostic (FastAPI, Flask, Django, Node.js/Express, Go, etc.)

---

## 1. Executive Summary & Architecture Overview

The AgriPulse frontend is built and tested as a mobile-first, desktop-responsive application. To facilitate decoupled development, the frontend currently runs in **Standalone Mock Telemetry Mode** by default (`VITE_USE_MOCK_DATA=true`).

All frontend HTTP requests are centralized in:
```
client/src/services/api/
├── apiClient.js          # Centralized Axios client (JWT interceptors & error normalization)
├── endpoints.js          # Canonical endpoint route constants
├── config.js             # Base URL & Mock Mode toggle logic
├── pumpService.js        # Pump registry, live telemetry, and Weibull RUL projections
├── alertService.js       # Proactive telemetry alerts & notification lifecycle
├── workOrderService.js   # Maintenance work order creation, assignment, and status
├── assistantService.js   # Technical RAG AI Diagnostics assistant
├── cropScanService.js    # YOLOv8 Computer Vision foliar disease analysis
├── dashboardService.js   # Fleet overview aggregates & irrigation sectors
├── settingsService.js    # ISO 10816 thresholds & platform calibration
├── authService.js        # Authentication & engineer profiles
└── index.js              # Central export point
```

### How to Connect Your Backend
1. In `client/.env` (or root `.env`), set:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_USE_MOCK_DATA=false
   ```
2. Enable CORS on your backend server for the frontend origin (typically `http://localhost:5173` during local Vite dev).
3. Implement the RESTful endpoints specified in Section 3 conforming to the documented JSON request/response formats.

---

## 2. Global Conventions & Standards

### 2.1 Base URL
All API paths in this document are relative to the configured `VITE_API_BASE_URL`. For instance, if `VITE_API_BASE_URL=http://localhost:8000/api`, then `/pumps` resolves to `http://localhost:8000/api/pumps`.

### 2.2 Standard Response Wrapper
Unless stated otherwise, all successful responses should return HTTP 200/201 with JSON:
```json
{
  "success": true,
  "data": { ... } // or array [ ... ]
}
```
*(The frontend also accepts direct array or object root responses for maximum backend flexibility).*

### 2.3 Standard Error Format
When an error occurs (HTTP 4xx or 5xx), return JSON:
```json
{
  "success": false,
  "message": "Human-readable error description displayed to the user",
  "errorCode": "PUMP_NOT_FOUND",
  "details": null
}
```

### 2.4 Authentication Protocol
- **Scheme**: HTTP Authorization Bearer Token (`Authorization: Bearer <JWT>`).
- The `apiClient` automatically injects this header into every outgoing request if `token` exists in `localStorage`.
- Upon HTTP 401 Unauthorized on protected routes, the frontend automatically purges session storage and transitions the user to `/login`.

---

## 3. Feature API Contracts

---

### 3.1 Authentication & Profile

#### `POST /auth/login`
Authenticates an engineer and issues a JWT token.
- **Request Body**:
  ```json
  {
    "email": "t.mansour@agripulse.ai",
    "password": "SecretPassword123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr-engineer-01",
      "displayName": "Tariq Mansour",
      "email": "t.mansour@agripulse.ai",
      "role": "Lead Irrigation Engineer",
      "organizationId": "agripulse-delta-7"
    }
  }
  ```
- **Required Fields by Frontend**: `token`, `user.id`, `user.displayName`, `user.email`, `user.role`.

#### `POST /auth/register`
Creates a new engineer user account.
- **Request Body**:
  ```json
  {
    "name": "Eng. Sarah Mansour",
    "email": "s.mansour@agripulse.ai",
    "password": "StrongPassword123"
  }
  ```
- **Response** (`201 Created`): Same format as `/auth/login`.

#### `GET /auth/profile`
Retrieves currently authenticated user data.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "user": {
      "id": "usr-engineer-01",
      "displayName": "Tariq Mansour",
      "email": "t.mansour@agripulse.ai",
      "role": "Lead Irrigation Engineer",
      "organizationId": "agripulse-delta-7"
    }
  }
  ```

---

### 3.2 Dashboard & Irrigation Sectors

#### `GET /dashboard/overview`
Provides high-level fleet health counts and hydraulic summaries across all smart pumps.
- **Query Parameters**: None.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "fleetSummary": {
        "totalPumps": 18,
        "criticalCount": 1,
        "warningCount": 2,
        "healthyCount": 15,
        "healthyPercent": 83,
        "warningPercent": 11,
        "criticalPercent": 6,
        "avgHealthScore": 87,
        "totalFlowRateLpm": 7450,
        "totalPowerKw": 312.4,
        "onlinePumpsCount": 16,
        "activeSectorsCount": 3,
        "totalHectaresCovered": 4370
      },
      "sectors": [
        {
          "id": "sector-delta-7",
          "name": "Sector Delta-7",
          "type": "High-Pressure Pivot Network",
          "acreage": "1,420 Hectares",
          "crops": "Wheat, Alfalfa, Maize",
          "pumpsCount": 6,
          "nominalPressure": 6.2,
          "nominalFlow": 2450
        }
      ]
    }
  }
  ```
- **Frontend Fallbacks**: If `fleetSummary` is missing, the frontend automatically computes totals and percentages on the client side from the pumps array.

#### `GET /sectors`
Returns the list of geographic/hydraulic irrigation sectors.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "sector-delta-7",
        "name": "Sector Delta-7",
        "type": "High-Pressure Pivot Network",
        "acreage": "1,420 Hectares",
        "crops": "Wheat, Alfalfa, Maize",
        "pumpsCount": 6,
        "nominalPressure": 6.2,
        "nominalFlow": 2450
      },
      {
        "id": "sector-alpha-3",
        "name": "Sector Alpha-3",
        "type": "Subsurface Drip Irrigation",
        "acreage": "850 Hectares",
        "crops": "Citrus Orchards, Olive Groves",
        "pumpsCount": 6,
        "nominalPressure": 4.5,
        "nominalFlow": 1800
      },
      {
        "id": "sector-gamma-12",
        "name": "Sector Gamma-12",
        "type": "Canal Intake & Booster Station",
        "acreage": "2,100 Hectares",
        "crops": "Sugar Beet, Cotton, Vegetables",
        "pumpsCount": 6,
        "nominalPressure": 7.0,
        "nominalFlow": 3200
      }
    ]
  }
  ```

---

### 3.3 Pump Fleet & Real-Time Telemetry

#### `GET /pumps`
Returns a list of all registered irrigation pumps with current sensor metrics.
- **Query Parameters**:
  - `sectorId` (string, optional): Filter by sector ID (e.g. `sector-delta-7`).
  - `status` (string, optional): `ALL`, `CRITICAL`, `WARNING`, `HEALTHY`, `STANDBY`.
  - `search` (string, optional): Free text matching `id`, `name`, or `model`.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "P-04",
        "name": "Pump P-04 (Zone 2 Booster)",
        "sectorId": "sector-delta-7",
        "model": "Grundfos CR 95-2 High Flow",
        "serial": "GF-2024-9941-K",
        "status": "CRITICAL",
        "healthScore": 42,
        "rulHours": 38,
        "rulWindow": "38h – 48h operating window",
        "failureMode": "Inner Bearing Raceway Cavitation & Micro-pitting",
        "urgency": "HIGH_INTERVENTION_REQUIRED",
        "lastSync": "2 seconds ago",
        "metrics": {
          "vibrationRms": 5.84,
          "casingTemp": 79.2,
          "dischargePressure": 6.85,
          "suctionPressure": 1.12,
          "motorCurrent": 31.4,
          "flowRate": 382,
          "frequencyHz": 54.2,
          "powerKw": 18.5,
          "efficiencyPercent": 68.4
        },
        "thresholds": {
          "vibrationWarning": 4.5,
          "vibrationCritical": 7.1,
          "tempWarning": 75.0,
          "tempCritical": 88.0,
          "pressureMax": 7.5,
          "currentMax": 30.0
        },
        "installationDate": "2023-04-12",
        "cumulativeRuntimeHours": 6420,
        "technicianNotes": "Acoustic emission sensor detects 1.48 kHz harmonic spike. Suspected cavitation during throttling."
      }
    ],
    "total": 18
  }
  ```
- **Required Fields**: `id`, `name`, `status`, `healthScore`, `metrics.flowRate`, `metrics.dischargePressure`, `metrics.vibrationRms`, `metrics.casingTemp`.

#### `GET /pumps/:id`
Retrieves full engineering specifications and datasheets for an individual pump.
- **Path Parameter**: `id` (e.g. `P-04`).
- **Response** (`200 OK`): Single pump object as shown above.

#### `GET /pumps/:id/telemetry`
Retrieves time-series telemetry data for charts (vibration, pressure, temperature).
- **Query Parameters**:
  - `range` (string, optional): `1h`, `6h`, `24h`, `7d` (default `24h`).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "pumpId": "P-04",
      "timeseries": [
        { "time": "00:00", "vibration": 3.82, "temp": 68.4, "pressure": 6.88 },
        { "time": "04:00", "vibration": 4.15, "temp": 71.2, "pressure": 6.85 },
        { "time": "08:00", "vibration": 4.90, "temp": 74.5, "pressure": 6.82 },
        { "time": "12:00", "vibration": 5.45, "temp": 77.8, "pressure": 6.80 },
        { "time": "16:00", "vibration": 5.84, "temp": 79.2, "pressure": 6.85 }
      ],
      "thresholds": {
        "vibrationWarning": 4.5,
        "vibrationCritical": 7.1
      }
    }
  }
  ```

#### `GET /pumps/:id/rul`
Retrieves Weibull failure probability curve and Remaining Useful Life degradation series.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "pumpId": "P-04",
      "rulHours": 38,
      "rulWindow": "38h – 48h operating window",
      "failureMode": "Inner Bearing Raceway Cavitation & Micro-pitting",
      "urgency": "Immediate (0h – 12h)",
      "decayCurve": [
        { "hoursOperating": 0, "health": 100, "projectedDecay": 100, "thresholdWarning": 70, "thresholdTrip": 40 },
        { "hoursOperating": 38, "health": 42, "projectedDecay": 42, "thresholdWarning": 70, "thresholdTrip": 40 },
        { "hoursOperating": 48, "health": null, "projectedDecay": 28, "thresholdWarning": 70, "thresholdTrip": 40 }
      ]
    }
  }
  ```

#### `POST /pumps/:id/control`
Dispatches a field control or test command (e.g., VFD frequency throttle or emergency trip).
- **Request Body**:
  ```json
  {
    "action": "THROTTLE_FREQUENCY",
    "parameters": {
      "targetHz": 45.0,
      "reason": "Suppress bearing thermal galling on P-04"
    }
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Control signal dispatched to pump P-04 VFD controller.",
    "timestamp": "2026-10-23T22:30:00Z"
  }
  ```

---

### 3.4 Alerts & Proactive Notifications

#### `GET /alerts`
Returns active telemetry alerts and advisory notices.
- **Query Parameters**:
  - `status` (string, optional): `ALL`, `UNREAD`, `READ`.
  - `limit` (integer, optional): Default `10`.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "unreadCount": 1,
    "total": 3,
    "alerts": [
      {
        "id": "brief-1",
        "pumpId": "P-04",
        "sectorId": "sector-delta-7",
        "severity": "CRITICAL",
        "status": "UNREAD",
        "timestamp": "12 minutes ago",
        "title": "ISO 10816 Zone C Breach: Bearing Cavitation",
        "finding": "Vibration velocity reached 5.84 mm/s RMS (exceeding nominal 4.5 mm/s). 1.48 kHz harmonic spike indicates inner raceway micro-pitting.",
        "prescribedAction": "Throttle VFD to 45 Hz (-22% load) to prevent thermal galling. Inspect suction strainer for DN80 inlet pressure drop.",
        "technicianDispatched": "Ahmed El-Sayed",
        "eta": "45 Mins"
      }
    ]
  }
  ```

#### `PATCH /alerts/:id/read`
Marks a specific alert as read.
- **Response** (`200 OK`): `{ "success": true, "message": "Alert marked as read" }`

#### `PATCH /alerts/read-all`
Marks all user alerts as read.
- **Response** (`200 OK`): `{ "success": true, "message": "All alerts marked as read" }`

#### `DELETE /alerts/:id`
Dismisses an alert notification.
- **Response** (`200 OK`): `{ "success": true, "message": "Alert dismissed" }`

---

### 3.5 Maintenance & Work Orders

#### `GET /work-orders`
Retrieves field maintenance interventions.
- **Query Parameters**:
  - `status` (string, optional): `ALL`, `SCHEDULED`, `IN_PROGRESS`, `BACKLOG`, `VERIFIED`.
  - `pumpId` (string, optional): Filter by pump ID.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "total": 3,
    "data": [
      {
        "id": "WO-9941",
        "pumpId": "P-04",
        "title": "Replace Drive-End Bearing Kit & Flush Suction Filter",
        "priority": "P1_CRITICAL",
        "status": "SCHEDULED",
        "assignedTechnician": "Ahmed El-Sayed",
        "estimatedDowntimeHours": 3.5,
        "targetCompletion": "Friday 08:00 UTC (Prior to 38h RUL)",
        "spareParts": ["SKF 6312 C3 Deep Groove Ball Bearing", "Viton Impeller O-Ring Kit"],
        "safetyRequirements": "Lockout/Tagout (LOTO) on MCC Breaker #4. Relieve DN80 casing pressure before seal decoupling."
      }
    ]
  }
  ```

#### `POST /work-orders`
Creates and dispatches a new maintenance work order.
- **Request Body**:
  ```json
  {
    "pumpId": "P-04",
    "title": "Calibrate terminal voltage phase balance",
    "priority": "P2_HIGH",
    "assignedTechnician": "Tariq Mansour",
    "estimatedDowntimeHours": 2.5,
    "targetCompletion": "Within 48h",
    "spareParts": ["Contactor Terminal Kit"],
    "safetyRequirements": "Standard 380V LOTO Protocol"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Work order created successfully",
    "data": {
      "id": "WO-1042",
      "pumpId": "P-04",
      "title": "Calibrate terminal voltage phase balance",
      "priority": "P2_HIGH",
      "status": "SCHEDULED",
      "assignedTechnician": "Tariq Mansour",
      "estimatedDowntimeHours": 2.5,
      "targetCompletion": "Within 48h",
      "safetyRequirements": "Standard 380V LOTO Protocol",
      "createdAt": "2026-10-23T22:30:00Z"
    }
  }
  ```
- **Form Validations Enforced on Frontend**:
  - `title` cannot be empty.
  - `estimatedDowntimeHours` must be a positive number greater than 0.
  - `pumpId` must be a valid registered pump ID.

#### `PUT /work-orders/:id`
Updates work order status (e.g. from `SCHEDULED` to `VERIFIED`).
- **Request Body**:
  ```json
  {
    "status": "VERIFIED"
  }
  ```
- **Response** (`200 OK`): Returns updated work order object.

---

### 3.6 AI Technical Diagnostics Assistant

#### `POST /assistant/chat`
Submits an engineer prompt with IoT telemetry context for RAG diagnosis.
- **Request Body**:
  ```json
  {
    "question": "Analyze the 5.84 mm/s vibration spike and 1.48 kHz harmonic on Pump P-04. What is the root cause and ISO 10816 severity?",
    "pumpId": "P-04",
    "context": {
      "model": "Grundfos CR 95-2 High Flow",
      "metrics": {
        "vibrationRms": 5.84,
        "casingTemp": 79.2,
        "dischargePressure": 6.85,
        "flowRate": 382
      },
      "status": "CRITICAL",
      "failureMode": "Inner Bearing Raceway Cavitation & Micro-pitting"
    }
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "text": "### ISO 10816-3 Mechanical Vibration Diagnostic Analysis\n- **Observed Vibration Level**: **5.84 mm/s RMS** (Threshold: Zone C boundary is 4.5 mm/s, Zone D trip is 7.1 mm/s).\n- **Classification**: **Zone C (Unrestricted Continuous Operation Prohibited)**.\n- **Harmonic Signature**: Fast Fourier Transform (FFT) displays a predominant **1.48 kHz harmonic spike** accompanied by non-synchronous sidebands.\n- **Root Cause**: Inner bearing raceway micro-pitting caused by localized hydrodynamic cavitation.\n- **Recommended Action**:\n  1. Throttle VFD to **45 Hz (-22% load)** immediately to suppress cavitation vapor pocket collapse.\n  2. Inspect suction strainer for DN80 inlet differential pressure drop.\n  3. Schedule replacement of drive-end bearing with **SKF 6312 C3** bearing kit within 38 operating hours.",
    "dataProvenance": "LIVE_RAG_GATEWAY",
    "model": "AgriPulse-Domain-RAG-v2.1",
    "timestamp": "2026-10-23T22:30:00Z"
  }
  ```
- **Notes for AI Developer**:
  - The frontend accepts markdown in the `text` (or `answer` or `message`) field and renders it using `react-markdown` and `remark-gfm`.
  - Do not hallucinate or guess pump metrics: verify against the passed telemetry payload.

---

### 3.7 Field Vision & Crop Scanning (YOLOv8 Computer Vision)

#### `POST /crop-scan`
Uploads a foliar field image for computer vision pathology detection and hydraulic correlation.
- **Request Content-Type**: `multipart/form-data`
- **Form Field**: `image` (binary file: PNG, JPEG, WEBP).
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "sample": {
      "id": "scan-1729722600",
      "title": "Field Inspection — Zone 2 Foliage",
      "crop": "Citrus Orchard & Pivot Maize",
      "sectorId": "Sector Delta-7 (Zone 2)",
      "detections": [
        {
          "id": "det-1",
          "label": "Foliar Water Stress & Leaf Wilting",
          "confidence": 91.4,
          "severity": "ELEVATED_STRESS",
          "color": "#E7A944",
          "box": { "x": 22, "y": 24, "width": 54, "height": 50 }
        },
        {
          "id": "det-2",
          "label": "Early Leaf Rust (Puccinia sorghi)",
          "confidence": 84.7,
          "severity": "MODERATE",
          "color": "#D94C45",
          "box": { "x": 62, "y": 35, "width": 28, "height": 32 }
        }
      ],
      "hydraulicCorrelation": "Telemetry shows sector line pressure dropped from 6.2 bar to 3.92 bar over the past 36 hours due to Pump P-04 cavitation throttling. Canopy wilting matches under-irrigation pattern.",
      "action": "Restore nominal sector pressure by clearing P-04 intake filter or switching to Standby Pump P-05. Spot-apply approved triazole fungicide for localized rust lesions.",
      "linkedPump": "P-04 (Zone 2 Booster)"
    },
    "modelAttribution": "YOLOv8s-CropDisease v1.2",
    "inferenceLatencyMs": 18
  }
  ```
- **Bounding Box Coordinate Format**: Values are percentages (`0` to `100`) representing `{ x, y, width, height }` relative to the image dimensions.

---

### 3.8 Platform Calibration & Settings

#### `GET /settings`
Retrieves system alarm thresholds and notification webhooks.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "data": {
      "vibrationWarning": 4.5,
      "vibrationCritical": 7.1,
      "tempWarning": 75.0,
      "tempCritical": 88.0,
      "samplingRateMs": 2500,
      "alertEmail": "t.mansour@agripulse.ai",
      "webhookUrl": "https://scada.agripulse.internal/hooks/anomaly"
    }
  }
  ```

#### `PUT /settings`
Updates platform calibration settings.
- **Request Body**: JSON containing fields to update.
- **Response** (`200 OK`): `{ "success": true, "message": "Settings updated successfully" }`

---

## 4. UI States & Edge Cases Handled by Frontend

The frontend has been specifically hardened to handle backend lifecycle states gracefully:

| State | Frontend Behavior |
| :--- | :--- |
| **Loading** | Animated pulsing skeleton cards and spinners displayed; user interaction disabled on submitting buttons to avoid double POSTs. |
| **Empty Data** | Empty list placeholders rendered (e.g. "No pumps found matching search", "No work orders scheduled"). The UI does not crash on `[]`. |
| **Missing Fields** | Optional chaining and defensive fallbacks used across all screens (`p.metrics?.flowRate ?? 0`). |
| **Backend Offline** | Standalone Mock mode automatically serves realistic data without browser console crashes or unhandled promise rejections. |
| **Network Error / 5xx** | User-friendly error notification banner displayed with a 1-click **"Retry"** button. |
| **Session Expiry (401)** | Token purged and user redirected to `/login` with clear guidance. |

---

## 5. Next Steps for the Backend Developer

1. **Clone & Run Frontend**: Follow `README.md` to start Vite dev server on `http://localhost:5173`.
2. **Setup Your Backend**: Implement the endpoints listed in Section 3 in your language/framework of choice.
3. **Connect**: Set `VITE_API_BASE_URL` in `client/.env` and flip `VITE_USE_MOCK_DATA=false`.
4. **Iterate**: Verify live data flow screen-by-screen against the responsive UI!
