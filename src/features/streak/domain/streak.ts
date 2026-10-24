import { dayKey, DayKey, previousDayKey } from '../../../core/date';

// Days-in-a-row milestones worth celebrating with a "wow" animation.
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 100, 180, 365];

export interface StreakState {
  count: number;
  lastDate: DayKey;
  // Highest milestone already celebrated in the current run.
  celebrated: number;
}

export const EMPTY_STREAK: StreakState = { count: 0, lastDate: '', celebrated: 0 };

// Records that food was logged on `now`'s day. A consecutive day extends the
// streak; a gap of 2+ days restarts it at 1. Repeat logs on the same day are
// no-ops (the same state object is returned).
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

// The streak only counts if it reaches up to today: logged today, or logged
// yesterday (still alive, today not logged yet). Anything older is broken.
export function activeStreak(state: StreakState, now: Date): number {
  const alive = state.lastDate === dayKey(now) || state.lastDate === previousDayKey(now);
  return alive ? state.count : 0;
}
