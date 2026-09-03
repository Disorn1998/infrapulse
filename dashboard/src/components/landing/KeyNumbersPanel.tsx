import React from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { Gauge, ShieldCheck, ThermometerSnowflake, Check } from 'lucide-react';

export const KeyNumbersPanel: React.FC<{ t: LandingTranslation }> = ({ t }) => {
  return (
    <section id="metrics" className="space-y-6 pt-10">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80 shadow-sm">
          {t.metrics.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          {t.metrics.title}
        </h2>
        <p className="text-sm text-slate-400 font-sans">
          {t.metrics.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {t.metrics.cards.map((card) => {
          return (
            <div
              key={card.id}
              className="bg-ip-elev/80 border border-ip-line rounded-2xl p-6 flex flex-col justify-between shadow-xl hover:border-ip-cyan/40 transition-all hover:-translate-y-1 backdrop-blur-sm"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                    {card.id === 'pue' && <Gauge className="w-5 h-5 text-ip-cyan" />}
                    {card.id === 'redundancy' && <ShieldCheck className="w-5 h-5 text-ip-green" />}
                    {card.id === 'thermal' && <ThermometerSnowflake className="w-5 h-5 text-ip-amber" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    SLA KPI
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                {/* Formula pill */}
                <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-[11px] font-mono text-cyan-300">
                  <span className="text-slate-500 block text-[10px]">FORMULA:</span>
                  <span className="font-semibold">{card.formula}</span>
                </div>

                {/* Benchmark */}
                <div className="text-xs font-mono text-slate-400 border-l-2 border-slate-700 pl-2.5">
                  <span className="text-slate-500 text-[10px] block">STANDARD BENCHMARK:</span>
                  <span className="text-slate-300">{card.benchmark}</span>
                </div>
              </div>

              {/* Live Highlight badge */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-bold">{card.highlight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
