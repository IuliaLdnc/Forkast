export type Lang = 'en' | 'ru';

export interface LocalizedText {
  en: string;
  ru: string;
}

export const L = (en: string, ru: string): LocalizedText => ({ en, ru });
