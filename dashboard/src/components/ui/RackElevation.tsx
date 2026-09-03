import React from 'react';
import { RackSummary, RackHost } from '../../types/api';

interface RackElevationProps {
  rack: RackSummary;
  selectedHostId?: string | null;
  onSelectHost?: (hostId: string) => void;
  className?: string;
}

export const RackElevation: React.FC<RackElevationProps> = ({
  rack,
  selectedHostId,
  onSelectHost,
  className = '',
}) => {
  const totalU = rack.total_u || 42;

  // Map hosts to their U slots
  const hostSlotMap: Record<number, RackHost> = {};
  const occupiedSlots = new Set<number>();

  rack.hosts.forEach((h) => {
    const start = h.u_start;
    const height = h.u_height || 1;
    hostSlotMap[start] = h;
    for (let u = start; u < start + height; u++) {
      occupiedSlots.add(u);
    }
  });

  const getThermalClass = (tempC: number) => {
    if (tempC >= 75) return 'border-rose-500/80 bg-rose-950/40 text-rose-300 shadow-sm shadow-rose-500/20';
    if (tempC >= 65) return 'border-amber-500/70 bg-amber-950/40 text-amber-300 shadow-sm shadow-amber-500/15';
    return 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300 hover:border-cyan-400';
  };

  // Render from U42 down to U1 (standard top-down rack elevation)
  const slots = [];
  for (let u = totalU; u >= 1; u--) {
    const hostAtSlot = hostSlotMap[u];
    const isOccupiedByMultiU = occupiedSlots.has(u) && !hostAtSlot;

    // If occupied by an earlier slot's multi-U server, skip rendering separate slot container
    if (isOccupiedByMultiU) {
      continue;
    }

    if (hostAtSlot) {
      const height = hostAtSlot.u_height || 1;
      const isSelected = selectedHostId === hostAtSlot.host_id;

      slots.push(
        <div
          key={`slot-host-${u}`}
          onClick={() => onSelectHost && onSelectHost(hostAtSlot.host_id)}
          className={`relative group cursor-pointer transition-all rounded px-2 flex items-center justify-between border ${
            isSelected
              ? 'ring-1 ring-cyan-400 border-cyan-400 bg-cyan-950/50 shadow-md shadow-cyan-500/20'
              : getThermalClass(hostAtSlot.temperature_celsius)
          }`}
          style={{ height: `${Math.max(26, height * 26)}px`, margin: '1.5px 0' }}
        >
          {/* Left: U label & LED */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-mono text-slate-500 font-semibold w-6 shrink-0">
              U{u}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                hostAtSlot.is_online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            {/* Chassis Front Drive Lines */}
            <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-40 group-hover:opacity-80">
              <span className="w-1 h-3 bg-slate-400 rounded-xs"></span>
              <span className="w-1 h-3 bg-slate-400 rounded-xs"></span>
              <span className="w-1 h-3 bg-slate-400 rounded-xs"></span>
            </div>
            <span className="text-xs font-mono font-bold text-white truncate max-w-[120px]">
              {hostAtSlot.hostname}
            </span>
          </div>

          {/* Right: Power & Thermal Readings */}
          <div className="flex items-center gap-2 font-mono text-[10px] shrink-0">
            <span className="text-amber-400 font-semibold">
              {Math.round(hostAtSlot.power_watts)}W
            </span>
            <span
              className={`px-1 rounded text-[9px] font-bold ${
                hostAtSlot.temperature_celsius >= 70 ? 'text-rose-400 bg-rose-950/80' : 'text-slate-400'
              }`}
            >
              {hostAtSlot.temperature_celsius}&deg;C
            </span>
            <span
              className={`px-1 py-0.2 rounded text-[8px] font-bold border ${
                hostAtSlot.feed === 'A'
                  ? 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30'
                  : 'border-emerald-500/40 text-emerald-400 bg-emerald-950/30'
              }`}
            >
              F-{hostAtSlot.feed || 'A'}
            </span>
          </div>
        </div>
      );
    } else {
      // Empty slot
      slots.push(
        <div
          key={`slot-empty-${u}`}
          className="h-[22px] my-[1px] px-2 rounded flex items-center justify-between border border-slate-900/80 bg-slate-950/40 hover:bg-slate-900/40 transition-colors select-none"
        >
          <span className="text-[9px] font-mono text-slate-700">U{u}</span>
          <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">Available</span>
        </div>
      );
    }
  }

  return (
    <div className={`border border-surface-border bg-slate-950/90 rounded-xl p-3 flex flex-col ${className}`}>
      {/* Rack Header Frame */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white uppercase">{rack.name}</span>
          <span className="text-slate-500">({rack.zone})</span>
        </div>
        <div className="text-[11px] text-slate-400">
          <span className="text-cyan-400 font-bold">{rack.occupied_u}</span> / {totalU} U ({rack.available_u} Free)
        </div>
      </div>

      {/* 42U Cabinet Slots Scrollable Frame */}
      <div className="overflow-y-auto max-h-[440px] pr-1 space-y-0.5">
        {slots}
      </div>

      {/* Rack Footer / Floor Baseline */}
      <div className="pt-2 mt-2 border-t border-surface-border flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Load: <strong>{Math.round(rack.total_power_watts)}W</strong> / {rack.max_power_kw}kW</span>
        <span className="text-slate-500">PDU: Dual-Feed A+B</span>
      </div>
    </div>
  );
};
