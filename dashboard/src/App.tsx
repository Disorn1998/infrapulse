import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FacilityKpi } from './components/FacilityKpi';
import { HostCard } from './components/HostCard';
import { MetricCharts } from './components/MetricCharts';
import { CapacityView } from './components/CapacityView';
import { AiAdvisorWidget } from './components/AiAdvisorWidget';
import { DemoControlBar } from './components/DemoControlBar';
import { EmptyState } from './components/EmptyState';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { ExportReportModal } from './components/ExportReportModal';
import { Host, Metric, FacilityOverview, AiAdvisorResponse } from './types/api';
import { fetchHosts, fetchHostMetrics, fetchFacilityOverview, fetchAiInsights, deleteHost, getWebSocketUrl } from './services/api';
import { Server, AlertCircle, Activity, Zap, Bot } from 'lucide-react';

const REFRESH_INTERVAL_SECONDS = 15;

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'capacity' | 'ai_advisor'>('telemetry');
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [facility, setFacility] = useState<FacilityOverview | null>(null);
  const [aiData, setAiData] = useState<AiAdvisorResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [countdown, setCountdown] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const [latestMetricsMap, setLatestMetricsMap] = useState<Record<string, Metric>>({});

  const loadData = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const [fetchedHosts, fetchedFacility, fetchedAi] = await Promise.all([
        fetchHosts(),
        fetchFacilityOverview().catch(() => null),
        fetchAiInsights().catch(() => null),
      ]);

      setHosts(fetchedHosts);
      setFacility(fetchedFacility);
      if (fetchedAi) setAiData(fetchedAi);

      if (fetchedHosts.length > 0) {
        setSelectedHostId((prev) => (prev && fetchedHosts.some((h) => h.id === prev) ? prev : fetchedHosts[0].id));

        // BUG-02 fix: Fetch latest metric snapshot for ALL hosts (not just selected)
        const latestMap: Record<string, Metric> = {};
        await Promise.all(
          fetchedHosts.map(async (h) => {
            try {
              const m = await fetchHostMetrics(h.id, '5m');
              if (m.length > 0) latestMap[h.id] = m[m.length - 1];
            } catch { /* skip failed hosts */ }
          })
        );
        setLatestMetricsMap(latestMap);
      } else {
        // BUG-04 fix: Reset selection when no hosts remain
        setSelectedHostId(null);
        setLatestMetricsMap({});
      }
    } catch (err: any) {
      console.error('Error fetching dashboard telemetry:', err);
      setError(err.message || 'Failed to connect to InfraPulse backend.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setCountdown(REFRESH_INTERVAL_SECONDS);
    }
  }, []);

  const loadSelectedMetrics = useCallback(async (hostId: string, range: string) => {
    try {
      const hostMetrics = await fetchHostMetrics(hostId, range);
      setMetrics(hostMetrics);

      if (hostMetrics.length > 0) {
        const last = hostMetrics[hostMetrics.length - 1];
        setLatestMetricsMap((prev) => ({ ...prev, [hostId]: last }));
      }
    } catch (err) {
      console.error(`Failed to load metrics for ${hostId}:`, err);
    }
  }, []);

  const loadAiInsights = useCallback(async () => {
    try {
      setIsAiLoading(true);
      const res = await fetchAiInsights();
      setAiData(res);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (selectedHostId) {
      loadSelectedMetrics(selectedHostId, timeRange);
    }
  }, [selectedHostId, timeRange, loadSelectedMetrics]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadData(true);
          if (selectedHostId) {
            loadSelectedMetrics(selectedHostId, timeRange);
          }
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadData, loadSelectedMetrics, selectedHostId, timeRange]);

  // WebSocket live telemetry subscription with resilient reconnection
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let pingTimer: any = null;

    const connect = () => {
      try {
        const url = getWebSocketUrl();
        ws = new WebSocket(url);

        ws.onopen = () => {
          setIsWsConnected(true);
          pingTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send('ping');
            }
          }, 25000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.event === 'telemetry_update') {
              // Instantaneous update for node cards
              setLatestMetricsMap((prev) => ({
                ...prev,
                [data.host_id]: {
                  id: Date.now(),
                  host_id: data.host_id,
                  timestamp: data.timestamp,
                  cpu_percent: data.cpu_percent,
                  ram_percent: data.ram_percent,
                  disk_percent: data.disk_percent,
                  calculated_power_watts: data.calculated_power_watts,
                  cpu_temperature_celsius: data.cpu_temperature_celsius,
                } as Metric,
              }));

              if (selectedHostId === data.host_id) {
                loadSelectedMetrics(data.host_id, timeRange);
              }
              // Refresh facility overview in background
              fetchFacilityOverview().then((f) => setFacility(f)).catch(() => {});
            } else if (data.event === 'simulation_updated' || data.event === 'batch_telemetry_update') {
              loadData(true);
            }
          } catch (e) {
            // Ignore parse errors
          }
        };

        ws.onclose = () => {
          setIsWsConnected(false);
          clearInterval(pingTimer);
          reconnectTimer = setTimeout(connect, 4000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (err) {
        setIsWsConnected(false);
        reconnectTimer = setTimeout(connect, 4000);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      clearInterval(pingTimer);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [selectedHostId, timeRange, loadData, loadSelectedMetrics]);

  const handleManualRefresh = () => {
    loadData(false);
    if (selectedHostId) {
      loadSelectedMetrics(selectedHostId, timeRange);
    }
  };

  const handleDeleteHost = async (hostId: string) => {
    try {
      await deleteHost(hostId);
      await loadData(false);
    } catch (err: any) {
      alert('Failed to remove host: ' + err.message);
    }
  };

  const selectedHost = hosts.find((h) => h.id === selectedHostId);

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col">
      <Header
        facility={facility}
        countdown={countdown}
        isRefreshing={isRefreshing}
        isWsConnected={isWsConnected}
        onManualRefresh={handleManualRefresh}
        onOpenSettings={() => setIsAlertModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        {/* Interactive 1-Click Demo Control Bar */}
        <DemoControlBar onSimulationComplete={handleManualRefresh} />

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-center gap-3 text-rose-300 font-mono text-xs shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div>
              <strong className="font-bold">Backend Connection Issue: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <FacilityKpi facility={facility} />

        {/* High-Tech NOC Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3 overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-300'
                : 'bg-surface-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-surface-border'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Real-Time Telemetry</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'telemetry' ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-900 text-cyan-400'
            }`}>
              {hosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('capacity')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === 'capacity'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-300'
                : 'bg-surface-card hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-surface-border'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Capacity & Power Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_advisor')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
              activeTab === 'ai_advisor'
                ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 shadow-lg shadow-purple-500/25 ring-1 ring-purple-300'
                : 'bg-surface-card hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-surface-border'
            }`}
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>🤖 AI Infrastructure Copilot</span>
          </button>
        </div>

        {/* Tab 1: Real-Time Telemetry */}
        {activeTab === 'telemetry' && (
          hosts.length === 0 && !isLoading ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Monitored Nodes ({hosts.length})</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    {hosts.filter((h) => h.is_online).length} online
                  </span>
                </div>

                <div className="space-y-3">
                  {hosts.map((h) => (
                    <HostCard
                      key={h.id}
                      host={h}
                      isSelected={h.id === selectedHostId}
                      latestMetric={latestMetricsMap[h.id]}
                      onSelect={(selected) => setSelectedHostId(selected.id)}
                      onDelete={(hostId) => handleDeleteHost(hostId)}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-8 space-y-6">
                {selectedHost ? (
                  <MetricCharts
                    selectedHost={selectedHost}
                    metrics={metrics}
                    timeRange={timeRange}
                    onRangeChange={(r) => setTimeRange(r)}
                    isLoading={isLoading}
                  />
                ) : (
                  <div className="bg-surface-card border border-surface-border rounded-xl p-12 text-center text-slate-400 font-mono text-sm">
                    Select a node from the inventory to view real-time telemetry
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Tab 2: Capacity & Power Intelligence */}
        {activeTab === 'capacity' && (
          <CapacityView
            hosts={hosts}
            onOpenExport={() => setIsExportModalOpen(true)}
            onRefresh={handleManualRefresh}
          />
        )}

        {/* Tab 3: AI Infrastructure Copilot */}
        {activeTab === 'ai_advisor' && (
          <AiAdvisorWidget
            data={aiData}
            loading={isAiLoading}
            onRefresh={loadAiInsights}
          />
        )}
      </main>

      {/* Global Modals */}
      <AlertSettingsModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        overview={facility}
        hosts={hosts}
      />

      <footer className="border-t border-surface-border py-4 px-6 text-center text-xs font-mono text-slate-500">
        InfraPulse DCIM & Telemetry Platform • Built for Edge Data Centers & Server Rooms
      </footer>
    </div>
  );
};
