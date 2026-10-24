import { DayKey } from '../../../core/date';
import { Macros, per100From, scaleMacros, sumMacros } from '../../../core/macros';
import { Portion } from '../../foods/domain/foods';

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];

// Extra info kept so a logged food can be re-weighed later.
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

// What is persisted: the diary only ever holds a single day.
export interface DiaryDay {
  date: DayKey;
  entries: DiaryEntry[];
}

export const emptyDay = (date: DayKey): DiaryDay => ({ date, entries: [] });

export function totals(entries: DiaryEntry[]): Macros {
  return sumMacros(entries.map(e => e.macros));
}

export function entriesForMeal(entries: DiaryEntry[], meal: Meal): DiaryEntry[] {
  // Entries from before meals existed have no meal; they count as snacks.
  return entries.filter(e => (e.meal ?? 'snack') === meal);
}

// Per-100g basis of an entry: stored directly, or derived from the logged
// amount. Null when the entry has neither (e.g. a manual kcal-only log).
export function entryPer100(entry: DiaryEntry): Macros | null {
  if (entry.per100) return entry.per100;
  return entry.grams ? per100From(entry.macros, entry.grams) : null;
}

// Grams to prefill when editing: the logged amount, or recovered from the
// logged calories when only per-100g values were stored.
export function entryGrams(entry: DiaryEntry): number | null {
  if (entry.grams != null) return entry.grams;
  if (entry.per100 && entry.per100.kcal > 0) {
    return Math.round((entry.macros.kcal / entry.per100.kcal) * 100);
  }
  return null;
}

// Re-weighs an entry, rescaling its macros from the per-100g basis.
export function regram(entry: DiaryEntry, grams: number): DiaryEntry {
  const base = entryPer100(entry);
  if (!base) return entry;
  return { ...entry, grams, per100: base, macros: scaleMacros(base, grams) };
}

// For entries with no per-gram basis: set grams and macros directly, and
// remember a per-100g basis so the entry becomes grams-editable afterwards.
export function overrideMacros(entry: DiaryEntry, grams: number, macros: Macros): DiaryEntry {
  return {
    ...entry,
    grams: grams > 0 ? grams : undefined,
    macros,
    per100: grams > 0 ? per100From(macros, grams) : entry.per100,
  };
}
