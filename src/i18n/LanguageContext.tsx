import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ui, UiKey } from './ui';

export type Lang = 'en' | 'ru';

export interface LocalizedText {
  en: string;
  ru: string;
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  
  t: (key: UiKey, vars?: Record<string, string | number>) => string;
  
  tx: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

export function LanguageProvider({
  children,
  initial = 'en',
}: {
  children: React.ReactNode;
  initial?: Lang;
}) {
  const [lang, setLang] = useState<Lang>(initial);

  const toggle = useCallback(
    () => setLang(prev => (prev === 'en' ? 'ru' : 'en')),
    [],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggle,
      t: (key, vars) => interpolate(ui[lang][key] ?? ui.en[key] ?? key, vars),
      tx: text => text[lang] ?? text.en,
    }),
    [lang, toggle],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLang must be used within LanguageProvider');
  }
  return ctx;
}
