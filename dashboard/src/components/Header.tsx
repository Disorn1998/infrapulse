import React from 'react';
import { RefreshCw, Server, Settings, FileSpreadsheet, Bell, BookOpen } from 'lucide-react';
import { FacilityOverview } from '../types/api';

interface HeaderProps {
  facility?: FacilityOverview | null;
  countdown: number;
  isRefreshing: boolean;
  isWsConnected?: boolean;
  activeAlertCount?: number;
  dataMode?: 'live' | 'sandbox';
  onToggleMode?: (mode: 'live' | 'sandbox') => void;
  onNavigateLanding?: () => void;
  onManualRefresh: () => void;
  onOpenSettings?: () => void;
  onOpenExport?: () => void;
  onNavigateAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  facility,
  countdown,
  isRefreshing,
  isWsConnected = false,
  activeAlertCount = 0,
  dataMode = 'sandbox',
  onToggleMode,
  onNavigateLanding,
  onManualRefresh,
  onOpenSettings,
  onOpenExport,
  onNavigateAlerts,
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
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 group">
          {/* Animated Glow Pulse Ring */}
          <div className="absolute inset-0 rounded-xl bg-cyan-500/20 animate-ping opacity-25" />
          
          {/* SVG Heartbeat/Pulse Logo */}
          <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12h4l2-6 4 12 3-8 2 4h4" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-wider text-white font-mono bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              INFRAPULSE
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10 tracking-wider">
              DCIM v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <Server className="w-3.5 h-3.5 text-cyan-400/80" />
            <span className="text-slate-300 font-medium">{facility?.facility_name || 'Bangkok Edge DC - Zone A'}</span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-emerald-400/90 font-medium">NOC Online</span>
          </p>
        </div>
      </div>

      {/* Environment Mode Toggle: Live Production vs Sim Lab */}
      {onToggleMode && (
        <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner font-mono text-xs">
          <button
            onClick={() => onToggleMode('live')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              dataMode === 'live'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Real Infrastructure (Only hosts transmitting agent metrics)"
          >
            <span className={`w-2 h-2 rounded-full ${dataMode === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>Live Production</span>
          </button>
          <button
            onClick={() => onToggleMode('sandbox')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              dataMode === 'sandbox'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Interactive Simulation Lab (Virtual 5-Node Enterprise DC)"
          >
            <span className={`w-2 h-2 rounded-full ${dataMode === 'sandbox' ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
            <span>🎮 Sim Lab</span>
          </button>
        </div>
      )}

      {/* Link back to DC Primer / Landing Page */}
      {onNavigateLanding && (
        <button
          onClick={onNavigateLanding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all shadow-sm"
          title="What is a Data Center? (DCIM Primer & Architecture)"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">📘 DC Primer</span>
        </button>
      )}

      {/* Global Status, Actions & Auto-Refresh Bar */}
      <div className="flex items-center flex-wrap gap-2.5">
        {getPueBadge()}

        {/* Active Incident Alert Bell */}
        <button
          onClick={onNavigateAlerts || onOpenSettings}
          className={`relative p-2 rounded-lg border transition-all ${
            activeAlertCount > 0
              ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 shadow-sm shadow-rose-500/20 animate-pulse'
              : 'bg-slate-900 border-surface-border text-slate-400 hover:text-cyan-400'
          }`}
          title={
            activeAlertCount > 0
              ? `${activeAlertCount} active threshold breach rules firing`
              : 'Alert Command Center (All normal)'
          }
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-slate-950 font-bold font-mono text-[10px] rounded-full flex items-center justify-center shadow-lg">
              {activeAlertCount}
            </span>
          )}
        </button>

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

        {/* WebSocket Real-Time Stream Status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-all ${
            isWsConnected
              ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={isWsConnected ? 'WebSocket live real-time push active' : 'Polling mode active'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isWsConnected ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'
            }`}
          ></span>
          <span className="hidden md:inline">{isWsConnected ? 'Live Stream' : 'Polling'}</span>
        </div>

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
