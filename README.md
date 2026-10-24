# 🍴 Forkast

**Cook from what's in your fridge — and stay on top of your macros.**

Mark the products you have at home and Forkast finds recipes you can cook
right now, suggests swaps for missing ingredients, and breaks every serving
down into calories, protein, fat and carbs. It fights food waste and helps
you eat to your goal at the same time. Available in English and Russian.

## Screens

1. **Fridge** — pick products by category or search.
2. **Recipes** — recipes you can make from your selection, ranked to your goal
   and the calories left today. Filters: fits my budget, no swaps, high
   protein, fast, vegetarian, light.
3. **Recipe** — nutrition per serving (kcal + macro bar), ingredients marked
   "have / swap / buy / pantry", step-by-step instructions. Ingredients can be
   removed from the dish or tied to a specific brand, and the serving can be
   logged to the diary.
4. **Counter** — food diary by meal, calories left for your goal (cut /
   maintain / bulk or just tracking), and a daily streak.

## Getting started

```sh
npm install

# 1. Start Metro (in one terminal)
npm start

# 2. Build and launch the app (in another terminal)
npm run ios       # requires Xcode + a simulator
# or
npm run android   # requires Android Studio + an emulator
```

> On the first iOS run you may need `bundle install` and
> `bundle exec pod install` in the `ios/` folder.

## Project structure

The code is organised by feature. Inside a feature: `domain/` holds pure
logic with no React (covered by tests in `__tests__/domain`), `data/` holds
reference data, `components/` and `screens/` hold UI, and `*Context.tsx`
holds the feature's state.

```
App.tsx                  entry point → src/app/App
src/
  app/                   providers, root navigation (pager + overlays)
  core/                  Macros and calendar days — shared types and math
  shared/
    i18n/                EN/RU strings, LanguageContext, pluralisation
    theme/               colours, spacing, shadows
    storage/             usePersistedState — state backed by AsyncStorage
    ui/                  buttons, inputs, SheetModal, macro displays
  features/
    fridge/              product selection, ingredient catalogue
    recipes/             recipe matching and ranking, recipe screen
    foods/               food catalogue, search (local + Open Food Facts)
    diary/               today's food diary, adding and editing entries
    profile/             profile form, calorie/macro targets, calorie budget
    streak/              days-in-a-row streak and milestone celebration
    counter/             counter screen, combines diary + profile + streak
```

Dependencies point downwards: `app → features → shared → core`. Features
talk to each other through contexts (`useDiary`, `useProfile`, …) rather than
props passed down from the root.

## How macros are calculated

Every recipe ingredient has a weight in grams. Recipe macros are the sum of
its ingredients' per-100 g values (from `recipes/data/nutrition.ts`, or the
brand the user picked) divided by the number of servings. The macro bar shows
each macro's share of calories: protein and carbs are 4 kcal/g, fat is
9 kcal/g. Pantry staples (salt, oil, sugar, pepper) are not counted when
matching — they are assumed to always be at home.

For maintain and bulk, daily targets come from the Mifflin–St Jeor formula
times an activity factor, scaled for the goal. For a cut, protein, fat and
carbs are set per kilogram of body weight. Calories that go over the target only because of extra
protein are not counted as an overshoot.

## Data and privacy

Recipes, reference data and all logic are local, so recipe matching works
offline. Only the diary's food search goes online (Open Food Facts), and it
just supplements the local catalogue. Profile, diary, custom foods, streak and
language are stored on the device (AsyncStorage).

## Checks

```sh
npm test            # jest: domain logic + data integrity
npm run lint        # eslint
npx tsc --noEmit    # types
npx prettier --check "src/**/*.{ts,tsx}" "__tests__/**/*.{ts,tsx}"
```

## Roadmap

- Scale a recipe to a different number of servings.
- Favourites and fridge history.
- Integration with an external recipe API.
