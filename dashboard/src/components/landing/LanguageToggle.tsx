import React from 'react';
import { Lang } from '../../hooks/useLandingLang';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLang: Lang;
  onSelectLang: (lang: Lang) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onSelectLang }) => {
  return (
    <div
      role="group"
      aria-label="Language Selector"
      className="inline-flex items-center bg-ip-elev/90 border border-ip-line rounded-xl p-1 shadow-inner font-mono text-xs backdrop-blur-md"
    >
      <div className="flex items-center px-2 text-slate-400 gap-1.5 border-r border-slate-700/60 mr-1 py-0.5">
        <Globe className="w-3.5 h-3.5 text-ip-cyan" />
        <span className="text-[11px] hidden sm:inline uppercase tracking-wider font-semibold text-slate-400">LANG</span>
      </div>
      <button
        type="button"
        onClick={() => onSelectLang('th')}
        aria-pressed={currentLang === 'th'}
        className={`px-3 py-1.5 rounded-lg font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ip-cyan ${
          currentLang === 'th'
            ? 'bg-ip-cyan/20 text-ip-cyan border border-ip-cyan/40 shadow-sm shadow-ip-cyan/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
      >
        ไทย (TH)
      </button>
      <button
        type="button"
        onClick={() => onSelectLang('en')}
        aria-pressed={currentLang === 'en'}
        className={`px-3 py-1.5 rounded-lg font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ip-cyan ${
          currentLang === 'en'
            ? 'bg-ip-cyan/20 text-ip-cyan border border-ip-cyan/40 shadow-sm shadow-ip-cyan/20'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
      >
        EN
      </button>
    </div>
  );
};
