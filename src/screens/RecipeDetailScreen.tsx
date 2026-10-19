import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Recipe, tagLabels } from '../data/recipes';
import { ingredientById } from '../data/ingredients';
import { recipeImages } from '../data/recipeImages';
import { FoodProduct, foodLabel, scaleMacros } from '../data/foods';
import { buildPlan } from '../utils/match';
import { macrosFor } from '../utils/macros';
import { MacroBar } from '../components/MacroBar';
import { BrandPickerModal } from '../components/BrandPickerModal';
import { Tag } from '../components/Chip';
import { useLang } from '../i18n/LanguageContext';
import { UiKey } from '../i18n/ui';
import { Meal, useProfile } from '../profile/ProfileContext';
import { colors, font, radius, shadow, spacing } from '../theme';

// Brand override only makes sense for products with a real brand —
// not for plain vegetables or fruit.
const canBrand = (id: string): boolean => {
  const cat = ingredientById[id]?.category;
  return cat !== 'veg' && cat !== 'fruit';
};

const MEALS: Meal[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealKey: Record<Meal, UiKey> = {
  breakfast: 'meal.breakfast',
  lunch: 'meal.lunch',
  dinner: 'meal.dinner',
  snack: 'meal.snack',
};

export function RecipeDetailScreen({
  recipe,
  selected,
  onBack,
  insets,
}: {
  recipe: Recipe;
  selected: Set<string>;
  onBack: () => void;
  insets: EdgeInsets;
}) {
  const { t, tx, lang } = useLang();
  const { isActivated, addFood } = useProfile();
  const [added, setAdded] = useState(false);
  const [picking, setPicking] = useState(false);
  const photo = recipeImages[recipe.id];

  const plan = useMemo(() => buildPlan(recipe, selected), [recipe, selected]);

  const [removed, setRemoved] = useState<Set<number>>(new Set());
  // Per-ingredient brand overrides, keyed by row index.
  const [brands, setBrands] = useState<Record<number, FoodProduct>>({});
  const [brandIdx, setBrandIdx] = useState<number | null>(null);

  const canToggle = (status: string) => status === 'have' || status === 'swap';
  const isIncluded = (idx: number) => {
    const item = plan.items[idx];
    if (item.status === 'pantry') return true;
    if (canToggle(item.status)) return !removed.has(idx);
    return false;
  };

  const toggle = (idx: number) =>
    setRemoved(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  const macros = useMemo(() => {
    const items = plan.items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item, idx }) => {
        if (item.status === 'pantry') return true;
        if (item.status === 'have' || item.status === 'swap') {
          return !removed.has(idx);
        }
        return false;
      })
      .map(({ item, idx }) => ({
        id: item.effectiveId,
        g: item.ingredient.g,
        per100: brands[idx]?.per100,
      }));
    return macrosFor(items, recipe.servings);
  }, [plan, removed, recipe.servings, brands]);

  // Grams of one serving (sum of included ingredient grams ÷ servings), so a
  // logged serving can be re-weighed in the diary like any other food.
  const gramsPerServing = useMemo(() => {
    const totalG = plan.items
      .filter((item, idx) => {
        if (item.status === 'pantry') return true;
        if (item.status === 'have' || item.status === 'swap') return !removed.has(idx);
        return false;
      })
      .reduce((s, item) => s + item.ingredient.g, 0);
    return Math.round(totalG / (recipe.servings > 0 ? recipe.servings : 1));
  }, [plan, removed, recipe.servings]);

  const servingSource = useMemo(() => {
    if (gramsPerServing <= 0) return undefined;
    return {
      grams: gramsPerServing,
      per100: scaleMacros(macros, 10000 / gramsPerServing),
    };
  }, [macros, gramsPerServing]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.photoWrap}>
          {photo ? (
            <Image source={photo} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <Text style={styles.photoEmoji}>{recipe.emoji}</Text>
            </View>
          )}
          <View style={styles.photoScrim} />
          <Pressable
            onPress={onBack}
            style={[styles.backFab, { top: insets.top + spacing.sm }]}
            hitSlop={10}>
            <Text style={styles.backFabText}>‹</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>{tx(recipe.title)}</Text>
          <Text style={styles.description}>{tx(recipe.description)}</Text>

          <View style={styles.metaRow}>
            <MetaItem icon="⏱" label={`${recipe.time} ${t('card.minShort')}`} />
            <MetaItem icon="🍽" label={`${recipe.servings} ${t('card.servShort')}`} />
            <MetaItem icon="📊" label={t(`difficulty.${recipe.difficulty}`)} />
          </View>

          <View style={styles.tags}>
            {recipe.tags.map(tag => (
              <Tag key={tag} label={tx(tagLabels[tag].label)} emoji={tagLabels[tag].emoji} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          
          <View style={styles.macroCard}>
            <View style={styles.macroHeader}>
              <Text style={styles.sectionTitle}>{t('detail.nutrition')}</Text>
              <Text style={styles.perServing}>{t('detail.perServing')}</Text>
            </View>

            <View style={styles.kcalRow}>
              <Text style={styles.kcalValue}>{macros.kcal}</Text>
              <Text style={styles.kcalUnit}>{t('detail.kcal')}</Text>
            </View>

            <MacroBar macros={macros} />
          </View>

          {isActivated && added && (
            <View style={[styles.diaryBtn, styles.diaryBtnAdded]}>
              <Text style={[styles.diaryBtnText, styles.diaryBtnTextAdded]}>
                {t('detail.added')}
              </Text>
            </View>
          )}

          {isActivated && !added && !picking && (
            <Pressable
              onPress={() => setPicking(true)}
              style={styles.diaryBtn}>
              <Text style={styles.diaryBtnText}>{t('detail.addToDiary')}</Text>
            </Pressable>
          )}

          {isActivated && !added && picking && (
            <View style={styles.mealPicker}>
              <Text style={styles.mealPrompt}>{t('detail.addPrompt')}</Text>
              <View style={styles.mealPickerRow}>
                {MEALS.map(m => (
                  <Pressable
                    key={m}
                    onPress={() => {
                      addFood(tx(recipe.title), macros, m, servingSource);
                      setAdded(true);
                      setPicking(false);
                    }}
                    style={styles.mealPickBtn}>
                    <Text style={styles.mealPickText}>{t(mealKey[m])}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.blockTitle}>{t('detail.ingredients')}</Text>
          <Text style={styles.hint}>{t('detail.hint')}</Text>
          <View style={styles.ingCard}>
            {plan.items.map((item, idx) => {
              if (item.status === 'optional_out') return null;

              const included = isIncluded(idx);
              const effective = ingredientById[item.effectiveId];
              const original = ingredientById[item.ingredient.id];
              const toggleable = canToggle(item.status);

              return (
                <View key={`${item.ingredient.id}-${idx}`} style={styles.ingRow}>
                  <Text style={[styles.ingEmoji, !included && styles.dim]}>
                    {effective?.emoji ?? '•'}
                  </Text>
                  <View style={styles.ingNameWrap}>
                    <Text
                      style={[
                        styles.ingName,
                        !included && styles.struck,
                      ]}>
                      {effective ? tx(effective.name) : item.ingredient.id}
                    </Text>
                    {item.status === 'swap' && (
                      <Text style={styles.swapNote}>
                        {t('detail.swapFor', {
                          name: original ? tx(original.name) : item.ingredient.id,
                        })}
                      </Text>
                    )}
                    {included && canBrand(item.effectiveId) && (
                      brands[idx] ? (
                        <Pressable
                          onPress={() => setBrandIdx(idx)}
                          style={styles.brandPillSet}>
                          <Text style={styles.brandPillSetText} numberOfLines={1}>
                            🏷 {foodLabel(brands[idx], lang)}
                            {'  '}
                            <Text style={styles.brandPillKcal}>
                              {brands[idx].per100.kcal} {t('detail.kcal')}
                            </Text>
                          </Text>
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => setBrandIdx(idx)}
                          style={styles.brandPillAdd}>
                          <Text style={styles.brandPillAddText}>＋ {t('brand.add')}</Text>
                        </Pressable>
                      )
                    )}
                  </View>
                  <Text style={[styles.ingAmount, !included && styles.dim]}>
                    {tx(item.ingredient.amount)}
                  </Text>

                  {toggleable ? (
                    <Pressable
                      onPress={() => toggle(idx)}
                      hitSlop={8}
                      style={[
                        styles.toggleBtn,
                        included ? styles.toggleRemove : styles.toggleAdd,
                      ]}>
                      <Text
                        style={[
                          styles.toggleText,
                          included ? styles.toggleRemoveText : styles.toggleAddText,
                        ]}>
                        {included ? '−' : '+'}
                      </Text>
                    </Pressable>
                  ) : (
                    <View
                      style={[
                        styles.statusChip,
                        item.status === 'pantry' ? styles.chipPantry : styles.chipBuy,
                      ]}>
                      <Text
                        style={[
                          styles.statusText,
                          item.status === 'pantry'
                            ? styles.chipPantryText
                            : styles.chipBuyText,
                        ]}>
                        {item.status === 'pantry'
                          ? t('detail.status.pantry')
                          : t('detail.status.buy')}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.blockTitle}>{t('detail.steps')}</Text>
          <View style={styles.stepsCard}>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{tx(step)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.footerNote}>{t('detail.footer')}</Text>
        </View>
      </ScrollView>

      <BrandPickerModal
        visible={brandIdx !== null}
        title={brandTitle(brandIdx, plan, tx)}
        initialQuery={brandQuery(brandIdx, plan, lang)}
        current={brandIdx !== null ? brands[brandIdx] ?? null : null}
        onPick={food =>
          setBrands(prev => {
            if (brandIdx === null) return prev;
            const next = { ...prev };
            if (food) next[brandIdx] = food;
            else delete next[brandIdx];
            return next;
          })
        }
        onClose={() => setBrandIdx(null)}
      />
    </View>
  );
}

function brandTitle(
  idx: number | null,
  plan: ReturnType<typeof buildPlan>,
  tx: (text: { en: string; ru: string }) => string,
): string {
  if (idx === null) return '';
  const eff = ingredientById[plan.items[idx].effectiveId];
  return eff ? tx(eff.name) : '';
}

function brandQuery(
  idx: number | null,
  plan: ReturnType<typeof buildPlan>,
  lang: 'en' | 'ru',
): string {
  if (idx === null) return '';
  const eff = ingredientById[plan.items[idx].effectiveId];
  return eff ? eff.name[lang] ?? eff.name.en : '';
}

function MetaItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  photoWrap: {
    height: 260,
    backgroundColor: colors.bgWarm,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmoji: {
    fontSize: 84,
  },
  photoScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(20,30,25,0.12)',
  },
  backFab: {
    position: 'absolute',
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  backFabText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: -3,
    marginLeft: -2,
  },
  hero: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    marginTop: -spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  title: {
    fontSize: font.h1,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.sm,
  },
  description: {
    fontSize: font.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    gap: 5,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaLabel: {
    fontSize: font.small,
    color: colors.text,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: spacing.md,
  },
  body: {
    padding: spacing.lg,
  },
  macroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.card,
  },
  diaryBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    ...shadow.soft,
  },
  diaryBtnAdded: {
    backgroundColor: colors.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  diaryBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: font.body,
  },
  diaryBtnTextAdded: {
    color: colors.primary,
  },
  mealPicker: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  mealPrompt: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  mealPickerRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mealPickBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
  },
  mealPickText: {
    fontSize: font.tiny,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: font.h3,
    fontWeight: '700',
    color: colors.text,
  },
  perServing: {
    fontSize: font.tiny,
    color: colors.textMuted,
    backgroundColor: colors.bg,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  kcalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: spacing.md,
  },
  kcalValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
  },
  kcalUnit: {
    fontSize: font.h3,
    color: colors.textMuted,
    marginLeft: 6,
    fontWeight: '600',
  },
  blockTitle: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: font.small,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  ingCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    ...shadow.soft,
  },
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  ingEmoji: {
    fontSize: 18,
    width: 26,
  },
  ingNameWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  ingName: {
    fontSize: font.body,
    color: colors.text,
    fontWeight: '600',
  },
  swapNote: {
    fontSize: font.tiny,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 1,
  },
  brandPillAdd: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  brandPillAddText: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.primary,
  },
  brandPillSet: {
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    maxWidth: '100%',
  },
  brandPillSetText: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  brandPillKcal: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: colors.primary,
  },
  skipNote: {
    fontSize: font.tiny,
    color: colors.textFaint,
    marginTop: 1,
  },
  struck: {
    textDecorationLine: 'line-through',
    color: colors.textFaint,
  },
  dim: {
    opacity: 0.4,
  },
  ingAmount: {
    fontSize: font.small,
    color: colors.textMuted,
    marginRight: spacing.md,
  },
  toggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRemove: {
    backgroundColor: colors.accentLight,
  },
  toggleAdd: {
    backgroundColor: colors.primaryLight,
  },
  toggleText: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: -2,
  },
  toggleRemoveText: {
    color: colors.accent,
  },
  toggleAddText: {
    color: colors.primary,
  },
  statusChip: {
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    minWidth: 58,
    alignItems: 'center',
  },
  chipPantry: {
    backgroundColor: colors.bgWarm,
  },
  chipSkip: {
    backgroundColor: colors.bg,
  },
  chipBuy: {
    backgroundColor: colors.accentLight,
  },
  statusText: {
    fontSize: font.tiny,
    fontWeight: '700',
  },
  chipPantryText: {
    color: colors.textMuted,
  },
  chipSkipText: {
    color: colors.textFaint,
  },
  chipBuyText: {
    color: colors.accent,
  },
  stepsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.soft,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: font.small,
  },
  stepText: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    lineHeight: 22,
    paddingTop: 3,
  },
  footerNote: {
    fontSize: font.small,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
});
