import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Macros } from '../data/recipes';
import { FoodProduct, scaleMacros } from '../data/foods';
import { Goal, Profile } from './targets';

const PROFILE_KEY = 'forkast.profile.v1';
const DIARY_KEY = 'forkast.diary.v1';
const FOODS_KEY = 'forkast.foods.v1';
const STREAK_KEY = 'forkast.streak.v1';

// Days-in-a-row milestones worth celebrating with a "wow" animation.
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 90, 100, 180, 365];

export type Meal = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Extra info kept so a logged food can be re-weighed later.
export interface FoodSource {
  grams?: number;
  per100?: Macros;
  portion?: { grams: number; label: string };
}

export interface DiaryEntry {
  id: string;
  name: string;
  macros: Macros;
  meal: Meal;
  grams?: number;
  per100?: Macros;
  portion?: { grams: number; label: string };
}

interface StoredDiary {
  date: string;
  entries: DiaryEntry[];
}

interface StreakState {
  count: number;
  lastDate: string;
  celebrated: number;
}

const EMPTY_STREAK: StreakState = { count: 0, lastDate: '', celebrated: 0 };

interface ProfileContextValue {
  profile: Profile | null;
  ready: boolean;
  isActivated: boolean;
  save: (profile: Profile) => void;
  setGoal: (goal: Goal) => void;
  reset: () => void;
  entries: DiaryEntry[];
  consumed: Macros;
  addFood: (name: string, macros: Macros, meal: Meal, source?: FoodSource) => void;
  updateFood: (id: string, grams: number) => void;
  setEntryMacros: (id: string, grams: number, macros: Macros) => void;
  removeFood: (id: string) => void;
  customFoods: FoodProduct[];
  addCustomFood: (food: FoodProduct) => void;
  streak: number;
  celebrate: number | null;
  dismissCelebrate: () => void;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function today(): string {
  return fmtDate(new Date());
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return fmtDate(d);
}

function milestoneHit(count: number, celebrated: number): number | null {
  return STREAK_MILESTONES.includes(count) && count > celebrated ? count : null;
}

const EMPTY_MACROS: Macros = { kcal: 0, protein: 0, fat: 0, carbs: 0 };

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [diaryDate, setDiaryDate] = useState(today());
  const [customFoods, setCustomFoods] = useState<FoodProduct[]>([]);
  const [streakState, setStreakState] = useState<StreakState>(EMPTY_STREAK);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PROFILE_KEY),
      AsyncStorage.getItem(DIARY_KEY),
      AsyncStorage.getItem(FOODS_KEY),
      AsyncStorage.getItem(STREAK_KEY),
    ])
      .then(([rawProfile, rawDiary, rawFoods, rawStreak]) => {
        if (rawProfile) setProfile(JSON.parse(rawProfile) as Profile);
        if (rawDiary) {
          const diary = JSON.parse(rawDiary) as StoredDiary;
          if (diary.date === today()) {
            setEntries(diary.entries);
            setDiaryDate(diary.date);
          }
        }
        if (rawFoods) setCustomFoods(JSON.parse(rawFoods) as FoodProduct[]);
        if (rawStreak) setStreakState(JSON.parse(rawStreak) as StreakState);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state === 'active' && diaryDate !== today()) {
        setEntries([]);
        setDiaryDate(today());
        AsyncStorage.setItem(
          DIARY_KEY,
          JSON.stringify({ date: today(), entries: [] }),
        ).catch(() => {});
      }
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, [diaryDate]);

  const persistProfile = useCallback((next: Profile | null) => {
    setProfile(next);
    if (next) {
      AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next)).catch(() => {});
    } else {
      AsyncStorage.removeItem(PROFILE_KEY).catch(() => {});
    }
  }, []);

  const persistDiary = useCallback((next: DiaryEntry[]) => {
    setEntries(next);
    setDiaryDate(today());
    const payload: StoredDiary = { date: today(), entries: next };
    AsyncStorage.setItem(DIARY_KEY, JSON.stringify(payload)).catch(() => {});
  }, []);

  const persistFoods = useCallback((next: FoodProduct[]) => {
    setCustomFoods(next);
    AsyncStorage.setItem(FOODS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const streakRef = useRef(streakState);
  useEffect(() => {
    streakRef.current = streakState;
  }, [streakState]);

  // Bump the day-streak the first time food is logged on a given day.
  // A consecutive day extends it; a gap of 2+ days starts it over at 1.
  const registerLogToday = useCallback(() => {
    const prev = streakRef.current;
    const t = today();
    if (prev.lastDate === t) return;

    const continued = prev.lastDate === yesterday();
    const count = continued ? prev.count + 1 : 1;
    const celebrated = continued ? prev.celebrated : 0;
    const hit = milestoneHit(count, celebrated);
    const next: StreakState = {
      count,
      lastDate: t,
      celebrated: hit ?? celebrated,
    };

    streakRef.current = next;
    setStreakState(next);
    AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next)).catch(() => {});
    if (hit) setCelebrate(hit);
  }, []);

  const consumed = useMemo<Macros>(
    () =>
      entries.reduce(
        (acc, e) => ({
          kcal: acc.kcal + e.macros.kcal,
          protein: acc.protein + e.macros.protein,
          fat: acc.fat + e.macros.fat,
          carbs: acc.carbs + e.macros.carbs,
        }),
        { ...EMPTY_MACROS },
      ),
    [entries],
  );

  // The streak only counts if it reaches up to today: logged today (alive),
  // or logged yesterday (still alive, today not logged yet). Older = broken.
  const streak = useMemo(() => {
    if (streakState.lastDate === today()) return streakState.count;
    if (streakState.lastDate === yesterday()) return streakState.count;
    return 0;
  }, [streakState]);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      ready,
      isActivated: profile !== null,
      save: persistProfile,
      setGoal: goal => {
        if (profile) persistProfile({ ...profile, goal });
      },
      reset: () => persistProfile(null),
      entries,
      consumed,
      addFood: (name, macros, meal, source) => {
        persistDiary([
          ...entries,
          { id: `${Date.now()}-${entries.length}`, name, macros, meal, ...source },
        ]);
        registerLogToday();
      },
      updateFood: (id, grams) =>
        persistDiary(
          entries.map(e => {
            if (e.id !== id) return e;
            // Per-100g basis: stored directly, or derived from the logged
            // amount (macros that were recorded for `e.grams`).
            const base =
              e.per100 ?? (e.grams ? scaleMacros(e.macros, 10000 / e.grams) : null);
            if (!base) return e;
            return { ...e, grams, per100: base, macros: scaleMacros(base, grams) };
          }),
        ),
      // For entries with no per-gram basis: set grams and macros directly, and
      // remember a per-100g basis so the entry becomes grams-editable afterwards.
      setEntryMacros: (id, grams, macros) =>
        persistDiary(
          entries.map(e =>
            e.id === id
              ? {
                  ...e,
                  grams: grams > 0 ? grams : undefined,
                  macros,
                  per100: grams > 0 ? scaleMacros(macros, 10000 / grams) : e.per100,
                }
              : e,
          ),
        ),
      removeFood: id => persistDiary(entries.filter(e => e.id !== id)),
      customFoods,
      addCustomFood: food => persistFoods([food, ...customFoods]),
      streak,
      celebrate,
      dismissCelebrate: () => setCelebrate(null),
    }),
    [
      profile,
      ready,
      entries,
      consumed,
      customFoods,
      streak,
      celebrate,
      persistProfile,
      persistDiary,
      persistFoods,
      registerLogToday,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
