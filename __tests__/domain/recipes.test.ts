import { L } from '../../src/shared/i18n/types';
import { Recipe } from '../../src/features/recipes/data/recipes';
import { buildPlan, matchRecipes } from '../../src/features/recipes/domain/match';
import { applyFilter } from '../../src/features/recipes/domain/ranking';
import { customServing } from '../../src/features/recipes/domain/serving';

const recipe = (over: Partial<Recipe> = {}): Recipe => ({
  id: 'test',
  title: L('Test', 'Тест'),
  emoji: '🍳',
  description: L('', ''),
  time: 10,
  servings: 2,
  difficulty: 'easy',
  steps: [],
  tags: ['fast'],
  ingredients: [
    { id: 'chicken', amount: L('', ''), g: 200 },
    { id: 'rice', amount: L('', ''), g: 100 },
    { id: 'broccoli', amount: L('', ''), g: 100, opt: true },
    { id: 'salt', amount: L('', ''), g: 2 },
  ],
  ...over,
});

describe('buildPlan', () => {
  it('marks pantry, present and missing items', () => {
    const plan = buildPlan(recipe(), new Set(['chicken']));
    expect(plan.items.map(i => i.status)).toEqual(['have', 'missing', 'optional_out', 'pantry']);
    expect(plan.makeable).toBe(false);
    expect(plan.missing).toEqual(['rice']);
  });

  it('swaps a non-main ingredient for one the user has', () => {
    const plan = buildPlan(recipe(), new Set(['chicken', 'buckwheat']));
    expect(plan.makeable).toBe(true);
    expect(plan.swaps).toEqual([{ from: 'rice', to: 'buckwheat' }]);
  });

  it('never swaps the main ingredient', () => {
    const plan = buildPlan(recipe(), new Set(['pork', 'rice']));
    expect(plan.makeable).toBe(false);
    expect(plan.missing).toEqual(['chicken']);
  });
});

describe('matchRecipes', () => {
  it('puts makeable recipes first, then fewer swaps', () => {
    const catalog = [
      recipe({ id: 'missing', ingredients: [{ id: 'tuna', amount: L('', ''), g: 100 }] }),
      recipe({ id: 'swap' }),
      recipe({ id: 'exact', ingredients: [{ id: 'chicken', amount: L('', ''), g: 100 }] }),
    ];
    const ids = matchRecipes(new Set(['chicken', 'pasta']), catalog).map(p => p.recipe.id);
    expect(ids).toEqual(['exact', 'swap', 'missing']);
  });
});

describe('applyFilter', () => {
  const plans = [
    buildPlan(recipe({ id: 'plain' }), new Set(['chicken', 'rice'])),
    buildPlan(recipe({ id: 'swapped', tags: ['veg'] }), new Set(['chicken', 'pasta'])),
  ];

  it('filters by swaps and tags', () => {
    expect(applyFilter(plans, 'noswap', null).map(p => p.recipe.id)).toEqual(['plain']);
    expect(applyFilter(plans, 'veg', null).map(p => p.recipe.id)).toEqual(['swapped']);
  });

  it('"fits" keeps everything without a target', () => {
    expect(applyFilter(plans, 'fits', null)).toHaveLength(2);
  });
});

describe('customServing', () => {
  it('drops removed items and applies brand overrides', () => {
    const plan = buildPlan(recipe(), new Set(['chicken', 'rice']));
    const full = customServing(plan, new Set(), {});
    const noRice = customServing(plan, new Set([1]), {});
    expect(noRice.macros.kcal).toBeLessThan(full.macros.kcal);
    expect(noRice.grams).toBe(Math.round((200 + 2) / 2));

    const branded = customServing(plan, new Set(), {
      0: { kcal: 100, protein: 20, fat: 2, carbs: 0 },
    });
    expect(branded.macros.kcal).toBeLessThan(full.macros.kcal);
  });
});
