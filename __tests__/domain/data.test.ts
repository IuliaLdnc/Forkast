import { builtinFoods } from '../../src/features/foods/data/builtinFoods';
import { ingredientById, ingredients } from '../../src/features/fridge/data/ingredients';
import { nutrition } from '../../src/features/recipes/data/nutrition';
import { recipes } from '../../src/features/recipes/data/recipes';
import { substitutionGroups } from '../../src/features/recipes/data/substitutions';

// The catalogues reference each other by id; a typo would crash the UI
// (e.g. RecipeCard reads ingredientById[id].name) or silently zero macros.
describe('static data integrity', () => {
  it('has unique ids', () => {
    const unique = (ids: string[]) => expect(new Set(ids).size).toBe(ids.length);
    unique(recipes.map(r => r.id));
    unique(ingredients.map(i => i.id));
    unique(builtinFoods.map(f => f.id));
  });

  it('every recipe ingredient is a known ingredient with nutrition data', () => {
    const unknown = recipes.flatMap(r =>
      r.ingredients
        .filter(i => !ingredientById[i.id] || !nutrition[i.id])
        .map(i => `${r.id}: ${i.id}`),
    );
    expect(unknown).toEqual([]);
  });

  it('every substitute is a known ingredient with nutrition data', () => {
    const unknown = substitutionGroups.flat().filter(id => !ingredientById[id] || !nutrition[id]);
    expect(unknown).toEqual([]);
  });

  it('recipes are well-formed', () => {
    for (const r of recipes) {
      expect(r.servings).toBeGreaterThan(0);
      expect(r.ingredients.length).toBeGreaterThan(0);
      expect(r.ingredients.every(i => i.g >= 0)).toBe(true);
    }
  });
});
