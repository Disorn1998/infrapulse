import React from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { Server, Gamepad2, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface ModeSelectCardsProps {
  t: LandingTranslation;
  onNavigateToMode?: (mode: 'live' | 'sandbox') => void;
}

export const ModeSelectCards: React.FC<ModeSelectCardsProps> = ({ t, onNavigateToMode }) => {
  const handleLiveClick = (e: React.MouseEvent) => {
    if (onNavigateToMode) {
      e.preventDefault();
      onNavigateToMode('live');
    }
  };

  const handleSimClick = (e: React.MouseEvent) => {
    if (onNavigateToMode) {
      e.preventDefault();
      onNavigateToMode('sandbox');
    }
  };

  return (
    <section id="modes" className="space-y-8 pt-10 pb-6">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          {t.modes.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          {t.modes.title}
        </h2>
        <p className="text-sm text-slate-400 font-sans">
          {t.modes.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* CARD 1: LIVE PRODUCTION */}
        <div className="relative group bg-gradient-to-b from-ip-elev/90 to-ip-bg/95 border-2 border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:shadow-emerald-500/10 transition-all hover:-translate-y-1 backdrop-blur-md">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <Server className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
                {t.modes.live.badge}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                <span>{t.modes.live.title}</span>
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {t.modes.live.desc}
              </p>
            </div>

            {/* Bullet list */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              {t.modes.live.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-sans text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-3">
            <a
              href="/dashboard?mode=live"
              onClick={handleLiveClick}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-mono text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span>{t.modes.live.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-400/90">
                <ShieldCheck className="w-3.5 h-3.5" /> Zero simulated mock data
              </span>
              <span>{t.modes.live.note}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: SIM LAB SANDBOX */}
        <div className="relative group bg-gradient-to-b from-ip-elev/90 to-ip-bg/95 border-2 border-cyan-500/30 hover:border-cyan-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl hover:shadow-cyan-500/10 transition-all hover:-translate-y-1 backdrop-blur-md">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/50">
                <Gamepad2 className="w-7 h-7 text-cyan-400" />
              </div>
              <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/50">
                {t.modes.sim.badge}
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
                <span>{t.modes.sim.title}</span>
              </h3>
              <p className="text-sm text-slate-300 font-sans leading-relaxed">
                {t.modes.sim.desc}
              </p>
            </div>

            {/* Bullet list */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              {t.modes.sim.bulletPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-sans text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-3">
            <a
              href="/dashboard?mode=sandbox"
              onClick={handleSimClick}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <span>{t.modes.sim.cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-cyan-400/90">
                <Sparkles className="w-3.5 h-3.5" /> Instant 1-Click interactive lab
              </span>
              <span>{t.modes.sim.note}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
