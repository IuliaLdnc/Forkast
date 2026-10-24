import { ingredientById } from '../../fridge/data/ingredients';
import { Recipe, RecipeIngredient, recipes } from '../data/recipes';
import { substitutesFor } from '../data/substitutions';

export type ItemStatus = 'pantry' | 'have' | 'swap' | 'optional_out' | 'missing';

export interface PlannedItem {
  ingredient: RecipeIngredient;
  // The ingredient actually used: the original, or the substitute for a swap.
  effectiveId: string;
  status: ItemStatus;
  // Whether the item goes into the dish (and its macros) by default.
  included: boolean;
  // For swaps: the original ingredient id being replaced.
  substituteFor?: string;
}

export interface RecipePlan {
  recipe: Recipe;
  items: PlannedItem[];
  makeable: boolean;
  swaps: { from: string; to: string }[];
  missing: string[];
  // Non-pantry ingredients covered by what the user has (incl. swaps).
  haveCount: number;
  // Non-pantry ingredients in the recipe.
  significant: number;
}

const isPantry = (id: string) => ingredientById[id]?.pantry === true;

// Works out how a recipe can be cooked from the ingredients the user has:
// which are present, which can be swapped, and what is missing.
export function buildPlan(recipe: Recipe, have: Set<string>): RecipePlan {
  const items: PlannedItem[] = [];
  const swaps: { from: string; to: string }[] = [];
  const missing: string[] = [];
  let haveCount = 0;
  let significant = 0;

  // The main ingredient defines the dish and is never swapped. Use the
  // explicit `main` flags if any, otherwise the first required ingredient.
  const hasExplicitMain = recipe.ingredients.some(i => i.main);
  let mainLocked = false;

  for (const ing of recipe.ingredients) {
    if (isPantry(ing.id)) {
      items.push({ ingredient: ing, effectiveId: ing.id, status: 'pantry', included: true });
      continue;
    }

    significant++;

    const isMain = hasExplicitMain ? ing.main === true : !mainLocked && !ing.opt;
    if (isMain) mainLocked = true;

    if (have.has(ing.id)) {
      items.push({ ingredient: ing, effectiveId: ing.id, status: 'have', included: true });
      haveCount++;
      continue;
    }

    const sub = isMain ? undefined : substitutesFor(ing.id).find(s => have.has(s));
    if (sub) {
      items.push({
        ingredient: ing,
        effectiveId: sub,
        status: 'swap',
        included: true,
        substituteFor: ing.id,
      });
      swaps.push({ from: ing.id, to: sub });
      haveCount++;
      continue;
    }

    if (ing.opt) {
      items.push({ ingredient: ing, effectiveId: ing.id, status: 'optional_out', included: false });
    } else {
      items.push({ ingredient: ing, effectiveId: ing.id, status: 'missing', included: false });
      missing.push(ing.id);
    }
  }

  return {
    recipe,
    items,
    swaps,
    missing,
    makeable: missing.length === 0,
    haveCount,
    significant,
  };
}

// All recipes planned against `have`: makeable first, then fewest swaps,
// most ingredients used, and quickest.
export function matchRecipes(have: Set<string>, catalog: Recipe[] = recipes): RecipePlan[] {
  return catalog
    .map(recipe => buildPlan(recipe, have))
    .sort((a, b) => {
      if (a.makeable !== b.makeable) return a.makeable ? -1 : 1;
      if (a.swaps.length !== b.swaps.length) return a.swaps.length - b.swaps.length;
      if (b.haveCount !== a.haveCount) return b.haveCount - a.haveCount;
      return a.recipe.time - b.recipe.time;
    });
}
