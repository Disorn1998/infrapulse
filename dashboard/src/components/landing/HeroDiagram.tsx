import React, { useState } from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { ThreeHeroDiagram } from './ThreeHeroDiagram';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import {
  Layers,
  Sparkles,
  Box,
  Wind,
  Flame,
  Zap,
  ArrowRight,
  ShieldCheck,
  Monitor,
  Network,
  CheckCircle2,
} from 'lucide-react';

export const HeroDiagram: React.FC<{ lang: 'th' | 'en'; t: LandingTranslation }> = ({ lang, t }) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(() => {
    try {
      return new URLSearchParams(window.location.search).get('inspect');
    } catch {
      return null;
    }
  });
  const [viewMode, setViewMode] = useState<'3d' | '2d'>(() => {
    try {
      return new URLSearchParams(window.location.search).get('view') === '2d' ? '2d' : '3d';
    } catch {
      return '3d';
    }
  });

  const handleOpenInspector = (id: string) => {
    setSelectedEquipmentId(id);
  };

  const equip = t.equipment.items;

  const zoneColors: Record<string, { bg: string; text: string; border: string }> = {
    'server-rack': { bg: 'bg-blue-950/80', text: 'text-blue-400', border: 'border-blue-500/40' },
    'ups-battery': { bg: 'bg-emerald-950/80', text: 'text-emerald-400', border: 'border-emerald-500/40' },
    cooling: { bg: 'bg-sky-950/80', text: 'text-sky-400', border: 'border-sky-500/40' },
    containment: { bg: 'bg-orange-950/80', text: 'text-orange-400', border: 'border-orange-500/40' },
    'fire-suppression': { bg: 'bg-rose-950/80', text: 'text-rose-400', border: 'border-rose-500/40' },
    'dcim-noc': { bg: 'bg-purple-950/80', text: 'text-purple-400', border: 'border-purple-500/40' },
    'network-room': { bg: 'bg-amber-950/80', text: 'text-amber-400', border: 'border-amber-500/40' },
    'security-access': { bg: 'bg-slate-900/90', text: 'text-slate-300', border: 'border-slate-600/50' },
  };

  const getSystemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-sky-400" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Monitor':
        return <Monitor className="w-5 h-5 text-purple-400" />;
      case 'Network':
        return <Network className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top View Toggle Switch: 3D Full Room vs 2D Room Zoning Blueprint */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {lang === 'th' ? 'เลือกมุมมองสถาปัตยกรรมศูนย์ข้อมูล' : 'Data Center Architectural View'}
          </span>
          <span className="text-[11px] font-sans text-slate-400 hidden sm:inline">
            ({lang === 'th' ? 'โมเดล 3 มิติเต็มห้อง หรือ ผังโซนห้อง 2 มิติ' : 'Interactive 3D Room or 2D Zoning Blueprint'})
          </span>
        </div>

        <div className="flex items-center bg-slate-950/85 border border-slate-800 p-1 rounded-xl shadow-inner font-mono text-xs">
          <button
            onClick={() => setViewMode('3d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === '3d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>{lang === 'th' ? '🎮 3D แบบจำลองเต็มห้อง' : '🎮 3D Facility Room'}</span>
          </button>
          <button
            onClick={() => setViewMode('2d')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === '2d'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'th' ? '📐 2D ผังโซนห้อง & 8 อุปกรณ์' : '📐 2D Room Zoning'}</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW: 3D Facility Room OR 2D Architectural Blueprint */}
      {viewMode === '3d' ? (
        <ThreeHeroDiagram
          lang={lang}
          onSelectEquipment={handleOpenInspector}
          selectedEquipmentId={selectedEquipmentId}
          t={t}
        />
      ) : (
        /* CLEAN, ORDERLY, 8-ZONE 2D ARCHITECTURAL BLUEPRINT */
        <div className="space-y-6">
          {/* 1. ROOM ZONING TOP-DOWN BLUEPRINT (Matching reference poster top-right) */}
          <div className="rounded-3xl bg-slate-950/95 border border-ip-line shadow-2xl p-6 sm:p-8 space-y-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ip-line/80 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  {t.equipment.roomZoningTitle}
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {t.equipment.roomZoningSub}
                </p>
              </div>
              <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-1 rounded-lg">
                TIA-942 RATED-3 DATA CENTER
              </span>
            </div>

            {/* Interactive SVG Top-Down Room Zoning Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* SVG Floorplan (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3 shadow-inner flex items-center justify-center">
                <svg viewBox="0 0 600 480" className="w-full h-auto select-none font-mono">
                  {/* Background Floor */}
                  <rect x="20" y="20" width="560" height="440" rx="8" fill="#0b1120" stroke="#334155" strokeWidth="2" />

                  {/* 2: UPS & Battery Room (Green, Top-Left) */}
                  <g onClick={() => handleOpenInspector('ups-battery')} className="cursor-pointer group">
                    <rect x="30" y="30" width="130" height="180" rx="4" fill="#14532d" stroke="#22c55e" strokeWidth="2" opacity="0.85" />
                    <circle cx="95" cy="110" r="16" fill="#15803d" stroke="#86efac" strokeWidth="2" />
                    <text x="95" y="115" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">2</text>
                    <text x="95" y="145" fill="#bbf7d0" fontSize="10" textAnchor="middle">UPS & Battery</text>
                  </g>

                  {/* 6: Monitoring & DCIM (Purple, Bottom-Left) */}
                  <g onClick={() => handleOpenInspector('dcim-noc')} className="cursor-pointer group">
                    <rect x="30" y="230" width="130" height="170" rx="4" fill="#581c87" stroke="#a855f7" strokeWidth="2" opacity="0.85" />
                    <circle cx="95" cy="305" r="16" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="2" />
                    <text x="95" y="310" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">6</text>
                    <text x="95" y="340" fill="#e9d5ff" fontSize="10" textAnchor="middle">NOC & DCIM</text>
                  </g>

                  {/* 5: Fire Suppression System (Red, Top-Center) */}
                  <g onClick={() => handleOpenInspector('fire-suppression')} className="cursor-pointer group">
                    <rect x="180" y="30" width="240" height="45" rx="4" fill="#881337" stroke="#f43f5e" strokeWidth="2" opacity="0.9" />
                    <circle cx="300" cy="52" r="12" fill="#be123c" stroke="#fda4af" strokeWidth="1.5" />
                    <text x="300" y="56" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">5</text>
                    <text x="340" y="56" fill="#ffe4e6" fontSize="10">Fire Suppression (Novec 1230)</text>
                  </g>

                  {/* 1 & 4: Server Rack Area & Hot/Cold Aisle (Center) */}
                  <g onClick={() => handleOpenInspector('server-rack')} className="cursor-pointer group">
                    {/* Rack Row 1 */}
                    <rect x="200" y="95" width="45" height="230" rx="3" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                    {/* Rack Row 2 */}
                    <rect x="355" y="95" width="45" height="230" rx="3" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
                    {/* 4: Cold Aisle between Racks (Orange) */}
                    <rect x="255" y="95" width="90" height="230" rx="3" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" opacity="0.75" />
                    <circle cx="300" cy="180" r="16" fill="#1d4ed8" stroke="#93c5fd" strokeWidth="2" />
                    <text x="300" y="185" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">1</text>
                    <circle cx="300" cy="235" r="14" fill="#c2410c" stroke="#fed7aa" strokeWidth="2" />
                    <text x="300" y="240" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">4</text>
                    <text x="300" y="270" fill="#ffedd5" fontSize="10" textAnchor="middle">Cold / Hot Aisle</text>
                  </g>

                  {/* 3: Precision Air Conditioning (Light Blue, Top-Right) */}
                  <g onClick={() => handleOpenInspector('cooling')} className="cursor-pointer group">
                    <rect x="440" y="30" width="130" height="190" rx="4" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
                    <circle cx="505" cy="115" r="16" fill="#0284c7" stroke="#bae6fd" strokeWidth="2" />
                    <text x="505" y="120" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">3</text>
                    <text x="505" y="150" fill="#e0f2fe" fontSize="10" textAnchor="middle">Precision Cooling</text>
                  </g>

                  {/* 7: Network Room (Brown, Middle-Right) */}
                  <g onClick={() => handleOpenInspector('network-room')} className="cursor-pointer group">
                    <rect x="440" y="240" width="130" height="120" rx="4" fill="#78350f" stroke="#f59e0b" strokeWidth="2" opacity="0.85" />
                    <circle cx="505" cy="295" r="16" fill="#92400e" stroke="#fde68a" strokeWidth="2" />
                    <text x="505" y="300" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">7</text>
                    <text x="505" y="330" fill="#fef3c7" fontSize="10" textAnchor="middle">Network Room</text>
                  </g>

                  {/* 8: Access Control & Security ENTRANCE (Grey, Bottom-Center) */}
                  <g onClick={() => handleOpenInspector('security-access')} className="cursor-pointer group">
                    <rect x="220" y="350" width="160" height="90" rx="4" fill="#334155" stroke="#94a3b8" strokeWidth="2" opacity="0.9" />
                    <circle cx="300" cy="385" r="14" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
                    <text x="300" y="390" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">8</text>
                    <text x="300" y="420" fill="#f1f5f9" fontSize="11" fontWeight="bold" textAnchor="middle">ENTRANCE</text>
                  </g>
                </svg>
              </div>

              {/* Zoning Legend List (5 cols) */}
              <div className="lg:col-span-5 space-y-2">
                {[
                  { id: 'server-rack', num: 1, title: 'Server Rack Area', color: 'bg-blue-600 text-white' },
                  { id: 'ups-battery', num: 2, title: 'UPS & Battery Room', color: 'bg-emerald-600 text-white' },
                  { id: 'cooling', num: 3, title: 'Precision Air Conditioning', color: 'bg-sky-500 text-slate-950 font-bold' },
                  { id: 'containment', num: 4, title: 'Hot Aisle / Cold Aisle', color: 'bg-orange-600 text-white' },
                  { id: 'fire-suppression', num: 5, title: 'Fire Suppression System', color: 'bg-rose-600 text-white' },
                  { id: 'dcim-noc', num: 6, title: 'Monitoring & DCIM', color: 'bg-purple-600 text-white' },
                  { id: 'network-room', num: 7, title: 'Network Room', color: 'bg-amber-600 text-white' },
                  { id: 'security-access', num: 8, title: 'Access Control & Security', color: 'bg-slate-600 text-white' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenInspector(item.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold ${item.color}`}>
                        {item.num}
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. DETAIL ZONE: 8-CARD GRID WITH REAL HIGH-RES STUDIO PHOTOS */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                {t.equipment.detailZoneTitle}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {t.equipment.detailZoneSub}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.values(equip).map((item) => {
                const zColor = zoneColors[item.id] || { bg: 'bg-slate-900', text: 'text-cyan-400', border: 'border-slate-700' };
                return (
                  <div
                    key={item.id}
                    onClick={() => handleOpenInspector(item.id)}
                    className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10 p-4 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-[16/10] bg-slate-950 shadow-md">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className={`absolute top-2 left-2 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${zColor.bg} ${zColor.text} border ${zColor.border} shadow-md`}>
                          ZONE {item.number}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {item.model}
                        </p>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.role}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
                      <span>{lang === 'th' ? 'ดูภาพจริง & สเปก' : 'Inspect Specs'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. INFRASTRUCTURE SYSTEM: 6 CORE PILLARS & ORGANIZATIONAL VALUE */}
          <div className="rounded-3xl bg-slate-950/95 border border-ip-line shadow-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                {t.equipment.infraTitle}
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                {t.equipment.infraSub}
              </p>
            </div>

            {/* 6 Infrastructure Pillar Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {t.equipment.systems.map((sys) => (
                <div
                  key={sys.id}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between space-y-2"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800/80 flex items-center justify-center border border-slate-700 shadow-sm">
                    {getSystemIcon(sys.iconName)}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-200">{sys.title}</h5>
                    <p className="text-[10px] text-cyan-400 font-mono">{sys.subTitle}</p>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-snug">
                    {sys.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* 5 Organizational Value Checkmarks */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/30 border border-emerald-500/30 p-4 sm:p-5 space-y-3">
              <h4 className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {t.equipment.benefitsTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-200">
                {t.equipment.benefits.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real Hardware Photographic Inspector Drawer */}
      <EquipmentDetailModal
        equipmentId={selectedEquipmentId}
        onClose={() => setSelectedEquipmentId(null)}
        onFocusIn3d={(id) => {
          setSelectedEquipmentId(id);
          setViewMode('3d');
        }}
        t={t}
      />
    </div>
  );
};
