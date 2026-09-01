import React, { useState } from 'react';
import { triggerSimulateCluster, triggerSimulateStress, triggerSimulateOutage } from '../services/api';

interface DemoControlBarProps {
  onSimulationComplete: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({ onSimulationComplete }) => {
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSimulateCluster = async () => {
    try {
      setRunningAction('cluster');
      setStatusMessage('Provisioning 4 enterprise nodes into 42U rack...');
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

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 shadow-lg backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
      <div className="flex items-center space-x-2.5">
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
        <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
          🎮 Interactive Demo Sandbox:
        </span>
        <span className="text-slate-400 hidden sm:inline">1-Click Live Datacenter Scenarios</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <button
          onClick={handleSimulateCluster}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {runningAction === 'cluster' ? <span className="animate-spin">🔄</span> : '🚀'}
          <span>Simulate Cluster</span>
        </button>

        <button
          onClick={handleSimulateStress}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {runningAction === 'stress' ? <span className="animate-spin">🔄</span> : '⚡'}
          <span>Spike Load (PUE Curve)</span>
        </button>

        <button
          onClick={handleSimulateOutage}
          disabled={runningAction !== null}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 hover:border-rose-500/60 transition-all font-semibold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
        >
          {runningAction === 'outage' ? <span className="animate-spin">🔄</span> : '🔌'}
          <span>Feed A Outage</span>
        </button>
      </div>

      {statusMessage && (
        <div className="w-full text-center py-1 px-2 rounded bg-slate-950 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono animate-fade-in">
          {statusMessage}
        </div>
      )}
    </div>
  );
};
