import React from 'react';
import { Activity, RefreshCw, Server, Settings, FileSpreadsheet } from 'lucide-react';
import { FacilityOverview } from '../types/api';

interface HeaderProps {
  facility?: FacilityOverview | null;
  countdown: number;
  isRefreshing: boolean;
  onManualRefresh: () => void;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  facility,
  countdown,
  isRefreshing,
  onManualRefresh,
  onOpenSettings,
  onOpenExport,
}) => {
  const isStandby = !facility || facility.total_it_power_watts === 0;

  const getPueBadge = () => {
    if (isStandby) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>PUE: Standby (No Load)</span>
        </div>
      );
    }

    const isOptimal = facility.current_pue <= facility.target_pue;
    return (
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${
          isOptimal
            ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/60 border-amber-500/30 text-amber-300'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOptimal ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`}
        ></span>
        <span>
          PUE <strong>{facility.current_pue.toFixed(2)}</strong> (BOI Target &le; {facility.target_pue.toFixed(2)})
        </span>
      </div>
    );
  };

  return (
    <header className="border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Site Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white font-mono">
              INFRAPULSE
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              DCIM v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>{facility?.facility_name || 'Bangkok Edge DC - Zone A'}</span>
          </p>
        </div>
      </div>

      {/* Global Status, Actions & Auto-Refresh Bar */}
      <div className="flex items-center flex-wrap gap-2.5">
        {getPueBadge()}

        {/* 1-Click Export DCIM Report */}
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold transition-colors shadow-sm shadow-emerald-500/5"
            title="Export DCIM Executive Audit Report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Audit</span>
          </button>
        )}

        {/* Threshold Alert Settings Gear */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-surface-border text-slate-300 hover:text-cyan-400 text-xs font-mono transition-colors"
            title="Configure Alert Threshold Rules"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Alert Rules</span>
          </button>
        )}

        {/* Refresh Timer & Manual Action */}
        <div className="flex items-center gap-2 bg-surface-card border border-surface-border px-3 py-1 rounded-lg text-xs font-mono text-slate-300">
          <span className="text-slate-500 text-[11px]">Auto: {countdown}s</span>
          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-cyan-400 transition-colors p-1 -mr-1 rounded hover:bg-slate-800 disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
