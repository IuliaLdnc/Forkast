// Calendar-day keys in local time. The format is persisted on device, so it
// must stay stable ("2026-10-19" would break existing streaks and diaries).
export type DayKey = string;

export function dayKey(d: Date): DayKey {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function previousDayKey(d: Date): DayKey {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return dayKey(prev);
}
