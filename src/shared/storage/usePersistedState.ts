import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Versioned storage keys. Bump the version when a stored shape changes
// incompatibly; the old value is then simply ignored.
export const StorageKeys = {
  profile: 'forkast.profile.v1',
  diary: 'forkast.diary.v1',
  customFoods: 'forkast.foods.v1',
  streak: 'forkast.streak.v1',
  lang: 'forkast.lang.v1',
} as const;

type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];

interface Options<T> {
  // Adjusts a freshly loaded value (e.g. drops a diary from another day).
  revive?: (stored: T) => T;
}

// useState that is loaded from AsyncStorage on mount and written back on every
// change. `null` removes the key. Writes start only after the initial load, so
// the default value never overwrites what is stored. Providers render their
// children only once `hydrated` is true, so the UI never acts on (or flashes)
// the default value while the stored one is still loading.
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
