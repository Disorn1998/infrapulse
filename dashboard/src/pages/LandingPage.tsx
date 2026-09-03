import React from 'react';
import { useLandingLang } from '../hooks/useLandingLang';
import { LanguageToggle } from '../components/landing/LanguageToggle';
import { HeroDiagram } from '../components/landing/HeroDiagram';
import { BuildingBlocksGrid } from '../components/landing/BuildingBlocksGrid';
import { HowItWorksFlow } from '../components/landing/HowItWorksFlow';
import { KeyNumbersPanel } from '../components/landing/KeyNumbersPanel';
import { ModeSelectCards } from '../components/landing/ModeSelectCards';
import { Activity, ArrowRight, Zap, Server, ExternalLink } from 'lucide-react';

interface LandingPageProps {
  onNavigateToDashboard: (mode?: 'live' | 'sandbox') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToDashboard }) => {
  const { lang, setLang, t } = useLandingLang();

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-ip-bg text-slate-100 flex flex-col font-sans selection:bg-ip-cyan/30 selection:text-ip-cyan">
      {/* 1. TOP STICKY NOC HEADER */}
      <header className="sticky top-0 z-50 bg-ip-bg/90 backdrop-blur-xl border-b border-ip-line px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-ip-cyan" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {t.nav.brand}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 font-bold">
                {t.nav.primerBadge}
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-mono text-slate-300">
          <button
            onClick={() => handleScrollTo('pillars')}
            className="hover:text-ip-cyan transition-colors"
          >
            {t.nav.pillars}
          </button>
          <button
            onClick={() => handleScrollTo('flow')}
            className="hover:text-ip-cyan transition-colors"
          >
            {t.nav.howItWorks}
          </button>
          <button
            onClick={() => handleScrollTo('metrics')}
            className="hover:text-ip-cyan transition-colors"
          >
            {t.nav.keyMetrics}
          </button>
        </nav>

        {/* Right Controls: Language Switcher & Quick Launch */}
        <div className="flex items-center gap-3">
          <LanguageToggle currentLang={lang} onSelectLang={setLang} />

          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => onNavigateToDashboard('live')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 hover:bg-emerald-900/50 transition-all"
            >
              {t.nav.liveBtn}
            </button>
            <button
              onClick={() => onNavigateToDashboard('sandbox')}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 shadow-sm transition-all"
            >
              {t.nav.simBtn}
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        <section className="text-center space-y-6 pt-4 sm:pt-8 max-w-4xl mx-auto">
          {/* Kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold bg-ip-elev border border-ip-cyan/30 text-ip-cyan shadow-sm shadow-ip-cyan/10">
            <Zap className="w-3.5 h-3.5 text-ip-cyan animate-pulse" />
            <span>{t.hero.kicker}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
            <span>{t.hero.titleLine1} </span>
            <span className="bg-gradient-to-r from-ip-cyan via-emerald-400 to-ip-cyan bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{' '}
            <span>{t.hero.titleLine2}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-3xl mx-auto">
            {t.hero.subtitle}
          </p>

          {/* Engineering Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 font-mono text-xs text-slate-300">
            <span className="px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold">
              🏆 {t.hero.badgePUE}
            </span>
            <span className="px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold">
              ⚡ {t.hero.badgeRedundancy}
            </span>
            <span className="px-3 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 font-semibold">
              🛡️ {t.hero.badgeTier}
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateToDashboard('live')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-mono text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Server className="w-4 h-4" />
              <span>{t.hero.ctaLive}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateToDashboard('sandbox')}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-mono text-sm font-bold bg-ip-elev border border-ip-cyan/50 hover:bg-slate-800 text-ip-cyan shadow-lg shadow-ip-cyan/10 transition-all hover:scale-105"
            >
              <span>{t.hero.ctaSim}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Descriptions under buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left text-xs font-mono text-slate-400 pt-2">
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
              <span>{t.hero.ctaLiveSub}</span>
            </div>
            <div className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
              <span>{t.hero.ctaSimSub}</span>
            </div>
          </div>
        </section>

        {/* 3. 3D ISOMETRIC FACILITY DIAGRAM & REAL HARDWARE INSPECTOR */}
        <HeroDiagram lang={lang} t={t} />

        {/* 4. WHAT IS A DATA CENTER? (INTRO PROSE) */}
        <section className="bg-gradient-to-r from-ip-elev via-slate-900 to-ip-elev border border-ip-line rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              {t.dcimIntro.badge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              {t.dcimIntro.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
              {t.dcimIntro.desc1}
            </p>
            <p className="text-sm sm:text-base text-slate-400 font-sans leading-relaxed">
              {t.dcimIntro.desc2}
            </p>

            <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 my-4 bg-slate-950/60 rounded-r-xl font-mono text-xs sm:text-sm text-emerald-300">
              "{t.dcimIntro.highlightFact}"
              <span className="block text-[11px] text-slate-500 font-sans mt-1">
                — {t.dcimIntro.quoteAuthor}
              </span>
            </blockquote>
          </div>
        </section>

        {/* 5. 4 CORE PILLARS */}
        <BuildingBlocksGrid t={t} />

        {/* 6. LIFECYCLE OF A REQUEST */}
        <HowItWorksFlow t={t} />

        {/* 7. CRITICAL DC METRICS (PUE / N+1) */}
        <KeyNumbersPanel t={t} />

        {/* 8. MODE SELECTION CARDS */}
        <ModeSelectCards t={t} onNavigateToMode={onNavigateToDashboard} />
      </main>

      {/* 9. PROFESSIONAL FOOTER */}
      <footer className="bg-ip-elev border-t border-ip-line mt-16 px-4 sm:px-8 py-8 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-200 font-bold mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{t.footer.tagline}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {t.footer.standards}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-cyan-400 transition-colors"
            >
              ↑ {t.footer.backToTop}
            </button>
            <button
              onClick={() => onNavigateToDashboard()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
            >
              <span>{t.footer.openDashboard}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
