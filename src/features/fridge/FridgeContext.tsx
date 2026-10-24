import React, { createContext, useContext, useMemo } from 'react';
import { useToggleSet } from '../../shared/hooks/useToggleSet';

interface FridgeContextValue {
  // Ingredient ids the user marked as available.
  selected: Set<string>;
  toggle: (id: string) => void;
  clear: () => void;
}

const FridgeContext = createContext<FridgeContextValue | undefined>(undefined);

export function FridgeProvider({ children }: { children: React.ReactNode }) {
  const { set, toggle, clear } = useToggleSet<string>();
  const value = useMemo(() => ({ selected: set, toggle, clear }), [set, toggle, clear]);
  return <FridgeContext.Provider value={value}>{children}</FridgeContext.Provider>;
}

export function useFridge(): FridgeContextValue {
  const ctx = useContext(FridgeContext);
  if (!ctx) throw new Error('useFridge must be used within FridgeProvider');
  return ctx;
}
