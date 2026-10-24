import { Macros } from '../../../core/macros';
import { ItemStatus, PlannedItem, RecipePlan } from './match';
import { macrosFor } from './recipeMacros';

export const isToggleable = (status: ItemStatus) => status === 'have' || status === 'swap';

export function isIncluded(item: PlannedItem, removedByUser: boolean): boolean {
  if (item.status === 'pantry') return true;
  return isToggleable(item.status) && !removedByUser;
}

export interface Serving {
  macros: Macros;
  grams: number;
}

export function customServing(
  plan: RecipePlan,
  removed: Set<number>,
  brandPer100: Record<number, Macros | undefined>,
): Serving {
  const included = plan.items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item, idx }) => isIncluded(item, removed.has(idx)));

  const servings = plan.recipe.servings > 0 ? plan.recipe.servings : 1;
  const macros = macrosFor(
    included.map(({ item, idx }) => ({
      id: item.effectiveId,
      g: item.ingredient.g,
      per100: brandPer100[idx],
    })),
    plan.recipe.servings,
  );
  const totalGrams = included.reduce((s, { item }) => s + item.ingredient.g, 0);
  return { macros, grams: Math.round(totalGrams / servings) };
}
