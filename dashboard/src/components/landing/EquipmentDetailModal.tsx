import React, { useEffect, useState } from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { X, ShieldAlert, CheckCircle2, Zap, Cpu, Sparkles, Eye, Maximize2 } from 'lucide-react';

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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLightbox, setIsLightbox] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
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
      <div
        className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/75 backdrop-blur-md transition-all duration-300 animate-fadeIn"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-xl h-full bg-ip-elev border-l border-ip-line shadow-2xl flex flex-col justify-between overflow-y-auto z-10 p-6 sm:p-8 space-y-6 text-slate-100 font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="space-y-3 pb-4 border-b border-ip-line/80">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {item.category}
              </span>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                title={t.equipment.closeBtn}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                {item.name}
              </h2>
              <p className="text-xs font-mono text-cyan-400 mt-0.5">
                MODEL: <span className="text-slate-300 font-semibold">{item.model}</span>
              </p>
            </div>
          </div>

          {/* Real Photographic Hardware Image with Loading Skeleton & Fallback */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 group">
            {/* Loading Shimmer */}
            {!imageLoaded && !imageError && (
              <div className="w-full h-56 sm:h-64 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-500 text-xs font-mono gap-2">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin" />
                <span>LOADING HARDWARE PHOTOGRAPH...</span>
              </div>
            )}

            {/* Error Fallback */}
            {imageError ? (
              <div className="w-full h-56 sm:h-64 bg-slate-900/90 border border-amber-500/30 flex flex-col items-center justify-center p-6 text-center text-slate-300">
                <Cpu className="w-12 h-12 text-cyan-400 mb-2" />
                <span className="font-mono text-sm font-bold text-slate-100">{item.name}</span>
                <span className="text-xs font-mono text-slate-400 mt-1">{item.model}</span>
                <span className="text-[11px] font-mono text-emerald-400 mt-2 bg-slate-950 px-3 py-1 rounded border border-slate-800">
                  {item.standard}
                </span>
              </div>
            ) : (
              <img
                src={item.image}
                alt={item.name}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`w-full h-56 sm:h-64 object-cover transition-all duration-500 group-hover:scale-105 cursor-pointer ${
                  imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}
                onClick={() => setIsLightbox(true)}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80 pointer-events-none" />

            {/* Badges on Image */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/95 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ✓ REAL HARDWARE PHOTOGRAPH
              </span>
              <button
                onClick={() => setIsLightbox(true)}
                className="flex items-center gap-1 text-[10px] font-mono text-slate-300 bg-slate-900/90 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700 transition-all shadow-md"
                title="Enlarge photo"
              >
                <Maximize2 className="w-3 h-3 text-cyan-400" />
                <span className="hidden sm:inline">EXPAND</span>
              </button>
            </div>
          </div>

          {/* Live DCIM Telemetry Grid */}
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

          {/* Technical Specs List */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              {t.equipment.specsTitle}
            </h3>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono shadow-inner">
              {item.specs.map((spec, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0">
                  <span className="text-slate-400">{spec.label}:</span>
                  <span className="font-semibold text-slate-200">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role & Importance */}
          <div className="space-y-3 text-xs font-sans leading-relaxed text-slate-300">
            <div className="bg-ip-elev-2/80 p-4 rounded-xl border border-ip-line space-y-1">
              <h4 className="font-bold text-cyan-300 font-mono text-[11px] uppercase">
                {t.equipment.roleTitle}
              </h4>
              <p>{item.role}</p>
            </div>

            <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 space-y-1">
              <h4 className="font-bold text-emerald-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {t.equipment.importanceTitle}
              </h4>
              <p>{item.importance}</p>
            </div>

            {/* Failure Impact Analysis */}
            <div className="bg-rose-950/30 p-4 rounded-xl border border-rose-500/30 space-y-1">
              <h4 className="font-bold text-rose-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                {t.equipment.impactTitle}
              </h4>
              <p className="text-rose-200/90">{item.failureImpact}</p>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="pt-4 border-t border-ip-line flex items-center gap-3">
            {onFocusIn3d && (
              <button
                onClick={() => {
                  onFocusIn3d(item.id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
              >
                <Eye className="w-4 h-4" />
                <span>{t.equipment.viewIn3d}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-mono text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
            >
              {t.equipment.closeBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Photo Lightbox */}
      {isLightbox && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn backdrop-blur-xl"
          onClick={() => setIsLightbox(false)}
        >
          <div className="relative max-w-5xl w-full flex flex-col items-center space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-slate-200 font-mono text-xs border-b border-slate-800 pb-3">
              <span className="text-cyan-400 font-bold">{item.name} • {item.model}</span>
              <button
                onClick={() => setIsLightbox(false)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={item.image}
              alt={item.name}
              className="max-h-[75vh] w-auto rounded-2xl border border-slate-700 shadow-2xl object-contain"
            />
            <div className="text-xs font-mono text-slate-400 text-center">
              <span>{item.standard} • High Resolution Engineering Photography</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
