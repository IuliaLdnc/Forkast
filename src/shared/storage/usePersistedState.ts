import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  profile: 'forkast.profile.v1',
  diary: 'forkast.diary.v1',
  customFoods: 'forkast.foods.v1',
  streak: 'forkast.streak.v1',
  lang: 'forkast.lang.v1',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

interface Options<T> {
  revive?: (stored: T) => T;
}

export function usePersistedState<T>(key: StorageKey, initial: T, { revive }: Options<T> = {}) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const reviveRef = useRef(revive);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then(raw => {
        if (cancelled || raw == null) return;
        const stored = JSON.parse(raw) as T;
        setValue(reviveRef.current ? reviveRef.current(stored) : stored);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    const write =
      value === null
        ? AsyncStorage.removeItem(key)
        : AsyncStorage.setItem(key, JSON.stringify(value));
    write.catch(() => {});
  }, [key, value, hydrated]);

  return [value, setValue, hydrated] as const;
}
