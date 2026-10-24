import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { StorageKeys, usePersistedState } from '../../shared/storage/usePersistedState';
import { builtinFoods } from './data/builtinFoods';
import { FoodProduct } from './domain/foods';

interface FoodsContextValue {
  customFoods: FoodProduct[];
  catalog: FoodProduct[];
  saveCustomFood: (food: FoodProduct) => void;
}

const FoodsContext = createContext<FoodsContextValue | undefined>(undefined);

export function FoodsProvider({ children }: { children: React.ReactNode }) {
  const [customFoods, setCustomFoods, hydrated] = usePersistedState<FoodProduct[]>(
    StorageKeys.customFoods,
    [],
  );

  const saveCustomFood = useCallback(
    (food: FoodProduct) =>
      setCustomFoods(prev => (prev.some(f => f.id === food.id) ? prev : [food, ...prev])),
    [setCustomFoods],
  );

  const value = useMemo<FoodsContextValue>(
    () => ({
      customFoods,
      catalog: [...customFoods, ...builtinFoods],
      saveCustomFood,
    }),
    [customFoods, saveCustomFood],
  );

  if (!hydrated) return null;
  return <FoodsContext.Provider value={value}>{children}</FoodsContext.Provider>;
}

export function useFoods(): FoodsContextValue {
  const ctx = useContext(FoodsContext);
  if (!ctx) throw new Error('useFoods must be used within FoodsProvider');
  return ctx;
}
