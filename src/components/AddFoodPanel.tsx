import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  FoodProduct,
  foodLabel,
  scaleMacros,
  searchFoods,
  searchOnline,
} from '../data/foods';
import { Macros } from '../data/recipes';
import { useLang } from '../i18n/LanguageContext';
import { UiKey } from '../i18n/ui';
import { Meal, useProfile } from '../profile/ProfileContext';
import { colors, font, radius, spacing } from '../theme';

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealKey: Record<Meal, UiKey> = {
  breakfast: 'meal.breakfast',
  lunch: 'meal.lunch',
  dinner: 'meal.dinner',
  snack: 'meal.snack',
};

function sanitizeDecimal(text: string): string {
  const s = text.replace(/[^0-9.,]/g, '').replace('.', ',');
  const [intPart, decPart] = s.split(',');
  let out = intPart.slice(0, 4);
  if (s.includes(',')) out += ',' + (decPart ?? '').slice(0, 2);
  return out;
}

const parseNum = (s: string): number => Number(s.replace(',', '.')) || 0;

export function AddFoodPanel({
  visible,
  onClose,
  initialMeal = 'breakfast',
}: {
  visible: boolean;
  onClose: () => void;
  initialMeal?: Meal;
}) {
  const { t, lang } = useLang();
  const { customFoods, addCustomFood, addFood } = useProfile();

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodProduct | null>(null);
  const [manual, setManual] = useState(false);
  const [grams, setGrams] = useState('100');
  const [meal, setMeal] = useState<Meal>(initialMeal);

  useEffect(() => {
    if (visible) setMeal(initialMeal);
  }, [visible, initialMeal]);

  const [mName, setMName] = useState('');
  const [mBrand, setMBrand] = useState('');
  const [mKcal, setMKcal] = useState('');
  const [mProtein, setMProtein] = useState('');
  const [mFat, setMFat] = useState('');
  const [mCarbs, setMCarbs] = useState('');
  const [mBasis, setMBasis] = useState<'per100' | 'portion'>('per100');
  const [mPortionG, setMPortionG] = useState('');
  const [mPortionLabel, setMPortionLabel] = useState('');

  const [online, setOnline] = useState<FoodProduct[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(false);

  const localResults = useMemo(
    () => searchFoods(query, customFoods),
    [query, customFoods],
  );

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setOnline([]);
      setLoadingOnline(false);
      return;
    }
    setLoadingOnline(true);
    let cancelled = false;
    const id = setTimeout(() => {
      searchOnline(q).then(r => {
        if (!cancelled) {
          setOnline(r);
          setLoadingOnline(false);
        }
      });
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  const results = useMemo(() => {
    const seen = new Set(localResults.map(r => `${r.name.en}|${r.brand}`));
    const extra = online.filter(o => !seen.has(`${o.name.en}|${o.brand}`));
    return [...localResults, ...extra];
  }, [localResults, online]);

  const reset = () => {
    setQuery('');
    setSelected(null);
    setManual(false);
    setGrams('100');
    setOnline([]);
    setLoadingOnline(false);
    setMName('');
    setMBrand('');
    setMKcal('');
    setMProtein('');
    setMFat('');
    setMCarbs('');
    setMBasis('per100');
    setMPortionG('');
    setMPortionLabel('');
  };

  const close = () => {
    reset();
    onClose();
  };

  // Selecting a product defaults the amount to one portion when the
  // product defines one, otherwise to 100 g.
  const selectFood = (food: FoodProduct) => {
    setSelected(food);
    setGrams(String(food.portion ? food.portion.grams : 100));
  };

  const saveManual = () => {
    const kcal = parseNum(mKcal);
    if (!mName.trim() || !kcal) return;
    const trimmed = mName.trim();

    let per100: Macros;
    let portion: { grams: number; label: string } | undefined;

    if (mBasis === 'portion') {
      const g = parseNum(mPortionG);
      if (!g) return;
      const factor = 100 / g;
      const round1 = (v: number) => Math.round(v * factor * 10) / 10;
      per100 = {
        kcal: Math.round(kcal * factor),
        protein: round1(parseNum(mProtein)),
        fat: round1(parseNum(mFat)),
        carbs: round1(parseNum(mCarbs)),
      };
      portion = { grams: g, label: mPortionLabel.trim() || t('food.portionDefault') };
    } else {
      per100 = {
        kcal,
        protein: parseNum(mProtein),
        fat: parseNum(mFat),
        carbs: parseNum(mCarbs),
      };
    }

    const food: FoodProduct = {
      id: `custom-${Date.now()}`,
      name: { en: trimmed, ru: trimmed },
      brand: mBrand.trim(),
      per100,
      portion,
    };
    addCustomFood(food);
    selectFood(food);
    setManual(false);
  };

  const confirm = () => {
    if (!selected) return;
    const g = Number(grams);
    if (!g) return;
    if (
      selected.id.startsWith('off-') &&
      !customFoods.some(f => f.id === selected.id)
    ) {
      addCustomFood(selected);
    }
    addFood(foodLabel(selected, lang), scaleMacros(selected.per100, g), meal, {
      grams: g,
      per100: selected.per100,
      portion: selected.portion,
    });
    close();
  };

  const renderBody = () => {
    if (selected) {
      const portion = scaleMacros(selected.per100, Number(grams) || 0);
      return (
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setSelected(null)} hitSlop={8}>
            <Text style={styles.back}>{t('goals.back')}</Text>
          </Pressable>
          <Text style={styles.productTitle}>{foodLabel(selected, lang)}</Text>
          <MacroStrip macros={selected.per100} t={t} note={t('food.per100')} />

          {selected.portion && (
            <>
              <Text style={styles.portionInfo}>
                {t('food.portionOf', {
                  label: selected.portion.label,
                  grams: selected.portion.grams,
                })}
              </Text>
              <View style={styles.portionChips}>
                {[1, 2, 3, 4, 5].map(nn => {
                  const g = nn * selected.portion!.grams;
                  const active = Number(grams) === g;
                  return (
                    <Pressable
                      key={nn}
                      onPress={() => setGrams(String(g))}
                      style={[styles.portionChip, active && styles.portionChipActive]}>
                      <Text
                        style={[
                          styles.portionChipText,
                          active && styles.portionChipTextActive,
                        ]}>
                        ×{nn}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <Text style={styles.label}>{t('food.grams')}</Text>
          <TextInput
            value={grams}
            onChangeText={setGrams}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.gramsInput}
          />

          <MealRow meal={meal} setMeal={setMeal} t={t} />

          <Text style={styles.portionCaption}>
            {Number(grams) || 0} {t('food.gUnit')}
          </Text>
          <MacroCircles macros={portion} t={t} />

          <Pressable onPress={confirm} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>{t('food.addToDiary')}</Text>
          </Pressable>
        </ScrollView>
      );
    }

    if (manual) {
      return (
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setManual(false)} hitSlop={8}>
            <Text style={styles.back}>{t('goals.back')}</Text>
          </Pressable>
          <TextInput
            value={mName}
            onChangeText={setMName}
            placeholder={t('food.namePh')}
            placeholderTextColor={colors.textFaint}
            style={styles.textInput}
          />
          <TextInput
            value={mBrand}
            onChangeText={setMBrand}
            placeholder={t('food.brand')}
            placeholderTextColor={colors.textFaint}
            style={[styles.textInput, styles.gap]}
          />

          <View style={styles.basisRow}>
            <BasisTab
              label={t('food.basis.per100')}
              active={mBasis === 'per100'}
              onPress={() => setMBasis('per100')}
            />
            <BasisTab
              label={t('food.basis.portion')}
              active={mBasis === 'portion'}
              onPress={() => setMBasis('portion')}
            />
          </View>

          {mBasis === 'portion' && (
            <View style={styles.portionFields}>
              <View style={styles.portionGramsField}>
                <Text style={styles.numLabel}>{t('food.portionGrams')}</Text>
                <TextInput
                  value={mPortionG}
                  onChangeText={v => setMPortionG(sanitizeDecimal(v))}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  placeholder="15"
                  placeholderTextColor={colors.textFaint}
                  style={styles.numInput}
                />
              </View>
              <View style={styles.portionLabelField}>
                <Text style={styles.numLabel}>{t('food.portionLabel')}</Text>
                <TextInput
                  value={mPortionLabel}
                  onChangeText={setMPortionLabel}
                  placeholder={t('food.portionDefault')}
                  placeholderTextColor={colors.textFaint}
                  style={styles.numInput}
                />
              </View>
            </View>
          )}

          <Text style={styles.label}>
            {mBasis === 'portion' ? t('food.perPortion') : t('food.per100')}
          </Text>
          <View style={styles.macroInputs}>
            <NumField label={t('detail.kcal')} value={mKcal} onChange={v => setMKcal(sanitizeDecimal(v))} />
            <NumField label={t('macro.protein')} value={mProtein} onChange={v => setMProtein(sanitizeDecimal(v))} />
            <NumField label={t('macro.fat')} value={mFat} onChange={v => setMFat(sanitizeDecimal(v))} />
            <NumField label={t('macro.carbs')} value={mCarbs} onChange={v => setMCarbs(sanitizeDecimal(v))} />
          </View>
          <Pressable onPress={saveManual} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>{t('food.saveUse')}</Text>
          </Pressable>
        </ScrollView>
      );
    }

    return (
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('food.search')}
          placeholderTextColor={colors.textFaint}
          autoFocus
          style={styles.textInput}
        />

        <Pressable onPress={() => setManual(true)} style={styles.manualBtn}>
          <Text style={styles.manualText}>{t('food.addManual')}</Text>
        </Pressable>

        <ScrollView
          style={styles.results}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          {results.map(food => (
            <Pressable
              key={food.id}
              onPress={() => selectFood(food)}
              style={styles.resultRow}>
              <Text style={styles.resultName} numberOfLines={2}>
                {foodLabel(food, lang)}
              </Text>
              <View style={styles.resultMacros}>
                <View style={styles.kcalPill}>
                  <Text style={styles.kcalPillText}>
                    {food.per100.kcal} {t('detail.kcal')}
                  </Text>
                </View>
                <Text style={[styles.macroTag, { color: colors.protein }]}>
                  {t('macro.pShort')} {food.per100.protein}
                </Text>
                <Text style={[styles.macroTag, { color: colors.fat }]}>
                  {t('macro.fShort')} {food.per100.fat}
                </Text>
                <Text style={[styles.macroTag, { color: colors.carbs }]}>
                  {t('macro.cShort')} {food.per100.carbs}
                </Text>
                <Text style={styles.per100Tag}>{t('food.per100')}</Text>
              </View>
            </Pressable>
          ))}
          {loadingOnline && (
            <Text style={styles.searching}>{t('food.searching')}</Text>
          )}
          {query.trim().length > 1 && !loadingOnline && results.length === 0 && (
            <Text style={styles.noResults}>{t('food.noResults')}</Text>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={close}
      onDismiss={close}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('food.title')}</Text>
          <Pressable onPress={close} hitSlop={10}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {renderBody()}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function MealRow({
  meal,
  setMeal,
  t,
}: {
  meal: Meal;
  setMeal: (m: Meal) => void;
  t: (key: UiKey) => string;
}) {
  return (
    <View style={styles.mealRow}>
      {MEALS.map(m => (
        <Pressable
          key={m}
          onPress={() => setMeal(m)}
          style={[styles.mealChip, meal === m && styles.mealChipActive]}>
          <Text
            style={[styles.mealChipText, meal === m && styles.mealChipTextActive]}>
            {t(mealKey[m])}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function MacroStrip({
  macros,
  t,
  note,
  hideKcal,
}: {
  macros: Macros;
  t: (key: UiKey) => string;
  note?: string;
  hideKcal?: boolean;
}) {
  return (
    <View style={[styles.resultMacros, hideKcal && styles.macrosCentered]}>
      {!hideKcal && (
        <View style={styles.kcalPill}>
          <Text style={styles.kcalPillText}>
            {macros.kcal} {t('detail.kcal')}
          </Text>
        </View>
      )}
      <Text style={[styles.macroTag, { color: colors.protein }]}>
        {t('macro.pShort')} {macros.protein}
      </Text>
      <Text style={[styles.macroTag, { color: colors.fat }]}>
        {t('macro.fShort')} {macros.fat}
      </Text>
      <Text style={[styles.macroTag, { color: colors.carbs }]}>
        {t('macro.cShort')} {macros.carbs}
      </Text>
      {note ? <Text style={styles.per100Tag}>{note}</Text> : null}
    </View>
  );
}

function MacroCircles({
  macros,
  t,
}: {
  macros: Macros;
  t: (key: UiKey) => string;
}) {
  const stats = [
    { value: macros.kcal, label: t('detail.kcal'), color: colors.kcal },
    { value: macros.protein, label: t('macro.protein'), color: colors.protein },
    { value: macros.fat, label: t('macro.fat'), color: colors.fat },
    { value: macros.carbs, label: t('macro.carbs'), color: colors.carbs },
  ];
  return (
    <View style={styles.statRow}>
      {stats.map(s => (
        <View
          key={s.label}
          style={[
            styles.stat,
            { backgroundColor: `${s.color}1A`, borderColor: `${s.color}55` },
          ]}>
          <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function BasisTab({
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
      style={[styles.basisTab, active && styles.basisTabActive]}>
      <Text style={[styles.basisTabText, active && styles.basisTabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.numField}>
      <Text style={styles.numLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        maxLength={7}
        style={styles.numInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  closeBtn: { fontSize: font.h3, fontWeight: '800', color: colors.textMuted },

  searchWrap: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  scrollBody: { padding: spacing.lg },
  results: { flex: 1, marginTop: spacing.md },

  back: {
    fontSize: font.body,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
    color: colors.text,
  },
  gap: { marginTop: spacing.sm },
  resultRow: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultName: {
    fontSize: font.body,
    color: colors.text,
    fontWeight: '700',
  },
  resultMacros: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  kcalPill: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.md,
  },
  kcalPillText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: font.small,
  },
  macroTag: {
    fontSize: font.small,
    fontWeight: '800',
  },
  per100Tag: {
    fontSize: font.tiny,
    color: colors.textFaint,
    fontWeight: '600',
  },
  noResults: {
    fontSize: font.small,
    color: colors.textFaint,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  searching: {
    fontSize: font.small,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  manualBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  manualText: { color: colors.primary, fontWeight: '700', fontSize: font.body },

  productTitle: { fontSize: font.h3, fontWeight: '800', color: colors.text },
  productSub: { fontSize: font.small, color: colors.textMuted, marginTop: 4 },
  label: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  gramsInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  portionCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  portionCardLabel: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  portionKcalBig: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.primary,
    marginVertical: 4,
  },
  macrosCentered: {
    justifyContent: 'center',
  },
  portionCaption: {
    marginTop: spacing.lg,
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  stat: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  confirmBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  confirmText: { color: colors.white, fontWeight: '700', fontSize: font.h3 },

  mealRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.lg },
  mealChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  mealChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  mealChipText: { fontSize: font.tiny, fontWeight: '700', color: colors.textMuted },
  mealChipTextActive: { color: colors.primaryDark },

  basisRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgWarm,
    borderRadius: radius.md,
    padding: 4,
    marginTop: spacing.lg,
    gap: 4,
  },
  basisTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  basisTabActive: { backgroundColor: colors.primary },
  basisTabText: { fontSize: font.small, fontWeight: '700', color: colors.textMuted },
  basisTabTextActive: { color: colors.white },
  portionFields: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  portionGramsField: { width: 130 },
  portionLabelField: { flex: 1 },
  portionInfo: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.lg,
  },
  portionChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  portionChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  portionChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  portionChipText: { fontSize: font.body, fontWeight: '800', color: colors.textMuted },
  portionChipTextActive: { color: colors.primaryDark },
  macroInputs: { flexDirection: 'row', gap: spacing.sm },
  numField: { flex: 1 },
  numLabel: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  numInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
