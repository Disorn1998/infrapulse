import React, { useState, useEffect } from 'react';
import { X, Bell, Save, CheckCircle2, AlertTriangle, Thermometer, Cpu, HardDrive, Database, Mail } from 'lucide-react';
import { AlertSettingsSummary } from '../types/api';
import { fetchAlertRulesSummary, updateAlertRulesSummary } from '../services/api';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AlertSettingsSummary>({
    cpu_threshold: 85,
    ram_threshold: 90,
    disk_threshold: 90,
    temp_threshold: 75,
    recipient_email: 'disorn.jp@gmail.com',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setErrorMsg(null);
      setSavedSuccess(false);
      fetchAlertRulesSummary()
        .then((data) => setSettings(data))
        .catch((err) => console.error('Failed to load alert rules:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      await updateAlertRulesSummary(settings);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save alert settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-card border border-surface-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-slate-900/60">
          <div className="flex items-center gap-2 text-cyan-400">
            <Bell className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-base font-bold font-mono text-white tracking-wide">
              Threshold Alert Rules & Notification Hub
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2 p-3 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Alert rules and email updated successfully!</span>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Loading current threshold configurations...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Recipient Email */}
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-2 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  Primary Notification Email (Gmail SMTP)
                </label>
                <input
                  type="email"
                  required
                  value={settings.recipient_email}
                  onChange={(e) => setSettings({ ...settings, recipient_email: e.target.value })}
                  placeholder="admin@yourcompany.com"
                  className="w-full px-3.5 py-2.5 bg-background border border-surface-border rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* CPU Slider */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-surface-border">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    CPU Breach Threshold:
                  </span>
                  <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    &ge; {settings.cpu_threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  step="1"
                  value={settings.cpu_threshold}
                  onChange={(e) => setSettings({ ...settings, cpu_threshold: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* RAM Slider */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-surface-border">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Database className="w-3.5 h-3.5 text-purple-400" />
                    RAM Memory Threshold:
                  </span>
                  <span className="font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                    &ge; {settings.ram_threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="98"
                  step="1"
                  value={settings.ram_threshold}
                  onChange={(e) => setSettings({ ...settings, ram_threshold: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                />
              </div>

              {/* Disk Slider */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-surface-border">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                    Storage Disk Threshold:
                  </span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    &ge; {settings.disk_threshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="98"
                  step="1"
                  value={settings.disk_threshold}
                  onChange={(e) => setSettings({ ...settings, disk_threshold: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>

              {/* Thermal Temperature Slider */}
              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-surface-border">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    Thermal Hotspot Threshold:
                  </span>
                  <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    &ge; {settings.temp_threshold}&deg;C
                  </span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="95"
                  step="1"
                  value={settings.temp_threshold}
                  onChange={(e) => setSettings({ ...settings, temp_threshold: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
