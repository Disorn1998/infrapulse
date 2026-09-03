import { useState, useEffect } from 'react';
import { landingTranslations, LandingTranslation } from '../i18n/landing';

export type Lang = 'th' | 'en';

const STORAGE_KEY = 'infrapulse_lang';

export function useLandingLang(): {
  lang: Lang;
  setLang: (newLang: Lang) => void;
  toggleLang: () => void;
  t: LandingTranslation;
} {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'th' || saved === 'en') {
        return saved;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'th';
  });

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'th' ? 'en' : 'th');
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return {
    lang,
    setLang,
    toggleLang,
    t: landingTranslations[lang],
  };
}
