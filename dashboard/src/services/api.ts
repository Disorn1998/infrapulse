import { Host, Metric, FacilityOverview, CapacityForecast, FacilityPowerLog } from '../types/api';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/+$/, '');

export async function fetchHosts(): Promise<Host[]> {
  const res = await fetch(`${API_BASE}/hosts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch hosts: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteHost(hostId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/hosts/${encodeURIComponent(hostId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete host: ${res.statusText}`);
  }
}

export async function fetchHostMetrics(hostId: string, range: string = '1h'): Promise<Metric[]> {
  const res = await fetch(`${API_BASE}/metrics?host=${encodeURIComponent(hostId)}&range=${range}&limit=500`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics for host '${hostId}': ${res.statusText}`);
  }
  return res.json();
}

export async function fetchFacilityOverview(): Promise<FacilityOverview> {
  const res = await fetch(`${API_BASE}/facility/overview`);
  if (!res.ok) {
    throw new Error(`Failed to fetch facility overview: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCapacityForecast(): Promise<CapacityForecast> {
  const res = await fetch(`${API_BASE}/facility/forecast`);
  if (!res.ok) {
    throw new Error(`Failed to fetch capacity forecast: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPowerLogs(): Promise<FacilityPowerLog[]> {
  const res = await fetch(`${API_BASE}/facility/power-logs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch power logs: ${res.statusText}`);
  }
  return res.json();
}

export async function createPowerLog(payload: {
  log_month: string;
  total_facility_kwh: number;
  it_equipment_kwh: number;
  cooling_kwh?: number;
  notes?: string;
}): Promise<FacilityPowerLog> {
  const res = await fetch(`${API_BASE}/facility/power-logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create power log: ${res.statusText}`);
  }
  return res.json();
}

export async function deletePowerLog(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/facility/power-logs/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete power log: ${res.statusText}`);
  }
}

export async function fetchAiInsights(): Promise<import('../types/api').AiAdvisorResponse> {
  const res = await fetch(`${API_BASE}/ai/insights`);
  if (!res.ok) {
    throw new Error(`Failed to fetch AI insights: ${res.statusText}`);
  }
  return res.json();
}

export async function triggerSimulateCluster(): Promise<import('../types/api').SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate/cluster`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) {
    throw new Error(`Cluster simulation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function triggerSimulateStress(): Promise<import('../types/api').SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate/stress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) {
    throw new Error(`PUE stress simulation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteHost(hostId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/hosts/${encodeURIComponent(hostId)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`Failed to delete host '${hostId}': ${res.statusText}`);
  }
}

export async function triggerSimulateReset(): Promise<import('../types/api').SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) {
    throw new Error(`Reset simulation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function triggerSimulateOutage(): Promise<import('../types/api').SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate/outage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) {
    throw new Error(`Outage simulation failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMultiRackTopology(): Promise<import('../types/api').RackSummary[]> {
  const res = await fetch(`${API_BASE}/facility/racks`);
  if (!res.ok) {
    throw new Error(`Failed to fetch multi-rack topology: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchAlertRulesSummary(): Promise<import('../types/api').AlertSettingsSummary> {
  const res = await fetch(`${API_BASE}/alerts/rules/summary`);
  if (!res.ok) {
    throw new Error(`Failed to fetch alert rules: ${res.statusText}`);
  }
  return res.json();
}

export async function updateAlertRulesSummary(payload: import('../types/api').AlertSettingsSummary): Promise<import('../types/api').AlertSettingsSummary> {
  const res = await fetch(`${API_BASE}/alerts/rules/summary`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update alert rules: ${res.statusText}`);
  }
  return res.json();
}

export function getExportCsvUrl(): string {
  return `${API_BASE}/facility/export/audit-csv`;
}

// Utility: Format bytes into human readable binary units
export function formatBytes(bytes?: number | null, decimals = 1): string {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Utility: Format transfer rate bytes/sec
export function formatRate(bytesPerSec?: number | null): string {
  if (bytesPerSec === undefined || bytesPerSec === null || isNaN(bytesPerSec)) return '-';
  if (bytesPerSec === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(Math.abs(bytesPerSec)) / Math.log(k));
  return `${parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Utility: Format seconds into human readable duration
export function formatUptime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Utility: Format seconds since last seen
export function formatLastSeen(secondsAgo: number): string {
  if (secondsAgo < 10) return 'Just now';
  if (secondsAgo < 60) return `${secondsAgo}s ago`;
  const minutes = Math.floor(secondsAgo / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
