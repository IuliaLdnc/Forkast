import { dayKey } from '../../src/core/date';
import {
  activeStreak,
  EMPTY_STREAK,
  registerLogDay,
  StreakState,
} from '../../src/features/streak/domain/streak';

const day = (iso: string) => new Date(`${iso}T12:00:00`);

describe('registerLogDay', () => {
  it('starts a streak at 1 on the first log', () => {
    const { state, milestone } = registerLogDay(EMPTY_STREAK, day('2026-03-10'));
    expect(state).toEqual({ count: 1, lastDate: dayKey(day('2026-03-10')), celebrated: 0 });
    expect(milestone).toBeNull();
  });

  it('is a no-op for a second log on the same day', () => {
    const first = registerLogDay(EMPTY_STREAK, day('2026-03-10')).state;
    const second = registerLogDay(first, day('2026-03-10'));
    expect(second.state).toBe(first);
    expect(second.milestone).toBeNull();
  });

  it('extends on consecutive days, across a month boundary', () => {
    const prev: StreakState = { count: 4, lastDate: dayKey(day('2026-03-31')), celebrated: 3 };
    expect(registerLogDay(prev, day('2026-04-01')).state.count).toBe(5);
  });

  it('restarts after a gap and resets celebrated milestones', () => {
    const prev: StreakState = { count: 9, lastDate: dayKey(day('2026-03-07')), celebrated: 7 };
    expect(registerLogDay(prev, day('2026-03-10')).state).toMatchObject({
      count: 1,
      celebrated: 0,
    });
  });

  it('reports a milestone once', () => {
    const prev: StreakState = { count: 6, lastDate: dayKey(day('2026-03-09')), celebrated: 3 };
    const { state, milestone } = registerLogDay(prev, day('2026-03-10'));
    expect(milestone).toBe(7);
    expect(state.celebrated).toBe(7);
  });
});

describe('activeStreak', () => {
  const state: StreakState = { count: 5, lastDate: dayKey(day('2026-03-10')), celebrated: 3 };

  it('counts when last logged today or yesterday', () => {
    expect(activeStreak(state, day('2026-03-10'))).toBe(5);
    expect(activeStreak(state, day('2026-03-11'))).toBe(5);
  });

  it('is broken after a missed day', () => {
    expect(activeStreak(state, day('2026-03-12'))).toBe(0);
  });
});
