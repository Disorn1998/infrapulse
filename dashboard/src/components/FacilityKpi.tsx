import React from 'react';
import { Zap, ShieldCheck, Gauge, Layers, AlertTriangle } from 'lucide-react';
import { FacilityOverview } from '../types/api';

interface FacilityKpiProps {
  facility?: FacilityOverview | null;
}

export const FacilityKpi: React.FC<FacilityKpiProps> = ({ facility }) => {
  if (!facility) return null;

  const isStandby = facility.total_it_power_watts === 0;
  const redundancy = facility.redundancy;
  const isHealthy = redundancy?.status === 'HEALTHY';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active IT Workload Power */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-cyan-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Total IT Power (Compute)
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {facility.total_it_power_watts.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-mono text-cyan-400 font-semibold">Watts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {isStandby ? (
              <span className="text-amber-400 font-medium">Standby — Awaiting node load</span>
            ) : (
              <span>Aggregated dynamic node draw</span>
            )}
          </p>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(5, (facility.total_it_power_watts / (facility.total_power_capacity_watts || 10000)) * 100))}%`,
            }}
          ></div>
        </div>
      </div>

      {/* 2. Total Facility Power Draw */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Total Facility Power
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {facility.total_facility_power_watts.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm font-mono text-emerald-400 font-semibold">Watts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
            <span>Room Base: {facility.fixed_overhead_watts}W</span>
            <span className="text-slate-500">Cap: {(facility.total_power_capacity_watts / 1000).toFixed(0)} kW</span>
          </p>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, facility.power_capacity_utilization_percent || 2)}%` }}
          ></div>
        </div>
      </div>

      {/* 3. Dynamic PUE Index */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Dynamic PUE Index
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            {isStandby ? (
              <span className="text-xl font-bold font-mono text-amber-400">
                Standby
              </span>
            ) : (
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {facility.current_pue.toFixed(2)}
              </span>
            )}
            <span className="text-xs font-mono text-slate-400">
              (BOI ≤ {facility.target_pue.toFixed(2)})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {isStandby ? (
              <span>Fixed overhead dominant at 0W IT</span>
            ) : facility.current_pue <= facility.target_pue ? (
              <span className="text-emerald-400">Optimal efficiency status</span>
            ) : (
              <span className="text-amber-400">Light load PUE inflation</span>
            )}
          </p>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isStandby
                ? 'bg-amber-500 w-1/4'
                : facility.current_pue <= facility.target_pue
                ? 'bg-emerald-400 w-3/4'
                : 'bg-amber-400 w-1/2'
            }`}
          ></div>
        </div>
      </div>

      {/* 4. Dual-Feed N+1 Redundancy Status */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            N+1 Power Redundancy
          </span>
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isHealthy
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
          >
            {isHealthy ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase tracking-wider border ${
                isHealthy
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              {redundancy?.status || 'HEALTHY'}
            </span>
            <span className="text-xs font-mono text-slate-400">
              NEC 80% Rule
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center justify-between">
            <span>Feed A: {redundancy?.feed_a?.current_load_watts || 0}W</span>
            <span>Feed B: {redundancy?.feed_b?.current_load_watts || 0}W</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, redundancy?.feed_a?.utilization_percent || 0))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
