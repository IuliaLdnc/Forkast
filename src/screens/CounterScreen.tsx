import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n/LanguageContext';
import { UiKey } from '../i18n/ui';
import { DiaryEntry, Meal, useProfile } from '../profile/ProfileContext';
import { Activity, Gender, Goal, Profile, targetsFor } from '../profile/targets';
import { PrimaryButton } from '../components/PrimaryButton';
import { AddFoodPanel } from '../components/AddFoodPanel';
import { EditEntryModal } from '../components/EditEntryModal';
import { dayNoun } from '../utils/days';
import { colors, font, radius, shadow, spacing } from '../theme';

const GOALS: Goal[] = ['cut', 'maintain', 'bulk'];
const ACTIVITIES: Activity[] = ['low', 'light', 'moderate', 'high'];

const goalKey: Record<Goal, UiKey> = {
  cut: 'goals.goal.cut',
  maintain: 'goals.goal.maintain',
  bulk: 'goals.goal.bulk',
};

function sanitizeWeight(text: string): string {
  const normalized = text.replace(/[^0-9.,]/g, '').replace('.', ',');
  const [intPart, decPart] = normalized.split(',');
  let out = intPart.slice(0, 3);
  if (normalized.includes(',')) out += ',' + (decPart ?? '').slice(0, 2);
  return out;
}

function formatWeight(value: number, lang: string): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return lang === 'ru' ? text.replace('.', ',') : text;
}
const activityKey: Record<Activity, UiKey> = {
  low: 'goals.activity.low',
  light: 'goals.activity.light',
  moderate: 'goals.activity.moderate',
  high: 'goals.activity.high',
};

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealKey: Record<Meal, UiKey> = {
  breakfast: 'meal.breakfast',
  lunch: 'meal.lunch',
  dinner: 'meal.dinner',
  snack: 'meal.snack',
};

const mealStyle: Record<Meal, { emoji: string; color: string; light: string }> = {
  breakfast: { emoji: '☀️', color: '#E8A317', light: '#FEF3D6' },
  lunch: { emoji: '🍲', color: '#EE8A4F', light: '#FBE5D6' },
  dinner: { emoji: '🌙', color: '#5B8DEF', light: '#E4EDFC' },
  snack: { emoji: '🍎', color: '#E06A7B', light: '#FBE0E5' },
};

export function CounterScreen({ insets }: { insets: EdgeInsets }) {
  const { t } = useLang();
  const { profile, isActivated, save } = useProfile();
  const [editing, setEditing] = useState(false);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.title}>{t('counter.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}>
        {!isActivated && !editing && <Promo onActivate={() => setEditing(true)} />}

        {editing && (
          <ProfileForm
            initial={profile}
            onSave={next => {
              save(next);
              setEditing(false);
            }}
          />
        )}

        {isActivated && !editing && profile && (
          <CounterView profile={profile} onEdit={() => setEditing(true)} />
        )}
      </ScrollView>
    </View>
  );
}

function Promo({ onActivate }: { onActivate: () => void }) {
  const { t } = useLang();
  return (
    <View>
      <View style={styles.promo}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('goals.promo.badge')}</Text>
        </View>
        <Text style={styles.promoTitle}>{t('goals.promo.title')}</Text>
        <Text style={styles.promoBody}>{t('goals.promo.body')}</Text>
        <View style={styles.featureList}>
          <Text style={styles.feature}>{t('goals.promo.f1')}</Text>
          <Text style={styles.feature}>{t('goals.promo.f2')}</Text>
          <Text style={styles.feature}>{t('goals.promo.f3')}</Text>
        </View>
      </View>
      <PrimaryButton label={t('goals.activate')} onPress={onActivate} />
    </View>
  );
}

