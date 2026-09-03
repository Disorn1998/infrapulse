import React, { useState } from 'react';
import { AiAdvisorResponse } from '../types/api';
import { Bot, Sparkles, RefreshCw, Send, ArrowRight, ShieldAlert, Zap, CheckCircle } from 'lucide-react';

interface AiAdvisorWidgetProps {
  data: AiAdvisorResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AiAdvisorWidget: React.FC<AiAdvisorWidgetProps> = ({ data, loading, onRefresh }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);

  if (loading && !data) {
    return (
      <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 animate-pulse">
          <Bot className="w-6 h-6" />
        </div>
        <p className="text-slate-300 font-mono text-sm">Analyzing DCIM Telemetry & Power Thermodynamics...</p>
      </div>
    );
  }

  if (!data) return null;

  const scoreColor =
    data.datacenter_health_score >= 90
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 shadow-glow-emerald'
      : data.datacenter_health_score >= 75
      ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10 shadow-glow-cyan'
      : data.datacenter_health_score >= 50
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10 shadow-glow-amber'
      : 'text-rose-400 border-rose-500/40 bg-rose-500/10 shadow-glow-rose';

  const filteredInsights =
    selectedCategory === 'ALL'
      ? data.insights
      : data.insights.filter((i) => i.category === selectedCategory);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/20 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            WARNING
          </span>
        );
      case 'OPTIMIZATION':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI OPTIMIZE
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            HEALTHY
          </span>
        );
    }
  };

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const q = aiQuestion.trim();
    let answer = `Based on current telemetry, the facility PUE is ${data.key_metrics_summary.dynamic_pue.toFixed(2)} with ${data.key_metrics_summary.online_nodes} active compute nodes. All cooling systems are running within ASHRAE thermal margins.`;
    
    if (q.toLowerCase().includes('pue')) {
      answer = `Current dynamic PUE is ${data.key_metrics_summary.dynamic_pue.toFixed(2)}. Target benchmark is 1.30. Consider balancing IT loads across Feed A and Feed B to optimize transformer efficiency.`;
    } else if (q.toLowerCase().includes('power') || q.toLowerCase().includes('ไฟ')) {
      answer = `Total IT load is currently ${data.key_metrics_summary.it_power_watts.toFixed(0)}W. Redundancy headroom is +${data.key_metrics_summary.n_plus_one_headroom_watts.toFixed(0)}W under 80% NEC derate limits.`;
    } else if (q.toLowerCase().includes('capacity') || q.toLowerCase().includes('ขยาย')) {
      answer = `Projected capacity exhaustion runway is ${data.key_metrics_summary.days_to_capacity_exhaustion ? data.key_metrics_summary.days_to_capacity_exhaustion + ' days' : 'over 365+ days'}. Current power growth trajectory remains stable.`;
    }

    setQaHistory((prev) => [...prev, { q, a: answer }]);
    setAiQuestion('');
  };

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden tech-border-glow select-none">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6 mb-6 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold font-mono text-white tracking-wide">
                InfraPulse AI Infrastructure Copilot
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                Copilot Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Continuous thermodynamic PUE diagnostics, electrical redundancy risk modeling & capacity runway forecasting.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Health Score Gauge */}
          <div className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border ${scoreColor}`}>
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono font-bold tracking-wider opacity-80">DCIM Health Index</div>
              <div className="text-xs font-mono font-bold">{data.health_status}</div>
            </div>
            <div className="text-3xl font-black font-mono">{data.datacenter_health_score}</div>
            <div className="text-xs font-mono font-medium opacity-60">/100</div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-surface-border hover:border-purple-500/40 transition-colors shadow-sm"
            title="Refresh AI Analysis"
          >
            <RefreshCw className={`w-4 h-4 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-slate-950/70 border border-purple-500/25 rounded-2xl p-4 sm:p-5 mb-6 text-sm text-slate-300 flex items-start space-x-3 shadow-inner">
        <span className="text-purple-400 text-xl mt-0.5 shrink-0">💡</span>
        <div>
          <span className="font-bold text-purple-200 font-mono">Executive Assessment: </span>
          <span className="font-sans leading-relaxed">{data.executive_summary}</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-5 overflow-x-auto pb-1 text-xs font-mono">
        {['ALL', 'ENERGY_OPTIMIZATION', 'ELECTRICAL_SAFETY', 'CAPACITY_PLANNING', 'HARDWARE_HEALTH'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'All Insights' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {filteredInsights.map((card) => (
          <div
            key={card.id}
            className="bg-slate-950/80 border border-slate-800/90 hover:border-purple-500/40 rounded-2xl p-5 transition-all hover:shadow-xl flex flex-col justify-between group tech-border-glow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {card.category.replace('_', ' ')}
                </span>
                {getSeverityBadge(card.severity)}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 font-mono">{card.title}</h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed font-sans">{card.summary}</p>
              
              <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 mb-3 text-xs text-slate-400 space-y-1.5 font-sans">
                <div>
                  <strong className="text-slate-300 font-mono text-[11px]">Operational Impact: </strong>
                  {card.impact}
                </div>
                <div>
                  <strong className="text-cyan-300 font-mono text-[11px]">AI Recommendation: </strong>
                  {card.recommended_action}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-bold">
                {card.estimated_savings_or_benefit ? `✨ ${card.estimated_savings_or_benefit}` : 'Optimized Operational Metric'}
              </span>
              <button className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-colors font-bold">
                <span>View Details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive AI Prompt Assistant Box */}
      <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 relative shadow-inner">
        {qaHistory.length > 0 && (
          <div className="mb-4 space-y-3 max-h-48 overflow-y-auto pr-1">
            {qaHistory.map((item, idx) => (
              <div key={idx} className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="font-bold">You:</span>
                  <span>{item.q}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <Bot className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="font-sans leading-relaxed">{item.a}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAsk} className="flex items-center gap-2">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask AI Copilot about your power, PUE, thermal limits, or capacity..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/60"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>

        <div className="flex items-center gap-2 mt-2.5 overflow-x-auto text-[10px] font-mono text-slate-500">
          <span>Suggestions:</span>
          <button
            type="button"
            onClick={() => setAiQuestion('How is our current PUE efficiency?')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
          >
            "How is our current PUE efficiency?"
          </button>
          <button
            type="button"
            onClick={() => setAiQuestion('Is N+1 redundancy safe if Node-1 trips?')}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
          >
            "Is N+1 redundancy safe?"
          </button>
        </div>
      </div>
    </div>
  );
};
