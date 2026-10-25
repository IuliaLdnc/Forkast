import { Macros } from '../../../core/macros';

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
  track?: boolean;
}

const ACTIVITY_FACTOR: Record<Activity, number> = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
};

const KCAL_MULTIPLIER: Record<Exclude<Goal, 'cut'>, number> = {
  maintain: 1,
  bulk: 1.15,
};

const PROTEIN_PER_KG: Record<Exclude<Goal, 'cut'>, number> = {
  maintain: 1.8,
  bulk: 2,
};

type PerKg = { protein: number; fat: number; carbs: number };

const CUT_PER_KG: Record<Activity, PerKg> = {
  low: { protein: 1.6, fat: 0.8, carbs: 1.0 },
  light: { protein: 1.7, fat: 0.8, carbs: 1.25 },
  moderate: { protein: 1.75, fat: 0.8, carbs: 1.5 },
  high: { protein: 2.0, fat: 0.8, carbs: 2.0 },
};

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
    const perKg = CUT_PER_KG[profile.activity];
    const protein = perKg.protein * profile.weight;
    const fat = perKg.fat * profile.weight;
    const carbs = perKg.carbs * profile.weight;
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
