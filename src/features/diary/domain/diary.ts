import { DayKey } from '../../../core/date';
import { Macros, per100From, scaleMacros, sumMacros } from '../../../core/macros';
import { Portion } from '../../foods/domain/foods';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export interface FoodSource {
  grams?: number;
  per100?: Macros;
  portion?: Portion;
}

export interface DiaryEntry extends FoodSource {
  id: string;
  name: string;
  macros: Macros;
  meal: Meal;
}

export interface DiaryDay {
  date: DayKey;
  entries: DiaryEntry[];
}

export const emptyDay = (date: DayKey): DiaryDay => ({ date, entries: [] });

export function totals(entries: DiaryEntry[]): Macros {
  return sumMacros(entries.map(e => e.macros));
}

export function entriesForMeal(entries: DiaryEntry[], meal: Meal): DiaryEntry[] {
  return entries.filter(e => (e.meal ?? 'snack') === meal);
}

export function entryPer100(entry: DiaryEntry): Macros | null {
  if (entry.per100) return entry.per100;
  return entry.grams ? per100From(entry.macros, entry.grams) : null;
}

export function entryGrams(entry: DiaryEntry): number | null {
  if (entry.grams != null) return entry.grams;
  if (entry.per100 && entry.per100.kcal > 0) {
    return Math.round((entry.macros.kcal / entry.per100.kcal) * 100);
  }
  return null;
}

export function regram(entry: DiaryEntry, grams: number): DiaryEntry {
  const base = entryPer100(entry);
  if (!base) return entry;
  return { ...entry, grams, per100: base, macros: scaleMacros(base, grams) };
}

export function overrideMacros(entry: DiaryEntry, grams: number, macros: Macros): DiaryEntry {
  return {
    ...entry,
    grams: grams > 0 ? grams : undefined,
    macros,
    per100: grams > 0 ? per100From(macros, grams) : entry.per100,
  };
}
