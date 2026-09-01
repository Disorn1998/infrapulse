import React, { useState } from 'react';
import { AiAdvisorResponse } from '../types/api';

interface AiAdvisorWidgetProps {
  data: AiAdvisorResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AiAdvisorWidget: React.FC<AiAdvisorWidgetProps> = ({ data, loading, onRefresh }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (loading && !data) {
    return (
      <div className="bg-slate-900 border border-purple-500/20 rounded-xl p-6 shadow-xl animate-pulse flex items-center justify-center space-x-3 text-purple-400">
        <span className="inline-block w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin"></span>
        <span className="text-sm font-medium">Analyzing DCIM Telemetry & Power Thermodynamics...</span>
      </div>
    );
  }

  if (!data) return null;

  const scoreColor =
    data.datacenter_health_score >= 90
      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
      : data.datacenter_health_score >= 75
      ? 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10'
      : data.datacenter_health_score >= 50
      ? 'text-amber-400 border-amber-500/40 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/40 bg-rose-500/10';

  const filteredInsights =
    selectedCategory === 'ALL'
      ? data.insights
      : data.insights.filter((i) => i.category === selectedCategory);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">WARNING</span>;
      case 'OPTIMIZATION':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">AI OPTIMIZE</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">HEALTHY</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/30 border border-purple-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 text-xl font-bold">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white tracking-wide">InfraPulse AI Infrastructure Advisor</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/30 uppercase">
                Copilot Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous thermodynamic PUE diagnostics, electrical redundancy risk modeling & capacity runway forecasting.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Health Score Gauge */}
          <div className={`flex items-center space-x-2.5 px-4 py-2 rounded-xl border ${scoreColor}`}>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">DCIM Health Index</div>
              <div className="text-xs font-semibold">{data.health_status}</div>
            </div>
            <div className="text-2xl font-black">{data.datacenter_health_score}</div>
            <div className="text-xs font-medium opacity-60">/100</div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
            title="Refresh AI Analysis"
          >
            <span className={`inline-block text-sm ${loading ? 'animate-spin' : ''}`}>🔄</span>
          </button>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-slate-950/60 border border-purple-500/20 rounded-xl p-4 mb-5 text-sm text-slate-300 flex items-start space-x-3">
        <span className="text-purple-400 text-lg mt-0.5">💡</span>
        <div>
          <span className="font-semibold text-purple-200">Executive Assessment: </span>
          {data.executive_summary}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-1 text-xs">
        {['ALL', 'ENERGY_OPTIMIZATION', 'ELECTRICAL_SAFETY', 'CAPACITY_PLANNING', 'HARDWARE_HEALTH'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'All Insights' : cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInsights.map((card) => (
          <div
            key={card.id}
            className="bg-slate-950/70 border border-slate-800 hover:border-purple-500/40 rounded-xl p-4 transition-all hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.category.replace('_', ' ')}</span>
                {getSeverityBadge(card.severity)}
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5">{card.title}</h3>
              <p className="text-xs text-slate-300 mb-2 leading-relaxed">{card.summary}</p>
              
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 mb-2 text-[11px] text-slate-400 space-y-1">
                <div>
                  <strong className="text-slate-300">Operational Impact: </strong>
                  {card.impact}
                </div>
                <div>
                  <strong className="text-cyan-300">AI Recommendation: </strong>
                  {card.recommended_action}
                </div>
              </div>
            </div>

            {card.estimated_savings_or_benefit && (
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 font-medium">✨ {card.estimated_savings_or_benefit}</span>
                {card.action_type && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {card.action_type}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
