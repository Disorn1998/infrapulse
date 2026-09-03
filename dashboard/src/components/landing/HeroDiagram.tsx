import React, { useState } from 'react';

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

export const HeroDiagram: React.FC<{ lang: 'th' | 'en' }> = ({ lang }) => {
  const [activeSpot, setActiveSpot] = useState<ComponentHotspot | null>(null);

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-ip-elev-2/90 to-ip-bg/95 border border-ip-line shadow-2xl p-4 sm:p-6 overflow-hidden backdrop-blur-xl">
      {/* Background Tech Grid & Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-ip-cyan/10 rounded-full filter blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-ip-violet/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* SVG Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-ip-line/80 pb-4 mb-4 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-bold text-slate-200 tracking-wider">
            {lang === 'th' ? 'แบบจำลองสถาปัตยกรรม 3 มิติ (Isometric DC Room)' : '3D Isometric Data Center Architectural Model'}
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

      {/* Main Isometric SVG Graphic */}
      <div className="relative z-10 w-full aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center">
        <svg
          viewBox="0 0 880 500"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients */}
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
            <linearGradient id="coldAirFlow" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hotAirFlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Isometric Raised Floor Tile Grid */}
          <g opacity="0.45">
            {/* Perspective Isometric Floor Plate */}
            <polygon
              points="440,80 840,250 440,460 40,250"
              fill="url(#gridGlow)"
              stroke="#334155"
              strokeWidth="1.5"
            />
            {/* Grid Lines */}
            <path
              d="M140,205 L540,410 M240,165 L640,360 M340,120 L740,310 M740,205 L340,410 M640,165 L240,360 M540,120 L140,310"
              stroke="#1e293b"
              strokeWidth="1"
            />
          </g>

          {/* Underfloor Glowing Cable Trays (Power & Fiber) */}
          <g filter="url(#neonGlow)">
            {/* Feed A (Cyan) */}
            <path
              d="M160,330 L440,450 L720,330"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              fill="none"
              opacity="0.8"
            />
            {/* Feed B (Emerald) */}
            <path
              d="M180,320 L440,430 L700,320"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              fill="none"
              opacity="0.8"
            />
            {/* Optical Data Spine (Violet) */}
            <path
              d="M440,120 L440,460"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeDasharray="4,4"
              fill="none"
              opacity="0.6"
            />
          </g>

          {/* 1. RACK-A (42U Server Cabinet) */}
          <g id="rackA">
            {/* Side polygon */}
            <polygon points="180,240 250,200 250,370 180,410" fill="url(#rackSide)" stroke="#334155" strokeWidth="1" />
            {/* Top polygon */}
            <polygon points="180,240 250,200 320,240 250,280" fill="url(#rackTop)" stroke="#475569" strokeWidth="1" />
            {/* Front polygon */}
            <polygon points="250,280 320,240 320,410 250,450" fill="url(#rackFront)" stroke="#334155" strokeWidth="1" />

            {/* Server Blade Rows & Blinking LEDs */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const yOffset = 285 + i * 19;
              return (
                <g key={i}>
                  <line
                    x1="255"
                    y1={yOffset}
                    x2="315"
                    y2={yOffset - 34}
                    stroke="#1e293b"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <line
                    x1="256"
                    y1={yOffset}
                    x2="314"
                    y2={yOffset - 34}
                    stroke="#334155"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* NIC LED green/cyan */}
                  <circle cx="262" cy={yOffset - 4} r="2" fill="#10B981" className="animate-pulse" />
                  <circle cx="268" cy={yOffset - 7} r="2" fill="#06B6D4" />
                </g>
              );
            })}
            <text x="260" y="440" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">RACK-A</text>
          </g>

          {/* 2. IN-ROW PRECISION COOLING UNIT (Center) */}
          <g id="inRowCooling">
            {/* Side */}
            <polygon points="350,195 390,170 390,340 350,365" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1.5" />
            {/* Top */}
            <polygon points="350,195 390,170 430,195 390,220" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Front */}
            <polygon points="390,220 430,195 430,365 390,390" fill="url(#coolerGrad)" stroke="#0284c7" strokeWidth="1.5" />

            {/* Cooling Fan Grille & Circular Motion */}
            <ellipse cx="410" cy="275" rx="14" ry="24" fill="#082f49" stroke="#38bdf8" strokeWidth="1.5" />
            <ellipse cx="410" cy="275" rx="8" ry="14" fill="#0369a1" />
            <circle cx="410" cy="275" r="3" fill="#38bdf8" className="animate-ping" />

            {/* Cold Air Discharge Arrows (Front Cold Aisle) */}
            <path
              d="M405,300 Q360,325 320,310"
              stroke="#38bdf8"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="4,3"
              filter="url(#neonGlow)"
            />
            <path
              d="M415,300 Q460,325 500,310"
              stroke="#38bdf8"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="4,3"
              filter="url(#neonGlow)"
            />
            <text x="375" y="380" fill="#E0F2FE" fontSize="9" fontFamily="monospace" fontWeight="bold">IN-ROW COOLER</text>
          </g>

          {/* 3. RACK-B (42U Server Cabinet) */}
          <g id="rackB">
            {/* Side polygon */}
            <polygon points="460,240 530,200 530,370 460,410" fill="url(#rackSide)" stroke="#334155" strokeWidth="1" />
            {/* Top polygon */}
            <polygon points="460,240 530,200 600,240 530,280" fill="url(#rackTop)" stroke="#475569" strokeWidth="1" />
            {/* Front polygon */}
            <polygon points="530,280 600,240 600,410 530,450" fill="url(#rackFront)" stroke="#334155" strokeWidth="1" />

            {/* Server Blade Rows & Blinking LEDs */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const yOffset = 285 + i * 19;
              return (
                <g key={i}>
                  <line
                    x1="535"
                    y1={yOffset}
                    x2="595"
                    y2={yOffset - 34}
                    stroke="#1e293b"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <line
                    x1="536"
                    y1={yOffset}
                    x2="594"
                    y2={yOffset - 34}
                    stroke="#334155"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <circle cx="542" cy={yOffset - 4} r="2" fill="#06B6D4" className="animate-pulse" />
                  <circle cx="548" cy={yOffset - 7} r="2" fill="#10B981" />
                </g>
              );
            })}
            <text x="540" y="440" fill="#94A3B8" fontSize="10" fontFamily="monospace" fontWeight="bold">RACK-B</text>
          </g>

          {/* 4. MODULAR 2N UPS & BATTERY CABINET (Right) */}
          <g id="upsCabinet">
            <polygon points="650,220 710,185 710,340 650,375" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
            <polygon points="650,220 710,185 770,220 710,255" fill="#334155" stroke="#f59e0b" strokeWidth="1" />
            <polygon points="710,255 770,220 770,375 710,410" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />

            {/* Battery Level Indicators */}
            <rect x="725" y="270" width="30" height="8" rx="2" fill="#10b981" />
            <rect x="725" y="285" width="30" height="8" rx="2" fill="#10b981" />
            <rect x="725" y="300" width="30" height="8" rx="2" fill="#10b981" />
            <rect x="725" y="315" width="30" height="8" rx="2" fill="#f59e0b" />
            <text x="720" y="360" fill="#FBBF24" fontSize="10" fontFamily="monospace" fontWeight="bold">2N UPS</text>
          </g>

          {/* 5. HOT AISLE CONTAINMENT (Rear Heat Expulsion) */}
          <g opacity="0.6">
            <path
              d="M215,220 C215,140 280,120 370,110"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6,4"
              filter="url(#neonGlow)"
            />
            <path
              d="M495,220 C495,140 430,120 370,110"
              stroke="#ef4444"
              strokeWidth="3"
              fill="none"
              strokeDasharray="6,4"
              filter="url(#neonGlow)"
            />
            <circle cx="370" cy="110" r="4" fill="#ef4444" className="animate-ping" />
            <text x="330" y="95" fill="#FCA5A5" fontSize="10" fontFamily="monospace" fontWeight="bold">HOT AISLE (38°C)</text>
          </g>

          {/* Interactive Clickable Pins (Hotspots) */}
          {HOTSPOTS.map((spot) => {
            const isHovered = activeSpot?.id === spot.id;
            return (
              <g
                key={spot.id}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setActiveSpot(activeSpot?.id === spot.id ? null : spot)}
                onMouseEnter={() => setActiveSpot(spot)}
              >
                {/* Ping Ring */}
                <circle cx={spot.x} cy={spot.y} r="14" fill="none" stroke="#4DD8E6" strokeWidth="1" className="animate-ping" opacity="0.6" />
                {/* Center Core */}
                <circle
                  cx={spot.x}
                  cy={spot.y}
                  r={isHovered ? 8 : 6}
                  fill={isHovered ? '#4DD8E6' : '#0F172A'}
                  stroke="#4DD8E6"
                  strokeWidth="2.5"
                  className="transition-all"
                />
                <circle cx={spot.x} cy={spot.y} r="2.5" fill="#FFFFFF" />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Tooltip Card on Active Pin */}
      <div className="relative z-20 mt-3 pt-3 border-t border-ip-line/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        {activeSpot ? (
          <div className="flex items-center gap-3 bg-ip-elev p-2.5 px-4 rounded-xl border border-ip-cyan/40 shadow-lg shadow-ip-cyan/10">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${activeSpot.badgeColor}`}>
              PIN FOCUS
            </span>
            <div>
              <strong className="text-slate-200 block sm:inline mr-2">
                {lang === 'th' ? activeSpot.nameTh : activeSpot.nameEn}
              </strong>
              <span className="text-slate-400">
                {lang === 'th' ? activeSpot.descTh : activeSpot.descEn}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ip-cyan animate-pulse" />
            <span>
              {lang === 'th'
                ? 'แตะหรือวางเมาส์บนจุดกลมสีฟ้าในรูปภาพ 3D เพื่อดูการทำงานของอุปกรณ์แต่ละชิ้น'
                : 'Hover or tap the glowing pins in the 3D diagram to inspect individual facility subsystems.'}
            </span>
          </p>
        )}
        <span className="text-[11px] text-slate-500 font-mono">
          EIA-310-D Standard • In-Row Precision Cooling
        </span>
      </div>
    </div>
  );
};
