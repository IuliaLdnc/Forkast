import { Macros } from '../../../core/macros';
import { Lang, LocalizedText } from '../../../shared/i18n/types';

export interface Portion {
  grams: number;
  label: string;
}

export interface FoodProduct {
  id: string;
  name: LocalizedText;
  brand: string;
  per100: Macros;
  // Optional serving size so a product can be logged by portions
  // (e.g. "1 cracker = 15 g") instead of weighing every time.
  portion?: Portion;
}

export const ONLINE_ID_PREFIX = 'off-';

export const isOnlineFood = (food: FoodProduct) => food.id.startsWith(ONLINE_ID_PREFIX);

export function foodLabel(food: FoodProduct, lang: Lang): string {
  const name = food.name[lang] ?? food.name.en;
  return food.brand ? `${name} · ${food.brand}` : name;
}

export function searchFoods(query: string, catalog: FoodProduct[], limit = 14): FoodProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return catalog
    .filter(food => `${food.name.en} ${food.name.ru} ${food.brand}`.toLowerCase().includes(q))
    .slice(0, limit);
}

// Local results first, then online ones that aren't already listed.
export function mergeResults(local: FoodProduct[], online: FoodProduct[]): FoodProduct[] {
  const key = (f: FoodProduct) => `${f.name.en}|${f.brand}`;
  const seen = new Set(local.map(key));
  return [...local, ...online.filter(o => !seen.has(key(o)))];
}

// A user-entered product. Single-language input, so both names are the same.
export function makeCustomFood(
  idPrefix: string,
  name: string,
  brand: string,
  per100: Macros,
  portion?: Portion,
): FoodProduct {
  return {
    id: `${idPrefix}-${Date.now()}`,
    name: { en: name, ru: name },
    brand,
    per100,
    portion,
  };
}

// Converts macros entered for one portion of `portionGrams` to per-100g.
export function per100FromPortion(perPortion: Macros, portionGrams: number): Macros {
  const factor = 100 / portionGrams;
  const round1 = (v: number) => Math.round(v * factor * 10) / 10;
  return {
    kcal: Math.round(perPortion.kcal * factor),
    protein: round1(perPortion.protein),
    fat: round1(perPortion.fat),
    carbs: round1(perPortion.carbs),
  };
}
