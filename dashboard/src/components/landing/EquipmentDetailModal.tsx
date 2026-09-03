import React, { useEffect } from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { X, ShieldAlert, CheckCircle2, Zap, Cpu, Sparkles, Eye } from 'lucide-react';

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!equipmentId) return null;

  const item = t.equipment.items[equipmentId];
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-fadeIn"
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

        {/* Real Photographic Hardware Image */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-xl bg-slate-950 group">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
              ✓ REAL HARDWARE PHOTOGRAPH
            </span>
            <span className="text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
              {item.standard}
            </span>
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
                className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between"
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
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
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
  );
};
