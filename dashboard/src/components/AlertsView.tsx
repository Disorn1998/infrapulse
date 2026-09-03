import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Search,
  Mail,
  Sliders,
  Send,
  Check,
  Flame,
  Radio,
  Clock,
  Server,
  Zap,
} from 'lucide-react';
import { AlertConfig, AlertHistoryItem } from '../types/api';
import {
  fetchAlertConfigs,
  fetchAlertHistory,
  triggerImmediateAlertEvaluation,
  sendTestAlertEmail,
} from '../services/api';

interface AlertsViewProps {
  onOpenSettings: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ onOpenSettings }) => {
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [history, setHistory] = useState<AlertHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [testEmail, setTestEmail] = useState<string>('disorn.jp@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);
  const [testErrorMsg, setTestErrorMsg] = useState<string | null>(null);
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsData, historyData] = await Promise.all([
        fetchAlertConfigs().catch(() => []),
        fetchAlertHistory(undefined, 150).catch(() => []),
      ]);
      setConfigs(configsData);
      setHistory(historyData);
      if (configsData.length > 0 && configsData[0].recipient_email) {
        setTestEmail(configsData[0].recipient_email);
      }
    } catch (err) {
      console.error('Failed to load alerts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleEvaluateNow = async () => {
    try {
      setEvaluating(true);
      await triggerImmediateAlertEvaluation();
      await loadData();
    } catch (err) {
      console.error('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    try {
      setIsSendingTest(true);
      setTestSuccessMsg(null);
      setTestErrorMsg(null);
      const res = await sendTestAlertEmail(testEmail);
      if (res.delivered) {
        setTestSuccessMsg(`Test alert dispatched via SMTP to ${testEmail}`);
      } else {
        setTestErrorMsg('SMTP delivery attempt returned unconfirmed status');
      }
      setTimeout(() => {
        setTestSuccessMsg(null);
        setTestErrorMsg(null);
      }, 5000);
    } catch (err: any) {
      setTestErrorMsg(err.message || 'Failed to dispatch test email');
      setTimeout(() => setTestErrorMsg(null), 5000);
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleAcknowledge = (id: string) => {
    setAcknowledgedIds((prev) => new Set([...prev, id]));
  };

  // Calculations
  const firingRules = configs.filter((c) => c.current_state === 'FIRING');
  const activeAlertsCount = firingRules.length;
  const criticalCount = history.filter(
    (h) => h.metric_name.includes('cpu') || h.metric_name.includes('offline')
  ).length;
  const warningCount = history.filter(
    (h) => h.metric_name.includes('ram') || h.metric_name.includes('disk')
  ).length;

  const filteredHistory = history.filter((item) => {
    const isAcked = acknowledgedIds.has(item.id);
    if (filterSeverity === 'ACKNOWLEDGED' && !isAcked) return false;
    if (filterSeverity === 'CRITICAL' && !item.metric_name.includes('cpu') && !item.metric_name.includes('offline')) return false;
    if (filterSeverity === 'WARNING' && !item.metric_name.includes('ram') && !item.metric_name.includes('disk')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchHost = item.host_id?.toLowerCase().includes(q) ?? false;
      const matchMetric = item.metric_name.toLowerCase().includes(q);
      const matchMsg = item.message.toLowerCase().includes(q);
      return matchHost || matchMetric || matchMsg;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Active Incidents */}
        <div className="bg-surface-card border border-rose-500/30 rounded-2xl p-4.5 relative overflow-hidden shadow-lg shadow-rose-500/10 tech-border-glow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
              Active Incidents
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeAlertsCount > 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {activeAlertsCount > 0 ? 'FIRING' : 'NORMAL'}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {activeAlertsCount}
            </span>
            <span className="text-xs text-slate-400">Rules Breaching</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Automated email dispatch active
          </div>
        </div>

        {/* Critical Alerts History */}
        <div className="bg-surface-card border border-amber-500/30 rounded-2xl p-4.5 relative overflow-hidden shadow-lg shadow-amber-500/10 tech-border-glow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Recorded Breaches
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
              {criticalCount} Critical
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {criticalCount + warningCount}
            </span>
            <span className="text-xs text-slate-400">{warningCount} Warnings</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            CPU, offline & memory alerts
          </div>
        </div>

        {/* Resolved / Healthy Nodes */}
        <div className="bg-surface-card border border-emerald-500/30 rounded-2xl p-4.5 relative overflow-hidden shadow-lg shadow-emerald-500/10 tech-border-glow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Healthy Rules
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {configs.filter((c) => c.current_state === 'OK').length} OK
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {configs.filter((c) => c.current_state === 'OK').length}
            </span>
            <span className="text-xs text-slate-400">Normal Bounds</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            15m quiet cooldown active
          </div>
        </div>

        {/* Total Notifications Dispatched */}
        <div className="bg-surface-card border border-cyan-500/30 rounded-2xl p-4.5 relative overflow-hidden shadow-lg shadow-cyan-500/10 tech-border-glow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              Audit Trail
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              {history.length} Logs
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">
              {history.length}
            </span>
            <span className="text-xs text-slate-400">Events Recorded</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            SMTP notifications audit log
          </div>
        </div>
      </div>

      {/* Action Bar & Quick SMTP Test Dispatch */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold font-mono text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span>Incident & Alert Command Center</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Real-time threshold state machine monitoring, SMTP alert dispatch, and historical incident audit trail.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={handleEvaluateNow}
              disabled={evaluating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-surface-border text-slate-300 hover:text-cyan-400 text-xs font-mono transition-colors disabled:opacity-50"
              title="Force immediate threshold rules evaluation across all hosts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${evaluating ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{evaluating ? 'Evaluating...' : 'Evaluate Rules'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold transition-colors shadow-sm shadow-cyan-500/10"
              title="Open Threshold Configuration"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Thresholds</span>
            </button>
          </div>
        </div>

        {/* Live SMTP Dispatch Verification Bar */}
        <form
          onSubmit={handleSendTestEmail}
          className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3 font-mono text-xs"
        >
          <div className="flex items-center gap-2 text-slate-400 shrink-0">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-semibold text-slate-300">Live SMTP Verification:</span>
          </div>

          <div className="relative flex-1 w-full">
            <input
              type="email"
              required
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@domain.com"
              className="w-full bg-slate-900 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSendingTest}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 shrink-0"
          >
            {isSendingTest ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isSendingTest ? 'Sending...' : 'Send Test Alert'}</span>
          </button>
        </form>

        {testSuccessMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testSuccessMsg}</span>
          </div>
        )}

        {testErrorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{testErrorMsg}</span>
          </div>
        )}
      </div>

      {/* Configured Threshold Rules Monitor */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Active Threshold Watchers ({configs.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Auto-evaluated every 30s
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono">
          {configs.map((cfg) => {
            const isFiring = cfg.current_state === 'FIRING';
            const isPending = cfg.current_state === 'PENDING';
            return (
              <div
                key={cfg.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFiring
                    ? 'bg-rose-950/30 border-rose-500/40 shadow-sm shadow-rose-500/10'
                    : isPending
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-900/40 border-surface-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                    {cfg.metric_name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isFiring
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                        : isPending
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {cfg.current_state}
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  Condition:{' '}
                  <strong className="text-cyan-400">
                    {cfg.operator} {cfg.threshold_value}
                    {cfg.metric_name.includes('percent') ? '%' : ''}
                  </strong>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Cooldown: {cfg.cooldown_minutes}m</span>
                  <span>Target: {cfg.host_id || 'All Nodes'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident & Alert Timeline / Audit Table */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-xl">
        {/* Table Controls */}
        <div className="p-4 sm:p-6 border-b border-surface-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white">
              Incident Audit Timeline
            </h3>
            <span className="text-xs font-mono text-slate-500">
              ({filteredHistory.length} events)
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 font-mono text-xs">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search host or metric..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-48"
              />
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-surface-border">
              {(['ALL', 'CRITICAL', 'WARNING', 'ACKNOWLEDGED'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    filterSeverity === sev
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950/70 border-b border-surface-border text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Severity & State</th>
                <th className="py-3 px-4">Target Node</th>
                <th className="py-3 px-4">Breach Metric</th>
                <th className="py-3 px-4">Value vs Limit</th>
                <th className="py-3 px-4">Dispatch Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading incident history logs...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <p className="text-white font-bold">All Systems Operating within Normal Limits</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      No active incident breaches matching selected filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isAcked = acknowledgedIds.has(item.id);
                  const isCritical =
                    item.metric_name.includes('cpu') || item.metric_name.includes('offline');
                  const dateStr = new Date(item.sent_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isAcked ? 'opacity-60 bg-slate-900/30' : ''
                      }`}
                    >
                      {/* Severity */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                            }`}
                          />
                          {isCritical ? 'CRITICAL' : 'WARNING'}
                        </span>
                      </td>

                      {/* Target Host */}
                      <td className="py-3 px-4 text-white font-bold flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.host_id || 'Global Facility'}</span>
                      </td>

                      {/* Metric */}
                      <td className="py-3 px-4 text-slate-300">
                        <code>{item.metric_name}</code>
                      </td>

                      {/* Value vs Limit */}
                      <td className="py-3 px-4">
                        {item.triggered_value != null ? (
                          <span>
                            <strong className="text-rose-400">
                              {item.triggered_value.toFixed(1)}
                            </strong>{' '}
                            <span className="text-slate-500">
                              / {item.threshold_value?.toFixed(1)} limit
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">{item.message}</span>
                        )}
                      </td>

                      {/* Dispatch Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                          <Check className="w-3 h-3" />
                          <span>SMTP Dispatched</span>
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {dateStr}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {isAcked ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Acknowledged</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAcknowledge(item.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-surface-border transition-colors"
                          >
                            Ack
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
