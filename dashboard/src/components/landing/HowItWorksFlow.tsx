import React from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { Globe, ShieldCheck, Cpu, Zap, Flame, Wind } from 'lucide-react';

export const HowItWorksFlow: React.FC<{ t: LandingTranslation }> = ({ t }) => {
  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Globe className="w-5 h-5 text-cyan-400" />;
      case 1:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 2:
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 3:
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 4:
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 5:
        return <Wind className="w-5 h-5 text-sky-400" />;
      default:
        return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section id="flow" className="space-y-6 pt-10">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-800/80 shadow-sm">
          {t.flow.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          {t.flow.title}
        </h2>
        <p className="text-sm text-slate-400 font-sans">
          {t.flow.subtitle}
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto mt-8">
        {/* Vertical connecting line */}
        <div className="absolute top-6 bottom-6 left-6 sm:left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-cyan-500 via-amber-500 to-sky-500 hidden sm:block opacity-40" />

        <div className="space-y-6">
          {t.flow.steps.map((step, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={step.step}
                className={`relative flex flex-col sm:flex-row items-center gap-6 ${
                  isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className="w-full sm:w-1/2">
                  <div className="bg-ip-elev/85 border border-ip-line hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all hover:shadow-cyan-500/5 group">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-ip-cyan border border-ip-cyan/30">
                        {step.tech}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        STEP {step.step}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-cyan-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-sans leading-relaxed mb-3">
                      {step.desc}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400">
                      <span>TELEMETRY METRIC:</span>
                      <span className="font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {step.latencyOrMetric}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Central Step Icon Circle */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-slate-900 border-2 border-ip-line shadow-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  {getStepIcon(idx)}
                </div>

                {/* Blank Space for alignment on opposite column */}
                <div className="hidden sm:block sm:w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
