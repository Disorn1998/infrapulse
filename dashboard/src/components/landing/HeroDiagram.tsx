import React, { useState } from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { ThreeHeroDiagram } from './ThreeHeroDiagram';
import { EquipmentDetailModal } from './EquipmentDetailModal';
import { Layers, Sparkles, Box, Wind, Flame, Zap, ArrowRight } from 'lucide-react';

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

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Top View Toggle Switch: 3D WebGL vs 2D Architectural Schematic */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            {lang === 'th' ? 'เลือกมุมมองสถาปัตยกรรม' : 'Select Architectural View'}
          </span>
          <span className="text-[11px] font-sans text-slate-400 hidden sm:inline">
            ({lang === 'th' ? 'สลับดูโมเดล 3D หรือผังระบบ 2D อธิบายเข้าใจง่าย' : 'Toggle 3D interactive model or clean 2D schematic'})
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
            <span>{lang === 'th' ? '🎮 3D WebGL (หมุนรอบทิศ)' : '🎮 3D WebGL (Orbit)'}</span>
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
            <span>{lang === 'th' ? '📐 2D ผังอธิบายเข้าใจง่าย' : '📐 2D Clean Schematic'}</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW: 3D WebGL OR 2D Architectural Schematic */}
      {viewMode === '3d' ? (
        <ThreeHeroDiagram
          lang={lang}
          onSelectEquipment={handleOpenInspector}
          selectedEquipmentId={selectedEquipmentId}
          t={t}
        />
      ) : (
        /* CLEAN, ORDERLY, INTUITIVE 2D BLUEPRINT & EQUIPMENT CARDS */
        <div className="w-full rounded-3xl bg-gradient-to-b from-ip-elev-2/95 via-ip-bg/95 to-ip-elev/95 border border-ip-line shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
          {/* Header Description */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ip-line/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-base sm:text-lg font-extrabold text-slate-100">
                  {lang === 'th'
                    ? 'ผังจำลองโครงสร้างศูนย์ข้อมูลแบบ 2 มิติ (Data Center Pod Blueprint)'
                    : '2D Data Center Pod Architecture & Airflow Schematic'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-1">
                {lang === 'th'
                  ? 'อธิบายการทำงานร่วมกันระหว่าง เซิร์ฟเวอร์, แอร์ In-Row, ระบบไฟ 2N, และการกักลมร้อน/เย็น อย่างเป็นระเบียบ'
                  : 'Clear structural layout explaining Compute, In-Row Cooling, 2N Power paths, and Thermal Containment.'}
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800">
                Supply: 21.5°C
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800">
                Exhaust: 38.2°C
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                PUE: 1.205
              </span>
            </div>
          </div>

          {/* ZONE 1: COLD AISLE (ทางเดินลมเย็นด้านหน้า) */}
          <div className="rounded-2xl bg-sky-950/25 border border-sky-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-300 font-bold">
              <span className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" />
                {lang === 'th' ? 'โซนที่ 1: ทางเดินลมเย็น (COLD AISLE) — 21.5°C' : 'ZONE 1: COLD AISLE CONTAINMENT — 21.5°C'}
              </span>
              <span className="text-[11px] text-sky-400/80 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                {lang === 'th' ? 'เป่าลมเย็นเข้าหน้าตู้แร็ค' : 'Chilled Air Intake'}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              {lang === 'th'
                ? 'ทางเดินด้านหน้าตู้ถูกกักแยกด้วยประตูกระจกบานเลื่อนและเพดานใส แอร์ In-Row จะเป่าลมเย็น 21.5°C เพื่อให้เซิร์ฟเวอร์ดูดไประบายความร้อน'
                : 'Enclosed with sliding glass doors and translucent ceiling tiles. In-Row chiller supplies 21.5°C chilled air directly to server intake grilles.'}
            </p>
          </div>

          {/* ZONE 2: 4 CORE EQUIPMENT CARDS (เรียงตามลำดับจริงในตู้) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Rack A */}
            {equip['rack-a'] && (
              <div
                onClick={() => handleOpenInspector('rack-a')}
                className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/10 p-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2.5">
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-[16/10] bg-slate-950">
                    <img
                      src={equip['rack-a'].image}
                      alt={equip['rack-a'].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/40">
                      RACK 01
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {equip['rack-a'].name}
                    </h4>
                    <p className="text-[11px] font-mono text-cyan-400">
                      IT Load: <span className="font-bold text-slate-200">959.3 W (Feed A)</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {equip['rack-a'].role}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between text-xs font-mono text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'th' ? 'ดูภาพถ่ายจริง & สเปก' : 'Inspect Photo & Specs'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Card 2: In-Row Cooler */}
            {equip['cooling'] && (
              <div
                onClick={() => handleOpenInspector('cooling')}
                className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-sky-500/40 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/10 p-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2.5">
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-[16/10] bg-slate-950">
                    <img
                      src={equip['cooling'].image}
                      alt={equip['cooling'].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-sky-300 border border-sky-500/40">
                      COOLING
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-sky-300 transition-colors">
                      {equip['cooling'].name}
                    </h4>
                    <p className="text-[11px] font-mono text-sky-400">
                      ΔT: <span className="font-bold text-slate-200">16.7°C (21.5°C ⟷ 38.2°C)</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {equip['cooling'].role}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between text-xs font-mono text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'th' ? 'ดูภาพถ่ายจริง & สเปก' : 'Inspect Photo & Specs'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Card 3: Rack B */}
            {equip['rack-b'] && (
              <div
                onClick={() => handleOpenInspector('rack-b')}
                className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 p-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2.5">
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-[16/10] bg-slate-950">
                    <img
                      src={equip['rack-b'].image}
                      alt={equip['rack-b'].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/40">
                      RACK 02
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {equip['rack-b'].name}
                    </h4>
                    <p className="text-[11px] font-mono text-emerald-400">
                      IT Load: <span className="font-bold text-slate-200">822.6 W (Feed B)</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {equip['rack-b'].role}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'th' ? 'ดูภาพถ่ายจริง & สเปก' : 'Inspect Photo & Specs'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Card 4: 2N UPS */}
            {equip['ups'] && (
              <div
                onClick={() => handleOpenInspector('ups')}
                className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 p-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2.5">
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-[16/10] bg-slate-950">
                    <img
                      src={equip['ups'].image}
                      alt={equip['ups'].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-amber-300 border border-amber-500/40">
                      2N UPS
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                      {equip['ups'].name}
                    </h4>
                    <p className="text-[11px] font-mono text-amber-400">
                      Backup: <span className="font-bold text-slate-200">28 นาที (Zero Break)</span>
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {equip['ups'].role}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-800 mt-3 flex items-center justify-between text-xs font-mono text-amber-400 group-hover:translate-x-1 transition-transform">
                  <span>{lang === 'th' ? 'ดูภาพถ่ายจริง & สเปก' : 'Inspect Photo & Specs'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>

          {/* ZONE 3: HOT AISLE (ทางเดินลมร้อนด้านหลัง) */}
          <div className="rounded-2xl bg-rose-950/25 border border-rose-500/30 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-rose-300 font-bold">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                {lang === 'th' ? 'โซนที่ 3: ทางเดินลมร้อน (HOT AISLE) — 38.2°C' : 'ZONE 3: HOT AISLE CONTAINMENT — 38.2°C'}
              </span>
              <span className="text-[11px] text-rose-400/80 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                {lang === 'th' ? 'ดูดลมร้อนกลับเข้าแอร์' : 'Exhaust Recirculation'}
              </span>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              {lang === 'th'
                ? 'ลมร้อน 38°C ที่ระบายออกจากหลังตู้เซิร์ฟเวอร์จะถูกขังไว้ในช่องนี้ และถูกแอร์ In-Row ดึงกลับเข้าสู่คอยล์เย็นทันที ป้องกันไม่ให้ลมร้อนม้วนกลับไปปะปนกับลมเย็น'
                : 'Captures 38°C thermal exhaust exiting the rear of servers, immediately pulling it into In-Row chilled water coils without mixing into cold intake.'}
            </p>
          </div>

          {/* ZONE 4: 2N POWER REDUNDANCY EXPLANATION (ระบบไฟสำรองคู่) */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {lang === 'th' ? 'โซนที่ 4: การจ่ายไฟคู่ขนาน 2N Redundancy (Feed A + Feed B)' : 'ZONE 4: 2N DUAL-FEED POWER ARCHITECTURE'}
              </h4>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                TIA-942 TIER III
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Primary Feed A (3.2A / ~950W)
                </span>
                <p className="text-slate-300 text-[11px] font-sans">
                  {lang === 'th' ? 'จ่ายไฟให้ PSU ชุดที่ 1 ของเซิร์ฟเวอร์ทุกเครื่องผ่านราง Smart PDU A' : 'Powers PSU #1 of all servers through intelligent vertical PDU A.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Secondary Feed B (2.8A / ~820W)
                </span>
                <p className="text-slate-300 text-[11px] font-sans">
                  {lang === 'th' ? 'จ่ายไฟให้ PSU ชุดที่ 2 คู่ขนาน หาก Feed A ดับ Feed B จะรับโหลดเต็มทันทีใน 0 ms' : 'Powers PSU #2 in parallel. If Feed A fails, Feed B sustains 100% load with 0ms break.'}
                </p>
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
