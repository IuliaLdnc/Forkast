import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { EdgeInsets } from 'react-native-safe-area-context';
import { matchRecipes, RecipePlan } from '../utils/match';
import { macrosFor } from '../utils/macros';
import { Recipe, Tag, tagLabels } from '../data/recipes';
import { RecipeCard } from '../components/RecipeCard';
import { Lang, useLang } from '../i18n/LanguageContext';
import { UiKey } from '../i18n/ui';
import { useProfile } from '../profile/ProfileContext';
import { Goal, goalFitScore, targetsFor } from '../profile/targets';
import { colors, font, radius, spacing } from '../theme';

type Filter = 'all' | 'noswap' | 'fits' | Tag;

const filterTags: Tag[] = ['highprotein', 'fast', 'veg', 'lowcal'];

const goalKey: Record<Goal, UiKey> = {
  cut: 'goals.goal.cut',
  maintain: 'goals.goal.maintain',
  bulk: 'goals.goal.bulk',
};

function planMacros(plan: RecipePlan) {
  return macrosFor(
    plan.items
      .filter(i => i.included)
      .map(i => ({ id: i.effectiveId, g: i.ingredient.g })),
    plan.recipe.servings,
  );
}

export function RecipesScreen({
  selected,
  onBack,
  onOpenRecipe,
  insets,
}: {
  selected: Set<string>;
  onBack: () => void;
  onOpenRecipe: (recipe: Recipe) => void;
  insets: EdgeInsets;
}) {
  const { t, tx, lang } = useLang();
  const { profile, consumed } = useProfile();
  const [filter, setFilter] = useState<Filter>('all');

  // In "just track" mode there's no target, so recipes aren't ranked to a goal.
  const planProfile = profile && !profile.track ? profile : null;

  const remaining = useMemo(() => {
    if (!planProfile) return null;
    const target = targetsFor(planProfile, planProfile.goal);
    return {
      kcal: target.kcal - consumed.kcal,
      protein: target.protein - consumed.protein,
      fat: target.fat - consumed.fat,
      carbs: target.carbs - consumed.carbs,
    };
  }, [planProfile, consumed]);

  const makeable = useMemo(() => {
    const list = matchRecipes(Array.from(selected)).filter(p => p.makeable);
    if (planProfile && remaining) {
      const goal = planProfile.goal;
      const cap = Math.max(remaining.kcal, 0);
      const score = (p: RecipePlan) => {
        const m = planMacros(p);
        const overshoot = Math.max(m.kcal - cap, 0);
        return goalFitScore(m, goal) - overshoot * 0.2;
      };
      list.sort((a, b) => score(b) - score(a));
    }
    return list;
  }, [selected, planProfile, remaining]);

  const filterOptions = useMemo<{ id: Filter; label: string; emoji: string }[]>(
    () => [
      { id: 'all', label: t('recipes.filter.all'), emoji: '🍽' },
      ...(planProfile
        ? [{ id: 'fits' as Filter, label: t('recipes.filter.fits'), emoji: '🎯' }]
        : []),
      { id: 'noswap', label: t('recipes.filter.noswap'), emoji: '✅' },
      ...filterTags.map(tag => ({
        id: tag as Filter,
        label: tx(tagLabels[tag].label),
        emoji: tagLabels[tag].emoji,
      })),
    ],
    [t, tx, planProfile],
  );

  const visible = useMemo(() => {
    if (filter === 'all') return makeable;
    if (filter === 'noswap') return makeable.filter(p => p.swaps.length === 0);
    if (filter === 'fits') {
      if (!remaining) return makeable;
      const cap = remaining.kcal > 0 ? remaining.kcal + 60 : 250;
      return makeable.filter(p => planMacros(p).kcal <= cap);
    }
    return makeable.filter(p => p.recipe.tags.includes(filter as Tag));
  }, [makeable, filter, remaining]);

  const count = makeable.length;
  const noun = count === 1 ? t('recipes.noun.one') : pluralNoun(count, lang, t);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>{t('recipes.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('recipes.title')}</Text>
        <Text style={styles.summary}>
          {count > 0
            ? t('recipes.summary.ready', { count, noun })
            : t('recipes.summary.default')}
        </Text>

        {planProfile && (
          <View style={styles.goalChip}>
            <Text style={styles.goalChipText}>
              🎯{' '}
              {t('goals.entry.on', {
                goal: t(goalKey[planProfile.goal]),
                kcal: targetsFor(planProfile, planProfile.goal).kcal,
              })}
            </Text>
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}>
          {filterOptions.map(opt => (
            <Pressable
              key={opt.id}
              onPress={() => setFilter(opt.id)}
              style={[
                styles.filterChip,
                filter === opt.id && styles.filterChipActive,
              ]}>
              <Text
                style={[
                  styles.filterLabel,
                  filter === opt.id && styles.filterLabelActive,
                ]}>
                {opt.emoji} {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}>
        {visible.length === 0 ? (
          <Text style={styles.empty}>{t('recipes.empty')}</Text>
        ) : (
          visible.map(plan => (
            <RecipeCard
              key={plan.recipe.id}
              plan={plan}
              onPress={() => onOpenRecipe(plan.recipe)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function pluralNoun(
  n: number,
  lang: Lang,
  t: (key: 'recipes.noun.one' | 'recipes.noun.many') => string,
): string {
  if (lang !== 'ru') return t('recipes.noun.many');
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return t('recipes.noun.one');
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'рецепта';
  return t('recipes.noun.many');
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginBottom: spacing.sm,
  },
  backText: {
    fontSize: font.body,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: font.h1,
    fontWeight: '800',
    color: colors.text,
  },
  summary: {
    fontSize: font.small,
    color: colors.textMuted,
    marginTop: 4,
  },
  goalChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  goalChipText: {
    fontSize: font.small,
    color: colors.primaryDark,
    fontWeight: '700',
  },

  filterRow: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    paddingRight: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: font.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: colors.white,
  },
  list: {
    padding: spacing.lg,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xxl,
    fontSize: font.body,
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
});
