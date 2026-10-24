import {
  DiaryEntry,
  entriesForMeal,
  entryGrams,
  entryPer100,
  overrideMacros,
  regram,
  totals,
} from '../../src/features/diary/domain/diary';

const entry = (over: Partial<DiaryEntry> = {}): DiaryEntry => ({
  id: '1',
  name: 'Oats',
  meal: 'breakfast',
  macros: { kcal: 200, protein: 10, fat: 4, carbs: 30 },
  ...over,
});

describe('diary domain', () => {
  it('sums totals', () => {
    expect(
      totals([entry(), entry({ macros: { kcal: 50, protein: 1, fat: 1, carbs: 1 } })]),
    ).toEqual({
      kcal: 250,
      protein: 11,
      fat: 5,
      carbs: 31,
    });
  });

  it('treats entries without a meal as snacks', () => {
    const legacy = entry({ meal: undefined as unknown as DiaryEntry['meal'] });
    expect(entriesForMeal([legacy], 'snack')).toHaveLength(1);
    expect(entriesForMeal([legacy], 'breakfast')).toHaveLength(0);
  });

  it('derives a per-100g basis from logged grams', () => {
    expect(entryPer100(entry({ grams: 50 }))).toEqual({
      kcal: 400,
      protein: 20,
      fat: 8,
      carbs: 60,
    });
    expect(entryPer100(entry())).toBeNull();
  });

  it('recovers grams from per-100g calories', () => {
    const per100 = { kcal: 400, protein: 20, fat: 8, carbs: 60 };
    expect(entryGrams(entry({ per100 }))).toBe(50);
    expect(entryGrams(entry({ grams: 70, per100 }))).toBe(70);
    expect(entryGrams(entry())).toBeNull();
  });

  it('re-weighs an entry from its basis', () => {
    const updated = regram(entry({ grams: 50 }), 100);
    expect(updated.grams).toBe(100);
    expect(updated.macros).toEqual({ kcal: 400, protein: 20, fat: 8, carbs: 60 });
  });

  it('leaves entries without a basis unchanged on regram', () => {
    const e = entry();
    expect(regram(e, 100)).toBe(e);
  });

  it('makes a manual entry grams-editable after overriding macros', () => {
    const macros = { kcal: 300, protein: 15, fat: 6, carbs: 45 };
    const updated = overrideMacros(entry(), 150, macros);
    expect(updated.macros).toBe(macros);
    expect(updated.per100).toEqual({ kcal: 200, protein: 10, fat: 4, carbs: 30 });
    expect(overrideMacros(entry(), 0, macros).grams).toBeUndefined();
  });
});
