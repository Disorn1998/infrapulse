import React from 'react';
import { Server, Monitor, Trash2, Zap, ArrowDown, ArrowUp } from 'lucide-react';
import { Host, Metric } from '../types/api';
import { formatLastSeen } from '../services/api';
import { CircularGauge } from './ui/CircularGauge';
import { ServerIcon } from './ui/ServerIcon';

interface HostCardProps {
  host: Host;
  isSelected: boolean;
  latestMetric?: Metric | null;
  onSelect: (host: Host) => void;
  onDelete?: (hostId: string) => void;
}

export const HostCard: React.FC<HostCardProps> = ({
  host,
  isSelected,
  latestMetric,
  onSelect,
  onDelete,
}) => {
  const isOnline = host.is_online;
  const isWindows = host.os_type?.toLowerCase().includes('win');

  const cpuPct = latestMetric?.cpu_percent ?? 0;
  const ramPct = latestMetric?.ram_percent ?? (host.total_ram_bytes > 0 ? Math.round(((latestMetric?.ram_used_bytes || 0) / host.total_ram_bytes) * 100) : 0);
  const diskPct = latestMetric?.disk_percent ?? 0;
  const tempC = latestMetric?.cpu_temperature_celsius;
  const powerW = latestMetric?.calculated_power_watts ?? host.power_config?.idle_watts ?? 0;
  const netIn = latestMetric?.net_recv_bytes_per_sec;
  const netOut = latestMetric?.net_sent_bytes_per_sec;

  const formatBandwidth = (bytesPerSec?: number | null) => {
    if (bytesPerSec == null || isNaN(bytesPerSec) || bytesPerSec <= 0) return '0 B/s';
    if (bytesPerSec >= 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    if (bytesPerSec >= 1024) return `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
    return `${Math.round(bytesPerSec)} B/s`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove node '${host.hostname}' from monitored inventory?`)) {
      if (onDelete) onDelete(host.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(host)}
      className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border relative overflow-hidden group tech-border-glow ${
        isSelected
          ? 'bg-surface-card border-cyan-400 shadow-glow-cyan ring-1 ring-cyan-400/50'
          : 'bg-surface/75 border-surface-border hover:border-cyan-500/40 hover:bg-surface-card/70'
      }`}
    >
      {/* Background Accent Grid / Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar: Server Hardware Graphic, Hostname, OS & Status */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          {/* Server Hardware Icon with Live LED Glow */}
          <div className="relative shrink-0">
            <ServerIcon isOnline={isOnline} variant="isometric" size="md" />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-md flex items-center justify-center border text-[9px] ${
                isWindows
                  ? 'bg-blue-950/80 border-blue-500/40 text-blue-400'
                  : 'bg-orange-950/80 border-orange-500/40 text-orange-400'
              }`}
              title={host.os_type}
            >
              {isWindows ? <Monitor className="w-2.5 h-2.5" /> : <Server className="w-2.5 h-2.5" />}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                {host.hostname}
              </h3>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>{host.ip_address || 'DHCP (No IP)'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{host.cpu_count} vCPU</span>
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge, Temperature Pill & Delete Action */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            {tempC && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  tempC >= 75
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : tempC >= 65
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}
              >
                🌡️ {tempC}&deg;C
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              ></span>
              {isOnline ? 'Online' : 'Offline'}
            </span>

            {/* Delete button */}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="opacity-50 group-hover:opacity-100 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-all text-slate-500"
                title="Remove node from inventory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            {powerW > 0 && (
              <span className="flex items-center gap-0.5 text-amber-400 font-semibold">
                <Zap className="w-3 h-3 text-amber-400" />
                {powerW.toFixed(0)}W
              </span>
            )}
            <span className="text-slate-500">
              {formatLastSeen(host.seconds_since_last_seen)}
            </span>
          </div>
        </div>
      </div>

      {/* Circular Gauges for High-Tech NOC Monitoring */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 bg-slate-950/40 rounded-xl p-2.5">
        <CircularGauge
          value={cpuPct}
          label="CPU"
          size={56}
          strokeWidth={4.5}
          colorScheme={cpuPct > 85 ? 'rose' : cpuPct > 70 ? 'amber' : 'cyan'}
        />

        <CircularGauge
          value={ramPct}
          label="RAM"
          size={56}
          strokeWidth={4.5}
          colorScheme={ramPct > 85 ? 'rose' : ramPct > 70 ? 'amber' : 'emerald'}
        />

        <CircularGauge
          value={diskPct}
          label="DISK"
          size={56}
          strokeWidth={4.5}
          colorScheme={diskPct > 85 ? 'rose' : diskPct > 75 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Network I/O Bandwidth Live Strip */}
      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono px-2.5 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <ArrowDown className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="text-slate-500">RX:</span>
          <span className="text-slate-300 font-semibold">{formatBandwidth(netIn)}</span>
        </div>
        <div className="text-slate-700 font-extrabold">•</div>
        <div className="flex items-center gap-1.5">
          <ArrowUp className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="text-slate-500">TX:</span>
          <span className="text-slate-300 font-semibold">{formatBandwidth(netOut)}</span>
        </div>
      </div>
    </div>
  );
};