function ProfileForm({
  initial,
  onSave,
}: {
  initial: Profile | null;
  onSave: (profile: Profile) => void;
}) {
  const { t } = useLang();
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'male');
  const [age, setAge] = useState(initial ? String(initial.age) : '');
  const [height, setHeight] = useState(initial ? String(initial.height) : '');
  const [weight, setWeight] = useState(
    initial ? String(initial.weight).replace('.', ',') : '',
  );
  const [activity, setActivity] = useState<Activity>(initial?.activity ?? 'moderate');
  const [goal, setGoalValue] = useState<Goal>(initial?.goal ?? 'maintain');
  const [track, setTrack] = useState<boolean>(initial?.track ?? false);
  const [error, setError] = useState(false);

  const submit = () => {
    const a = Number(age);
    const h = Number(height);
    const w = Number(weight.replace(',', '.'));
    if (!a || !h || !w || a < 5 || h < 80 || w < 20) {
      setError(true);
      return;
    }
    onSave({ gender, age: a, height: h, weight: w, activity, goal, track });
  };

  return (
    <View>
      <Text style={styles.formTitle}>{t('goals.form.title')}</Text>

      <Text style={styles.label}>{t('goals.gender')}</Text>
      <Segmented
        options={[
          { value: 'male' as Gender, label: t('goals.gender.male') },
          { value: 'female' as Gender, label: t('goals.gender.female') },
        ]}
        value={gender}
        onChange={setGender}
      />

      <View style={styles.numberRow}>
        <NumberField label={t('goals.age')} value={age} onChange={setAge} />
        <NumberField label={t('goals.height')} value={height} onChange={setHeight} />
        <NumberField
          label={t('goals.weight')}
          value={weight}
          onChange={v => setWeight(sanitizeWeight(v))}
          keyboardType="decimal-pad"
          maxLength={6}
        />
      </View>

      <Text style={styles.label}>{t('goals.activity')}</Text>
      <View style={styles.chipWrap}>
        {ACTIVITIES.map(a => (
          <SelectChip
            key={a}
            label={t(activityKey[a])}
            active={activity === a}
            onPress={() => setActivity(a)}
          />
        ))}
      </View>

      <Text style={styles.label}>{t('goals.goal')}</Text>
      <View style={styles.chipWrap}>
        {GOALS.map(g => (
          <SelectChip
            key={g}
            label={t(goalKey[g])}
            active={!track && goal === g}
            onPress={() => {
              setTrack(false);
              setGoalValue(g);
            }}
          />
        ))}
        <SelectChip
          label={t('goals.goal.track')}
          active={track}
          onPress={() => setTrack(true)}
        />
      </View>

      {error && <Text style={styles.error}>{t('goals.invalid')}</Text>}

      <View style={styles.saveBtn}>
        <PrimaryButton label={t('goals.save')} onPress={submit} />
      </View>
    </View>
  );
}

