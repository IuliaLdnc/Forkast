import { Macros } from '../../../core/macros';
import { nutrition } from '../data/nutrition';
import { RecipePlan } from './match';

export interface MacroItem {
  id: string;
  g: number;
  per100?: Macros;
}

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

export function planMacros(plan: RecipePlan): Macros {
  return macrosFor(
    plan.items.filter(i => i.included).map(i => ({ id: i.effectiveId, g: i.ingredient.g })),
    plan.recipe.servings,
  );
}
