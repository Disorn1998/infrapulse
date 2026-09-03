import React, { useState } from 'react';
import { Terminal, Copy, Check, Sparkles, Cpu, Layers } from 'lucide-react';
import { triggerSimulateCluster } from '../services/api';
import { DataCenterIllustration } from './ui/DataCenterIllustration';

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
    <div className="border border-surface-border bg-surface-card/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 text-center max-w-3xl mx-auto my-8 shadow-2xl shadow-cyan-500/10 tech-border-glow relative overflow-hidden">
      {/* Subtle Data Center Room Grid Backdrop */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Isometric Mini Data Center Illustration */}
      <div className="relative z-10 flex justify-center mb-2">
        <DataCenterIllustration width={420} height={230} />
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold font-mono text-white tracking-tight flex items-center justify-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <span>No Monitored Nodes Connected</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed font-sans">
          ระบบพร้อมเชื่อมต่อกับฮาร์ดแวร์จริง ติดตั้ง Agent ในเซิร์ฟเวอร์หรือเครื่องของคุณด้วย <strong>1-Line Installer</strong> ด้านล่าง 
          หรือคลิกเปิดใช้งาน <strong>Instant Demo</strong> เพื่อจำลองคลัสเตอร์เซิร์ฟเวอร์แบบ Real-Time
        </p>
      </div>

      {/* Quick Option Tabs */}
      <div className="relative z-10 flex items-center justify-center gap-2 mt-7 border-b border-surface-border pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab('linux')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'linux'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>🐧</span>
          <span>Linux / Ubuntu</span>
        </button>

        <button
          onClick={() => setActiveTab('windows')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'windows'
              ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <span>🪟</span>
          <span>Windows (PowerShell)</span>
        </button>

        <button
          onClick={() => setActiveTab('demo')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'demo'
              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 shadow-md shadow-purple-500/30'
              : 'bg-slate-900 text-purple-300 hover:text-white border border-purple-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1-Click Instant Demo</span>
        </button>
      </div>

      {/* Tab 1: Linux 1-Liner */}
      {activeTab === 'linux' && (
        <div className="relative z-10 mt-5 text-left bg-background/90 border border-surface-border rounded-2xl p-4 font-mono text-xs space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Run in Terminal (Ubuntu / Debian / CentOS / RPi):</span>
            </span>
            <button
              onClick={() => handleCopy(linuxCommand)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl text-emerald-400 border border-slate-800 text-xs overflow-x-auto select-all shadow-inner font-mono">
            {linuxCommand}
          </div>
          <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 font-sans">
            <p className="text-cyan-400 font-bold mb-1 text-xs font-mono">💡 วิธีการเชื่อมต่อโหนด (Instructions):</p>
            <p>1. คัดลอกคำสั่งด้านบน แล้วเปิด SSH Terminal ในเซิร์ฟเวอร์ของคุณ</p>
            <p>2. วางคำสั่งแล้วกด Enter — สคริปต์จะติดตั้ง dependency อัตโนมัติ</p>
            <p>3. ระบบจะลงทะเบียน Systemd Background Service และเริ่มส่ง Telemetry กลับมาที่หน้าจอนี้ทุกๆ 15 วินาทีทันที 🚀</p>
          </div>
        </div>
      )}

      {/* Tab 2: Windows 1-Liner */}
      {activeTab === 'windows' && (
        <div className="relative z-10 mt-5 text-left bg-background/90 border border-surface-border rounded-2xl p-4 font-mono text-xs space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Terminal className="w-3.5 h-3.5" />
              <span>Run in PowerShell (Run as Administrator):</span>
            </span>
            <button
              onClick={() => handleCopy(windowsCommand)}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl text-cyan-400 border border-slate-800 text-xs overflow-x-auto select-all shadow-inner font-mono">
            {windowsCommand}
          </div>
          <div className="text-[11px] text-slate-300 space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 font-sans">
            <p className="text-cyan-400 font-bold mb-1 text-xs font-mono">💡 วิธีการเชื่อมต่อโหนด (Instructions):</p>
            <p>1. เปิด Windows PowerShell โดยคลิกขวาเลือก <strong>"Run as Administrator"</strong></p>
            <p>2. วางคำสั่งด้านบนแล้วกด Enter</p>
            <p>3. สคริปต์จะสร้าง Windows Task Scheduler ทำงานเบื้องหลังอัตโนมัติ ส่งข้อมูล Telemetry เข้า Dashboard ทันที 🚀</p>
          </div>
        </div>
      )}

      {/* Tab 3: Instant Demo */}
      {activeTab === 'demo' && (
        <div className="relative z-10 mt-5 bg-gradient-to-br from-purple-950/40 via-slate-900 to-cyan-950/30 border border-purple-500/30 rounded-2xl p-6 text-center space-y-4 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white font-mono">Experience Full Cluster Telemetry Instantly</h3>
          
          <div className="text-xs text-slate-300 max-w-md mx-auto space-y-2 font-sans">
            <p>กดปุ่มด้านล่างเพื่อ <strong>จำลองคลัสเตอร์เซิร์ฟเวอร์ Enterprise 5 เครื่อง</strong> พร้อมผังแร็คและค่าพลังงานเข้าสู่ระบบโดยอัตโนมัติ</p>
            <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-3 text-left text-xs font-mono">
              <p className="text-purple-300 font-semibold mb-1">✨ ฟีเจอร์ที่จะทำงานทันที:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400 text-[11px]">
                <li>ผังตู้แร็ค 42U แบบ Multi-Rack พร้อมข้อมูลสล็อต U</li>
                <li>การวิเคราะห์ N+1 Redundancy แยกไฟ Feed A / Feed B</li>
                <li>กราฟคาดการณ์ Capacity Runout Forecast (Linear Regression)</li>
                <li>ดัชนีวัดประสิทธิภาพพลังงาน Dynamic PUE Index</li>
              </ul>
            </div>
          </div>

          <button
            onClick={handleQuickDemo}
            disabled={isSimulating}
            className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-slate-950 font-mono font-bold text-xs sm:text-sm shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isSimulating ? <span className="animate-spin">🔄</span> : '🚀'}
            <span>{isSimulating ? 'Provisioning Enterprise Cluster...' : 'Launch Instant 5-Node Demo Cluster'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