function CounterView({
  profile,
  onEdit,
}: {
  profile: Profile;
  onEdit: () => void;
}) {
  const { t, lang } = useLang();
  const { entries, consumed, removeFood, updateFood, setEntryMacros, streak } =
    useProfile();
  const [addMeal, setAddMeal] = useState<Meal | null>(null);
  const [editEntry, setEditEntry] = useState<DiaryEntry | null>(null);
  const [expanded, setExpanded] = useState<Set<Meal>>(new Set());

  const toggleExpand = (m: Meal) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });

  const track = profile.track === true;
  const target = useMemo(
    () => (track ? null : targetsFor(profile, profile.goal)),
    [profile, track],
  );

  // Protein doesn't store as fat, so calories that are over only because of
  // extra protein don't count as a real overshoot — the counter stays green.
  // Excess-protein calories forgive the overshoot, but only up to on-target
  // (they don't grant extra room when you're genuinely over).
  const rawOver = target ? consumed.kcal - target.kcal : 0;
  const proteinForgiven = target
    ? Math.min(Math.max(consumed.protein - target.protein, 0) * 4, Math.max(rawOver, 0))
    : 0;
  const netOver = Math.max(rawOver - proteinForgiven, 0);
  const over = netOver > 0;
  const remaining = !target
    ? 0
    : rawOver <= 0
    ? target.kcal - consumed.kcal
    : over
    ? netOver
    : 0;
  const progress = target ? Math.min(consumed.kcal / Math.max(target.kcal, 1), 1) : 0;

  return (
    <View>
      <View style={styles.topRow}>
        <View style={styles.goalBadge}>
          {track ? (
            <Text style={styles.goalBadgeText}>📋 {t('counter.trackMode')}</Text>
          ) : (
            <>
              <Text style={styles.goalBadgeText}>
                🎯 {t(goalKey[profile.goal])}
              </Text>
              <Text style={styles.goalBadgeKcal}>
                {target!.kcal} {t('detail.kcal')}
              </Text>
            </>
          )}
        </View>

        <View style={[styles.streakPill, streak > 0 && styles.streakPillActive]}>
          <Text style={styles.streakFlame}>🔥</Text>
          <Text style={[styles.streakCount, streak > 0 && styles.streakCountActive]}>
            {streak}
          </Text>
        </View>
      </View>

      {streak > 0 ? (
        <Text style={styles.streakLabel}>
          {t('streak.row', { noun: dayNoun(streak, lang) })}
        </Text>
      ) : (
        <Text style={styles.streakHint}>{t('streak.none')}</Text>
      )}

      <View style={[styles.counter, over && styles.counterOver]}>
        <Text style={styles.counterLabel}>{t('diary.eaten')}</Text>
        <Text style={styles.counterBig}>{consumed.kcal}</Text>
        {target ? (
          <>
            <Text style={styles.counterOf}>
              {t('counter.ofTarget', { target: target.kcal })}
            </Text>
            <View style={styles.bigTrack}>
              <View style={[styles.bigFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.counterSub}>
              {over
                ? t('diary.overSub', { n: Math.abs(remaining) })
                : t('diary.leftSub', { n: remaining })}
            </Text>
          </>
        ) : (
          <Text style={styles.counterSub}>{t('counter.trackHint')}</Text>
        )}
        <View style={styles.macroPills}>
          <MacroPill
            color={colors.protein}
            label={t('macro.protein')}
            value={
              target
                ? `${consumed.protein}/${target.protein}`
                : t('macro.eatenShort', { n: consumed.protein })
            }
          />
          <MacroPill
            color={colors.fat}
            label={t('macro.fat')}
            value={
              target
                ? `${consumed.fat}/${target.fat}`
                : t('macro.eatenShort', { n: consumed.fat })
            }
          />
          <MacroPill
            color={colors.carbs}
            label={t('macro.carbs')}
            value={
              target
                ? `${consumed.carbs}/${target.carbs}`
                : t('macro.eatenShort', { n: consumed.carbs })
            }
          />
        </View>
      </View>

      {MEALS.map(meal => (
        <MealCard
          key={meal}
          meal={meal}
          items={entries.filter(e => (e.meal ?? 'snack') === meal)}
          expanded={expanded.has(meal)}
          onToggle={() => toggleExpand(meal)}
          onAdd={() => setAddMeal(meal)}
          onEdit={setEditEntry}
          onRemove={removeFood}
        />
      ))}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          {t('goals.summary', {
            gender: t(
              profile.gender === 'male'
                ? 'goals.gender.male'
                : 'goals.gender.female',
            ),
            age: profile.age,
            height: profile.height,
            weight: formatWeight(profile.weight, lang),
            activity: t(activityKey[profile.activity]),
          })}
        </Text>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={styles.editLink}>{t('goals.edit')}</Text>
        </Pressable>
      </View>

      <AddFoodPanel
        visible={addMeal !== null}
        initialMeal={addMeal ?? 'breakfast'}
        onClose={() => setAddMeal(null)}
      />

      <EditEntryModal
        entry={editEntry}
        onSaveGrams={grams => editEntry && updateFood(editEntry.id, grams)}
        onSaveManual={(grams, macros) =>
          editEntry && setEntryMacros(editEntry.id, grams, macros)
        }
        onClose={() => setEditEntry(null)}
      />
    </View>
  );
}

