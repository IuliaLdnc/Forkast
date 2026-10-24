import React, { createContext, useContext, useMemo } from 'react';
import { StorageKeys, usePersistedState } from '../storage/usePersistedState';
import { ui, UiKey } from './ui';
import { Lang, LocalizedText } from './types';

export type TranslateVars = Record<string, string | number>;

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  // Translates a UI string key, filling `{name}` placeholders from `vars`.
  t: (key: UiKey, vars?: TranslateVars) => string;
  // Picks the current language from inline localized content (recipe data).
  tx: (text: LocalizedText) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => (key in vars ? String(vars[key]) : `{${key}}`));
}

export function LanguageProvider({
  children,
  initial = 'en',
}: {
  children: React.ReactNode;
  initial?: Lang;
}) {
  const [lang, setLang, hydrated] = usePersistedState<Lang>(StorageKeys.lang, initial);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => interpolate(ui[lang][key] ?? ui.en[key] ?? key, vars),
      tx: text => text[lang] ?? text.en,
    }),
    [lang, setLang],
  );

  if (!hydrated) return null;
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLang must be used within LanguageProvider');
  }
  return ctx;
}
