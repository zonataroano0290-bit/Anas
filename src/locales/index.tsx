import React, { createContext, useContext, useState, useEffect } from 'react';
import { ckb } from './ckb.ts';
import { ar } from './ar.ts';
import { en, Translations } from './en.ts';
import type { Language, Direction } from '../types/index.ts';

interface LocalizationContextType {
  language: Language;
  direction: Direction;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const translations: Record<Language, Translations> = {
  ckb,
  ar,
  en,
};

const LocalizationContext = createContext<LocalizationContextType>({
  language: 'ckb',
  direction: 'rtl',
  t: ckb,
  setLanguage: () => {},
});

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Kurdish Sorani is the default language per prompt requirements
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mikmik_lang') as Language;
    return saved === 'ar' || saved === 'en' || saved === 'ckb' ? saved : 'ckb';
  });

  const direction: Direction = language === 'en' ? 'ltr' : 'rtl';
  const t = translations[language] || ckb;

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mikmik_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    // Set appropriate font class
    if (language === 'en') {
      document.body.style.fontFamily = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";
    } else {
      document.body.style.fontFamily = "'Vazirmatn', system-ui, -apple-system, sans-serif";
    }
  }, [language, direction]);

  return (
    <LocalizationContext.Provider value={{ language, direction, t, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => useContext(LocalizationContext);