function MealCard({
  meal,
  items,
  expanded,
  onToggle,
  onAdd,
  onEdit,
  onRemove,
}: {
  meal: Meal;
  items: DiaryEntry[];
  expanded: boolean;
  onToggle: () => void;
  onAdd: () => void;
  onEdit: (entry: DiaryEntry) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useLang();
  const ms = mealStyle[meal];
  const total = items.reduce((s, e) => s + e.macros.kcal, 0);
  const totP = Math.round(items.reduce((s, e) => s + e.macros.protein, 0));
  const totF = Math.round(items.reduce((s, e) => s + e.macros.fat, 0));
  const totC = Math.round(items.reduce((s, e) => s + e.macros.carbs, 0));
  const hasItems = items.length > 0;

  return (
    <View
      style={[
        styles.mealCard,
        { backgroundColor: ms.light, borderColor: ms.color },
      ]}>
      <View style={styles.mealCardHeader}>
        <Pressable
          onPress={hasItems ? onToggle : onAdd}
          style={styles.mealCardTitleRow}
          hitSlop={6}>
          <Text style={styles.mealEmoji}>{ms.emoji}</Text>
          <Text style={styles.mealCardTitle}>{t(mealKey[meal])}</Text>
          {hasItems && (
            <Text style={[styles.mealChevron, { color: ms.color }]}>
              {expanded ? '▾' : '▸'}
            </Text>
          )}
        </Pressable>
        <View style={styles.mealCardRight}>
          {total > 0 && (
            <Text style={[styles.mealCardKcal, { color: ms.color }]}>
              {total} {t('detail.kcal')}
            </Text>
          )}
          <Pressable
            onPress={onAdd}
            style={[styles.mealAddBtn, { backgroundColor: ms.color }]}
            hitSlop={6}>
            <Text style={styles.mealAddPlus}>＋</Text>
          </Pressable>
        </View>
      </View>

      {total > 0 && (
        <View style={styles.mealMacroRow}>
          <Text style={[styles.mealMacro, { color: colors.protein }]}>
            {t('macro.pShort')} {totP}
          </Text>
          <Text style={[styles.mealMacro, { color: colors.fat }]}>
            {t('macro.fShort')} {totF}
          </Text>
          <Text style={[styles.mealMacro, { color: colors.carbs }]}>
            {t('macro.cShort')} {totC}
          </Text>
        </View>
      )}

      {!hasItems && (
        <Pressable onPress={onAdd}>
          <Text style={styles.mealEmpty}>{t('meal.addHint')}</Text>
        </Pressable>
      )}

      {hasItems &&
        expanded &&
        items.map(e => (
          <View key={e.id} style={styles.entryRow}>
            <Pressable style={styles.entryMain} onPress={() => onEdit(e)}>
              <View style={styles.entryTextWrap}>
                <Text style={styles.entryName} numberOfLines={1}>
                  {e.name}
                </Text>
                <View style={styles.entryMacroLine}>
                  {e.grams != null && (
                    <Text style={styles.entryGrams}>{e.grams} {t('food.gUnit')}</Text>
                  )}
                  <Text style={[styles.entryMacro, { color: colors.protein }]}>
                    {t('macro.pShort')} {Math.round(e.macros.protein)}
                  </Text>
                  <Text style={[styles.entryMacro, { color: colors.fat }]}>
                    {t('macro.fShort')} {Math.round(e.macros.fat)}
                  </Text>
                  <Text style={[styles.entryMacro, { color: colors.carbs }]}>
                    {t('macro.cShort')} {Math.round(e.macros.carbs)}
                  </Text>
                  <Text style={styles.entryEditMark}>✎</Text>
                </View>
              </View>
              <Text style={styles.entryKcal}>
                {e.macros.kcal} {t('detail.kcal')}
              </Text>
            </Pressable>
            <Pressable onPress={() => onRemove(e.id)} hitSlop={8}>
              <Text style={styles.entryRemove}>−</Text>
            </Pressable>
          </View>
        ))}
    </View>
  );
}

function MacroPill({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.macroPill}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroPillLabel}>{label}</Text>
      <Text style={styles.macroPillValue}>{value}</Text>
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(opt => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.segment, value === opt.value && styles.segmentActive]}>
          <Text
            style={[
              styles.segmentText,
              value === opt.value && styles.segmentTextActive,
            ]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function NumberField({
  label,
  value,
  onChange,
  keyboardType = 'number-pad',
  maxLength = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  keyboardType?: 'number-pad' | 'decimal-pad';
  maxLength?: number;
}) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.numberLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        maxLength={maxLength}
        style={styles.numberInput}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

function SelectChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.selectChip, active && styles.selectChipActive]}>
      <Text style={[styles.selectChipText, active && styles.selectChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: font.h1, fontWeight: '800', color: colors.text },
  body: { padding: spacing.lg },

  promo: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadow.card,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  badgeText: { color: colors.white, fontWeight: '800', fontSize: font.tiny },
  promoTitle: {
    color: colors.white,
    fontSize: font.h2,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  promoBody: {
    color: colors.primaryLight,
    fontSize: font.body,
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  featureList: { gap: spacing.sm },
  feature: { color: colors.white, fontSize: font.body, fontWeight: '600' },

  formTitle: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: font.body, fontWeight: '700', color: colors.textMuted },
  segmentTextActive: { color: colors.white },

  numberRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  numberField: { flex: 1 },
  numberLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
  },
  numberInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  selectChip: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  selectChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selectChipText: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  selectChipTextActive: { color: colors.primaryDark },

  error: {
    color: colors.danger,
    fontSize: font.small,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  saveBtn: { marginTop: spacing.xl },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  goalBadge: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  goalBadgeText: {
    fontSize: font.body,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  goalBadgeKcal: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primary,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgWarm,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  streakPillActive: {
    backgroundColor: colors.accentLight,
  },
  streakFlame: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: font.h3,
    fontWeight: '900',
    color: colors.textFaint,
  },
  streakCountActive: {
    color: colors.accent,
  },
  streakLabel: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.accent,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  streakHint: {
    fontSize: font.small,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.soft,
  },
  summaryText: { flex: 1, fontSize: font.small, color: colors.text, fontWeight: '600' },
  editLink: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '700',
    paddingLeft: spacing.md,
  },

  counter: {
    backgroundColor: colors.counter,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    ...shadow.card,
  },
  counterOver: {
    backgroundColor: colors.counterOver,
  },
  counterLabel: {
    color: '#FFFFFFCC',
    fontSize: font.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  counterBig: {
    color: colors.white,
    fontSize: 76,
    fontWeight: '900',
    lineHeight: 82,
    marginVertical: 2,
  },
  counterOf: {
    color: '#FFFFFFDD',
    fontSize: font.body,
    fontWeight: '700',
  },
  bigTrack: {
    width: '100%',
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF3D',
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  bigFill: {
    height: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  counterSub: {
    color: colors.white,
    fontSize: font.h3,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  macroPills: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: '100%',
  },
  macroPill: {
    flex: 1,
    backgroundColor: '#FFFFFF26',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  macroPillLabel: {
    color: '#FFFFFFDD',
    fontSize: font.tiny,
    fontWeight: '700',
  },
  macroPillValue: {
    color: colors.white,
    fontSize: font.body,
    fontWeight: '800',
    marginTop: 1,
  },

  mealCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginTop: spacing.lg,
    ...shadow.soft,
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealCardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  mealChevron: {
    fontSize: font.body,
    fontWeight: '800',
  },
  mealEmoji: { fontSize: 22 },
  mealCardTitle: {
    fontSize: font.h3,
    fontWeight: '800',
    color: colors.text,
  },
  mealCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mealCardKcal: {
    fontSize: font.small,
    fontWeight: '800',
  },
  mealAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealAddPlus: {
    color: colors.white,
    fontSize: font.h3,
    fontWeight: '800',
    lineHeight: 22,
  },
  mealEmpty: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00000014',
  },
  entryMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  entryTextWrap: { flexShrink: 1 },
  entryName: { fontSize: font.body, color: colors.text, fontWeight: '600' },
  entryMacroLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: 2,
  },
  entryGrams: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '700' },
  entryMacro: { fontSize: font.tiny, fontWeight: '800' },
  entryEditMark: { fontSize: font.tiny, color: colors.primary, fontWeight: '800' },
  entryKcal: { fontSize: font.small, color: colors.textMuted, marginRight: spacing.md },
  mealMacroRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  mealMacro: { fontSize: font.small, fontWeight: '800' },
  entryRemove: {
    fontSize: 22,
    color: colors.accent,
    fontWeight: '800',
    width: 24,
    textAlign: 'center',
  },
});
