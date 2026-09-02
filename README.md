# ⚡ InfraPulse — Mini Data Center Infrastructure & Capacity Monitoring System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12-22c55e.svg?style=flat)](https://recharts.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Cloud 24/7](https://img.shields.io/badge/Cloud_Deploy-Render.com-46E3B7.svg?style=for-the-badge&logo=render&logoColor=black)](https://infrapulse-0ft2.onrender.com/)

**🚀 24/7 Cloud Production Dashboard:** [https://infrapulse-0ft2.onrender.com/](https://infrapulse-0ft2.onrender.com/)  
**📖 Comprehensive User Manuals:** [🇹🇭 คู่มือการใช้งานภาษาไทย (Thai)](https://github.com/Disorn1998/infrapulse/blob/main/docs/USER_MANUAL_TH.md) | [🇬🇧 User & Operations Manual (English)](https://github.com/Disorn1998/infrapulse/blob/main/docs/USER_MANUAL_EN.md)

![InfraPulse DCIM Operations Dashboard](docs/screenshots/dashboard_hero.png)

> **InfraPulse** is a unified **IT Infrastructure & Critical Facility DCIM (Data Center Infrastructure Management)** monitoring platform designed for edge server rooms, branch offices, and homelabs. It bridges the gap between raw OS telemetry and physical electrical engineering by combining real-time hardware metrics with dynamic server power estimation, thermal heatmap matrix, load-dependent PUE modeling, dual-feed (A/B) N+1 redundancy validation, multi-rack layout tracking, and predictive capacity forecasting.

---

## 📸 Screenshots & UI Showcase

| 🖥️ Real-Time Telemetry & Dual-Stream Throughput | ⚡ Capacity Forecasting & Multi-Rack Heatmap |
| :---: | :---: |
| ![Real-Time Telemetry](docs/screenshots/dashboard_telemetry.png) | ![Capacity & Power View](docs/screenshots/dashboard_capacity.png) |
| *Live node status, CPU/RAM/Temp gauges, and Network RX/TX* | *Capacity Runout Forecast ($y=mx+c$), Multi-Rack Thermal Heatmap & Monthly PUE logs* |
| **🤖 AI Infrastructure Copilot** | **✨ 1-Line Universal Installers** |
| ![AI Copilot](docs/screenshots/dashboard_ai.png) | ![Empty State](docs/screenshots/dashboard_empty.png) |
| *DCIM Health Score, Thermal Hotspot Diagnostics & Power Insights* | *Instant cluster simulation and universal copy-paste installation* |

---

## 🌟 Key Enterprise DCIM Features

1. **🌡️ CPU Temperature & Rack Thermal Heatmap Matrix:**
   * Gathers hardware CPU package temperature ($^\circ\text{C}$) via Linux sensors / Windows WMI.
   * Color-coded thermal badges (Cyan $\le 45^\circ\text{C}$, Green $\le 65^\circ\text{C}$, Amber $\le 75^\circ\text{C}$, Red $> 75^\circ\text{C}$) across all monitored nodes and rack elevation slots.
2. **🏢 Multi-Rack Layout Switcher:**
   * Seamlessly switch between **`Rack-01 (Web & App)`**, **`Rack-02 (Database Clusters)`**, and **`Rack-03 (AI/HPC GPU & Storage)`**.
   * Real-time rack-level power aggregation, available U-space counters, and average thermal gradient.
3. **🎛️ Custom Alert Threshold Settings (GUI Modal):**
   * Dedicated Settings Modal ⚙️ with interactive sliders for CPU %, RAM %, Disk %, and Thermal Hotspot $^\circ\text{C}$ limits.
   * Instant recipient email configuration for Gmail SMTP notifications with 15-minute hysteresis cooldown suppression.
4. **📑 1-Click Export Audit Report (CSV & BOI PDF Summary):**
   * **CSV Raw Dataset:** Exports complete server inventory, electrical load, and historical monthly PUE audit logs.
   * **Printable Executive Summary:** Generates a printable audit certificate with **Thailand BOI Green Data Center Compliance ($\text{PUE} \le 1.30$)**.
5. **🤖 AI Infrastructure Copilot:**
   * Evaluates overall data center health score (0–100) with diagnostic insight cards covering thermal hotspots, phase balancing, PUE dilution, and expansion runway.
6. **🚀 1-Line Universal Agent Installers:**
   * **Linux / Ubuntu:** `curl -sSL https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.sh | sudo bash`
   * **Windows (PowerShell):** `irm https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.ps1 | iex`

---

## 📊 How to Read Metrics & Dashboard Usage

The dashboard provides real-time facility intelligence driven completely by live database telemetry. 

### 1. ⚡ Capacity & Power Intelligence (DCIM Core)
* **Dynamic PUE Index:** Measures electrical efficiency. The **Thailand BOI** standard for green data center tax incentives is **$\le 1.30$**. During low IT workload periods, PUE will naturally spike higher because fixed facility overhead (cooling, lighting) remains constant while IT power drops.
* **N+1 Power Redundancy:** A **HEALTHY** status means if one power feed (e.g., Feed A) fails, the surviving Feed B can safely carry the entire room's load without tripping the breaker (safe under the NEC 80% continuous load rule).
* **Predictive Power Growth (Capacity Runout):** AI calculates a Linear Regression slope (Watts per day) based on historical usage and automatically projects **Days to Exhaustion** (how many days until the 100% breaker capacity is hit).
* **Historical Monthly Audits:** Click **"+ Add Monthly Audit"** to log your monthly utility bill. The system securely stores the monthly PUE history in PostgreSQL for long-term ISO or BOI audit compliance.

### 2. 🏢 Multi-Rack Elevation & Thermal Heatmap Matrix
* Click to switch between **`Rack-01`**, **`Rack-02`**, or **`Rack-03`**.
* Look at the U-slots (U1 - U42) to visually identify thermal hotspots in the rack via color-coded badges:
  * 🟦 **Cyan (< 45°C):** Cool (Idle workload).
  * 🟩 **Green (45-65°C):** Optimal operating temperature.
  * 🟧 **Amber (65-75°C):** Elevated temperature; monitor for airflow issues.
  * 🟥 **Red (> 75°C):** Thermal Hotspot; high risk of CPU thermal throttling.

### 3. 🤖 AI Infrastructure Copilot
* Stop interpreting charts manually. The AI Engine evaluates a **DCIM Health Score (0-100)** and generates dynamic, real-time alerts (CRITICAL, WARNING, INFO).
* *Example:* If too many servers are plugged into Feed A, the AI detects the load delta and issues an *"A/B Dual-Feed Power Imbalance"* warning, recommending you migrate plugs to Feed B to restore 50/50 balance.

### 4. ⚙️ Header Controls (Alerts & Exports)
* **⚙️ Alert Rules:** Adjust threshold sliders for CPU, RAM, Disk, and Temperature. The system sends an automated Email Notification (with a 15-minute debounce) when a threshold is breached.
* **📑 Export Audit:** Instantly download a **.CSV** containing your raw server inventory, power telemetry, and monthly PUE audits.

---

## 📌 Motivation & The Real-World Engineering Problem

### The Problem in Enterprise Edge & Small Server Rooms
In enterprise branch offices, factories, hospitals, and edge computing sites (5–50 physical servers and network switches), IT engineers face significant operational hurdles:
* **Cost & Complexity of Commercial DCIM:** Enterprise tools (Sunbird, Schneider EcoStruxure, Nlyte) cost millions of Baht and require dedicated sensor hardware.
* **Blind Spots in Standard Monitoring:** Common sysadmin tools (Netdata, Prometheus/Grafana) monitor OS metrics (CPU/RAM/Disk) but **completely ignore electrical capacity, thermal distribution, PDU breaker safety, and facility power limits**.
* **Risk of Catastrophic Breaker Trips:** Adding new servers without real-time electrical headroom checks can trigger main breaker trips, taking down critical operations.

### Connecting to Thailand's Booming Data Center & Cloud Industry
With Thailand rapidly emerging as Southeast Asia's digital hub and the **Board of Investment (BOI)** granting tax incentives for energy-efficient Data Centers achieving **PUE $\le 1.30$**, monitoring electrical efficiency (Dynamic PUE) and power redundancy (N+1) has transitioned from an optional feature to an essential engineering standard.

**InfraPulse was built to solve this exact problem** by providing full DCIM capabilities in a modern, containerized, zero-licensing-cost stack.

---

## 🗺️ System Flowcharts & Subsystem Workflows

### 1. 🔄 End-to-End System Data Flow & Architecture

![InfraPulse Architecture Topology](docs/screenshots/architecture_diagram.png)

```mermaid
flowchart TD
    subgraph Monitored_Nodes [Monitored Infrastructure Nodes]
        U[Ubuntu Server / Node<br/>psutil Daemon]
        W[Windows Desktop / Node<br/>psutil Task]
    end

    subgraph Client_Agent_Layer [Agent Core Engine]
        U --> SAMP[Adaptive Metric Sampler + Temp °C]
        W --> SAMP
        SAMP --> NET_CHECK{Network Link<br/>Available?}
        NET_CHECK -- No (Offline Outage) --> BUF[SQLite Circular Ring Buffer<br/>Cap: 1,000 Records]
        NET_CHECK -- Yes (Online) --> FLUSH[Batch Ingest Buffer Flush]
        FLUSH --> HTTP_TX[HTTP Client + X-Agent-Token]
        BUF --> FLUSH
    end

    subgraph Backend_Gateway [FastAPI Core Engine - Port 8000]
        HTTP_TX --> AUTH{Token Guard<br/>Timing-Safe Check}
        AUTH -- Invalid Token --> REJ[401 Unauthorized]
        AUTH -- Valid Token --> INGEST[Telemetry Ingestion]
        INGEST --> DB[(PostgreSQL 16 Storage<br/>Indexed host_id + timestamp)]
        
        INGEST --> PWR_ENG[Dynamic Power Model]
        PWR_ENG --> PUE_ENG[Dynamic PUE Calculator]
        PWR_ENG --> RED_ENG[Dual-Feed N+1 Breaker Watchdog]
        PWR_ENG --> CAP_ENG[Linear Regression Forecaster]
        PWR_ENG --> AI_ENG[AI Infrastructure Copilot]
        
        DB --> SCHED[Background Alert Scheduler]
        SCHED --> ALERT_FSM[Alert Hysteresis State Machine<br/>15-Min Cooldown Suppression]
        ALERT_FSM --> SMTP[Gmail SMTP Dispatcher]
        SMTP --> MAIL[(Operator Inbox)]
    end

    subgraph Web_Dashboard [Single-Pane Ops Interface - Port 3000]
        NGINX[Nginx Reverse Proxy] -->|Proxies /api/| INGEST
        SPA[React 18 + Vite + Recharts] --> NGINX
    end
```

---

### 2. ⚡ Dynamic PUE & Physical Power Calculation Flow

```mermaid
flowchart LR
    A["CPU Usage % (t)"] --> B["Linear Server Power Model<br/>P_node = P_idle + (CPU% / 100) * (P_rated - P_idle)"]
    B --> C["Total IT Power P_IT (t)<br/>Sum of all active servers"]
    C --> D["Add Fixed Overhead (P_fixed = 35W)<br/>+ Cooling (k_c = 0.15)<br/>+ PDU Distribution Loss (0.03)"]
    D --> E["Total Facility Power P_Facility (t)"]
    E --> F["Dynamic PUE (t) = P_Facility / P_IT<br/>Evaluated against Thailand BOI Target (PUE <= 1.30)"]
```

---

## ⚡ Quick Start with Docker (Zero Configuration)

```bash
# 1. Clone repository
git clone https://github.com/Disorn1998/infrapulse.git
cd infrapulse

# 2. Launch complete production stack
docker compose up -d --build

# 3. Access interfaces
# Dashboard: http://localhost:3000
# Backend API Docs: http://localhost:8000/docs
```

---

## 📄 License & Author

* **Author:** Disorn Suppartum ([@Disorn1998](https://github.com/Disorn1998))
* **License:** MIT License — Open for commercial, educational, and enterprise use.
