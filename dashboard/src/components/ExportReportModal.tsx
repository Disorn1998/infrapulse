import React from 'react';
import { X, FileSpreadsheet, Printer, Award, ShieldCheck, Zap } from 'lucide-react';
import { FacilityOverview, Host } from '../types/api';
import { getExportCsvUrl } from '../services/api';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview: FacilityOverview | null;
  hosts: Host[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  overview,
  hosts,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.open(getExportCsvUrl(), '_blank');
  };

  const isBoiCompliant = overview ? overview.current_pue <= 1.30 : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-2xl bg-surface-card border border-surface-border rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:text-black">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-slate-900/60 print:hidden">
          <div className="flex items-center gap-2 text-cyan-400">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white tracking-wide">
              DCIM Executive Audit & Energy Compliance Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6 print:space-y-4">
          {/* Executive Header & BOI Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse print:hidden" />
                <h1 className="text-xl font-bold font-mono text-white print:text-black">
                  {overview?.facility_name || 'Bangkok Edge DC - Zone A'}
                </h1>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
                Official DCIM Infrastructure Audit & BOI Energy Efficiency Certification
              </p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Report Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
              </p>
            </div>

            {/* BOI Badge */}
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-mono text-xs font-bold ${
                isBoiCompliant
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 print:bg-emerald-50 print:text-emerald-800'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-400 print:bg-amber-50 print:text-amber-800'
              }`}
            >
              <Award className="w-5 h-5" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 print:text-slate-600">
                  Thailand BOI Standard
                </span>
                <span>{isBoiCompliant ? 'BOI COMPLIANT (PUE <= 1.30)' : 'OPTIMIZATION REQUIRED'}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-900/50 print:bg-slate-50 p-3 rounded-xl border border-surface-border print:border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Dynamic PUE</span>
              <span className="text-lg font-bold text-cyan-400 print:text-cyan-700">
                {overview?.current_pue.toFixed(3) || '1.242'}
              </span>
            </div>

            <div className="bg-slate-900/50 print:bg-slate-50 p-3 rounded-xl border border-surface-border print:border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Total IT Power</span>
              <span className="text-lg font-bold text-white print:text-black">
                {overview?.total_it_power_watts.toFixed(1) || '0'} W
              </span>
            </div>

            <div className="bg-slate-900/50 print:bg-slate-50 p-3 rounded-xl border border-surface-border print:border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">Facility Load</span>
              <span className="text-lg font-bold text-emerald-400 print:text-emerald-700">
                {overview?.total_facility_power_watts.toFixed(1) || '250'} W
              </span>
            </div>

            <div className="bg-slate-900/50 print:bg-slate-50 p-3 rounded-xl border border-surface-border print:border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase block">N+1 Failover</span>
              <span className="text-lg font-bold text-purple-400 print:text-purple-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{overview?.redundancy.status || 'HEALTHY'}</span>
              </span>
            </div>
          </div>

          {/* Node Inventory Table */}
          <div>
            <h3 className="text-xs font-mono font-bold text-slate-300 print:text-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Registered Compute Nodes & Electrical Distribution
            </h3>
            <div className="overflow-x-auto border border-surface-border print:border-slate-200 rounded-xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-900 print:bg-slate-100 text-slate-400 print:text-slate-700 border-b border-surface-border print:border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-2.5">Hostname</th>
                    <th className="p-2.5">IP Address</th>
                    <th className="p-2.5">Rack Unit</th>
                    <th className="p-2.5">PDU Feed</th>
                    <th className="p-2.5 text-right">Power Draw</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border print:divide-slate-200 text-slate-300 print:text-slate-800">
                  {hosts.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-900/30">
                      <td className="p-2.5 font-bold text-white print:text-black">{h.hostname}</td>
                      <td className="p-2.5 text-slate-400">{h.ip_address || '-'}</td>
                      <td className="p-2.5">{h.power_config?.rack_name || 'Rack-01'} (U{h.power_config?.rack_unit_start || 1})</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 print:bg-slate-200 text-[10px] font-bold">
                          Feed {h.power_config?.pdu?.feed || 'A'}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-cyan-400 print:text-black">
                        {h.power_config?.idle_watts || 45} W
                      </td>
                    </tr>
                  ))}
                  {hosts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-500">
                        No hosts registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border bg-slate-900/60 print:hidden">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 transition-all shadow-lg shadow-emerald-500/10"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download CSV Raw Dataset</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Executive Summary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
