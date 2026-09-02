import React, { useState } from 'react';
import { ServerOff, Terminal, Copy, Check, Sparkles } from 'lucide-react';
import { triggerSimulateCluster } from '../services/api';

export const EmptyState: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'linux' | 'windows' | 'demo'>('linux');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const linuxCommand = 'curl -sSL https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.sh | sudo bash';
  const windowsCommand = 'irm https://raw.githubusercontent.com/Disorn1998/infrapulse/main/agent/install.ps1 | iex';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleQuickDemo = async () => {
    try {
      setIsSimulating(true);
      await triggerSimulateCluster();
      window.location.reload();
    } catch (err) {
      console.error('Failed to trigger quick demo:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="border border-surface-border bg-surface-card/80 backdrop-blur rounded-2xl p-6 sm:p-10 text-center max-w-2xl mx-auto my-8 shadow-2xl shadow-cyan-500/5">
      <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
        <ServerOff className="w-7 h-7" />
      </div>

      <h2 className="text-xl font-bold font-mono text-white tracking-tight">
        No Monitored Nodes Connected
      </h2>
      <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
        Connect your real server in seconds with our 1-line installer, or launch an instant simulated cluster.
      </p>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mt-6 border-b border-surface-border pb-3">
        <button
          onClick={() => setActiveTab('linux')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'linux'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🐧 Linux / Ubuntu
        </button>

        <button
          onClick={() => setActiveTab('windows')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'windows'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          🪟 Windows (PowerShell)
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'demo'
              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 shadow-md shadow-purple-500/20'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          ✨ 1-Click Instant Demo
        </button>
      </div>

      {/* Tab 1: Linux 1-Liner */}
      {activeTab === 'linux' && (
        <div className="mt-5 text-left bg-background border border-surface-border rounded-xl p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Run on Ubuntu / Debian / CentOS / Raspberry Pi:</span>
            </span>
            <button
              onClick={() => handleCopy(linuxCommand)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg text-emerald-400 border border-slate-800 text-xs overflow-x-auto select-all">
            {linuxCommand}
          </div>
          <p className="text-[11px] text-slate-500">
            * Automatically installs dependencies, downloads agent, registers background systemd service, and starts streaming telemetry 24/7.
          </p>
        </div>
      )}

      {/* Tab 2: Windows 1-Liner */}
      {activeTab === 'windows' && (
        <div className="mt-5 text-left bg-background border border-surface-border rounded-xl p-4 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Run in PowerShell (as Administrator):</span>
            </span>
            <button
              onClick={() => handleCopy(windowsCommand)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg text-cyan-400 border border-slate-800 text-xs overflow-x-auto select-all">
            {windowsCommand}
          </div>
          <p className="text-[11px] text-slate-500">
            * Installs required packages, registers Windows Task Scheduler, and begins background transmission automatically.
          </p>
        </div>
      )}

      {/* Tab 3: Instant Demo */}
      {activeTab === 'demo' && (
        <div className="mt-5 bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-5 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Experience Full Cluster Telemetry Instantly</h3>
          <p className="text-xs text-slate-300 max-w-sm mx-auto">
            Click below to populate 4 enterprise server nodes across Feed A and Feed B in your 42U rack.
          </p>
          <button
            onClick={handleQuickDemo}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 inline-flex items-center gap-2"
          >
            {isSimulating ? <span className="animate-spin">🔄</span> : '🚀'}
            <span>{isSimulating ? 'Provisioning Cluster...' : 'Launch Instant 4-Node Cluster'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
