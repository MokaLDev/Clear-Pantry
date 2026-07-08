import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Language, translations } from './translations';

interface I18nContextValue {
  language: Language;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

interface I18nProviderProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  children: React.ReactNode;
}

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value == null || typeof value !== 'object') return undefined;
    value = value[key];
  }
  return typeof value === 'string' ? value : undefined;
}

export function I18nProvider({ language, onChangeLanguage, children }: I18nProviderProps) {
  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = (translations as any)[language] || translations.en;
      let text = getNestedValue(dict, key);
      if (text === undefined) {
        // Fallback to English
        text = getNestedValue(translations.en, key) ?? key;
      }
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text!.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return text!;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, t, setLanguage: onChangeLanguage }),
    [language, t, onChangeLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return ctx;
}
