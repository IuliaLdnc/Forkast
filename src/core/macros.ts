export interface Macros {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const EMPTY_MACROS: Macros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

export function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      fat: acc.fat + m.fat,
      carbs: acc.carbs + m.carbs,
    }),
    { ...EMPTY_MACROS },
  );
}

export function subtractMacros(a: Macros, b: Macros): Macros {
  return {
    kcal: a.kcal - b.kcal,
    protein: a.protein - b.protein,
    fat: a.fat - b.fat,
    carbs: a.carbs - b.carbs,
  };
}

export function scaleMacros(per100: Macros, grams: number): Macros {
  const k = grams / 100;
  return {
    kcal: Math.round(per100.kcal * k),
    protein: Math.round(per100.protein * k),
    fat: Math.round(per100.fat * k),
    carbs: Math.round(per100.carbs * k),
  };
}

export function per100From(macros: Macros, grams: number): Macros {
  const k = 100 / grams;
  const round1 = (v: number) => Math.round(v * k * 10) / 10;
  return {
    kcal: round1(macros.kcal),
    protein: round1(macros.protein),
    fat: round1(macros.fat),
    carbs: round1(macros.carbs),
  };
}
