import { dayKey, DayKey, previousDayKey } from '../../../core/date';

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 100, 180, 365];

export interface StreakState {
  count: number;
  lastDate: DayKey;
  celebrated: number;
}

export const EMPTY_STREAK: StreakState = { count: 0, lastDate: '', celebrated: 0 };

export function registerLogDay(
  prev: StreakState,
  now: Date,
): { state: StreakState; milestone: number | null } {
  const today = dayKey(now);
  if (prev.lastDate === today) return { state: prev, milestone: null };

  const continued = prev.lastDate === previousDayKey(now);
  const count = continued ? prev.count + 1 : 1;
  const celebrated = continued ? prev.celebrated : 0;
  const milestone = STREAK_MILESTONES.includes(count) && count > celebrated ? count : null;

  return {
    state: { count, lastDate: today, celebrated: milestone ?? celebrated },
    milestone,
  };
}

export function activeStreak(state: StreakState, now: Date): number {
  const alive = state.lastDate === dayKey(now) || state.lastDate === previousDayKey(now);
  return alive ? state.count : 0;
}
