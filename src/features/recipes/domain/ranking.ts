import { Macros } from '../../../core/macros';
import { Goal, goalFitScore } from '../../profile/domain/targets';
import { Tag } from '../data/recipes';
import { RecipePlan } from './match';
import { planMacros } from './recipeMacros';

export type RecipeFilter = 'all' | 'noswap' | 'fits' | Tag;

export const FILTER_TAGS: Tag[] = ['highprotein', 'fast', 'veg', 'lowcal'];

// Kcal headroom used by the "fits" filter: what's left today plus a small
// tolerance, or a light-snack allowance once the budget is spent.
const FIT_TOLERANCE = 60;
const SPENT_BUDGET_ALLOWANCE = 250;
// How strongly going over the remaining kcal pushes a recipe down.
const OVERSHOOT_PENALTY = 0.2;

// Orders plans by how well a serving fits the goal and today's remaining kcal.
export function rankForGoal(plans: RecipePlan[], goal: Goal, remaining: Macros): RecipePlan[] {
  const cap = Math.max(remaining.kcal, 0);
  const score = (p: RecipePlan) => {
    const m = planMacros(p);
    const overshoot = Math.max(m.kcal - cap, 0);
    return goalFitScore(m, goal) - overshoot * OVERSHOOT_PENALTY;
  };
  return [...plans].sort((a, b) => score(b) - score(a));
}

export function applyFilter(
  plans: RecipePlan[],
  filter: RecipeFilter,
  remaining: Macros | null,
): RecipePlan[] {
  switch (filter) {
    case 'all':
      return plans;
    case 'noswap':
      return plans.filter(p => p.swaps.length === 0);
    case 'fits': {
      if (!remaining) return plans;
      const cap = remaining.kcal > 0 ? remaining.kcal + FIT_TOLERANCE : SPENT_BUDGET_ALLOWANCE;
      return plans.filter(p => planMacros(p).kcal <= cap);
    }
    default:
      return plans.filter(p => p.recipe.tags.includes(filter));
  }
}
