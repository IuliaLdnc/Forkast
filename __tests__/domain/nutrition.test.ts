import { per100From, scaleMacros } from '../../src/core/macros';
import { calorieBudget } from '../../src/features/profile/domain/calorieBudget';
import {
  mergeResults,
  per100FromPortion,
  FoodProduct,
} from '../../src/features/foods/domain/foods';
import { toFoodProduct } from '../../src/features/foods/api/openFoodFacts';

const target = { kcal: 2000, protein: 150, fat: 60, carbs: 200 };

describe('macros', () => {
  it('scales per-100g values and back', () => {
    const per100 = { kcal: 350, protein: 12, fat: 6, carbs: 60 };
    expect(scaleMacros(per100, 50)).toEqual({ kcal: 175, protein: 6, fat: 3, carbs: 30 });
    expect(per100From({ kcal: 175, protein: 6, fat: 3, carbs: 30 }, 50)).toEqual(per100);
  });

  it('round-trips a logged amount through its per-100g basis', () => {
    const serving = { kcal: 523, protein: 31, fat: 17, carbs: 58 };
    expect(scaleMacros(per100From(serving, 350), 350)).toEqual(serving);
  });
});

describe('calorieBudget', () => {
  it('reports kcal left when under target', () => {
    const b = calorieBudget({ ...target, kcal: 1500 }, target);
    expect(b).toEqual({ over: false, remaining: 500, progress: 0.75 });
  });

  it('forgives an overshoot caused only by extra protein', () => {
    // 100 kcal over, but 50 g extra protein = 200 kcal of forgiveness.
    const b = calorieBudget({ ...target, kcal: 2100, protein: 200 }, target);
    expect(b.over).toBe(false);
    expect(b.remaining).toBe(0);
    expect(b.progress).toBe(1);
  });

  it('counts the net overshoot beyond what protein forgives', () => {
    const b = calorieBudget({ ...target, kcal: 2300, protein: 175 }, target);
    expect(b).toMatchObject({ over: true, remaining: 200 });
  });
});

describe('foods', () => {
  it('converts per-portion macros to per-100g', () => {
    expect(per100FromPortion({ kcal: 60, protein: 1.5, fat: 2, carbs: 9 }, 15)).toEqual({
      kcal: 400,
      protein: 10,
      fat: 13.3,
      carbs: 60,
    });
  });

  it('merges online results without duplicating local ones', () => {
    const food = (id: string, name: string, brand = ''): FoodProduct => ({
      id,
      name: { en: name, ru: name },
      brand,
      per100: { kcal: 1, protein: 0, fat: 0, carbs: 0 },
    });
    const merged = mergeResults(
      [food('a', 'Milk', 'X')],
      [food('off-1', 'Milk', 'X'), food('off-2', 'Milk', 'Y')],
    );
    expect(merged.map(f => f.id)).toEqual(['a', 'off-2']);
  });

  it('maps Open Food Facts products and skips unusable ones', () => {
    expect(
      toFoodProduct({
        code: '123',
        product_name: ' Kefir ',
        brands: 'Brand A, Brand B',
        nutriments: { 'energy-kcal_100g': 40.4, proteins_100g: 3.04 },
      }),
    ).toEqual({
      id: 'off-123',
      name: { en: 'Kefir', ru: 'Kefir' },
      brand: 'Brand A',
      per100: { kcal: 40, protein: 3, fat: 0, carbs: 0 },
    });
    expect(toFoodProduct({ product_name: 'No kcal', nutriments: {} })).toBeNull();
    expect(toFoodProduct({ nutriments: { 'energy-kcal_100g': 10 } })).toBeNull();
  });
});
