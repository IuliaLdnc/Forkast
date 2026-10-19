import { Macros } from '../data/recipes';

export type Gender = 'male' | 'female';
export type Activity = 'low' | 'light' | 'moderate' | 'high';
export type Goal = 'cut' | 'maintain' | 'bulk';

export interface Profile {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  activity: Activity;
  goal: Goal;
  // When true the app does not compute a target — the user just logs food.
  track?: boolean;
}

const ACTIVITY_FACTOR: Record<Activity, number> = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const KCAL_MULTIPLIER: Record<Goal, number> = {
  cut: 0.8,
  maintain: 1,
  bulk: 1.15,
};

const PROTEIN_PER_KG: Record<Goal, number> = {
  cut: 2.2,
  maintain: 1.8,
  bulk: 2,
};

// Cutting macros are set directly per kg of body weight, not derived from
// a calorie share: 2.2 g protein, 0.8 g fat and 1.5 g carbs per kg.
const CUT_PER_KG = { protein: 2.2, fat: 0.8, carbs: 1.5 };

const FAT_KCAL_SHARE = 0.25;

function basalMetabolicRate(profile: Profile): number {
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  return profile.gender === 'male' ? base + 5 : base - 161;
}

export function maintenanceCalories(profile: Profile): number {
  return basalMetabolicRate(profile) * ACTIVITY_FACTOR[profile.activity];
}

export function targetsFor(profile: Profile, goal: Goal): Macros {
  if (goal === 'cut') {
    const protein = CUT_PER_KG.protein * profile.weight;
    const fat = CUT_PER_KG.fat * profile.weight;
    const carbs = CUT_PER_KG.carbs * profile.weight;
    const kcal = protein * 4 + fat * 9 + carbs * 4;
    return {
      kcal: Math.round(kcal),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs),
    };
  }

  const kcal = maintenanceCalories(profile) * KCAL_MULTIPLIER[goal];
  const protein = PROTEIN_PER_KG[goal] * profile.weight;
  const fatKcal = kcal * FAT_KCAL_SHARE;
  const fat = fatKcal / 9;
  const carbs = Math.max((kcal - protein * 4 - fatKcal) / 4, 0);

  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
}

export function goalFitScore(perServing: Macros, goal: Goal): number {
  const kcal = Math.max(perServing.kcal, 1);
  const proteinShare = (perServing.protein * 4) / kcal;
  const carbShare = (perServing.carbs * 4) / kcal;

  switch (goal) {
    case 'cut':
      return proteinShare * 100 - kcal / 60;
    case 'bulk':
      return kcal / 60 + carbShare * 40;
    case 'maintain':
      return proteinShare * 60 + 30 - Math.abs(kcal - 450) / 30;
  }
}
