import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';
import { dayKey } from '../../core/date';
import { Macros } from '../../core/macros';
import { StorageKeys, usePersistedState } from '../../shared/storage/usePersistedState';
import { useStreak } from '../streak/StreakContext';
import {
  DiaryDay,
  DiaryEntry,
  emptyDay,
  FoodSource,
  Meal,
  overrideMacros,
  regram,
  totals,
} from './domain/diary';

interface DiaryContextValue {
  entries: DiaryEntry[];
  consumed: Macros;
  addFood: (name: string, macros: Macros, meal: Meal, source?: FoodSource) => void;
  regramEntry: (id: string, grams: number) => void;
  overrideEntry: (id: string, grams: number, macros: Macros) => void;
  removeEntry: (id: string) => void;
}

const DiaryContext = createContext<DiaryContextValue | undefined>(undefined);

const today = () => dayKey(new Date());

// A diary left over from a previous day starts the new day empty.
const freshDay = (day: DiaryDay): DiaryDay => (day.date === today() ? day : emptyDay(today()));

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const { registerLog } = useStreak();
  const [day, setDay, hydrated] = usePersistedState<DiaryDay>(
    StorageKeys.diary,
    emptyDay(today()),
    {
      revive: freshDay,
    },
  );

  // The app may stay in memory overnight; roll over when it comes back.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') setDay(freshDay);
    });
    return () => sub.remove();
  }, [setDay]);

  const updateEntries = useCallback(
    (fn: (entries: DiaryEntry[]) => DiaryEntry[]) =>
      setDay(prev => ({ date: today(), entries: fn(freshDay(prev).entries) })),
    [setDay],
  );

  const mapEntry = useCallback(
    (id: string, fn: (e: DiaryEntry) => DiaryEntry) =>
      updateEntries(list => list.map(e => (e.id === id ? fn(e) : e))),
    [updateEntries],
  );

  const value = useMemo<DiaryContextValue>(
    () => ({
      entries: day.entries,
      consumed: totals(day.entries),
      addFood: (name, macros, meal, source) => {
        updateEntries(list => [
          ...list,
          { id: `${Date.now()}-${list.length}`, name, macros, meal, ...source },
        ]);
        registerLog();
      },
      regramEntry: (id, grams) => mapEntry(id, e => regram(e, grams)),
      overrideEntry: (id, grams, macros) => mapEntry(id, e => overrideMacros(e, grams, macros)),
      removeEntry: id => updateEntries(list => list.filter(e => e.id !== id)),
    }),
    [day, updateEntries, mapEntry, registerLog],
  );

  if (!hydrated) return null;
  return <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>;
}

export function useDiary(): DiaryContextValue {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider');
  return ctx;
}
