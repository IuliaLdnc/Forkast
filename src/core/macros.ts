// Nutrition values. Depending on context these are per 100 g, per serving or
// per logged amount — the name of the variable says which.
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

// Macros for `grams` of a product given its per-100g values, rounded to
// whole numbers for display and logging.
export function scaleMacros(per100: Macros, grams: number): Macros {
  const k = grams / 100;
  return {
    kcal: Math.round(per100.kcal * k),
    protein: Math.round(per100.protein * k),
    fat: Math.round(per100.fat * k),
    carbs: Math.round(per100.carbs * k),
  };
}

// Inverse of scaleMacros: per-100g values from macros recorded for `grams`.
// Kept to one decimal (not whole numbers) so that scaling back to the same
// weight reproduces the logged values: a 350 g serving of 523 kcal must not
// turn into 522 kcal when the entry is opened for editing.
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
