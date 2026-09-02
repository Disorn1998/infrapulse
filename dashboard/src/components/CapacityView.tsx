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
  FileSpreadsheet,
  Thermometer,
} from 'lucide-react';
import { CapacityForecast, FacilityPowerLog, Host, RackSummary } from '../types/api';
import {
  fetchCapacityForecast,
  fetchPowerLogs,
  createPowerLog,
  deletePowerLog,
  fetchMultiRackTopology,
} from '../services/api';

interface CapacityViewProps {
  hosts?: Host[];
  onOpenExport?: () => void;
  onRefresh?: () => void;
}

export const CapacityView: React.FC<CapacityViewProps> = ({ onOpenExport }) => {
  const [forecast, setForecast] = useState<CapacityForecast | null>(null);
  const [powerLogs, setPowerLogs] = useState<FacilityPowerLog[]>([]);
  const [racks, setRacks] = useState<RackSummary[]>([]);
  const [selectedRackId, setSelectedRackId] = useState<string>('Rack-01');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
      const [fData, logsData, racksData] = await Promise.all([
        fetchCapacityForecast(),
        fetchPowerLogs(),
        fetchMultiRackTopology().catch(() => []),
      ]);
      setForecast(fData);
      setPowerLogs(logsData);
      setRacks(racksData);
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
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createPowerLog(logForm);
      setShowLogModal(false);
      loadData();
    } catch (err) {
      alert('Failed to save power log: ' + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (isSubmitting) return;
    if (confirm('Delete this power log record?')) {
      setIsSubmitting(true);
      try {
        await deletePowerLog(id);
        loadData();
      } finally {
        setIsSubmitting(false);
      }
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

  const currentRack = racks.find((r) => r.rack_id === selectedRackId) || racks[0] || null;

  const getThermalBadgeClass = (tempC: number) => {
    if (tempC >= 75) return 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse';
    if (tempC >= 65) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    if (tempC >= 45) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Row: 3 Capacity Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Rated Capacity Load */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Facility Capacity Load</span>
            <Zap className={`w-4 h-4 ${isUtilCritical ? 'text-rose-400' : isUtilWarning ? 'text-amber-400' : 'text-cyan-400'}`} />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">
              {forecast?.current_power_load_watts ? Math.round(forecast.current_power_load_watts) : 0}
            </span>
            <span className="text-slate-400 text-sm font-mono">/ {forecast ? Math.round(forecast.total_capacity_watts).toLocaleString() : 10000} W</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  isUtilCritical ? 'bg-rose-500' : isUtilWarning ? 'bg-amber-500' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, utilPct))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-400">
              <span>Utilization: {utilPct.toFixed(1)}%</span>
              <span className="text-slate-500">80% NEC Derate: 8,000 W</span>
            </div>
          </div>
        </div>

        {/* Card 2: Runout Forecast (Days Left) */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Capacity Runout Forecast</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {forecast?.estimated_days_to_exhaustion ? `${forecast.estimated_days_to_exhaustion} Days` : '365+ Days'}
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {forecast?.recommendation || 'Power consumption is within normal operational bounds.'}
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-surface-border/50 pt-2 mt-3">
            <span>Growth Slope:</span>
            <span className="text-slate-300 font-bold">
              {forecast ? (forecast.power_growth_slope_watts_per_day >= 0 ? '+' : '') : ''}
              {forecast?.power_growth_slope_watts_per_day.toFixed(1)} W/day
            </span>
          </div>
        </div>

        {/* Card 3: N+1 Peak-Node Drop Resilience */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">N+1 Peak Node Drop Resilience</span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>

          <div className="mt-3">
            <span className="text-base font-bold font-mono text-white truncate block">
              {forecast?.peak_node_drop?.peak_hostname || 'No node load'}
            </span>
            <span className="text-xs text-amber-400 font-mono">
              ({forecast?.peak_node_drop?.peak_power_watts ? forecast.peak_node_drop.peak_power_watts.toFixed(1) : 0} W)
            </span>
          </div>

          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            If peak node '{forecast?.peak_node_drop?.peak_hostname || 'N/A'}' trips, cluster load reduces to{' '}
            {forecast?.peak_node_drop?.remaining_load_watts ? forecast.peak_node_drop.remaining_load_watts.toFixed(1) : 0}W with {forecast?.peak_node_drop?.safety_headroom_watts ? forecast.peak_node_drop.safety_headroom_watts.toFixed(1) : 0}W utility headroom remaining.
          </p>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-surface-border/50 pt-2 mt-3">
            <span>Safety Headroom:</span>
            <span className="text-purple-300 font-bold">+{forecast?.peak_node_drop?.safety_headroom_watts ? forecast.peak_node_drop.safety_headroom_watts.toFixed(0) : 0} W</span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Predictive Power Growth Chart + Multi-Rack Elevation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Power Growth & Linear Trajectory */}
        <div className="lg:col-span-2 bg-surface-card border border-surface-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Predictive Power Growth & Linear Trajectory
              </h3>
              <p className="text-xs text-slate-400">Actual telemetry vs. Linear Regression model (y = mx + c)</p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-bold">
              Trend: {forecast?.growth_trend || 'MODERATE_GROWTH'}
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
                  <linearGradient id="projectedPowerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
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
                  fillOpacity={1}
                  fill="url(#actualPowerGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="projected_power_watts"
                  name="Linear Regression Trajectory (W)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Multi-Rack Elevation & Thermal Heatmap Matrix */}
        <div className="bg-surface-card border border-surface-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Rack Elevation & Thermal Heatmap
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{currentRack?.zone || 'Zone A'}</span>
            </div>

            {/* Multi-Rack Switcher Tabs */}
            <div className={`grid gap-1.5 mb-3 bg-slate-900/80 p-1 rounded-lg border border-slate-800`} style={{ gridTemplateColumns: `repeat(${(racks.length > 0 ? racks : [{rack_id:'Rack-01'},{rack_id:'Rack-02'},{rack_id:'Rack-03'}]).length}, minmax(0, 1fr))` }}>
              {(racks.length > 0 ? racks.map(r => r.rack_id) : ['Rack-01', 'Rack-02', 'Rack-03']).map((rId) => {
                const isSel = selectedRackId === rId;
                const rData = racks.find((r) => r.rack_id === rId);
                return (
                  <button
                    key={rId}
                    onClick={() => setSelectedRackId(rId)}
                    className={`py-1.5 px-2 rounded-md font-mono text-xs font-bold transition-all ${
                      isSel
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {rId}
                    {rData && (
                      <span className="block text-[9px] font-normal opacity-80">
                        {rData.occupied_u}U / {rData.avg_temperature_celsius}&deg;C
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Rack Summary Stats */}
            <div className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-surface-border text-[11px] font-mono mb-3">
              <span className="text-slate-400">
                Load: <strong className="text-white">{currentRack?.total_power_watts || 0}W</strong> / {currentRack?.max_power_kw || 5}kW
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Avg Temp: <strong className="text-amber-400">{currentRack?.avg_temperature_celsius || 24}&deg;C</strong>
              </span>
            </div>
          </div>

          {/* Rack Visual 42U Frame */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-lg p-2.5 h-64 overflow-y-auto space-y-1.5 font-mono text-xs">
            {currentRack && currentRack.hosts.length > 0 ? (
              currentRack.hosts.map((h) => {
                const uStart = h.u_start;
                const uHeight = h.u_height;
                const feed = h.feed || 'A';
                const tempC = h.temperature_celsius || 42.0;

                return (
                  <div
                    key={h.host_id}
                    className="bg-surface-card border border-slate-700/80 rounded px-2.5 py-1.5 flex items-center justify-between hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-500 font-bold">
                        U{uStart.toString().padStart(2, '0')}-U{(uStart + uHeight - 1).toString().padStart(2, '0')}
                      </span>
                      <span className="text-slate-200 font-bold truncate">{h.hostname}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Thermal Badge */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${getThermalBadgeClass(tempC)}`}>
                        {tempC}&deg;C
                      </span>

                      {/* Feed Badge */}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          feed === 'A' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        Feed {feed}
                      </span>
                      <span className="text-slate-400 text-[11px]">{h.power_watts}W</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-24 text-slate-500 italic">
                No servers provisioned in this rack.
              </div>
            )}

            {/* Empty Rack Filler Slot */}
            <div className="border border-dashed border-slate-800 rounded p-2 text-center text-slate-600 text-[11px]">
              + {currentRack ? currentRack.available_u : 32}U Available Space
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
          
          <div className="flex items-center gap-2.5">
            {/* 1-Click Export Report Button */}
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs font-mono transition-all shadow-md shadow-emerald-500/10"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export DCIM Audit Report</span>
              </button>
            )}

            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Monthly Audit</span>
            </button>
          </div>
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
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete log"
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

      {/* Add Monthly Audit Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-card border border-surface-border rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Add Monthly Energy Audit
            </h3>
            <form onSubmit={handleSaveLog} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Billing Month (YYYY-MM):</label>
                <input
                  type="month"
                  required
                  value={logForm.log_month}
                  onChange={(e) => setLogForm({ ...logForm, log_month: e.target.value })}
                  className="w-full bg-slate-900 border border-surface-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Total Facility (kWh):</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={logForm.total_facility_kwh}
                    onChange={(e) => setLogForm({ ...logForm, total_facility_kwh: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-surface-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">IT Equipment (kWh):</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={logForm.it_equipment_kwh}
                    onChange={(e) => setLogForm({ ...logForm, it_equipment_kwh: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-surface-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cooling (kWh):</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={logForm.cooling_kwh}
                    onChange={(e) => setLogForm({ ...logForm, cooling_kwh: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900 border border-surface-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Estimated PUE Preview:</label>
                <div className="bg-slate-900 p-2.5 rounded border border-slate-800 text-cyan-400 font-bold text-sm">
                  {logForm.it_equipment_kwh > 0
                    ? (logForm.total_facility_kwh / logForm.it_equipment_kwh).toFixed(3)
                    : 'N/A'}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    {logForm.it_equipment_kwh > 0 && logForm.total_facility_kwh / logForm.it_equipment_kwh <= 1.3
                      ? '(BOI Standard Compliant)'
                      : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Utility Invoice Ref:</label>
                <input
                  type="text"
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-surface-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
