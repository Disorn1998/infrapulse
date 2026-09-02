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
      <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-lg mx-auto leading-relaxed">
        ระบบยังไม่มีข้อมูลเซิร์ฟเวอร์เชื่อมต่อเข้ามาในขณะนี้ <br />
        กรุณาติดตั้ง Agent ลงในเครื่องของคุณด้วยคำสั่ง 1-line installer ด้านล่าง <br/> 
        หรือกดปุ่มจำลองข้อมูล (Instant Demo) เพื่อทดสอบการทำงานของระบบ
      </p>

      {/* Tabs */}
      <div className="flex items-center justify-center gap-2 mt-6 border-b border-surface-border pb-3 flex-wrap">
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
        <div className="mt-5 text-left bg-background border border-surface-border rounded-xl p-4 font-mono text-xs space-y-3 shadow-inner">
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
          <div className="text-[11px] text-slate-400 space-y-1.5 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <p className="text-cyan-400 font-bold mb-2 text-xs">💡 วิธีการใช้งาน (How to use):</p>
            <p>1. เปิดหน้าจอ Terminal (SSH) ในเซิร์ฟเวอร์ Linux ของคุณ</p>
            <p>2. คัดลอกคำสั่งด้านบนไปวางแล้วกด Enter</p>
            <p>3. ระบบจะทำการติดตั้งแพ็กเกจที่จำเป็น, โหลดสคริปต์ Agent, ลงทะเบียน Systemd Service ให้ทำงานเบื้องหลัง และเริ่มส่งข้อมูล Telemetry กลับมาที่ Dashboard ตลอด 24 ชม. ทันที 🚀</p>
          </div>
        </div>
      )}

      {/* Tab 2: Windows 1-Liner */}
      {activeTab === 'windows' && (
        <div className="mt-5 text-left bg-background border border-surface-border rounded-xl p-4 font-mono text-xs space-y-3 shadow-inner">
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
          <div className="text-[11px] text-slate-400 space-y-1.5 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <p className="text-cyan-400 font-bold mb-2 text-xs">💡 วิธีการใช้งาน (How to use):</p>
            <p>1. กดปุ่ม Start พิมพ์ <code>PowerShell</code> แล้วคลิกขวาเลือก <strong>"Run as Administrator"</strong> (สิทธิ์ผู้ดูแลระบบ)</p>
            <p>2. คัดลอกคำสั่งด้านบนไปวางแล้วกด Enter</p>
            <p>3. ระบบจะดาวน์โหลด Agent, สร้าง Windows Task Scheduler เพื่อซ่อนหน้าต่างทำงานเบื้องหลังอัตโนมัติทุกครั้งที่เปิดเครื่อง และเริ่มส่งข้อมูลเข้า Dashboard ทันที 🚀</p>
          </div>
        </div>
      )}

      {/* Tab 3: Instant Demo */}
      {activeTab === 'demo' && (
        <div className="mt-5 bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-500/30 rounded-xl p-6 text-center space-y-4 shadow-inner">
          <Sparkles className="w-10 h-10 text-purple-400 mx-auto" />
          <h3 className="text-base font-bold text-white font-mono">Experience Full Cluster Telemetry Instantly</h3>
          
          <div className="text-[11px] sm:text-xs text-slate-300 max-w-md mx-auto space-y-2">
            <p>กดปุ่มด้านล่างเพื่อ <strong>จำลองข้อมูลเซิร์ฟเวอร์ Enterprise ระดับ Data Center จำนวน 5 เครื่อง</strong> เข้าสู่ระบบโดยอัตโนมัติ</p>
            <div className="bg-purple-950/30 border border-purple-500/20 rounded p-2 text-left">
              <p className="text-purple-300 font-semibold mb-1">✨ สิ่งที่จะได้เห็นหลังจากการจำลอง:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-400">
                <li>การแสดงผลผังตู้แร็ค 42U แบบ Multi-Rack </li>
                <li>การคำนวณ N+1 Redundancy แยกไฟ Feed A / Feed B</li>
                <li>ระบบทำนาย Capacity Forecast แบบ Linear Regression</li>
                <li>การกินไฟ (Dynamic PUE) จำลองอิงตามโหลด CPU</li>
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
