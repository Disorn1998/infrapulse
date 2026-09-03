import React, { useEffect, useState } from 'react';
import { LandingTranslation } from '../../i18n/landing';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Cpu,
  Sparkles,
  Eye,
  Maximize2,
  Info,
} from 'lucide-react';

interface EquipmentDetailModalProps {
  equipmentId: string | null;
  onClose: () => void;
  onFocusIn3d?: (id: string) => void;
  t: LandingTranslation;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipmentId,
  onClose,
  onFocusIn3d,
  t,
}) => {
  const [isLightbox, setIsLightbox] = useState(false);

  useEffect(() => {
    setIsLightbox(false);
  }, [equipmentId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isLightbox) {
          setIsLightbox(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isLightbox]);

  if (!equipmentId) return null;

  const item = t.equipment.items[equipmentId];
  if (!item) return null;

  return (
    <>
      {/* Centered Modal Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-slate-950/85 backdrop-blur-xl transition-all duration-300 animate-fadeIn"
        onClick={onClose}
      >
        {/* Main Dialog Container (Centered, Wide, Symmetrical) */}
        <div
          className="relative w-full max-w-5xl max-h-[92vh] bg-ip-elev border border-ip-line rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans animate-scaleUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ip-line/80 bg-slate-950/60 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl font-mono text-sm font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {item.number}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.standard}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 tracking-tight">
                  {item.name}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              title={t.equipment.closeBtn}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content: 2-Column Symmetrical Grid */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column (5 Cols): Real Hardware Photographic Showcase & Telemetry */}
            <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
              {/* Real Photographic Image Showcase */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-950 group h-64 sm:h-80 lg:h-[340px]">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                  onClick={() => setIsLightbox(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 pointer-events-none" />

                {/* Floating Badges on Photo */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                  <span className="px-3 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-900/95 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-lg flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    ✓ REAL HARDWARE PHOTOGRAPH
                  </span>
                  <button
                    onClick={() => setIsLightbox(true)}
                    className="flex items-center gap-1.5 text-xs font-mono text-cyan-300 bg-slate-900/95 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-cyan-500/40 transition-all shadow-lg font-bold"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>EXPAND</span>
                  </button>
                </div>
              </div>

              {/* Live Real-Time Telemetry Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {t.equipment.telemetryTitle}
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {item.telemetry.map((tele, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between shadow-inner"
                    >
                      <span className="text-[11px] font-mono text-slate-400">{tele.label}</span>
                      <span className={`text-base font-mono font-extrabold mt-1 ${tele.color}`}>
                        {tele.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Model & Compliance Notice */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs font-mono text-slate-400">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>
                  HARDWARE MODEL: <strong className="text-slate-200">{item.model}</strong>
                </span>
              </div>
            </div>

            {/* Right Column (6 Cols): Specifications & Detailed Analysis */}
            <div className="lg:col-span-6 space-y-4">
              {/* Technical Specifications Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  {t.equipment.specsTitle}
                </h3>
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono shadow-inner">
                  {item.specs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 border-b border-slate-800/80 last:border-0"
                    >
                      <span className="text-slate-400">{spec.label}:</span>
                      <span className="font-bold text-slate-200 text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Detailed Educational Explanations */}
              <div className="space-y-3 text-xs font-sans leading-relaxed text-slate-300">
                {/* 1. Data Center Role */}
                <div className="bg-ip-elev-2/90 p-4 rounded-xl border border-ip-line space-y-1.5 shadow-sm">
                  <h4 className="font-bold text-cyan-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    {t.equipment.roleTitle}
                  </h4>
                  <p>{item.role}</p>
                </div>

                {/* 2. Why is this component vital */}
                <div className="bg-emerald-950/35 p-4 rounded-xl border border-emerald-500/30 space-y-1.5 shadow-sm">
                  <h4 className="font-bold text-emerald-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {t.equipment.importanceTitle}
                  </h4>
                  <p>{item.importance}</p>
                </div>

                {/* 3. Failure Impact Analysis */}
                <div className="bg-rose-950/35 p-4 rounded-xl border border-rose-500/30 space-y-1.5 shadow-sm">
                  <h4 className="font-bold text-rose-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    {t.equipment.impactTitle}
                  </h4>
                  <p className="text-rose-200/95">{item.failureImpact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 border-t border-ip-line/80 bg-slate-950/60 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400">
                ZONE {item.number} • {item.category}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {onFocusIn3d && (
                <button
                  onClick={() => {
                    onFocusIn3d(item.id);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t.equipment.viewIn3d}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
              >
                {t.equipment.closeBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Photo Lightbox */}
      {isLightbox && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn backdrop-blur-2xl"
          onClick={() => setIsLightbox(false)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between text-slate-200 font-mono text-xs border-b border-slate-800 pb-3">
              <span className="text-cyan-400 font-bold text-sm">
                ZONE {item.number}: {item.name} • {item.model}
              </span>
              <button
                onClick={() => setIsLightbox(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={item.image}
              alt={item.name}
              loading="eager"
              className="max-h-[75vh] w-auto rounded-2xl border border-slate-700 shadow-2xl object-contain"
            />
            <div className="text-xs font-mono text-slate-400 text-center">
              <span>{item.standard} • High-Resolution Enterprise Hardware Studio Photography</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
