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
  registerLog: () => void;
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
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const sub = AppState.addEventListener('change', s => {
      if (s === 'active') setNow(new Date());
    });
    return () => sub.remove();
  }, []);

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
