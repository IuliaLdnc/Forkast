export type DayKey = string;

export function dayKey(d: Date): DayKey {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function previousDayKey(d: Date): DayKey {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return dayKey(prev);
}
