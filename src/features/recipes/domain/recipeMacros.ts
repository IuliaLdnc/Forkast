import { Macros } from '../../../core/macros';
import { nutrition } from '../data/nutrition';
import { RecipePlan } from './match';

export interface MacroItem {
  id: string;
  g: number;
  // Optional per-100g override (e.g. a specific brand the user picked).
  // When set, it is used instead of the generic nutrition table.
  per100?: Macros;
}

// Macros of one serving made from `items` (total ÷ servings, rounded).
export function macrosFor(items: MacroItem[], servings: number): Macros {
  let kcal = 0;
  let protein = 0;
  let fat = 0;
  let carbs = 0;

  for (const it of items) {
    const n = it.per100 ?? nutrition[it.id];
    if (!n) continue;
    const k = it.g / 100;
    kcal += n.kcal * k;
    protein += n.protein * k;
    fat += n.fat * k;
    carbs += n.carbs * k;
  }

  const s = servings > 0 ? servings : 1;
  return {
    kcal: Math.round(kcal / s),
    protein: Math.round(protein / s),
    fat: Math.round(fat / s),
    carbs: Math.round(carbs / s),
  };
}

// Per-serving macros of a plan with its default ingredient selection.
export function planMacros(plan: RecipePlan): Macros {
  return macrosFor(
    plan.items.filter(i => i.included).map(i => ({ id: i.effectiveId, g: i.ingredient.g })),
    plan.recipe.servings,
  );
}
