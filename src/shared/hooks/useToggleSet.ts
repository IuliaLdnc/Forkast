import { useCallback, useState } from 'react';

export function useToggleSet<T>(initial?: Iterable<T>) {
  const [set, setSet] = useState<Set<T>>(() => new Set(initial));

  const toggle = useCallback((item: T) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }, []);

  const clear = useCallback(() => setSet(new Set()), []);

  return { set, toggle, clear };
}
