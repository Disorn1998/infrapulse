import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Zap,
  TrendingUp,
  Layers,
  Calendar,
  PlusCircle,
  ShieldCheck,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { CapacityForecast, FacilityPowerLog, Host } from '../types/api';
import {
  fetchCapacityForecast,
  fetchPowerLogs,
  createPowerLog,
  deletePowerLog,
} from '../services/api';

interface CapacityViewProps {
  hosts: Host[];
  onRefresh?: () => void;
}

export const CapacityView: React.FC<CapacityViewProps> = ({ hosts }) => {
  const [forecast, setForecast] = useState<CapacityForecast | null>(null);
  const [powerLogs, setPowerLogs] = useState<FacilityPowerLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logForm, setLogForm] = useState({
    log_month: new Date().toISOString().substring(0, 7),
    total_facility_kwh: 3950,
    it_equipment_kwh: 3100,
    cooling_kwh: 560,
    notes: 'Manual Monthly Audit',
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fData, logsData] = await Promise.all([
        fetchCapacityForecast(),
        fetchPowerLogs(),
      ]);
      setForecast(fData);
      setPowerLogs(logsData);
    } catch (e) {
      console.error('Failed to load capacity view data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPowerLog(logForm);
      setShowLogModal(false);
      loadData();
    } catch (err) {
      alert('Failed to save power log: ' + err);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm('Delete this power log record?')) {
      await deletePowerLog(id);
      loadData();
    }
  };

  if (isLoading && !forecast) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Analyzing capacity forecasting & power logs...</p>
      </div>
    );
  }

  const utilPct = forecast ? forecast.current_utilization_percent : 0;
  const isUtilWarning = utilPct > 70;
  const isUtilCritical = utilPct > 85;

  return (
    <div className="space-y-6">
      {/* 1. Top Capacity & Growth KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Electrical Capacity Card */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Facility Capacity Load</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">
              {forecast?.current_power_load_watts.toLocaleString() || '0'}
            </span>
            <span className="text-sm font-mono text-slate-400">
              / {forecast?.total_capacity_watts.toLocaleString()} W
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isUtilCritical ? 'bg-rose-500' : isUtilWarning ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, utilPct))}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs font-mono text-slate-400">
            <span>Utilization: <strong className="text-white">{utilPct.toFixed(1)}%</strong></span>
            <span>80% NEC Derate: <strong className="text-slate-300">8,000 W</strong></span>
          </div>
        </div>

        {/* Predictive Growth & Exhaustion Date Card */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Capacity Runout Forecast</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {forecast?.estimated_days_to_exhaustion ? `${forecast.estimated_days_to_exhaustion} Days` : 'Stable'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2">
            {forecast?.recommendation || 'Power consumption is operating safely within continuous limits.'}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-surface-border pt-2">
            <span>Growth Slope:</span>
            <span className="text-slate-200">+{forecast?.power_growth_slope_watts_per_day} W/day</span>
          </div>
        </div>

        {/* Peak Single-Node Drop Analysis */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">N+1 Peak Node Drop Resilience</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white truncate max-w-[180px]">
              {forecast?.peak_node_drop.peak_node_hostname || 'N/A'}
            </span>
            <span className="text-xs font-mono text-amber-400">
              ({forecast?.peak_node_drop.peak_node_watts} W)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {forecast?.peak_node_drop.impact_summary}
          </p>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-surface-border pt-2">
            <span>Safety Headroom:</span>
            <span className="text-emerald-400 font-bold">+{forecast?.peak_node_drop.safety_headroom_watts} W</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Linear Regression Trend + 42U Rack Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictive Linear Growth Chart */}
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Predictive Power Growth & Linear Trajectory
              </h3>
              <p className="text-xs text-slate-400">Actual telemetry vs. Linear Regression model (y = mx + c)</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              Trend: {forecast?.growth_trend}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecast?.historical_trend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualPowerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}W`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Area
                  type="monotone"
                  dataKey="actual_power_watts"
                  name="Historical Actual Power (W)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#actualPowerGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="projected_power_watts"
                  name="Projected Linear Forecast (W)"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 42U Rack Elevation */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Rack-01 Elevation (42U)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Zone A</span>
          </div>

          {/* Rack Visual Frame */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2.5 h-72 overflow-y-auto space-y-1.5 font-mono text-xs">
            {hosts.map((h, idx) => {
              const cfg = h.power_config;
              const uStart = cfg?.rack_unit_start || idx * 2 + 1;
              const uHeight = cfg?.rack_unit_height || 2;
              const feed = cfg?.pdu?.feed || (idx % 2 === 0 ? 'A' : 'B');

              return (
                <div
                  key={h.id}
                  className="bg-surface-card border border-slate-700/80 rounded px-2.5 py-1.5 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-slate-500 font-bold">
                      U{uStart.toString().padStart(2, '0')}-U{(uStart + uHeight - 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-slate-200 font-bold truncate">{h.hostname}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        feed === 'A' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      Feed {feed}
                    </span>
                    <span className="text-slate-400">{cfg?.rated_watts || 150}W</span>
                  </div>
                </div>
              );
            })}

            {/* Empty Rack Filler Slot */}
            <div className="border border-dashed border-slate-800 rounded p-2 text-center text-slate-600 text-[11px]">
              + 30U Available Expansion Space
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Historical Monthly PUE & Energy Audit Logs */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Historical Monthly Energy & PUE Audit Log
            </h3>
            <p className="text-xs text-slate-400">Monthly utility meter audits, IT energy, and long-term PUE optimization</p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Monthly Audit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Historical PUE & Energy Chart */}
          <div className="lg:col-span-2 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={powerLogs} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="log_month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(v) => `${v} kWh`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="total_facility_kwh" name="Total Facility (kWh)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="it_equipment_kwh" name="IT Equipment (kWh)" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Table */}
          <div className="overflow-y-auto max-h-64 rounded-lg border border-surface-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-400 sticky top-0">
                <tr>
                  <th className="p-2.5">Month</th>
                  <th className="p-2.5">Facility</th>
                  <th className="p-2.5">IT</th>
                  <th className="p-2.5 text-cyan-400">PUE</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-slate-300">
                {powerLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-bold">{log.log_month}</td>
                    <td className="p-2.5">{log.total_facility_kwh.toLocaleString()}</td>
                    <td className="p-2.5">{log.it_equipment_kwh.toLocaleString()}</td>
                    <td className="p-2.5 font-bold text-cyan-400">{log.calculated_pue.toFixed(3)}</td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Add Power Log */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-card border border-surface-border rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Record Monthly Utility Power Audit</span>
            </h3>

            <form onSubmit={handleSaveLog} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Audit Month (YYYY-MM)</label>
                <input
                  type="text"
                  required
                  value={logForm.log_month}
                  onChange={(e) => setLogForm({ ...logForm, log_month: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  placeholder="2026-04"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Total Facility Energy (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={logForm.total_facility_kwh}
                  onChange={(e) => setLogForm({ ...logForm, total_facility_kwh: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">IT Equipment Energy (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={logForm.it_equipment_kwh}
                  onChange={(e) => setLogForm({ ...logForm, it_equipment_kwh: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Notes / Audit Reference</label>
                <input
                  type="text"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                  placeholder="Utility invoice #1042"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
