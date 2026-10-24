import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { StorageKeys, usePersistedState } from '../../shared/storage/usePersistedState';
import { activeStreak, EMPTY_STREAK, registerLogDay, StreakState } from './domain/streak';

interface StreakContextValue {
  streak: number;
  // Call whenever food is logged; bumps the streak once per day.
  registerLog: () => void;
  // Milestone reached just now, waiting to be celebrated.
  celebrate: number | null;
  dismissCelebrate: () => void;
}

const StreakContext = createContext<StreakContextValue | undefined>(undefined);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [state, setState, hydrated] = usePersistedState<StreakState>(
    StorageKeys.streak,
    EMPTY_STREAK,
  );
  const [celebrate, setCelebrate] = useState<number | null>(null);
  // Re-evaluated when the app returns to the foreground: a streak shown as
  // alive yesterday may have broken while the app sat in the background.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setNow(new Date());
    });
    return () => sub.remove();
  }, []);

  // registerLog may run several times before a re-render (e.g. two quick
  // adds), so it reads the latest state from a ref rather than a closure.
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const registerLog = useCallback(() => {
    const date = new Date();
    const { state: next, milestone } = registerLogDay(stateRef.current, date);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    // Keep `now` in step with the state, or a log made after midnight in a
    // still-open app would be judged against yesterday's date.
    setNow(date);
    if (milestone) setCelebrate(milestone);
  }, [setState]);

  const dismissCelebrate = useCallback(() => setCelebrate(null), []);

  const value = useMemo<StreakContextValue>(
    () => ({
      streak: activeStreak(state, now),
      registerLog,
      celebrate,
      dismissCelebrate,
    }),
    [state, now, registerLog, celebrate, dismissCelebrate],
  );

  if (!hydrated) return null;
  return <StreakContext.Provider value={value}>{children}</StreakContext.Provider>;
}

export function useStreak(): StreakContextValue {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error('useStreak must be used within StreakProvider');
  return ctx;
}
