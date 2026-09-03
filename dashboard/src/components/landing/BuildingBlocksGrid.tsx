import React from 'react';
import { LandingTranslation } from '../../i18n/landing';
import { Cpu, Zap, Wind, Network, CheckCircle2 } from 'lucide-react';

export const BuildingBlocksGrid: React.FC<{ t: LandingTranslation }> = ({ t }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'compute':
        return <Cpu className="w-6 h-6 text-cyan-400" />;
      case 'power':
        return <Zap className="w-6 h-6 text-amber-400" />;
      case 'cooling':
        return <Wind className="w-6 h-6 text-sky-400" />;
      case 'network':
        return <Network className="w-6 h-6 text-purple-400" />;
      default:
        return <Cpu className="w-6 h-6 text-cyan-400" />;
    }
  };

  const getBorderColor = (id: string) => {
    switch (id) {
      case 'compute':
        return 'hover:border-cyan-500/50 hover:shadow-cyan-500/10';
      case 'power':
        return 'hover:border-amber-500/50 hover:shadow-amber-500/10';
      case 'cooling':
        return 'hover:border-sky-500/50 hover:shadow-sky-500/10';
      case 'network':
        return 'hover:border-purple-500/50 hover:shadow-purple-500/10';
      default:
        return 'hover:border-cyan-500/50';
    }
  };

  return (
    <section id="pillars" className="space-y-6 pt-6">
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-sm">
          {t.blocks.badge}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          {t.blocks.title}
        </h2>
        <p className="text-sm text-slate-400 font-sans">
          {t.blocks.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {t.blocks.items.map((item) => (
          <div
            key={item.id}
            className={`bg-ip-elev/80 border border-ip-line rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1 shadow-lg backdrop-blur-sm ${getBorderColor(
              item.id
            )} flex flex-col justify-between`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center shadow-inner">
                  {getIcon(item.id)}
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-700">
                  {item.tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 font-sans leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {/* Spec points */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                {item.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role footer */}
            <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="text-[10px] uppercase font-bold text-cyan-400">ROLE:</span>
              <span className="text-slate-300">{item.role}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
