import { Lang } from '../i18n/LanguageContext';

// Correct day noun for the streak label, including Russian pluralization.
export function dayNoun(n: number, lang: Lang): string {
  if (lang !== 'ru') return n === 1 ? 'day' : 'days';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
  return 'дней';
}
