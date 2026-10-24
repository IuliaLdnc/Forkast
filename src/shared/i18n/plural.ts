import { Lang } from './types';

export type PluralForm = 'one' | 'few' | 'many';

export function pluralForm(n: number, lang: Lang): PluralForm {
  if (lang !== 'ru') return n === 1 ? 'one' : 'many';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'one';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'few';
  return 'many';
}

const DAY_NOUNS: Record<Lang, Record<PluralForm, string>> = {
  en: { one: 'day', few: 'days', many: 'days' },
  ru: { one: 'день', few: 'дня', many: 'дней' },
};

export function dayNoun(n: number, lang: Lang): string {
  return DAY_NOUNS[lang][pluralForm(n, lang)];
}
