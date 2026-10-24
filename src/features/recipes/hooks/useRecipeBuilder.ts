import { useCallback, useMemo, useState } from 'react';
import { per100From } from '../../../core/macros';
import { useToggleSet } from '../../../shared/hooks/useToggleSet';
import { FoodSource } from '../../diary/domain/diary';
import { FoodProduct } from '../../foods/domain/foods';
import { Recipe } from '../data/recipes';
import { buildPlan } from '../domain/match';
import { customServing, isIncluded } from '../domain/serving';

// State of the recipe detail screen: which ingredients the user keeps, which
// brands they picked, and the resulting per-serving macros.
export function useRecipeBuilder(recipe: Recipe, have: Set<string>) {
  const plan = useMemo(() => buildPlan(recipe, have), [recipe, have]);
  const removed = useToggleSet<number>();
  const [brands, setBrands] = useState<Record<number, FoodProduct>>({});

  const setBrand = useCallback((idx: number, food: FoodProduct | null) => {
    setBrands(prev => {
      const next = { ...prev };
      if (food) next[idx] = food;
      else delete next[idx];
      return next;
    });
  }, []);

  const serving = useMemo(() => {
    const brandPer100 = Object.fromEntries(
      Object.entries(brands).map(([idx, food]) => [idx, food.per100]),
    );
    return customServing(plan, removed.set, brandPer100);
  }, [plan, removed.set, brands]);

  // Logged with a per-100g basis so it can be re-weighed in the diary.
  const diarySource = useMemo<FoodSource | undefined>(
    () =>
      serving.grams > 0
        ? { grams: serving.grams, per100: per100From(serving.macros, serving.grams) }
        : undefined,
    [serving],
  );

  const included = (idx: number) => isIncluded(plan.items[idx], removed.set.has(idx));

  return {
    plan,
    included,
    toggle: removed.toggle,
    brands,
    setBrand,
    macros: serving.macros,
    diarySource,
  };
}
