import { UiKey } from '../../shared/i18n/ui';
import { Activity, Gender, Goal } from './domain/targets';

export const GOALS: Goal[] = ['cut', 'maintain', 'bulk'];
export const ACTIVITIES: Activity[] = ['low', 'light', 'moderate', 'high'];

export const goalLabel: Record<Goal, UiKey> = {
  cut: 'goals.goal.cut',
  maintain: 'goals.goal.maintain',
  bulk: 'goals.goal.bulk',
};

export const activityLabel: Record<Activity, UiKey> = {
  low: 'goals.activity.low',
  light: 'goals.activity.light',
  moderate: 'goals.activity.moderate',
  high: 'goals.activity.high',
};

export const genderLabel: Record<Gender, UiKey> = {
  male: 'goals.gender.male',
  female: 'goals.gender.female',
};
