import React from 'react';
import { ServerOff, Terminal } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="border border-surface-border bg-surface-card/70 backdrop-blur rounded-2xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-12 shadow-xl shadow-cyan-500/5">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-6">
        <ServerOff className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-bold font-mono text-white tracking-tight">
        No Monitored Nodes Registered
      </h2>
      <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
        The InfraPulse backend is running and listening on <code className="text-cyan-400 font-mono">POST /api/v1/metrics</code>, but no telemetry agents have connected yet.
      </p>

      <div className="mt-8 text-left bg-background border border-surface-border rounded-xl p-5 font-mono text-xs text-slate-300 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold border-b border-surface-border pb-2">
          <Terminal className="w-4 h-4" />
          <span>Quickstart: Launch Agent on Host Machine</span>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px] mb-1">1. Test single metric ingestion snapshot:</span>
          <div className="bg-slate-900 px-3 py-2 rounded-lg text-emerald-400 select-all border border-slate-800">
            python agent/monitor_agent.py --once
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-[11px] mb-1">2. Run continuous 30-second telemetry daemon:</span>
          <div className="bg-slate-900 px-3 py-2 rounded-lg text-cyan-400 select-all border border-slate-800">
            python agent/monitor_agent.py --interval 30
          </div>
        </div>
      </div>
    </div>
  );
};
