import React from 'react';
import { Server, Monitor, Trash2 } from 'lucide-react';
import { Host, Metric } from '../types/api';
import { formatLastSeen } from '../services/api';

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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Remove node '${host.hostname}' from monitored inventory?`)) {
      if (onDelete) onDelete(host.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(host)}
      className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border relative overflow-hidden group ${
        isSelected
          ? 'bg-surface-card border-cyan-500 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
          : 'bg-surface/60 border-surface-border hover:border-slate-600 hover:bg-surface-card/60'
      }`}
    >
      {/* Top Bar: Icon, Name & Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
              isWindows
                ? 'bg-blue-950/50 border-blue-500/30 text-blue-400'
                : 'bg-orange-950/50 border-orange-500/30 text-orange-400'
            }`}
          >
            {isWindows ? <Monitor className="w-5 h-5" /> : <Server className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-mono tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                {host.hostname}
              </h3>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              <span>{host.ip_address || 'DHCP (No IP)'}</span>
              <span className="text-slate-600">•</span>
              <span className="capitalize">{host.os_type}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Status Badge, Temperature Pill & Delete Action */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {latestMetric?.cpu_temperature_celsius && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  latestMetric.cpu_temperature_celsius >= 75
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : latestMetric.cpu_temperature_celsius >= 65
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}
              >
                🌡️ {latestMetric.cpu_temperature_celsius}&deg;C
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                isOnline
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-400'
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
                className="opacity-60 group-hover:opacity-100 hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 transition-all text-slate-500"
                title="Remove node from inventory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {formatLastSeen(host.seconds_since_last_seen)}
          </span>
        </div>
      </div>

      {/* Mini Metric Gauges */}
      <div className="mt-4 grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
        {/* CPU */}
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>CPU</span>
            <span className="text-slate-200 font-semibold">{cpuPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                cpuPct > 85 ? 'bg-rose-500' : cpuPct > 65 ? 'bg-amber-400' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, cpuPct))}%` }}
            ></div>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>RAM</span>
            <span className="text-slate-200 font-semibold">{ramPct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                ramPct > 85 ? 'bg-rose-500' : ramPct > 70 ? 'bg-amber-400' : 'bg-indigo-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, ramPct))}%` }}
            ></div>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Disk</span>
            <span className="text-slate-200 font-semibold">{diskPct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(2, diskPct))}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
