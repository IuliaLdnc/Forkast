import { Macros } from '../../../core/macros';

export interface CalorieBudget {
  // Over target after protein forgiveness — the counter turns orange.
  over: boolean;
  // Kcal left (when under) or net kcal over (when over).
  remaining: number;
  // Share of the kcal target eaten, clamped to 0..1 for the progress bar.
  progress: number;
}

// Protein doesn't store as fat, so calories that are over only because of
// extra protein don't count as a real overshoot. Excess-protein calories
// forgive the overshoot, but only up to on-target (they don't grant extra
// room when you're genuinely over).
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
