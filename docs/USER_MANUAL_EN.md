# ⚡ InfraPulse User & Operations Manual
**Mini Data Center Infrastructure, Capacity Monitoring & 3D/2D Architectural DCIM Platform**

---

## 🎯 1. Mission & Engineering Motivation

### 📌 The Real-World Engineering Problem
Enterprise edge computing facilities, branch offices, industrial factories, and healthcare sites (housing 5 to 50 server blades and network switches) face significant operational hurdles:
1. **Excessive Enterprise DCIM Licensing Costs:** Commercial platforms (Schneider EcoStruxure, Sunbird, Nlyte) demand millions in licensing fees and proprietary metering hardware.
2. **Standard Monitoring Blind Spots:** Typical sysadmin suites (Prometheus, Grafana, Netdata) track operating system metrics (CPU/RAM/Disk) but completely ignore **PDU branch circuit loading, electrical phase balance, thermal heatmap distribution, and Power Usage Effectiveness (PUE)**.
3. **Catastrophic Breaker Trips:** Scaling IT hardware without real-time physical electrical capacity checks risks tripping branch breakers, taking down critical operations.
4. **Uncertain Dual-Feed N+1 Redundancy:** Facilities have dual A/B utility feeds, but rarely compute in real-time whether a sudden loss of Feed A will trip Feed B on continuous overload.
5. **Architectural Communication Gap:** Non-technical executives often perceive data centers as mere "air-conditioned server closets" without understanding the vital synergy of 2N power, close-coupled in-row cooling, clean agent fire suppression, and cold aisle containment.

### 💡 The InfraPulse Solution
* **Unifies IT Telemetry with Physical DCIM:** Combines agent host metrics with dynamic electrical and thermal physics modeling in a single pane of glass.
* **8-Zone 3D/2D Architectural Showcase:** Fully interactive 360° WebGL room and TIA-942 Rated-3 Room Zoning blueprint paired with studio photographs of real enterprise hardware.
* **Thailand BOI Green Data Center Compliance:** Tracks and validates the **PUE $\le 1.30$** energy efficiency benchmark.
* **Electrical Safety Standards:** Evaluates continuous breaker capacity under the **NEC 80% continuous load rating rule**.
* **Zero-Licensing Cost Stack:** Open-source FastAPI, PostgreSQL 16, React 18, Three.js, and Docker architecture ready for instant deployment.
* **AI Infrastructure Copilot:** DCIM Health Score (0–100) engine offering proactive engineering diagnostics and actionable recommendations.

---

## 🏛️ 2. The 8 Core Data Center Facility Zones

| Pin / Zone | Architecture Zone Name | Monitored Real Hardware Model | Facility Function & Role |
| :---: | :--- | :--- | :--- |
| **❶** | **SERVER RACK AREA** | 42U APC NetShelter SX + Dell PowerEdge R750 | Houses compute blades, high-density NVMe storage, and virtualization clusters. |
| **❷** | **UPS & BATTERY ROOM** | APC Symmetra PX 48kW Modular (True Online) | Delivers instantaneous 0ms battery power during utility blackouts. |
| **❸** | **PRECISION AIR CONDITIONING** | Schneider InRow RC 60kW & CRAH (EC Fans) | Controls temperature and humidity 24/7 with modulating variable-speed fans. |
| **❹** | **HOT AISLE / COLD AISLE** | EcoAisle Modular Containment Pod | Decouples cold intake air from hot exhaust, boosting chiller efficiency by 35%. |
| **❺** | **FIRE SUPPRESSION SYSTEM** | 3M Novec 1230 (25 Bar) + VESDA VLP Laser | Discharges residue-free clean gas within 10s without damaging microchips. |
| **❻** | **MONITORING & DCIM** | InfraPulse DCIM & 6-Screen NOC Console Wall | Unified operational command center tracking power, thermal, and network metrics. |
| **❼** | **NETWORK ROOM** | Cisco Nexus 9000 Spine-Leaf + FiberGuide | High-throughput non-blocking network fabric terminating telecom carriers. |
| **❽** | **ACCESS CONTROL & SECURITY** | Airlock Mantrap + Biometrics + 4K AI CCTV | Enforces strict physical perimeter security and generates ISO 27001 audit logs. |

---

## 🚀 3. Step-by-Step System Operations Guide

### 3.1 Exploring the Data Center Architecture Showcase
1. Open the platform at [https://infrapulse-0ft2.onrender.com/](https://infrapulse-0ft2.onrender.com/)
2. **Toggling 3D vs 2D Architectural Views:**
   * Click **`[ 🎮 3D Facility Room ]`** to enter the 360° interactive WebGL room:
     - Drag with your mouse or finger to orbit around the room.
     - Use camera preset shortcuts: `[ ISO ROOM ]`, `[ RACKS ]`, `[ POWER ]`, and `[ TOP-DOWN ]`.
     - Toggle auto-rotation via `[ 🔄 ]` (auto-pauses immediately upon pointer interaction).
   * Click **`[ 📐 2D Room Zoning ]`** to inspect the TIA-942 color-coded architectural floorplan and 8 detail cards.
3. **Inspecting Real Hardware & Engineering Specifications:**
   * Click any **numbered pin ❶ to ❽** in 3D or any equipment card in 2D.
   * A large, symmetrical dialog modal appears **dead-center on the screen**:
     - **Left Column:** High-resolution real studio photograph, full-screen `[ EXPAND ]` lightbox, and live electrical telemetry.
     - **Right Column:** Detailed engineering specifications table, facility role, importance analysis, and failure impact evaluation.

### 3.2 Live Production vs Sim Lab Sandbox
* **Live Production Mode:** Dedicated exclusively to genuine production servers with verified authentication tokens. Unmonitored states display an onboarding empty state with 1-line installation scripts.
* **Sim Lab Sandbox Mode:** Immediately launches a realistic 5-node cluster with active fluctuating electrical loads across Feed A (~950W) and Feed B (~820W).

### 3.3 Interpreting DCIM Metrics & Capacity Views
* **Dynamic PUE Index:** Measures power efficiency against the Thailand BOI target ($\le 1.30$).
* **N+1 Dual-Feed Redundancy:** Verifies whether surviving Feed A or Feed B can safely absorb 100% of the facility load under the NEC 80% continuous rating rule.
* **Multi-Rack Elevation:** Switch between `Rack-01`, `Rack-02`, and `Rack-03` to inspect vertical U-slot utilization and color-coded thermal badges.

---

## 💻 4. Client Agent Installation Guide

### For Ubuntu / Debian Linux:
Run this 1-line command in your terminal:
```bash
curl -sSL https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.sh | sudo bash
```

### For Windows Server / Windows 10/11:
Open an Administrator PowerShell terminal and execute:
```powershell
irm https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.ps1 | iex
```

---

## ⚡ 5. Local Docker Deployment (Zero Configuration)

```bash
git clone https://github.com/Disorn1998/infrapulse.git
cd infrapulse
docker compose up -d --build
```
Access endpoints:
- Web Dashboard & 3D Primer: `http://localhost:3000`
- Interactive API Swagger: `http://localhost:8000/docs`
