import React from 'react';
import { Zap, ShieldCheck, Gauge, Layers, AlertTriangle } from 'lucide-react';
import { FacilityOverview } from '../types/api';
import { PueGauge } from './ui/PueGauge';

interface FacilityKpiProps {
  facility?: FacilityOverview | null;
}

export const FacilityKpi: React.FC<FacilityKpiProps> = ({ facility }) => {
  if (!facility) return null;

  const isStandby = facility.total_it_power_watts === 0;
  const redundancy = facility.redundancy;
  const isHealthy = redundancy?.status === 'HEALTHY';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* 1. Active IT Workload Power */}
      <div className="bg-surface-card/85 backdrop-blur-md border border-surface-border hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-cyan-500/5 transition-all tech-border-glow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Total IT Power (Compute)
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {facility.total_it_power_watts.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-mono text-cyan-400 font-bold">Watts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
            {isStandby ? (
              <span className="text-amber-400 font-medium">⚡ Standby — Waiting for node telemetry</span>
            ) : (
              <span className="text-slate-300">Live aggregated workload load</span>
            )}
          </p>
        </div>

        <div className="mt-4 relative z-10">
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-400/50"
              style={{
                width: `${Math.min(100, Math.max(5, (facility.total_it_power_watts / (facility.total_power_capacity_watts || 10000)) * 100))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>IT Compute Draw</span>
            <span>{((facility.total_it_power_watts / (facility.total_power_capacity_watts || 10000)) * 100).toFixed(1)}% Cap</span>
          </div>
        </div>
      </div>

      {/* 2. Total Facility Power Draw */}
      <div className="bg-surface-card/85 backdrop-blur-md border border-surface-border hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-emerald-500/5 transition-all tech-border-glow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Total Facility Power
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {facility.total_facility_power_watts.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-mono text-emerald-400 font-bold">Watts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 font-mono flex items-center justify-between">
            <span>Base: {facility.fixed_overhead_watts}W</span>
            <span className="text-emerald-400 font-medium">Ceiling: {(facility.total_power_capacity_watts / 1000).toFixed(0)} kW</span>
          </p>
        </div>

        <div className="mt-4 relative z-10">
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-400/50"
              style={{ width: `${Math.min(100, Math.max(3, facility.power_capacity_utilization_percent || 2))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>Utility Load</span>
            <span>{(facility.power_capacity_utilization_percent || 0).toFixed(1)}% Capacity</span>
          </div>
        </div>
      </div>

      {/* 3. Dynamic PUE Index (Arc Meter) */}
      <div className="bg-surface-card/85 backdrop-blur-md border border-surface-border hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-indigo-500/5 transition-all tech-border-glow relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            Dynamic PUE Index
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="my-auto py-1 flex justify-center">
          <PueGauge
            currentPue={facility.current_pue}
            targetPue={facility.target_pue}
            isStandby={isStandby}
            size={160}
            showDetails={true}
          />
        </div>
      </div>

      {/* 4. Dual-Feed N+1 Redundancy Status */}
      <div className="bg-surface-card/85 backdrop-blur-md border border-surface-border hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-amber-500/5 transition-all tech-border-glow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            N+1 Power Redundancy
          </span>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isHealthy
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {isHealthy ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-amber-400" />}
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider border ${
                isHealthy
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              {redundancy?.status || 'HEALTHY'}
            </span>
            <span className="text-xs font-mono text-slate-400 font-medium">
              NEC 80% Rule
            </span>
          </div>
          <div className="text-[11px] text-slate-300 mt-2 font-mono flex items-center justify-between bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <span>Feed A: <strong className="text-cyan-400">{Math.round(redundancy?.feed_a?.current_load_watts || 0)}W</strong></span>
            <span>Feed B: <strong className="text-emerald-400">{Math.round(redundancy?.feed_b?.current_load_watts || 0)}W</strong></span>
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isHealthy ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(5, redundancy?.feed_a?.utilization_percent || 0))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>Feed Utilization</span>
            <span>{(redundancy?.feed_a?.utilization_percent || 0).toFixed(1)}% Max Safe</span>
          </div>
        </div>
      </div>
    </div>
  );
};
