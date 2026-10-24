import { Macros } from '../../../core/macros';

export interface CalorieBudget {
  over: boolean;
  remaining: number;
  progress: number;
}

export function calorieBudget(consumed: Macros, target: Macros): CalorieBudget {
  const rawOver = consumed.kcal - target.kcal;
  const proteinForgiven = Math.min(
    Math.max(consumed.protein - target.protein, 0) * 4,
    Math.max(rawOver, 0),
  );
  const netOver = Math.max(rawOver - proteinForgiven, 0);
  const over = netOver > 0;
  const remaining = rawOver <= 0 ? target.kcal - consumed.kcal : netOver;
  const progress = Math.min(consumed.kcal / Math.max(target.kcal, 1), 1);
  return { over, remaining, progress };
}
