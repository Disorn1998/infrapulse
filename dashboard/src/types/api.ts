export interface PDUInfo {
  id: number;
  name: string;
  feed: 'A' | 'B';
  rack_name: string;
  rated_watts: number;
  derate_factor: number;
}

export interface PowerConfig {
  id: string;
  host_id: string;
  idle_watts: number;
  rated_watts: number;
  rack_name: string;
  rack_unit_start: number;
  rack_unit_height: number;
  pdu_outlet?: string;
  pdu?: PDUInfo | null;
  secondary_pdu?: PDUInfo | null;
}

export interface Host {
  id: string;
  hostname: string;
  ip_address: string | null;
  os_type: string;
  os_version: string | null;
  cpu_count: number;
  total_ram_bytes: number;
  total_disk_bytes: number;
  agent_version: string;
  status: 'online' | 'offline' | string;
  is_online: boolean;
  seconds_since_last_seen: number;
  last_seen: string;
  created_at: string;
  updated_at: string;
  power_config?: PowerConfig | null;
}

export interface Metric {
  id: number;
  host_id: string;
  timestamp: string;
  received_at: string;
  cpu_percent: number | null;
  ram_percent: number;
  ram_used_bytes?: number;
  disk_percent: number;
  disk_used_bytes?: number;
  net_sent_bytes_per_sec: number | null;
  net_recv_bytes_per_sec: number | null;
  uptime_seconds: number;
  calculated_power_watts?: number | null;
  load_1m?: number | null;
  load_5m?: number | null;
  load_15m?: number | null;
}

export interface FeedStatus {
  feed_name: string;
  pdu_names: string[];
  rated_watts: number;
  derated_capacity_watts: number;
  current_load_watts: number;
  utilization_percent: number;
  is_derate_safe: boolean;
}

export interface RedundancyCheck {
  is_n_plus_one_compliant: boolean;
  status: 'HEALTHY' | 'AT_RISK' | 'NON_COMPLIANT' | string;
  feed_a?: FeedStatus;
  feed_b?: FeedStatus;
  worst_case_failover_load_watts: number;
  surviving_feed_headroom_watts: number;
  message: string;
}

export interface FacilityOverview {
  facility_name: string;
  total_power_capacity_watts: number;
  fixed_overhead_watts: number;
  total_it_power_watts: number;
  variable_cooling_power_watts: number;
  variable_pdu_loss_watts: number;
  total_facility_power_watts: number;
  current_pue: number;
  target_pue: number;
  pue_status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL' | string;
  power_capacity_utilization_percent: number;
  active_hosts_count: number;
  total_hosts_count: number;
  redundancy: RedundancyCheck;
}

export interface FacilityPowerLog {
  id: string;
  log_month: string;
  total_facility_kwh: number;
  it_equipment_kwh: number;
  calculated_pue: number;
  cooling_kwh?: number;
  notes?: string | null;
  created_at: string;
}

export interface PeakNodeDrop {
  peak_node_hostname: string;
  peak_node_watts: number;
  surviving_it_load_watts: number;
  total_capacity_watts: number;
  is_surviving_capacity_safe: boolean;
  safety_headroom_watts: number;
  impact_summary: string;
}

export interface TrendPoint {
  timestamp: string;
  actual_power_watts?: number | null;
  projected_power_watts?: number | null;
}

export interface CapacityForecast {
  current_power_load_watts: number;
  total_capacity_watts: number;
  current_utilization_percent: number;
  power_growth_slope_watts_per_day: number;
  estimated_days_to_exhaustion?: number | null;
  exhaustion_date?: string | null;
  growth_trend: 'STABLE' | 'MODERATE_GROWTH' | 'RAPID_GROWTH' | 'DECLINING' | string;
  peak_node_drop: PeakNodeDrop;
  historical_trend: TrendPoint[];
  recommendation: string;
}

export interface AiInsightCard {
  id: string;
  category: 'ENERGY_OPTIMIZATION' | 'ELECTRICAL_SAFETY' | 'CAPACITY_PLANNING' | 'HARDWARE_HEALTH' | string;
  severity: 'CRITICAL' | 'WARNING' | 'OPTIMIZATION' | 'INFO' | string;
  title: string;
  summary: string;
  impact: string;
  recommended_action: string;
  estimated_savings_or_benefit?: string | null;
  action_type?: string | null;
  created_at: string;
}

export interface AiAdvisorResponse {
  datacenter_health_score: number;
  health_status: 'OPTIMAL' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL' | string;
  executive_summary: string;
  key_metrics_summary: {
    total_nodes: number;
    online_nodes: number;
    dynamic_pue: number;
    it_power_watts: number;
    facility_power_watts: number;
    n_plus_one_headroom_watts: number;
    days_to_capacity_exhaustion?: number | null;
  };
  insights: AiInsightCard[];
  analyzed_at: string;
}

export interface SimulationResult {
  status: string;
  action: string;
  message: string;
}
