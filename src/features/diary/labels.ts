import { UiKey } from '../../shared/i18n/ui';
import { Meal } from './domain/diary';

export const mealLabel: Record<Meal, UiKey> = {
  breakfast: 'meal.breakfast',
  lunch: 'meal.lunch',
  dinner: 'meal.dinner',
  snack: 'meal.snack',
};

export const mealStyle: Record<Meal, { emoji: string; color: string; light: string }> = {
  breakfast: { emoji: '☀️', color: '#E8A317', light: '#FEF3D6' },
  lunch: { emoji: '🍲', color: '#EE8A4F', light: '#FBE5D6' },
  dinner: { emoji: '🌙', color: '#5B8DEF', light: '#E4EDFC' },
  snack: { emoji: '🍎', color: '#E06A7B', light: '#FBE0E5' },
};
