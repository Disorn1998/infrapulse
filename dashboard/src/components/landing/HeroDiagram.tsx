import React, { useState } from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { ThreeHeroDiagram } from './ThreeHeroDiagram';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import { Layers, Sparkles, Box } from 'lucide-react';

interface ComponentHotspot {
  id: string;
  nameTh: string;
  nameEn: string;
  descTh: string;
  descEn: string;
  x: number;
  y: number;
  badgeColor: string;
}

const HOTSPOTS: ComponentHotspot[] = [
  {
    id: 'rack-a',
    nameTh: 'ตู้แร็คเซิร์ฟเวอร์ 42U (Compute Rack A)',
    nameEn: '42U High-Density Compute Rack A',
    descTh: 'บรรจุเบลดเซิร์ฟเวอร์ 1U/2U พร้อมซีพียู GPU สำหรับ AI และสวิตช์ TOR',
    descEn: 'Houses 1U/2U compute nodes, AI GPU accelerators, and Top-of-Rack switches.',
    x: 230,
    y: 190,
    badgeColor: 'text-ip-cyan border-ip-cyan/40 bg-ip-cyan/10',
  },
  {
    id: 'cooling',
    nameTh: 'แอร์ควบคุมอุณหภูมิความแม่นยำสูง (In-Row Precision Cooling)',
    nameEn: 'In-Row Precision Cooling Unit',
    descTh: 'ดูดลมร้อน 38°C จาก Hot Aisle ผ่านคอยล์เย็น ส่งลมเย็น 21°C วนกลับสู่ตู้แร็ค',
    descEn: 'Captures 38°C server exhaust air and recirculates chilled 21°C air via EC fans.',
    x: 390,
    y: 160,
    badgeColor: 'text-sky-400 border-sky-400/40 bg-sky-400/10',
  },
  {
    id: 'rack-b',
    nameTh: 'ตู้แร็คเซิร์ฟเวอร์ 42U (Compute Rack B)',
    nameEn: '42U High-Density Compute Rack B',
    descTh: 'ตู้เซิร์ฟเวอร์แถวสอง เชื่อมต่อสายไฟ Feed A และ Feed B แบบคู่ขนาน',
    descEn: 'Second 42U row interconnected with redundant Feed A & Feed B power cords.',
    x: 550,
    y: 190,
    badgeColor: 'text-ip-cyan border-ip-cyan/40 bg-ip-cyan/10',
  },
  {
    id: 'ups',
    nameTh: 'ระบบสำรองไฟ 2N (Modular UPS & Battery)',
    nameEn: '2N Modular Online UPS & Battery Bank',
    descTh: 'สำรองไฟฟ้าฉุกเฉินระดับมิลลิวินาที เลี้ยงระบบเมื่อการไฟฟ้าหลักขัดข้อง',
    descEn: 'Zero-transfer-time double-conversion UPS battery bank sustaining continuous power.',
    x: 690,
    y: 280,
    badgeColor: 'text-ip-amber border-ip-amber/40 bg-ip-amber/10',
  },
  {
    id: 'pdu',
    nameTh: 'รางจ่ายไฟคู่ (Dual-Feed Rack PDUs)',
    nameEn: 'Dual-Feed Intelligent PDUs (Feed A + B)',
    descTh: 'มิเตอร์วัดกระแสไฟแอมแปร์แยกสาย A/B พร้อมระบบความปลอดภัย NEC 80%',
    descEn: 'Monitors real-time Amps across Feed A & B with NEC 80% continuous safety limit.',
    x: 120,
    y: 310,
    badgeColor: 'text-ip-green border-ip-green/40 bg-ip-green/10',
  },
];

