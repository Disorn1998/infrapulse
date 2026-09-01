import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Cpu, Wifi, Clock, Server, Zap, Activity } from 'lucide-react';
import { Host, Metric } from '../types/api';
import { formatBytes, formatRate, formatUptime } from '../services/api';

interface MetricChartsProps {
  selectedHost: Host;
  metrics: Metric[];
  timeRange: string;
  onRangeChange: (range: string) => void;
  isLoading: boolean;
}

export const MetricCharts: React.FC<MetricChartsProps> = ({
  selectedHost,
  metrics,
  timeRange,
  onRangeChange,
  isLoading,
}) => {
  const chartData = metrics.map((m) => {
    const dt = new Date(m.timestamp);
    const timeLabel =
      timeRange === '1h'
        ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      time: timeLabel,
      fullTime: dt.toLocaleString(),
      cpu: m.cpu_percent,
      ram: m.ram_percent,
      disk: m.disk_percent,
      netSent: m.net_sent_bytes_per_sec,
      netRecv: m.net_recv_bytes_per_sec,
      powerWatts: m.calculated_power_watts,
    };
  });

  const latestMetric = metrics[metrics.length - 1];

  return (
    <div className="space-y-6">
      {/* Node Info & Time Filter Toolbar */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white font-mono">{selectedHost.hostname}</h2>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono border ${
                  selectedHost.is_online
                    ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {selectedHost.is_online ? 'Active Telemetry' : 'Offline Node'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              IP: {selectedHost.ip_address || 'N/A'} | Cores: {selectedHost.cpu_count} | RAM:{' '}
              {formatBytes(selectedHost.total_ram_bytes)} | Disk: {formatBytes(selectedHost.total_disk_bytes)}
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-surface-border p-1 rounded-lg">
          {['1h', '6h', '24h'].map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              disabled={isLoading}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-all ${
                timeRange === r
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Telemetry Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. CPU & RAM Utilization Chart */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono text-white">CPU & RAM Utilization (%)</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 rounded"></span> CPU ({latestMetric?.cpu_percent ?? 0}%)
              </span>
              <span className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-0.5 bg-indigo-400 rounded"></span> RAM ({latestMetric?.ram_percent ?? 0}%)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                No telemetry recorded for this timeframe
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" minTickGap={45} interval="preserveStartEnd" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    name="CPU %"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cpuGradient)"
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="ram"
                    name="RAM %"
                    stroke="#818cf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#ramGradient)"
                    connectNulls={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Network I/O (Dual Line TX / RX) Chart */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold font-mono text-white">Network Throughput (Dual-Stream)</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-0.5 bg-emerald-400 rounded"></span> RX ({formatRate(latestMetric?.net_recv_bytes_per_sec)})
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400 rounded"></span> TX ({formatRate(latestMetric?.net_sent_bytes_per_sec)})
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                No network activity sampled for this timeframe
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" minTickGap={45} interval="preserveStartEnd" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => formatRate(val)}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any) => [formatRate(Number(val)), '']}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="netRecv"
                    name="RX Received"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="netSent"
                    name="TX Transmitted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Node Hardware & Power Specs Context Banner */}
      <div className="bg-surface border border-surface-border rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="space-y-1">
          <span className="text-slate-500 uppercase text-[10px]">Uptime Duration</span>
          <p className="text-slate-200 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {formatUptime(latestMetric?.uptime_seconds || 0)}
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500 uppercase text-[10px]">Estimated Power Draw</span>
          <p className="text-slate-200 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            {latestMetric?.calculated_power_watts?.toFixed(1) || selectedHost.power_config?.idle_watts || '0.0'} W
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500 uppercase text-[10px]">Rack Location</span>
          <p className="text-slate-200 font-semibold flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            {selectedHost.power_config?.rack_name || 'Rack-01'} (U{selectedHost.power_config?.rack_unit_start || '1'})
          </p>
        </div>
        <div className="space-y-1">
          <span className="text-slate-500 uppercase text-[10px]">PDU Feed Link</span>
          <p className="text-slate-200 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Feed {selectedHost.power_config?.pdu?.feed || 'A'} ({selectedHost.power_config?.pdu?.name || 'PDU-A1'})
          </p>
        </div>
      </div>
    </div>
  );
};
