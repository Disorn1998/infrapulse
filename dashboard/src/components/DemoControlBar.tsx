import React, { useState } from 'react';
import { triggerSimulateCluster, triggerSimulateStress, triggerSimulateOutage, triggerSimulateReset } from '../services/api';
import { RefreshCw, Zap, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';

interface DemoControlBarProps {
  onSimulationComplete: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({ onSimulationComplete }) => {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSimulateCluster = async () => {
    try {
      setRunningAction('cluster');
      setStatusMessage('Provisioning 5 enterprise cluster nodes across Rack-01, Rack-02, and Rack-03...');
      const res = await triggerSimulateCluster();
      setStatusMessage(`✅ ${res.message}`);
      onSimulationComplete();
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setRunningAction(null);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSimulateStress = async () => {
    try {
      setRunningAction('stress');
      setStatusMessage('Executing 3-stage load stress test (10% -> 50% -> 92% CPU)...');
      const res = await triggerSimulateStress();
      setStatusMessage(`⚡ ${res.message}`);
      onSimulationComplete();
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setRunningAction(null);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSimulateOutage = async () => {
    try {
      setRunningAction('outage');
      setStatusMessage('Cutting utility Feed A & evaluating Feed B failover breaker headroom...');
      const res = await triggerSimulateOutage();
      setStatusMessage(`🔌 ${res.message}`);
      onSimulationComplete();
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setRunningAction(null);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  const handleSimulateReset = async () => {
    if (!confirm('Clear all simulated cluster nodes and restore clean dashboard state?')) return;
    try {
      setRunningAction('reset');
      setStatusMessage('Removing simulated test nodes from inventory...');
      const res = await triggerSimulateReset();
      setStatusMessage(`🧹 ${res.message}`);
      onSimulationComplete();
    } catch (err: any) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setRunningAction(null);
      setTimeout(() => setStatusMessage(null), 6000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 shadow-lg backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span className="font-bold text-white tracking-wide flex items-center gap-1.5 font-mono">
          🎮 Interactive Demo Sandbox:
        </span>
        <span className="text-slate-400 hidden sm:inline font-mono">1-Click Live Datacenter Scenarios</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end font-mono">
        <button
          onClick={handleSimulateCluster}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {runningAction === 'cluster' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>Simulate Cluster</span>
        </button>

        <button
          onClick={handleSimulateStress}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {runningAction === 'stress' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
          <span>Spike Load</span>
        </button>

        <button
          onClick={handleSimulateOutage}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {runningAction === 'outage' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>Feed A Outage</span>
        </button>

        <button
          onClick={handleSimulateReset}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          title="Reset and clear all simulated nodes"
        >
          {runningAction === 'reset' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>Reset Sandbox</span>
        </button>
      </div>

      {statusMessage && (
        <div className="w-full text-center py-1.5 px-3 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono animate-fade-in shadow-inner">
          {statusMessage}
        </div>
      )}
    </div>
  );
};