export const HeroDiagram: React.FC<{ lang: 'th' | 'en'; t: LandingTranslation }> = ({ lang, t }) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(() => {
    try {
      return new URLSearchParams(window.location.search).get('inspect');
    } catch {
      return null;
    }
  });
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const handleOpenInspector = (id: string) => {
    setSelectedEquipmentId(id);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top View Toggle Switch: 3D WebGL vs 2D Schematic */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {lang === 'th' ? 'โหมดมุมมองสถาปัตยกรรม' : 'Architectural View Mode'}
          </span>
        </div>

        <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl shadow-inner font-mono text-xs">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'th' ? '3D WebGL หมุนรอบทิศ' : '3D WebGL (Orbit)'}</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'th' ? '2D Schematic' : '2D Schematic'}</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW: 3D WebGL OR 2D Isometric */}
      {viewMode === '3d' ? (
        <ThreeHeroDiagram
          lang={lang}
          onSelectEquipment={handleOpenInspector}
          selectedEquipmentId={selectedEquipmentId}
          t={t}
        />
      ) : (
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-ip-elev-2/90 to-ip-bg/95 border border-ip-line shadow-2xl p-4 sm:p-6 overflow-hidden backdrop-blur-xl">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

          {/* SVG Header Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-ip-line/80 pb-4 mb-4 font-mono text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-slate-200 tracking-wider">
                {lang === 'th' ? 'แบบจำลอง Isometric 2D Schematic' : '2D Isometric Schematic Blueprint'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> Feed A (3.2A)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Feed B (2.8A)
              </span>
              <span className="flex items-center gap-1.5 text-sky-300">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Supply: 21.5°C
              </span>
            </div>
          </div>

          {/* Main SVG Graphic */}
          <div className="relative z-10 w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
            <svg
              viewBox="0 0 880 500"
              className="w-full h-full select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#263140" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0A0E14" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="rackFront" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#0F172A" />
                </linearGradient>
                <linearGradient id="rackSide" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#131D35" />
                  <stop offset="100%" stopColor="#0B1120" />
                </linearGradient>
                <linearGradient id="rackTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="coolerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#0369A1" />
                </linearGradient>
              </defs>

              {/* Floor Plate */}
              <polygon points="440,80 840,250 440,460 40,250" fill="url(#gridGlow)" stroke="#334155" strokeWidth="1.5" opacity="0.5" />
              {/* Floor Cable Lines */}
              <path d="M160,330 L440,450 L720,330" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6,4" fill="none" opacity="0.8" />
              <path d="M180,320 L440,430 L700,320" stroke="#10b981" strokeWidth="2.5" strokeDasharray="6,4" fill="none" opacity="0.8" />

              {/* RACK A */}
              <g id="rackA" className="cursor-pointer" onClick={() => handleOpenInspector('rack-a')}>
                <polygon points="180,240 250,200 250,370 180,410" fill="url(#rackSide)" stroke="#334155" strokeWidth="1" />
                <polygon points="180,240 250,200 320,240 250,280" fill="url(#rackTop)" stroke="#475569" strokeWidth="1" />
                <polygon points="250,280 320,240 320,410 250,450" fill="url(#rackFront)" stroke="#334155" strokeWidth="1" />
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const yOffset = 285 + i * 19;
                  return (
                    <g key={i}>
                      <line x1="255" y1={yOffset} x2="315" y2={yOffset - 34} stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                      <circle cx="262" cy={yOffset - 4} r="2" fill="#10B981" className="animate-pulse" />
                    </g>
                  );
                })}
                <text x="260" y="440" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">RACK-A</text>
              </g>

              {/* IN-ROW COOLER */}
              <g id="cooler" className="cursor-pointer" onClick={() => handleOpenInspector('cooling')}>
                <polygon points="350,195 390,170 390,340 350,365" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1.5" />
                <polygon points="350,195 390,170 430,195 390,220" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
                <polygon points="390,220 430,195 430,365 390,390" fill="url(#coolerGrad)" stroke="#0284c7" strokeWidth="1.5" />
                <ellipse cx="410" cy="275" rx="14" ry="24" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
                <circle cx="410" cy="275" r="3" fill="#38bdf8" className="animate-ping" />
                <text x="375" y="380" fill="#E0F2FE" fontSize="9" fontFamily="monospace" fontWeight="bold">IN-ROW COOLER</text>
              </g>

              {/* RACK B */}
              <g id="rackB" className="cursor-pointer" onClick={() => handleOpenInspector('rack-b')}>
                <polygon points="460,240 530,200 530,370 460,410" fill="url(#rackSide)" stroke="#334155" strokeWidth="1" />
                <polygon points="460,240 530,200 600,240 530,280" fill="url(#rackTop)" stroke="#475569" strokeWidth="1" />
                <polygon points="530,280 600,240 600,410 530,450" fill="url(#rackFront)" stroke="#334155" strokeWidth="1" />
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const yOffset = 285 + i * 19;
                  return (
                    <g key={i}>
                      <line x1="535" y1={yOffset} x2="595" y2={yOffset - 34} stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                      <circle cx="542" cy={yOffset - 4} r="2" fill="#06B6D4" className="animate-pulse" />
                    </g>
                  );
                })}
                <text x="540" y="440" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">RACK-B</text>
              </g>

              {/* 2N UPS */}
              <g id="ups" className="cursor-pointer" onClick={() => handleOpenInspector('ups')}>
                <polygon points="650,220 710,185 710,340 650,375" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
                <polygon points="650,220 710,185 770,220 710,255" fill="#334155" stroke="#f59e0b" strokeWidth="1" />
                <polygon points="710,255 770,220 770,375 710,410" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                <rect x="725" y="270" width="30" height="8" rx="2" fill="#10b981" />
                <rect x="725" y="285" width="30" height="8" rx="2" fill="#10b981" />
                <text x="720" y="360" fill="#FBBF24" fontSize="10" fontFamily="monospace" fontWeight="bold">2N UPS</text>
              </g>

              {/* Clickable Pins */}
              {HOTSPOTS.map((spot) => (
                <g
                  key={spot.id}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => handleOpenInspector(spot.id)}
                >
                  <circle cx={spot.x} cy={spot.y} r="14" fill="none" stroke="#4DD8E6" strokeWidth="1" className="animate-ping" opacity="0.6" />
                  <circle cx={spot.x} cy={spot.y} r="7" fill="#0F172A" stroke="#4DD8E6" strokeWidth="2.5" />
                  <circle cx={spot.x} cy={spot.y} r="2.5" fill="#FFFFFF" />
                </g>
              ))}
            </svg>
          </div>

          <div className="relative z-20 mt-3 pt-3 border-t border-ip-line/60 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{t.equipment.inspectHint}</span>
            <span className="text-cyan-400">Click any pin to inspect real equipment photograph</span>
          </div>
        </div>
      )}

      {/* Real Hardware Photographic Inspector Drawer */}
      <EquipmentDetailModal
        equipmentId={selectedEquipmentId}
        onClose={() => setSelectedEquipmentId(null)}
        onFocusIn3d={(id) => setSelectedEquipmentId(id)}
        t={t}
      />
    </div>
  );
};
